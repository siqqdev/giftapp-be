import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { InjectConnection, InjectModel } from "@nestjs/mongoose";
import { Connection, Model, Types } from "mongoose";
import { BoughtGift, Gift, SendedGift } from "src/gift/gift.schema";
import { Action } from "./action.schema";
import { User } from "src/user/user.schema";

@Injectable()
export class TransferGiftService {
    constructor(
        @InjectModel(Action.name) private actionModel: Model<Action>,
        @InjectModel(User.name) private userModel: Model<User>,
        @InjectModel(BoughtGift.name) private boughtGiftModel: Model<BoughtGift>,
        @InjectModel(SendedGift.name) private sendedGiftModel: Model<SendedGift>,
        @InjectModel(Gift.name) private giftModel: Model<Gift>,
        @InjectConnection() private connection: Connection
    ) { }

    async initializeGiftTransfer(boughtGiftId: string, senderId: string): Promise<Action> {
        const boughtGift = await this.boughtGiftModel
            .findById(boughtGiftId)
            .exec();

        if (!boughtGift) {
            throw new NotFoundException('Bought gift not found: ', boughtGiftId);
        }

        if (boughtGift.user !== senderId) {
            throw new BadRequestException('Cannot transfer not your gift')
        }

        const [transferAction] = await this.actionModel.create([{
            type: 'TransferAction',
            user: boughtGift.user,
            gift: boughtGift.gift,
            giftName: boughtGift.name,
            date: new Date(),
            status: 'pending',
            boughtGiftId: boughtGift._id
        }]);

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
                if (transferAction.status !== 'pending') {
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
                                status: 'failed'
                            }
                        );
                    throw new NotFoundException('Associated bought gift not found');
                }

                const sendedGift = {
                    name: transferAction['giftName'],
                    sendedDate: new Date(),
                    totalAmount: giftItem.totalAmount,
                    gift: giftItem._id,
                    owner: receiverId,
                    sendedBy: boughtGift.user
                }

                console.log("Creating sended gift: ", sendedGift)

                await this.sendedGiftModel.create([sendedGift], { session });

                await this.boughtGiftModel
                    .findByIdAndDelete(boughtGift._id)
                    .session(session);

                await this.actionModel
                    .findByIdAndUpdate(
                        transferActionId,
                        {
                            status: 'completed',
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
            });
        } finally {
            session.endSession();
        }
    }
}