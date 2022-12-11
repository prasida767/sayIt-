const postsDatabase = require('mongoose')

const PostSchema = postsDatabase.Schema({
    user_name: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true,
        min: 5,
        max: 250
    },
    description: {
        type: String,
        required: true,
        min: 1,
        max: 2048
    },
    post_created_time: {
        type: Date,
        default: Date.now
    }
})

module.exports = postsDatabase.model('posts', PostSchema)