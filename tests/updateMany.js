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

        //choose rows in DB to modify, leave empty {} to select all
        const query = { synced: 1};

        //set field and value to modify
        const result = await collection.updateMany( query, { $set: { synced: 0} })
        console.log(result)
       
    }
    catch(e){
        console.error(e);
    }
    finally {
        db_client.close();
    }
}

main().catch(console.error); 