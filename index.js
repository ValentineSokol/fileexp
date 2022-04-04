#!/usr/bin/env node
const terminalKit = require('terminal-kit').terminal;
const os = require('os');
const readDir = require('./utils/readDir');

const { username, homedir } = os.userInfo();

terminalKit.on( 'key' , (name) => {
    if (name === 'CTRL_C') {
        terminalKit.clear();
        terminalKit.green(`${username}, Thanks for using the FileExp Explorer!`);
        setTimeout(() => {
            terminalKit.clear();
            terminalKit.processExit();
        }, 1000);

    }
} );

// greet(username);
readDir(homedir);