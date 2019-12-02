const fs = require('fs');
const Discord = require('discord.js');
const client = new Discord.Client();
const settings = JSON.parse(fs.readFileSync('settings.json'));
const moment = require('moment');

const Database = require('./classes/database.js');
const Utils = require('./classes/utils.js');
const Server = require('./classes/webserver.js');
const Online = require('./classes/online.js');

const database = new Database(settings.mongodb);
const Container = {
    database,
    settings,
    moment
};

/*
let getUsers;
const server = new Server(null, settings);
server.start();
const app = server.app;
app.get('/online.json', (_, res) => res.send(getUsers()));
*/

async function onReady() {
    console.log(`Logged in as ${client.user.tag} (${client.user.id})!`);
    //console.log('Attached guilds: ' + guilds.map(x => `"${x.name}"`).join(', '));
    //console.log(guilds.map(x => ({[`${x.name}`]: `${x.id}`})));

    const guilds = [...client.guilds.values()];
    console.log(guilds.map(x => ({[`${x.name}`]: `${x.id}`})));
 
    const server = client.guilds.get(settings.debug.server);
    console.log('Getting server: ' + server.name);

    await database.connect();

    const online = new Online(Container);
    online.update(server, 60);

    getData = () => {
        const getRoles = (roles) => [...roles.values()].map(({id, name, hexColor}) => ({id, name, hexColor}));
        let users = [...server.members.values()].map(el=>{
            return {
                name: el.displayName,
                joinedAt: el.joinedAt,
                avatar: el.user.displayAvatarURL,
                color: el.displayHexColor,
                 roles: getRoles(el.roles)
            };
        });
        return { server: { name: server.name }, users };
    }
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