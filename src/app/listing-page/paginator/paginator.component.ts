import {Component, OnInit} from '@angular/core';
import {FilterParams, MovieService} from '../../shared/services/movie.service';

@Component({
  selector: 'app-paginator',
  templateUrl: './paginator.component.html',
  styleUrls: ['./paginator.component.scss']
})
export class PaginatorComponent implements OnInit {
  filter: FilterParams;

  pages = [1, 2, 3, 4];
  onPage = [2, 5, 10, 25];

  constructor(private movieService: MovieService) { }

  ngOnInit(): void {
    this.movieService.getFilters().subscribe(data => {
        this.filter = data;
        this.pages = [];
        if (data.paginator.page > 1) {
          this.pages.push(data.paginator.page - 1);
        }
        const totalPages = Math.ceil(data.paginator.total / data.paginator.limit);
        for (let i = data.paginator.page; i <= totalPages; i++) {
          this.pages.push(i);
          if (this.pages.length >= 3) {
            break;
          }
        }
      }
    );
  }

  setPage(page: number) {
    this.movieService.setPage(page);
  }
  setLimit(items: number) {
    this.movieService.setLimit(items);
  }
}
