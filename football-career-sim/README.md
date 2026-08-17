# 第 91 分钟 · 足球球员职业生涯模拟器

文本驱动的 React/Vite SPA。战术、训练、合同、医疗、身份、治理、社区与比赛都被组织为同一名球员从青训到第二职业的连续体验，而不是分开的知识栏目。当前内容包含 6 个生涯阶段、56 个职业情境和 59 个情境化足球概念。

所有俱乐部和人物均为虚构；不使用真实队徽或球员资料。规则、青少年保护、代理、脑震荡、反兴奋剂和球场运行等高风险主题只提供学习入口，并链接到相应官方资料。

## 本地运行

```bash
npm install
npm run dev
```

## 检查与构建

```bash
npm run lint
npm test
npm run build
npm run check:bundle
```

`src/data/career-experiences.json` 是统一生涯图，`src/data/terms.json` 是按需解释层，`src/data/db.ts` 是数据适配层。`dist/` 是提交用于精确 commit 预览的生成镜像，不应手动编辑。

设计、覆盖、内容审计与 QA 交付文档位于 `../docs/sites/football-career-sim/`。
