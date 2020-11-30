<script lang="ts">
  import type { Writable } from "svelte/store";

  import type { JsonString } from "../../types";

  export let store: Writable<JsonString>;
  export let name: string;

  import states from "../../us_states";

  import Select from '../../components/Select.svelte';
</script>

<Select {store} {name} {...$$restProps}>
  {#each states as state}
    <option value={state}>{state}</option>
  {/each}
</Select>
