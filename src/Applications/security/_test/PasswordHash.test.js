const PasswordHash = require('../PasswordHash');

describe('PasswordHash', () => {
  describe('when abstract method invoked', () => {
    it('should throw error with properly message', async () => {
      const passwordHash = new PasswordHash();

      await expect(passwordHash.hash('dummy_password'))
        .rejects.toThrow('PASSWORD_HASH.METHOD_NOT_IMPLEMENTED');
      await expect(passwordHash.comparePassword('plain', 'encrypted'))
        .rejects.toThrow('PASSWORD_HASH.METHOD_NOT_IMPLEMENTED');
    });
  });
});
