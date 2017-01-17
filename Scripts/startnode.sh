#!/bin/bash
sudo su # run as root
iptables -t nat -I PREROUTING -p tcp --dport 80 -j REDIRECT --to-port 9000 # redirect port 80 (http) to 9000 (node)
cd /home/ec2-user # home folder
npm install # install all node dependencies
killall node # kill existing node processes
npm run dev # run scripts (webpack bundle) in dev mode
./node_modules/.bin/forever start server.js # start node via forever