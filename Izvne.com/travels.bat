:start
call wyam build --use-local-packages --noclean -w  -o ..\wwwroot -c travels.wyam
rem mklink /j ..\wwwroot\files ..\files
rem pause


