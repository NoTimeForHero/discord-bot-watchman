const fs = require('fs');
const Discord = require('discord.js');
const moment = require('moment');
const i18n = require('i18n');

const { version } = JSON.parse(fs.readFileSync('package.json'));
const settings = JSON.parse(fs.readFileSync('settings.json'));

const client = new Discord.Client();
const Security = require('./classes/security.js');
const Commands = require('./classes/commands.js');
const Database = require('./classes/database.js');
const Utils = require('./classes/utils.js');
const WebServer = require('./classes/webserver.js');
const Online = require('./classes/online.js');

moment.locale(settings.locale);
i18n.configure({ 
    locales:['en','ru'],
    defaultLocale: settings.locale,
    directory: __dirname + '/locales'
});

const database = new Database(settings.mongodb);
const botState = {
    startedAt: new Date()
}

const Container = {
    i18n,
    prefix: null,
    security: null,
    commandHandler: null,
    database,
    settings,
    botState,
    admins: settings.admins,
    moment
};

async function onReady() {
    console.log(`Logged in as ${client.user.tag} (${client.user.id})!`);
    //prefix = `<@${client.user.id}>`;
    Container.discord = client;    
    Container.prefix = settings.prefix;
    Container.utils = Utils;    
    Container.security = new Security(Container);
    Container.commandHandler = new Commands(Container);  
    Container.online = new Online(Container);
    Container.webserver = new WebServer(Container, settings);

    Container.webserver.start();

    const updateOnline = async() =>{
        const servers = await Utils.getEnabledServers(database, client);
        Object.values(servers).forEach(server => {
            console.log(`Updating online of server: ${server.name}`);
            Container.online.update(server, 60);
        });
        console.log(`Updating online is finished!`);
    };
    setInterval(updateOnline, 60 * 1000);
    updateOnline();

}
  
client.on('message', ev => Container.commandHandler.onCommand(ev));
client.on('ready', onReady);

(async() => {
    await database.connect();
    client.login(settings.discord.bot_token);
})();