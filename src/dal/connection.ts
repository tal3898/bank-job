import { Db, MongoClient } from 'mongodb';

export class Connection {
  // Connection URL
   private url: string;
  
  // Database Name
   private dbName: string;
   private client: MongoClient
   private db: Db | undefined;

   constructor() {
    this.url = 'mongodb://localhost:27017';
    this.dbName = 'bank';
    this.client = new MongoClient(this.url);
   }

   async connect() {
    try {
      await this.client.connect();
      this.db = this.client.db(this.dbName);
    } catch (err) {
      console.error(err);
    }
  }

  dbConnector() {
    return this.db;
  }

}