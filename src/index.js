require('dotenv').config();
const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000
const app = express()
const service = require('./scripts/service')
const jwt = require('jsonwebtoken')
const http = require('request');
const { request } = require('http');
const { access } = require('fs');

app
    .use(express.static(path.join(__dirname)))
    .use(express.json())
    .use(express.urlencoded())
    .set('index', path.join(__dirname))
    .set('view engine', 'ejs')
    .listen(PORT, () => console.log(`Listening on ${ PORT }`))

app.get('/', async(req, res) => {
    var verified = await authenticate(req, res);
    if (verified)
        res.render('index')
    else
        res.redirect('/login')
});

//renders the login landing page
app.get('/login', async(req, res) => {
    res.render('login')
})

//sends a login request
app.post('/login', async(req, res) => {
    let user = await service.Login(req.body);
    if (user) {
        const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '10s' })
        const refresh = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET)
        await service.Authenticate(refresh);
        // res.json({ accessToken: token, refreshToken: refresh });
        res.cookie("accessToken", token)
        res.cookie("refreshToken", refresh)
        res.redirect('/')
    }
})

async function refreshAccessToken(refreshToken) {
    if (!refreshToken) return undefined
    const existingToken = await service.Refresh(refreshToken)
    if (existingToken == null) return undefined
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) return undefined
        const accessToken = jwt.sign({ username: user.username }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15s' })
        return accessToken;
    })
}

app.post('/logout', async(req, res) => {
    const cookies = req.headers.cookie.split(';')
    const refreshTokenCookie = cookies && cookies.find(x => x.startsWith('refreshToken'));
    const refreshToken = refreshTokenCookie && refreshTokenCookie.split('=')[1]
    if (refreshToken) {
        await service.Logout(token);
    }
})

async function authenticate(req, res, next) {
    const cookies = req.headers.cookie.split(';')
    const accessTokenCookie = cookies && cookies.find(x => x.trim().startsWith('accessToken'));
    const accessToken = accessTokenCookie && accessTokenCookie.split('=')[1]

    let verified = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return false
        req.user = user
        return true
        next()
    })

    if (!verified) {
        const refreshTokenCookie = cookies && cookies.find(x => x.trim().startsWith('refreshToken'));
        const refreshToken = refreshTokenCookie && refreshTokenCookie.split('=')[1]
        accessToken == refreshToken && await refreshAccessToken(refreshToken)

        jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
            if (err) return false
            req.user = user
            return true
            next()
        })
    }

    return verified;
}

//renders the register page
app.get('/register', async(req, res) => {
    res.render('register')
})

//sends a register request
app.post('/register', async(req, res) => {
    var user = req.body;
    await service.RegisterUser(user);
});