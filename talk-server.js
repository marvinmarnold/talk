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
        user2Id: message.recipientId,
        user1SeenAt: new Date(),
        user2SeenAt: new Date(0)
      })
    }

    message.threadId = thread._id
    var res = Messages.insert(message)

    if(res) {
      var recipient = Meteor.users.findOne(options.recipientId)
      this.unblock()
      Email.send({
        from: 'SpaceCadet <do-not-reply@spacecadet.io>',
        to: recipient.emails[0].address,
        subject: "New message on SpaceCadet",
        text: "Greetings " + recipient.profile.firstName + "," +
              "\nThank you for being a part of the SpaceCadet Fleet, a message has been transmitted to your inbox." +
              " Please visit https://spacecadet.io/inbox to read and respond to this message." +

              "\n\nHappy Renting," +
              "\nThe Space Cadets"
      })
    }

    return res
  },
  'talk/create-thread': function(recipientId) {
    check(recipientId, String);

    if(Meteor.userId()) {
      return Threads.insert({
        user1Id: Meteor.userId(),
        user2Id: recipientId,
        user1SeenAt: new Date(),
        user2SeenAt: new Date(0)
      })
    }
  },
  'talk/seen': function(threadId) {
    check(threadId, String);
    var userId = Meteor.userId()
    if(!userId)
      throw new Meteor.Error('talk-not-logged-in', "Cannot send messages when not logged in.")

    var thread = Threads.findOne({
      _id: threadId,
      $or: [
        {user1Id: userId},
        {user2Id: userId}
      ]
    })

    if(!thread)
      throw new Meteor.Error('talk-unauthorized-access', "You do not have permission to do that.")

    var modifier

    if(thread.userIndex() === 1) {
      modifier = {user1SeenAt: new Date()}
    } else {
      modifier = {user2SeenAt: new Date()}
    }

    return Threads.update(thread._id, {$set: modifier})
  },
  'talk/seen-message': function(messageId) {
    check(messageId, String)
    var userId = Meteor.userId()
    if(!userId)
      throw new Meteor.Error('talk-not-logged-in', "Cannot send messages when not logged in.")

    var message = Messages.findOne(messageId)
    if(!message)
      throw new Meteor.Error('talk-unauthorized-access', "You do not have permission to do that.")

    var thread = Threads.findOne({
      _id: message.threadId,
      $or: [
        {user1Id: userId},
        {user2Id: userId}
      ]
    })

    if(!thread)
      throw new Meteor.Error('talk-unauthorized-access', "You do not have permission to do that.")

    var modifier

    if(thread.userIndex() === 1) {
      modifier = {user1SeenAt: new Date()}
    } else {
      modifier = {user2SeenAt: new Date()}
    }

    return Threads.update(thread._id, {$set: modifier})
  }
});

Meteor.publish("talk/messages", function(threadId) {
  check(threadId, String);

  var thread = Threads.findOne({$or: [
    {user1Id: this.userId},
    {user2Id: this.userId}
  ]})

  if(thread)
    return Messages.find({threadId: threadId}, {sort: {createdAt: -1}})

  this.ready()
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
