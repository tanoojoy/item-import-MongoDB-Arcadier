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

        //choose rows in DB to query, leave empty {} to select all
        const query = { synced: 0};

        //count number of rows queried
        const cursor = await collection.find(query);
        const result = await cursor.count();
        for await (const doc of cursor) {
            console.log(doc)
        }
       
    }
    catch(e){
        console.error(e);
    }
    finally {
        db_client.close();
    }
}

main().catch(console.error); 