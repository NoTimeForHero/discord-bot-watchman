const Utils = {
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