# 《选佛谱》IMAGE-2 美术资产设计稿：2.5D 微缩须弥山

## 一、总体判断

建议将《选佛谱》游戏美术升级为：

> 2.5D 微缩须弥山升沉模型。

游戏的核心不是普通棋盘，而是“两枚六字轮相一掷，众生在十五门二百二十位之间升沉流转”。因此视觉不应采用平面大富翁棋盘，而应像一座立体微缩法界模型：上方为佛果与净土，中段为圣位与戒定慧，下段为人天、色无色天与恶趣。

## 二、核心视觉方向

关键词：

```text
2.5D miniature diorama, Buddhist cosmology board game, Mount Sumeru vertical map, ancient Chinese scripture, ink wash, watercolor, parchment paper, cinnabar red, muted gold, solemn, quiet, elegant, readable game UI, no deity figure, no realistic people
```

中文关键词：

```text
2.5D 微缩模型、须弥山升沉图、佛教法界、选佛谱、古籍谱录、宣纸、水墨、淡彩、朱砂、金线、清净、庄严、克制、不艳丽、游戏 UI、无具体佛像人物
```

## 三、主视觉设定

画面是一座纵向展开的 2.5D 微缩须弥山。整体像摆放在宣纸经卷上的立体模型。玩家视角为轻微俯视 35 度。模型从下到上分层：

1. 四种恶趣：暗红、墨灰、裂地、沉坠。
2. 欲界人天：城郭、桥、宫阙、烟火人间。
3. 色无色天：云台、空境、淡蓝、透明层。
4. 因地与流弊：岔路、墨线、散落经页。
5. 戒定慧修行法门：戒坛、禅林、经卷、灯。
6. 三乘与四教圣位：层层云阶、法轮、莲台、经牌。
7. 净土横超：莲池、宝树、金桥。
8. 圆极佛果：顶部圆光、极简金白光场，不画具体佛像。

## 四、IMAGE-2 提示词

### 01 首页主视觉 / Hero Key Art

用途：游戏首页、宣传封面、加载页。

尺寸建议：1920x1080 或 2048x1152。

Prompt:

```text
A 2.5D miniature diorama of the Chinese Buddhist board game “Xuan Fo Pu”, an ancient scripture scroll opened on parchment paper, on top of it stands a vertical Mount Sumeru cosmology game map. The map is divided into layered realms from bottom to top: dark hell and lower realms, human and heavenly cities, misty formless heavens, practice paths of precepts meditation wisdom, sacred stages, Pure Land lotus pond, and a bright circular Buddha-fruit realm at the top. Two wooden six-sided ritual wheels engraved with Chinese characters 那 謨 阿 彌 陀 佛 rest beside the map. Ink wash and watercolor style, muted gold lines, cinnabar red accents, elegant Chinese classical art, solemn but peaceful, readable game UI composition, soft ambient light, slight isometric camera, no deity figure, no realistic people, high detail, high resolution.
```

Negative prompt:

```text
cartoon, anime, cute toy, western fantasy, neon, cyberpunk, realistic human face, Buddha statue, crowded people, over-saturated, low quality, blurry text, unreadable UI, gambling dice, casino style
```

### 02 须弥山升沉主地图 / Main 2.5D Sumeru Board

用途：替换或增强 `SumeruMap.jsx` 背景。

尺寸建议：2048x3072 竖图，或分层切片。

Prompt:

```text
A vertical 2.5D isometric miniature board map inspired by Mount Sumeru and Buddhist cosmology, designed for a Chinese scripture-based game. The board has fifteen vertical tiers, from dark lower realms at the bottom to radiant Buddha-fruit at the top. Each tier contains small readable platforms for game nodes, connected by thin ink-and-gold paths. Bottom layers are dark cinnabar and ink gray, middle layers are parchment, forest green and blue mist, upper layers are pale gold and white. Ancient Chinese scripture scroll texture, watercolor ink wash, elegant minimal game board UI, clear empty areas for labels, no characters, no deity images, no modern objects, high resolution.
```

Negative prompt:

```text
flat 2D board, monopoly board, colorful cartoon, fantasy castle, realistic humans, giant statue, heavy ornament, cluttered UI, unreadable labels, casino dice
```

### 03 六字轮相 / Six-character Ritual Wheels

用途：掷轮按钮、动画帧、结果展示。

尺寸建议：1024x1024，透明背景。

Prompt:

```text
A pair of ancient Chinese wooden ritual dice-wheels used in a Buddhist scripture game, six-sided but not casino dice, made of aged sandalwood with softened edges, engraved with Chinese characters 那 謨 阿 彌 陀 佛 in cinnabar red and muted gold. Ritual object, sacred but simple, worn wood texture, soft shadow, 2.5D isometric view, transparent background, high detail, game asset, no numbers, no dots, no casino feeling.
```

Negative prompt:

