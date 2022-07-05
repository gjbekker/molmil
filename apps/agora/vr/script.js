var randomSeed = 0;
var gamepadDeltaFast = 10, gamepadDeltaSlow = 0.25;
var refPoints = [];
var loadProgress = [0, 0];
var filename2name = {};
var crowdingFactor = 1.0;
var label_fontSize = 30;
    
// instead of moving in the regular x,y,z direction, move in the direction based on where the viewer is looking at...
    
function agoraMPBF(loc, pos, cb) {
  // fetch the mpbf file...
  var soup = molmil.cli_soup;
  var request = new molmil_dep.CallRemote("GET"); request.ASYNC = true; request.responseType = "arraybuffer";
  request.OnDone = function() {
    if (! molmil.conditionalPluginLoad(molmil.settings.src+"plugins/loaders.js", this.OnDone, this, [], true)) return;
    var settings = {offsetCOR: pos};
    var struct = soup.load_MPBF(this.request.response, loc.substr(loc.lastIndexOf("/")+1), settings);
    cb(soup, struct);
  }
  request.Send(loc);
};
    
    
function agoraJSON(pdbid, cb) {
  var soup = molmil.cli_soup;
  
  var requestA = new molmil_dep.CallRemote("GET"); requestA.ASYNC = true;
  requestA.OnDone = function() {
    var jso = JSON.parse(this.request.responseText);
    soup.loadStructureData(jso, "mmjson", pdbid+".json", cb || function(target, struc) { // later switch this to use the new lite mmjson files...
      delete target.pdbxData;
    });
  }
  requestA.Send("structures/__ID__-agora.json".replace("__ID__", pdbid));
  
  
  return;
  
  var soup = molmil.cli_soup;
  
  var requestA = new molmil_dep.CallRemote("GET"); requestA.ASYNC = true;
  requestA.OnDone = function() {this.atom_data = JSON.parse(this.request.responseText);}
  requestA.Send("structures/__ID__-agora.json".replace("__ID__", pdbid));
  var requestB = new molmil_dep.CallRemote("GET"); requestB.ASYNC = true; requestB.target = this; requestB.requestA = requestA; 
  requestB.OnDone = function() {
    if (this.requestA.error) return;
    if (! this.requestA.atom_data) return molmil_dep.asyncStart(this.OnDone, [], this, 100);
    var jso = JSON.parse(this.request.responseText);
    jso["data_"+pdbid.toUpperCase()]["atom_site"] = this.requestA.atom_data["data_"+pdbid.toUpperCase()]["atom_site"];
    soup.loadStructureData(jso, "mmjson", pdbid+".json", cb || function(target, struc) { // later switch this to use the new lite mmjson files...
      delete target.pdbxData;
    });
  };
  requestB.Send(molmil.settings.pdb_url.replace("__ID__", pdbid).replace("format=mmjson-all", "format=mmjson-plus-noatom"));
};
    
