# Multi-step forms w/ Svelte

## Introduction

I have been working on a project the last few months that has required the extensive creation of forms, and have been using a similar method to this to break them down. Multi-step forms allow for greater user interactivity as well as a smoother UX.

I will show you the steps I took to create generic forms, then the ones I took to create multi-step forms, and finally the ones I took to create multi-page forms.

Here's the Github repo: 

## Step 1: Generic Single Step Form

Let's begin with this:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="ie=edge" />
    <title>Static HTML Form</title>
  </head>
  <body>
    <form>
      <h2>Customer Info</h2>

      <input type="text" name="first_name" placeholder="First Name" />
      <input type="text" name="last_name" placeholder="Last Name" />
      <input type="text" name="phone" placeholder="Phone Number" />
      <input type="email" name="email" placeholder="Email" />

      <h2>Billing Info</h2>

      <input type="text" name="address" placeholder="Address" />
      <input type="text" name="address2" placeholder="Address 2" />
      <input type="text" name="city" placeholder="City" />
      <select name="state">
        <option>State</option>

        <!-- States List -->
      </select>
      <input type="text" name="zip" placeholder="Zip Code" />

      <h2>Shipping Info</h2>

      <input type="text" name="address" placeholder="Address" />
      <input type="text" name="address2" placeholder="Address 2" />
      <input type="text" name="city" placeholder="City" />
      <select name="state">
        <option>State</option>

        <!-- States List -->
      </select>
      <input type="text" name="zip" placeholder="Zip Code" />

      <h2>Payment Info</h2>

      <input type="text" name="card" placeholder="Card Number" />
      <input type="text" name="month" placeholder="Month" />
      <input type="text" name="year" placeholder="Year" />
      <input type="text" name="cvv" placeholder="CVV" />
      <input type="text" name="card_zip" placeholder="Zip Code (optional)" />

      <br />

      <input type="submit" placeholder="Submit" />
    </form>
  </body>
</html>
```

We're missing a few things, such as name info for billing & shipping, but we'll ignore that for this example. This is going to look quite ugly out the gate, and it's not user friendly to say the least. Let's add Svelte to the project, and add some behind the scenes UX.

## Step 2: Introducing Svelte to Our Form

Here are our core files:

### `index.ts`
```typescript
import App from "./App.svelte";

const app = new App({
  target: document.body,
});

export default app;
```

### `localStore.ts`
```typescript
import { writable, get } from "svelte/store";

export function local<T>(key: string, initial: T) {
  const toString = (value: T) => JSON.stringify(value, null, 2); // helper function
  const toObj = JSON.parse; // helper function

  if (localStorage) {
    if (localStorage.getItem(key) === null) {
      localStorage.setItem(key, toString(initial));
    }

    const saved = toObj(localStorage.getItem(key) || '');

    const store = writable(saved);

    return {
      subscribe: store.subscribe,
      set: (value: T) => {
        localStorage.setItem(key, toString(value));

        store.set(value);
      },
      update: (fn: (value: T) => T) => {
        store.update(fn);

        localStorage.setItem(key, toString(get(store)));
      }
    };
  } else {
    return writable(initial);
  }
};
```

### `App.svelte`
```html
<script lang="ts">
  import states from "./us_states";

  import Form from "./components/Form.svelte";
  import Input from "./components/Input.svelte";
  import Select from "./components/Select.svelte";

  const name = "order";
</script>

