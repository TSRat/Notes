# 《第 91 分钟》重设计实施计划

> - 设计规范：`docs/superpowers/specs/2026-08-19-football-career-simulator-redesign-design.md`
> - 分支：`codex/site-football-career-sim`
> - 当前基线：`8c32832`
> - 原则：按可玩的纵向切片推进；每个任务先写或更新契约测试，再实现；不提交 `.playwright-cli/`；不合并 Draft PR。

## 目标

把现有“三本 Notebook＋一次选择”的内容型原型，改造成可以从 16 岁推进到退役、使用真实俱乐部世界和模拟人物生态、在 25–40 分钟内完成一生的球员职业生涯游戏。

第一轮实现必须打通完整人生，不以 160 家空俱乐部或未连接页面冒充完成。全球内容随后沿同一数据契约扩展。

## 任务 1：建立版本化领域模型和确定性随机源

**创建**

- `football-career-sim/src/domain/types.ts`
- `football-career-sim/src/engine/random.ts`
- `football-career-sim/src/engine/random.test.ts`
- `football-career-sim/src/engine/overall.ts`
- `football-career-sim/src/engine/overall.test.ts`

**修改**

- `football-career-sim/src/app/types.ts`

**步骤**

1. 先写随机种子复现、值域、分支和序列化测试。
2. 定义完整位置族、基础属性、展示状态、俱乐部角色、国家队状态和 `FootballPerson` 接口。
3. 写位置加权 OVR 测试，覆盖门将、中卫、中场、边锋和中锋。
4. 实现纯函数随机源与 OVR 计算；不访问 React、DOM 或存储。
5. 运行 `npm test -- random overall` 与完整测试。

## 任务 2：建立真实世界内容契约和首批资料包

**创建**

- `football-career-sim/src/data/world/clubs.json`
- `football-career-sim/src/data/world/competitions.json`
- `football-career-sim/src/data/world/associations.json`
- `football-career-sim/src/data/world/sources.json`
- `football-career-sim/src/data/world/event-templates.json`
- `football-career-sim/src/data/world/achievements.json`
- `football-career-sim/src/data/world/endings.json`
- `football-career-sim/src/data/world/worldData.ts`
- `football-career-sim/src/data/world/worldData.test.ts`

**修改**

- `football-career-sim/src/data/db.ts`
- `football-career-sim/src/data/contentContracts.test.ts`

**步骤**

1. 定义俱乐部、赛事、协会、来源和内容包 schema。
2. 先迁移一组可完整游玩的真实俱乐部纵切，覆盖至少英格兰、西班牙、德国、意大利、法国、荷兰、葡萄牙、巴西、阿根廷、日本、韩国、中国、沙特和美国的转会节点。
3. 每项动态事实记录 `asOf`、来源和置信度；当前赛季以后明确进入模拟世界。
4. 使用真实名称、城市、球场和传统色，但只呈现文字标识，不加入真实队徽或球衣资产。
5. 为巴塞罗那等深度俱乐部记录专门的资料路由，不把“传控”等单一词当成完整身份。
6. 写契约测试检查 ID、引用、来源、颜色、权利状态、生态覆盖和事件可达性。

## 任务 3：实现一段完整生涯的纯模拟内核

**创建**

- `football-career-sim/src/engine/careerEngine.ts`
- `football-career-sim/src/engine/careerEngine.test.ts`
- `football-career-sim/src/engine/eventEngine.ts`
- `football-career-sim/src/engine/eventEngine.test.ts`
- `football-career-sim/src/engine/matchEngine.ts`
- `football-career-sim/src/engine/matchEngine.test.ts`
- `football-career-sim/src/engine/transferEngine.ts`
- `football-career-sim/src/engine/nationalTeamEngine.ts`
- `football-career-sim/src/engine/achievementEngine.ts`
- `football-career-sim/src/engine/endingEngine.ts`
- `football-career-sim/src/engine/simulateCareer.test.ts`

**步骤**

1. 先写从创建、赛季推进、关键选择、关键比赛到退役的固定种子测试。
2. 实现“确定事实＋选择修正＋受控随机波动”的结果记录。
3. 实现赛季摘要、成长、衰退、伤病、角色变化和延迟后果。
4. 实现转会报价与真实俱乐部环境适配，不把最大俱乐部固化为最优选择。
5. 实现双国籍、征召、名单、国家队窗口和遗产记录。
6. 实现四类“生涯印记”和五维结局。
7. 批量运行固定种子，记录好结局、球星和传奇比例；在内容量足够前允许测试使用宽区间，但不得删除最终校准断言。

## 任务 4：版本化存档与旧原型迁移

**创建**

- `football-career-sim/src/storage/saveRepository.ts`
- `football-career-sim/src/storage/saveRepository.test.ts`
- `football-career-sim/src/storage/migrations.ts`
- `football-career-sim/src/storage/migrations.test.ts`

**修改**

- `football-career-sim/src/app/CareerProvider.tsx`
- `football-career-sim/src/app/CareerContext.ts`
- `football-career-sim/src/app/careerState.ts`

**步骤**

1. 把 IndexedDB 封装在 `saveRepository`，为测试提供内存适配器。
2. `localStorage` 只保存偏好和最近存档指针。
3. 迁移旧版 `football-career-sim.player.v1`，保留姓名、位置和既有选择，创建兼容的新生涯起点。
4. 自动保存重大选择、赛季和比赛；写入失败时不覆盖上一版本。
5. 提供 JSON 导入导出与损坏存档恢复状态。

