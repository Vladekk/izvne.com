:start
#call dotnet .\lib\Wyam.dll  build --use-local-packages -w --noclean  -o ..\wwwroot -c local.wyam
Wyam  build  -w --noclean  -o ..\wwwroot -c local.wyam
rem mklink /j ..\wwwroot\files ..\files
rem pause
