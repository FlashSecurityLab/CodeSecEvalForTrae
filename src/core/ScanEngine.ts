import { EventEmitter } from 'events'
import { v4 as uuidv4 } from 'uuid'

// 扫描类型定义
export type ScanType = 'quick' | 'full' | 'custom'

// 漏洞严重程度
export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info'

// 扫描状态
export type ScanStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'

// 扫描配置接口
export interface ScanConfig {
  projectPath: string
  scanType: ScanType
  includePaths?: string[]
  excludePaths?: string[]
  includeTestFiles?: boolean
  maxDepth?: number
  enabledRules?: string[]
  customRules?: Rule[]
  timeout?: number // 秒
  maxFileSize?: number // MB
  enableParallelProcessing?: boolean
  maxWorkerThreads?: number
}

// 规则定义接口
export interface Rule {
  id: string
  name: string
  description: string
  severity: Severity
  category: string
  language: string[]
  pattern: string | RegExp
  cweId?: string
  cvssScore?: number
  enabled: boolean
  customRule?: boolean
  tags?: string[]
  examples?: {
    vulnerable: string
    secure: string
  }
  references?: string[]
}

// 漏洞发现结果
export interface Vulnerability {
  id: string
  ruleId: string
  ruleName: string
  severity: Severity
  category: string
  description: string
  filePath: string
  startLine: number
  endLine: number
  startColumn: number
  endColumn: number
  codeSnippet: string
  cweId?: string
  cvssScore?: number
  confidence: number // 0-100
  status: 'open' | 'fixed' | 'ignored' | 'false_positive'
  foundAt: string
  fixSuggestion?: string
  references?: string[]
}

// 扫描进度信息
export interface ScanProgress {
  scanId: string
  status: ScanStatus
  progress: number // 0-100
  currentFile?: string
  processedFiles: number
  totalFiles: number
  vulnerabilitiesFound: number
  elapsedTime: number // 秒
  estimatedTimeRemaining?: number // 秒
  message?: string
}

// 扫描结果
export interface ScanResult {
  scanId: string
  projectPath: string
  config: ScanConfig
  status: ScanStatus
  startTime: string
  endTime?: string
  duration?: number // 秒
  vulnerabilities: Vulnerability[]
  statistics: {
    totalFiles: number
    scannedFiles: number
    skippedFiles: number
    vulnerabilityCount: number
    severityStats: Record<Severity, number>
    categoryStats: Record<string, number>
    languageStats: Record<string, number>
  }
  performance: {
    memoryUsage: number // MB
    cpuUsage: number // %
    diskIO: number // MB
  }
  errors?: string[]
  warnings?: string[]
}

// 文件信息
interface FileInfo {
  path: string
  size: number
  language: string
  encoding: string
  lineCount: number
}

// 扫描引擎类
export class ScanEngine extends EventEmitter {
  private activeScan: Map<string, ScanProgress> = new Map()
  private rules: Map<string, Rule> = new Map()
  private maxConcurrentScans: number = 3
  private defaultTimeout: number = 1800 // 30分钟

  constructor() {
    super()
    this.loadDefaultRules()
  }

