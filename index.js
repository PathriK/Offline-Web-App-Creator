#!/usr/bin/env node

const fs = require("fs");
const archiver = require("archiver");
const through2 = require("through2");
const path = require("path");
const os = require("os");

const PREFIX = ";;;===,,, ";

const appArg = process.argv[2];
const appNameArg = process.argv[3];
const appPath = path.resolve(appArg);
const appName = appNameArg ? appNameArg : path.basename(appPath);

const output = fs.createWriteStream("./installer_dist.bat", {
  encoding: "binary",
});

output.write(PREFIX + "@ECHO OFF" + os.EOL);
output.write(PREFIX + 'SET APPNAME="' + appName + '"' + os.EOL);

const batFile = fs.createReadStream(__dirname + "/assets/installer.bat", {
  flags: "r",
  encoding: "binary",
});

batFile.on("end", () => {
  console.log("Processed Batch File");
});

const updater = (line) => PREFIX + line.replace("%APPNAME%", appName);

const prefixed = batFile.pipe(lineUpdater(updater));

prefixed.on("end", () => {
  console.log("Creating Zip and appending to Batch File");
  zipApp(appPath, output);
});

prefixed.pipe(output, { end: false });

function zipApp(folder, output) {
  const archive = archiver("tar", { zlib: { level: 9 }, gzip: true });

  output.on("close", () => {
    console.log("Completed!");
  });

  archive.on("warning", (err) => {
    throw err;
  });

  archive.on("error", (err) => {
    throw err;
  });

  archive.pipe(output);

  archive.directory(folder, false);
  archive.file(__dirname + "/assets/CreateShortcut.vbs", { name: "CreateShortcut.vbs" });

  archive.finalize();
}

function lineUpdater(updater) {
  var buffer = "";
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
