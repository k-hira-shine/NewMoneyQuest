import { UserProfile, Expense, SavedData, SerializedExpense, MainCategory, getSubCategoryById } from '../types';

// LocalStorageのキー
const STORAGE_KEY = 'money_quest_data';

// 編集・削除時のペナルティ倍率
export const PENALTY_MULTIPLIER = 1.5;

// メインカテゴリーのデフォルト倍率
// 後方互換性のために残す
export const MAIN_CATEGORY_MULTIPLIERS: { [key in MainCategory]: number } = {
  [MainCategory.GROWTH]: 3.0,
  [MainCategory.ENTERTAINMENT]: 1.5,
  [MainCategory.LIFE]: 1.0
};

// メインカテゴリーのデフォルトサブカテゴリー
export const DEFAULT_SUB_CATEGORIES: { [key in MainCategory]: string } = {
  [MainCategory.GROWTH]: 'books',
  [MainCategory.ENTERTAINMENT]: 'entertainment',
  [MainCategory.LIFE]: 'food'
};

// EXP差分をプロフィールに適用するユーティリティ
export const applyExpDelta = (profile: UserProfile, category: MainCategory, delta: number): UserProfile => {
  const updated = { ...profile, skills: { ...profile.skills } } as UserProfile;

  // トータル EXP
  updated.totalExp = Math.max(0, updated.totalExp + delta);
  // 該当スキル EXP
  const skill = { ...updated.skills[category] };
  skill.exp = Math.max(0, skill.exp + delta);
  updated.skills[category] = skill;

  // レベル再計算
  updated.level = calculateLevel(updated.totalExp);
  Object.keys(updated.skills).forEach(key => {
    const k = key as MainCategory;
    updated.skills[k].level = calculateLevel(updated.skills[k].exp);
  });

  return updated;
};

// 経験値からレベルを計算する関数
export const calculateLevel = (exp: number): number => {
  // レベルアップに必要な経験値は、レベルが上がるごとに増加
  // レベルnに必要な経験値 = 100 * (n^1.5)
  let level = 1;
  while (calculateExpForLevel(level + 1) <= exp) {
    level++;
  }
  return level;
};

// 指定レベルに必要な経験値を計算
export const calculateExpForLevel = (level: number): number => {
  return Math.floor(100 * Math.pow(level, 1.5));
};

// 次のレベルに必要な経験値を計算
export const calculateExpToNextLevel = (currentExp: number): number => {
  const currentLevel = calculateLevel(currentExp);
  const nextLevelExp = calculateExpForLevel(currentLevel + 1);
  return nextLevelExp - currentExp;
};

// 現在のレベルでの経験値の進捗率を計算（0～1の値）
export const calculateExpProgress = (currentExp: number): number => {
  const currentLevel = calculateLevel(currentExp);
  const currentLevelExp = calculateExpForLevel(currentLevel);
  const nextLevelExp = calculateExpForLevel(currentLevel + 1);
  const levelExpRange = nextLevelExp - currentLevelExp;
  const expIntoLevel = currentExp - currentLevelExp;
  
  return expIntoLevel / levelExpRange;
};

// 当初の経験値計算関数（後方互換性のために残す）
export const calculateExp = (amount: number, category: MainCategory): number => {
  // 基本は100円で1EXP
  const baseExp = Math.floor(amount / 100);
  return Math.floor(baseExp * MAIN_CATEGORY_MULTIPLIERS[category]);
};

// サブカテゴリーを使ったEXP計算関数
export const calculateExpWithSubCategory = (
  amount: number, 
  subCategoryId: string
): number => {
  const subCategory = getSubCategoryById(subCategoryId);
  if (!subCategory) {
    // サブカテゴリーが見つからない場合はメインカテゴリーのデフォルト倍率を使用
    console.error(`サブカテゴリーID ${subCategoryId} が見つかりません`);
    return 0;
  }
  
  const baseExp = Math.floor(amount / 100);
  return Math.floor(baseExp * subCategory.multiplier);
};

// 既存データのマイグレーション関数
export const migrateExpensesData = (expenses: any[]): Expense[] => {
  return expenses.map(expense => {
    // subCategoryIdがない古いデータの場合、デフォルトのサブカテゴリーを割り当て
    if (!expense.subCategoryId) {
      const category = expense.category as MainCategory;
      return {
        ...expense,
        subCategoryId: DEFAULT_SUB_CATEGORIES[category]
      } as Expense;
    }
    return expense as Expense;
  });
};

// ユーザーデータをLocalStorageに保存
export const saveUserData = (profile: UserProfile, expenses: Expense[]): void => {
  try {
    // 日付オブジェクトをISOString形式に変換
    const serializedExpenses: SerializedExpense[] = expenses.map(expense => ({
      ...expense,
      date: expense.date instanceof Date ? expense.date.toISOString() : expense.date as string
    }));
    
    // 型安全に変換するために、明示的に型を指定
    const data: SavedData = {
      profile,
      expenses: serializedExpenses
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('データの保存に失敗しました:', error);
  }
};

// LocalStorageからロードした後にアプリで利用するデータ型
export interface LoadedData {
  profile: UserProfile;
  expenses: Expense[];
}

// ユーザーデータをLocalStorageから読み込み
export const loadUserData = (): LoadedData | null => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return null;
    
    const parsedData = JSON.parse(data) as SavedData;
    
    // ISOString形式の日付を Date オブジェクトに変換
    const expenses = parsedData.expenses.map(expense => ({
      ...expense,
      date: new Date(expense.date)
    }));
    
    // 既存データのマイグレーション処理
    const migratedExpenses = migrateExpensesData(expenses);
    
    const loaded: LoadedData = {
      profile: parsedData.profile,
      expenses: migratedExpenses
    };

    return loaded;
  } catch (error) {
    console.error('データの読み込みに失敗しました:', error);
    return null;
  }
};
