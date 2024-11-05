import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { InjectConnection, InjectModel } from "@nestjs/mongoose";
import { Connection, Model, Types } from "mongoose";
import { BoughtGift, Gift, SendedGift } from "src/gift/gift.schema";
import { Action, ActionStatus } from "../action/action.schema";
import { User } from "src/user/user.schema";
import { BotService } from "src/telegram/bot.service";

@Injectable()
export class TransferGiftService {
    constructor(
        @InjectModel(User.name) private userModel: Model<User>,
        @InjectModel(Action.name) private actionModel: Model<Action>,
        @InjectModel(BoughtGift.name) private boughtGiftModel: Model<BoughtGift>,
        @InjectModel(SendedGift.name) private sendedGiftModel: Model<SendedGift>,
        @InjectModel(Gift.name) private giftModel: Model<Gift>,
        @InjectConnection() private connection: Connection,
        private botService: BotService
    ) { }

    async initializeGiftTransfer(boughtGiftId: string, senderId: string): Promise<Action & { _id: Types.ObjectId } > {
        const boughtGift = await this.boughtGiftModel
            .findById(boughtGiftId)
            .exec();

        if (!boughtGift) {
            throw new NotFoundException('Bought gift not found: ', boughtGiftId);
        }

        if (boughtGift.user !== senderId) {
            throw new BadRequestException('Cannot transfer not your gift')
        }

        const transferAction: Action & { _id: Types.ObjectId } = await this.actionModel.create({
            type : 'TransferAction',
            user: boughtGift.user,
            gift: boughtGift.gift,
            giftName: boughtGift.name,
            date: new Date(),
            status: ActionStatus.PENDING,
            boughtGiftId: boughtGift._id
            });

        return transferAction;
    }

    async completeGiftTransfer(transferActionId: Types.ObjectId, receiverId: string) {
        const session = await this.connection.startSession();

        try {
            await session.withTransaction(async () => {
                const transferAction = await this.actionModel
                    .findById(transferActionId)
                    .session(session)
                    .exec();
                if (!transferAction) {
                    throw new NotFoundException(`Could not find transfer action: ${transferActionId}`);
                }
                if (transferAction.type !== 'TransferAction') {
                    throw new BadRequestException('Invalid action type');
                }
                if (transferAction.status !== ActionStatus.PENDING) {
                    throw new BadRequestException('Transfer is already completed or failed');
                }

                const giftItem = await this.giftModel.findById(transferAction.gift)
                if (!giftItem) {
                    throw new InternalServerErrorException('The gift item does not exist: ', transferAction.gift.toString())
                }

                const receiver = await this.userModel
                    .findOne({ id: receiverId })
                    .session(session)
                    .exec();
                if (!receiver) {
                    throw new NotFoundException(`Receiver with ID ${receiverId} not found`);
                }

                const boughtGift = await this.boughtGiftModel
                    .findById(transferAction['boughtGiftId'])
                    .session(session)
                    .exec();
                if (!boughtGift) {
                    await this.actionModel
                        .findByIdAndUpdate(
                            transferAction._id,
                            {
                                status: ActionStatus.FAILED
                            }
                        );
                    throw new NotFoundException('Associated bought gift not found');
                }

                const sendedGift = await this.sendedGiftModel.create([{
                    name: transferAction['giftName'],
                    sendedDate: new Date(),
                    totalAmount: giftItem.totalAmount,
                    gift: giftItem._id,
                    owner: receiverId,
                    sendedBy: boughtGift.user
                }], { session });

                await this.boughtGiftModel
                    .findByIdAndDelete(boughtGift._id)
                    .session(session);

                await this.actionModel
                    .findByIdAndUpdate(
                        transferActionId,
                        {
                            status: ActionStatus.COMPLETED,
                            toUser: receiver.id
                        },
                        { session }
                    );

                await this.userModel
                    .findOneAndUpdate(
                        receiver._id,
                        { $inc: { giftsReceived: 1 } },
                        { session }
                    );

                // Notify users without causing errors
                try{
                    await this.botService.notifyGiving(receiver.id, boughtGift.user.toString(), transferAction.giftName)
                }
                catch (e){
                    console.error('Error sending giving notification', e)
                }
                try{
                    await this.botService.notifyReceiving(boughtGift.user.toString(), receiver.id, transferAction.giftName)
                }
                catch (e){
                    console.error('Error sending receiving notification', e)
                }

                return sendedGift
            });
        } finally {
            session.endSession();
        }
    }
}