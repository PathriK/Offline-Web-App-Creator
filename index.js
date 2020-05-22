#!/usr/bin/env node

const fs = require('fs');
const archiver = require('archiver');
const through2 = require('through2');
const path = require('path');
const os = require('os');

const PREFIX = ';;;===,,, ';

const { appName, appVer, menuConfig } = getConfig();
// console.log(`appName: ${appName} | appPath: ${appPath} | appVer: ${appVer}`);

const menuContent = getMenuContent(menuConfig);

const output = fs.createWriteStream('./installer_dist.bat', {
    encoding: 'binary',
});

output.write(PREFIX + '@ECHO OFF' + os.EOL);
output.write(PREFIX + 'SET APPNAME="' + appName + '"' + os.EOL);

const batFile = fs.createReadStream(__dirname + '/assets/installer.bat', {
    flags: 'r',
    encoding: 'binary',
});

batFile.on('end', () => {
    console.log('Processed Batch File');
});

const updater = (line) => PREFIX + line.replace('%APPNAME%', appName).replace('%APPVERSION%', appVer);

const prefixed = batFile.pipe(lineUpdater(updater));

prefixed.on('end', () => {
    console.log('Creating Zip and appending to Batch File');
    zipApp(menuConfig, menuContent, output);
});

prefixed.pipe(output, { end: false });

function zipApp(menuConfig, menuContent, output) {
    const archive = archiver('tar', { zlib: { level: 9 }, gzip: true });

    output.on('close', () => {
        console.log('Completed!');
    });

    archive.on('warning', (err) => {
        throw err;
    });

    archive.on('error', (err) => {
        throw err;
    });

    archive.pipe(output);

    menuConfig.items.filter(item => item.isFolder).forEach(({ folderPath, name }) => archive.directory(folderPath, name));

    archive.append(menuContent, { name: 'menu.html' });

    archive.file(__dirname + '/assets/CreateShortcut.vbs', { name: 'CreateShortcut.vbs' });

    archive.finalize();
}

function lineUpdater(updater) {
    var buffer = '';
    return through2.obj(
        // transform function
        function (chunk, enc, cb) {
            buffer += chunk;
            var EOLLength = os.EOL.length;
            var idx = buffer.indexOf(os.EOL);
            var line;

            while (idx > -1) {
                idx++;
                line = buffer.substring(0, idx - 1);
                buffer = buffer.substring(idx + EOLLength - 1);
                idx = buffer.indexOf(os.EOL);
                line = updater(line);
                this.push(line + os.EOL);
            }
            return cb();
        },
        // flush function
        function (cb) {
            this.push(buffer);
            return cb();
        }
    );
}

function getConfig() {
    const appArg = process.argv[2];
    const appNameArg = process.argv[3];
    if (appArg) {
        return getArgConfig(appArg, appNameArg);
    } else {
        return getRCConfig();
    }
}

function getArgConfig(appArg, appNameArg) {
    const appPath = path.resolve(appArg);
    const appName = appNameArg ? appNameArg : path.basename(appPath);
    const items = fs.readdirSync(appPath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(({ name }) => getMenuItem(name, appPath));

    return { appName, appPath, appVer: '1.0.0', menuConfig: {title: appName, items} };
}

function getRCConfig() {
    const rcFile = path.resolve('./owac.rc');
    try {
        if (fs.existsSync(rcFile)) {
            const rcData = JSON.parse(fs.readFileSync(rcFile, 'utf-8'));
            const { name: appName, path: appRelPath, version: appVer, menu: menuConfig } = rcData;
            if (typeof appName === 'undefined'
                || appName.length === 0
                || typeof appRelPath === 'undefined'
                || appRelPath.length === 0
            ) {
                throw 'Empty Config';
            }
            const appPath = path.resolve(appRelPath);
            menuConfig.items = menuConfig.items.map(item => {
                if (item.isFolder !== false) {
                    const folderPath = path.resolve(appPath, item.path);
                    const hrefPath = `${item.name}/index.html`;
                    const isFolder = true;
                    return { ...item, folderPath, hrefPath, isFolder, subName: '' };
                }
                return { ...item, hrefPath: item.path, subName: '(External Link)' };
            });
            return { appPath, appName, appVer, menuConfig };
        }
        throw 'Config file not found';
    } catch (ex) {
        console.log('create a owac.rc JSON file in the root of directory with format: {"name": "app","path": "src","version": "1.0.0"}');
        console.error(ex);
        process.exit(1);
    }
}

function getMenuItem(name, appPath) {
    return {
        name,
        path: name,
        folderPath: path.resolve(appPath, name),
        hrefPath: `${name}/index.html`,
        isFolder: true,
        subName: '',
    };
}

function getMenuContent({ title, items }) {
    const hrefBuilder = (text, href) => `<a href="${href}">${text}</a>`;
    const liBuilder = content => `<li>${content}</li>`;
    const ulBuilder = content => `<ul>${content}</ul>`;
    const liContents = items.map(({ name, hrefPath, subName }) => `${hrefBuilder(name, hrefPath)}${subName}`).map(liBuilder).join('');
    const ulContent = ulBuilder(liContents);
    return `<html><head><title>${title}</title></head><body><h1>${title}</h1>${ulContent}</body></html>`;
}