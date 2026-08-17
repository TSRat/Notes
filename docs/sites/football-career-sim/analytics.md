# 数据分析与隐私规范

## 原则

MVP 不接入分析供应商。`trackEvent()` 仅在当前页面派发 `career-sim:analytics` CustomEvent，且只用于会改变职业档案的关键选择。浏览、搜索、建档、打开比赛与阅读术语均不记录。

## 允许事件

| 事件 | 允许字段 |
| --- | --- |
| `key_choice_made` | `eventId`、`choiceId`、`careerWeek` |
| `club_changed` | `fromClubId`、`toClubId`、`reasonEventId` |
| `match_choice_made` | `matchId`、`choiceId`、`minute` |

## 明确不追踪

不采集姓名、位置/球风表单值、搜索词、阅读路径、IP、设备指纹、精确时间、地理位置、联系人、广告标识、输入文本、跨站标识或停留时长。`localStorage` 存档不作为分析身份，不上传。

未来接入外部供应商前必须新增：显式 consent、拒绝后不加载脚本、数据保留期、删除机制、供应商与传输目的说明。本次 PR 不包含这些外部行为。
