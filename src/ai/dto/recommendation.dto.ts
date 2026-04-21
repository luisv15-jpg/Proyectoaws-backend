import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator';

export class GetRecommendationsDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  itemId?: string;
}

export class GetPersonalizedRecommendationsDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 10;
}