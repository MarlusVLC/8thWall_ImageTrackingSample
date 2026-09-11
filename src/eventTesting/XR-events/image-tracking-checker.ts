import * as ecs from '@8thwall/ecs'

// ecs.events.REALITY_IMAGE_FOUND
// ecs.events.REALITY_IMAGE_LOST
// ecs.events.REALITY_IMAGE_UPDATED -> Executado continuamente - Tomar cuidado com o que roda aqui
const createRealityImageDetectionHandler = (detectionStatus: 'FOUND' | 'LOST' | 'UPDATED' ) => (e: {data: ImageTargetEventData}) => {
    console.log(`reality image ${detectionStatus} = `, e.data);
    // const data = e.data;
    // const metadata = JSON.stringify(e.data.metadata);
    // console.log(`${detectionStatus} image METADATA = ${metadata}`)
    // console.log(`${detectionStatus} image name = ${data.name} | type = ${data.type} | 
    //     position = ${JSON.stringify(data.position)} | 
    //     rotation = ${JSON.stringify(data.rotation)} | 
    //     scale = ${data.scale}`)
    // const p = data.properties;
    // console.log(`${detectionStatus} image PROPERTIES -> width = ${p.width} | height = ${p.height} | original width = ${p.originalWidth} | original height = ${p.originalHeight} | isRotated = ${p.isRotated} | left = ${p.left} | top = ${p.top} | moveable = ${p.moveable} `)
    // switch(data.type){
    //     case 'FLAT':
    //         console.log(`FLAT image properties -> scaledWidth = ${data.scaledWidth} | scaledHeight = ${data.scaledHeight}`);
    //         break;
    //     case 'CONICAL':
    //     case 'CYLINDRICAL':
    //         console.log(`CYLINDRICAL or CONICAL image properties -> height = ${data.height} | radiusTop = ${data.radiusTop} | radiusBottom = ${data.radiusBottom} | arcStartRadians = ${data.arcStartRadians} | arcLengthRadians = ${data.arcLengthRadians}`)
    // }
} 

// ecs.events.REALITY_IMAGE_LOADING
// ecs.events.REALITY_IMAGE_SCANNING
const createRealityImagePreProcessingHandler = (processingStatus: 'LOADING' | 'SCANNING') => (e: {data: ImageTargetEventDataCollection}) => {
    console.log(`reality images ${processingStatus} = `, e);
    // const images = e.data.imageTargets;
    // images.forEach(img => {
    //     console.log(`${processingStatus} image data = `, JSON.stringify(img));
    //     console.log(`${processingStatus} image name = ${img.name} | type: ${img.type} | Metadata: ${JSON.stringify(img.metadata)}`)    ;
    //     console.log('${processingStatus} img properties = ', img.properties)
    // });
}


const imageTrackingChecker = ecs.registerComponent({
    name: 'Image Tracking Checker',
    stateMachine: ({world, eid, dataAttribute, schemaAttribute, defineState}) => {
        const preAugmentationState = defineState('pre-augmentation').initial();

        const handleRealityImageFound = createRealityImageDetectionHandler('FOUND');
        preAugmentationState.listen(world.events.globalId, ecs.events.REALITY_IMAGE_FOUND, handleRealityImageFound)

        const handleRealityImageLost = createRealityImageDetectionHandler('LOST');
        preAugmentationState.listen(world.events.globalId, ecs.events.REALITY_IMAGE_LOST, handleRealityImageLost)

        // const handleRealityImageUpdated = createRealityImageDetectionHandler('UPDATED');
        // preAugmentationState.listen(world.events.globalId, ecs.events.REALITY_IMAGE_UPDATED, handleRealityImageUpdated)
        
        const handleRealityImagesLoading = createRealityImagePreProcessingHandler("LOADING");
        preAugmentationState.listen(world.events.globalId, ecs.events.REALITY_IMAGE_LOADING, handleRealityImagesLoading)

        const handleRealityImagesScanning = createRealityImagePreProcessingHandler("SCANNING");
        preAugmentationState.listen(world.events.globalId, ecs.events.REALITY_IMAGE_SCANNING, handleRealityImagesScanning);
    }
})

export {imageTrackingChecker}
