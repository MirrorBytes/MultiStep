<script lang="ts">
  import type { Writable } from "svelte/store";

  import type { JsonString } from "../types";

  export let store: Writable<JsonString>;
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

<label>
  <div>{$$restProps.placeholder}</div>

  <input bind:value on:input={ourInput} {name} {...$$restProps} />
</label>
