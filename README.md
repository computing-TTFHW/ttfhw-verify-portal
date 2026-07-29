# TTFHW 验证报告看板

TTFHW 仓库验证报告的动态看板。数据与前端一体化，运行时动态渲染 JSON 数据，支持按批次目录切换展示。

## 架构

- **前端**: Vite + React 18 + TypeScript + Tailwind CSS
- **路由**: HashRouter (GitHub Pages 兼容)
- **数据**: 运行时 fetch 静态 JSON，无需后端服务
- **部署**: GitHub Pages (自动构建)

## 页面

| 路由 | 页面 | 说明 |
|------|------|------|
| `#/` | 首页 | 统计概览、结果分布图表、社区治理优先级、仓库列表表格、批次选择器 |
| `#/repo/:name` | 仓库详情 | 构建结果、UT 统计、环境配置、执行日志、文档缺口、问题记录 |

## 数据组织

```
public/data/
├── index.json                    # 批次清单（自动生成）
├── 2026728/                      # 批次目录（年+月+日，无前导零）
│   ├── _summary.json             # 该批次预计算摘要（自动生成）
│   ├── verification_report_pytorch_20260727.json
│   └── ...
└── 2026723/
    ├── _summary.json
    └── ...
```

### 数据流

```
App 启动 → fetch /data/index.json → 获取批次列表
         → 默认选中最新批次
         → fetch /data/<batch>/_summary.json → 渲染首页仪表盘

用户切换批次 → fetch 新批次 _summary.json → 重新渲染

用户点击仓库 → navigate #/repo/<name>
             → 从 summaries 查找对应 file
             → fetch /data/<batch>/<file> → 渲染详情页
```

## 本地开发

```bash
npm install
npm run manifest    # 生成 index.json 和 _summary.json
npm run dev         # 启动开发服务器
```

## 构建

```bash
npm run manifest    # 重新生成清单（数据变更后）
npm run build       # 构建到 dist/
```

## 添加新数据批次

1. 在 `public/data/` 下创建新目录（如 `202685` = 8月5日）
2. 将验证报告 JSON 文件复制进去
3. 运行 `npm run manifest`（或推送到 main，CI 自动执行）
4. 提交并推送

## 目录命名规则

- 格式: `年` + `月` + `日`（无前导零）
- 示例: `2026723` = 2026-07-23，`20261015` = 2026-10-15

## 技术栈

| 依赖 | 用途 |
|------|------|
| react 18 | UI 框架 |
| react-router-dom 7 | Hash 路由 |
| recharts | 图表（饼图、柱状图） |
| lucide-react | 图标 |
| tailwindcss | 样式 |
| @tanstack/react-virtual | 虚拟滚动列表 |

## GitHub Pages

部署地址: `https://computing-ttfhw.github.io/ttfhw-verify-portal/`

`vite.config.ts` 中 `base: '/ttfhw-verify-portal/'` 确保 GitHub Pages 子路径下资源正确加载。
