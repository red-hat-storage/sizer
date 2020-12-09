import * as classes from "./classes";
const fabric = window.fabric;

const nodeImage = <HTMLImageElement>document.getElementById("img-node");
const storageImage = <HTMLImageElement>document.getElementById("img-storage");

export function getCanvas(): fabric.StaticCanvas {
  return new fabric.StaticCanvas("canvas", { renderOnAddRemove: false });
}

export function drawNode(
  canvas: fabric.StaticCanvas,
  node: classes.Node,
  leftPad: number,
  topPad: number,
  scale = 1
): void {
  canvas.setHeight(topPad + 300);
  canvas.setWidth(leftPad + 300);

  const group = new fabric.Group([], {
    left: 200,
    top: 200,
  });
  group.addWithUpdate(
    new fabric.Rect({
      top: 0,
      left: 0,
      width: 250,
      height: 240,
      stroke: "black",
      strokeWidth: 3,
      fill: "transparent",
    })
  );

  group.addWithUpdate(
    new fabric.Image(nodeImage, {
      top: 20,
      left: 40,
      cropY: 140,
      cropX: 30,
    }).scaleToWidth(200)
  );

  group.addWithUpdate(
    new fabric.Image(storageImage, {
      top: 90,
      left: 40,
      cropY: 100,
      cropX: 30,
    }).scaleToWidth(100)
  );

  group.addWithUpdate(
    new fabric.Text(node.getFittingNodeSize(), {
      top: 10,
      left: 10,
      angle: 270,
      fontSize: 20,
      originX: "right",
    })
  );

  group.addWithUpdate(
    new fabric.Text(`x${node.getAmountOfOSDs()}`, {
      top: 90,
      left: 140,
    })
  );

  group.addWithUpdate(
    new fabric.Text(`OCS services consume:`, {
      top: 145,
      left: 40,
      fontSize: 20,
    })
  );

  group.addWithUpdate(
    new fabric.Text(
      `${node.getUsedCPU()} CPU units\n${node.getUsedMemory()} GB RAM`,
      {
        top: 170,
        left: 60,
        fontSize: 27,
      }
    )
  );

  group.set("left", leftPad);
  group.set("top", topPad);
  group.scaleX = scale;
  group.scaleY = scale;
  group.setCoords();
  canvas.add(group);
}
