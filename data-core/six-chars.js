// ============================================
// 六字判教元數據 v0.2
// 蕅益大師《選佛譜·輪相表法第一》原文判教
// 含關鍵轉折判定·金佛金蛇喻·心路統計工具
// ============================================

window.SIX_CHARS = {
  // 那、謨表惡
  "那": {
    polarity: "惡",
    layer1: "屬見煩惱",
    aliases: ["分別惑", "見惑", "見所斷惑"],
    note: "邪見分別所起惑。見真諦道時。此惑頓斷。",
    brief: "見煩惱（邪見分別所起）",
    deeper: "屬見煩惱過重·惡相先重",
  },
  "謨": {
    polarity: "惡",
    layer1: "屬愛煩惱",
    aliases: ["俱生惑", "思惑", "修所斷惑"],
    note: "不由分別。任運起故。微細難斷。須見道後修無漏道。乃漸斷故。",
    brief: "愛煩惱（不由分別任運而起）",
    deeper: "屬愛煩惱過輕·惡相次第輕",
  },
  // 阿、彌、陀、佛表善
  "阿": {
    polarity: "善",
    layer1: "施善",
    layer2: "有漏善",
    layer3: "生滅門",
    capacity: "三乘鈍根",
    paramita: "布施波羅密",
    teaching: "藏教所攝",
    brief: "施善（布施波羅密·生滅門·三乘鈍根·藏教所攝）",
    deeper: "若無慧導·有漏布施",
  },
  "彌": {
    polarity: "善",
    layer1: "戒善",
    layer2: "有漏善",
    layer3: "無生滅門",
    capacity: "三乘利根",
    paramita: "持戒波羅密",
    teaching: "通教所攝",
    brief: "戒善（持戒波羅密·無生滅門·三乘利根·通教所攝）",
    deeper: "若無慧導·有漏持戒",
  },
  "陀": {
    polarity: "善",
    layer1: "定善",
    layer2: "有漏善",
    layer3: "次第門",
    capacity: "大乘鈍根",
    paramita: "禪波羅密",
    teaching: "別教所攝",
    brief: "定善（禪波羅密·次第門·大乘鈍根·別教所攝）",
    deeper: "若無慧導·有漏禪定",
  },
  "佛": {
    polarity: "善",
    layer1: "善慧",
    layer2: "無漏善",
    layer3: "圓頓門",
    capacity: "大乘利根",
    paramita: "般若波羅密",
    teaching: "圓教所攝",
    brief: "善慧（般若波羅密·圓頓門·大乘利根·圓教所攝）",
    deeper: "以慧導施戒禪·施戒禪亦無漏",
  },
};

// 21 擲相的判教標籤
window.DICE_COMBINATIONS = [
  { id: "那那", chars: ["那","那"], layer: "雙重見惑", interp: "純見煩惱現行", level: "重惡" },
  { id: "那謨", chars: ["那","謨"], layer: "見思相雜", interp: "見惑愛惑並起", level: "中惡" },
  { id: "謨謨", chars: ["謨","謨"], layer: "雙重愛惑", interp: "純愛煩惱現行", level: "中惡" },
  { id: "那阿", chars: ["那","阿"], layer: "見惑+施善", interp: "見惑為主·夾施善", level: "雜染" },
  { id: "謨阿", chars: ["謨","阿"], layer: "愛惑+施善", interp: "愛惑為主·夾施善", level: "雜染" },
  { id: "阿阿", chars: ["阿","阿"], layer: "雙重施善", interp: "純施善現行", level: "有漏善" },
  { id: "那彌", chars: ["那","彌"], layer: "見惑+戒善", interp: "見惑為主·夾戒善", level: "雜染" },
  { id: "謨彌", chars: ["謨","彌"], layer: "愛惑+戒善", interp: "愛惑為主·夾戒善", level: "雜染" },
  { id: "阿彌", chars: ["阿","彌"], layer: "施戒並修", interp: "施善與戒善並起", level: "有漏善" },
  { id: "彌彌", chars: ["彌","彌"], layer: "雙重戒善", interp: "純戒善現行", level: "有漏善" },
  { id: "那陀", chars: ["那","陀"], layer: "見惑+定善", interp: "見惑為主·夾定善", level: "雜染" },
  { id: "謨陀", chars: ["謨","陀"], layer: "愛惑+定善", interp: "愛惑為主·夾定善", level: "雜染" },
  { id: "阿陀", chars: ["阿","陀"], layer: "施定並修", interp: "施善與定善並起", level: "有漏善" },
  { id: "彌陀", chars: ["彌","陀"], layer: "戒定並修", interp: "戒善與定善並起", level: "有漏善" },
  { id: "陀陀", chars: ["陀","陀"], layer: "雙重定善", interp: "純定善現行", level: "有漏善" },
  { id: "那佛", chars: ["那","佛"], layer: "見惑+善慧", interp: "以慧對治見煩惱", level: "慧導" },
  { id: "謨佛", chars: ["謨","佛"], layer: "愛惑+善慧", interp: "以慧對治愛煩惱", level: "慧導" },
  { id: "阿佛", chars: ["阿","佛"], layer: "施慧並修", interp: "以慧導施·施亦無漏", level: "慧導" },
  { id: "彌佛", chars: ["彌","佛"], layer: "戒慧並修", interp: "以慧導戒·戒亦無漏", level: "慧導" },
  { id: "陀佛", chars: ["陀","佛"], layer: "定慧並修", interp: "以慧導定·定亦無漏", level: "慧導" },
  { id: "佛佛", chars: ["佛","佛"], layer: "雙重善慧", interp: "純善慧現行·圓頓門相·至圓至頓", level: "圓頓" },
];

