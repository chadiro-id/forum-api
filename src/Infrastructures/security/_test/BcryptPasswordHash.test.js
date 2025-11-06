const bcrypt = require('bcrypt');
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
    it('should correctly compare matching password with bcrypt', async () => {
      const spyCompare = jest.spyOn(bcrypt, 'compare');
      const bcryptPasswordHash = new BcryptPasswordHash(bcrypt);
      const plainPassword = 'secret';
      const encryptedPassword = await bcryptPasswordHash.hash(plainPassword);

      const result = await bcryptPasswordHash.comparePassword(plainPassword, encryptedPassword);

      expect(result).toBe(true);
      expect(spyCompare).toHaveBeenCalledWith(plainPassword, encryptedPassword);
    });

    it('should correctly compare mismatched password', async () => {
      const bcryptPasswordHash = new BcryptPasswordHash(bcrypt);
      const plainPassword = 'secret';

      const result = await bcryptPasswordHash.comparePassword(plainPassword, 'password-not-match');
      expect(result).toBe(false);
    });
  });
});
