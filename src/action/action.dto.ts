import { IsNotEmpty, IsString } from "class-validator";

export class BuyGiftDto {
    @IsNotEmpty()
    @IsString()
    userId: string;

    @IsNotEmpty()
    @IsString()
    giftId: string;
}