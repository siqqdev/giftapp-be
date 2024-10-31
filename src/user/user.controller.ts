import { Controller, Get, Param, Post, Body, Put, BadRequestException, ConflictException } from "@nestjs/common";
import { CreateUserDto } from "./user.dto";
import { UserService } from "./user.service";
import { User } from "./user.schema";

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
}