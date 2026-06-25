# CLAUDE.md — System Rules & Architecture

## Core Philosophy
- **Offline-First:** All UI reads are local (or cached); all writes go to the `db.write()` outbox first.
- **Money Safety:** Use `money.ts` for ALL arithmetic. NEVER use floats. Use integer centavos.
- **State Management:** Keep React state local and temporary. Persistence is the database's responsibility.

## Component Architecture
- **Pages/Views:** Located in `src/pages/`.
- **Atomic Components:** Small, stateless UI elements (buttons, inputs, cards) in `src/components/`.
- **Data Hooks:** `src/hooks/` — all `useQuery` or `useMutation` calls for Supabase must live here, not in components.

## Strict Rules
1. **No Floats for Money:** Any variable representing currency MUST be type `number` (representing centavos) and strictly manipulated via `money.ts` functions.
2. **Access Control:** Do not trust the UI to hide admin features. Ensure Row Level Security (RLS) is applied to all tables.
3. **Async/Await:** All database calls must be wrapped in error handling. Show user-friendly toast messages on failure.
4. **Imports:** Use absolute paths (e.g., `@/components/Button`) where configured.
5. **No Inline Logic:** If a component has > 5 lines of conditional logic, move it to a helper function in a dedicated `utils.ts` or `logic.ts` file.

## Offline/Sync Workflow
1. User action -> Call `outbox.push()`.
2. UI performs "Optimistic Update" -> User sees change instantly.
3. `net.ts` watches outbox -> Pushes to Supabase when online.
4. If sync fails -> Trigger local retry + notify user in the UI.

## File Naming
- Components: `PascalCase.tsx`.
- Hooks/Utils: `camelCase.ts`.
- Tests: `name.test.ts`.