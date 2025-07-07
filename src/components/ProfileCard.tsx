import React from 'react';
import { UserProfile } from '../types';
import { calculateExpProgress, calculateExpForLevel } from '../utils/gameLogic';
import { generateAvatarConfig } from '../utils/avatarLogic';
import PixelAvatar from './PixelAvatar';

interface ProfileCardProps {
  userProfile: UserProfile;
  levelUpAnimation: boolean;
  onNameEdit?: () => void;
  onJobClick?: () => void;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ userProfile, levelUpAnimation, onNameEdit, onJobClick }) => {
  const { level, totalExp, skills } = userProfile;
  
  // 経験値バーの進捗率を計算
  const expProgress = calculateExpProgress(totalExp);
  const nextLevelExp = calculateExpForLevel(level + 1);
  
  // アバター設定を生成
  const avatarConfig = userProfile.avatar || generateAvatarConfig(userProfile.job, level);
  
  return (
    <div className={`rpg-card ${levelUpAnimation ? 'level-up-animation' : ''}`}>
      <div className="flex items-center mb-4">
        <div className="w-16 h-16 flex items-center justify-center mr-4 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          <PixelAvatar 
            config={avatarConfig}
            size={56}
            animated={true}
            showLevelUp={levelUpAnimation}
          />
        </div>
        <div className="flex-1">
          <div className="flex items-center">
            <h2 className="text-xl font-rpg mr-2">{userProfile.name}</h2>
            {onNameEdit && (
              <button
                onClick={onNameEdit}
                className="text-sm text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                title="名前を編集"
              >
                ✏️
              </button>
            )}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="font-rpg text-primary mr-2">Lv. {level}</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                ({Math.floor(totalExp)} / {nextLevelExp} EXP)
              </span>
            </div>
            {userProfile.job && (
              <button
                onClick={onJobClick}
                className="flex items-center gap-1 px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded-full 
                         hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                title="職業を変更"
              >
                <span className="text-sm">{userProfile.job.icon}</span>
                <span className={`text-xs font-rpg ${userProfile.job.color}`}>
                  {userProfile.job.name}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* 経験値バー */}
      <div className="exp-bar mb-6">
        <div 
          className="exp-progress" 
          style={{ width: `${expProgress * 100}%` }}
        ></div>
      </div>
      
      {/* 職業情報 */}
      {!userProfile.job && (
        <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-lg mr-2">💼</span>
              <span className="text-sm text-yellow-700 dark:text-yellow-300">
                職業未設定
              </span>
            </div>
            <button
              onClick={onJobClick}
              className="text-sm text-yellow-600 dark:text-yellow-400 underline hover:no-underline"
            >
              職業を診断
            </button>
          </div>
        </div>
      )}

      {/* スキル一覧 */}
      <div className="grid grid-cols-1 gap-3">
        {Object.entries(skills).map(([category, skill]) => {
          // 職業ボーナスの計算
          const hasJobBonus = userProfile.job?.bonusCategories.includes(category as any);
          const bonusMultiplier = hasJobBonus ? userProfile.job?.bonusMultiplier || 1 : 1;
          const totalMultiplier = skill.multiplier * bonusMultiplier;
          
          return (
            <div key={category} className="flex justify-between items-center p-2 bg-gray-100 dark:bg-gray-700 rounded">
              <div className="flex items-center">
                {category === '成長スキル' && <span className="mr-2 text-lg">🎓</span>}
                {category === '娯楽スキル' && <span className="mr-2 text-lg">🎉</span>}
                {category === '生活スキル' && <span className="mr-2 text-lg">🍔</span>}
                <span>{category}</span>
                {hasJobBonus && (
                  <span className="ml-2 text-xs px-1 py-0.5 bg-primary text-white rounded">
                    職業ボーナス
                  </span>
                )}
              </div>
              <div className="flex items-center">
                <span className="font-rpg text-sm mr-2">Lv.{skill.level}</span>
                <span className={`text-xs ${hasJobBonus ? 'text-primary font-bold' : 'text-gray-600 dark:text-gray-400'}`}>
                  (x{totalMultiplier.toFixed(1)})
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProfileCard;
