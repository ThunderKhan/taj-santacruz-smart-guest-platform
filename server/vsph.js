import crypto from 'node:crypto';

const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const COOKIE_TX='__Host-vsph_music_tx';
const COOKIE_SESSION='__Host-vsph_music_sid';
const SESSION_SECONDS=600;
const SESSION_CACHE='no-store';

export function getConfig() {
  const origin=process.env.VSPH_PORTAL_ORIGIN;
  const music=process.env.MUSIC_PUBLIC_ORIGIN;
  const secret=process.env.MUSIC_SSO_CLIENT_SECRET;
  const key=process.env.MUSIC_SESSION_SECRET;
  if(![origin,music,secret,key].every(Boolean))return null;
  if(secret.length<32 || key.length<32)throw Error('Invalid Music SSO secrets');
  const local=process.env.NODE_ENV!=='production';
  const safe=(value)=>{
    const url=new URL(value);
    if(url.pathname!=='/' || url.search || url.hash || url.username || url.password ||
      (url.protocol!=='https:' && !(local && url.protocol==='http:' && ['localhost','127.0.0.1'].includes(url.hostname))))
      throw Error('Invalid Music SSO origin configuration');
    return url.origin;
  };
  return {portal:safe(origin),music:safe(music),secret,key,local};
}

export function hash(input){return crypto.createHash('sha256').update(input).digest('base64url');}
export function token(){return crypto.randomBytes(32).toString('base64url');}
export function equals(a,b){
  if(typeof a!=='string'||typeof b!=='string')return false;
  const x=Buffer.from(a),y=Buffer.from(b);
  return x.length===y.length&&crypto.timingSafeEqual(x,y);
}
export function parseCookies(req){
  const jar={};
  for(const piece of String(req.headers?.cookie||'').split(';')){
    const idx=piece.indexOf('=');
    if(idx>0)jar[piece.slice(0,idx).trim()]=piece.slice(idx+1).trim();
  }
  return jar;
}
function cookieName(name,config){return config.local?name.replace('__Host-',''):name;}
export function cookie(name,value,config,maxAge){
  const flags=config.local?'':' Secure;';
  return cookieName(name,config)+'='+value+'; Path=/; HttpOnly; SameSite=Lax;'+flags+' Max-Age='+maxAge;
}
export function getCookie(req,name,config){return parseCookies(req)[cookieName(name,config)];}
export function seal(value,config,purpose){
  const iv=crypto.randomBytes(12);
  const secret=crypto.createHash('sha256').update(config.key+':'+purpose).digest();
  const cipher=crypto.createCipheriv('aes-256-gcm',secret,iv);
  const data=Buffer.concat([cipher.update(JSON.stringify(value)),cipher.final()]);
  return Buffer.concat([iv,cipher.getAuthTag(),data]).toString('base64url');
}
export function unseal(value,config,purpose){
  if(typeof value!=='string'||value.length>8192)return null;
  try{
    const raw=Buffer.from(value,'base64url');
    if(raw.length<29)return null;
    const key=crypto.createHash('sha256').update(config.key+':'+purpose).digest();
    const cipher=crypto.createDecipheriv('aes-256-gcm',key,raw.subarray(0,12));
    cipher.setAuthTag(raw.subarray(12,28));
    const obj=JSON.parse(Buffer.concat([cipher.update(raw.subarray(28)),cipher.final()]).toString('utf8'));
    if(!obj||typeof obj.exp!=='number'||obj.exp<=Date.now())return null;
    return obj;
  }catch{return null;}
}
export function respond(res,status,payload,extra={}){
  res.statusCode=status;
  res.setHeader('Cache-Control',SESSION_CACHE);
  res.setHeader('Referrer-Policy','no-referrer');
  res.setHeader('X-Content-Type-Options','nosniff');
  for(const [key,value] of Object.entries(extra))res.setHeader(key,value);
  if(typeof payload==='string'){
    res.setHeader('Content-Type','text/plain; charset=utf-8');res.end(payload);
  }else{
    res.setHeader('Content-Type','application/json; charset=utf-8');res.end(JSON.stringify(payload));
  }
}
export function redirect(res,url,extra={}){
  return respond(res,303,'Redirecting',{'Location':url,...extra});
}
export const isUuid=value=>typeof value==='string'&&uuid.test(value);
export const txCookie=COOKIE_TX;
export const sidCookie=COOKIE_SESSION;
export const sessionSeconds=SESSION_SECONDS;
export function validHost(req,config) {
  return String(req.headers?.host||'').toLowerCase()===new URL(config.music).host.toLowerCase();
}
export function roleMapping(role,userId,organizationId){
  // Platform administrators do not automatically gain a Music staff role.
  if(['admin','manager','staff','super_admin'].includes(role))return {role:'staff'};
  if(role!=='musician')return null;
  // Temporary explicit server-side ID mapping until musicians are provisioned
  // in a tenant-scoped database. Never derive a performer ID from their name.
  let map;
  try{map=JSON.parse(process.env.MUSIC_PERFORMER_ID_MAP||'{}')}catch{return null}
  const musicianId=map[organizationId+':'+userId];
  if(typeof musicianId!=='string'||!musicianId.trim())return null;
  return {role:'musician',musicianId};
}
export async function portalCall(config,route,body) {
  const controller=new AbortController();
  const timeout=setTimeout(()=>controller.abort(),5000);
  try{
    const response=await fetch(config.portal+route,{
      method:'POST',headers:{'Content-Type':'application/json','X-VSPH-Client-Secret':config.secret},
      body:JSON.stringify(body),signal:controller.signal,redirect:'error'
    });
    const result=await response.json().catch(()=>({}));
    return {ok:response.ok,result};
  }finally{clearTimeout(timeout)}
}
export function sameOrigin(req,config){return req.headers?.origin===config.music;}
