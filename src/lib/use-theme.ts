import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'dark' | 'light'

interface ThemeStore {
    theme: Theme
    setTheme: (theme: Theme) => void
    toggleTheme: () => void
}

export const useTheme = create<ThemeStore>()(
    persist(
        (set, get) => ({
            theme: 'dark',
            setTheme: (theme) => {
                set({ theme })
                // Apply theme to document
                if (typeof window !== 'undefined') {
                    document.documentElement.classList.remove('light', 'dark')
                    document.documentElement.classList.add(theme)
                }
            },
            toggleTheme: () => {
                const newTheme = get().theme === 'dark' ? 'light' : 'dark'
                get().setTheme(newTheme)
            },
        }),
        {
            name: 'theme-storage',
            onRehydrateStorage: () => (state) => {
                // Apply theme on rehydration
                if (state && typeof window !== 'undefined') {
                    document.documentElement.classList.remove('light', 'dark')
                    document.documentElement.classList.add(state.theme)
                }
            },
        }
    )
)
