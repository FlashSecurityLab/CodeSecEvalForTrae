import { contextBridge, ipcRenderer } from 'electron'

// 定义暴露给渲染进程的API
const electronAPI = {
  // 对话框相关
  openProjectDialog: () => ipcRenderer.invoke('dialog:openProject'),
  saveReportDialog: (defaultPath: string) => ipcRenderer.invoke('dialog:saveReport', defaultPath),
  
  // 通知相关
  notify: (title: string, body: string) => ipcRenderer.invoke('app:notify', title, body),
  
  // 监听主进程事件
  onProjectOpened: (callback: (projectPath: string) => void) => {
    ipcRenderer.on('project:opened', (_, projectPath) => callback(projectPath))
  },
  
  onScanNew: (callback: () => void) => {
    ipcRenderer.on('scan:new', callback)
  },
  
  onScanQuick: (callback: () => void) => {
    ipcRenderer.on('scan:quick', callback)
  },
  
  onScanFull: (callback: () => void) => {
    ipcRenderer.on('scan:full', callback)
  },
  
  onScanStop: (callback: () => void) => {
    ipcRenderer.on('scan:stop', callback)
  },
  
  onNavigate: (callback: (route: string) => void) => {
    ipcRenderer.on('navigate', (_, route) => callback(route))
  },
  
  onNotification: (callback: (notification: { title: string; body: string }) => void) => {
    ipcRenderer.on('notification', (_, notification) => callback(notification))
  },
  
  // 移除监听器
  removeAllListeners: (channel: string) => {
    ipcRenderer.removeAllListeners(channel)
  },
  
  // 平台信息
  platform: process.platform,
  
  // 版本信息
  versions: {
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron
  }
}

// 安全地暴露API到渲染进程
contextBridge.exposeInMainWorld('electronAPI', electronAPI)

// TypeScript类型声明
export type ElectronAPI = typeof electronAPI