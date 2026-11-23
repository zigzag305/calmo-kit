import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { buildLlmsTxt, schemaScriptTag } from './src/seo/schema';

/** Injects schema.org JSON-LD built from the live catalog (see src/seo/schema.ts). */
const productSchema = (): Plugin => ({
  name: 'calmokit-product-schema',
  transformIndexHtml(html) {
    return html.replace('<!--SCHEMA_JSONLD-->', schemaScriptTag());
  },
  generateBundle() {
    this.emitFile({ type: 'asset', fileName: 'llms.txt', source: buildLlmsTxt() });
  },
});

export default defineConfig({
  plugins: [react(), tailwindcss(), productSchema()],
  base: './',
});
