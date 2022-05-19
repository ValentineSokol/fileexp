#!/usr/bin/env node
const { terminal } = require('terminal-kit');
const os = require('os');
const fs = require('fs/promises');
const path = require('path');
const childProcess = require('child_process');
const open = require('open');
async function readDir(basePath) {
    let isTerminalMode = false;
    terminal.reset();
    terminal.removeAllListeners('key');
    terminal.on('key', (key) => {
        function renderCommandInput() {
          terminal.inputField((error, command) => {
                if (!command) return renderCommandInput();
                if (error) {
                    terminal.clear();
                    console.error(error);
                    return;
                }
                childProcess.exec(command, { cwd: basePath }, (error, stdout) => {
                    if (error) terminal.red(`\n ${error}`);
                    else terminal.green(`\n ${stdout}`);
                    renderCommandInput();
                });

            });
        }
        const { username } = os.userInfo();
        if (key.toLowerCase() === 't') {
            if (isTerminalMode) return;
            terminal.clear();
            terminal.green(`${username}'s terminal:`)
            renderCommandInput();
            isTerminalMode = !isTerminalMode;

            }
        if (key === 'CTRL_T') {
            terminal.clear();
            return readDir(basePath);
        }
        if (key === 'CTRL_C') {
            terminal.clear();
            terminal.green(`${username}, Thanks for using the FileExp Explorer!`);
            return setTimeout(() => {
                terminal.clear();
                terminal.processExit();
            }, 1000);
        }
    });
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
        const excludedKeys = [
            't',
            'esc',
            'ctrl_c',
        ];
        if (response.unexpectedKey === 'BACKSPACE') {
            const pathSegments = basePath.split(path.sep);
            pathSegments.pop();
            const newPath = pathSegments.join(path.sep);
            return readDir(newPath);
        }
        if (response.unexpectedKey) {
            const lowerKey = response.unexpectedKey.toLowerCase();
            if (excludedKeys.includes(lowerKey)) return;
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
