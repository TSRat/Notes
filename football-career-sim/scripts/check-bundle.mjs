import { readdir, stat } from 'node:fs/promises'
import { extname, join } from 'node:path'

const assetDir = new URL('../dist/assets/', import.meta.url)
const files = await readdir(assetDir)
let jsBytes = 0

for (const file of files) {
  if (extname(file) === '.js' && !file.endsWith('.map')) {
    jsBytes += (await stat(join(assetDir.pathname, file))).size
  }
}

const budget = 500 * 1024
console.log(`Core JavaScript: ${(jsBytes / 1024).toFixed(1)} KB / 500 KB budget`)
if (jsBytes >= budget) process.exit(1)
