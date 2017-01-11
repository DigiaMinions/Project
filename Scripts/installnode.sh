#!/bin/bash
sudo su
curl -sL https://rpm.nodesource.com/setup_4.x | bash -
yum install nodejs
npm install express
iptables -t nat -I PREROUTING -p tcp --dport 80 -j REDIRECT --to-port 9000
node /home/ec2-user/server.js