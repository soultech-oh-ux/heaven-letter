const workshop='B';
function config(){
 const url=process.env.SUPABASE_URL||process.env.NEXT_PUBLIC_SUPABASE_URL||process.env.STORAGE_URL;
 const key=process.env.SUPABASE_SERVICE_ROLE_KEY||process.env.SUPABASE_SECRET_KEY;
 if(!url||!key)throw Error('SUPABASE_NOT_CONFIGURED');
 return {url:url.replace(/\/$/,''),key};
}
async function query(table,method='GET',params='',body){
 const {url,key}=config();
 const r=await fetch(url+'/rest/v1/'+table+params,{method,headers:{apikey:key,Authorization:'Bearer '+key,'Content-Type':'application/json',Prefer:'return=representation'},body:body===undefined?undefined:JSON.stringify(body)});
 const t=await r.text();if(!r.ok)throw Error('SUPABASE_'+r.status+': '+t.slice(0,200));return t?JSON.parse(t):[];
}
async function read(){
 const rows=await query('letters','GET','?workshop_id=eq.'+workshop+'&is_current=eq.true&status=eq.published&select=editor_fields,letter_date,praise_url&limit=1');
 if(!rows.length)return null;
 const row=rows[0];return {fields:row.editor_fields||{},date:row.letter_date||'',praiseUrl:row.praise_url||''};
}
async function write(value){
 const fields=value.fields||{};
 const title=String(fields.titleText||'예수 묵상 편지').slice(0,300);
 const slug='letter-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,9);
 const inserted=await query('letters','POST','',[{workshop_id:workshop,slug,title,letter_date:value.date||null,meditation:String(fields.meditation||''),praise_url:value.praiseUrl||'',editor_fields:fields,status:'draft',is_current:false}]);
 const id=inserted[0]?.id;if(!id)throw Error('INSERT_FAILED');
 try{
  await query('letters','PATCH','?workshop_id=eq.'+workshop+'&is_current=eq.true',{is_current:false});
  await query('letters','PATCH','?id=eq.'+id+'&workshop_id=eq.'+workshop,{is_current:true,status:'published',published_at:new Date().toISOString()});
 }catch(e){throw e}
 return id;
}
module.exports={read,write};
