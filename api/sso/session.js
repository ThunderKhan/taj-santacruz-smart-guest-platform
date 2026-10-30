import {getConfig,validHost,unseal,getCookie,sidCookie,cookie,respond,portalCall,roleMapping} from '../_lib/vsph.js';
export default async function handler(req,res){
  if(req.method!=='GET')return respond(res,405,{message:'Method not allowed'});
  const config=getConfig();
  if(!config)return respond(res,503,{message:'SSO is disabled'});
  if(!validHost(req,config))return respond(res,400,{message:'Unrecognized Music hostname'});
  const value=unseal(getCookie(req,sidCookie,config),config,'session');
  if(!value)return respond(res,401,{message:'Music sign-in required'});
  try{
    const {ok,result}=await portalCall(config,'/api/sso/introspect',{
      client_id:'music-vercel',user_id:value.userId,
      organization_id:value.organizationId,portal_session_ref:value.portalRef
    });
    if(!ok||!result.active){
      res.setHeader('Set-Cookie',cookie(sidCookie,'',config,0));
      return respond(res,401,{message:'Music access revoked or expired'});
    }
    const mapped=roleMapping(result.role,value.userId);
    if(!mapped||mapped.role!==value.role|| (mapped.role==='musician'&&mapped.musicianId!==value.musicianId)){
      res.setHeader('Set-Cookie',cookie(sidCookie,'',config,0));
      return respond(res,403,{message:'Music role has changed'});
    }
    return respond(res,200,{
      user:{id:value.userId,name:value.userName},
      organization:{id:value.organizationId,name:value.organizationName},
      role:value.role,portalRole:result.role,musicianId:value.musicianId||undefined
    });
  }catch{return respond(res,503,{message:'Cannot verify Music session'});}
}
