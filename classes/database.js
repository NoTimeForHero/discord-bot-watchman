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
    }
}
module.exports = Database;