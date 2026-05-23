/**
 * Cactus — Full Level/ELO/XP Progression System
 *
 * 100 levels across 5 epochs. ELO uses Glicko-inspired formula with
 * variable K-factors for placement and long-term stability.
 */

export interface LevelEntry {
  level: number;
  name: string;
  cumulativeXp: number;
  eloMin: number;
  eloMax: number;
}

export interface EpochEntry {
  epoch: number;
  levelMin: number;
  levelMax: number;
  xpPerLevel: number;
  name: string;
  nameRu: string;
  nameUz: string;
}

/* ─── Epochs ─────────────────────────────────── */

export const EPOCH_TABLE: EpochEntry[] = [
  { epoch: 1, levelMin: 1,  levelMax: 20,  xpPerLevel: 100,  name: "Rookie Era",    nameRu: "Эра Новичка",     nameUz: "Yangi Boshlovchi Davri" },
  { epoch: 2, levelMin: 21, levelMax: 40,  xpPerLevel: 250,  name: "Analyst Era",   nameRu: "Эра Аналитика",   nameUz: "Analitik Davri" },
  { epoch: 3, levelMin: 41, levelMax: 60,  xpPerLevel: 500,  name: "Detective Era", nameRu: "Эра Детектива",   nameUz: "Detektiv Davri" },
  { epoch: 4, levelMin: 61, levelMax: 80,  xpPerLevel: 1000, name: "Expert Era",    nameRu: "Эра Эксперта",    nameUz: "Ekspert Davri" },
  { epoch: 5, levelMin: 81, levelMax: 100, xpPerLevel: 2000, name: "Master Era",    nameRu: "Эра Мастера",     nameUz: "Usta Davri" },
];

/* ─── All 100 Levels ─────────────────────────── */

