import { Collection, Document, ObjectId, WithId } from "mongodb";
import { Connection } from "./connection";
import { Transaction } from "../models/transaction";


const COLLECTION_NAME = 'transactions';

export class TransactionCollection {
    private collection: Collection | undefined;

    constructor(dbconnection: Connection) {
        this.collection = dbconnection.dbConnector()?.collection(COLLECTION_NAME);
    }

  async getAllTransactions() : Promise<WithId<Transaction>[]>{
    const transactions = await this.collection?.find();
    const result = await transactions?.toArray();

    if (result === undefined) {
      throw new Error('Try to select transactions before initiate the connection to db');
    }

    return result as WithId<Transaction>[];
  }

  async update(documentId: ObjectId, newTransactionData: Transaction) {
    const result = await this.collection?.replaceOne({
      '_id': documentId,
    }, newTransactionData);
  }

}