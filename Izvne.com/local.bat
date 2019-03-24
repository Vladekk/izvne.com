:start
call wyam build -w --noclean  -o ..\wwwroot -c local.wyam
rem mklink /j ..\wwwroot\files ..\files
rem pause
