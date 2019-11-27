const fs = require('fs');
const Discord = require('discord.js');
const client = new Discord.Client();
const settings = JSON.parse(fs.readFileSync('settings.json'));
const utils = require('./classes/utils.js');

function onReady() {
    console.log(`Logged in as ${client.user.tag} (${client.user.id})!`);
}
  
client.on('message', ev => {    
    if (ev.author.id === client.user.id) return;
    console.log('message: ', ev.content);
    const users = utils.findUsersByMessage(ev);
    const names = users.map(x => `<@${x}>`).join(' ');
    ev.channel.send('Finded users: ' + names);
});
client.on('ready', onReady);
client.login(settings.bot_token);