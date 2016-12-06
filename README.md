## A sample hello-blockchain program to demonstrate how to interact with Blockchain

This simple app sets up a target for the ca server and enrolls the admin user. once it is successful this admin user is set as the registrar user and registers and enrolls a new member, *JohnDoe*.  This new member, *JohnDoe*, is then able to transact on the blockchain by deploying a chaincode, perform a transaction by invoking chaincode function, and querying chaincode state. In additon SDK listens to custom events from chaincode.

### Using docker-compose
Follow instructions [here](https://github.com/IBM-Blockchain/fabric-images) to setup a 4 peer network with a ca server

## clone this reposity and run the program

```

git clone https://github.com/ratnakar-asara/hello-blockchain.git

cd <path-where-this-repo-is-cloned>/hello-blockchain

```


### install hyperledger fabric client SDK
 
`npm install`

### run the node program

`node hello-blockchain.js`

### To enable debug logs use the below command

`DEBUG=hfc node hello-blockchain.js`

###Output would be something like below:
```
$ node hello-blockchain.js

Enrolled admin successfully

Enrolled JohnDoe successfully

Deploying chaincode ... It will take about "60" seconds to deploy 

[ Chaincode ID :  1cbab9fc2bbf457a114342f3219baee69bf3465419756b9e2b7d51eaf0bc9729 ]

Successfully deployed chaincode: request={"chaincodePath":"chaincode","fcn":"init","args":["a","100","b","200"]}, response={"uuid":"1cbab9fc2bbf457a114342f3219baee69bf3465419756b9e2b7d51eaf0bc9729","chaincodeID":"1cbab9fc2bbf457a114342f3219baee69bf3465419756b9e2b7d51eaf0bc9729"} 

completed chaincode invoke transaction: request={"chaincodeID":"1cbab9fc2bbf457a114342f3219baee69bf3465419756b9e2b7d51eaf0bc9729","fcn":"invoke","args":["a","b","10"]}, response={"result":"Tx d4560d2a-fb1f-4e3b-8481-fb9ad0852804 complete"}

Custom event received, payload: "Event Counter is 1"

Successfully queried  chaincode function: request={"chaincodeID":"1cbab9fc2bbf457a114342f3219baee69bf3465419756b9e2b7d51eaf0bc9729","fcn":"query","args":["a"]}, value=90 
```

Once deploy is sucecssful , the code ignores the deploy and performs transactions on blockchain

```
$ node hello-blockchain.js

completed chaincode invoke transaction: request={"chaincodeID":"1cbab9fc2bbf457a114342f3219baee69bf3465419756b9e2b7d51eaf0bc9729","fcn":"invoke","args":["a","b","10"]}, response={"result":"Tx 774eecd4-24a9-49f3-a65d-203b6f231e68 complete"}

Custom event received, payload: "Event Counter is 2"

Successfully queried  chaincode function: request={"chaincodeID":"1cbab9fc2bbf457a114342f3219baee69bf3465419756b9e2b7d51eaf0bc9729","fcn":"query","args":["a"]}, value=80 

```


##Troubleshoot
* If you see the below error
```
Failed to submit chaincode invoke transaction: request={"chaincodeID":"1cbab9fc2bbf457a114342f3219baee69bf3465419756b9e2b7d51eaf0bc9729","fcn":"invoke","args":["a","b","10"]}, error={"error":{"code":2,"metadata":{"_internal_repr":{}}},"msg":"Error: sql: no rows in result set"}
```
Make sure you delete crypto tokens from keyValStore directory or recreate your network

