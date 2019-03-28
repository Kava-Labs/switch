const path = require('path')
const glob = require('fast-glob')
const _ = require('lodash')
const webpack = require('webpack')

// TODO Better solution?
let skips = ['electron', 'npm']
let externals = _.uniq(
  glob
    .sync(
      ['gyp'].map(v => {
        return `node_modules/**/*.${v}`
      })
    )
    .map(v => v.split('/')[1])
    .filter(v => {
      return skips.indexOf(v) == -1
    })
).sort()

module.exports = {
  // Automatically import base styles everywhere
  pluginOptions: {
    'style-resources-loader': {
      patterns: [path.resolve(__dirname, 'src/styles/*.scss')],
      preProcessor: 'scss'
    },
    electronBuilder: {
      // List native deps here if they don't work
      externals
    }
  },
  // TODO Is this necessary?
  configureWebpack(config) {
    config.plugins.push(new webpack.ExternalsPlugin('commonjs', externals))
    config.resolve.alias.ws = path.resolve(
      __dirname,
      'node_modules/ws/index.js'
    )
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
