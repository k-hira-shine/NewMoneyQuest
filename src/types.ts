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

// LocalStorageに保存するデータの型定義
export interface SavedData {
  profile: UserProfile;
  expenses: SerializedExpense[];
}
