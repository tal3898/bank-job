import { abort } from "process";
import { TransactionCollection } from "../dal/transaction";
import { Processor } from "./processor";
import { Transaction } from "../models/transaction";
import { Status } from "../models/status";
import { Report } from "../models/report";
import { NewTransaction } from "../models/newTransaction";

const DEBIT_DAYS_INTERVAL = 7;

export class TransactionManager {
    private processor: Processor;

    constructor(private transactionCollection: TransactionCollection) {
        this.processor = new Processor();
    }

    async performDayliTransactions() {
        const transactions = await this.transactionCollection.getAllTransactionsForToday();
        const newTransactions: NewTransaction[] = [];

        for(const currTransaction of transactions) {
            const transactionId = this.processor.perform_transaction(currTransaction.sourceBank, 
                currTransaction.destBank, 
                currTransaction.amount/currTransaction.daysToDebit,
                'debit');
            newTransactions.push({
                newTransactionId: transactionId,
                originalTransaction: currTransaction
            });
        }

        const transactionsReports = this.processor.download_report();
        this.handleTransactionReport(newTransactions, transactionsReports);
    }

    private handleTransactionReport(newTransactions: NewTransaction[], transactionsReports: Report[]) {
        const nextDateToPay = new Date();
        nextDateToPay.setDate(nextDateToPay.getDate() + DEBIT_DAYS_INTERVAL);
        nextDateToPay.setHours(0, 0, 0, 0);
       
        for(const currNewTransaction of newTransactions) {
            const transactionReport = transactionsReports.find((currReport) => 
                currReport.transactionId === currNewTransaction.newTransactionId);

            if (transactionReport === undefined) {
                console.error('Transaction ' + currNewTransaction.newTransactionId + ' was not processed.')
            } else {
                let daysPaid = currNewTransaction.originalTransaction.daysPaid++;
                if (transactionReport.status === Status.FAILED) {
                    daysPaid--;
                }
        
                if (daysPaid === currNewTransaction.originalTransaction.daysToDebit) {
                    this.transactionCollection.delete(currNewTransaction.originalTransaction._id);
                } else {
                    this.transactionCollection.update(currNewTransaction.originalTransaction._id, 
                        {
                            ...currNewTransaction.originalTransaction,
                            daysPaid: daysPaid,
                            nextDateToPay: nextDateToPay
                        }); 
                }
            }
        }
    }
}