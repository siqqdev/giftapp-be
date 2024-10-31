import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from "@nestjs/common";
import { InjectModel, InjectConnection } from "@nestjs/mongoose";
import { Model, Connection, Types } from "mongoose";
import { Gift, BoughtGift } from "src/gift/gift.schema";
import { User } from "src/user/user.schema";
import { Action } from "./action.schema";

@Injectable()
export class BuyGiftService {
    constructor(
        @InjectModel(Action.name) private actionModel: Model<Action>,
        @InjectModel(Gift.name) private giftModel: Model<Gift>,
        @InjectModel(User.name) private userModel: Model<User>,
        @InjectModel(BoughtGift.name) private boughtGiftModel: Model<BoughtGift>,
        @InjectConnection() private connection: Connection
    ) {}

    async buyGift(userId: string, giftId: string): Promise<Action> {
        const session = await this.connection.startSession();
        session.startTransaction();

        try {
            // Find user and gift
            const [user, gift] = await Promise.all([
                this.userModel.findOne({ id: userId }).session(session),
                this.giftModel.findById(giftId).session(session)
            ]);

            // Validate existence
            if (!user) {
                throw new NotFoundException(`User with ID ${userId} not found`);
            }
            if (!gift) {
                throw new NotFoundException(`Gift with ID ${giftId} not found`);
            }

            // Check if gift is available
            const availableAmount = gift.totalAmount - gift.soldAmount;
            if (availableAmount <= 0) {
                throw new BadRequestException('Gift is out of stock');
            }

            // Create buy action
            const buyAction = await this.actionModel.create([{
                type: 'buy',
                user: user._id,
                gift: new Types.ObjectId(giftId),
                date: new Date(),
                status: 'pending',
                amount: gift.price,
                asset: gift.asset
            }], { session });

            // Create bought gift record
            const boughtGift = await this.boughtGiftModel.create([{
                name: gift.name,
                purchaseDate: new Date(),
                user: user._id,
                gift: new Types.ObjectId(giftId)
            }], { session });

            // Update gift sold amount
            await this.giftModel.findByIdAndUpdate(
                giftId,
                { $inc: { soldAmount: 1 } },
                { session, new: true }
            );

            // Update action status to completed
            await this.actionModel.findByIdAndUpdate(
                buyAction[0]._id,
                { status: 'completed' },
                { session }
            );

            await session.commitTransaction();
            return buyAction[0];

        } catch (error) {
            await session.abortTransaction();
            
            if (error instanceof NotFoundException || error instanceof BadRequestException) {
                throw error;
            }

            throw new InternalServerErrorException(
                'Failed to process gift purchase. Please try again.'
            );
        } finally {
            session.endSession();
        }
    }
}