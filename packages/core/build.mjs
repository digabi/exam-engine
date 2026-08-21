import esbuild from 'esbuild'
import { lessLoader } from 'esbuild-plugin-less'

await esbuild.build({
  entryPoints: ['src/main.css'],
  outfile: 'dist/main.css',
  bundle: true,
  plugins: [lessLoader()],
  assetNames: 'assets/[name]',
  loader: Object.fromEntries(['.woff', '.woff2', '.eot', '.ttf', '.svg', '.png'].map(ext => [ext, 'file']))
})
