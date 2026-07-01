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

async function list(req,res, next) {
    try{
        const conversation = await conversation.find({member: req.user.Id}).sort({update: -1});
        res.json(conversation);
    }catch(err){
        next(err);
    }
}

async function getOne(req, res, next) {
    try{
        const conversation = await conversation.findOne({
            _id : req.params.id,
            member: req.user.id
        }).populate('members', 'user avatarUrl status');
        if(!conversation) return res.status(404).json({message: "Conversation not found"});
        
        res.json(conversation);

    }catch(err){
        next(err);
    }
}

async function addmember(req, res, next){
    try{
        const {userId} = req.body;

        const conversation = await conversation.findOneAndUpdate(
           {_id: req.params.Id, type: 'group', members: req.user.id},
           { $addToSet: { members: userId } },
           {new: true}
        )
        if(!conversation) return res.status(404).json({message: "Conversation not found"});
        
        req.status(200).json({added: true});
        
    }catch(err){
        next(err);
    }
}

module.exports = {create, list, getOne, addmember};

