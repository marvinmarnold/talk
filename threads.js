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
})
