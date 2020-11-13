<script lang="ts">
  import type { Writable } from "svelte/store";

  import type { JsonValue } from "../types";

  export let name: string;
  export let multi: Writable<JsonValue>;

  multi.update(v => {
    v[name] = false;

    return v;
  });

  let visible = false;

  multi.subscribe(v => (visible = v[name]));
</script>

<style scoped>
  h2 {
    width: 100%;
  }

  div {
    display: flex;
    flex-flow: row wrap;
  }
</style>

{#if visible}
  <div>
    <h2>{name}</h2>

    <slot />
  </div>
{/if}
