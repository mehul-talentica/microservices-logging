"use strict";
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const amqp = require('amqplib/callback_api');

const SERVER_PORT = process.env.SERVER_PORT || 8082;
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
    secret: 'Why the heck do I need a secret key here.',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000}
  })
);

amqp.connect('amqp://localhost', function(err, conn) {
  conn.createChannel(function(err, ch) {
    const q = 'rpc_logger';
    ch.assertQueue(q, {durable: true});
    ch.prefetch(1);
    console.log('Logger Server 1 awaiting RPC requests');
    ch.consume(q, function (msg) {
      console.log(msg.content.toString())
      ch.ack(msg);
    });
  });
});

app.listen(SERVER_PORT, () => {
    console.log("Logger Microservice started listening on port", SERVER_PORT);
});
