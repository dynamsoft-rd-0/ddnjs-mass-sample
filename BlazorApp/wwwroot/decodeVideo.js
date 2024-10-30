// Create JS function "startVideoDecode"
window.startVideoDecode = async () => {
    const cameraViewContainer = document.getElementById("camera-view-container");

    try {
        // Create a `CameraEnhancer` instance for camera control and a `CameraView` instance for UI control.
        const cameraView = await Dynamsoft.DCE.CameraView.createInstance();
        cameraEnhancer = await Dynamsoft.DCE.CameraEnhancer.createInstance(cameraView);
        // Get default UI and append it to DOM.
        cameraViewContainer.style.display = "block"
        cameraViewContainer.append(cameraView.getUIElement());

        // Create a `CaptureVisionRouter` instance and set `CameraEnhancer` instance as its image source.
        cvRouter = await Dynamsoft.CVR.CaptureVisionRouter.createInstance();
        cvRouter.setInput(cameraEnhancer);

        // Define a callback for results.
        cvRouter.addResultReceiver({
          onDetectedQuadsReceived: (result) => {
              console.log(result);
            },
        });

        // Open camera and start scanning single barcode.
        await cameraEnhancer.open();
        cameraView.setScanLaserVisible(true);
        await cvRouter.startCapturing("DetectDocumentBoundaries_Default");
    } catch (ex) {
        let errMsg = ex.message || ex;
        console.error(errMsg);
    }
}

// Create JS function "stopVideoDecode"
window.stopVideoDecode = async () => {
    const cameraViewContainer = document.getElementById("camera-view-container");
    try {
        if (!cvRouter?.disposed) {
            await cvRouter?.dispose();
        }
        if (!cameraEnhancer?.disposed) {
            await cameraEnhancer?.dispose();
        }

        // Reset components
        cameraViewContainer.style.display = "none";
        cameraViewContainer.innerHTML = "";
    } catch (ex) {
        let errMsg = ex.message || ex;
        console.error(errMsg);
    }
}
