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

    if (onChange) {
      onChange(e);
    }
  };
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
