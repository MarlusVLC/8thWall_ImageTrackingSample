import * as ecs from '@8thwall/ecs';

const markerModulator = ecs.registerComponent({
    name: 'Marker Modulator',
    schema: {
        imageTargetEntity: ecs.eid,
        modulableParent: ecs.eid,
    },
    stateMachine: ({world, defineState, eid, schemaAttribute }) => {
        const disabledState = defineState('disabled').initial();
        const enabledState = defineState('enable');

        const schema = schemaAttribute.get(eid);
        const parentEid = schema.modulableParent;
        const targetName = ecs.ImageTarget.get(world, schema.imageTargetEntity).name;

        disabledState.onEnter(() => {
            ecs.Disabled.set(world, parentEid);   
            console.log(`Is the source disabled = `, ecs.Disabled.has(world,parentEid));       
        })
        .onEvent(ecs.events.REALITY_IMAGE_FOUND, enabledState, {
            target: world.events.globalId,
            where: (event) => event.data.name === targetName
        })

        enabledState.onEnter(() => {
            ecs.Disabled.remove(world, parentEid);
            console.log(`Is the source disabled = `, ecs.Disabled.has(world,parentEid));
        })
        .onEvent(ecs.events.REALITY_IMAGE_LOST, disabledState, {
            target: world.events.globalId,
            where: (event) => event.data.name === targetName
        })
    }

})