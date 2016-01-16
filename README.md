# Usage

## Sending messages
````
var options = {
  recipientId: STRING,
  body: STRING,                   // Content of message to send (optional)
  attachmentUrl: STRING,          // URL where a file can be found
  attachmentName: STRING,         // Name of attached file
}

Talk.send(options)
````

## Allow update/delte
By default, you may only send messages. To allow users to update/delete, modify your settings.json:

````
{
  TALK_ALLOW_UPDATE: true,
  TALK_ALLOW_REMOVE: true
}
````
