# 职业体验与系统架构

## 一条职业时间线

旧原型的三本 Notebook 已被吸收到同一条职业档案中：

- 新闻与人生信息成为关键事件的背景。
- 俱乐部、联赛和术语在需要时从世界抽屉展开。
- 比赛播报只在关键比赛路由出现，结果回写时间线和赛季账本。

玩家不需要先选择“学足球”还是“玩生涯”；知识始终服务于眼前选择。

## 运行层次

```text
React routes/pages
    ↓ useCareer actions and selectors
CareerProvider
    ↓ pure transition functions
engine/{career,event,season,match,transfer,nationalTeam,achievement,ending}
    ↓ typed world adapters
data/world/*.json + terms.json
    ↓ versioned persistence
storage/IndexedDB repository → JSON export/import
```

### 领域层

- `domain/career.ts` 定义球员、状态、赛季、时间线、成就、结局和存档契约。
- `engine/rng.ts` 提供 seedable PRNG；随机性不依赖渲染时序。
- `engine/overall.ts` 将技术、身体、心理、状态与年龄曲线压缩为 OVR。
- 引擎函数保持纯转换，UI 不直接改职业状态。

### 内容层

- `associations.json` 与 `competitions.json` 描述 15 个精选竞赛生态。
- `clubs.json` 描述 60 家真实俱乐部及其来源、权利状态和模拟基线日期。
- `event-templates.json` 把足球与人生放进同一事件池。
- `achievements.json` 和 `endings.json` 是可验证的条件目录。
- `sources.json` 区分官方网页、技术报告、学术/商业手册与本地书目。
- `terms.json` 保留 59 个按需术语，不承担独立课程结构。

### 存储层

- IndexedDB 是职业存档与博物馆档案的主存储。
- localStorage 只保存“最后打开的存档”指针，并读取/移除一次旧原型键。
- 存档含 `schemaVersion`，可导出 JSON、导入、恢复损坏记录并管理多个生涯。
- 旧虚构俱乐部不会被迁移成某家真实俱乐部，以免制造事实映射。

## 状态推进

```text
创建球员
  → 当前赛季关键事件队列
  → 选择 / 超时结果
  → 关键比赛（按生涯条件触发）
  → 普通赛季结算
  → 转会 / 国家队 / 成就检查
  → 下一赛季
  → 退役与多维结局
  → 博物馆归档
```

每次选择都产生结构化时间线条目；每次赛季推进都形成独立账本。因此玩家看到的是因果记录，而非孤立弹窗。

## 路由职责

- `/career` 是唯一主循环，呈现决定、结算入口和时间线。
- `/career/player` 解释个人状态，不在这里作重大决定。
- `/world` 提供俱乐部与来源上下文，可由事件深链进入。
- `/match/:id` 暂时隐藏非必要信息，超时后仍能返回主循环。
- `/season/:year` 是可回看的赛季证据。
- `/museum` 是跨存档元层，不给当前生涯加成。

## 扩展入口

- 新竞赛或俱乐部：追加 JSON 记录并补来源/唯一性测试。
- 新事件：只使用支持的 effect key；测试会拒绝未知效果。
- 新真实人物：新增独立人物数据集，必须包含角色类型、事实有效期、来源、权利审核和模拟/真实标识。
- 新语言：先将页面和 JSON 内容统一迁入语言字典，再开放路由级语言选择。
