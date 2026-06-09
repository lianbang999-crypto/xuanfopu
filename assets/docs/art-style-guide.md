# 选佛谱美术资产规范

## 总体方向

主题定位：一卷可以游玩的修行经卷。

关键词：东方佛教美术、莲花、经卷、宣纸、淡金、青绿山水、祥云、柔和佛光、清净、庄严、游戏 UI。

## 色彩系统

| 用途 | 色值 | 说明 |
|---|---:|---|
| 宣纸底色 | `#F6EBD0` | 主背景、卡牌底 |
| 淡金主色 | `#D8A84A` | 边框、高光、按钮 |
| 深檀木色 | `#5A2E1A` | 标题、重要文字 |
| 莲青色 | `#5C8F7B` | 智慧、定力、清净 |
| 朱砂色 | `#B84A3A` | 警示、障碍、强调 |
| 云灰色 | `#7D8790` | 障碍、冷却、禁用 |
| 佛光色 | `#FFE9A6` | 获得奖励、终点光效 |

## 视觉语言

- 背景以宣纸纹理、淡墨远山、云气和经卷边缘为主。
- UI 边框使用淡金线条和圆角玉石感，避免过强金属质感。
- 棋盘格子按类型用图标与色彩区分，保证小尺寸可识别。
- 人物与棋子采用莲花、菩提叶、法轮、莲灯等象征物，避免过度具象化神佛形象。
- 所有资产优先使用 SVG，方便缩放、换肤和游戏内动画。

## 目录建议

```text
assets/
  art/
    backgrounds/
    board/
    cards/
    characters/
    icons/
    logo/
    ui/
  docs/
```

## 第一批资产

本次提交包含：

- `assets/art/backgrounds/main-scroll-background.svg`
- `assets/art/logo/xuanfopu-logo.svg`
- `assets/art/board/lotus-board-frame.svg`
- `assets/art/board/board-tiles.svg`
- `assets/art/characters/lotus-tokens.svg`
- `assets/art/cards/card-templates.svg`
- `assets/art/icons/core-icons.svg`
- `assets/art/ui/ui-kit.svg`
