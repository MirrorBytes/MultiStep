<script lang="ts">
  import { writable } from "svelte/store";

  import { local } from "../localStore";

  export let name: string;

  const store = name !== undefined ? local(name, {}) : writable({});
</script>

<style scoped>
  .form {
    margin: 0 auto;
    padding: 0.5rem;
    width: 70%;
    position: relative;
    display: flex;
    flex-flow: row wrap;
    border-radius: 0.5rem;
    border: 1px solid;
  }

  .submit {
    margin-top: 1rem;
    width: 100%;
  }
</style>

<form {...$$restProps} class="form">
  <slot {store} />

  <input type="submit" class="submit" placeholder="Submit" />
</form>
