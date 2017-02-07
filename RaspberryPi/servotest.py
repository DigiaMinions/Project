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
		
		

#################################
### MAIN program ################


servoStatus = False # Boolean telling if servos being currently used

servoVars = servoControl() # Initialize custom servo data


try:
	pi = pigpio.pi() # Initialize pigpio library
	time.sleep(1)
	servo_calibrate()
	time.sleep(5)
	servo_feedFood()
	time.sleep(5)
	servo_fillFeeder()
	time.sleep(4)



except (KeyboardInterrupt, SystemExit):
	cleanup_stop_thread();
	cell.stop()
	pi.stop()
	sys.exit()