<main>
	<Form {name} let:store>
    <h2>Customer Info</h2>

    <Input {store} type="text" name="first_name" placeholder="First Name" />
    <Input {store} type="text" name="last_name" placeholder="Last Name" />
    <Input {store} type="text" name="phone" placeholder="Phone Number" />
    <Input {store} type="email" name="email" placeholder="Email" />

    <h2>Billing Info</h2>

    <Input {store} type="text" name="ship_address" placeholder="Address" />
    <Input {store} type="text" name="ship_address2" placeholder="Address 2" />
    <Input {store} type="text" name="ship_city" placeholder="City" />
    <Select {store} name="ship_state">
      <option>State</option>

      {#each states as state}
        <option value={state}>{state}</option>
      {/each}
    </Select>
    <Input {store} type="text" name="ship_zip" placeholder="Zip Code" />

    <h2>Shipping Info</h2>

    <Input {store} type="text" name="bill_address" placeholder="Address" />
    <Input {store} type="text" name="bill_address2" placeholder="Address 2" />
    <Input {store} type="text" name="bill_city" placeholder="City" />
    <Select {store} name="bill_state">
      <option>State</option>

      {#each states as state}
        <option value={state}>{state}</option>
      {/each}
    </Select>
    <Input {store} type="text" name="bill_zip" placeholder="Zip Code" />

    <h2>Payment Info</h2>

    <Input {store} type="text" name="card" placeholder="Card Number" />
    <Input {store} type="text" name="month" placeholder="Month" />
    <Input {store} type="text" name="year" placeholder="Year" />
    <Input {store} type="text" name="cvv" placeholder="CVV" />
    <Input {store} type="text" name="card_zip" placeholder="Zip Code (optional)" />
  </Form>
</main>
```

### `Form.svelte`
```html
<script lang="ts">
  import { writable } from "svelte/store";

  import { local } from "../localStore";

  export let name: string;

  const store = name !== undefined ? local(name, {}) : writable({});
</script>

<form {...$$restProps}>
	<slot {store} />

	<br />

	<input type="submit" placeholder="Submit" />
</form>
```

### `Input.svelte`
```html
<script lang="ts">
  import type { Writable } from "svelte/store";

  export let store: Writable<any>;
  export let name: string;
  export let onInput: ((e: Event) => any) | null = null;

  let value: string;

  store.subscribe((v) => (value = v[name]));

  const ourInput = (e: Event) => {
    store.update(v => {
      v[name] = value;

      return v;
    });

    if (onInput) {
      onInput(e);
    }
  };
</script>

<input bind:value on:input={ourInput} {name} {...$$restProps} />
```

### `Select.svelte`
```html
<script lang="ts">
  import type { Writable } from "svelte/store";

  export let store: Writable<any>;
  export let name: string;
  export let onChange: ((e: FocusEvent) => any) | null = null;

  let value: string;

  store.subscribe((v) => (value = v[name]));

  const ourChange = (e: FocusEvent) => {
    store.update(v => {
      v[name] = value;

      return v;
    });

    if(onChange) {
      onChange(e);
    }
  };
</script>

<select bind:value on:blur={ourChange} {name} {...$$restProps}>
  <slot />
</select>
```

There's a bit to unpack here; we have a lot of what appears to be meaningless complexity that manipulates such a simple form, but one simple form could easily turn into ten. State management is extremely important when handling user data to provide the best possible usability.

We have a basic Svelte setup. We have a generic Svelte `index.js`, and an `App.svelte` file that looks quite similar to the setup in step 1. In addition to that, we've added three more components named `Form`, `Input`, and `Select`; `Input` and `Select` are near identical with the respect to the elements they render. We have two more JS files as well: `localStore` and `us_states`, with the latter being a self-explanatory array, and the prior being a modified variation of a Svelte writable store that utilizes localStorage.

The `Form` component takes a name prop, and it returns a store (via slot variable) to be used by its children. This is to isolate with varying amount of forms in a project as each will need a different name for localStorage purposes. To bypass localStorage, just don't provide a name and it will create a writable store.

The `Input` and `Select` components take three managed props, and the remaining props that their respective elements take (thank you $$restProps). The three props we want control of are: `store`, `name`, and `onInput/onChange`. The `store` prop is the `store` slot variable provided by the `Form` component. We steal `name` to use it in a custom input listener in order to preserve the value in our store. Finally, the `onInput/onChange` prop is to accomodate other potential (mostly visual) changes.

## Step 2.1: That is still the same level of ugly though, and that should change:

### `App.svelte`
```html
<script lang="ts">
  // ...
</script>

<style>
  main {
    font-family: "Lato", sans-serif;
  }

  h2 {
    width: 100%;
  }
</style>

<main>
  <!-- -->
</main>
```

### `Form.svelte`
```html
<script lang="ts">
  // ...
</script>

<style scoped>
  .form {
    margin: 0 auto;
    padding: 0.5rem;
    width: 70%;
    position: relative;
    display: flex;
    flex-flow: row wrap;
    border-radius: 0.5rem;
    border: 1px solid;
  }

  .submit {
    margin-top: 1rem;
    width: 100%;
  }
</style>

<form {...$$restProps} class="form">
  <slot {store} />

  <input type="submit" class="submit" placeholder="Submit" />
</form>
```

### `Input.svelte`
```html
<script lang="ts">
  // ...
</script>

<style scoped>
  label {
    margin: 0.25rem;
    max-width: calc(50% - 0.5rem);
    flex: 1 0 50%;
  }

  input {
    margin-top: 0.25rem;
    padding: 0.25rem;
    width: calc(100% - 0.75rem);
  }
</style>

<label>
  <div>{$$restProps.placeholder}</div>

  <input bind:value on:input={ourInput} {name} {...$$restProps} />
</label>
```

### `Select.svelte`
```html
<script lang="ts">
  // ...
</script>

<style>
  label {
    margin: 0.25rem;
    position: relative;
  }

  select {
    padding: 0.25rem;
    bottom: 0;
    position: absolute;
  }
</style>

<label>
  <select bind:value on:blur={ourChange} {name} {...$$restProps}>
    <slot />
  </select>
</label>
```

Boom, generic less ugly (sort of) form with state management.

Time for the multi-step... step.

## Step 3: Multi-Step Form

Continuing with what we've got:

### `App.svelte`
```html
<script lang="ts">
  // ...

  import Step from "./components/Step.svelte";

  // ...
</script>

<style>
  main {
    font-family: "Lato", sans-serif;
  }
</style>

<main>
	<Form {name} let:store let:multi>
    <Step name="Customer Info" {multi}>
      <!-- -->
    </Step>

    <Step name="Billing Info" {multi}>
      <!-- -->
    </Step>

    <Step name="Shipping Info" {multi}>
      <!-- -->
    </Step>

    <Step name="Payment Info" {multi}>
      <<!-- -->
    </Step>
  </Form>
</main>
```

### `Form.svelte`
```html
<script lang="ts">
  import { onMount } from "svelte";
  import { writable } from "svelte/store";
  import type { Writable } from "svelte/store";

  import { local } from "../localStore";
  import type { JsonValue } from "../types";

  export let name: string;

  const store = name !== undefined ? local(name, {}) : writable({});
  const multi: Writable<JsonValue> = writable({});

  let multi_loc: JsonValue = {};
  let current = 0;

  multi.subscribe(v => (multi_loc = v));

  function prev() {
    if (Object.keys(multi_loc)[current - 1]) {
      multi.update(v => {
        v[Object.keys(multi_loc)[current]] = false;

        return v;
      });

      current -= 1;

      multi.update(v => {
        v[Object.keys(multi_loc)[current]] = true;

        return v;
      });
    }
  }

  function next() {
    if (Object.keys(multi_loc)[current + 1]) {
      multi.update(v => {
        v[Object.keys(multi_loc)[current]] = false;

        return v;
      });

      current += 1;

      multi.update(v => {
        v[Object.keys(multi_loc)[current]] = true;

        return v;
      });
    }
  }

  onMount(() => {
    multi.update(v => {
      v[Object.keys(multi_loc)[current]] = true;

      return v;
    });
  });
</script>

<style scoped>
  .wrapper {
    margin: 0 auto;
    padding: 0.5rem;
    width: 70%;
    border-radius: 0.5rem;
    border: 1px solid;
  }

  .controls {
    margin-top: 1rem;
    display: flex;
  }

  button {
    margin: 0 0.25rem;
    width: calc(50% - 0.25rem);
  }

  button:first-child {
    margin-left: 0;
  }

  button:last-child {
    margin-right: 0;
  }

  input {
    margin-left: 0.25rem;
    width: calc(50% - 0.25rem);
  }
</style>

<div class="wrapper">
  <form {...$$restProps} class="form">
    <slot {store} {multi} />

    <div class="controls">
      {#if Object.keys(multi_loc)[current - 1]}
        <button on:click|preventDefault={prev}>Prev</button>
      {/if}

      {#if Object.keys(multi_loc)[current + 1]}
        <button on:click|preventDefault={next}>Next</button>
      {/if}

      {#if !Object.keys(multi_loc)[current + 1]}
        <input type="submit" placeholder="Submit" />
      {/if}
    </div>
  </form>
</div>
```

### `Step.svelte`
```html
<script lang="ts">
  import type { Writable } from "svelte/store";

  import type { JsonValue } from "../types";

  export let name: string;
  export let multi: Writable<JsonValue>;

  multi.update(v => {
    v[name] = false;

    return v;
  });

  let visible = false;

  multi.subscribe(v => (visible = v[name]));
</script>

<style scoped>
  h2 {
    width: 100%;
  }

  div {
    display: flex;
    flex-flow: row wrap;
  }
</style>

{#if visible}
  <div>
    <h2>{name}</h2>

    <slot />
  </div>
{/if}
```

### `Input.svelte`
```html
<script lang="ts">
  // ...
</script>

<style scoped>
  label {
    margin: 0.25rem;
    max-width: calc(50% - 0.25rem);
    flex: 1 0 50%;
  }

  label:nth-child(even) {
    margin-left: 0;
  }

  label:nth-child(odd) {
    margin-right: 0;
  }

  input {
    margin: 0.25rem 0 0 0;
    padding: 0.25rem;
    width: calc(100% - 0.75rem);
  }
</style>

<!-- -->
```

We have changed the `Form` component to manage the steps, like it manages its store. This means we have to pass another slot variable, `multi`, to the form's children, but this time the children consist of a new component. The `multi` variable is just a regular writable store with an object that will be a key with a boolean value to represent which step is the current. Once the `Form` component is mounted, we make the first step visisble.

The new component: `Step`. With this component we pass a `name` prop, and the slot variable `multi` provided by the `Form` component. In the component, we add the `name` to the `multi` variable with a default value of `false` to indicate the step is not visible. Now with our steps isolated, we can create fluid and more elegant forms to any project.

## Conclusion

Not pretty by any means, but it serves its purpose. What we have now is a form component that can be single-step or multi-step with the use of the `Step` component. This allows us to have many forms in a project that have the potential to be multi-step.