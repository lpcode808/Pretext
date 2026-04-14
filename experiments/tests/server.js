/**
 * Static file server for experiment HTML files.
 * Routes /pretext/* requests to the locally-built upstream dist,
 * so tests run without hitting the CDN.
 */
const http = require('http')
const fs = require('fs')
const path = require('path')

const PORT = 8700
const EXPERIMENTS_DIR = path.resolve(__dirname, '..')
const PRETEXT_DIST = path.resolve(__dirname, '../../upstream/chenglou-pretext/dist')

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.ts': 'application/javascript; charset=utf-8',
}

function serveFile(res, filePath, mimeType) {
  try {
    const content = fs.readFileSync(filePath)
    res.writeHead(200, { 'Content-Type': mimeType, 'Access-Control-Allow-Origin': '*' })
    res.end(content)
  } catch {
    res.writeHead(404)
    res.end('Not found: ' + filePath)
  }
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`)
  const pathname = url.pathname

  // Intercept CDN requests — serve local dist instead
  if (pathname.startsWith('/__pretext/')) {
    const file = pathname.replace('/__pretext/', '')
    const filePath = path.join(PRETEXT_DIST, file)
    serveFile(res, filePath, MIME[path.extname(filePath)] || 'text/plain')
    return
  }

  // Serve experiment HTML files
  let filePath
  if (pathname === '/' || pathname === '') {
    res.writeHead(200, { 'Content-Type': 'text/html' })
    res.end('<html><body><p>Pretext experiment test server</p></body></html>')
    return
  }

  filePath = path.join(EXPERIMENTS_DIR, pathname)
  const ext = path.extname(filePath) || '.html'
  if (!path.extname(filePath)) filePath += '.html'

  if (!fs.existsSync(filePath)) {
    res.writeHead(404)
    res.end('Not found')
    return
  }

  // For HTML files: rewrite CDN import URLs to point at local dist
  if (ext === '.html') {
    let html = fs.readFileSync(filePath, 'utf-8')
    html = html.replace(
      /https:\/\/esm\.sh\/@chenglou\/pretext@[^"'?]+(?:\?[^"']*)?/g,
      `http://localhost:${PORT}/__pretext/layout.js`
    )
    html = html.replace(
      /https:\/\/cdn\.jsdelivr\.net\/npm\/@chenglou\/pretext@[^"']+\/\+esm/g,
      `http://localhost:${PORT}/__pretext/layout.js`
    )
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
    res.end(html)
    return
  }

  serveFile(res, filePath, MIME[ext] || 'application/octet-stream')
})

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Pretext test server running at http://localhost:${PORT}`)
  console.log(`Serving experiments from: ${EXPERIMENTS_DIR}`)
  console.log(`Serving Pretext dist from: ${PRETEXT_DIST}`)
})
