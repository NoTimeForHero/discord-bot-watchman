const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { Datastore } = require('nedb-async-await');


class Database {    
    constructor(nedbPath) {
        this.User = Datastore({filename: nedbPath + 'user.db'});
        this.Server = Datastore({filename: nedbPath + 'server.db'});
        this.Server.ensureIndex({fieldName: 'server', unique: true});
    }

    async connect() {
        //const loadDb = (database) => new Promise((fnRes,fnErr) => database.loadDatabase((err)=> err ? fnErr(err) : fnRes()));
        //const stores = [this.User, this.Server].map(x => loadDb(x));
        const stores = [this.User, this.Server].map(x => x.loadDatabase());
        await Promise.all(stores);
    }

    setServer(server, isEnabled) {
        return this.Server.update({server}, {$set: {isEnabled}}, {upsert: true});
    }

    bulkUsersEdit(server, users, update) {
        if (!Array.isArray(users)) users = [users];
        const changes = users.map(user => {
            return this.User.update(
                { server, user },
                { $set: update },
                { upsert: true }
            );
        })
        return Promise.all(changes);
    }
}
module.exports = Database;