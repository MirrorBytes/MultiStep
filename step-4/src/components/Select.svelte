<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import type { Writable } from "svelte/store";

  import type { JsonString } from "../types";

  export let store: Writable<JsonString>;
  export let name: string;

  const dispatch = createEventDispatcher();

  let value: string;

  store.subscribe((v) => (value = v[name]));

  const onBlur = (e: FocusEvent) => {
    store.update(v => {
      v[name] = value;

      return v;
    });

    dispatch("blur", e);
  };
</script>

<label>
  <div>{$$restProps.placeholder}</div>

  <select bind:value on:blur={onBlur} {name} {...$$restProps}>
    <slot />
  </select>
</label>
