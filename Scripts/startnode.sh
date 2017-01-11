#!/bin/bash
iptables -t nat -I PREROUTING -p tcp --dport 80 -j REDIRECT --to-port 9000
node /home/ec2-user/server.js