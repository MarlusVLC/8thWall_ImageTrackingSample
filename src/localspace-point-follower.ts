import * as ecs from '@8thwall/ecs';
import * as transformHelper from './transform-Helper';
import { z } from "zod";
import { addCleanup, doCleanup } from './eventTesting/event-cleaner';

const FORWARD_OFFSET_RAD = Math.PI; // offset de 90 graus para compensar a orientação do modelo (que aponta para o eixo X, enquanto a função lookAt assume que o objeto aponta para o eixo Z)

const ScaleDataSchema = z.object({
    scaleFactor: z.number().default(1),
    shouldScaleTranslation: z.boolean().default(false),
    shouldScaleTargetRadius: z.boolean().default(false),
    shouldScaleOriginRadius: z.boolean().default(false),
    shouldScaleRotationSpeed: z.boolean().default(false),
})

const createScalingHandler = (schemaAttribute, eid: ecs.Eid) => (e: {data: unknown}) => {
    const payloadData = ScaleDataSchema.safeParse(e.data); 
    if (!payloadData.success){
        console.log(`Schema com dados incorretos = `, payloadData.error)
        return;
    }

    const data = payloadData.data;
    const schemaCursor = schemaAttribute.get(eid);

    console.log("Scaling Forward with the following scale = ", data.scaleFactor);

    if (data.shouldScaleTranslation)  schemaCursor.translationSpeed *= data.scaleFactor;
    if (data.shouldScaleTargetRadius) schemaCursor.targetRadius *= data.scaleFactor;
    if (data.shouldScaleOriginRadius) schemaCursor.originRadius *= data.scaleFactor;
    if (data.shouldScaleRotationSpeed) schemaCursor.rotationSpeed *= data.scaleFactor;
}

