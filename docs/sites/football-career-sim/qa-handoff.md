# 《第 91 分钟》Codex 初步 QA 交付

CODEX_PHASE_2: READY_FOR_ANTIGRAVITY_VALIDATION

ANTIGRAVITY_PHASE_3: PENDING

## 自动化门槛

| 检查 | 结果 |
| --- | --- |
| `npm run lint` | PASS，0 warnings |
| `npm test -- --run` | PASS，3 个测试文件、11 个测试 |
| `npm run build` | PASS，Vite 生产构建与 `404.html` 静态回退生成成功 |
| `npm run check:bundle` | PASS，核心 JS 281.1KB / 500KB 未压缩预算 |
| `npm audit --audit-level=high` | PASS，0 vulnerabilities |
| 内容合同 | PASS，56 个生涯情境、59 个术语、6 个阶段、术语/来源/深链完整 |
| 初学者启发式扫描 | 0 个 P0/P1/P2；1 个经人工确认的 P3 数字关系误报 |

## 浏览器原型检查

浏览器：Chromium 自动化实浏览器；本地 Vite 生产镜像与开发态均完成抽样。控制台最终生产会话为 0 errors / 0 warnings。

| 视口 | 路线与状态 | 结果 |
| --- | --- | --- |
| 1440×900 | `/`、`/career`、`/database?q=脑震荡`、`/match/final-qualifier`、`/match/unknown` | 三栏、表单、直达检索、沉浸比赛、错误恢复均通过 |
| 768×1024 | `/career` + 百科 Drawer | 两栏布局；右栏隐藏；440px 抽屉打开、Esc 关闭与焦点恢复通过 |
| 320×568 | `/`、`/career` 的消息/生涯/百科三个 Tab | 单屏底部导航通过；根文档 `scrollWidth === innerWidth`，无横向溢出 |

## 关键状态

- 合同选择：签下红炉联后，`--club-primary` 从北港金切换为 `#ef4f45`，球员六项属性、俱乐部职业环境与 Toast 在同一结果中更新。
- 连贯性：红炉联注册明确在今晚北港资格赛后生效，因此比赛卡与告别战不会和转会结果冲突。
- 比赛决定：第 72 分钟选择“直塞套上的边后卫”后，第 73 分钟播报新增结果，属性 Toast 完整显示。
- 倒计时：视觉压力条、`role=timer` 文本和超时禁用同时存在；超时不自动替玩家选择。
- Tooltip：200ms 悬停后显示“半空间”解释；1440×900 实测边界为 `left 498 / right 818 / top 360 / bottom 494`，未越出视口。
- 抽屉：Esc 关闭后焦点返回“足球百科”触发按钮。
- 深链：百科“脑震荡识别与保护”可回到 `career?experience=concussion-removal` 对应阶段与情境。
- 减少动效：`prefers-reduced-motion: reduce` 下页面动效为 `none`、滚动为 `auto`、压力条动画为 `none` 并改用静态条纹。
- 无障碍基础：语义标题、landmark、跳到主要内容、表单 label、live region、文本属性表、SVG 替代描述、44px 触控目标和焦点环均存在。

## 性能抽样

本地生产镜像在 1440×900 Chromium 的一次温缓存初步抽样：navigation 48.7ms、LCP 100ms、5 个动态资源条目。该结果证明实现未越过本地预算，但不替代真实网络环境和目标设备上的 Antigravity Stage 3 性能验证。

## 内容与外部来源

规则、青少年保护、代理、脑震荡、反兴奋剂和球场运行各自使用具名官方链接。所有高风险词条都写明适用版本或专业判断边界；本产品不提供个人医疗、法律、合同或补剂建议。外部链接将在精确提交预览中再次点击验证。

## Stage 3 待办

Antigravity 仍需独立完成真实 Chrome/Safari/Firefox、Mobile Safari 安全区、目标设备性能、完整键盘遍历、读屏语音、颜色对比、视觉回归和所有路线/状态矩阵的最终签字。本文件不把 Codex 初检冒充最终创意验证。
