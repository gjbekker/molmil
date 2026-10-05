var head = document.getElementsByTagName("head")[0];
var obj = molmil_dep.dcE("script"); obj.src = "/libs/ffmpeg/ffmpeg.js";  obj.async = false;
head.appendChild(obj);

if (! window.saveAs) molmil.loadPlugin(molmil.settings.src+"lib/FileSaver.js", this.onclick, this, []); 

var ffmpeg, fileCounter, fileDone, settings;

// molmil.configBox.video_path, this.canvas.width, this.canvas.height, molmil.configBox.video_framerate
async function initVideo(loc, width, height, framerate) {
  ffmpeg = undefined; fileCounter = 0; fileDone = 0;
  
  const tmp = new FFmpegWASM.FFmpeg();
  tmp.on('log', ({ message }) => {console.log("FFmpeg Log:", message);});

  tmp.on('progress', ({ progress, time }) => {console.log(`Processing: ${(progress * 100).toFixed(2)}%`);});
  
  await tmp.load({
    coreURL: "/libs/ffmpeg-core/ffmpeg-core.js",
    wasmURL: "/libs/ffmpeg-core/ffmpeg-core.wasm"
  });
  settings = {loc, width, height, framerate}
  ffmpeg = tmp;
};

function sleep(ms) {return new Promise(resolve=>{setTimeout(resolve,ms)});}

// this.canvas.toDataURL()
async function addFrameCanvas(canvas) {
  const num = (fileCounter+"").padStart(4, 0); fileCounter++;
  
  canvas.toBlob(async function(blob) {
    while (ffmpeg === undefined) {await sleep(100);}
    const data = new Uint8Array(await blob.arrayBuffer());
    await ffmpeg.writeFile(`tmp.${num}.png`, data);
    fileDone++;
  }, "image/png");
}

async function finalizeVideo() {
  while (fileDone < fileCounter) {await sleep(100);}
  await ffmpeg.exec(['-framerate', (settings.framerate||10)+"", '-i', 'tmp.%04d.png', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', 'movie.mp4']);
  const data = await ffmpeg.readFile('movie.mp4');
  for (let i = 0; i < fileDone; i += 1) {
    const num = (i+"").padStart(4, 0);
    ffmpeg.deleteFile(`tmp.${num}.png`);
  }
  saveAs(new Blob([data.buffer], { type: 'video/mp4' }), "movie.mp4");
  ffmpeg = fileCounter = fileDone = settings = undefined;
}