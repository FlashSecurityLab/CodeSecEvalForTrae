import { EventEmitter } from 'events'
import { ScanResult, ScanConfig } from './ScanEngine'
import { Rule, RuleSet } from './RuleDatabase'

// 存储配置
export interface StorageConfig {
  reportsPath: string
  logsPath: string
  cachePath: string
  configPath: string
  maxReportHistory: number
  maxLogSize: number // MB
  enableCompression: boolean
  autoCleanup: boolean
  cleanupInterval: number // 天
}

// 扫描历史记录
export interface ScanHistory {
  id: string
  projectPath: string
  projectName: string
  scanType: 'quick' | 'full' | 'custom'
  status: 'running' | 'completed' | 'failed' | 'cancelled'
  startTime: string
  endTime?: string
  duration?: number
  config: ScanConfig
  resultPath?: string
  vulnerabilityCount: number
  severityStats: {
    critical: number
    high: number
    medium: number
    low: number
    info: number
  }
  errorMessage?: string
}

// 应用设置
export interface AppSettings {
  scan: {
    defaultScanType: 'quick' | 'full' | 'custom'
    maxConcurrentScans: number
    defaultExcludePaths: string[]
    includeTestFiles: boolean
    maxScanDepth: number
    autoSaveReports: boolean
    reportFormat: 'json' | 'xml' | 'html' | 'pdf'
    enableRealTimeScanning: boolean
    scanTimeout: number
  }
  rules: {
    autoUpdateRules: boolean
    enableCustomRules: boolean
    defaultSeverityFilter: string[]
    ruleUpdateInterval: number
    customRulesPath: string
  }
  notifications: {
    enableDesktopNotifications: boolean
    enableSoundAlerts: boolean
    notifyOnScanComplete: boolean
    notifyOnHighSeverityFound: boolean
    notifyOnScanError: boolean
    emailNotifications: boolean
    emailAddress: string
  }
  ui: {
    theme: 'light' | 'dark' | 'auto'
    language: 'zh-CN' | 'en-US'
    fontSize: number
    compactMode: boolean
    showLineNumbers: boolean
    highlightSyntax: boolean
    autoRefreshInterval: number
  }
  performance: {
    maxMemoryUsage: number
    enableCaching: boolean
    cacheSize: number
    enableParallelProcessing: boolean
    maxWorkerThreads: number
    enableGpuAcceleration: boolean
  }
  security: {
    enableTelemetry: boolean
    allowRemoteRules: boolean
    encryptReports: boolean
    requireAuthentication: boolean
    sessionTimeout: number
    enableAuditLog: boolean
  }
  storage: StorageConfig
}

// 缓存项
interface CacheItem<T> {
  key: string
  value: T
  timestamp: number
  expiry?: number
  size: number
}

// 日志级别
export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

// 日志条目
export interface LogEntry {
  timestamp: string
  level: LogLevel
  category: string
  message: string
  data?: any
  scanId?: string
}

// 本地存储管理类
export class LocalStorage extends EventEmitter {
  private config: StorageConfig
  private cache: Map<string, CacheItem<any>> = new Map()
  private maxCacheSize: number = 100 * 1024 * 1024 // 100MB
  private currentCacheSize: number = 0
  private cleanupTimer?: NodeJS.Timeout

  constructor(config?: Partial<StorageConfig>) {
    super()
    this.config = {
      reportsPath: './reports',
      logsPath: './logs',
      cachePath: './cache',
      configPath: './config',
      maxReportHistory: 100,
      maxLogSize: 50, // 50MB
      enableCompression: true,
      autoCleanup: true,
      cleanupInterval: 30, // 30天
      ...config
    }
    this.initializeStorage()
    this.startCleanupTimer()
  }

  // 初始化存储
  private initializeStorage(): void {
    // 模拟创建目录结构
    console.log('初始化存储目录:', {
      reports: this.config.reportsPath,
      logs: this.config.logsPath,
      cache: this.config.cachePath,
      config: this.config.configPath
    })
  }

  // 启动清理定时器
  private startCleanupTimer(): void {
    if (this.config.autoCleanup) {
      const interval = this.config.cleanupInterval * 24 * 60 * 60 * 1000 // 转换为毫秒
      this.cleanupTimer = setInterval(() => {
        this.performCleanup()
      }, interval)
    }
  }

