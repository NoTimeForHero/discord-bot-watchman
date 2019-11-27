const mongoose = require('mongoose');
const Schema = mongoose.Schema;

class Database {    
    constructor(connectionString) {
        mongoose.connect(connectionString, { useNewUrlParser: true });
        const userSchema = new Schema({
            server: String,
            user: String,
            isAdmin: Boolean,
            isWatched: Boolean,
            lastOnline: Date,
            lastVoice: Object
        });
        userSchema.index({server: 1, user: 1}, {unique: true})
        this.User = mongoose.model("User", userSchema);

        const serverSchema = new Schema({
            server: {
                type: String,
                index: true
            },
            isEnabled: Boolean
        })
        this.Server = mongoose.model("Server", serverSchema);
    }

    bulkUsersEdit(server, users, update) {
        if (!Array.isArray(users)) users = [users];
        const bulks = users.map(user => ({
            updateOne: {
                filter: { server, user },
                update: {
                    $set: Object.assign({server, user}, update),
                },
                upsert: true
            }
        }));
        return this.User.collection.bulkWrite(bulks);
    }
}
module.exports = Database;