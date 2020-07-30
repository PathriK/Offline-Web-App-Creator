Set Arg = WScript.Arguments
AppName = Arg(0)
AppUserDir = Arg(1)
MenuDir = Arg(2)
AppsMenu = MenuDir & "\menu.html"
Set Shell = CreateObject("WScript.Shell")
DesktopPath = Shell.SpecialFolders("Desktop")
ProgramFilesPath = Shell.ExpandEnvironmentStrings("%ProgramFiles(x86)%")
ChromePath = ProgramFilesPath & "\Google\Chrome\Application\chrome.exe"
Set link = Shell.CreateShortcut(DesktopPath & "\" & AppName & ".lnk")
link.Arguments = "--user-data-dir=""" & AppUserDir & """ --app=""" & AppsMenu & """"
link.Description = AppName & " App Shortcut"
' link.HotKey = "CTRL+ALT+SHIFT+X"
' link.IconLocation = "app.exe,1"
link.TargetPath = ChromePath
link.WindowStyle = 3
' link.WorkingDirectory = "c:\blah"
link.Save