// 第一門 21 位的擲相代號
window.FIRST_GATE_CODES = [
  { dice: "那那", positionName: "上品十惡",   slug: "01-01-上品十惡",   field: "那" },
  { dice: "那謨", positionName: "中品十惡",   slug: "01-02-中品十惡",   field: "那" },
  { dice: "謨謨", positionName: "下品十惡",   slug: "01-03-下品十惡",   field: "那" },
  { dice: "那阿", positionName: "見取",       slug: "01-04-見取",       field: "那" },
  { dice: "謨阿", positionName: "慢心行施",   slug: "01-05-慢心行施",   field: "那" },
  { dice: "阿阿", positionName: "世間福",     slug: "01-06-世間福",     field: "那" },
  { dice: "那彌", positionName: "戒取",       slug: "01-07-戒取",       field: "彌" },
  { dice: "謨彌", positionName: "下品十善",   slug: "01-08-下品十善",   field: "彌" },
  { dice: "阿彌", positionName: "中品十善",   slug: "01-09-中品十善",   field: "彌" },
  { dice: "彌彌", positionName: "上品十善",   slug: "01-10-上品十善",   field: "彌" },
  { dice: "那陀", positionName: "邪定",       slug: "01-11-邪定",       field: "陀" },
  { dice: "謨陀", positionName: "味禪",       slug: "01-12-味禪",       field: "陀" },
  { dice: "阿陀", positionName: "根本四禪",   slug: "01-13-根本四禪",   field: "陀" },
  { dice: "彌陀", positionName: "四無量心",   slug: "01-14-四無量心",   field: "陀" },
  { dice: "陀陀", positionName: "四無色定",   slug: "01-15-四無色定",   field: "陀" },
  { dice: "那佛", positionName: "意見參禪",   slug: "01-16-意見參禪",   field: "佛" },
  { dice: "謨佛", positionName: "利名習教",   slug: "01-17-利名習教",   field: "佛" },
  { dice: "阿佛", positionName: "出世福業",   slug: "01-18-出世福業",   field: "佛" },
  { dice: "彌佛", positionName: "出世戒學",   slug: "01-19-出世戒學",   field: "佛" },
  { dice: "陀佛", positionName: "出世定學",   slug: "01-20-出世定學",   field: "佛" },
  { dice: "佛佛", positionName: "出世慧學",   slug: "01-21-出世慧學",   field: "佛" },
];

// ============================================
// 門的判教學定位
// ============================================
window.DOOR_JUDGMENT = {
  1:  { tag: "全譜起手",       brief: "凡夫起心動念之21種起手相·六字判教完整展開" },
  2:  { tag: "法道流弊",       brief: "破戒毀正見之五位·警示修行人勿入歧途" },
  3:  { tag: "六道惡趣",       brief: "三品十惡所感地獄畜生餓鬼修羅·六道往還之苦" },
  4:  { tag: "欲界人天",       brief: "四洲六欲·飲食男女睡眠三事五欲所攝" },
  5:  { tag: "色無色天",       brief: "色界四禪無色四空·世間定地·愛見未除" },
  6:  { tag: "入佛法初門",     brief: "聽法護法請法三懺·三障重罪皆得滅除·真正入佛法之始" },
  7:  { tag: "增上戒學",       brief: "戒如捉賊·三無漏學之首·因戒生定" },
  8:  { tag: "增上定學",       brief: "定如縛賊·因定發慧·禪定徧攝三乘一乘" },
  9:  { tag: "增上慧學",       brief: "慧如殺賊·中道實慧·破無始無明" },
  10: { tag: "藏教·阿字所攝",  brief: "生滅門·三乘鈍根·析空觀·斷見思出三界" },
  11: { tag: "通教·彌字所攝",  brief: "無生滅門·三乘利根·體空觀·受別圓來接" },
  12: { tag: "別教·陀字所攝",  brief: "次第門·大乘鈍根·次第三觀·五十二位因果次第" },
  13: { tag: "圓教·佛字所攝",  brief: "圓頓門·大乘利根·一心三觀·三諦圓融" },
  14: { tag: "淨土橫超",       brief: "仗阿彌陀佛願力·未斷見思即出娑婆穢·四教皆豎入·唯淨土橫超" },
  15: { tag: "圓極果位",       brief: "即位次而非位次·歸無所得·金佛金蛇本無二" },
};

