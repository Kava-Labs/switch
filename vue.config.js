const path = require('path')

module.exports = {
  // Automatically import base styles
  pluginOptions: {
    'style-resources-loader': {
      patterns: [path.resolve(__dirname, 'src/styles/*.scss')],
      preProcessor: 'scss'
    }
  }
}
