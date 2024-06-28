import { Component, Input } from '@angular/core';
import { CapturedImages } from '../../app.component';

const MAX_GRAY_IMAGE_SIZE = 250 * 1000;
const MAX_COLOR_IMAGE_SIZE = 3 * 1000 * 1000;

@Component({
  selector: 'app-image-container',
  standalone: true,
  imports: [],
  templateUrl: './image-container.component.html',
  styleUrl: './image-container.component.css'
})
export class ImageContainerComponent {
  @Input() showCaptureViewer: boolean = true;
  @Input() switchVisibility: (value: boolean) => void = () => {};
  @Input() images: CapturedImages = {
    originalImage: "",
    detectedImage: ""
  };

  saveOriginalColor = ()=>{
    downloadImage({
      blob: this.images.originalBlob!,
      name: "original-color",
      maxSize: MAX_COLOR_IMAGE_SIZE
    })
  }

  saveOriginalGray = ()=>{
    downloadImage({
      blob: this.images.originalBlob!,
      name: "original-gray",
      convertToGray: true,
      maxSize: MAX_GRAY_IMAGE_SIZE
    })
  }

  saveOriginalPdf = ()=>{
    throw Error("Not implemented!")
  }

  saveNormalizedColor = ()=>{
    downloadImage({
      blob: this.images.detectedBlob!,
      name: "normalized-color",
      maxSize: MAX_COLOR_IMAGE_SIZE
    })
  }

  saveNormalizedGray = ()=>{
    downloadImage({
      blob: this.images.detectedBlob!,
      name: "normalized-gray",
      convertToGray: true,
      maxSize: MAX_GRAY_IMAGE_SIZE
    })
  }

  saveNormalizedPdf = ()=>{
    throw Error("Not implemented!")
  }
}


// refer: https://dev.to/nombrekeff/download-file-from-blob-21ho
function downloadBlob(blob: Blob, name: string) {
  // Convert your blob into a Blob URL (a special url that points to an object in the browser's memory)
  const blobUrl = URL.createObjectURL(blob);

  // Create a link element
  const link = document.createElement("a");

  // Set link's href to point to the Blob URL
  link.href = blobUrl;
  link.download = name;

  // Append link to the body
  document.body.appendChild(link);

  // Dispatch click event on the link
  // This is necessary as link.click() does not work on the latest firefox
  link.dispatchEvent(
      new MouseEvent('click', { 
          bubbles: true, 
          cancelable: true, 
          view: window 
      })
  );

  // Remove link from body
  document.body.removeChild(link);
}


let _isSupportWebp:boolean|undefined = undefined; // lazy define to avoid SSR problem
// refer: https://stackoverflow.com/questions/5573096/detecting-webp-support
function isSupportWebp()
{
  if(undefined !== _isSupportWebp){
    return _isSupportWebp as boolean;
  }

  let elem = document.createElement('canvas');

  if (!!(elem.getContext && elem.getContext('2d')))
  {
    // was able or not to get WebP representation
    _isSupportWebp = elem.toDataURL('image/webp').indexOf('data:image/webp') == 0;
  }
  else
  {
    // very old browser like IE 8, canvas not supported
    _isSupportWebp =  false;
  }
  return _isSupportWebp;
}

async function downloadImage({blob, name, convertToGray, maxSize}: {blob: Blob, name: string, convertToGray?: boolean, maxSize?: number}): Promise<void>{

  // default value
  convertToGray = convertToGray || false;
  maxSize = maxSize || 0;

  if(!convertToGray && (!maxSize || blob.size <= maxSize)){
    // color image and size match
    downloadBlob(blob, name + '.jpg');
    return;
  }

  // The image needs some processing

  let canvas = document.createElement('canvas');
  let image = new Image();
  await new Promise((rs, rj)=>{
    image.onload = rs;
    image.onerror = rj;
    image.src = URL.createObjectURL(blob);
  });
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  let ctx = canvas.getContext('2d')!;
  ctx.drawImage(image, 0, 0);

  if(convertToGray){
    // gray image

    let imgData = ctx.getImageData(0, 0, image.naturalWidth, image.naturalHeight);
    let data = imgData.data;
    for(let i = 0; i < data.length; i+=4){
      data[i] = data[i + 1] = data[i + 2] = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
    }
    ctx.putImageData(imgData, 0, 0);

  }

  const imgFormat = isSupportWebp() ? "image/webp" : "image/jpeg"; //"image/jpeg";
  const imgSuffix = isSupportWebp() ? ".webp" : ".jpg"; //".jpg";
  name += imgSuffix;

  // Rebuild the blob
  await new Promise<void>(rs=>{
    canvas.toBlob(_blob => {
      blob = _blob!;
      rs();
    }, imgFormat);
  });

  // size match
  if(!maxSize || blob.size <= maxSize){
    downloadBlob(blob, name);
    return;
  }
  
  // size not match

  let leftCount = 30;
  let isSuccess = false;
  let quality = 1;
  while(--leftCount >= 0){
    quality *= 0.8;
    await new Promise<void>(rs=>{
      canvas.toBlob(_blob => {
        blob = _blob!;
        rs();
      }, imgFormat, quality);
    });

    console.log(`quality: ${quality}, size: ${blob.size}`); //debug
    if(blob.size <= maxSize){
      downloadBlob(blob, name);
      isSuccess = true;
      break;
    }
  }
  if(!isSuccess){
    alert(`${name} cannot be compressed to less than ${Math.ceil(maxSize/1000)}KB.`)
  }

}
