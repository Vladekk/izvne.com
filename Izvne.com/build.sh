wget https://dot.net/v1/dotnet-install.sh
chmod +x ./dotnet-install.sh
./dotnet-install.sh -Channel 2.1
#export PATH="$PATH:$HOME/.dotnet/tools"
#export PATH="$PATH:$HOME/.dotnet"
export DOTNET_ROOT=$HOME/.dotnet
dotnet tool install -g Wyam.Tool	

cd Izvne.com
#dotnet ./lib/Wyam.dll build config.wyam --use-local-packages -o ../wwwroot
wyam build config.wyam -o ../wwwroot


if [ $? -ne 0 ]; then
   exit 1
fi

cd ..
mv files wwwroot/
