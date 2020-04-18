import {Injectable} from '@angular/core';
import {environment} from '../../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, combineLatest, Observable, Subject, zip} from 'rxjs';
import {Genre, Movie} from '../interfaces/movie';
import {catchError, filter, map, pluck, startWith, take} from 'rxjs/operators';
import {AppStorageService} from './app-storage.service';


export interface FilterParams {
  filter: {
    name: string
    genre_ids: number,
    first_air_date: string;
  };
  paginator: {
    page: number;
    limit: number;
    maxPage: number;
    total: number;
  };
  sort: {
    field: string;
    method: string;
  };
  filters: {
    genres: number[];
    premiereYears: string[];
  };
}


@Injectable({
  providedIn: 'root'
})
export class MovieService {
  private genres$: BehaviorSubject<Genre[]> = new BehaviorSubject<Genre[]>(null);
  private years$: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);
  private movies$: BehaviorSubject<Movie[]> = new BehaviorSubject<Movie[]>([]);
  private updateEmitter$: Subject<void> = new Subject<void>();
  private filterEmitter$: Subject<any> = new Subject<any>();

  private params: FilterParams = {
    filter: {
      name: '',
      genre_ids: null,
      first_air_date: '',
    },
    paginator: {
      page: 1,
      limit: 5,
      total: 0,
      maxPage: 1,
    },
    sort: {
      field: 'id',
      method: 'asc'
    },
    filters: {
      genres: [],
      premiereYears: []
    }
  };

  constructor(
    private http: HttpClient,
    private storage: AppStorageService
  ) {
    // const movies = this.storage.get('local', 'movies_cache');
    const movies = '';
    if (movies) {
      this.movies$.next(movies);
    }

    // const genres = this.storage.get('local', 'genres_cache');
    const genres = '';
    if (genres) {
      this.genres$.next(genres);
    }

    this.movies$.subscribe(
      data => this.years$.next(
        [...new Set(data.map(i => i.first_air_date.slice(0, 4)))].sort().reverse()
      )
    );
  }

  private getAllMovies(): BehaviorSubject<Movie[]> {
    if (!this.movies$.getValue().length) {
      zip(
        this.httpGetPopularTV(1),
        this.httpGetPopularTV(2),
        this.httpGetPopularTV(3),
        this.httpGetPopularTV(4),
        this.httpGetPopularTV(5),
      ).pipe(
        map(data => [].concat(...data))
      ).subscribe(data => {
          this.movies$.next(data);
          this.storage.set('local', 'movies_cache', data, 3600);
        }
      );
    }
    return this.movies$;
  }

  getFilters(): Observable<FilterParams> {
    return this.filterEmitter$.pipe(
      startWith(this.params),
      map(() => this.params)
    );
  }

  getGenres(): Observable<Genre[]> {
    console.log('getting genres');
    if (!this.genres$.getValue()) {
      this.genres$.next([]);
      this.httpGetGenres().subscribe(data => {
        this.genres$.next(data);
        this.storage.set('local', 'genres_cache', data, 3600);
      });
    }
    return this.genres$.asObservable();
  }

  getGenreById(id: number): Observable<string> {
    return this.genres$.pipe(
      filter(data => data && data.length > 0),
      take(1),
      map(data => data.find(i => i.id === id).name)
    );
    // const getGenre = () => {
    //     if (this.genres) {
    //       return this.genres.find(i => i.id === id).name;
    //     } else {
    //       return false;
    //     }
    // };
    // return new Observable(
    //   observer => {
    //     const waiter = () => {
    //       const res = getGenre();
    //       if (!res) {
    //         setTimeout(waiter, 100);
    //       } else {
    //         observer.next(res);
    //         observer.complete();
    //       }
    //     };
    //     waiter();
    //   }
    // );
  }

  getYears(): Observable<string[]> {
    return this.years$;
  }

  getFilteredMovies(): Observable<Movie[]> {
    return combineLatest([
      this.getAllMovies(),
      this.updateEmitter$.pipe(startWith(this.params))
    ]).pipe(
      map(data => data[0]),
      map(data => {
          const movies = data.filter(movie => this.filterMovie(movie));
          this.updateFilterParams(movies);
          movies.sort(this.sortMovies.bind(this));
          const start = (this.params.paginator.page - 1) * this.params.paginator.limit;
          return movies.slice(start, start + this.params.paginator.limit);
        }
      )
    );
  }

  private updateFilterParams(movies: Movie[]): void { // update filter params
    let genres = [].concat(...movies.map(m => m.genre_ids));
    genres = genres.filter((n, i) => genres.indexOf(n) === i);

    let years = movies.map(movie => movie.first_air_date.slice(0, 4));
    years = years.filter((n, i) => years.indexOf(n) === i).sort().reverse();

    this.params.filters.genres = genres;
    this.params.filters.premiereYears = years;
    this.params.paginator.total = movies.length;
    this.params.paginator.maxPage = Math.ceil(this.params.paginator.total / this.params.paginator.limit);

    this.filterEmitter$.next();
  }

  private sortMovies(a: Movie, b: Movie): number {
    const key = this.params.sort.field;
    const [m1, m2] = this.params.sort.method === 'asc' ? [a, b] : [b, a];
    if (isNaN(m1[key])) {
      return m2[key].localeCompare(m1[key]);
    }
    return m2[key] - m1[key];
  }

  private filterMovie(movie: Movie): boolean {
    let res = true;
    const curFilters = this.params.filter;
    for (const f in curFilters) {
      if (curFilters[f] && (curFilters[f].length || curFilters[f] > 0)) {
        if (typeof curFilters[f] === 'string') {
          if (!movie[f].toLowerCase().includes(curFilters[f].toLowerCase())) {
            res = false;
            break;
          }

        } else {
          if (movie[f].indexOf(curFilters[f]) === -1) {
            res = false;
            break;
          }
        }
      }
    }
    return res;
  }

  setFilter(name: string, val: string): void {
    this.params.filter[name] =
      typeof this.params.filter[name] === 'string' ? val : +val;
    this.updateEmitter$.next();
  }

  setPage(page: number): void {
    if (page < 1) {
      return;
    }
    if (page > this.params.paginator.maxPage) {
      page = this.params.paginator.maxPage;
    }
    this.params.paginator.page = page;
    this.updateEmitter$.next();
  }

  setLimit(limit: number): void {
    this.params.paginator.limit = limit;
    this.params.paginator.page = 1;
    this.updateEmitter$.next();
  }

  setSort(field: string): void {
    let method = 'asc';
    if (this.params.sort.field === field) {
      method = this.params.sort.method === 'asc' ? 'desc' : 'asc';
    }
    this.params.sort.field = field;
    this.params.sort.method = method;
    this.updateEmitter$.next();
  }

  private httpGetPopularTV(page: number = 1): Observable<Movie[]> {
    return this.http.get(this.getApiUrl('/tv/popular', {page})).pipe(
      pluck('results'),
      map(data =>
        (data as Movie[]).map(i => {
          i.poster_path = i.poster_path
            ? environment.MovieDdPosterBaseUrl + i.poster_path
            : null;
          return i;
        })
      ),
      catchError(err => {
        console.log('*************************************');
        console.log('*** Check API key in environment! ***');
        console.log('*************************************');
        throw err;
      })
    );
  }

  private httpGetGenres(): Observable<any> {
    return combineLatest([
      this.http.get(this.getApiUrl('/genre/tv/list')),
      this.http.get(this.getApiUrl('/genre/movie/list'))
    ]).pipe(
      map(data => [...(data[0] as any).genres, ...(data[1] as any).genres]),
      map(
        data => data.filter((s1, pos, arr) => arr.findIndex((s2) => s2.id === s1.id) === pos)
      )
    );
  }

  private getApiUrl(endpoint: string, extra?: object): string {
    extra = {...extra, api_key: environment.MovieDdApiKey};
    return environment.MovieDdApiBaseUrl + endpoint + '?' + Object.entries(extra).map(p => `${p[0]}=${p[1]}`).join('&');
  }
}
