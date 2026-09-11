import * as ecs from '@8thwall/ecs';
import * as transformHelper from './transform-Helper';
import { z } from "zod";
import { addCleanup, doCleanup } from './eventTesting/event-cleaner';

const ScaleDataSchema = z.object({
    scaleFactor: z.number().default(1),
    shouldScaleTranslationSpeed: z.boolean().default(false)
});

const createScalingHandler = (schemaAttribute, eid: ecs.Eid) => (e: {data: unknown}) => {
    const payloadData = ScaleDataSchema.safeParse(e.data);
    if (!payloadData.success){
        console.log(`Schema com dados incorretos = `, payloadData.error)
        return;
    };

    const data = payloadData.data;
    const schemaCursor = schemaAttribute.get(eid);

    console.log("Scaling TouchMover with the following scale = ", data.scaleFactor);

    if (data.shouldScaleTranslationSpeed) schemaCursor.translationSpeed *= data.scaleFactor;
}

const touchMover = ecs.registerComponent({
    name: 'touch-mover',
    schema: {
        translationSpeed: ecs.f32,
    },
    schemaDefaults: {
        translationSpeed: 1,
    },
    add: (world, component) => {
        const scalingHandler = createScalingHandler(component.schemaAttribute, component.eid);
        world.events.addListener(world.events.globalId, 'scaled', scalingHandler);

        addCleanup(component, () => {
            world.events.removeListener(world.events.globalId, 'scaled', scalingHandler);
        });
    },
    remove: (world, component) => {
        doCleanup(component);
    },
    stateMachine: ({world, eid, entity, schemaAttribute, defineState}) => {
        const movingState = defineState('moving').initial()

        let previousPos: ecs.math.Vec3;
        let currentPos: ecs.math.Vec3;
        let camPos: ecs.math.Vec3;
        let dist: number;

        const handleTouchStart = (event) => {
            if (transformHelper.isInOrthoCameraView(world, eid) === false) return;

            previousPos = entity.getWorldPosition();

            const screenInput = ecs.math.vec2.from(event.data.position);
            const lerpedInput = screenInput.clone();
            lerpedInput.setX(transformHelper.lerp(1, -1, lerpedInput.x)).setY(transformHelper.lerp(1, -1, lerpedInput.y));

            // 1. Pega a câmera ativa e a rotação dela no mundo
            const cameraEid = world.camera.getActiveEid();
            const camRotation = world.transform.getWorldQuaternion(cameraEid);

            // 2. Monta a matriz de rotação da câmera e extrai os vetores locais
            //    "direita" (eixo X) e "cima" (eixo Y) dela, já no espaço do mundo
            const camRotMat = ecs.math.mat4.r(camRotation);
            const camRight = camRotMat.timesVec(ecs.math.vec3.xyz(1,0,0)).setNormalize();
            const camUp = camRotMat.timesVec(ecs.math.vec3.xyz(0,1,0)).setNormalize();

            // 3. x da tela -> direita/esquerda da câmera | y da tela -> cima/baixo da câmera
            const {translationSpeed} = schemaAttribute.get(eid);
            const moveVector = camRight.scale(lerpedInput.x * translationSpeed)
                .setPlus(camUp.setScale(lerpedInput.y * translationSpeed))

            const targetPos = entity.getWorldPosition().plus(moveVector);
            transformHelper.moveTowardsRuntime(world, entity, targetPos, translationSpeed)

            currentPos = entity.getWorldPosition();
            dist = previousPos.distanceTo(currentPos);
            camPos = world.getEntity(cameraEid).getWorldPosition();

            // console.log('LERPED INPUT = ', screenInput)
            // console.log('MOVE VECTOR = ', moveVector)
            // console.log(`SCREEN input = ${screenInput.x}, ${screenInput.y} | LERPED input = ${lerpedInput.x}, ${lerpedInput.y}  | MOVE vector = ${moveVector.data()}`)
            console.log(`Touch Mover: PREVIOUS pos = ${previousPos.data()} | CURRENT pos = ${currentPos.data()} | DIST = ${dist}`)
            // console.log(`cam POS = ${camPos.data()} | cam ROT = ${camRotation.data()}`)
        }

        movingState.listen(world.events.globalId, ecs.input.SCREEN_TOUCH_START, handleTouchStart);
    }

})

export { touchMover, ScaleDataSchema }