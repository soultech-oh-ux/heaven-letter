// 공유 미리보기(OG): 편지별 제목·날짜를 넣지 않고 고정 브랜드 정보만 노출한다.
const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
module.exports=async function(req,res){
 const title='예수 묵상편지';
 const description='말씀과 기도로 주님과 함께 걷는 묵상편지';
 const site='https://heaven-letter-nov09.vercel.app/';
 res.setHeader('Content-Type','text/html; charset=utf-8');
 res.setHeader('Cache-Control','no-store, max-age=0');
 res.status(200).send('<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>'+esc(title)+'</title><meta property="og:type" content="website"><meta property="og:title" content="'+esc(title)+'"><meta property="og:description" content="'+esc(description)+'"><meta property="og:image" content="'+site+'letter-share-default.png"><meta property="og:url" content="'+site+'api/letter"><meta name="twitter:card" content="summary_large_image"><meta http-equiv="refresh" content="0;url='+site+'?published=1"></head><body><a href="'+site+'?published=1">묵상 편지 읽기</a></body></html>');
};
