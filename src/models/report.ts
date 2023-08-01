import { Status } from "./status";

export interface Report {
    transactionId: string;
    status: Status;
}