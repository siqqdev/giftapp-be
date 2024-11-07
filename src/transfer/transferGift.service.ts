import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { InjectConnection, InjectModel } from "@nestjs/mongoose";
import { Connection, Model, Types } from "mongoose";
import { BoughtGift, Gift, ReceivedGift } from "src/gift/gift.schema";
import { Action, ActionStatus } from "../action/action.schema";
import { User } from "src/user/user.schema";
import { BotService } from "src/telegram/bot.service";

@Injectable()
export class TransferGiftService {
    constructor(
        @InjectModel(User.name) private userModel: Model<User>,
        @InjectModel(Action.name) private actionModel: Model<Action>,
        @InjectModel(BoughtGift.name) private boughtGiftModel: Model<BoughtGift>,
        @InjectModel(ReceivedGift.name) private receivedGiftModel: Model<ReceivedGift>,
        @InjectModel(Gift.name) private giftModel: Model<Gift>,
        @InjectConnection() private connection: Connection,
        private botService: BotService
    ) { }

    async initializeGiftTransfer(boughtGiftId: string, senderId: string): Promise<Action & { _id: Types.ObjectId }> {
        const boughtGift = await this.boughtGiftModel
            .findById(boughtGiftId)
            .exec();
        if (!boughtGift) {
            throw new NotFoundException('Bought gift not found');
        }

        const sender = await this.userModel.findOne({ id: senderId })
        if (!sender) {
            throw new NotFoundException('Sender not found')
        }

        if (boughtGift.user.toString() !== sender._id.toString()) {
            throw new BadRequestException('Cannot transfer not your gift')
        }

        const transferAction: Action & { _id: Types.ObjectId } = await this.actionModel.create({
            type: 'TransferAction',
            user: boughtGift.user,
            gift: boughtGift.gift,
            giftName: boughtGift.name,
            date: new Date(),
            status: ActionStatus.PENDING,
            boughtGiftId: boughtGift._id,
            toUser: null
        });

        return transferAction;
    }

    async completeGiftTransfer(transferActionId: Types.ObjectId, receiverId: string) {
        const session = await this.connection.startSession();
    
        try {
            // Store and return the transaction result
            const receivedGift = await session.withTransaction(async () => {
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
                    throw new BadRequestException(`Transfer is already completed or failed: ${transferAction.status}`);
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
                    await this.actionModel.findByIdAndUpdate(
                        transferAction._id,
                        {
                            status: ActionStatus.FAILED
                        }
                    );
                    throw new NotFoundException('Associated bought gift not found');
                }
    
                const sender = await this.userModel.findById(boughtGift.user)
                if(!sender){
                    throw new NotFoundException('Sender not found')
                }
    
                const newReceivedGift = await this.receivedGiftModel.create([
                    {
                        name: transferAction['giftName'],
                        receivedDate: new Date(),
                        totalAmount: giftItem.totalAmount,
                        gift: giftItem._id,
                        owner: receiver._id,
                        receivedBy: boughtGift.user  // Changed to use direct user ID
                    }], 
                    { session }
                );
    
                await this.boughtGiftModel
                    .findByIdAndDelete(boughtGift._id)
                    .session(session);
    
                await this.userModel
                    .findOneAndUpdate(
                        receiver._id,
                        { $inc: { giftsReceived: 1 } },
                        { session }
                    );
    
                transferAction.status = ActionStatus.COMPLETED;
                transferAction['toUser'] = receiver._id;
                await transferAction.save({ session });
    
                await this.botService.notifyGiving(receiver.id, sender.id, transferAction.giftName)
                await this.botService.notifyReceiving(sender.id, receiver.id, transferAction.giftName)
    
                return newReceivedGift[0];
            });
    
            return receivedGift;
        } finally {
            session.endSession();
        }
    }
}