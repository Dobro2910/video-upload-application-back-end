import { Product } from "../model/product_model";

// This is the repository layer. It is responsible for handling database operations.
export interface ProductRepository {
    getProductInfo(productId: string): Promise<Product | null>;
    findProductByFilter(productPrice?: number, 
                        productCategory?: string, 
                        productGender?: string, 
                        productBrand?: string, 
                        productSize?: number): Promise<Product[] | null>;
    createProduct(product: Product): Promise<string | null>;
    updateProductStock(productId: string, productStock: number): Promise<void>;
    deleteProduct(productId: string): Promise<void>;
}