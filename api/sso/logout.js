import {getConfig,sameOrigin,cookie,sidCookie,txCookie,respond} from '../../server/vsph.js';
export default function handler(req,res){
  if(req.method!=='POST')return respond(res,405,{message:'Method not allowed'});
  const config=getConfig();
  if(!config)return respond(res,503,{message:'SSO not configured'});
  if(!sameOrigin(req,config))return respond(res,403,{message:'Origin not permitted'});
  return respond(res,200,{message:'Signed out of Music'},{
    'Set-Cookie':[cookie(sidCookie,'',config,0),cookie(txCookie,'',config,0)]
  });
}
