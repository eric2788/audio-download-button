import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import copy from 'rollup-plugin-copy';
import { terser } from 'rollup-plugin-terser';

const ext = {
  watch: {
    include: 'src/**',
  },
  plugins: [
    resolve(),
    commonjs(),
    copy({
        targets: [
            { src: 'src/manifest.json', dest: 'dist'},
            { src: 'src/icons/*', dest: 'dist/icons'}
        ]
    }),
    terser()
  ]
}

export default [
  {
    input: 'src/index.js',
    output: {
      //exports: 'auto',
      file: 'dist/index.js',
      //dir: 'dist', // firefox extension not support multiple js huh 
      format: 'esm',
      /* //firefox extension not support chunk splitting :(
      manualChunks(id) {
        if (id.includes('node_modules')) {
          return 'vendor';
        }
      }
      */
      
    },
    ...ext
  },
  {
    input: 'src/background.js',
    output: {
      //exports: 'auto',
      file: 'dist/background.js',
      //dir: 'dist', // firefox extension not support multiple js huh 
      format: 'esm'
      /* //firefox extension not support chunk splitting :(
      manualChunks(id) {
        if (id.includes('node_modules')) {
          return 'vendor';
        }
      }
      */
    },
    ...ext
  }
];