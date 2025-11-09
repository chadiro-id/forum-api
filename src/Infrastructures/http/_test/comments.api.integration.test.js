const serverTest = require('../../../../tests/helper/ServerTestHelper');
const pgTest = require('../../../../tests/helper/postgres');
const { createAuthToken } = require('../../../../tests/helper/authenticationHelper');

beforeAll(async () => {
  await serverTest.init();
  await pgTest.truncate();
});

afterAll(async () => {
  await pgTest.end();
  await serverTest.stop();
});

describe('[Integration] Comments Endpoints', () => {
  let user;
  let authorization;
  let thread;

  beforeAll(async () => {
    user = await pgTest.users.add({ username: 'johndoe' });
    const { accessToken } = await createAuthToken({ ...user });
    authorization = {
      Authorization: `Bearer ${accessToken}`,
    };
    thread = await pgTest.threads.add({ owner_id: user.id });
  });

  afterEach(async () => {
    await pgTest.comments.clean();
  });

  afterAll(async () => {
    await pgTest.threads.clean();
    await pgTest.users.clean();
  });

  describe('POST /threads/{threadId}/comments', () => {
    let endpoint;

    beforeAll(async () => {
      endpoint = `/threads/${thread.id}/comments`;
    });

    it('should response 201 and persisted comment', async () => {
      const options = {
        headers: { ...authorization },
        payload: { content: 'Sebuah komentar' },
      };

      const response = await serverTest.post(endpoint, options);
      expect(response.statusCode).toBe(201);

      const resJson = JSON.parse(response.payload);
      expect(resJson).toStrictEqual({
        status: 'success',
        data: {
          addedComment: {
            id: expect.stringMatching(/^comment-[A-Za-z0-9_-]{21}$/),
            content: 'Sebuah komentar',
            owner: user.id,
          },
        },
      });
    });

    it('should response 401 when request with no authentications', async () => {
      const options = { payload: { content: 'Sebuah komentar' } };

      const response = await serverTest.post(endpoint, options);
      expect(response.statusCode).toBe(401);

      const resJson = JSON.parse(response.payload);
      expect(resJson).toStrictEqual({
        statusCode: 401,
        error: 'Unauthorized',
        message: 'Missing authentication',
      });
    });

    it('should response 404 when thread not exists', async () => {
      const options = {
        headers: { ...authorization },
        payload: { content: 'Sebuah komentar' },
      };

      const response = await serverTest.post('/threads/xxx/comments', options);
      expect(response.statusCode).toBe(404);

      const resJson = JSON.parse(response.payload);
      expect(resJson).toStrictEqual({
        status: 'fail',
        message: 'Thread tidak ditemukan',
      });
    });

    it('should response 400 when payload not contain needed property', async () => {
      const options = {
        headers: { ...authorization },
        payload: { contents: 'Incorrect content property' },
      };

      const response = await serverTest.post(endpoint, options);
      expect(response.statusCode).toBe(400);

      const resJson = JSON.parse(response.payload);
      expect(resJson).toStrictEqual({
        status: 'fail',
        message: '"Isi komentar" wajib diisi',
      });
    });

    it('should response 400 when payload has wrong data type', async () => {
      const options = {
        headers: { ...authorization },
        payload: { content: ['Sebuah komentar'] },
      };

      const response = await serverTest.post(endpoint, options);
      expect(response.statusCode).toBe(400);

      const resJson = JSON.parse(response.payload);
      expect(resJson).toStrictEqual({
        status: 'fail',
        message: '"Isi komentar" harus berupa teks',
      });
    });
  });

  describe('DELETE /threads/{threadId}/comments/{commentId}', () => {
    let comment;

    beforeEach(async () => {
      comment = await pgTest.comments.add({ thread_id: thread.id, owner_id: user.id });
    });

    it('should response 200 and status "success"', async () => {
      const endpoint = `/threads/${thread.id}/comments/${comment.id}`;
      const options = { headers: { ...authorization } };

      const response = await serverTest.delete(endpoint, options);
      expect(response.statusCode).toBe(200);

      const resJson = JSON.parse(response.payload);
      expect(resJson).toStrictEqual({
        status: 'success',
      });
    });

    it('should response 401 when request with no authentication', async () => {
      const endpoint = `/threads/${thread.id}/comments/${comment.id}`;

      const response = await serverTest.delete(endpoint);
      expect(response.statusCode).toBe(401);

      const resJson = JSON.parse(response.payload);
      expect(resJson).toStrictEqual({
        statusCode: 401,
        error: 'Unauthorized',
        message: 'Missing authentication',
      });
    });

    it('should response 404 when thread not exists', async () => {
      const endpoint = `/threads/xxx/comments/${comment.id}`;
      const options = { headers: { ...authorization } };

      const response = await serverTest.delete(endpoint, options);
      expect(response.statusCode).toBe(404);

      const resJson = JSON.parse(response.payload);
      expect(resJson).toStrictEqual({
        status: 'fail',
        message: 'Komentar tidak ditemukan',
      });
    });

    it('should response 404 when comment not exists', async () => {
      const endpoint = `/threads/${thread.id}/comments/xxx`;
      const options = { headers: { ...authorization } };

      const response = await serverTest.delete(endpoint, options);
      expect(response.statusCode).toBe(404);

      const resJson = JSON.parse(response.payload);
      expect(resJson).toStrictEqual({
        status: 'fail',
        message: 'Komentar tidak ditemukan',
      });
    });

    it('should response 404 when comment not belong to thread', async () => {
      const otherThread = await pgTest.threads.add({ id: 'thread-999', owner_id: user.id });

      const endpoint = `/threads/${otherThread.id}/comments/${comment.id}`;
      const options = { headers: { ...authorization } };

      const response = await serverTest.delete(endpoint, options);
      expect(response.statusCode).toBe(404);

      const resJson = JSON.parse(response.payload);
      expect(resJson).toStrictEqual({
        status: 'fail',
        message: 'Komentar tidak ditemukan',
      });
    });

    it('should response 403 when user not authorized', async () => {
      const { accessToken: otherAccessToken } = await createAuthToken({
        id: 'user-999', username: 'another-username'
      });

      const endpoint = `/threads/${thread.id}/comments/${comment.id}`;
      const options = { headers: { Authorization: `Bearer ${otherAccessToken}` } };

      const response = await serverTest.delete(endpoint, options);
      expect(response.statusCode).toBe(403);

      const resJson = JSON.parse(response.payload);
      expect(resJson).toStrictEqual({
        status: 'fail',
        message: 'Pengguna tidak memiliki hak akses',
      });
    });
  });
});