export const LEVEL_TABLE: LevelEntry[] = [
  { level: 1,   name: "Fresh Eyes",            cumulativeXp: 0,      eloMin: 400,  eloMax: 500  },
  { level: 2,   name: "First Doubt",           cumulativeXp: 100,    eloMin: 500,  eloMax: 550  },
  { level: 3,   name: "Curious Mind",          cumulativeXp: 200,    eloMin: 550,  eloMax: 600  },
  { level: 4,   name: "Pattern Seeker",        cumulativeXp: 300,    eloMin: 600,  eloMax: 650  },
  { level: 5,   name: "Alert Citizen",         cumulativeXp: 400,    eloMin: 650,  eloMax: 700  },
  { level: 6,   name: "Careful Reader",        cumulativeXp: 500,    eloMin: 700,  eloMax: 730  },
  { level: 7,   name: "Sharp Eye",             cumulativeXp: 600,    eloMin: 730,  eloMax: 760  },
  { level: 8,   name: "Question Asker",        cumulativeXp: 700,    eloMin: 760,  eloMax: 790  },
  { level: 9,   name: "Detail Spotter",        cumulativeXp: 800,    eloMin: 790,  eloMax: 820  },
  { level: 10,  name: "Rookie Detective",      cumulativeXp: 900,    eloMin: 820,  eloMax: 850  },
  { level: 11,  name: "Street Smart",          cumulativeXp: 1000,   eloMin: 850,  eloMax: 875  },
  { level: 12,  name: "Flag Raiser",           cumulativeXp: 1250,   eloMin: 875,  eloMax: 900  },
  { level: 13,  name: "Lie Detector",          cumulativeXp: 1500,   eloMin: 900,  eloMax: 920  },
  { level: 14,  name: "Trust Tester",          cumulativeXp: 1750,   eloMin: 920,  eloMax: 940  },
  { level: 15,  name: "Scam Spotter",          cumulativeXp: 2000,   eloMin: 940,  eloMax: 960  },
  { level: 16,  name: "Claim Checker",         cumulativeXp: 2250,   eloMin: 960,  eloMax: 980  },
  { level: 17,  name: "Fraud Finder",          cumulativeXp: 2500,   eloMin: 980,  eloMax: 1000 },
  { level: 18,  name: "Pressure Proof",        cumulativeXp: 2750,   eloMin: 1000, eloMax: 1020 },
  { level: 19,  name: "Bluff Caller",          cumulativeXp: 3000,   eloMin: 1020, eloMax: 1040 },
  { level: 20,  name: "Junior Analyst",        cumulativeXp: 3250,   eloMin: 1040, eloMax: 1060 },
  { level: 21,  name: "Risk Reader",           cumulativeXp: 3500,   eloMin: 1060, eloMax: 1090 },
  { level: 22,  name: "Evidence Hunter",       cumulativeXp: 3750,   eloMin: 1090, eloMax: 1110 },
  { level: 23,  name: "Trust Auditor",         cumulativeXp: 4000,   eloMin: 1110, eloMax: 1130 },
  { level: 24,  name: "Cold Caller",           cumulativeXp: 4250,   eloMin: 1130, eloMax: 1150 },
  { level: 25,  name: "Signal Tracer",         cumulativeXp: 4500,   eloMin: 1150, eloMax: 1170 },
  { level: 26,  name: "Red Flag Pro",          cumulativeXp: 4750,   eloMin: 1170, eloMax: 1190 },
  { level: 27,  name: "Scheme Buster",         cumulativeXp: 5000,   eloMin: 1190, eloMax: 1210 },
  { level: 28,  name: "Voice Analyst",         cumulativeXp: 5250,   eloMin: 1210, eloMax: 1230 },
  { level: 29,  name: "Data Verifier",         cumulativeXp: 5500,   eloMin: 1230, eloMax: 1250 },
  { level: 30,  name: "Field Analyst",         cumulativeXp: 5750,   eloMin: 1250, eloMax: 1270 },
  { level: 31,  name: "Tactical Thinker",      cumulativeXp: 6250,   eloMin: 1270, eloMax: 1290 },
  { level: 32,  name: "Pressure Handler",      cumulativeXp: 6750,   eloMin: 1290, eloMax: 1310 },
  { level: 33,  name: "Chain Breaker",         cumulativeXp: 7250,   eloMin: 1310, eloMax: 1330 },
  { level: 34,  name: "Manipulation Proof",    cumulativeXp: 7750,   eloMin: 1330, eloMax: 1350 },
  { level: 35,  name: "Instinct Sharpener",    cumulativeXp: 8250,   eloMin: 1350, eloMax: 1365 },
  { level: 36,  name: "Deception Reader",      cumulativeXp: 8750,   eloMin: 1365, eloMax: 1380 },
  { level: 37,  name: "Urgency Resistant",     cumulativeXp: 9250,   eloMin: 1380, eloMax: 1395 },
  { level: 38,  name: "Authority Tester",      cumulativeXp: 9750,   eloMin: 1395, eloMax: 1410 },
  { level: 39,  name: "Story Breaker",         cumulativeXp: 10250,  eloMin: 1410, eloMax: 1425 },
  { level: 40,  name: "Senior Analyst",        cumulativeXp: 10750,  eloMin: 1425, eloMax: 1440 },
  { level: 41,  name: "Case Opener",           cumulativeXp: 11250,  eloMin: 1440, eloMax: 1455 },
  { level: 42,  name: "Lead Investigator",     cumulativeXp: 11750,  eloMin: 1455, eloMax: 1470 },
  { level: 43,  name: "Trace Master",          cumulativeXp: 12250,  eloMin: 1470, eloMax: 1485 },
  { level: 44,  name: "Motive Hunter",         cumulativeXp: 12750,  eloMin: 1485, eloMax: 1500 },
  { level: 45,  name: "Alias Buster",          cumulativeXp: 13250,  eloMin: 1500, eloMax: 1515 },
  { level: 46,  name: "Deep Scanner",          cumulativeXp: 13750,  eloMin: 1515, eloMax: 1530 },
  { level: 47,  name: "Identity Guard",        cumulativeXp: 14250,  eloMin: 1530, eloMax: 1545 },
  { level: 48,  name: "Threat Mapper",         cumulativeXp: 14750,  eloMin: 1545, eloMax: 1560 },
  { level: 49,  name: "Network Breaker",       cumulativeXp: 15250,  eloMin: 1560, eloMax: 1575 },
  { level: 50,  name: "Elite Detective",       cumulativeXp: 15750,  eloMin: 1575, eloMax: 1590 },
  { level: 51,  name: "Shadow Hunter",         cumulativeXp: 16750,  eloMin: 1590, eloMax: 1605 },
  { level: 52,  name: "Ghost Tracer",          cumulativeXp: 17750,  eloMin: 1605, eloMax: 1618 },
  { level: 53,  name: "Code Breaker",          cumulativeXp: 18750,  eloMin: 1618, eloMax: 1631 },
  { level: 54,  name: "Fake Destroyer",        cumulativeXp: 19750,  eloMin: 1631, eloMax: 1644 },
  { level: 55,  name: "Mask Remover",          cumulativeXp: 20750,  eloMin: 1644, eloMax: 1657 },
  { level: 56,  name: "Deep Fake Hunter",      cumulativeXp: 21750,  eloMin: 1657, eloMax: 1670 },
  { level: 57,  name: "Phish Slayer",          cumulativeXp: 22750,  eloMin: 1670, eloMax: 1683 },
  { level: 58,  name: "Social Engineer Proof", cumulativeXp: 23750,  eloMin: 1683, eloMax: 1696 },
  { level: 59,  name: "Vault Guardian",        cumulativeXp: 24750,  eloMin: 1696, eloMax: 1709 },
  { level: 60,  name: "Master Detective",      cumulativeXp: 25750,  eloMin: 1709, eloMax: 1722 },
  { level: 61,  name: "Fraud Architect",       cumulativeXp: 26750,  eloMin: 1722, eloMax: 1735 },
  { level: 62,  name: "Scam Dismantler",       cumulativeXp: 27750,  eloMin: 1735, eloMax: 1748 },
  { level: 63,  name: "Lie Archaeologist",     cumulativeXp: 28750,  eloMin: 1748, eloMax: 1761 },
  { level: 64,  name: "Trust Calibrator",      cumulativeXp: 29750,  eloMin: 1761, eloMax: 1774 },
  { level: 65,  name: "Deception Immune",      cumulativeXp: 30750,  eloMin: 1774, eloMax: 1787 },
  { level: 66,  name: "Phantom Catcher",       cumulativeXp: 31750,  eloMin: 1787, eloMax: 1800 },
  { level: 67,  name: "Signal Decoder",        cumulativeXp: 32750,  eloMin: 1800, eloMax: 1812 },
  { level: 68,  name: "Mind Shield",           cumulativeXp: 33750,  eloMin: 1812, eloMax: 1824 },
  { level: 69,  name: "Fraud Surgeon",         cumulativeXp: 34750,  eloMin: 1824, eloMax: 1836 },
  { level: 70,  name: "Senior Expert",         cumulativeXp: 35750,  eloMin: 1836, eloMax: 1848 },
  { level: 71,  name: "Threat Oracle",         cumulativeXp: 36750,  eloMin: 1848, eloMax: 1860 },
  { level: 72,  name: "Pattern Master",        cumulativeXp: 37750,  eloMin: 1860, eloMax: 1872 },
  { level: 73,  name: "Invisible Catcher",     cumulativeXp: 38750,  eloMin: 1872, eloMax: 1884 },
  { level: 74,  name: "Doubt Engineer",        cumulativeXp: 39750,  eloMin: 1884, eloMax: 1896 },
  { level: 75,  name: "Apex Analyst",          cumulativeXp: 40750,  eloMin: 1896, eloMax: 1908 },
  { level: 76,  name: "Scam Surgeon",          cumulativeXp: 42750,  eloMin: 1908, eloMax: 1918 },
  { level: 77,  name: "Zero Trust Pro",        cumulativeXp: 44750,  eloMin: 1918, eloMax: 1928 },
  { level: 78,  name: "Fraud Terminator",      cumulativeXp: 46750,  eloMin: 1928, eloMax: 1938 },
  { level: 79,  name: "Lie Exterminator",      cumulativeXp: 48750,  eloMin: 1938, eloMax: 1948 },
  { level: 80,  name: "Grand Expert",          cumulativeXp: 50750,  eloMin: 1948, eloMax: 1958 },
  { level: 81,  name: "Phantom Detector",      cumulativeXp: 52750,  eloMin: 1958, eloMax: 1966 },
  { level: 82,  name: "Deep Mind Guard",       cumulativeXp: 54750,  eloMin: 1966, eloMax: 1974 },
  { level: 83,  name: "Scam Immortal",         cumulativeXp: 56750,  eloMin: 1974, eloMax: 1982 },
  { level: 84,  name: "Ultimate Analyst",      cumulativeXp: 58750,  eloMin: 1982, eloMax: 1990 },
  { level: 85,  name: "Fraud Legend",          cumulativeXp: 60750,  eloMin: 1990, eloMax: 1998 },
  { level: 86,  name: "Deception God",         cumulativeXp: 62750,  eloMin: 1998, eloMax: 2006 },
  { level: 87,  name: "Trust Architect",       cumulativeXp: 64750,  eloMin: 2006, eloMax: 2014 },
  { level: 88,  name: "Shadow Breaker",        cumulativeXp: 66750,  eloMin: 2014, eloMax: 2022 },
  { level: 89,  name: "Final Guardian",        cumulativeXp: 68750,  eloMin: 2022, eloMax: 2030 },
  { level: 90,  name: "Grand Master",          cumulativeXp: 70750,  eloMin: 2030, eloMax: 2038 },
  { level: 91,  name: "Scam Vanquisher",       cumulativeXp: 73750,  eloMin: 2038, eloMax: 2046 },
  { level: 92,  name: "Lie Annihilator",       cumulativeXp: 76750,  eloMin: 2046, eloMax: 2054 },
  { level: 93,  name: "Phantom Slayer",        cumulativeXp: 79750,  eloMin: 2054, eloMax: 2062 },
  { level: 94,  name: "Fraud Obliterator",     cumulativeXp: 82750,  eloMin: 2062, eloMax: 2070 },
  { level: 95,  name: "Apex Guardian",         cumulativeXp: 85750,  eloMin: 2070, eloMax: 2078 },
  { level: 96,  name: "Immortal Detective",    cumulativeXp: 88750,  eloMin: 2078, eloMax: 2086 },
  { level: 97,  name: "Fraud Deity",           cumulativeXp: 91750,  eloMin: 2086, eloMax: 2094 },
  { level: 98,  name: "Scam Eradicator",       cumulativeXp: 94750,  eloMin: 2094, eloMax: 2099 },
  { level: 99,  name: "Legend of Truth",       cumulativeXp: 97750,  eloMin: 2099, eloMax: 2100 },
  { level: 100, name: "The Untouchable",       cumulativeXp: 100000, eloMin: 2100, eloMax: 2100 },
];

