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
