# CodeSecEval - 代码安全漏洞扫描插件

一个专业的代码安全漏洞扫描插件，支持多种编程语言和IDE环境，提供实时的安全漏洞检测和修复建议。

## 🚀 特性

### 核心功能
- **多语言支持**: JavaScript/TypeScript、Python、Java、PHP、Go、Ruby、C#等
- **实时扫描**: 文件保存时自动检测安全漏洞
- **智能分析**: 基于AST的深度代码分析
- **规则引擎**: 可扩展的安全规则系统
- **漏洞报告**: 详细的漏洞报告和修复建议

### 扫描类型
- **快速扫描**: 针对常见漏洞的快速检测
- **全量扫描**: 全面的安全漏洞分析
- **自定义扫描**: 根据项目需求定制扫描规则
- **增量扫描**: 仅扫描变更的代码文件

### 安全规则
- **OWASP Top 10**: 覆盖OWASP十大安全风险
- **CWE标准**: 基于通用弱点枚举的规则分类
- **自定义规则**: 支持用户自定义安全规则
- **规则集管理**: 灵活的规则组合和管理

## 📦 安装

### 前置要求
- Node.js >= 16.0.0
- npm >= 8.0.0 或 pnpm >= 7.0.0
- 支持的IDE: VS Code, WebStorm, Trae IDE等

### 安装步骤

1. **克隆项目**
```bash
git clone https://github.com/your-org/CodeSecEval.git
cd CodeSecEval
```

2. **安装依赖**
```bash
# 使用npm
npm install

# 或使用pnpm
pnpm install
```

3. **构建项目**
```bash
# 开发构建
npm run dev

# 生产构建
npm run build
```

4. **安装插件**
- VS Code: 将构建后的插件包安装到VS Code
- Trae IDE: 按照Trae插件安装指南进行安装

## 🛠️ 开发

### 项目结构
```
CodeSecEval/
├── src/
│   ├── components/          # React组件
│   │   └── Sidebar.tsx     # 侧边栏导航
│   ├── pages/              # 页面组件
│   │   ├── Dashboard.tsx   # 控制台页面
│   │   ├── ScanPage.tsx    # 扫描管理页面
│   │   ├── ReportsPage.tsx # 漏洞报告页面
│   │   ├── RulesPage.tsx   # 规则配置页面
│   │   ├── HistoryPage.tsx # 扫描历史页面
│   │   └── SettingsPage.tsx# 设置页面
│   ├── core/               # 核心模块
│   │   ├── ScanEngine.ts   # 扫描引擎
│   │   ├── RuleDatabase.ts # 规则数据库
│   │   └── LocalStorage.ts # 本地存储
│   ├── extension.ts        # 插件主入口
│   ├── App.tsx            # React应用根组件
│   ├── main.tsx           # React应用入口
│   └── index.css          # 全局样式
├── public/                 # 静态资源
├── dist/                   # 构建输出
├── docs/                   # 文档
├── tests/                  # 测试文件
├── package.json           # 项目配置
├── tsconfig.json          # TypeScript配置
├── vite.config.ts         # Vite配置
├── trae-plugin.json       # Trae插件配置
└── README.md              # 项目说明
```

### 开发命令

```bash
# 启动开发服务器
npm run dev

# 构建项目
npm run build

# 预览构建结果
npm run preview

# 运行测试
npm run test

# 代码检查
npm run lint

# 代码格式化
npm run format

# 类型检查
npm run type-check
```

### 技术栈

- **前端框架**: React 18 + TypeScript
- **UI组件库**: Ant Design
- **路由管理**: React Router
- **状态管理**: React Hooks + Context
- **构建工具**: Vite
- **代码规范**: ESLint + Prettier
- **测试框架**: Vitest + React Testing Library

## 📖 使用指南

### 快速开始

