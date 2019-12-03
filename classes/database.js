const mongoose = require('mongoose');
const Schema = mongoose.Schema;

class Database {    
    constructor(connectionString) {
        this.connectionString = connectionString
        const userSchema = new Schema({
            server: String,
            user: String,
            isAdmin: Boolean
        });
        userSchema.index({server: 1, user: 1}, {unique: true})
        userSchema.index({server: 1});
        this.User = mongoose.model("User", userSchema);

        const serverSchema = new Schema({
            server: {
                type: String,
                index: true
            },
            isEnabled: Boolean
        })
        this.Server = mongoose.model("Server", serverSchema);

        const onlineSchema = new Schema({
            server: String,
            user: String,
            lastOnline: Date,
            lastVoice: Date,
            days: Object,
            weeks: Object
        })
        onlineSchema.index({server: 1, user: 1}, {unique: true});
        onlineSchema.index({server: 1});
        this.Online = mongoose.model("Online", onlineSchema);
    }

    async connect() {
        await mongoose.connect(this.connectionString, { useNewUrlParser: true });        
    }

    bulkUsersEdit(server, users, update) {
        if (!Array.isArray(users)) users = [users];
        const bulks = users.map(user => ({
            updateOne: {
                filter: { server, user },
                update: {
                    $set: update,
                },
                upsert: true
            }
        }));
        return this.User.collection.bulkWrite(bulks);
    }
}
module.exports = Database;