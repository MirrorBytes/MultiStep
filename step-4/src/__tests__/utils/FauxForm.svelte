<script lang="ts">
  import Form from '../../components/Form.svelte';
  import Input from '../../components/Input.svelte';

  export let name: string;
</script>

<Form {name} let:store>
  <Input {store} type="text" name="test_input" placeholder="Test Input" />
</Form>