  // 加载默认规则
  private loadDefaultRules(): void {
    const defaultRules: Rule[] = [
      {
        id: 'SEC001',
        name: 'SQL注入漏洞',
        description: '检测潜在的SQL注入漏洞',
        severity: 'critical',
        category: 'injection',
        language: ['javascript', 'typescript', 'python', 'java', 'php'],
        pattern: /(?:SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER).*(?:WHERE|SET|VALUES).*(?:\$|\+|concat)/i,
        cweId: 'CWE-89',
        cvssScore: 9.8,
        enabled: true,
        tags: ['injection', 'database'],
        examples: {
          vulnerable: "query = 'SELECT * FROM users WHERE id = ' + userId",
          secure: "query = 'SELECT * FROM users WHERE id = ?'; db.query(query, [userId])"
        },
        references: ['https://owasp.org/www-community/attacks/SQL_Injection']
      },
      {
        id: 'SEC002',
        name: 'XSS跨站脚本',
        description: '检测跨站脚本攻击漏洞',
        severity: 'high',
        category: 'xss',
        language: ['javascript', 'typescript', 'html'],
        pattern: /innerHTML\s*=\s*[^;]*(?:\+|\$\{)/,
        cweId: 'CWE-79',
        cvssScore: 7.5,
        enabled: true,
        tags: ['xss', 'web'],
        examples: {
          vulnerable: "element.innerHTML = '<div>' + userInput + '</div>'",
          secure: "element.textContent = userInput"
        },
        references: ['https://owasp.org/www-community/attacks/xss/']
      },
      {
        id: 'SEC003',
        name: '硬编码密码',
        description: '检测代码中的硬编码密码',
        severity: 'high',
        category: 'credentials',
        language: ['javascript', 'typescript', 'python', 'java', 'php'],
        pattern: /(?:password|pwd|pass|secret|key)\s*[=:]\s*['"][^'"]{8,}['"]/i,
        cweId: 'CWE-798',
        cvssScore: 7.8,
        enabled: true,
        tags: ['credentials', 'secrets'],
        examples: {
          vulnerable: "const password = 'hardcoded123'",
          secure: "const password = process.env.PASSWORD"
        },
        references: ['https://cwe.mitre.org/data/definitions/798.html']
      },
      {
        id: 'SEC004',
        name: '不安全的随机数生成',
        description: '检测使用不安全的随机数生成器',
        severity: 'medium',
        category: 'crypto',
        language: ['javascript', 'typescript'],
        pattern: /Math\.random\(\)/,
        cweId: 'CWE-338',
        cvssScore: 5.3,
        enabled: true,
        tags: ['crypto', 'random'],
        examples: {
          vulnerable: "const token = Math.random().toString(36)",
          secure: "const token = crypto.randomBytes(32).toString('hex')"
        },
        references: ['https://cwe.mitre.org/data/definitions/338.html']
      },
      {
        id: 'SEC005',
        name: 'eval函数使用',
        description: '检测危险的eval函数使用',
        severity: 'critical',
        category: 'injection',
        language: ['javascript', 'typescript'],
        pattern: /\beval\s*\(/,
        cweId: 'CWE-95',
        cvssScore: 9.0,
        enabled: true,
        tags: ['injection', 'eval'],
        examples: {
          vulnerable: "eval(userInput)",
          secure: "JSON.parse(userInput)"
        },
        references: ['https://cwe.mitre.org/data/definitions/95.html']
      }
    ]

    defaultRules.forEach(rule => {
      this.rules.set(rule.id, rule)
    })
  }

  // 开始扫描
  public async startScan(config: ScanConfig): Promise<string> {
    // 检查并发扫描限制
    if (this.activeScan.size >= this.maxConcurrentScans) {
      throw new Error('已达到最大并发扫描数限制')
    }

    const scanId = uuidv4()
    const progress: ScanProgress = {
      scanId,
      status: 'pending',
      progress: 0,
      processedFiles: 0,
      totalFiles: 0,
      vulnerabilitiesFound: 0,
      elapsedTime: 0
    }

    this.activeScan.set(scanId, progress)
    this.emit('scanStarted', progress)

    // 异步执行扫描
    this.executeScan(scanId, config).catch(error => {
      this.handleScanError(scanId, error)
    })

    return scanId
  }

  // 执行扫描
  private async executeScan(scanId: string, config: ScanConfig): Promise<void> {
    const startTime = Date.now()
    const progress = this.activeScan.get(scanId)!
    
    try {
      // 更新状态为运行中
      progress.status = 'running'
      this.emit('scanProgress', progress)

      // 1. 扫描文件系统
      const files = await this.scanFileSystem(config)
      progress.totalFiles = files.length
      this.emit('scanProgress', progress)

      // 2. 分析文件
      const vulnerabilities: Vulnerability[] = []
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        progress.currentFile = file.path
        progress.processedFiles = i + 1
        progress.progress = Math.round((i + 1) / files.length * 100)
        progress.elapsedTime = Math.round((Date.now() - startTime) / 1000)
        
        // 估算剩余时间
        if (i > 0) {
          const avgTimePerFile = progress.elapsedTime / (i + 1)
          progress.estimatedTimeRemaining = Math.round(avgTimePerFile * (files.length - i - 1))
        }

        this.emit('scanProgress', progress)

        // 分析单个文件
        const fileVulnerabilities = await this.analyzeFile(file, config)
        vulnerabilities.push(...fileVulnerabilities)
        progress.vulnerabilitiesFound = vulnerabilities.length

        // 检查是否被取消
        if (progress.status === 'cancelled') {
          return
        }

        // 模拟处理时间
        await this.sleep(50 + Math.random() * 100)
      }

      // 3. 生成扫描结果
      const result = this.generateScanResult(scanId, config, vulnerabilities, startTime)
      
      // 更新状态为完成
      progress.status = 'completed'
      progress.progress = 100
      progress.elapsedTime = Math.round((Date.now() - startTime) / 1000)
      
      this.emit('scanProgress', progress)
      this.emit('scanCompleted', result)
      
    } catch (error) {
      this.handleScanError(scanId, error as Error)
    } finally {
      this.activeScan.delete(scanId)
    }
  }

  // 扫描文件系统
  private async scanFileSystem(config: ScanConfig): Promise<FileInfo[]> {
    // 模拟文件系统扫描
    const mockFiles: FileInfo[] = [
      { path: '/src/components/Login.tsx', size: 2048, language: 'typescript', encoding: 'utf-8', lineCount: 85 },
      { path: '/src/utils/api.js', size: 1536, language: 'javascript', encoding: 'utf-8', lineCount: 62 },
      { path: '/src/services/auth.ts', size: 3072, language: 'typescript', encoding: 'utf-8', lineCount: 120 },
      { path: '/src/pages/Dashboard.tsx', size: 4096, language: 'typescript', encoding: 'utf-8', lineCount: 156 },
      { path: '/src/hooks/useAuth.js', size: 1024, language: 'javascript', encoding: 'utf-8', lineCount: 45 },
      { path: '/backend/routes/users.js', size: 2560, language: 'javascript', encoding: 'utf-8', lineCount: 98 },
      { path: '/backend/models/User.js', size: 1792, language: 'javascript', encoding: 'utf-8', lineCount: 72 },
      { path: '/backend/middleware/auth.js', size: 1280, language: 'javascript', encoding: 'utf-8', lineCount: 54 }
    ]

    // 根据配置过滤文件
    let filteredFiles = mockFiles

    if (config.excludePaths && config.excludePaths.length > 0) {
      filteredFiles = filteredFiles.filter(file => {
        return !config.excludePaths!.some(excludePath => 
          file.path.includes(excludePath)
        )
      })
    }

    if (config.includePaths && config.includePaths.length > 0) {
      filteredFiles = filteredFiles.filter(file => {
        return config.includePaths!.some(includePath => 
          file.path.includes(includePath)
        )
      })
    }

    if (!config.includeTestFiles) {
      filteredFiles = filteredFiles.filter(file => 
        !file.path.includes('test') && 
        !file.path.includes('spec') &&
        !file.path.includes('__tests__')
      )
    }

    return filteredFiles
  }

  // 分析单个文件
  private async analyzeFile(file: FileInfo, config: ScanConfig): Promise<Vulnerability[]> {
    const vulnerabilities: Vulnerability[] = []
    
    // 模拟文件内容
    const mockContent = this.generateMockFileContent(file)
    
    // 获取启用的规则
    const enabledRules = Array.from(this.rules.values()).filter(rule => {
      if (config.enabledRules && config.enabledRules.length > 0) {
        return config.enabledRules.includes(rule.id) && rule.enabled
      }
      return rule.enabled && rule.language.includes(file.language)
    })

    // 应用规则检测
    for (const rule of enabledRules) {
      const matches = this.applyRule(rule, mockContent, file)
      vulnerabilities.push(...matches)
    }

    return vulnerabilities
  }

  // 应用规则检测
  private applyRule(rule: Rule, content: string, file: FileInfo): Vulnerability[] {
    const vulnerabilities: Vulnerability[] = []
    const lines = content.split('\n')
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const pattern = typeof rule.pattern === 'string' ? new RegExp(rule.pattern, 'i') : rule.pattern
      
      if (pattern.test(line)) {
        // 模拟随机发现漏洞
        if (Math.random() < 0.3) { // 30%概率发现漏洞
          const vulnerability: Vulnerability = {
            id: uuidv4(),
            ruleId: rule.id,
            ruleName: rule.name,
            severity: rule.severity,
            category: rule.category,
            description: rule.description,
            filePath: file.path,
            startLine: i + 1,
            endLine: i + 1,
            startColumn: 1,
            endColumn: line.length,
            codeSnippet: line.trim(),
            cweId: rule.cweId,
            cvssScore: rule.cvssScore,
            confidence: Math.floor(Math.random() * 30) + 70, // 70-100
            status: 'open',
            foundAt: new Date().toISOString(),
            fixSuggestion: rule.examples?.secure,
            references: rule.references
          }
          vulnerabilities.push(vulnerability)
        }
      }
    }
    
    return vulnerabilities
  }

