import { useState, useEffect } from 'react'
import { blink } from './blink/client'
import { Home, List, Trophy, User } from 'lucide-react'
import { cn } from './lib/utils'

// Components
import HomeFeed from './components/HomeFeed'
import MyList from './components/MyList'
import Compare from './components/Compare'
import Profile from './components/Profile'

type Tab = 'home' | 'list' | 'compare' | 'profile'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<Tab>('home')

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
    })
    return unsubscribe
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 bg-primary rounded-full animate-pulse mx-auto"></div>
          <p className="text-muted-foreground">Loading Beli...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center space-y-6 max-w-sm">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-primary">Beli</h1>
            <p className="text-muted-foreground">Rank your favorite golf courses</p>
          </div>
          <button
            onClick={() => blink.auth.login()}
            className="w-full bg-primary text-primary-foreground py-3 px-6 rounded-xl font-medium hover:bg-primary/90 transition-colors"
          >
            Sign In to Continue
          </button>
        </div>
      </div>
    )
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomeFeed />
      case 'list':
        return <MyList />
      case 'compare':
        return <Compare />
      case 'profile':
        return <Profile user={user} />
      default:
        return <HomeFeed />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Main Content */}
      <main className="pb-20">
        {renderContent()}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border">
        <div className="flex items-center justify-around py-2">
          {[
            { id: 'home', icon: Home, label: 'Home' },
            { id: 'list', icon: List, label: 'My List' },
            { id: 'compare', icon: Trophy, label: 'Compare' },
            { id: 'profile', icon: User, label: 'Profile' },
          ].map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as Tab)}
              className={cn(
                "flex flex-col items-center space-y-1 py-2 px-4 rounded-lg transition-colors",
                activeTab === id
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}

export default App