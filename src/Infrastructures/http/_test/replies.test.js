const pool = require('../../database/postgres/pool');
const serverTest = require('../../../../tests/helper/ServerTestHelper');
const { createAuthToken } = require('../../../../tests/helper/authenticationHelper');
const {
  usersTable,
  authenticationsTable,
  threadsTable,
  commentsTable,
  repliesTable,
} = require('../../../../tests/helper/postgres');

let userA;
let userAuthA;
let userB;
let userAuthB;

beforeAll(async () => {
  await serverTest.setup();

  userA = await usersTable.add({ id: 'user-123', username: 'whoami' });
  userAuthA = await createAuthToken({ ...userA });
  userB = await usersTable.add({ id: 'user-456', username: 'johndoe' });
  userAuthB = await createAuthToken({ ...userB });
});

afterAll(async () => {
  await usersTable.clean();
  await authenticationsTable.clean();
  await pool.end();
});

describe('Replies Endpoints', () => {
  let thread;
  let commentId;
  let authorizationUserA;
  let authorizationUserB;

  beforeAll(async () => {
    thread = await threadsTable.add({ owner: userA.id });
    commentId = await commentsTable.add({ threadId: thread.id, owner: userA.id });

    authorizationUserA = {
      Authorization: `Bearer ${userAuthA.accessToken}`
    };
    authorizationUserB = {
      Authorization: `Bearer ${userAuthB.accessToken}`
    };
  });

  beforeEach(async () => {
    await serverTest.init();
  });

  afterEach(async () => {
    await serverTest.stop();
  });

  afterAll(async () => {
    await threadsTable.clean();
    await commentsTable.clean();
  });

  describe('POST /threads/{threadId}/comments/{commentId}/replies', () => {
    it('should response 401 when request with no authentication', async () => {
      const endpoint = `/threads/${thread.id}/comments/${commentId}/replies`;
      const response = await serverTest.post(endpoint, {
        payload: { content: 'Sebuah balasan' }
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toBe(401);
      expect(responseJson.error).toEqual('Unauthorized');
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 404 when thread does not exists', async () => {
      const endpoint = `/threads/xxx/comments/${commentId}/replies`;
      const options = {
        headers: { ...authorizationUserA },
        payload: { content: 'Sebuah balasan' },
      };

      const response = await serverTest.post(endpoint, options);

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toBe(404);
      expect(responseJson.status).toBe('fail');
      expect(responseJson.message).toEqual(expect.any(String));
      expect(responseJson.message.trim()).not.toBe('');
    });

    it('should response 404 when comment does not exists', async () => {
      const endpoint = `/threads/${thread.id}/comments/xxx/replies`;
      const options = {
        headers: { ...authorizationUserA },
        payload: { content: 'Sebuah balasan' },
      };

      const response = await serverTest.post(endpoint, options);

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toBe(404);
      expect(responseJson.status).toBe('fail');
      expect(responseJson.message).toEqual(expect.any(String));
      expect(responseJson.message.trim()).not.toBe('');
    });

    it('should response 400 when payload not contain needed property', async () => {
      const endpoint = `/threads/${thread.id}/comments/${commentId}/replies`;
      const options = {
        headers: { ...authorizationUserA },
        payload: { contents: 'Incorrect property name' }
      };

      const response = await serverTest.post(endpoint, options);

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toBe(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual(expect.any(String));
      expect(responseJson.message.trim()).not.toBe('');
    });

    it('should response 400 when payload has wrong data type', async () => {
      const endpoint = `/threads/${thread.id}/comments/${commentId}/replies`;
      const options = {
        headers: { ...authorizationUserA },
        payload: { content: 123 }
      };

      const response = await serverTest.post(endpoint, options);

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toBe(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual(expect.any(String));
      expect(responseJson.message.trim()).not.toBe('');
    });

    it('should response 201 and the persisted reply', async () => {
      const endpoint = `/threads/${thread.id}/comments/${commentId}/replies`;
      const options = {
        headers: { ...authorizationUserA },
        payload: { content: 'Sebuah balasan' }
      };

      const response = await serverTest.post(endpoint, options);

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toBe(201);
      expect(responseJson.status).toBe('success');
      expect(responseJson.data).toEqual(expect.any(Object));
      expect(responseJson.data.addedReply).toEqual(expect.any(Object));
      expect(responseJson.data.addedReply.id).toEqual(expect.stringContaining('reply-'));
      expect(responseJson.data.addedReply.content).toEqual('Sebuah balasan');
      expect(responseJson.data.addedReply.owner).toEqual(userA.id);
    });
  });

  describe('DELETE /threads/{threadId}/comments/{commentId}/replies/{replyId}', () => {
    let replyUserA;
    let replyUserB;

    beforeAll(async () => {
      replyUserA = await repliesTable.add({ id: 'reply-123', commentId, owner: userA.id });
      replyUserB = await repliesTable.add({ id: 'reply-456', commentId, owner: userB.id });
    });

    afterAll(async () => {
      await repliesTable.clean();
    });

    it('should response 401 when delete reply without authentication', async () => {
      const endpoint = `/threads/${thread.id}/comments/${commentId}/replies/${replyUserA}`;

      const response = await serverTest.delete(endpoint);

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toBe(401);
      expect(responseJson.error).toEqual('Unauthorized');
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 404 when delete reply that not exists', async () => {
      const endpoint = `/threads/${thread.id}/comments/${commentId}/replies/xxx`;
      const options = {
        headers: { ...authorizationUserB }
      };

      const response = await serverTest.delete(endpoint, options);

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toBe(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual(expect.any(String));
      expect(responseJson.message.trim()).not.toBe('');
    });

    it('should response 403 when delete reply by not authorized user', async () => {
      const endpoint = `/threads/${thread.id}/comments/${commentId}/replies/${replyUserB}`;
      const options = {
        headers: { ...authorizationUserA }
      };

      const response = await serverTest.delete(endpoint, options);

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toBe(403);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual(expect.any(String));
      expect(responseJson.message.trim()).not.toBe('');
    });

    it('should response 200 when delete reply by authorized user', async () => {
      const endpoint = `/threads/${thread.id}/comments/${commentId}/replies/${replyUserA}`;
      const options = {
        headers: { ...authorizationUserA }
      };

      const response = await serverTest.delete(endpoint, options);

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toBe(200);
      expect(responseJson.status).toEqual('success');
    });
  });
});