import { Collection } from "mongodb";
import { Connection } from "./connection";
import { Transaction } from "../models/transaction";


const COLLECTION_NAME = 'transactions';

export class TransactionCollection {
    private collection: Collection | undefined;

    constructor(dbconnection: Connection) {
        this.collection = dbconnection.dbConnector()?.collection(COLLECTION_NAME);
    }


    
  async insertTransaction(newTransaction: Transaction) {
    if (!this.collection) {
        throw new Error('Database and/or collection not initialized');
    }

    await this.collection.insertOne(newTransaction);
  }

}