const bcrypt = require('bcrypt');
const AuthenticationError = require('../../../Commons/exceptions/AuthenticationError');
const BcryptPasswordHash = require('../BcryptPasswordHash');
const PasswordHash = require('../../../Applications/security/PasswordHash');

describe('BcryptPasswordHash', () => {
  it('must be an instance of PasswordHash', () => {
    const bcryptPasswordHash = new BcryptPasswordHash({});

    expect(bcryptPasswordHash).toBeInstanceOf(PasswordHash);
  });

  describe('#hash', () => {
    it('must correctly encrypt the given password with bcrypt', async () => {
      const spyHash = jest.spyOn(bcrypt, 'hash');
      const bcryptPasswordHash = new BcryptPasswordHash(bcrypt);

      const encryptedPassword = await bcryptPasswordHash.hash('plain_password');

      expect(typeof encryptedPassword).toEqual('string');
      expect(encryptedPassword).not.toEqual('plain_password');
      expect(spyHash).toHaveBeenCalledWith('plain_password', 10);
    });
  });

  describe('#comparePassword', () => {
    it('must throw AuthenticationError when the given passwords not match', async () => {
      const bcryptEncryptionHelper = new BcryptPasswordHash(bcrypt);

      await expect(bcryptEncryptionHelper.comparePassword('plain_password', 'encrypted_password'))
        .rejects
        .toThrow(AuthenticationError);
    });

    it('should not throw error when the given passwords is match', async () => {
      const passwordHash = new BcryptPasswordHash(bcrypt);
      const plainPassword = 'secret';
      const encryptedPassword = await passwordHash.hash(plainPassword);

      await expect(passwordHash.comparePassword(plainPassword, encryptedPassword))
        .resolves
        .not.toThrow();
    });
  });
});