  // 保存扫描结果
  public async saveScanResult(result: ScanResult): Promise<string> {
    try {
      const filename = `scan_${result.scanId}_${Date.now()}.json`
      const filepath = `${this.config.reportsPath}/${filename}`
      
      // 模拟文件保存
      const data = JSON.stringify(result, null, 2)
      console.log(`保存扫描结果到: ${filepath}`, { size: data.length })
      
      // 添加到历史记录
      await this.addScanHistory({
        id: result.scanId,
        projectPath: result.projectPath,
        projectName: this.extractProjectName(result.projectPath),
        scanType: result.config.scanType,
        status: result.status,
        startTime: result.startTime,
        endTime: result.endTime,
        duration: result.duration,
        config: result.config,
        resultPath: filepath,
        vulnerabilityCount: result.vulnerabilities.length,
        severityStats: result.statistics.severityStats,
        errorMessage: result.errors?.[0]
      })
      
      this.emit('scanResultSaved', { scanId: result.scanId, filepath })
      return filepath
    } catch (error) {
      this.logError('保存扫描结果失败', error, result.scanId)
      throw error
    }
  }

  // 加载扫描结果
  public async loadScanResult(scanId: string): Promise<ScanResult | null> {
    try {
      // 从缓存中查找
      const cached = this.getFromCache<ScanResult>(`scan_result_${scanId}`)
      if (cached) {
        return cached
      }
      
      // 从历史记录中查找文件路径
      const history = await this.getScanHistory(scanId)
      if (!history?.resultPath) {
        return null
      }
      
      // 模拟文件加载
      console.log(`加载扫描结果: ${history.resultPath}`)
      
      // 这里应该是实际的文件读取逻辑
      // 现在返回模拟数据
      const mockResult: ScanResult = {
        scanId,
        projectPath: history.projectPath,
        config: history.config,
        status: history.status,
        startTime: history.startTime,
        endTime: history.endTime,
        duration: history.duration,
        vulnerabilities: [], // 实际应该从文件加载
        statistics: {
          totalFiles: 100,
          scannedFiles: 95,
          skippedFiles: 5,
          vulnerabilityCount: history.vulnerabilityCount,
          severityStats: history.severityStats,
          categoryStats: {},
          languageStats: {}
        },
        performance: {
          memoryUsage: 150,
          cpuUsage: 45,
          diskIO: 25
        }
      }
      
      // 缓存结果
      this.setCache(`scan_result_${scanId}`, mockResult, 3600) // 缓存1小时
      
      return mockResult
    } catch (error) {
      this.logError('加载扫描结果失败', error, scanId)
      return null
    }
  }

  // 删除扫描结果
  public async deleteScanResult(scanId: string): Promise<boolean> {
    try {
      const history = await this.getScanHistory(scanId)
      if (history?.resultPath) {
        // 模拟文件删除
        console.log(`删除扫描结果文件: ${history.resultPath}`)
      }
      
      // 从历史记录中删除
      await this.removeScanHistory(scanId)
      
      // 从缓存中删除
      this.removeFromCache(`scan_result_${scanId}`)
      
      this.emit('scanResultDeleted', { scanId })
      return true
    } catch (error) {
      this.logError('删除扫描结果失败', error, scanId)
      return false
    }
  }

  // 添加扫描历史
  public async addScanHistory(history: ScanHistory): Promise<void> {
    try {
      const histories = await this.getAllScanHistories()
      histories.unshift(history)
      
      // 限制历史记录数量
      if (histories.length > this.config.maxReportHistory) {
        const removed = histories.splice(this.config.maxReportHistory)
        // 删除超出限制的文件
        for (const item of removed) {
          if (item.resultPath) {
            console.log(`删除过期扫描结果: ${item.resultPath}`)
          }
        }
      }
      
      // 保存历史记录
      await this.saveData('scan_histories.json', histories)
      this.emit('scanHistoryAdded', history)
    } catch (error) {
      this.logError('添加扫描历史失败', error)
      throw error
    }
  }

  // 获取扫描历史
  public async getScanHistory(scanId: string): Promise<ScanHistory | null> {
    try {
      const histories = await this.getAllScanHistories()
      return histories.find(h => h.id === scanId) || null
    } catch (error) {
      this.logError('获取扫描历史失败', error, scanId)
      return null
    }
  }

  // 获取所有扫描历史
  public async getAllScanHistories(): Promise<ScanHistory[]> {
    try {
      const cached = this.getFromCache<ScanHistory[]>('scan_histories')
      if (cached) {
        return cached
      }
      
      const histories = await this.loadData<ScanHistory[]>('scan_histories.json') || []
      this.setCache('scan_histories', histories, 300) // 缓存5分钟
      return histories
    } catch (error) {
      this.logError('获取扫描历史失败', error)
      return []
    }
  }

