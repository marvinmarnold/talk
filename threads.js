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
    return Messages.find({threadId: this._id}, {sort: {createdAt: 1}})
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
  },
  recipientFirstName: function() {
    var recipientId = this.recipientId()

    if(recipientId) {
      var recipient = Meteor.users.findOne(recipientId)
      if(recipient && recipient.profile)
        return recipient.profile.firstName
    }
  },
  unreadCount: function() {
    var selector

    if(this.userIndex() === 1) {
      selector = {createdAt: {$gt: this.user1SeenAt}}
    } else {
      selector = {createdAt: {$gt: this.user2SeenAt}}
    }

    _.extend(selector, {threadId: this._id, recipientId: Meteor.userId()})
    return Messages.find(selector).count()
  },
  prettyUnreadCount: function() {
    return (this.unreadCount() === 0) ? "" : " ( " + this.unreadCount() + " )"
  }
})
