const PasswordHash = require('../PasswordHash');

describe('PasswordHash', () => {
  const passwordHash = new PasswordHash();
  const methods = [
    passwordHash.hash,
    passwordHash.comparePassword,
  ];

  test.each(methods)('should throw error when abstract behavior invoked %p', async (fn) => {
    await expect(fn())
      .rejects.toThrow('PASSWORD_HASH.METHOD_NOT_IMPLEMENTED');
  });
});
