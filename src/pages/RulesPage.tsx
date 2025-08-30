import React, { useState, useEffect } from 'react'
import {
  Card,
  Table,
  Button,
  Switch,
  Tag,
  Input,
  Select,
  Space,
  Typography,
  Row,
  Col,
  Modal,
  Form,
  InputNumber,
  Radio,
  Divider,
  Alert,
  Tooltip,
  Badge,
  Tabs,
  message
} from 'antd'
import {
  SettingOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  FilterOutlined,
  ImportOutlined,
  ExportOutlined,
  InfoCircleOutlined,
  SecurityScanOutlined,
  CodeOutlined
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'

const { Title, Text, Paragraph } = Typography
const { Option } = Select
const { Search } = Input
const { TextArea } = Input
const { TabPane } = Tabs

interface SecurityRule {
  id: string
  name: string
  description: string
  category: string
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info'
  enabled: boolean
  languages: string[]
  pattern: string
  patternType: 'regex' | 'ast' | 'semantic'
  cweId?: string
  recommendation: string
  examples: {
    vulnerable: string
    secure: string
  }
  tags: string[]
  customizable: boolean
  builtIn: boolean
  createdAt: string
  updatedAt: string
}

interface RuleSet {
  id: string
  name: string
  description: string
  rules: string[]
  isDefault: boolean
  createdAt: string
}

const RulesPage: React.FC = () => {
  const [rules, setRules] = useState<SecurityRule[]>([])
  const [ruleSets, setRuleSets] = useState<RuleSet[]>([])
  const [filteredRules, setFilteredRules] = useState<SecurityRule[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedRule, setSelectedRule] = useState<SecurityRule | null>(null)
  const [ruleModalVisible, setRuleModalVisible] = useState(false)
  const [ruleSetModalVisible, setRuleSetModalVisible] = useState(false)
  const [activeTab, setActiveTab] = useState('rules')
  const [form] = Form.useForm()
  const [ruleSetForm] = Form.useForm()
  const [filters, setFilters] = useState({
    category: 'all',
    severity: 'all',
    language: 'all',
    enabled: 'all',
    search: ''
  })

  useEffect(() => {
    loadRules()
    loadRuleSets()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [rules, filters])

  const loadRules = async () => {
    setLoading(true)
    // 模拟API调用
    setTimeout(() => {
      const mockRules: SecurityRule[] = [
        {
          id: 'SEC001',
          name: 'SQL注入检测',
          description: '检测潜在的SQL注入漏洞',
          category: '注入攻击',
          severity: 'critical',
          enabled: true,
          languages: ['javascript', 'typescript', 'python', 'java'],
          pattern: '(SELECT|INSERT|UPDATE|DELETE).*\\+.*',
          patternType: 'regex',
          cweId: 'CWE-89',
          recommendation: '使用参数化查询或预编译语句',
          examples: {
            vulnerable: 'const query = "SELECT * FROM users WHERE id = " + userId;',
            secure: 'const query = "SELECT * FROM users WHERE id = ?"; db.query(query, [userId]);'
          },
          tags: ['injection', 'database', 'security'],
          customizable: true,
          builtIn: true,
          createdAt: '2024-01-01 10:00:00',
          updatedAt: '2024-01-15 14:30:00'
        },
        {
          id: 'SEC002',
          name: 'XSS漏洞检测',
          description: '检测跨站脚本攻击漏洞',
          category: '跨站脚本',
          severity: 'high',
          enabled: true,
          languages: ['javascript', 'typescript', 'jsx', 'tsx'],
          pattern: 'dangerouslySetInnerHTML',
          patternType: 'regex',
          cweId: 'CWE-79',
          recommendation: '对用户输入进行HTML转义或使用安全的渲染方法',
          examples: {
            vulnerable: '<div dangerouslySetInnerHTML={{__html: userInput}} />',
            secure: '<div>{userInput}</div> // React会自动转义'
          },
          tags: ['xss', 'frontend', 'react'],
          customizable: true,
          builtIn: true,
          createdAt: '2024-01-01 10:00:00',
          updatedAt: '2024-01-10 09:15:00'
        },
        {
          id: 'SEC003',
          name: '硬编码密钥检测',
          description: '检测代码中的硬编码敏感信息',
          category: '敏感信息泄露',
          severity: 'medium',
          enabled: true,
          languages: ['javascript', 'typescript', 'python', 'java', 'csharp'],
          pattern: '(api_key|apikey|secret|password|token)\\s*=\\s*["\'][^"\']+["\']',
          patternType: 'regex',
          cweId: 'CWE-798',
          recommendation: '使用环境变量或配置文件存储敏感信息',
          examples: {
            vulnerable: 'const apiKey = "sk-1234567890abcdef";',
            secure: 'const apiKey = process.env.API_KEY;'
          },
          tags: ['secrets', 'hardcoded', 'credentials'],
          customizable: true,
          builtIn: true,
          createdAt: '2024-01-01 10:00:00',
          updatedAt: '2024-01-08 16:45:00'
        },
        {
          id: 'SEC004',
          name: '弱密码策略',
          description: '检测弱密码验证逻辑',
          category: '认证授权',
          severity: 'low',
          enabled: false,
          languages: ['javascript', 'typescript', 'python'],
          pattern: 'password\\.length\\s*[<>=]+\\s*[1-6]',
          patternType: 'regex',
          cweId: 'CWE-521',
          recommendation: '增强密码复杂度要求',
          examples: {
            vulnerable: 'const isValid = password.length >= 6;',
            secure: 'const isValid = password.length >= 12 && /[A-Z]/.test(password) && /[0-9]/.test(password);'
          },
          tags: ['password', 'authentication', 'weak'],
          customizable: true,
          builtIn: true,
          createdAt: '2024-01-01 10:00:00',
          updatedAt: '2024-01-05 11:20:00'
        },
        {
          id: 'CUSTOM001',
          name: '自定义API调用检查',
          description: '检查特定API的使用方式',
          category: '自定义规则',
          severity: 'info',
          enabled: true,
          languages: ['javascript', 'typescript'],
          pattern: 'fetch\\([^)]*\\)',
          patternType: 'regex',
          recommendation: '确保API调用包含适当的错误处理',
          examples: {
            vulnerable: 'fetch("/api/data")',
            secure: 'fetch("/api/data").catch(error => console.error(error))'
          },
          tags: ['api', 'custom', 'error-handling'],
          customizable: true,
          builtIn: false,
          createdAt: '2024-01-10 14:30:00',
          updatedAt: '2024-01-10 14:30:00'
        }
      ]
      setRules(mockRules)
      setLoading(false)
    }, 1000)
  }

  const loadRuleSets = async () => {
    const mockRuleSets: RuleSet[] = [
      {
        id: 'default',
        name: '默认规则集',
        description: '包含所有推荐的安全规则',
        rules: ['SEC001', 'SEC002', 'SEC003'],
        isDefault: true,
        createdAt: '2024-01-01 10:00:00'
      },
      {
        id: 'web',
        name: 'Web应用规则集',
        description: '专门针对Web应用的安全规则',
        rules: ['SEC001', 'SEC002'],
        isDefault: false,
        createdAt: '2024-01-05 15:30:00'
      },
      {
        id: 'strict',
        name: '严格规则集',
        description: '包含所有规则的严格检查',
        rules: ['SEC001', 'SEC002', 'SEC003', 'SEC004', 'CUSTOM001'],
        isDefault: false,
        createdAt: '2024-01-08 09:15:00'
      }
    ]
    setRuleSets(mockRuleSets)
  }

  const applyFilters = () => {
    let filtered = rules

    if (filters.category !== 'all') {
      filtered = filtered.filter(rule => rule.category === filters.category)
    }

    if (filters.severity !== 'all') {
      filtered = filtered.filter(rule => rule.severity === filters.severity)
    }

    if (filters.language !== 'all') {
      filtered = filtered.filter(rule => rule.languages.includes(filters.language))
    }

    if (filters.enabled !== 'all') {
      const isEnabled = filters.enabled === 'enabled'
      filtered = filtered.filter(rule => rule.enabled === isEnabled)
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(rule =>
        rule.name.toLowerCase().includes(searchLower) ||
        rule.description.toLowerCase().includes(searchLower) ||
        rule.tags.some(tag => tag.toLowerCase().includes(searchLower))
      )
    }

    setFilteredRules(filtered)
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

  const handleToggleRule = (ruleId: string, enabled: boolean) => {
    setRules(prev => prev.map(rule =>
      rule.id === ruleId ? { ...rule, enabled } : rule
    ))
    message.success(`规则已${enabled ? '启用' : '禁用'}`)
  }

  const handleEditRule = (rule: SecurityRule) => {
    setSelectedRule(rule)
    form.setFieldsValue(rule)
    setRuleModalVisible(true)
  }

  const handleDeleteRule = (ruleId: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个规则吗？此操作不可撤销。',
      onOk: () => {
        setRules(prev => prev.filter(rule => rule.id !== ruleId))
        message.success('规则已删除')
      }
    })
  }

  const handleSaveRule = async (values: any) => {
    try {
      if (selectedRule) {
        // 更新规则
        setRules(prev => prev.map(rule =>
          rule.id === selectedRule.id ? { ...rule, ...values, updatedAt: new Date().toLocaleString() } : rule
        ))
        message.success('规则已更新')
      } else {
        // 新建规则
        const newRule: SecurityRule = {
          ...values,
          id: `CUSTOM${Date.now()}`,
          builtIn: false,
          createdAt: new Date().toLocaleString(),
          updatedAt: new Date().toLocaleString()
        }
        setRules(prev => [...prev, newRule])
        message.success('规则已创建')
      }
      setRuleModalVisible(false)
      setSelectedRule(null)
      form.resetFields()
    } catch (error) {
      message.error('保存失败')
    }
  }

  const columns: ColumnsType<SecurityRule> = [
    {
      title: '状态',
      dataIndex: 'enabled',
      key: 'enabled',
      width: 80,
      render: (enabled: boolean, record: SecurityRule) => (
        <Switch
          checked={enabled}
          onChange={(checked) => handleToggleRule(record.id, checked)}
          size="small"
        />
      )
    },
    {
      title: '规则名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (text: string, record: SecurityRule) => (
        <div>
          <Text strong>{text}</Text>
          {record.builtIn && <Badge count="内置" style={{ marginLeft: 8, backgroundColor: '#52c41a' }} />}
          <br />
          <Text type="secondary" style={{ fontSize: '12px' }}>{record.id}</Text>
        </div>
      )
    },
    {
      title: '类别',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      render: (category: string) => <Tag>{category}</Tag>
    },
    {
      title: '严重程度',
      dataIndex: 'severity',
      key: 'severity',
      width: 100,
      render: (severity: string) => (
        <Tag color={getSeverityColor(severity)}>
          {severity.toUpperCase()}
        </Tag>
      )
    },
    {
      title: '支持语言',
      dataIndex: 'languages',
      key: 'languages',
      width: 200,
      render: (languages: string[]) => (
        <div>
          {languages.slice(0, 3).map(lang => (
            <Tag key={lang} size="small">{lang}</Tag>
          ))}
          {languages.length > 3 && (
            <Tooltip title={languages.slice(3).join(', ')}>
              <Tag size="small">+{languages.length - 3}</Tag>
            </Tooltip>
          )}
        </div>
      )
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (text: string) => (
        <Tooltip title={text}>
          <Text>{text}</Text>
        </Tooltip>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_, record: SecurityRule) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEditRule(record)}
            disabled={record.builtIn && !record.customizable}
          />
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteRule(record.id)}
            disabled={record.builtIn}
          />
        </Space>
      )
    }
  ]

  const ruleSetColumns: ColumnsType<RuleSet> = [
    {
      title: '规则集名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: RuleSet) => (
        <div>
          <Text strong>{text}</Text>
          {record.isDefault && <Badge count="默认" style={{ marginLeft: 8, backgroundColor: '#1890ff' }} />}
          <br />
          <Text type="secondary" style={{ fontSize: '12px' }}>{record.description}</Text>
        </div>
      )
    },
    {
      title: '包含规则',
      dataIndex: 'rules',
      key: 'rules',
      render: (ruleIds: string[]) => (
        <div>
          <Text>{ruleIds.length} 个规则</Text>
          <br />
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {ruleIds.slice(0, 3).join(', ')}
            {ruleIds.length > 3 && '...'}
          </Text>
        </div>
      )
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_, record: RuleSet) => (
        <Space size="small">
          <Button type="link" icon={<EditOutlined />}>编辑</Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            disabled={record.isDefault}
          >
            删除
          </Button>
        </Space>
      )
    }
  ]

  return (
    <div className="content-body">
      <div className="content-header">
        <Title level={2} style={{ margin: 0 }}>
          <SecurityScanOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          规则配置
        </Title>
        <Text type="secondary">管理和配置安全扫描规则</Text>
      </div>

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="扫描规则" key="rules">
          {/* 过滤器和操作按钮 */}
          <Card style={{ marginBottom: 16 }} className="security-card">
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} sm={12} md={6}>
                <Search
                  placeholder="搜索规则..."
                  allowClear
                  prefix={<SearchOutlined />}
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                />
              </Col>
              <Col xs={12} sm={6} md={3}>
                <Select
                  style={{ width: '100%' }}
                  placeholder="类别"
                  value={filters.category}
                  onChange={(value) => setFilters(prev => ({ ...prev, category: value }))}
                >
                  <Option value="all">全部类别</Option>
                  <Option value="注入攻击">注入攻击</Option>
                  <Option value="跨站脚本">跨站脚本</Option>
                  <Option value="敏感信息泄露">敏感信息泄露</Option>
                  <Option value="认证授权">认证授权</Option>
                  <Option value="自定义规则">自定义规则</Option>
                </Select>
              </Col>
              <Col xs={12} sm={6} md={3}>
                <Select
                  style={{ width: '100%' }}
                  placeholder="严重程度"
                  value={filters.severity}
                  onChange={(value) => setFilters(prev => ({ ...prev, severity: value }))}
                >
                  <Option value="all">全部</Option>
                  <Option value="critical">严重</Option>
                  <Option value="high">高危</Option>
                  <Option value="medium">中危</Option>
                  <Option value="low">低危</Option>
                  <Option value="info">信息</Option>
                </Select>
              </Col>
              <Col xs={12} sm={6} md={3}>
                <Select
                  style={{ width: '100%' }}
                  placeholder="状态"
                  value={filters.enabled}
                  onChange={(value) => setFilters(prev => ({ ...prev, enabled: value }))}
                >
                  <Option value="all">全部状态</Option>
                  <Option value="enabled">已启用</Option>
                  <Option value="disabled">已禁用</Option>
                </Select>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Space>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => {
                      setSelectedRule(null)
                      form.resetFields()
                      setRuleModalVisible(true)
                    }}
                  >
                    新建规则
                  </Button>
                  <Button icon={<ImportOutlined />}>导入</Button>
                  <Button icon={<ExportOutlined />}>导出</Button>
                </Space>
              </Col>
            </Row>
          </Card>

          {/* 规则列表 */}
          <Card className="security-card">
            <Table
              columns={columns}
              dataSource={filteredRules}
              rowKey="id"
              loading={loading}
              pagination={{
                total: filteredRules.length,
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
              }}
              scroll={{ x: 1200 }}
            />
          </Card>
        </TabPane>

        <TabPane tab="规则集" key="ruleSets">
          <Card style={{ marginBottom: 16 }} className="security-card">
            <Row justify="space-between" align="middle">
              <Col>
                <Text>管理预定义的规则集合，可以快速应用到扫描任务中</Text>
              </Col>
              <Col>
                <Space>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setRuleSetModalVisible(true)}
                  >
                    新建规则集
                  </Button>
                  <Button icon={<ImportOutlined />}>导入规则集</Button>
                </Space>
              </Col>
            </Row>
          </Card>

          <Card className="security-card">
            <Table
              columns={ruleSetColumns}
              dataSource={ruleSets}
              rowKey="id"
              pagination={false}
            />
          </Card>
        </TabPane>
      </Tabs>

      {/* 规则编辑模态框 */}
      <Modal
        title={selectedRule ? '编辑规则' : '新建规则'}
        open={ruleModalVisible}
        onCancel={() => {
          setRuleModalVisible(false)
          setSelectedRule(null)
          form.resetFields()
        }}
        onOk={() => form.submit()}
        width={800}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSaveRule}
          initialValues={{
            enabled: true,
            severity: 'medium',
            patternType: 'regex',
            languages: ['javascript'],
            tags: []
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="规则名称"
                name="name"
                rules={[{ required: true, message: '请输入规则名称' }]}
              >
                <Input placeholder="输入规则名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="类别"
                name="category"
                rules={[{ required: true, message: '请选择类别' }]}
              >
                <Select placeholder="选择类别">
                  <Option value="注入攻击">注入攻击</Option>
                  <Option value="跨站脚本">跨站脚本</Option>
                  <Option value="敏感信息泄露">敏感信息泄露</Option>
                  <Option value="认证授权">认证授权</Option>
                  <Option value="自定义规则">自定义规则</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="描述"
            name="description"
            rules={[{ required: true, message: '请输入描述' }]}
          >
            <TextArea rows={3} placeholder="描述规则的作用和检测内容" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="严重程度"
                name="severity"
                rules={[{ required: true, message: '请选择严重程度' }]}
              >
                <Select>
                  <Option value="critical">严重</Option>
                  <Option value="high">高危</Option>
                  <Option value="medium">中危</Option>
                  <Option value="low">低危</Option>
                  <Option value="info">信息</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="支持语言"
                name="languages"
                rules={[{ required: true, message: '请选择支持的语言' }]}
              >
                <Select mode="multiple" placeholder="选择支持的编程语言">
                  <Option value="javascript">JavaScript</Option>
                  <Option value="typescript">TypeScript</Option>
                  <Option value="python">Python</Option>
                  <Option value="java">Java</Option>
                  <Option value="csharp">C#</Option>
                  <Option value="cpp">C++</Option>
                  <Option value="go">Go</Option>
                  <Option value="rust">Rust</Option>
                  <Option value="php">PHP</Option>
                  <Option value="ruby">Ruby</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="模式类型"
                name="patternType"
                rules={[{ required: true, message: '请选择模式类型' }]}
              >
                <Radio.Group>
                  <Radio value="regex">正则表达式</Radio>
                  <Radio value="ast">AST模式</Radio>
                  <Radio value="semantic">语义分析</Radio>
                </Radio.Group>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="CWE ID" name="cweId">
                <Input placeholder="如: CWE-89" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="检测模式"
            name="pattern"
            rules={[{ required: true, message: '请输入检测模式' }]}
          >
            <TextArea
              rows={3}
              placeholder="输入用于检测的正则表达式或其他模式"
            />
          </Form.Item>

          <Form.Item
            label="修复建议"
            name="recommendation"
            rules={[{ required: true, message: '请输入修复建议' }]}
          >
            <TextArea rows={3} placeholder="提供修复此类问题的建议" />
          </Form.Item>

          <Form.Item label="标签" name="tags">
            <Select
              mode="tags"
              placeholder="添加标签"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item name="enabled" valuePropName="checked">
            <Switch /> 启用此规则
          </Form.Item>
        </Form>
      </Modal>

      {/* 规则集编辑模态框 */}
      <Modal
        title="新建规则集"
        open={ruleSetModalVisible}
        onCancel={() => setRuleSetModalVisible(false)}
        onOk={() => ruleSetForm.submit()}
        destroyOnClose
      >
        <Form form={ruleSetForm} layout="vertical">
          <Form.Item
            label="规则集名称"
            name="name"
            rules={[{ required: true, message: '请输入规则集名称' }]}
          >
            <Input placeholder="输入规则集名称" />
          </Form.Item>
          
          <Form.Item
            label="描述"
            name="description"
            rules={[{ required: true, message: '请输入描述' }]}
          >
            <TextArea rows={3} placeholder="描述规则集的用途" />
          </Form.Item>
          
          <Form.Item
            label="包含规则"
            name="rules"
            rules={[{ required: true, message: '请选择规则' }]}
          >
            <Select
              mode="multiple"
              placeholder="选择要包含的规则"
              style={{ width: '100%' }}
            >
              {rules.map(rule => (
                <Option key={rule.id} value={rule.id}>
                  {rule.name} ({rule.id})
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default RulesPage