/* ─── XP Reward Constants ────────────────────── */

export const XP_REWARDS = {
  correctVerdict: 50,
  perClue: 5,
  correctTool: 10,
  fasterThanAvg: 15,
  guessedFraudType: 20,
  dailyChallenge: 30,
  streak7: 50,
  streak30: 200,
  hintPenalty: -10,
  wrongVerdict: 0,
} as const;

/* ─── K-Factor for ELO ──────────────────────── */

export function getKFactor(level: number): number {
  if (level <= 5) return 80;   // Placement — fast calibration
  if (level <= 20) return 40;  // Still learning
  if (level <= 60) return 30;  // Stabilising
  return 20;                    // Every change is earned
}

/* ─── ELO Calculation ────────────────────────── */

export function calculateEloChange(
  playerElo: number,
  scenarioElo: number,
  result: 0 | 1, // 0 = loss, 1 = win
  level: number
): number {
  const expected = 1 / (1 + Math.pow(10, (scenarioElo - playerElo) / 400));
  const K = getKFactor(level);
  return Math.round(K * (result - expected));
}

/* ─── Level Utilities ────────────────────────── */

export function getLevelFromXp(totalXp: number): LevelEntry {
  for (let i = LEVEL_TABLE.length - 1; i >= 0; i--) {
    if (totalXp >= LEVEL_TABLE[i].cumulativeXp) {
      return LEVEL_TABLE[i];
    }
  }
  return LEVEL_TABLE[0];
}

