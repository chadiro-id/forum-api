const PasswordHash = require('../PasswordHash');

describe('PasswordHash', () => {
  it('should throw error with properly message when abstract method invoked', async () => {
    const passwordHash = new PasswordHash();

    await expect(passwordHash.hash('some_password'))
      .rejects.toThrow('PASSWORD_HASH.METHOD_NOT_IMPLEMENTED');
    await expect(passwordHash.comparePassword('plain', 'encrypted'))
      .rejects.toThrow('PASSWORD_HASH.METHOD_NOT_IMPLEMENTED');
  });
});
