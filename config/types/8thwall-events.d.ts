declare global {
    interface ImagePropertiesObject {
        width: number;
        height: number;
        originalWidth: number;
        originalHeight: number;
        isRotated: boolean;
    }

    interface ImageTargetEventData {
        name: string;
        type: 'FLAT' | 'CYLINDRICAL' | 'CONICAL';
        position: {x: number, y: number, z: number};
        rotation: {w: number, x: number, y: number, z: number};
        scale: number;
        properties: ImagePropertiesObject;
        scaledWidth?: number;
        scaledHeight?: number;
        height?: number;
        radiusTop?: number;
        radiusBottom?: number;
        arcStartRadians?: number;
        arcLengthRadians?: number;
    }

    interface EcsEventTypes{
        "reality.imagefound": ImageTargetEventData;
    }
}

export {}