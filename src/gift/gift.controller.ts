import { Body, Controller, Get, Post } from "@nestjs/common";
import { Gift } from "./gift.schema";
import { GiftService } from "./gift.service";
import { CreateGiftsArrayDto } from "./gift.dto";

@Controller('gifts')
export class GiftController {
    constructor(private readonly giftsService: GiftService) {}

    @Get()
    async getGifts(): Promise<Gift[]> {
        return this.giftsService.findAll();
    }

    @Post()
    async createGifts(@Body() createGiftsDto: CreateGiftsArrayDto): Promise<Gift[]> {
        return this.giftsService.createMany(createGiftsDto.gifts);
    }
}