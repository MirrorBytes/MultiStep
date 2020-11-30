# Multi-step forms w/ Svelte & TypeScript

## Setup

- Svelte v3.29.7
- TypeScript v^4.0.5

## Introduction

I have been working on a project the last few months that has required the extensive creation of forms, and have been using a similar method to this to break them down. Multi-step forms allow for greater user interactivity as well as a smoother UX.

I will show you the steps I took to create generic forms, then the ones I took to create multi-step forms, and finally the ones I took to create multi-page forms.

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

### `types.ts`
```typescript
export type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

export type JsonString = { [key: string]: string };
```

### `localStore.ts`
```typescript
import { writable, get } from "svelte/store";

import type { JsonValue } from "./types"

export function local<T extends JsonValue>(key: string, initial: T) {
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
  import { createEventDispatcher } from "svelte";
  import { writable } from "svelte/store";

  import { local } from "../localStore";
  import type { JsonString } from "../types";

  export let name: string;

  const dispatch = createEventDispatcher();

  const store = name !== undefined ? local<JsonString>(name, {}) : writable({});

  const onSubmit = (e: Event) => dispatch("submit", { e, store });
</script>

<form on:submit={onSubmit} {...$$restProps}>
	<slot {store} />

	<br />

	<input type="submit" placeholder="Submit" />
</form>
```

### `Input.svelte`
```html
<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import type { Writable } from "svelte/store";

  import type { JsonString } from "../types";

  export let store: Writable<JsonString>;
  export let name: string;

  const dispatch = createEventDispatcher();

  let value: string;

  store.subscribe((v) => (value = v[name]));

  const onInput = (e: Event) => {
    store.update(v => {
      v[name] = value;

      return v;
    });

    dispatch("input", e);
  };
</script>

<input bind:value on:input={onInput} {name} {...$$restProps} />
```

### `Select.svelte`
```html
<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import type { Writable } from "svelte/store";

  import type { JsonString } from "../types";

  export let store: Writable<JsonString>;
  export let name: string;

  const dispatch = createEventDispatcher();

  let value: string;

  store.subscribe((v) => (value = v[name]));

  const onChange = (e: FocusEvent) => {
    store.update(v => {
      v[name] = value;

      return v;
    });

    dispatch("change", e);
  };
</script>

<select bind:value on:blur={onChange} {name} {...$$restProps}>
  <slot />
</select>
```

There's a bit to unpack here; we have a lot of what appears to be meaningless complexity that manipulates such a simple form, but one simple form could easily turn into ten. On top of the modularity, state management is extremely important when handling user data to provide the best possible usability.

Here we have a basic Svelte setup. We have a generic Svelte `index.js`, and an `App.svelte` file that looks quite similar to the setup in step 1. In addition to that, we've added three more components named `Form`, `Input`, and `Select`; `Input` and `Select` are near identical with the respect to the elements they render. We have two more JS files as well: `localStore` and `us_states`, with the latter being a self-explanatory array, and the prior being a modified variation of a Svelte writable store that utilizes localStorage.

The `Form` component takes a name prop, and it returns a store (via slot variable) to be used by its children. This is to isolate the varying amount of forms in a project as each will need a different name for localStorage purposes. To bypass localStorage, just don't provide a name and it will create a writable store.

The `Input` and `Select` components take two managed props, and the remaining props that their respective elements take (thank you $$restProps); we also dispatch events for `on:input` and `on:change` respectively. The two props we want control of are: `store`, and `name`. The `store` prop is the `store` slot variable provided by the `Form` component. We steal `name` to use it in a custom input listener in order to preserve the value in our store. Finally, those custom input listeners just update the values of the form elements in our store, and dispatch events to allow further control for each independent form.

Time for the multi-step... step.

## Step 3: Multi-Step Form

Continuing with what we've got:

### `types.ts`
```typescript
// ...

export type JsonBool = { [key: string]: boolean };
```

### `App.svelte`
```html
<script lang="ts">
  // ...

  import Step from "./components/Step.svelte";

  // ...
</script>

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
  import { createEventDispatcher, onMount } from "svelte";
  import { writable } from "svelte/store";
  import type { Writable } from "svelte/store";

  import { local } from "../localStore";
  import type { JsonString, JsonBool } from "../types";

  export let name: string;

  const dispatch = createEventDispatcher();

  const store = name !== undefined ? local<JsonString>(name, {}) : writable({});
  const multi: Writable<JsonBool> = writable({});

  let multi_loc: JsonBool = {};
  let current = 0;

  multi.subscribe(v => (multi_loc = v));

  const onSubmit = (e: Event) => dispatch("submit", { e, store });

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

  import type { JsonBool } from "../types";

  export let name: string;
  export let multi: Writable<JsonBool>;

  multi.update(v => {
    v[name] = false;

    return v;
  });

  let visible = false;

  multi.subscribe(v => (visible = v[name]));
</script>

{#if visible}
  <div>
    <h2>{name}</h2>

    <slot />
  </div>
{/if}
```

