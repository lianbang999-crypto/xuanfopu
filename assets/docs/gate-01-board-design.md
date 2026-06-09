# 第一门棋盘设计：发始因地门

## 定位

第一门不是“地狱关卡”，也不是普通新手村，而是《选佛谱》的起手因地层。

它的功能是：玩家第一次掷出两枚六字轮相后，被安置到二十一种不同的初始因地之一。此门呈现众生最初的业因、善恶、邪正、禅定、福戒定慧等分流状态。

建议标题：

```text
第一门：发始因地门
副标题：业因初分 · 升沉未定
```

## 原文依据摘要

第一门共有二十一位：三品十恶、见取、慢心行施、世间福、戒取、三品十善、邪定、味禅、根本四禅、四无量心、四无色定、意见参禅、利名习教、出世福业、出世戒学、出世定学、出世慧学。

此门并非单纯恶趣层，而是从纯恶业到世间善、世间禅、再到出世福戒定慧的起点总汇。

## 设计目标

手机端应让玩家一眼看懂三件事：

1. 我目前属于哪一种“因地”。
2. 这个因地偏恶、偏善、偏执、偏禅定，还是偏出世法。
3. 掷出下一组轮相后，我可能上升、下降、轮转、不行或横超。

## 画面总构图

9:16 竖屏，2.5D 微缩模型。整体像一块放在宣纸经卷上的“因地分流台”。

构图建议：

```text
上方：出世入口区
中部：世间善业区
左侧：偏执有漏善区
右侧：禅定空境区
下方：三品十恶区
中心：起手轮台
```

中心是“起手轮台”，两枚轮相初次掷出后，玩家落入二十一位之一。道路不应做成单一路径，而应做成向五个区域分岔的业因网络。

## 二十一位分组

### A. 恶业起点区 evil

- 上品十恶
- 中品十恶
- 下品十恶

视觉：暗石、裂地、灰红火光、墨色业流。注意不要做成血腥恐怖，应保持古籍象征感。

### B. 偏执有漏善区 mixed-view

- 见取
- 慢心行施
- 戒取

视觉：歪斜的经牌、偏光、缠绕墨线、半明半暗的供养台。表示善业中夹杂邪见、我慢、执取。

### C. 世间善业区 worldly-good

- 世间福
- 下品十善
- 中品十善
- 上品十善

视觉：人间灯火、布施台、放生池、小桥、经架、柔和暖色。表示善业已有，但仍在世间。

### D. 禅定区 meditation

- 邪定
- 味禅
- 根本四禅
- 四无量心
- 四无色定

视觉：云台、静坐坛、水面、透明阶、空境。邪定、味禅偏灰雾；四无量心可加入慈悲喜舍四盏灯；四无色定应更虚空、透明、冷淡。

### E. 出世入口区 supramundane

- 意见参禅
- 利名习教
- 出世福业
- 出世戒学
- 出世定学
- 出世慧学

视觉：上方清净阶台、经卷、戒坛、禅池、慧光。此区连接更高的修行法门，但“意见参禅”“利名习教”仍需保留偏差感。

## 手机端交互原则

### 默认视图

第一门局部地图只显示二十一位节点，不显示其他门位次。顶部可以保留小型十五门总览指示器，显示当前处在“发始因地门”。

### 节点状态

每个位次节点至少支持这些状态：

```text
normal      普通位
current     当前位
visited     已历位
prospect    可达位
up          可上升目标
down        下降目标
flat        同层轮转目标
blocked     不行提示
```

### 掷轮后镜头流程

```text
1. 两枚轮相旋转
2. 显示二字组合
3. 当前位发光
4. 目标位发光或“不行”震动
5. 路径线以金线、墨线或环线连接
6. 当前位详情卡更新谱曰摘要
```

## 坐标系统

使用 0–1 归一化坐标，不使用固定像素。每门一个局部坐标系：

```text
x: 0 左侧，1 右侧
y: 0 顶部，1 底部
```

节点绘制在相对坐标上，便于适配不同手机高度。

## 第一门推荐坐标

