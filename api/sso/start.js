import {getConfig,token,hash,isUuid,validHost,seal,cookie,txCookie,redirect,respond} from '../../server/vsph.js';
export default function handler(req,res){
  if(req.method!=='GET')return respond(res,405,{message:'Method not allowed'});
  const config=getConfig();
  if(!config)return respond(res,503,{message:'VSPH SSO not configured'});
  if(!validHost(req,config))return respond(res,400,{message:'Unrecognized Music hostname'});
  const organization=String(req.query?.organization_id||'');
  if(!isUuid(organization))return respond(res,400,{message:'Invalid customer organization'});
  const state=token(),verifier=token();
  const transaction=seal({state,verifier,organization,exp:Date.now()+120000},config,'transaction');
  const url=new URL(config.portal+'/api/sso/authorize');
  url.searchParams.set('client_id','music-vercel');
  url.searchParams.set('app','MUSIC');
  url.searchParams.set('organization_id',organization);
  url.searchParams.set('state',state);
  url.searchParams.set('code_challenge',hash(verifier));
  url.searchParams.set('code_challenge_method','S256');
  return redirect(res,url.toString(),{'Set-Cookie':cookie(txCookie,transaction,config,120)});
}
