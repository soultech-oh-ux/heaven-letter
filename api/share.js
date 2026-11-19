const {readVersion}=require('./_storage');
const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
module.exports=async function(req,res){
 const id=String(req.query?.id||'');
 if(!/^[a-f0-9]{24}$/.test(id))return res.status(400).send('유효하지 않은 편지 링크입니다.');
 let letter;try{letter=await readVersion(id)}catch(e){return res.status(503).send('편지 저장소에 연결할 수 없습니다.')}
 if(!letter)return res.status(404).send('편지를 찾을 수 없습니다.');
 const f=letter.fields||{},site='https://heaven-letter-one.vercel.app/';
 const title=(f.titleText||f.coverTitle||'예수묵상편지').trim().slice(0,100);
 const description=(f.coverMessage||f.meditation||'오늘의 묵상 편지').replace(/\s+/g,' ').slice(0,155);
 const url=site+'api/share?id='+id, target=site+'?published=1&id='+id;
 res.setHeader('Content-Type','text/html; charset=utf-8');res.setHeader('Cache-Control','public, max-age=0, must-revalidate');
 res.status(200).send('<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>'+esc(title)+'</title><meta name="description" content="'+esc(description)+'"><meta property="og:type" content="article"><meta property="og:title" content="'+esc(title)+'"><meta property="og:description" content="'+esc(description)+'"><meta property="og:url" content="'+esc(url)+'"><meta property="og:image" content="'+site+'letter-share-default.png"><meta name="twitter:card" content="summary_large_image"><meta http-equiv="refresh" content="0;url='+esc(target)+'"></head><body><a href="'+esc(target)+'">묵상편지 읽기</a></body></html>');
};