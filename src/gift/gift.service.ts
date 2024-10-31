import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Gift } from "./gift.schema";
import { CreateGiftDto } from "./gift.dto";

@Injectable()
export class GiftService {
    constructor(
        @InjectModel('Gift') private readonly giftModel: Model<Gift>
    ) {}

    async findAll(): Promise<Gift[]> {
        return this.giftModel.find().lean().exec();
    }

    async createMany(gifts: CreateGiftDto[]): Promise<Gift[]> {
        return this.giftModel.insertMany(gifts);
    }
}