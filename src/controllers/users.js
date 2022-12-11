/**
 * File consists of endpoints through which CRUD operations can be performed in the Users Model.
 * Login validation, Create Validation, Token Generation performed and used.
 * GET, POST, UPDATE, DELETE.
 */

/**
 * Module imports
 */
const PostComment = require('../models/PostComment')
const PostLike = require('../models/PostLike')
const Posts = require('../models/Posts')
const Users = require('../models/Users')
const { createValidation, loginValidation, createValidationForUpdate } = require('../valdations/validation')
const encryption = require('bcryptjs')
const jwt = require('jsonwebtoken')
const status = require('../utilities/status')


/** 
* Method registers a new user in the application.
* Mandatory fields: Username, Email address, Full Name, Password, Date of Birth.
* Validation is done with help of createValidation function.
*/
const registerUser = (async (req, res) => {

    /*Validation if request contains all required fields*/
    const { error } = createValidation(req.body)

    if (error) res.status(status.code('bad-request')).send({ message: error['details'][0]['message'] })

    /*Check if username and email exists.
    If any of them exist return response with status code and message.*/
    const emailExists = await Users.findOne({ email_address: req.body.email_address })
    const userExists = await Users.findOne({ user_name: req.body.user_name })
    if (emailExists) return res.status(status.code('bad-request')).send({ message: "This email is already registered. Please Login." })
    else if (userExists) return res.status(status.code('bad-request')).send({ message: "Username already taken." })


    /*Hashed representation of password*/
    const salt = await encryption.genSalt(5)
    const hashedPassword = await encryption.hash(req.body.password, salt)


    /*Create user details to save in the DB*/
    const user = new Users({
        user_name: req.body.user_name,
        email_address: req.body.email_address,
        password: hashedPassword,
        date_of_birth: req.body.date_of_birth,
        full_name: req.body.full_name,
    })

    try {
        /*Save user details to save in the DB*/
        const saveUser = await user.save()
        res.status(status.code('created')).send({ data: saveUser })
    } catch (error) {
        res.status(status.code('internal-server-error')).send({ message: error['details'][0]['message'] })
    }

})

/**
 * login endpoint validates the fields from the response body.
 * If successful, generates an authentication token required by users to perform activities in the app.
 * Else, error message is returned.
 */
const login = (async (req, res) => {

    /*Validation if request contains all required fields*/
    const { error } = loginValidation(req.body)
    if (error) res.status(status.code('bad-request')).send({ message: error['details'][0]['message'] })

    /*Check if user does not exists*/
    const user = await Users.findOne({ user_name: req.body.user_name })
    if (!user) return res.status(status.code('bad-request')).send({ message: "User does not exist! Please Create your Account." })

    /*Validate password from request body with the hash representation in the DB.*/
    const validatePassword = await encryption.compare(req.body.password, user.password)
    if (!validatePassword) return res.status(status.code('bad-request')).send({ message: "Password is incorrect!" })

    /*Generate a token based on the secret key and userId.*/
    const token = jwt.sign({ _id: user._id }, process.env.SECRET_KEY + user._id, { expiresIn: "1hr" })

    /* TODO : Once the user is logged in redirect it to their wall*/
    res.header('authToken', token).send({ 'authToken': token, 'message': 'You are now successfully logged in.' })

})

/**
 * updateUser endpoint lets user update their information.
 */
const updateUser = (async (req, res) => {

    /*Validation if request contains all required fields*/
    const { error } = createValidationForUpdate(req.body)
    if (error) return res.status(status.code('bad-request')).send({ message: error['details'][0]['message'] })

    /*Check if user does not exists*/
    const user = await Users.findOne({ user_name: req.body.old_user_name })
    if (!user) return res.status(status.code('bad-request')).send({ message: "User does not exist! Please Create your Account." })

    const validatePassword = await encryption.compare(req.body.old_password, user.password)
    if (!validatePassword) return res.status(status.code('bad-request')).send({ message: "Password is incorrect!" })


    /*Hashed representation of password*/
    const salt = await encryption.genSalt(5)
    const hashedPassword = await encryption.hash(req.body.new_password, salt)

    try {
        await Users.updateOne(
            { _id: user._id },
            {
                $set: {
                    user_name: req.body.new_user_name,
                    password: hashedPassword,
                    full_name: req.body.new_full_name,
                }
            }
        )

        if (req.body.old_user_name !== req.body.new_user_name) {
            if (await Posts.find({ userId: user._id })) await Posts.updateMany({ userId: user._id }, { $set: { user_name: req.body.new_user_name } })
            if (await PostComment.find({ userId: user._id })) await PostComment.updateMany({ userId: user._id }, { $set: { comment_by: req.body.new_user_name } })
            if (await PostLike.find({ userId: user._id })) await PostLike.updateMany({ userId: user._id }, { $set: { liked_by: req.body.new_user_name } })
        }
        res.status(status.code('created')).send({ "message": "Your credentials have been updated.", "user_name": req.body.new_user_name, "full_name": req.body.new_full_name })
    } catch (error) {
        res.status(status.code('internal-server-error')).send({ message: error['details'][0]['message'] })
    }

})

//API Requires : email, username, password
const deleteUser = (async (req, res) => {
    //Check if username, email and password are valid
    const userDetails = await Users.findOne({ email_address: req.body.email_address })

    if (!userDetails) return res.status(status.code('bad-request')).send({ message: "This email is not registered. Cannot delete." })
    else if (userDetails.user_name != req.body.user_name) return res.status(status.code('bad-request')).send({ message: "This username belongs to a different email address. Cannot delete." })

    const validatePassword = await encryption.compare(req.body.password, userDetails.password)
    if (!validatePassword) return res.status(status.code('bad-request')).send({ message: "Password is incorrect. Cannot delete." })

    try {
        const postByUser = await Posts.find({ userId: userDetails._id })
        if (postByUser) await Posts.deleteMany({ userId: userDetails._id })
        const commentsByUser = await PostComment.find({ userId: userDetails._id })
        if (commentsByUser) await PostComment.deleteMany({ userId: userDetails._id })
        const likesByUser = await PostLike.find({ userId: userDetails._id })
        if (likesByUser) await PostLike.deleteMany({ userId: userDetails._id })

        await userDetails.delete()
        res.status(status.code('success')).send({ "message": "Your account has been successfully deleted." })
    } catch (err) {
        res.status(status.code('internal-server-error')).send({ message: err['details'][0]['message'] })
    }

})

const viewUsers = (async (request, response) => {
    try {
        const users = await Users.find()
        var listOfUser = []
        users.forEach(user => {
            console.log(user.user_name)
            listOfUser.push(user.user_name)
        })
        console.log(listOfUser)
        response.status(status.code('success')).send({ "active_users": listOfUser })
    } catch (error) {
        console.log(error)
        response.status(status.code('internal-server-error')).send({ message: error['details'][0]['message'] })
    }
})

module.exports = { registerUser, login, updateUser, deleteUser, viewUsers }