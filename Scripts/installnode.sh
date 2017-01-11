curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.32.0/install.sh | bash
. ~/.nvm/nvm.sh
nvm install 4.4.5
npm install express
sudo iptables -t nat -I PREROUTING -p tcp --dport 80 -j REDIRECT --to-port 9000
sudo killall -9 node
node /home/ec2-user/server.js