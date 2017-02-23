#!/usr/bin/python
# coding=utf-8


from AWSIoTPythonSDK.MQTTLib import AWSIoTMQTTClient
import sys
import logging
import time
import getopt

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
import idconf

uid = idconf.id
path = "/feeder/"



#################################
### CLASS DECLARATIONS ##########


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
	print("New version: " + message.payload)
	fetchUpdate()


# Callback for user data
'''
flags info:
set_feed = instant foodfeed
set_schedule = schedule received, save to file
set_tare = recalculate load cell offset
get_schedule = client end asks current schedule, return it from file
'''
def callback_userdata(client, userdata, message):
	print("callback_userdata")
	flags = validateMessage(message.payload)

	if flags is not 'invalid': # If validation ok
		if flags is 'set_feed':
			print('Instant foodfeed pressed')
			try:
				JsonCreator.createObject('instantFeedClick', getDateTime()) # Tell AWS IoT the feed button has been clicked
				servo_feedFood()
				myAWSIoTMQTTClient.publish("DogFeeder/DeviceToApp/" + uid, str(replyMessage('feed', True)), 1)
			except:
				myAWSIoTMQTTClient.publish("DogFeeder/DeviceToApp/" + uid, str(replyMessage('feed', False)), 1)
		elif flags is 'set_schedule':
			schedule_writeToFile(message.payload)
			#JsonCreator.createObject('newSchedule', getDateTime())
		elif flags is 'set_tare':
			lc_tare()
		elif flags is 'get_schedule':
			schedule_getToApp()


#callback for load cell
def callback_loadcell(count, mode, reading):
	global loadList
	global loadList_tare
	global lc_offset
	global lc_referenceUnit
	if tare is False:
		if lc_initialReading is False:
			load = (reading - lc_offset) / lc_referenceUnit
			loadList.append(load)
		elif lc_initialReading is True:
			loadList.append(0)
	elif tare is True:
		load = reading / lc_referenceUnit
		loadList_tare.append(load)
		loadList.append(0)
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
myAWSIoTMQTTClient = AWSIoTMQTTClient(uid)
myAWSIoTMQTTClient.configureEndpoint(host, 8883)
myAWSIoTMQTTClient.configureCredentials(rootCAPath, privateKeyPath, certificatePath)

# AWSIoTMQTTClient connection configuration (AWS)
myAWSIoTMQTTClient.configureAutoReconnectBackoffTime(1, 32, 20)
myAWSIoTMQTTClient.configureOfflinePublishQueueing(-1)  # Infinite offline Publish queueing
myAWSIoTMQTTClient.configureDrainingFrequency(2)  # Draining: 2 Hz
myAWSIoTMQTTClient.configureConnectDisconnectTimeout(20)  # 20 sec
myAWSIoTMQTTClient.configureMQTTOperationTimeout(5)  # 5 sec



#################################
### LOAD CELL ###################


# Initialize load cell. Do this before usage
def lc_init():
	print("Start Load Cell with callback")
	global cell
	cell = HX711.sensor(pi, DATA=9, CLOCK=11, mode=CH_A_GAIN_64, callback=callback_loadcell) # GPIO PORTS 9 AND 11
	time.sleep(2)

	
# HOW TO CALCULATE THE REFFERENCE UNIT
# To set the reference unit to 1. Put 1kg on your sensor or anything you have and know exactly how much it weights.
# In this case, 92 is 1 gram because, with 1 as a reference unit I got numbers near 0 without any weight
# and I got numbers around 184000 when I added 2kg. So, according to the rule of thirds:
# If 2000 grams is 184000 then 1000 grams is 184000 / 2000 = 92.	
def lc_setReferenceUnit(value):
	global lc_referenceUnit
	lc_referenceUnit = value

