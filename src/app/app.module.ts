import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ListPageComponent } from './list-page/list-page.component';
import { NoSpacesPipe } from './shared/pipes/nospaces.pipe';
import { PaginatorComponent } from './list-page/paginator/paginator.component';
import { FilterComponent } from './list-page/filter/filter.component';
import {SorterComponent} from './list-page/sorter/sorter.component';

@NgModule({
  declarations: [
    AppComponent,
    ListPageComponent,
    NoSpacesPipe,
    PaginatorComponent,
    FilterComponent,
    SorterComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