We have changed the `Form` component to manage the steps, like it manages its store. This means we have to pass another slot variable, `multi`, to the form's children, but this time the children consist of a new component. The `multi` variable is just a regular writable store with an object that will be a key with a boolean value to represent which step is the current. Once the `Form` component is mounted, we make the first step visisble.

The new component: `Step`. With this component we pass a `name` prop, and the slot variable `multi` provided by the `Form` component. In the component, we add the `name` to the `multi` variable with a default value of `false` to indicate the step is not visible. Now with our steps isolated, we can create fluid and more elegant forms to any project.

## Step 4: Testing Our Form

Testing frontend components is a crucial step for larger projects; e2e is great and all, but it serves little purpose if your components are broken. Unit testing might save your day... or week.

We're going to add some libraries to our previous step:

```
yarn add -D jest ts-jest @types/jest svelte-jester @testing-library/svelte @testing-library/user-event
```

You can pick your poison when it comes to testing libraries; Jest is not a requirement, but is recommended by the testing library. The user-event library is to add more realistic event functionality in our tests.

Here's the Jest config (with TypeScript):

```javascript
module.exports = {
  "transform": {
    "^.+\\.svelte$": [
      "svelte-jester",
      {
        "preprocess": true
      }
    ],
    "^.+\\.ts$": "ts-jest"
  },
  "moduleFileExtensions": [
    "js",
    "ts",
    "svelte"
  ],
};
```

Time to jump into the tests. First, I want to test the inputs to ensure they're functioning as expected, so here are the tests:

- component rendered with name and placeholder
- input function being called properly
- store being updated on input

### `input.spec.ts`
```typescript
import { get } from 'svelte/store';
import { render } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';

import { local } from "../localStore";
import type { JsonString } from "../types";

import Input from '../components/Input.svelte';

const store = local<JsonString>('test', {});

test('component rendered with name and placeholder', async () => {
  const { findByLabelText } = render(Input, { props: { store, name: 'test_input', placeholder: 'Test Input' } });

  const input = await findByLabelText('Test Input');

  expect(input.attributes.getNamedItem('name')?.value).toBe('test_input');
});

test('input function being called properly', async () => {
  const { findByLabelText, component } = render(Input, { props: { store, name: 'test_input', placeholder: 'Test Input' } });

  const input = await findByLabelText('Test Input');

  const mock = jest.fn();
  component.$on('input', mock);

  userEvent.type(input, 'asdf');

  expect(mock).toHaveBeenCalledTimes(4);
});

test('store being updated on input', async () => {
  store.set({});

  const { findByLabelText } = render(Input, { props: { store, name: 'test_input', placeholder: 'Test Input' } });

  const input = await findByLabelText('Test Input');

  userEvent.type(input, 'asdf');

  expect(get(store)).toMatchObject({
    test_input: 'asdf',
  });
});
```

Our `select.spec.ts` is extremely similar, but the final test requires us to use a faux component in order to test slots:

### `select.spec.ts`
```typescript
...

test('store being updated on blur', async () => {
  const { findByLabelText } = render(FauxSelect, { props: { store, name: 'test_select', placeholder: 'Test Select' } });

  const select = await findByLabelText('Test Select');

  userEvent.selectOptions(select, ['NY']);
  await fireEvent.blur(select);

  expect(get(store)).toMatchObject({
    test_select: 'NY',
  });
});
```

### `FauxSelect.svelte`
```html
<script lang="ts">
  import type { Writable } from "svelte/store";

  import type { JsonString } from "../../types";

  export let store: Writable<JsonString>;
  export let name: string;

  import states from "../../us_states";

  import Select from '../../components/Select.svelte';
</script>

<Select {store} {name} {...$$restProps}>
  {#each states as state}
    <option value={state}>{state}</option>
  {/each}
</Select>
```

Slots in Svelte have no programatic interface to work with either inside or outside. Hence a wrapper component that mimics an actual rendered `Select` component.

Once we pass these basic tests, we can move on to the `Form` component to ensure that works properly with our recently tested inputs:

- component renders with inputs
- component submits without error