def replyMessage(type, success):
	message = {}
	
	if type is 'feed':
		if success is True:
			message['confirmFeed'] = 'success'
		elif success is False:
			message['confirmTare'] = 'fail'
	
	elif type is 'setOffset'
		if success is True:
			message['confirmTare'] = 'success'
		elif success is False:
			message['confirmTare'] = 'fail'
	
	elif type is 'setSchedule':
		if success is True:
			message['confirmSave'] = 'success'
		elif success is False:
			message['confirmSave'] = 'fail'
	
	return json.dumps(message)
		
	
def lc_tare(): # Calculates and sets load cell offset
	global loadList_tare
	global lc_referenceUnit
	global lc_offset
	global tare
	
	tare = True
	JsonCreator.createObject('Tare start', getDateTime())
	
	try:
		referenceUnitTemp = lc_referenceUnit # Save current referenceUnit
		lc_referenceUnit = 1 # Temporarily set reference unit to 1
		loadAverage = 0
		
		while len(loadList_tare) is 0: # Wait until data available
			time.sleep(0.1)
			
		for i in range (0, 20): # take 20 samples
			if len(loadList_tare) is not 0:
				loadAverage += loadList_tare[len(loadList_tare)-1]
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
		myAWSIoTMQTTClient.publish("DogFeeder/DeviceToApp/" + uid, str(replyMessage('setOffset', True)), 1)
	except:
		myAWSIoTMQTTClient.publish("DogFeeder/DeviceToApp/" + uid, str(replyMessage('setOffset', False)), 1)

		
def saveOffset(value):
	with open(path + 'offset.dat', 'w') as file:
		file.write(str(value))
		print("Offset saved to file")

		
def readOffset(): # Read offset from file and save it to lc_offset
	try:
		with open(path + "offset.dat", "r") as file:
			offset = int(file.read())
			print("Offset loaded from file")
	except:
		print("Offset does not exist")
		offset = 0
	return offset

	
# Get sensor data from load cell (median from saved values)
def getLoadCellValue():
	global loadList
	global lc_initialReading
	
	medianLoad = 0
	if len(loadList) is not 0:
		medianLoad = sum(loadList) / len(loadList)
	del loadList[:]	 # loadList.clear() if < python 3.3
	
	# Disable lc_initialReading the first time function is run
	if lc_initialReading is True:
		lc_initialReading = False

	return medianLoad



################################
### HARDWARE MISC ##############


# Get hardware MAC address
def getMac(): # Not needed anymore.. replaced by uid
	try:
		mac_addr = hex(uuid.getnode()).replace('0x', '0').upper()
		mac = ':'.join(mac_addr[i : i + 2] for i in range(0, 11, 2))
	except:
		print("Error retrieving MAC address")
	return mac

	
# Download available update
def fetchUpdate():
	global path
	url = 'https://github.com/DigiaMinions/Project/trunk/RaspberryPi' # INCOMPLETE. Should there be an update folder after testing?
	location = 'update/'
	# Download the file using system command and save it locally
	os.system("svn export " + url + " " + path + " --force")
	
def createFiles():
	if not os.path.exists(path + 'schedule.dat'):
		open(path + 'schedule.dat', 'w').close()
	if not os.path.exists(path + 'schedule_fedtoday.dat'):
		open(path + 'schedule_fedtoday.dat', 'w').close()
	if not os.path.exists(path + 'todaysnumber.dat'):
		with open(path + 'todaysnumber.dat', 'w') as file:
			file.write(str(getTodaysNumber()))
	if not os.path.exists(path + 'offset.dat'):
		open(path + 'offset.dat', 'w').close()



