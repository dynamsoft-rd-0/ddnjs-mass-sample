import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { CaptureViewerComponent } from './components/capture-viewer/capture-viewer.component';
import { ImageContainerComponent } from "./components/image-container/image-container.component";

export interface CapturedImages {
  originalBlob?: Blob,
  originalImage?: string,
  detectedBlob?: Blob,
  detectedImage?: string,
  bGray?: boolean
}

@Component({
    selector: 'app-root',
    standalone: true,
    templateUrl: './app.component.html',
    styleUrl: './app.component.css',
    imports: [
      CommonModule,
      RouterOutlet,
      CaptureViewerComponent,
      ImageContainerComponent,
    ],
})

export class AppComponent {
  showCaptureViewer: boolean = true;
  images: CapturedImages = {
    originalImage: '',
    detectedImage: '',
    bGray: false
  };
  
  switchVisibility = (value: boolean) => {
    this.showCaptureViewer = value
  };
  setImages = (value: CapturedImages) => {
    if(this.images.originalImage){
      URL.revokeObjectURL(this.images.originalImage);
    }
    if(this.images.detectedImage){
      URL.revokeObjectURL(this.images.detectedImage);
    }
    if(!value.originalImage && value.originalBlob){
      value.originalImage = URL.createObjectURL(value.originalBlob);
    }
    if(!value.detectedImage && value.detectedBlob){
      value.detectedImage = URL.createObjectURL(value.detectedBlob);
    }
    this.images =  value;
    this.images.bGray = value.bGray;
    //console.log(value);//debug
  };
}
