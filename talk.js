Messages = new Mongo.Collection("TalkMessages", {
  transform: function (doc) { return new Message(doc); }
});

var Message = function(doc) {
  _.extend(this, doc)
}

_.extend(Message.prototype, {
  isSender: function() {
    return this.senderId === Meteor.userId()
  },
  isRecipient: function() {
    return this.recipientId === Meteor.userId()
  },
  isText: function() {
    return !!this.body
  },
  isAttachment: function() {
    return !!this.attachmentUrl
  }
})

Talk = {
  send: function(options, callback) {
    Meteor.call("talk/send", options, callback);
  },
  messages: function() {
    return Messages.find()
  }
}

if(Meteor.isServer) {
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
      return Messages.insert(message)
    }
  });

  Meteor.publish("talk/messages", function() {
    return Messages.find({$or: [
      {senderId: this.userId},
      {recipientId: this.userId}
    ]})
  });
}
