const postLikes = require('mongoose')

const PostLikeScheme = postLikes.Schema({
    liked_by: {
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
    like_value: {
        type: Boolean,
        required: true,
        default: false
    },
    liked_time: {
        type: Date,
        default: Date.now
    },
})

module.exports = postLikes.model('post_likes', PostLikeScheme)