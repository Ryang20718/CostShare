var AWS = require("aws-sdk");
var dynamo = require('dynamodb');
var tableName = "CostShare";

dynamo.AWS.config.update({accessKeyId: process.env.aws_access_key_id, secretAccessKey: process.env.aws_secret_access_key, region: "us-west-1"});

var dynamodb = new AWS.DynamoDB();



////////CREATE TABLE
exports.createTable = function(){
var params = {
    TableName : tableName,
    KeySchema: [       
        { AttributeName: "email", KeyType: "HASH"},  //Partition Key
    ],
    AttributeDefinitions: [       
        { AttributeName: "email", AttributeType: "S" }
    ],

    ProvisionedThroughput: {       
        ReadCapacityUnits: 10, 
        WriteCapacityUnits: 10
    }
};

dynamodb.createTable(params, function(err, data) {
    if (err) {
        console.error("Unable to create table. Error JSON:", JSON.stringify(err, null, 2));
    } else {
        console.log("Created table. Table description JSON:", JSON.stringify(data, null, 2));
    }
});
};




////INSERT///
exports.insert = function(email_key, arrayItems, totalCost){//insert or update function

var docClient = new AWS.DynamoDB.DocumentClient();//way to insert
var params = {
  TableName: tableName,
  Item:{
    "email": email_key,//email
    "cost": totalCost,//integer
    "items":arrayItems//array
  }
};

// Call DynamoDB to add the item to the table
docClient.put(params, function(err, data) {
    if (err) {
        console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
    } else {
        console.log("Added item:", JSON.stringify(data, null, 2));
    }
});
};



///////READ THE ITEM
exports.read = function(email_key){//key is by email
    
var docClient = new AWS.DynamoDB.DocumentClient();

var params = {
    TableName: tableName,
    Key:{
        "email": email_key,
    }
};


docClient.get(params, function(err, data) {
    if (err) {
        console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
    } else {
        console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
    }
});
};
//DELETE AN ITEM

exports.delete = function(email_key){
var docClient = new AWS.DynamoDB.DocumentClient();
    
var params = {
    TableName:tableName,
    Key:{
        "email": email_key,
    }
};

console.log("Attempting a conditional delete...");
docClient.delete(params, function(err, data) {
    if (err) {
        console.error("Unable to delete item. Error JSON:", JSON.stringify(err, null, 2));
    } else {
        console.log("DeleteItem succeeded:", JSON.stringify(data, null, 2));
    }
});
};
///SCAN ALL ITEMS
exports.scan = function(){
var docClient = new AWS.DynamoDB.DocumentClient();

var params = {
    TableName: tableName
};

console.log("Scanning table.");
docClient.scan(params, onScan);

function onScan(err, data) {
    if (err) {
        console.error("Unable to scan the table. Error JSON:", JSON.stringify(err, null, 2));
    } else {
        // print all the movies
        console.log("Scan succeeded.");
        data.Items.forEach(function(person) {
           console.log(
                person.email + ": total Cost : ",
                person.cost, ". total Items: ", person.items);
        });

        // continue scanning if we have more movies, because
        // scan can retrieve a maximum of 1MB of data
        if (typeof data.LastEvaluatedKey != "undefined") {
            console.log("Scanning for more...");
            params.ExclusiveStartKey = data.LastEvaluatedKey;
            docClient.scan(params, onScan);
        }
    }
}
};