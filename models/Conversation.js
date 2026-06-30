const mongoose = requie("mongoose");

const conversationschema = mongoose.Schema({
    type: {
        type: String,
        enum: ['direct', 'group'],
        required: true
    },
    name: {
        type: String,
        default: NULL
    },
    members:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    createBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    lastMessage:{
        text: String,
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        sentAt: {
            type: Date
        }
    },   
}, {timestamps: true});


module.exports = mongoose.model('Conversation', conversationschema);