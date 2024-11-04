export function isMobile(){
    return "ontouchstart" in document.documentElement;
}

export async function initDocDetectModule(DDV, CVR) {
    const router = await CVR.CaptureVisionRouter.createInstance();

    class DDNNormalizeHandler extends DDV.DocumentDetect {
        async detect(image, config) {
            if (!router) {
                return Promise.resolve({
                    success: false
                });
            };
    
            let width = image.width;
            let height = image.height;
            let ratio = 1;
            let data;
    
            if (height > 720) {
                ratio = height / 720;
                height = 720;
                width = Math.floor(width / ratio);
                data = compress(image.data, image.width, image.height, width, height);
            } else {
                data = image.data.slice(0);
            }
    
    
            // Define DSImage according to the usage of DDN
            const DSImage = {
                bytes: new Uint8Array(data),
                width,
                height,
                stride: width * 4, //RGBA
                format: 10 // IPF_ABGR_8888
            };
    
            // Use DDN document detection module
            const DDNsettings = {
                CaptureVisionTemplates: [
                  {
                    ImageROIProcessingNameArray: ["roi-detect-document-boundaries"],
                    ImageSource: "",
                    MaxParallelTasks: 4,
                    MinImageCaptureInterval: 0,
                    Name: "DetectDocumentBoundaries_Default",
                    SemanticProcessingNameArray: null,
                    Timeout: 10000,
                  },
                  {
                    Name: "NormalizeDocument_Default",
                    ImageROIProcessingNameArray: ["roi-normalize-docs"]
                  }
                ],
                  DocumentNormalizerTaskSettingOptions: [
                    {
                
                      BaseDocumentNormalizerTaskSettingName: "",
                      Brightness: 0,
                      ColourMode: "ICM_COLOUR",
                      ContentType: "CT_DOCUMENT",
                      Contrast: 0,
                      CornerAngleRange: {
                        MaxValue: 110,
                        MinValue: 70,
                      },
                      DeskewMode: {
                        ContentDirection: 0,
                        Mode: "DM_PERSPECTIVE_CORRECTION",
                      },
                      LineExtractionModes: [
                        {
                          Mode: "LEM_GENERAL",
                        },
                      ],
                      MaxThreadsInOneTask: 4,
                      Name: "task-detect-document-boundaries",
                      PageSize: [-1, -1],
                      QuadrilateralDetectionModes:
                        [
                          {
                            "Mode": "QDM_GENERAL",
                            "MinQuadrilateralAreaRatio": 0
                          }
                        ],
                      ExpectedDocumentsCount: 1,
                      SectionImageParameterArray: [
                        {
                          ContinueWhenPartialResultsGenerated: 1,
                          ImageParameterName: "ip-detect",
                          Section: "ST_REGION_PREDETECTION",
                        },
                        {
                          ContinueWhenPartialResultsGenerated: 1,
                          ImageParameterName: "ip-detect",
                          Section: "ST_DOCUMENT_DETECTION",
                        },
                        {
                          ContinueWhenPartialResultsGenerated: 1,
                          ImageParameterName: "ip-detect",
                          Section: "ST_DOCUMENT_NORMALIZATION",
                        },
                      ],
                      StartSection: "ST_REGION_PREDETECTION",
                      TerminateSetting: {
                        Section: "ST_DOCUMENT_DETECTION",
                        Stage: "IRUT_NULL",
                      },
                    },
                    {
                      Name: "task-normalize-docs",
                      StartSection: "ST_DOCUMENT_NORMALIZATION"
                    }
                  ],
                    GlobalParameter: {
                  MaxTotalImageDimension: 0,
                },
                ImageParameterOptions: [
                  {
                    BaseImageParameterName: "",
                    BinarizationModes: [
                      {
                        BinarizationThreshold: -1,
                        BlockSizeX: 7,
                        BlockSizeY: 7,
                        EnableFillBinaryVacancy: 0,
                        GrayscaleEnhancementModesIndex: -1,
                        Mode: "BM_LOCAL_BLOCK",
                        MorphOperation: "Close",
                        MorphOperationKernelSizeX: 3,
                        MorphOperationKernelSizeY: 3,
                        MorphShape: "Rectangle",
                        ThresholdCompensation: 4,
                      },
                    ],
                    ColourConversionModes: [
                      {
                        BlueChannelWeight: -1,
                        GreenChannelWeight: -1,
                        Mode: "CICM_GENERAL",
                        RedChannelWeight: -1,
                        ReferChannel: "H_CHANNEL",
                      },
                      {
                        Mode: "CICM_HSV",
                        ReferChannel: "H_CHANNEL",
                      },
                    ],
                    GrayscaleEnhancementModes: [
                      {
                        Mode: "GEM_SHARPEN_SMOOTH",
                        SharpenBlockSizeX: 3,
                        SharpenBlockSizeY: 3,
                        SmoothBlockSizeX: 3,
                        SmoothBlockSizeY: 3,
                      },
                    ],
                    GrayscaleTransformationModes: [
                      {
                        Mode: "GTM_ORIGINAL",
                      },
                    ],
                    IfEraseTextZone: 0,
                    Name: "ip-detect",
                    RegionPredetectionModes: [
                      {
                        AspectRatioRange: "[]",
                        FindAccurateBoundary: 0,
                        ForeAndBackgroundColours: "[]",
                        HeightRange: "[]",
                        ImageParameterName: "",
                        MeasuredByPercentage: 1,
                        MinImageDimension: 262144,
                        Mode: "RPM_GENERAL",
                        RelativeRegions: "[]",
                        Sensitivity: 1,
                        SpatialIndexBlockSize: 5,
                        WidthRange: "[]",
                      },
                    ],
                    ScaleDownThreshold: 512,
                    ScaleUpModes: [
                      {
                        AcuteAngleWithXThreshold: -1,
                        LetterHeightThreshold: 0,
                        Mode: "SUM_AUTO",
                        ModuleSizeThreshold: 0,
                        TargetLetterHeight: 0,
                        TargetModuleSize: 0,
                      },
                    ],
                    TextDetectionMode: {
                      CharHeightRange: [1, 1000, 1],
                      Direction: "HORIZONTAL",
                      MaxSpacingInALine: -1,
                      Mode: "TTDM_WORD",
                      Sensitivity: 7,
                      StringLengthRange: null,
                    },
                    TextureDetectionModes: [
                      {
                        Mode: "TDM_GENERAL_WIDTH_CONCENTRATION",
                        Sensitivity: 5,
                      },
                    ],
                  },
                ],
                  TargetROIDefOptions: [
                    {
                      BaseTargetROIDefName: "",
                      Location: {
                        Offset: {
                          FirstPoint: [0, 0, 1, 1],
                          FourthPoint: [0, 100, 1, 1],
                          MeasuredByPercentage: 1,
                          ReferenceObjectOriginIndex: 0,
                          ReferenceObjectType: "ROT_ATOMIC_OBJECT",
                          ReferenceXAxis: {
                            AxisType: "AT_MIDPOINT_EDGE",
                            EdgeIndex: 0,
                            LengthReference: "LR_X",
                            RotationAngle: 90,
                          },
                          ReferenceYAxis: {
                            AxisType: "AT_MIDPOINT_EDGE",
                            EdgeIndex: 1,
                            LengthReference: "LR_Y",
                            RotationAngle: 90,
                          },
                          SecondPoint: [100, 0, 1, 1],
                          ThirdPoint: [100, 100, 1, 1],
                        },
                      },
                      Name: "roi-detect-document-boundaries",
                      PauseFlag: 0,
                      TaskSettingNameArray: ["task-detect-document-boundaries"],
                    },
                    {
                      Name: "roi-normalize-docs",
                      TaskSettingNameArray: ["task-normalize-docs"]
                    }
                  ],
            };
            await router.initSettings(DDNsettings);
            const results = await router.capture(DSImage, 'DetectDocumentBoundaries_Default');
    
            // Filter the results and generate corresponding return values
            if (results.items.length <= 0) {
                return Promise.resolve({
                    success: false
                });
            };
            
            const quad = [];
            results.items[0].location.points.forEach((p) => {
                quad.push([p.x * ratio, p.y * ratio]);
            });
    
            const detectResult = this.processDetectResult({
                location: quad,
                width: image.width,
                height: image.height,
                config
            });
    
            return Promise.resolve(detectResult);
        }
    }
  
    DDV.setProcessingHandler('documentBoundariesDetect', new DDNNormalizeHandler())
}

