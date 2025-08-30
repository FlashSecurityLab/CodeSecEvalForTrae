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
  Progress,
  Modal,
  Descriptions,
  List,
  Statistic,
  DatePicker,
  Tooltip,
  Popconfirm,
  message
} from 'antd'
import {
  HistoryOutlined,
  EyeOutlined,
  DeleteOutlined,
  DownloadOutlined,
  SearchOutlined,
  FilterOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  PlayCircleOutlined,
  FileTextOutlined,
  BugOutlined
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'

const { Title, Text } = Typography
const { Option } = Select
const { Search } = Input
const { RangePicker } = DatePicker

interface ScanHistory {
  id: string
  projectPath: string
  projectName: string
  scanType: 'quick' | 'full' | 'custom'
  status: 'running' | 'completed' | 'failed' | 'cancelled'
  progress: number
  startTime: string
  endTime?: string
  duration?: number
  scannedFiles: number
  totalFiles: number
  vulnerabilityCount: number
  severityStats: {
    critical: number
    high: number
    medium: number
    low: number
    info: number
  }
  rulesUsed: string[]
  configSnapshot: any
  reportPath?: string
  errorMessage?: string
}

const HistoryPage: React.FC = () => {
  const [scanHistory, setScanHistory] = useState<ScanHistory[]>([])
  const [filteredHistory, setFilteredHistory] = useState<ScanHistory[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedScan, setSelectedScan] = useState<ScanHistory | null>(null)
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [filters, setFilters] = useState({
    status: 'all',
    scanType: 'all',
    dateRange: null as any,
    search: ''
  })

  useEffect(() => {
    loadScanHistory()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [scanHistory, filters])

  const loadScanHistory = async () => {
    setLoading(true)
    // 模拟API调用
    setTimeout(() => {
      const mockHistory: ScanHistory[] = [
        {
          id: 'scan_001',
          projectPath: '/path/to/project1',
          projectName: 'WebApp Frontend',
          scanType: 'full',
          status: 'completed',
          progress: 100,
          startTime: '2024-01-15 14:30:00',
          endTime: '2024-01-15 14:45:30',
          duration: 930, // 秒
          scannedFiles: 156,
          totalFiles: 156,
          vulnerabilityCount: 12,
          severityStats: {
            critical: 2,
            high: 4,
            medium: 5,
            low: 1,
            info: 0
          },
          rulesUsed: ['SEC001', 'SEC002', 'SEC003', 'SEC004'],
          configSnapshot: {
            excludePaths: ['node_modules', 'dist'],
            includeTests: false,
            maxDepth: 10
          },
          reportPath: '/reports/scan_001.json'
        },
        {
          id: 'scan_002',
          projectPath: '/path/to/project2',
          projectName: 'API Backend',
          scanType: 'quick',
          status: 'completed',
          progress: 100,
          startTime: '2024-01-15 15:45:00',
          endTime: '2024-01-15 15:48:20',
          duration: 200,
          scannedFiles: 45,
          totalFiles: 45,
          vulnerabilityCount: 3,
          severityStats: {
            critical: 0,
            high: 1,
            medium: 2,
            low: 0,
            info: 0
          },
          rulesUsed: ['SEC001', 'SEC002'],
          configSnapshot: {
            excludePaths: ['node_modules'],
            includeTests: true,
            maxDepth: 5
          },
          reportPath: '/reports/scan_002.json'
        },
        {
          id: 'scan_003',
          projectPath: '/path/to/project3',
          projectName: 'Mobile App',
          scanType: 'custom',
          status: 'running',
          progress: 65,
          startTime: '2024-01-15 16:20:00',
          scannedFiles: 89,
          totalFiles: 137,
          vulnerabilityCount: 5,
          severityStats: {
            critical: 1,
            high: 2,
            medium: 2,
            low: 0,
            info: 0
          },
          rulesUsed: ['SEC001', 'SEC002', 'SEC003', 'CUSTOM001'],
          configSnapshot: {
            excludePaths: ['node_modules', 'build'],
            includeTests: false,
            maxDepth: 15
          }
        },
        {
          id: 'scan_004',
          projectPath: '/path/to/project4',
          projectName: 'Legacy System',
          scanType: 'full',
          status: 'failed',
          progress: 30,
          startTime: '2024-01-15 13:20:00',
          endTime: '2024-01-15 13:25:45',
          duration: 345,
          scannedFiles: 23,
          totalFiles: 78,
          vulnerabilityCount: 0,
          severityStats: {
            critical: 0,
            high: 0,
            medium: 0,
            low: 0,
            info: 0
          },
          rulesUsed: ['SEC001', 'SEC002', 'SEC003'],
          configSnapshot: {
            excludePaths: ['node_modules'],
            includeTests: true,
            maxDepth: 20
          },
          errorMessage: '文件访问权限不足'
        },
        {
          id: 'scan_005',
          projectPath: '/path/to/project1',
          projectName: 'WebApp Frontend',
          scanType: 'quick',
          status: 'completed',
          progress: 100,
          startTime: '2024-01-14 09:15:00',
          endTime: '2024-01-14 09:17:30',
          duration: 150,
          scannedFiles: 89,
          totalFiles: 89,
          vulnerabilityCount: 8,
          severityStats: {
            critical: 1,
            high: 3,
            medium: 3,
            low: 1,
            info: 0
          },
          rulesUsed: ['SEC001', 'SEC002'],
          configSnapshot: {
            excludePaths: ['node_modules', 'dist'],
            includeTests: false,
            maxDepth: 5
          },
          reportPath: '/reports/scan_005.json'
        }
      ]
      setScanHistory(mockHistory)
      setLoading(false)
    }, 1000)
  }

  const applyFilters = () => {
    let filtered = scanHistory

    if (filters.status !== 'all') {
      filtered = filtered.filter(scan => scan.status === filters.status)
    }

    if (filters.scanType !== 'all') {
      filtered = filtered.filter(scan => scan.scanType === filters.scanType)
    }

    if (filters.dateRange && filters.dateRange.length === 2) {
      const [start, end] = filters.dateRange
      filtered = filtered.filter(scan => {
        const scanDate = dayjs(scan.startTime)
        return scanDate.isAfter(start.startOf('day')) && scanDate.isBefore(end.endOf('day'))
      })
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(scan =>
        scan.projectName.toLowerCase().includes(searchLower) ||
        scan.projectPath.toLowerCase().includes(searchLower) ||
        scan.id.toLowerCase().includes(searchLower)
      )
    }

    setFilteredHistory(filtered)
  }

  const getStatusColor = (status: string) => {
    const colors = {
      running: 'blue',
      completed: 'green',
      failed: 'red',
      cancelled: 'orange'
    }
    return colors[status as keyof typeof colors] || 'default'
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <PlayCircleOutlined style={{ color: '#1890ff' }} />
      case 'completed':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />
      case 'failed':
        return <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
      case 'cancelled':
        return <ClockCircleOutlined style={{ color: '#fa8c16' }} />
      default:
        return null
    }
  }

  const getScanTypeText = (type: string) => {
    const types = {
      quick: '快速扫描',
      full: '全量扫描',
      custom: '自定义扫描'
    }
    return types[type as keyof typeof types] || type
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}分${secs}秒`
  }

  const handleViewDetail = (scan: ScanHistory) => {
    setSelectedScan(scan)
    setDetailModalVisible(true)
  }

  const handleDeleteScan = (scanId: string) => {
    setScanHistory(prev => prev.filter(scan => scan.id !== scanId))
    message.success('扫描记录已删除')
  }

  const handleDownloadReport = (scan: ScanHistory) => {
    if (scan.reportPath) {
      // 下载报告逻辑
      message.success('报告下载已开始')
    } else {
      message.warning('该扫描没有可用的报告')
    }
  }

  const columns: ColumnsType<ScanHistory> = [
    {
      title: '项目名称',
      dataIndex: 'projectName',
      key: 'projectName',
      width: 200,
      render: (text: string, record: ScanHistory) => (
        <div>
          <Text strong>{text}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.projectPath.split('/').pop()}
          </Text>
        </div>
      )
    },
    {
      title: '扫描类型',
      dataIndex: 'scanType',
      key: 'scanType',
      width: 120,
      render: (type: string) => (
        <Tag color="blue">{getScanTypeText(type)}</Tag>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string, record: ScanHistory) => (
        <div>
          <Tag color={getStatusColor(status)} icon={getStatusIcon(status)}>
            {status === 'running' ? '扫描中' :
             status === 'completed' ? '已完成' :
             status === 'failed' ? '失败' : '已取消'}
          </Tag>
          {status === 'running' && (
            <div style={{ marginTop: 4 }}>
              <Progress percent={record.progress} size="small" />
            </div>
          )}
        </div>
      )
    },
    {
      title: '扫描结果',
      key: 'result',
      width: 200,
      render: (_, record: ScanHistory) => (
        <div>
          <div style={{ marginBottom: 4 }}>
            <Text>文件: {record.scannedFiles}/{record.totalFiles}</Text>
          </div>
          {record.vulnerabilityCount > 0 ? (
            <Space size={4}>
              {record.severityStats.critical > 0 && (
                <Tag color="red" size="small">严重 {record.severityStats.critical}</Tag>
              )}
              {record.severityStats.high > 0 && (
                <Tag color="orange" size="small">高危 {record.severityStats.high}</Tag>
              )}
              {record.severityStats.medium > 0 && (
                <Tag color="yellow" size="small">中危 {record.severityStats.medium}</Tag>
              )}
              {record.severityStats.low > 0 && (
                <Tag color="green" size="small">低危 {record.severityStats.low}</Tag>
              )}
            </Space>
          ) : (
            <Tag color="green" size="small">无漏洞</Tag>
          )}
        </div>
      )
    },
    {
      title: '开始时间',
      dataIndex: 'startTime',
      key: 'startTime',
      width: 150,
      render: (time: string) => (
        <div>
          <div>{time.split(' ')[0]}</div>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {time.split(' ')[1]}
          </Text>
        </div>
      )
    },
    {
      title: '耗时',
      dataIndex: 'duration',
      key: 'duration',
      width: 100,
      render: (duration: number, record: ScanHistory) => {
        if (record.status === 'running') {
          const elapsed = Math.floor((Date.now() - new Date(record.startTime).getTime()) / 1000)
          return <Text type="secondary">{formatDuration(elapsed)}</Text>
        }
        return duration ? formatDuration(duration) : '-'
      }
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record: ScanHistory) => (
        <Space size="small">
          <Tooltip title="查看详情">
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetail(record)}
            />
          </Tooltip>
          {record.reportPath && (
            <Tooltip title="下载报告">
              <Button
                type="link"
                icon={<DownloadOutlined />}
                onClick={() => handleDownloadReport(record)}
              />
            </Tooltip>
          )}
          <Popconfirm
            title="确定要删除这条扫描记录吗？"
            onConfirm={() => handleDeleteScan(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Tooltip title="删除记录">
              <Button
                type="link"
                danger
                icon={<DeleteOutlined />}
                disabled={record.status === 'running'}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      )
    }
  ]

  const stats = {
    total: scanHistory.length,
    completed: scanHistory.filter(s => s.status === 'completed').length,
    running: scanHistory.filter(s => s.status === 'running').length,
    failed: scanHistory.filter(s => s.status === 'failed').length,
    totalVulnerabilities: scanHistory.reduce((sum, s) => sum + s.vulnerabilityCount, 0)
  }

  return (
    <div className="content-body">
      <div className="content-header">
        <Title level={2} style={{ margin: 0 }}>
          <HistoryOutlined style={{ marginRight: 8, color: '#722ed1' }} />
          扫描历史
        </Title>
        <Text type="secondary">查看和管理历史扫描记录</Text>
      </div>

      {/* 统计信息 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6} lg={4}>
          <Card className="security-card">
            <Statistic
              title="总扫描次数"
              value={stats.total}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={4}>
          <Card className="security-card">
            <Statistic
              title="已完成"
              value={stats.completed}
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={4}>
          <Card className="security-card">
            <Statistic
              title="进行中"
              value={stats.running}
              valueStyle={{ color: '#1890ff' }}
              prefix={<PlayCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={4}>
          <Card className="security-card">
            <Statistic
              title="失败"
              value={stats.failed}
              valueStyle={{ color: '#ff4d4f' }}
              prefix={<ExclamationCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card className="security-card">
            <Statistic
              title="累计发现漏洞"
              value={stats.totalVulnerabilities}
              valueStyle={{ color: '#fa8c16' }}
              prefix={<BugOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* 过滤器 */}
      <Card style={{ marginBottom: 16 }} className="security-card">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={6}>
            <Search
              placeholder="搜索项目或扫描ID..."
              allowClear
              prefix={<SearchOutlined />}
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            />
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select
              style={{ width: '100%' }}
              placeholder="状态"
              value={filters.status}
              onChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
            >
              <Option value="all">全部状态</Option>
              <Option value="completed">已完成</Option>
              <Option value="running">进行中</Option>
              <Option value="failed">失败</Option>
              <Option value="cancelled">已取消</Option>
            </Select>
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select
              style={{ width: '100%' }}
              placeholder="扫描类型"
              value={filters.scanType}
              onChange={(value) => setFilters(prev => ({ ...prev, scanType: value }))}
            >
              <Option value="all">全部类型</Option>
              <Option value="quick">快速扫描</Option>
              <Option value="full">全量扫描</Option>
              <Option value="custom">自定义扫描</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <RangePicker
              style={{ width: '100%' }}
              placeholder={['开始日期', '结束日期']}
              value={filters.dateRange}
              onChange={(dates) => setFilters(prev => ({ ...prev, dateRange: dates }))}
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Button
              icon={<FilterOutlined />}
              onClick={() => setFilters({ status: 'all', scanType: 'all', dateRange: null, search: '' })}
            >
              重置筛选
            </Button>
          </Col>
        </Row>
      </Card>

      {/* 历史记录表格 */}
      <Card className="security-card">
        <Table
          columns={columns}
          dataSource={filteredHistory}
          rowKey="id"
          loading={loading}
          pagination={{
            total: filteredHistory.length,
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
        title="扫描详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>,
          selectedScan?.reportPath && (
            <Button key="download" type="primary" icon={<DownloadOutlined />}>
              下载报告
            </Button>
          )
        ]}
        width={800}
      >
        {selectedScan && (
          <div>
            <Descriptions bordered column={2} style={{ marginBottom: 16 }}>
              <Descriptions.Item label="扫描ID">{selectedScan.id}</Descriptions.Item>
              <Descriptions.Item label="项目名称">{selectedScan.projectName}</Descriptions.Item>
              <Descriptions.Item label="项目路径" span={2}>
                <Text code>{selectedScan.projectPath}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="扫描类型">
                <Tag color="blue">{getScanTypeText(selectedScan.scanType)}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={getStatusColor(selectedScan.status)} icon={getStatusIcon(selectedScan.status)}>
                  {selectedScan.status === 'running' ? '扫描中' :
                   selectedScan.status === 'completed' ? '已完成' :
                   selectedScan.status === 'failed' ? '失败' : '已取消'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="开始时间">{selectedScan.startTime}</Descriptions.Item>
              <Descriptions.Item label="结束时间">{selectedScan.endTime || '进行中'}</Descriptions.Item>
              <Descriptions.Item label="扫描文件">
                {selectedScan.scannedFiles}/{selectedScan.totalFiles}
              </Descriptions.Item>
              <Descriptions.Item label="发现漏洞">{selectedScan.vulnerabilityCount}</Descriptions.Item>
            </Descriptions>

            {selectedScan.errorMessage && (
              <div style={{ marginBottom: 16 }}>
                <Text type="danger">错误信息: {selectedScan.errorMessage}</Text>
              </div>
            )}

            {selectedScan.vulnerabilityCount > 0 && (
              <div style={{ marginBottom: 16 }}>
                <Text strong>漏洞分布:</Text>
                <div style={{ marginTop: 8 }}>
                  <Space>
                    {selectedScan.severityStats.critical > 0 && (
                      <Tag color="red">严重 {selectedScan.severityStats.critical}</Tag>
                    )}
                    {selectedScan.severityStats.high > 0 && (
                      <Tag color="orange">高危 {selectedScan.severityStats.high}</Tag>
                    )}
                    {selectedScan.severityStats.medium > 0 && (
                      <Tag color="yellow">中危 {selectedScan.severityStats.medium}</Tag>
                    )}
                    {selectedScan.severityStats.low > 0 && (
                      <Tag color="green">低危 {selectedScan.severityStats.low}</Tag>
                    )}
                    {selectedScan.severityStats.info > 0 && (
                      <Tag color="blue">信息 {selectedScan.severityStats.info}</Tag>
                    )}
                  </Space>
                </div>
              </div>
            )}

            <div style={{ marginBottom: 16 }}>
              <Text strong>使用规则:</Text>
              <div style={{ marginTop: 8 }}>
                <Space wrap>
                  {selectedScan.rulesUsed.map(ruleId => (
                    <Tag key={ruleId}>{ruleId}</Tag>
                  ))}
                </Space>
              </div>
            </div>

            <div>
              <Text strong>扫描配置:</Text>
              <div style={{ marginTop: 8, backgroundColor: '#f5f5f5', padding: 12, borderRadius: 4 }}>
                <Text code style={{ whiteSpace: 'pre-wrap' }}>
                  {JSON.stringify(selectedScan.configSnapshot, null, 2)}
                </Text>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default HistoryPage