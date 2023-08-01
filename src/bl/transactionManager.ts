import { TransactionCollection } from "../dal/transaction";
import { NewTransaction } from "../models/newTransaction";
import { Report } from "../models/report";
import { Status } from "../models/status";
import { Processor } from "./processor";
import config from '../config';

export class TransactionManager {
    private processor: Processor;

    constructor(private transactionCollection: TransactionCollection) {
        this.processor = new Processor();
    }

    async performDayliTransactions() {
        const transactions = await this.transactionCollection.getAllTransactionsForToday();
        const newTransactions: NewTransaction[] = [];

        console.log({ message: 'Performing the dayli transactions', transactions});

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
        this.handleTransactionsReport(newTransactions, transactionsReports);
    }

    private async handleTransactionsReport(newTransactions: NewTransaction[], transactionsReports: Report[]) {
        const nextDateToPay = new Date();
        nextDateToPay.setDate(nextDateToPay.getDate() + config.debitDaysInterval);
        nextDateToPay.setHours(0, 0, 0, 0);
       
        for(const currNewTransaction of newTransactions) {
            const transactionReport = transactionsReports.find((currReport) => 
                currReport.transactionId === currNewTransaction.newTransactionId);

            if (transactionReport === undefined) {
                console.error({message: 'Transaction ' + currNewTransaction.newTransactionId + ' was not processed.'})
            } else {
               await this.updateTransaction(currNewTransaction, transactionReport, nextDateToPay);
            }
        }
    }

    private async updateTransaction(newTransaction: NewTransaction,transactionReport: Report, nextDateToPay: Date,) {
        let daysPaid = newTransaction.originalTransaction.daysPaid++;
        if (transactionReport.status === Status.FAILED) {
            daysPaid--;
        }

        if (daysPaid === newTransaction.originalTransaction.daysToDebit) {
            await this.transactionCollection.delete(newTransaction.originalTransaction._id);
        } else {
            await this.transactionCollection.update(newTransaction.originalTransaction._id, 
                {
                    ...newTransaction.originalTransaction,
                    daysPaid: daysPaid,
                    nextDateToPay: nextDateToPay
                });     
        }
    }
}