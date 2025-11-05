const UserRepository = require('../UserRepository');

describe('UserRepository', () => {
  it('should throw error with properly message when abstract method invoked', async () => {
    const userRepository = new UserRepository();

    await expect(userRepository.addUser())
      .rejects
      .toThrow('USER_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(userRepository.getPasswordByUsername())
      .rejects
      .toThrow('USER_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(userRepository.getIdByUsername())
      .rejects
      .toThrow('USER_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(userRepository.verifyUsernameAvailability())
      .rejects
      .toThrow('USER_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });
});
