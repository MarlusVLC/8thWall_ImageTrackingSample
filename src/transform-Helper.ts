import { type World, type Eid, type Entity, math } from "@8thwall/ecs";

export function moveTowardsRuntime(world: World, entity: Entity, targetPos: math.Vec3, translationSpeed: number) {
    const direction = targetPos.minus(entity.getWorldPosition()).setNormalize();
    entity.translateWorld(direction.scale(translationSpeed * (world.time.delta / 1000)));
}

export function sqrDistance(posA: math.Vec3, posB: math.Vec3): number {
    return (posA.x - posB.x) * (posA.x - posB.x) + (posA.y - posB.y) * (posA.y - posB.y) + (posA.z - posB.z) * (posA.z - posB.z);
}