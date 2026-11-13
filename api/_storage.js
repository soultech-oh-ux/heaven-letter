const url=process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const token=process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const key='heaven-letter:A:published';
async function command(parts){
 if(!url||!token)throw Error('STORAGE_NOT_CONFIGURED');
 const r=await fetch(url,{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify(parts)});
 if(!r.ok)throw Error('STORAGE_FAILED');
 const data=await r.json();if(data.error)throw Error('STORAGE_FAILED');return data.result;
}
async function read(){const value=await command(['GET',key]);return value?JSON.parse(value):null;}
async function write(value){return command(['SET',key,JSON.stringify(value)]);}
module.exports={read,write};
