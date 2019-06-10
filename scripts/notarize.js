const { notarize } = require('electron-notarize')
require('envkey')

exports.default = async context => {
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
}
