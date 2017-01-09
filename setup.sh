#!/bin/bash
START_STOP=$1

function printHelp {
	echo "Usage: ./setup.sh <start|stop>"
}

function validateArgs {
	if [ -z "${START_STOP}" ]; then
		echo "start/stop not mentioned"
		printHelp
		exit 1
	fi

        if [ "${START_STOP}" == "stop" ]; then
		return
	fi
}

validateArgs

#Create the netowk install node and start the app
if [ "${START_STOP}" == "start" ]; then
	docker-compose -f docker-compose.yaml up -d
	sleep 10
	##TODO: Add check to avoid installation in each run
        #VERSION=$(npm ls hfc | grep hfc | tr '@' '\n' | tail -1)
        #if [ "${VERSION}" == "0.6.5" ]; then
	#	echo 'hfc already installed'
	#else
	#	npm install
	#fi
	npm install
  	echo 
	echo "Start the application"
	##start node application
        node hello-blockchain.js
elif [ "${START_STOP}" == "stop" ]; then ##Clean up the network
	docker-compose -f docker-compose.yaml down
        rm -rf keyValStore chaincodeID
        #Cleanup the chaincode containers
	docker rm -f $(docker ps -aq)
	#Cleanup the unwated images
	docker rmi -f $(docker images | grep "dev-vp" | awk '{print $3}') 
else
	printHelp
	exit 1
fi
