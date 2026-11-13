const {read}=require('./_storage');
const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
module.exports=async function(req,res){
 let letter=null;try{letter=await read();}catch(e){}
 const fields=letter?.fields||{};
 const date=letter?.date?Number(letter.date.slice(5,7))+'월 '+Number(letter.date.slice(8,10))+'일 · ':'';
 const title=(date+(fields.titleText||'예수묵상편지')).slice(0,110);
 const description=(fields.coverMessage||fields.meditation||'예수 묵상 편지').replace(/\\s+/g,' ').slice(0,150);
 const site='https://heaven-letter-nov09.vercel.app/';
 res.setHeader('Content-Type','text/html; charset=utf-8');
 res.setHeader('Cache-Control','no-store, max-age=0');
 res.status(200).send('<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>'+esc(title)+'</title><meta property="og:type" content="website"><meta property="og:title" content="'+esc(title)+'"><meta property="og:description" content="'+esc(description)+'"><meta property="og:image" content="'+site+'letter-share-default.png"><meta property="og:url" content="'+site+'api/letter"><meta name="twitter:card" content="summary_large_image"><meta http-equiv="refresh" content="0;url='+site+'?published=1"></head><body><a href="'+site+'?published=1">묵상 편지 읽기</a></body></html>');
};
