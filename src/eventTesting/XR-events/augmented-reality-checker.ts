import * as ecs from '@8thwall/ecs'
import { addCleanup, doCleanup } from '../event-cleaner'

const createRealityReadyHandler = () => (e) => {
    console.log("REALITY READY -> ", e)
}

ecs.registerComponent({
    name: 'Augmented Reality Checker',
    add: (world, component) => {
        const realityReadyHandler = createRealityReadyHandler();

        // world.events.addListener(world.events.globalId, ecs.events.REALITY_READY, realityReadyHandler);
        // const cleanup = () => {
        //     world.events.removeListener(world.events.globalId, ecs.events.REALITY_READY, realityReadyHandler);
        // };
        // addCleanup(component, cleanup);
    },
    remove: (world, component) => {
        doCleanup(component);
    }
})