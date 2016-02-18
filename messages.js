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
  yourName: function() {
    if(this.senderId === Meteor.userId())
      return "You"
  },
  otherName: function() {
    // only display the name of the sender
    if(!(this.senderId === Meteor.userId())) {
      var user = Meteor.users.findOne(this.senderId)

      if(user && user.profile)
        return user.profile.firstName + " " + user.profile.lastName
    }
  },
  otherFirstName: function() {
    // only display the name of the sender
    if(!(this.senderId === Meteor.userId())) {
      var user = Meteor.users.findOne(this.senderId)

      if(user && user.profile)
        return user.profile.firstName
    }
  },
  isRecipient: function() {
    return this.recipientId === Meteor.userId()
  },
  isText: function() {
    return !!this.body
  },
  isAttachment: function() {
    return !!this.attachmentUrl
  },
})
