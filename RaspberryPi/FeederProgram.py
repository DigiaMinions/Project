'''
/*
 * Copyright 2010-2016 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * You may not use this file except in compliance with the License.
 * A copy of the License is located at
 *
 *  http://aws.amazon.com/apache2.0
 *
 * or in the "license" file accompanying this file. This file is distributed
 * on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 * express or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */
 '''

from AWSIoTPythonSDK.MQTTLib import AWSIoTMQTTClient
import sys
import logging
import time
import getopt

import random # FOR MOCK DATA ONLY
from datetime import datetime
import os
import uuid # MAC address
import pigpio # Control PI GPIO ports
import HX711 # HX711 AD Converter
from JSONMaker import JSONMaker # DIY library for handling JSONs
import urllib # Download updates



#################################
### CLASS DECLARATIONS ##########

# Global variables
class globalVars:
	def __init__(self):
		self.messagesList = [0] * 12
		self.ID = 0
		self.scheduledFeed = None

# GPIO variables
class servoControl:
	def __init__(self):
		# Minimum and maximum pulsewidths
		self.pw_max = 1000
		self.pw_min = 1999
		# GPIO ports
		self.servo_upper = 19	# GPIO 19
		self.servo_lower = 26	# GPIO 26



#################################
### AWS IOT CALLBACKS ###########

# Custom MQTT message callback
def customCallback(client, userdata, message): # Is this necessary?
	print("Received a new message: ")
	print(message.payload)
	print("from topic: ")
	print(message.topic)
	print("--------------\n\n")

# When update available
def callback_update(client, userdata, message):
	print("Update available:")
	print("Current version: " + versionInfo)
	print("New version: " + message.payload)
	fetchUpdate()

# Callback for foodfeed
def callback_foodfeed(client, userdata, message):
	feedTime = validateFeedMessage(message.payload)
	if (feedTime == "now"):
		print("Instant foodfeed pressed")
		servo_feedFood()	
	elif (feedTime == ""):
		print("Food feed scheduled to: " + message.payload)
		gVars.scheduledFeed = message.payload
	# Tell AWS IoT the feed button has been clicked
	JsonCreator.createObject("FeedClick", getDateTime())



#################################
### SERVO FUNCTIONS #############

# Calibrate servos on boot
def servo_calibrate():
	pi.set_servo_pulsewidth(servoVars.servo_upper, servoVars.pw_min)
	pi.set_servo_pulsewidth(servoVars.servo_lower, servoVars.pw_min)
	time.sleep(3)
	pi.set_servo_pulsewidth(servoVars.servo_upper, servoVars.pw_max)
	pi.set_servo_pulsewidth(servoVars.servo_lower, servoVars.pw_max)
	time.sleep(2)
	pi.set_servo_pulsewidth(servoVars.servo_upper, servoVars.pw_min)
	pi.set_servo_pulsewidth(servoVars.servo_lower, servoVars.pw_min)

# Feed food from feedtube
def servo_feedFood():
	pi.set_servo_pulsewidth(servoVars.servo_lower, servoVars.pw_max)
	time.sleep(2)
	pi.set_servo_pulsewidth(servoVars.servo_lower, servoVars.pw_min)
	time.sleep(1)
	servo_fillFeeder() # Fill the feedtube after feeding

# Fill feedtube with new food
def servo_fillFeeder():
	pi.set_servo_pulsewidth(servoVars.servo_upper, servoVars.pw_max)
	time.sleep(3)
	pi.set_servo_pulsewidth(servoVars.servo_upper, servoVars.pw_min)
	time.sleep(1)



####################################
### USAGE INFO AND CONFIGURATIONS ##

# Usage info (Credit: AWS)
usageInfo = """Usage:

Use certificate based mutual authentication:
python basicPubSub.py -e <endpoint> -r <rootCAFilePath> -c <certFilePath> -k <privateKeyFilePath>

Use MQTT over WebSocket:
python basicPubSub.py -e <endpoint> -r <rootCAFilePath> -w

Type "python basicPubSub.py -h" for available options.
"""
# Help info (credit: AWS)
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

# Read in command-line parameters (credit: AWS)
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

# Missing configuration notification (credit: AWS)
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


# Configure logging (AWS)
logger = logging.getLogger("AWSIoTPythonSDK.core")
logger.setLevel(logging.DEBUG)
streamHandler = logging.StreamHandler()
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
streamHandler.setFormatter(formatter)
logger.addHandler(streamHandler)

# Init AWSIoTMQTTClient (AWS)
myAWSIoTMQTTClient = None
if useWebsocket:
	myAWSIoTMQTTClient = AWSIoTMQTTClient("DogFeeder", useWebsocket=True)
	myAWSIoTMQTTClient.configureEndpoint(host, 443)
	myAWSIoTMQTTClient.configureCredentials(rootCAPath)
else:
	myAWSIoTMQTTClient = AWSIoTMQTTClient("DogFeeder")
	myAWSIoTMQTTClient.configureEndpoint(host, 8883)
	myAWSIoTMQTTClient.configureCredentials(rootCAPath, privateKeyPath, certificatePath)

