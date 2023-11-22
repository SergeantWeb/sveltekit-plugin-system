# Sveltekit plugin system

Load plugins and insert hooks or components in a Sveltekit project

## Getting started

Install using npm :

```
npm i -D sveltekit-plugin-system
```

Load plugins and hooks in the main `+layout.svelte` file :

`+layout.svelte`
```
import { loadPlugins } from "sveltekit-plugin-system";
loadPlugins()
```

### loadPlugins() options

`loadPlugins` can be used with options:

#### Use custom plugins path
```
import { loadPlugins } from "sveltekit-plugin-system";
loadPlugins({
    plugins: import.meta.glob('../../plugins/**/index.(ts|js)', { eager: true })
})
```

### Plugins structure

By default, plugins are loaded from a `plugins` folder located in the same directory as the project :

```
┌─ my-sveltekit-project
└─ plugins
   └─ my-plugin
      └─ index.ts
```

Plugins are simple folders with an `index.ts` or `index.js` file.

Environment is inherited from the main project, so we can `import` packages from the main project.

## Usage

The hooks system is based on a custom svelte store, it will be used everywhere we need to add a hook.

### Components

Create the component hook in the main Sveltekit project
`my-sveltekit-project/src/routes/+layout.svelte`

```
<script lang="ts">
	import {loadPlugins, Hook} from "sveltekit-plugin-system";
	loadPlugins()
</script>

<Hook location="beforeAll" /> <!-- Add hook here -->
<slot />
```

Assuming there is a `MyComponent.svelte` file at the plugin root folder :

```
└─ plugins
   └─ my-plugin
      ├─ index.ts
      └─ MyComponent.svelte
```

Add the hook in the plugin :

`plugins/my-plugin/index.ts`

```
// @ts-ignore
import MyComponent from './MyComponent.svelte'

export default {
	init: (hooks: any) => {
		hooks.addComponent('beforeAll', TestComponent)
	}
}
```

#### Tailwind compatibility

Tailwind need to know where are the plugins files to analyze them.

`tailwind.config.js`

```
export default {
	content: [
		'./src/**/*.{html,js,svelte,ts}',
		'../plugins/**/*.{html,js,svelte,ts}', // Add this line
	],
	...
};
```

### Actions

This hook return nothing and can be used to execute arbitrary code at the hook location.

Create the action hook :
`+layout.svelte`

```
<script lang="ts">
	import {loadPlugins, hooks} from "sveltekit-plugin-system";
	loadPlugins()
	hooks.doAction('log-hello-world')
</script>
```

Add the action hook in the plugin :

`plugins/my-plugin/index.ts`

```
export default {
	init: (hooks: any) => {
		hooks.addAction('log-hello-world', () => {
			console.log('Hello world !')
		})
	}
}
```

### Filters

This hook take one parameter that should be returned, it is useful to transform data at the hook location.

Create the filter hook :
`+layout.svelte`

```
<script lang="ts">
	import {loadPlugins, hooks} from "sveltekit-plugin-system";
	loadPlugins()
	let data = {
        propertyToKeep: 'Hello world !',
        propertyToRemove: 'Bye bye !'
    }
    data = hooks.applyFilter('my-filter-test', data)
    console.log(data) // { propertyToKeep: 'Hello world !' }
</script>
```

Add the filter hook in the plugin :

`plugins/my-plugin/index.ts`

```
export default {
	init: (hooks: any) => {
		hooks.addFilter('my-filter-test', (data) => {
			delete data.propertyToRemove
			return data
		})
	}
}
```

## Using server-side

Hooks can be used server-side, in this case, `loadPlugins` function should be used on sveltekit server hook :

`hooks.server.ts`

```
import {loadPlugins} from "sveltekit-plugin-system";

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ resolve, event }) {
	loadPlugins()
	return await resolve(event);
}
```
