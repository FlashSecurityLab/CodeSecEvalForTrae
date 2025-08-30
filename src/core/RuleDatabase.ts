import { Rule, Severity } from './ScanEngine'
import { EventEmitter } from 'events'

// 规则集接口
export interface RuleSet {
  id: string
  name: string
  description: string
  version: string
  author: string
  createdAt: string
  updatedAt: string
  rules: string[] // 规则ID列表
  enabled: boolean
  tags: string[]
  language: string[]
  category: string[]
}

// 规则分类
export interface RuleCategory {
  id: string
  name: string
  description: string
  parentId?: string
  color: string
  icon: string
}

// 规则统计信息
export interface RuleStatistics {
  totalRules: number
  enabledRules: number
  disabledRules: number
  customRules: number
  builtinRules: number
  severityStats: Record<Severity, number>
  categoryStats: Record<string, number>
  languageStats: Record<string, number>
}

// 规则搜索条件
export interface RuleSearchCriteria {
  keyword?: string
  severity?: Severity[]
  category?: string[]
  language?: string[]
  enabled?: boolean
  customRule?: boolean
  tags?: string[]
}

// 规则导入/导出格式
export interface RuleExportData {
  version: string
  exportedAt: string
  rules: Rule[]
  ruleSets: RuleSet[]
  categories: RuleCategory[]
}

// 规则数据库类
export class RuleDatabase extends EventEmitter {
  private rules: Map<string, Rule> = new Map()
  private ruleSets: Map<string, RuleSet> = new Map()
  private categories: Map<string, RuleCategory> = new Map()
  private dbVersion: string = '1.0.0'

  constructor() {
    super()
    this.initializeDatabase()
  }

  // 初始化数据库
  private initializeDatabase(): void {
    this.loadDefaultCategories()
    this.loadDefaultRules()
    this.loadDefaultRuleSets()
  }

  // 加载默认分类
  private loadDefaultCategories(): void {
    const defaultCategories: RuleCategory[] = [
      {
        id: 'injection',
        name: '注入攻击',
        description: '各种注入攻击漏洞，如SQL注入、命令注入等',
        color: '#ff4d4f',
        icon: 'bug'
      },
      {
        id: 'xss',
        name: '跨站脚本',
        description: 'XSS跨站脚本攻击漏洞',
        color: '#fa8c16',
        icon: 'code'
      },
      {
        id: 'csrf',
        name: '跨站请求伪造',
        description: 'CSRF跨站请求伪造漏洞',
        color: '#faad14',
        icon: 'swap'
      },
      {
        id: 'auth',
        name: '身份认证',
        description: '身份认证和授权相关漏洞',
        color: '#52c41a',
        icon: 'lock'
      },
      {
        id: 'crypto',
        name: '加密安全',
        description: '加密算法和密钥管理相关漏洞',
        color: '#1890ff',
        icon: 'safety'
      },
      {
        id: 'credentials',
        name: '凭据管理',
        description: '密码、密钥等敏感信息管理漏洞',
        color: '#722ed1',
        icon: 'key'
      },
      {
        id: 'input_validation',
        name: '输入验证',
        description: '输入数据验证和过滤相关漏洞',
        color: '#eb2f96',
        icon: 'filter'
      },
      {
        id: 'file_handling',
        name: '文件处理',
        description: '文件上传、下载和处理相关漏洞',
        color: '#13c2c2',
        icon: 'file'
      },
      {
        id: 'session',
        name: '会话管理',
        description: '会话管理和状态维护相关漏洞',
        color: '#a0d911',
        icon: 'clock-circle'
      },
      {
        id: 'configuration',
        name: '配置安全',
        description: '系统配置和部署相关安全问题',
        color: '#f759ab',
        icon: 'setting'
      }
    ]

    defaultCategories.forEach(category => {
      this.categories.set(category.id, category)
    })
  }

