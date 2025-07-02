import { UserProfile, Expense, SavedData, SerializedExpense } from '../types';

// LocalStorageのキー
const STORAGE_KEY = 'money_quest_data';

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

// 支出額から基本経験値を計算
export const calculateExp = (amount: number, multiplier: number = 1): number => {
  // 基本経験値 = 支出額 ÷ 100（小数点以下切り捨て）
  const baseExp = Math.floor(amount / 100);
  // スキル倍率を適用
  return Math.floor(baseExp * multiplier);
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
    
    const loaded: LoadedData = {
      profile: parsedData.profile,
      expenses
    };

    return loaded;
  } catch (error) {
    console.error('データの読み込みに失敗しました:', error);
    return null;
  }
};
