import {Injectable} from '@angular/core';


import TvSeriesMockData from '../../tv-series-data.json';
import TvGenresMockData from '../../tv-genres-data.json';
import {combineLatest, Observable, of, ReplaySubject, Subject} from 'rxjs';
import {delay, map} from 'rxjs/operators';
import {TvGenre, TvShow} from '../interfaces/tv';

@Injectable({
  providedIn: 'root'
})
export class TvService {
  private TvSeries$: ReplaySubject<TvShow[]> = new ReplaySubject<TvShow[]>(1);
  private filter$: Subject<void> = new Subject<void>();
  private paginator$: Subject<void> = new Subject<void>();

  private filters = {
    name: null,
    genre: null,
    premiereYear: null,
  };
  private pagination = {
    page: 1,
    onPage: 5,
    total: null
  };
  private sort = {
    field: 'id',
    direction: 'asc',
  };

  constructor() {
    this._httpGetTvSeries().subscribe(data => {
      this.TvSeries$.next(data as TvShow[]);
      this.pagination.total = data.length;
      this.filter$.next();
      this.paginator$.next();
    });
  }

  getTvSeries(): Observable<TvShow[]> {
    return combineLatest([
      this.TvSeries$,
      this.filter$
    ]).pipe(
      map(observers => observers[0]),
      map(shows => {
        const start = (this.pagination.page - 1) * this.pagination.onPage;
        shows = shows
          .filter(item => !this.filters.name || item.name.toLowerCase().includes(this.filters.name.toLowerCase()))
          .filter(item => !this.filters.genre || item.genre_ids.indexOf(+this.filters.genre) >= 0)
          .filter(item => !this.filters.premiereYear || item.first_air_date.includes(this.filters.premiereYear));
        this.pagination.total = shows.length;
        this.paginator$.next();
        return shows.sort((i1, i2) => {
          const [s1, s2] = this.sort.direction === 'desc' ? [i1, i2] : [i2, i1];
          if (isNaN(s1[this.sort.field])) {
            return s1[this.sort.field].localeCompare(s2[this.sort.field]);
          } else {
            return s2[this.sort.field] - s1[this.sort.field];
          }
        }).slice(start, this.pagination.onPage + start);
      }),
    );
  }

  getPaginationData(): Observable<any> {
    return combineLatest([this.filter$, this.paginator$]).pipe(
      map(() =>  this.pagination)
    );
  }

  getPremiereYears(): Observable<string[]> {
    return this.TvSeries$.asObservable().pipe(
      map(shows => [...new Set(shows.map(item => item.first_air_date.slice(0, 4)))]
        .sort().reverse()
      )
    );
  }

  getGenres(): Observable<TvGenre[]> {
    return of(TvGenresMockData.genres);
  }

  setFilter(type: string, value: string) {
    this.filters[type] = value;
    this.pagination.page = 1;
    this.filter$.next();
  }

  setPaginator(type: string, value: number) {
    this.pagination[type] = value;
    this.filter$.next();
  }

  setSort(field: string, direction: string) {
    this.sort.field = field;
    this.sort.direction = direction;
    this.filter$.next();
  }

  private _httpGetTvSeries(): Observable<TvShow[]> {
    let baseUrl = '';
    return of(TvSeriesMockData).pipe(
      delay(100),
      map(data => {
        baseUrl = data.poster_base;
        data.results.map(show => show.poster_path = baseUrl + show.poster_path);
        return data.results;
      })
    );
  }

}
