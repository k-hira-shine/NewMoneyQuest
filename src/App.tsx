import { useState, useEffect } from 'react'
import ExpenseForm from './components/ExpenseForm'
import ExpenseList from './components/ExpenseList'
import ProfileCard from './components/ProfileCard'
import { UserProfile, Expense, SkillCategory } from './types'
import { calculateExp, calculateLevel, saveUserData, loadUserData } from './utils/gameLogic'

function App() {
  const [darkMode, setDarkMode] = useState(false)
  const [showExpenseForm, setShowExpenseForm] = useState(false)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [expGainMessage, setExpGainMessage] = useState<string | null>(null)
  const [levelUpAnimation, setLevelUpAnimation] = useState(false)

  // 初期データのロード
  useEffect(() => {
    const loadedData = loadUserData()
    if (loadedData) {
      setUserProfile(loadedData.profile)
      setExpenses(loadedData.expenses)
    } else {
      // 初期ユーザープロファイルの作成
      const initialProfile: UserProfile = {
        name: 'プレイヤー',
        level: 1,
        totalExp: 0,
        skills: {
          [SkillCategory.GROWTH]: { level: 1, exp: 0, multiplier: 3 },
          [SkillCategory.ENTERTAINMENT]: { level: 1, exp: 0, multiplier: 1.5 },
          [SkillCategory.LIFE]: { level: 1, exp: 0, multiplier: 1 }
        }
      }
      setUserProfile(initialProfile)
      saveUserData(initialProfile, [])
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

  // 支出の追加処理
  const handleAddExpense = (amount: number, category: SkillCategory, memo: string) => {
    if (!userProfile) return

    // EXP計算
    const baseExp = Math.floor(amount / 100)
    const multiplier = userProfile.skills[category].multiplier
    const expGained = Math.floor(baseExp * multiplier)

    // 新しい支出データ
    const newExpense: Expense = {
      id: Date.now().toString(),
      amount,
      category,
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
      const skill = updatedProfile.skills[skillKey as SkillCategory]
      skill.level = calculateLevel(skill.exp)
    })

    // データ更新
    const updatedExpenses = [newExpense, ...expenses]
    setUserProfile(updatedProfile)
    setExpenses(updatedExpenses)
    saveUserData(updatedProfile, updatedExpenses)
    
    // EXP獲得メッセージ表示
    setExpGainMessage(`+${expGained} EXP!`)
    setTimeout(() => setExpGainMessage(null), 2000)

    // レベルアップアニメーション
    if (updatedProfile.level > oldLevel) {
      setLevelUpAnimation(true)
      setTimeout(() => setLevelUpAnimation(false), 1500)
    }

    // フォームを閉じる
    setShowExpenseForm(false)
  }

  // 今日の支出のみフィルタリング
  const todayExpenses = expenses.filter(expense => {
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
        />

        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-rpg">今日の支出</h2>
            <button 
              onClick={() => setShowExpenseForm(true)}
              className="rpg-button"
            >
              追加
            </button>
          </div>

          {todayExpenses.length > 0 ? (
            <ExpenseList expenses={todayExpenses} />
          ) : (
            <p className="text-center py-8 rpg-card">今日の支出はまだありません</p>
          )}
        </div>

        {showExpenseForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="rpg-card w-full max-w-md">
              <ExpenseForm 
                onSubmit={handleAddExpense}
                onCancel={() => setShowExpenseForm(false)}
              />
            </div>
          </div>
        )}

        {expGainMessage && (
          <div className="fixed top-1/4 left-1/2 transform -translate-x-1/2 exp-gain-animation">
            <p className="font-rpg text-xl text-secondary">{expGainMessage}</p>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
