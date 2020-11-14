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

<form on:submit={onSubmit} {...$$restProps}>
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
