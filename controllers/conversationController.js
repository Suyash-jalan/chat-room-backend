const Conversation = require('../models/Conversation');

async function create(req, res, next) {
    const {type, memberIds, name} = req.body;
    const myId = req.user.Id;
    
    if(type == 'direct'){
       if(!memberIds || ! memberIds.length !== 1){
        return res.status(400).json({message: "Please provide valid memberId for direct conversation"});
       }

       const existing  = await Conversation.findOne({
        type: 'direct',
        members: [myId, memberIds[0]]
       });

       if(existing){
        return res.status(400).json({message: "Conversation already exists"});
       }
    }

    if(type == 'group' && !name){
       return res.status(400).json({message: "Please provide name for group conversation"});
    }

    const conversation = new Conversation({
        type,
        members: [...memberIds, myId],
        createdBy: myId,
        ...(name && {name})
    });

    
}