const { AddUser, GetUser, AddRefreshToken, GetRefreshToken } = require('./mongo')
const { hash } = require('./crypto')

module.exports = {
    async RegisterUser(userDto) { await RegisterUser(userDto) },
    async Login(userDto) { return await Login(userDto.username, userDto.password) },
    async Authenticate(token) { await Authenticate(token) },
    async Refresh(token) { return await Refresh(token) }
}

async function RegisterUser(userDto) {
    if (!userDto) return;
    if (!userDto.username) return;
    if (!userDto.password) return;

    let record = hash(userDto.password);
    let userMongoModel = {
        username: userDto.username,
        hash: record.hash,
        salt: record.salt,
        role: 1
    }
    await AddUser(userMongoModel);
}

async function Login(username, password) {
    let user = await GetUser(username);
    if (user) {
        let record = hash(password, user.salt);
        password = "";
        if (record.hash == user.hash) {
            return { username: user.username };
        }
    }
}

async function Refresh(token) {
    return await GetRefreshToken(token)
}

async function Authenticate(token) {
    await AddRefreshToken(token)
}