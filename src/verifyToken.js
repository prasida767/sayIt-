const { send } = require('express/lib/response')
const jsonwebtoken = require('jsonwebtoken')
const User = require('./models/Users.js')
const status = require('../src/utilities/status')

async function auth(req, res, next) {
    const token = req.header('authToken')

    if (!token) {
        return res.status(status.code('unauthorized')).send({ message: 'Access Denied.' })
    }

    let user = []

    if (req.body.old_user_name) {
        user = await User.findOne({ user_name: req.body.old_user_name })
    } else {
        user = await User.findOne({ user_name: req.body.user_name })
    }

    try {
        const verified = jsonwebtoken.verify(token, process.env.SECRET_KEY + user._id)
        req.user = verified
        next()
    } catch (err) {
        next(err)
        return res.status(status.code('unauthorized')).send({ message: 'Invalid token.' })
    }
}

module.exports = auth