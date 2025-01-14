import { LoginDTO } from './../../dtos/user/login.dto';
import { UserService } from './../../services/user.service';
import { Component, OnInit, Inject, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Product } from '../../models/product';
import { Category } from '../../models/category';
import { UserResponse } from '../../responses/user/user.response';
import { Router } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { environment } from '../../../environments/environment';
import { CategoryService } from '../../services/category.service';
import { ProductService } from '../../services/product.service';
import { TokenService } from '../../services/token.service';
import { ApiResponse } from '../../responses/api.response';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { CommonModule, DOCUMENT } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ListProductComponent } from '../list-product/list-product.component';
import { HomePartnerComponent } from './home-partner/home-partner.component';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { RegisterDTO } from '../../dtos/user/register.dto';
import { Route, ActivatedRoute } from '@angular/router';
import { LoginResponse } from '../../responses/user/login.response';
import { RouterModule} from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    FooterComponent,
    HeaderComponent,
    NgbModule,
    ListProductComponent,
    HomePartnerComponent,
    RouterModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class HomeComponent implements OnInit {
  userResponse?:UserResponse | null;
  isPopoverOpen = false;
  registerDto: RegisterDTO = {
    fullname : '',
    phone_number : '',
    password : 'aaaaaaaaaaaaaaaaa',
    retype_password : 'aaaaaaaaaaaaaaaaa',
    address : '',
    date_of_birth: new Date(),
    role_id: 1,
    google_account_id: 0,
    facebook_account_id: 0,
    email: '',
  };

  loginDTO: LoginDTO = {
    phone_number: '',
    password: '',
    email: '',
    role_id: 1,
  }

  idEmail: number = 0;
  typeRequest: string ='';
  avatar: string = '';

  activeNavItem: number = 0;
  products: Product[] = [];

  categories: Category[] = []; // Dữ liệu động từ categoryService
  selectedCategoryId: number  = 0; // Giá trị category được chọn
  currentPage: number = 0;
  itemsPerPage: number = 40;
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
    private tokenService: TokenService,
    private userService: UserService,
    private route: ActivatedRoute,


    @Inject(DOCUMENT) private document: Document
    ) {
      this.localStorage = document.defaultView?.localStorage;
    }
    ngOnInit() {
      this.userResponse = this.userService.getUserResponseFromLocalStorage();
      this.currentPage = Number(this.localStorage?.getItem('currentProductPage')) || 0;
      this.getProducts(this.keyword, this.selectedCategoryId, this.currentPage, this.itemsPerPage);
      this.getCategories(0, 100);

      this.route.queryParams.subscribe(params => {
        this.idEmail = params['id'];
        this.typeRequest = params['type'];
      });
      if (this.idEmail){
        this.loginGmail()
      }
    }
    loginGmail( ){
      if (this.typeRequest == "email"){
        this.registerDto.google_account_id = 1;
        this.userService.getGoogleUserInfo(this.idEmail).subscribe({
          next: (response: any) =>{
            this.avatar = response.picture;
            this.registerDto.email = response.email;
            this.registerDto.fullname = response.name;
            this.registerDto.date_of_birth = response.date_of_birth;
            // this.registerDto.password = this.userProfileForm.get('password')?.value;
            // this.registerDto.address = this.userProfileForm.get('address')?.value;
            // this.registerDto.phone_number = this.userProfileForm.get('phone_number')?.value;
            // this.registerDto.avatar = this.avatar;
            // this.registerDto.retype_password = this.registerDto.password;

            this.userService.register(this.registerDto).subscribe({
              next: (response: any) => {
                this.loginDTO.phone_number = this.registerDto.phone_number;
                this.loginDTO.password = this.registerDto.password;
                this.loginDTO.email = this.registerDto.email;
                this.userService.login(this.loginDTO)
                  .subscribe({
                    next: (response: LoginResponse) => {
                      const {token}  =  response
                      this.tokenService.setToken(token);
                      this.userService.getUserDetail(token).subscribe({
                        next: (userDetail: any) =>{
                          this.userResponse = {
                            ...userDetail,
                            date_of_birth: new Date(userDetail.date_of_birth)
                          };
                          // this.userService.saveUserResponseToLocalStorage(this.userResponse);
                          //   if (this.userResponse?.role.name == 'admin'){
                          //     this.router.navigate(['/admin']);
                          //   } else if (this.userResponse?.role.name == 'user') {
                          //     this.router.navigate(['/']);
                          //   }
                        },
                        complete: () => {
                          debugger
                        },
                        error: (error : any) => {
                          debugger
                        }
                      })

                  }
                })
              }
            })

          }
        })


      }
    }

    togglePopover(event: Event): void {
      event.preventDefault();
      this.isPopoverOpen = !this.isPopoverOpen;
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
    setActiveNavItem(index: number) {
      this.activeNavItem = index;
      //console.error(this.activeNavItem);
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
      this.router.navigate(['/categories'], { queryParams: { keyword: this.keyword, selectedCategoryId: this.selectedCategoryId  } });
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
