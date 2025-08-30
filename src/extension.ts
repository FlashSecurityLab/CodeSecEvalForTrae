import * as vscode from 'vscode'
import { ScanEngine } from './core/ScanEngine'
import { RuleDatabase } from './core/RuleDatabase'
import { localStorage } from './core/LocalStorage'
import { EventEmitter } from 'events'

// 插件状态管理
class ExtensionState extends EventEmitter {
  private scanEngine: ScanEngine
  private ruleDatabase: RuleDatabase
  private isActivated: boolean = false
  private statusBarItem: vscode.StatusBarItem
  private outputChannel: vscode.OutputChannel
  private currentScanId?: string

  constructor(context: vscode.ExtensionContext) {
    super()
    
    // 初始化核心组件
    this.scanEngine = new ScanEngine()
    this.ruleDatabase = new RuleDatabase()
    
    // 创建状态栏项
    this.statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Left,
      100
    )
    this.statusBarItem.command = 'codeSecEval.showDashboard'
    this.statusBarItem.text = '$(shield) CodeSecEval'
    this.statusBarItem.tooltip = '代码安全漏洞扫描'
    this.statusBarItem.show()
    
    // 创建输出通道
    this.outputChannel = vscode.window.createOutputChannel('CodeSecEval')
    
    // 注册到上下文
    context.subscriptions.push(
      this.statusBarItem,
      this.outputChannel,
      this.scanEngine,
      this.ruleDatabase
    )
    
    this.setupEventListeners()
  }

  // 设置事件监听器
  private setupEventListeners(): void {
    // 扫描引擎事件
    this.scanEngine.on('scanStarted', (scanId: string) => {
      this.currentScanId = scanId
      this.statusBarItem.text = '$(loading~spin) 扫描中...'
      this.outputChannel.appendLine(`扫描开始: ${scanId}`)
      this.emit('scanStarted', scanId)
    })

    this.scanEngine.on('scanProgress', (progress) => {
      this.statusBarItem.text = `$(loading~spin) 扫描中... ${Math.round(progress.percentage)}%`
      this.emit('scanProgress', progress)
    })

    this.scanEngine.on('scanCompleted', (result) => {
      this.currentScanId = undefined
      this.statusBarItem.text = '$(shield) CodeSecEval'
      
      const vulnCount = result.vulnerabilities.length
      const criticalCount = result.vulnerabilities.filter(v => v.severity === 'critical').length
      
      this.outputChannel.appendLine(`扫描完成: 发现 ${vulnCount} 个漏洞，其中 ${criticalCount} 个严重漏洞`)
      
      // 显示通知
      if (criticalCount > 0) {
        vscode.window.showWarningMessage(
          `扫描完成：发现 ${criticalCount} 个严重安全漏洞`,
          '查看报告'
        ).then(selection => {
          if (selection === '查看报告') {
            vscode.commands.executeCommand('codeSecEval.showReports')
          }
        })
      } else if (vulnCount > 0) {
        vscode.window.showInformationMessage(
          `扫描完成：发现 ${vulnCount} 个安全问题`,
          '查看报告'
        ).then(selection => {
          if (selection === '查看报告') {
            vscode.commands.executeCommand('codeSecEval.showReports')
          }
        })
      } else {
        vscode.window.showInformationMessage('扫描完成：未发现安全问题')
      }
      
      this.emit('scanCompleted', result)
    })

    this.scanEngine.on('scanError', (error) => {
      this.currentScanId = undefined
      this.statusBarItem.text = '$(shield) CodeSecEval'
      this.outputChannel.appendLine(`扫描错误: ${error.message}`)
      
      vscode.window.showErrorMessage(`扫描失败: ${error.message}`)
      this.emit('scanError', error)
    })

    this.scanEngine.on('vulnerabilityFound', (vulnerability) => {
      this.outputChannel.appendLine(
        `发现漏洞: ${vulnerability.rule.name} 在 ${vulnerability.file}:${vulnerability.line}`
      )
      this.emit('vulnerabilityFound', vulnerability)
    })

    // 本地存储事件
    localStorage.on('scanResultSaved', (data) => {
      this.outputChannel.appendLine(`扫描结果已保存: ${data.filepath}`)
    })

    localStorage.on('settingsSaved', () => {
      this.outputChannel.appendLine('设置已保存')
    })
  }

  // 获取扫描引擎
  public getScanEngine(): ScanEngine {
    return this.scanEngine
  }

  // 获取规则数据库
  public getRuleDatabase(): RuleDatabase {
    return this.ruleDatabase
  }

  // 获取输出通道
  public getOutputChannel(): vscode.OutputChannel {
    return this.outputChannel
  }

  // 获取当前扫描ID
  public getCurrentScanId(): string | undefined {
    return this.currentScanId
  }

  // 激活状态
  public setActivated(activated: boolean): void {
    this.isActivated = activated
    if (activated) {
      this.outputChannel.appendLine('CodeSecEval 插件已激活')
    }
  }

  public isExtensionActivated(): boolean {
    return this.isActivated
  }
}

