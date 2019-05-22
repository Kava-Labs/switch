import {
  Menu,
  shell,
  BrowserWindow,
  MenuItemConstructorOptions
} from 'electron'

export default class MenuBuilder {
  mainWindow: BrowserWindow

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow
  }

  buildMenu() {
    if (
      process.env.NODE_ENV === 'development' ||
      process.env.DEBUG_PROD === 'true'
    ) {
      this.setupDevelopmentEnvironment()
    }

    const menu = Menu.buildFromTemplate(this.buildTemplate())
    Menu.setApplicationMenu(menu)

    return menu
  }

  setupDevelopmentEnvironment() {
    this.mainWindow.webContents.openDevTools()
    this.mainWindow.webContents.on('context-menu', (e, props) => {
      const { x, y } = props

      Menu.buildFromTemplate([
        {
          label: 'Inspect element',
          click: () => {
            this.mainWindow.webContents.inspectElement(x, y)
          }
        }
      ]).popup({
        window: this.mainWindow,
        x,
        y
      })
    })
  }

  buildTemplate(): MenuItemConstructorOptions[] {
    const helpMenu: MenuItemConstructorOptions = {
      label: 'Help',
      submenu: [
        {
          label: 'Learn More',
          click() {
            shell.openExternal('https://github.com/Kava-Labs/switch')
          }
        },
        {
          label: 'Search Issues',
          click() {
            shell.openExternal('https://github.com/Kava-Labs/switch/issues')
          }
        }
      ]
    }

    const isMac = process.platform === 'darwin'

    return [
      ...(isMac ? [{ role: 'appMenu' }] : []),
      { role: 'fileMenu' },
      { role: 'editMenu' },
      { role: 'viewMenu' },
      { role: 'windowMenu' },
      helpMenu
    ] as MenuItemConstructorOptions[]
    // TODO Electron types weren't updated yet to support the default roles, so the have to be casted
  }
}
