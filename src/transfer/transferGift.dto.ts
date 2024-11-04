import { IsNotEmpty, IsString } from "class-validator";

export class InitTransferGiftDto {
    @IsNotEmpty()
    @IsString()
    boughtGiftId: string;
}

export class CompleteTransferGiftDto {
    @IsNotEmpty()
    @IsString()
    actionIdHash: string;
}