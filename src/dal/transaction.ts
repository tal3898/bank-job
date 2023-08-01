import { Collection, Document, ObjectId, WithId } from "mongodb";
import { Connection } from "./connection";
import { Transaction } from "../models/transaction";


const COLLECTION_NAME = 'transactions';

export class TransactionCollection {
    private collection: Collection | undefined;

    constructor(dbconnection: Connection) {
        this.collection = dbconnection.dbConnector()?.collection(COLLECTION_NAME);
    }

  async getAllTransactionsForToday() : Promise<WithId<Transaction>[]>{
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const query = { dateField: { $gte: startOfToday, $lte: endOfToday } };
    
    const transactions = await this.collection?.find(query);
    const result = await transactions?.toArray();

    if (result === undefined) {
      throw new Error('Try to select transactions before initiate the connection to db');
    }

    return result as WithId<Transaction>[];
  }

  async update(documentId: ObjectId, newTransactionData: Transaction) {
    await this.collection?.replaceOne({
      '_id': documentId,
    }, newTransactionData);
  }

  async delete(documentId: ObjectId) {
    await this.collection?.deleteOne({_id: documentId})
  }



}