import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  const key = req.query.k || req.query['k?'] || req.query.key;
  const filePath = req.query.f || req.query['f?'] || req.query.file;

  const expectedKey = process.env.KEY || process.env.k;

  if (!key || key !== expectedKey) {
    return res.status(401).json({ error: 'UNAUTHORIZED.' });
  }

  const acceptHeader = req.headers['accept'] || '';
  const fetchDest = req.headers['sec-fetch-dest'] || '';
  const fetchMode = req.headers['sec-fetch-mode'] || '';
  const userAgent = req.headers['user-agent'] || '';

  const isBrowserDocumentRequest = 
    fetchDest === 'document' || 
    fetchMode === 'navigate' ||
    acceptHeader.includes('text/html');

  if (isBrowserDocumentRequest) {
    return res.status(403).json({ 
      error: 'BROWSER VIEWING RESTRICTED.' 
    });
  }

  if (!filePath) {
    return res.status(400).json({ error: 'MISSIN F PARAM.' });
  }

  const cleanFileName = path.basename(filePath);
  const targetPath = path.join(process.cwd(), 'files', cleanFileName);

  if (!fs.existsSync(targetPath)) {
    return res.status(404).json({ error: 'NOT FOUND.' });
  }

  try {
    const content = fs.readFileSync(targetPath, 'utf8');

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    res.setHeader('X-Content-Type-Options', 'nosniff');

    return res.status(200).send(content);
  } catch (err) {
    return res.status(500).json({ error: 'CROCUS SERVER ERR' });
  }
}
