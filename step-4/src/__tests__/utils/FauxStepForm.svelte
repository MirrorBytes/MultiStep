<script lang="ts">
  import Form from '../../components/Form.svelte';
  import Step from '../../components/Step.svelte';
  import Input from '../../components/Input.svelte';

  export let name: string;
</script>

<Form {name} let:store let:multi>
  <Step name="Test Step 1" {multi}>
    <Input {store} type="text" name="test_input" placeholder="Test Input" />
  </Step>

  <Step name="Test Step 2" {multi}>
    <Input {store} type="text" name="test_input_2" placeholder="Test Input 2" />
  </Step>

  <Step name="Test Step 3" {multi}>
    <Input {store} type="text" name="test_input_3" placeholder="Test Input 3" />
  </Step>
</Form>
