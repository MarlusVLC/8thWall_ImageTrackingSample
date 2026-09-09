import * as ecs from '@8thwall/ecs'

const createWorldTrackingStatusHandler = () => (e: {data: RealityTargetEventData}) => {
    console.log(`World tracking status data = ${JSON.stringify(e.data)} `);
}

// const createLocationScanningHandler = () => (e: {data: any}) => {
//     console.log(`Location Scanning data = ${JSON.stringify(e.data)} `);
// }

const worldTrackingChecker = ecs.registerComponent({
    name: 'World Tracking Checker',
    stateMachine: ({world, defineState}) => {
        const augmentationState = defineState('augmentation').initial();

        const handleWorldTrackingStatus = createWorldTrackingStatusHandler();
        augmentationState.listen(world.events.globalId, ecs.events.REALITY_TRACKING_STATUS, handleWorldTrackingStatus);

        // const handleLocationScanning = createLocationScanningHandler();
        augmentationState.listen(world.events.globalId, ecs.events.REALITY_LOCATION_SCANNING, (e) => {
            console.log(`Location Scanning data = ${JSON.stringify(e.data)}`)
        })

        augmentationState.listen(world.events.globalId, ecs.events.REALITY_LOCATION_FOUND, (e) => {
            console.log(`Location Found data = ${JSON.stringify(e.data)}`)
        })

        // augmentationState.listen(world.events.globalId, ecs.events.REALITY_LOCATION_UPDATED, (e) => {
        //     console.log(`Location Updated data = ${JSON.stringify(e.data)}`)
        // })

        augmentationState.listen(world.events.globalId, ecs.events.REALITY_LOCATION_LOST, (e) => {
            console.log(`Location Lost data = ${JSON.stringify(e.data)}`)
        })

        augmentationState.listen(world.events.globalId, ecs.events.REALITY_MESH_FOUND, (e) => {
            console.log(`Mesh Found data = ${JSON.stringify(e.data)}`)
        })

        augmentationState.listen(world.events.globalId, ecs.events.REALITY_MESH_LOST, (e) => {
            console.log(`Location Lost data = ${JSON.stringify(e.data)}`)
        })
    }
})

export {worldTrackingChecker}