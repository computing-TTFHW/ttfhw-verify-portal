---
name: ttfhw-portal-archiver
description: |
  将新的 ttfhw-verify 验证报告 JSON 归档到 ttfhw-verify-portal 仓库的 public/data/ 目录，
  生成批次清单和摘要，检查未分类仓库并通过交互提示补全社区分类映射，最后重建并推送。
  当用户说"归档验证报告"、"归档json数据"、"新增批次"、"archive reports"、
  "添加验证数据到看板"、"更新看板数据"时触发。

  需要同时修改 src/data-loader.ts 和 scripts/generate-manifest.mjs 两个文件中的
  REPO_COMMUNITY_MAP 和 REPO_NAME_NORMALIZE 映射表。

  仓库地址: https://github.com/computing-TTFHW/ttfhw-verify-portal
  本地路径: /home/wangsike/workspace/ttfhw/ttfhw-report2.0/ttfhw-verify-portal
  GitHub Pages: https://computing-ttfhw.github.io/ttfhw-verify-portal/
---

# TTFHW Portal 数据归档

将验证报告 JSON 归档到 `ttfhw-verify-portal` 仓库的 `public/data/<批次目录>/` 下，
生成清单和摘要，检查未分类仓库，交互补全分类映射，重建并推送。

## 项目位置

| 项目 | 值 |
|------|-----|
| 仓库 | `computing-TTFHW/ttfhw-verify-portal` |
| 本地路径 | `/home/wangsike/workspace/ttfhw/ttfhw-report2.0/ttfhw-verify-portal` |
| 数据目录 | `public/data/` |
| 前端分类映射 | `src/data-loader.ts` 中的 `REPO_COMMUNITY_MAP` 和 `REPO_NAME_NORMALIZE` |
| 脚本分类映射 | `scripts/generate-manifest.mjs` 中的 `REPO_COMMUNITY_MAP` 和 `REPO_NAME_NORMALIZE` |
| 清单生成脚本 | `scripts/generate-manifest.mjs` |
| 构建命令 | `npm run build` |
| 清单命令 | `npm run manifest` (即 `node scripts/generate-manifest.mjs`) |

## 目录命名规则

格式：`年` + `月` + `日`，**无前导零**。

| 目录名 | 日期 |
|--------|------|
| `2026723` | 2026-07-23 |
| `2026728` | 2026-07-28 |
| `202685` | 2026-08-05 |
| `20261015` | 2026-10-15 |

- 每个归档日期对应一个目录
- 同一天多次归档，文件添加到同一目录
- 文件命名：`verification_report_<repo>_<YYYYMMDD>.json`（日期有前导零）

## 工作流程

### 步骤 1：确认归档来源

询问用户验证报告 JSON 文件的位置（本地目录路径），以及本次归档的日期。

如果用户已提供来源路径和日期，跳过询问。

### 步骤 2：创建批次目录并复制文件

1. 进入项目目录：`/home/wangsike/workspace/ttfhw/ttfhw-report2.0/ttfhw-verify-portal`
2. 根据归档日期生成目录名（年+月+日，无前导零）
3. 如果目录已存在，说明当天已有归档，文件将合并到同一目录
4. 复制所有 `verification_report_*.json` 文件到 `public/data/<目录名>/`

```bash
# 示例
BATCH_DIR=public/data/202685
mkdir -p "$BATCH_DIR"
cp /path/to/reports/verification_report_*.json "$BATCH_DIR/"
```

### 步骤 3：生成清单和摘要

运行清单生成脚本：

```bash
npm run manifest
```

该脚本会：
- 扫描 `public/data/` 下所有批次目录
- 对每个目录：读取所有 JSON 文件，提取摘要字段，生成 `_summary.json`
- 生成顶层 `index.json`（批次列表，按日期降序）

### 步骤 4：检查未分类仓库（关键步骤）

扫描刚生成的 `_summary.json`，找出 `category` 为 `null` 或 `undefined` 的仓库：

```bash
python3 -c "
import json, sys
batch_id = '<批次目录名>'
with open(f'public/data/{batch_id}/_summary.json') as f:
    summaries = json.load(f)
uncategorized = [s for s in summaries if not s.get('category')]
if uncategorized:
    print(f'发现 {len(uncategorized)} 个未分类仓库：')
    for s in uncategorized:
        print(f'  - {s[\"displayName\"]:30s} url={s.get(\"url\", \"N/A\")}')
else:
    print('所有仓库已分类')
"
```

#### 如果有未分类仓库

对每个未分类仓库，**使用 question 工具交互式询问用户**：

```
仓库: <displayName>
URL: <url>
repoKey: <normalizeRepoKey 后的值>

请输入该仓库的社区分类（如 CANN、MindIE、MindSpeed、PyTorch、openEuler、
UBSCore、HPCKit、openUBMC、BoostKit、openGauss、Ascend、MindCluster、MindSDK 等）：
```

收集到用户输入后，将新映射添加到以下两个文件的 `REPO_COMMUNITY_MAP` 中：

