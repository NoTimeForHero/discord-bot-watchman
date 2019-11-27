const fs = require('fs');
const Discord = require('discord.js');
const moment = require('moment');
const i18n = require('i18n');

const { version } = JSON.parse(fs.readFileSync('package.json'));
const settings = JSON.parse(fs.readFileSync('settings.json'));

const client = new Discord.Client();
const FakeI18N = require('./classes/fakei18n.js');
const Security = require('./classes/security.js');
const Commands = require('./classes/commands.js');
const Utils = require('./classes/utils.js');

moment.locale(settings.locale);
i18n.configure({ 
    locales:['en','ru'],
    defaultLocale: settings.locale,
    directory: __dirname + '/locales'
});

const botState = {
    startedAt: new Date()
}

const Container = {
    i18n,
    prefix: null,
    security: null,
    commandHandler: null,
    settings,
    botState,
    moment
};

function onReady() {
    console.log(`Logged in as ${client.user.tag} (${client.user.id})!`);
    //prefix = `<@${client.user.id}>`;
    Container.prefix = settings.prefix;
    Container.utils = Utils;    
    Container.security = new Security(settings.admins);
    Container.commandHandler = new Commands(Container);  
}
  
client.on('message', ev => Container.commandHandler.onCommand(ev));
client.on('ready', onReady);
client.login(settings.bot_token);