// 全局状态实例
let extensionState: ExtensionState

// 插件激活函数
export function activate(context: vscode.ExtensionContext) {
  console.log('CodeSecEval 插件正在激活...')
  
  // 初始化扩展状态
  extensionState = new ExtensionState(context)
  extensionState.setActivated(true)
  
  // 注册命令
  registerCommands(context)
  
  // 注册文件系统监听器
  registerFileWatchers(context)
  
  // 注册编辑器装饰器
  registerDecorators(context)
  
  // 加载设置
  loadSettings()
  
  console.log('CodeSecEval 插件激活完成')
}

// 插件停用函数
export function deactivate() {
  console.log('CodeSecEval 插件正在停用...')
  
  if (extensionState) {
    // 停止当前扫描
    const currentScanId = extensionState.getCurrentScanId()
    if (currentScanId) {
      extensionState.getScanEngine().cancelScan(currentScanId)
    }
    
    extensionState.setActivated(false)
    extensionState.removeAllListeners()
  }
  
  // 清理资源
  localStorage.destroy()
  
  console.log('CodeSecEval 插件停用完成')
}

// 注册命令
function registerCommands(context: vscode.ExtensionContext) {
  const commands = [
    // 主要功能命令
    vscode.commands.registerCommand('codeSecEval.showDashboard', showDashboard),
    vscode.commands.registerCommand('codeSecEval.showScanPage', showScanPage),
    vscode.commands.registerCommand('codeSecEval.showReports', showReports),
    vscode.commands.registerCommand('codeSecEval.showRules', showRules),
    vscode.commands.registerCommand('codeSecEval.showHistory', showHistory),
    vscode.commands.registerCommand('codeSecEval.showSettings', showSettings),
    
    // 扫描命令
    vscode.commands.registerCommand('codeSecEval.quickScan', quickScan),
    vscode.commands.registerCommand('codeSecEval.fullScan', fullScan),
    vscode.commands.registerCommand('codeSecEval.customScan', customScan),
    vscode.commands.registerCommand('codeSecEval.stopScan', stopScan),
    vscode.commands.registerCommand('codeSecEval.scanCurrentFile', scanCurrentFile),
    vscode.commands.registerCommand('codeSecEval.scanWorkspace', scanWorkspace),
    
    // 规则管理命令
    vscode.commands.registerCommand('codeSecEval.enableRule', enableRule),
    vscode.commands.registerCommand('codeSecEval.disableRule', disableRule),
    vscode.commands.registerCommand('codeSecEval.createRule', createRule),
    vscode.commands.registerCommand('codeSecEval.editRule', editRule),
    vscode.commands.registerCommand('codeSecEval.deleteRule', deleteRule),
    vscode.commands.registerCommand('codeSecEval.importRules', importRules),
    vscode.commands.registerCommand('codeSecEval.exportRules', exportRules),
    
    // 报告命令
    vscode.commands.registerCommand('codeSecEval.exportReport', exportReport),
    vscode.commands.registerCommand('codeSecEval.clearReports', clearReports),
    vscode.commands.registerCommand('codeSecEval.viewVulnerability', viewVulnerability),
    
    // 设置命令
    vscode.commands.registerCommand('codeSecEval.resetSettings', resetSettings),
    vscode.commands.registerCommand('codeSecEval.importSettings', importSettings),
    vscode.commands.registerCommand('codeSecEval.exportSettings', exportSettings)
  ]
  
  commands.forEach(command => context.subscriptions.push(command))
}

