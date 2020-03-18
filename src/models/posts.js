const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
    body: {
        type: String,
        require: true
    },
    status: {
        type: String,
        default: 'public'
    },
    allowComments: {
        type: Boolean,
        default: true
    },
    comments: [{
        commentBody: {
            type: String,
            required: true
        },
        commentDate: {
            type: Date,
            default: Date.now
        },
        commentUser: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users'
        },
        commentLikes : [{
            likes:{
                type: Number
            },
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'users'
            }
        }]
    }],
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    postId: {
        type: String
    },
    date: {
        type: Date,
        default: Date.now
    },
    likes: [{
        likeUser: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users'
        }
    }]
});

const Post = mongoose.model('posts', PostSchema, 'posts')

module.exports = Post;