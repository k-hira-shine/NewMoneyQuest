import { useState, useEffect } from 'react';
import { Job, JobScore, Expense } from '../types';
import { geminiService } from '../services/geminiService';
import JobCard from './JobCard';

interface JobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJobSelect: (job: Job) => void;
  currentJob?: Job;
  expenses: Expense[];
  userProfile: any; // UserProfile型を後で更新
}

export default function JobModal({ isOpen, onClose, onJobSelect, currentJob, expenses, userProfile }: JobModalProps) {
  const [jobRecommendations, setJobRecommendations] = useState<{
    recommendedJob: Job;
    confidence: number;
    reasons: string[];
    alternatives: JobScore[];
    lockedAlternatives: Array<Job & { missingConditions: string[] }>;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);

  useEffect(() => {
    if (isOpen && expenses.length > 0) {
      analyzeJobs();
    }
  }, [isOpen, expenses]);

  const analyzeJobs = async () => {
    setLoading(true);
    try {
      const result = await geminiService.getJobRecommendation(expenses, userProfile);
      setJobRecommendations(result);
    } catch (error) {
      console.error('職業分析エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApiKeySubmit = () => {
    if (apiKey.trim()) {
      geminiService.setApiKey(apiKey.trim());
      setShowApiKeyInput(false);
      analyzeJobs();
    }
  };

  const handleJobSelect = (job: Job) => {
    onJobSelect(job);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-rpg text-primary">職業判定</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ✕
            </button>
          </div>

          {!showApiKeyInput && (
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                💡 Gemini API キーを設定すると、より精密な職業判定が可能になります
              </p>
              <button
                onClick={() => setShowApiKeyInput(true)}
                className="mt-2 text-sm text-blue-600 dark:text-blue-400 underline hover:no-underline"
              >
                API キーを設定
              </button>
            </div>
          )}

          {showApiKeyInput && (
            <div className="mb-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <h3 className="font-semibold mb-2">Gemini API キーを設定</h3>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="API キーを入力してください"
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
                <button
                  onClick={handleApiKeySubmit}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  設定
                </button>
                <button
                  onClick={() => setShowApiKeyInput(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  キャンセル
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                API キーは一時的に保存され、ページを閉じると削除されます
              </p>
            </div>
          )}

          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
              <p className="text-gray-600 dark:text-gray-400">支出データを分析中...</p>
            </div>
          )}

          {jobRecommendations && !loading && (
            <div className="space-y-4">
              <div>
                <h3 className="font-rpg text-lg mb-2">おすすめの職業</h3>
                <JobCard
                  job={jobRecommendations.recommendedJob}
                  confidence={jobRecommendations.confidence}
                  reasons={jobRecommendations.reasons}
                  onJobSelect={handleJobSelect}
                  isCurrentJob={currentJob?.id === jobRecommendations.recommendedJob.id}
                />
              </div>

              {jobRecommendations.alternatives.length > 0 && (
                <div>
                  <h3 className="font-rpg text-lg mb-2">その他の候補</h3>
                  <div className="space-y-2">
                    {jobRecommendations.alternatives.map((jobScore, index) => (
                      <JobCard
                        key={index}
                        job={jobScore.job}
                        confidence={jobScore.confidence}
                        reasons={jobScore.reasons}
                        onJobSelect={handleJobSelect}
                        isCurrentJob={currentJob?.id === jobScore.job.id}
                      />
                    ))}
                  </div>
                </div>
              )}

              {jobRecommendations.lockedAlternatives.length > 0 && (
                <div>
                  <h3 className="font-rpg text-lg mb-2">未解放の職業</h3>
                  <div className="space-y-2">
                    {jobRecommendations.lockedAlternatives.map((lockedJob, index) => (
                      <JobCard
                        key={index}
                        job={lockedJob}
                        isLocked={true}
                        missingConditions={lockedJob.missingConditions}
                        onJobSelect={handleJobSelect}
                        isCurrentJob={false}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {expenses.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400">
                支出データがありません。まずは支出を記録してみましょう！
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}