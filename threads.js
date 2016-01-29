Threads = new Mongo.Collection("TalkThreads", {
  transform: function (doc) { return new Thread(doc); }
});

var Thread = function(doc) {
  _.extend(this, doc)
}

_.extend(Thread.prototype, {
  recipientId: function() {
    return (this.userIndex() === 1) ? this.user2Id : this.user1Id
  },
  userIndex: function() {
    return (this.user1Id === Meteor.userId()) ? 1 : 2
  },
  messages: function() {
    return Messages.find({threadId: this._id})
  },
  isEmpty: function() {
    console.log(this.messages().count());
    return this.messages().count() === 0
  },
  recipientName: function() {
    var recipientId = this.recipientId()

    if(recipientId) {
      var recipient = Meteor.users.findOne(recipientId)
      if(recipient && recipient.profile)
        return recipient.profile.firstName + " " + recipient.profile.lastName
    }
  },
  unreadCount: function() {
    var selector

    if(this.userIndex() === 1) {
      selector = {createdAt: {$gt: this.user1SeenAt}}
    } else {
      selector = {createdAt: {$gt: this.user2SeenAt}}
    }

    _.extend(selector, {threadId: this._id})
    return Messages.find(selector).count()
  }
})
