const express = require('express')
const tokenVerification = require('../verifyToken')

const postRoutes = express.Router()

const postController = require('../controllers/posts')

postRoutes.get('/viewPosts', tokenVerification, postController.viewPosts)

postRoutes.get('/viewPosts/:user_name', tokenVerification, postController.viewPostsByUserName)

postRoutes.post('/createPost', tokenVerification, postController.createPost)

postRoutes.patch('/updatePost/:id', tokenVerification, postController.updatePost)

postRoutes.post('/reactToPost/:id/comment', tokenVerification, postController.commentOnPost)

postRoutes.post('/reactToPost/:id/like', tokenVerification, postController.likeThePost)

postRoutes.delete('/deletePost/:id', tokenVerification, postController.deletePost)


module.exports = postRoutes