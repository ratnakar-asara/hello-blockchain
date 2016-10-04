// Include the package from npm:
var hfc = require('hfc');
var util = require('util');
var fs = require('fs');


var config = JSON.parse(fs.readFileSync('config.json', 'utf8'));


// Create a client chain.
var chain = hfc.newChain(config.chainName);

// Configure the KeyValStore which is used to store sensitive keys
// as so it is important to secure this storage.
var keyValStorePath = __dirname + "/" + config.KeyValStore;
chain.setKeyValStore(hfc.newFileKeyValStore(keyValStorePath));

chain.setMemberServicesUrl(config.ca.ca_url);
for (var i=0;i<config.peers.length;i++){
	chain.addPeer(config.peers[i].peer_url);
}

var testChaincodeID;
var deployer;
process.env['GOPATH'] = __dirname;

// Enroll "admin" which is already registered because it is
// listed in fabric/membersrvc/membersrvc.yaml with it's one time password.
chain.enroll(config.users[0].username, config.users[0].secret, function(err, admin) {
    if (err) return console.log(util.format("ERROR: failed to register admin, Error : %j \n", err));
    // Set this user as the chain's registrar which is authorized to register other users.
    chain.setRegistrar(admin);

    console.log("\nEnrolled admin successfully\n");

    var userName = config.users[1].username;
        // registrationRequest
        var registrationRequest = {
            enrollmentID: userName,
            affiliation: config.users[1].affiliation
        };
        chain.registerAndEnroll(registrationRequest, function(err, user) {
            if (err) throw Error(" Failed to register and enroll " + userName + ": " + err);
	    deployer = user;
            console.log("Enrolled %s successfully\n", userName);
            
                chain.setDeployWaitTime(config.deployWaitTime);
                deployChaincode();

        });
});

function deployChaincode() {
    console.log(util.format("Deploying chaincode ... It will take about %j seconds to deploy \n", chain.getDeployWaitTime()))
    var args = getArgs(config.deployRequest);
    // Construct the deploy request
    var deployRequest = {
        chaincodePath: config.deployRequest.chaincodePath,
        // Function to trigger
        fcn: config.deployRequest.functionName,
        // Arguments to the initializing function
        args: args
    };

    // Trigger the deploy transaction
    var deployTx = deployer.deploy(deployRequest);

    // Print the deploy results
    deployTx.on('complete', function(results) {
        // Deploy request completed successfully
        testChaincodeID = results.chaincodeID;
        console.log(util.format("[ Chaincode ID : ", testChaincodeID+" ]\n"));
        console.log(util.format("Successfully deployed chaincode: request=%j, response=%j \n", deployRequest, results));

        invoke();
    });
    deployTx.on('error', function(err) {
        // Deploy request failed
        console.log(util.format("Failed to deploy chaincode: request=%j, error=%j \n", deployRequest, err));
    });
}

function invoke() {
    var args = getArgs(config.invokeRequest);
    // Construct the invoke request
    var invokeRequest = {
        // Name (hash) required for invoke
        chaincodeID: testChaincodeID,
        // Function to trigger
        fcn: config.invokeRequest.functionName,
        // Parameters for the invoke function
        args: args
    };

    // Trigger the invoke transaction
    var invokeTx = deployer.invoke(invokeRequest);

    invokeTx.on('complete', function(results) {
        // Invoke transaction completed?
        console.log(util.format("completed chaincode invoke transaction: request=%j, response=%j\n", invokeRequest, results));
        query();
    });
    invokeTx.on('error', function(err) {
        // Invoke transaction submission failed
        console.log(util.format("Failed to submit chaincode invoke transaction: request=%j, error=%j\n", invokeRequest, err));
    });
}

function query() {
    var args = getArgs(config.queryRequest);
    // Construct the query request
    var queryRequest = {
        // Name (hash) required for query
        chaincodeID: testChaincodeID,
        // Function to trigger
        fcn: config.queryRequest.functionName,
        // Existing state variable to retrieve
        args: args
    };

    // Trigger the query transaction
    var queryTx = deployer.query(queryRequest);

    queryTx.on('complete', function(results) {
        // Query completed successfully
        console.log("Successfully queried  chaincode function: request=%j, value=%s \n", queryRequest, results.result.toString());
    });
    queryTx.on('error', function(err) {
        // Query failed
        console.log("Failed to query chaincode, function: request=%j, error=%j \n", queryRequest, err);
    });
}

function getArgs(request) {
	var args = [];
	for (var i=0;i<request.args.length;i++){
		args.push(request.args[i]);
	}
	return args;
}

