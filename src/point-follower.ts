import * as ecs from '@8thwall/ecs';
import * as transformHelper from './transform-Helper';

const pointFollower = ecs.registerComponent({
    name: 'point-follower',
    schema: {
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

    stateMachine: ({world, eid, entity, schemaAttribute, defineState}) => {
        let originPos: ecs.math.Vec3;
        let currentTargetPos: ecs.math.Vec3;
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

        // Rebuilds a quaternion from its pitch/yaw/roll (X/Y/Z) euler angles with
        // roll (Z) forced to zero, so this rotation never carries any roll,
        // no matter what the quat.lookAt / slerp produced.
        const withoutRoll = (rotation: ecs.math.Quat): ecs.math.Quat => {
            const euler = rotation.pitchYawRollDegrees()
                .setZ(0);
            return ecs.math.quat.pitchYawRollDegrees(euler);
        };

        preparationState
            .onEnter(() => {
                switch (currentStateID) {
                    case followingState:
                        currentTargetPos = originPos.clone();
                        break;
                    case returningState:
                    default:
                        currentTargetPos = targetPosition();
                }
            })
            .onTick(() => {
                // World up (not the entity's own, possibly tilted, up vector) keeps the
                // look-at from leaning on entity's current pitch; withoutRoll()
                // ensures the entity's up vector is always world up, so it doesn't lean.
                const upVector = ecs.math.vec3.up();
                const targetRotation = withoutRoll(
                    ecs.math.quat.lookAt(entity.getWorldPosition(), currentTargetPos, upVector).setNormalize()
                );
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
                entity.setWorldQuaternion(withoutRoll(currentRotation.slerp(targetRotation, t)));
            })
            .onTrigger(readyToFollow, followingState)
            .onTrigger(readyToReturn, returningState);

            followingState
            .onEnter(() => {
                originPos = entity.getWorldPosition().clone();
                currentStateID = followingState;
            })
            .onTick(() => {
                const targetPosition = target.getWorldPosition();
                const direction = targetPosition.minus(entity.getWorldPosition()).setNormalize();
                entity.translateWorld(direction.scale(schema.translationSpeed * (world.time.delta / 1000)));
                entity.lookAt(target);
                if (transformHelper.sqrDistance(entity.getWorldPosition(), targetPosition) <= schema.targetRadius * schema.targetRadius) {
                    targetReached.trigger();
                }
            })
            .onTrigger(targetReached, preparationState);

            returningState
            .onEnter(() => {
                currentStateID = returningState;
            })
            .onTick(() => {
                entity.lookAtWorld(originPos);
                transformHelper.moveTowardsRuntime(world, entity, originPos, schema.translationSpeed);
                if (transformHelper.sqrDistance(entity.getWorldPosition(), originPos) <= schema.originRadius * schema.originRadius) {
                    originReached.trigger();
                }
            })
            .onTrigger(originReached, preparationState);
    }
})

export { pointFollower };