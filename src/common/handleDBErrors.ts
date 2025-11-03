import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ErrorResponse } from './interfaces/error-response.interface';

export const handleDBErrors = (
  error: ErrorResponse,
  errorCode = '23505',
): never => {
  if (error.code === errorCode) {
    throw new BadRequestException(error.detail);
  }

  console.log(error);

  throw new InternalServerErrorException('Unexpected error, check server logs');
};
