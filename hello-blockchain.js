process.env['GOPATH'] = __dirname;

// Include the package from npm:
var hfc = require('hfc');
var util = require('util');
var fs = require('fs');


var chain;
var keyValStorePath;
var chaincodeID;
var userObj;
var config;
var newUserName;
var chaincodeIDPath = __dirname + "/chaincodeID";


init();

function init() {
    try {
        config = JSON.parse(fs.readFileSync(__dirname + '/config.json', 'utf8'));
    } catch (err) {
        console.log("config.json is missing or invalid file, Rerun the program with right file")
        process.exit();
    }

    // Create a client chain.
    chain = hfc.newChain(config.chainName);

    // Configure the KeyValStore which is used to store sensitive keys
    // as so it is important to secure this storage.
    keyValStorePath = __dirname + "/" + config.KeyValStore;
    chain.setKeyValStore(hfc.newFileKeyValStore(keyValStorePath));

    chain.setMemberServicesUrl(config.caserver.ca_url);

    for (var i = 0; i < config.peers.length; i++) {
        chain.addPeer(config.peers[i].peer_url);
        //chain.eventHubConnect(config.events[i].event_url);
    }

    // Make sure disconnect the eventhub on exit
    process.on('exit', function() {
        //chain.eventHubDisconnect();
    });
    newUserName = config.users[1].username;

    //Check if chaincode is already deployed
    //TODO: Deploy failures aswell returns chaincodeID, How to address such issue?
    if (fileExists(chaincodeIDPath)) {
        // Read chaincodeID and use this for sub sequent Invokes/Queries
        chaincodeID = fs.readFileSync(chaincodeIDPath, 'utf8');
        chain.getUser(newUserName, function(err, user) {
            if (err) throw Error(" Failed to register and enroll " + newUserName + ": " + err);
            userObj = user;
            invoke();
        });
    } else {
        registerAndEnrollUsers();
    }
}

function registerAndEnrollUsers() {
    // Enroll "admin" which is already registered because it is
    // listed in fabric/membersrvc/membersrvc.yaml with it's one time password.
    chain.enroll(config.users[0].username, config.users[0].secret, function(err, admin) {
        if (err) return console.log(util.format("ERROR: failed to register admin, Error : %j \n", err));
        // Set this user as the chain's registrar which is authorized to register other users.
        chain.setRegistrar(admin);

        console.log("\nEnrolled admin successfully\n");

        // registrationRequest
        var registrationRequest = {
            enrollmentID: newUserName,
            affiliation: config.users[1].affiliation
        };
        chain.registerAndEnroll(registrationRequest, function(err, user) {
            if (err) throw Error(" Failed to register and enroll " + newUserName + ": " + err);
            userObj = user;
            console.log("Enrolled %s successfully\n", newUserName);

            chain.setDeployWaitTime(config.deployWaitTime);
            deployChaincode();

        });
    });
}

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
    var deployTx = userObj.deploy(deployRequest);

    // Print the deploy results
    deployTx.on('complete', function(results) {
        // Deploy request completed successfully
        chaincodeID = results.chaincodeID;
        console.log(util.format("[ Chaincode ID : ", chaincodeID + " ]\n"));
        console.log(util.format("Successfully deployed chaincode: request=%j, response=%j \n", deployRequest, results));
        // Store chaincode ID to a file        
        fs.writeFileSync(chaincodeIDPath, chaincodeID);

        invoke();
    });
    deployTx.on('error', function(err) {
        // Deploy request failed
        console.log(util.format("Failed to deploy chaincode: request=%j, error=%j \n", deployRequest, err));
        process.exit(0);
    });
}

function invoke() {

    var args = getArgs(config.invokeRequest);

    //var eh = chain.getEventHub();

    // Construct the invoke request
    var invokeRequest = {
        // Name (hash) required for invoke
        chaincodeID: chaincodeID,
        // Function to trigger
        fcn: config.invokeRequest.functionName,
        // Parameters for the invoke function
        args: args
    };

    // Trigger the invoke transaction
    var invokeTx = userObj.invoke(invokeRequest);

    invokeTx.on('complete', function(results) {
        // Invoke transaction completed?
        console.log(util.format("completed chaincode invoke transaction: request=%j, response=%j\n", invokeRequest, results));
        query();
    });
    invokeTx.on('error', function(err) {
        // Invoke transaction submission failed
        console.log(util.format("Failed to submit chaincode invoke transaction: request=%j, error=%j\n", invokeRequest, err));
        process.exit(0);
    });

    //Listen to custom events
    /*var regid = eh.registerChaincodeEvent(chaincodeID, "evtsender", function(event) {
        console.log(util.format("Custom event received, payload: %j\n", event.payload.toString()));
        eh.unregisterChaincodeEvent(regid);
    });*/
}

function query() {
    var args = getArgs(config.queryRequest);
    // Construct the query request
    var queryRequest = {
        // Name (hash) required for query
        chaincodeID: chaincodeID,
        // Function to trigger
        fcn: config.queryRequest.functionName,
        // Existing state variable to retrieve
        args: args
    };

    // Trigger the query transaction
    var queryTx = userObj.query(queryRequest);

    queryTx.on('complete', function(results) {
        // Query completed successfully
        console.log("Successfully queried  chaincode function: request=%j, value=%s \n", queryRequest, results.result.toString());
        process.exit(0);
    });
    queryTx.on('error', function(err) {
        // Query failed
        console.log("Failed to query chaincode, function: request=%j, error=%j \n", queryRequest, err);
        process.exit(0);
    });
}

function getArgs(request) {
    var args = [];
    for (var i = 0; i < request.args.length; i++) {
        args.push(request.args[i]);
    }
    return args;
}

function fileExists(filePath) {
    try {
        return fs.statSync(filePath).isFile();
    } catch (err) {
        return false;
    }
}
