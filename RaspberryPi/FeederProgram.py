#!/usr/bin/python
# coding=utf-8

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
import json # Parsing Json
import thread # Threading
import re
#import statistics # For calculating median
#import numpy

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
	flags, schedule = validateFeedMessage(message.payload)

	if flags is not 'invalid': # If validation ok
		if flags is 'instant':
			print('Instant foodfeed pressed')
			JsonCreator.createObject('instantFeedClick', getDateTime()) # Tell AWS IoT the feed button has been clicked
			servo_feedFood()
		elif flags is 'schedule':
			scheduleFileWrite(schedule)
			JsonCreator.createObject('newSchedule', getDateTime())

#callback for load cell
def callback_loadcell(count, mode, reading):
	global loadList
	global lc_offset
	global lc_referenceUnit
	load = (reading - lc_offset) / lc_referenceUnit
#	if load < 0:
#		load = 0
	loadList.append(load)
	print('Raw load: '+ str(reading) +', Calculated load: '+ str(load))


#################################
### SERVO FUNCTIONS #############

# Calibrate servos on boot
def servo_calibrate():
	servo_setStatus(True)
	pi.set_servo_pulsewidth(servoVars.servo_upper, servoVars.pw_min)
	pi.set_servo_pulsewidth(servoVars.servo_lower, servoVars.pw_min)
	time.sleep(3)
	pi.set_servo_pulsewidth(servoVars.servo_upper, servoVars.pw_max)
	pi.set_servo_pulsewidth(servoVars.servo_lower, servoVars.pw_max)
	time.sleep(2)
	pi.set_servo_pulsewidth(servoVars.servo_upper, servoVars.pw_min)
	pi.set_servo_pulsewidth(servoVars.servo_lower, servoVars.pw_min)
	servo_setStatus(False)

# Feed food from feedtube
def servo_feedFood():
	# If servos being used, wait and try again until available
	while servo_getStatus():
		print("Servos not available, waiting..")
		time.sleep(1)

	print("Feeding now")
	servo_setStatus(True)
	pi.set_servo_pulsewidth(servoVars.servo_lower, servoVars.pw_max)
	time.sleep(2)
	pi.set_servo_pulsewidth(servoVars.servo_lower, servoVars.pw_min)
	time.sleep(1)
	servo_fillFeeder() # Fill the feedtube after feeding

# Fill feedtube with new food
def servo_fillFeeder():
	print("Filling feedtube")
	pi.set_servo_pulsewidth(servoVars.servo_upper, servoVars.pw_max)
	time.sleep(3)
	pi.set_servo_pulsewidth(servoVars.servo_upper, servoVars.pw_min)
	time.sleep(1)
	servo_setStatus(False)

# Is something using servos?
def servo_setStatus(bool):
	global servoStatus
	if (bool == True):
		servoStatus = True
	else:
		servoStatus = False

# Return servo status
def servo_getStatus():
	global servoStatus
	return servoStatus


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



#################################
### LOAD CELL ###################

# Initialize load cell. Do this before usage
def lc_init():
	print("Start Load Cell with callback")
	global cell
	cell = HX711.sensor(pi, DATA=9, CLOCK=11, mode=CH_A_GAIN_64, callback=callback_loadcell) # GPIO PORTS 9 AND 11
	time.sleep(3)

# HOW TO CALCULATE THE REFFERENCE UNIT
# To set the reference unit to 1. Put 1kg on your sensor or anything you have and know exactly how much it weights.
# In this case, 92 is 1 gram because, with 1 as a reference unit I got numbers near 0 without any weight
# and I got numbers around 184000 when I added 2kg. So, according to the rule of thirds:
# If 2000 grams is 184000 then 1000 grams is 184000 / 2000 = 92.	
def lc_setReferenceUnit(value):
	global lc_referenceUnit
	lc_referenceUnit = value
	
def lc_setOffset(value):
	global lc_offset
	lc_offset = value
	
def lc_tare(): # Sets offset to load cell data
	global lc_referenceUnit
	global loadList
	global lc_offset
	referenceUnitTemp = lc_referenceUnit
	lc_referenceUnit = 1
	loadAverage = 0
	time.sleep(1)
	for i in range (0, 10): # run 10 times
		loadAverage += loadList[len(loadList)-1]
		print("Tare: " + str(i) + " Load: " + str(loadAverage))
		time.sleep(0.3)
	lc_offset = loadAverage / 10	
	print("Endload: " + str(lc_offset))
	lc_referenceUnit = referenceUnitTemp

# Get sensor data from load cell
def getLoadCellValue():
	global loadList
	medianLoad = sum(loadList) / len(loadList)
	del loadList[:]	 # loadList.clear() if < python 3.3
	return medianLoad
	
	# Kellota huomenna clear!!!
	#$ python -mtimeit "l=list(range(1000))" "b=l[:];del b[:]"
	#$ python -mtimeit "l=list(range(1000))" "b=l[:];b[:] = []"



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

