#!/bin/bash

# stop script on error
#set -e

path='/feeder/'

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

# Check if update folder exists, create if not
if [[ ! -e $path"update" ]]; then
	mkdir $path"update"
fi
# Check if updatefile available and install
update=$(find $path"update/" -type f -exec echo ok {} \; | cut -d " " -f 1 | head -1)
	if [ "$update" == "ok" ]; then
		echo "Update file(s) found, installing"
		mv $path'update/*' $path
		echo "Updated"
	fi


# Check to see if root CA file exists, download if not
echo -n "AWS IoT Root CA certificate "
if [ ! -f /root-CA.crt ]; then
	echo -n "not found, downloading from Symantec.."
	connectionCheck
	curl https://www.symantec.com/content/en/us/enterprise/verisign/roots/VeriSign-Class%203-Public-Primary-Certification-Authority-G5.pem > root-CA.crt
	echo "OK!"
else
	echo "OK!"
fi


# install AWS Device SDK for Python if not already installed
echo -n "AWS IoT SDK "
if [ ! -d aws-iot-device-sdk-python ]; then
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
if [ ! -d $path'PIGPIO' ]; then
	echo -n "not found, installing.."
	connectionCheck
	wget abyz.co.uk/rpi/pigpio/pigpio.zip -P $path
	unzip $path'pigpio.zip' -d $path
	make -C $path'PIGPIO/' -j4
	make -C $path'PIGPIO/' install
	rm $path'pigpio.zip'
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
if [ ! -f $path'HX711.py' ]; then
	echo -n "not found, downloading.."
	connectionCheck
	wget abyz.co.uk/rpi/pigpio/code/HX711_py.zip -P $path
	unzip $path'HX711_py.zip' -d $path
	rm $path'HX711_py.zip'
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

certPath="/feeder/cert/"

pemCount=`ls -1 /feeder/cert/*.pem 2>/dev/null | wc -l`
keyCount=`ls -1  /feeder/cert/*.key 2>/dev/null | wc -l`
echo -n "Number of PEMs found: "
echo $pemCount
echo -n "Number of KEYs found: "
echo $keyCount

if  [ $pemCount != 1 -a $keyCount != 2 ]; then
	echo "Certificates not found"
	if [ -e $certPath'default/4847123d22-certificate.pem.crt' -a -e $certPath'default/4847123d22-public.pem.key' -a -e $certPath'default/4847123d22-private.pem.key' ]; then
		echo "Requesting new certificates"
		connectionCheck
		python $path'createcert.py' -e axqdhi517toju.iot.eu-west-1.amazonaws.com -r /root-CA.crt -c $certPath'default/4847123d22-certificate.pem.crt' -k $certPath'default/4847123d22-private.pem.key'
	fi
fi


source $path'idconf.py'
echo 'Device id: '
echo $id

cert="$certPath$id.cert.pem"
priv="$certPath$id.private.key"

connectionCheck
# run DogFeeder program using certificatesY
echo "Starting DogFeeder program..."
python $path'FeederProgram.py' -e axqdhi517toju.iot.eu-west-1.amazonaws.com -r /root-CA.crt -c $cert -k $priv
