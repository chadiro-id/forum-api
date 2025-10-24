const pool = require('../../database/postgres/pool');
const serverTest = require('../../../../tests/helper/ServerTestHelper');
const { createAuthToken } = require('../../../../tests/helper/authenticationHelper');
const {
  usersTable,
  authenticationsTable,
  threadsTable,
  commentsTable,
} = require('../../../../tests/helper/postgres');

let userA;
let userAuthA;
let userB;
let userAuthB;

beforeAll(async () => {
  await serverTest.setup();

  userA = await usersTable.add({ id: 'user-001', username: 'whoami' });
  userB = await usersTable.add({ id: 'user-002', username: 'johndoe' });

  userAuthA = await createAuthToken({ ...userA });
  userAuthB = await createAuthToken({ ...userB });
});

afterAll(async () => {
  await usersTable.clean();
  await authenticationsTable.clean();
  await pool.end();
});

describe('Comments Endpoints', () => {
  let thread;
  let authorizationUserA;
  let authorizationUserB;

  beforeAll(async () => {
    thread = await threadsTable.add({ owner_id: userA.id });

    authorizationUserA = {
      Authorization: `Bearer ${userAuthA.accessToken}`,
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
  });

  describe('POST /threads/{threadId}/comments', () => {
    let endpoint;

    beforeAll(async () => {
      endpoint = `/threads/${thread.id}/comments`;
    });

    it('should response 201 and the persisted comment', async () => {
      const options = {
        headers: { ...authorizationUserA },
        payload: { content: 'Sebuah komentar' },
      };

      const response = await serverTest.post(endpoint, options);

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toBe(201);
      expect(responseJson.status).toBe('success');
      expect(responseJson.data).toEqual(expect.any(Object));
      expect(responseJson.data.addedComment).toEqual(expect.any(Object));
      expect(responseJson.data.addedComment.id).toEqual(expect.stringContaining('comment-'));
      expect(responseJson.data.addedComment.content).toEqual('Sebuah komentar');
      expect(responseJson.data.addedComment.owner).toEqual(userA.id);
    });

    it('should response 401 when request with no authentications', async () => {
      const options = {
        payload: { content: 'Sebuah komentar' }
      };

      const response = await serverTest.post(endpoint, options);

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toBe(401);
      expect(responseJson.error).toEqual('Unauthorized');
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 404 when thread not exists', async () => {
      const options = {
        headers: { ...authorizationUserA },
        payload: { content: 'Sebuah komentar' },
      };

      const response = await serverTest.post('/threads/xxx/comments', options);

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toBe(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual(expect.any(String));
      expect(responseJson.message).not.toBe('');
    });

    it('should response 400 when payload not contain needed property', async () => {
      const options = {
        headers: { ...authorizationUserA },
        payload: { contents: 'Incorrect content property' },
      };

      const response = await serverTest.post(endpoint, options);

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toBe(400);
      expect(responseJson.status).toBe('fail');
      expect(responseJson.message).toEqual(expect.any(String));
      expect(responseJson.message).not.toBe('');
    });

    it('should response 400 when payload has wrong data type', async () => {
      const options = {
        headers: { ...authorizationUserA },
        payload: { content: ['Sebuah komentar'] },
      };

      const response = await serverTest.post(endpoint, options);

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toBe(400);
      expect(responseJson.status).toBe('fail');
      expect(responseJson.message).toEqual(expect.any(String));
      expect(responseJson.message).not.toBe('');
    });
  });

  describe('DELETE /threads/{threadId}/comments/{commentId}', () => {
    let commentUserA;
    let commentUserB;

    beforeAll(async () => {
      commentUserA = await commentsTable.add({ id: 'comment-001', thread_id: thread.id, owner_id: userA.id });
      commentUserB = await commentsTable.add({ id: 'comment-002', thread_id: thread.id, owner_id: userB.id });
    });

    afterAll(async () => {
      await commentsTable.clean();
    });

    it('should response 200 and status "success"', async () => {
      const endpoint = `/threads/${thread.id}/comments/${commentUserA.id}`;
      const options = {
        headers: { ...authorizationUserA }
      };

      const response = await serverTest.delete(endpoint, options);

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toBe(200);
      expect(responseJson.status).toEqual('success');
    });

    it('should response 401 when request with no authentication', async () => {
      const endpoint = `/threads/${thread.id}/comments/${commentUserA.id}`;

      const response = await serverTest.delete(endpoint);

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toBe(401);
      expect(responseJson.error).toEqual('Unauthorized');
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 404 when thread not exists', async () => {
      const endpoint = `/threads/xxx/comments/${commentUserB.id}`;
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

    it('should response 404 when comment not exists', async () => {
      const endpoint = `/threads/${thread.id}/comments/xxx`;
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

    it('should response 403 when user not authorized', async () => {
      const endpoint = `/threads/${thread.id}/comments/${commentUserB.id}`;
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
  });
});