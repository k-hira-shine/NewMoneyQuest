import React, { useState } from 'react';
import { MainCategory, Expense, getSubCategoriesByMainCategory } from '../types';

interface ExpenseFormProps {
  onSubmit: (amount: number, category: MainCategory, subCategoryId: string, memo: string) => void;
  onCancel: () => void;
  initialExpense?: Expense;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ onSubmit, onCancel, initialExpense }) => {
  const [amount, setAmount] = useState<string>(initialExpense ? initialExpense.amount.toString() : '');
  const [selectedMainCategory, setSelectedMainCategory] = useState<MainCategory | null>(
    initialExpense ? initialExpense.category : null
  );
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<string>(
    initialExpense ? initialExpense.subCategoryId : ''
  );
  const [memo, setMemo] = useState<string>(initialExpense ? initialExpense.memo : '');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 入力検証
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError('有効な金額を入力してください');
      return;
    }
    
    if (!selectedMainCategory) {
      setError('カテゴリーを選択してください');
      return;
    }
    
    if (!selectedSubCategoryId) {
      setError('サブカテゴリーを選択してください');
      return;
    }
    
    // 送信
    onSubmit(Number(amount), selectedMainCategory, selectedSubCategoryId, memo);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-rpg text-center mb-4">支出を記録</h2>
      
      {/* 金額入力 */}
      <div>
        <label htmlFor="amount" className="block mb-2 font-medium">
          金額 (円)
        </label>
        <input
          type="number"
          id="amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="1000"
          className="w-full p-2 border-2 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
          autoFocus
        />
      </div>
      
      {/* メインカテゴリー選択 */}
      <div>
        <label className="block mb-2 font-medium">メインカテゴリー</label>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            className={`p-3 flex flex-col items-center justify-center border-2 rounded ${
              selectedMainCategory === MainCategory.GROWTH
                ? 'bg-primary text-white border-primary'
                : 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600'
            }`}
            onClick={() => {
              setSelectedMainCategory(MainCategory.GROWTH);
              setSelectedSubCategoryId('');
            }}
          >
            <span className="text-2xl mb-1">🎓</span>
            <span className="text-xs">成長スキル</span>
          </button>
          
          <button
            type="button"
            className={`p-3 flex flex-col items-center justify-center border-2 rounded ${
              selectedMainCategory === MainCategory.ENTERTAINMENT
                ? 'bg-primary text-white border-primary'
                : 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600'
            }`}
            onClick={() => {
              setSelectedMainCategory(MainCategory.ENTERTAINMENT);
              setSelectedSubCategoryId('');
            }}
          >
            <span className="text-2xl mb-1">🎉</span>
            <span className="text-xs">娯楽スキル</span>
          </button>
          
          <button
            type="button"
            className={`p-3 flex flex-col items-center justify-center border-2 rounded ${
              selectedMainCategory === MainCategory.LIFE
                ? 'bg-primary text-white border-primary'
                : 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600'
            }`}
            onClick={() => {
              setSelectedMainCategory(MainCategory.LIFE);
              setSelectedSubCategoryId('');
            }}
          >
            <span className="text-2xl mb-1">🍔</span>
            <span className="text-xs">生活スキル</span>
          </button>
        </div>
      </div>
      
      {/* サブカテゴリー選択 */}
      {selectedMainCategory && (
        <div>
          <label className="block mb-2 font-medium">サブカテゴリー</label>
          <div className="grid grid-cols-2 gap-2">
            {getSubCategoriesByMainCategory(selectedMainCategory).map(subCat => (
              <button
                key={subCat.id}
                type="button"
                onClick={() => setSelectedSubCategoryId(subCat.id)}
                className={`p-3 rounded-lg border-2 ${
                  selectedSubCategoryId === subCat.id 
                    ? 'border-primary bg-primary/10' 
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                <div className="text-2xl">{subCat.icon}</div>
                <div className="text-sm">{subCat.name}</div>
                <div className="text-xs text-yellow-400">x{subCat.multiplier} EXP</div>
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* メモ入力 */}
      <div>
        <label htmlFor="memo" className="block mb-2 font-medium">
          メモ (任意)
        </label>
        <input
          type="text"
          id="memo"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder="ランチ、書籍など"
          className="w-full p-2 border-2 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
        />
      </div>
      
      {/* エラーメッセージ */}
      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}
      
      {/* ボタン */}
      <div className="flex justify-between pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded"
        >
          キャンセル
        </button>
        <button
          type="submit"
          className="rpg-button"
        >
          {initialExpense ? '更新する' : '記録する' }
        </button>
      </div>
    </form>
  );
};

export default ExpenseForm;
