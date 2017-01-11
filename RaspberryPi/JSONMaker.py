'''
/*
 * Copyright (c) 2017 Miika Avela
 *
 * Permission is heeby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MECHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
 * CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 * TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OF OTHER DEALINGS IN THE SOFTWARE.
 */
 '''

# DIY Jsonlibrary for creating message to AWS IoT
class JSONMaker:
	def __init__(self):
		self.objectList = []
		self.arrayList = []
		
	def createObject(self, name, value):
		self.objectList.append('"' + name + '": "' + value + '"')
		
	def createArray(self, name, value):
		# Check if array already exists
		found = False
		namecheck = '"' + name + '"'
		for i, elem in enumerate(self.arrayList):
			if namecheck in elem:
				found = True
				position = i
				length = len(self.arrayList[position])

				tempStr = self.arrayList[position]
				self.arrayList[position] = tempStr[:length -2] + ',\n{"' + value + '"}\n' + tempStr[length -1:]
		
			# If array doesn't exist
		if found == False:
		    self.arrayList.append('"' + name + '": [\n' + '{"' + value + '"}\n]')
			
	def getJson(self):
		message = '{\n'
		for obj in self.objectList:
			message = message + obj + ',\n'
		for arr in self.arrayList:
			message = message + arr + ',\n'
		
		# remove last "," after last array
		messageTmp = message[:len(message) - 1]
		messageTmp = messageTmp.rstrip(",")
		messageTmp + message[len(message) - 1:]
		message = messageTmp + '\n}'

		#message = message + '}'
		return message
