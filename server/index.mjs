import express from 'express';
import compression from 'compression';
import { renderPage } from 'vite-plugin-ssr';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'vite';
import sirv from 'sirv';
import Blorum from "blorum-sdk-js";
import { createProxyMiddleware } from 'http-proxy-middleware';
const address = process.argv[2] ? process.argv[2] : "http://localhost:10975";
global.blorum = new Blorum(address);

global.isProduction = process.env.NODE_ENV === 'production';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = `${__dirname}/..`

global.blorufVersion = "Development";
global.blorufVersionStamp = "0";

startServer();

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

  app.use('/statics', createProxyMiddleware({ target: address, changeOrigin: true, pathRewrite: {'^/statics': '/statics'}}));
  app.use('/api', createProxyMiddleware({ target: address, changeOrigin: true, pathRewrite: {'^/api': '/'}}));

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

  const port = process.env.PORT || 10976
  app.listen(port)
  console.log(`Bloruf server ${blorufVersion} running at http://localhost:${port}`)
}
