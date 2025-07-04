import React, { useState } from 'react';

interface NameEditModalProps {
  currentName: string;
  onSubmit: (newName: string) => void;
  onCancel: () => void;
}

const NameEditModal: React.FC<NameEditModalProps> = ({ currentName, onSubmit, onCancel }) => {
  const [name, setName] = useState<string>(currentName);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 名前の検証
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('名前を入力してください');
      return;
    }
    
    if (trimmedName.length > 20) {
      setError('名前は20文字以内で入力してください');
      return;
    }
    
    // 送信
    onSubmit(trimmedName);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="rpg-card w-full max-w-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <h2 className="text-xl font-rpg text-center mb-4">名前を変更</h2>
          
          {/* 名前入力 */}
          <div>
            <label htmlFor="name" className="block mb-2 font-medium">
              新しい名前
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="プレイヤー"
              className="w-full p-2 border-2 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
              autoFocus
              maxLength={20}
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
              変更する
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NameEditModal;