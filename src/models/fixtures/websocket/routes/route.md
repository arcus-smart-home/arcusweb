@typedef {Object} i2web/fixtures/route Route Handler
@parent app.fixtures

API endpoint that responds to incoming messages.

@option {String} address The address this route handles.
Each incoming message has its destination parsed to determine it's route address.
For example: A message with a destination of `SERV:person:123` has an address of
`SERV:person:` while a message with a destination of `SERV:person:` has an address of `SERV:person`.

@option {Function} * A method handler.

The remaining properties are methods the route can handle.
Each handler is passed the message's attributes and the id that was parsed from
the messages destination.
So a message that looks like this:
```
{
  type: 'person:doStuff',
  header: {
    destination: 'SERV:person:1234'
  },
  payload: {
    messageType: 'person:doStuff',
    attributes: {
      stuff: 'things'
    }
  }
}
```
Would result in the following being passed to the handler:
```
{
  stuff: 'things',
  id: 1234
}
```