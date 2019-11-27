// npx mocha tests/commands.js
const Commands = require('../classes/commands.js');
const FakeI18N = require('../classes/fakei18n.js');
const Utils = require('../classes/utils.js');

const assert = require('assert');
const sinon = require('sinon');

const prefix = 'x';

let ev = {
    author: {
        id: '3141569'
    },
    content: null,
    reply: null
}

const Container = {
    prefix,
    i18n: new FakeI18N(),
    utils: Utils,
    security: {
        addUsers: null,
        isTrusted: null
    },
    settings: {        
    }
};

const handler = new Commands(Container);

function testCommand(command, expected, args=[]) {
    ev.content = `${prefix} ${command} ` + args.join(' ');
    ev.reply = (actual) => {
        assert.equal(actual, expected);
    }
    handler.onCommand(ev);
}

describe('Commands', function() {

    it('Special: unknown_command', function() {
        testCommand('some_unknown_command', 'unknown_command');
    });

    it('Special: security_rights', function() {
        Container.security.isTrusted = () => false;
        testCommand('setChannel', 'unauthorized_user');
        testCommand('trusted', 'unauthorized_user')
    });

    it('Command: trusted', function() {
        Container.security.isTrusted = () => true;
        testCommand('trusted', 'no_users', ['add'])
        Container.security.addUsers = (users) => assert.deepStrictEqual(users, ['1','2','3']);
        testCommand('trusted', 'users_added_to_trusted <@1>, <@2>, <@3>', ['add', 'plz add <@1> and <@2> maybe <@3>'])
        Container.security.delUsers = (users) => assert.deepStrictEqual(users, ['1','2','3']);
        testCommand('trusted', 'users_removed_from_trusted <@1>, <@2>, <@3>', ['del', 'plz add <@1> and <@2> maybe <@3>'])        
    });

  });


