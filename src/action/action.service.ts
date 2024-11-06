import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { User } from "src/user/user.schema";
import { Action, ActionStatus } from "./action.schema";

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
    ): Promise<Action[]> {
        const user = await this.userModel.findOne({ id: userId }).exec();
        if (!user) {
            throw new NotFoundException(`User with ID ${userId} not found`);
        }
        
        const skip = (page - 1) * limit;

        const items = await this.actionModel.find({
            status: ActionStatus.COMPLETED,
            $or: [
                { user: user._id },
                { toUser: user._id }
            ]
        })
            .populate('gift')
            .populate('user')
            .sort({ date: -1 })
            .skip(skip)
            .limit(limit)
            .exec()
            ;

        return items
    }

    async getRecentActionsByGift(
        giftId: string,
        page: number = 1,
        limit: number = 20
    ): Promise<Action[]> {
        const skip = (page - 1) * limit;

        return this.actionModel.find({ gift: new Types.ObjectId(giftId), status: ActionStatus.COMPLETED })
                .populate('gift')
                .sort({ date: -1 })
                .skip(skip)
                .limit(limit)
                .exec();
    }
    
    async getActionById(id: string): Promise<Action> {
        const action = await this.actionModel
            .findById(id)
            .exec()

        if(!action){
            throw new NotFoundException(`Action with ID ${id} not found`);
        }

        return action
    }
}