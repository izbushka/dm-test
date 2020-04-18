import {Component, OnDestroy, OnInit} from '@angular/core';
import {MovieService} from '../shared/services/movie.service';
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

  constructor(private movieService: MovieService) { }

  ngOnInit(): void {
    this.movieService.getFilteredMovies().pipe(
      takeWhile(() => this.isAlive)
    ).subscribe(data => {
      this.movies = data;
    });
  }

  ngOnDestroy(): void {
    this.isAlive = false;
  }

  onSort(field) {
    this.movieService.setSort(field);
  }

}