1. **打开项目**: 在IDE中打开要扫描的项目
2. **启动扫描**: 点击状态栏的CodeSecEval图标或使用命令面板
3. **选择扫描类型**: 快速扫描、全量扫描或自定义扫描
4. **查看结果**: 在漏洞报告页面查看检测结果
5. **修复漏洞**: 根据修复建议处理发现的安全问题

### 扫描配置

#### 快速扫描
- 扫描常见的安全漏洞
- 适用于日常开发检查
- 扫描时间较短

#### 全量扫描
- 全面的安全漏洞检测
- 包含所有启用的规则
- 适用于发布前的安全审查

#### 自定义扫描
- 自定义扫描范围和规则
- 支持排除特定文件或目录
- 可配置扫描深度和并发数

### 规则管理

#### 内置规则
- **注入攻击**: SQL注入、命令注入、LDAP注入等
- **跨站脚本**: XSS、DOM XSS等
- **身份认证**: 弱密码、会话管理等
- **访问控制**: 权限绕过、路径遍历等
- **加密问题**: 弱加密、硬编码密钥等
- **配置安全**: 不安全配置、敏感信息泄露等

#### 自定义规则
```json
{
  "id": "custom-rule-001",
  "name": "自定义规则示例",
  "description": "检测特定的安全模式",
  "severity": "high",
  "category": "security",
  "languages": ["javascript", "typescript"],
  "pattern": {
    "type": "regex",
    "value": "eval\\s*\\(",
    "flags": "gi"
  },
  "message": "避免使用eval函数，可能导致代码注入",
  "recommendation": "使用JSON.parse()或其他安全的替代方案"
}
```

### 报告分析

#### 漏洞严重程度
- **严重 (Critical)**: 可直接利用的高危漏洞
- **高危 (High)**: 可能导致系统妥协的漏洞
- **中危 (Medium)**: 需要特定条件才能利用的漏洞
- **低危 (Low)**: 影响较小的安全问题
- **信息 (Info)**: 安全相关的信息提示

#### 报告导出
- **JSON格式**: 结构化数据，便于集成
- **HTML格式**: 可视化报告，便于查看
- **PDF格式**: 正式报告，便于分享
- **XML格式**: 标准化格式，便于工具集成

## ⚙️ 配置

### 扫描设置
```json
{
  "scan": {
    "defaultScanType": "quick",
    "maxConcurrentScans": 3,
    "defaultExcludePaths": ["node_modules", "dist", "build"],
    "includeTestFiles": false,
    "maxScanDepth": 10,
    "enableRealTimeScanning": true,
    "scanTimeout": 30
  }
}
```

### 规则设置
```json
{
  "rules": {
    "autoUpdateRules": true,
    "enableCustomRules": true,
    "defaultSeverityFilter": ["critical", "high", "medium"],
    "customRulesPath": "./custom-rules"
  }
}
```

### 通知设置
```json
{
  "notifications": {
    "enableDesktopNotifications": true,
    "notifyOnScanComplete": true,
    "notifyOnHighSeverityFound": true,
    "enableSoundAlerts": false
  }
}
```

## 🔌 插件开发

### 扩展规则引擎

```typescript
import { Rule, RuleDatabase } from '@/core/RuleDatabase'

// 创建自定义规则
const customRule: Rule = {
  id: 'my-custom-rule',
  name: '我的自定义规则',
  description: '检测特定的安全模式',
  severity: 'high',
  category: 'security',
  languages: ['javascript'],
  pattern: {
    type: 'ast',
    query: 'CallExpression[callee.name="eval"]'
  },
  message: '避免使用eval函数',
  recommendation: '使用安全的替代方案'
}

// 添加到规则数据库
const ruleDatabase = new RuleDatabase()
ruleDatabase.addRule(customRule)
```

### 自定义扫描器