export function getXpForNextLevel(totalXp: number): { current: number; needed: number; progress: number } {
  const currentLevel = getLevelFromXp(totalXp);
  const nextLevelIdx = Math.min(currentLevel.level, LEVEL_TABLE.length - 1);
  const nextLevel = LEVEL_TABLE[nextLevelIdx];

  if (currentLevel.level >= 100) {
    return { current: 0, needed: 0, progress: 100 };
  }

  const xpIntoLevel = totalXp - currentLevel.cumulativeXp;
  const xpNeeded = nextLevel.cumulativeXp - currentLevel.cumulativeXp;

  return {
    current: xpIntoLevel,
    needed: xpNeeded,
    progress: xpNeeded > 0 ? Math.min(100, Math.round((xpIntoLevel / xpNeeded) * 100)) : 100,
  };
}

export function getEpochFromLevel(level: number): EpochEntry {
  for (const epoch of EPOCH_TABLE) {
    if (level >= epoch.levelMin && level <= epoch.levelMax) {
      return epoch;
    }
  }
  return EPOCH_TABLE[0];
}

export function getEpochColor(epochNum: number): string {
  switch (epochNum) {
    case 1: return "#94A3B8"; // Slate/gray
    case 2: return "#60A5FA"; // Blue
    case 3: return "#A78BFA"; // Purple
    case 4: return "#FBBF24"; // Gold
    case 5: return "#F87171"; // Red
    default: return "#94A3B8";
  }
}

