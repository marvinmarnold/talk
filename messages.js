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
