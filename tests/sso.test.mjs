import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {getConfig,seal,unseal,roleMapping,token,cookie,getCookie,txCookie,sidCookie} from '../server/vsph.js';
import start from '../api/sso/start.js';
import callback from '../api/sso/callback.js';
import session from '../api/sso/session.js';
import logout from '../api/sso/logout.js';
import status from '../api/sso/status.js';

const USER='11111111-1111-4111-8111-111111111111';
const ORG='22222222-2222-4222-8222-222222222222';
const MUSIC='https://vsph-music-system.vercel.app';
const PORTAL='https://portal.example.test';
process.env.NODE_ENV='production';
process.env.MUSIC_PUBLIC_ORIGIN=MUSIC;
process.env.VSPH_PORTAL_ORIGIN=PORTAL;
process.env.MUSIC_SSO_CLIENT_SECRET='test-secret-with-sufficient-entropy-placeholder-only';
process.env.MUSIC_SESSION_SECRET='different-test-secret-for-cookie-encryption-only';
const config=getConfig();

function response(){
  const headers={};
  return {
    headers,statusCode:200,body:null,
    setHeader(k,v){headers[k.toLowerCase()]=v;},
    end(v){this.body=v;},
    json(){return JSON.parse(this.body);}
  };
}
function req(method='GET',query={},cookies='',origin=undefined){
  return {method,query,headers:{host:'vsph-music-system.vercel.app',cookie:cookies,...(origin?{origin}: {})}};
}
function cookieValue(header){
  const first=Array.isArray(header)?header.at(-1):header;
  return first.split(';')[0];
}

