const UserPassword = require('../UserPassword');

describe('UserPassword Entity', () => {
  it('should correctly create the entity', () => {
    const payload = { password: 'supersecret' };

    const { password } = new UserPassword(payload);
    expect(password).toEqual(payload.password);
  });

  it('should throw error when payload not contain needed property', () => {
    const missingPassword = {};
    const emptyPassword = { password: '' };

    expect(() => new UserPassword(missingPassword))
      .toThrow('USER_PASSWORD.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
    expect(() => new UserPassword(emptyPassword))
      .toThrow('USER_PASSWORD.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload property does not meet data type specification', () => {
    const passwordNotString = { password: 123 };

    expect(() => new UserPassword(passwordNotString))
      .toThrow('USER_PASSWORD.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
  });
});