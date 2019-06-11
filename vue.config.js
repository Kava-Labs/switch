const path = require('path')
const webpack = require('webpack')
const { notarize } = require('electron-notarize')
require('dotenv').config()

module.exports = {
  pluginOptions: {
    // Automatically import base styles into every Vue component <style>
    'style-resources-loader': {
      patterns: [path.resolve(__dirname, 'src/styles/*.scss')],
      preProcessor: 'scss'
    },
    electronBuilder: {
      builderOptions: {
        appId: 'io.kava.switch',
        productName: 'Switch',
        win: {
          target: 'nsis'
        },
        linux: {
          category: 'Finance',
          packageCategory: 'wallet',
          target: 'AppImage'
        },
        mac: {
          category: 'public.app-category.finance',
          /**
           * To enable notarizing the app, followed the configuration outlined by this tutorial:
           * https://kilianvalkhof.com/2019/electron/notarizing-your-electron-application/
           */
          hardenedRuntime: true,
          gatekeeperAssess: false,
          entitlements: 'public/entitlements.mac.plist',
          entitlementsInherit: 'public/entitlements.mac.plist'
        },
        afterSign: async context => {
          const { electronPlatformName, appOutDir } = context
          const appName = context.packager.appInfo.productFilename

          if (electronPlatformName === 'darwin') {
            return notarize({
              appBundleId: 'io.kava.switch',
              appPath: `${appOutDir}/${appName}.app`,
              appleId: process.env.APPLE_ID,
              appleIdPassword: process.env.APPLE_PASSWORD
            })
          }
        },
        // Include ths OS so it's clearer which to download from the filename
        artifactName: '${productName}-${os}-v${version}.${ext}'
      },
      chainWebpackRendererProcess: config => {
        /**
         * When Webpack builds for the "electron-renderer" target, it prioritizes
         * the entry for the package.json `browser` field above `main`
         *
         * - Some modules, such as ws and ripple-lib, have different behavior in the browser,
         *   so don't resolve the browser field
         * - Only apply this for Electron builds, and not browser builds
         */
        config.resolve.mainFields
          .clear()
          .add('main')
          .add('module')
      }
    }
  },
  chainWebpack: config => {
    /** For development, show debug logs */
    if (process.env.NODE_ENV !== 'production') {
      config
        .plugin('environment')
        .after('define')
        .use(webpack.EnvironmentPlugin, [
          {
            /** Do NOT add quotes. '"ilp*"' doesn't work! */
            DEBUG: 'ilp*,switch*'
          }
        ])
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
