const Discord = require("discord.js");
const fs = require("fs");

const client = new Discord.Client();

const botKey = "ODg3MTg4NzUyODIzMzY1NjQz.YUAg6Q.VyS21BvgNti6wr80FNzMOx0PJvs";

const prefix = "-";

client.commands = new Discord.Collection();

const commandFiles = fs
  .readdirSync(__dirname + "/commands/")
  .filter((file) => file.endsWith(".js"));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

client.on("ready", () => {
  console.log("Bot is Online");
});

client.on("message", (message) => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;
  const args = message.content.slice(prefix.length).split(/ +/);
  const command = args.shift().toLowerCase();
  const username = "<@!" + message.author.id + ">";
  console.log(username);

  if (command === "reply") {
    client.commands.get("reply").execute(message, args);
  }
});

exports.sendMessage = (data) => {
  //Grab Discord Server from ID
  let guild = client.guilds.cache.get("760663437079871560");
  //Fetch All Server Users
  let users = guild.members
    .fetch()
    .then((user) => {
      //Split the Data we Passed in by '#'
      let terms = data.refundertag.split(/(?=#)/g);
      //Find the User based on the split tag
      let result = user.find(
        (guild) => guild.user.username === terms[0],
        (guild) => guild.user.discriminator === terms[1]
      );
      //If that user exists then send a DM
      if (result) {
        client.users.cache.get(result.user.id).send({
          embed: {
            color: 3447003,
            author: {
              name: "UKR Bot",
            },
            title: "Ticket: " + data.ticketnum,
            url:
              "https://ukrefunds.io/panel/order_details.php?key=" +
              data.ticketnum,
            description:
              "Hey! Heads up, you've received a new message for this ticket. Please reply ASAP. \n",
            fields: [
              {
                name: "Message Contents",
                value: data.messagecontent,
              },
            ],
            timestamp: new Date(),
          },
        });
        console.log(
          "Ticket Message Received. DM Sent to User: " + data.refundertag
        );
      } else {
        //If User not in the server then send an alert.
        let channel = guild.channels.cache.get("685592282057015427");
        channel.send(
          "Tried Notifying " + data + " but user is not on this server!"
        );
      }
    })
    .catch(console.error);
};

exports.login = () => {
  client.login(botKey);
};