# AWSIoTMQTTClient connection configuration (AWS)
myAWSIoTMQTTClient.configureAutoReconnectBackoffTime(1, 32, 20)
myAWSIoTMQTTClient.configureOfflinePublishQueueing(-1)  # Infinite offline Publish queueing
myAWSIoTMQTTClient.configureDrainingFrequency(2)  # Draining: 2 Hz
myAWSIoTMQTTClient.configureConnectDisconnectTimeout(10)  # 10 sec
myAWSIoTMQTTClient.configureMQTTOperationTimeout(5)  # 5 sec

# Connect and subscribe to AWS IoT (partly AWS)
myAWSIoTMQTTClient.connect()
myAWSIoTMQTTClient.subscribe("sdk/test/Python", 1, customCallback)
myAWSIoTMQTTClient.subscribe("sdk/test/Foodfeed", 1, callback_foodfeed)
myAWSIoTMQTTClient.subscribe("sdk/test/Update", 1, callback_update)
time.sleep(2)



#################################
### LOAD CELL ###################

# Initialize load cell. Do this before usage
def lc_init():
	print("Start Load Cell with CH_B_GAIN_32 without callback")
	cell = HX711.sensor(pi, DATA=9, CLOCK=11, mode=CH_B_GAIN_32) # GPIO PORTS 9 AND 11
	time.sleep(1)
	cell.start()
	time.sleep(1)

# Get sensor data from load cell
def getLoadCellValue():
	# read data from Load Cell
	count, mode, reading = cell.get_reading()
	#print("Cell data " + str(reading)) # NULL BEFORE GETTING THE LOAD CELL
	returnvalue = random.randint(0,1000) # MOCK DATA
	return returnvalue	



################################
### HARDWARE MISC ##############

# Get hardware MAC address
def getMac():
	try:
		mac_addr = hex(uuid.getnode()).replace('0x', '0').upper()
		mac = ':'.join(mac_addr[i : i + 2] for i in range(0, 11, 2))
	except:
		print("Error retrieving MAC address")
	return mac

# Get current date and time
def getDateTime():
	dateTime = str(datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
	return dateTime

# Download available update
def fetchUpdate():
	url = 'https://github.com/DigiaMinions/Project/trunk/RaspberryPi' # INCOMPLETE. Should there be an update folder after testing?
	location = 'update/'
	# Download the file using system command and save it locally
	os.system("svn export " + url + " " + location + " --force")

def checkFeedSchedule():
	if (gVars.scheduledFeed is None):
		return
	elif (getDateTime() <= gVars.scheduledFeed):
		return
	else:
		gVars.scheduledFeed = None
		servo_feedFood()


	
#################################
### MESSAGE FUNCTIONS ###########

# Check if feedmessage from user is instant or scheduled feed
def validateFeedMessage(message):
	messageValue = 0
	try:
		datetime.datetime.strptime(message, "%Y-%m-%d %H:%M:%S")
		messageValue = "datetime"
	except ValueError:
		messageValue = "now"
	return messageValue

# Create a message part to AWS IoT
def createMessageSegment(load, index):
	dateTime = getDateTime() #str(datetime.now().strftime("%d-%m-%Y %H:%M:%S"))
	JsonCreator.createArray("load", str(dateTime) + '": "' + str(load))
	print(index) # DEBUG ONLY
	#message = "{\n" + "'ID': " + "'" + str(ID) + "'" + ",\n" + "'time': " + "'" + str(datetime.now().strftime("%Y-%m-%d %H:%M:%S")) + "',\n" + "'load': " + "'" + str(load) + "'\n" + "}"

# Add ID stamp to AWS IoT message
def createMessageIDStamp():
	JsonCreator.createObject("ID", gVars.ID)

# Assemble the full message from parts created
def getFinalMessage():
	return JsonCreator.getJson()



#################################
# MAIN program ##################

versionInfo = "0.3"

CH_A_GAIN_64 = 0 # Channel A gain 64
CH_A_GAIN_128 = 1 # Channel A gain 128
CH_B_GAIN_32 = 2 # Channel B gain 32

gVars = globalVars() # Init globalVars -class
gVars.ID = getMac() # Get MAC address for identification

pi = pigpio.pi() # Init pigpio library
servoVars = servoControl() # Init custom servo data

# Load cell data
count = 0
mode = 0
reading = 0

# Init load cell before main loop
lc_init()

# Infinite loop
while True:
	JsonCreator = JSONMaker()
	loop_count = 0
	while loop_count < 12: # Create 12 message segments
		message = createMessageSegment(getLoadCellValue(), loop_count)
		checkFeedSchedule() # Check if foodfeed scheduled, and feed if necessary
		loop_count += 1
		time.sleep(1)

	createMessageIDStamp() # Add device ID (MAC) to message before sending
	#fmessage = getFinalMessage() # Get final message (assembles from parts)
	myAWSIoTMQTTClient.publish("sdk/test/Python", str(getFinalMessage()), 1) # Create final message from previously made pieces and send it to AWS IoT
