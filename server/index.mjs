import express from 'express';
import compression from 'compression';
import { renderPage } from 'vite-plugin-ssr';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'vite';
import sirv from 'sirv';

const isProduction = process.env.NODE_ENV === 'production';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = `${__dirname}/..`

startServer()

async function startServer() {
  const app = express()

  app.use(compression())

  if (isProduction) {
    app.use(sirv(`${root}/dist/client`))
  } else {
    const viteDevMiddleware = (
      await createServer({
        root,
        server: { middlewareMode: true }
      })
    ).middlewares
    app.use(viteDevMiddleware)
  }

  app.get('*', async (req, res, next) => {
    const pageContextInit = {
      urlOriginal: req.originalUrl
    }
    const pageContext = await renderPage(pageContextInit)
    const { httpResponse } = pageContext
    if (!httpResponse) return next()
    const { body, statusCode, contentType, earlyHints } = httpResponse
    if (res.writeEarlyHints) res.writeEarlyHints({ link: earlyHints.map((e) => e.earlyHintLink) })
    res.status(statusCode).type(contentType).send(body)
  })

  const port = process.env.PORT || 3000
  app.listen(port)
  console.log(`Server running at http://localhost:${port}`)
}
