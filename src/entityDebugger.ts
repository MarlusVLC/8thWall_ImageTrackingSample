import * as ecs from '@8thwall/ecs'

const entityDebugger = ecs.registerComponent({
    name: 'Entity Debugger',
    schema: {
        name: ecs.string
    },
})

// export function getName(world: ecs.World, eid: ecs.Eid): string{
//     return identifier.has(world, eid)
//         ? identifier.get(world, eid).name
//         : eid.toString();
// }

export const getName = (world: ecs.World, eid: ecs.Eid): string => {
    return entityDebugger.has(world, eid)
        ? entityDebugger.get(world, eid).name
        : eid.toString();
}

export {entityDebugger}