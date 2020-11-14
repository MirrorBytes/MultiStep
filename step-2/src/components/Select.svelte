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
