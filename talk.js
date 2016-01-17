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
    var allThreads = Talk.Threads.find().fetch()

    return _.filter(allThreads, function(thread) {
      return thread.messages().count() > 0
    })
  },
  send: function(options, callback) {
    console.log('send');
    Meteor.call("talk/send", options, callback);
  },
}
