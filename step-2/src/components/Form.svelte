<script lang="ts">
  import { writable } from "svelte/store";

  import { local } from "../localStore";

  export let name: string;

  const store = name !== undefined ? local(name, {}) : writable({});
</script>

<form {...$$restProps}>
	<slot {store} />

	<br />

	<input type="submit" placeholder="Submit" />
</form>
