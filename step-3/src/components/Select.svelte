<script lang="ts">
  import type { Writable } from "svelte/store";

  import type { JsonString } from "../types";

  export let store: Writable<JsonString>;
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

<label>
  <select bind:value on:blur={ourChange} {name} {...$$restProps}>
    <slot />
  </select>
</label>
