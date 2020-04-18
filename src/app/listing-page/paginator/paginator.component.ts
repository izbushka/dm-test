import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {Paginator} from '../../shared/services/movie.service';

@Component({
  selector: 'app-paginator',
  templateUrl: './paginator.component.html',
  styleUrls: ['./paginator.component.scss']
})
export class PaginatorComponent implements OnInit, OnChanges {

  @Input() paginator: Paginator;
  @Output() pagination: EventEmitter<any> = new EventEmitter();

  pages = [];
  onPage = [2, 5, 10, 25];

  constructor() { }

  ngOnInit(): void {
    this.updatePaginator();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.updatePaginator();
  }

  updatePaginator() {
    if (this.paginator) {
      this.pages = [];
      if (this.paginator.page > 1) {
        this.pages.push(this.paginator.page - 1);
      }
      for (let i = this.paginator.page; i <= this.paginator.maxPage; i++) {
        this.pages.push(i);
        if (this.pages.length >= 3) {
          break;
        }
      }
    }
  }

  setPage(page: number) {
    this.pagination.emit({page});
  }

  setLimit(limit: number) {
    this.pagination.emit({limit});
  }
}
