
const express = require('express')
const tokenVerification = require('../verifyToken')

const userRoutes = express.Router()
const userController = require('../controllers/users')


userRoutes.post('/registerUser', userController.registerUser)

userRoutes.post('/login', userController.login)

userRoutes.patch('/updateUser', tokenVerification, userController.updateUser)

userRoutes.delete('/deleteUser', tokenVerification, userController.deleteUser)

userRoutes.get('/viewUsers', tokenVerification, userController.viewUsers)

module.exports = userRoutes