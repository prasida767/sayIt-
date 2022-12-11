/**
 * getPostByUser requires a parameter posts, that must contain the lists of posts made by users.
 * This function:
 *              loops the posts, refers to models PostComments and PostLikes, gets all the comments and likes based on the postId from Post model.
 *              inserts the number of likes in the post from PostLikes.
 *              inserts the comments in the post from PostComments.
 *              wraps the response in new variable response.
 *              sorts the post on descending order based on the likes received by the post.
 *              returns the sorted post with comments and likes.
 * 
 */

const PostComment = require('../models/PostComment')
const PostLike = require('../models/PostLike')

module.exports = {
    getPostByUser: async function (posts) {
        var response = []
        for (var post in posts) {
            var newJson = {}
            newJson["_id"] = posts[post]._id
            newJson["user_name"] = posts[post].user_name
            newJson["userId"] = posts[post].userId
            newJson["title"] = posts[post].title
            newJson["description"] = posts[post].description
            newJson["post_created_time"] = posts[post].post_created_time

            /**Gets the comments belonging to a specific post based on postId. */
            const comments_posts = await PostComment.find({ 'postId': posts[post]._id.toString() })
            /**Gets the likes belonging to a specific post based on postId. */
            const likes_posts = await PostLike.find({ 'postId': posts[post]._id.toString() })

            newJson["number_of_likes"] = likes_posts.length

            if (Object.keys(comments_posts).length === 0)
                newJson["commentDescription"] = { "message": "No comments have been made in this post!" }
            else {
                let commentFields = {}
                if (comments_posts) {
                    var j = 0
                    /**Since multiple comments can be done on the same post. 
                     * Loops to get all the comments made on the post. */
                    for (var commentPost in comments_posts) {
                        var loopCommentPost = {}
                        loopCommentPost["comment_by"] = comments_posts[commentPost].comment_by
                        loopCommentPost["comment"] = comments_posts[commentPost].comment
                        loopCommentPost["comment_time"] = comments_posts[commentPost].comment_time
                        commentFields[j] = loopCommentPost
                        j++
                    }
                }
                newJson["commentDescription"] = commentFields
            }
            response.push(newJson)
        }
        response.sort((a, b) => b.number_of_likes - a.number_of_likes)
        return response
    }
}