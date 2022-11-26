
var head = document.getElementsByTagName("head")[0];
var obj = molmil_dep.dcE("script"); obj.src = "//cdn.jsdelivr.net/npm/@ffmpeg/ffmpeg@0.11.6/dist/ffmpeg.min.js"; 
head.appendChild(obj);

if (! window.saveAs) molmil.loadPlugin(molmil.settings.src+"lib/FileSaver.js", this.onclick, this, []); 

var ffmpeg, fileCounter, fileDone, settings;

// molmil.configBox.video_path, this.canvas.width, this.canvas.height, molmil.configBox.video_framerate
async function initVideo(loc, width, height, framerate) {
  ffmpeg = undefined; fileCounter = 0; fileDone = 0;
  const tmp = FFmpeg.createFFmpeg({ log: true });
  await tmp.load();
  settings = {loc, width, height, framerate}
  ffmpeg = tmp;
};

function sleep(ms) {return new Promise(resolve=>{setTimeout(resolve,ms)});}

// this.canvas.toDataURL()
async function addFrameCanvas(canvas) {
  const num = (fileCounter+"").padStart(4, 0); fileCounter++;
  
  canvas.toBlob(async function(blob) {
    while (ffmpeg === undefined) {await sleep(100);}
    await ffmpeg.FS('writeFile', `tmp.${num}.png`, await FFmpeg.fetchFile(blob));
    fileDone++;
  }, "image/png");
}

async function finalizeVideo() {
  while (fileDone < fileCounter) {await sleep(100);}
  await ffmpeg.run('-framerate', (settings.framerate||10)+"", '-pattern_type', 'glob', '-i', 'tmp.*.png', 'movie.mp4');
  
  const data = ffmpeg.FS('readFile', 'movie.mp4');
  for (let i = 0; i < fileDone; i += 1) {
    const num = (i+"").padStart(4, 0);
    ffmpeg.FS('unlink', `tmp.${num}.png`);
  }
  saveAs(new Blob([data.buffer], { type: 'video/mp4' }), "movie.mp4");
  ffmpeg = fileCounter = fileDone = settings = undefined;
}