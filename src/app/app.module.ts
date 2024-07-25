import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PdfCanvasComponent } from './pdf-canvas/pdf-canvas.component';
import { PdfService } from './pdf.service';

@NgModule({
  declarations: [
    AppComponent,
    PdfCanvasComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [PdfService],
  bootstrap: [AppComponent]
})
export class AppModule { }
