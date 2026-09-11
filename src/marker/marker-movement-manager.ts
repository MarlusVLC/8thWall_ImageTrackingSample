import * as ecs from '@8thwall/ecs';
import { getName } from '../entityDebugger'
import { ScaleDataSchema as followerSchema } from './../localspace-point-follower';
import { ScaleDataSchema as touchMoverSchema } from './../touch-mover'
import { addCleanup, doCleanup } from './../eventTesting/event-cleaner';

interface MarkerMovementManagerSchema {
    objectsParent: ecs.Eid;
    follower: ecs.Eid;
    touchMover: ecs.Eid;
    relativeFollowSpeedMode: string;
    relativeTargetRadiusMode: string;
    relativeOriginRadiusMode: string;
    relativeRotationSpeedMode: string;
    relativeTouchMovementSpeedMode: string;
    relativeParentScaleMode: string;
}


const createTargetScaleHandler = (
    schema: MarkerMovementManagerSchema, world: ecs.World,
    detectionStatus: 'FOUND' | 'UPDATED',
    parentEID: ecs.Eid, followerEID: ecs.Eid, moverEID: ecs.Eid) => (e) => {
        if (schema.relativeParentScaleMode === detectionStatus){
            world.setScale(parentEID, e.data.scale, e.data.scale, e.data.scale);
        } 
        
        const followerResult = followerSchema.safeParse({
            scaleFactor: e.data.scale,
            shouldScaleTranslation: schema.relativeFollowSpeedMode === detectionStatus,
            shouldScaleTargetRadius: schema.relativeTargetRadiusMode === detectionStatus,
            shouldScaleOriginRadius: schema.relativeOriginRadiusMode === detectionStatus,
            shouldScaleRotationSpeed: schema.relativeRotationSpeedMode === detectionStatus
            });
        world.events.dispatch(followerEID, 'scaled', followerResult.data);

        const moverResult = touchMoverSchema.safeParse({
            scaleFactor: e.data.scale,
            shouldScaleTranslationSpeed: schema.relativeTouchMovementSpeedMode === detectionStatus
        })
        world.events.dispatch(moverEID, 'scaled', moverResult.data);
    }

const markerMovementManager = ecs.registerComponent({
    name: 'Marker Movement Manager',
    schema: {
        objectsParent: ecs.eid,
        follower: ecs.eid,
        touchMover: ecs.eid,

        // @enum FOUND, UPDATED, ABSOLUTE
        relativeFollowSpeedMode: ecs.string,
        // @enum FOUND, UPDATED, ABSOLUTE
        relativeTargetRadiusMode: ecs.string,
        // @enum FOUND, UPDATED, ABSOLUTE
        relativeOriginRadiusMode: ecs.string,
        // @enum FOUND, UPDATED, ABSOLUTE
        relativeRotationSpeedMode: ecs.string,
        // @enum FOUND, UPDATED, ABSOLUTE
        relativeTouchMovementSpeedMode: ecs.string,
        // @enum FOUND, UPDATED, ABSOLUTE
        relativeParentScaleMode: ecs.string,
    },
    add: (world, component) => {
        const schema = component.schema;
        const eventChannel = world.events.globalId;

        const handleFoundTargetScaling = createTargetScaleHandler(schema, world, 'FOUND', schema.objectsParent, schema.follower, schema.touchMover);
        world.events.addListener(eventChannel, ecs.events.REALITY_IMAGE_FOUND, handleFoundTargetScaling);

        const handleUpdatedTargetScaling = createTargetScaleHandler(schema, world, 'UPDATED', schema.objectsParent, schema.follower, schema.touchMover);
        world.events.addListener(eventChannel, ecs.events.REALITY_IMAGE_UPDATED, handleUpdatedTargetScaling);

        const cleanup = () => {
            world.events.removeListener(eventChannel, ecs.events.REALITY_IMAGE_FOUND, handleFoundTargetScaling);
            world.events.removeListener(eventChannel, ecs.events.REALITY_IMAGE_UPDATED, handleUpdatedTargetScaling)
        }

        addCleanup(component, cleanup);
    },
    remove: (world, component) => {
        doCleanup(component);
    }
})

export {markerMovementManager}