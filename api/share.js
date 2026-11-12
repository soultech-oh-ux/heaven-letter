// Share preview: a unique URL per meditation title. No secrets or storage required.
// The destination is the public letter page; this endpoint does not publish edits.
module.exports = function handler(req, res) {
  const raw = Array.isArray(req.query.title) ? req.query.title[0] : req.query.title;
  const title = String(raw || '예수 묵상 편지').trim().slice(0, 90) || '예수 묵상 편지';
  const escapeHtml = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const site = 'https://heaven-letter-one.vercel.app/';
  const image = site + 'letter-share-default.png';
  const safe = escapeHtml(title);
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=60');
  res.status(200).send(`<!doctype html><html lang="ko"><head><meta charset="utf-8">
<title>${safe} | 예수 묵상 편지</title>
<meta name="description" content="오늘의 예수 묵상 편지를 읽어 보세요.">
<meta property="og:type" content="website"><meta property="og:site_name" content="예수 묵상 편지">
<meta property="og:title" content="${safe}">
<meta property="og:description" content="오늘의 예수 묵상 편지를 읽어 보세요.">
<meta property="og:image" content="${image}">
<meta property="og:url" content="${site}api/share?title=${encodeURIComponent(title)}">
<meta name="twitter:card" content="summary_large_image">
<meta http-equiv="refresh" content="0;url=${site}">
<script>location.replace(${JSON.stringify(site)})</script></head><body>
<a href="${site}">예수 묵상 편지 읽기</a></body></html>`);
};
