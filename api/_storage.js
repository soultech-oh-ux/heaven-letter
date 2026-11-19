const base=(process.env.SUPABASE_URL||'').replace(/\/$/,'');
const secret=process.env.SUPABASE_SECRET_KEY||process.env.SUPABASE_SERVICE_ROLE_KEY;
const table='meditation_letters';
function configured(){if(!base||!secret)throw Error('SUPABASE_NOT_CONFIGURED');}
async function request(method,path,body,prefer){
 configured();
 const response=await fetch(base+'/rest/v1/'+table+path,{method,headers:{apikey:secret,Authorization:'Bearer '+secret,'Content-Type':'application/json',...(prefer?{Prefer:prefer}:{})},...(body?{body:JSON.stringify(body)}:{}) ,cache:'no-store'});
 if(!response.ok)throw Error('SUPABASE_REQUEST_FAILED_'+response.status);
 return response.status===204?null:response.json();
}
async function readVersion(id){
 if(!/^[a-f0-9]{24}$/.test(id||''))return null;
 const rows=await request('GET','?id=eq.'+encodeURIComponent(id)+'&select=payload&limit=1');
 return rows?.[0]?.payload||null;
}
async function writeVersion(id,value){
 if(!/^[a-f0-9]{24}$/.test(id||''))throw Error('INVALID_ID');
 await request('POST','?on_conflict=id',[{id,payload:value}],'resolution=merge-duplicates,return=minimal');
}
async function read(){
 const rows=await request('GET','?id=eq.latest&select=payload&limit=1');
 return rows?.[0]?.payload||null;
}
async function write(value){await request('POST','?on_conflict=id',[{id:'latest',payload:value}],'resolution=merge-duplicates,return=minimal');}
module.exports={read,write,readVersion,writeVersion};
