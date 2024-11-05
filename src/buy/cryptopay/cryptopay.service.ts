import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { AssetType } from "./cryptopay.models";

@Injectable()
export class CryptoPayService {
    private readonly client;
    constructor() {
        const CryptoBotAPI = require('crypto-bot-api');
        this.client = new CryptoBotAPI(process.env.CRYPTO_API_TOKEN, 'testnet');
    }

    async createInvoice(
        amount: string,
        asset: string,
        expiresIn: number = 3600 // Default 1 hour
    ): Promise<any> {
        if (isNaN(parseFloat(amount)) || !isFinite(amount as any)) {
            throw new BadRequestException('amount must be a number');
        }

        if (!(asset in AssetType)) {
            throw new BadRequestException('asset must be in ' + Object.values(AssetType).join(', '));
        }

        const invoice = await this.client.createInvoice({
            asset: asset,
            amount: amount,
            expires_in: expiresIn
        });

        return invoice;
    }

    async getInvoiceStatus(invoiceId: number) {
        const invoices = await this.client.getInvoices({ids: [invoiceId]});
        if (!Array.isArray(invoices) || invoices.length !== 1) {
            throw new NotFoundException(`Invoice with id ${invoiceId} not found`);
        }

        const invoice = invoices[0];
        
        return invoice.status;
    }
}