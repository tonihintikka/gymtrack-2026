# Tech Note: Scroll Logged Sets Into View After Logging

## Problem

On mobile, when logging a set during an active workout, the newly logged set (in `LoggedSetsList`) could end up partially or fully hidden behind the fixed bottom navigation (`app-nav`).

The issue was intermittent:
- Depended on viewport height
- Keyboard open/closed state
- Number of already logged sets
- Safe area insets
- iOS keyboard accessory bar ("Done" / predictive text bar) shifting the visual viewport

The existing `margin-bottom` on `.app-content` was not always sufficient when content grew dynamically or when the iOS input accessory bar was visible.

## Solutions

### 1. Scroll after logging (SetInputForm)

In `SetInputForm.tsx`, after a successful log:

1. Reset the form fields
2. Set a `shouldScroll` flag
3. In a `useEffect`, wait ~50ms for the DOM to update
4. Find the `.logged-sets-list` inside the current `.exercise-view`
5. Call `scrollIntoView({ behavior: 'smooth', block: 'nearest' })`

### 2. Hide bottom nav while input is focused (App)

In `App.tsx`:

- Listen for `focusin` / `focusout` on the document
- When an `INPUT` or `TEXTAREA` receives focus → hide the bottom nav (`.app-nav--hidden`)
- When focus leaves inputs → show the nav again (with a short delay to avoid flicker when moving between fields)

CSS (`.app-nav--hidden`):
```css
transform: translateY(100%);
opacity: 0;
pointer-events: none;
```

This prevents the fixed nav and the iOS keyboard accessory bar from competing for space while the user is entering weight/reps.

## Files Changed

- `src/features/workout/components/SetInputForm.tsx`
- `src/App.tsx`
- `src/App.css`

## Commits

- `feat: scroll logged sets into view after logging a set`
- `feat: hide bottom nav when input is focused`
- `style: add hidden state for bottom nav when input focused`

## Related

- [Mobile-First UX Improvements](../mobile-first-ux-todo.md)
- [Layout Consistency Fix](./layout-consistency-fix.md)