/* ─── Placement System ───────────────────────── */

export const PLACEMENT_SCENARIOS = [
  { game: 1, elo: 600,  label: "Easy",     purpose: "Get familiar with the mechanics" },
  { game: 2, elo: 900,  label: "Medium",   purpose: "Start calibration" },
  { game: 3, elo: 1200, label: "Hard",     purpose: "Test upper limits" },
  { game: 4, elo: 900,  label: "Medium",   purpose: "Confirm results" },
  { game: 5, elo: 0,    label: "Adaptive", purpose: "Final calibration" },
] as const;

export const STARTING_ELO_OPTIONS = [
  { label: "Never thought about it",       labelRu: "Никогда не думал об этом",     labelUz: "Bu haqda hech o'ylamaganman",    elo: 600  },
  { label: "Heard of fraudsters",          labelRu: "Слышал про мошенников",         labelUz: "Firibgarlar haqida eshitganman",  elo: 800  },
  { label: "Sometimes encountered",        labelRu: "Иногда сталкивался",            labelUz: "Ba'zan duch kelganman",           elo: 1000 },
  { label: "Work in banking/finance",      labelRu: "Работаю в банке / финансах",    labelUz: "Bank/moliya sohasida ishlayman",  elo: 1200 },
] as const;

export const ATTENTION_MODIFIERS = [
  { label: "Inattentive",          labelRu: "Невнимательный",      labelUz: "E'tiborsiz",           modifier: -100 },
  { label: "Average",              labelRu: "Средне",              labelUz: "O'rtacha",              modifier: 0    },
  { label: "Very Attentive",       labelRu: "Очень внимательный",  labelUz: "Juda e'tiborli",       modifier: 150  },
] as const;
