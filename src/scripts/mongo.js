const { MongoClient } = require("mongodb");
const connectionString = "mongodb://admin:admin@localhost:27017?retryWrites=true&w=majority";
const client = new MongoClient(connectionString);

async function Connect() {
    try {
        db = client.db('LoginJwtTest')
    } catch (e) {
        console.error(e);
    }
}

module.exports = {
    async AddUser(userMongoModel) { await AddUser(userMongoModel) },
    async GetUser(username) { return await GetUser(username) },
    async AddRefreshToken(token) { await AddRefreshToken(token) },
    async GetRefreshToken(token) { return await GetRefreshToken(token) },
    async DeleteRefreshToken(token) { await DeleteRefreshToken(token) }
}

async function AddUser(userMongoModel) {
    await client.connect()
    let db = client.db('LoginJwtTest')
    let usersCollection = db.collection("Users");
    try {
        await usersCollection.insertOne(userMongoModel);
    } catch (e) {
        alert(e);
    }
}

async function GetUser(username) {
    await client.connect()
    let db = client.db('LoginJwtTest')
    let usersCollection = db.collection("Users");
    try {
        return await usersCollection.findOne({ username: username })
    } catch (e) {
        console.error(e);
    }
};

async function GetRefreshToken(token) {
    await client.connect();
    let db = client.db('LoginJwtTest')
    let tokensCollection = db.collection('RefreshTokens');
    try {
        return tokensCollection.findOne({ token: token })
    } catch (e) {
        console.error(e);
    }
}

async function AddRefreshToken(token) {
    await client.connect();
    let db = client.db('LoginJwtTest')
    let tokensCollection = db.collection('RefreshTokens');
    try {
        await tokensCollection.insertOne({ token: token })
    } catch (e) {
        console.error(e);
    }
}

async function DeleteRefreshToken(token) {
    await client.Connect();
    let db = client.db('LoginJwtTest')
    let tokensCollection = db.collection('RefreshTokens');
    try {
        await tokensCollection.deleteOne({ token: token })
    } catch (e) {
        console.error(e)
    }
}