function compress(
    imageData,
    imageWidth,
    imageHeight,
    newWidth,
    newHeight,
) {
    let source = null;
    try {
        source = new Uint8ClampedArray(imageData);
    } catch (error) {
        source = new Uint8Array(imageData);
    }
  
    const scaleW = newWidth / imageWidth;
    const scaleH = newHeight / imageHeight;
    const targetSize = newWidth * newHeight * 4;
    const targetMemory = new ArrayBuffer(targetSize);
    let distData = null;
  
    try {
        distData = new Uint8ClampedArray(targetMemory, 0, targetSize);
    } catch (error) {
        distData = new Uint8Array(targetMemory, 0, targetSize);
    }
  
    const filter = (distCol, distRow) => {
        const srcCol = Math.min(imageWidth - 1, distCol / scaleW);
        const srcRow = Math.min(imageHeight - 1, distRow / scaleH);
        const intCol = Math.floor(srcCol);
        const intRow = Math.floor(srcRow);
  
        let distI = (distRow * newWidth) + distCol;
        let srcI = (intRow * imageWidth) + intCol;
  
        distI *= 4;
        srcI *= 4;
  
        for (let j = 0; j <= 3; j += 1) {
            distData[distI + j] = source[srcI + j];
        }
    };
  
    for (let col = 0; col < newWidth; col += 1) {
        for (let row = 0; row < newHeight; row += 1) {
            filter(col, row);
        }
    }
  
    return distData;
}