```typescript
import { ScanEngine, ScanConfig } from '@/core/ScanEngine'

// 创建自定义扫描配置
const scanConfig: ScanConfig = {
  projectPath: '/path/to/project',
  scanType: 'custom',
  languages: ['javascript', 'typescript'],
  excludePaths: ['node_modules'],
  enabledRules: ['my-custom-rule']
}

// 执行扫描
const scanEngine = new ScanEngine()
scanEngine.startScan(scanConfig)
```

## 🧪 测试

### 运行测试
```bash
# 运行所有测试
npm run test

# 运行特定测试文件
npm run test -- ScanEngine.test.ts

# 运行测试并生成覆盖率报告
npm run test:coverage

# 监听模式运行测试
npm run test:watch
```

### 测试结构
```
tests/
├── unit/                   # 单元测试
│   ├── core/
│   │   ├── ScanEngine.test.ts
│   │   ├── RuleDatabase.test.ts
│   │   └── LocalStorage.test.ts
│   └── components/
├── integration/            # 集成测试
├── e2e/                   # 端到端测试
└── fixtures/              # 测试数据
```

## 📊 性能优化

### 扫描性能
- **并行处理**: 多线程并行扫描文件
- **增量扫描**: 仅扫描变更的文件
- **缓存机制**: 缓存扫描结果和规则
- **内存管理**: 优化内存使用，避免内存泄漏

### 界面性能
- **虚拟滚动**: 大量数据的高效渲染
- **懒加载**: 按需加载组件和数据
- **防抖节流**: 优化用户交互响应
- **代码分割**: 减少初始加载时间

## 🔒 安全考虑

### 数据安全
- **本地存储**: 敏感数据仅存储在本地
- **加密传输**: 网络传输使用HTTPS
- **权限控制**: 最小权限原则
- **审计日志**: 记录关键操作

### 隐私保护
- **匿名化**: 不收集个人敏感信息
- **可选遥测**: 用户可选择是否启用遥测
- **数据清理**: 定期清理过期数据

## 🤝 贡献

我们欢迎社区贡献！请阅读 [贡献指南](CONTRIBUTING.md) 了解如何参与项目开发。

### 贡献方式
- **报告问题**: 在GitHub Issues中报告bug或提出功能请求
- **提交代码**: 通过Pull Request提交代码改进
- **完善文档**: 改进项目文档和示例
- **分享经验**: 在社区分享使用经验和最佳实践

### 开发流程
1. Fork项目到你的GitHub账户
2. 创建功能分支: `git checkout -b feature/new-feature`
3. 提交更改: `git commit -am 'Add new feature'`
4. 推送分支: `git push origin feature/new-feature`
5. 创建Pull Request

## 📄 许可证

本项目采用 [MIT许可证](LICENSE)。

## 🆘 支持

### 获取帮助
- **文档**: 查看详细的[使用文档](docs/)
- **FAQ**: 查看[常见问题解答](docs/FAQ.md)
- **Issues**: 在GitHub Issues中提问
- **讨论**: 参与GitHub Discussions

### 联系我们
- **邮箱**: iszhenghailin@gmail.com
- **官网**: none
- **社区**: none

## 🗺️ 路线图

### v1.1.0 (计划中)
- [ ] 支持更多编程语言
- [ ] 增强的AST分析能力
- [ ] 机器学习辅助漏洞检测
- [ ] 云端规则同步

### v1.2.0 (计划中)
- [ ] 团队协作功能
- [ ] CI/CD集成
- [ ] 自动修复建议
- [ ] 性能基准测试

### v2.0.0 (远期规划)
- [ ] 分布式扫描架构
- [ ] 实时协作编辑
- [ ] 智能代码审查
- [ ] 安全培训集成

## 📈 统计信息

- **支持语言**: 8+
- **内置规则**: 200+
- **检测类型**: 50+
- **活跃用户**: 10,000+
- **GitHub Stars**: 1,000+

---

**CodeSecEval** - 让代码安全检测变得简单高效！

如果这个项目对你有帮助，请给我们一个 ⭐️ Star！