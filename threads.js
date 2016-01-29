Threads = new Mongo.Collection("TalkThreads", {
  transform: function (doc) { return new Thread(doc); }
});

var Thread = function(doc) {
  _.extend(this, doc)
}

_.extend(Thread.prototype, {
  recipientId: function() {
    return this.user1Id === Meteor.userId() ? this.user2Id : this.user1Id
  },
  messages: function() {
    return Messages.find({threadId: this._id})
  },
  isEmpty: function() {
    return this.messages().count() === 0
  },
  recipientName: function() {
    var recipientId = this.recipientId()

    if(recipientId) {
      var recipient = Meteor.users.findOne(recipientId)
      if(recipient && recipient.profile)
        return recipient.profile.firstName + " " + recipient.profile.lastName
    }
  }
})
