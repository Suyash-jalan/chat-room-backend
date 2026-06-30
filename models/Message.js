const mongoose = require("mongoose");

const messageSchema = mongoose.Schema({
    conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Conversation',
        required: true
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['text', 'image', 'system'],
        default: 'text'
    },
    text: {
        type: String,
        default: NULL
    },
    attachmentUrl: {
        type: String,
        default: NULL
    },
    readBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }], 
},{timestamps: {createdAt: true, updatedAt: false}});
    

module.exports = mongoose.model('Message', messageSchema);