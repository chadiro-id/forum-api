/* istanbul ignore file */
function toBeRecentDate(received, threshold = 10000) {
  if (!(received instanceof Date)) {
    return {
      pass: false,
      message: () => `Expected ${received} to be a Date instance`
    };
  }

  const now = Date.now();
  const receivedTime = received.getTime();
  const diff = Math.abs(now - receivedTime);
  const pass = diff < threshold;

  return {
    pass,
    message: () =>
      `Expected date to ${pass ? 'not ' : ''}be within ${threshold}ms of current time. ` +
      `Difference: ${diff}ms`
  };
}

function toBeAfter(received, otherDate) {
  const pass = received.getTime() > otherDate.getTime();
  return {
    pass,
    message: () =>
      `Expected ${received} to ${pass ? 'not ' : ''}be after ${otherDate}`
  };
}

expect.extend({
  toBeRecentDate,
  toBeAfter,
});