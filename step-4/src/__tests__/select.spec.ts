import { get } from 'svelte/store';
import { render, fireEvent } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';

import { local } from "../localStore";
import type { JsonString } from "../types";

import FauxSelect from './utils/FauxSelect.svelte';
import Select from '../components/Select.svelte';

const store = local<JsonString>('test', {});

test('component rendered with name and placeholder', async () => {
  const { findByLabelText } = render(Select, { props: { store, name: 'test_select', placeholder: 'Test Select' } });

  const select = await findByLabelText('Test Select');

  expect(select.attributes.getNamedItem('name')?.value).toBe('test_select');
});

test('blur function being called properly', async () => {
  const { findByLabelText, component } = render(Select, { props: { store, name: 'test_select', placeholder: 'Test Select' } });

  const select = await findByLabelText('Test Select');

  const mock = jest.fn();
  component.$on('blur', mock);

  await fireEvent.blur(select);

  expect(mock).toHaveBeenCalled();
});

test('store being updated on blur', async () => {
  const { findByLabelText } = render(FauxSelect, { props: { store, name: 'test_select', placeholder: 'Test Select' } });

  const select = await findByLabelText('Test Select');

  userEvent.selectOptions(select, ['NY']);
  await fireEvent.blur(select);

  expect(get(store)).toMatchObject({
    test_select: 'NY',
  });
});
