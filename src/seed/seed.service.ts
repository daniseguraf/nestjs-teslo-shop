import { Injectable } from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';
import { initialData } from './data/seedData';

@Injectable()
export class SeedService {
  constructor(private readonly productsService: ProductsService) {}

  async seedDB() {
    await this.productsService.deleteAllProducts();
    const products = await this.productsService.findAll({});

    if (products.length) {
      throw new Error('Failed to populate the database');
    }

    try {
      const insertedData = initialData.products.map((product) => {
        return this.productsService.create(product);
      });

      const populatedData = await Promise.all(insertedData);

      return populatedData;
    } catch (error) {
      console.error('Error populating data:', error);
    }
  }
}
