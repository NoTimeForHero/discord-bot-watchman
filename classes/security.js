class Security {
    constructor(container) {
        this.admins = container.admins;
        this.database = container.database;
    }

    async addUsers(server, users) {
        await this.database.bulkUsersEdit(server, users, {isAdmin: true});
    }

    async delUsers(server, users) {
        await this.database.bulkUsersEdit(server, users, {isAdmin: false});
    }

    async listUsers(server) {
        const users = await this.database.User.find({server, isAdmin: true});
        const ids = users.map(x => x.user);
        return ids.filter((el, index, arr) => arr.indexOf(el) === index);
    }

    async isTrusted(server, user) {
        if (this.admins.includes(user)) return true;
        const dbUser = await this.database.User.findOne({server, user});
        if (!dbUser) return false;
        return dbUser.isAdmin;
    }        
}

module.exports = Security;