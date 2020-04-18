import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {ListingPageComponent} from './listing-page/listing-page.component';
import {HttpClientModule} from '@angular/common/http';
import {NgxWebstorageModule} from 'ngx-webstorage';
import {FilterComponent} from './listing-page/filter/filter.component';
import {PaginatorComponent} from './listing-page/paginator/paginator.component';
import {SorterComponent} from './listing-page/sorter/sorter.component';
import {GenreNamePipe} from './shared/pipes/genre-name.pipe';
import {RemoveSpacesPipe} from './shared/pipes/remove-spaces.pipe';

@NgModule({
  declarations: [
    AppComponent,
    ListingPageComponent,
    FilterComponent,
    PaginatorComponent,
    SorterComponent,
    GenreNamePipe,
    RemoveSpacesPipe
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    NgxWebstorageModule.forRoot()
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
