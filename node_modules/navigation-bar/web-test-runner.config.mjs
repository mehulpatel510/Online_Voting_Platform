// import { playwrightLauncher } from '@web/test-runner-playwright';
import url from '@rollup/plugin-url';
import { fromRollup } from '@web/dev-server-rollup';

const urlRollup = fromRollup(url);
export default /** @type {import("@web/test-runner").TestRunnerConfig} */ ({
  files: 'test/**/*.test.js',
  nodeResolve: true,

  /** Compile JS for older browsers. Requires @web/dev-server-esbuild plugin */
  // esbuildTarget: 'auto',

  /** Confgure bare import resolve plugin */
  // nodeResolve: {
  //   exportConditions: ['browser', 'development']
  // },

  /** Amount of browsers to run concurrently */
  // concurrentBrowsers: 2,

  /** Amount of test files per browser to test concurrently */
  // concurrency: 1,

  /** Browsers to run tests on */
  // browsers: [
  //   playwrightLauncher({ product: 'chromium' }),
  //   playwrightLauncher({ product: 'firefox' }),
  //   playwrightLauncher({ product: 'webkit' }),
  // ],
  plugins: [
    /** Use Hot Module Replacement by uncommenting. Requires @open-wc/dev-server-hmr plugin */
    // hmr && hmrPlugin({ exclude: ['**/*/node_modules/**/*'], presets: [presets.litElement] }),
    urlRollup()
  ],

  // See documentation for all available options
});
