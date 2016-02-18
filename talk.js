Talk = {
  Messages: Messages,
  Threads: Threads,
  thread: function(recipientId) {
    var thread = Threads.findOne({$or: [
      {user1Id: recipientId},
      {user2Id: recipientId}
    ]})

    if(thread)
      return thread

    var threadId = Meteor.call("talk/create-thread", recipientId);
  },
  threads: function() {

    var allThreads = Talk.Threads.find({}, {sort: {user1SeenAt: -1}}).fetch()

    return _.filter(allThreads, function(thread) {
      return thread.messages().count() > 0
    })
  },
  send: function(options, callback) {
    Meteor.call("talk/send", options, callback);
  },
  unreadMessageCount: function() {
    return _.reduce(Talk.threads(), function(sum, _thread) {
      var thread = Threads.findOne(_thread._id)
      return sum + thread.unreadCount()
    }, 0)
  }
}
