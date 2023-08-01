import dotenv from 'dotenv';
dotenv.config();

const config = {
    debitDays: +process.env.DEBIT_DAYS!,
    debitDaysInterval: +process.env.DEBIT_DAYS_INTERVAL!,
    dbUrl: process.env.DB_URL!,
    dbName: process.env.DB_NAME!,
}

console.log({message: 'configured with', config})

export default config;