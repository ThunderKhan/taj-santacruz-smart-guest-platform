import {getConfig,validHost,unseal,getCookie,txCookie,sidCookie,cookie,respond,redirect,equals,roleMapping,portalCall,isUuid,seal,sessionSeconds} from '../../server/vsph.js';
export default async function handler(req,res){
  if(req.method!=='GET')return respond(res,405,{message:'Method not allowed'});
  const config=getConfig();
  if(!config)return respond(res,503,{message:'VSPH SSO not configured'});
  if(!validHost(req,config))return respond(res,400,{message:'Unrecognized Music hostname'});
  const clear=cookie(txCookie,'',config,0);
  // Always consume the pending browser transaction, including on failure.
  res.setHeader('Set-Cookie',clear);
  const tx=unseal(getCookie(req,txCookie,config),config,'transaction');
  const state=req.query?.state,code=req.query?.code;
  if(!tx||typeof state!=='string'||!equals(state,tx.state)||
     typeof code!=='string'||!/^[A-Za-z0-9_-]{43,128}$/.test(code))
    return respond(res,401,{message:'Invalid or expired SSO transaction'});
  try{
    const {ok,result}=await portalCall(config,'/api/sso/exchange',{
      client_id:'music-vercel',code,code_verifier:tx.verifier
    });
    if(!ok)return respond(res,401,{message:'VSPH authorization rejected'});
    const user=result.user,organization=result.organization,app=result.application;
    if(!user||!isUuid(user.id)||!organization||!isUuid(organization.id)||
       organization.id!==tx.organization||app?.code!=='MUSIC'||
       typeof result.portal_session_ref!=='string'||!/^[0-9a-f]{64}$/.test(result.portal_session_ref))
      return respond(res,401,{message:'Invalid identity response'});
    const mapped=roleMapping(result.role,user.id,organization.id);
    if(!mapped)return respond(res,403,{message:'This Music role is not provisioned for SSO'});
    const session=seal({
      userId:user.id,userName:String(user.name||'').slice(0,150),
      organizationId:organization.id,organizationName:String(organization.name||'').slice(0,150),
      portalRole:result.role,portalRef:result.portal_session_ref,
      role:mapped.role,musicianId:mapped.musicianId||null,
      exp:Date.now()+sessionSeconds*1000
    },config,'session');
    return redirect(res,'/sso/welcome',{
      'Set-Cookie':[clear,cookie(sidCookie,session,config,sessionSeconds)]
    });
  }catch{return respond(res,502,{message:'VSPH authorization service unavailable'});}
}
