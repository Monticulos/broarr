# Web

## Context
- When working with UI components, use Context7 to look up Designsystemet documentation (`/digdir/designsystemet`).

## Requirements
- Prefer to use Digdir Designsystemet components over native html tags. E.g <h1> -> <Heading>, <p> -> <Paragraph>.
- Use Designsystemet CSS tokens for colors, sizes, border-radius, and shadows.
- Every React component should be in its own folder.
- React components should mainly be concerned about presentation. Extract business logic into utility or hook files.
- Follow good accessibility patterns (built-in with Designsystemet).
- Check for redundant div elements that can be removed.
- Never use `fireEvent` from RTL. Use `@testing-library/user-event` instead.

## Commands

```bash
npm run build      # Type-check and build for production
npm run lint       # Run ESLint
npm run test       # Run Vitest
```
