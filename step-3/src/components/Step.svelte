<script lang="ts">
  import type { Writable } from "svelte/store";

  import type { JsonBool } from "../types";

  export let name: string;
  export let multi: Writable<JsonBool>;

  multi.update(v => {
    v[name] = false;

    return v;
  });

  let visible = false;

  multi.subscribe(v => (visible = v[name]));
</script>

{#if visible}
  <div>
    <h2>{name}</h2>

    <slot />
  </div>
{/if}
