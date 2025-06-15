// src/services/communityDB.ts
import { MongoClient } from 'mongodb';

const uri = "mongodb+srv://drivewise:12345@drivewise0.yojute7.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri);
const dbName = "drivewise";

export async function getCollection(collectionName: string) {
  await client.connect();
  return client.db(dbName).collection(collectionName);
}
