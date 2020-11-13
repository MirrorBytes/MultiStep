import { writable, get } from "svelte/store";

export function local<T>(key: string, initial: T) {
  const toString = (value: T) => JSON.stringify(value, null, 2); // helper function
  const toObj = JSON.parse; // helper function

  if (localStorage) {
    if (localStorage.getItem(key) === null) {
      localStorage.setItem(key, toString(initial));
    }

    const saved = toObj(localStorage.getItem(key) || '');

    const store = writable(saved);

    return {
      subscribe: store.subscribe,
      set: (value: T) => {
        localStorage.setItem(key, toString(value));

        store.set(value);
      },
      update: (fn: (value: T) => T) => {
        store.update(fn);

        localStorage.setItem(key, toString(get(store)));
      }
    };
  } else {
    return writable(initial);
  }
};
