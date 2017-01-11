#!/bin/bash

DIR="update/"
# Check if update available (files in update folder)
if [ "$(ls -A $DIR)" ]; then
	echo "Update available"
else
	echo "Update not available"
fi
