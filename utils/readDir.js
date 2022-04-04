const fs = require('fs/promises');
const { terminal } = require('terminal-kit');
const open = require('open');

async function readDir(path) {
  terminal.clear();
  const files = await fs.readdir(path, { withFileTypes: true });
  const statsPromise = files.map(direct => fs.stat(`${path}/${direct.name}`));
  const stats = await Promise.all(statsPromise);
  const entries = files.length ? files.map((dirent, i) => {
    const prefix = dirent.isDirectory() ? 'D' : 'F';
    const stat = stats[i];
    return `${prefix}-${dirent.name} ${stat.size}B`;
  }) : [''] ;


  terminal.green(`${path} \n`);
  terminal.gridMenu(entries, {}, (err, response) => {
    const dirent = files[response.selectedIndex];
    const pathToDirent = `${path}/${dirent.name}`;
    if (dirent.isDirectory()) {
      return readDir(pathToDirent);
    }
    open(pathToDirent);
    terminal.clear();
    readDir(path);
  });
}


module.exports = readDir;