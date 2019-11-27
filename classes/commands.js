class Commands {

    constructor(container) {
        this.i18n = container.i18n;
        this.prefix = container.prefix;
        this.security = container.security;
        this.utils = container.utils;
        this.botState = container.botState;
        this.moment = container.moment;

        this.methods = {
            'help': { 'function': this.help },            
            'uptime': {'function': this.uptime},
            'trusted': {
                'subcommands': ['add', 'del', 'list'],
                'function': this.trusted
            }
        }
    }

    onCommand(ev) {
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
        this.methods[command].function.apply(this, [ev, ...args]);
    }

    uptime(ev) {
        const date = this.moment(this.botState.startedAt).fromNow();
        ev.reply(this.i18n.__('uptime_message', date));
    }

    help(ev) {
        const methods = Object.entries(this.methods);        
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

    trusted(ev, action) {
        if (!this.security.isTrusted(ev.author)) {
            ev.reply(this.i18n.__('unauthorized_user'));
            return;            
        }        

        const withUsers = (ev, callback) => {
            const ids = this.utils.findUsersByMessage(ev);
            if (ids.length < 1) {
                ev.reply(this.i18n.__('argument_error_no_users'));                        
                return;
            }
            const names = ids.map(x => `<@${x}>`).join(', ');            
            callback(ids, names);
        }

        switch (action) {
            case 'add':
                withUsers(ev, (ids, names) => {
                    this.security.addUsers(ids);            
                    ev.reply(this.i18n.__('users_added_to_trusted', names));                        
                })
                return;
            case 'del':
                withUsers(ev, (ids, names) => {
                    this.security.delUsers(ids);
                    ev.reply(this.i18n.__('users_removed_from_trusted', names));                        
                });
                return;
            case 'list':
                const list = this.security.listUsers().map(id => `<@${id}>`).join(', ');
                ev.reply(this.i18n.__('trusted_list', list));                        
                return;
            default:
                ev.reply(this.i18n.__('unknown_subcommand', action));                        
                return;
        }
    }

    setChannel(ev) {                    
        if (!this.security.isTrusted(ev.author)) {
            ev.reply(this.i18n.__('unauthorized_user'));
            return;            
        }        

        ev.reply(this.i18n.__('notification_channel_set'));
    }
}

module.exports = Commands;