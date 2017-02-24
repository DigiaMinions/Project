from AWSIoTPythonSDK.MQTTLib import AWSIoTMQTTClient
import sys
import logging
import time
import getopt
import json
import os
import sys
import subprocess
import thread
import uuid

path = "/feeder/"
certPath = "/feeder/cert/"

if not os.path.exists(path + 'idconf.py'):
	with open(path + 'idconf.py', 'w+') as file:
		file.write("id=''\nflag=1")

import idconf
curid = idconf.id

# Certificate request callback
def callback_cert(client, userdata, message):
	try:
		curid
	except NameError:
		print "curid not defined"
	else:
		try:
			os.remove(certPath + curid + '.cert.pem')
		except OSError:
			pass
		try:
			os.remove(certPath + curid + '.public.key')
		except OSError:
			pass
		try:
			os.remove(certPath + curid + '.private.key')
		except OSError:
			pass
	cert = json.loads(message.payload)
	id = cert['certificateArn'].split('/')

	with open(path + 'idconf.py', 'w') as file:
		file.write("id='" + id[1] + "'\nflag=1")

	certpem= str(certPath + id[1]) +'.cert.pem'
	with open(certpem, 'w') as file:
		file.write(cert['certificatePem'])

	certpub= str(certPath + id[1]) + '.public.key'
	with open(certpub, 'w') as file:
		file.write(cert['keyPair']['PublicKey'])

	certpriv= str(certPath + id[1]) +'.private.key'
	with open(certpriv, 'w') as file:
		file.write(cert['keyPair']['PrivateKey'])


	try:
		open(certpem, "r")
		open(certpub, "r")
		open(certpriv, "r")
	except IOError:
		print "Error: File does not appear to exist."
		return 0
	finally:
		try:
			os.remove(certPath + 'default/4847123d22-certificate.pem.crt')
			os.remove(certPath + 'default/4847123d22-public.pem.key')
			os.remove(certPath + 'default/4847123d22-private.pem.key')
		except OSError:
			pass

	idconf.flag = 0
	
	
# Get hardware MAC address	
def getMac():
	try:
		mac_addr = hex(uuid.getnode()).replace('0x', '0').upper()
		mac = ':'.join(mac_addr[i : i + 2] for i in range(0, 11, 2))
		mac = mac.replace(":","")
	except:
		print("Error retrieving MAC address")
	print("mac: " + mac)
	return mac
	

# Usage
usageInfo = """Usage:
Use certificate based mutual authentication:
python basicPubSub.py -e <endpoint> -r <rootCAFilePath> -c <certFilePath> -k <privateKeyFilePath>
Use MQTT over WebSocket:
python basicPubSub.py -e <endpoint> -r <rootCAFilePath> -w
Type "python basicPubSub.py -h" for available options.
"""
# Help info
helpInfo = """-e, --endpoint
	Your AWS IoT custom endpoint
-r, --rootCA
	Root CA file path
-c, --cert
	Certificate file path
-k, --key
	Private key file path
-w, --websocket
	Use MQTT over WebSocket
-h, --help
	Help information
"""

# Read in command-line parameters
useWebsocket = False
host = ""
rootCAPath = ""
certificatePath = ""
privateKeyPath = ""
try:
	opts, args = getopt.getopt(sys.argv[1:], "hwe:k:c:r:", ["help", "endpoint=", "key=","cert=","rootCA=", "websocket"])
	if len(opts) == 0:
		raise getopt.GetoptError("No input parameters!")
	for opt, arg in opts:
		if opt in ("-h", "--help"):
			print(helpInfo)
			exit(0)
		if opt in ("-e", "--endpoint"):
			host = arg
		if opt in ("-r", "--rootCA"):
			rootCAPath = arg
		if opt in ("-c", "--cert"):
			certificatePath = arg
		if opt in ("-k", "--key"):
			privateKeyPath = arg
		if opt in ("-w", "--websocket"):
			useWebsocket = True
except getopt.GetoptError:
	print(usageInfo)
	exit(1)

# Missing configuration notification
missingConfiguration = False
if not host:
	print("Missing '-e' or '--endpoint'")
	missingConfiguration = True
if not rootCAPath:
	print("Missing '-r' or '--rootCA'")
	missingConfiguration = True
if not useWebsocket:
	if not certificatePath:
		print("Missing '-c' or '--cert'")
		missingConfiguration = True
	if not privateKeyPath:
		print("Missing '-k' or '--key'")
		missingConfiguration = True
if missingConfiguration:
	exit(2)

# Configure logging
logger = logging.getLogger("AWSIoTPythonSDK.core")
logger.setLevel(logging.DEBUG)
streamHandler = logging.StreamHandler()
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
streamHandler.setFormatter(formatter)
logger.addHandler(streamHandler)

uid = getMac()
myAWSIoTMQTTClient = None
def myAWSIoTMQTTClient_connect():
	try:
		global myAWSIoTMQTTClient
		# Init AWSIoTMQTTClient
		# myAWSIoTMQTTClient = None
		myAWSIoTMQTTClient = AWSIoTMQTTClient(uid)
		myAWSIoTMQTTClient.configureEndpoint(host, 8883)
		myAWSIoTMQTTClient.configureCredentials(rootCAPath, privateKeyPath, certificatePath)

		# AWSIoTMQTTClient connection configuration
		myAWSIoTMQTTClient.configureAutoReconnectBackoffTime(1, 32, 20)
		myAWSIoTMQTTClient.configureOfflinePublishQueueing(-1)  # Infinite offline Publish queueing
		myAWSIoTMQTTClient.configureDrainingFrequency(2)  # Draining: 2 Hz
		myAWSIoTMQTTClient.configureConnectDisconnectTimeout(30)  # 10 sec
		myAWSIoTMQTTClient.configureMQTTOperationTimeout(5)  # 5 sec

		# Connect and subscribe to AWS IoT
		myAWSIoTMQTTClient.connect()
		myAWSIoTMQTTClient.subscribe("Generic/"+uid+"/rep", 1, callback_cert)
		time.sleep(2)
	except:
		myAWSIoTMQTTClient_connect()

myAWSIoTMQTTClient_connect()

msg = json.dumps({'ThingName':uid, 'ThingType':'DogFeeder'})
myAWSIoTMQTTClient.publish("Generic/"+uid+"/req", msg, 1)

# Loops until answer received from AWS IoT
# Waits 20 seconds and if answer not received, requests certificates again
while True:
	for x in range(0, 20):
		time.sleep(1)
		if idconf.flag == 0:
			print("New certificates created")
			myAWSIoTMQTTClient.publish("Generic/"+uid+"/done", msg, 1)
			idconf.flag = 1
			myAWSIoTMQTTClient.disconnect()
			sys.exit()
		
	msg = json.dumps({'ThingName':uid, 'ThingType':'DogFeeder'})
	myAWSIoTMQTTClient.publish("Generic/"+uid+"/req", msg, 1)
