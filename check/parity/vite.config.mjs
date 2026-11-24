import react from '@vitejs/plugin-react';
import { readdirSync, readFileSync } from 'node:fs';
import { defineConfig } from 'vite';
import { coreEntry } from '../../vite.config.mjs';
import { designDir } from '../../scripts/design.mjs';

/* The previews point their sample art at /_blob/<id>. The same files, in .design/blobs,
   answer here, so both sides of a pair draw the real pictures. */
const blobs = designDir + '/blobs/';
const types = { jpg: 'image/jpeg', png: 'image/png', webp: 'image/webp' };
const sampleArt = {
  name: 'sample-art',
  configureServer(server) {
    server.middlewares.use('/_blob', (req, res, next) => {
      const id = req.url.slice(1).split(/[?#]/)[0];
      const file = readdirSync(blobs).find((f) => f.startsWith(id + '.'));
      if (!file) return next();
      res.setHeader('Content-Type', types[file.split('.').pop()] ?? 'application/octet-stream');
      res.end(readFileSync(blobs + file));
    });
  },
};

export default defineConfig({
  root: new URL('.', import.meta.url).pathname,
  plugins: [react(), sampleArt],
  resolve: { alias: coreEntry },
  server: { port: 5199, fs: { allow: ['../..'] } },
});