// 注册文件监听器
function registerFileWatchers(context: vscode.ExtensionContext) {
  // 监听文件变化以进行实时扫描
  const fileWatcher = vscode.workspace.createFileSystemWatcher('**/*.{js,ts,jsx,tsx,py,java,php,go,rb,cs}')
  
  fileWatcher.onDidChange(async (uri) => {
    const settings = await localStorage.loadSettings()
    if (settings.scan.enableRealTimeScanning) {
      // 延迟扫描以避免频繁触发
      setTimeout(() => {
        scanFile(uri.fsPath)
      }, 1000)
    }
  })
  
  context.subscriptions.push(fileWatcher)
}

// 注册装饰器
function registerDecorators(context: vscode.ExtensionContext) {
  // 创建漏洞装饰器类型
  const criticalDecorationType = vscode.window.createTextEditorDecorationType({
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    border: '1px solid red',
    borderRadius: '2px'
  })
  
  const highDecorationType = vscode.window.createTextEditorDecorationType({
    backgroundColor: 'rgba(255, 165, 0, 0.1)',
    border: '1px solid orange',
    borderRadius: '2px'
  })
  
  const mediumDecorationType = vscode.window.createTextEditorDecorationType({
    backgroundColor: 'rgba(255, 255, 0, 0.1)',
    border: '1px solid yellow',
    borderRadius: '2px'
  })
  
  context.subscriptions.push(
    criticalDecorationType,
    highDecorationType,
    mediumDecorationType
  )
  
  // 监听编辑器变化以更新装饰器
  vscode.window.onDidChangeActiveTextEditor(updateDecorations)
  vscode.workspace.onDidChangeTextDocument(updateDecorations)
  
  function updateDecorations() {
    const editor = vscode.window.activeTextEditor
    if (!editor) return
    
    // 这里应该根据扫描结果更新装饰器
    // 现在只是示例代码
    const criticalRanges: vscode.DecorationOptions[] = []
    const highRanges: vscode.DecorationOptions[] = []
    const mediumRanges: vscode.DecorationOptions[] = []
    
    editor.setDecorations(criticalDecorationType, criticalRanges)
    editor.setDecorations(highDecorationType, highRanges)
    editor.setDecorations(mediumDecorationType, mediumRanges)
  }
}

// 加载设置
async function loadSettings() {
  try {
    const settings = await localStorage.loadSettings()
    console.log('设置加载完成:', settings)
  } catch (error) {
    console.error('加载设置失败:', error)
  }
}

// 命令实现
async function showDashboard() {
  const panel = vscode.window.createWebviewPanel(
    'codeSecEvalDashboard',
    'CodeSecEval - 控制台',
    vscode.ViewColumn.One,
    {
      enableScripts: true,
      retainContextWhenHidden: true
    }
  )
  
  panel.webview.html = getWebviewContent('dashboard')
}

async function showScanPage() {
  const panel = vscode.window.createWebviewPanel(
    'codeSecEvalScan',
    'CodeSecEval - 扫描管理',
    vscode.ViewColumn.One,
    {
      enableScripts: true,
      retainContextWhenHidden: true
    }
  )
  
  panel.webview.html = getWebviewContent('scan')
}

async function showReports() {
  const panel = vscode.window.createWebviewPanel(
    'codeSecEvalReports',
    'CodeSecEval - 漏洞报告',
    vscode.ViewColumn.One,
    {
      enableScripts: true,
      retainContextWhenHidden: true
    }
  )
  
  panel.webview.html = getWebviewContent('reports')
}

async function showRules() {
  const panel = vscode.window.createWebviewPanel(
    'codeSecEvalRules',
    'CodeSecEval - 规则配置',
    vscode.ViewColumn.One,
    {
      enableScripts: true,
      retainContextWhenHidden: true
    }
  )
  
  panel.webview.html = getWebviewContent('rules')
}