// ============================================
// 關鍵轉折判定
// ============================================
// 守則（不妄語）：門號非修證高低之線性刻度（如第二門「法道流弊」門號雖高，實為破戒墮弊），
// 故不再以門號臆斷「升進/退降/退轉/跨簇群/墮惡趣」等判語。
// 僅標記書中明文標定之特殊時刻：圓滿（第十五門）、橫超（入第十四淨土門）、入佛法初門（首入第六門）。
// 其餘一律回 normal，由界面如實述「自X行至Y」並附譜曰 note，不加臆斷。
window.detectTransition = function(fromPos, toPos, diceId, isOff) {
  if (isOff) return { kind: "stay" };
  if (!fromPos || !toPos) return { kind: "normal" };

  // 抵達究竟果位
  if (toPos.door === 15) {
    return { kind: "endgame", emphasis: "ultimate" };
  }
  // 入淨土橫超門（仗彌陀願力，異於自力豎入——卷十四明文）
  if (toPos.door === 14 && fromPos.door !== 14) {
    return { kind: "horizontal", emphasis: "lotus" };
  }
  // 凡夫首入第六門「生善滅惡」——真正入佛法之始（卷二明文）
  if (toPos.door === 6 && fromPos.door <= 5) {
    return { kind: "enter-dharma", emphasis: "dharma-gate" };
  }
  return { kind: "normal" };
};

function getClusterNum(door) {
  if (door <= 2) return 1;
  if (door <= 5) return 2;
  if (door === 6) return 3;
  if (door <= 9) return 4;
  if (door <= 13) return 5;
  return 6;
}
window.getClusterNum = getClusterNum;

// ============================================
// 心路統計
// ============================================
window.computeMindJourneyStats = function(history) {
  const stats = {
    totalRolls: 0,
    inEvilRealms: 0,
    inHumanHeaven: 0,
    enteredDharmaGate: 0,
    enteredChan: 0,
    enteredFourTeachings: 0,
    enteredJingTu: 0,
    fofoCount: 0,
    huiDaoCount: 0,
    naNaCount: 0,
    offCount: 0,
    retrogressionCount: 0,
    crossDoorCount: 0,
    doorsVisited: new Set(),
  };
  
  let lastDoor = null;
  
  for (const h of history) {
    if (h.isSetup) {
      const p = (window.POSITIONS || []).find(x => x.slug === h.toSlug);
      if (p) {
        stats.doorsVisited.add(p.door);
        lastDoor = p.door;
      }
      continue;
    }
    
    stats.totalRolls++;
    
    if (h.diceId === "佛佛") stats.fofoCount++;
    if (h.diceId === "那那") stats.naNaCount++;
    if (h.diceId && h.diceId.includes("佛")) stats.huiDaoCount++;
    
    if (h.off) {
      stats.offCount++;
      continue;
    }
    
    const toPos = (window.POSITIONS || []).find(p => p.slug === h.toSlug);
    if (!toPos) continue;
    
    stats.doorsVisited.add(toPos.door);
    
    if (lastDoor !== null && toPos.door !== lastDoor) {
      stats.crossDoorCount++;
      if (toPos.door < lastDoor) stats.retrogressionCount++;
    }
    
    if (toPos.door === 3) stats.inEvilRealms++;
    if (toPos.door === 4 || toPos.door === 5) stats.inHumanHeaven++;
    if (toPos.door === 6) {
      if (lastDoor === null || lastDoor !== 6) stats.enteredDharmaGate++;
      if (h.toName && (h.toName.includes("懺") || h.toName.includes("忏"))) {
        stats.enteredChan++;
      }
    }
    if (toPos.door >= 10 && toPos.door <= 13) {
      if (lastDoor === null || lastDoor < 10) stats.enteredFourTeachings++;
    }
    if (toPos.door === 14) {
      if (lastDoor === null || lastDoor !== 14) stats.enteredJingTu++;
    }
    
    lastDoor = toPos.door;
  }
  
  return stats;
};

// ============================================
// 二輪擲骰
// ============================================
window.rollDice = function() {
  const chars = ["那", "謨", "阿", "彌", "陀", "佛"];
  const c1 = chars[Math.floor(Math.random() * 6)];
  const c2 = chars[Math.floor(Math.random() * 6)];
  const order = { "那":0, "謨":1, "阿":2, "彌":3, "陀":4, "佛":5 };
  const sorted = order[c1] <= order[c2] ? [c1, c2] : [c2, c1];
  const combined = sorted[0] + sorted[1];
  return {
    c1: c1,
    c2: c2,
    combined: combined,
    chars: sorted,
  };
};

window.getDiceMeta = function(diceId) {
  return window.DICE_COMBINATIONS.find(d => d.id === diceId);
};

window.getFirstGateBy = function(diceId) {
  return window.FIRST_GATE_CODES.find(f => f.dice === diceId);
};

window.getDoorJudgment = function(doorId) {
  return window.DOOR_JUDGMENT[doorId] || null;
};
