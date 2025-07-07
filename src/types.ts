// メインカテゴリーの定義（既存のSkillCategoryをMainCategoryに変更）
export enum MainCategory {
  GROWTH = '成長スキル',
  ENTERTAINMENT = '娯楽スキル',
  LIFE = '生活スキル'
}

// 後方互換性のために残す
export type SkillCategory = MainCategory;

// サブカテゴリーの定義（新規追加）
export interface SubCategory {
  id: string;
  name: string;
  icon: string;
  mainCategory: MainCategory;
  multiplier: number;
}

// サブカテゴリーマスターデータ（新規追加）
export const SUB_CATEGORIES: SubCategory[] = [
  // 成長スキル
  { id: 'books', name: '書籍・学習', icon: '📚', mainCategory: MainCategory.GROWTH, multiplier: 3.5 },
  { id: 'skill', name: 'スキルアップ', icon: '💻', mainCategory: MainCategory.GROWTH, multiplier: 4.0 },
  { id: 'tools', name: '仕事道具', icon: '🛠️', mainCategory: MainCategory.GROWTH, multiplier: 3.0 },
  { id: 'health', name: '健康投資', icon: '🏃', mainCategory: MainCategory.GROWTH, multiplier: 2.5 },
  
  // 娯楽スキル
  { id: 'entertainment', name: 'エンタメ', icon: '🎬', mainCategory: MainCategory.ENTERTAINMENT, multiplier: 1.5 },
  { id: 'social', name: '交際費', icon: '🍻', mainCategory: MainCategory.ENTERTAINMENT, multiplier: 1.8 },
  { id: 'leisure', name: 'レジャー', icon: '✈️', mainCategory: MainCategory.ENTERTAINMENT, multiplier: 2.0 },
  { id: 'hobby', name: '趣味', icon: '🎨', mainCategory: MainCategory.ENTERTAINMENT, multiplier: 1.5 },
  
  // 生活スキル
  { id: 'food', name: '食費', icon: '🍱', mainCategory: MainCategory.LIFE, multiplier: 1.0 },
  { id: 'daily', name: '日用品', icon: '🧼', mainCategory: MainCategory.LIFE, multiplier: 0.8 },
  { id: 'transport', name: '交通・通信', icon: '🚃', mainCategory: MainCategory.LIFE, multiplier: 1.2 },
  { id: 'medical', name: '医療・美容', icon: '💊', mainCategory: MainCategory.LIFE, multiplier: 1.5 }
];

// スキルデータの型定義
export interface SkillData {
  level: number;
  exp: number;
  multiplier: number;
}

// ユーザープロファイルの型定義
export interface UserProfile {
  name: string;
  avatar?: string; // 将来的に使用するためのプレースホルダー
  level: number;
  totalExp: number;
  skills: {
    [key in MainCategory]: SkillData;
  };
  job?: Job; // 職業（オプショナル）
  jobHistory?: JobHistory[]; // 職業履歴（オプショナル）
  unlockedJobs?: string[]; // 解放済み職業ID（オプショナル）
  totalSpent?: number; // 総支出額（オプショナル）
  startDate?: Date; // プレイ開始日（オプショナル）
}

// 職業履歴の型定義
export interface JobHistory {
  jobId: string;
  startDate: Date;
  endDate?: Date;
  reason: string;
}

// 支出データの型定義
export interface Expense {
  id: string;
  amount: number;
  category: MainCategory;
  subCategoryId: string;   // サブカテゴリーID（新規追加）
  memo: string;
  date: Date;
  expGained: number;
}

// LocalStorage保存用のシリアライズされた支出データの型定義
export interface SerializedExpense {
  id: string;
  amount: number;
  category: MainCategory;
  subCategoryId?: string;   // サブカテゴリーID（新規追加、古いデータとの互換性のためoptional）
  memo: string;
  date: string; // Dateオブジェクトを文字列として保存
  expGained: number;
}

// ヘルパー関数の追加
export const getSubCategoryById = (id: string): SubCategory | undefined => {
  return SUB_CATEGORIES.find(cat => cat.id === id);
};

export const getSubCategoriesByMainCategory = (mainCategory: MainCategory): SubCategory[] => {
  return SUB_CATEGORIES.filter(cat => cat.mainCategory === mainCategory);
};

// 職業ランク
export enum JobRank {
  NORMAL = 'normal',
  ADVANCED = 'advanced',
  MASTER = 'master'
}

// 職業解放条件
export interface JobUnlockCondition {
  type: 'level' | 'totalExp' | 'categoryExp' | 'amount' | 'days' | 'previousJob';
  category?: MainCategory;
  value: number;
  previousJobId?: string;
}

// 職業（ジョブ）の定義
export interface Job {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  rank: JobRank;
  bonusCategories: MainCategory[];
  bonusMultiplier: number;
  requirements: JobRequirement[];
  unlockConditions: JobUnlockCondition[];
  specialEffects?: string[];
}

