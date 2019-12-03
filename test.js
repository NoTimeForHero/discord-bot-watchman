const fs = require('fs');
const Discord = require('discord.js');
const client = new Discord.Client();
const settings = JSON.parse(fs.readFileSync('settings.json'));
const moment = require('moment');

const Database = require('./classes/database.js');
const Utils = require('./classes/utils.js');
const WebServer = require('./classes/webserver.js');
const Online = require('./classes/online.js');

const database = new Database(settings);
const Container = {
    database,
    settings,
    moment
};

/*
*/

async function onReady() {
    console.log(`Logged in as ${client.user.tag} (${client.user.id})!`);
    //console.log('Attached guilds: ' + guilds.map(x => `"${x.name}"`).join(', '));
    //console.log(guilds.map(x => ({[`${x.name}`]: `${x.id}`})));

    //const guilds = [...client.guilds.values()];
    //console.log(guilds.map(x => ({[`${x.name}`]: `${x.id}`})));
    
    await database.connect();

    const server = client.guilds.get(settings.debug.server);
    const online = new Online(Container);

    const data = await online.get(server);
    console.log(data);
    //online.update(server, 600);
}
  
client.on('message', ev => {    
    if (ev.author.id === client.user.id) return;
    console.log('message: ', ev.content);
    const username = ev.member && ev.member.nickname ? `${ev.member.nickname} (${ev.author.username})` : ev.author.username;
    const msg = `Name: ${username}`;
    ev.channel.send(msg);
});


client.on('ready', onReady);
client.login(settings.discord.bot_token);