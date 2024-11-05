import { IsNotEmpty, IsString } from "class-validator";

export class BuyGiftDto {
    @IsNotEmpty()
    @IsString()
    giftId: string;
}