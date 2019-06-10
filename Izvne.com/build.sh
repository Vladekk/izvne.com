wget https://dot.net/v1/dotnet-install.sh
chmod +x ./dotnet-install.sh
./dotnet-install.sh -c Current
export PATH="$PATH:/opt/buildhome/.dotnet/tools"
export PATH="$PATH:/opt/buildhome/.dotnet"
export DOTNET_ROOT=/opt/buildhome/.dotnet
dotnet tool install -g Wyam.Tool	

cd Izvne.com
wyam build config.wyam --use-local-packages -o ../wwwroot


if [ $? -ne 0 ]; then
   exit 1
fi

cd ..
mv files wwwroot/