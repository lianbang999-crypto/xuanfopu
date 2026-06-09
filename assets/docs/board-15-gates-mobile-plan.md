# 《选佛谱》15门手机棋盘规划

## 结论

15门总棋盘不能等到最后才画。

原因：

1. 15门决定玩家对“升沉”的整体理解。
2. 220位的门内地图需要依附总图层级。
3. 手机端空间有限，必须先验证总图结构，再逐门精修。
4. 如果最后才画总图，前面各门可能风格、尺度、方向不统一。

推荐流程：

```text
先做15门低精度总棋盘结构图
↓
做第一门局部地图原型
↓
逐门设计坐标与背景
↓
最后统一精修15门总图
```

## 三层棋盘结构

手机端采用三层：

```text
第一层：15门总览
第二层：当前门局部棋盘
第三层：当前位详情卡
```

### 第一层：15门总览

用途：

- 告诉玩家自己处在整个法界升沉图的哪里。
- 显示上升、下降、横超、终局方向。
- 不显示全部220位，只显示15门。

视觉：

- 2.5D 微缩须弥山纵向总图。
- 每一门是一层或一块平台。
- 当前门发光。
- 可达门淡淡提示。

### 第二层：当前门局部棋盘

用途：

- 真正走棋、点击、查看位次。
- 只显示当前门位次。
- 第一门显示21位，第二门显示5位，别教位次门显示52位但需分段。

视觉：

- 每门一张无文字背景图。
- 节点、文字、状态全部由前端渲染。
- 背景图只负责空间、情绪、区域分层。

### 第三层：当前位详情卡

用途：

- 显示当前位名、所属门、本次轮相、谱曰、原文、白话、升沉原因。
- 解决手机屏幕上“地图不能承载全部文字”的问题。

## 15门总览排序

总图按须弥山升沉逻辑，从上到下建议排列为：

```text
15 圆极果位门
14 净土横超门
13 圆教位次门
12 别教位次门
11 通教位次门
10 藏教位次门
09 增上慧学门
08 增上定学门
07 增上戒学门
06 生善灭恶门
01 发始因地门
02 法道流弊门
05 色无色天门
04 欲界人天门
03 四种恶趣门
```

说明：

- 01、02 属于因地与流弊，是玩家起点与偏差层。
- 03、04、05 属于恶趣、人天、色无色天，是三界升沉层。
- 06–09 是修行转化层。
- 10–13 是四教位次层。
- 14 是净土横超层。
- 15 是圆极佛果终局层。

## 总图不应承担的内容

总图不显示：

```text
220个位次全部文字
每个位次的谱曰
每个位次完整轮相表
过多路径线
小到无法点击的节点
```

总图只显示：

```text
15门层级
当前门
已历门
可达门
升沉方向
净土横超与终局方向
```

## 各门局部地图制作顺序

建议顺序：

```text
01 发始因地门：已开始，21位，作为标准样板
02 法道流弊门：5位，验证小门布局
03 四种恶趣门：13位，验证暗色低层布局
04 欲界人天门：18位，验证人天复杂城郭布局
05 色无色天门：23位，验证云台与空境布局
06 生善灭恶门：6位，小型转化门
07 增上戒学门：13位
08 增上定学门：13位
09 增上慧学门：8位
10 藏教位次门：16位
11 通教位次门：10位
12 别教位次门：52位，最大难点，最后单独处理
13 圆教位次门：8位
14 净土横超门：13位
15 圆极果位门：1位，终局展示
```

## 别教52位的特别处理

别教位次门不能直接铺52个等大节点。

建议分段：

```text
十信
十住
十行
十回向
十地
等觉妙觉
```

手机端可采用：

- 折叠段落。
- 横向小卷轴。
- 当前段展开，其他段缩略。
- 或者用“星盘/阶梯”式分段节点。

## 15门总图的美术方向

总图应是：

```text
2.5D 微缩须弥山
纵向9:16
从下到上升沉分明
无具体佛像人物
无AI文字
无220小字
15个平台清楚
```

区域气质：

```text
底部：四种恶趣，暗红、墨灰、裂地
中下：欲界人天，城郭、人间、宫阙
中右/高空：色无色天，云台、透明阶、空境
中层：因地、流弊、生善灭恶，岔路、忏坛、经堂
上中：戒定慧，戒坛、禅池、经卷慧光
上层：藏通别圆，云阶、法轮、层级位次
上方：净土横超，莲池、金桥、宝树
顶端：圆极佛果，圆光、莲台、留白
```

## IMAGE-2 总图提示词

```text
Vertical 9:16 2.5D miniature isometric overview board for the Chinese Buddhist scripture game Xuan Fo Pu. A Mount Sumeru cosmology board with exactly fifteen large tier platforms, not 220 small nodes. From bottom to top: dark lower realms with cracked ink-red stone; human and heavenly realms with miniature cities and cloud bridges; formless heavens with transparent blue cloud platforms; initial causes and Dharma deviations with branching paths and scripture fragments; repentance and transformation layer with lamps and altars; precepts, meditation, and wisdom layers with clean precept altar, meditation pool, scripture light; four teaching stages with orderly cloud steps; Pure Land horizontal transcendence with lotus pond and golden bridge; final Buddha-fruit realm as a simple radiant circular platform at the top. Ancient Chinese parchment, ink wash, muted gold paths, cinnabar accents, elegant but readable mobile game board, no Chinese text, no deity figure, no realistic people, no casino dice, clear spaces for UI labels.
```

负面提示词：

```text
text, Chinese characters, unreadable labels, 220 tiny nodes, realistic people, deity statue, casino dice, neon, cyberpunk, western fantasy, gore, horror torture, cluttered UI, flat monopoly board
```

## 资源目录建议

```text
web/public/art/overview/board-15-gates-bg.webp
web/public/art/gate01/gate01-bg-2-5d.webp
web/public/art/gate02/gate02-bg-2-5d.webp
...
web/src/data/board-layout.overview.json
web/src/data/board-layout.gate01.json
web/src/data/board-layout.gate02.json
```

## 当前阶段建议

现在应同时推进两条线：

```text
A线：第一门局部地图继续验证和精修
B线：15门总览先做低精度结构图，不急着精画
```

等第一门和总览都跑通后，再逐门扩展。
