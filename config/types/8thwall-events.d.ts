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

    interface ImageLoadingEventData {
        name: string;
        type: string;
        metadata: any;
        properties: ImagePropertiesObject;
    }

    interface ImageLoadingEventDataCollection {
        imageTargets: Array<ImageLoadingEventData>
    }

    interface ImageScanningEventData {
        name: string;
        type: string;
        metadata: any;
        geometry: any;
        properties: ImagePropertiesObject;
    }

    interface ImageScanningEventDataCollection {
        imageTargets: Array<ImageScanningEventData>
    }

    interface EcsEventTypes{
        "reality.imagefound": ImageTargetEventData;
        "reality.imagelost": ImageTargetEventData;
        "reality.imageupdated": ImageTargetEventData;
        "reality.imageloading": ImageLoadingEventDataCollection;
        "reality.imagescanning": ImageScanningEventDataCollection;
    }
}

export {}