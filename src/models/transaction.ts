export interface Transaction {
    sourceBank: string;
    destBank: string;
    amount: number;
    daysToDebit: number;
    daysPaid: number;
    nextDateToPay: Date;
}