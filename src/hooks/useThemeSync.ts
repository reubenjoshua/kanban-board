import { useEffect } from 'react'
import { applyThemeToDocument, useThemeStore } from '../store/themeStore.ts'

export function useThemeSync() {
  const theme = useThemeStore((s) => s.theme)

  useEffect(() => {
    applyThemeToDocument(theme)
  }, [theme])
}