1. `src/data-loader.ts` — 前端运行时使用
2. `scripts/generate-manifest.mjs` — 清单生成时使用

添加格式（在 `REPO_COMMUNITY_MAP` 对象中）：
```typescript
'<repoKey>': '<用户输入的社区名>',
```

其中 `<repoKey>` 是 `normalizeRepoName(name).toLowerCase().replace(/[-_]/g, '-')` 的结果。

如果仓库名需要显示规范化（如 `amct` → `AMCT`），同时在两个文件的 `REPO_NAME_NORMALIZE` 中添加映射。

#### 更新映射的注意事项

- **两个文件必须同步修改**：`src/data-loader.ts` 和 `scripts/generate-manifest.mjs` 中的
  `REPO_COMMUNITY_MAP` 和 `REPO_NAME_NORMALIZE` 必须保持一致
- 使用 `edit` 工具精确插入新条目，不要重写整个文件
- 插入位置：在 `REPO_COMMUNITY_MAP` 对象的最后一行之前

### 步骤 5：重新生成清单

分类映射更新后，重新运行清单生成脚本，确保所有仓库都有正确的分类：

```bash
npm run manifest
```

再次检查是否还有未分类仓库，如果有则重复步骤 4。

### 步骤 6：构建验证

```bash
npm run build
```

确认构建成功，无 TypeScript 错误。

### 步骤 7：提交并推送

```bash
git add public/data/ src/data-loader.ts scripts/generate-manifest.mjs
git commit -m "data: 归档 <日期> 批次验证报告（<N> 份）"
git push
```

提交信息格式：`data: 归档 <日期> 批次验证报告（<N> 份）`

### 步骤 8：验证部署

等待约 30 秒后验证 GitHub Pages 部署：

```bash
# 检查首页
curl -s -o /dev/null -w "Homepage: HTTP %{http_code}\n" https://computing-ttfhw.github.io/ttfhw-verify-portal/

# 检查新批次数据
curl -s https://computing-ttfhw.github.io/ttfhw-verify-portal/data/index.json | python3 -c "
import json, sys
d = json.load(sys.stdin)
for b in d['batches']:
    print(f'{b[\"id\"]}: {b[\"date\"]} ({b[\"fileCount\"]} repos)')
"

# 检查 GitHub Actions 状态
gh run list --repo computing-TTFHW/ttfhw-verify-portal --limit 3
```

## 已知社区列表

当前已有的社区分类（用户输入时可参考，也可输入新社区名）：

| 社区 | 典型仓库 | GitCode 组织 |
|------|----------|-------------|
| CANN | ops-nn, hccl, shmem, amct, runtime | cann |
| MindIE | MindIE-Motor, MindIE-LLM, MindIE-SD | Ascend |
| MindSpeed | MindSpeed, MindSpeed-LLM, MindSpeed-MM | Ascend |
| PyTorch | pytorch, op-plugin, torchair | Ascend |
| openEuler | kernel, iSulad, A-Tune, stratovirt | openeuler |
| UBSCore | ubs-engine, ubs-io, ubs-mem, ham | openeuler |
| HPCKit | kupl, kutacc, kudnn, hmpi, xucg | kunpengcompute |
| openUBMC | libmcpp, devmon, libipmi, webui | openUBMC |
| BoostKit | KAE, kpglibc, Ultrascan | boostkit |
| openGauss | Plugin, oGRAC | openGauss |
| Ascend | AgentSDK, IndexSDK, AscendDeployer, RAGSDK | Ascend |
| MindCluster | mind-cluster | Ascend |
| MindSDK | mskl, mskpp, msmonitor, MultimodalSDK | Ascend |

## 文件结构

```
ttfhw-verify-portal/
├── public/data/
│   ├── index.json                    # 批次清单（自动生成）
│   ├── 2026728/                      # 批次目录
│   │   ├── _summary.json             # 预计算摘要（自动生成）
│   │   └── verification_report_*.json
│   └── 2026723/
│       ├── _summary.json
│       └── verification_report_*.json
├── src/
│   └── data-loader.ts                # 前端数据加载+分类映射（需手动维护）
├── scripts/
│   └── generate-manifest.mjs         # 清单生成+分类映射（需手动维护）
└── .github/workflows/
    └── deploy.yml                    # 自动构建部署
```

## 常见问题

### Q: 新仓库不属于任何已知社区怎么办？

A: 在交互提示中输入新的社区名称，skill 会自动将其添加到映射表中。下次有同社区的新仓库时直接使用该名称即可。

### Q: 同一仓库有多个版本/批次的报告怎么办？

A: 每个批次目录独立存放。清单生成脚本会自动按文件名日期去重（保留最新版本）。首页可通过批次选择器切换查看不同批次的数据。

### Q: 归档后发现分类错误怎么办？

A: 直接编辑 `src/data-loader.ts` 和 `scripts/generate-manifest.mjs` 中的 `REPO_COMMUNITY_MAP`，修正对应条目后重新运行 `npm run manifest && npm run build`。
