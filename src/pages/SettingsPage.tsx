import React, { useState, useEffect } from 'react'
import {
  Card,
  Form,
  Input,
  Switch,
  Select,
  Button,
  Space,
  Typography,
  Row,
  Col,
  Divider,
  InputNumber,
  Radio,
  Slider,
  Upload,
  message,
  Modal,
  List,
  Tag,
  Tooltip,
  Alert,
  Tabs
} from 'antd'
import {
  SettingOutlined,
  SaveOutlined,
  ReloadOutlined,
  ExportOutlined,
  ImportOutlined,
  UploadOutlined,
  FolderOpenOutlined,
  DeleteOutlined,
  PlusOutlined,
  InfoCircleOutlined,
  SecurityScanOutlined,
  BugOutlined,
  FileTextOutlined,
  GlobalOutlined,
  BellOutlined,
  EyeOutlined
} from '@ant-design/icons'
import type { UploadProps } from 'antd'

const { Title, Text, Paragraph } = Typography
const { Option } = Select
const { TextArea } = Input
const { TabPane } = Tabs

interface Settings {
  // 扫描设置
  scan: {
    defaultScanType: 'quick' | 'full' | 'custom'
    maxConcurrentScans: number
    defaultExcludePaths: string[]
    includeTestFiles: boolean
    maxScanDepth: number
    autoSaveReports: boolean
    reportFormat: 'json' | 'xml' | 'html' | 'pdf'
    enableRealTimeScanning: boolean
    scanTimeout: number // 分钟
  }
  // 规则设置
  rules: {
    autoUpdateRules: boolean
    enableCustomRules: boolean
    defaultSeverityFilter: string[]
    ruleUpdateInterval: number // 小时
    customRulesPath: string
  }
  // 通知设置
  notifications: {
    enableDesktopNotifications: boolean
    enableSoundAlerts: boolean
    notifyOnScanComplete: boolean
    notifyOnHighSeverityFound: boolean
    notifyOnScanError: boolean
    emailNotifications: boolean
    emailAddress: string
  }
  // 界面设置
  ui: {
    theme: 'light' | 'dark' | 'auto'
    language: 'zh-CN' | 'en-US'
    fontSize: number
    compactMode: boolean
    showLineNumbers: boolean
    highlightSyntax: boolean
    autoRefreshInterval: number // 秒
  }
  // 性能设置
  performance: {
    maxMemoryUsage: number // MB
    enableCaching: boolean
    cacheSize: number // MB
    enableParallelProcessing: boolean
    maxWorkerThreads: number
    enableGpuAcceleration: boolean
  }
  // 安全设置
  security: {
    enableTelemetry: boolean
    allowRemoteRules: boolean
    encryptReports: boolean
    requireAuthentication: boolean
    sessionTimeout: number // 分钟
    enableAuditLog: boolean
  }
  // 存储设置
  storage: {
    reportsPath: string
    logsPath: string
    cachePath: string
    maxReportHistory: number
    autoCleanup: boolean
    cleanupInterval: number // 天
  }
}

