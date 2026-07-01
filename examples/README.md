# Examples

Runnable SvelteKit apps that demonstrate `sveltekit-plugin-system`.

## `basic/`

A minimal SvelteKit 2 / Svelte 5 app showing every feature:

| Feature                     | Where                                                        |
| --------------------------- | ----------------------------------------------------------- |
| Component hook              | `plugins/hello-plugin` + `<Hook location="after-content" />` |
| Component hook (sidebar)    | `plugins/clock-plugin` + `<Hook location="sidebar" />`      |
| Action (with extra args)    | `hooks.addAction('page-loaded', ...)` / `doAction(...)`      |
| Async action                | `plugins/clock-plugin` (awaited by `doAction`)              |
| Filter (chained)            | `hooks.addFilter('page-title', ...)` / `applyFilter(...)`   |
| Server-side filter          | `src/hooks.server.ts` (`server-locals`)                     |
| Modern read API (runes)     | `hooks.components` in `+page.svelte`                        |
| **Deprecated** `$hooks` store | `$hooks.actions` in `+page.svelte` (Writable compat)      |

### Where plugins are loaded (important)

Plugins are registered in **`src/routes/+layout.ts`** (a `load` function), _not_ in a
component `<script>`. `load` runs before any child `load` and before components mount,
on both the server and the client — so filters/components are available everywhere,
including inside `+page.ts` (`load`). A page `load` that needs a filter should
`await parent()` first (see `src/routes/+page.ts`) so the layout `load` has registered
the plugins.

> Loading plugins inside a component `<script>` (e.g. `+layout.svelte`) also works, but
> only _after_ mount — so client-side `load` functions and SSR-consistent values would
> not see them yet. Prefer `+layout.ts`.

### Run it

The example depends on the package via `file:../..`, so build the package first:

```bash
# from the repo root
npm install
npm run build

# then run the example
cd examples/basic
npm install
npm run dev
```

Open the app, then watch the **browser console** (actions) and the **server terminal**
(server-locals filter) to see the plugin system in action.
