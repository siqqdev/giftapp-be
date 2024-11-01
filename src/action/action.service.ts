import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { User } from "src/user/user.schema";
import { Action } from "./action.schema";

@Injectable()
export class ActionService {
    constructor(
        @InjectModel(Action.name) private actionModel: Model<Action>,
        @InjectModel(User.name) private userModel: Model<User>
    ) {}

    async getRecentActionsByUser(
        userId: string,
        page: number = 1,
        limit: number = 10
    ): Promise<{ items: Action[]; total: number }> {
        const user = await this.userModel.findOne({ id: userId }).exec();
        if (!user) {
            throw new NotFoundException(`User with ID ${userId} not found`);
        }
        
        const skip = (page - 1) * limit;

        const query = {
            $or: [
                { user: user.id },
                { toUser: user.id }
            ]
        };

        const [items, total] = await Promise.all([
            this.actionModel.find(query)
                .populate('gift')
                .sort({ date: -1 })
                .skip(skip)
                .limit(limit)
                .exec(),
            this.actionModel.countDocuments(query)
        ]);

        return {
            items: items,
            total
        };
    }

    async getRecentActionsByGift(
        giftId: string,
        page: number = 1,
        limit: number = 20
    ): Promise<{ items: Action[]; total: number }> {
        const skip = (page - 1) * limit;

        const query = { gift: new Types.ObjectId(giftId) };

        const [items, total] = await Promise.all([
            this.actionModel.find(query)
                .populate('gift')
                .sort({ date: -1 })
                .skip(skip)
                .limit(limit)
                .exec(),
            this.actionModel.countDocuments(query)
        ]);

        // Transform the response similar to user actions
        // const transformedItems = items.map(action => {
        //     const baseAction = action.toObject();
            
        //     if (action.type === 'BuyAction') {
        //         baseAction.description = `User ${action.user.id} bought for ${action.amount} ${action.asset}`;
        //     } else if (action.type === 'TransferAction') {
        //         baseAction.description = `User ${action.user.id} transferred to user ${action.toUser.id}`;
        //     }

        //     return baseAction;
        // });

        return {
            items: items,
            total
        };
    }
}