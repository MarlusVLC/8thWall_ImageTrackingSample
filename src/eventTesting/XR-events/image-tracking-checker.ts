import * as ecs from '@8thwall/ecs'
import { addManagedListener } from '../event-cleaner';


// ecs.events.REALITY_IMAGE_FOUND
// ecs.events.REALITY_IMAGE_LOST
// ecs.events.REALITY_IMAGE_UPDATED
const createRealityImageDetectionHandler = (detectionStatus: 'FOUND' | 'LOST' | 'UPDATED' ) => (e: {data: ImageTargetEventData}) => {
    console.log(`reality image ${detectionStatus} = `, e);
    // const data = e.data;
    // const metadata = JSON.stringify(e.data.metadata);
    // console.log(`${detectionStatus} image METADATA = ${metadata}`)
    // console.log(`${detectionStatus} image name = ${data.name} | type = ${data.type} | 
    //     position = ${JSON.stringify(data.position)} | 
    //     rotation = ${JSON.stringify(data.rotation)} | 
    //     scale = ${data.scale}`)
    // const p = data.properties;
    // console.log(`${detectionStatus} image PROPERTIES -> width = ${p.width} | height = ${p.height} | original width = ${p.originalWidth} | original height = ${p.originalHeight} | isRotated = ${p.isRotated} `)
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
const createRealityImageLoadingHandler = () => (e: {data: ImageLoadingEventDataCollection}) => {
    console.log('reality images LOADING = ', e);
    // const images = e.data.imageTargets;
    // images.forEach(img => {
    //     console.log('LOADING image data = ', JSON.stringify(img));
    //     console.log(`LOADING image name = ${img.name} | type: ${img.type} | Metadata: ${JSON.stringify(img.metadata)}`)    ;
    //     console.log('LOADING img properties = ', img.properties)
    // });
}

// ecs.events.REALITY_IMAGE_SCANNING
const createRealityImageScanningHandler = () => (e: {data: ImageScanningEventDataCollection}) => {
    console.log('reality images being SCANNED = ', e);
//     const images = e.data.imageTargets;
//     images.forEach(img => {
//         console.log('SCANNED image data = ', JSON.stringify(img));
//         console.log(`SCANNED image name = ${img.name} | type: ${img.type} | Metadata: ${JSON.stringify(img.metadata)}`)    ;
//         console.log('SCANNED img properties = ', img.properties)
//     });
}

const imageTrackingChecker = ecs.registerComponent({
    name: 'Image Tracking Checker',
    stateMachine: ({world, eid, dataAttribute, schemaAttribute, defineState}) => {
        const preAugmentationState = defineState('pre-augmentation').initial();

        const handleRealityImageFound = createRealityImageDetectionHandler('FOUND');
        preAugmentationState.listen(world.events.globalId, ecs.events.REALITY_IMAGE_FOUND, handleRealityImageFound)

        const handleRealityImageLost = createRealityImageDetectionHandler('LOST');
        preAugmentationState.listen(world.events.globalId, ecs.events.REALITY_IMAGE_LOST, handleRealityImageLost)

        const handleRealityImageUpdated = createRealityImageDetectionHandler('UPDATED');
        preAugmentationState.listen(world.events.globalId, ecs.events.REALITY_IMAGE_UPDATED, handleRealityImageUpdated)
        
        const handleRealityImagesLoading = createRealityImageLoadingHandler();
        preAugmentationState.listen(world.events.globalId, ecs.events.REALITY_IMAGE_LOADING, handleRealityImagesLoading)

        const handleRealityImagesScanning = createRealityImageScanningHandler();
        preAugmentationState.listen(world.events.globalId, ecs.events.REALITY_IMAGE_SCANNING, handleRealityImagesScanning);
    }
})

export {imageTrackingChecker}
