const path = require('path')

module.exports = {
  // Automatically import base styles everywhere
  pluginOptions: {
    'style-resources-loader': {
      patterns: [path.resolve(__dirname, 'src/styles/*.scss')],
      preProcessor: 'scss'
    }
  },
  /*
   * Importing MDC component styles causes issues with our Webpack config, which this fixes:
   * https://github.com/material-components/material-components-web/issues/351#issuecomment-318981488
   */
  css: {
    loaderOptions: {
      sass: {
        includePaths: ['node_modules', 'node_modules/@material/*'].map(d =>
          path.join(__dirname, d)
        )
      }
    }
  }
}
