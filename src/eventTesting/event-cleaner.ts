import * as ecs from '@8thwall/ecs'

const cleanupMap = new WeakMap<object, Array<() => void>>()

export const addCleanup = (component: object, cleanupFunc: () => void) => {
    const list = cleanupMap.get(component) ?? [];
    list.push(cleanupFunc);
    cleanupMap.set(component, list);
}

export const doCleanup = (component: object) => {
    const list = cleanupMap.get(component);
    if (!list) return;
    list.forEach((fn) => fn())
    console.log(`Events have been cleaned for ${component}`)

    cleanupMap.delete(component)
}

export const addManagedListener = (
    world: ecs.World, 
    component: { eid: bigint }, 
    eventName: string, 
    handler: (e: any) => void
    ) => {
        world.events.addListener(component.eid, eventName, handler)
        addCleanup(component, () => world.events.removeListener(component.eid, eventName, handler))
    }