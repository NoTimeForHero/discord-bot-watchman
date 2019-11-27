class Security {
    constructor(admins) {
        this.admins = admins;
        this.trustedUsers = [];
    }

    addUsers(users) {
        if (!Array.isArray(users)) users = [users];
        this.trustedUsers = this.trustedUsers.concat(users);
    }

    delUsers(users) {
        if (!Array.isArray(users)) users = [users];
        this.trustedUsers = this.trustedUsers.filter(id => !users.includes(id));
    }

    listUsers() {
        return [...this.admins, ...this.trustedUsers];
    }

    isTrusted(user) {
        if (this.admins.includes(user.id)) return true;
        if (this.trustedUsers.includes(user.id)) return true;
        return false;
    }        
}

module.exports = Security;