#!/bin/bash
iptables -t nat -I PREROUTING -p tcp --dport 80 -j REDIRECT --to-port 9000
cd /home/ec2-user
sudo npm install express
sudo npm install forever
sudo killall node
forever start server.js