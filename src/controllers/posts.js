/**
 * This controller is responsible for handling all the requests related to Posts.
 * Post route redirects the flow to this controller.
 * Only users who have authenticated tokens can enter this controller. Unauthenticated users are returned with error response from route file.
 * Functions in this controller are:   
 * viewPosts -> Lets authenticated users to view other user's posts with comments and likes received. The posts are displayed in desc order by like value.
 * viewPostsByUsername -> Lets authenticated users to view posts by providing username in the URL.
 * createPost -> Lets authenticated users create posts.
 * updatePost -> Lets authenticated users update their posts. Requires postId in the URL.
 * deletePost -> Lets authenticated users delete their posts. Requires postId in the URL.
 */

const PostComment = require('../models/PostComment')
const PostLike = require('../models/PostLike')
const Posts = require('../models/Posts')
const Users = require('../models/Users')
const status = require('../utilities/status')
const extractedPosts = require('../utilities/common')

const viewPosts = (async (req, res) => {
    try {
        /**$ne excludes the user using this endpoint. */
        const posts = await Posts.find({ 'user_name': { $ne: req.body.user_name } })

        if (Object.keys(posts).length === 0) res.status(status.code('not-found')).send({ "message": "Currently no users have posted anything. Be the first one to post!" })
        else res.status(status.code('success')).send(await extractedPosts.getPostByUser(posts))
    }
    catch (error) { res.status(status.code('internal-server-error')).send({ message: error['details'][0]['message'] }) }

})

/**Endpoint returns the list of posts according to the username specified in URL/ */
const viewPostsByUserName = (async (req, res) => {
    try {
        const posts = await Posts.find({ 'user_name': req.params.user_name })

        /**If no posts are available for the username in URL. */
        if (Object.keys(posts).length === 0) {
            if (req.params.user_name !== req.body.user_name)
                return res.status(status.code('not-found')).send({ "message": "Currently this user has not posted anything. Please visit later." })
            /**If the user wants to view their own post, different error message is returned. */
            if (req.params.user_name === req.body.user_name)
                return res.status(status.code('not-found')).send({ "message": "Currently you have not posted anything. Want to post?" })
        }
        else res.status(status.code('success')).send(await extractedPosts.getPostByUser(posts))
    }
    catch (error) { res.status(status.code('internal-server-error')).send({ message: error['details'][0]['message'] }) }
})

/**Endpoint is responsible for storing post values in the DB. */
const createPost = (async (req, res) => {
    // Gets the user information from the Users collection in DB.
    const user = await Users.findOne({ user_name: req.body.user_name })

    if (!user) return res.status(status.code('bad-request')).send({ message: "User does not exist! Please Create your Account." })

    const createPost = new Posts({
        user_name: req.body.user_name,
        title: req.body.title,
        description: req.body.description,
        userId: user._id.toString()
    })

    try {
        const createdPost = await createPost.save()
        res.status(status.code('created')).send(createdPost)

    } catch (error) {
        res.status(status.code('internal-server-error')).send({ message: error['details'][0]['message'] })
    }
})

/**Endpoint updates the contents of posts according to the postId in URL. 
 * Returns error if not registered OR unauthorized user tries to modify the post. */
const updatePost = (async (req, res) => {

    //*Check if user does not exists*/
    const user = await Users.findOne({ user_name: req.body.user_name })
    if (!user) return res.status(status.code('bad-request')).send({ message: "User does not exist! Please Create your Account." })

    const post = await Posts.findOne({ '_id': req.params.id })
    /**Check if the user id requesting the change is the original post creator. Returns error if otherwise. */
    if (post.userId !== user._id.toString()) return res.status(status.code('forbidden')).send({ message: "You are not authorized to edit the post." })

    try {
        const updatedPost = await Posts.updateOne(
            { _id: req.params.id },
            {
                $set: {
                    title: req.body.title,
                    description: req.body.description,
                    post_created_time: req.body.time_stamp
                }
            }
        )
        res.status(status.code('success')).send({ updatedPost })

    } catch (error) {
        res.status(status.code('internal-server-error')).send({ message: error['details'][0]['message'] })
    }
})

/**Endpoint is responsible for storing comments on the post based on the postId in URL.
 * Stores comment in PostComment collection in DB.
 *  The postId is regarded as identifier. */