const localSpacePointFollower = ecs.registerComponent({
    name: 'Local Space Point Follower',
    schema: {
        origin: ecs.eid,
        target: ecs.eid,
        translationSpeed: ecs.f32,
        targetRadius: ecs.f32,
        originRadius: ecs.f32,
        rotationSpeed: ecs.f32,
    },
    schemaDefaults: {
        translationSpeed: 2,
        targetRadius: 4,
        originRadius: 1,
        rotationSpeed: 90,
    },
    add: (world, component) => {
        const scalingHandler = createScalingHandler(component.schemaAttribute, component.eid);
        world.events.addListener(component.eid, 'scaled', scalingHandler)

        addCleanup(component, () => {
            world.events.removeListener(component.eid, 'scaled', scalingHandler)
        })
    },
    remove: (world, component) => {
        doCleanup(component);
    },
    stateMachine: ({world, eid, entity, schemaAttribute, defineState}) => {
        // let originPos: ecs.math.Vec3;
        let originLocalPos: ecs.math.Vec3;
        // let currentTargetPos: ecs.math.Vec3;
        let currentTarget: ecs.Entity;
        let currentStateID: string | { name: string; };


        const ROTATION_EPSILON_DEGREES = 0.5;

        const preparationState = defineState('preparation').initial();
        const followingState = defineState('following');
        const returningState = defineState('returning');

        const targetReached = ecs.defineTrigger();
        const originReached = ecs.defineTrigger();
        const readyToFollow = ecs.defineTrigger();
        const readyToReturn = ecs.defineTrigger();

        const schema = schemaAttribute.get(eid);
        const target = world.getEntity(schema.target);
        const targetPosition = () => target.getWorldPosition();

        
        // const pitchLock = entity.getWorldQuaternion().pitchYawRollDegrees().x;
        // const yawLock = entity.getWorldQuaternion().pitchYawRollDegrees().y;
        // const rollLock = entity.getWorldQuaternion().pitchYawRollDegrees().z;

        // console.log(`point-follower: initial pitchLock=${pitchLock}, yawLock=${yawLock}, rollLock=${rollLock}`);

        const baseTilt = entity.getWorldQuaternion().clone();

        preparationState
            .onEnter(() => {
                // console.log('point-follower: preparationState.onEnter()');
                switch (currentStateID) {
                    case followingState:
                        // currentTargetPos = transformHelper.resolveWorldPosition(entity, originLocalPos);
                        currentTarget = world.getEntity(schema.origin);
                        break;
                    case returningState:
                    default:
                        // currentTargetPos = targetPosition();
                        currentTarget = world.getEntity(schema.target);
                }
            })
            .onTick(() => {
                const currentTargetPos = currentTarget.getWorldPosition(); 
                const targetRotation = transformHelper.computeHeadingRotation(entity.getWorldPosition(), currentTargetPos, FORWARD_OFFSET_RAD).times(baseTilt);
                const currentRotation = entity.getWorldQuaternion();
                const angleRemaining = currentRotation.degreesTo(targetRotation);

                if (angleRemaining <= ROTATION_EPSILON_DEGREES) {
                    entity.setWorldQuaternion(targetRotation);
                    // The next state depends on which we were in before entering
                    // preparationState: coming from followingState means we just arrived
                    // at the target and now need to return to the origin; 
                    // any other case (initial spawn, or coming back from returningState) 
                    // means we just arrived at the origin and now need to follow the target.
                    if (currentStateID === followingState) {
                        readyToReturn.trigger();
                    } else {
                        readyToFollow.trigger();
                    }
                    return;
                };

                const maxDegreesthisTick = schema.rotationSpeed * (world.time.delta / 1000);
                const t = Math.min(1, maxDegreesthisTick / angleRemaining);
                const slerpedRotation = currentRotation.slerp(targetRotation, t);
                entity.setWorldQuaternion(slerpedRotation);
                // tickCount++;
                // if (tickCount % 30 === 0) {
                //     console.log(`preparation tick = ${tickCount} - angleRemaining = ${angleRemaining}, maxDegreesthisTick = ${maxDegreesthisTick}, t = ${t}`);
                // }

            })
            .onTrigger(readyToFollow, followingState)
            .onTrigger(readyToReturn, returningState);

        // let tickCount = 0;
        followingState
            .onEnter(() => {
                console.log('point-follower: followingState.onEnter()');
                // originPos = entity.getWorldPosition().clone();
                // originLocalPos = entity.getLocalPosition().clone();
                currentStateID = followingState;
            })
            .onTick(() => {
                const targetPosition = target.getWorldPosition();
                transformHelper.moveTowardsRuntime(world, entity, targetPosition, schema.translationSpeed);
                // entity.lookAt(target); // DIAGNOSTICO TEMPORARIO: comentado para isolar a causa do drift
                const headingRotation = transformHelper.computeHeadingRotation(entity.getWorldPosition(), targetPosition, FORWARD_OFFSET_RAD).times(baseTilt);
                entity.setWorldQuaternion(headingRotation);
                if (transformHelper.sqrDistance(entity.getWorldPosition(), targetPosition) <= schema.targetRadius * schema.targetRadius) {
                    targetReached.trigger();
                }
                // tickCount++;
                // if (tickCount % 30 === 0) {
                //     console.log(`follow tick = ${tickCount} - entityPos=${entity.getWorldPosition().data()} targetPos=${targetPosition.data()} dist=${entity.getWorldPosition().distanceTo(targetPosition)}`);
                // }
            })
            .onTrigger(targetReached, preparationState);

        returningState
            .onEnter(() => {
                // console.log('point-follower: returningState.onEnter()');
                currentStateID = returningState;
            })
            .onTick(() => {
                // entity.lookAtWorld(originPos);
                // const originWorldPos = entity.getLocalPosition();
                originLocalPos = currentTarget.getLocalPosition();
                const originWorldPos = transformHelper.resolveWorldPosition(entity, originLocalPos);
                const headingRotation = transformHelper.computeHeadingRotation(entity.getWorldPosition(), originWorldPos, FORWARD_OFFSET_RAD).times(baseTilt);
                entity.setWorldQuaternion(headingRotation);
                transformHelper.moveTowardsRuntime(world, entity, originWorldPos, schema.translationSpeed);
                if (transformHelper.sqrDistance(entity.getWorldPosition(), originWorldPos) <= schema.originRadius * schema.originRadius) {
                    originReached.trigger();
                }
                // tickCount++;
                // if (tickCount % 30 === 0) {
                //     console.log(`returning tick = ${tickCount} - entityPos=${entity.getWorldPosition().data()} originWorldPos=${originWorldPos.data()} dist=${entity.getWorldPosition().distanceTo(originWorldPos)}`);
                // }
            })
            .onTrigger(originReached, preparationState);
    }
})

export { localSpacePointFollower, ScaleDataSchema };