  // 删除扫描历史
  public async removeScanHistory(scanId: string): Promise<boolean> {
    try {
      const histories = await this.getAllScanHistories()
      const index = histories.findIndex(h => h.id === scanId)
      if (index === -1) {
        return false
      }
      
      histories.splice(index, 1)
      await this.saveData('scan_histories.json', histories)
      this.removeFromCache('scan_histories')
      this.emit('scanHistoryRemoved', { scanId })
      return true
    } catch (error) {
      this.logError('删除扫描历史失败', error, scanId)
      return false
    }
  }

  // 保存应用设置
  public async saveSettings(settings: AppSettings): Promise<void> {
    try {
      await this.saveData('app_settings.json', settings)
      this.setCache('app_settings', settings, 3600) // 缓存1小时
      this.emit('settingsSaved', settings)
    } catch (error) {
      this.logError('保存应用设置失败', error)
      throw error
    }
  }

  // 加载应用设置
  public async loadSettings(): Promise<AppSettings> {
    try {
      const cached = this.getFromCache<AppSettings>('app_settings')
      if (cached) {
        return cached
      }
      
      const settings = await this.loadData<AppSettings>('app_settings.json')
      if (settings) {
        this.setCache('app_settings', settings, 3600)
        return settings
      }
      
      // 返回默认设置
      return this.getDefaultSettings()
    } catch (error) {
      this.logError('加载应用设置失败', error)
      return this.getDefaultSettings()
    }
  }

  // 获取默认设置
  private getDefaultSettings(): AppSettings {
    return {
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
      storage: this.config
    }
  }

  // 保存自定义规则
  public async saveCustomRules(rules: Rule[]): Promise<void> {
    try {
      await this.saveData('custom_rules.json', rules)
      this.removeFromCache('custom_rules')
      this.emit('customRulesSaved', rules)
    } catch (error) {
      this.logError('保存自定义规则失败', error)
      throw error
    }
  }

  // 加载自定义规则
  public async loadCustomRules(): Promise<Rule[]> {
    try {
      const cached = this.getFromCache<Rule[]>('custom_rules')
      if (cached) {
        return cached
      }
      
      const rules = await this.loadData<Rule[]>('custom_rules.json') || []
      this.setCache('custom_rules', rules, 1800) // 缓存30分钟
      return rules
    } catch (error) {
      this.logError('加载自定义规则失败', error)
      return []
    }
  }

  // 保存规则集
  public async saveRuleSets(ruleSets: RuleSet[]): Promise<void> {
    try {
      await this.saveData('rule_sets.json', ruleSets)
      this.removeFromCache('rule_sets')
      this.emit('ruleSetsSaved', ruleSets)
    } catch (error) {
      this.logError('保存规则集失败', error)
      throw error
    }
  }

  // 加载规则集
  public async loadRuleSets(): Promise<RuleSet[]> {
    try {
      const cached = this.getFromCache<RuleSet[]>('rule_sets')
      if (cached) {
        return cached
      }
      
      const ruleSets = await this.loadData<RuleSet[]>('rule_sets.json') || []
      this.setCache('rule_sets', ruleSets, 1800) // 缓存30分钟
      return ruleSets
    } catch (error) {
      this.logError('加载规则集失败', error)
      return []
    }
  }

  // 记录日志
  public async log(level: LogLevel, category: string, message: string, data?: any, scanId?: string): Promise<void> {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      data,
      scanId
    }
    
