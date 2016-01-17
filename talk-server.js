Meteor.methods({
  'talk/send': function(options) {
    if(!Meteor.userId())
      throw new Meteor.Error('talk-not-logged-in', "Cannot send messages when not logged in.")

    check(options, {
      recipientId: String,
      body: Match.Optional(String),
      attachmentUrl: Match.Optional(String),
      attachmentName: Match.Optional(String),
    })

    var message = {
      recipientId: options.recipientId,
      senderId: Meteor.userId()
    }

    if(options.attachmentName || options.attachmentUrl) {
      if(!options.attachmentName || !options.attachmentUrl) {
        throw new Meteor.Error('talk-incomplete-attachment', "Attachment name and URL must both be provided or must both be undefined.")
      } else {
        message.attachmentName = options.attachmentName
        message.attachmentUrl = options.attachmentUrl
      }
    }

    if(!Meteor.users.findOne(options.recipientId))
      throw new Meteor.Error('talk-invalid-recipient', "The user you are trying to send to does not exist.")

    if(options.body)
      message.body = options.body

    message.createdAt = new Date()

    var thread = Threads.findOne({$or: [
      {$and: [
        {user1Id: Meteor.userId()},
        {user2Id: message.recipientId}
      ]},
      {$and: [
        {user2Id: Meteor.userId()},
        {user1Id: message.recipientId}
      ]}
    ]})

    if(!thread) {
      thread = Threads.insert({
        user1Id: Meteor.userId(),
        user2Id: message.recipientId
      })
    }

    message.threadId = thread._id
    return Messages.insert(message)
  }
});

Meteor.publish("talk/messages", function(threadId) {
  check(threadId, String);

  var thread = Threads.find({$or: [
    {user1Id: this.userId},
    {user2Id: this.userId}
  ]})

  if(thread)
    return Messages.find({threadId: threadId})
});

Meteor.publish("talk/threads", function() {
  return Threads.find({$or: [
    {user1Id: this.userId},
    {user2Id: this.userId}
  ]})
});
