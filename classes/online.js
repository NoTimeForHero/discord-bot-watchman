class Online {

    constructor(container) {
        this.database = container.database;
        this.moment = container.moment;        
    }

    get(server) {
        return this.database.Online.find({server: server.id});
    }

    async update(server, addedTime) {
        let users = [...server.members.values()].map(user => ({
            id: user.id,
            name: user.displayName,
            online: user.presence.status !== 'offline',
            voice: !!user.voiceChannel
        }));

        const moment = this.moment();
        const year = moment.format('YYYY');
        const dayNo = moment.dayOfYear();
        const weekNo = moment.week();

        const bulks = users.filter(user => user.online || user.voice).map(user => {
            let update = { username: user.name};
            let incremented = {};

            ['online', 'voice'].forEach(prop => {
                if (!user[prop]) return;
                update[prop] = new Date();
                incremented[`days.${year}.${dayNo}.${prop}`] = addedTime;
                incremented[`weeks.${year}.${weekNo}.${prop}`] = addedTime;
            })

            return {
                updateOne: {
                    filter: { server: server.id, user: user.id },
                    update: {
                        $set: update,
                        $inc: incremented
                    },
                    upsert: true
                }
            }
        });
        return this.database.Online.collection.bulkWrite(bulks);     
    }

}
module.exports = Online;