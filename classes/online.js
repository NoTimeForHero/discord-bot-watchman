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
        console.log(data);
        return data;
    }

    async update(server, addedTime) {
        let users = [...server.members.values()].map(user => ({
            id: user.id,
            name: user.displayName,
            online: user.presence.status !== 'offline',
            voice: !!user.voiceChannel
        }));    
        return await this.database.updateOnline(server.id, users, 60);
    }

}
module.exports = Online;