  // 生成模拟文件内容
  private generateMockFileContent(file: FileInfo): string {
    const templates = {
      javascript: [
        "const password = 'hardcoded123';",
        "eval(userInput);",
        "element.innerHTML = '<div>' + data + '</div>';",
        "const token = Math.random().toString(36);",
        "query = 'SELECT * FROM users WHERE id = ' + userId;"
      ],
      typescript: [
        "const apiKey: string = 'sk-1234567890abcdef';",
        "document.getElementById('content')!.innerHTML = userContent;",
        "const randomId = Math.random();",
        "const sql = `SELECT * FROM products WHERE name = '${productName}'`;"
      ]
    }
    
    const langTemplates = templates[file.language as keyof typeof templates] || templates.javascript
    const lines: string[] = []
    
    for (let i = 0; i < file.lineCount; i++) {
      if (Math.random() < 0.1) { // 10%概率插入可能有问题的代码
        lines.push(langTemplates[Math.floor(Math.random() * langTemplates.length)])
      } else {
        lines.push(`// Line ${i + 1}: Normal code here`)
      }
    }
    
    return lines.join('\n')
  }

  // 生成扫描结果
  private generateScanResult(
    scanId: string, 
    config: ScanConfig, 
    vulnerabilities: Vulnerability[], 
    startTime: number
  ): ScanResult {
    const endTime = Date.now()
    const duration = Math.round((endTime - startTime) / 1000)
    
    // 统计信息
    const severityStats: Record<Severity, number> = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      info: 0
    }
    
