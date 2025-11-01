import { Injectable } from '@nestjs/common';

@Injectable()
export class FilesService {
  findProductImage(imageId: string) {
    return `Image saved ${imageId}`;
  }
}
