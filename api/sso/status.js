import {getConfig,respond} from '../_lib/vsph.js';
export default function handler(req,res){
  if(req.method!=='GET')return respond(res,405,{message:'Method not allowed'});
  try{
    const config=getConfig();
    return respond(res,200,{enabled:Boolean(config),portalUrl:config?.portal||null});
  }catch{return respond(res,503,{enabled:false,message:'SSO configuration invalid'});}
}
