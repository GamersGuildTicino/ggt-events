# Codex Notes

This file captures local project conventions that should survive across Codex sessions.

## Component Structure

- Prefer one component per file.
- Prefer one exported function per file.
- Each exported function should have its own `//------------------------------------------------------------------------------` section separator.
- Use long, descriptive names for page-local or admin-only components when that improves clarity.
- Shorten names only after a component becomes genuinely generic and shared.

## File Size

- Files have a soft cap of roughly 200-250 lines.
- When a file grows beyond that range, consider splitting it.
- Splits should aim for clearer responsibilities, not arbitrary fragmentation.
- These split rules apply to file organization in general, not only to page components.

## Hooks

- Split hooks by semantic responsibility.
- Do not structure hooks around a specific component boundary if the logic is broader than that.
- Avoid names like `use-admin-event-data` when more specific semantic slices exist.
- Hooks related to a specific resource are good when they own both the resource and the methods concerning it.
- Split a resource hook further only when the responsibility becomes unclear or there are performance concerns.

## Shared UI

- If two page-local components differ only by small presentational details, extract a shared component instead of keeping duplicate implementations.
- Keep admin-specific naming for admin-only pieces.
- Keep generic naming for shared components.
- Generic UI components belong in `src/ui/`.
- `src/routes/components/` is for page-related shared components that still depend on route concerns or nearby app concerns such as theme or i18n.

## Localization

- All user-facing text must be localized.
- Supported locales are `en-GB` and `it-CH`.
- Italian is the base language for the app.
- Translation keys are added and removed as needed; unused keys should not linger.
- Interpolation uses `{0}` style placeholders.

## Naming

- Favor descriptive filenames first.
- Generalize and shorten names only when reuse is real.
- The one-exported-function-per-file rule applies mainly to React components and hooks.
- Helper extraction is contextual: one-liners can stay inline, but larger helpers should usually move to their own file.

## Data And Domain

- The current `domain/` layer is intentionally mixed for now; deeper cleanup can happen later.
- Do not assume a stricter separation between domain model, data access, and UI hooks unless we explicitly introduce it.

## Supabase

- The Supabase schema is the source of truth.
- Modify schema files only.
- Migrations are generated automatically through the Supabase CLI from schema changes.

## Forms And UX

- There is no strong form abstraction yet; keep things pragmatic.
- There is no optimistic update policy yet.
- Prefer consistency for loading/error UX.
- Some alerts may eventually become toast messages, but alert normalization can happen later.

## Dates And Times

- Prefer shared helpers for date/time formatting.
- Current exception: the date picker in the event details form must stay on `en-CA` for now due to technical constraints.

## Tooling

- Check `package.json` before choosing validation commands.
- Current scripts:
  - `npm run build`
  - `npm run lint`
  - `npm run lint:check`
  - `npm run format`
  - `npm run format:check`

## Testing

- There is no formal test suite yet.
- For now, validation is based on the available build/lint/format scripts plus targeted manual checks when needed.

## Scope

- This file can store any project information that is useful for future Codex work, not only style or organization rules.
