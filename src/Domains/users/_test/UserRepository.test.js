const UserRepository = require('../UserRepository');

describe('UserRepository', () => {
  describe('when abstract method invoked', () => {
    it('should throw error with properly message', async () => {
      const userRepository = new UserRepository();

      await expect(userRepository.addUser({}))
        .rejects.toThrow('USER_REPOSITORY.METHOD_NOT_IMPLEMENTED');
      await expect(userRepository.verifyAvailableUsername(''))
        .rejects.toThrow('USER_REPOSITORY.METHOD_NOT_IMPLEMENTED');
      await expect(userRepository.getPasswordByUsername(''))
        .rejects.toThrow('USER_REPOSITORY.METHOD_NOT_IMPLEMENTED');
      await expect(userRepository.getIdByUsername(''))
        .rejects.toThrow('USER_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    });
  });
});
