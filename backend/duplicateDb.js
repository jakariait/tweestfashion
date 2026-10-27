const { MongoClient } = require('mongodb');

// Source and Target connection URIs
const sourceURI = '';
const targetURI = '';

// Names of source and target databases
const sourceDBName = 'ClothingEcommerce';
const targetDBName = 'tweestfashion';

async function duplicateDatabase() {
  const sourceClient = new MongoClient(sourceURI);
  const targetClient = new MongoClient(targetURI);

  try {
    // Connect to both databases
    await sourceClient.connect();
    await targetClient.connect();

    const sourceDB = sourceClient.db(sourceDBName);
    const targetDB = targetClient.db(targetDBName);

    // Get all collections in the source DB
    const collections = await sourceDB.listCollections().toArray();

    for (const coll of collections) {
      const collName = coll.name;
      const sourceColl = sourceDB.collection(collName);
      const targetColl = targetDB.collection(collName);

      console.log(`Cloning collection: ${collName}...`);

      const docs = await sourceColl.find().toArray();

      if (docs.length > 0) {
        await targetColl.insertMany(docs);
        console.log(`→ Copied ${docs.length} documents.`);
      } else {
        console.log(`→ Skipped ${collName} (empty collection).`);
      }
    }

    console.log('✅ Database duplication completed.');
  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    await sourceClient.close();
    await targetClient.close();
  }
}

duplicateDatabase();
