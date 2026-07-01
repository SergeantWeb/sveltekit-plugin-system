# sveltekit-plugin-system

> A tiny plugin system for SvelteKit — let self-contained "plugins" inject **components**, run **actions**, and transform data through **filters** at named locations across your app, without touching your core code.

Think of it as WordPress-style hooks for SvelteKit: your app exposes named _locations_, and plugins (dropped into a `plugins/` folder) hook into them. Works on both the **server** and the **client**.

- **Requirements:** Svelte 5 and SvelteKit 2. _(For Svelte 4 / SvelteKit 1, use `0.1.x`.)_

---

## Table of contents

- [Why](#why)
- [Concepts](#concepts)
- [Installation](#installation)
- [Quick start](#quick-start)
- [Writing a plugin](#writing-a-plugin)
- [The three hook types](#the-three-hook-types)
  - [Components](#1-components)
  - [Actions](#2-actions)
  - [Filters](#3-filters)
- [Loading plugins](#loading-plugins)
- [API reference](#api-reference)
- [Tailwind compatibility](#tailwind-compatibility)
- [Examples](#examples)
- [Contributing](#contributing)

---

## Why

You want a codebase where features can be added or removed as **drop-in folders** — for a
marketplace, a white-label product, optional modules, or simply to keep concerns separate.
Instead of editing shared files every time, you expose _extension points_ and let plugins
attach to them.

## Concepts

- **Location** — a named extension point (a plain string, e.g. `"after-content"`).
- **Plugin** — a folder containing an `index.ts` (or `index.js`) whose **default export** is a
  function that receives the shared `hooks` object and registers hooks on locations.
- **Hook** — what a plugin attaches to a location. There are three kinds:
  - a **component** to render,
  - an **action** to run (side effects),
  - a **filter** to transform a value.

## Installation

```bash
npm i -D sveltekit-plugin-system
```

## Quick start

```
src/
├─ routes/
│  ├─ +layout.ts        # register plugins (see "Loading plugins")
│  ├─ +layout.svelte
│  └─ +page.svelte
└─ plugins/
   └─ hello/
      ├─ index.ts       # the plugin
      └─ Banner.svelte
```

**1. Register plugins** in `src/routes/+layout.ts`:

```ts
import { loadPlugins } from 'sveltekit-plugin-system';

export const load = () => {
	loadPlugins({
		plugins: import.meta.glob('../plugins/**/index.(ts|js)', { eager: true })
	});
};
```

**2. Expose a location** in a component (here in `+page.svelte`):

```svelte
<script lang="ts">
	import { Hook } from 'sveltekit-plugin-system';
</script>

<h1>Home</h1>
<Hook location="after-content" />
```

**3. Write a plugin** in `src/plugins/hello/index.ts`:

```ts
import type { Plugins } from 'sveltekit-plugin-system';
import Banner from './Banner.svelte';

export default (hooks: Plugins.HookCreateStore) => {
	hooks.addComponent('after-content', Banner);
};
```

That's it — `Banner` now renders wherever `<Hook location="after-content" />` appears.

## Writing a plugin

A plugin is a folder with an `index.ts` that default-exports a registration function:

```ts
import type { Plugins } from 'sveltekit-plugin-system';

export default (hooks: Plugins.HookCreateStore) => {
	// register components / actions / filters here
};
```

Every `plugins/**/index.(ts|js)` matched by your `import.meta.glob` is loaded automatically.

## The three hook types

### 1. Components

Render a Svelte component at a location. Any extra props passed to `<Hook>` are forwarded to
the injected components.

```ts
// in a plugin
hooks.addComponent('sidebar', MyWidget);
```

```svelte
<!-- in your app -->
<Hook location="sidebar" title="Widgets" />
<!-- MyWidget receives { title: "Widgets" } -->
```

### 2. Actions

Run one or more callbacks registered on a location. Extra arguments are forwarded, and
`async` handlers are awaited.

```ts
// in a plugin
hooks.addAction('user:login', (user) => track('login', user));
hooks.addAction('user:login', async (user) => {
	await sendWelcomeEmail(user);
});
```

```ts
// in your app
await hooks.doAction('user:login', currentUser);
```

### 3. Filters

Transform a value by passing it through every filter registered on a location, in
registration order. Extra arguments are forwarded, and `async` filters are awaited.

```ts
// in a plugin
hooks.addFilter('page-title', (title) => `${title} • My Site`);
```

```ts
// in your app (e.g. a load function)
const title = await hooks.applyFilter('page-title', 'Home');
// → "Home • My Site"
```

Server-side too — a common pattern is enriching `event.locals` in `hooks.server.ts`:

```ts
import type { Handle } from '@sveltejs/kit';
import { loadPlugins, hooks } from 'sveltekit-plugin-system';

// Load plugins once, before requests are handled.
loadPlugins({ plugins: import.meta.glob('./plugins/**/index.(ts|js)', { eager: true }) });

export const handle: Handle = async ({ resolve, event }) => {
	event.locals = await hooks.applyFilter('server-locals', {});
	return resolve(event);
};
```

## Loading plugins

Call `loadPlugins` **once**. `import.meta.glob` paths are resolved relative to the file that
calls it.

**Recommended — `+layout.ts`:**

```ts
import { loadPlugins } from 'sveltekit-plugin-system';

export const load = () => {
	loadPlugins({ plugins: import.meta.glob('../plugins/**/index.(ts|js)', { eager: true }) });
};
```

> **Why `+layout.ts` and not `+layout.svelte`?**
> `load` functions run **before** components mount and **before** child `load`s, on both the
> server and the client. Registering plugins there guarantees hooks are available everywhere —
> including inside page `load` functions and for SSR-consistent values. If a page `load` needs a
> filter, `await parent()` first so the layout `load` has run.
>
> Registering plugins inside a component `<script>` also works, but only _after_ mount, so
> client-side `load` functions won't see them yet.

Load plugins **server-side** in `hooks.server.ts` (module scope) if you use server hooks such as
`server-locals` — see the [Filters](#3-filters) example.

> ℹ️ Adding or removing a **server-side** hook requires restarting/rebuilding your app.

## API reference

Import the shared store and helpers from the package:

```ts
import { loadPlugins, hooks, Hook, createHooksStore } from 'sveltekit-plugin-system';
import type { Plugins } from 'sveltekit-plugin-system';
```

### `loadPlugins(options?)`

Runs every plugin's default export and marks the store initialized (after which hooks can no
longer be registered).

| Option    | Type                           | Description                                                                                                           |
| --------- | ------------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| `plugins` | `Record<string, { default? }>` | Plugin modules, typically `import.meta.glob(..., { eager: true })`. Defaults to globbing `plugins/**/index.(ts\|js)`. |

### `hooks`

The shared singleton used by plugins and your app.

| Member                                 | Description                                                                              |
| -------------------------------------- | ---------------------------------------------------------------------------------------- |
| `addComponent(location, component)`    | Register a component at `location`.                                                      |
| `addAction(location, callback)`        | Register an action callback at `location`.                                               |
| `doAction(location, ...args)`          | Run all actions at `location` (awaits async ones). Returns `Promise<void>`.              |
| `addFilter(location, filter)`          | Register a filter at `location`.                                                         |
| `applyFilter(location, data, ...args)` | Pass `data` through all filters at `location` (awaits async ones). Returns `Promise<T>`. |
| `components` / `actions` / `filters`   | Reactive read-only accessors (Svelte 5 runes) of the registered hooks.                   |
| `initialized`                          | `true` once `loadPlugins` has run.                                                       |

### `<Hook location=... {...props} />`

Renders every component registered at `location`, forwarding any extra props.

### `createHooksStore()`

Creates an isolated store instance (same shape as `hooks`). Useful for tests or advanced setups.

### Deprecated: `$hooks` store

For backwards compatibility, `hooks` still implements Svelte's `Writable` contract
(`subscribe` / `set` / `update`), so `$hooks` auto-subscription keeps working:

```svelte
<script>
	import { hooks } from 'sveltekit-plugin-system';
	// legacy — prefer the reactive `hooks.components` accessor instead
	$: locations = Object.keys($hooks.components);
</script>
```

Prefer the runes accessors (`hooks.components`, `hooks.actions`, `hooks.filters`) in new code.

## Tailwind compatibility

Tailwind needs to know where your plugin components live to compile their classes:

```ts
// tailwind.config.js
export default {
	content: [
		'./src/**/*.{html,js,svelte,ts}',
		'./src/plugins/**/*.{html,js,svelte,ts}' // your plugins path
	]
};
```

## Examples

A complete, runnable SvelteKit app demonstrating every feature (components, actions, sync/async,
filters, server-side filters, the runes read API, and the deprecated `$hooks` store) lives in
[`examples/basic`](./examples/basic).

## Contributing

```bash
npm install
npm run check   # type-check
npm run lint    # prettier + eslint
npm test        # vitest (unit + regression)
npm run build   # build + publint
```
