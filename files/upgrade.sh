sudo chown -R vladekk:www-data /home/vladekk/wwwroot/izvne.com/
sudo chmod -R 775 /home/vladekk/wwwroot/izvne.com/App_Data
sudo rm /home/vladekk/wwwroot/izvne.com/lj
sudo rm /home/vladekk/wwwroot/izvne.com/t
sudo rm /home/vladekk/wwwroot/izvne.com/u
sudo rm /home/vladekk/wwwroot/izvne.com/App_Code/Extensions/vladekk
sudo rm /home/vladekk/wwwroot/izvne.com/SpotifyRandomizer

sudo ln -s /home/vladekk/wwwroot/izvne.com/App_Data/vladekk/lj /home/vladekk/wwwroot/izvne.com/lj
sudo ln -s /home/vladekk/wwwroot/izvne.com/App_Data/vladekk/t /home/vladekk/wwwroot/izvne.com/t
sudo ln -s /home/vladekk/wwwroot/izvne.com/themes/Vladekk/u /home/vladekk/wwwroot/izvne.com/u
sudo ln -s /home/vladekk/wwwroot/izvne.com/themes/Vladekk/Extensions /home/vladekk/wwwroot/izvne.com/App_Code/Extensions/vladekk
sudo ln -s /home/vladekk/wwwroot/izvne.com/themes/Vladekk/SpotifyRandomizer /home/vladekk/wwwroot/izvne.com/SpotifyRandomizer

#ln -s /home/vladekk/wwwroot/izvne.com/App_Data/files/Writer /home/vladekk/wwwroot/izvne.com/App_Data/vladekk/lj/Writer
#ln -s /home/vladekk/wwwroot/izvne.com/Bin /home/vladekk/wwwroot/izvne.com/bin
