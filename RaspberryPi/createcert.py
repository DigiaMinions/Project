from AWSIoTPythonSDK.MQTTLib import AWSIoTMQTTClient
import sys
import logging
import time
import getopt
import json
import os
<<<<<<< HEAD
import sys
import subprocess
import thread
if os.path.exists('idconf.py'):
	import idconf
	curid = idconf.id	
# Custom MQTT message callback
=======
#import idconf
import sys
import subprocess

if os.path.exists('idconf.pyc'):
	import idconf
	#curid = idconf.id
else:
	f = open('idconf.py', 'w+')
	f.write("id = ''")
	f.close
	import idconf
		
>>>>>>> 8bf1634... cert creator fixed
def customCallback(client, userdata, message):

	try:
		idconf.id
	except NameError:
		print "curid not defined"
	else:
		curid= idconf.id
		try:
			os.remove('cert/' + curid + '.cert.pem')
		except OSError:
			pass
		try:
			os.remove('cert/' + curid + '.public.key')
		except OSError:
			pass
		try:
			os.remove('cert/' + curid + '.private.key')
		except OSError:
			pass
	cert = json.loads(message.payload)
	id = cert['certificateArn'].split('/')
	f = open('idconf.py', 'w')
	f.write("id = '" + id[1] + "'")
	f.close
	#idconf.id = id[1]

	certpem= 'cert/' + str(id[1]) +'.cert.pem'
	f = open(certpem, 'w')
	f.write(cert['certificatePem'])
	f.close

	certpub= 'cert/' + str(id[1]) + '.public.key'
	f = open (certpub, 'w')
	f.write(cert['keyPair']['PublicKey'])
	f.close

	certpriv= 'cert/' + str(id[1]) +'.private.key'
	f = open(certpriv, 'w')
	f.write(cert['keyPair']['PrivateKey'])
	f.close

	try:
		os.remove('cert/4847123d22-certificate.pem.crt')
	except OSError:
		pass
	try:
		os.remove('cert/4847123d22-public.pem.key')
	except OSError:
		pass
	try:
		os.remove('cert/4847123d22-private.pem.key')
	except OSError:
		pass

	print id[1]
	#print cert[0]['certificatePem']
<<<<<<< HEAD
	idconf.flag = 1

=======
	#sys.exit()
	idconf.flag = 1
>>>>>>> 8bf1634... cert creator fixed

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

# Init AWSIoTMQTTClient
myAWSIoTMQTTClient = None
if useWebsocket:
	myAWSIoTMQTTClient = AWSIoTMQTTClient("basicPubSub", useWebsocket=True)
	myAWSIoTMQTTClient.configureEndpoint(host, 443)
	myAWSIoTMQTTClient.configureCredentials(rootCAPath)
else:
	myAWSIoTMQTTClient = AWSIoTMQTTClient("CliId1")
	myAWSIoTMQTTClient.configureEndpoint(host, 8883)
	myAWSIoTMQTTClient.configureCredentials(rootCAPath, privateKeyPath, certificatePath)

# AWSIoTMQTTClient connection configuration
myAWSIoTMQTTClient.configureAutoReconnectBackoffTime(1, 32, 20)
myAWSIoTMQTTClient.configureOfflinePublishQueueing(-1)  # Infinite offline Publish queueing
myAWSIoTMQTTClient.configureDrainingFrequency(2)  # Draining: 2 Hz
myAWSIoTMQTTClient.configureConnectDisconnectTimeout(10)  # 10 sec
myAWSIoTMQTTClient.configureMQTTOperationTimeout(5)  # 5 sec

# Connect and subscribe to AWS IoT
myAWSIoTMQTTClient.connect()
#myAWSIoTMQTTClient.subscribe("Generic/CliId1/rep", 1, customCallback)
time.sleep(2)
myAWSIoTMQTTClient.subscribe("Generic/CliId1/rep", 1, customCallback)
# Publish to the same topic in a loop forever

if __name__ == "__main__":
<<<<<<< HEAD
	msg = json.dumps({'ThingName':'CliId1', 'ThingType':'Feeder'})
	myAWSIoTMQTTClient.publish("Generic/CliId1/req", msg, 1)
	if idconfig.flag:
		print "everything went well"
		idconfig.flag= 0
		cleanup_stop_thread();
		sys.exit()
	else:
		print "something went horribly wrong"
=======
	while 1:
		msg = json.dumps({'ThingName':'CliId1', 'ThingType':'Feeder'})
		myAWSIoTMQTTClient.publish("Generic/CliId1/req", msg, 1)
		time.sleep(5)
		if idconf.flag:
			print "everything works fine"
			idconf.flag = 0
			myAWSIoTMQTTClient.disconnect()
			sys.exit()
		else:	
			print "something went horribly wrong"

>>>>>>> 8bf1634... cert creator fixed
