import { useState, useEffect } from 'react';

// A custom hook to debounce a value, like a search term.
// It returns a new value only after a specified delay has passed
// since the last update.
export function useDebounce<T>(value: T, delay: number): T {
  // State to store the debounced value
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set a timer to update the debounced value after the specified delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup function: this will run if the value changes or the component unmounts.
    // It clears the timeout, ensuring we don't set the debounced value prematurely.
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // Rerun the effect if value or delay changes

  return debouncedValue;
}
