import sys
import getopt
import os
import sys
import subprocess
import thread
import uuid

	
# Get hardware MAC address	
try:
	mac_addr = hex(uuid.getnode()).replace('0x', '0').upper()
	mac = ':'.join(mac_addr[i : i + 2] for i in range(0, 11, 2))
	mac = mac.replace(":","")
except:
	print("Error retrieving MAC address")
print("mac: " + mac)
