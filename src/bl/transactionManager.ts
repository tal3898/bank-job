import { abort } from "process";
import { TransactionCollection } from "../dal/transaction";
import { Processor } from "./processor";
import { Transaction } from "../models/transaction";
import { Status } from "../models/status";
import { Report } from "../models/report";
import { NewTransaction } from "../models/newTransaction";

const DEBIT_DAYS = 12;

export class TransactionManager {
    private processor: Processor;

    constructor(private transactionCollection: TransactionCollection) {
        this.processor = new Processor();
    }

    async performDayliTransactions() {
        const transactions = await this.transactionCollection.getAllTransactions();

        const today = new Date();
        today.setHours(0, 0, 0, 0);

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

        const nextDateToPay = new Date();
        nextDateToPay.setDate(nextDateToPay.getDate() + 1);
        nextDateToPay.setHours(0, 0, 0, 0);
        
        const transactionReports = this.processor.download_report();
        for(const currNewTransaction of newTransactions) {
            const transactionReport = transactionReports.find((currReport) => 
                currReport.transactionId === currNewTransaction.newTransactionId);

            if (transactionReport === undefined) {
                console.error('Transaction ' + currNewTransaction.newTransactionId + ' was not processed.')
            } else {
                let daysPaid = currNewTransaction.originalTransaction.daysPaid++;
                if (transactionReport.status === Status.FAILED) {
                    daysPaid--;
                }
        
                if (daysPaid === currNewTransaction.originalTransaction.daysToDebit) {
                    // finish
                } else {
                    this.transactionCollection.update(currNewTransaction.originalTransaction._id, 
                        {
                            amount: currNewTransaction.originalTransaction.amount,
                            sourceBank: currNewTransaction.originalTransaction.sourceBank,
                            destBank: currNewTransaction.originalTransaction.destBank,
                            daysPaid: daysPaid,
                            daysToDebit: currNewTransaction.originalTransaction.daysToDebit,
                            nextDateToPay: nextDateToPay
                        })
                }
            }
        }
        
        // if (currTransactionReport === undefined) {
        //     throw new Error('Transaction ' + transactionId + ' was not processed.')
        // }

        // this.handleTransaction(transactionId, amount, currTransactionReport);
    }

    private handleTransaction(transactionId:string, amount:number, transactionReport: Report) {
        let daysPaid = 1;
        if (transactionReport.status === Status.FAILED) {
            daysPaid = 0;
        }

        const nextDateToPay = new Date();
        nextDateToPay.setDate(nextDateToPay.getDate() + 1);
        nextDateToPay.setHours(0, 0, 0, 0);

        const newTransactionToSave: Transaction = {
            id: transactionId,
            amount,
            daysPaid: daysPaid,
            daysToDebit: DEBIT_DAYS,
            nextDateToPay: nextDateToPay
        }

        this.transactionCollection.insertTransaction(newTransactionToSave);
    }
}