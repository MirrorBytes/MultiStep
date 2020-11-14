<script lang="ts">
  import { writable } from "svelte/store";
  import type { Writable } from "svelte/store";

  import { local } from "../localStore";
  import type { JsonString } from "../types";

  export let name: string;
  export let onSubmit: ((e: Event, store: Writable<JsonString>) => any) | null = null;

  const store = name !== undefined ? local<JsonString>(name, {}) : writable({});

  const ourSubmit = (e: Event) => {
    if (onSubmit) {
      onSubmit(e, store);
    }
  };
</script>

<form on:submit={ourSubmit} {...$$restProps}>
	<slot {store} />

	<br />

	<input type="submit" placeholder="Submit" />
</form>
