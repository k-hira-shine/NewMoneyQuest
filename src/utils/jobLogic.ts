import { UserProfile, Expense, Job, JOBS, JobRank } from '../types';
import { updateAvatarForJobChange, generateAvatarConfig } from './avatarLogic';

// 職業の解放条件をチェック
export const checkJobUnlockConditions = (
  job: Job, 
  userProfile: UserProfile, 
  expenses: Expense[]
): { unlocked: boolean; missingConditions: string[] } => {
  const missingConditions: string[] = [];
  
  for (const condition of job.unlockConditions) {
    switch (condition.type) {
      case 'level':
        if (userProfile.level < condition.value) {
          missingConditions.push(`レベル${condition.value}が必要 (現在: Lv${userProfile.level})`);
        }
        break;
        
      case 'totalExp':
        if (userProfile.totalExp < condition.value) {
          missingConditions.push(`総EXP ${condition.value.toLocaleString()}が必要 (現在: ${Math.floor(userProfile.totalExp).toLocaleString()})`);
        }
        break;
        
      case 'categoryExp':
        if (condition.category) {
          const categoryExp = userProfile.skills[condition.category].exp;
          if (categoryExp < condition.value) {
            missingConditions.push(`${condition.category}のEXP ${condition.value.toLocaleString()}が必要 (現在: ${Math.floor(categoryExp).toLocaleString()})`);
          }
        }
        break;
        
      case 'amount':
        const totalSpent = userProfile.totalSpent || expenses.reduce((sum, exp) => sum + exp.amount, 0);
        if (totalSpent < condition.value) {
          missingConditions.push(`総支出額 ${condition.value.toLocaleString()}円が必要 (現在: ${totalSpent.toLocaleString()}円)`);
        }
        break;
        
      case 'days':
        if (userProfile.startDate) {
          const daysPassed = Math.floor((Date.now() - userProfile.startDate.getTime()) / (1000 * 60 * 60 * 24));
          if (daysPassed < condition.value) {
            missingConditions.push(`プレイ開始から${condition.value}日が必要 (現在: ${daysPassed}日)`);
          }
        } else {
          missingConditions.push(`プレイ期間の記録が必要`);
        }
        break;
        
      case 'previousJob':
        if (condition.previousJobId) {
          const hasExperience = userProfile.jobHistory?.some(history => 
            history.jobId === condition.previousJobId
          );
          if (!hasExperience) {
            const previousJob = JOBS.find(j => j.id === condition.previousJobId);
            missingConditions.push(`${previousJob?.name || '特定の職業'}の経験が必要`);
          }
        }
        break;
    }
  }
  
  return {
    unlocked: missingConditions.length === 0,
    missingConditions
  };
};

// 利用可能な職業一覧を取得（解放条件を満たしているもの）
export const getAvailableJobs = (
  userProfile: UserProfile, 
  expenses: Expense[]
): { unlockedJobs: Job[]; lockedJobs: Array<Job & { missingConditions: string[] }> } => {
  const unlockedJobs: Job[] = [];
  const lockedJobs: Array<Job & { missingConditions: string[] }> = [];
  
  for (const job of JOBS) {
    const { unlocked, missingConditions } = checkJobUnlockConditions(job, userProfile, expenses);
    
    if (unlocked || job.unlockConditions.length === 0) {
      unlockedJobs.push(job);
    } else {
      lockedJobs.push({ ...job, missingConditions });
    }
  }
  
  // ランク順に並び替え（普通職 → 上級職 → マスター職）
  const rankOrder = [JobRank.NORMAL, JobRank.ADVANCED, JobRank.MASTER];
  
  unlockedJobs.sort((a, b) => {
    const aIndex = rankOrder.indexOf(a.rank);
    const bIndex = rankOrder.indexOf(b.rank);
    return aIndex - bIndex;
  });
  
  lockedJobs.sort((a, b) => {
    const aIndex = rankOrder.indexOf(a.rank);
    const bIndex = rankOrder.indexOf(b.rank);
    return aIndex - bIndex;
  });
  
  return { unlockedJobs, lockedJobs };
};

// 職業変更時の処理
export const changeJob = (
  userProfile: UserProfile, 
  newJob: Job
): UserProfile => {
  const updatedProfile = { ...userProfile };
  
  // 職業履歴の更新
  if (!updatedProfile.jobHistory) {
    updatedProfile.jobHistory = [];
  }
  
  // 現在の職業がある場合、履歴に追加
  if (updatedProfile.job) {
    const existingHistory = updatedProfile.jobHistory.find(h => 
      h.jobId === updatedProfile.job!.id && !h.endDate
    );
    
    if (existingHistory) {
      existingHistory.endDate = new Date();
    }
  }
  
  // 新しい職業を履歴に追加
  updatedProfile.jobHistory.push({
    jobId: newJob.id,
    startDate: new Date(),
    reason: '職業変更'
  });
  
  // 解放済み職業リストの更新
  if (!updatedProfile.unlockedJobs) {
    updatedProfile.unlockedJobs = [];
  }
  
  if (!updatedProfile.unlockedJobs.includes(newJob.id)) {
    updatedProfile.unlockedJobs.push(newJob.id);
  }
  
  // 職業の設定
  updatedProfile.job = newJob;
  
  // アバターの更新
  const currentAvatar = updatedProfile.avatar || generateAvatarConfig(undefined, updatedProfile.level);
  updatedProfile.avatar = updateAvatarForJobChange(currentAvatar, newJob, updatedProfile.level);
  
  return updatedProfile;
};

// プロファイル初期化時の処理
export const initializeProfile = (profile: UserProfile): UserProfile => {
  const updatedProfile = { ...profile };
  
  // 初期値の設定
  if (!updatedProfile.unlockedJobs) {
    updatedProfile.unlockedJobs = ['citizen']; // 市民は最初から解放
  }
  
  if (!updatedProfile.totalSpent) {
    updatedProfile.totalSpent = 0;
  }
  
  if (!updatedProfile.startDate) {
    updatedProfile.startDate = new Date();
  }
  
  if (!updatedProfile.jobHistory) {
    updatedProfile.jobHistory = [];
  }
  
  // アバターの初期化
  if (!updatedProfile.avatar) {
    updatedProfile.avatar = generateAvatarConfig(updatedProfile.job, updatedProfile.level);
  }
  
  return updatedProfile;
};

// 総支出額の更新
export const updateTotalSpent = (
  userProfile: UserProfile, 
  expenses: Expense[]
): UserProfile => {
  const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  return {
    ...userProfile,
    totalSpent
  };
};

// 職業ランクのラベルを取得
export const getJobRankLabel = (rank: JobRank): string => {
  switch (rank) {
    case JobRank.NORMAL:
      return '普通職';
    case JobRank.ADVANCED:
      return '上級職';
    case JobRank.MASTER:
      return 'マスター職';
    default:
      return '不明';
  }
};

// 職業ランクの色を取得
export const getJobRankColor = (rank: JobRank): string => {
  switch (rank) {
    case JobRank.NORMAL:
      return 'text-gray-600 bg-gray-100';
    case JobRank.ADVANCED:
      return 'text-blue-600 bg-blue-100';
    case JobRank.MASTER:
      return 'text-purple-600 bg-purple-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};