function handleGamepadEvents() {
  var gps = navigator.getGamepads();
  var g, gamepad, i, r, r2, gamepadDelta, tmp, camxyz = [canvas.renderer.camera.x, canvas.renderer.camera.y, canvas.renderer.camera.z], rnear, inear;
  var threshold = 0.5;
  for (g=0; g<gps.length; g++) {
    gamepad = gps[g];
        
    if (gamepad == null) continue;
    if (! gamepad.connected || gamepad.buttons.length < 10) continue;

    // also use some button to reset the position to the center...
    if (gamepad.buttons[2].pressed) canvas.renderer.camera.x =canvas.renderer.camera.y = canvas.renderer.camera.z = 0.0;
        
    //var tmp = [];
    //for (var i=0; i<gamepad.buttons.length; i++) if (gamepad.buttons[i].pressed) tmp.push(i);
    //if (tmp.length) console.log("pressed:", tmp);
        
    gamepadDelta = gamepadDeltaFast;
    rnear = 1e99;
        
    for (i=0; i<refPoints.length; i++) {
      r = vec3.distance(refPoints[i], camxyz);
      if (r < rnear) {rnear = r; inear = i;}
      r2 = refPoints[i][3]*1.5;
      if (r > r2*2.5) continue;
      if (r < r2) tmp = gamepadDeltaSlow;
      else {
        r2 = ((r-r2)/(r2*1.5)); r2 = r2*r2*r2;
        tmp = ((gamepadDeltaFast-gamepadDeltaSlow)*r2)+gamepadDeltaSlow;
      }
      if (tmp < gamepadDelta) gamepadDelta = tmp;
    }
        
    if (gamepad.buttons[0].pressed) { // move up & down
      if (gamepad.axes[0] < -threshold) {
        canvas.renderer.camera.vrXYZ[1] -= gamepadDelta;
        canvas.update = true; canvas.renderer.camera.vrXYZupdated = true;
      }
      else if (gamepad.axes[0] > threshold) {
        canvas.renderer.camera.vrXYZ[1] += gamepadDelta;
        canvas.update = true; canvas.renderer.camera.vrXYZupdated = true;
      }
      if (gamepad.axes[1] < -threshold) {
        canvas.renderer.camera.vrXYZ[0] -= gamepadDelta;
        canvas.update = true; canvas.renderer.camera.vrXYZupdated = true;
      }
      else if (gamepad.axes[1] > threshold) {
        canvas.renderer.camera.vrXYZ[0] += gamepadDelta;
        canvas.update = true; canvas.renderer.camera.vrXYZupdated = true;
      }
    }
    else {
      if (gamepad.axes[0] < -threshold) { // move forward & backward
        canvas.renderer.camera.vrXYZ[2] += gamepadDelta;
        canvas.update = true; canvas.renderer.camera.vrXYZupdated = true;
      }
      else if (gamepad.axes[0] > threshold) {
        canvas.renderer.camera.vrXYZ[2] -= gamepadDelta;
        canvas.update = true; canvas.renderer.camera.vrXYZupdated = true;
      }
    }
  }
}

function setupGamepad() {molmil.preRenderFuncs.push(handleGamepadEvents);}

function doRender() {
  loadProgress[0]++;
  if (loadProgress[0] >= loadProgress[1]) {
    canvas.molmilViewer.renderer.QLV = 1;
    canvas.molmilViewer.renderer.initBuffers();
    canvas.molmilViewer.renderer.canvas.update = true;
    blaat();
  }
}

function blaat() {
  if (! molmil.VRstatus) return molmil.initVR(null, function() {blaat();});
  if (molmil.VRstatus) document.getElementsByClassName("startbutton")[0].style.display = "block";
}

