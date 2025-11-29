# Language Selector - To Fix

## Current Status
The language context exists and works correctly with translations for 10 languages:
- English, Spanish, French, Portuguese, Arabic, Chinese, Hindi, Bengali, Russian, Urdu

## The Problem
The UI components are **hardcoded in English** and don't use the translation function `t()` from the LanguageContext.

## How to Fix

### Step 1: Import the hook in components
```tsx
import { useLanguage } from "@/contexts/language-context"

export function MyComponent() {
  const { t } = useLanguage()
  
  return <div>{t('dashboard')}</div>  // Instead of <div>Dashboard</div>
}
```

### Step 2: Replace hardcoded strings
Examples:
- `"Dashboard"` → `{t('dashboard')}`
- `"Clients"` → `{t('clients')}`
- `"Welcome back"` → `{t('welcomeBack')}`
- `"Save"` → `{t('save')}`

### Step 3: Components that need updating
- `/components/sidebar.tsx` - Navigation menu
- `/components/header.tsx` - Top header
- `/components/dashboard-overview.tsx` - Dashboard cards
- `/app/clients/page.tsx` - Client list
- `/app/calendar/page.tsx` - Calendar
- And all other pages/components with hardcoded text

### Step 4: Add missing translations
If you add new text, add it to ALL language objects in `/contexts/language-context.tsx`

## Test It
1. Change language in the dropdown
2. Verify all text changes to the selected language
3. Check that no hardcoded English text remains

## Priority
**Medium** - Works fine in English, but won't change languages until components are refactored.

## Estimated Effort
- 2-3 hours to refactor all major components
- Best done component-by-component rather than all at once

