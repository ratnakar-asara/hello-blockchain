#!/bin/bash
UP_DOWN=$1

function printHelp {
	echo "Usage: ./setup.sh <up|down>"
}

function validateArgs {
	if [ -z "${UP_DOWN}" ]; then
		echo "up/down not mentioned"
		printHelp
		exit 1
	fi

        if [ "${UP_DOWN}" == "down" ]; then
		return
	fi
}

validateArgs

#Create the netowk install node and up the app
if [ "${UP_DOWN}" == "up" ]; then
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
elif [ "${UP_DOWN}" == "down" ]; then ##Clean up the network
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