function loadEntry(pdbid, pos, text, r, nodebug, visualization, BUINFO) {
  if (BUINFO && ! molmil.taubinSmoothing) return molmil.loadPlugin(molmil.settings.src+"plugins/misc.js", loadEntry, null, [pdbid, pos, text, r, nodebug, visualization, BUINFO]); 
  
  if (! nodebug) molmil.configBox.skipClearGeometryBuffer = true;
  if (pdbid.indexOf(".mpbf") != -1) agoraMPBF(pdbid, pos, function(soup, struc) {
    var avg = [0, 0, 0, 0], Rg = 0.0, dx, dy, dz;
    var data = struc.structures[0].data;
    for (var i=0; i<data.vertexBuffer.length; i+=7) {
      avg[0] += data.vertexBuffer[i];
      avg[1] += data.vertexBuffer[i+1];
      avg[2] += data.vertexBuffer[i+2];
      avg[3] += 1;
    }
    avg[0] /= avg[3];
    avg[1] /= avg[3];
    avg[2] /= avg[3];
      
    var xMin = 1e99, xMax = -1e99, yMin = 1e99, yMax = -1e99, zMin = 1e99, zMax = -1e99;
  
    var tmp, n_tmp;
    for (var i=0; i<data.vertexBuffer.length; i+=7) {
      tmp = data.vertexBuffer[i]-avg[0];
      if (tmp < xMin) xMin = tmp;
      if (tmp > xMax) xMax = tmp;
    
      tmp = data.vertexBuffer[i+1]-avg[1]; 
      if (tmp < yMin) yMin = tmp;
      if (tmp > yMax) yMax = tmp;
    
      tmp = data.vertexBuffer[i+2]-avg[2];
      if (tmp < zMin) zMin = tmp;
      if (tmp > zMax) zMax = tmp;
    }
    var size = Math.max((xMax-xMin), (yMax-yMin), (zMax-zMin))*.55
    if (! nodebug) {
      console.log(avg[0], avg[1], avg[2]);
      console.log(size);
    }
        
    molmil.safeStartViewer(soup.renderer.canvas);
    if (filename2name.hasOwnProperty(text)) text = filename2name[text];
    else text = text.substr(text.lastIndexOf("/")+1).split(".")[0];
    molmil.addLabel(text, {text: text, xyz: avg, dy: size+2}, soup);
    //molmil.addLabel(text, {text: text, xyz: info[0], dy: info[1]+2}, soup);
    
    doRender();
  });
  else agoraJSON(pdbid, function(soup, struc) {
    var c, i, dx, dy, dz;
    soup.renderer.QLV = 2;
    
    var strucs = [];
    
    if (BUINFO) {
      var options = BUINFO[1] || {};
      options.skipInit = true;
      
      var strucs = molmil.duplicateBU(BUINFO[0] || 1, options, struc, info);
      
      if (! visualization) visualization = function(_strucs) {
        //molmil.displayEntry(_strucs, molmil.displayMode_Default);
        molmil.displayEntry(_strucs, molmil.displayMode_CartoonRocket);
        molmil.colorEntry(_strucs, molmil.colorEntry_Default);
      }
      
      for (var s=0; s<strucs.length; s++) {
        for (c=0; c<strucs[s].chains.length; c++) {
          for (i=0; i<strucs[s].chains[c].modelsXYZ[0].length; i+=3) {
            strucs[s].chains[c].modelsXYZ[0][i] += pos[0];
            strucs[s].chains[c].modelsXYZ[0][i+1] += pos[1];
            strucs[s].chains[c].modelsXYZ[0][i+2] += pos[2];
          }
        }
      }
    }
    else {
      if (! visualization) visualization = function(_strucs) {
        molmil.displayEntry(_strucs, molmil.displayMode_Default); // this is only done for the ligands, modify CartoonRocket to show ligands as default....
        molmil.displayEntry(_strucs, molmil.displayMode_CartoonRocket);
        molmil.colorEntry(_strucs, molmil.colorEntry_Default);
      }
      
      for (c=0; c<struc.chains.length; c++) {
        for (i=0; i<struc.chains[c].modelsXYZ[0].length; i+=3) {
          struc.chains[c].modelsXYZ[0][i] += pos[0];
          struc.chains[c].modelsXYZ[0][i+1] += pos[1];
          struc.chains[c].modelsXYZ[0][i+2] += pos[2];
        }
      }
     
      strucs.push(struc);     
    }
    
    visualization(strucs);
    
    var info = molmil.calcCenter(struc);
    
    if (! nodebug) {
      console.log(info[0]);
      console.log(info[1]);
    }

    if (filename2name.hasOwnProperty(text)) text = filename2name[text];
    molmil.addLabel(text, {text: text, xyz: info[0], dy: info[1]+2, fontSize: label_fontSize}, soup);
    
    doRender();
  });
}
    
function distributeEntries(list) { // PDBID, COG, Rg
  // figure out a way to spread out the list of entries over the visible space
      
  Math.seedrandom(randomSeed);
      
  var samples = list.length, offset = 2./list.length, increment = Math.PI * (3. - Math.sqrt(5.)), rnd = Math.random()*list.length, r, phi, x, y, z, name;

  // [0]: pdbid
  // [1]: [x,y,z]
  // [2]: size
  // [3]: BUINFO
  
  loadProgress[1] = list.length;
  
  for (var i=0; i<list.length; i++) {
    y = (((i * offset) - 1) + (offset / 2));
    r = Math.sqrt(1 - (y**2))*1.5;
    phi = ((i + rnd) % samples) * increment;
    x = Math.cos(phi) * r;
    z = Math.sin(phi) * r;
        
    r = list[i][2]*1.5*crowdingFactor; // 3 --> 1.5
    x *= r; y *= r; z *= r;
        
    loadEntry(list[i][0], [-list[i][1][0]+x, -list[i][1][1]+y, -list[i][1][2]+z], list[i][0], list[i][2], true, list[i][3], list[i][4]);
        
    refPoints.push([-x, -y, -z, list[i][2]]);
  } 
}
