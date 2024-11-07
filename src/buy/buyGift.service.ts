import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException, HttpException } from "@nestjs/common";
import { InjectModel, InjectConnection } from "@nestjs/mongoose";
import { Model, Connection, Types } from "mongoose";
import { Action, ActionStatus, BuyAction, Invoice } from "src/action/action.schema";
import { Gift, BoughtGift } from "src/gift/gift.schema";
import { BotService } from "src/telegram/bot.service";
import { User } from "src/user/user.schema";
import { CryptoPayService } from "./cryptopay/cryptopay.service";
import { PaymentStatus } from "./cryptopay/cryptopay.models";

@Injectable()
export class BuyGiftService {
    constructor(
        @InjectModel(User.name) private userModel: Model<User>,
        @InjectModel(Gift.name) private giftModel: Model<Gift>,
        @InjectModel(Action.name) private actionModel: Model<Action>,
        @InjectModel(BoughtGift.name) private boughtGiftModel: Model<BoughtGift>,
        @InjectConnection() private connection: Connection,
        private botService: BotService,
        private cryptoPayService: CryptoPayService
    ) { }

    async initPurchase(userId: string, giftId: string) {
        const session = await this.connection.startSession();

        try {
            let result = await session.withTransaction(async () => {
                const [user, gift] = await Promise.all([
                    this.userModel.findOne({ id: userId }).session(session),
                    this.giftModel.findById(giftId).session(session)
                ]);

                if (!user) {
                    throw new NotFoundException(`User with ID ${userId} not found`);
                }
                if (!gift) {
                    throw new NotFoundException(`Gift with ID ${giftId} not found`);
                }

                const availableAmount = gift.totalAmount - gift.soldAmount;
                if (availableAmount <= 0) {
                    throw new BadRequestException('Gift is out of stock');
                }

                const invoice = await this.cryptoPayService.createInvoice(
                    gift.price,
                    gift.asset
                );

                const invoiceModel: Invoice = {
                    invoiceId: invoice.id,
                    miniAppInvoiceUrl: invoice.miniAppPayUrl,
                    botInvoiceUrl: invoice.botPayUrl
                }

                const [createdAction] = await this.actionModel.create([{
                    type: BuyAction.name,
                    user: user._id,
                    gift: new Types.ObjectId(giftId),
                    date: new Date(),
                    status: ActionStatus.PENDING,
                    amount: gift.price,
                    asset: gift.asset,
                    invoice: invoiceModel
                }], { session });

                return createdAction;
            });

            return result;
        } catch (error) {
            throw error;
        } finally {
            session.endSession();
        }
    }

    async completePurchase(buyActionId: Types.ObjectId) {
        const session = await this.connection.startSession();

        try {
            return await session.withTransaction(async () => {
                // Find the buy action with session
                const action = await this.actionModel
                    .findById(buyActionId)
                    .session(session);

                if (!action) {
                    throw new NotFoundException(`Buy action with ID ${buyActionId} not found`);
                }

                const user: User = await this.userModel.findById(action.user)

                const buyAction = action as unknown as BuyAction
                if (!buyAction.amount || !buyAction.asset || !buyAction.invoice) {
                    throw new InternalServerErrorException('Buy action has invalid fields');
                }

                if (action.status !== ActionStatus.PENDING) {
                    throw new BadRequestException('This purchase is not in pending state');
                }

                // Verify payment status with CryptoPay
                const paymentStatus = await this.cryptoPayService.getInvoiceStatus(
                    buyAction.invoice.invoiceId
                );
                if(!paymentStatus){
                    await this.actionModel.findByIdAndUpdate(
                        buyActionId,
                        { status: ActionStatus.FAILED }
                    );

                    throw new NotFoundException(`Invoice with id ${buyAction.invoice.invoiceId} not found`);
                }

                if (paymentStatus === PaymentStatus.EXPIRED) {
                    // Update action status to failed if invoice is expired
                    await this.actionModel.findByIdAndUpdate(
                        buyActionId,
                        { status: ActionStatus.FAILED }
                    );

                    throw new BadRequestException('Payment has expired');
                }

                if (paymentStatus === PaymentStatus.ACTIVE) {
                    throw new BadRequestException('Payment has not been completed');
                }

                if (paymentStatus !== PaymentStatus.PAID){
                    await this.actionModel.findByIdAndUpdate(
                        buyActionId,
                        { status: ActionStatus.FAILED }
                    );

                    throw new InternalServerErrorException(`Invoice has unknown status: ${paymentStatus}`)
                }

                // Update gift quantities
                const gift = await this.giftModel.findOneAndUpdate(
                    { _id: action.gift },
                    {
                        $inc: {
                            soldAmount: 1,
                            pendingAmount: -1
                        }
                    },
                    { new: true, session }
                );

                if (!gift) {
                    throw new NotFoundException('Gift not found');
                }

                // Create bought gift record
                const boughtGift = await this.boughtGiftModel.create([{
                    name: gift.name,
                    purchaseDate: new Date(),
                    user: new Types.ObjectId(action.user),
                    gift: gift
                }], { session });

                // Update action status
                await this.actionModel.findByIdAndUpdate(
                    buyActionId,
                    { status: ActionStatus.COMPLETED },
                    { session }
                );

                await this.botService.notifyPurchase(user.id, gift.name)

                return boughtGift[0];
            });
        } catch (error) {
            throw error;
        } finally {
            session.endSession();
        }
    }

    async checkPendingActions() {
        const actions = await this.actionModel.find({
            status: ActionStatus.PENDING,
            type: BuyAction.name
        });

        for (const action of actions) {
            try{
                await this.completePurchase(action._id);
            }
            catch (e){
                console.log(`Checked action: ${action._id}`, e.message)
            }
        }
    }
}