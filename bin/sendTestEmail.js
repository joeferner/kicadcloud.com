#!/usr/bin/env node

'use strict';

var optimist = require('optimist');
var email = require('email');

var args = optimist
  .alias('h', 'help')
  .alias('h', '?')
  .options('address', {
    alias: 'a',
    describe: 'Email address to send to.'
  })
  .argv;

if (args.help) {
  optimist.showHelp();
  return process.exit(-1);
}

var msg = new email.Email(
  {
    from: "support@kicadcloud.com",
    to: args.address,
    subject: "Test Email",
    body: "This is a test email from sendTestEmail.js"
  });
msg.send(function(err) {
  if (err) {
    return console.error("Could not send email", err);
  }
  return console.log("email sent");
});

