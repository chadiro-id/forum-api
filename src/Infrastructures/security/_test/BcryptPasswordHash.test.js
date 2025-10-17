const bcrypt = require('bcrypt');
const AuthenticationError = require('../../../Commons/exceptions/AuthenticationError');
const BcryptPasswordHash = require('../BcryptPasswordHash');
const PasswordHash = require('../../../Applications/security/PasswordHash');

describe('BcryptPasswordHash', () => {
  it('must be an instance of PasswordHash', () => {
    const bcryptPasswordHash = new BcryptPasswordHash({});
    expect(bcryptPasswordHash).toBeInstanceOf(PasswordHash);
  });

  describe('hash', () => {
    it('should correctly encrypt the password with bcrypt', async () => {
      const spyHash = jest.spyOn(bcrypt, 'hash');
      const bcryptPasswordHash = new BcryptPasswordHash(bcrypt);

      const encryptedPassword = await bcryptPasswordHash.hash('plain_password');

      expect(typeof encryptedPassword).toEqual('string');
      expect(encryptedPassword).not.toEqual('plain_password');
      expect(spyHash).toHaveBeenCalledWith('plain_password', 10);
    });
  });

  describe('comparePassword', () => {
    it('should throw AuthenticationError when the password not match', async () => {
      const bcryptPasswordHash = new BcryptPasswordHash(bcrypt);

      await expect(bcryptPasswordHash.comparePassword('plain_password', 'encrypted_password'))
        .rejects
        .toThrow(AuthenticationError);
    });

    it('should not throw error when the password is match', async () => {
      const passwordHash = new BcryptPasswordHash(bcrypt);
      const plainPassword = 'secret';
      const encryptedPassword = await passwordHash.hash(plainPassword);

      await expect(passwordHash.comparePassword(plainPassword, encryptedPassword))
        .resolves
        .not.toThrow();
    });
  });
});
