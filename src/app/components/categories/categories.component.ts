import { Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, Inject, Renderer2 } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { Category } from '../../models/category';
import { Product } from '../../models/product';
import { ApiResponse } from '../../responses/api.response';
import { CategoryService } from '../../services/category.service';
import { ProductService } from '../../services/product.service';
import {MatRadioModule} from '@angular/material/radio';
import {MatCheckboxModule} from '@angular/material/checkbox'
import { CommonModule, DOCUMENT } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { FooterComponent } from '../footer/footer.component';
import { ProductCartComponent } from '../product-cart/product-cart.component';
import { HeaderComponent } from './../header/header.component';
import { filterBrand, filterMultipleColor, filterPrice } from './filter/FilterData';
import { UserResponse } from '../../responses/user/user.response';
import { HttpErrorResponse } from '@angular/common/http';
import { UserService } from './../../services/user.service';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TokenService } from '../../services/token.service';
@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [
    HeaderComponent,
    FormsModule,
    CommonModule,
    FooterComponent,
    NgxPaginationModule,
    NgbModule,
    ProductCartComponent,
    MatRadioModule,
    MatCheckboxModule
  ],
  schemas:[CUSTOM_ELEMENTS_SCHEMA],

  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss'
})
export class CategoriesComponent {
  userResponse?:UserResponse | null;
  filterColor: any;
  activeNavItem: number = 0;
  filterPrice: any;
  filterBrand: any;
  category: any;
  colors: any;
  price: any;
  productFilter:any;
  page: number = 1;
  count: number = 0;
  tableSize: number = 8;
  isPopoverOpen = false;
  products: Product[] = [];
  categories: Category[] = []; // Dữ liệu động từ categoryService
  selectedCategoryId: number  = 0; // Giá trị category được chọn
  currentPage: number = 0;
  itemsPerPage: number = 12;
  pages: number[] = [];
  totalPages:number = 0;
  visiblePages: number[] = [];
  keyword:string = "";
  localStorage?:Storage;
  apiBaseUrl = environment.apiBaseUrl;
  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private router: Router,
    private route: ActivatedRoute,
    private userService: UserService,
    private tokenService: TokenService,
    @Inject(DOCUMENT) private document: Document,
    private renderer: Renderer2, private el: ElementRef





    ) {
      this.localStorage = document.defaultView?.localStorage;
    }

    ngOnInit() {
      this.userResponse = this.userService.getUserResponseFromLocalStorage();
      this.route.queryParams.subscribe((params: Params) =>{
        this.selectedCategoryId = params['selectedCategoryId'];

        console.log(this.selectedCategoryId);
        this.colors = params['color']?.split(',');
        console.log(this.colors);
        this.price = params['price'];
        this.getProducts(this.keyword, this.selectedCategoryId, this.currentPage, this.itemsPerPage);
        console.log("productFilter",this.productFilter);


      });
      this.currentPage = Number(this.localStorage?.getItem('currentProductPage')) || 0;
      this.getProducts(this.keyword, this.selectedCategoryId, this.currentPage, this.itemsPerPage);

      console.log(this.productFilter, '03u9u3u2093u2');
      this.getCategories(0, 100);
      console.log(this.products, '03u9u3u2093u2');

      this.filterColor =filterMultipleColor;
      this.filterPrice =filterPrice;
      this.filterBrand =filterBrand;
    }
    setActiveNavItem(index: number) {
      this.activeNavItem = index;
      //console.error(this.activeNavItem);
    }
    filterProducts(products: any[], selectedCategoryId: Number, colors: string[] | undefined, price: number | undefined) {
      let filteredProducts = [];

      for (let item of products) {

        if (Number(item.category_id) == selectedCategoryId) {
          if (colors === undefined && price === undefined) {
            filteredProducts.push(item);
          } else if (colors !== undefined && price === undefined) {
             console.log("item",item);
            if (colors.includes(item.color)) {

              filteredProducts.push(item);

            }
          } else if (colors === undefined && price !== undefined) {
            if (item.price < price) {
              filteredProducts.push(item);
            }
          } else if (colors !== undefined && price !== undefined) {
            if (colors.includes(item.color) && item.price < price) {
              filteredProducts.push(item);
            }
          }
        }
      }

      return filteredProducts;
    }
    onTableDataChange(event: any) {
      console.log(event);

      this.page = event;

    }

    togglePopover(event: Event): void {
      event.preventDefault();
      this.isPopoverOpen = !this.isPopoverOpen;
    }
    ngAfterViewInit(): void {

      const pageSizeLabel = this.el.nativeElement.querySelector('#mat-paginator-page-size-label-0');

      if (pageSizeLabel) {

        this.renderer.setProperty(pageSizeLabel, 'textContent', 'Số sản phẩm trên mỗi trang:');
      }

    }




    handlefilterMuiltiple(value: string, sectionId: string){
      const queryParams = { ...this.route.snapshot.queryParams };

      const filterValues = queryParams[sectionId] ? queryParams[sectionId].split(',') : [];

      const valueIndex = filterValues.indexOf(value);

      if (valueIndex !== -1) {
        filterValues.splice(valueIndex, 1);
      } else {
        filterValues.push(value);
      }

      queryParams[sectionId] = filterValues.length > 0 ? filterValues.join(',') : undefined;

      this.router.navigate([], { queryParams });
    }

    handlefilterSimple(value: string, sectionId: string){
      const queryParams={ ...this.route.snapshot.queryParams};

      queryParams[sectionId] = value;

      this.router.navigate([], { queryParams });
    }
    sortItems(value:string){
      if(value =='l2h'){
        this.productFilter.sort((a:any, b:any) => Number(a.discountedPrice) - Number(b.discountedPrice));
      }else if(value =='h2l'){
        this.productFilter.sort((a:any, b:any) => Number(b.discountedPrice) - Number(a.discountedPrice));
      }
    }
    handleItemClick(index: number): void {
      //console.error(`Clicked on "${index}"`);
      if(index === 0) {
        debugger
        this.router.navigate(['/user-profile']);
      }
      else if(index === 1) {
        debugger
        this.router.navigate(['/my-ordered']);
      }
      else if (index === 2) {
        this.userService.removeUserFromLocalStorage();
        this.tokenService.removeToken();
        this.userResponse = this.userService.getUserResponseFromLocalStorage();
        this.router.navigate(['/login']);

      }
      this.isPopoverOpen = false; // Close the popover after clicking an item
    }
    getCategories(page: number, limit: number) {
      this.categoryService.getCategories(page, limit).subscribe({
        next: (apiResponse: ApiResponse) => {
          debugger;
          this.categories = apiResponse.data;
        },
        complete: () => {
          debugger;
        },
        error: (error: HttpErrorResponse) => {
          debugger;
          console.error(error?.error?.message ?? '');
        }
      });
    }

    searchProducts() {
      this.currentPage = 0;
      this.itemsPerPage = 12;
      debugger;
      this.getProducts(this.keyword, this.selectedCategoryId, this.currentPage, this.itemsPerPage);
    }

    getProducts(keyword: string, selectedCategoryId: number, page: number, limit: number) {
      debugger;
      this.productService.getProducts(keyword, selectedCategoryId, page, limit).subscribe({
        next: (apiresponse: ApiResponse) => {
          debugger;
          const response = apiresponse.data;
          response.products.forEach((product: Product) => {
            product.url = `${environment.apiBaseUrl}/products/images/${product.thumbnail}`;
          });
          this.products = response.products;
          this.totalPages = response.totalPages;
          this.visiblePages = this.generateVisiblePageArray(this.currentPage, this.totalPages);
          this.productFilter=this.filterProducts(this.products,this.selectedCategoryId,this.colors,this.price);



        },
        complete: () => {
          debugger;
        },
        error: (error: HttpErrorResponse) => {
          debugger;
          console.error(error?.error?.message ?? '');
        }
      });
    }

    onPageChange(page: number) {
      debugger;
      this.currentPage = page < 0 ? 0 : page;
      this.localStorage?.setItem('currentProductPage', String(this.currentPage));
      this.getProducts(this.keyword, this.selectedCategoryId, this.currentPage, this.itemsPerPage);
    }

    generateVisiblePageArray(currentPage: number, totalPages: number): number[] {
      const maxVisiblePages = 5;
      const halfVisiblePages = Math.floor(maxVisiblePages / 2);

      let startPage = Math.max(currentPage - halfVisiblePages, 1);
      let endPage = Math.min(startPage + maxVisiblePages - 1, totalPages);

      if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(endPage - maxVisiblePages + 1, 1);
      }

      return new Array(endPage - startPage + 1).fill(0)
        .map((_, index) => startPage + index);
    }

    // Hàm xử lý sự kiện khi sản phẩm được bấm vào
    onProductClick(productId: number) {
      debugger;
      // Điều hướng đến trang detail-product với productId là tham số
      this.router.navigate(['/products', productId]);
    }
}