```text
western dice, casino dice, plastic toy, bright cartoon, poker, gambling, neon, realistic hand, people, unreadable characters
```

### 04 单枚轮相六面资产 / Individual Wheel Faces

用途：分别生成“那、謨、阿、彌、陀、佛”六个面。

尺寸建议：每张 1024x1024，透明背景。

Prompt 模板：

```text
A single ancient wooden ritual wheel face for a Chinese Buddhist scripture game, 2.5D isometric game asset, aged sandalwood, rounded six-sided form, one large engraved Chinese character “{CHAR}” in cinnabar red with subtle gold inlay, soft shadow, transparent background, elegant, solemn, high detail, no numbers, no dots, no casino dice.
```

其中 `{CHAR}` 分别替换为：那、謨、阿、彌、陀、佛。

### 05 位次节点 / Position Node Tokens

用途：地图 220 位节点状态。

尺寸建议：512x512，透明背景，成套生成。

Prompt:

```text
A set of small 2.5D game board node tokens for an ancient Chinese Buddhist scripture board game. Each token looks like a miniature scripture nameplate made of parchment, jade, wood and muted gold. Include states: normal node, current node with soft golden halo, visited node with ink mark, prospect node with pale blue glow, upward move node with gold cloud trail, downward move node with dark ink shadow, blocked node with cinnabar seal, final Buddha-fruit node with simple circular light. Transparent background, consistent style, readable at small size, elegant ink wash UI.
```

Negative prompt:

```text
modern icons, neon UI, cartoon stickers, casino chips, plastic buttons, too much text, unreadable details
```

### 06 升沉方向图标 / Movement Icons

用途：日志、节点、轨迹线、结果提示。

尺寸建议：512x512，透明背景。

Prompt:

```text
A consistent set of 2.5D Chinese ink wash game UI icons for movement in a Buddhist cosmology board game: upward progress, downward fall, circular wandering, blocked no-move, Pure Land horizontal transcendence, final awakening. Use muted gold, ink black, cinnabar red, pale blue, parchment texture, elegant minimal symbols, transparent background, high resolution, readable at small size.
```

### 07 谱曰详情卡 / Scripture Detail Card

用途：`PositionDetail` 弹窗，原文白话对照。

尺寸建议：1024x1536 或 UI 九宫格切片。

Prompt:

```text
A 2.5D ancient Chinese scripture detail card UI for a Buddhist board game, parchment paper panel with subtle scroll edges, cinnabar red section seals, muted gold thin border, ink wash texture, empty readable areas for title, original classical Chinese text, vernacular explanation, and transition notes. Elegant Song dynasty book design, solemn, quiet, no illustration clutter, game UI asset, high resolution.
```

### 08 行棋记录卷轴 / Journey Log Scroll

用途：右侧行棋记录面板。

尺寸建议：1024x1024 或横向 1536x512。

Prompt:

```text
A compact 2.5D scroll UI panel for a Chinese Buddhist scripture board game journey log, parchment strips stacked vertically, small cinnabar combo tags, ink text areas, muted gold separators, soft shadows, elegant ancient book style, transparent background, high resolution, clean game UI.
```

## 五、色彩规范

```text
墨黑       #2B2926
宣纸       #F7F3EA
留白卡面   #FDFBF5
朱砂       #B5331F
朱红       #D23A2C
金黄       #E6A52C
天蓝       #5B9BD0
林绿       #2F6B44
淡线       #E2D9C8
```

## 六、资产导出建议

```text
assets/art/image2/
  hero/
    hero-sumeru-diorama.png
  board/
    sumeru-board-2-5d.png
    sumeru-tier-buddha.png
    sumeru-tier-pureland.png
    sumeru-tier-sage.png
    sumeru-tier-practice.png
    sumeru-tier-origin.png
    sumeru-tier-heaven.png
    sumeru-tier-human.png
    sumeru-tier-fall.png
  wheels/
    wheel-pair.png
    wheel-face-na.png
    wheel-face-mo.png
    wheel-face-a.png
    wheel-face-mi.png
    wheel-face-tuo.png
    wheel-face-fo.png
  nodes/
    node-normal.png
    node-current.png
    node-visited.png
    node-prospect.png
    node-up.png
    node-down.png
    node-blocked.png
    node-final.png
  icons/
    move-up.png
    move-down.png
    move-flat.png
    move-blocked.png
    move-pureland.png
    move-win.png
  ui/
    scripture-detail-card.png
    journey-log-scroll.png
```

## 七、实现建议

2.5D 美术不建议一次性做成一张死图。推荐分层：

1. 背景宣纸与水墨晕染。
2. 须弥山各层背景条。
3. 节点牌独立 PNG。
4. 棋子独立 PNG。
5. 六字轮相独立 PNG。
6. 升沉轨迹继续用 SVG/CSS 绘制，叠加金线/墨线材质。

这样既保留现有 React 地图逻辑，也能显著提升视觉品质。
