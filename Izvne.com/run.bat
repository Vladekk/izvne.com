:start
call wyam build --noclean --use-local-packages  -o ..\wwwroot
rem mklink /j ..\wwwroot\files ..\files
rem pause


