# Beginner Content Audit — 《第 91 分钟》统一职业生涯内容

BEGINNER_CONTENT_GATE: PASS
Score: 22/22

## Outcome

第一次进入的玩家能够识别这是一名虚构球员从青训到第二职业的连续生涯，并能理解当前合同事件、选择步骤、数值结果及其与比赛的关系。56 个情境没有按学科分裂；59 个术语先给通俗定义和“为什么现在有用”，再深链回相应职业现场。高风险的规则、青少年保护、代理、脑震荡、反兴奋剂和球场运行内容具备边界语言与官方来源入口。

## Newcomer reconstruction

- This is... 一款用消息、俱乐部状态、比赛记录和限时选择推进的中文足球球员生涯模拟器。
- It involves... 同一名球员的训练、战术、合同、伤病、身份、治理、社区和比赛经历。
- First..., then..., finally... 先建立球员档案，再在职业中心理解处境并作选择，随后进入比赛日，长期沿六个生涯阶段推进到退役转型。
- The main result or visible difference is... 每个选择都会产生明确属性回声；转会还会立即改变俱乐部、战术环境和主题色。
- This matters because... 足球知识不再是孤立术语，而是帮助玩家理解当下风险和下一步行动的解释层。
- The important limitation or dispute, if any, is... 规则、医学、反兴奋剂和合同内容会变化；网页只提供学习入口，明确要求以当前权威文件和合格专业意见为准。

## Scorecard

| Dimension | Score | Evidence |
| --- | ---: | --- |
| Orientation | 2 | 首页首屏说明主题、范围、起点与长期终点；所有直达路由保留项目身份与返回路径。 |
| Object introduction | 2 | 职业中心先展示具体球员、俱乐部、赛季、下一场与当前合同，不从抽象足球概念起步。 |
| Prerequisites and terminology | 2 | 59 个术语均含中文定义、英文对照、当前用途和至少一个生涯情境。 |
| Process and intermediate steps | 2 | 建档 → 阅读处境 → 限时选择 → Toast 后果 → 比赛决定 → 播报回写形成可复述闭环。 |
| Numbers, comparisons, and results | 2 | 六项属性有文本与雷达双表达，选择结果逐项显示方向和数值，倒计时有秒数和关闭结果。 |
| Facts, analysis, and causality | 2 | 虚构叙事与官方规范入口分离；数据术语明确概率、样本和模型局限，不把相关性写成因果。 |
| Disputes and evidence boundaries | 2 | 规则版本、财政体系、医疗评估、反兴奋剂年度清单和合同法律意见均写明适用边界。 |
| Structure and visual containers | 2 | 三个面板解释同一事件；生涯图按时间而非学科组织，每张卡包含场景、因素与风险。 |
| Operations, interaction, and safety | 2 | 选择前说明方向性代价，选择后给完整反馈；超时不替玩家作答，错误路由可恢复。 |
| Language, links, and multilingual behavior | 2 | UI 为简体中文，西文只作辅助；高风险内容使用有名称的官方深链。 |
| Recall and application | 2 | 术语从职业现场进入并能返回同一情境；比赛日前再次把半空间、越位与 VAR 用于决定。 |

## Preserve

保留“足球世界不会分科出现在你面前”的统一生涯主张、三个同步观察窗口、每个术语的“为什么现在有用”、选择后的精确数值 Toast，以及所有高风险内容的适用边界。后续扩展必须先新增职业情境，再补解释术语，不能反向堆出孤立百科。

## Collection coverage

完整数据集为 56 个 `CareerExperience` 和 59 个 `EncyclopediaTerm`。自动化合同逐条检查 ID 唯一性、阶段密度、术语与来源引用、核心领域信号；人工浏览覆盖首页、职业中心、比赛日、百科直达、未知比赛恢复，以及 1440×900、768×1024、320×568 三种视口。人工内容抽样包含合同、阵型、xG、门将专项、足球美学、游戏评分文化、歧视响应、脑震荡、反兴奋剂、所有权、无障碍和第二职业；其余记录由同一渲染器与全记录合同覆盖。

## Heuristic scan

扫描 2 个权威内容 JSON，得到 1 个 P3 `NUMBER_RELATIONSHIP` 信号，位于“阵型与动态站位”的 `4-3-3 / 3-2-5 / 2-3-5`。人工复核为误报：原句已明确区分起始结构与控球结构，且说明阵型不是固定坐标；没有 P0、P1 或 P2 信号。
