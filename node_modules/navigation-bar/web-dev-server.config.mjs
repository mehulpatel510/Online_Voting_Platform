// import { hmrPlugin, presets } from '@open-wc/dev-server-hmr';
 //import image from '@rollup/plugin-image';
 //import images from 'rollup-plugin-image-files';
 import url from '@rollup/plugin-url';
import { fromRollup } from '@web/dev-server-rollup';

const urlRollup = fromRollup(url);

/** Use Hot Module replacement by adding --hmr to the start command */
const hmr = process.argv.includes('--hmr');

export default /** @type {import('@web/dev-server').DevServerConfig} */ ({
  nodeResolve: true,
  open: '/demo/',
  watch: !hmr,

  /** Compile JS for older browsers. Requires @web/dev-server-esbuild plugin */
  // esbuildTarget: 'auto'

  /** Set appIndex to enable SPA routing */
  // appIndex: 'demo/index.html',

  /** Confgure bare import resolve plugin */
  // nodeResolve: {
  //   exportConditions: ['browser', 'development']
  // },

  plugins: [
    /** Use Hot Module Replacement by uncommenting. Requires @open-wc/dev-server-hmr plugin */
    // hmr && hmrPlugin({ exclude: ['**/*/node_modules/**/*'], presets: [presets.litElement] }),
    urlRollup()
  ],

  // See documentation for all available options
});
