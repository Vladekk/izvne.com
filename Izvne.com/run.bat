:start
call wyam build --use-local-packages --noclean  -o ..\..\wwwroot
rem mklink /j ..\wwwroot\files ..\files
rem pause


