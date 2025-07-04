import React from 'react';
import { Expense, MainCategory, getSubCategoryById } from '../types';

interface ExpenseListProps {
  expenses: Expense[];
  onEdit?: (expense: Expense) => void;
  onDelete?: (expense: Expense) => void;
}

const ExpenseList: React.FC<ExpenseListProps> = ({ expenses, onEdit, onDelete }) => {
  // カテゴリーに応じたアイコンを取得する関数
  const getCategoryIcon = (category: MainCategory): string => {
    switch (category) {
      case MainCategory.GROWTH:
        return '🎓';
      case MainCategory.ENTERTAINMENT:
        return '🎉';
      case MainCategory.LIFE:
        return '🍔';
      default:
        return '💰';
    }
  };

  // 日付をフォーマットする関数
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="rpg-card">
      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
        {expenses.map((expense) => (
          <li key={expense.id} className="py-3">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center">
                  <span className="mr-2 text-lg">{getCategoryIcon(expense.category)}</span>
                  <span className="font-medium">{expense.memo || '支出'}</span>
                </div>
                <div className="flex items-center mt-1">
                  {expense.subCategoryId && (
                    <span className="text-xs bg-gray-100 dark:bg-gray-700 rounded-full px-2 py-0.5 mr-2">
                      {getSubCategoryById(expense.subCategoryId)?.icon} {getSubCategoryById(expense.subCategoryId)?.name}
                    </span>
                  )}
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {formatTime(new Date(expense.date))}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end space-y-1">
                <p className="font-medium">¥{expense.amount.toLocaleString()}</p>
                <p className="text-sm text-secondary">+{expense.expGained} EXP</p>
                {onEdit && (
                  <button
                    type="button"
                    onClick={() => onEdit(expense)}
                    className="text-xs text-blue-500 hover:underline cursor-pointer"
                  >編集</button>
                )}
                {onDelete && (
                  <button
                    type="button"
                    onClick={() => onDelete(expense)}
                    className="text-xs text-red-500 hover:underline cursor-pointer"
                  >削除</button>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ExpenseList;
