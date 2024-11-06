import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './user.schema';
import { BoughtGift, SendedGift } from 'src/gift/gift.schema';
import { LeaderboardResponseDto } from './user.dto';
import { AuthUser } from 'src/auth/auth.guard';

@Injectable()
export class UserService {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<User>,
        @InjectModel(BoughtGift.name) private readonly boughtGiftModel: Model<BoughtGift>,
        @InjectModel(SendedGift.name) private readonly sendedGiftModel: Model<SendedGift>
    ) { }

    async findByIdOrCreate(authUser: AuthUser): Promise<User> {
        const user = await this.userModel.findOne({ id: authUser.id }).exec();

        if (!user) {
            const fullName = `${authUser.first_name || ''} ${authUser.last_name || ''}`.trim();
            return this.userModel.create({
                id: authUser.id,
                firstLastName: fullName
            });
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

        return this.boughtGiftModel.find({ user: user._id })
            .sort({ purchaseDate: -1 })
            .exec();
    }

    async getReceivedGifts(userId: string): Promise<SendedGift[]> {
        const user = await this.userModel.findOne({ id: userId });

        return this.sendedGiftModel.find({
            $or: [
                { owner: user._id }
            ]
        })
            .populate('gift')
            .populate('sendedBy')
            .sort({ sendedDate: -1 })
            .exec();
    }

    async getLeaderboard(page: number = 1, limit: number = 15, currentUserId: string): Promise<LeaderboardResponseDto> {
        const total = await this.userModel.countDocuments();
        const pages = Math.ceil(total / limit);
        const skip = (page - 1) * limit;

        const users = await this.userModel
            .find()
            .sort({ giftsReceived: -1, createdDate: 1 })
            .skip(skip)
            .limit(limit)
            .lean()
            .exec();

        const currentUser = await this.userModel.findOne({ id: currentUserId }).lean();
        if (!currentUser) {
            throw new NotFoundException('User not found');
        }

        const currentUserRank = await this.userModel.countDocuments({
            $or: [
                { giftsReceived: { $gt: currentUser.giftsReceived } },
                {
                    giftsReceived: currentUser.giftsReceived,
                    createdDate: { $lt: currentUser.createdDate }
                }
            ]
        }) + 1;

        const leaderboardUsers = users.map((user, index) => ({
            id: user.id,
            giftsReceived: user.giftsReceived,
            rank: skip + index + 1
        }));

        return {
            users: leaderboardUsers,
            total,
            currentPage: page,
            pages,
            currentUser: {
                id: currentUser.id,
                giftsReceived: currentUser.giftsReceived,
                rank: currentUserRank
            }
        };
    }
}