/* istanbul ignore file */
// class ServerTestHelper {
//   constructor(server) {
//     this._server = server;
//   }
//   async getAccessTokenAndUserIdHelper({ server, username = 'JohnDoe' }) {
//     const userPayload = {
//       username, password: 'secret',
//     };

//     const responseUser = await server.inject({
//       method: 'POST',
//       url: '/users',
//       payload: {
//         ...userPayload,
//         fullname: 'placeholder fullname',
//       },
//     });

//     const responseAuth = await server.inject({
//       method: 'POST',
//       url: '/authentications',
//       payload: userPayload,
//     });

//     const { id: userId } = (JSON.parse(responseUser.payload)).data.addedUser;
//     const { accessToken } = (JSON.parse(responseAuth.payload)).data;
//     return { userId, accessToken };
//   }
// };

const loginPayload = {
  username: 'forumapi',
  password: 'super_secret',
};

const registerUser = async (server) => {
  const response = await server.inject({
    method: 'POST',
    url: '/users',
    payload: {
      ...loginPayload,
      fullname: 'Forum Api',
    }
  });

  const responseJson = JSON.parse(response.payload);
  console.log(responseJson);
  const {
    data: {
      addedUser: { id }
    }
  } = responseJson;
  return id;
};

const loginUser = async (server) => {
  const response = await server.inject({
    method: 'POST',
    url: '/authentications',
    payload: loginPayload,
  });

  const responseJson = JSON.parse(response.payload);
  const { accessToken } = responseJson.data;
  return accessToken;
};

module.exports = {
  registerUser,
  loginUser,
};