#!/bin/bash

# stop script on error
set -e

# Check if connected to internet by pinging default gateway
function connectionCheck {
	connection=$(ping -q -w 1 -c 1 `ip r | grep default | cut -d ' ' -f 3` > /dev/null 2>&1 && echo ok || echo error)
		if [ ! $connection == "ok" ]; then
			echo -n "eth0: Awaiting internet connection"
			while [ ! $connection == "ok" ]; do
				echo -n "."
				sleep 1
				flags=$(ping -q -w 1 -c 1 `ip r | grep default | cut -d ' ' -f 3` > /dev/null 2>&1 && echo ok || echo error)
			done
		fi
}

# Check if updatefile available and install
update=$(find "update/" -type f -exec echo ok {} \; | cut -d " " -f 1 | head -1)
	if [ "$update" == "ok" ]; then
		echo "Update file(s) found, installing"
		mv update/* ./
		echo "Updated"
	fi


# Check to see if root CA file exists, download if not
echo -n "AWS IoT Root CA certificate "
if [ ! -f ./cert/root-CA.crt ]; then
	echo -n "not found, downloading from Symantec.."
	connectionCheck
	curl https://www.symantec.com/content/en/us/enterprise/verisign/roots/VeriSign-Class%203-Public-Primary-Certification-Authority-G5.pem > root-CA.crt
	echo "OK!"
else
	echo "OK!"
fi


# install AWS Device SDK for Python if not already installed
echo -n "AWS IoT SDK "
if [ ! -d ./aws-iot-device-sdk-python ]; then
	echo -n "not found, installing.."
	connectionCheck
	git clone https://github.com/aws/aws-iot-device-sdk-python.git
	pushd aws-iot-device-sdk-python
	python setup.py install
	popd
	echo "OK!"
else
	echo "OK!"
fi


# install PiGpio library if not already installed
echo -n "PiGPIO library "
if [ ! -d ./PIGPIO ]; then
	echo -n "not found, installing.."
	connectionCheck
	wget abyz.co.uk/rpi/pigpio/pigpio.zip
	unzip pigpio.zip
	make -C PIGPIO/ -j4
	make -C PIGPIO/ install
	rm pigpio.zip
	echo "OK!"
else
	echo "OK!"
fi


# Start PiGPIO daemon if not already running
echo -n "PiGPIO daemon "
if pgrep -x "pigpiod" > /dev/null
	then
		echo "OK!"
	else
		echo -n "not running, attempting to start.."
		pigpiod
		while ! pgrep -x "pigpiod" > /dev/null
			do
				echo -n "."
				sleep 1
			done
		echo "OK!"
fi


# Check if HX711 -library exists, download if not
echo -n "HX711 -library "
if [ ! -f ./HX711.py ]; then
	echo -n "not found, downloading.."
	connectionCheck
	wget abyz.co.uk/rpi/pigpio/code/HX711_py.zip
	unzip HX711_py.zip
	rm HX711_py.zip
	echo "OK!"
else
	echo "OK!"
fi


# Check if Subversion is installed, install if not
echo -n "Subversion "
subversion=$(dpkg -s subversion > /dev/null 2>&1 && echo ok || echo error)
	if [ ! $subversion == "ok" ]; then
		connectionCheck
		echo "not found, installing.."
		apt update
		apt install subversion -y
		echo "Subversion OK!"
	else
		echo "OK!"
	fi


connectionCheck
# run DogFeeder program using certificates
echo "Starting DogFeeder program..."
python FeederProgram.py -e axqdhi517toju.iot.eu-west-1.amazonaws.com -r ./cert/root-CA.crt -c ./cert/DogFeeder.cert.pem -k ./cert/DogFeeder.private.key
