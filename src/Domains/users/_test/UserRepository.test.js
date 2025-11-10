const UserRepository = require('../UserRepository');

describe('UserRepository', () => {
  const userRepository = new UserRepository();
  const methods = [
    userRepository.addUser,
    userRepository.getIdByUsername,
    userRepository.getPasswordByUsername,
    userRepository.isUsernameExist,
  ];

  test.each(methods)('should throw error when abstract behavior invoked %p', async (fn) => {
    await expect(fn())
      .rejects.toThrow('USER_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });
});
