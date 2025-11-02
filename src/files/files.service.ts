import { BadRequestException, Injectable } from '@nestjs/common';
import { existsSync } from 'fs';
import { join } from 'path';

@Injectable()
export class FilesService {
  getImagePath(imageName: string) {
    const path = join(__dirname, `../../static/products/${imageName}`);
    const isImagePathExist = existsSync(path);

    if (!isImagePathExist) {
      throw new BadRequestException(`No product found with image ${imageName}`);
    }

    return path;
  }
}
