import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './user.schema';
import { BoughtGift, ReceivedGift } from 'src/gift/gift.schema';
import { LeaderboardResponseDto } from './user.dto';
import { AuthUser } from 'src/auth/auth.guard';

@Injectable()
export class UserService {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<User>,
        @InjectModel(BoughtGift.name) private readonly boughtGiftModel: Model<BoughtGift>,
        @InjectModel(ReceivedGift.name) private readonly receivedGiftModel: Model<ReceivedGift>
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

    async getReceivedGifts(userId: string): Promise<ReceivedGift[]> {
        const user = await this.userModel.findOne({ id: userId });

        return this.receivedGiftModel.find({
            $or: [
                { owner: user._id }
            ]
        })
            .populate('gift')
            .populate('receivedBy')
            .sort({ receivedDate: -1 })
            .exec();
    }

    async getLeaderboard(
        page: number = 1, 
        limit: number = 15, 
        currentUserId: string,
        search?: string
    ): Promise<LeaderboardResponseDto> {
        let query = {};
        if (search) {
            query = {
                firstLastName: { 
                    $regex: new RegExp(search, 'i') // Case-insensitive search
                }
            };
        }
    
        const users = await this.userModel
            .find(query)
            .sort({ giftsReceived: -1, createdDate: 1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean()
            .exec();
    
        const currentUser = await this.userModel.findOne({ id: currentUserId }).lean();
        if (!currentUser) {
            throw new NotFoundException('User not found');
        }
    
        // For current user rank, we need to consider both the search filter and ranking criteria
        const currentUserRank = search 
            ? await this.getCurrentUserFilteredRank(currentUser, search)
            : await this.getCurrentUserRank(currentUser);
    
        const leaderboardUsers = users.map((user, index) => ({
            id: user.id,
            firstLastName: user.firstLastName,
            giftsReceived: user.giftsReceived,
            rank: (page - 1) * limit + index + 1
        }));
    
        return {
            users: leaderboardUsers,
            currentPage: page,
            currentUser: {
                id: currentUser.id,
                firstLastName: currentUser.firstLastName,
                giftsReceived: currentUser.giftsReceived,
                rank: currentUserRank
            }
        };
    }
    
    private async getCurrentUserFilteredRank(currentUser: User, search: string): Promise<number> {
        return await this.userModel.countDocuments({
            firstLastName: { $regex: new RegExp(search, 'i') },
            $or: [
                { giftsReceived: { $gt: currentUser.giftsReceived } },
                {
                    giftsReceived: currentUser.giftsReceived,
                    createdDate: { $lt: currentUser.createdDate }
                }
            ]
        }) + 1;
    }
    
    private async getCurrentUserRank(currentUser: User): Promise<number> {
        return await this.userModel.countDocuments({
            $or: [
                { giftsReceived: { $gt: currentUser.giftsReceived } },
                {
                    giftsReceived: currentUser.giftsReceived,
                    createdDate: { $lt: currentUser.createdDate }
                }
            ]
        }) + 1;
    }
}