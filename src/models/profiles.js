const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
    job:{
        type: String
    },
    school: {
        type: String
    },
    location: {
        type: String
    },
    home: {
        type: String
    },
    goals: {
        type: String
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    following: [{
        followedUser: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users'
        }
    }]
});

const Profile = mongoose.model('profiles', ProfileSchema, 'profiles')

module.exports = Profile;