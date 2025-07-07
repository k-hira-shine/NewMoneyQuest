import { GoogleGenerativeAI } from '@google/generative-ai';
import { Expense, MainCategory, Job, JobScore, JOBS, getSubCategoryById } from '../types';

interface ExpenseAnalysis {
  totalAmount: number;
  categoryBreakdown: {
    [key in MainCategory]: {
      amount: number;
      percentage: number;
      count: number;
    };
  };
  topSubCategories: Array<{
    subCategoryId: string;
    name: string;
    amount: number;
    percentage: number;
  }>;
  patterns: string[];
}

export class GeminiService {
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;

  constructor(apiKey?: string) {
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
    }
  }

  // API キーを設定
  setApiKey(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
  }

  // 支出データの分析
  private analyzeExpenses(expenses: Expense[]): ExpenseAnalysis {
    const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    // カテゴリー別の集計
    const categoryBreakdown = {
      [MainCategory.GROWTH]: { amount: 0, percentage: 0, count: 0 },
      [MainCategory.ENTERTAINMENT]: { amount: 0, percentage: 0, count: 0 },
      [MainCategory.LIFE]: { amount: 0, percentage: 0, count: 0 }
    };

    // サブカテゴリー別の集計
    const subCategoryMap = new Map<string, { amount: number; count: number }>();

    expenses.forEach(expense => {
      categoryBreakdown[expense.category].amount += expense.amount;
      categoryBreakdown[expense.category].count += 1;

      const existing = subCategoryMap.get(expense.subCategoryId) || { amount: 0, count: 0 };
      subCategoryMap.set(expense.subCategoryId, {
        amount: existing.amount + expense.amount,
        count: existing.count + 1
      });
    });

    // パーセンテージを計算
    Object.keys(categoryBreakdown).forEach(key => {
      const category = key as MainCategory;
      categoryBreakdown[category].percentage = totalAmount > 0 
        ? (categoryBreakdown[category].amount / totalAmount) * 100 
        : 0;
    });

    // トップサブカテゴリーを取得
    const topSubCategories = Array.from(subCategoryMap.entries())
      .map(([subCategoryId, data]) => {
        const subCategory = getSubCategoryById(subCategoryId);
        return {
          subCategoryId,
          name: subCategory?.name || 'Unknown',
          amount: data.amount,
          percentage: totalAmount > 0 ? (data.amount / totalAmount) * 100 : 0
        };
      })
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    // 支出パターンの分析
    const patterns = this.identifyPatterns(expenses, categoryBreakdown);

    return {
      totalAmount,
      categoryBreakdown,
      topSubCategories,
      patterns
    };
  }

  // 支出パターンの特定
  private identifyPatterns(expenses: Expense[], categoryBreakdown: ExpenseAnalysis['categoryBreakdown']): string[] {
    const patterns: string[] = [];
    
    // 高額支出の分析
    const highAmountExpenses = expenses.filter(e => e.amount > 10000);
    if (highAmountExpenses.length > 0) {
      patterns.push(`高額支出（1万円以上）が${highAmountExpenses.length}件あります`);
    }

    // カテゴリー偏向の分析
    const maxCategory = Object.entries(categoryBreakdown)
      .reduce((max, [category, data]) => 
        data.percentage > max.percentage ? { category, percentage: data.percentage } : max,
        { category: '', percentage: 0 }
      );

    if (maxCategory.percentage > 50) {
      patterns.push(`${maxCategory.category}への支出が全体の${maxCategory.percentage.toFixed(1)}%を占めています`);
    }

    // 支出頻度の分析
    const dailyExpenses = expenses.length;
    const days = Math.max(1, Math.ceil((Date.now() - new Date(expenses[expenses.length - 1]?.date).getTime()) / (1000 * 60 * 60 * 24)));
    const avgExpensesPerDay = dailyExpenses / days;
    
    if (avgExpensesPerDay > 5) {
      patterns.push(`1日平均${avgExpensesPerDay.toFixed(1)}件の支出があります`);
    }

    return patterns;
  }

  // ルールベースの職業判定
  private calculateJobScoresByRules(analysis: ExpenseAnalysis): JobScore[] {
    const jobScores: JobScore[] = [];

    JOBS.forEach(job => {
      let score = 0;
      let confidence = 0;
      const reasons: string[] = [];

      // 要件チェック
      job.requirements.forEach(req => {
        const categoryData = analysis.categoryBreakdown[req.category];
        if (categoryData.percentage >= req.minPercentage) {
          score += categoryData.percentage;
          confidence += 20;
          reasons.push(`${req.category}への支出が${categoryData.percentage.toFixed(1)}%`);
        }
      });

      // 基本スコア（要件が空の場合）
      if (job.requirements.length === 0) {
        score = 30; // 市民の基本スコア
        confidence = 50;
        reasons.push('バランスの取れた支出パターン');
      }

      // スコアの調整
      if (score > 0) {
        // 支出パターンとの一致度
        const patternBonus = analysis.patterns.length * 5;
        score += patternBonus;
        confidence = Math.min(100, confidence + patternBonus);
      }

      jobScores.push({
        job,
        score,
        confidence,
        reasons
      });
    });

    return jobScores.sort((a, b) => b.score - a.score);
  }

  // Gemini APIを使用した職業判定（オプション）
  async analyzeJobWithAI(expenses: Expense[]): Promise<JobScore[]> {
    if (!this.model) {
      // APIキーが設定されていない場合は、ルールベースの判定を使用
      return this.calculateJobScoresByRules(this.analyzeExpenses(expenses));
    }

    try {
      const analysis = this.analyzeExpenses(expenses);
      
      const prompt = `
以下の支出データを分析して、この人に最も適した職業を判定してください。

支出データ分析結果:
- 総支出額: ${analysis.totalAmount.toLocaleString()}円
- 成長スキル: ${analysis.categoryBreakdown[MainCategory.GROWTH].percentage.toFixed(1)}% (${analysis.categoryBreakdown[MainCategory.GROWTH].amount.toLocaleString()}円)
- 娯楽スキル: ${analysis.categoryBreakdown[MainCategory.ENTERTAINMENT].percentage.toFixed(1)}% (${analysis.categoryBreakdown[MainCategory.ENTERTAINMENT].amount.toLocaleString()}円)
- 生活スキル: ${analysis.categoryBreakdown[MainCategory.LIFE].percentage.toFixed(1)}% (${analysis.categoryBreakdown[MainCategory.LIFE].amount.toLocaleString()}円)

トップサブカテゴリー:
${analysis.topSubCategories.map(sub => `- ${sub.name}: ${sub.percentage.toFixed(1)}% (${sub.amount.toLocaleString()}円)`).join('\n')}

支出パターン:
${analysis.patterns.map(pattern => `- ${pattern}`).join('\n')}

利用可能な職業:
${JOBS.map(job => `- ${job.name} (${job.id}): ${job.description}`).join('\n')}

この分析結果に基づいて、最も適した職業を3つ選んで、それぞれの適性度（0-100）と理由を教えてください。
回答は以下のJSON形式でお願いします:

{
  "jobs": [
    {
      "jobId": "職業ID",
      "score": 85,
      "confidence": 90,
      "reasons": ["理由1", "理由2"]
    }
  ]
}
`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      try {
        const aiAnalysis = JSON.parse(text.replace(/```json|```/g, '').trim());
        
        const jobScores: JobScore[] = aiAnalysis.jobs.map((aiJob: any) => {
          const job = JOBS.find(j => j.id === aiJob.jobId);
          if (!job) return null;
          
          return {
            job,
            score: aiJob.score,
            confidence: aiJob.confidence,
            reasons: aiJob.reasons
          };
        }).filter(Boolean);

        return jobScores.length > 0 ? jobScores : this.calculateJobScoresByRules(analysis);
      } catch (parseError) {
        console.warn('AI分析の解析に失敗しました。ルールベース判定を使用します。', parseError);
        return this.calculateJobScoresByRules(analysis);
      }
    } catch (error) {
      console.warn('Gemini API呼び出しに失敗しました。ルールベース判定を使用します。', error);
      return this.calculateJobScoresByRules(this.analyzeExpenses(expenses));
    }
  }

  // 職業の推奨を取得
  async getJobRecommendation(expenses: Expense[]): Promise<{
    recommendedJob: Job;
    confidence: number;
    reasons: string[];
    alternatives: JobScore[];
  }> {
    const jobScores = await this.analyzeJobWithAI(expenses);
    
    if (jobScores.length === 0) {
      // デフォルトは市民
      const citizenJob = JOBS.find(job => job.id === 'citizen')!;
      return {
        recommendedJob: citizenJob,
        confidence: 50,
        reasons: ['支出データが不足しています'],
        alternatives: []
      };
    }

    const best = jobScores[0];
    const alternatives = jobScores.slice(1, 4);

    return {
      recommendedJob: best.job,
      confidence: best.confidence,
      reasons: best.reasons,
      alternatives
    };
  }
}

// デフォルトインスタンスをエクスポート
export const geminiService = new GeminiService();