async function showHistory() {
  const panel = vscode.window.createWebviewPanel(
    'codeSecEvalHistory',
    'CodeSecEval - 扫描历史',
    vscode.ViewColumn.One,
    {
      enableScripts: true,
      retainContextWhenHidden: true
    }
  )
  
  panel.webview.html = getWebviewContent('history')
}

async function showSettings() {
  const panel = vscode.window.createWebviewPanel(
    'codeSecEvalSettings',
    'CodeSecEval - 设置',
    vscode.ViewColumn.One,
    {
      enableScripts: true,
      retainContextWhenHidden: true
    }
  )
  
  panel.webview.html = getWebviewContent('settings')
}

// 扫描命令实现
async function quickScan() {
  const workspaceFolders = vscode.workspace.workspaceFolders
  if (!workspaceFolders) {
    vscode.window.showErrorMessage('请先打开一个工作区')
    return
  }
  
  const projectPath = workspaceFolders[0].uri.fsPath
  const scanEngine = extensionState.getScanEngine()
  
  try {
    await scanEngine.startScan({
      projectPath,
      scanType: 'quick',
      languages: ['javascript', 'typescript'],
      excludePaths: ['node_modules', 'dist'],
      includeTestFiles: false,
      maxDepth: 5,
      enabledRules: []
    })
  } catch (error) {
    vscode.window.showErrorMessage(`快速扫描失败: ${error}`)
  }
}

async function fullScan() {
  const workspaceFolders = vscode.workspace.workspaceFolders
  if (!workspaceFolders) {
    vscode.window.showErrorMessage('请先打开一个工作区')
    return
  }
  
  const projectPath = workspaceFolders[0].uri.fsPath
  const scanEngine = extensionState.getScanEngine()
  
  try {
    await scanEngine.startScan({
      projectPath,
      scanType: 'full',
      languages: ['javascript', 'typescript', 'python', 'java'],
      excludePaths: ['node_modules'],
      includeTestFiles: true,
      maxDepth: 10,
      enabledRules: []
    })
  } catch (error) {
    vscode.window.showErrorMessage(`全量扫描失败: ${error}`)
  }
}

async function customScan() {
  // 显示自定义扫描配置界面
  showScanPage()
}

async function stopScan() {
  const currentScanId = extensionState.getCurrentScanId()
  if (!currentScanId) {
    vscode.window.showInformationMessage('当前没有正在进行的扫描')
    return
  }
  
  const scanEngine = extensionState.getScanEngine()
  try {
    await scanEngine.cancelScan(currentScanId)
    vscode.window.showInformationMessage('扫描已停止')
  } catch (error) {
    vscode.window.showErrorMessage(`停止扫描失败: ${error}`)
  }
}

async function scanCurrentFile() {
  const editor = vscode.window.activeTextEditor
  if (!editor) {
    vscode.window.showErrorMessage('请先打开一个文件')
    return
  }
  
  await scanFile(editor.document.fileName)
}

async function scanWorkspace() {
  await fullScan()
}

// 扫描单个文件
async function scanFile(filePath: string) {
  const scanEngine = extensionState.getScanEngine()
  
  try {
    await scanEngine.startScan({
      projectPath: filePath,
      scanType: 'custom',
      languages: ['javascript', 'typescript'],
      excludePaths: [],
      includeTestFiles: true,
      maxDepth: 1,
      enabledRules: []
    })
  } catch (error) {
    console.error('文件扫描失败:', error)
  }
}

// 规则管理命令实现
async function enableRule(ruleId: string) {
  const ruleDatabase = extensionState.getRuleDatabase()
  try {
    await ruleDatabase.enableRule(ruleId)
    vscode.window.showInformationMessage(`规则 ${ruleId} 已启用`)
  } catch (error) {
    vscode.window.showErrorMessage(`启用规则失败: ${error}`)
  }
}

async function disableRule(ruleId: string) {
  const ruleDatabase = extensionState.getRuleDatabase()
  try {
    await ruleDatabase.disableRule(ruleId)
    vscode.window.showInformationMessage(`规则 ${ruleId} 已禁用`)
  } catch (error) {
    vscode.window.showErrorMessage(`禁用规则失败: ${error}`)
  }
}

