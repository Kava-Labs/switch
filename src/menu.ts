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
    let aboutSubMenu: MenuItemConstructorOptions[] = []
    if (process.platform === 'darwin') {
      aboutSubMenu = [
        {
          role: 'hide'
        },
        {
          role: 'hideOthers'
        },
        {
          role: 'unhide'
        },
        {
          type: 'separator'
        }
      ]
    }

    aboutSubMenu.push({
      role: 'quit'
    })

    const aboutMenu: MenuItemConstructorOptions = {
      label: 'Switch',
      submenu: aboutSubMenu
    }

    const editMenu: MenuItemConstructorOptions = {
      label: 'Edit',
      submenu: [
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        {
          role: 'selectAll'
        }
      ]
    }

    const viewMenu: MenuItemConstructorOptions = {
      label: 'View',
      submenu: [
        {
          role: 'reload'
        },
        {
          role: 'toggleFullScreen'
        },
        {
          role: 'toggleDevTools'
        }
      ]
    }

    let windowSubMenu: MenuItemConstructorOptions[] = [
      {
        role: 'minimize'
      },
      { role: 'close' }
    ]
    if (process.platform === 'darwin') {
      windowSubMenu.push({
        type: 'separator'
      })
      windowSubMenu.push({
        role: 'front'
      })
    }

    const windowMenu: MenuItemConstructorOptions = {
      label: 'Window',
      submenu: windowSubMenu
    }

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

    return [aboutMenu, editMenu, viewMenu, windowMenu, helpMenu]
  }
}
