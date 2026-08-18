# QA 与最终验证交接

日期：2026-08-19

阶段：Codex 工程与初步体验验收完成；Antigravity 最终验证待执行。

## 自动化结果

| 检查 | 结果 |
| --- | --- |
| `npm test` | 14 个测试文件，49 项测试通过 |
| 标准模式分布 | 300 生涯样本落在好结局 55–65%、球星 10–15%、传奇 2–4% 验收带 |
| `npm run lint` | 通过，0 warning |
| `npm run build` | 通过 |
| `npm run check:bundle` | 核心 JS 401.1 KB / 500 KB 未压缩预算，通过 |
| `npm audit --audit-level=high` | 通过，0 vulnerabilities |

覆盖的单元/契约风险包括：可复现 RNG、OVR 边界、事件 effect key、事件重复限制、赛季推进、转会、国家队、成就、结局、倒计时超时、多存档、导入导出、损坏恢复和旧存档迁移。

## Codex 真实浏览器初检

使用 Playwright CLI 完成以下可玩路径：

1. 首页进入创建页。
2. 创建模拟球员并从上海申花开始。
3. 完成两次关键选择并推进赛季。
4. 打开球员档案、世界、Barcelona 来源抽屉和博物馆。
5. 推进至职业合同与关键比赛。
6. 等待比赛决定超时，确认显示“决定窗口已经关闭”、记录独立后果并可返回时间线。

视口与初检结果：

| 视口 | 页面 | 结果 |
| --- | --- | --- |
| 1440×900 | `/career` | 双栏职业档案、状态带与时间线正常；无横向溢出 |
| 768×1024 | `/world` | 平板布局正常；无横向溢出 |
| 390×844 | `/career`、`/match/:id` | 底部导航、单列决定与比赛视图正常 |
| 320×568 | `/career` | `scrollWidth = 320`，固定底栏存在，无横向溢出 |

浏览器控制台：0 error、0 warning（React 开发提示不计为 warning）。截图保存在本地 `output/playwright/`，不进入产品提交。

## 必须由 Antigravity 完成的最终验证

- 最新 Chrome、Safari、Firefox 的精确 commit 预览。
- Mobile Safari 动态地址栏、`100dvh` 和安全区真机表现。
- 键盘全流程、焦点顺序、抽屉关闭与可见焦点。
- 中文屏幕阅读器的路由播报和压力倒数节奏。
- 俱乐部主题切换的对比度，尤其白色、黄色和浅蓝主色。
- 25–40 分钟完整生涯的节奏、重复感与结局情绪。
- 真实俱乐部名称/传统配色使用和人物扩展入口的权利审查。

## 已知边界

- 当前只完整支持简体中文，尚无运行时语言切换。
- 俱乐部强度是注明日期的编辑型模拟基线，不是实时排名或投注技巧。
- 新版流程未接入第三方分析；分析文档只是未来 allowlist 契约。
- 本地书目记录提供研究路径，但不能替代未来逐条出版信息与页码审校。

## 阶段状态

`ANTIGRAVITY_DESIGN_INPUT: RECEIVED`

`CODEX_SIX_STAGE_PRODUCTION: MR_READY_FOR_FINAL_VALIDATION`

`ANTIGRAVITY_FINAL_VALIDATION: PENDING`
