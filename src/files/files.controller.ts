import {
  Controller,
  FileTypeValidator,
  Get,
  Param,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { fileNamer } from './helpers/fileNamer.helper';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('product')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './static/products',
        filename: fileNamer,
      }),
    }),
  )
  uploadProductImage(
    @UploadedFile()
    file: Express.Multer.File,
  ) {
    const secureUrl = `${file.filename}`;

    return { secureUrl };
  }

  @Get('/product/:imageId')
  findProductImage(@Param('imageId') imageId: string) {
    return this.filesService.findProductImage(imageId);
  }
}

// new ParseFilePipe({
//       validators: [
//         new FileTypeValidator({
//           fileType: /(image\/(jpeg|jpg|png|gif|webp|bmp|svg\+xml))/,
//         }),
//       ],
//     }),
