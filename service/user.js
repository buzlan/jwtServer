const UserModel = require("../models/user");
const bcrypt = require("bcrypt");
const uuid = require("uuid");
const tokenService = require("./token");
const UserDto = require("../dtos/user");

class UserService {
  async registration(email, password) {
    const candidate = await UserModel.findOne({ email });
    if (candidate) {
      throw new Error("Пользователь с такой почтой уже существует");
    }
    const hashPassword = await bcrypt.hash(password, 3);
    console.log("Hash password", hashPassword);
    const user = await UserModel.create({ email, password: hashPassword });
    const userDto = new UserDto(user);
    const tokens = tokenService.generateTokens({ ...userDto }); // {пара токенов}
    await tokenService.saveToken(userDto.id, tokens.refreshToken);

    return {
      ...tokens,
      user: userDto,
    };
  }
  async login(email, password) {
    const user = await UserModel.findOne({ email });
    if (!user) {
      throw new Error("Пользователя с такой почтой не существует");
    }
    const isPassEquals = await bcrypt.compare(password, user.password);
    if (!isPassEquals) {
      throw new Error("Не верный пароль");
    }
    const userDto = new UserDto(user);
    const token = tokenService.generateTokens({ ...userDto });
    await tokenService.saveToken(userDto.id, token.refreshToken);

    return {
      ...token,
      user: userDto,
    };
  }
  async logout(refreshToken) {
    const token = await tokenService.removeToken(refreshToken);
    return token;
  }
  async refresh(refreshToken) {
    if (!refreshToken) {
      throw new Error("Вы не авторизованы");
    }
    const userData = tokenService.validateRefreshToken(refreshToken);
    const tokenFromDb = await tokenService.findToken(refreshToken);
    if (!userData || !tokenFromDb) {
      throw new Error("Вы не авторизованы");
    }
    const user = await UserModel.findById(userData.id);
    const userDto = new UserDto(user);
    const token = tokenService.generateTokens({ ...userDto });
    await tokenService.saveToken(userDto.id, token.refreshToken);

    return {
      ...token,
      user: userDto,
    };
  }
  async getUsers(token) {
    const accessToken = token?.split(" ")[1];
    if (
      !token ||
      !accessToken ||
      !tokenService.validateAccessToken(accessToken)
    ) {
      throw new Error("Вы не авторизированы");
    }
    const userList = await UserModel.find();
    return userList;
  }
}

module.exports = new UserService();
