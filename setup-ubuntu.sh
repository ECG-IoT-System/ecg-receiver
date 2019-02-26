#!/bin/bash

# update ubuntu package
sudo apt update

# install ble
sudo apt install -y bluetooth bluez libbluetooth-dev libudev-dev

# install nodejs 8
curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
sudo apt install -y nodejs

# install npm
sudo apt install -y npm

# install dependency
npm install

