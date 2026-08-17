# 《第 91 分钟》创意源实现映射

## 权威来源

- 来源：用户在本任务中提供并批准的 Phase 3 Codex-Ready Handoff Specification。
- 状态：`ANTIGRAVITY_DESIGN_INPUT: RECEIVED`。
- Figma：未提供；本文件是依据批准方案生成的 **Codex implementation map**，不声称替代或伪造 Antigravity 文件。

## 场景/Frame 映射

| Frame 名称 | 路由/状态 | 桌面 | 移动 | 静态/失败回退 |
| --- | --- | --- | --- | --- |
| `00 / Academy Intake` | `/` | 分屏身份与注册卡 | 单列、注册优先 | 无动画仍显示完整身份；表单错误内联 |
| `01 / Career Hub` | `/career` | 300px / fluid / 350px；同一事件的三个视角 | 单屏 + 01/02/03 Tabbar | 默认访客档；单一面板失败不遮挡导航 |
| `01A / Pressure Decision` | career urgent | 中央决定卡与条 | 当前 Tab 内置顶 | 减少动效为文字读秒；超时按钮禁用 |
| `02 / Database Drawer` | 桌面打开百科 | 右侧 420px modal drawer | 不使用，跳转路由 | 焦点留在抽屉；Esc 关闭 |
| `02M / Database Route` | `/database` | 完整页仍可直达 | 全屏检索 | 空结果带清除按钮 |
| `03 / Matchday` | `/match/final-qualifier` | 单列沉浸广播 | 单列紧凑比分 | 未知 ID 显示可恢复错误；无侧栏通知 |
| `04 / Result Echo` | 决策后 Toast | 右下 | 底部安全区之上 | live region 立即播报 |

## Tokens → 实现

| 设计职责 | 实现位置 |
| --- | --- |
| base/panel/text/club/risk colors | `src/styles/tokens.css` CSS custom properties |
| 俱乐部主题 | 根节点 `.theme-{clubId}` |
| type roles | `--font-display`、`--font-body`、`.utility-label` |
| layout | `.three-pane-layout` 与 1024/768px media queries |
| safe viewport | `min-height: 100svh`，`100dvh` 增强，safe-area padding |
| focus | 2px `--club-primary` + 3px `--club-glow` 外环 |
| transition | `--duration-route: 300ms`；reduced-motion 覆盖 |

## 组件映射

- `ThreePaneLayout`：保持 DOM 阅读顺序为主内容、新闻、百科；CSS 只改变视觉列位。
- `NewsFeedList` / `NewsItem`：时间、来源、紧急级别和可交互决定。
- `PlayerOverview` / `HexagonStatsChart`：属性文字表与 SVG 雷达双重表达，不只依赖图形。
- `ExperienceContext`：把当前事件同步投射到社会舆情、俱乐部/训练和比赛实践三个表面，避免按足球学科拆站。
- `CareerJourneyMap`：用青训起点、职业突破、稳定一线、巅峰期、重大转折、传承与退役六个连续阶段承载全部足球范围。
- `PressureTimerBar` / `DecisionButton`：视觉条、读秒、超时禁用和选择后果。
- `EncyclopediaSidebar` / `TermLink`：检索与 200ms 悬停/聚焦 Tooltip，位置限制在视口内。
- `MatchdayPage` / `BroadcastTicker`：比分、分钟事件与一个场上决定，屏蔽 Hub 消息。
- `ResponsiveDrawer`：桌面/平板百科叠层；移动端改走 `/database`。
- `ToastRegion`：统一属性反馈，`aria-live=polite`。

## 实现偏差

无 Figma 像素稿可供逐帧比对；视觉尺寸依据批准的 tokens、断点和组件规范完成。用户追加的足球知识范围已作为同一名球员可能经历的 56 个情境接入统一生涯图，没有新增独立学科路由。最终跨路线、跨视口、状态矩阵、控制台/网络、无障碍和视觉回归由 Antigravity Stage 3 执行。
