import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  window.location.hash = '';
});

// jsdom does not implement scrolling; the app calls it after navigation.
window.scrollTo = () => {};
