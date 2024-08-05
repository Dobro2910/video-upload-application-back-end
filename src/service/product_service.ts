import { ProductRepository } from "../repository/product_repository";
import { Product, ProductColorVarietyDetail, ProductDisplay } from "../model/product_model";

export class ProductService {
    // this is used to insert existing product Repo inside so as not to create a new Product Repo everytime
    private productRepository: ProductRepository;

    constructor(productRepository: ProductRepository) {
        this.productRepository = productRepository;
    }

    async getPaginatedProducts(page: number): Promise<ProductDisplay[] | null> {
        return await this.productRepository.getPaginatedProducts(page);
    }

    async getPaginatedProductsByFilter(
                        filterPage: number,
                        productPrice: number | undefined, 
                        productSize?: string | null,
                        productCategory?: string | null, 
                        productGender?: string | null, 
                        productBrand?: string | null): Promise<ProductDisplay[] | null> {
        return await this.productRepository.getPaginatedProductsByFilter(filterPage, productPrice, productSize, productCategory, productGender, productBrand);
    }
    
    // async createProduct(product: Product): Promise<string | null> {
    //     return await this.productRepository.createProduct(product);
    // }

    // async updateProductStock(productId: string, productColorVarietyDetail: ProductColorVarietyDetail): Promise<void> {
    //     return await this.productRepository.updateProductColorVarietyDetail(productId, productColorVarietyDetail);
    // }

    // async deleteProduct(productId: string): Promise<void> {
    //     return await this.productRepository.deleteProduct(productId);
    // }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // async getProductInfo(productId: string): Promise<Product | null> {
    //     return await this.productRepository.getProductInfo(productId);
    // }

    // async getAllProduct(): Promise<Product[] | null> {
    //     return await this.productRepository.getAllProduct();
    // }
}
