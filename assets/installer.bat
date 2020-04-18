SET APPDIR=%LOCALAPPDATA%\%APPNAME%
SET MENUDIR="%APPDIR%\Default\Apps"
IF EXIST %APPDIR% GOTO APPEXIST
ECHO "Creating App Dir..."
MKDIR %MENUDIR%
CD /d %MENUDIR%
ECHO "Extracting App..."
FINDSTR /v "^;;;===,,," %~f0 > %APPNAME%.tar.gz
ECHO "Installing App..."
tar -xf %APPNAME%.tar.gz
ECHO "Creating Desktop Shortcut.."
CSCRIPT CreateShortcut.vbs %APPNAME% %APPDIR% %MENUDIR%
ECHO "%APPNAME% Shortcut Created."
del CreateShortcut.vbs
del %APPNAME%.tar.gz
ECHO "Installation Complete!"
pause
exit /b
:APPEXIST
ECHO "App Already Exist!"
pause
exit /b 1
