import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Product } from './entities/product.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { isUUID } from 'class-validator';
import { ErrorResponse } from 'src/common/interfaces/error-response.interface';
import { ProductImage } from './entities/product-image.entity';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger('ProductsService');

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,

    private readonly dataSource: DataSource,
  ) {}

  async create(createProductDto: CreateProductDto) {
    try {
      const { images = [], ...rest } = createProductDto;

      const product = this.productRepository.create({
        ...rest,
        images: images?.map((image) =>
          this.productImageRepository.create({ url: image }),
        ),
      });

      await this.productRepository.save(product);

      return { ...product, images: product.images?.map((img) => img.url) };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    const products = await this.productRepository.find({
      take: limit,
      skip: offset,
      relations: { images: true },
    });

    return products.map((product) => ({
      ...product,
      images: product.images?.map((img) => img.url),
    }));
  }

  async findOne(term: string) {
    let product: Product | null;
    const isUuid = isUUID(term);

    if (isUuid) {
      product = await this.productRepository.findOneBy({ id: term });
    } else {
      const queryBuilder = this.productRepository.createQueryBuilder();
      product = await queryBuilder
        .where('LOWER(title) = LOWER(:title) OR LOWER(slug) = LOWER(:slug)', {
          title: term,
          slug: term,
        })
        .leftJoinAndSelect('Product.images', 'productImage')
        .getOne();
    }

    if (!product) {
      throw new NotFoundException(
        `Product with ${isUuid ? 'id' : 'slug'} ${term} not found`,
      );
    }

    return { ...product, images: product.images?.map((img) => img.url) };
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const { images, ...rest } = updateProductDto;

    const product = await this.productRepository.preload({
      id,
      ...rest,
    });

    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await this.productRepository.save(product);
      return product;
    } catch (error) {
      this.handleDBExceptions(error as ErrorResponse);
    }
  }

  async remove(id: string) {
    const response = await this.productRepository.delete(id);

    if (response.affected === 0) {
      throw new BadRequestException(`Product with id ${id} not found`);
    }
    return `Product with id ${id} has been removed`;
  }

  private handleDBExceptions(error: ErrorResponse) {
    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }

    this.logger.error(error);
    throw new InternalServerErrorException(
      'Unexpected error, check server logs',
    );
  }
}
