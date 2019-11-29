const http = require('http');
const fs = require('fs');
const url = require('url');
const fetch = require('node-fetch');
const FormData = require('form-data');


class WebServer {

    constructor(container, settings) {
        this.container = container;
        this.settings = settings;
    }

    async start() {
    }

    async stop() {

    }

}

module.exports = WebServer;