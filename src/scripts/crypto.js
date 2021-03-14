const crypto = require('crypto');
const algorithm = 'aes-256-ctr';

module.exports = {
    decryptFromRecord(hash, key) { return decryptFromRecord(hash, key) },
    encrypt(hash, salt, iv) { return encrypt(hash, salt, iv) },
    hash(password, salt) { return hash(password, salt) }
}

function GenerateSalt(length) {
    if (!length) length = 16
    return crypto.randomBytes(length)
}

function hash(password, salt) {
    if (!salt) {
        salt = GenerateSalt(32).toString('hex');
    }
    let hmac = crypto.createHmac('sha256', salt).update(password).digest('hex');
    let record = {
        hash: hmac,
        salt: salt
    }

    return record;
}

function encrypt(text, salt, iv) {
    try {
        if (!iv) {
            iv = GenerateSalt(16).toString('hex');
        }
        if (!salt) {
            salt = GenerateSalt(32).toString('hex').slice(0, 32);;
        }
        let cipher = crypto.createCipheriv(algorithm, Buffer.concat([Buffer.from(salt), Buffer.alloc(32)], 32), Buffer.from(iv, 'hex'));
        let encrypted = cipher.update(text);
        encrypted = Buffer.concat([encrypted, cipher.final()]);

        var record = {
            salt: salt,
            iv: iv,
            hash: encrypted.toString('hex')
        }
        return record;
    } catch (e) {
        console.error(e);
    }
}