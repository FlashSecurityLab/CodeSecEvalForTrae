import React, { useEffect } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import { Layout, message } from 'antd'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import ScanPage from './pages/ScanPage'
import ReportsPage from './pages/ReportsPage'
import RulesPage from './pages/RulesPage'
import HistoryPage from './pages/HistoryPage'
import SettingsPage from './pages/SettingsPage'
import { ElectronAPI } from '../electron/preload'

const { Content } = Layout

// 声明全局的electronAPI
declare global {
  interface Window {
    electronAPI?: ElectronAPI
  }
}

function App() {
  const navigate = useNavigate()

  useEffect(() => {
    // 检查是否在Electron环境中
    if (window.electronAPI) {
      // 监听主进程的导航事件
      window.electronAPI.onNavigate((route: string) => {
        navigate(route)
      })

      // 监听项目打开事件
      window.electronAPI.onProjectOpened((projectPath: string) => {
        message.success(`项目已打开: ${projectPath}`)
        // 可以在这里触发项目加载逻辑
      })

      // 监听扫描事件
      window.electronAPI.onScanNew(() => {
        navigate('/scan')
        message.info('开始新建扫描')
      })

      window.electronAPI.onScanQuick(() => {
        message.info('开始快速扫描')
        // 触发快速扫描逻辑
      })

      window.electronAPI.onScanFull(() => {
        message.info('开始全量扫描')
        // 触发全量扫描逻辑
      })

      window.electronAPI.onScanStop(() => {
        message.warning('停止扫描')
        // 触发停止扫描逻辑
      })

      // 监听通知事件
      window.electronAPI.onNotification((notification) => {
        message.info(`${notification.title}: ${notification.body}`)
      })
    }

    // 清理函数
    return () => {
      if (window.electronAPI) {
        window.electronAPI.removeAllListeners('navigate')
        window.electronAPI.removeAllListeners('project:opened')
        window.electronAPI.removeAllListeners('scan:new')
        window.electronAPI.removeAllListeners('scan:quick')
        window.electronAPI.removeAllListeners('scan:full')
        window.electronAPI.removeAllListeners('scan:stop')
        window.electronAPI.removeAllListeners('notification')
      }
    }
  }, [navigate])

  return (
    <Layout className="layout-container">
      <Sidebar />
      <Layout>
        <Content className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/scan" element={<ScanPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/rules" element={<RulesPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  )
}

export default App