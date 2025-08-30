import React, { useState } from 'react'
import {
  Card,
  Button,
  Form,
  Input,
  Select,
  Switch,
  Progress,
  Typography,
  Space,
  Row,
  Col,
  Alert,
  Divider,
  Tag,
  List,
  message
} from 'antd'
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  StopOutlined,
  FolderOpenOutlined,
  SettingOutlined,
  ClockCircleOutlined,
  FileTextOutlined
} from '@ant-design/icons'

const { Title, Text } = Typography
const { Option } = Select
const { TextArea } = Input

interface ScanConfig {
  projectPath: string
  scanType: 'quick' | 'full' | 'custom'
  languages: string[]
  excludePaths: string[]
  includeTests: boolean
  maxDepth: number
  rules: string[]
}

interface ScanProgress {
  isScanning: boolean
  progress: number
  currentFile: string
  scannedFiles: number
  totalFiles: number
  foundIssues: number
  elapsedTime: number
}

const ScanPage: React.FC = () => {
  const [form] = Form.useForm()
  const [scanConfig, setScanConfig] = useState<ScanConfig>({
    projectPath: '',
    scanType: 'quick',
    languages: ['javascript', 'typescript'],
    excludePaths: ['node_modules', 'dist', 'build'],
    includeTests: false,
    maxDepth: 10,
    rules: ['all']
  })
  
  const [scanProgress, setScanProgress] = useState<ScanProgress>({
    isScanning: false,
    progress: 0,
    currentFile: '',
    scannedFiles: 0,
    totalFiles: 0,
    foundIssues: 0,
    elapsedTime: 0
  })

  const [recentLogs, setRecentLogs] = useState<string[]>([])

  const supportedLanguages = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'csharp', label: 'C#' },
    { value: 'cpp', label: 'C++' },
    { value: 'go', label: 'Go' },
    { value: 'rust', label: 'Rust' },
    { value: 'php', label: 'PHP' },
    { value: 'ruby', label: 'Ruby' }
  ]

  const scanTypes = [
    { value: 'quick', label: '快速扫描', description: '扫描常见安全问题，速度快' },
    { value: 'full', label: '全量扫描', description: '深度扫描所有规则，覆盖全面' },
    { value: 'custom', label: '自定义扫描', description: '根据配置进行定制化扫描' }
  ]

  const handleSelectProject = async () => {
    if (window.electronAPI) {
      try {
        const result = await window.electronAPI.openProjectDialog()
        if (result) {
          setScanConfig(prev => ({ ...prev, projectPath: result }))
          form.setFieldsValue({ projectPath: result })
          message.success('项目路径已选择')
        }
      } catch (error) {
        message.error('选择项目失败')
      }
    }
  }

  const handleStartScan = () => {
    form.validateFields().then(values => {
      setScanProgress({
        isScanning: true,
        progress: 0,
        currentFile: '',
        scannedFiles: 0,
        totalFiles: 100, // 模拟总文件数
        foundIssues: 0,
        elapsedTime: 0
      })
      
      setRecentLogs(['扫描开始...', '正在分析项目结构...'])
      
      // 模拟扫描进度
      const interval = setInterval(() => {
        setScanProgress(prev => {
          if (prev.progress >= 100) {
            clearInterval(interval)
            setRecentLogs(logs => [...logs, '扫描完成!'])
            message.success('扫描完成')
            return { ...prev, isScanning: false }
          }
          
          const newProgress = prev.progress + Math.random() * 10
          const newScannedFiles = Math.floor((newProgress / 100) * prev.totalFiles)
          
          setRecentLogs(logs => {
            const newLog = `正在扫描: file_${newScannedFiles}.js`
            return [...logs.slice(-10), newLog] // 保持最近10条日志
          })
          
          return {
            ...prev,
            progress: Math.min(newProgress, 100),
            currentFile: `file_${newScannedFiles}.js`,
            scannedFiles: newScannedFiles,
            foundIssues: Math.floor(Math.random() * 5),
            elapsedTime: prev.elapsedTime + 1
          }
        })
      }, 1000)
      
      message.info('扫描已开始')
    })
  }

  const handleStopScan = () => {
    setScanProgress(prev => ({ ...prev, isScanning: false }))
    setRecentLogs(logs => [...logs, '扫描已停止'])
    message.warning('扫描已停止')
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="content-body">
      <div className="content-header">
        <Title level={2} style={{ margin: 0 }}>
          <PlayCircleOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          扫描管理
        </Title>
        <Text type="secondary">配置和执行代码安全扫描任务</Text>
      </div>

      <Row gutter={[16, 16]}>
        {/* 扫描配置 */}
        <Col xs={24} lg={12}>
          <Card title="扫描配置" className="security-card">
            <Form
              form={form}
              layout="vertical"
              initialValues={scanConfig}
              onValuesChange={(_, allValues) => setScanConfig(allValues)}
            >
              <Form.Item
                label="项目路径"
                name="projectPath"
                rules={[{ required: true, message: '请选择项目路径' }]}
              >
                <Input
                  placeholder="选择要扫描的项目路径"
                  readOnly
                  suffix={
                    <Button
                      type="text"
                      icon={<FolderOpenOutlined />}
                      onClick={handleSelectProject}
                    />
                  }
                />
              </Form.Item>

              <Form.Item label="扫描类型" name="scanType">
                <Select>
                  {scanTypes.map(type => (
                    <Option key={type.value} value={type.value}>
                      <div>
                        <div>{type.label}</div>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          {type.description}
                        </Text>
                      </div>
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item label="支持语言" name="languages">
                <Select mode="multiple" placeholder="选择要扫描的编程语言">
                  {supportedLanguages.map(lang => (
                    <Option key={lang.value} value={lang.value}>
                      {lang.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item label="排除路径" name="excludePaths">
                <Select
                  mode="tags"
                  placeholder="输入要排除的路径或文件夹"
                  style={{ width: '100%' }}
                />
              </Form.Item>

              <Form.Item label="包含测试文件" name="includeTests" valuePropName="checked">
                <Switch />
              </Form.Item>

              <Form.Item label="最大扫描深度" name="maxDepth">
                <Select>
                  <Option value={5}>5 层</Option>
                  <Option value={10}>10 层</Option>
                  <Option value={20}>20 层</Option>
                  <Option value={-1}>无限制</Option>
                </Select>
              </Form.Item>
            </Form>

            <Divider />

            <Space>
              <Button
                type="primary"
                icon={<PlayCircleOutlined />}
                onClick={handleStartScan}
                disabled={scanProgress.isScanning || !scanConfig.projectPath}
                loading={scanProgress.isScanning}
              >
                开始扫描
              </Button>
              
              {scanProgress.isScanning && (
                <Button
                  danger
                  icon={<StopOutlined />}
                  onClick={handleStopScan}
                >
                  停止扫描
                </Button>
              )}
              
              <Button icon={<SettingOutlined />}>
                高级设置
              </Button>
            </Space>
          </Card>
        </Col>

        {/* 扫描进度 */}
        <Col xs={24} lg={12}>
          <Card title="扫描进度" className="security-card">
            {scanProgress.isScanning ? (
              <div>
                <Progress
                  percent={Math.round(scanProgress.progress)}
                  status="active"
                  strokeColor={{
                    '0%': '#108ee9',
                    '100%': '#87d068',
                  }}
                />
                
                <Row gutter={16} style={{ marginTop: 16 }}>
                  <Col span={12}>
                    <Text type="secondary">当前文件:</Text>
                    <br />
                    <Text code>{scanProgress.currentFile || '准备中...'}</Text>
                  </Col>
                  <Col span={12}>
                    <Text type="secondary">已用时间:</Text>
                    <br />
                    <Text><ClockCircleOutlined /> {formatTime(scanProgress.elapsedTime)}</Text>
                  </Col>
                </Row>
                
                <Row gutter={16} style={{ marginTop: 16 }}>
                  <Col span={8}>
                    <Text type="secondary">已扫描:</Text>
                    <br />
                    <Text strong>{scanProgress.scannedFiles}/{scanProgress.totalFiles}</Text>
                  </Col>
                  <Col span={8}>
                    <Text type="secondary">发现问题:</Text>
                    <br />
                    <Text strong style={{ color: '#fa8c16' }}>{scanProgress.foundIssues}</Text>
                  </Col>
                  <Col span={8}>
                    <Text type="secondary">完成度:</Text>
                    <br />
                    <Text strong>{Math.round(scanProgress.progress)}%</Text>
                  </Col>
                </Row>
              </div>
            ) : (
              <Alert
                message="等待扫描"
                description="配置扫描参数后点击开始扫描按钮"
                type="info"
                showIcon
              />
            )}
          </Card>

          {/* 扫描日志 */}
          <Card title="扫描日志" style={{ marginTop: 16 }} className="security-card">
            <div style={{ height: 200, overflow: 'auto' }}>
              <List
                size="small"
                dataSource={recentLogs}
                renderItem={(log, index) => (
                  <List.Item style={{ padding: '4px 0' }}>
                    <Text code style={{ fontSize: '12px' }}>
                      [{new Date().toLocaleTimeString()}] {log}
                    </Text>
                  </List.Item>
                )}
              />
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default ScanPage