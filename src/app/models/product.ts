import { ProductImage } from "./product.image";
import { Comment } from "./comment";
export interface Product {
  id: number;
  name: string;
  price: number;
  price1: number;
  thumbnail: string;
  description: string;
  category_id: number;
  url: string;
  color: string;
  product_images: ProductImage[];
  comments: Comment[];
  discountPersent: String;
}


