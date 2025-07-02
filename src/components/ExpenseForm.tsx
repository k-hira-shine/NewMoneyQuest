import React, { useState } from 'react';
import { SkillCategory } from '../types';

interface ExpenseFormProps {
  onSubmit: (amount: number, category: SkillCategory, memo: string) => void;
  onCancel: () => void;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ onSubmit, onCancel }) => {
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<SkillCategory>(SkillCategory.LIFE);
  const [memo, setMemo] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 入力検証
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError('有効な金額を入力してください');
      return;
    }
    
    // 送信
    onSubmit(Number(amount), category, memo);
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
      
      {/* カテゴリー選択 */}
      <div>
        <label className="block mb-2 font-medium">カテゴリー</label>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            className={`p-3 flex flex-col items-center justify-center border-2 rounded ${
              category === SkillCategory.GROWTH
                ? 'bg-primary text-white border-primary'
                : 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600'
            }`}
            onClick={() => setCategory(SkillCategory.GROWTH)}
          >
            <span className="text-2xl mb-1">🎓</span>
            <span className="text-xs">成長スキル</span>
            <span className="text-xs text-yellow-400">x3 EXP</span>
          </button>
          
          <button
            type="button"
            className={`p-3 flex flex-col items-center justify-center border-2 rounded ${
              category === SkillCategory.ENTERTAINMENT
                ? 'bg-primary text-white border-primary'
                : 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600'
            }`}
            onClick={() => setCategory(SkillCategory.ENTERTAINMENT)}
          >
            <span className="text-2xl mb-1">🎉</span>
            <span className="text-xs">娯楽スキル</span>
            <span className="text-xs text-yellow-400">x1.5 EXP</span>
          </button>
          
          <button
            type="button"
            className={`p-3 flex flex-col items-center justify-center border-2 rounded ${
              category === SkillCategory.LIFE
                ? 'bg-primary text-white border-primary'
                : 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600'
            }`}
            onClick={() => setCategory(SkillCategory.LIFE)}
          >
            <span className="text-2xl mb-1">🍔</span>
            <span className="text-xs">生活スキル</span>
            <span className="text-xs text-yellow-400">x1 EXP</span>
          </button>
        </div>
      </div>
      
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
          記録する
        </button>
      </div>
    </form>
  );
};

export default ExpenseForm;
