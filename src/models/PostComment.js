const postComments = require('mongoose')

const PostCommentSchema = postComments.Schema({
    comment_by: {
        type: String,
        required: true
    },
    postId: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    comment: {
        type: String,
        required: true,
        min: 1,
        max: 5000
    },
    comment_time: {
        type: Date,
        default: Date.now
    }
})

module.exports = postComments.model('post_comments', PostCommentSchema)