const commentOnPost = (async (req, res) => {

    /**Check if requested post is available or not. */
    const postById = await Posts.findOne({ '_id': req.params.id })
    if (!postById) return res.status(status.code('not-found')).send({ message: "Requested post does not exists! User might have removed the post." })

    const user = await Users.findOne({ 'user_name': req.body.user_name })

    /**Check if the post creator is trying to comment on their own post. Returns error if true. */
    if (user._id.toString() == postById.userId) return res.status(status.code('forbidden')).send({ message: "You cannot comment on your own post." })

    const reactToPost = new PostComment({
        comment_by: req.body.user_name,
        postId: req.params.id,
        userId: user._id.toString(),
        comment: req.body.comment
    })

    try {
        const reactedPost = await reactToPost.save()
        res.status(status.code('success')).send(reactedPost)

    } catch (error) {
        res.status(status.code('internal-server-error')).send({ message: error['details'][0]['message'] })
    }

})

/**Endpoint is responsible for storing comments on the post based on the postId in URL.
 * Stores comment in PostLike collection in DB.
 *  The postId is regarded as identifier.
 * Possible values are TRUE or FALSE.
 *  TRUE = Like the post. FALSE = Unlike the post.
 * If TRUE: Record is added in the DB.
 * If FALSE : Record is removed from the DB. */
const likeThePost = (async (req, res) => {

    /**Check if requested post is available or not. Returns error if not available.*/
    const postById = await Posts.findOne({ '_id': req.params.id })
    if (!postById) return res.status(status.code('not-found')).send({ message: "Requested post does not exists! User might have removed the post." })

    /**Check if the unregistered user is trying to like the post. Returns error if true. */
    const user = await Users.findOne({ 'user_name': req.body.user_name })
    if (!user) return res.status(status.code('forbidden')).send({ "message": "You are not authenticated to perform any operation. Please create an account." })

    const likeBooleanValue = req.body.like

    const checkIfLikeValueExists = await PostLike.find({ $and: [{ userId: user._id }, { postById: req.params.id }] })

    if (likeBooleanValue === false) {
        /**Check if post is not liked and unlike request is sent. Returns error if TRUE.*/
        if (Object.keys(checkIfLikeValueExists).length === 0) return res.status(status.code('conflict')).send({ "message": "You have not liked the post. You cannot unlike it." })
        try {
            /**If like value is available in post, unlike the post. */
            await PostLike.deleteOne({ userId: req.body.user_name })
            res.status(status.code('success')).send({ "message": "You have unliked the post." })
        } catch (error) {
            res.status(status.code('internal-server-error')).send({ message: error['details'][0]['message'] })
        }

    }
    /**Check if the post is already liked. Returns error if TRUE. */
    if (Object.keys(checkIfLikeValueExists).length !== 0) res.status(status.code('conflict')).send({ "message": "You have already liked the post." })

    /**Check if the post creator is trying to like their own post. Returns error if true. */
    if (user._id.toString() == postById.userId) return res.status(status.code('forbidden')).send({ message: "You cannot like your own post." })

    const reactToPost = new PostLike({
        liked_by: req.body.user_name,
        postId: req.params.id,
        userId: user._id.toString(),
        like_value: req.body.like
    })

    try {
        await reactToPost.save()
        res.status(status.code('success')).send({ "message": "You have liked the post." })

    } catch (error) {
        res.status(status.code('internal-server-error')).send({ message: error['details'][0]['message'] })
    }

})

const deletePost = (async (req, res) => {

    const postById = await Posts.findOne({ '_id': req.params.id })
    if (!postById) return res.status(status.code('not-found')).send({ message: "The post no longer exists." })

    try {
        await Posts.deleteOne({ _id: req.params.id })
        await PostComment.deleteMany({ postId: req.params.id })
        await PostLike.deleteMany({ postId: req.params.id })
        res.status(status.code('success')).send({ "message": "Your post deletion is successful!" })
    } catch (err) {
        res.status(status.code('internal-server-error')).send({ message: error['details'][0]['message'] })
    }
})


module.exports = { viewPosts, viewPostsByUserName, createPost, updatePost, commentOnPost, likeThePost, deletePost }