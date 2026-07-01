const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const message = require('../models/Message');


async function send(req, res, next){
    try{
        const { text, type = 'text', attachmentUrl} = req.body;
        const conversationId = req.params.Id;

        const conversation = await Conversation.findOne({
            _Id: req.params.Id,
            members: req.user.id
        });

        if( !conversation){
            return res.status(404).json({message: "Conversation not found"});
        }

        const message = await Message.Create({
            conversationId,
            senderId: req.user.id,
            type,
            text: text || null,
            attachmentUrl: attachmentUrl || null,
            readBy: [req.user.id],
        });
        
        conversation.lastMessage = {text, senderId: req.user.id, sentAt: message.createdAt};
        conversation.updatedAt = new Date();
        await conversation.save();
        
        const { getIO} = require('../sockets');
        getIO().to(conversationId.toString()).emit('message:new', message);

        res.status(201).json(message);

    }catch(err){
        next(err);
    }
}



async function histroy(req,res,next){
   try{
    const conversationId = req.params.id;
    const {cursor, limit = 30} = req.query;

    const member = await Conversation.findOne({
        _id: conversationId,
        members: req.user.id
    });

    if(!member){
        return res.status(404).json({message: "Conversation not found"});
    }

    const query = { conversationId};
    if(cursor) query.createAt = {$lt: new Date(cursor)};

    const messages = await Message.find(query).sort({createdAt: -1}).limit(parseInt(limit));
    
    const nextCursor = message0length > 0 ? message[message.length -1]:null;
    res.json({mesage: message.reverse(), nextCursor });

   }catch(err){
    next(err);
   }
}


async function markread(req,res, next){
    try{
       await Message.findByIdAndUpdate(req.params.id, {
           $addToSet: { readBy: req.user.id}
       });
       res.status(200).json({message: "Message read successfully"});

    }catch(err){
        next(err);
    }
}

module.exports ={send, history, markRead};

