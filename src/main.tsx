import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import App from './App.tsx'
import './index.css'

// 配置Antd主题
const theme = {
  token: {
    colorPrimary: '#1e3a8a',
    colorSuccess: '#059669',
    colorWarning: '#ea580c',
    colorError: '#dc2626',
    borderRadius: 6,
    wireframe: false,
  },
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConfigProvider locale={zhCN} theme={theme}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ConfigProvider>
  </React.StrictMode>,
)