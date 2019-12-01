const fs = require('fs');
const Discord = require('discord.js');
const client = new Discord.Client();
const settings = JSON.parse(fs.readFileSync('settings.json'));

const Utils = require('./classes/utils.js');
const Server = require('./classes/webserver.js');


let getUsers;

const server = new Server(null, settings);
server.start();

const app = server.app;
app.get('/online.json', (_, res) => res.send(getUsers()));

function onReady() {
    console.log(`Logged in as ${client.user.tag} (${client.user.id})!`);

    const guilds = [...client.guilds.values()];
    console.log(guilds.map(x => ({[`${x.name}`]: `${x.id}`})));
    //console.log('Attached guilds: ' + guilds.map(x => `"${x.name}"`).join(', '));

    //console.log(guilds.map(x => ({[`${x.name}`]: `${x.id}`})));
    const server = client.guilds.get(settings.debug.server);
    console.log('Getting server: ' + server.name);


    getUsers = () => {
        const getRoles = (roles) => [...roles.values()].map(({id, name, hexColor}) => ({id, name, hexColor}));
        let users = [...server.members.values()];
        users = users.reduce((arr, el)=>{
            arr.push({
                name: el.displayName,
                avatar: el.user.displayAvatarURL,
                color: el.displayHexColor,
                /*
                online: el.presence.status !== 'offline',
                voice: el.voiceChannel ? el.voiceChannel.name : undefined,
                */
                online: new Date(),
                voice: {
                    name: 'AFK',
                    date: new Date()
                },           
                roles: getRoles(el.roles)
            });
            return arr;
        }, []);

        return {
            server: {
                name: server.name
            },
            users
        };
    }
    //data.forEach(x => console.log(x.name, x.roles));
    //console.log(server);
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