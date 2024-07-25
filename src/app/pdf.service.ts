import { Injectable } from '@angular/core';
import * as pdfjsLib from 'pdfjs-dist';
import * as pdfjsWorker from 'pdfjs-dist/build/pdf.worker.entry';
import { PDFDocumentProxy } from 'pdfjs-dist/types/src/display/api';

@Injectable({
  providedIn: 'root'
})
export class PdfService {
  constructor() {
    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
  }

  async getDocument(url: string): Promise<PDFDocumentProxy> {
    return pdfjsLib.getDocument(url).promise;
  }
}