async function createRule() {
  showRules()
}

async function editRule(ruleId: string) {
  showRules()
}

async function deleteRule(ruleId: string) {
  const ruleDatabase = extensionState.getRuleDatabase()
  try {
    await ruleDatabase.deleteRule(ruleId)
    vscode.window.showInformationMessage(`规则 ${ruleId} 已删除`)
  } catch (error) {
    vscode.window.showErrorMessage(`删除规则失败: ${error}`)
  }
}

async function importRules() {
  const options: vscode.OpenDialogOptions = {
    canSelectMany: false,
    openLabel: '导入规则',
    filters: {
      'JSON files': ['json']
    }
  }
  
  const fileUri = await vscode.window.showOpenDialog(options)
  if (fileUri && fileUri[0]) {
    try {
      // 这里应该实现实际的导入逻辑
      vscode.window.showInformationMessage('规则导入成功')
    } catch (error) {
      vscode.window.showErrorMessage(`导入规则失败: ${error}`)
    }
  }
}

async function exportRules() {
  const options: vscode.SaveDialogOptions = {
    saveLabel: '导出规则',
    filters: {
      'JSON files': ['json']
    }
  }
  
  const fileUri = await vscode.window.showSaveDialog(options)
  if (fileUri) {
    try {
      // 这里应该实现实际的导出逻辑
      vscode.window.showInformationMessage('规则导出成功')
    } catch (error) {
      vscode.window.showErrorMessage(`导出规则失败: ${error}`)
    }
  }
}

// 报告命令实现
async function exportReport() {
  const options: vscode.SaveDialogOptions = {
    saveLabel: '导出报告',
    filters: {
      'JSON files': ['json'],
      'HTML files': ['html'],
      'PDF files': ['pdf']
    }
  }
  
  const fileUri = await vscode.window.showSaveDialog(options)
  if (fileUri) {
    try {
      // 这里应该实现实际的导出逻辑
      vscode.window.showInformationMessage('报告导出成功')
    } catch (error) {
      vscode.window.showErrorMessage(`导出报告失败: ${error}`)
    }
  }
}

async function clearReports() {
  const result = await vscode.window.showWarningMessage(
    '确定要清除所有扫描报告吗？此操作不可撤销。',
    '确定',
    '取消'
  )
  
  if (result === '确定') {
    try {
      // 这里应该实现实际的清除逻辑
      vscode.window.showInformationMessage('报告已清除')
    } catch (error) {
      vscode.window.showErrorMessage(`清除报告失败: ${error}`)
    }
  }
}

async function viewVulnerability(vulnerabilityId: string) {
  // 跳转到漏洞位置
  try {
    // 这里应该实现实际的跳转逻辑
    vscode.window.showInformationMessage(`查看漏洞: ${vulnerabilityId}`)
  } catch (error) {
    vscode.window.showErrorMessage(`查看漏洞失败: ${error}`)
  }
}

// 设置命令实现
async function resetSettings() {
  const result = await vscode.window.showWarningMessage(
    '确定要重置所有设置吗？此操作不可撤销。',
    '确定',
    '取消'
  )
  
  if (result === '确定') {
    try {
      // 这里应该实现实际的重置逻辑
      vscode.window.showInformationMessage('设置已重置')
    } catch (error) {
      vscode.window.showErrorMessage(`重置设置失败: ${error}`)
    }
  }
}

async function importSettings() {
  const options: vscode.OpenDialogOptions = {
    canSelectMany: false,
    openLabel: '导入设置',
    filters: {
      'JSON files': ['json']
    }
  }
  
  const fileUri = await vscode.window.showOpenDialog(options)
  if (fileUri && fileUri[0]) {
    try {
      // 这里应该实现实际的导入逻辑
      vscode.window.showInformationMessage('设置导入成功')
    } catch (error) {
      vscode.window.showErrorMessage(`导入设置失败: ${error}`)
    }
  }
}

