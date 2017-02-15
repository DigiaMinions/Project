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
				connection=$(ping -q -w 1 -c 1 `ip r | grep default | cut -d ' ' -f 3` > /dev/null 2>&1 && echo ok || echo error)
			done
		fi
}

# Check if updatefile available and install
update=$(find "/home/terminal/mock/update/" -type f -exec echo ok {} \; | cut -d " " -f 1 | head -1)
	if [ "$update" == "ok" ]; then
		echo "Update file(s) found, installing"
		mv /home/terminal/mock/update/* /home/terminal/mock/
		echo "Updated"
	fi


# Check to see if root CA file exists, download if not
echo -n "AWS IoT Root CA certificate "
if [ ! -f /home/terminal/mock/cert/root-CA.crt ]; then
	echo -n "not found, downloading from Symantec.."
	connectionCheck
	curl https://www.symantec.com/content/en/us/enterprise/verisign/roots/VeriSign-Class%203-Public-Primary-Certification-Authority-G5.pem > /home/terminal/mock/cert/root-CA.crt
	echo "OK!"
else
	echo "OK!"
fi


# install AWS Device SDK for Python if not already installed
echo -n "AWS IoT SDK "
if [ ! -d /home/terminal/mock/aws-iot-device-sdk-python ]; then
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
if [ ! -d /home/terminal/mock/PIGPIO ]; then
	echo -n "not found, installing.."
	connectionCheck
	wget abyz.co.uk/rpi/pigpio/pigpio.zip
	unzip /home/terminal/mock/pigpio.zip
	make -C /home/terminal/mock/PIGPIO/ -j4
	make -C /home/terminal/mock/PIGPIO/ install
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
if [ ! -f /home/terminal/mock/HX711.py ]; then
	echo -n "not found, downloading.."
	connectionCheck
	wget abyz.co.uk/rpi/pigpio/code/HX711_py.zip -P /home/terminal/mock/
	unzip /home/terminal/mock/HX711_py.zip
	rm /home/terminal/mock/HX711_py.zip
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

pemCount=`ls -1 /home/terminal/mock/cert/*.pem 2>/dev/null | wc -l`
keyCount=`ls -1 /home/terminal/mock/cert/*.key 2>/dev/null | wc -l`
echo -n "Number of PEMs found: "
echo $pemCount
echo -n "Number of KEYs found: "
echo $keyCount

if  [ $pemCount != 1 -a $keyCount != 2 ]; then
	echo "Certificates not found"
	if [ -e /home/terminal/mock/cert/default/4847123d22-certificate.pem.crt -a -e /home/terminal/mock/cert/default/4847123d22-public.pem.key -a -e /home/terminal/mock/cert/default/4847123d22-private.pem.key ]; then
		echo "Requesting new certificates"
		connectionCheck
		python /home/terminal/mock/createcert.py -e axqdhi517toju.iot.eu-west-1.amazonaws.com -r /home/terminal/mock/cert/root-CA.crt -c /home/terminal/mock/cert/default/4847123d22-certificate.pem.crt -k /home/terminal/mock/cert/default/4847123d22-private.pem.key
	fi
fi

source /home/terminal/mock/idconf.py
echo 'Device id: '
echo $id

path="/home/terminal/mock/cert/"
cert="$path$id.cert.pem"
priv="$path$id.private.key"

connectionCheck
# run DogFeeder program using certificatesY
echo "Starting DogFeeder program..."
python /home/terminal/mock/FeederProgram.py -e axqdhi517toju.iot.eu-west-1.amazonaws.com -r /home/terminal/mock/cert/root-CA.crt -c $cert -k $priv
