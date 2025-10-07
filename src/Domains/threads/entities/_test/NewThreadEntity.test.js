const NewThreadEntity = require('../NewThreadEntity');

describe('NewThreadEntity', () => {
  it('should throw error when payload not contain needed property', () => {
    const missingTitlePayload = { body: 'Thread Body' };
    const missingBodyPayload = { title: 'Thread Title' };

    expect(() => new NewThreadEntity(missingTitlePayload)).toThrow('NEW_THREAD_ENTITY.NOT_CONTAIN_NEEDED_PROPERTY');
    expect(() => new NewThreadEntity(missingBodyPayload)).toThrow('NEW_THREAD_ENTITY.NOT_CONTAIN_NEEDED_PROPERTY');
  });
});