### `form.spec.ts`
```typescript
import { get } from 'svelte/store';
import { render } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';

import FauxForm from './utils/FauxForm.svelte';

test('component renders with inputs', async () => {
  const { findByTestId, getByPlaceholderText, getByText } = render(FauxForm, { props: { name: 'test_form' } });

  const input = await findByTestId('test_input');

  expect(input.attributes.getNamedItem('name')?.value).toBe('test_input');
  expect(() => getByText('Prev')).toThrow();
  expect(() => getByText('Next')).toThrow();
  expect(() => getByPlaceholderText('Submit')).not.toThrow();
});

test('component submits without error', async () => {
  const { findByTestId, findByPlaceholderText, component } = render(FauxForm, { props: { name: 'test_form' } });

  const input = await findByTestId('test_input');
  const submit = await findByPlaceholderText('Submit');

  component.$on('submit', (ev) => {
    const { store } = ev.detail;

    expect(get(store)).toMatchObject({
      test_input: 'asdf',
    });
  });

  userEvent.type(input, 'asdf');
  userEvent.click(submit);
});
```

Just like with the `Select` component, we need to create a wrapper for the slots:

### `FauxForm.svelte`
```html
<script lang="ts">
  import Form from '../../components/Form.svelte';
  import Input from '../../components/Input.svelte';

  export let name: string;
</script>

<Form {name} let:store>
  <Input {store} type="text" name="test_input" placeholder="Test Input" data-testid="test_input" />
</Form>
```

Now that our `Form` component is tested, let's move on to testing steps:

- component cycles through steps only showing current step's inputs

### `step.spec.ts`
```typescript
import { tick } from 'svelte';
import { render } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';

import FauxStepForm from './utils/FauxStepForm.svelte';

test('component renders with inputs', async () => {
  const { getByLabelText, getByPlaceholderText, getByText } = render(FauxStepForm, { props: { name: 'test_form' } });

  expect(getByLabelText('Test Input').attributes.getNamedItem('name')?.value).toBe('test_input');
  expect(() => getByLabelText('Test Input 2')).toThrow();
  expect(() => getByLabelText('Test Input 3')).toThrow();

  expect(() => getByText('Prev')).toThrow();
  expect(() => getByText('Next')).not.toThrow();
  expect(() => getByPlaceholderText('Submit')).toThrow();

  userEvent.click(getByText('Next'));

  await tick();

  expect(() => getByLabelText('Test Input')).toThrow();
  expect(getByLabelText('Test Input 2').attributes.getNamedItem('name')?.value).toBe('test_input_2');
  expect(() => getByLabelText('Test Input 3')).toThrow();

  expect(() => getByText('Prev')).not.toThrow();
  expect(() => getByText('Next')).not.toThrow();
  expect(() => getByPlaceholderText('Submit')).toThrow();

  userEvent.click(getByText('Next'));

  await tick();

  expect(() => getByLabelText('Test Input')).toThrow();
  expect(() => getByLabelText('Test Input 2')).toThrow();
  expect(getByLabelText('Test Input 3').attributes.getNamedItem('name')?.value).toBe('test_input_3');

  expect(() => getByText('Prev')).not.toThrow();
  expect(() => getByText('Next')).toThrow();
  expect(() => getByPlaceholderText('Submit')).not.toThrow();
});
```

There's a lot of redundancy here, but it's all necessary to achieve proper testing. We introduce Svelte's built-in `tick` function in order to allow the render engine to update after our `click` inputs.

Again, we need a wrapper:

```html
<script lang="ts">
  import Form from '../../components/Form.svelte';
  import Step from '../../components/Step.svelte';
  import Input from '../../components/Input.svelte';

  export let name: string;
</script>

<Form {name} let:store let:multi>
  <Step name="Test Step 1" {multi}>
    <Input {store} type="text" name="test_input" placeholder="Test Input" />
  </Step>

  <Step name="Test Step 2" {multi}>
    <Input {store} type="text" name="test_input_2" placeholder="Test Input 2" />
  </Step>

  <Step name="Test Step 3" {multi}>
    <Input {store} type="text" name="test_input_3" placeholder="Test Input 3" />
  </Step>
</Form>
```

That's pretty much it for testing this simple project. Of course, there's plenty that can be done in order to make neat of it, but for now I think it's alright.

To make note, there are a few changes made from the previous step, they are intentional. These changes are in fact necessary, and would not have been easily discoverable without testing when it comes to larger projects.

## Conclusion

Not pretty by any means, but it serves its purpose. What we have now is a form component that can be single-step or multi-step with the use of the `Step` component. This allows us to have many forms in a project that have the potential to be multi-step.

# Thank you for reading, and have a good one.