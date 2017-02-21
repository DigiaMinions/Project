#!/bin/bash

# HOW TO DETERMINE IF SED IS INSTALLED?
file="/etc/rc.local"

if grep -q start.sh "$file"; then
	echo "start.sh already added to rc.local!"
else
	sed -i '/^exit 0/ibash /feeder/start.sh &' /etc/rc.local
	echo "Added start.sh to rc.local"
fi
