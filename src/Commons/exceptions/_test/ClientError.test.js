const ClientError = require('../ClientError');

describe('ClientError', () => {
  it('should throw error when directly instantiated', () => {
    expect(() => new ClientError('')).toThrow('cannot instantiate abstract class');
  });
});