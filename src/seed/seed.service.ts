import { Injectable } from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';
import { initialData } from './data/seedData';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SeedService {
  constructor(
    private readonly productsService: ProductsService,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async seedDB() {
    await this.deleteTables();
    const adminUser = await this.insertUsers();

    await this.productsService.deleteAllProducts();
    const products = await this.productsService.findAll({});

    if (products.length) {
      throw new Error('Failed to populate the database');
    }

    try {
      const insertedData = initialData.products.map((product) => {
        return this.productsService.create(product, adminUser);
      });

      const populatedData = await Promise.all(insertedData);

      return populatedData;
    } catch (error) {
      console.error('Error populating data:', error);
    }
  }

  private async deleteTables() {
    await this.productsService.deleteAllProducts();

    const queryBuilder = this.userRepository.createQueryBuilder();
    await queryBuilder.delete().where({}).execute();
  }

  private async insertUsers() {
    const seedUsers = initialData.users;

    const insertedUsers = await this.userRepository.save(seedUsers);

    return insertedUsers[0];
  }
}
