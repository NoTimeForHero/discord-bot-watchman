const http = require('http');
const fs = require('fs');
const url = require('url');
const fetch = require('node-fetch');
const FormData = require('form-data');
const path = require('path');
const express = require('express');
const cors = require('cors');

class WebServer {

    constructor(container, settings) {
        this.container = container;
        this.settings = settings;
        this.isDebug = settings.mode !== 'production';
    }

    async start() {

        var app = express();

        if (this.isDebug) app.use(cors());

        const staticDir = this.settings.webserver.static || 'public';
        console.log(`Directory with static files: ${staticDir}`);

        app.get('/', (req, res) => res.sendFile(path.join(process.cwd(), staticDir, 'index.html')));
        app.get('/settings.json', this.getSettings.bind(this));
        app.use(express.static(staticDir));        
        
        const port = this.settings.webserver.port || 3000
        app.listen(port, () => console.log(`Express.JS listening on port ${port}!`));    
        this.app = app;
    }

    getSettings(_, res) {
        // Только публичнуя часть свойств отдаем клиенту
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