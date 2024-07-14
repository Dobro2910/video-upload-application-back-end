import { ProductRepository } from "../repository/product_repository";
import { Product } from "../model/product_model";

export class ProductService {
    // this is used to insert existing product Repo inside so as not to create a new Product Repo everytime
    private productRepository: ProductRepository;

    constructor(productRepository: ProductRepository) {
        this.productRepository = productRepository;
    }

    async getProductInfo(productId: string): Promise<Product | null> {
        return await this.productRepository.getProductInfo(productId);
    }

    async findProductByFilter(productPrice?: number, 
                        productCategory?: string, 
                        productGender?: string, 
                        productBrand?: string, 
                        productSize?: number): Promise<Product[] | null> {
        return await this.productRepository.findProductByFilter(productPrice, productCategory, productGender, productBrand, productSize);
    }
    
    async createProduct(product: Product): Promise<string | null> {
        return await this.productRepository.createProduct(product);
    }

    async updateProductStock(productId: string, productStock: number): Promise<void> {
        return await this.productRepository.updateProductStock(productId, productStock);
    }

    async deleteProduct(productId: string): Promise<void> {
        return await this.productRepository.deleteProduct(productId);
    }
}
