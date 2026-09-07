import * as ecs from '@8thwall/ecs'
import { addManagedListener } from '../event-cleaner';

// ecs.events.REALITY_IMAGE_FOUND
const createRealityImageFoundHandler = () => (e: {data: ImageTargetEventData}) => {
    console.log('reality image FOUND = ', e);
    const data = e.data;
    console.log(`FOUND image name = ${data.name} | type = ${data.type} | 
        position = ${JSON.stringify(data.position)} | 
        rotation = ${JSON.stringify(data.rotation)} | 
        scale = ${data.scale}`)
    const p = data.properties;
    console.log(`FOUND image PROPERTIES -> width = ${p.width} | height = ${p.height} | original width = ${p.originalWidth} | original height = ${p.originalHeight} | isRotated = ${p.isRotated} `)
    console.log(`FLAT image properties -> scaledWidth = ${data.scaledWidth} | scaledHeight = ${data.scaledHeight}`);
    console.log(`CYLINDRICAL or CONICAL image properties -> height = ${data.height} | radiusTop = ${data.radiusTop} | radiusBottom = ${data.radiusBottom} | arcStartRadians = ${data.arcStartRadians} | arcLengthRadians = ${data.arcLengthRadians}`)
} 

const imageTrackingChecker = ecs.registerComponent({
    name: 'Image Tracking Checker',
    stateMachine: ({world, eid, dataAttribute, schemaAttribute, defineState}) => {
        const preAugmentationState = defineState('pre-augmentation').initial();

        const handleRealityImageFound = createRealityImageFoundHandler();

        preAugmentationState.listen(world.events.globalId, ecs.events.REALITY_IMAGE_FOUND, handleRealityImageFound)
    }
})

export {imageTrackingChecker}

// ecs.events.REALITY_IMAGE_LOADING
// ecs.events.REALITY_IMAGE_LOST
// ecs.events.REALITY_IMAGE_SCANNING
// ecs.events.REALITY_IMAGE_UPDATED