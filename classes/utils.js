const Utils = {

    getServerInfo(server) {
        const getRoles = (roles) => [...roles.values()].map(({id, name, hexColor}) => ({id, name, hexColor}));
        let users = [...server.members.values()].map(el=>{
            return {
                id: el.id,
                name: el.displayName,
                joinedAt: el.joinedAt,
                avatar: el.user.displayAvatarURL,
                color: el.displayHexColor,
                roles: getRoles(el.roles)
            };
        });
        return {
            server: {
                name: server.name,
                roles: getRoles(server.roles)
            },
            users
        };        
    },

    async getEnabledServers(database, client) {
        const serverIds = await database.Server.find({isEnabled: true}).then(srv => srv.map(item => item.server));
        return serverIds.map(id => client.guilds.get(id)).filter(x => !!x).reduce((arr, el)=> {arr[el.id] = el; return arr;}, {});
    },

    findMentionTokens(msg) {
        const regex = /(?:<@&?(\d+)>|@here|@everyone)/g;
        let match = msg.match(regex);
        return match ? [...match] : [];
    },

    findUsersByMessage(ev) {
        const findUsers = ev => {
            const regExMention = /<@(\d+)>/g;
            const users = [...ev.content.matchAll(regExMention)];
            return users.map(x => x[1]);
        }
        const findGroups = ev => {
            const regExMention = /<@&(\d+)>/g;
            const groupsIds = [...ev.content.matchAll(regExMention)].map(x => x[1]);
            if (groupsIds.length === 0) return [];
            const groups = [...ev.guild.roles.values()].filter(gr => groupsIds.includes(gr.id));
            const users = groups.map(gr => [...gr.members.keys()]);
            return [].concat.apply([], users);
        }
        const findAll = ev => {
            if (!ev.content.includes("@everyone")) return [];
            const members = [...ev.guild.members.values()];
            return members.map(x => x.id);
        }        
        const findHere = ev => {
            if (!ev.content.includes("@here")) return [];
            const members = [...ev.channel.members.values()];
            return members.map(x => x.id);
        }
        const ids = [findAll, findGroups, findUsers, findHere].map(x => x(ev));
        const users = [].concat.apply([], ids);
        return [...new Set(users)];
    }
}
module.exports = Utils;