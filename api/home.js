const fs = require('fs');
const path = require('path');
const {read} = require('./_storage');
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
module.exports = async function(req,res) {
  let html = fs.readFileSync(path.join(process.cwd(),'index.html'),'utf8');
  let letter = null;
  try { letter = await read(); } catch(e) { console.error('Home metadata read:',e.message); }
  const fields = letter?.fields || {};
  const date = letter?.date && /^\d{4}-\d{2}-\d{2}$/.test(letter.date) ? Number(letter.date.slice(5,7))+'월 '+Number(letter.date.slice(8,10))+'일 · ' : '';
  const title = (date + (fields.titleText || '예수묵상편지')).trim().slice(0,110);
  const desc = String(fields.coverMessage || fields.meditation || '예수 묵상 편지').replace(/\s+/g,' ').trim().slice(0,160);
  const site='https://heaven-letter-nov09.vercel.app/';
  html=html.replace(/<title>[^<]*<\/title>/i,'<title>'+esc(title)+'</title>');
  html=html.replace(/<meta[^>]*property="og:title"[^>]*>/i,'<meta property="og:title" content="'+esc(title)+'">');
  html=html.replace(/<meta[^>]*property="og:description"[^>]*>/i,'<meta property="og:description" content="'+esc(desc)+'">');
  html=html.replace(/<meta[^>]*name="description"[^>]*>/i,'<meta name="description" content="'+esc(desc)+'">');
  const og='<meta property="og:image" content="'+site+'letter-share-default.png"><meta property="og:url" content="'+site+'"><meta name="twitter:title" content="'+esc(title)+'"><meta name="twitter:description" content="'+esc(desc)+'">';
  html=html.replace('</head>',og+'</head>');
  res.setHeader('Content-Type','text/html; charset=utf-8');
  res.setHeader('Cache-Control','public, max-age=0, s-maxage=0, must-revalidate');
  res.status(200).send(html);
};
