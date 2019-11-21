class Security {
    constructor(admins) {
        this.admins = admins;
        this.trustedUsers = [];
    }

    addUsers(users) {
        if (!Array.isArray(users)) users = [users];
        this.trustedUsers = this.trustedUsers.concat(users);
        console.log(this.trustedUsers);
    }

    isTrusted(user) {
        if (this.admins.includes(user.id)) return true;
        if (this.trustedUsers.includes(user.id)) return true;
        return false;
    }        
}

module.exports = Security;