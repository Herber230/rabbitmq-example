var amqp = require('amqplib/callback_api');
// var express = require('express');
// var bodyParser = require('body-parser');

// //CONFIGURATIONS
// var port = 3000;


(function()
{

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
      sendMessages(connection, ch, q);
      
    });
  };

  function sendMessages(connection, chanel, q)
  {
    var cont = 0;
    var limit = 20;
    var msg = 'Hello broker';

    var send = ()=>
    {
      chanel.sendToQueue(q, new Buffer(msg));
      console.log(" [x] Sent %s", msg);
      cont++;
    }
    
    var finish = () =>
    {
      connection.close();
      console.log('Broker connection closed');
      process.exit(0);
    }

    var iterate = () =>
    {
      if (cont < limit)
      {
        send();
        setTimeout( () => { iterate() }, 1000);
      }
      else
        finish();
    }

    iterate();
    
  };

  connect();

})();







