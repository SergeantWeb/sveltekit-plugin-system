# Changelog

All notable changes to this project are documented here. This project adheres to
[Semantic Versioning](https://semver.org/).

## [0.2.0] - 2026-07-01

Migration to **Svelte 5 / SvelteKit 2**, internal store rewritten with runes, plus a runnable
example app and a test suite.

### Breaking

- **Requires Svelte 5 and SvelteKit 2.** `peerDependencies.svelte` is now `^5.0.0`.
  Projects on Svelte 4 / SvelteKit 1 should stay on `0.1.x`.
- The `Hook` component now uses Svelte 5 runes and renders dynamic components without the
  deprecated `<svelte:component>` / `$$restProps`.

### Added

- **Runes-based store.** The hooks store is now backed by `$state` (`hookStore.svelte.ts`), with
  reactive read accessors: `hooks.components`, `hooks.actions`, `hooks.filters`, `hooks.initialized`.
- **`createHooksStore()`** export to create isolated store instances (useful for tests).
- **Example app** in [`examples/basic`](./examples/basic) covering every feature, including the
  recommended `+layout.ts` plugin-loading pattern.
- **Test suite** (Vitest): unit tests for the store, `loadPlugins`, and the `Hook` component, plus
  **regression tests** pinning the fixes below. Run with `npm test`.

### Changed

- **Backwards-compatible `$hooks`.** The store keeps Svelte's `Writable` contract
  (`subscribe` / `set` / `update`) so existing `$hooks` usage still works. The runes accessors are
  now the recommended read API.
- Tooling updated to the latest versions: SvelteKit 2, `@sveltejs/package` 2, adapter-auto 7,
  Vite 8, `svelte-check` 4, `publint` 0.3, and ESLint 9 (flat config via `eslint.config.js`,
  replacing `.eslintrc.cjs`).
- Documentation rewritten for clarity (see `README.md`).

### Fixed

- **Missing `await` on server filters.** `hooks.applyFilter` is asynchronous; the documented
  `hooks.server.ts` pattern now awaits it, so `event.locals` receives the filtered value instead
  of a pending `Promise`.
- **`loadPlugins` option typing.** The `options.plugins` argument is now correctly typed as a
  record of plugin modules (previously mistyped as Vite's `KnownAsTypeMap`), so passing
  `import.meta.glob(...)` no longer fails type-checking.
- **`state_snapshot_uncloneable` warning.** The store no longer calls `$state.snapshot` on state
  that holds components/callbacks (which are uncloneable functions); `subscribe`/`update` pass the
  live reactive state instead.

### Notes

- Recommended way to load plugins is now a `+layout.ts` `load` function (runs before components
  mount and before child `load`s, on server and client) rather than a component `<script>`.
  See the README's "Loading plugins" section.

## [0.1.5] - Prior releases

Svelte 4 / SvelteKit 1 line. Introduced components, actions and filters, async support for actions
and filters, and additional arguments for actions and filters.
