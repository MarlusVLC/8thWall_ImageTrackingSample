declare global {
    interface ImagePropertiesObject {
        width: number;
        height: number;
        originalWidth: number;
        originalHeight: number;
        isRotated: boolean;
        left: number;
        top: number;
        moveable: boolean;
    }

    interface ImageTargetEventData {
        name: string;
        metadata: any;
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

    interface ImageTargetEventDataUnit {
        name: string;
        metadata: any;
        type: 'FLAT' | 'CYLINDRICAL' | 'CONICAL';
        geometry: any;
        properties: ImagePropertiesObject;
    }

    interface ImageTargetEventDataCollection {
        imageTargets: Array<ImageLoadingEventDataUnit>
    }

    // interface ImageScanningEventData {
    //     name: string;
    //     type: string;
    //     metadata: any;
    //     geometry: any;
    //     properties: ImagePropertiesObject;
    // }

    // interface ImageScanningEventDataCollection {
    //     imageTargets: Array<ImageScanningEventData>
    // }

    interface EcsEventTypes{
        "reality.imagefound": ImageTargetEventData;
        "reality.imagelost": ImageTargetEventData;
        "reality.imageupdated": ImageTargetEventData;
        "reality.imageloading": ImageTargetEventDataCollection;
        "reality.imagescanning": ImageTargetEventDataCollection;
    }
}

export {}