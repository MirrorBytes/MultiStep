import { get } from 'svelte/store';
import { render } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';

import { local } from "../localStore";
import type { JsonString } from "../types";

import Input from '../components/Input.svelte';

const store = local<JsonString>('test', {});

test('component rendered with name and placeholder', async () => {
  const { findByLabelText } = render(Input, { props: { store, name: 'test_input', placeholder: 'Test Input' } });

  const input = await findByLabelText('Test Input');

  expect(input.attributes.getNamedItem('name')?.value).toBe('test_input');
});

test('input/change function being called properly', async () => {
  const { findByLabelText, component } = render(Input, { props: { store, name: 'test_input', placeholder: 'Test Input' } });

  const input = await findByLabelText('Test Input');

  const mock = jest.fn();
  component.$on('input', mock);

  userEvent.type(input, 'asdf');

  expect(mock).toHaveBeenCalledTimes(4);
});

test('store being updated on input/change', async () => {
  store.set({});

  const { findByLabelText } = render(Input, { props: { store, name: 'test_input', placeholder: 'Test Input' } });

  const input = await findByLabelText('Test Input');

  userEvent.type(input, 'asdf');

  expect(get(store)).toMatchObject({
    test_input: 'asdf',
  });
});
