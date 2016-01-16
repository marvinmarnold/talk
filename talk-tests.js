// Write your tests here!
// Here is an example.
Tinytest.add('Loaded', function (test) {
  test.isNotUndefined(Talk)
});

Tinytest.addAsync('send', function(test, done) {
  var user1Id

  Talk.send({
    body: "Hi"
  }, function(error, messageId) {
    test.isNotUndefined(error, "Should not be able to send messages when logged out")

    testLogin(test, function() {
      user1Id = Meteor.userId()
      resendAfterLogin()
    })
  })

  function resendAfterLogin() {
    Talk.send({
      body: "Hi"
    }, function(error, messageId) {
      test.isNotUndefined(error, "Recipient ID should be required")

      resendWRecipient()
    })
  }

  function resendWRecipient() {
    Talk.send({
      body: "Hi",
      recipientId: "1234"
    }, function(error, messageId) {
      test.isNotUndefined(error, "Recipient should exist")

      resendSuccess()
    })
  }

  function resendSuccess() {
    testLogout(test, function() {
      testLogin(test, function() {
        Talk.send({
          body: "Hi",
          recipientId: user1Id
        }, function(error, messageId) {
          test.isUndefined(error, "Should be able to send a regular message")
          test.equal(typeof messageId, "string")

          done()
        })
      })
    })
  }
})

testLogin = function(test, callback) {
  console.log('testLogintestLogin');
  let email = 'testuser-' + Random.id() + "@example.com"
  let userId = Accounts.createUser({
    email: email,
    password: 'traphouse'
  }, function(error) {
    test.isUndefined(error, 'Unexpected error logging in as user');
    callback(error, email);
  });
}

testLogout = function(test, callback) {
  Meteor.logout(function(error){
    test.isUndefined(error, 'Unexpected error logging out as user');
    test.isNull(Meteor.userId(), 'User ID is not undefined after logout');
    callback(error)
  });
}
