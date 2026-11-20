import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import App from './App'
import { SectionHeader } from './components/SectionHeader'

vi.mock('./services/db', () => ({
  initDatabase: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('./components/PWAInstallPrompt', () => ({
  PWAInstallPrompt: () => null,
}))

vi.mock('./components/PWAUpdateNotification', () => ({
  PWAUpdateNotification: () => null,
}))

vi.mock('./components/OfflineIndicator', () => ({
  OfflineIndicator: () => null,
}))

vi.mock('./features/workout', async () => {
  const React = await import('react')

  return {
    useWorkout: () => ({}),
    WorkoutProvider: ({ children }: { children: any }) => children,
    WorkoutScreen: () => React.createElement('h2', null, 'Workout'),
  }
})

vi.mock('./features/exercise', async () => {
  const React = await import('react')

  return {
    useExercises: () => ({
      exercises: [],
      loading: false,
      error: null,
      addExercise: vi.fn(),
      removeExercise: vi.fn(),
    }),
    ExerciseScreen: () => React.createElement('h2', null, 'Exercises'),
  }
})

vi.mock('./features/program', async () => {
  const React = await import('react')

  return {
    usePrograms: () => ({
      programs: [],
      loading: false,
      error: null,
      createProgram: vi.fn(),
      deleteProgram: vi.fn(),
      addExerciseToProgram: vi.fn(),
      removeExerciseFromProgram: vi.fn(),
    }),
    ProgramScreen: () => React.createElement('h2', null, 'Programs'),
  }
})

vi.mock('./features/history', async () => {
  const React = await import('react')

  return {
    useHistory: () => ({
      workoutLogs: [],
      loading: false,
      error: null,
      refreshHistory: vi.fn(),
      deleteWorkoutLog: vi.fn(),
      exportWorkoutLogs: vi.fn(),
      updateWorkoutLog: vi.fn(),
    }),
    HistoryScreen: () => React.createElement('h2', null, 'History'),
  }
})

vi.mock('./features/progress', async () => {
  const React = await import('react')

  return {
    ProgressScreen: () => React.createElement('h2', null, 'Progress'),
  }
})

const renderApp = async () => {
  render(<App />)
  await screen.findByRole('navigation', { name: 'Bottom navigation' })
}

beforeEach(() => {
  window.history.replaceState(null, '', '/')
})

afterEach(() => {
  cleanup()
  window.history.replaceState(null, '', '/')
})

describe('App navigation', () => {
  it('restores a valid tab from the URL hash', async () => {
    window.history.replaceState(null, '', '#history')

    await renderApp()

    const historyButton = screen.getByRole('button', { name: 'History' })
    expect(historyButton.getAttribute('aria-current')).toBe('page')
    expect(window.location.hash).toBe('#history')
    expect(screen.getByRole('heading', { level: 2, name: 'History' })).toBeTruthy()
  })

  it('falls back to Workout when the hash is missing', async () => {
    await renderApp()

    const workoutButton = screen.getByRole('button', { name: 'Workout' })
    expect(workoutButton.getAttribute('aria-current')).toBe('page')
    expect(window.location.hash).toBe('#workout')
  })

  it('falls back to Workout for an invalid hash', async () => {
    window.history.replaceState(null, '', '#not-a-tab')

    await renderApp()

    const workoutButton = screen.getByRole('button', { name: 'Workout' })
    expect(workoutButton.getAttribute('aria-current')).toBe('page')
    expect(window.location.hash).toBe('#workout')
  })

  it('synchronizes tab selection to the URL hash', async () => {
    await renderApp()

    fireEvent.click(screen.getByRole('button', { name: 'Programs' }))

    await waitFor(() => {
      expect(window.location.hash).toBe('#programs')
    })

    expect(
      screen.getByRole('button', { name: 'Programs' }).getAttribute('aria-current')
    ).toBe('page')
  })

  it('responds to browser hash changes', async () => {
    await renderApp()

    act(() => {
      window.history.replaceState(null, '', '#progress')
      window.dispatchEvent(new Event('hashchange'))
    })

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Progress' }).getAttribute('aria-current')
      ).toBe('page')
    })

    expect(window.location.hash).toBe('#progress')
  })

  it('exposes accessible navigation names and active state', async () => {
    await renderApp()

    const nav = screen.getByRole('navigation', { name: 'Bottom navigation' })
    expect(nav).toBeTruthy()

    const buttons = screen.getAllByRole('button')
    expect(buttons.map((button) => button.textContent?.trim())).toEqual([
      'Workout',
      'Exercises',
      'Programs',
      'History',
      'Progress',
    ])

    expect(
      screen.getByRole('button', { name: 'Workout' }).getAttribute('aria-current')
    ).toBe('page')
    expect(
      screen.getByRole('button', { name: 'Exercises' }).getAttribute('aria-current')
    ).toBeNull()
  })

  it('keeps one main landmark and correctly ordered headings', async () => {
    await renderApp()

    expect(screen.getAllByRole('main')).toHaveLength(1)

    const headings = screen.getAllByRole('heading')
    expect(headings[0].tagName).toBe('H1')
    expect(headings[0].textContent).toContain('GymTrack')
    expect(headings[1].tagName).toBe('H2')
    expect(headings[1].textContent).toBe('Workout')
  })

  it('keeps navigation buttons natively keyboard focusable', async () => {
    await renderApp()

    const historyButton = screen.getByRole('button', { name: 'History' })
    historyButton.focus()

    expect(document.activeElement).toBe(historyButton)
    expect(historyButton.getAttribute('type')).toBe('button')
    expect(historyButton.hasAttribute('tabindex')).toBe(false)

    fireEvent.click(historyButton)

    await waitFor(() => {
      expect(window.location.hash).toBe('#history')
    })
  })
})

describe('SectionHeader', () => {
  it('renders a consistent section heading with supporting content', () => {
    render(
      <SectionHeader
        title="History"
        description="Review your workouts"
      />
    )

    expect(screen.getByRole('heading', { level: 2, name: 'History' })).toBeTruthy()
    expect(screen.getByText('Review your workouts')).toBeTruthy()
  })
})
