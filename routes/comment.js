const mongoose = require('mongoose');
// const Schema = mongoose.Schema;

const commentSchema = mongoose.Schema({
    text: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

//const Comment = mongoose.model('Comment', commentSchema);
module.exports = mongoose.model("comment", commentSchema);
//module.exports = Comment;
