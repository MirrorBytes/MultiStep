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

<label>
  <div>{$$restProps.placeholder}</div>

  <input bind:value on:input={ourInput} {name} {...$$restProps} />
</label>
