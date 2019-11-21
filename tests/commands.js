// npx mocha tests/commands.js
const Commands = require('../classes/commands.js');
const FakeI18N = require('../classes/fakei18n.js');
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
    security: {
        addUsers: null,
        isTrusted: null
    },
    settings: {        
    }
};

const handler = new Commands(Container);

function testCommand(command, expected, args=[]) {
    ev.content = `${prefix} ${command}` + args.join(' ');
    ev.reply = (actual) => {
        assert.equal(actual, expected);
    }
    handler.onCommand(ev);
}

describe('Commands', function() {

    it('unknown_command', function() {
        testCommand('some_unknown_command', 'unknown_command');
    });

    it('security_rights', function() {
        Container.security.isTrusted = () => false;
        testCommand('setChannel', 'unauthorized_user');
        testCommand('addTrustedUsers', 'unauthorized_user')

        Container.security.isTrusted = () => true;
        Container.security.addUsers = () => {};
        testCommand('addTrustedUsers', 'users_added_to_trusted ')
        testCommand('addTrustedUsers', 'users_added_to_trusted <@1>, <@2>, <@3>', ['<@1>+<@2>-<@3>'])
    });

  });


