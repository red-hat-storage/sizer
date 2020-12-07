import * as classes from "./classes";
import { fabric } from "fabric";

const serverImage = <HTMLImageElement>document.getElementById("img-server");
const storageImage = <HTMLImageElement>document.getElementById("img-storage");

export function getCanvas(): fabric.StaticCanvas {
  return new fabric.StaticCanvas("canvas");
}

export function drawServer(
  canvas: fabric.StaticCanvas,
  server: classes.Server,
  leftPad: number,
  topPad: number
): void {
  canvas.setHeight(topPad + 300);
  canvas.setWidth(leftPad + 300);

  const group = new fabric.Group([], {
    left: 200,
    top: 200
  });
  group.addWithUpdate(
    new fabric.Rect({
      top: 0,
      left: 0,
      width: 250,
      height: 240,
      stroke: "black",
      strokeWidth: 3,
      fill: "transparent"
    })
  );

  group.addWithUpdate(
    new fabric.Image(serverImage, {
      top: 20,
      left: 40,
      cropY: 140,
      cropX: 30
    }).scaleToWidth(scale)
  );

  group.addWithUpdate(
    new fabric.Image(storageImage, {
      top: 90,
      left: 40,
      cropY: 100,
      cropX: 30
    }).scaleToWidth(scale)
  );

  group.addWithUpdate(
    new fabric.Text(server.getFittingInstanceSize(), {
      top: 10,
      left: 10,
      angle: 270,
      fontSize: 20,
      originX: "right"
    })
  );

  group.addWithUpdate(
    new fabric.Text(`x${server.getAmountOfOSDs()}`, {
      top: 90,
      left: 140
    })
  );

  group.addWithUpdate(
    new fabric.Text(`OCS services consume:`, {
      top: 145,
      left: 40,
      fontSize: 20
    })
  );

  group.addWithUpdate(
    new fabric.Text(`${server.getUsedCPU()} CPU units`, {
      top: 170,
      left: 60,
      fontSize: 27
    })
  );

  group.addWithUpdate(
    new fabric.Text(`${server.getUsedMemory()} GB RAM`, {
      top: 200,
      left: 60,
      fontSize: 27
    })
  );

  group.set("left", leftPad);
  group.set("top", topPad);
  group.scaleX = scale;
  group.scaleY = scale;
  group.setCoords();
  canvas.add(group);
  canvas.renderAll();
}