    try {
      // 获取当前日志文件
      const logFile = `${this.config.logsPath}/app_${new Date().toISOString().split('T')[0]}.log`
      
      // 模拟日志写入
      console.log(`[${entry.timestamp}] [${level.toUpperCase()}] [${category}] ${message}`, data)
      
      this.emit('logEntry', entry)
    } catch (error) {
      console.error('写入日志失败:', error)
    }
  }

  // 便捷日志方法
  public logDebug(category: string, message: string, data?: any, scanId?: string): Promise<void> {
    return this.log('debug', category, message, data, scanId)
  }

  public logInfo(category: string, message: string, data?: any, scanId?: string): Promise<void> {
    return this.log('info', category, message, data, scanId)
  }

  public logWarn(category: string, message: string, data?: any, scanId?: string): Promise<void> {
    return this.log('warn', category, message, data, scanId)
  }

  public logError(category: string, message: string, data?: any, scanId?: string): Promise<void> {
    return this.log('error', category, message, data, scanId)
  }

  // 获取日志
  public async getLogs(date?: string, level?: LogLevel, category?: string): Promise<LogEntry[]> {
    try {
      // 模拟日志读取
      const mockLogs: LogEntry[] = [
        {
          timestamp: new Date().toISOString(),
          level: 'info',
          category: 'scan',
          message: '扫描开始',
          scanId: 'scan_001'
        },
        {
          timestamp: new Date().toISOString(),
          level: 'warn',
          category: 'scan',
          message: '发现潜在漏洞',
          data: { count: 5 },
          scanId: 'scan_001'
        }
      ]
      
      let filteredLogs = mockLogs
      
      if (level) {
        filteredLogs = filteredLogs.filter(log => log.level === level)
      }
      
      if (category) {
        filteredLogs = filteredLogs.filter(log => log.category === category)
      }
      
      return filteredLogs
    } catch (error) {
      this.logError('获取日志失败', error)
      return []
    }
  }

  // 缓存操作
  private setCache<T>(key: string, value: T, expiry?: number): void {
    const size = this.calculateSize(value)
    
    // 检查缓存大小限制
    if (this.currentCacheSize + size > this.maxCacheSize) {
      this.evictCache(size)
    }
    
    const item: CacheItem<T> = {
      key,
      value,
      timestamp: Date.now(),
      expiry: expiry ? Date.now() + expiry * 1000 : undefined,
      size
    }
    
    // 删除旧项
    const oldItem = this.cache.get(key)
    if (oldItem) {
      this.currentCacheSize -= oldItem.size
    }
    
    this.cache.set(key, item)
    this.currentCacheSize += size
  }

  private getFromCache<T>(key: string): T | null {
    const item = this.cache.get(key)
    if (!item) {
      return null
    }
    
    // 检查过期时间
    if (item.expiry && Date.now() > item.expiry) {
      this.removeFromCache(key)
      return null
    }
    
    return item.value as T
  }

  private removeFromCache(key: string): boolean {
    const item = this.cache.get(key)
    if (item) {
      this.cache.delete(key)
      this.currentCacheSize -= item.size
      return true
    }
    return false
  }

  // 缓存淘汰策略（LRU）
  private evictCache(requiredSize: number): void {
    const items = Array.from(this.cache.values()).sort((a, b) => a.timestamp - b.timestamp)
    
    for (const item of items) {
      this.removeFromCache(item.key)
      if (this.currentCacheSize + requiredSize <= this.maxCacheSize) {
        break
      }
    }
  }

  // 计算对象大小（简化版）
  private calculateSize(obj: any): number {
    return JSON.stringify(obj).length * 2 // 粗略估算
  }

  // 清理缓存
  public clearCache(): void {
    this.cache.clear()
    this.currentCacheSize = 0
    this.emit('cacheCleared')
  }

  // 执行清理
  private async performCleanup(): Promise<void> {
    try {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - this.config.cleanupInterval)
      
      // 清理过期的扫描历史
      const histories = await this.getAllScanHistories()
      const validHistories = histories.filter(h => new Date(h.startTime) > cutoffDate)
      
      if (validHistories.length < histories.length) {
        await this.saveData('scan_histories.json', validHistories)
        this.removeFromCache('scan_histories')
        this.logInfo('cleanup', `清理了 ${histories.length - validHistories.length} 条过期扫描历史`)
      }
      
      // 清理过期缓存
      const now = Date.now()
      for (const [key, item] of this.cache.entries()) {
        if (item.expiry && now > item.expiry) {
          this.removeFromCache(key)
        }
      }
      
      this.emit('cleanupCompleted')
    } catch (error) {
      this.logError('清理失败', error)
    }
  }

  // 通用数据保存
  private async saveData<T>(filename: string, data: T): Promise<void> {
    const filepath = `${this.config.configPath}/${filename}`
    const content = JSON.stringify(data, null, 2)
    
    // 模拟文件保存
    console.log(`保存数据到: ${filepath}`, { size: content.length })
  }

  // 通用数据加载
  private async loadData<T>(filename: string): Promise<T | null> {
    try {
      const filepath = `${this.config.configPath}/${filename}`
      
      // 模拟文件加载
      console.log(`加载数据: ${filepath}`)
      
      // 这里应该是实际的文件读取逻辑
      // 现在返回null表示文件不存在
      return null
    } catch (error) {
      return null
    }
  }

  // 提取项目名称
  private extractProjectName(projectPath: string): string {
    return projectPath.split(/[\/\\]/).pop() || 'Unknown Project'
  }

  // 获取存储统计信息
  public getStorageStats(): {
    cacheSize: number
    cacheItems: number
    maxCacheSize: number
    cacheHitRate: number
  } {
    return {
      cacheSize: this.currentCacheSize,
      cacheItems: this.cache.size,
      maxCacheSize: this.maxCacheSize,
      cacheHitRate: 0.85 // 模拟值
    }
  }

  // 销毁
  public destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
    }
    this.clearCache()
    this.removeAllListeners()
  }
}

// 导出单例实例
export const localStorage = new LocalStorage()