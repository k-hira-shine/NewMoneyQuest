import { Job } from '../types';

interface JobCardProps {
  job: Job;
  isCurrentJob?: boolean;
  confidence?: number;
  reasons?: string[];
  onJobSelect?: (job: Job) => void;
}

export default function JobCard({ job, isCurrentJob, confidence, reasons, onJobSelect }: JobCardProps) {
  return (
    <div 
      className={`rpg-card p-4 cursor-pointer transition-all duration-200 ${
        isCurrentJob 
          ? 'ring-2 ring-primary bg-primary/10' 
          : 'hover:bg-gray-50 dark:hover:bg-gray-800'
      }`}
      onClick={() => onJobSelect?.(job)}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{job.icon}</span>
          <div>
            <h3 className={`font-rpg text-lg ${job.color}`}>{job.name}</h3>
            {confidence && (
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
        {isCurrentJob && (
          <span className="text-xs px-2 py-1 bg-primary text-white rounded-full">
            現在の職業
          </span>
        )}
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
      
      {reasons && reasons.length > 0 && (
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