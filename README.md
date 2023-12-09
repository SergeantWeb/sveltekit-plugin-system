# Sveltekit plugin system

Load plugins and inject code or component into custom location in your sveltekit project.

# Getting started

## Install package

```
npm i -D sveltekit-plugin-system
```

## Load plugins

### Client-side

In `+layout.svelte` for client-side usage:

```sveltehtml
<script lang="ts">
    import { loadPlugins } from 'sveltekit-plugin-system';
    loadPlugins({
        plugins: import.meta.glob('../../**/plugins/**/index.(ts|js)', { eager: true })
    });
</script>

<slot />
```

### Server-side

In `hooks.server.ts` for server-side usage:

```typescript
import type { Handle } from '@sveltejs/kit';
import { loadPlugins } from 'sveltekit-plugin-system';

export const handle: Handle = async ({ resolve, event }) => {
    loadPlugins({
        plugins: import.meta.glob('../../**/plugins/**/index.(ts|js)', { eager: true })
    });
	return await resolve(event);
};
```

> You need to re-build your project to make it works if you add or remove a server-side hook in your plugin(s).

# Insert a component

## Add hook location

The hook location is the target location where the component or code will be injected from plugins.

For this example, in `+layout.svelte`, we are adding the `Hook` component,
with a location named `after-content`.

Placed after `<slot />`, the plugins can now inject components after the slot content.

```sveltehtml
<script lang="ts">
    import { loadPlugins, Hook } from "sveltekit-plugin-system";

    loadPlugins({
        plugins: import.meta.glob('../../**/plugins/**/index.(ts|js)', { eager: true })
    });
</script>

<slot />

<Hook location="after-content" /> <!-- Add hook location here -->
```

## Create a plugin

Plugins are simple folders containing an `index.ts` file that exports a function with `hooks` store as an argument.

We can inject a component in the `after-content` location from the plugin :

In `src/plugins/plugin-example/index.ts`:

```typescript
import type { Plugins } from 'sveltekit-plugin-system';
import ComponentExample from './ComponentExample.svelte';

export default (hooks: Plugins.HookCreateStore) => {
	hooks.addComponent('after-content', ComponentExample);
};
```

# Insert an action

Actions are function that will be executed at the given location.

For example, let's log something from our plugin :

In our `+layout.svelte` file, we will add the `doAction` function from `hooks` store, and name the hook location `log-something` :

```sveltehtml
<script lang="ts">
    import { loadPlugins, hooks } from "sveltekit-plugin-system";

    loadPlugins({
        plugins: import.meta.glob('../../**/plugins/**/index.(ts|js)', { eager: true })
    });

    $: hooks.doAction('log-something') // Action hook
</script>

<slot />
```

In our plugin, we can now use the `doAction` function from `hooks` store :

`src/plugins/plugin-example/index.ts`:

```typescript
import type { Plugins } from 'sveltekit-plugin-system';

export default (hooks: Plugins.HookCreateStore) => {
	// Add an action to `log-something` location.
	hooks.addAction('log-something', () => {
		console.log('This log message comes from a plugin!');
	});
};
```

Now, on each page of your project, you will see the log message in the console: `This log message comes from a plugin!`

# Add a filter

Filters are functions that take an argument and return something.

It's useful to update a variable and return the updated variable.

For example, we will add a key: value to event.locals from a plugin:

In our project, we can add the server-side sveltekit hook : `hooks.server.ts`,
initialize the locals variable to an empty object, and make it filterable from plugins.

In `hooks.server.ts`:

```typescript
import type { Handle } from '@sveltejs/kit';
import { loadPlugins, hooks } from 'sveltekit-plugin-system';

export const handle: Handle = async ({ resolve, event }) => {
	// Load plugins server-side
    loadPlugins({
        plugins: import.meta.glob('../../**/plugins/**/index.(ts|js)', { eager: true })
    });

    event.locals = {}; // Init locals as an empty object
    
    // Filter event.locals from plugins
    event.locals = hooks.applyFilter('server-locals', event.locals);
    
    // Add console.log to check the updated locals in the console
    if (Object.keys(event.locals).length > 0) {
        console.log('> A plugin is filtering event.locals :');
        console.log('> event.locals =', event.locals);
    }
    
    return await resolve(event);
};
```

In our plugin :

```typescript
import type { Plugins } from 'sveltekit-plugin-system';

export default (hooks: Plugins.HookCreateStore) => {
    // Filter event.locals
    hooks.addFilter('server-locals', (locals: { [key: string]: string }) => {
        locals.test = 'ok';
        return locals;
    });
};
```

Now, re-build your project, and start it, you will see the following logs in your server-side console :

```
> A plugin is filtering event.locals :
> event.locals = { test: 'ok' }
```

# Tailwind compatibility

ChatGPT

You can use Tailwind in your plugin's components, but Tailwind needs to know their location in order to analyze them.

In `tailwind.config.js`:

```typescript
export default {
	content: [
		'./src/**/*.{html,js,svelte,ts}',
		'./plugins/**/*.{html,js,svelte,ts}' // Specify your plugins path here
	]
};
```
