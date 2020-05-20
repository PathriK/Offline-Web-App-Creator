#!/usr/bin/env node

const fs = require('fs');
const archiver = require('archiver');
const through2 = require('through2');
const path = require('path');
const os = require('os');

const PREFIX = ';;;===,,, ';

const { appName, appPath, appVer } = getConfig();
console.log(`appName: ${appName} | appPath: ${appPath} | appVer: ${appVer}`);

const appPages = fs.readdirSync(appPath, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(({ name }) => ({ name, path: path.join(appPath, name) }));

const menuConfig = getMenuConfig(appName, appPages);

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
    zipApp(appPages, menuContent, output);
});

prefixed.pipe(output, { end: false });

function zipApp(appPages, menuContent, output) {
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

    appPages.forEach(({path, name}) => archive.directory(path, name));

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
    return { appName, appPath, appVer: '1.0.0' };
}

function getRCConfig() {
    const rcFile = path.resolve('./owac.rc');
    try {
        if (fs.existsSync(rcFile)) {
            const rcData = JSON.parse(fs.readFileSync(rcFile, 'utf-8'));
            const { name: appName, path: appRelPath, version: appVer} = rcData;
            if (typeof appName === 'undefined'
                || appName.length === 0 
                || typeof appRelPath === 'undefined'
                || appRelPath.length === 0
            ) {
                throw 'Empty Config';
            }
            const appPath = path.resolve(appRelPath);
            return { appPath, appName, appVer };
        }
        throw 'Config file not found';
    } catch (ex) {
        console.log('create a owac.rc JSON file in the root of directory with format: {"name": "app","path": "src","version": "1.0.0"}');
        console.error(ex);
        process.exit(1);
    }
}

function getMenuConfig(appName, appPages) {
    const config = { title: appName, items: [] };
    config.items = appPages.map(({ name }) => ({ name, path: name }));
    return config;
}

function getMenuContent({title, items}) {
    const hrefBuilder = (text, href) => `<a href="${href}">${text}</a>`;
    const liBuilder = content => `<li>${content}</li>`;
    const ulBuilder = content => `<ul>${content}</ul>`;
    const liContents = items.map(({ name, path }) => hrefBuilder(name, `${path}/index.html`)).map(liBuilder).join('');
    const ulContent = ulBuilder(liContents);
    return `<html><head><title>${title}</title></head><body><h1>${title}</h1>${ulContent}</body></html>`;
}