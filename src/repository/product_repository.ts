import { Product } from "../model/product_model";
import { ProductColorVarietyDetail } from "../model/product_model";
import { ProductDisplay } from "../model/product_model";

// This is the repository layer. It is responsible for handling database operations.
export interface ProductRepository {
    getPaginatedProducts(page: number): Promise<ProductDisplay[] | null>;
    getPaginatedProductsByFilter(
                        filterPage: number,
                        productPrice: number | undefined,
                        productSize?: string | null,
                        productCategory?: string | null,
                        productGender?: string | null,
                        productBrand?: string | null): Promise<ProductDisplay[] | null>;
    // createProduct(product: Product): Promise<string | null>;
    // updateProductColorVarietyDetail(productId: string, productColorVarietyDetail: ProductColorVarietyDetail): Promise<void>;
    // deleteProduct(productId: string): Promise<void>;
}