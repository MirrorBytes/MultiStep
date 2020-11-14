<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { writable } from "svelte/store";

  import { local } from "../localStore";
  import type { JsonString } from "../types";

  export let name: string;

  const dispatch = createEventDispatcher();

  const store = name !== undefined ? local<JsonString>(name, {}) : writable({});

  const onSubmit = (e: Event) => dispatch("submit", { e, store });
</script>

<form on:submit={onSubmit} {...$$restProps}>
	<slot {store} />

	<br />

	<input type="submit" placeholder="Submit" />
</form>
