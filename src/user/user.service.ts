import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './user.schema';
import { BoughtGift, SendedGift } from 'src/gift/gift.schema';

@Injectable()
export class UserService {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<User>,
        @InjectModel(BoughtGift.name) private readonly boughtGiftModel: Model<BoughtGift>,
        @InjectModel(SendedGift.name) private readonly sendedGiftModel: Model<SendedGift>
    ) {}

    async findByIdOrCreate(userId: string): Promise<User> {
        let user = await this.userModel.findOne({ id: userId }).exec();
        if (!user) {
            user = await this.userModel.create({ id: userId });
        }
        return user;
    }
    
    async findById(userId: string): Promise<User> {
        const user = await this.userModel.findOne({ id: userId }).exec();
        if (!user) {
            throw new NotFoundException(`User with ID ${userId} not found`);
        }
        return user;
    }

    async getBoughtGifts(userId: string): Promise<BoughtGift[]> {
        const user = await this.userModel.findOne({ id: userId });
        
        return this.boughtGiftModel.find({ user: user.id })
            .sort({ purchaseDate: -1 })
            .exec();
    }

    async getSendedGifts(userId: string): Promise<SendedGift[]> {
        const user = await this.sendedGiftModel.findOne({ id: userId });

        return this.sendedGiftModel.find({
            $or: [
                { owner: userId }
            ]
        })
        .populate('gift')
        .populate('owner')
        .populate('sendedBy')
        .sort({ sendedDate: -1 })
        .exec();
    }
}