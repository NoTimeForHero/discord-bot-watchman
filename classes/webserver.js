const http = require('http');
const fs = require('fs');
const url = require('url');
const fetch = require('node-fetch');
const FormData = require('form-data');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser')
const cors = require('cors');

class DiscordApiError extends Error {}

class WebServer {

    constructor(container, settings) {
        this.container = container;
        this.discord = container.discord;
        this.utils = container.utils;
        this.online = container.online;
        this.database = container.database;
        this.settings = settings;
        this.isDebug = settings.mode !== 'production';
    }

    async start() {

        var app = express();

        if (this.isDebug) app.use(cors());

        const staticDir = this.settings.webserver.static || 'public';
        console.log(`Directory with static files: ${staticDir}`);

        app.use(bodyParser.json());
        app.get('/', (req, res) => res.sendFile(path.join(process.cwd(), staticDir, 'index.html')));
        app.get('/settings.json', this.getSettings.bind(this));
        app.get('/server/:server', this.getServer.bind(this))
        app.post('/login', this.login.bind(this));
        app.get('/servers', this.listServers.bind(this));
        app.use(express.static(staticDir));        
                
        const port = this.settings.webserver.port || 3000
        app.listen(port, () => console.log(`Express.JS listening on port ${port}!`));    
        this.app = app;
    }

    async __getSession(req, res) {
        const session = req.get('X-Session');
        if (!session) {
            res.status(500);
            res.send({error: 'missing_session_header', error_description: 'X-Session header is missing!'});
            return null;
        }
        const result = await this.database.findSession(session);
        if (!result) {
            res.status(400);
            res.send({error: 'invalid_session', error_description: 'Invalid session!'});
            return null;
        }
        return result.userid;
    }

    async listServers(req, res) {
        const user = await this.__getSession(req, res);
        if (!user) return;

        const allServers = await this.utils.getEnabledServers(this.database, this.discord);
        const servers = Object.values(allServers)
            .filter(x => x.members.get(user))
            .map(x => ({id: x.id, name: x.name}));

        res.send({ servers });
    }

    async login(req, res) {
        try {
            const tokens = req.body;
            const user = await fetch('https://discordapp.com/api/users/@me', {
                headers: {
                    authorization: `${tokens.token_type} ${tokens.access_token}`
                }
            }).then(x => x.json());        
            if (user.message && user.code === 0) {
                throw new DiscordApiError(user.message);
            }
            if (!user.id) throw new DiscordApiError('Cannot find user ID!');
            const session = await this.database.generateSession(user.id);
            res.send({session});
        } catch (ex) {
            res.status(500);
            res.send({error: ex.constructor.name, error_description: ex.message});
            return;
        }
    }

    async getServer(req, res) {
        const serverID = req.params.server;    
        const server = this.discord.guilds.get(serverID);
        if (!server) {
            res.status(500);
            res.send({error: `Discord server with id '${serverID}' not found!`});
            return;
        }

        const online = await this.online.get(server);        
        const info = await this.utils.getServerInfo(server);
        info.users = info.users.map(user => Object.assign(user, online[user.id]));
        res.send(info);
    }

    getSettings(_, res) {
        // Только публичную часть свойств отдаем клиенту
        const { client_id, redirect } = this.settings.discord;

        const data = {
            bot: { client_id, redirect }
        }
        res.send(data);
    }

    async stop() {
    }

}

module.exports = WebServer;