  // 加载默认规则
  private loadDefaultRules(): void {
    const defaultRules: Rule[] = [
      {
        id: 'SEC001',
        name: 'SQL注入漏洞',
        description: '检测潜在的SQL注入漏洞，通过字符串拼接构造SQL查询',
        severity: 'critical',
        category: 'injection',
        language: ['javascript', 'typescript', 'python', 'java', 'php', 'csharp'],
        pattern: /(?:SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER).*(?:WHERE|SET|VALUES).*(?:\$|\+|concat|\|\|)/i,
        cweId: 'CWE-89',
        cvssScore: 9.8,
        enabled: true,
        customRule: false,
        tags: ['injection', 'database', 'sql'],
        examples: {
          vulnerable: "query = 'SELECT * FROM users WHERE id = ' + userId",
          secure: "query = 'SELECT * FROM users WHERE id = ?'; db.query(query, [userId])"
        },
        references: [
          'https://owasp.org/www-community/attacks/SQL_Injection',
          'https://cwe.mitre.org/data/definitions/89.html'
        ]
      },
      {
        id: 'SEC002',
        name: 'XSS跨站脚本',
        description: '检测DOM型XSS漏洞，直接将用户输入插入到DOM中',
        severity: 'high',
        category: 'xss',
        language: ['javascript', 'typescript', 'html'],
        pattern: /innerHTML\s*[=:]\s*[^;]*(?:\+|\$\{|concat)/,
        cweId: 'CWE-79',
        cvssScore: 7.5,
        enabled: true,
        customRule: false,
        tags: ['xss', 'web', 'dom'],
        examples: {
          vulnerable: "element.innerHTML = '<div>' + userInput + '</div>'",
          secure: "element.textContent = userInput"
        },
        references: [
          'https://owasp.org/www-community/attacks/xss/',
          'https://cwe.mitre.org/data/definitions/79.html'
        ]
      },
      {
        id: 'SEC003',
        name: '硬编码密码',
        description: '检测代码中硬编码的密码、API密钥等敏感信息',
        severity: 'high',
        category: 'credentials',
        language: ['javascript', 'typescript', 'python', 'java', 'php', 'csharp'],
        pattern: /(?:password|pwd|pass|secret|key|token|api_key)\s*[=:]\s*['"][^'"]{8,}['"]/i,
        cweId: 'CWE-798',
        cvssScore: 7.8,
        enabled: true,
        customRule: false,
        tags: ['credentials', 'secrets', 'hardcoded'],
        examples: {
          vulnerable: "const password = 'hardcoded123'",
          secure: "const password = process.env.PASSWORD"
        },
        references: [
          'https://cwe.mitre.org/data/definitions/798.html',
          'https://owasp.org/www-project-top-ten/2017/A3_2017-Sensitive_Data_Exposure'
        ]
      },
      {
        id: 'SEC004',
        name: '不安全的随机数生成',
        description: '检测使用不安全的随机数生成器，可能导致可预测的随机值',
        severity: 'medium',
        category: 'crypto',
        language: ['javascript', 'typescript'],
        pattern: /Math\.random\(\)/,
        cweId: 'CWE-338',
        cvssScore: 5.3,
        enabled: true,
        customRule: false,
        tags: ['crypto', 'random', 'predictable'],
        examples: {
          vulnerable: "const token = Math.random().toString(36)",
          secure: "const token = crypto.randomBytes(32).toString('hex')"
        },
        references: [
          'https://cwe.mitre.org/data/definitions/338.html'
        ]
      },
      {
        id: 'SEC005',
        name: 'eval函数使用',
        description: '检测危险的eval函数使用，可能导致代码注入攻击',
        severity: 'critical',
        category: 'injection',
        language: ['javascript', 'typescript'],
        pattern: /\beval\s*\(/,
        cweId: 'CWE-95',
        cvssScore: 9.0,
        enabled: true,
        customRule: false,
        tags: ['injection', 'eval', 'code-execution'],
        examples: {
          vulnerable: "eval(userInput)",
          secure: "JSON.parse(userInput)"
        },
        references: [
          'https://cwe.mitre.org/data/definitions/95.html'
        ]
      },
      {
        id: 'SEC006',
        name: '不安全的文件上传',
        description: '检测不安全的文件上传处理，缺少文件类型验证',
        severity: 'high',
        category: 'file_handling',
        language: ['javascript', 'typescript', 'python', 'java', 'php'],
        pattern: /upload.*\.(exe|bat|cmd|sh|php|jsp|asp|aspx)$/i,
        cweId: 'CWE-434',
        cvssScore: 8.1,
        enabled: true,
        customRule: false,
        tags: ['file-upload', 'validation'],
        examples: {
          vulnerable: "fs.writeFile(uploadPath + filename, data)",
          secure: "if (allowedTypes.includes(fileType)) { fs.writeFile(sanitizedPath, data) }"
        },
        references: [
          'https://cwe.mitre.org/data/definitions/434.html'
        ]
      },
      {
        id: 'SEC007',
        name: '弱密码策略',
        description: '检测弱密码验证策略，密码复杂度要求不足',
        severity: 'medium',
        category: 'auth',
        language: ['javascript', 'typescript', 'python', 'java'],
        pattern: /password.*length.*[<>]\s*[1-7]\b/i,
        cweId: 'CWE-521',
        cvssScore: 6.5,
        enabled: true,
        customRule: false,
        tags: ['password', 'policy', 'weak'],
        examples: {
          vulnerable: "if (password.length > 4) { // 密码太短 }",
          secure: "if (password.length >= 12 && /[A-Z]/.test(password) && /[0-9]/.test(password)) {"
        },
        references: [
          'https://cwe.mitre.org/data/definitions/521.html'
        ]
      },
      {
        id: 'SEC008',
        name: '不安全的HTTP传输',
        description: '检测使用HTTP而非HTTPS进行敏感数据传输',
        severity: 'medium',
        category: 'configuration',
        language: ['javascript', 'typescript', 'html'],
        pattern: /http:\/\/.*(?:login|password|token|api)/i,
        cweId: 'CWE-319',
        cvssScore: 5.9,
        enabled: true,
        customRule: false,
        tags: ['http', 'encryption', 'transport'],
        examples: {
          vulnerable: "fetch('http://api.example.com/login', { method: 'POST' })",
          secure: "fetch('https://api.example.com/login', { method: 'POST' })"
        },
        references: [
          'https://cwe.mitre.org/data/definitions/319.html'
        ]
      },
      {
        id: 'SEC009',
        name: '缺少CSRF保护',
        description: '检测表单提交缺少CSRF令牌保护',
        severity: 'medium',
        category: 'csrf',
        language: ['html', 'javascript', 'typescript'],
        pattern: /<form[^>]*method\s*=\s*['"]post['"][^>]*>(?!.*csrf)/i,
        cweId: 'CWE-352',
        cvssScore: 6.5,
        enabled: true,
        customRule: false,
        tags: ['csrf', 'form', 'token'],
        examples: {
          vulnerable: "<form method='post' action='/transfer'>",
          secure: "<form method='post' action='/transfer'><input type='hidden' name='csrf_token' value='...'>"
        },
        references: [
          'https://cwe.mitre.org/data/definitions/352.html'
        ]
      },
      {
        id: 'SEC010',
        name: '不安全的会话管理',
        description: '检测会话ID在URL中传输或会话配置不安全',
        severity: 'medium',
        category: 'session',
        language: ['javascript', 'typescript', 'php'],
        pattern: /(?:sessionid|jsessionid).*[?&]/i,
        cweId: 'CWE-384',
        cvssScore: 6.1,
        enabled: true,
        customRule: false,
        tags: ['session', 'url', 'exposure'],
        examples: {
          vulnerable: "window.location = '/page?sessionid=' + sessionId",
          secure: "// 使用安全的Cookie存储会话ID"
        },
        references: [
          'https://cwe.mitre.org/data/definitions/384.html'
        ]
      }
    ]

    defaultRules.forEach(rule => {
      this.rules.set(rule.id, rule)
    })
  }

  // 加载默认规则集
  private loadDefaultRuleSets(): void {
    const defaultRuleSets: RuleSet[] = [
      {
        id: 'owasp-top10',
        name: 'OWASP Top 10',
        description: 'OWASP十大安全风险相关规则',
        version: '2021',
        author: 'OWASP',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        rules: ['SEC001', 'SEC002', 'SEC003', 'SEC006', 'SEC008', 'SEC009'],
        enabled: true,
        tags: ['owasp', 'top10', 'standard'],
        language: ['javascript', 'typescript', 'python', 'java', 'php'],
        category: ['injection', 'xss', 'credentials', 'file_handling', 'configuration', 'csrf']
      },
      {
        id: 'web-security',
        name: 'Web应用安全',
        description: 'Web应用程序常见安全漏洞检测规则',
        version: '1.0',
        author: 'CodeSecEval',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        rules: ['SEC001', 'SEC002', 'SEC005', 'SEC008', 'SEC009', 'SEC010'],
        enabled: true,
        tags: ['web', 'security', 'frontend'],
        language: ['javascript', 'typescript', 'html'],
        category: ['injection', 'xss', 'configuration', 'csrf', 'session']
      },
      {
        id: 'crypto-security',
        name: '加密安全',
        description: '加密算法和密钥管理相关安全规则',
        version: '1.0',
        author: 'CodeSecEval',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        rules: ['SEC003', 'SEC004'],
        enabled: true,
        tags: ['crypto', 'encryption', 'keys'],
        language: ['javascript', 'typescript', 'python', 'java'],
        category: ['crypto', 'credentials']
      },
      {
        id: 'critical-only',
        name: '严重漏洞',
        description: '仅包含严重级别的安全漏洞规则',
        version: '1.0',
        author: 'CodeSecEval',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        rules: ['SEC001', 'SEC005'],
        enabled: true,
        tags: ['critical', 'high-priority'],
        language: ['javascript', 'typescript', 'python', 'java', 'php'],
        category: ['injection']
      }
    ]

    defaultRuleSets.forEach(ruleSet => {
      this.ruleSets.set(ruleSet.id, ruleSet)
    })
  }

  // 添加规则
  public addRule(rule: Rule): boolean {
    if (this.rules.has(rule.id)) {
      return false // 规则已存在
    }
    this.rules.set(rule.id, { ...rule, customRule: true })
    this.emit('ruleAdded', rule)
    return true
  }

  // 更新规则
  public updateRule(ruleId: string, updates: Partial<Rule>): boolean {
    const rule = this.rules.get(ruleId)
    if (!rule) {
      return false
    }
    const updatedRule = { ...rule, ...updates }
    this.rules.set(ruleId, updatedRule)
    this.emit('ruleUpdated', updatedRule)
    return true
  }

  // 删除规则
  public deleteRule(ruleId: string): boolean {
    const rule = this.rules.get(ruleId)
    if (!rule) {
      return false
    }
    // 不允许删除内置规则
    if (!rule.customRule) {
      return false
    }
    this.rules.delete(ruleId)
    // 从规则集中移除
    this.ruleSets.forEach(ruleSet => {
      const index = ruleSet.rules.indexOf(ruleId)
      if (index > -1) {
        ruleSet.rules.splice(index, 1)
        ruleSet.updatedAt = new Date().toISOString()
      }
    })
    this.emit('ruleDeleted', { ruleId })
    return true
  }

  // 获取规则
  public getRule(ruleId: string): Rule | null {
    return this.rules.get(ruleId) || null
  }

  // 获取所有规则
  public getAllRules(): Rule[] {
    return Array.from(this.rules.values())
  }

  // 搜索规则
  public searchRules(criteria: RuleSearchCriteria): Rule[] {
    let rules = Array.from(this.rules.values())

    if (criteria.keyword) {
      const keyword = criteria.keyword.toLowerCase()
      rules = rules.filter(rule => 
        rule.name.toLowerCase().includes(keyword) ||
        rule.description.toLowerCase().includes(keyword) ||
        rule.tags?.some(tag => tag.toLowerCase().includes(keyword))
      )
    }

    if (criteria.severity && criteria.severity.length > 0) {
      rules = rules.filter(rule => criteria.severity!.includes(rule.severity))
    }

    if (criteria.category && criteria.category.length > 0) {
      rules = rules.filter(rule => criteria.category!.includes(rule.category))
    }

    if (criteria.language && criteria.language.length > 0) {
      rules = rules.filter(rule => 
        criteria.language!.some(lang => rule.language.includes(lang))
      )
    }

    if (criteria.enabled !== undefined) {
      rules = rules.filter(rule => rule.enabled === criteria.enabled)
    }

    if (criteria.customRule !== undefined) {
      rules = rules.filter(rule => rule.customRule === criteria.customRule)
    }

    if (criteria.tags && criteria.tags.length > 0) {
      rules = rules.filter(rule => 
        rule.tags && criteria.tags!.some(tag => rule.tags!.includes(tag))
      )
    }

    return rules
  }

  // 启用/禁用规则
  public toggleRule(ruleId: string, enabled: boolean): boolean {
    return this.updateRule(ruleId, { enabled })
  }

  // 批量操作规则
  public batchUpdateRules(ruleIds: string[], updates: Partial<Rule>): number {
    let updatedCount = 0
    ruleIds.forEach(ruleId => {
      if (this.updateRule(ruleId, updates)) {
        updatedCount++
      }
    })
    return updatedCount
  }

  // 添加规则集
  public addRuleSet(ruleSet: RuleSet): boolean {
    if (this.ruleSets.has(ruleSet.id)) {
      return false
    }
    this.ruleSets.set(ruleSet.id, ruleSet)
    this.emit('ruleSetAdded', ruleSet)
    return true
  }

  // 更新规则集
  public updateRuleSet(ruleSetId: string, updates: Partial<RuleSet>): boolean {
    const ruleSet = this.ruleSets.get(ruleSetId)
    if (!ruleSet) {
      return false
    }
    const updatedRuleSet = { ...ruleSet, ...updates, updatedAt: new Date().toISOString() }
    this.ruleSets.set(ruleSetId, updatedRuleSet)
    this.emit('ruleSetUpdated', updatedRuleSet)
    return true
  }

  // 删除规则集
  public deleteRuleSet(ruleSetId: string): boolean {
    const deleted = this.ruleSets.delete(ruleSetId)
    if (deleted) {
      this.emit('ruleSetDeleted', { ruleSetId })
    }
    return deleted
  }

  // 获取规则集
  public getRuleSet(ruleSetId: string): RuleSet | null {
    return this.ruleSets.get(ruleSetId) || null
  }

  // 获取所有规则集
  public getAllRuleSets(): RuleSet[] {
    return Array.from(this.ruleSets.values())
  }

  // 获取规则集中的规则
  public getRuleSetRules(ruleSetId: string): Rule[] {
    const ruleSet = this.ruleSets.get(ruleSetId)
    if (!ruleSet) {
      return []
    }
    return ruleSet.rules.map(ruleId => this.rules.get(ruleId)).filter(Boolean) as Rule[]
  }

  // 添加分类
  public addCategory(category: RuleCategory): boolean {
    if (this.categories.has(category.id)) {
      return false
    }
    this.categories.set(category.id, category)
    this.emit('categoryAdded', category)
    return true
  }

  // 获取所有分类
  public getAllCategories(): RuleCategory[] {
    return Array.from(this.categories.values())
  }

  // 获取分类
  public getCategory(categoryId: string): RuleCategory | null {
    return this.categories.get(categoryId) || null
  }

  // 获取统计信息
  public getStatistics(): RuleStatistics {
    const rules = Array.from(this.rules.values())
    
    const severityStats: Record<Severity, number> = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      info: 0
    }
    
    const categoryStats: Record<string, number> = {}
    const languageStats: Record<string, number> = {}
    
    let enabledCount = 0
    let customCount = 0
    
    rules.forEach(rule => {
      if (rule.enabled) enabledCount++
      if (rule.customRule) customCount++
      
      severityStats[rule.severity]++
      categoryStats[rule.category] = (categoryStats[rule.category] || 0) + 1
      
      rule.language.forEach(lang => {
        languageStats[lang] = (languageStats[lang] || 0) + 1
      })
    })
    
    return {
      totalRules: rules.length,
      enabledRules: enabledCount,
      disabledRules: rules.length - enabledCount,
      customRules: customCount,
      builtinRules: rules.length - customCount,
      severityStats,
      categoryStats,
      languageStats
    }
  }

  // 导出规则
  public exportRules(ruleIds?: string[], includeRuleSets: boolean = true): RuleExportData {
    const rulesToExport = ruleIds 
      ? ruleIds.map(id => this.rules.get(id)).filter(Boolean) as Rule[]
      : Array.from(this.rules.values())
    
    const exportData: RuleExportData = {
      version: this.dbVersion,
      exportedAt: new Date().toISOString(),
      rules: rulesToExport,
      ruleSets: includeRuleSets ? Array.from(this.ruleSets.values()) : [],
      categories: Array.from(this.categories.values())
    }
    
    return exportData
  }

  // 导入规则
  public importRules(data: RuleExportData, overwrite: boolean = false): {
    imported: number
    skipped: number
    errors: string[]
  } {
    const result = {
      imported: 0,
      skipped: 0,
      errors: [] as string[]
    }
    
    // 导入分类
    data.categories?.forEach(category => {
      if (!this.categories.has(category.id) || overwrite) {
        this.categories.set(category.id, category)
      }
    })
    
    // 导入规则
    data.rules.forEach(rule => {
      try {
        if (!this.rules.has(rule.id) || overwrite) {
          this.rules.set(rule.id, { ...rule, customRule: true })
          result.imported++
          this.emit('ruleAdded', rule)
        } else {
          result.skipped++
        }
      } catch (error) {
        result.errors.push(`导入规则 ${rule.id} 失败: ${error}`)
      }
    })
    
    // 导入规则集
    data.ruleSets?.forEach(ruleSet => {
      try {
        if (!this.ruleSets.has(ruleSet.id) || overwrite) {
          this.ruleSets.set(ruleSet.id, ruleSet)
          this.emit('ruleSetAdded', ruleSet)
        }
      } catch (error) {
        result.errors.push(`导入规则集 ${ruleSet.id} 失败: ${error}`)
      }
    })
    
    return result
  }

  // 验证规则
  public validateRule(rule: Partial<Rule>): string[] {
    const errors: string[] = []
    
    if (!rule.id || rule.id.trim() === '') {
      errors.push('规则ID不能为空')
    }
    
    if (!rule.name || rule.name.trim() === '') {
      errors.push('规则名称不能为空')
    }
    
    if (!rule.description || rule.description.trim() === '') {
      errors.push('规则描述不能为空')
    }
    
    if (!rule.severity || !['critical', 'high', 'medium', 'low', 'info'].includes(rule.severity)) {
      errors.push('规则严重程度无效')
    }
    
    if (!rule.category || rule.category.trim() === '') {
      errors.push('规则分类不能为空')
    }
    
    if (!rule.language || rule.language.length === 0) {
      errors.push('规则支持语言不能为空')
    }
    
    if (!rule.pattern) {
      errors.push('规则模式不能为空')
    }
    
    return errors
  }

  // 重置数据库
  public reset(): void {
    this.rules.clear()
    this.ruleSets.clear()
    this.categories.clear()
    this.initializeDatabase()
    this.emit('databaseReset')
  }

  // 获取数据库版本
  public getVersion(): string {
    return this.dbVersion
  }
}

// 导出单例实例
export const ruleDatabase = new RuleDatabase()