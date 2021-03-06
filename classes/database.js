const { Datastore } = require('nedb-async-await');
const asyncRedis = require('async-redis');
const moment = require('moment');
const uuidv4 = require('uuid/v4');

class Database {    
    constructor(container, settings) {
        this.settings = settings;
        this.User = Datastore({filename: settings.nedb + 'user.db'});
        this.Server = Datastore({filename: settings.nedb + 'server.db'});
        this.Server.ensureIndex({fieldName: 'server', unique: true});

        this.Sessions = Datastore({filename: settings.nedb + 'sessions.db'});        
        this.Sessions.ensureIndex({fieldName: 'userid', unique: false});
        this.Sessions.ensureIndex({fieldName: 'token', unique: true});
        this.logger = container.loggerFactory.getLogger('Database');
    }

    async connect() {
        //const loadDb = (database) => new Promise((fnRes,fnErr) => database.loadDatabase((err)=> err ? fnErr(err) : fnRes()));
        //const stores = [this.User, this.Server].map(x => loadDb(x));
        this.redis = asyncRedis.createClient({url: this.settings.redis});
        await this.redis.get('test'); // for test connection error     

        const stores = [this.User, this.Server, this.Sessions].map(x => x.loadDatabase());
        await Promise.all(stores);
    }

    async generateSession(userid) {
        const token = uuidv4();
        await this.Sessions.insert({userid, token});
        return token.toString();
    }

    async findSession(token) {
        return this.Sessions.findOne({token});
    }

    async getYearOnline(server_id, user_id) {
        const date = moment();
        const year = date.format('YYYY');
        const dayNo = date.dayOfYear();

        const sections = ['voice', 'online'];
        const days = [...Array(dayNo).keys()];

        const data = sections
            .map(section => days.map(day => `${server_id}.${user_id}.${section}.year_${year}.day_${day+1}`))
            .map(group => this.redis.mget(group).then(group => group.reduce( (arr, val, index) => {
                if (!val) val = "0";
                const timestamp = moment().dayOfYear(index+1).startOf('day').unix() * 1000;
                arr.push([timestamp, parseInt(val)]);
                return arr;
            }, [])));
        return Promise.all(data).then(result => result.reduce((arr,value,index) => {
            arr[sections[index]] = value;
            return arr;
        }, {}));
    }

    getOnline(server_id, users_ids) {
        const date = moment();
        const year = date.format('YYYY');
        const dayNo = date.dayOfYear();
        const weekNo = date.week();    

        const promises = users_ids.map(user_id => {
            const sections = ['voice', 'online'];
            const titles = ['last', 'week', 'day'];
            let keys = sections.map(prop => {
                const prefix = `${server_id}.${user_id}.${prop}`;
                return [
                    `${prefix}.last`,
                    `${prefix}.year_${year}.week_${weekNo}`,
                    `${prefix}.year_${year}.day_${dayNo}`
                ]
            });
            keys = [].concat.apply([], keys);
            return this.redis.mget(keys).then(async result => {   
                result = result.reduce((arr, val, index)=>{
                    const title = titles[index % titles.length];
                    const section = sections[~~(index / titles.length)];
                    if (!arr[section]) arr[section] = {};
                    arr[section][title] = val;
                    return arr;
                }, {});           
                result = {[user_id]: result};
                return Promise.resolve(result);
            });
        });
        return Promise.all(promises);
    }

    updateOnline(server_id, users, addedTime) {
        const date = moment();
        const year = date.format('YYYY');
        const dayNo = date.dayOfYear();
        const weekNo = date.week();    
    
        let multi = this.redis.multi();
        users.forEach(user => {
            ['voice', 'online'].forEach(prop => {
                if (!user[prop]) return;
                const prefix = `${server_id}.${user.id}.${prop}`;                
                multi = multi.set(`${prefix}.last`, moment().toISOString());
                multi = multi.incrby(`${prefix}.year_${year}.week_${weekNo}`, addedTime);
                multi = multi.incrby(`${prefix}.year_${year}.day_${dayNo}`, addedTime);
            });
        });    
        return multi.exec();        
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