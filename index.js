const fs = require('fs');
const Discord = require('discord.js');
const moment = require('moment');
const i18n = require('i18n');
const winston = require('winston');

const { version } = JSON.parse(fs.readFileSync('package.json'));
const settings = JSON.parse(fs.readFileSync('settings.json'));

const getLogger = (label) => {
    const loggerFormat = x => `[${moment(x.timestamp).format('YYYY.MM.DD HH:mm:ss:SSSS')}][${x.label}][${x.level}] ${x.message}`;
    const logger = winston.createLogger({
        level: settings.loglevel || 'info',
        format: winston.format.combine(
            winston.format.colorize({all: true}),
            winston.format.label({label}),
            winston.format.timestamp(),
            winston.format.printf(loggerFormat)
        ),
        transports: [
            new winston.transports.Console(),
        ],
    });
    return logger;
}

const logger = getLogger("main.js");
logger.info("Application has been started!");

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

const Container = {
    i18n,
    prefix: null,
    security: null,
    commandHandler: null,
    settings,
    admins: settings.admins,
    moment,
    loggerFactory: { getLogger }
};
Container.database = new Database(Container, settings);
Container.botState = {
    version,
    startedAt: new Date()
}

async function onReady() {
    logger.info(`Logged in as ${client.user.tag} (${client.user.id})!`);
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
        try {
            const servers = await Utils.getEnabledServers(Container.database, client);
            Object.values(servers).forEach(server => {
                logger.debug(`Updating online of server: ${server.name}`);
                Container.online.update(server, 60);
            });
            logger.info(`Updating online is finished!`);
        } catch (err) {
            logger.error(`Error occured during online update!`);
            logger.error(err.stack);
        }
    };
    setInterval(updateOnline, 60 * 1000);
    updateOnline();
}
  
client.on('message', ev => Container.commandHandler.onCommand(ev));
client.on('ready', onReady);

(async() => {
    await Container.database.connect();
    client.login(settings.discord.bot_token);
})();