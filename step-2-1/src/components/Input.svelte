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
