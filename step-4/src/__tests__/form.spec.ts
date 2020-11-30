import { get } from 'svelte/store';
import { render } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';

import FauxForm from './utils/FauxForm.svelte';

test('component renders with inputs', async () => {
  const { findByLabelText, getByPlaceholderText, getByText } = render(FauxForm, { props: { name: 'test_form' } });

  const input = await findByLabelText('Test Input');

  expect(input.attributes.getNamedItem('name')?.value).toBe('test_input');
  expect(() => getByText('Prev')).toThrow();
  expect(() => getByText('Next')).toThrow();
  expect(() => getByPlaceholderText('Submit')).not.toThrow();
});

test('component submits without error', async () => {
  const { findByLabelText, findByPlaceholderText, component } = render(FauxForm, { props: { name: 'test_form' } });

  const input = await findByLabelText('Test Input');
  const submit = await findByPlaceholderText('Submit');

  component.$on('submit', (ev) => {
    const { store } = ev.detail;

    expect(get(store)).toMatchObject({
      test_input: 'asdf',
    });
  });

  userEvent.type(input, 'asdf');
  userEvent.click(submit);
});
