'use strict'

const SPSP = require('ilp').SPSP;
const config = require('../config/config');
const FiveBellsLedgerPlugin = require('ilp-plugin-bells');

async function send(sender, senderPass, amount, receiver, message = "") {
  const plugin = new FiveBellsLedgerPlugin({
    account: config.payment.url + sender,
    password: senderPass
  })

  await plugin.connect();
  console.log('connected');

  var quote = await SPSP.quote(plugin, {
    receiver: receiver + config.payment.address,
    sourceAmount: amount
  });

  quote.headers = {
    'Source-Identifier': sender + config.payment.address,
    'Message': message
  }

  console.log("Payment quote is ready");

  return SPSP.sendPayment(plugin, quote);
}

module.exports = send;