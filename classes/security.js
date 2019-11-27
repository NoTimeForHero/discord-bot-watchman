class Security {
    constructor(container) {
        this.admins = container.admins;
        this.database = container.database;
    }

    updateUsers(server, users, update) {
        if (!Array.isArray(users)) users = [users];
        const bulks = users.map(user => ({
            updateOne: {
                filter: { server, user },
                update: Object.assign({server, user}, update),
                upsert: true
            }
        }));
        return this.database.User.collection.bulkWrite(bulks);
    }

    async addUsers(server, users) {
        const result = await this.updateUsers(server, users, {isAdmin: true});
        console.log(result);
    }

    async delUsers(server, users) {
        const result = await this.updateUsers(server, users, {isAdmin: false});
        console.log(result);
    }

    async listUsers(server) {
        const users = await this.database.User.find({server, isAdmin: true});
        const ids = users.map(x => x.user);
        return [...this.admins, ...ids].filter((el, index, arr) => arr.indexOf(el) === index);
    }

    async isTrusted(server, user) {
        if (this.admins.includes(user.id)) return true;
        const dbUser = await this.database.User.findOne({server, user});
        if (!dbUser) return false;
        return dbUser.isAdmin;
    }        
}

module.exports = Security;