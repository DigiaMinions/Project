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
		self.pw_max = 2500
		self.pw_min = 500
		# GPIO ports
		self.servo_upper = 19	# GPIO 19
		self.servo_lower = 26	# GPIO 26



#################################
### CALLBACKS ###########

# Custom MQTT message callback
def callback_data(client, userdata, message): # Is this necessary?
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

# Callback for user data
'''
flags info:
feed = instant foodfeed
schedule = schedule received, save to file
tare = recalculate load cell offset
'''
def callback_userdata(client, userdata, message):
	print("Callback_foodfeed")
	flags, schedule = validateMessage(message.payload)

	if flags is not 'invalid': # If validation ok
		if flags is 'feed':
			print('Instant foodfeed pressed')
			JsonCreator.createObject('instantFeedClick', getDateTime()) # Tell AWS IoT the feed button has been clicked
			servo_feedFood()
		elif flags is 'schedule':
			scheduleFileWrite(schedule)
			JsonCreator.createObject('newSchedule', getDateTime())
		elif flags is 'tare':
			lc_tare()

#callback for load cell
def callback_loadcell(count, mode, reading):
	global loadList
	global lc_offset
	global lc_referenceUnit
	if tare is False:
		load = (reading - lc_offset) / lc_referenceUnit
	else:
		load = reading / lc_referenceUnit

#	if load < 0 and tare is False :
#		load = 0
	loadList.append(load)
#	print('Raw load: '+ str(reading) +', Calculated load: '+ str(load))


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
	time.sleep(1.5)
	pi.set_PWM_dutycycle(servoVars.servo_lower, 0) # Shut PWM
	servo_fillFeeder() # Fill the feedtube after feeding

# Fill feedtube with new food
def servo_fillFeeder():
	print("Filling feedtube")
	pi.set_servo_pulsewidth(servoVars.servo_upper, servoVars.pw_max)
	time.sleep(3)
	pi.set_servo_pulsewidth(servoVars.servo_upper, servoVars.pw_min)
	time.sleep(1.5)
	pi.set_PWM_dutycycle(servoVars.servo_upper, 0) # Shut PWM
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

def lc_tare(): # Calculates and sets load cell offset
	global loadList
	global lc_referenceUnit
	global lc_offset
	global tare
	
	tare = True
	JsonCreator.createObject('Tare start', getDateTime())
	referenceUnitTemp = lc_referenceUnit # Save current referenceUnit
	lc_referenceUnit = 1 # Temporarily set reference unit to 1
	loadAverage = 0
	
	while len(loadList) is 0: # Wait until data available
		time.sleep(0.1)
		
	for i in range (0, 20): # take 20 samples
		if len(loadList) is not 0:
			loadAverage += loadList[len(loadList)-1]
			time.sleep(0.25)
		else:
			i = i - 1
			time.sleep(0.25)
	lc_offset = loadAverage / 20
	print("Tare endload: " + str(lc_offset))
	lc_referenceUnit = referenceUnitTemp
	tare = False
	JsonCreator.createObject('Tare end', getDateTime())
	
	saveOffset(lc_offset) # Save offset to file

def saveOffset(value):
	with open('offset.dat', 'w') as file:
		file.write(str(value))
		print("Offset saved to file")
	
def readOffset(): # Read offset from file and save it to lc_offset
	with open("offset.dat", "r") as file:
		offset = int(file.read())
		print("Offset loaded from file")
	return offset

# Get sensor data from load cell
def getLoadCellValue():
	global loadList
	medianLoad = 0
	if len(loadList) is not 0:
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

# Download available update
def fetchUpdate():
	url = 'https://github.com/DigiaMinions/Project/trunk/RaspberryPi' # INCOMPLETE. Should there be an update folder after testing?
	location = 'update/'
	# Download the file using system command and save it locally
	os.system("svn export " + url + " " + location + " --force")



###############################
### TIME FUNCTIONS ############
	
# Get current date and time
def getDateTime():
	dateTime = str(datetime.now().strftime("%Y-%m-%d %H:%M"))
	return dateTime

# Get current time
def getTime():
	time = str(datetime.now().time().strftime("%H:%M"))
	return time

# Get the number of a current weekday as binary (1 2 4 8 16 32 64)
def getTodaysNumber():
	number = int(datetime.now().weekday() + 1) # Monday defaults to 0. Make it 1
	currentValue = 1
	if number is not 1:
		for i in range(number - 1):
			currentValue = currentValue * 2
	return currentValue

# Convert number from user schedule message to day numbers and return as a list
def parseRep(repValue):
	# 1 2 4 8 16 32 64
	repList = []
	currentValue = 64
	while currentValue >= 1:
		if repValue >= currentValue:
			repList.append(currentValue)
			repValue = repValue - currentValue
			currentValue = currentValue / 2
		else:
			currentValue = currentValue / 2
	return repList

