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

function onReady() {
    console.log(`Logged in as ${client.user.tag} (${client.user.id})!`);
    //prefix = `<@${client.user.id}>`;
    Container.prefix = settings.prefix;
    Container.utils = Utils;    
    Container.security = new Security(Container);
    Container.commandHandler = new Commands(Container);  
}
  
client.on('message', ev => Container.commandHandler.onCommand(ev));
client.on('ready', onReady);

(async() => {
    await database.connect();
    client.login(settings.bot_token);
})();