    const categoryStats: Record<string, number> = {}
    const languageStats: Record<string, number> = {}
    
    vulnerabilities.forEach(vuln => {
      severityStats[vuln.severity]++
      categoryStats[vuln.category] = (categoryStats[vuln.category] || 0) + 1
      
      // 从文件路径推断语言
      const ext = vuln.filePath.split('.').pop() || ''
      const lang = this.getLanguageFromExtension(ext)
      languageStats[lang] = (languageStats[lang] || 0) + 1
    })
    
    return {
      scanId,
      projectPath: config.projectPath,
      config,
      status: 'completed',
      startTime: new Date(startTime).toISOString(),
      endTime: new Date(endTime).toISOString(),
      duration,
      vulnerabilities,
      statistics: {
        totalFiles: 150, // 模拟值
        scannedFiles: 120,
        skippedFiles: 30,
        vulnerabilityCount: vulnerabilities.length,
        severityStats,
        categoryStats,
        languageStats
      },
      performance: {
        memoryUsage: Math.floor(Math.random() * 200) + 100, // 100-300MB
        cpuUsage: Math.floor(Math.random() * 50) + 20, // 20-70%
        diskIO: Math.floor(Math.random() * 50) + 10 // 10-60MB
      }
    }
  }

  // 从文件扩展名获取语言
  private getLanguageFromExtension(ext: string): string {
    const langMap: Record<string, string> = {
      'js': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'jsx': 'javascript',
      'py': 'python',
      'java': 'java',
      'php': 'php',
      'html': 'html',
      'css': 'css',
      'json': 'json'
    }
    return langMap[ext.toLowerCase()] || 'unknown'
  }

  // 处理扫描错误
  private handleScanError(scanId: string, error: Error): void {
    const progress = this.activeScan.get(scanId)
    if (progress) {
      progress.status = 'failed'
      progress.message = error.message
      this.emit('scanFailed', { scanId, error: error.message })
      this.activeScan.delete(scanId)
    }
  }

  // 取消扫描
  public cancelScan(scanId: string): boolean {
    const progress = this.activeScan.get(scanId)
    if (progress && progress.status === 'running') {
      progress.status = 'cancelled'
      this.emit('scanCancelled', { scanId })
      return true
    }
    return false
  }

  // 获取扫描进度
  public getScanProgress(scanId: string): ScanProgress | null {
    return this.activeScan.get(scanId) || null
  }

  // 获取所有活动扫描
  public getActiveScans(): ScanProgress[] {
    return Array.from(this.activeScan.values())
  }

  // 添加自定义规则
  public addRule(rule: Rule): void {
    this.rules.set(rule.id, rule)
    this.emit('ruleAdded', rule)
  }

  // 更新规则
  public updateRule(ruleId: string, updates: Partial<Rule>): boolean {
    const rule = this.rules.get(ruleId)
    if (rule) {
      Object.assign(rule, updates)
      this.emit('ruleUpdated', rule)
      return true
    }
    return false
  }

  // 删除规则
  public removeRule(ruleId: string): boolean {
    const deleted = this.rules.delete(ruleId)
    if (deleted) {
      this.emit('ruleRemoved', { ruleId })
    }
    return deleted
  }

  // 获取所有规则
  public getRules(): Rule[] {
    return Array.from(this.rules.values())
  }

  // 获取规则
  public getRule(ruleId: string): Rule | null {
    return this.rules.get(ruleId) || null
  }

  // 设置最大并发扫描数
  public setMaxConcurrentScans(max: number): void {
    this.maxConcurrentScans = Math.max(1, Math.min(10, max))
  }

  // 工具方法：延时
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

// 导出单例实例
export const scanEngine = new ScanEngine()