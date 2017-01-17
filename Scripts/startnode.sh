#!/bin/bash
iptables -t nat -I PREROUTING -p tcp --dport 80 -j REDIRECT --to-port 9000 # redirect port 80 (http) to 9000 (node)
cd /home/ec2-user # home folder
sudo npm install -g # install all node dependencies globally
sudo killall node # kill existing node processes
npm run dev # run scripts (webpack bundle) in dev mode
forever start ./src/server.js # start node via forever