#A simple hello-blockchain app to demonstrate on how to interact with Blockchain

##IBM Blockchain Fabric Docker Images:

The docker compose file contains the IBM-signed Docker images images and provides you with a local blockchain environment running on Hyperledger fabric v0.6.1 code. 
here the network configuration is a four node and Certificate Authority network. These images have been tested and verified by IBM development. (Referred from [here](https://github.com/IBM-Blockchain/fabric-images) )


###Prerequisites:
* **Git**: Install [Git](https://git-scm.com/downloads)
 
* **Docker**:
   Install Docker for [Mac](https://docs.docker.com/engine/installation/mac/),  [Windows](https://docs.docker.com/engine/installation/windows/) or [Linux](https://docs.docker.com/engine/installation/#/on-linux) 1.12 or higher properly installed on your machine. (I have a [script](https://raw.githubusercontent.com/ratnakar-asara/MyUtils/master/installation/docker-install.sh), which comes handy if it is a ubuntu machine)

* **Docker Compose**: Install [Docker Compose](https://docs.docker.com/compose/install/) 1.7 or higher.

* **NodeJs**: 
Install [NodeJs](https://nodejs.org/en/download/)

##Steps to run the sample node program on Linux machine
####Step1: Clone the repo
```
git clone https://github.com/ratnakar-asara/hello-blockchain

cd hello-blockchain
```

####Step2: Start the Network and run the node app with a shell script
```
./setup.sh start 
```
This will create a network based on the docker-compose.yaml file configuration and also install hfc node module and start the node program

If everything goes fine you should see similar logs as below
```
Creating network "helloblockchain_default" with the default driver
Creating helloblockchain_baseimage_1
Creating membersrvc
Creating vp0
Creating vp2
Creating vp1
Creating vp3

Start the application

Enrolled admin successfully

Enrolled JohnDoe successfully

Deploying chaincode ... It will take about "100" seconds to deploy 

[ Chaincode ID :  542dd8c19cc2a445db1c155067d78cc3ebb6a4c2bd97149bd9111c77cbb8c5f6 ]

Successfully deployed chaincode: request={"chaincodePath":"chaincode","fcn":"init","args":["a","100","b","200"]}, response={"uuid":"542dd8c19cc2a445db1c155067d78cc3ebb6a4c2bd97149bd9111c77cbb8c5f6","chaincodeID":"542dd8c19cc2a445db1c155067d78cc3ebb6a4c2bd97149bd9111c77cbb8c5f6"} 

completed chaincode invoke transaction: request={"chaincodeID":"542dd8c19cc2a445db1c155067d78cc3ebb6a4c2bd97149bd9111c77cbb8c5f6","fcn":"invoke","args":["a","b","10"]}, response={"result":"Tx 4b6de5ad-35e6-4eac-a7ea-1743d3b80b5a complete"}

Custom event received, payload: "Event Counter is 1"

Successfully queried  chaincode function: request={"chaincodeID":"542dd8c19cc2a445db1c155067d78cc3ebb6a4c2bd97149bd9111c77cbb8c5f6","fcn":"query","args":["a"]}, value=90 

```

To debug or see the peer logs you can issue the below command
```
docker logs -f vp0 
```

If you wanted to make one more transatcion you can use the below command
```
node hello-blockchain.js
```

**To enable debug logs issue the below command** 

```
DEBUG=hfc node hello-blockchain.js
```

####Step3: clear the network and stop the app
At anytime you can stop the app and clear the network by issuing the below command

```
./setup.sh stop
```

#####NOTE: 
1. Refer this [section](https://github.com/IBM-Blockchain/fabric-images#testing-and-verifying-your-local-network) for troubleshoot
2. some helpful docker commands  [here](https://github.com/IBM-Blockchain/fabric-images#helpful-docker-commands)
