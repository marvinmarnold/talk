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
  },
  send: function(options, callback) {
    Meteor.call("talk/send", options, callback);
  },
  messages: function() {
    return Messages.find()
  }
}
