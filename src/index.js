require('dotenv').config();
const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000
const app = express()
const service = require('./scripts/service')
const jwt = require('jsonwebtoken')

app
    .use(express.static(path.join(__dirname)))
    .use(express.json())
    .use(express.urlencoded())
    .set('index', path.join(__dirname))
    .set('view engine', 'ejs')
    .listen(PORT, () => console.log(`Listening on ${ PORT }`))

app.get('/', authenticate, async(req, res) => {

    res.render('index')
});

app.get('/test', async(req, res) => {
    res.send("Success!")
})

//renders the login landing page
app.get('/login', async(req, res) => {
    res.render('login')
})

//sends a login request
app.post('/login', async(req, res) => {
    let user = await service.Login(req.body);
    if (user) {
        const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15s' })
        const refresh = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET)
        await service.Authenticate(refresh);
        // res.json({ accessToken: token, refreshToken: refresh });
        res.cookie("authentication", token)
    }
})

app.post('/refresh', async(req, res) => {
    let refreshToken = req.body.token;
    if (!refreshToken) return res.sendStatus(403)
    var existingToken = await service.Refresh(refreshToken)
    if (existingToken == null) return res.sendStatus(403)
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403)
        const accessToken = jwt.sign({ username: user.username }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15s' })

    })
})

app.delete('/logout', async(req, res) => {

})

function authenticate(req, res, next) {
    const authenticationHeader = req.headers['authentication']
    const token = authenticationHeader && authenticationHeader.split(' ')[1]
    if (!token) res.sendStatus(401);

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403)
        req.user = user
        next()
    })
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