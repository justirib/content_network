export default function middleware(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  if (pathname === '/' || pathname === '/index.html' || pathname === '/favicon.ico') {
    return;
  }

  const key = url.searchParams.get('k') || url.searchParams.get('key') || url.searchParams.get('k?');
  const expectedKey = process.env.KEY || process.env.k;

  if (!key || key !== expectedKey) {
    return new Response(
      JSON.stringify({ error: 'UNAUTHORISED' }),
      {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  const fetchDest = request.headers.get('sec-fetch-dest') || '';
  const fetchMode = request.headers.get('sec-fetch-mode') || '';
  const acceptHeader = request.headers.get('accept') || '';

  const isBrowserDocumentRequest =
    fetchDest === 'document' ||
    fetchMode === 'navigate' ||
    acceptHeader.includes('text/html');

  if (isBrowserDocumentRequest) {
    return new Response(
      JSON.stringify({ error: 'BROWSER CANNOT VIEW THIS FILE.' }),
      {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

}
