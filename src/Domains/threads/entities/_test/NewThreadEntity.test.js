const NewThreadEntity = require('../NewThreadEntity');

describe('NewThreadEntity', () => {
  it('should throw error when payload not contain needed property', () => {
    const missingTitlePayload = { body: 'Thread Body' };
    const missingBodyPayload = { title: 'Thread Title' };

    expect(() => new NewThreadEntity(missingTitlePayload)).toThrow('NEW_THREAD_ENTITY.NOT_CONTAIN_NEEDED_PROPERTY');
    expect(() => new NewThreadEntity(missingBodyPayload)).toThrow('NEW_THREAD_ENTITY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    const titleNotStringPayload = { title: 123, body: 'Thread Body' };
    const bodyNotStringPayload = { title: 'Thread Title', body: [1, 2, 3] };

    expect(() => new NewThreadEntity(titleNotStringPayload)).toThrow('NEW_THREAD_ENTITY.NOT_MEET_DATA_TYPE_SPECIFICATION');
    expect(() => new NewThreadEntity(bodyNotStringPayload)).toThrow('NEW_THREAD_ENTITY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });
});