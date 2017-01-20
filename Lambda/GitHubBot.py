import boto3
import json
import sys
import logging
client = boto3.client('iot-data', region_name='eu-west-1')
logger = logging.getLogger()
logger.setLevel(logging.INFO)

def handler(event, context):
    
    msg = event['Records'][0]['Sns']['Message']
    
    #parsed_msg = json.dumps(msg)
    #adds = parsed_msg["commits"][0]["added"]
        
    #logger.info("Got this from git: " + str(parsed_msg))
    
    if str(msg).find("RaspberryPi/Python"):
        logger.info("Sending msg to raspberrypi")
        response = client.publish(
            topic='sdk/test/Update',
            qos=1,
            payload=json.dumps({"foo":"bar"})
            
        )
    return event