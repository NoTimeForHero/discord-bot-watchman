const { TextChannel } = require('discord.js');
const { AccessDenied } = require('./errors.js');

class Commands {

    constructor(container) {
        this.i18n = container.i18n;
        this.prefix = container.prefix;
        this.security = container.security;
        this.utils = container.utils;
        this.botState = container.botState;
        this.moment = container.moment;
        this.database = container.database;

        this.methods = {
            'help': {
                'allowed_in_PM': true,
                'function': this.help
            },            
            'uptime': {
                'allowed_in_PM': true,
                'function': this.uptime
            },
            /*
            'refresh': {
                ['function'](ev) {
                    ev.reply(this.i18n.__('under_construction'))
                }
            },
            */
            'trusted': {
                'subcommands': ['add', 'del', 'list'],
                'function': this.trusted
            },
            'server': {
                'subcommands': ['enable', 'disable'],
                'function': this.toggleServer
            }
        }
    }

    async onCommand(ev) {
        let msg = ev.content;        
        const args = msg.split(/\W/);
        if (args.length < 2) return;
        if (args[0] !== this.prefix) return;        
        const command = args.splice(0, 2)[1];
        if (!command) return;
        if (!this.methods[command]) {
            ev.reply(this.i18n.__('unknown_command', command));  
            return;
        }
        const objCommand = this.methods[command];        
        if (!(ev.channel instanceof TextChannel) && !objCommand.allowed_in_PM) {
            ev.reply(this.i18n.__('command_denied_in_pm', command));
            return;
        }
        try {
            await objCommand.function.apply(this, [ev, ...args]);
        } catch (ex) {
            if (ex instanceof AccessDenied) return;
            console.warn(`Error occured during running command "${command}":`)
            console.warn(ex);
        }
    }

    async __checkPermissions(ev, subcommand=null, allowedSubcommands = []) {
        if (allowedSubcommands.includes(subcommand)) return Promise.resolve();
        const isTrusted = await this.security.isTrusted(ev.channel.guild.id, ev.author.id);
        if (!isTrusted) {
            ev.reply(this.i18n.__('unauthorized_user'));
            return Promise.reject(new AccessDenied());
        }
        return Promise.resolve();
    }

    __getUsers(ev, callback) {
        const ids = this.utils.findUsersByMessage(ev);
        if (ids.length < 1) {
            ev.reply(this.i18n.__('argument_error_no_users'));                        
            return;
        }
        const names = ids.map(x => `<@${x}>`).join(', ');            
        callback(ids, names);
    }

    uptime(ev) {
        const date = this.moment(this.botState.startedAt).fromNow();
        ev.reply(this.i18n.__('uptime_message', date));
    }

    help(ev) {
        const isAllowedInPm = ([_, options]) => {
            if (ev.channel instanceof TextChannel) return true;
            return options.allowed_in_PM;
        }
        const methods = Object.entries(this.methods).filter(isAllowedInPm);
        const tabs = ' '.repeat(4);
        let message = methods.reduce((arr, [command, details], i)=>{
            const description = this.i18n.__(`command_description_${command}`);
            arr += `${++i}. ${command} - ${description}\n`;
            if (!details.subcommands) return arr;
            arr += details.subcommands.reduce((arr, subcommand) => {
                const description = this.i18n.__(`command_description_${command}_${subcommand}`);
                arr += `${tabs}${subcommand} - ${description}\n`;
                return arr;
            }, "");
            return arr;
        }, "\n");
        ev.reply(message);
    }

    async toggleServer(ev, action) {
        await this.__checkPermissions(ev);
        const server = ev.channel.guild.id;
        let isEnabled = false;

        switch (action) {
            case 'enable':
                isEnabled = true;
                ev.reply(this.i18n.__('server_enabled'));
                break;
            case 'disable':
                isEnabled = false;
                ev.reply(this.i18n.__('server_disabled'));
                break;
            default:
                ev.reply(this.i18n.__('unknown_subcommand', action));                        
                return;
        }
        await this.database.setServer(server, isEnabled);
    }

    async trusted(ev, action) {
        await this.__checkPermissions(ev, action, ['list']);
        const groupName = this.i18n.__('user_group_trusted');

        switch (action) {
            case 'add':
                this.__getUsers(ev, (ids, names) => {
                    this.security.addUsers(ev.channel.guild.id, ids);            
                    ev.reply(this.i18n.__('users_added', names, {groupName}));                        
                })
                return;
            case 'del':
                this.__getUsers(ev, (ids, names) => {
                    this.security.delUsers(ev.channel.guild.id, ids);
                    ev.reply(this.i18n.__('users_removed', names, {groupName}));                        
                });
                return;
            case 'list':
                let list = await this.security.listUsers(ev.channel.guild.id);
                const names = list.map(id => `<@${id}>`).join(', ');
                ev.reply(this.i18n.__('users_list', names, {groupName}));                        
                return;
            default:
                ev.reply(this.i18n.__('unknown_subcommand', action));                        
                return;
        }
    }
}

module.exports = Commands;