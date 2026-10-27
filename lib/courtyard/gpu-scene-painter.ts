import type { SceneFrame } from "./scene-painter";
import type { Rect } from "./entrance-scene";
import { visibleImageCrop } from "./scene-image";

const vertexSource = `
attribute vec2 a_position;
uniform vec4 u_destination;
uniform vec4 u_source;
uniform vec2 u_viewport;
varying vec2 v_uv;
void main() {
  vec2 pixel = u_destination.xy + a_position * u_destination.zw;
  gl_Position = vec4(pixel / u_viewport * vec2(2.0, -2.0) + vec2(-1.0, 1.0), 0.0, 1.0);
  v_uv = u_source.xy + a_position * u_source.zw;
}`;
const fragmentSource = `
precision highp float;
uniform sampler2D u_image;
varying vec2 v_uv;
void main() { gl_FragColor = texture2D(u_image, v_uv); }
`;

/** Six resident textures, a unit quad, and per-frame rectangle uniforms. The
 * mobile path never copies/re-rasterises full photographs with 2D drawImage. */
export function createGPUScenePainter(
  home: HTMLElement,
  repaint: () => void,
  pixelRatio: (width: number, height: number) => number,
) {
  const canvas = home.querySelector<HTMLCanvasElement>(
    ".courtyard-scene-canvas",
  )!;
  const gl = canvas.getContext("webgl", {
    alpha: true,
    antialias: false,
    depth: false,
    stencil: false,
    preserveDrawingBuffer: false,
    premultipliedAlpha: true,
    powerPreference: "low-power",
  });
  if (!gl) return null;
  const room = home.querySelector<HTMLImageElement>(
    ".courtyard-room-image img",
  )!;
  const facade = home.querySelector<HTMLImageElement>(".facade-image")!;
  const doors = Array.from(
    home.querySelectorAll<HTMLImageElement>(".facade-doors img"),
  );
  const plants = Array.from(
    home.querySelectorAll<HTMLImageElement>(".entrance-foliage img"),
  );
  const images = [room, facade, ...doors, ...plants];
  const textures = new Map<
    HTMLImageElement,
    { src: string; texture: WebGLTexture }
  >();
  let program: WebGLProgram | null = null;
  let buffer: WebGLBuffer | null = null;
  let uniforms: Record<string, WebGLUniformLocation | null> = {};
  let lost = false,
    disposed = false;
  function initialize() {
    const shaders = [
      [gl!.VERTEX_SHADER, vertexSource],
      [gl!.FRAGMENT_SHADER, fragmentSource],
    ].map(([type, source]) => {
      const shader = gl!.createShader(type as number)!;
      gl!.shaderSource(shader, source as string);
      gl!.compileShader(shader);
      return shader;
    });
    program = gl!.createProgram()!;
    shaders.forEach((shader) => gl!.attachShader(program!, shader));
    gl!.linkProgram(program);
    shaders.forEach((shader) => gl!.deleteShader(shader));
    if (!gl!.getProgramParameter(program, gl!.LINK_STATUS)) {
      gl!.deleteProgram(program);
      program = null;
      return;
    }
    gl!.useProgram(program);
    uniforms = Object.fromEntries(
      ["destination", "source", "viewport", "image"].map((name) => [
        name,
        gl!.getUniformLocation(program!, `u_${name}`),
      ]),
    );
    buffer = gl!.createBuffer();
    gl!.bindBuffer(gl!.ARRAY_BUFFER, buffer);
    gl!.bufferData(
      gl!.ARRAY_BUFFER,
      new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]),
      gl!.STATIC_DRAW,
    );
    const position = gl!.getAttribLocation(program, "a_position");
    gl!.enableVertexAttribArray(position);
    gl!.vertexAttribPointer(position, 2, gl!.FLOAT, false, 0, 0);
    gl!.activeTexture(gl!.TEXTURE0);
    gl!.uniform1i(uniforms.image, 0);
    gl!.pixelStorei(gl!.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    gl!.enable(gl!.BLEND);
    gl!.blendFunc(gl!.ONE, gl!.ONE_MINUS_SRC_ALPHA);
    gl!.clearColor(200 / 255, 174 / 255, 128 / 255, 1);
  }
  initialize();
  function prepare() {
    if (disposed || lost || !program) return;
    for (const image of images) {
      const src = image.currentSrc;
      if (
        !image.complete ||
        !image.naturalWidth ||
        !src ||
        textures.get(image)?.src === src
      )
        continue;
      const texture = gl!.createTexture();
      if (!texture) continue;
      gl!.bindTexture(gl!.TEXTURE_2D, texture);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_S, gl!.CLAMP_TO_EDGE);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_T, gl!.CLAMP_TO_EDGE);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MIN_FILTER, gl!.LINEAR);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MAG_FILTER, gl!.LINEAR);
      // HTMLImageElement upload avoids an extra full-size ImageBitmap copy on iOS.
      gl!.texImage2D(
        gl!.TEXTURE_2D,
        0,
        gl!.RGBA,
        gl!.RGBA,
        gl!.UNSIGNED_BYTE,
        image,
      );
      const previous = textures.get(image);
      if (previous) gl!.deleteTexture(previous.texture);
      textures.set(image, { src, texture });
    }
  }
  const isReady = () =>
    !disposed &&
    !lost &&
    !!program &&
    images.every((image) => textures.get(image)?.src === image.currentSrc);
  const onLost = (event: Event) => {
    event.preventDefault();
    lost = true;
    textures.clear();
    delete home.dataset.scenePainted;
    repaint();
  };
  const onRestored = () => {
    if (disposed) return;
    lost = false;
    initialize();
    repaint();
  };
  canvas.addEventListener("webglcontextlost", onLost);
  canvas.addEventListener("webglcontextrestored", onRestored);
  images.forEach((image) => image.addEventListener("load", repaint));
  return {
    isReady,
    paint(frame: SceneFrame) {
      prepare();
      if (!isReady()) {
        delete home.dataset.scenePainted;
        return;
      }
      const { width, height } = frame;
      const dpr = pixelRatio(width, height);
      const pixelWidth = Math.round(width * dpr),
        pixelHeight = Math.round(height * dpr);
      if (canvas.width !== pixelWidth) canvas.width = pixelWidth;
      if (canvas.height !== pixelHeight) canvas.height = pixelHeight;
      gl.viewport(0, 0, pixelWidth, pixelHeight);
      gl.disable(gl.SCISSOR_TEST);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform2f(uniforms.viewport, width, height);
      const draw = (image: HTMLImageElement, box: Rect, cover = false) => {
        const crop = visibleImageCrop(
          image.naturalWidth,
          image.naturalHeight,
          box,
          width,
          height,
          cover,
        );
        if (!crop) return;
        gl.bindTexture(gl.TEXTURE_2D, textures.get(image)!.texture);
        gl.uniform4fv(uniforms.source, crop.source);
        gl.uniform4fv(uniforms.destination, crop.destination);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      };
      draw(room, frame.room, true);
      if (frame.entranceVisible) {
        const top = Math.max(0, frame.stage.y),
          bottom = Math.min(height, frame.stage.y + frame.stage.height);
        if (bottom > top) {
          gl.enable(gl.SCISSOR_TEST);
          gl.scissor(
            0,
            Math.round((height - bottom) * dpr),
            pixelWidth,
            Math.round((bottom - top) * dpr),
          );
          const atStage = (rect: Rect) => ({
            ...rect,
            y: rect.y + frame.stage.y,
          });
          draw(facade, atStage(frame.facade));
          doors.forEach((image, i) => draw(image, atStage(frame.doors[i])));
          plants.forEach((image, i) => draw(image, atStage(frame.plants[i])));
        }
      }
      home.dataset.scenePainted = "true";
    },
    dispose() {
      disposed = true;
      images.forEach((image) => image.removeEventListener("load", repaint));
      canvas.removeEventListener("webglcontextlost", onLost);
      canvas.removeEventListener("webglcontextrestored", onRestored);
      textures.forEach(({ texture }) => gl.deleteTexture(texture));
      textures.clear();
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      delete home.dataset.scenePainted;
    },
  };
}
