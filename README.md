**Offline Web App Creator**

Creates distributable "installable" for completely offline WebApps for Chrome.

_**NOTE**: Works only on Windows 10 that has 'tar' command. Windows 10 has 'tar' from build 17063._

This tools zips a webapp folder and creates a single batch file that can be distributed to others. The zip is embedded inside the batch file itself. Upon running the batch file, the tool unzips the app to a folder inside Local App Data folder and creates a Chrome shortcut for it on Desktop.

**TO INSTALL:**

```shell
npm i -g owac
```

**Two Ways To Run:**

1. Supply arguments. This has less feature:

```shell
owac folderpath appname
```

- `folderpath` can be relative
- `appname` is optional. If not given, the folder name in the `folderpath` will be taken as App Name

*Note:*
- Creates a simple `menu.html` file. It lists all the folders inside `folderpath`
- The version is always `1.0.0`. It can not be changed and app can't be "re-installed"

2. Using a config file:

```shell
owac
```

and the current directory should have a 'owac.rc' file in the following format:

```json
{
  "name": "AAA",
  "path": "src",
  "version": "1.0.0",
  "menu": {
    "title": "AAA",
    "items": [
      {
        "name": "App 1",
        "path": "app1"
      },
      {
        "name": "Google",
        "path": "https://www.google.com",
        "isFolder": false
      }
    ]
  }
}

```

The file can be created using the following command:

```shell
owac init
```

This creates a sample config file with sample values. It needs to be edited as needed.

*Note:*
- When using the '.rc' format of the command, everything is mandatory
- Similar to the 1st version, it creates a simple menu file. The items are controlled by `menu.items` from the .rc file

**To get currently installed version run**

```shell
owac version
```