def checkFeedSchedule(): # TODO tähän sitten joku superfunktio lukemaan tadaa tiedostosta ja poistelemaan yms.
	regex = 'rep'
	removalList = [] # What schedules to remove after the content loop finishes

	with open('schedule.dat', 'r') as file: # Open the schedule-file for reading
		content = file.read().splitlines() # Split schedule line by line

	for line in content: # Go through each line
		if bool(re.search(regex, line)) is True: # If line has the repeating regex
			position = line.find(regex) # Find the position of regex
			repValue = int(line[position +3:]) # Get the number following the regex and save it as integer
			
			# Check if current day matches with a day referenced behind the regex
			if getTodaysNumber() in parseRep(repValue): # If the day is a match
				timeTemp = line[:position]
				if getTime() >= timeTemp:
					if line in feedSchedule_getList():
						pass
					else:
						servo_feedFood()
						feedSchedule_markAsFed(line)
		elif bool(re.search(regex, line)) is False: # If regex couldn't be found (one-time scheduled feed) and the time has passed
			if getDateTime() >= line:
				removalList.append(line) # Flag the line to be removed
				servo_feedFood()
		else: # When something goes wrong..
			print('Error reading schedule')

	# Remove flagged lines
	if len(removalList) is not 0:
		for line in removalList:
			while line in content:
				content.remove(line)
		with open('schedule.dat', 'w') as file:
			for line in removalList:
				while line in content:
					content.remove(line)
			for line in content:
				file.write(str(line) + '\n')
		print("REMOVED SOMETHING")

def feedSchedule_markAsFed(string):
	with open('schedule_fedtoday.dat', 'a') as file:
		file.write(string)

def feedSchedule_getList():
	fedList = []
	if os.stat('schedule_fedtoday.dat').st_size == 0:
		fedList.append("null")
	else:
		with open('schedule_fedtoday.dat', 'r') as file:
			content = file.read().splitlines()
		for line in content:
			fedList.append(str(line))
	return fedList

def feedSchedule_clearTodaysFed():
	print("Todays fedlist cleared")
	with open('schedule_fedtoday.dat', 'w') as file:
		pass

def check_dayChange():
	global today
	number = getTodaysNumber()
	if number is not today:
		today = number
		feedSchedule_clearTodaysFed()
	else:
		pass
	


#################################
### MESSAGE FUNCTIONS ###########

# Check if feedmessage from user is instant or scheduled feed
def validateMessage(data):
	# Values to return at the end
	flags = None
	messageSchedule = None
    
	# What regex to look for in a string
	regex = "rep";
    
	# Different time formats to use
	clockFormat = '%H:%M'
	dateFormat = '%Y-%m-%d'
	dateTimeFormat = '%Y-%m-%d %H:%M'
	data = json.loads(data)    

	# foodfeed can be found only if user presses instant feed button
	if 'feed' in data:
		flags = 'feed' # set return flags to instant feed

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
				# tare can be found if user wants to reset load cell offset
	elif 'tare' in data:
		flags = 'tare'
	else: # If Json doesn't have required objects or arrays
		flags = 'invalid'

	print('Flags ' + str(flags))
	print('messageSchedule ' + str(messageSchedule))
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
myAWSIoTMQTTClient.subscribe("DogFeeder/Data", 1, callback_data) # TODO Is this needed in the end product? Repeats sent message in terminal
myAWSIoTMQTTClient.subscribe("DogFeeder/" + getMac(), 1, callback_userdata)
myAWSIoTMQTTClient.subscribe("DogFeeder/Update", 1, callback_update) # Updates available. Shared topic for all DogFeeders
time.sleep(1)



#################################
### THREADS #####################

def thread0():
	global JsonCreator
	interval = 1
	while True:
		JsonCreator = JSONMaker()
		loop_count = 0
		while loop_count < 12:
			print(str(loop_count))
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

today = getTodaysNumber()

cell = None # Load cell variable gets initialized here
servoStatus = False # Boolean telling if servos being currently used
JsonCreator = None

gVars = globalVars() # Init globalVars -class
gVars.ID = getMac() # Get MAC address for identification

servoVars = servoControl() # Initialize custom servo data
pi = pigpio.pi() # Initialize pigpio library
pi.set_PWM_dutycycle(servoVars.servo_upper, 0) # Shut PWM
pi.set_PWM_dutycycle(servoVars.servo_lower, 0) # Shut PWM


# All scheduled feed times
masterSchedule = []

# Init load cell before main loop
CH_A_GAIN_64 = 0 # Channel A gain 64. Preset for load cell
CH_A_GAIN_128 = 1 # Channel A gain 128. Preset for load cell
CH_B_GAIN_32 = 2 # Channel B gain 32. Preset for load cell

tare = False
loadList = [] # Global array for load cell data
lc_offset = readOffset()
lc_referenceUnit = 1000 #932

lc_init()

while len(loadList) == 0:
	cell.cancel()
	time.sleep(1)
	lc_init()

#lc_tare() # TODO missä kohtaa tämä kannattaisi tehdä? Käyttäjän napinpainalluksella? Esiasennuksella?

# Initialize thread(s)
try:
	thread.start_new_thread( thread0, ()) # MAIN get load cell data and send to AWS IoT
	thread.start_new_thread( thread1, ()) # Food feed scheduling
except (KeyboardInterrupt, SystemExit):
	cleanup_stop_thread();
	cell.stop()
	pi.stop()
	sys.exit()

# Infinite loop
while True:
	time.sleep(0.1)
