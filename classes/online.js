class Online {

    constructor(container) {
        this.database = container.database;
        this.moment = container.moment;        
    }

    async get(server) {
        let user_ids = [...server.members.values()].map(user => user.id);
        let data = await this.database.getOnline(server.id, user_ids);        
        data = data.reduce((arr, el)=>{
            const keys = Object.keys(el);
            if (keys.length < 1) return arr;
            arr[keys[0]] = el[keys[0]];
            return arr;
        }, {});
        return data;
    }

    async getYearByUser(sid, uid) {
        return this.database.getYearOnline(sid, uid);
    }

    async update(server, addedTime) {
        const afkChannel = server.afkChannelID;
        let users = [...server.members.values()].map(user => {
            let voice = !!user.voiceChannel;
            if (afkChannel && user.voiceChannelID === afkChannel) voice = false;
            return {
                id: user.id,
                name: user.displayName,
                online: user.presence.status !== 'offline',
                voice
            }
        });    
        return await this.database.updateOnline(server.id, users, addedTime);
    }

}
module.exports = Online;