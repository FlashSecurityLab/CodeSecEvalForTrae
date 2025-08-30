import React from 'react'
import { Layout, Menu, Typography } from 'antd'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  DashboardOutlined,
  ScanOutlined,
  FileTextOutlined,
  SettingOutlined,
  HistoryOutlined,
  SecurityScanOutlined,
  BugOutlined
} from '@ant-design/icons'

const { Sider } = Layout
const { Title } = Typography

const Sidebar: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: '控制台',
    },
    {
      key: '/scan',
      icon: <ScanOutlined />,
      label: '扫描管理',
    },
    {
      key: '/reports',
      icon: <BugOutlined />,
      label: '漏洞报告',
    },
    {
      key: '/rules',
      icon: <SecurityScanOutlined />,
      label: '规则配置',
    },
    {
      key: '/history',
      icon: <HistoryOutlined />,
      label: '扫描历史',
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: '设置',
    },
  ]

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key)
  }

  return (
    <Sider className="sidebar" theme="dark" width={250}>
      <div style={{ padding: '16px', textAlign: 'center', borderBottom: '1px solid #303030' }}>
        <Title level={4} style={{ color: 'white', margin: 0 }}>
          <SecurityScanOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          CodeSecEval
        </Title>
        <div style={{ color: '#8c8c8c', fontSize: '12px', marginTop: 4 }}>
          代码安全扫描插件
        </div>
      </div>
      
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems}
        onClick={handleMenuClick}
        style={{
          border: 'none',
          paddingTop: '16px'
        }}
      />
      
      <div style={{
        position: 'absolute',
        bottom: '16px',
        left: '16px',
        right: '16px',
        textAlign: 'center',
        color: '#8c8c8c',
        fontSize: '12px',
        borderTop: '1px solid #303030',
        paddingTop: '16px'
      }}>
        <div>版本 1.0.0</div>
        <div style={{ marginTop: '4px' }}>© 2024 CodeSecEval</div>
      </div>
    </Sider>
  )
}

export default Sidebar