Meteor.methods({
  'talk/send': function(options) {
    console.log('talk/send');
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
  },
  'talk/create-thread': function(recipientId) {
    check(recipientId, String);

    if(Meteor.userId())
      return Threads.insert({user1Id: Meteor.userId(), user2Id: recipientId})
  }
});

Meteor.publish("talk/messages", function(threadId) {
  console.log(threadId);
  check(threadId, String);

  var thread = Threads.findOne({$or: [
    {user1Id: this.userId},
    {user2Id: this.userId}
  ]})

  if(thread)
    return Messages.find({threadId: threadId}, {sort: {createdAt: -1}})
});

Meteor.publish("talk/all-messages", function() {
  return Messages.find({$or: [
    {senderId: this.userId},
    {recipientId: this.userId}
  ]}, {sort: {createdAt: -1}})
});

Meteor.publish("talk/threads", function() {
  return Threads.find({$or: [
    {user1Id: this.userId},
    {user2Id: this.userId}
  ]})
});
