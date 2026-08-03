import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  const key = req.query.k || req.query['k?'] || req.query.key;
  const expectedKey = process.env.KEY || process.env.k;

  if (!key || key !== expectedKey) {
    return res.status(401).json({ error: 'UNAUTHORISED' });
  }

  const fetchDest = req.headers['sec-fetch-dest'] || '';
  const fetchMode = req.headers['sec-fetch-mode'] || '';
  const acceptHeader = req.headers['accept'] || '';

  const isBrowserDocumentRequest =
    fetchDest === 'document' ||
    fetchMode === 'navigate' ||
    acceptHeader.includes('text/html');

  if (isBrowserDocumentRequest) {
    return res.status(403).json({ 
      error: 'DENIED' 
    });
  }

  let rawFilePath = req.query.f || req.query['f?'] || req.query.file;

  if (Array.isArray(rawFilePath)) {
    rawFilePath = rawFilePath.join('/');
  }

  if (!rawFilePath) {
    return res.status(400).json({ error: 'WHAT FILE?' });
  }

  const baseDir = path.resolve(process.cwd(), 'files');

  const cleanRelativePath = rawFilePath.replace(/^[\/\\]+/, '');
  const fullPath = path.resolve(baseDir, cleanRelativePath);

  if (!fullPath.startsWith(baseDir)) {
    return res.status(403).json({ error: 'DENIED' });
  }

  if (!fs.existsSync(fullPath) || fs.statSync(fullPath).isDirectory()) {
    return res.status(404).json({ error: 'NOT THERE' });
  }

  try {
    const fileContent = fs.readFileSync(fullPath, 'utf8');

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    res.setHeader('X-Content-Type-Options', 'nosniff');

    return res.status(200).send(fileContent);
  } catch (err) {
    return res.status(500).json({ error: 'SERVER ERR' });
  }
}
