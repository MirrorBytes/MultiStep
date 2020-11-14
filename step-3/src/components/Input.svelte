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

<label>
  <div>{$$restProps.placeholder}</div>

  <input bind:value on:input={onInput} {name} {...$$restProps} />
</label>
