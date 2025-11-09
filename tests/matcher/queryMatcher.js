/* istanbul ignore file */
function toMatchQueryText(received, expected) {
  if (typeof received !== 'string' || typeof expected !== 'string') {
    throw new TypeError('Both arguments must be strings');
  }

  // Normalize: remove all whitespace and convert to lowercase (optional)
  const normalize = (str) => str.replace(/\s+/g, '').toLowerCase();

  const normalizedReceived = normalize(received);
  const normalizedExpected = normalize(expected);

  const pass = normalizedReceived === normalizedExpected;

  return {
    pass,
    message: () =>
      pass
        ? 'Expected query text to not match, but they are identical after normalization'
        : 'Query text mismatch after whitespace removal:\n\n' +
          `Expected: "${expected}"\n` +
          `Received: "${received}"\n\n` +
          `Normalized Expected: "${normalizedExpected}"\n` +
          `Normalized Received: "${normalizedReceived}"`,
  };
}

expect.extend({
  toMatchQueryText,
});