# Qwerty Personal Trainer

这是一个基于 Qwerty Learner 官方资源制作的个人定制版网页：使用官方词库 JSON、官方音效资源，同时加入个人账号、错词复习、自适应练习和本地统计。

## 打开方式

当前预览地址：

```text
http://localhost:3000
```

因为官方词库是按需读取的 JSON 文件，建议通过本地预览地址使用。所有账号和练习数据都保存在浏览器本地，不会上传到服务器。

## 已包含功能

- 官方资源：已接入 Qwerty Learner 的 368 个可用官方词库索引和本地 JSON 词库文件。
- 本地多账号：切换、创建个人账号。
- 个性设置：昵称、每日目标、目标 WPM、主题、练习提醒、首选词库。
- 练习模式：章节顺序、随机抽词、薄弱自适应、释义开关、发音开关、默写模式、严格模式。
- 词库：官方考试词库、程序员/API 词库、多语言词库、个人自定义词库。
- 复习：错词队列、收藏词、错词专项练习、收藏专项练习。
- 统计：总词数、平均 WPM、正确率、连续天数、最近练习记录、薄弱字母组合。
- 键位热力图：根据错键次数提示薄弱键位，自适应模式会优先抽取相关词。
- 音效：使用官方按键音效、正确音效、错误音效。
- AI 教练：放在左侧设置按钮下方的折叠面板里；点击分析时才发送练习摘要。
- AI 发音：可选浏览器发音、小米 MiMo TTS、OpenAI TTS 或自定义 TTS 接口，支持音色和语气选择。
- 数据备份：当前账号导出 JSON，备份文件导入为新账号。

## AI 配置说明

- 分析模型预设包含 OpenAI、DeepSeek V4 Flash/Pro、Gemini 2.5 Flash/Pro/Flash Lite。
- 发音模型预设包含 MiMo `mimo-v2.5-tts` / `mimo-v2.5-tts-voicedesign` / `mimo-v2-tts`，以及 OpenAI `gpt-4o-mini-tts`、`tts-1-hd`、`tts-1`。
- MiMo 音色包含冰糖、茉莉、苏打、白桦、Mia、Chloe、Milo、Dean 等；语气包含变快、变慢、开心、悲伤、生气、悄悄话、方言和角色风格。
- OpenAI TTS 内置音色包含 alloy、ash、ballad、coral、echo、fable、nova、onyx、sage、shimmer、verse、marin、cedar。
- API Key 只保存在浏览器本地；AI 教练只有在点击“分析我的练习”或“追问”时才读取并发送练习摘要。

## 参考

- Qwerty Learner GitHub: https://github.com/RealKai42/qwerty-learner
- 官方在线部署: https://qwerty.kaiyi.cool/
- 中文镜像入口: https://qwertylearner.cn/

## 资源与许可

`dicts/`、`sounds/`、`official-dicts.js` 的资源索引来自 RealKai42/qwerty-learner。原项目使用 GPL-3.0 license，许可证副本已保存为 `QWERTY_LEARNER_GPL_LICENSE.txt`。
