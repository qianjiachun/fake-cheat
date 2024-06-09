import labels from "./labels.json";
import { renderBoxes } from "./renderBox";
import { toRaw } from "vue";

/**
 * Preprocess image / frame before forwarded into the model
 * @param {HTMLVideoElement|HTMLImageElement} source
 * @param {Number} modelWidth
 * @param {Number} modelHeight
 * @returns input tensor, xRatio and yRatio
 */
function preprocess(source: HTMLVideoElement | HTMLImageElement, modelWidth: number, modelHeight: number): any {
  // ratios for boxes
  let xRatio = 0;
  let yRatio = 0;

  const input = tf.tidy(() => {
    const img = tf.browser.fromPixels(source);

    // padding image to square => [n, m] to [n, n], n > m
    const [h, w] = img.shape.slice(0, 2); // get source width and height
    // console.log('image', h, w)

    const maxSize = Math.max(w, h); // get max size
    const imgPadded = img.pad([
      [0, maxSize - h], // padding y [bottom only]
      [0, maxSize - w], // padding x [right only]
      [0, 0]
    ]) as any;

    xRatio = maxSize / w; // update xRatio
    yRatio = maxSize / h; // update yRatio

    return tf.image
      .resizeBilinear(imgPadded, [modelWidth, modelHeight]) // resize frame
      .div(255.0) // normalize
      .expandDims(0); // add batch
  });

  return [input, xRatio, yRatio];
}

/**
 * Function run inference and do detection from source.
 * @param {HTMLImageElement|HTMLVideoElement} source
 * @param {HTMLCanvasElement} canvasRef canvas reference
 * @param {VoidFunction} callback function to run after detection process
 */
export async function detect(yoloModel: any, source: HTMLImageElement | HTMLVideoElement, canvasRef: HTMLCanvasElement, callback: () => void) {
  const model = toRaw(yoloModel);
  const inputShape = toRaw(yoloModel.inputShape);

  tf.engine().startScope(); // start scoping tf engine
  const [modelWidth, modelHeight] = inputShape.slice(1, 3); // get model width and height
  // console.log('shape', modelWidth, modelHeight)

  const [input, xRatio, yRatio] = preprocess(source, modelWidth, modelHeight); // preprocess image
  // console.log('ratio', xRatio, yRatio)

  const res = model.net!.execute(input) as any; // Must use toRaw() inference model.
  const transRes = res.transpose([0, 2, 1]); // transpose result [b, det, n] => [b, n, det]

  const boxes = tf.tidy(() => {
    const w = transRes.slice([0, 0, 2], [-1, -1, 1]); // get width
    const h = transRes.slice([0, 0, 3], [-1, -1, 1]); // get height
    const x1 = tf.sub(transRes.slice([0, 0, 0], [-1, -1, 1]), tf.div(w, 2)); // x1
    const y1 = tf.sub(transRes.slice([0, 0, 1], [-1, -1, 1]), tf.div(h, 2)); // y1
    return tf
      .concat(
        [
          y1,
          x1,
          tf.add(y1, h), // y2
          tf.add(x1, w) // x2
        ],
        2
      )
      .squeeze();
  }) as any; // process boxes [y1, x1, y2, x2]

  const [scores, classes] = tf.tidy(() => {
    const rawScores = transRes.slice([0, 0, 4], [-1, -1, labels.length]).squeeze(); // #6 only squeeze axis 0 to handle only 1 class models
    return [rawScores.max(1), rawScores.argMax(1)];
  }) as any; // get max scores and classes index

  const nms = await tf.image.nonMaxSuppressionAsync(boxes, scores, 500, 0.45, 0.2); // NMS to filter boxes
  const boxes_data = boxes.gather(nms, 0).dataSync(); // indexing boxes by nms index
  const scores_data = scores.gather(nms, 0).dataSync(); // indexing scores by nms index
  const classes_data = classes.gather(nms, 0).dataSync(); // indexing classes by nms index

  renderBoxes(canvasRef, boxes_data, scores_data, classes_data, [xRatio, yRatio]); // render boxes
  tf.dispose([res, transRes, boxes, scores, classes, nms]); // clear memory

  callback();

  tf.engine().endScope(); // end of scoping
}

/**
 * Function to detect every frame from video
 * @param {HTMLVideoElement} source video source
 * @param {tf.GraphModel} model loaded YOLOv8 tensorflow.js model
 * @param {HTMLCanvasElement} canvasRef canvas reference
 */
export function detectVideo(yoloModel: any, source: HTMLVideoElement, canvasRef: HTMLCanvasElement) {
  let animationId = -1;
  const detectFrame = async () => {
    if (source.paused) {
      console.log("source.paused", source.paused);
      const ctx = canvasRef.getContext("2d");
      ctx && ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      cancelAnimationFrame(animationId);
      console.warn("cancelAnimationFrame", animationId);
      return; // handle if source is closed
    }
    detect(yoloModel, source, canvasRef, () => {
      animationId = requestAnimationFrame(detectFrame); // get another frame
    });
  };

  detectFrame(); // initialize to detect every frame
}
