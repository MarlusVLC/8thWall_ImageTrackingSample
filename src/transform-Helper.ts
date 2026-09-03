import { type World, type Eid, type Entity, math } from "@8thwall/ecs";
import { PerspectiveCamera } from 'three'

// export function moveTowardsRuntime(world: World, entity: Entity, targetPos: math.Vec3, translationSpeed: number) {
//     const entityPos = entity.getWorldPosition();
//     const rawDirection = targetPos.minus(entityPos);
//     const rawLen = Math.sqrt(rawDirection.x * rawDirection.x + rawDirection.y * rawDirection.y + rawDirection.z * rawDirection.z);
//     const direction = rawDirection.clone().setNormalize();
//     const normSnapshot = direction.clone();
//     const scaleFactor = translationSpeed * (world.time.delta / 1000);
//     const delta = direction.scale(scaleFactor);
//     // DIAGNOSTICO TEMPORARIO
//     console.log(`moveTowardsRuntime DIAG: speed=${translationSpeed} dt=${world.time.delta} scaleFactor=${scaleFactor} entityPos=${entityPos.data()} targetPos=${targetPos.data()} rawDir=${rawDirection.data()} rawLen=${rawLen} normDir=${normSnapshot.data()} delta=${delta.data()}`);
//     entity.translateWorld(delta);
// }

export function moveTowardsRuntime(world: World, entity: Entity, targetPos: math.Vec3, translationSpeed: number) {
    const currentPos = entity.getWorldPosition();
    const direction = targetPos.minus(currentPos).setNormalize();
    const step = translationSpeed * (world.time.delta / 1000);
    const newPos = currentPos.plus(direction.scale(step));
    entity.setWorldPosition(newPos);
}

// Rebuilds a quaternion from its pitch/yaw/roll (X/Y/Z) euler angles with
// roll (Z) forced to zero, so this rotation never carries any roll,
// no matter what the quat.lookAt / slerp produced.
// export function setRotationLock (rotation: math.Quat, pitchLock?: number, yawLock?: number, rollLock?: number): math.Quat {
//     const euler = rotation.pitchYawRollDegrees();
//     if (pitchLock !== undefined) euler.setX(pitchLock);
//     if (yawLock !== undefined) euler.setY(yawLock);
//     if (rollLock !== undefined) euler.setZ(rollLock);
//     return math.quat.pitchYawRollDegrees(euler);
// };

export function sqrDistance(posA: math.Vec3, posB: math.Vec3): number {
    return (posA.x - posB.x) * (posA.x - posB.x) + (posA.y - posB.y) * (posA.y - posB.y) + (posA.z - posB.z) * (posA.z - posB.z);
}

const SPIN_AXIS = math.vec3.xyz(0, 0, 1); // eixo mundial em torno do qual o objeto gira (Z = para cima). Ajustar se o teste motrar outro eixo de rotação. O eixo de rotação é definido no mundo, não no objeto, então se o objeto estiver inclinado, ele ainda girará em torno do eixo Z do mundo.

export function computeHeadingRotation(fromPos: math.Vec3, toPos: math.Vec3, rotationOffsetRad: number): math.Quat {
    const dir = toPos.minus(fromPos);
    const angleRad = Math.atan2(dir.x, dir.y) + rotationOffsetRad; // plano perpendicular ao SPIN_AXIS (aqui, XY) - ajustar eixos/sinal se girar ao contrário do esperado
    return math.quat.axisAngle(SPIN_AXIS.clone().scale(angleRad));
}

export function resolveWorldPosition(entity: Entity, localPos: math.Vec3): math.Vec3 {
    const parent = entity.getParent();
    return parent ? parent.getWorldTransform().timesVec(localPos) : localPos.clone();
}

export function lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
}

export function isInOrthoCameraView(world: World, targetEid: Eid): boolean{
    const cameraEid = world.camera.getActiveEid();

    // Posição e rotação da câmera ativa
    const camPos = world.transform.getWorldPosition(cameraEid);
    const camRotation = world.transform.getWorldQuaternion(cameraEid);

    // Parâmetros de projeção (asssume câmera perspectiva)
    const camObj = world.three.activeCamera as PerspectiveCamera

    // Vetores locais da câmera (frente, direita, cima) já no espaço do mundo
    const camRotMat = math.mat4.r(camRotation);
    const camForward = camRotMat.timesVec(math.vec3.xyz(0,0,-1))
    const camRight = camRotMat.timesVec(math.vec3.xyz(1,0,0))
    const camUp = camRotMat.timesVec(math.vec3.xyz(0,1,0))

    // Vetor câmera -> objeto
    const targetPos = world.transform.getWorldPosition(targetEid);
    const toTarget = targetPos.minus(camPos);

    // Projeta em eixos locais da câmera
    const depth = -toTarget.dot(camForward) // "Profunidade" (distância à frente da câmera)
    const viewX = toTarget.dot(camRight) // Deslocamento horizontal
    const viewY = toTarget.dot(camUp) // Deslocamento vertical

    // Atrás da câmera ou muito (foar do near/far) -> fora de vista
    if (depth < camObj.near || depth > camObj.far) return false;

    // Meia-altura/meia-largura do frustum nessa profundidade
    const halfHeight = depth * Math.tan((camObj.fov * Math.PI / 180) / 2);
    const halfWidth = halfHeight * camObj.aspect;

    return Math.abs(viewX) <= halfWidth && Math.abs(viewY) <= halfHeight;
}

