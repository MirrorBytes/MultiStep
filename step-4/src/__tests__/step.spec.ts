import { tick } from 'svelte';
import { render } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';

import FauxStepForm from './utils/FauxStepForm.svelte';

test('component renders with inputs', async () => {
  const { getByLabelText, getByPlaceholderText, getByText } = render(FauxStepForm, { props: { name: 'test_form' } });

  expect(getByLabelText('Test Input').attributes.getNamedItem('name')?.value).toBe('test_input');
  expect(() => getByLabelText('Test Input 2')).toThrow();
  expect(() => getByLabelText('Test Input 3')).toThrow();

  expect(() => getByText('Prev')).toThrow();
  expect(() => getByText('Next')).not.toThrow();
  expect(() => getByPlaceholderText('Submit')).toThrow();

  userEvent.click(getByText('Next'));

  await tick();

  expect(() => getByLabelText('Test Input')).toThrow();
  expect(getByLabelText('Test Input 2').attributes.getNamedItem('name')?.value).toBe('test_input_2');
  expect(() => getByLabelText('Test Input 3')).toThrow();

  expect(() => getByText('Prev')).not.toThrow();
  expect(() => getByText('Next')).not.toThrow();
  expect(() => getByPlaceholderText('Submit')).toThrow();

  userEvent.click(getByText('Next'));

  await tick();

  expect(() => getByLabelText('Test Input')).toThrow();
  expect(() => getByLabelText('Test Input 2')).toThrow();
  expect(getByLabelText('Test Input 3').attributes.getNamedItem('name')?.value).toBe('test_input_3');

  expect(() => getByText('Prev')).not.toThrow();
  expect(() => getByText('Next')).toThrow();
  expect(() => getByPlaceholderText('Submit')).not.toThrow();
});
