import * as ecs from '@8thwall/ecs';
import * as transformHelper from './transform-Helper';

const touchMover = ecs.registerComponent({
    name: 'touch-mover',
    schema: {
        translationSpeed: ecs.f32,
    },
    schemaDefaults: {
        translationSpeed: 1,
    },

    // stateMachine: ({world, eid, entity, schemaAttribute, defineState}) => {
    //     if (transformHelper.isInOrthoCameraView(world, eid) === false) return;

    // }

})

export { touchMover }