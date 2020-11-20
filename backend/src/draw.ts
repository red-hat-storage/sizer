import * as classes from "./classes"
import { fabric } from 'fabric'

const serverImage = <HTMLImageElement>document.getElementById('img-server');
const storageImage = <HTMLImageElement>document.getElementById('img-storage');

export function getCanvas(): fabric.Canvas {
    return new fabric.Canvas('canvas');
}

export function drawServer(canvas: fabric.Canvas, server: classes.Server, leftPad: number, topPad: number): void {
    canvas.setHeight(topPad + 300);
    canvas.setWidth(leftPad + 300);

    const group = new fabric.Group([], {
        left: 200,
        top: 200
    });
    group.addWithUpdate(new fabric.Rect({
        top: 0,
        left: 0,
        width: 250,
        height: 240,
        stroke: 'black',
        strokeWidth: 3,
        fill: 'transparent'
    }));

    group.addWithUpdate(new fabric.Image(serverImage, {
        top: 20,
        left: 40,
        cropY: 140,
        cropX: 30,
    }).scaleToWidth(200));

    group.addWithUpdate(new fabric.Image(storageImage, {
        top: 90,
        left: 40,
        cropY: 100,
        cropX: 30,
    }).scaleToWidth(100));


    group.addWithUpdate(new fabric.Text(`x${server.getAmountOfOSDs()}`, {
        top: 90,
        left: 140,
    }));

    group.addWithUpdate(new fabric.Text(`${server.getUsedCPU()} CPU cores`, {
        top: 150,
        left: 40,
        fontSize: 27,
    }));

    group.addWithUpdate(new fabric.Text(`${server.getUsedMemory()}GB RAM`, {
        top: 180,
        left: 40,
        fontSize: 27,
    }));

    group.set('left', leftPad);
    group.set('top', topPad);
    group.setCoords();
    canvas.add(group);
    canvas.renderAll();
}
