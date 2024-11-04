import { IsNumber, IsOptional, Max, Min } from "class-validator";

export class PaginationQueryDto {
    @IsOptional()
    @IsNumber()
    @Min(1)
    page?: number = 1;

    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(100)
    limit?: number = 20;
}