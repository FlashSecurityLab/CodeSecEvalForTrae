import { app, BrowserWindow, Menu, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

// 开发环境检测
const isDev = process.env.NODE_ENV === 'development'

class ElectronApp {
  private mainWindow: BrowserWindow | null = null

  constructor() {
    this.init()
  }

  private init() {
    // 当应用准备就绪时创建窗口
    app.whenReady().then(() => {
      this.createWindow()
      this.setupMenu()
      this.setupIPC()

      app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
          this.createWindow()
        }
      })
    })

    // 当所有窗口关闭时退出应用（macOS除外）
    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit()
      }
    })
  }

  private createWindow() {
    // 创建主窗口
    this.mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      minWidth: 800,
      minHeight: 600,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        enableRemoteModule: false,
        preload: join(__dirname, 'preload.js')
      },
      titleBarStyle: 'default',
      show: false // 先隐藏，加载完成后显示
    })

    // 加载应用
    if (isDev) {
      this.mainWindow.loadURL('http://localhost:5173')
      this.mainWindow.webContents.openDevTools()
    } else {
      this.mainWindow.loadFile(join(__dirname, '../dist/index.html'))
    }

    // 窗口加载完成后显示
    this.mainWindow.once('ready-to-show', () => {
      this.mainWindow?.show()
    })

    // 窗口关闭事件
    this.mainWindow.on('closed', () => {
      this.mainWindow = null
    })
  }

  private setupMenu() {
    const template: Electron.MenuItemConstructorOptions[] = [
      {
        label: '文件',
        submenu: [
          {
            label: '打开项目',
            accelerator: 'CmdOrCtrl+O',
            click: () => this.openProject()
          },
          {
            label: '新建扫描',
            accelerator: 'CmdOrCtrl+N',
            click: () => this.newScan()
          },
          { type: 'separator' },
          {
            label: '退出',
            accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
            click: () => app.quit()
          }
        ]
      },
      {
        label: '扫描',
        submenu: [
          {
            label: '快速扫描',
            accelerator: 'CmdOrCtrl+Shift+S',
            click: () => this.quickScan()
          },
          {
            label: '全量扫描',
            accelerator: 'CmdOrCtrl+Shift+F',
            click: () => this.fullScan()
          },
          {
            label: '停止扫描',
            accelerator: 'CmdOrCtrl+Shift+X',
            click: () => this.stopScan()
          }
        ]
      },
      {
        label: '视图',
        submenu: [
          {
            label: '控制台',
            accelerator: 'CmdOrCtrl+1',
            click: () => this.navigateTo('/dashboard')
          },
          {
            label: '漏洞报告',
            accelerator: 'CmdOrCtrl+2',
            click: () => this.navigateTo('/reports')
          },
          {
            label: '规则配置',
            accelerator: 'CmdOrCtrl+3',
            click: () => this.navigateTo('/rules')
          },
          {
            label: '设置',
            accelerator: 'CmdOrCtrl+4',
            click: () => this.navigateTo('/settings')
          }
        ]
      },
      {
        label: '帮助',
        submenu: [
          {
            label: '关于',
            click: () => this.showAbout()
          }
        ]
      }
    ]

    const menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu)
  }

  private setupIPC() {
    // 打开项目对话框
    ipcMain.handle('dialog:openProject', async () => {
      const result = await dialog.showOpenDialog(this.mainWindow!, {
        properties: ['openDirectory'],
        title: '选择项目目录'
      })
      return result
    })

    // 保存扫描报告
    ipcMain.handle('dialog:saveReport', async (_, defaultPath: string) => {
      const result = await dialog.showSaveDialog(this.mainWindow!, {
        title: '保存扫描报告',
        defaultPath,
        filters: [
          { name: 'JSON文件', extensions: ['json'] },
          { name: '所有文件', extensions: ['*'] }
        ]
      })
      return result
    })

    // 应用通知
    ipcMain.handle('app:notify', (_, title: string, body: string) => {
      if (this.mainWindow) {
        this.mainWindow.webContents.send('notification', { title, body })
      }
    })
  }

  private async openProject() {
    const result = await dialog.showOpenDialog(this.mainWindow!, {
      properties: ['openDirectory'],
      title: '选择项目目录'
    })

    if (!result.canceled && result.filePaths.length > 0) {
      this.mainWindow?.webContents.send('project:opened', result.filePaths[0])
    }
  }

  private newScan() {
    this.mainWindow?.webContents.send('scan:new')
  }

  private quickScan() {
    this.mainWindow?.webContents.send('scan:quick')
  }

  private fullScan() {
    this.mainWindow?.webContents.send('scan:full')
  }

  private stopScan() {
    this.mainWindow?.webContents.send('scan:stop')
  }

  private navigateTo(route: string) {
    this.mainWindow?.webContents.send('navigate', route)
  }

  private showAbout() {
    dialog.showMessageBox(this.mainWindow!, {
      type: 'info',
      title: '关于 CodeSecEval',
      message: 'CodeSecEval v0.1.0',
      detail: '代码安全漏洞扫描插件\n\n一个智能的代码安全检测工具，帮助开发者在编码阶段发现和修复安全问题。'
    })
  }
}

// 创建应用实例
new ElectronApp()