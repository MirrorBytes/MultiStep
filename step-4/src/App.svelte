<script lang="ts">
  import states from "./us_states";

  import Form from "./components/Form.svelte";
  import Step from "./components/Step.svelte";
  import Input from "./components/Input.svelte";
  import Select from "./components/Select.svelte";

  const name = "order";
</script>

<main>
	<Form {name} let:store let:multi>
    <Step name="Customer Info" {multi}>
      <Input {store} type="text" name="first_name" placeholder="First Name" />
      <Input {store} type="text" name="last_name" placeholder="Last Name" />
      <Input {store} type="text" name="phone" placeholder="Phone Number" />
      <Input {store} type="email" name="email" placeholder="Email" />
    </Step>

    <Step name="Billing Info" {multi}>
      <Input {store} type="text" name="bill_address" placeholder="Address" />
      <Input {store} type="text" name="bill_address2" placeholder="Address 2" />
      <Input {store} type="text" name="bill_city" placeholder="City" />
      <Select {store} name="bill_state">
        <option>State</option>

        {#each states as state}
          <option value={state}>{state}</option>
        {/each}
      </Select>
      <Input {store} type="text" name="bill_zip" placeholder="Zip Code" />
    </Step>

    <Step name="Shipping Info" {multi}>
      <Input {store} type="text" name="ship_address" placeholder="Address" />
      <Input {store} type="text" name="ship_address2" placeholder="Address 2" />
      <Input {store} type="text" name="ship_city" placeholder="City" />
      <Select {store} name="ship_state">
        <option>State</option>

        {#each states as state}
          <option value={state}>{state}</option>
        {/each}
      </Select>
      <Input {store} type="text" name="ship_zip" placeholder="Zip Code" />
    </Step>

    <Step name="Payment Info" {multi}>
      <Input {store} type="text" name="card" placeholder="Card Number" />
      <Input {store} type="text" name="month" placeholder="Month" />
      <Input {store} type="text" name="year" placeholder="Year" />
      <Input {store} type="text" name="cvv" placeholder="CVV" />
      <Input {store} type="text" name="card_zip" placeholder="Zip Code (optional)" />
    </Step>
  </Form>
</main>
