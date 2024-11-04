import { Partner } from './../../../Data/partner';
import { CUSTOM_ELEMENTS_SCHEMA, Component, ViewEncapsulation, NgModule, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Input } from '@angular/core';

@Component({
  selector: 'app-home-partner',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './home-partner.component.html',
  styleUrls: ['./home-partner.component.scss'], // Đúng chính tả từ styleUrl thành styleUrls
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class HomePartnerComponent {
  @Input() categoryId: any;
  partner: any;
  keyword: string = "";

  currentImageIndex: number = 0; // Biến để theo dõi hình ảnh hiện tại
  images: string[] = [ // Danh sách hình ảnh
    "https://file.hstatic.net/200000722513/file/t10_thu_cu_doi_moi_web_slider_800x400.png",
    "https://file.hstatic.net/200000722513/file/pc_gvn_t10_web_slider_800x400.png",
    "https://file.hstatic.net/200000722513/file/banner_web_slider_800x400_laptop_gaming_wukong_d33e1e6762764ec799820bfcc5814047.jpg"
  ];

  constructor(private router: Router) {}

  ngOnInit() {
    this.partner = Partner;
  }

  slidesPerView: number = 3;
  screenWidth!: number;

  @HostListener('window:resize')
  getScreenWidth() {
    this.screenWidth = window.innerWidth;
    this.slidesPerView = this.screenWidth < 768 ? 1 : 3;
  }

  toCategory(selectedCategoryId: number) {
    this.router.navigate(['/categories'], { queryParams: { keyword: this.keyword, selectedCategoryId } });
  }

  // Phương thức chuyển đổi hình ảnh
  nextImage() {
    this.currentImageIndex = (this.currentImageIndex + 1) % this.images.length;
  }

  // Phương thức lùi hình ảnh
  previousImage() {
    this.currentImageIndex = (this.currentImageIndex - 1 + this.images.length) % this.images.length;
  }
}