test('configuration refuses missing credentials and bad production origins',()=>{
  assert.equal(config.music,MUSIC);
  const previous=process.env.MUSIC_SSO_CLIENT_SECRET;
  delete process.env.MUSIC_SSO_CLIENT_SECRET;
  assert.equal(getConfig(),null);
  process.env.MUSIC_SSO_CLIENT_SECRET=previous;
  const old=process.env.VSPH_PORTAL_ORIGIN;
  process.env.VSPH_PORTAL_ORIGIN='http://portal.example.test';
  assert.throws(()=>getConfig(),/Invalid Music SSO origin/);
  process.env.VSPH_PORTAL_ORIGIN=old;
});
test('transaction cookies are encrypted, tamper-proof and expire',()=>{
  const value=seal({secret:'sample',exp:Date.now()+30000},config,'transaction');
  assert.ok(!value.includes('sample'));
  assert.equal(unseal(value,config,'transaction').secret,'sample');
  assert.equal(unseal(value,config,'session'),null);
  assert.equal(unseal(value.slice(0,-2)+'xx',config,'transaction'),null);
  assert.equal(unseal(seal({exp:Date.now()-1},config,'transaction'),config,'transaction'),null);
  assert.match(cookie(txCookie,value,config,120),/HttpOnly; SameSite=Lax; Secure;/);
});
test('musician mapping is explicit and tenant-scoped',()=>{
  assert.deepEqual(roleMapping('manager',USER,ORG),{role:'staff'});
  assert.equal(roleMapping('platform_super_admin',USER,ORG),null);
  assert.equal(roleMapping('viewer',USER,ORG),null);
  assert.equal(roleMapping('musician',USER,ORG),null);
  process.env.MUSIC_PERFORMER_ID_MAP=JSON.stringify({[ORG+':'+USER]:'musician-007'});
  assert.deepEqual(roleMapping('musician',USER,ORG),{role:'musician',musicianId:'musician-007'});
  assert.equal(roleMapping('musician',USER,'33333333-3333-4333-8333-333333333333'),null);
  delete process.env.MUSIC_PERFORMER_ID_MAP;
});
test('start requires authorized tenant ID and fixed Music hostname',()=>{
  const bad=response();
  start(req('GET',{organization_id:'other'}),bad);
  assert.equal(bad.statusCode,400);
  const wrong=response();
  const input=req('GET',{organization_id:ORG});
  input.headers.host='attacker.test';
  start(input,wrong);
  assert.equal(wrong.statusCode,400);
  const good=response();
  start(req('GET',{organization_id:ORG}),good);
  assert.equal(good.statusCode,303);
  const url=new URL(good.headers.location);
  assert.equal(url.origin,PORTAL);
  assert.equal(url.pathname,'/api/sso/authorize');
  assert.equal(url.searchParams.get('organization_id'),ORG);
  assert.equal(url.searchParams.get('code_challenge_method'),'S256');
  assert.equal(url.searchParams.has('code_verifier'),false);
  assert.ok(good.headers['set-cookie'].includes('HttpOnly'));
});
test('valid handoff produces server-only session, validates live role and supports logout',async()=>{
  const begin=response();
  start(req('GET',{organization_id:ORG}),begin);
  const authorize=new URL(begin.headers.location);
  const state=authorize.searchParams.get('state');
  const rawCode=token();
  const tx=cookieValue(begin.headers['set-cookie']);
  const original=globalThis.fetch;
  const calls=[];
  globalThis.fetch=async(url,options)=>{
    calls.push({url,options});
    if(url.endsWith('/api/sso/exchange'))return {
      ok:true,json:async()=>({
        user:{id:USER,name:'Employee',email:'employee@example.test'},
        organization:{id:ORG,name:'Venue A'},application:{code:'MUSIC'},
        role:'manager',portal_session_ref:'a'.repeat(64)
      })
    };
    if(url.endsWith('/api/sso/introspect'))return{ok:true,json:async()=>({active:true,role:'manager'})};
    throw Error('Unexpected URL');
  };
  try{
    const cb=response();
    await callback(req('GET',{state,code:rawCode},tx),cb);
    assert.equal(cb.statusCode,303);
    assert.equal(cb.headers.location,'/sso/welcome');
    const set=cb.headers['set-cookie'];
    assert.equal(Array.isArray(set),true);
    assert.ok(set.some(line=>line.startsWith(sidCookie+'=')));
    const sc=cookieValue(set);
    const verified=response();
    await session(req('GET',{},sc),verified);
    assert.equal(verified.statusCode,200);
    const identity=verified.json();
    assert.equal(identity.role,'staff');
    assert.equal(identity.organization.id,ORG);
    assert.equal(identity.user.id,USER);
    assert.equal(identity.portal_session_ref,undefined);
    assert.equal(calls.length,2);
    assert.equal(calls[0].options.headers['X-VSPH-Client-Secret'],config.secret);
    const wrongOrigin=response();
    logout(req('POST',{},sc,'https://evil.test'),wrongOrigin);
    assert.equal(wrongOrigin.statusCode,403);
    const out=response();
    logout(req('POST',{},sc,MUSIC),out);
    assert.equal(out.statusCode,200);
    assert.ok(out.headers['set-cookie'].every(line=>line.includes('Max-Age=0')));
  } finally{globalThis.fetch=original}
});
test('a forged callback state is rejected before any server exchange',async()=>{
  const begin=response();
  start(req('GET',{organization_id:ORG}),begin);
  const tx=cookieValue(begin.headers['set-cookie']);
  const denied=response();
  await callback(req('GET',{state:token(),code:token()},tx),denied);
  assert.equal(denied.statusCode,401);
  assert.match(denied.headers['set-cookie'],/Max-Age=0/);
});
test('session cannot be accepted without intact cookie',async()=>{
  const res=response();
  await session(req(),res);
  assert.equal(res.statusCode,401);
});
test('status exposes only public portal origin, never server credentials',()=>{
  const result=response();
  status(req(),result);
  assert.deepEqual(result.json(),{enabled:true,portalUrl:PORTAL});
  assert.equal(result.body.includes(config.secret),false);
});
