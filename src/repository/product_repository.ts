import { Product } from "../model/product_model";

// This is the repository layer. It is responsible for handling database operations.
export interface ProductRepository {
    getProductInfo(productId: string): Promise<Product | null>;
    findProductByFilter(productPrice: number | undefined,
                        productSize: number | undefined,
                        productCategory?: string | null,
                        productGender?: string | null,
                        productBrand?: string | null): Promise<Product[] | null>;
    createProduct(product: Product): Promise<string | null>;
    updateProductStock(productId: string, productStock: number): Promise<void>;
    deleteProduct(productId: string): Promise<void>;
}