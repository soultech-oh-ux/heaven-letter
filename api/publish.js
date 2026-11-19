const crypto = require('node:crypto');
const { read, readVersion, publishAtomically } = require('./_storage');

function verifyPassword(provided, expected) {
  if (typeof provided !== 'string' || typeof expected !== 'string' || !expected) return false;
  const left = crypto.createHash('sha256').update(provided).digest();
  const right = crypto.createHash('sha256').update(expected).digest();
  return crypto.timingSafeEqual(left, right);
}
module.exports = async function (req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Allow', 'GET, POST');
  if (req.method === 'GET') {
    try {
      const id = typeof req.query?.id === 'string' ? req.query.id : '';
      if (req.query?.id !== undefined && !/^[a-f0-9]{24}$/.test(id)) {
        return res.status(400).json({ error: '유효하지 않은 편지 ID입니다.' });
      }
      const letter = id ? await readVersion(id) : await read();
      if (!letter) return res.status(404).json({ error: '게시된 편지가 없습니다.' });
      return res.status(200).json({ letter });
    } catch (_) {
      return res.status(503).json({ error: '저장소 연결이 필요합니다.' });
    }
  }
  if (req.method !== 'POST') return res.status(405).end();

  const expected = process.env.LETTER_PUBLISH_PASSWORD;
  if (!expected) return res.status(503).json({ error: '서버 게시 암호 설정이 필요합니다.' });
  if (!verifyPassword(req.headers['x-publish-password'], expected)) {
    return res.status(401).json({ error: '게시 암호가 올바르지 않습니다.' });
  }

  const letter = req.body;
  if (!letter || typeof letter !== 'object' || Array.isArray(letter) ||
      !letter.fields || typeof letter.fields !== 'object' || Array.isArray(letter.fields)) {
    return res.status(400).json({ error: '편지 형식 오류' });
  }

  const allowed = new Set([
    'coverTitle', 'coverMessage', 'titleText', 'letter-author', 'meditation',
    'devotional', 'devotional-author', 'sin', 'promise', 'encourage', 'action',
    'knowledge', 'verse-reference-0', 'verse-reference-1',
    'verse-reference-2', 'verse-reference-3',
    'verse-0', 'verse-1', 'verse-2', 'verse-3'
  ]);
  const fields = {};
  for (const [key, value] of Object.entries(letter.fields)) {
    if (allowed.has(key) && typeof value === 'string') fields[key] = value.slice(0, 30000);
  }
  if (!fields.titleText && !fields.coverTitle) {
    return res.status(400).json({ error: '편지 제목이 필요합니다.' });
  }

  const praiseUrl = typeof letter.praiseUrl === 'string' ? letter.praiseUrl : '';
  if (praiseUrl && !/^https:\/\/youtu\.be\/[A-Za-z0-9_-]{11}$/.test(praiseUrl)) {
    return res.status(400).json({ error: '찬양 주소가 올바르지 않습니다.' });
  }
  const payload = {
    fields,
    date: typeof letter.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(letter.date) ? letter.date : '',
    praiseUrl,
    updatedAt: new Date().toISOString()
  };
  if (Buffer.byteLength(JSON.stringify(payload), 'utf8') > 90000) {
    return res.status(413).json({ error: '편지 내용이 너무 깁니다.' });
  }
  try {
    const id = crypto.randomBytes(12).toString('hex');
    await publishAtomically(id, payload);
    return res.status(200).json({
      ok: true,
      id,
      shareUrl: 'https://heaven-letter-one.vercel.app/api/share?id=' + id
    });
  } catch (_) {
    return res.status(503).json({ error: '서버 저장에 실패했습니다. 저장소 설정을 확인하세요.' });
  }
};
