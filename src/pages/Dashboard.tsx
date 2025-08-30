import React, { useState, useEffect } from 'react'
import {
  Card,
  Row,
  Col,
  Statistic,
  Button,
  List,
  Tag,
  Progress,
  Typography,
  Space,
  Alert,
  Divider
} from 'antd'
import {
  BugOutlined,
  SecurityScanOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  PlayCircleOutlined,
  FolderOpenOutlined,
  BarChartOutlined
} from '@ant-design/icons'

const { Title, Text } = Typography

interface ScanSession {
  id: string
  projectPath: string
  status: 'running' | 'completed' | 'failed'
  progress: number
  startTime: string
  vulnerabilityCount: number
  severity: {
    critical: number
    high: number
    medium: number
    low: number
  }
}

const Dashboard: React.FC = () => {
  const [recentScans, setRecentScans] = useState<ScanSession[]>([])
  const [stats, setStats] = useState({
    totalScans: 0,
    totalVulnerabilities: 0,
    criticalVulnerabilities: 0,
    activeScans: 0
  })

  useEffect(() => {
    // 模拟数据加载
    const mockScans: ScanSession[] = [
      {
        id: '1',
        projectPath: '/path/to/project1',
        status: 'completed',
        progress: 100,
        startTime: '2024-01-15 14:30:00',
        vulnerabilityCount: 12,
        severity: { critical: 2, high: 4, medium: 5, low: 1 }
      },
      {
        id: '2',
        projectPath: '/path/to/project2',
        status: 'running',
        progress: 65,
        startTime: '2024-01-15 15:45:00',
        vulnerabilityCount: 0,
        severity: { critical: 0, high: 0, medium: 0, low: 0 }
      },
      {
        id: '3',
        projectPath: '/path/to/project3',
        status: 'failed',
        progress: 30,
        startTime: '2024-01-15 13:20:00',
        vulnerabilityCount: 0,
        severity: { critical: 0, high: 0, medium: 0, low: 0 }
      }
    ]

    setRecentScans(mockScans)
    setStats({
      totalScans: 25,
      totalVulnerabilities: 156,
      criticalVulnerabilities: 8,
      activeScans: 1
    })
  }, [])

  const handleOpenProject = async () => {
    if (window.electronAPI) {
      try {
        const result = await window.electronAPI.openProjectDialog()
        if (result) {
          console.log('Selected project:', result)
        }
      } catch (error) {
        console.error('Failed to open project:', error)
      }
    }
  }

  const getSeverityColor = (severity: string) => {
    const colors = {
      critical: '#ff4d4f',
      high: '#fa8c16',
      medium: '#fadb14',
      low: '#52c41a'
    }
    return colors[severity as keyof typeof colors] || '#d9d9d9'
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <ClockCircleOutlined style={{ color: '#1890ff' }} />
      case 'completed':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />
      case 'failed':
        return <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
      default:
        return null
    }
  }

  return (
    <div className="content-body">
      <div className="content-header">
        <Title level={2} style={{ margin: 0 }}>
          <SecurityScanOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          安全扫描控制台
        </Title>
        <Text type="secondary">实时监控代码安全状态，快速发现潜在漏洞</Text>
      </div>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="security-card">
            <Statistic
              title="总扫描次数"
              value={stats.totalScans}
              prefix={<BarChartOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="security-card">
            <Statistic
              title="发现漏洞"
              value={stats.totalVulnerabilities}
              prefix={<BugOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="security-card">
            <Statistic
              title="严重漏洞"
              value={stats.criticalVulnerabilities}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="security-card">
            <Statistic
              title="活跃扫描"
              value={stats.activeScans}
              prefix={<PlayCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* 快速操作 */}
        <Col xs={24} lg={8}>
          <Card title="快速操作" className="security-card">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button
                type="primary"
                icon={<FolderOpenOutlined />}
                size="large"
                block
                onClick={handleOpenProject}
              >
                打开项目
              </Button>
              <Button
                icon={<PlayCircleOutlined />}
                size="large"
                block
              >
                快速扫描
              </Button>
              <Button
                icon={<SecurityScanOutlined />}
                size="large"
                block
              >
                全量扫描
              </Button>
            </Space>
          </Card>
        </Col>

        {/* 最近扫描 */}
        <Col xs={24} lg={16}>
          <Card title="最近扫描" className="security-card">
            <List
              dataSource={recentScans}
              renderItem={(scan) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={getStatusIcon(scan.status)}
                    title={
                      <Space>
                        <Text strong>{scan.projectPath.split('/').pop()}</Text>
                        <Tag color={scan.status === 'completed' ? 'green' : scan.status === 'running' ? 'blue' : 'red'}>
                          {scan.status === 'completed' ? '已完成' : scan.status === 'running' ? '扫描中' : '失败'}
                        </Tag>
                      </Space>
                    }
                    description={
                      <div>
                        <div style={{ marginBottom: 8 }}>
                          <Text type="secondary">开始时间: {scan.startTime}</Text>
                        </div>
                        {scan.status === 'running' && (
                          <Progress percent={scan.progress} size="small" />
                        )}
                        {scan.status === 'completed' && scan.vulnerabilityCount > 0 && (
                          <Space>
                            <Text>发现 {scan.vulnerabilityCount} 个漏洞:</Text>
                            {scan.severity.critical > 0 && (
                              <Tag color="red">严重 {scan.severity.critical}</Tag>
                            )}
                            {scan.severity.high > 0 && (
                              <Tag color="orange">高危 {scan.severity.high}</Tag>
                            )}
                            {scan.severity.medium > 0 && (
                              <Tag color="yellow">中危 {scan.severity.medium}</Tag>
                            )}
                            {scan.severity.low > 0 && (
                              <Tag color="green">低危 {scan.severity.low}</Tag>
                            )}
                          </Space>
                        )}
                        {scan.status === 'completed' && scan.vulnerabilityCount === 0 && (
                          <Tag color="green">未发现漏洞</Tag>
                        )}
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      {/* 安全提示 */}
      <Row style={{ marginTop: 24 }}>
        <Col span={24}>
          <Alert
            message="安全提示"
            description="建议定期对项目进行安全扫描，及时发现和修复潜在的安全漏洞。关注严重和高危漏洞，优先处理。"
            type="info"
            showIcon
            closable
          />
        </Col>
      </Row>
    </div>
  )
}

export default Dashboard