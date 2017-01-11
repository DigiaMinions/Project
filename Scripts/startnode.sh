#!/bin/bash
iptables -t nat -I PREROUTING -p tcp --dport 80 -j REDIRECT --to-port 9000
cd /home/ec2-user
npm install express
node server.js