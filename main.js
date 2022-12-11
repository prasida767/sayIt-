
//Imports the express module
const express = require('express')

//Accessing the express module via express() function
const app = express()
const {restart} = require('nodemon')
const database = require('mongoose')
const userRoutes = require('./src/routes/users')
const postRoutes = require('./src/routes/posts')
const bodyParser = require('body-parser')
require('dotenv/config')

database.connect(process.env.DB_CONNECTOR, () => {})

app.use(bodyParser.json())

//Middleware
app.use('/api/users', userRoutes)
app.use('/api/posts', postRoutes)

app.listen(process.env.PORT, () => {
    console.log("---------------------------------WELCOME TO-------------------------------------")
    console.log("***********************************SAYIT!***************************************")
    console.log("''''''''''''''''''''''''''''''YOUR VOICE MATTERS'''''''''''''''''''''''''''''''''")
})

module.exports = app