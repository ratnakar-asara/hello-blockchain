## A sample hello-blockchain program to demonstrate how to interact with Blockchain

This simple app sets up a target for the ca server and enrolls the admin user. once it is successful this admin user is set as the registrar user and registers and enrolls a new member, *JohnDoe*.  This new member, *JohnDoe*, is then able to transact on the blockchain by deploying a chaincode, perform a transaction by invoking chaincode function, and querying chaincode state.

## Two approches to setup blockchain network:

### Using docker-compose
Refer below link to setup a 4 peer network with a ca service
https://github.com/IBM-Blockchain/fabric-images

### Or Vagrant environment
alternatively you can start peer and memberservice natively from Vagrant environment

```
vagrant ssh
membersrvc
peer node start
```
*NOTE*: if you use the later approach, you need to consider changing the configuration file config.json with a single peer/ events url instead of 4

### clone this reposity

```

git clone https://github.com/ratnakar-asara/hello-blockchain.git

cd <path-where-this-repo-is-cloned>/hello-blockchain

```


### install hyperledger fabric client SDK
 
`npm install`

### run the node program

`node app.js`

### To enable debug logs use the below command

`DEBUG=hfc node app.js`



