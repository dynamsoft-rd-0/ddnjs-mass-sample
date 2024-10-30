// Create JS function "startImageDecode"
window.startImageDecode = async () => {
  const inputElement = document.getElementById("inputElement");

  const { files } = inputElement;

  try {
    for (let file of files) {
      cvRouter = await Dynamsoft.CVR.CaptureVisionRouter.createInstance();
      // Decode selected image with 'ReadBarcodes_SpeedFirst' template.
      const result = await cvRouter.capture(file, "DetectDocumentBoundaries_Default");
      console.log(result); 
    }
  } catch (ex) {
    let errMsg = ex.message || ex;
    console.error(errMsg);
    alert(errMsg);
  } finally {
    inputElement.value = "";
    await cvRouter?.dispose();
  }
};
