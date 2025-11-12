import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsPositive, Min } from 'class-validator';

export class PaginationDto {
  @ApiProperty({
    default: 5,
    description: 'Define the number of products displayed',
  })
  @IsInt()
  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  readonly limit?: number;

  @ApiProperty({
    default: 0,
    description: 'Define the skipped products',
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  readonly offset?: number;
}