| 位次 | x | y | 分组 |
|---|---:|---:|---|
| 出世慧学 | 0.50 | 0.06 | supramundane |
| 意见参禅 | 0.24 | 0.19 | supramundane |
| 利名习教 | 0.37 | 0.15 | supramundane |
| 出世福业 | 0.50 | 0.14 | supramundane |
| 出世戒学 | 0.63 | 0.15 | supramundane |
| 出世定学 | 0.76 | 0.19 | supramundane |
| 四无色定 | 0.86 | 0.27 | meditation |
| 四无量心 | 0.76 | 0.34 | meditation |
| 根本四禅 | 0.80 | 0.45 | meditation |
| 味禅 | 0.84 | 0.56 | meditation |
| 邪定 | 0.82 | 0.67 | meditation |
| 戒取 | 0.16 | 0.37 | mixed-view |
| 慢心行施 | 0.20 | 0.51 | mixed-view |
| 见取 | 0.15 | 0.65 | mixed-view |
| 上品十善 | 0.58 | 0.41 | worldly-good |
| 中品十善 | 0.50 | 0.49 | worldly-good |
| 下品十善 | 0.42 | 0.57 | worldly-good |
| 世间福 | 0.50 | 0.67 | worldly-good |
| 上品十恶 | 0.25 | 0.88 | evil |
| 中品十恶 | 0.50 | 0.92 | evil |
| 下品十恶 | 0.75 | 0.88 | evil |

## 路径设计

第一门不是线性蛇形路线。建议使用五区网络：

- 中央起手轮台连接全部分组。
- 恶业区三位互相靠近，位于下方。
- 偏执区在左侧，和恶业区、世间善业区都有通路。
- 世间善业区在中轴线附近，向上可接出世入口，向右可接禅定区。
- 禅定区在右侧竖向上升，越上越空寂。
- 出世入口区在顶部，作为通往第六至第九门及更上位次的视觉出口。

## IMAGE-2 提示词

### 中文提示词

```text
2.5D 微缩模型，手机竖屏 9:16，《选佛谱》第一门“发始因地门”，业因初分，升沉未定。画面是一座放在宣纸经卷上的因地分流台，中心是两枚六字轮相的起手轮台，周围分出二十一个位次节点。下方是三品十恶区，暗石、裂地、灰红业火、墨色业流；左侧是见取、慢心行施、戒取，歪斜经牌、半明半暗供养台、缠绕墨线，表现善恶夹杂与执取；中部是世间福和三品十善，人间灯火、布施台、放生池、小桥、经架、暖色光；右侧是邪定、味禅、根本四禅、四无量心、四无色定，云台、静坐坛、透明阶梯、空境与迷雾；上方是意见参禅、利名习教、出世福业、出世戒学、出世定学、出世慧学，清净阶台、经卷、戒坛、禅池、慧光，连接更高修行法门。古籍谱录风，宣纸水墨，朱砂标牌，淡金路径，节点清晰可读，微缩卡通但庄严克制，不要具体佛像人物，不要赌场骰子，不要血腥恐怖。
```

### English Prompt

```text
A vertical 9:16 2.5D miniature isometric game board for the first gate of Xuan Fo Pu, “The Gate of Initial Causes”. It is a branching karmic starting platform placed on an ancient Chinese parchment scripture scroll. At the center is a ritual starting altar for two six-character wooden wheels. Around it are twenty-one clear game position nodes divided into five zones. Bottom zone: three grades of ten evils, dark rocks, cracked ground, muted cinnabar karmic fire, ink-like karmic streams. Left zone: wrong view, prideful giving, mistaken discipline, with tilted scripture plaques, half-light offering tables, tangled ink lines, showing mixed good and attachment. Middle zone: worldly merit and three grades of ten good actions, warm human lights, giving altar, release-life pond, small bridge, scripture shelves. Right zone: wrong meditation, attached meditation, four dhyanas, four immeasurable minds, four formless absorptions, with cloud platforms, meditation altars, transparent stairs, misty emptiness. Upper zone: opinionated Chan practice, fame-seeking study, supramundane merit, precepts, concentration, wisdom, with clean steps, scrolls, precept altar, meditation pool, wisdom light, leading upward. Ancient Chinese scripture board game style, parchment paper, ink wash, cinnabar nameplates, muted gold paths, readable node platforms, solemn but slightly cute miniature style, no deity figure, no realistic people, no casino dice, no gore.
```

## 负面提示词

```text
casino dice, gambling table, horror gore, realistic hell torture, giant Buddha statue, realistic human faces, neon cyberpunk, western fantasy castle, unreadable tiny text, cluttered UI, over-saturated cartoon, flat monopoly board
```

## 前端落地建议

第一阶段不要把背景图中的节点文字当作最终文字，因为生成图里的文字可能不稳定。推荐：

1. IMAGE-2 生成无文字或少文字背景。
2. 前端用真实文本节点覆盖在坐标上。
3. 节点状态由 CSS/Canvas/SVG 控制。
4. 背景只负责气氛和空间层级。

这样既能利用 2.5D 美术，又不会影响游戏可读性。
