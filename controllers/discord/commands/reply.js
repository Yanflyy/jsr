const test = require('../../../server');

module.exports = {
  name: 'reply',
  description: 'Reply to Ticket',
  execute(message, args) {
    if (args.length < 2) {
      message.channel.send('Insufficient Arguments');
      return;
    } else {
      let reply = [];
      let ticketnum = args[0];
      args.forEach((element) => {
        reply.push(element);
      });
      reply.shift();
      console.log(reply);
    }
  },
};

exports.test = test;
