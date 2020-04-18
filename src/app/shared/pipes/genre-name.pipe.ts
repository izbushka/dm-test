import { Pipe, PipeTransform } from '@angular/core';
import {MovieService} from '../services/movie.service';
import {Observable, of} from 'rxjs';

@Pipe({
  name: 'genreName'
})
export class GenreNamePipe implements PipeTransform {
  constructor(private movieService: MovieService) {}

  transform(id: number): Observable<string> {
    return this.movieService.getGenreById(id);
  }

}
