import { Controller, Get, Param, Post, Body, Put, BadRequestException, ConflictException, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { CreateUserDto } from "./user.dto";
import { UserService } from "./user.service";
import { User } from "./user.schema";
import { BoughtGift, SendedGift } from "src/gift/gift.schema";

@Controller('users')
export class UserController {
    constructor(private readonly usersService: UserService) {}

    @Post()
    async createUser(@Body() createUserDto: CreateUserDto): Promise<User> {
        try {
            BigInt(createUserDto.id);
        } catch {
            throw new BadRequestException('Invalid Telegram ID format');
        }

        try {
            return await this.usersService.create(createUserDto);
        } catch (error) {
            if (error.code === 11000) {
                throw new ConflictException('User with this Telegram ID already exists');
            }
            throw error;
        }
    }

    @Get(':id')
    async getUser(@Param('id') id: string): Promise<User> {
        return this.usersService.findById(BigInt(id));
    }

    @Get(':id/bought-gifts')
    async getUserBoughtGifts(@Param('id') id: string): Promise<BoughtGift[]> {
        try {
            const userId = BigInt(id);
            return await this.usersService.getBoughtGifts(userId);
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            if (error.message.includes('BigInt')) {
                throw new BadRequestException('Invalid user ID format');
            }
            throw new InternalServerErrorException('Failed to fetch bought gifts');
        }
    }

    @Get(':id/sended-gifts')
    async getUserSendedGifts(@Param('id') id: string): Promise<SendedGift[]> {
        try {
            const userId = BigInt(id);
            return await this.usersService.getSendedGifts(userId);
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            if (error.message.includes('BigInt')) {
                throw new BadRequestException('Invalid user ID format');
            }
            throw new InternalServerErrorException('Failed to fetch sent gifts');
        }
    }
}