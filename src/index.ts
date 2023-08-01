import cron from 'node-cron';
import { TransactionManager } from './bl/transactionManager';
import { TransactionCollection } from './dal/transaction';
import { Connection } from './dal/connection';

async function main() {
    const dbConnection = new Connection();
    await dbConnection.connect();
    const transactionCollection = new TransactionCollection(dbConnection);
    const transactionManager = new TransactionManager(transactionCollection)
    transactionManager.performDayliTransactions();

    cron.schedule('*/5 * * * * *', () => {
        console.log('Running this task every 10 seconds');
    });
}

main();