def checkFeedSchedule(): # TODO tähän sitten joku superfunktio lukemaan tadaa tiedostosta ja poistelemaan yms.
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
def validateFeedMessage(data):
    # Values to return at the end
    flags = None
    messageSchedule = None
    
    # What regex to look for in a string
    regex = "rep";
    
    # Different time formats to use
    clockFormat = '%H:%M:%S'
    dateFormat = '%Y-%m-%d'
    dateTimeFormat = '%Y-%m-%d %H:%M:%S'
        
    # foodfeed can be found only if user presses instant feed button
    if 'foodfeed' in data:
        dataValue = data['foodfeed'] # TODO is this needed or is it enough to have 'foodfeed'? to be sure?
        if dataValue is 'instant':
            flags = dataValue # set return flags to instant feed

    # schedule can be found is user sends a schedule
    elif 'schedule' in data:
        list = data['schedule']
        messageSchedule = [] # Initialize schedulearray
        flags = 'schedule' # set flags to scheduled feeding
        for index in range(len(list)):
            try:                
                if bool(re.search(regex, list[index])) is True: # If string has regex..
                    position = list[index].find(regex) # Find the position of regex
                    savedRegex = list[index][position:] # Save regex and everything behind it
                    list[index] = list[index][:position] # Remove regex from the string (temporarily)
                    list[index] = str(datetime.strptime(list[index], clockFormat).time()) # Make sure the time format is correct
                    list[index] = list[index] + savedRegex # Add regex back to string
                    messageSchedule.append(list[index]) # Append to schedulelist
                else: # If string doesn't have regex just check the datetime is valid
                    messageSchedule.append(str(datetime.strptime(list[index], dateTimeFormat)))
            except ValueError: # If the string has invalid date/time format
                messageSchedule.append('invalid')        
    else: # If Json doesn't have required objects or arrays
        flags = 'invalid'

    print('Flags ' + flags)
    print('messageSchedule ' + messageSchedule)
    return flags, messageSchedule
	
def scheduleFileWrite(schedule):
    with open("schedule.dat", "w") as file:
        for index in range(len(schedule)):
            if schedule[index] is 'invalid':
                JsonCreator.createObject('Error', 'invalid time detected')
                print('Error')
            else:
                file.write(schedule[index] + '\n')

# Create a message part to AWS IoT
def createMessageSegment(load, index):
	global JsonCreator
	dateTime = getDateTime()
	JsonCreator.createArray("load", str(dateTime) + '": "' + str(load))
	#print(index) # DEBUG ONLY

# Add ID stamp to AWS IoT message
def createMessageIDStamp():
	global JsonCreator
	JsonCreator.createObject("ID", gVars.ID)

# Assemble the full message from parts created
def getFinalMessage():
	global JsonCreator
	return JsonCreator.getJson()



#################################
### AWS IoT Connection ##########

# Connect and subscribe to AWS IoT (partly AWS)
myAWSIoTMQTTClient.connect()
myAWSIoTMQTTClient.subscribe("DogFeeder/Data", 1, customCallback)
myAWSIoTMQTTClient.subscribe("DogFeeder/" + getMac(), 1, callback_foodfeed)
myAWSIoTMQTTClient.subscribe("DogFeeder/Update", 1, callback_update)
time.sleep(1.5)



#################################
### THREADS #####################

def thread0():
	global JsonCreator
	interval = 1
	while True:
		JsonCreator = JSONMaker()
		loop_count = 0
		while loop_count < 12:
			message = createMessageSegment(getLoadCellValue(), loop_count)
			loop_count += 1
			time.sleep(interval)
		createMessageIDStamp()
		myAWSIoTMQTTClient.publish("DogFeeder/Data", str(getFinalMessage()), 1) # Create final message from previously made pieces and send it to AWS IoT
		
def thread1():
	interval = 1
	while True:
		checkFeedSchedule()
		time.sleep(interval)
		
		

#################################
### MAIN program ################

cell = None # Load cell variable gets initialized here
servoStatus = False # Boolean telling if servos being currently used
JsonCreator = None

gVars = globalVars() # Init globalVars -class
gVars.ID = getMac() # Get MAC address for identification

pi = pigpio.pi() # Initialize pigpio library
servoVars = servoControl() # Initialize custom servo data

# Load cell data
#count = 0
#mode = 0
#reading = 0

# All scheduled feed times
masterSchedule = []

# Init load cell before main loop
CH_A_GAIN_64 = 0 # Channel A gain 64. Preset for load cell
CH_A_GAIN_128 = 1 # Channel A gain 128. Preset for load cell
CH_B_GAIN_32 = 2 # Channel B gain 32. Preset for load cell

loadList = [] # Global array for load cell data
lc_offset = 0
lc_referenceUnit = 932
#lc_setReferenceUnit = 100 # TODO tämä mitattava
while len(loadList) == 0:
	lc_init()
	time.sleep(1)
print("TARE START")
lc_tare() # TODO missä kohtaa tämä kannattaisi tehdä? Käyttäjän napinpainalluksella? Esiasennuksella?
print("TARE END")
# Initialize thread(s)
try:
	thread.start_new_thread( thread0, ()) # MAIN get load cell data and send to AWS IoT
	thread.start_new_thread( thread1, ()) # Food feed scheduling
except (KeyboardInterrupt, SystemExit):
	cleanup_stop_thread();
	sys.exit()

# Infinite loop
while True:
	time.sleep(0.1)
