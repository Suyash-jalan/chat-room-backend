const Conversation = require('../models/Conversation');

async function create(req, res, next) {
    try {
        const {type, memberIds, name} = req.body;
        const myId = req.user.id;
        
        if (type === 'direct') {
            if (!memberIds || memberIds.length !== 1) {
                return res.status(400).json({message: "Please provide valid memberId for direct conversation"});
            }

            const otherId = memberIds[0];
            const existing = await Conversation.findOne({
                type: 'direct',
                members: { $all: [myId, otherId], $size: 2 }
            }).populate('members', 'username email avatarUrl status lastSeen');

            if (existing) {
                return res.json(existing);
            }
        }

        if (type === 'group' && !name) {
            return res.status(400).json({message: "Please provide name for group conversation"});
        }

        const conversation = new Conversation({
            type,
            members: [...memberIds, myId],
            createdBy: myId,
            ...(name && {name})
        });

        await conversation.save();
        const populated = await Conversation.findById(conversation._id).populate('members', 'username email avatarUrl status lastSeen');

        const { getIO } = require('../sockets');
        try {
            const io = getIO();
            for (const member of populated.members) {
                const memberIdStr = member._id.toString();
                const memberSockets = await io.in(memberIdStr).fetchSockets();
                memberSockets.forEach(s => {
                    s.join(populated._id.toString());
                });
                io.to(memberIdStr).emit('conversation:new', populated);
            }
        } catch (e) {
            console.error("Socket room join failed for new conversation members:", e);
        }

        res.status(201).json(populated);
    } catch (err) {
        next(err);
    }
}

async function list(req, res, next) {
    try {
        const conversations = await Conversation.find({ members: req.user.id })
            .sort({ updatedAt: -1 })
            .populate('members', 'username email avatarUrl status lastSeen');
        res.json(conversations);
    } catch (err) {
        next(err);
    }
}

async function getOne(req, res, next) {
    try {
        const conversation = await Conversation.findOne({
            _id: req.params.id,
            members: req.user.id
        }).populate('members', 'username email avatarUrl status lastSeen');
        if (!conversation) return res.status(404).json({message: "Conversation not found"});
        
        res.json(conversation);
    } catch (err) {
        next(err);
    }
}

async function addmember(req, res, next) {
    try {
        const {userId} = req.body;

        const conversation = await Conversation.findOneAndUpdate(
           { _id: req.params.id, type: 'group', members: req.user.id },
           { $addToSet: { members: userId } },
           { new: true }
        ).populate('members', 'username email avatarUrl status lastSeen');
        if (!conversation) return res.status(404).json({message: "Conversation not found"});
        
        res.status(200).json(conversation);
    } catch (err) {
        next(err);
    }
}

module.exports = {create, list, getOne, addmember};
