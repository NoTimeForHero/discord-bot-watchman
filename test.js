const fs = require('fs');
const Discord = require('discord.js');
const client = new Discord.Client();
const settings = JSON.parse(fs.readFileSync('settings.json'));

const Utils = require('./classes/utils.js');
const Server = require('./classes/webserver.js');


const server = new Server(null, settings);
server.start();

/*
function onReady() {
    console.log(`Logged in as ${client.user.tag} (${client.user.id})!`);
}
  
client.on('message', ev => {    
    if (ev.author.id === client.user.id) return;
    console.log('message: ', ev.content);
    const users = Utils.findUsersByMessage(ev);
    const names = users.map(x => `<@${x}>`).join(' ');
    ev.channel.send('Finded users: ' + names);
});
client.on('ready', onReady);
client.login(settings.bot_token);
*/