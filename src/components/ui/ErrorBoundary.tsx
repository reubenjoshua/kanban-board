import { Component, type ErrorInfo, type ReactNode } from 'react'
import { useKanbanStore } from '../../store/kanbanStore.ts'

type Props = { children: ReactNode }

type State = { hasError: boolean }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Kanban app error:', error, info)
  }

  handleReset = () => {
    useKanbanStore.getState().resetToSeed()
    this.setState({ hasError: false })
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-100 p-8 text-center dark:bg-slate-900">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
          Something went wrong
        </h1>
        <p className="max-w-md text-sm text-slate-600 dark:text-slate-400">
          Your saved data may be corrupted. You can reset to a fresh board and
          continue working.
        </p>
        <button type="button" onClick={this.handleReset} className="btn-primary">
          Reset board data
        </button>
      </div>
    )
  }
}
