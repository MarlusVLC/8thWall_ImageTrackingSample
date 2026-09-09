import * as ecs from '@8thwall/ecs'

const createWorldTrackingStatusHandler = () => (e: {data: RealityTargetEventData}) => {
    const data = e.data;
    console.log(`World tracking status data = ${JSON.stringify(data)} `);
    console.log(`TRACKING STATUS changed -> REASON ${data.reason} | STATUS = ${data.status}`);
}

const worldTrackingChecker = ecs.registerComponent({
    name: 'World Tracking Checker',
    stateMachine: ({world, defineState}) => {
        const augmentationState = defineState('augmentation').initial();

        const handleWorldTrackingStatus = createWorldTrackingStatusHandler();
        augmentationState.listen(world.events.globalId, ecs.events.REALITY_TRACKING_STATUS, handleWorldTrackingStatus);
    }
})

export {worldTrackingChecker}