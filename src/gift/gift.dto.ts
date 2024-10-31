import { IsString, IsEnum, IsNumber, Min, IsArray, ValidateNested, ArrayMinSize } from "class-validator";

export class CreateGiftDto {
    @IsString()
    name: string;

    @IsString()
    price: string;

    @IsEnum(['USDT', 'TON', 'BTC', 'ETH', 'LTC', 'BNB', 'TRX', 'USDC', 'JET'])
    asset: string;

    @IsNumber()
    @Min(0)
    totalAmount: number;

    @IsNumber()
    @Min(0)
    soldAmount: number;
}

export class CreateGiftsArrayDto {
    @IsArray()
    @ValidateNested({ each: true })
    @ArrayMinSize(1)
    gifts: CreateGiftDto[];
}