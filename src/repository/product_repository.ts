import { Product } from "../model/product_model";

// This is the repository layer. It is responsible for handling database operations.
export interface ProductRepository {
    getAllProduct(): Promise<Product[] | null>;
    getPaginatedProducts(page: number): Promise<Product[] | null>;
    getProductInfo(productId: string): Promise<Product | null>;
    findProductByFilter(
                        filterPage: number,
                        productPrice: number | undefined,
                        productSize?: string | null,
                        productCategory?: string | null,
                        productGender?: string | null,
                        productBrand?: string | null): Promise<Product[] | null>;
    createProduct(product: Product): Promise<string | null>;
    updateProductStock(productId: string, productStock: number): Promise<void>;
    deleteProduct(productId: string): Promise<void>;
}