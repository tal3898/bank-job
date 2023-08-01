import { Report } from "../models/report";

export class Processor {

    perform_transaction(src_bank_account: string, dst_bank_account: string, amount: number, direction: string) {
        return '';
    }

    download_report(): Report[] {
        return [];
    }
}