#!/usr/bin/env node
const { terminal } = require('terminal-kit');
const os = require('os');
const fs = require('fs/promises');
const path = require('path');
const open = require('open');

async function readDir(basePath) {
    terminal.clear();
    const files = await fs.readdir(basePath, { withFileTypes: true });
    const statsPromise = files.map(direct => fs.stat(path.join(basePath, direct.name)));
    const stats = await Promise.all(statsPromise);
    const entries = files.length ? files.map((dirent, i) => {
        const prefix = dirent.isDirectory() ? 'D' : 'F';
        const stat = stats[i];
        return `${prefix}-${dirent.name} ${!dirent.isDirectory() ? `${stat.size}B` : ''}`;
    }) : [''] ;

    terminal.green(`${basePath} \n`);
    terminal.gridMenu(entries, { exitOnUnexpectedKey: true }, (err, response) => {
        if (response.unexpectedKey === 'BACKSPACE') {
            const pathSegments = basePath.split(path.sep);
            pathSegments.pop();
            const newPath = pathSegments.join(path.sep);
            return readDir(newPath);
        }
        if (response.unexpectedKey === 'CTRL_C') {
            const { username } = os.userInfo();
            terminal.clear();
            terminal.green(`${username}, Thanks for using the FileExp Explorer!`);
           return setTimeout(() => {
                terminal.clear();
                terminal.processExit();
            }, 1000);

        }
        if (response.unexpectedKey) {
            return readDir(basePath);
        }
        const dirent = files[response.selectedIndex];
        const pathToDirent = path.join(basePath, dirent.name);
        if (dirent.isDirectory()) {
            return readDir(pathToDirent);
        }
        open(pathToDirent);
        terminal.clear();
        readDir(basePath);
    });
}

const { homedir } = os.userInfo();

readDir(homedir);
