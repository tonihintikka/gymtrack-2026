# Tech Note: Scroll Logged Sets Into View After Logging

## Problem

On mobile, when logging a set during an active workout, the newly logged set (in `LoggedSetsList`) could end up partially or fully hidden behind the fixed bottom navigation (`app-nav`).

The issue was intermittent:
- Depended on viewport height
- Keyboard open/closed state
- Number of already logged sets
- Safe area insets

The existing `margin-bottom` on `.app-content` was not always sufficient when content grew dynamically.

## Solution

In `SetInputForm.tsx`, after a successful log:

1. Reset the form fields
2. Set a `shouldScroll` flag
3. In a `useEffect`, wait ~50ms for the DOM to update
4. Find the `.logged-sets-list` inside the current `.exercise-view`
5. Call `scrollIntoView({ behavior: 'smooth', block: 'nearest' })`

This keeps the newest set visible above the bottom navigation without hiding the nav or changing the overall layout.

## Files Changed

- `src/features/workout/components/SetInputForm.tsx`

## Commit

`feat: scroll logged sets into view after logging a set`

## Related

- [Mobile-First UX Improvements](../mobile-first-ux-todo.md)
- [Layout Consistency Fix](./layout-consistency-fix.md)
