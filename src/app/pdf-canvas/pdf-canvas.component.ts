import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { PdfService } from '../pdf.service';
import { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist/types/src/display/api';

interface Region {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

@Component({
  selector: 'app-pdf-canvas',
  templateUrl: './pdf-canvas.component.html',
  styleUrls: ['./pdf-canvas.component.scss']
})
export class PdfCanvasComponent implements OnInit {
  @ViewChild('pdfCanvas', { static: true }) pdfCanvas: ElementRef<HTMLCanvasElement>;

  private pdfDoc: PDFDocumentProxy;
  private currentPage: number = 1;
  private drawing: boolean = false;
  private context: CanvasRenderingContext2D;
  private previousPoint: { x: number, y: number } | null = null;
  private undoStack: ImageData[] = []; // Stack to store canvas states

  // Define allowed regions for drawing
  private allowedRegions: Region[] = [
    { x1: 250, y1: 50, x2: 600, y2: 125 }, // Example region 1
    // { x1: 250, y1: 100, x2: 400, y2: 200 } // Example region 2
  ];

  constructor(private pdfService: PdfService) {}

  async ngOnInit() {
    const url = 'assets/pdf/test.pdf'; // Path to your PDF file
    this.pdfDoc = await this.pdfService.getDocument(url);
    this.renderPage(this.currentPage);

    const canvas = this.pdfCanvas.nativeElement;
    this.context = canvas.getContext('2d');

    canvas.addEventListener('mousedown', this.startDrawing.bind(this));
    canvas.addEventListener('mousemove', this.draw.bind(this));
    canvas.addEventListener('mouseup', this.stopDrawing.bind(this));
    canvas.addEventListener('mouseout', this.stopDrawing.bind(this));
  }

  async renderPage(pageNumber: number) {
    const page: PDFPageProxy = await this.pdfDoc.getPage(pageNumber);
    const viewport = page.getViewport({ scale: 1.5 });

    const canvas = this.pdfCanvas.nativeElement;
    const context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderContext = {
      canvasContext: context,
      viewport: viewport
    };
    await page.render(renderContext).promise;

    // Highlight allowed regions
    this.highlightRegions();
  }

  highlightRegions() {
    this.context.fillStyle = 'rgba(255, 255, 0, 0.3)'; // Light yellow with transparency
    this.context.strokeStyle = 'red';
    this.context.lineWidth = 2;
    this.allowedRegions.forEach(region => {
      // Fill the region with a light color
      this.context.fillRect(region.x1, region.y1, region.x2 - region.x1, region.y2 - region.y1);
      // Draw the border around the region
      this.context.strokeRect(region.x1, region.y1, region.x2 - region.x1, region.y2 - region.y1);
    });
  }

  startDrawing(event: MouseEvent) {
    const { offsetX, offsetY } = event;
    if (this.isWithinAllowedRegion(offsetX, offsetY)) {
      this.saveState(); // Save the current state before starting a new drawing
      this.drawing = true;
      this.previousPoint = { x: offsetX, y: offsetY };
    }
  }

  draw(event: MouseEvent) {
    if (!this.drawing) return;
    const { offsetX, offsetY } = event;
    if (this.isWithinAllowedRegion(offsetX, offsetY)) {
      if (this.previousPoint) {
        this.context.beginPath();
        this.context.moveTo(this.previousPoint.x, this.previousPoint.y);
        this.context.quadraticCurveTo(this.previousPoint.x, this.previousPoint.y, offsetX, offsetY);
        this.context.stroke();
        this.previousPoint = { x: offsetX, y: offsetY };
      }
    }
  }

  stopDrawing() {
    this.drawing = false;
    this.previousPoint = null;
  }

  saveState() {
    const canvas = this.pdfCanvas.nativeElement;
    this.undoStack.push(this.context.getImageData(0, 0, canvas.width, canvas.height));
  }

  undo() {
    if (this.undoStack.length > 0) {
      const canvas = this.pdfCanvas.nativeElement;
      const previousState = this.undoStack.pop();
      this.context.putImageData(previousState, 0, 0);
      // Redraw the allowed regions highlight
      this.highlightRegions();
    }
  }

  isWithinAllowedRegion(x: number, y: number): boolean {
    return this.allowedRegions.some(region => x >= region.x1 && x <= region.x2 && y >= region.y1 && y <= region.y2);
  }
}
