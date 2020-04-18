import {AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {FilterParams, MovieService} from '../../shared/services/movie.service';
import {fromEvent} from 'rxjs';
import {debounceTime, map, mapTo, takeWhile} from 'rxjs/operators';
import {Genre} from '../../shared/interfaces/movie';

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss']
})
export class FilterComponent implements OnInit, AfterViewInit, OnDestroy {
  isAlive = true;
  @ViewChild('name') name: ElementRef;
  genres: Genre[];
  years: string[];

  filter: FilterParams;

  constructor(private movieService: MovieService) { }

  ngOnInit(): void {
    this.movieService.getFilters().pipe(
      takeWhile(() => this.isAlive)
    ).subscribe(
      data => {
        this.filter = data;
      }
    );
    this.movieService.getGenres().pipe(
      takeWhile(() => this.isAlive)
    ).subscribe(
      data => this.genres = data
    );

    this.movieService.getYears().pipe(
      takeWhile(() => this.isAlive)
    ).subscribe(
      data => this.years = data
    );
  }

  isGenreAvailable(id: number): boolean {
    if (this.filter.filter.genre_ids) {
      return true;
    }
    return this.filter.filters.genres.some(i => i === id);
  }

  isYearAvailable(year: string): boolean {
    if (this.filter.filter.first_air_date) {
      return true;
    }
    return this.filter.filters.premiereYears.some(i => i === year);
  }

  ngAfterViewInit(): void {
    fromEvent(this.name.nativeElement, 'keyup').pipe(
      debounceTime(500),
      map(() => this.name.nativeElement.value)
    ).pipe(
      takeWhile(() => this.isAlive)
    ).subscribe(data => {
      this.movieService.setFilter('name', data);
    });
  }

  setPremiereYear(target: EventTarget) {
    this.movieService.setFilter('first_air_date', (target as HTMLSelectElement).value);
  }

  setGenres(target: EventTarget) {
    this.movieService.setFilter('genre_ids', (target as HTMLSelectElement).value);
  }

  ngOnDestroy(): void {
    this.isAlive = false;
  }

}
