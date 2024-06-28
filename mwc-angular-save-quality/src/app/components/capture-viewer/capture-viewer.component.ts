import type { CaptureViewer, IDocument } from 'dynamsoft-document-viewer';
import { Component, Input, SimpleChanges } from '@angular/core';
import { CaptureVisionRouter } from 'dynamsoft-capture-vision-router';
import { DDV } from 'dynamsoft-document-viewer';
import { initDocDetectModule } from '../../utils/initDocDetectModule';
import { CapturedImages } from '../../app.component';
import { CoreModule } from 'dynamsoft-core';
import { LicenseManager } from 'dynamsoft-license';
import 'dynamsoft-document-normalizer';

// The external CSS for an Angular project should be imported via the angular.json file.
// import "dynamsoft-document-viewer/dist/ddv.css"

@Component({
  selector: 'app-capture-viewer',
  standalone: true,
  imports: [],
  templateUrl: './capture-viewer.component.html',
  styleUrl: './capture-viewer.component.css'
})


export class CaptureViewerComponent {
  @Input() showCaptureViewer: boolean = true;
  @Input() switchVisibility: (value: boolean) => void = () => {};
  @Input() setImages: (value: CapturedImages) => void = () => {};
  captureViewer: CaptureViewer | null = null;
  bGray: boolean = false;

  onCaptureGray() {
    console.log('onCaptureGray');
    this.bGray = true;
    this.captureViewer?.capture();
  }

  onCaptureColor() {
    console.log('onCaptureColor');
    this.bGray = false;
    this.captureViewer?.capture();
  }

  async convertToGray(origBlob: Blob) {
    let canvas = document.createElement('canvas');
    let image = new Image();
    await new Promise((rs, rj)=>{
      image.onload = rs;
      image.onerror = rj;
      image.src = URL.createObjectURL(origBlob);
    });
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    let ctx = canvas.getContext('2d')!;
    ctx.drawImage(image, 0, 0);

    // gray image
    let imgData = ctx.getImageData(0, 0, image.naturalWidth, image.naturalHeight);
    let data = imgData.data;
    for(let i = 0; i < data.length; i+=4){
      data[i] = data[i + 1] = data[i + 2] = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
    }
    ctx.putImageData(imgData, 0, 0);

    // Rebuild the blob
    let ret;
    await new Promise<void>(rs=>{
      canvas.toBlob(_blob => {
        ret = _blob!;
        rs();
      }, 'jpeg');
    });

    return ret;
  }
  
  async ngOnInit() {
    CoreModule.engineResourcePaths = {
      rootDirectory: "https://cdn.jsdelivr.net/npm/",
      core: "dynamsoft-core@3.0.30/dist/",
      cvr: "dynamsoft-capture-vision-router@2.0.30/dist/",
      ddn: "dynamsoft-document-normalizer@2.0.20/dist/",
      license: "dynamsoft-license@3.0.20/dist/",
      dip: "dynamsoft-image-processing@2.0.30/dist/",
      std: "dynamsoft-capture-vision-std@1.0.0/dist/",
    };
    CoreModule.loadWasm(["DDN"]);
  
    DDV.Core.engineResourcePath = 'https://cdn.jsdelivr.net/npm/dynamsoft-document-viewer@1.1.0/dist/engine';
    DDV.Core.loadWasm();
  
    await LicenseManager.initLicense('DLS2eyJoYW5kc2hha2VDb2RlIjoiMjAwMDAxLTEwMjQ5NjE5NyJ9', true)
    await DDV.Core.init()
  
    const router = await CaptureVisionRouter.createInstance();
    await initDocDetectModule(DDV, router);

    this.captureViewer = new DDV.CaptureViewer({
      container: 'viewerContainer',
      
      uiConfig: {
        type: DDV.Elements.Layout,
        flexDirection: "column",
        className: "ddv-capture-viewer-desktop",
        children: [
          {
            type: DDV.Elements.Layout,
            className: "ddv-capture-viewer-header-desktop", 
            children: [
              {
                type: DDV.Elements.Layout,
                className: "ddv-capture-viewer-header-desktop", 
                children:[
                  {
                    type: DDV.Elements.CameraResolution,
                    className: "ddv-capture-viewer-resolution-desktop"
                  },
                  DDV.Elements.AutoDetect, 
                  {
                    type: DDV.Elements.Button,
                    className: "menuIcon Capture Color",
                    label: "Capture Color",
                    style: {
                      width: "100px",
                      height: "30px",
                      border: "solid 1px #CCC",
                      margin: "0 10px"
                    },
                    events: {
                      "click": () => {this.onCaptureColor()},
                    }
                  },
                  {
                    type: DDV.Elements.Button,
                    className: "menuIcon Capture Gray",
                    label: "Capture Gray",
                    style: {
                      width: "100px",
                      height: "30px",
                      border: "solid 1px #CCC",
                      margin: "0 10px"
                    },
                    events: {
                      "click": () => {this.onCaptureGray()},
                    }
                  },
                  DDV.Elements.AutoCapture
                ]
              }
            ]
          },
          DDV.Elements.MainView,
          {
            type: DDV.Elements.ImagePreview, 
            className: "ddv-capture-viewer-image-preview-desktop"
          }
        ]
      },
      viewerConfig: {
        acceptedPolygonConfidence: 60,
        enableAutoDetect: true
      }
    });

    this.captureViewer.play({
      resolution: [1920, 1080]
    });

    this.captureViewer.on("captured",async (e) => {
      const doc = (this.captureViewer as CaptureViewer).currentDocument as IDocument;
      const pageData = await doc.getPageData(e.pageUid) as any;
      this.switchVisibility(false);
      
      let originalBlob, detectedBlob;
      if(this.bGray) {
        console.log('convert to gray');
        originalBlob = await this.convertToGray(pageData.raw.data);
        detectedBlob = await this.convertToGray(pageData.display.data);
      } else {
        originalBlob = pageData.raw.data;
        detectedBlob = pageData.display.data;
      }

      this.setImages({
        originalBlob: originalBlob,
        detectedBlob: detectedBlob,
        bGray: this.bGray
      })
    });
  }

  ngOnChanges(changes: SimpleChanges){
    if(changes['showCaptureViewer']) {
      const oldValue = changes['showCaptureViewer'].previousValue;
      const newValue = changes['showCaptureViewer'].currentValue;
      if(oldValue !== newValue) {
        if(newValue === true) {
          this.captureViewer?.currentDocument?.deleteAllPages();
          this.captureViewer?.play();
        } else {
          this.captureViewer?.stop()
        }
      }
    }
  }
}
