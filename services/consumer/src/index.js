#!/usr/bin/env node
var amqp = require('amqplib/callback_api');

// amqp.connect('amqp://broker', function(err, conn) {
//   conn.createChannel(function(err, ch) {
//     var q = 'hello';

//     ch.assertQueue(q, {durable: false});
//     console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", q);
//     ch.consume(q, function(msg) {
//       console.log(" [x] Received %s", msg.content.toString());
//     }, {noAck: true});
//   });
// });

(function(){
  'use strict';

  function connect ( )
  {
    amqp.connect('amqp://broker', function(err, conn) 
    { 
      if (!err)
      {
        console.log('Broker connection established');
        channelCreation( conn )
      }
      else
        setTimeout( ()=> { console.log('Retrying connect...'); connect(); }, 2000 )
    });

  };

  function channelCreation (connection)
  {
    connection.createChannel(function(err, ch) 
    {
      if (!err)
        console.log('Chanel created');

      var q = 'hello';

      ch.assertQueue(q, {durable: false});
      listenForMessages(connection, ch, q);
      
    });
  };

  function listenForMessages(connection, ch, q)
  {
    console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", q);
     ch.consume(q, function(msg) {
       console.log(" [x] Received %s", msg.content.toString());
     }, {noAck: true});
  };

  connect();

})();