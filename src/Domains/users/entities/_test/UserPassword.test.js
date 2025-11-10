const UserPassword = require('../UserPassword');

describe('UserPassword Entity', () => {
  it('should correctly create the entity', () => {
    const payload = { password: 'supersecret' };

    const { password } = new UserPassword(payload);
    expect(password).toEqual(payload.password);
  });
});