## 任务 5：重建路线与完整玩法界面

**创建**

- `football-career-sim/src/pages/CreatePlayerPage.tsx`
- `football-career-sim/src/pages/PlayerPage.tsx`
- `football-career-sim/src/pages/WorldPage.tsx`
- `football-career-sim/src/pages/SeasonReviewPage.tsx`
- `football-career-sim/src/pages/MuseumPage.tsx`
- `football-career-sim/src/components/CareerStatusBar.tsx`
- `football-career-sim/src/components/CareerTimeline.tsx`
- `football-career-sim/src/components/TimelineEventCard.tsx`
- `football-career-sim/src/components/ContextDrawer.tsx`
- `football-career-sim/src/components/OverallBadge.tsx`
- `football-career-sim/src/components/SeasonLedger.tsx`
- `football-career-sim/src/components/AchievementReveal.tsx`
- `football-career-sim/src/components/ClubWordmark.tsx`

**修改**

- `football-career-sim/src/App.tsx`
- `football-career-sim/src/pages/HomePage.tsx`
- `football-career-sim/src/pages/CareerPage.tsx`
- `football-career-sim/src/pages/MatchdayPage.tsx`
- `football-career-sim/src/pages/DatabasePage.tsx`
- `football-career-sim/src/components/AppShell.tsx`
- `football-career-sim/src/components/MobileTabbar.tsx`
- `football-career-sim/src/components/DecisionPanel.tsx`
- `football-career-sim/src/i18n.ts`
- `football-career-sim/src/data/locales/zh-CN.json`
- `football-career-sim/src/data/locales/en.json`

**步骤**

1. 首页只保留新生涯、继续和博物馆摘要。
2. `/create` 实现四步登记和青训起点确认，覆盖所有位置族。
3. `/career` 改为单主舞台时间线；旧 Notebook 只作为事件上下文数据，不再作为常驻并列 UI。
4. `/career/player` 展示 OVR、位置能力、状态、关系与合同，不加入俱乐部管理。
5. `/world` 只展示当前处境相关的联赛、俱乐部、国家队和术语。
6. `/database` 重定向到 `/world?panel=glossary`。
7. `/match/:id` 使用 2–4 个位置相关关键时刻，只有紧急场景实时倒计时。
8. `/season/:year` 输出一分钟可读的年鉴。
9. `/museum` 保存结局、时间线、成就、俱乐部地图和巅峰 OVR。
10. 更新路由标题、直达恢复、空状态和错误状态。

## 任务 6：实施视觉系统、响应式与无障碍

**修改**

- `football-career-sim/src/styles/tokens.css`
- `football-career-sim/src/styles/global.css`
- `football-career-sim/src/styles/components.css`

**创建**

- `football-career-sim/src/styles/career.css`
- `football-career-sim/src/styles/create.css`
- `football-career-sim/src/styles/museum.css`

**步骤**

1. 落实“球员档案 × 比赛日转播 × 更衣室生涯墙”。
2. 桌面使用单主舞台＋按需侧栏；移动端使用四项底部导航。
3. 俱乐部主题使用真实传统色和自动可读前景色；切换时约 600ms 过渡。
4. 关键操作 44px，焦点清晰，抽屉焦点可恢复。
5. 倒计时提供视觉、数字与读屏阈值播报。
6. 实现 320px、`100dvh`、安全区域、200% 缩放和减少动效。

## 任务 7：文档、平衡、构建与浏览器初检

**修改**

- `docs/sites/football-career-sim/product-spec.md`
- `docs/sites/football-career-sim/career-experience-architecture.md`
- `docs/sites/football-career-sim/creative-experience-storyboard.md`
- `docs/sites/football-career-sim/visual-direction.md`
- `docs/sites/football-career-sim/design-handoff.md`
- `docs/sites/football-career-sim/coverage-ledger.md`
- `docs/sites/football-career-sim/analytics.md`
- `docs/sites/football-career-sim/qa-handoff.md`
- `football-career-sim/README.md`
- `sites/registry.json`

**检查命令**

```bash
npm test
npm run lint
npm run build
npm run check:bundle
```

**浏览器初检**

- 320×568、390×844、768×1024、1024×768、1440×900；
- 创建、继续、完整生涯、比赛、赛季年鉴、世界和博物馆；
- 无存档、旧存档、损坏存档、倒计时结束和未知比赛；
- 键盘、减少动效、焦点恢复、主题变化、横向溢出和控制台错误；
- 精确提交的静态预览。

完成后只报告 Codex 初步检查，把更新后的精确提交推送到现有 Draft PR，保持：

```text
ANTIGRAVITY_DESIGN_INPUT: RECEIVED
CODEX_SIX_STAGE_PRODUCTION: MR_READY_FOR_FINAL_VALIDATION
ANTIGRAVITY_FINAL_VALIDATION: PENDING
```

## 提交策略

1. `docs: plan football career simulator redesign`
2. `feat: add deterministic career simulation core`
3. `feat: rebuild football career experience`
4. `test: harden career simulation and responsive flows`
5. `docs: prepare football simulator validation handoff`

每次提交只包含当前纵向切片。已有 `.playwright-cli/` 保持未跟踪，不删除、不提交。