const SettingsPage: React.FC = () => {
  const [form] = Form.useForm()
  const [settings, setSettings] = useState<Settings | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('scan')
  const [importModalVisible, setImportModalVisible] = useState(false)
  const [exportModalVisible, setExportModalVisible] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    setLoading(true)
    // 模拟API调用
    setTimeout(() => {
      const defaultSettings: Settings = {
        scan: {
          defaultScanType: 'quick',
          maxConcurrentScans: 3,
          defaultExcludePaths: ['node_modules', 'dist', 'build', '.git'],
          includeTestFiles: false,
          maxScanDepth: 10,
          autoSaveReports: true,
          reportFormat: 'json',
          enableRealTimeScanning: false,
          scanTimeout: 30
        },
        rules: {
          autoUpdateRules: true,
          enableCustomRules: true,
          defaultSeverityFilter: ['critical', 'high', 'medium'],
          ruleUpdateInterval: 24,
          customRulesPath: './custom-rules'
        },
        notifications: {
          enableDesktopNotifications: true,
          enableSoundAlerts: false,
          notifyOnScanComplete: true,
          notifyOnHighSeverityFound: true,
          notifyOnScanError: true,
          emailNotifications: false,
          emailAddress: ''
        },
        ui: {
          theme: 'light',
          language: 'zh-CN',
          fontSize: 14,
          compactMode: false,
          showLineNumbers: true,
          highlightSyntax: true,
          autoRefreshInterval: 5
        },
        performance: {
          maxMemoryUsage: 1024,
          enableCaching: true,
          cacheSize: 256,
          enableParallelProcessing: true,
          maxWorkerThreads: 4,
          enableGpuAcceleration: false
        },
        security: {
          enableTelemetry: false,
          allowRemoteRules: true,
          encryptReports: false,
          requireAuthentication: false,
          sessionTimeout: 60,
          enableAuditLog: true
        },
        storage: {
          reportsPath: './reports',
          logsPath: './logs',
          cachePath: './cache',
          maxReportHistory: 100,
          autoCleanup: true,
          cleanupInterval: 30
        }
      }
      setSettings(defaultSettings)
      form.setFieldsValue(defaultSettings)
      setLoading(false)
    }, 1000)
  }

  const handleSave = async (values: Settings) => {
    setSaving(true)
    // 模拟API调用
    setTimeout(() => {
      setSettings(values)
      message.success('设置已保存')
      setSaving(false)
    }, 1000)
  }

  const handleReset = () => {
    Modal.confirm({
      title: '重置设置',
      content: '确定要重置所有设置到默认值吗？此操作不可撤销。',
      okText: '确定',
      cancelText: '取消',
      onOk: () => {
        loadSettings()
        message.success('设置已重置')
      }
    })
  }

  const handleExport = () => {
    if (settings) {
      const dataStr = JSON.stringify(settings, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'codeseceval-settings.json'
      link.click()
      URL.revokeObjectURL(url)
      message.success('设置已导出')
    }
  }

  const handleImport: UploadProps['beforeUpload'] = (file) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const importedSettings = JSON.parse(e.target?.result as string)
        form.setFieldsValue(importedSettings)
        message.success('设置已导入')
        setImportModalVisible(false)
      } catch (error) {
        message.error('导入失败：文件格式不正确')
      }
    }
    reader.readAsText(file)
    return false
  }

  const selectFolder = async (fieldName: string) => {
    // 模拟文件夹选择
    const mockPath = '/selected/folder/path'
    form.setFieldValue(fieldName, mockPath)
    message.success('文件夹已选择')
  }

  if (loading || !settings) {
    return (
      <div className="content-body">
        <Card loading={true} style={{ minHeight: 400 }} />
      </div>
    )
  }

  return (
    <div className="content-body">
      <div className="content-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title level={2} style={{ margin: 0 }}>
              <SettingOutlined style={{ marginRight: 8, color: '#722ed1' }} />
              设置
            </Title>
            <Text type="secondary">配置扫描引擎和应用程序设置</Text>
          </div>
          <Space>
            <Button icon={<ImportOutlined />} onClick={() => setImportModalVisible(true)}>
              导入设置
            </Button>
            <Button icon={<ExportOutlined />} onClick={handleExport}>
              导出设置
            </Button>
            <Button icon={<ReloadOutlined />} onClick={handleReset}>
              重置设置
            </Button>
          </Space>
        </div>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSave}
        initialValues={settings}
      >
        <Tabs activeKey={activeTab} onChange={setActiveTab} type="card">
          {/* 扫描设置 */}
          <TabPane
            tab={
              <span>
                <SecurityScanOutlined />
                扫描设置
              </span>
            }
            key="scan"
          >
            <Card className="security-card">
              <Row gutter={[24, 16]}>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="默认扫描类型"
                    name={['scan', 'defaultScanType']}
                    tooltip="新建扫描时的默认类型"
                  >
                    <Radio.Group>
                      <Radio value="quick">快速扫描</Radio>
                      <Radio value="full">全量扫描</Radio>
                      <Radio value="custom">自定义扫描</Radio>
                    </Radio.Group>
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="最大并发扫描数"
                    name={['scan', 'maxConcurrentScans']}
                    tooltip="同时运行的扫描任务数量限制"
                  >
                    <InputNumber min={1} max={10} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  <Form.Item
                    label="默认排除路径"
                    name={['scan', 'defaultExcludePaths']}
                    tooltip="扫描时默认排除的文件夹或文件模式"
                  >
                    <Select
                      mode="tags"
                      style={{ width: '100%' }}
                      placeholder="输入要排除的路径模式"
                      tokenSeparators={[',', ';']}
                    >
                      <Option value="node_modules">node_modules</Option>
                      <Option value="dist">dist</Option>
                      <Option value="build">build</Option>
                      <Option value=".git">.git</Option>
                      <Option value="*.min.js">*.min.js</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="包含测试文件"
                    name={['scan', 'includeTestFiles']}
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="最大扫描深度"
                    name={['scan', 'maxScanDepth']}
                    tooltip="目录遍历的最大深度"
                  >
                    <Slider min={1} max={50} marks={{ 1: '1', 10: '10', 25: '25', 50: '50' }} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="自动保存报告"
                    name={['scan', 'autoSaveReports']}
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="报告格式"
                    name={['scan', 'reportFormat']}
                  >
                    <Select>
                      <Option value="json">JSON</Option>
                      <Option value="xml">XML</Option>
                      <Option value="html">HTML</Option>
                      <Option value="pdf">PDF</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="启用实时扫描"
                    name={['scan', 'enableRealTimeScanning']}
                    valuePropName="checked"
                    tooltip="文件变更时自动触发扫描"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="扫描超时时间（分钟）"
                    name={['scan', 'scanTimeout']}
                  >
                    <InputNumber min={5} max={180} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </TabPane>

          {/* 规则设置 */}
          <TabPane
            tab={
              <span>
                <BugOutlined />
                规则设置
              </span>
            }
            key="rules"
          >
            <Card className="security-card">
              <Row gutter={[24, 16]}>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="自动更新规则"
                    name={['rules', 'autoUpdateRules']}
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="启用自定义规则"
                    name={['rules', 'enableCustomRules']}
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  <Form.Item
                    label="默认严重程度过滤"
                    name={['rules', 'defaultSeverityFilter']}
                    tooltip="默认显示的漏洞严重程度"
                  >
                    <Select mode="multiple" style={{ width: '100%' }}>
                      <Option value="critical">严重</Option>
                      <Option value="high">高危</Option>
                      <Option value="medium">中危</Option>
                      <Option value="low">低危</Option>
                      <Option value="info">信息</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="规则更新间隔（小时）"
                    name={['rules', 'ruleUpdateInterval']}
                  >
                    <InputNumber min={1} max={168} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="自定义规则路径"
                    name={['rules', 'customRulesPath']}
                  >
                    <Input.Group compact>
                      <Input style={{ width: 'calc(100% - 40px)' }} />
                      <Button
                        icon={<FolderOpenOutlined />}
                        onClick={() => selectFolder(['rules', 'customRulesPath'])}
                      />
                    </Input.Group>
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </TabPane>

          {/* 通知设置 */}
          <TabPane
            tab={
              <span>
                <BellOutlined />
                通知设置
              </span>
            }
            key="notifications"
          >
            <Card className="security-card">
              <Row gutter={[24, 16]}>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="启用桌面通知"
                    name={['notifications', 'enableDesktopNotifications']}
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="启用声音提醒"
                    name={['notifications', 'enableSoundAlerts']}
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="扫描完成时通知"
                    name={['notifications', 'notifyOnScanComplete']}
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="发现高危漏洞时通知"
                    name={['notifications', 'notifyOnHighSeverityFound']}
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="扫描错误时通知"
                    name={['notifications', 'notifyOnScanError']}
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="启用邮件通知"
                    name={['notifications', 'emailNotifications']}
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  <Form.Item
                    label="邮箱地址"
                    name={['notifications', 'emailAddress']}
                    rules={[
                      {
                        type: 'email',
                        message: '请输入有效的邮箱地址'
                      }
                    ]}
                  >
                    <Input placeholder="example@domain.com" />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </TabPane>

          {/* 界面设置 */}
          <TabPane
            tab={
              <span>
                <EyeOutlined />
                界面设置
              </span>
            }
            key="ui"
          >
            <Card className="security-card">
              <Row gutter={[24, 16]}>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="主题"
                    name={['ui', 'theme']}
                  >
                    <Radio.Group>
                      <Radio value="light">浅色</Radio>
                      <Radio value="dark">深色</Radio>
                      <Radio value="auto">跟随系统</Radio>
                    </Radio.Group>
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="语言"
                    name={['ui', 'language']}
                  >
                    <Select>
                      <Option value="zh-CN">简体中文</Option>
                      <Option value="en-US">English</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="字体大小"
                    name={['ui', 'fontSize']}
                  >
                    <Slider min={12} max={20} marks={{ 12: '12px', 14: '14px', 16: '16px', 18: '18px', 20: '20px' }} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="紧凑模式"
                    name={['ui', 'compactMode']}
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="显示行号"
                    name={['ui', 'showLineNumbers']}
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="语法高亮"
                    name={['ui', 'highlightSyntax']}
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="自动刷新间隔（秒）"
                    name={['ui', 'autoRefreshInterval']}
                  >
                    <InputNumber min={1} max={60} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </TabPane>

          {/* 存储设置 */}
          <TabPane
            tab={
              <span>
                <FileTextOutlined />
                存储设置
              </span>
            }
            key="storage"
          >
            <Card className="security-card">
              <Row gutter={[24, 16]}>
                <Col xs={24}>
                  <Form.Item
                    label="报告存储路径"
                    name={['storage', 'reportsPath']}
                  >
                    <Input.Group compact>
                      <Input style={{ width: 'calc(100% - 40px)' }} />
                      <Button
                        icon={<FolderOpenOutlined />}
                        onClick={() => selectFolder(['storage', 'reportsPath'])}
                      />
                    </Input.Group>
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="日志存储路径"
                    name={['storage', 'logsPath']}
                  >
                    <Input.Group compact>
                      <Input style={{ width: 'calc(100% - 40px)' }} />
                      <Button
                        icon={<FolderOpenOutlined />}
                        onClick={() => selectFolder(['storage', 'logsPath'])}
                      />
                    </Input.Group>
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="缓存存储路径"
                    name={['storage', 'cachePath']}
                  >
                    <Input.Group compact>
                      <Input style={{ width: 'calc(100% - 40px)' }} />
                      <Button
                        icon={<FolderOpenOutlined />}
                        onClick={() => selectFolder(['storage', 'cachePath'])}
                      />
                    </Input.Group>
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="最大报告历史数量"
                    name={['storage', 'maxReportHistory']}
                  >
                    <InputNumber min={10} max={1000} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="自动清理"
                    name={['storage', 'autoCleanup']}
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="清理间隔（天）"
                    name={['storage', 'cleanupInterval']}
                  >
                    <InputNumber min={1} max={365} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </TabPane>
        </Tabs>

        <Card className="security-card" style={{ marginTop: 16 }}>
          <div style={{ textAlign: 'center' }}>
            <Space size="large">
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={saving}
                size="large"
              >
                保存设置
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={handleReset}
                size="large"
              >
                重置设置
              </Button>
            </Space>
          </div>
        </Card>
      </Form>

      {/* 导入设置模态框 */}
      <Modal
        title="导入设置"
        open={importModalVisible}
        onCancel={() => setImportModalVisible(false)}
        footer={null}
      >
        <Alert
          message="导入设置将覆盖当前所有配置"
          description="请确保导入的文件是有效的设置文件，建议在导入前先导出当前设置作为备份。"
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
        <Upload.Dragger
          accept=".json"
          beforeUpload={handleImport}
          showUploadList={false}
        >
          <p className="ant-upload-drag-icon">
            <UploadOutlined />
          </p>
          <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
          <p className="ant-upload-hint">支持 JSON 格式的设置文件</p>
        </Upload.Dragger>
      </Modal>
    </div>
  )
}

export default SettingsPage