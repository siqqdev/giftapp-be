import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './user.schema';
import { CreateUserDto } from './user.dto';
import { BoughtGift, SendedGift } from 'src/gift/gift.schema';

@Injectable()
@Injectable()
export class UserService {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<User>,
        @InjectModel(BoughtGift.name) private readonly boughtGiftModel: Model<BoughtGift>,
        @InjectModel(SendedGift.name) private readonly sendedGiftModel: Model<SendedGift>
    ) {}

    async create(createUserDto: CreateUserDto): Promise<User> {
        const createdUser = new this.userModel({
            id: createUserDto.id,
            giftsReceived: 0
        });
        return createdUser.save();
    }

    async findById(id: bigint): Promise<User> {
        const user = await this.userModel.findOne({ id }).exec();
        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }
        return user;
    }

    async getBoughtGifts(userId: bigint): Promise<BoughtGift[]> {
        const user = await this.findById(userId);
        
        return this.boughtGiftModel.find({ user: user.id })
            .sort({ purchaseDate: -1 })
            .exec();
    }

    async getSendedGifts(userId: bigint): Promise<SendedGift[]> {
        const user = await this.findById(userId);

        return this.sendedGiftModel.find({
            $or: [
                { owner: userId },
                { sendedBy: userId }
            ]
        })
        .populate('gift')
        .populate('owner')
        .populate('sendedBy')
        .sort({ sendedDate: -1 })
        .exec();
    }
}