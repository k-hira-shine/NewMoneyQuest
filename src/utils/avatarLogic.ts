import { AvatarConfig, LevelTier, Job } from '../types';

// レベルから段階を取得
export const getLevelTier = (level: number): LevelTier => {
  if (level <= 5) return LevelTier.BEGINNER;
  if (level <= 15) return LevelTier.INTERMEDIATE;
  if (level <= 25) return LevelTier.ADVANCED;
  return LevelTier.MASTER;
};

// 職業に基づくデフォルトアバター設定
export const getJobAvatarConfig = (job?: Job): Partial<AvatarConfig> => {
  if (!job) {
    return {
      baseColor: '#6B7280', // グレー
      hairColor: '#8B4513',  // ブラウン
      eyeColor: '#000000',   // ブラック
      skinTone: '#FDBCB4'    // ピーチ
    };
  }

  switch (job.id) {
    case 'scholar':
      return {
        baseColor: '#3B82F6', // ブルー
        accessory: 'glasses',
        weapon: 'book',
        aura: 'wisdom'
      };
    
    case 'engineer':
      return {
        baseColor: '#10B981', // グリーン
        accessory: 'goggles',
        weapon: 'wrench',
        aura: 'tech'
      };
    
    case 'artist':
      return {
        baseColor: '#8B5CF6', // パープル
        accessory: 'beret',
        weapon: 'brush',
        aura: 'creative'
      };
    
    case 'adventurer':
      return {
        baseColor: '#F59E0B', // オレンジ
        accessory: 'bandana',
        weapon: 'sword',
        aura: 'adventure'
      };
    
    case 'merchant':
      return {
        baseColor: '#EAB308', // ゴールド
        accessory: 'hat',
        weapon: 'coin',
        aura: 'wealth'
      };
    
    case 'chef':
      return {
        baseColor: '#EF4444', // レッド
        accessory: 'chef_hat',
        weapon: 'knife',
        aura: 'flame'
      };
    
    case 'sage':
      return {
        baseColor: '#1E40AF', // ディープブルー
        accessory: 'wizard_hat',
        weapon: 'staff',
        aura: 'mystic'
      };
    
    case 'master_artisan':
      return {
        baseColor: '#059669', // ディープグリーン
        accessory: 'crown',
        weapon: 'hammer',
        aura: 'mastery'
      };
    
    case 'virtuoso':
      return {
        baseColor: '#7C3AED', // ディープパープル
        accessory: 'mask',
        weapon: 'lyre',
        aura: 'artistic'
      };
    
    default:
      return {
        baseColor: '#6B7280',
        hairColor: '#8B4513',
        eyeColor: '#000000',
        skinTone: '#FDBCB4'
      };
  }
};

// レベル段階に基づくオーラエフェクト
export const getLevelAura = (level: number): string => {
  const tier = getLevelTier(level);
  switch (tier) {
    case LevelTier.BEGINNER:
      return 'none';
    case LevelTier.INTERMEDIATE:
      return 'glow';
    case LevelTier.ADVANCED:
      return 'sparkle';
    case LevelTier.MASTER:
      return 'radiance';
    default:
      return 'none';
  }
};

// 完全なアバター設定を生成
export const generateAvatarConfig = (job?: Job, level: number = 1): AvatarConfig => {
  const jobConfig = getJobAvatarConfig(job);
  const levelAura = getLevelAura(level);
  
  return {
    baseColor: jobConfig.baseColor || '#6B7280',
    hairColor: jobConfig.hairColor || '#8B4513',
    eyeColor: jobConfig.eyeColor || '#000000',
    skinTone: jobConfig.skinTone || '#FDBCB4',
    accessory: jobConfig.accessory,
    weapon: jobConfig.weapon,
    aura: levelAura !== 'none' ? levelAura : jobConfig.aura
  };
};

// レベルアップ時のアバター更新
export const updateAvatarForLevelUp = (
  currentAvatar: AvatarConfig, 
  newLevel: number,
  job?: Job
): AvatarConfig => {
  const newAura = getLevelAura(newLevel);
  const jobConfig = getJobAvatarConfig(job);
  
  return {
    ...currentAvatar,
    aura: newAura !== 'none' ? newAura : (jobConfig.aura || currentAvatar.aura)
  };
};

// 職業変更時のアバター更新
export const updateAvatarForJobChange = (
  currentAvatar: AvatarConfig,
  newJob: Job,
  level: number
): AvatarConfig => {
  const jobConfig = getJobAvatarConfig(newJob);
  const levelAura = getLevelAura(level);
  
  return {
    ...currentAvatar,
    baseColor: jobConfig.baseColor || currentAvatar.baseColor,
    accessory: jobConfig.accessory,
    weapon: jobConfig.weapon,
    aura: levelAura !== 'none' ? levelAura : jobConfig.aura
  };
};