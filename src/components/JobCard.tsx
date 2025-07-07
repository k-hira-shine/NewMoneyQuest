import { Job } from '../types';
import { getJobRankLabel, getJobRankColor } from '../utils/jobLogic';

interface JobCardProps {
  job: Job;
  isCurrentJob?: boolean;
  confidence?: number;
  reasons?: string[];
  onJobSelect?: (job: Job) => void;
  isLocked?: boolean;
  missingConditions?: string[];
}

export default function JobCard({ job, isCurrentJob, confidence, reasons, onJobSelect, isLocked, missingConditions }: JobCardProps) {
  return (
    <div 
      className={`rpg-card p-4 transition-all duration-200 ${
        isLocked 
          ? 'opacity-60 cursor-not-allowed bg-gray-100 dark:bg-gray-800' 
          : isCurrentJob 
            ? 'ring-2 ring-primary bg-primary/10 cursor-pointer' 
            : 'hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer'
      }`}
      onClick={() => !isLocked && onJobSelect?.(job)}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="relative">
            <span className={`text-2xl ${isLocked ? 'grayscale' : ''}`}>{job.icon}</span>
            {isLocked && (
              <span className="absolute -top-1 -right-1 text-xs">🔒</span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className={`font-rpg text-lg ${job.color}`}>{job.name}</h3>
              <span className={`text-xs px-2 py-1 rounded-full ${getJobRankColor(job.rank)}`}>
                {getJobRankLabel(job.rank)}
              </span>
            </div>
            {confidence && !isLocked && (
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  適性度: {confidence}%
                </span>
                <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-400 to-purple-500 transition-all duration-300"
                    style={{ width: `${confidence}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          {isCurrentJob && (
            <span className="text-xs px-2 py-1 bg-primary text-white rounded-full">
              現在の職業
            </span>
          )}
          {isLocked && (
            <span className="text-xs px-2 py-1 bg-red-100 text-red-600 rounded-full">
              未解放
            </span>
          )}
        </div>
      </div>
      
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
        {job.description}
      </p>
      
      {job.bonusCategories.length > 0 && (
        <div className="mb-3">
          <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">
            ボーナス: {job.bonusCategories.join(', ')} (+{Math.round((job.bonusMultiplier - 1) * 100)}%)
          </p>
        </div>
      )}

      {job.specialEffects && job.specialEffects.length > 0 && (
        <div className="mb-3">
          <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">特殊効果:</p>
          <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
            {job.specialEffects.map((effect, index) => (
              <li key={index} className="flex items-start">
                <span className="text-yellow-500 mr-1">✨</span>
                <span>{effect}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {isLocked && missingConditions && missingConditions.length > 0 && (
        <div className="mb-3">
          <p className="text-xs text-red-500 dark:text-red-400 mb-1">解放条件:</p>
          <ul className="text-xs text-red-600 dark:text-red-400 space-y-1">
            {missingConditions.map((condition, index) => (
              <li key={index} className="flex items-start">
                <span className="text-red-500 mr-1">•</span>
                <span>{condition}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {reasons && reasons.length > 0 && !isLocked && (
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">判定理由:</p>
          <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
            {reasons.map((reason, index) => (
              <li key={index} className="flex items-start">
                <span className="text-primary mr-1">•</span>
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}