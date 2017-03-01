#!/bin/sh
iptables -t nat -I PREROUTING -p tcp --dport 80 -j REDIRECT --to-port 9000 # redirect port 80 (http) to 9000 (node)
cd /home/ec2-user
cp -R .env release/ # copy .env to release folder
cd /home/ec2-user/release
npm install --production # install node dependencies locally
npm install forever -g # install forever globally
killall node # kill existing node processes
npm run build # run scripts (webpack bundle etc)
forever start ~/release/server.js # start node via forever