const {read,write}=require('./_storage');
module.exports=async function(req,res){
 res.setHeader('Cache-Control','no-store');
 if(req.method==='GET'){
  try{return res.status(200).json({letter:await read()});}
  catch(e){return res.status(503).json({error:'저장소 연결이 필요합니다.'});}
 }
 if(req.method!=='POST')return res.status(405).end();
 const expected=process.env.LETTER_PUBLISH_PASSWORD;
 if(!expected)return res.status(503).json({error:'서버 게시 암호 설정이 필요합니다.'});
 if(req.headers['x-publish-password']!==expected)return res.status(401).json({error:'게시 암호가 올바르지 않습니다.'});
 const letter=req.body;
 if(!letter||!letter.fields||typeof letter.fields!=='object')return res.status(400).json({error:'편지 형식 오류'});
 const fields={};
 for(const [k,v] of Object.entries(letter.fields)){if(typeof v==='string'&&k.length<80)fields[k]=v.slice(0,30000);}
 const payload={fields,date:/^\\d{4}-\\d{2}-\\d{2}$/.test(letter.date||'')?letter.date:'',praiseUrl:String(letter.praiseUrl||'').slice(0,500),updatedAt:new Date().toISOString()};
 if(JSON.stringify(payload).length>90000)return res.status(413).json({error:'편지 내용이 너무 깁니다.'});
 try{await write(payload);return res.status(200).json({ok:true});}
 catch(e){return res.status(503).json({error:'서버 저장에 실패했습니다. 저장소 설정을 확인하세요.'});}
};