// 職業判定のための要件
export interface JobRequirement {
  category: MainCategory;
  minPercentage: number;
  minAmount?: number;
}

// 職業スコア（判定結果）
export interface JobScore {
  job: Job;
  score: number;
  confidence: number;
  reasons: string[];
}

// 職業マスターデータ
export const JOBS: Job[] = [
  // === 普通職 ===
  {
    id: 'citizen',
    name: '市民',
    description: 'バランスの取れた生活を送る。特定の分野に偏らない',
    icon: '👤',
    color: 'text-gray-600',
    rank: JobRank.NORMAL,
    bonusCategories: [],
    bonusMultiplier: 1.0,
    requirements: [],
    unlockConditions: []
  },
  {
    id: 'student',
    name: '学生',
    description: '学習に励む。書籍や教材への投資を行う',
    icon: '📖',
    color: 'text-blue-500',
    rank: JobRank.NORMAL,
    bonusCategories: [MainCategory.GROWTH],
    bonusMultiplier: 1.1,
    requirements: [
      { category: MainCategory.GROWTH, minPercentage: 30 }
    ],
    unlockConditions: []
  },
  {
    id: 'apprentice',
    name: '見習い',
    description: '技術を学ぶ駆け出し。基本的なスキル投資を行う',
    icon: '🔧',
    color: 'text-green-500',
    rank: JobRank.NORMAL,
    bonusCategories: [MainCategory.GROWTH],
    bonusMultiplier: 1.1,
    requirements: [
      { category: MainCategory.GROWTH, minPercentage: 25 }
    ],
    unlockConditions: []
  },
  {
    id: 'hobbyist',
    name: '趣味人',
    description: '趣味や娯楽を楽しむ。エンターテイメントに投資',
    icon: '🎪',
    color: 'text-purple-500',
    rank: JobRank.NORMAL,
    bonusCategories: [MainCategory.ENTERTAINMENT],
    bonusMultiplier: 1.1,
    requirements: [
      { category: MainCategory.ENTERTAINMENT, minPercentage: 25 }
    ],
    unlockConditions: []
  },
  {
    id: 'homemaker',
    name: '主婦/主夫',
    description: '家庭を支える。生活必需品への効率的な投資',
    icon: '🏠',
    color: 'text-red-500',
    rank: JobRank.NORMAL,
    bonusCategories: [MainCategory.LIFE],
    bonusMultiplier: 1.1,
    requirements: [
      { category: MainCategory.LIFE, minPercentage: 50 }
    ],
    unlockConditions: []
  },

  // === 上級職 ===
  {
    id: 'scholar',
    name: '学者',
    description: '知識の探求者。書籍や学習への投資を重視する',
    icon: '📚',
    color: 'text-blue-600',
    rank: JobRank.ADVANCED,
    bonusCategories: [MainCategory.GROWTH],
    bonusMultiplier: 1.25,
    requirements: [
      { category: MainCategory.GROWTH, minPercentage: 50 }
    ],
    unlockConditions: [
      { type: 'level', value: 10 },
      { type: 'categoryExp', category: MainCategory.GROWTH, value: 5000 },
      { type: 'previousJob', previousJobId: 'student', value: 1 }
    ],
    specialEffects: ['書籍購入時のEXP+50%', '学習投資の効果+25%']
  },
  {
    id: 'engineer',
    name: 'エンジニア',
    description: '技術の専門家。スキルアップと仕事道具への投資が多い',
    icon: '💻',
    color: 'text-green-600',
    rank: JobRank.ADVANCED,
    bonusCategories: [MainCategory.GROWTH],
    bonusMultiplier: 1.2,
    requirements: [
      { category: MainCategory.GROWTH, minPercentage: 40 }
    ],
    unlockConditions: [
      { type: 'level', value: 8 },
      { type: 'categoryExp', category: MainCategory.GROWTH, value: 3000 },
      { type: 'previousJob', previousJobId: 'apprentice', value: 1 }
    ],
    specialEffects: ['技術系投資のEXP+30%', 'ツール購入時のボーナス']
  },
  {
    id: 'artist',
    name: 'アーティスト',
    description: '創作活動に情熱を注ぐ。趣味と自己表現を重視する',
    icon: '🎨',
    color: 'text-purple-600',
    rank: JobRank.ADVANCED,
    bonusCategories: [MainCategory.ENTERTAINMENT],
    bonusMultiplier: 1.25,
    requirements: [
      { category: MainCategory.ENTERTAINMENT, minPercentage: 40 }
    ],
    unlockConditions: [
      { type: 'level', value: 12 },
      { type: 'categoryExp', category: MainCategory.ENTERTAINMENT, value: 4000 },
      { type: 'previousJob', previousJobId: 'hobbyist', value: 1 }
    ],
    specialEffects: ['創作活動のEXP+40%', '芸術投資の効果+30%']
  },
  {
    id: 'adventurer',
    name: '冒険者',
    description: '新しい体験を求める。レジャーや旅行への投資が多い',
    icon: '🗡️',
    color: 'text-orange-600',
    rank: JobRank.ADVANCED,
    bonusCategories: [MainCategory.ENTERTAINMENT],
    bonusMultiplier: 1.15,
    requirements: [
      { category: MainCategory.ENTERTAINMENT, minPercentage: 35 }
    ],
    unlockConditions: [
      { type: 'level', value: 10 },
      { type: 'amount', value: 100000 },
      { type: 'previousJob', previousJobId: 'hobbyist', value: 1 }
    ],
    specialEffects: ['旅行・レジャーのEXP+50%', '体験型投資のボーナス']
  },
  {
    id: 'merchant',
    name: '商人',
    description: '人とのつながりを大切にする。交際費への投資が多い',
    icon: '💰',
    color: 'text-yellow-600',
    rank: JobRank.ADVANCED,
    bonusCategories: [MainCategory.ENTERTAINMENT],
    bonusMultiplier: 1.2,
    requirements: [
      { category: MainCategory.ENTERTAINMENT, minPercentage: 30 }
    ],
    unlockConditions: [
      { type: 'level', value: 15 },
      { type: 'totalExp', value: 10000 },
      { type: 'amount', value: 200000 }
    ],
    specialEffects: ['交際費のEXP+35%', '投資効率+20%']
  },
  {
    id: 'chef',
    name: '料理人',
    description: '食への情熱を持つ。食費への投資が多い',
    icon: '👨‍🍳',
    color: 'text-red-600',
    rank: JobRank.ADVANCED,
    bonusCategories: [MainCategory.LIFE],
    bonusMultiplier: 1.2,
    requirements: [
      { category: MainCategory.LIFE, minPercentage: 60 }
    ],
    unlockConditions: [
      { type: 'level', value: 8 },
      { type: 'categoryExp', category: MainCategory.LIFE, value: 5000 },
      { type: 'previousJob', previousJobId: 'homemaker', value: 1 }
    ],
    specialEffects: ['食材購入のEXP+45%', '料理関連投資のボーナス']
  },

  // === マスター職 ===
  {
    id: 'sage',
    name: '賢者',
    description: '知識の頂点に立つ者。あらゆる学習への深い理解を持つ',
    icon: '🧙‍♂️',
    color: 'text-blue-700',
    rank: JobRank.MASTER,
    bonusCategories: [MainCategory.GROWTH, MainCategory.ENTERTAINMENT],
    bonusMultiplier: 1.4,
    requirements: [
      { category: MainCategory.GROWTH, minPercentage: 60 }
    ],
    unlockConditions: [
      { type: 'level', value: 25 },
      { type: 'categoryExp', category: MainCategory.GROWTH, value: 20000 },
      { type: 'previousJob', previousJobId: 'scholar', value: 1 }
    ],
    specialEffects: ['全ての学習投資+60%', '知識系投資の超効率化', '経験値の複利効果']
  },
  {
    id: 'master_artisan',
    name: '匠',
    description: '技術の極致に達した職人。創造と技術の両方に精通',
    icon: '⚡',
    color: 'text-green-700',
    rank: JobRank.MASTER,
    bonusCategories: [MainCategory.GROWTH, MainCategory.ENTERTAINMENT],
    bonusMultiplier: 1.35,
    requirements: [
      { category: MainCategory.GROWTH, minPercentage: 45 },
      { category: MainCategory.ENTERTAINMENT, minPercentage: 25 }
    ],
    unlockConditions: [
      { type: 'level', value: 30 },
      { type: 'totalExp', value: 50000 },
      { type: 'previousJob', previousJobId: 'engineer', value: 1 }
    ],
    specialEffects: ['技術投資+70%', '創作活動+40%', 'イノベーションボーナス']
  },
  {
    id: 'virtuoso',
    name: '名人',
    description: '芸術の域に達した表現者。美と娯楽の極みを追求',
    icon: '🎭',
    color: 'text-purple-700',
    rank: JobRank.MASTER,
    bonusCategories: [MainCategory.ENTERTAINMENT, MainCategory.LIFE],
    bonusMultiplier: 1.4,
    requirements: [
      { category: MainCategory.ENTERTAINMENT, minPercentage: 55 }
    ],
    unlockConditions: [
      { type: 'level', value: 28 },
      { type: 'categoryExp', category: MainCategory.ENTERTAINMENT, value: 25000 },
      { type: 'previousJob', previousJobId: 'artist', value: 1 }
    ],
    specialEffects: ['芸術投資+80%', '文化活動の極致効果', '美的センスボーナス']
  }
];

// 職業をIDで検索するヘルパー関数
export const getJobById = (id: string): Job | undefined => {
  return JOBS.find(job => job.id === id);
};

// LocalStorageに保存するデータの型定義
export interface SavedData {
  profile: UserProfile;
  expenses: SerializedExpense[];
}
