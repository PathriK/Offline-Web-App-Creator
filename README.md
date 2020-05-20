**Offline Web App Creator**

Creates distributable "installable" for completely offline WebApps for Chrome.

_**NOTE**: Works only on Windows 10 that has 'tar' command. Windows 10 has 'tar' from build 17063._

This tools zips a webapp folder and creates a single batch file that can be distributed to others. The zip is embedded inside the batch file itself. Upon running the batch file, the tool unzips the app to a folder inside Local App Data folder and creates a Chrome shortcut for it on Desktop.

To install:

```shell
npm i -g owac
```

To Run:

```shell
owac folderpath appname
```

- `folderpath` can be relative
- `appname` is optional. If not given, the folder name in the `folderpath` will be taken as App Name

OR

```shell
owac
```

and the current directory should have a 'owac.rc' file in the following format:

```json
{
  "name": "app",
  "path": "src",
  "version": "1.0.0"
}
```

**Note**: 
- The parameter version of the command uses version '1.0.0' and it can not be overriden.
- When using the '.rc' format of the command, everything is mandatory.