async function exportSettings() {
  const options: vscode.SaveDialogOptions = {
    saveLabel: '导出设置',
    filters: {
      'JSON files': ['json']
    }
  }
  
  const fileUri = await vscode.window.showSaveDialog(options)
  if (fileUri) {
    try {
      // 这里应该实现实际的导出逻辑
      vscode.window.showInformationMessage('设置导出成功')
    } catch (error) {
      vscode.window.showErrorMessage(`导出设置失败: ${error}`)
    }
  }
}

// 获取Webview内容
function getWebviewContent(page: string): string {
  return `
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>CodeSecEval - ${page}</title>
        <style>
            body {
                font-family: var(--vscode-font-family);
                font-size: var(--vscode-font-size);
                color: var(--vscode-foreground);
                background-color: var(--vscode-editor-background);
                margin: 0;
                padding: 20px;
            }
            .container {
                max-width: 1200px;
                margin: 0 auto;
            }
            .header {
                border-bottom: 1px solid var(--vscode-panel-border);
                padding-bottom: 20px;
                margin-bottom: 20px;
            }
            .title {
                font-size: 24px;
                font-weight: bold;
                margin: 0;
            }
            .description {
                color: var(--vscode-descriptionForeground);
                margin-top: 8px;
            }
            .content {
                display: flex;
                flex-direction: column;
                gap: 20px;
            }
            .card {
                background-color: var(--vscode-editor-background);
                border: 1px solid var(--vscode-panel-border);
                border-radius: 4px;
                padding: 20px;
            }
            .button {
                background-color: var(--vscode-button-background);
                color: var(--vscode-button-foreground);
                border: none;
                padding: 8px 16px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 14px;
            }
            .button:hover {
                background-color: var(--vscode-button-hoverBackground);
            }
            .loading {
                text-align: center;
                padding: 40px;
                color: var(--vscode-descriptionForeground);
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1 class="title">CodeSecEval - ${getPageTitle(page)}</h1>
                <p class="description">${getPageDescription(page)}</p>
            </div>
            <div class="content">
                <div class="card">
                    <div class="loading">
                        <p>正在加载 ${getPageTitle(page)} 界面...</p>
                        <p>请稍候，界面即将准备就绪。</p>
                    </div>
                </div>
            </div>
        </div>
        
        <script>
            const vscode = acquireVsCodeApi();
            
            // 页面初始化
            document.addEventListener('DOMContentLoaded', function() {
                console.log('${page} 页面已加载');
                
                // 向扩展发送消息
                vscode.postMessage({
                    command: 'pageLoaded',
                    page: '${page}'
                });
            });
            
            // 监听来自扩展的消息
            window.addEventListener('message', event => {
                const message = event.data;
                console.log('收到消息:', message);
                
                switch (message.command) {
                    case 'updateData':
                        updatePageData(message.data);
                        break;
                    case 'showError':
                        showError(message.error);
                        break;
                }
            });
            
            function updatePageData(data) {
                console.log('更新页面数据:', data);
                // 这里应该实现具体的数据更新逻辑
            }
            
            function showError(error) {
                console.error('页面错误:', error);
                // 这里应该实现错误显示逻辑
            }
        </script>
    </body>
    </html>
  `
}

// 获取页面标题
function getPageTitle(page: string): string {
  const titles: { [key: string]: string } = {
    dashboard: '控制台',
    scan: '扫描管理',
    reports: '漏洞报告',
    rules: '规则配置',
    history: '扫描历史',
    settings: '设置'
  }
  return titles[page] || '未知页面'
}

// 获取页面描述
function getPageDescription(page: string): string {
  const descriptions: { [key: string]: string } = {
    dashboard: '查看扫描统计、最近扫描记录和快速操作',
    scan: '配置和执行代码安全扫描任务',
    reports: '查看和管理安全漏洞报告',
    rules: '管理安全扫描规则和规则集',
    history: '查看扫描历史记录和详细信息',
    settings: '配置应用程序设置和偏好'
  }
  return descriptions[page] || ''
}

// 导出扩展状态（用于测试）
export function getExtensionState(): ExtensionState | undefined {
  return extensionState
}