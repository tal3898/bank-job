import { Db, MongoClient } from 'mongodb';
import config from '../config';

export class Connection {
   private url: string;
   private dbName: string;
   private client: MongoClient
   private db: Db | undefined;

   constructor() {
    this.url = config.dbUrl;
    this.dbName = config.dbName;
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