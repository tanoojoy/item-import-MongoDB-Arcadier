const { MongoClient } = require('mongodb');

async function main(){
    
    const uri = ""; //this URI can be found on your mongoDB account
    const db_client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    
    try {
        //connect to external database
        await db_client.connect();

        //select DB and collection
        const database = db_client.db('Items');
        const collection = database.collection('Arcadier ETL');

        //choose row in DB to modify
        const query = { ID: "5ccbcf4d-27b1-43e1-956a-1d9492d2bc3a"};

        //set field and value to modify
        const result = await collection.updateOne( query, { $set: { synced: 0} })
        console.log(result.result.n)
       
    }
    catch(e){
        console.error(e);
    }
    finally {
        db_client.close();
    }
}

main().catch(console.error); 