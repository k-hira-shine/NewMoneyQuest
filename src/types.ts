// スキルカテゴリーの定義
export enum SkillCategory {
  GROWTH = '成長スキル',
  ENTERTAINMENT = '娯楽スキル',
  LIFE = '生活スキル'
}

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
    [key in SkillCategory]: SkillData;
  };
}

// 支出データの型定義
export interface Expense {
  id: string;
  amount: number;
  category: SkillCategory;
  memo: string;
  date: Date;
  expGained: number;
}

// LocalStorage保存用のシリアライズされた支出データの型定義
export interface SerializedExpense {
  id: string;
  amount: number;
  category: SkillCategory;
  memo: string;
  date: string; // Dateオブジェクトを文字列として保存
  expGained: number;
}

// LocalStorageに保存するデータの型定義
export interface SavedData {
  profile: UserProfile;
  expenses: SerializedExpense[];
}
