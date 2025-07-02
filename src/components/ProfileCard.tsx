import React from 'react';
import { UserProfile } from '../types';
import { calculateExpProgress, calculateExpForLevel } from '../utils/gameLogic';

interface ProfileCardProps {
  userProfile: UserProfile;
  levelUpAnimation: boolean;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ userProfile, levelUpAnimation }) => {
  const { level, totalExp, skills } = userProfile;
  
  // 経験値バーの進捗率を計算
  const expProgress = calculateExpProgress(totalExp);
  const nextLevelExp = calculateExpForLevel(level + 1);
  
  return (
    <div className={`rpg-card ${levelUpAnimation ? 'level-up-animation' : ''}`}>
      <div className="flex items-center mb-4">
        <div className="w-16 h-16 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center mr-4">
          {/* 将来的にはアバター画像を表示 */}
          <span className="text-2xl">👤</span>
        </div>
        <div>
          <h2 className="text-xl font-rpg">{userProfile.name}</h2>
          <div className="flex items-center">
            <span className="font-rpg text-primary mr-2">Lv. {level}</span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              ({Math.floor(totalExp)} / {nextLevelExp} EXP)
            </span>
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
      
      {/* スキル一覧 */}
      <div className="grid grid-cols-1 gap-3">
        {Object.entries(skills).map(([category, skill]) => (
          <div key={category} className="flex justify-between items-center p-2 bg-gray-100 dark:bg-gray-700 rounded">
            <div className="flex items-center">
              {category === '成長スキル' && <span className="mr-2 text-lg">🎓</span>}
              {category === '娯楽スキル' && <span className="mr-2 text-lg">🎉</span>}
              {category === '生活スキル' && <span className="mr-2 text-lg">🍔</span>}
              <span>{category}</span>
            </div>
            <div className="flex items-center">
              <span className="font-rpg text-sm mr-2">Lv.{skill.level}</span>
              <span className="text-xs text-gray-600 dark:text-gray-400">
                (x{skill.multiplier})
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfileCard;