###############################
### TIME FUNCTIONS ############
	
	
# Returns current date and time with seconds YYYY-MM-DD HH:MM:SS
def getDateTime():
	dateTime = str(datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
	return dateTime

	
# Returns current time HH:MM
def getTime():
	time = str(datetime.now().time().strftime("%H:%M"))
	return time


# Returns current date YYYY-MM-DD
def getDate():
	date = str(datetime.now().strftime("%Y-%m-%d"))
	return date


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


# Validates given date and returns True/False of its validity
def validateDate(content):
	dateFormat = '%Y-%m-%d'
	try:
		datetime.strptime(content, dateFormat)
		return True
	except ValueError:
		# raise ValueError("Incorrect date format, should be YYYY-MM-DD")
		return False


# Checks if day has changed and clears schedule_fedtoday.dat if daychange noticed.
# Compares todays number with todaysnumber.dat file.
def check_dayChange():
	with open(path + 'todaysnumber.dat', 'r') as file:
		content = int(file.read())
	today = getTodaysNumber()
	if content is not today:
		with open(path + 'todaysnumber.dat', 'w') as file:
			print("clearing already fed")
			file.write(str(today))
			schedule_clearFedToday()
	else:
		pass



#################################
### SCHEDULE FUNCTIONS ##########


# Goes through current schedule and determines if feeding is needed
def schedule_check():
	try:
		schedule = json.loads(schedule_readFromFile())

		# Go through each object in 'schedule'-array
		for content in schedule['schedule']:
			# one time schedule with date	
			if validateDate(str(content['rep'])):
				if getDate() >= str(content['rep']) and getTime() >= str(content['time']) and content['isActive'] is True:
					servo_feedFood()
					schedule_markAsInactive(str(content['id']))
		
			elif validateDate(str(content['rep'])) == False:
				if getTodaysNumber() in parseRep(int(content['rep'])):
					if getTime() == str(content['time']) and content['isActive'] is True:
						if schedule_isFedToday(str(content['id'])) == True:
							pass
						elif schedule_isFedToday(str(content['id'])) == False:
							servo_feedFood()
							schedule_markAsFedToday(str(content['id']))
				else:
					pass
	except:
		pass


# Write payload json to file
def schedule_writeToFile(content):	
	try:
		with open(path + 'schedule.dat', 'w') as file:
			file.write(content)
		myAWSIoTMQTTClient.publish("DogFeeder/DeviceToApp/" + uid, str(replyMessage('setSchedule', True)), 1)
		
	except:
		print("FATAL: COULDN'T WRITE SCHEDULE TO FILE")
		myAWSIoTMQTTClient.publish("DogFeeder/DeviceToApp/" + uid, str(replyMessage('setSchedule', False)), 1)


# Read schedule from file and return to caller
def schedule_readFromFile():
	try:
		with open(path + 'schedule.dat', 'r') as file:
			content = str(file.read())
			return content
	except:
		print("FATAL ERROR READING SCHEDULE FROM FILE")
		return null


# Returns currently saved schedule to end user
def schedule_getToApp():
	content = schedule_readFromFile()
	myAWSIoTMQTTClient.publish("DogFeeder/DeviceToApp/" + uid, str(content), 1)


# Marks given id as inactive to schedule.dat
def schedule_markAsInactive(id):
	print("Marking ID " + id + " as inactive..")
	with open(path + 'schedule.dat', 'r') as file:
		data = json.load(file)
		file.seek(0)

		for object in data['schedule']:
			print(object['id'])
			if id == object['id']:
				object['isActive'] = 'false'
				print("OK")
				file.write(json.dumps(data))
				file.truncate()


# Clears schedule_fedtoday.dat file
def schedule_clearFedToday():
	print("Clearing schedule_fedtoday.dat")
	with open(path + 'schedule_fedtoday.dat', 'w') as file:
		pass


# marks given id as already fed this day to schedule_fedtoday.dat
def schedule_markAsFedToday(id):
	with open(path + 'schedule_fedtoday.dat', 'w') as file:
		file.write(str(id) + "\n")


# Checks if already fed today with given id and returns True/False
def schedule_isFedToday(id):
	isFound = False

	with open(path + 'schedule_fedtoday.dat', 'r') as file:
		if os.stat('schedule_fedtoday.dat').st_size == 0:
			return False
		else:
				with open(path + 'schedule_fedtoday.dat', 'r') as file:
					content = file.read().splitlines()
				for line in content:
					if line == id:
						isFound = True
	return isFound



#################################
### MESSAGE FUNCTIONS ###########


'''
{
	"schedule": [{
		"id": "1",
		"time": "10:00",
		"rep": "1",
		"isActive": "true"
	}, {
		"id": "2",
		"time": "11:00",
		"rep": "1",
		"isActive": "true"
	}, {
		"id": "3",
		"time": "2017-02-08 12:00",
		"isActive": "true"
	}]
}
'''
#
# Käyttäjän päädystä saapuvan payload-jsonin validointi
def validateMessage(payload):
	# Value to return at the end
	flags = None
	
	try:
		content = json.loads(payload) # Validates as valid JSON  
	except Error:
		flags = 'Payload is not valid JSON'
		return flags

	# 'feed' can be found only if user wants instant foodfeed
	if 'feed' in content:
		flags = 'set_feed' # set return flags to instant feed

	# schedule can be found is user sends a schedule
	elif 'schedule' in content:
		flags = 'set_schedule'
	
	# 'tare' can be found if user wants to recalculate load cell offset
	elif 'tare' in content:
		flags = 'set_tare'
	
	# If user requests something from device
	elif 'get' in content:
		request = content['get']
		# If user requests current schedule saved in device
		if 'schedule' in request:
			flags = 'get_schedule'
		else:
			pass
			
	# If Json doesn't have required objects or arrays
	else:
		flags = 'invalid'

	print('Flags ' + str(flags))
	return flags


# Create a message part to AWS IoT
def createMessageSegment(load, index):
	global JsonCreator
	dateTime = getDateTime()
	JsonCreator.createArray("load", str(dateTime) + '": "' + str(load))


# Add ID stamp to AWS IoT message
def createMessageIDStamp():
	global JsonCreator
	JsonCreator.createObject("ID", uid)


# Assemble the full message from parts created
def getFinalMessage():
	global JsonCreator
	return JsonCreator.getJson()



#################################
### AWS IoT Connection ##########


# Connect and subscribe to AWS IoT (partly AWS)
myAWSIoTMQTTClient.connect()
myAWSIoTMQTTClient.subscribe("DogFeeder/Data/" + uid, 1, callback_data) # TODO Is this needed in the end product? Repeats sent message in terminal
myAWSIoTMQTTClient.subscribe("DogFeeder/AppToDevice/" + uid, 1, callback_userdata)
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
		myAWSIoTMQTTClient.publish("DogFeeder/Data/" + uid, str(getFinalMessage()), 1) # Create final message from previously made pieces and send it to AWS IoT


def thread1():
	interval = 1
	while True:
		check_dayChange()
		schedule_check()
		time.sleep(interval)



#################################
### MAIN program ################

createFiles() # Create necessary files on boot if not exists

messagesList = [0] * 12
ID = getMac()  # Get MAC address for identification

cell = None # Load cell variable gets initialized here
servoStatus = False # Boolean telling if servos being currently used
JsonCreator = JSONMaker()

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
loadList_tare = []
lc_offset = readOffset()
lc_referenceUnit = 1000 #932
lc_initialReading = True

lc_init()

while len(loadList) == 0:
	cell.cancel()
	time.sleep(1)
	lc_init()

servo_fillFeeder() # Make sure the feeding tube is filled after boot

# Initialize thread(s)
try:
	thread.start_new_thread( thread0, ()) # MAIN get load cell data and send to AWS IoT
	thread.start_new_thread( thread1, ()) # Food feed scheduling
except (KeyboardInterrupt, SystemExit):
	cleanup_stop_thread();
	myAWSIoTMQTTClient.disconnect()
	cell.stop()
	pi.stop()
	sys.exit()

# Keep the program running infinitely
while True:
	time.sleep(0.1)
