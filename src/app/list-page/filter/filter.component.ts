import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {fromEvent} from 'rxjs';
import {debounceTime, map, takeWhile} from 'rxjs/operators';
import {TvService} from '../../shared/services/tv.service';
import {TvGenre} from '../../shared/interfaces/tv';

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss']
})
export class FilterComponent implements OnInit, OnDestroy {

  private isAlive = true;

  @ViewChild('nameFilter', {static: true}) filterByName;

  genres: TvGenre[];
  years: string[];

  constructor(private tvService: TvService) { }

  ngOnInit(): void {
    this.tvService.getGenres().pipe(
      takeWhile(() => this.isAlive)
    ).subscribe(
      data => this.genres = data
    );

    this.tvService.getPremiereYears().pipe(
      takeWhile(() => this.isAlive)
    ).subscribe(
      data => this.years = data
    );

    fromEvent<KeyboardEvent>(this.filterByName.nativeElement, 'keyup').pipe(
      debounceTime
      (500),
      map(event => event.target as HTMLInputElement)
    ).subscribe(element => {
      this.tvService.setFilter('name', element.value);
    });
  }

  filterByGenre($event: Event) {
    const element = $event.target as HTMLSelectElement;
    this.tvService.setFilter('genre', +element.value ? element.value : undefined);
  }

  filterByYear($event: Event) {
    const element = $event.target as HTMLSelectElement;
    this.tvService.setFilter('premiereYear', +element.value ? element.value : undefined);
  }

  ngOnDestroy(): void {
    this.isAlive = false;
  }

}
