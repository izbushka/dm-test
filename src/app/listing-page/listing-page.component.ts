import {Component, OnDestroy, OnInit} from '@angular/core';
import {MovieService, Paginator} from '../shared/services/movie.service';
import {Movie} from '../shared/interfaces/movie';
import {takeWhile} from 'rxjs/operators';

@Component({
  selector: 'app-listing-page',
  templateUrl: './listing-page.component.html',
  styleUrls: ['./listing-page.component.scss']
})
export class ListingPageComponent implements OnInit, OnDestroy {
  private isAlive = true;
  movies: Movie[];

  sorters = {
    name: {state: ''},
    vote_average: {state: ''},
    first_air_date: {state: ''},
  };

  paginator: Paginator;

  constructor(private movieService: MovieService) { }

  ngOnInit(): void {
    this.movieService.getFilteredMovies().pipe(
      takeWhile(() => this.isAlive)
    ).subscribe(data => {
      this.movies = data;
    });

    this.movieService.getFilters().pipe(
      takeWhile(() => this.isAlive)
    ).subscribe(
      data => {
        this.paginator = {...data.paginator};

        for (const [, state] of Object.entries(this.sorters)) {
          state.state = '';
        }
        if (this.sorters.hasOwnProperty(data.sort.field)) {
          this.sorters[data.sort.field].state = data.sort.method;
        }
      }
    );
  }

  ngOnDestroy(): void {
    this.isAlive = false;
  }

  onSort(field) {
    this.movieService.setSort(field);
  }

  switchPage($event: any) {
    if ($event.hasOwnProperty('page')) {
      this.movieService.setPage($event.page);
    }
    if ($event.hasOwnProperty('limit')) {
      this.movieService.setLimit($event.limit);
    }
  }
}
