import React, { useState, useEffect } from 'react'
import {
  Card,
  Table,
  Tag,
  Button,
  Input,
  Select,
  Space,
  Typography,
  Row,
  Col,
  Statistic,
  Modal,
  Descriptions,
  Alert,
  Tooltip,
  Badge,
  Divider
} from 'antd'
import {
  BugOutlined,
  ExclamationCircleOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  SearchOutlined,
  FilterOutlined,
  ExportOutlined,
  EyeOutlined,
  FileTextOutlined,
  ClockCircleOutlined
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'

const { Title, Text, Paragraph } = Typography
const { Option } = Select
const { Search } = Input

interface Vulnerability {
  id: string
  ruleId: string
  ruleName: string
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info'
  category: string
  filePath: string
  lineNumber: number
  columnNumber: number
  message: string
  description: string
  cweId?: string
  cvssScore?: number
  recommendation: string
  codeSnippet: string
  scanSessionId: string
  createdAt: string
  status: 'open' | 'fixed' | 'ignored' | 'false_positive'
}

const ReportsPage: React.FC = () => {
  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([])
  const [filteredData, setFilteredData] = useState<Vulnerability[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedVulnerability, setSelectedVulnerability] = useState<Vulnerability | null>(null)
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [filters, setFilters] = useState({
    severity: 'all',
    status: 'all',
    category: 'all',
    search: ''
  })

  useEffect(() => {
    loadVulnerabilities()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [vulnerabilities, filters])

  const loadVulnerabilities = async () => {
    setLoading(true)
    // 模拟API调用
    setTimeout(() => {
      const mockData: Vulnerability[] = [
        {
          id: '1',
          ruleId: 'SEC001',
          ruleName: 'SQL注入检测',
          severity: 'critical',
          category: '注入攻击',
          filePath: '/src/api/user.js',
          lineNumber: 45,
          columnNumber: 12,
          message: '检测到潜在的SQL注入漏洞',
          description: '用户输入直接拼接到SQL查询中，可能导致SQL注入攻击',
          cweId: 'CWE-89',
          cvssScore: 9.8,
          recommendation: '使用参数化查询或预编译语句',
          codeSnippet: 'const query = "SELECT * FROM users WHERE id = " + userId;',
          scanSessionId: 'scan_001',
          createdAt: '2024-01-15 14:30:00',
          status: 'open'
        },
        {
          id: '2',
          ruleId: 'SEC002',
          ruleName: 'XSS漏洞检测',
          severity: 'high',
          category: '跨站脚本',
          filePath: '/src/components/UserProfile.jsx',
          lineNumber: 23,
          columnNumber: 8,
          message: '检测到潜在的XSS漏洞',
          description: '用户输入未经过滤直接渲染到页面',
          cweId: 'CWE-79',
          cvssScore: 7.5,
          recommendation: '对用户输入进行HTML转义或使用安全的渲染方法',
          codeSnippet: '<div dangerouslySetInnerHTML={{__html: userInput}} />',
          scanSessionId: 'scan_001',
          createdAt: '2024-01-15 14:32:00',
          status: 'open'
        },
        {
          id: '3',
          ruleId: 'SEC003',
          ruleName: '硬编码密钥检测',
          severity: 'medium',
          category: '敏感信息泄露',
          filePath: '/src/config/database.js',
          lineNumber: 8,
          columnNumber: 20,
          message: '检测到硬编码的API密钥',
          description: '代码中包含硬编码的敏感信息',
          cweId: 'CWE-798',
          cvssScore: 5.3,
          recommendation: '使用环境变量或配置文件存储敏感信息',
          codeSnippet: 'const apiKey = "sk-1234567890abcdef";',
          scanSessionId: 'scan_001',
          createdAt: '2024-01-15 14:35:00',
          status: 'fixed'
        },
        {
          id: '4',
          ruleId: 'SEC004',
          ruleName: '弱密码策略',
          severity: 'low',
          category: '认证授权',
          filePath: '/src/utils/validation.js',
          lineNumber: 15,
          columnNumber: 25,
          message: '密码复杂度要求过低',
          description: '密码策略不够严格，容易被破解',
          cweId: 'CWE-521',
          cvssScore: 3.1,
          recommendation: '增强密码复杂度要求，包括长度、字符类型等',
          codeSnippet: 'const isValidPassword = password.length >= 6;',
          scanSessionId: 'scan_002',
          createdAt: '2024-01-15 15:10:00',
          status: 'open'
        }
      ]
      setVulnerabilities(mockData)
      setLoading(false)
    }, 1000)
  }

  const applyFilters = () => {
    let filtered = vulnerabilities

    if (filters.severity !== 'all') {
      filtered = filtered.filter(item => item.severity === filters.severity)
    }

    if (filters.status !== 'all') {
      filtered = filtered.filter(item => item.status === filters.status)
    }

    if (filters.category !== 'all') {
      filtered = filtered.filter(item => item.category === filters.category)
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(item =>
        item.ruleName.toLowerCase().includes(searchLower) ||
        item.message.toLowerCase().includes(searchLower) ||
        item.filePath.toLowerCase().includes(searchLower)
      )
    }

    setFilteredData(filtered)
  }

  const getSeverityColor = (severity: string) => {
    const colors = {
      critical: 'red',
      high: 'orange',
      medium: 'yellow',
      low: 'green',
      info: 'blue'
    }
    return colors[severity as keyof typeof colors] || 'default'
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
      case 'high':
        return <WarningOutlined style={{ color: '#fa8c16' }} />
      case 'medium':
        return <InfoCircleOutlined style={{ color: '#fadb14' }} />
      case 'low':
        return <InfoCircleOutlined style={{ color: '#52c41a' }} />
      default:
        return <InfoCircleOutlined style={{ color: '#1890ff' }} />
    }
  }

  const getStatusColor = (status: string) => {
    const colors = {
      open: 'red',
      fixed: 'green',
      ignored: 'gray',
      false_positive: 'orange'
    }
    return colors[status as keyof typeof colors] || 'default'
  }

  const getStatusText = (status: string) => {
    const texts = {
      open: '待修复',
      fixed: '已修复',
      ignored: '已忽略',
      false_positive: '误报'
    }
    return texts[status as keyof typeof texts] || status
  }

  const handleViewDetail = (record: Vulnerability) => {
    setSelectedVulnerability(record)
    setDetailModalVisible(true)
  }

  const handleExport = () => {
    // 导出报告逻辑
    console.log('导出报告')
  }

  const columns: ColumnsType<Vulnerability> = [
    {
      title: '严重程度',
      dataIndex: 'severity',
      key: 'severity',
      width: 100,
      render: (severity: string) => (
        <Tooltip title={severity.toUpperCase()}>
          <Tag color={getSeverityColor(severity)} icon={getSeverityIcon(severity)}>
            {severity.toUpperCase()}
          </Tag>
        </Tooltip>
      ),
      sorter: (a, b) => {
        const order = { critical: 4, high: 3, medium: 2, low: 1, info: 0 }
        return order[a.severity as keyof typeof order] - order[b.severity as keyof typeof order]
      }
    },
    {
      title: '规则名称',
      dataIndex: 'ruleName',
      key: 'ruleName',
      width: 200,
      render: (text: string, record: Vulnerability) => (
        <div>
          <Text strong>{text}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: '12px' }}>{record.ruleId}</Text>
        </div>
      )
    },
    {
      title: '文件位置',
      dataIndex: 'filePath',
      key: 'filePath',
      width: 250,
      render: (text: string, record: Vulnerability) => (
        <div>
          <Text code style={{ fontSize: '12px' }}>{text}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: '12px' }}>
            行 {record.lineNumber}, 列 {record.columnNumber}
          </Text>
        </div>
      )
    },
    {
      title: '问题描述',
      dataIndex: 'message',
      key: 'message',
      ellipsis: true,
      render: (text: string) => (
        <Tooltip title={text}>
          <Text>{text}</Text>
        </Tooltip>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      )
    },
    {
      title: '发现时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (text: string) => (
        <div>
          <ClockCircleOutlined style={{ marginRight: 4 }} />
          <Text style={{ fontSize: '12px' }}>{text}</Text>
        </div>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_, record: Vulnerability) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => handleViewDetail(record)}
        >
          详情
        </Button>
      )
    }
  ]

  const stats = {
    total: vulnerabilities.length,
    critical: vulnerabilities.filter(v => v.severity === 'critical').length,
    high: vulnerabilities.filter(v => v.severity === 'high').length,
    medium: vulnerabilities.filter(v => v.severity === 'medium').length,
    low: vulnerabilities.filter(v => v.severity === 'low').length,
    open: vulnerabilities.filter(v => v.status === 'open').length
  }

  return (
    <div className="content-body">
      <div className="content-header">
        <Title level={2} style={{ margin: 0 }}>
          <BugOutlined style={{ marginRight: 8, color: '#fa8c16' }} />
          漏洞报告
        </Title>
        <Text type="secondary">查看和管理发现的安全漏洞</Text>
      </div>

      {/* 统计信息 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={8} lg={4}>
          <Card className="security-card">
            <Statistic
              title="总计"
              value={stats.total}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={4}>
          <Card className="security-card">
            <Statistic
              title="严重"
              value={stats.critical}
              valueStyle={{ color: '#ff4d4f' }}
              prefix={<ExclamationCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={4}>
          <Card className="security-card">
            <Statistic
              title="高危"
              value={stats.high}
              valueStyle={{ color: '#fa8c16' }}
              prefix={<WarningOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={4}>
          <Card className="security-card">
            <Statistic
              title="中危"
              value={stats.medium}
              valueStyle={{ color: '#fadb14' }}
              prefix={<InfoCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={4}>
          <Card className="security-card">
            <Statistic
              title="低危"
              value={stats.low}
              valueStyle={{ color: '#52c41a' }}
              prefix={<InfoCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={4}>
          <Card className="security-card">
            <Statistic
              title="待修复"
              value={stats.open}
              valueStyle={{ color: '#ff4d4f' }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* 过滤器和搜索 */}
      <Card style={{ marginBottom: 16 }} className="security-card">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={6}>
            <Search
              placeholder="搜索漏洞..."
              allowClear
              prefix={<SearchOutlined />}
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            />
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select
              style={{ width: '100%' }}
              placeholder="严重程度"
              value={filters.severity}
              onChange={(value) => setFilters(prev => ({ ...prev, severity: value }))}
            >
              <Option value="all">全部严重程度</Option>
              <Option value="critical">严重</Option>
              <Option value="high">高危</Option>
              <Option value="medium">中危</Option>
              <Option value="low">低危</Option>
              <Option value="info">信息</Option>
            </Select>
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select
              style={{ width: '100%' }}
              placeholder="状态"
              value={filters.status}
              onChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
            >
              <Option value="all">全部状态</Option>
              <Option value="open">待修复</Option>
              <Option value="fixed">已修复</Option>
              <Option value="ignored">已忽略</Option>
              <Option value="false_positive">误报</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Space>
              <Button icon={<FilterOutlined />}>高级筛选</Button>
              <Button icon={<ExportOutlined />} onClick={handleExport}>
                导出报告
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 漏洞列表 */}
      <Card className="security-card">
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          loading={loading}
          pagination={{
            total: filteredData.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* 详情模态框 */}
      <Modal
        title="漏洞详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>
        ]}
        width={800}
      >
        {selectedVulnerability && (
          <div>
            <Alert
              message={selectedVulnerability.message}
              description={selectedVulnerability.description}
              type={selectedVulnerability.severity === 'critical' || selectedVulnerability.severity === 'high' ? 'error' : 'warning'}
              showIcon
              style={{ marginBottom: 16 }}
            />
            
            <Descriptions bordered column={2}>
              <Descriptions.Item label="规则ID">{selectedVulnerability.ruleId}</Descriptions.Item>
              <Descriptions.Item label="严重程度">
                <Tag color={getSeverityColor(selectedVulnerability.severity)}>
                  {selectedVulnerability.severity.toUpperCase()}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="CWE ID">{selectedVulnerability.cweId || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="CVSS评分">{selectedVulnerability.cvssScore || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="文件路径" span={2}>
                <Text code>{selectedVulnerability.filePath}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="位置">
                行 {selectedVulnerability.lineNumber}, 列 {selectedVulnerability.columnNumber}
              </Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={getStatusColor(selectedVulnerability.status)}>
                  {getStatusText(selectedVulnerability.status)}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
            
            <Divider orientation="left">问题代码</Divider>
            <Card size="small" style={{ backgroundColor: '#f5f5f5' }}>
              <Text code style={{ whiteSpace: 'pre-wrap' }}>
                {selectedVulnerability.codeSnippet}
              </Text>
            </Card>
            
            <Divider orientation="left">修复建议</Divider>
            <Paragraph>
              {selectedVulnerability.recommendation}
            </Paragraph>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default ReportsPage