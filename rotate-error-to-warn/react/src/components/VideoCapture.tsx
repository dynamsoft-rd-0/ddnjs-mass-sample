import React, { useEffect, useRef, useState, useCallback, MutableRefObject } from 'react';
import '../cvr';
import { DetectedQuadsResult } from 'dynamsoft-document-normalizer';
import { CameraEnhancer, CameraView } from 'dynamsoft-camera-enhancer';
import { CaptureVisionRouter, CapturedResultReceiver } from 'dynamsoft-capture-vision-router';
import { MultiFrameResultCrossFilter } from "dynamsoft-utility";
import { EnumImagePixelFormat } from "dynamsoft-core";

const strErrorDistoryed = 'videoCapture component destoryed';

function VideoRecognizer() {

  const rfElContainer:MutableRefObject<HTMLDivElement|null> = useRef(null);

  useEffect(()=>{
    if(!rfElContainer.current){return;}

    let resolveInit:()=>void;
    let pInit:Promise<void> = new Promise(r=>{resolveInit=r});
    let bDestoryed = false;

    let cvr:CaptureVisionRouter;
    let view:CameraView;
    let cameraEnhancer:CameraEnhancer;
    
    (async()=>{
      try{
        cvr = await CaptureVisionRouter.createInstance();
        view = await CameraView.createInstance();
        cameraEnhancer = await CameraEnhancer.createInstance(view);
        
        if(bDestoryed){ throw Error(strErrorDistoryed); }
        rfElContainer.current!.append(view.getUIElement());
        cvr.setInput(cameraEnhancer);

        if(bDestoryed){ throw Error(strErrorDistoryed); }
        await cameraEnhancer!.open();
        if(bDestoryed){ throw Error(strErrorDistoryed); }
        await cvr.startCapturing("DetectDocumentBoundaries_Default");
        if(bDestoryed){ throw Error(strErrorDistoryed); }

      }catch(ex){
        
        if((ex as Error)?.message === strErrorDistoryed){
          console.log(strErrorDistoryed);
        }else{
          console.error(ex);
        }
      }

      // distroy function will wait pInit
      resolveInit!();
    })();

    // destory function
    return ()=>{
      bDestoryed = true;
      (async()=>{
        await pInit;
        cvr?.dispose();
        cameraEnhancer?.dispose();
      })();
    }
  },[rfElContainer]);
  
  // warning: don't add any other elements to this div, 
  // so the CameraView(not mounted by react) will not be break.
  return <div ref={rfElContainer} style={{width:'100vw',height:'70vh'}}></div>;
}

export default VideoRecognizer;
