import {Component, OnDestroy, OnInit} from '@angular/core';
import {TvService} from '../../shared/services/tv.service';

@Component({
  selector: 'app-paginator',
  templateUrl: './paginator.component.html',
  styleUrls: ['./paginator.component.scss'],
})
export class PaginatorComponent implements OnInit, OnDestroy {
  isAlive = true;

  pages: number[];
  onPageItems: number[] = [2, 5, 10, 25];

  page: number;
  onPage: number;
  total: number;

  constructor(private tvService: TvService) { }

  ngOnInit(): void {
    this.tvService.getPaginationData().subscribe(
      data => {
        this.total = data.total;
        this.onPage = data.onPage;
        this.page = data.page;
        this.updatePaginator();
      }
    );
  }

  setPage(num: number) {
    if (num >= 1 && num <= this.maxPage) {
      this.tvService.setPaginator('page', num);
    }
  }

  setOnPage(num: number) {
    this.tvService.setPaginator('page', 1);
    this.tvService.setPaginator('onPage', num);
  }

  updatePaginator(): void {
    const pages = [];
    if (this.page > 1) {
      pages.push(this.page - 1);
    }
    for (let i = this.page; i <= this.maxPage; i++) {
      pages.push(i);
      if (pages.length >= 3) {
        break;
      }
    }
    this.pages = pages;
  }

  get maxPage() {
    return Math.ceil(this.total / this.onPage);
  }

  ngOnDestroy(): void {
    this.isAlive = false;
  }
}
