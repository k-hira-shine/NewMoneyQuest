import { useState, useEffect } from 'react'
import ExpenseForm from './components/ExpenseForm'
import ExpenseList from './components/ExpenseList'
import ProfileCard from './components/ProfileCard'
import NameEditModal from './components/NameEditModal'
import JobModal from './components/JobModal'
import { UserProfile, Expense, MainCategory, getSubCategoryById, Job } from './types'
import { calculateLevel, saveUserData, loadUserData, PENALTY_MULTIPLIER, applyExpDelta } from './utils/gameLogic'
import { changeJob, initializeProfile, updateTotalSpent } from './utils/jobLogic'
import { updateAvatarForLevelUp, generateAvatarConfig } from './utils/avatarLogic'

function App() {
  const [darkMode, setDarkMode] = useState(false)
  const [showExpenseForm, setShowExpenseForm] = useState(false)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [expGainMessage, setExpGainMessage] = useState<string | null>(null)
  const [levelUpAnimation, setLevelUpAnimation] = useState(false)
  const [showNameEditModal, setShowNameEditModal] = useState(false)
  const [showJobModal, setShowJobModal] = useState(false)

  // 初期データのロード
  useEffect(() => {
    const loadedData = loadUserData()
    if (loadedData) {
      // プロファイルの初期化（新フィールドの追加）
      const initializedProfile = initializeProfile(loadedData.profile)
      const updatedProfile = updateTotalSpent(initializedProfile, loadedData.expenses)
      setUserProfile(updatedProfile)
      setExpenses(loadedData.expenses)
      saveUserData(updatedProfile, loadedData.expenses)
    } else {
      // 初期ユーザープロファイルの作成
      const initialProfile: UserProfile = {
        name: 'プレイヤー',
        level: 1,
        totalExp: 0,
        skills: {
          [MainCategory.GROWTH]: { level: 1, exp: 0, multiplier: 3 },
          [MainCategory.ENTERTAINMENT]: { level: 1, exp: 0, multiplier: 1.5 },
          [MainCategory.LIFE]: { level: 1, exp: 0, multiplier: 1 }
        },
        avatar: generateAvatarConfig(undefined, 1)
      }
      const initializedProfile = initializeProfile(initialProfile)
      setUserProfile(initializedProfile)
      saveUserData(initializedProfile, [])
    }

    // ダークモード設定の読み込み
    const savedDarkMode = localStorage.getItem('darkMode') === 'true'
    setDarkMode(savedDarkMode)
    if (savedDarkMode) {
      document.documentElement.classList.add('dark')
    }
  }, [])

  // ダークモード切り替え
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('darkMode', darkMode.toString())
  }, [darkMode])

  // ===================== 支出の追加処理 =====================
  const handleAddExpense = (amount: number, category: MainCategory, subCategoryId: string, memo: string) => {
    if (!userProfile) return

    // EXP計算（職業ボーナスを含む）
    const baseExp = Math.floor(amount / 100)
    const categoryMultiplier = userProfile.skills[category].multiplier
    const subCategory = getSubCategoryById(subCategoryId)
    const subCategoryMultiplier = subCategory ? subCategory.multiplier : 1
    
    // 職業ボーナスの計算
    const jobBonus = userProfile.job?.bonusCategories.includes(category) 
      ? userProfile.job.bonusMultiplier 
      : 1
    
    // 特殊効果のチェック（例：書籍購入時のEXP+50%）
    let specialBonus = 1
    if (userProfile.job?.specialEffects) {
      const subCategory = getSubCategoryById(subCategoryId)
      if (subCategory?.name.includes('書籍') && 
          userProfile.job.specialEffects.some(effect => effect.includes('書籍購入時'))) {
        specialBonus = 1.5
      }
      if (subCategory?.name.includes('技術') && 
          userProfile.job.specialEffects.some(effect => effect.includes('技術系投資'))) {
        specialBonus = 1.3
      }
      if (subCategory?.name.includes('創作') && 
          userProfile.job.specialEffects.some(effect => effect.includes('創作活動'))) {
        specialBonus = 1.4
      }
    }
    
    const expGained = Math.floor(baseExp * categoryMultiplier * subCategoryMultiplier * jobBonus * specialBonus)

    // 新しい支出データ
    const newExpense: Expense = {
      id: Date.now().toString(),
      amount,
      category,
      subCategoryId,
      memo,
      date: new Date(),
      expGained
    }

    // プロファイル更新
    const updatedProfile = { ...userProfile }
    updatedProfile.totalExp += expGained
    updatedProfile.skills[category].exp += expGained

    // レベル計算
    const oldLevel = updatedProfile.level
    updatedProfile.level = calculateLevel(updatedProfile.totalExp)

    // スキルレベル計算
    Object.keys(updatedProfile.skills).forEach(skillKey => {
      const skill = updatedProfile.skills[skillKey as MainCategory]
      skill.level = calculateLevel(skill.exp)
    })

    // データ更新
    const updatedExpenses = [newExpense, ...expenses]
    setUserProfile(updatedProfile)
    setExpenses(updatedExpenses)
    saveUserData(updatedProfile, updatedExpenses)
    
    // EXP獲得メッセージ表示
    let message = `+${expGained} EXP!`
    const bonuses = []
    if (jobBonus > 1) bonuses.push(`職業ボーナス x${jobBonus}`)
    if (specialBonus > 1) bonuses.push(`特殊効果 x${specialBonus}`)
    if (bonuses.length > 0) {
      message += ` (${bonuses.join(', ')})`
    }
    setExpGainMessage(message)
    setTimeout(() => setExpGainMessage(null), 2000)

    // レベルアップ処理
    if (updatedProfile.level > oldLevel) {
      // アバターの更新
      const currentAvatar = updatedProfile.avatar || generateAvatarConfig(updatedProfile.job, oldLevel);
      updatedProfile.avatar = updateAvatarForLevelUp(currentAvatar, updatedProfile.level, updatedProfile.job);
      
      // レベルアップアニメーション
      setLevelUpAnimation(true)
      setTimeout(() => setLevelUpAnimation(false), 1500)
    }

    // フォームを閉じる
    setShowExpenseForm(false)
  }

  // ===================== 支出の更新処理 =====================
  const handleUpdateExpense = (amount: number, category: MainCategory, subCategoryId: string, memo: string) => {
    if (!userProfile || !editingExpense) return;

    const baseExpNew = Math.floor(amount / 100);
    const categoryMultiplierNew = userProfile.skills[category].multiplier;
    const subCategory = getSubCategoryById(subCategoryId);
    const subCategoryMultiplier = subCategory ? subCategory.multiplier : 1;
    const newExp = Math.floor(baseExpNew * categoryMultiplierNew * subCategoryMultiplier);

    // ペナルティ計算
    const penalty = Math.ceil(editingExpense.expGained * PENALTY_MULTIPLIER);
    const delta = -penalty + newExp;

    const updatedProfile = applyExpDelta(userProfile, editingExpense.category, -penalty);
    const finalProfile = applyExpDelta(updatedProfile, category, newExp);

    // expenses 更新
    const updatedExpenses = expenses.map((exp: Expense) =>
      exp.id === editingExpense.id
        ? { ...exp, amount, category, subCategoryId, memo, expGained: newExp }
        : exp
    );

    setUserProfile(finalProfile);
    setExpenses(updatedExpenses);
    saveUserData(finalProfile, updatedExpenses);

    setExpGainMessage(`${delta >=0 ? '+' : ''}${delta} EXP`);
    setTimeout(() => setExpGainMessage(null), 2000);

    setEditingExpense(null);
    setShowExpenseForm(false);
  }

  // ===================== 支出の削除処理 =====================
  const handleDeleteExpense = (expense: Expense) => {
    if (!userProfile) return;
  

    const penalty = Math.ceil(expense.expGained * PENALTY_MULTIPLIER);
    const delta = -penalty;

    const updatedProfile = applyExpDelta(userProfile, expense.category, delta);

    const updatedExpenses = expenses.filter(e => e.id !== expense.id);

    setUserProfile(updatedProfile);
    setExpenses(updatedExpenses);
    saveUserData(updatedProfile, updatedExpenses);

    setExpGainMessage(`${delta} EXP`);
    setTimeout(() => setExpGainMessage(null), 2000);
  }

  // ===================== 名前更新処理 =====================
  const handleUpdateName = (newName: string) => {
    if (!userProfile) return

    const updatedProfile = { ...userProfile, name: newName }
    setUserProfile(updatedProfile)
    saveUserData(updatedProfile, expenses)
    setShowNameEditModal(false)
  }

  // ===================== 職業更新処理 =====================
  const handleJobSelect = (job: Job) => {
    if (!userProfile) return

    const updatedProfile = changeJob(userProfile, job)
    setUserProfile(updatedProfile)
    saveUserData(updatedProfile, expenses)
    setShowJobModal(false)
  }

  // 今日の支出のみフィルタリング
  const todayExpenses = expenses.filter((expense: Expense) => {
    const today = new Date()
    const expenseDate = new Date(expense.date)
    return (
      expenseDate.getDate() === today.getDate() &&
      expenseDate.getMonth() === today.getMonth() &&
      expenseDate.getFullYear() === today.getFullYear()
    )
  })

  if (!userProfile) return <div className="w-full h-screen flex items-center justify-center">読み込み中...</div>

  return (
    <div className="min-h-screen w-full bg-light dark:bg-dark text-gray-800 dark:text-gray-200 p-4">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-rpg text-primary">Money Quest</h1>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-full bg-gray-200 dark:bg-gray-700"
        >
          {darkMode ? '🌞' : '🌙'}
        </button>
      </header>

      <main className="max-w-md mx-auto">
        <ProfileCard 
          userProfile={userProfile} 
          levelUpAnimation={levelUpAnimation}
          onNameEdit={() => setShowNameEditModal(true)}
          onJobClick={() => setShowJobModal(true)}
        />

        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-rpg">今日の支出</h2>
            <button 
              onClick={() => { setEditingExpense(null); setShowExpenseForm(true); }}
              className="rpg-button"
            >
              追加
            </button>
          </div>

          {todayExpenses.length > 0 ? (
            <ExpenseList 
              expenses={todayExpenses}
              onEdit={(exp) => { setEditingExpense(exp); setShowExpenseForm(true); }}
              onDelete={handleDeleteExpense}
            />
          ) : (
            <p className="text-center py-8 rpg-card">今日の支出はまだありません</p>
          )}
        </div>

        {showExpenseForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="rpg-card w-full max-w-md">
              <ExpenseForm 
                onSubmit={editingExpense ? handleUpdateExpense : handleAddExpense}
                onCancel={() => { setEditingExpense(null); setShowExpenseForm(false); }}
                initialExpense={editingExpense || undefined}
              />
            </div>
          </div>
        )}

        {expGainMessage && (
          <div className="fixed top-1/4 left-1/2 transform -translate-x-1/2 exp-gain-animation">
            <p className="font-rpg text-xl text-secondary">{expGainMessage}</p>
          </div>
        )}

        {showNameEditModal && (
          <NameEditModal
            currentName={userProfile.name}
            onSubmit={handleUpdateName}
            onCancel={() => setShowNameEditModal(false)}
          />
        )}

        {showJobModal && (
          <JobModal
            isOpen={showJobModal}
            onClose={() => setShowJobModal(false)}
            onJobSelect={handleJobSelect}
            currentJob={userProfile.job}
            expenses={expenses}
            userProfile={userProfile}
          />
        )}
      </main>
    </div>
  )
}

export default App
