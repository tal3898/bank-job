import { WithId } from "mongodb";
import { Transaction } from "./transaction";

export interface NewTransaction {
    newTransactionId: string;
    originalTransaction: WithId<Transaction>;
}