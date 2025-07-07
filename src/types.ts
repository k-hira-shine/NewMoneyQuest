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

// 職業（ジョブ）の定義
export interface Job {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  bonusCategories: MainCategory[];
  bonusMultiplier: number;
  requirements: JobRequirement[];
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
  {
    id: 'scholar',
    name: '学者',
    description: '知識の探求者。書籍や学習への投資を重視する',
    icon: '📚',
    color: 'text-blue-600',
    bonusCategories: [MainCategory.GROWTH],
    bonusMultiplier: 1.2,
    requirements: [
      { category: MainCategory.GROWTH, minPercentage: 50 }
    ]
  },
  {
    id: 'engineer',
    name: 'エンジニア',
    description: '技術の専門家。スキルアップと仕事道具への投資が多い',
    icon: '💻',
    color: 'text-green-600',
    bonusCategories: [MainCategory.GROWTH],
    bonusMultiplier: 1.15,
    requirements: [
      { category: MainCategory.GROWTH, minPercentage: 40 }
    ]
  },
  {
    id: 'artist',
    name: 'アーティスト',
    description: '創作活動に情熱を注ぐ。趣味と自己表現を重視する',
    icon: '🎨',
    color: 'text-purple-600',
    bonusCategories: [MainCategory.ENTERTAINMENT],
    bonusMultiplier: 1.2,
    requirements: [
      { category: MainCategory.ENTERTAINMENT, minPercentage: 35 }
    ]
  },
  {
    id: 'adventurer',
    name: '冒険者',
    description: '新しい体験を求める。レジャーや旅行への投資が多い',
    icon: '🗡️',
    color: 'text-orange-600',
    bonusCategories: [MainCategory.ENTERTAINMENT],
    bonusMultiplier: 1.1,
    requirements: [
      { category: MainCategory.ENTERTAINMENT, minPercentage: 30 }
    ]
  },
  {
    id: 'merchant',
    name: '商人',
    description: '人とのつながりを大切にする。交際費への投資が多い',
    icon: '💰',
    color: 'text-yellow-600',
    bonusCategories: [MainCategory.ENTERTAINMENT],
    bonusMultiplier: 1.1,
    requirements: [
      { category: MainCategory.ENTERTAINMENT, minPercentage: 25 }
    ]
  },
  {
    id: 'monk',
    name: '修行僧',
    description: '心身の鍛錬に励む。健康投資と自己改善を重視する',
    icon: '🧘',
    color: 'text-indigo-600',
    bonusCategories: [MainCategory.GROWTH],
    bonusMultiplier: 1.15,
    requirements: [
      { category: MainCategory.GROWTH, minPercentage: 30 }
    ]
  },
  {
    id: 'chef',
    name: '料理人',
    description: '食への情熱を持つ。食費への投資が多い',
    icon: '👨‍🍳',
    color: 'text-red-600',
    bonusCategories: [MainCategory.LIFE],
    bonusMultiplier: 1.1,
    requirements: [
      { category: MainCategory.LIFE, minPercentage: 60 }
    ]
  },
  {
    id: 'bard',
    name: '吟遊詩人',
    description: 'エンターテイメントを愛する。文化活動への投資が多い',
    icon: '🎭',
    color: 'text-pink-600',
    bonusCategories: [MainCategory.ENTERTAINMENT],
    bonusMultiplier: 1.1,
    requirements: [
      { category: MainCategory.ENTERTAINMENT, minPercentage: 40 }
    ]
  },
  {
    id: 'citizen',
    name: '市民',
    description: 'バランスの取れた生活を送る。特定の分野に偏らない',
    icon: '👤',
    color: 'text-gray-600',
    bonusCategories: [],
    bonusMultiplier: 1.0,
    requirements: []
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
