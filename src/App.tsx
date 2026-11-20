import { useState, useEffect, type ComponentType } from 'react'
import './App.css'

// Import hooks and components
import { useExercises, ExerciseScreen } from './features/exercise'
import { usePrograms, ProgramScreen } from './features/program'
import { useWorkout, WorkoutScreen, WorkoutProvider } from './features/workout'
import { useHistory, HistoryScreen } from './features/history'
import { ProgressScreen } from './features/progress'

// Import PWA components
import { PWAInstallPrompt } from './components/PWAInstallPrompt'
import { PWAUpdateNotification } from './components/PWAUpdateNotification'
import { OfflineIndicator } from './components/OfflineIndicator'

// Import CSS for features
import './features/exercise/components/Exercise.css'
import './features/program/components/Program.css'
import './features/workout/components/Workout.css'
import './features/history/components/History.css'

// Import database initialization
import { initDatabase } from './services/db'

const TAB_IDS = ['workout', 'exercises', 'programs', 'history', 'progress'] as const

type TabId = (typeof TAB_IDS)[number]

interface TabDefinition {
  id: TabId
  label: string
  icon: string
}

const TABS: readonly TabDefinition[] = [
  { id: 'workout', label: 'Workout', icon: '/icons/nav-workout.svg' },
  { id: 'exercises', label: 'Exercises', icon: '/icons/nav-exercises.svg' },
  { id: 'programs', label: 'Programs', icon: '/icons/nav-programs.svg' },
  { id: 'history', label: 'History', icon: '/icons/nav-history.svg' },
  { id: 'progress', label: 'Progress', icon: '/icons/nav-progress.svg' },
]

const DEFAULT_TAB: TabId = 'workout'

const isTabId = (value: string): value is TabId =>
  (TAB_IDS as readonly string[]).includes(value)

const getTabFromHash = (hash: string): TabId => {
  const value = hash.startsWith('#') ? hash.slice(1) : hash
  return isTabId(value) ? value : DEFAULT_TAB
}

const getHashForTab = (tab: TabId): string => `#${tab}`

const SCREEN_BY_TAB: Record<TabId, ComponentType> = {
  workout: WorkoutScreen,
  exercises: ExerciseScreen,
  programs: ProgramScreen,
  history: HistoryScreen,
  progress: ProgressScreen,
}

function getInitialTab(): TabId {
  if (typeof window === 'undefined') {
    return DEFAULT_TAB
  }

  return getTabFromHash(window.location.hash)
}

function App() {
  const [initialized, setInitialized] = useState(false)
  const [activeTab, setActiveTab] = useState<TabId>(getInitialTab)
  const workout = useWorkout()

  // Initialize the database on mount
  useEffect(() => {
    const init = async () => {
      try {
        await initDatabase()
        setInitialized(true)
      } catch (error) {
        console.error('Failed to initialize database:', error)
      }
    }

    init()
  }, [])

  // Keep the active tab and URL hash in sync. The hash is the source of truth
  // for deep links and browser back/forward navigation.
  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const syncFromHash = () => {
      const nextTab = getTabFromHash(window.location.hash)
      setActiveTab(nextTab)

      const nextHash = getHashForTab(nextTab)
      if (window.location.hash !== nextHash) {
        window.history.replaceState(null, '', nextHash)
      }
    }

    syncFromHash()
    window.addEventListener('hashchange', syncFromHash)

    return () => {
      window.removeEventListener('hashchange', syncFromHash)
    }
  }, [])

  // Preserve the existing local persistence behavior without making it the
  // source of truth for routing.
  useEffect(() => {
    try {
      window.localStorage.setItem('activeTab', activeTab)
    } catch (_) {}
  }, [activeTab])

  const navigateToTab = (tab: TabId) => {
    setActiveTab(tab)

    if (typeof window !== 'undefined') {
      const nextHash = getHashForTab(tab)
      if (window.location.hash !== nextHash) {
        window.location.hash = nextHash
      }
    }
  }

  // Render loading state while initializing
  if (!initialized) {
    return (
      <div className="app-container">
        <h1>GymTrack PWA</h1>
        <p>Initializing application...</p>
      </div>
    )
  }

  const ActiveScreen = SCREEN_BY_TAB[activeTab]

  return (
    <WorkoutProvider value={workout}>
      <div className="app-container">
        <OfflineIndicator />
        <PWAUpdateNotification />
        <PWAInstallPrompt />

        <header className="app-header">
          <h1>
            <img src="/icons/icon.svg" alt="GymTrack" className="app-logo" />
            GymTrack
          </h1>
          <div className="header-actions">
            {/* Add any header actions here if needed */}
          </div>
        </header>

        <main className="app-content">
          <ActiveScreen />
        </main>

        <nav className="app-nav" aria-label="Bottom navigation">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id

            return (
              <button
                key={tab.id}
                type="button"
                className={isActive ? 'active' : ''}
                onClick={() => navigateToTab(tab.id)}
                aria-current={isActive ? 'page' : undefined}
              >
                <span className="nav-icon" aria-hidden="true">
                  <img src={tab.icon} alt="" />
                </span>
                <span className="nav-label">{tab.label}</span>
              </button>
            )
          })}
        </nav>
      </div>
    </WorkoutProvider>
  )
}

export default App
