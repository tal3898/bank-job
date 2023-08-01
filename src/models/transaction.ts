export interface Transaction {
    id: string;
    amount: number;
    daysToDebit: number;
    daysPaid: number;
    nextDateToPay: Date;
}