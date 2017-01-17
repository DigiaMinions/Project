#!/bin/bash
sudo su # run as root
curl -sL https://rpm.nodesource.com/setup_4.x | bash - # install node via script
yum -y install nodejs # install node via yum