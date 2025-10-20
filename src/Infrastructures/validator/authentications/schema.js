const customJoi = require('../customJoi');

const loginUserSchema = customJoi.object({
  username: customJoi.string().required().label('username'),
  password: customJoi.string().required().label('password'),
});

const refreshTokenSchema = customJoi.object({
  refreshToken: customJoi.string().required().label('refresh token'),
});

module.exports = {
  loginUserSchema,
  refreshTokenSchema,
};