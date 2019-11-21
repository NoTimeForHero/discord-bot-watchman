class Commands {

    constructor(container) {
        this.i18n = container.i18n;
        this.prefix = container.prefix;
        this.security = container.security;

        const forbidden = ['constructor', 'onCommand'];
        this.methods = Object.getOwnPropertyNames(Commands.prototype)
            .filter(x => !forbidden.includes(x))
            .reduce((obj, name) => {
                obj[name] = this[name];
                return obj;
            }, {});
    }

    onCommand(ev) {
        let msg = ev.content;        
        if (!msg.startsWith(this.prefix)) return;
        msg = msg.split(/\W/)[1].trim();

        let command = this.methods[msg];
        if (!command) command = this.defaultCommand;
        command.call(this, ev);
    }

    defaultCommand(ev) {
        ev.reply(this.i18n.__('unknown_command'));  
    }

    addTrustedUsers(ev) {
        if (!this.security.isTrusted(ev.author)) {
            ev.reply(this.i18n.__('unauthorized_user'));
            return;            
        }        

        const regMention = /<@(\d+)>/g;
        const users = Array.from(ev.content.matchAll(regMention));
        const ids = users.map(x => x[1]);
        const names = users.map(x => x[0]).join(', ');

        this.security.addUsers(ids);            
        ev.reply(this.i18n.__('users_added_to_trusted', names));        
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