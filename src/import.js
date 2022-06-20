let client = require('../sdk/client');
const { MongoClient } = require('mongodb');
const ADMIN_ID = "";  //the user GUID of your marketplace's admin account
const merchantId = "" //the user GUID of your marketplace's target merchant account
const db_client = monogo_db_init();

var API_call = new client.credentials({
    domain: "your-marketplace.sandbox.arcadier.io",
    clientID: "your client ID",
    clientSecret: "your client secret"
});

var return_array = [];
var arcadier_categories;
var collection;
var i=0;
var total=0;

//connect to Arcadier for mapping.
const get_cats = new Promise(function(resolve, reject){
    API_call.Categories.getAllCategories({ "adminID": ADMIN_ID }, function (err, result){
        if(!err){
            resolve(result);
        }
    });
});

//connect to external database
const connect_db = new Promise(async function(resolve, reject){
    await db_client.connect();
    const database = db_client.db('Items');   //replace with your database name
    collection = database.collection('Arcadier ETL');  //replace with your database collection name
    resolve(collection);
}); 

Promise.all([get_cats, connect_db]).then(async function(response){
    arcadier_categories = response[0].Records;

    const query = { synced: 0 };
    const cursor = await collection.find(query);
    total = await cursor.count();
    
    for await (const doc of cursor) {
        start_import(doc);
        //add lag so they task you to debug in the future, and use that time to sleep
        //await sleep(300);  
    }
    
}); 

function start_import(item){

    arcadier_categories.forEach(arcadier_category => {
        item.Categories.forEach(imported_category => {
            if(arcadier_category.Name == imported_category.Name){
                return_array.push({ "ID": arcadier_category.ID });
            }
        })
    });

    var data = {
        "ID": item.ID,
        "Name": item.Name,
        "SKU": item.SKU,
        "Price": item.Price,
        "PriceUnit": "SGD",
        "CurrencyCode": "SGD",
        "StockLimited": 10,
        "StockQuantity": 0,
        "BuyerDescription": item.BuyerDescription,
        "SellerDescription": "test",
        "IsVisibleToCustomer": item.IsVisibleToCustomer,
        "IsAvailable": item.IsAvailable,
        "Active": item.Active,
        "InstantBuy": item.InstantBuy,
        "Negotiation": item.Negotiation,
        "Categories": return_array,
        "HasChildItems": false,
        "CustomFields":[
            {
                "Code": "19521-DB_ID-Ee71FeXXRZ",  //replace with your custom field code if you have one
                "Values": [item._id]
            }
        ]
    };

    var options = {
        "data": data,
        "merchantId": merchantId
    }

    const create_item = new Promise(function(resolve, reject){
        API_call.Items.createItem(options, function(err, response){
            if(!err){
                resolve(response);
                
            }
            else{
                console.log(err)
            }
        });
    });

    Promise.all([create_item]).then(async function(response){
        console.log("Created item: "+ response[0].Name)
    });
    
    update_db(item);

    return_array = [];
}

function update_db(item){

    const update_db = new Promise(async function(resolve, reject){
        const response = await collection.updateOne( {ID: item.ID}, { $set: { synced: 1} }, { upsert: false });
        resolve(response);
    });

    Promise.all([update_db]).then(async function(response){
        console.log("Updated DB for item: "+ item.Name)
        i++;
        console.log(i)
        if(i == total){
            await db_client.close();
        }
    });
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function monogo_db_init(){
    const uri = "";  //this URI can be found on your mongoDB account
    const db_client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

    return db_client;
}
