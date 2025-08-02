molmil.decodeUtf8=function(arrayBuffer) {
  var result = "", i = 0, c = 0, c1 = 0, c2 = 0, data = new Uint8Array(arrayBuffer);
 
  // If we have a BOM skip it
  if (data.length >= 3 && data[0] === 0xef && data[1] === 0xbb && data[2] === 0xbf) i = 3;
 
  while (i < data.length) {
    c = data[i];
 
    if (c < 128) {
      result += String.fromCharCode(c);
      i++;
    } 
    else if (c > 191 && c < 224) {
      if( i+1 >= data.length ) throw "UTF-8 Decode failed. Two byte character was truncated.";
      c2 = data[i+1];
      result += String.fromCharCode( ((c&31)<<6) | (c2&63) );
      i += 2;
    } 
    else {
      if (i+2 >= data.length) throw "UTF-8 Decode failed. Multi byte character was truncated.";
      c2 = data[i+1];
      c3 = data[i+2];
      result += String.fromCharCode( ((c&15)<<12) | ((c2&63)<<6) | (c3&63) );
      i += 3;
    }
  }
  return result;
}

molmil.viewer.prototype.load_ply = function(buffer, filename, settings) {
  return;
  var header = "", byte, offset = 0;
  
  while (true) {
    byte = molmil.decodeUtf8(new Uint8Array(buffer, offset, 1));
    header += byte;
    if (header.endsWith("end_header\n")) break;
    offset += 1;
  }
  while (true) {
    byte = molmil.decodeUtf8(new Uint8Array(buffer, offset, 1));
    if (byte != " ") break;
    offset += 1;
  }
  var littleEndian = header.indexOf("binary_little_endian") != -1;
  
  
  var items = [], nVertices = 0, nFaces = 0;
  
  header = header.split("\n");
  for (var i=0; i<header.length; i++) {
    if (header[i].startsWith("property") && ! header[i].startsWith("property list")) items.push(header[i]);
    if (header[i].startsWith("element vertex")) nVertices = parseInt(header[i].split(" ")[2]);
    if (header[i].startsWith("element face")) nFaces = parseInt(header[i].split(" ")[2]);
  }
  
  if (! JSON.stringify(items) == '["property float x","property float y","property float z","property float nx","property float ny","property float nz","property uchar red","property uchar green","property uchar blue","property uchar alpha"]') {
    console.error("PLY format not supported...");
    return;
  }
  
  var view = new DataView(buffer), tmp;
  var vertices = new Float32Array(nVertices*7), faces = new Int32Array(nFaces*4);
  
  for (var i=0; i<nVertices*7; i++, offset+=4) vertices[i] = view.getFloat32(offset, littleEndian=littleEndian);

  for (var i=0; i<nFaces*4; i++, offset+=4) {
    faces[i] = view.getInt32(offset, littleEndian=littleEndian);
    console.log(faces[i]);
    return;
  }
  console.log(vertices, faces);
  return;
  
  var temp, vertices, faces;
  
  temp = new Uint8Array(buffer, offset, nVertices*7*4); offset += nVertices*7*4;
  vertices = new Float32Array(temp.buffer);
  console.log(vertices.length, nVertices*7);
  
  temp = new Uint8Array(buffer, offset, nFaces*4*4); offset += faces*7*4;
  faces = new Int32Array(temp);
  
  //var vertices = new Float32Array(buffer, offset, nVertices*7); offset += nVertices*7;
  //var faces = new Int32Array(buffer, offset, nFaces*4); offset += nFaces*4;
  
  console.log(temp);
  
}

molmil.viewer.prototype.load_stl = function(buffer, filename, settings) {
  
  
  var header = molmil.decodeUtf8(new Uint8Array(buffer, 0, 80));
  var slowView = new DataView(buffer);
  
  var offset = 80;
  var not = slowView.getUint32(offset, littleEndian=true); offset += 4;
  
  
  for (var i=0; i<not; i++) {
    //slowView.getFloat32(offset, littleEndian=true); offset += 4;
    //slowView.getFloat32(offset, littleEndian=true); offset += 4;
    
  }
  
  return;
  
  var dataui8 = new Uint8Array(buffer.buffer);
  var dataui32 = new Uint32Array(buffer.buffer);
  
  var header = String.fromCharCode.apply(null, dataui8.subarray(0, 80));
  console.log(dataui32.length);
  console.log(dataui32[21]);
  
}

molmil.taubinSmoothing = molmil.taubinSmoothing || function(vertices, faces, lambda, mu, iter) {
  return molmil.loadPlugin(molmil.settings.src+"plugins/misc.js", this.taubinSmoothing, this, [vertices, faces, lambda, mu, iter]); 
}

molmil.viewer.prototype.load_obj = function(data, filename, settings) {
  if (! settings) settings = {solid: true};
  var rgba = [255, 255, 255, 255];
  settings.rgba = settings.rgba || rgba;
  if (settings.rgba[3] != 255) settings.alphaSet = settings.rgba[3]/255;
  
  data = data.split("\n");
  var tmp, i;
  var pos = [], norm = [], idx = [], n, hihi = [0, 0, 0, 0];
  
  var geomRanges = [1e99, -1e99, 1e99, -1e99, 1e99, -1e99];
  for (i=0; i<data.length; i++) {
    if (data[i].substr(0,2) == "vn") {
      tmp = data[i].split(/\s+/);
      norm.push(n=[parseFloat(tmp[1]), parseFloat(tmp[2]), parseFloat(tmp[3])]);
      vec3.normalize(n, n);
    }
    else if (data[i].substr(0,1) == "v") {
      tmp = data[i].split(/\s+/);
      pos.push(n=[parseFloat(tmp[1]), parseFloat(tmp[2]), parseFloat(tmp[3])]);
      
      if (n[0] < geomRanges[0]) geomRanges[0] = n[0];
      if (n[0] > geomRanges[1]) geomRanges[1] = n[0];
      
      if (n[1] < geomRanges[2]) geomRanges[2] = n[1];
      if (n[1] > geomRanges[3]) geomRanges[3] = n[1];
     
      if (n[2] < geomRanges[4]) geomRanges[4] = n[2];
      if (n[2] > geomRanges[5]) geomRanges[5] = n[2];
      
      hihi[0] += n[0];
      hihi[1] += n[1];
      hihi[2] += n[2];
      hihi[3] += 1;
      
    }
    else if (data[i].substr(0,1) == "f") {
      tmp = data[i].split(/\s+/);
      idx.push([parseInt(tmp[1].split("//")[0])-1, parseInt(tmp[2].split("//")[0])-1, parseInt(tmp[3].split("//")[0])-1]);
    }
  }

  if (norm.length == 0) {
    // make faces list
    
    molmil.taubinSmoothing(pos, idx, .5, -.53, 5);
    
    var face_normals = [], tmp1 = [0, 0, 0], tmp2 = [0, 0, 0], faceidxs = [], i, f;
    
    for (i=0; i<pos.length; i++) faceidxs.push([]);
    
    for (i=0; i<idx.length; i++) {
      vec3.sub(tmp1, pos[idx[i][0]], pos[idx[i][1]]);
      vec3.sub(tmp2, pos[idx[i][0]], pos[idx[i][2]]);
      face_normals.push(vec3.cross([0, 0, 0], tmp1, tmp2));
      faceidxs[idx[i][0]].push(face_normals.length-1);
      faceidxs[idx[i][1]].push(face_normals.length-1);
      faceidxs[idx[i][2]].push(face_normals.length-1);
    }
    
    for (i=0; i<pos.length; i++) {
      normal = [0, 0, 0];
      f = 0;
      for (f=0; f<faceidxs[i].length; f++) vec3.add(normal, normal, face_normals[faceidxs[i][f]]);
      vec3.normalize(normal, normal);
      norm.push(normal);
    }
    molmil.taubinSmoothing(norm, idx, .5, -.53, 5);
  }

  var vertices = new Float32Array(pos.length*7); // x, y, z, nx, ny, nz, rgba
  var indices = new Int32Array(idx.length*3);
      
  var vertices8 = new Uint8Array(vertices.buffer);
  
  var i, p=0, p8=0;
  for (i=0; i<pos.length; i++, p8 += 28) {
    vertices[p++] = pos[i][0];
    vertices[p++] = pos[i][1];
    vertices[p++] = pos[i][2];
    
    vertices[p++] = norm[i][0];
    vertices[p++] = norm[i][1];
    vertices[p++] = norm[i][2];
    
    vertices8[p8+24] = 255;
    vertices8[p8+25] = 255;
    vertices8[p8+26] = 255;
    vertices8[p8+27] = 255;
    p++;
  }
  
  p = 0;
  for (i=0; i<idx.length; i++) {
    indices[p++] = idx[i][0];
    indices[p++] = idx[i][1];
    indices[p++] = idx[i][2];
  }
  
  if (! settings.solid || settings.generateWireframe) {
    settings.wireframeIdxs = new Int32Array(idx.length*6);
    
    p = 0;
    for (i=0; i<idx.length; i++) {
      settings.wireframeIdxs[p++] = idx[i][0];
      settings.wireframeIdxs[p++] = idx[i][1];
      settings.wireframeIdxs[p++] = idx[i][0];
      settings.wireframeIdxs[p++] = idx[i][2];
      settings.wireframeIdxs[p++] = idx[i][1];
      settings.wireframeIdxs[p++] = idx[i][2];
    }
    settings.triangleIdxs = indices;
  }
  
  
  var struct = new molmil.polygonObject({filename: filename, COR: hihi}); this.structures.push(struct);
  struct.options = [];
  struct.meta.geomRanges = geomRanges;

  var program = molmil.geometry.build_simple_render_program(vertices, indices, this.canvas.renderer, settings);
  this.canvas.renderer.addProgram(program);
  struct.programs.push(program);
  
  program.settings.meshData8 = vertices8;
  
  this.calculateCOG();
  
  this.renderer.initBuffers();
  this.canvas.update = true;
          
  molmil.safeStartViewer(this.canvas);
  
  return struct;
  
};

molmil.viewer.prototype.load_ccp4 = function(buffer, filename, settings) {
  var head = document.getElementsByTagName("head")[0];
  if (! molmil.conditionalPluginLoad(molmil.settings.src+"plugins/misc.js", this.load_ccp4, this, [buffer, filename, settings])) return;
  
  if (! settings) settings = {sigma: 1.0};
  if (buffer instanceof molmil.polygonObject) {
    var struct = buffer;
    buffer = struct.buffer;
    this.renderer.removeProgram(struct.programs[0]);
    struct.programs = [];
  }
  else {
    if (buffer.buffer) buffer = buffer.buffer; // make sure we have the arraybuffer itself...
    var struct = new molmil.polygonObject({filename: filename}); this.structures.push(struct);
    struct.options = []; struct.type = "isosurface"
    struct.buffer = buffer;
  }
  
  var a = new Int32Array(buffer, 0, 10); // col, row, section, mode, number of first row, number of first column, number of first section, number of intervals x, number of intervals y, number of intervals z
  var b = new Float32Array(buffer, 40, 6); // length in x, length in y, length in z, alpha, beta, gamma
  var c = new Int32Array(buffer, 64, 3); // axis cols, axis rows, axis section
  var d = new Float32Array(buffer, 76, 3); // min density, max density, mean density
  var e = new Int32Array(buffer, 88, 3); // space gap
  var f = new Float32Array(buffer, 100, 233); // header
  var g = new Float32Array(buffer, 1024, e[1]/4); // crystallographic symmetry table
  var h = new Float32Array(buffer, 0, 256); // crystallographic symmetry table
  
  if (! settings.hasOwnProperty("solid") || settings.solid == 1) settings.solid = true;
  else settings.solid = false;
  
  // the data should be normalized so that mean = 0.0 and std = 1.0
  // but instead of normalizing the data, denormalize sigma ==> faster
  var sigma = settings.sigma || 1.0;

  if (settings.denormalize) {
    var dev = new Float32Array(buffer, 54*4, 1)[0];
    sigma = (sigma+d[2])*dev;
  }
  else if (settings.minmax == 1) {
    sigma = (d[1]-d[0])*sigma;
  }
  else if (! settings.skipNormalization) {
    var dev = new Float32Array(buffer, 54*4, 1)[0];
    sigma = (sigma*dev)+d[2];
  }
  
  if (settings.color) settings.rgba = molmil.color2rgba(settings.color);
  var rgba = settings.rgba || [255, 255, 255, 255];
      
  var sz = a[0]*a[1]*a[2];
  var voxels = new Float32Array(buffer, 1024+e[1], sz); 
  // ^ this should actually be based on mode (a[4]):
  // 0: 8bit
  // 1: 16bit
  // 2: 32bit (float)
  // 3: 32bit (fourier int)
  // 4: 64bit (fourier float)

  // alpha, beta, gamma...
  var iIndex = c[0]-1, jIndex = c[1]-1, kIndex = c[2]-1;
  var temp = [-1, -1, -1]; temp[c[0]-1] = 0; temp[c[1]-1] = 1; temp[c[2]-1] = 2;
  var xIndex = temp[0], yIndex = temp[1], zIndex = temp[2];

  var voxel_size = [b[0]/a[7], b[1]/a[8], b[2]/a[9]];
  // console.log(1/b[0], 1/b[1], 1/b[2]); scalen inverse (diagonal)
  //var first = [voxel_size[0]*a[iIndex+4], voxel_size[1]*a[jIndex+4], voxel_size[2]*a[kIndex+4]];

  var selectFunc = function(x, y, z) {return arguments[iIndex] + a[0] * (arguments[jIndex] + a[1] * arguments[kIndex]);}
  var surf = polygonize([a[xIndex], a[yIndex], a[zIndex]], voxels, sigma, selectFunc);

  var st = new Float32Array(buffer, 100, 12); // header
  
  var alpha = (Math.PI/180.0)*b[3], beta = (Math.PI/180.0)*b[4], gamma = (Math.PI/180.0)*b[5];
  var cosa = Math.cos(alpha), cosb = Math.cos(beta), cosg = Math.cos(gamma), sing = Math.sin(gamma); var tmp = (cosa - cosb*cosg) / sing;

  var matrix = mat4.create();
  matrix[0] = voxel_size[0];
  matrix[4] = cosg * voxel_size[1];
  matrix[5] = sing * voxel_size[1];
  matrix[8] = cosb * voxel_size[2];
  matrix[9] = tmp * voxel_size[2];
  matrix[10] = Math.sqrt(1.0 - cosb*cosb - tmp*tmp) * voxel_size[2];
  
  if (f[24] == 0 && f[25] == 0 && f[26] == 0) { // Handle both MRC-2000 and older format maps
    matrix[12] = matrix[0] * a[xIndex+4] + matrix[4] * a[yIndex+4] + matrix[8] * a[zIndex+4];
    matrix[13] = matrix[5] * a[yIndex+4] + matrix[9] * a[zIndex+4];
    matrix[14] = matrix[10] * a[zIndex+4];
  }
  else { // using MRC2000 origin
    matrix[12] = f[xIndex+24];
    matrix[13] = f[yIndex+24];
    matrix[14] = f[zIndex+24];
  }
  
  for (i=0; i<surf.vertices.length; i++) {
    vec3.transformMat4(surf.vertices[i], surf.vertices[i], matrix);
  }
  
  /*
  if (e[2] != 0) { // translate & scale if required by ccp4 (LSKFLG)
    var S = mat3.fromValues(1/st[0], 1/st[1], 1/st[2], 1/st[3], 1/st[4], 1/st[5], 1/st[6], 1/st[7], 1/st[8]);
    var t = vec3.fromValues(st[9], st[10], st[11]);
    t[0] -= first[0]; t[1] -= first[1]; t[2] -= first[2];
    
    var x, y, z;
    for (i=0; i<surf.vertices.length; i++) {
      x = ((surf.vertices[i][0]) * voxel_size[0]);
      y = ((surf.vertices[i][1]) * voxel_size[1]);
      z = ((surf.vertices[i][2]) * voxel_size[2]);

      surf.vertices[i][0] = (x * S[0] + y * S[3] + z * S[6]) + t[0];
      surf.vertices[i][1] = (x * S[1] + y * S[4] + z * S[7]) + t[0];
      surf.vertices[i][2] = (x * S[2] + y * S[5] + z * S[8]) + t[0];
    }
  }
  else { // do some translation 
    var t = vec3.fromValues(st[9], st[10], st[11]);
    if (t[0] == 0 && t[1] == 0 && t[2] == 0) {t[0] = first[0]; t[1] = first[1]; t[2] = first[2];}
    if (f[24] != 0) {t[0] = f[24]; t[1] = f[25]; t[2] = f[26];}
    
    for (i=0; i<surf.vertices.length; i++) {
      surf.vertices[i][0] = ((surf.vertices[i][0]) * voxel_size[0]) + t[0];
      surf.vertices[i][1] = ((surf.vertices[i][1]) * voxel_size[1]) + t[1];
      surf.vertices[i][2] = ((surf.vertices[i][2]) * voxel_size[2]) + t[2];
    }
  }
*/
  molmil.taubinSmoothing(surf.vertices, surf.faces, .5, -.53, 10);

  var i, faces, f, normals = [], normal;
  for (i=0; i<surf.vertices.length; i++) normals.push([0, 0, 0]);
  
  for (i in surf.vertexIndex) {
    normal = normals[surf.vertexIndex[i][0]];
    faces = surf.vertexIndex[i][1];
    for (f=0; f<faces.length; f++) vec3.add(normal, normal, surf.face_normals[faces[f]]);
    vec3.normalize(normal, normal);
  }
  surf.normals = normals;
  
  molmil.taubinSmoothing(surf.normals, surf.faces, .5, -.53, 10);

  var vertices = new Float32Array(surf.vertices.length*7); // x, y, z, nx, ny, nz, rgba
      
  var vertices8 = new Uint8Array(vertices.buffer);
    
  var hihi = [0, 0, 0, 0], tmp = [0, 0, 0];
  var geomRanges = [1e99, -1e99, 1e99, -1e99, 1e99, -1e99];
  for (var v=0, v2, v3; v<surf.vertices.length; v++) {
    v2 = v*7;
    v3 = v*28;
        
    vertices[v2+3] = normals[v][0];
    vertices[v2+4] = normals[v][1];
    vertices[v2+5] = normals[v][2];
        
    vertices[v2] = surf.vertices[v][0];
    vertices[v2+1] = surf.vertices[v][1];
    vertices[v2+2] = surf.vertices[v][2];
        
    hihi[0] += surf.vertices[v][0];
    hihi[1] += surf.vertices[v][1];
    hihi[2] += surf.vertices[v][2];
    hihi[3] += 1;
        
    if (vertices[v2] < geomRanges[0]) geomRanges[0] = vertices[v2];
    if (vertices[v2] > geomRanges[1]) geomRanges[1] = vertices[v2];
      
    if (vertices[v2+1] < geomRanges[2]) geomRanges[2] = vertices[v2+1];
    if (vertices[v2+1] > geomRanges[3]) geomRanges[3] = vertices[v2+1];
     
    if (vertices[v2+2] < geomRanges[4]) geomRanges[4] = vertices[v2+2];
    if (vertices[v2+2] > geomRanges[5]) geomRanges[5] = vertices[v2+2];
    
    vertices8[v3+24] = 255;
    vertices8[v3+25] = 255;
    vertices8[v3+26] = 255;
    vertices8[v3+27] = 255;
  }
   
  var indices = new Int32Array(surf.faces.length*3);
  for (var i=0, i2; i<surf.faces.length; i++) {
    i2 = i*3;
    indices[i2] = surf.faces[i][0];
    indices[i2+1] = surf.faces[i][1];
    indices[i2+2] = surf.faces[i][2];
  }
  
  var line_indices = new Int32Array(surf.lines.length*2);
  for (var i=0, i2; i<surf.lines.length; i++) {
    i2 = i*2;
    line_indices[i2] = surf.lines[i][0];
    line_indices[i2+1] = surf.lines[i][1];
  }

  struct.meta.COR = hihi; struct.meta.geomRanges = geomRanges;

  settings.wireframeIdxs = line_indices;
  settings.triangleIdxs = indices;
  var program = molmil.geometry.build_simple_render_program(vertices, settings.solid ? indices : line_indices, this.renderer, settings);
  this.renderer.addProgram(program);
  struct.programs.push(program);

  if (! settings.skipCOG) this.calculateCOG();
  
  this.renderer.initBuffers();
  this.canvas.update = true;
          
  molmil.safeStartViewer(this.canvas);
  
  return struct;
};
    

// ** loads MPBF data **
molmil.viewer.prototype.load_MPBF = function(buffer, filename, settings) {
  settings = settings || {};
  if (! settings.hasOwnProperty("solid")) settings.solid = true;
  var offset = 0;
  var offsetCOR = settings.offsetCOR || null;

  var primaryObject = {structures: [], options: [], meta: {filename: filename}};
  this.structures.push(primaryObject);

  while (offset < buffer.byteLength) {
    var COR = [0, 0, 0, 0];
    var metadata = new Int32Array(buffer, offset, 4); offset += 16;

    if (metadata[0] == 0) break;
    if (metadata[3]) {
      var name = molmil.decodeUtf8(new Uint8Array(buffer, offset, metadata[3])); offset += metadata[3] + (metadata[3]%4 != 0 ? 4-metadata[3]%4 : 0); // padding has to be skipped
    }
    else var name = "";
   
    var vertices_offset = offset;
    
    if (metadata[0] == 3) {
      var vertices = new Float32Array(buffer, offset, 7*metadata[1]);
      offset += 7*metadata[1]*4;
      var indices = new Int32Array(buffer, offset, metadata[2]*3); offset += metadata[2]*3*4;
    }
    else if (metadata[0] == 6) {
      var vertices = new Float32Array(buffer, offset, 7*metadata[1]); 
      var tmp = new Int32Array(buffer, offset, 7*metadata[1]);
      tmp.forEach(function(x, i) {if (i%7 != 6) vertices[i] = x*.001;});
      offset += 7*metadata[1]*4;
      var indices = new Int32Array(buffer, offset, metadata[2]*3); offset += metadata[2]*3*4;
    }
    else {console.error("Unsupported MPBF type", metadata[0]); break;}
    

    if (offsetCOR != null) {
      for (var i=0; i<vertices.length; i+=7) {
        vertices[i] += offsetCOR[0];
        vertices[i+1] += offsetCOR[1];
        vertices[i+2] += offsetCOR[2];
      }
    }
    
    var geomRanges = [1e99, -1e99, 1e99, -1e99, 1e99, -1e99];

    for (var i=0; i<vertices.length; i+=7) {
      COR[0] += vertices[i];
      COR[1] += vertices[i+1];
      COR[2] += vertices[i+2];
      COR[3]++;
      if (vertices[i] < geomRanges[0]) geomRanges[0] = vertices[i];
      if (vertices[i] > geomRanges[1]) geomRanges[1] = vertices[i];
      
      if (vertices[i+1] < geomRanges[2]) geomRanges[2] = vertices[i+1];
      if (vertices[i+1] > geomRanges[3]) geomRanges[3] = vertices[i+1];
      
      if (vertices[i+2] < geomRanges[4]) geomRanges[4] = vertices[i+2];
      if (vertices[i+2] > geomRanges[5]) geomRanges[5] = vertices[i+2];
    }
    
    var struct = new molmil.polygonObject({COR: COR});
    primaryObject.structures.push(struct);
    struct.meta.geomRanges = geomRanges;
    
    
    program = molmil.geometry.build_simple_render_program(vertices, indices, this.renderer, settings);
    this.renderer.addProgram(program);
    struct.programs.push(program);
            
    // also add an entry to the structures menu for easy enabling/disabling
    primaryObject.options.push([name, program]);

    if (molmil.configBox.skipClearGeometryBuffer) {
      struct.data = struct.data || {};
      struct.data.buffer = buffer;
      struct.data.vertexBuffer = vertices;
      struct.data.indexBuffer = indices;
      struct.data.vertexSize = 7;
      struct.data.vertices_offset = vertices_offset;
    }
  
  }
  
  this.renderer.initBD = true;
  
  this.calculateCOG();
  
  if (molmil.geometry.onGenerate) molmil_dep.asyncStart(molmil.geometry.onGenerate[0], molmil.geometry.onGenerate[1], molmil.geometry.onGenerate[2], 0);
  
  return primaryObject;
  
}

// ** loads XYZ data **

molmil.viewer.prototype.load_xyz = function(data, filename, settings) {
  settings = settings || {};
  var struc, currentChain, atomName, x, y, z, currentMol;
  
  data = data.split("\n");
  
  for (i=0; i<data.length; i++) {
    data[i] = molmil_dep.Strip(data[i]);
    if (! data[i].length) continue;
    data[i] = data[i].split(/[ ,\t]+/);
    if (data[i].length == 1 && data[i] && !isNaN(parseInt(data[i][0], 10))) {
      this.structures.push(struc = new molmil.entryObject({id: filename}));
      struc.chains.push(currentChain = new molmil.chainObject("", struc));
      currentChain.CID = this.CID++;
      this.chains.push(currentChain);
      currentChain.molecules.push(currentMol = new molmil.molObject("???", 0, currentChain));
      if (settings.skipBonds) currentChain.bondsOK = true;
      i++;
      continue;
    }

    atomName = data[i][0];
    x = parseFloat(data[i][1]);
    y = parseFloat(data[i][2]);
    z = parseFloat(data[i][3]);

    Xpos = currentChain.modelsXYZ[0].length;
    currentChain.modelsXYZ[0].push(x, y, z);
    currentMol.atoms.push(atom=new molmil.atomObject(Xpos, atomName, atomName, currentMol, currentChain));
    if (atom.element == "H") atom.display = this.showHydrogens;
    atom.AID = this.AID++;
    this.atomRef[atom.AID] = atom;
    currentChain.atoms.push(atom);
  }

  this.calculateCOG();
  
  molmil.resetColors(struc, this);
  
  return struc;
}

// ** loads MOL2 data **

molmil.viewer.prototype.load_mol2 = function(data, filename) {
  data = data.split("\n");
  var i, name="", atomMode=false, atomData=[], bondMode=false, bondData=[], ssMode=false, subStructs={}, tmp, struc;
  
  var molecules = [], curmol;
  
  for (i=0; i<data.length; i++) {
    if (data[i].startsWith("#")) continue;
    if (data[i].substr(0,9).toUpperCase() == "@<TRIPOS>") {
      atomMode = false;
      bondMode = false;
      ssMode = false;
    }
    
    if (curmol) {
      if (atomMode) curmol.atomData.push(data[i].trim());
      if (bondMode) curmol.bondData.push(data[i].trim());
      if (ssMode) {
        tmp = data[i].trim().split(/[ ,]+/);
        curmol.subStructs[parseInt(tmp[0])] = tmp[1];
      }
    }
    
    if (data[i].substr(0,17).toUpperCase() == "@<TRIPOS>MOLECULE") {
      curmol = {name: data[i+1].trim(), atomData: [], bondData: [], subStructs: []};
      molecules.push(curmol);
    }
    else if (data[i].substr(0,13).toUpperCase() == "@<TRIPOS>ATOM") atomMode = true;
    else if (data[i].substr(0,13).toUpperCase() == "@<TRIPOS>BOND") bondMode = true;
    else if (data[i].substr(0,21).toUpperCase() == "@<TRIPOS>SUBSTRUCTURE") ssMode = true;
  }
  
  var x, y, z, atomName, atomType, resID, prev_resid, currentChain, currentMol, strucs = [];
  for (var m=0; m<molecules.length; m++) {
    name = molecules[m].name;
    atomData = molecules[m].atomData;
    bondData = molecules[m].bondData;
    subStructs = molecules[m].subStructs;

    this.structures.push(struc = new molmil.entryObject({id: filename}));
    strucs.push(struc)
    struc.chains.push(currentChain = new molmil.chainObject("", struc));
    currentChain.CID = this.CID++;
    prev_resid = null;
    
    var refmap = {};
    for (i=0; i<atomData.length; i++) {
      if (! atomData[i]) continue;
      tmp = atomData[i].split(/\s+/g) || [];
      
      //atomName = atomData[i].substring(7, 12).trim();
      //x = parseFloat(atomData[i].substring(12, 22).trim());
      //y = parseFloat(atomData[i].substring(22, 31).trim());
      //z = parseFloat(atomData[i].substring(31, 40).trim());
      
      //atomType = atomData[i].substring(40, 49).trim();
      //resID = atomData[i].substring(49, 54).trim();
      atomName = tmp[1];
      x = parseFloat(tmp[2]);
      y = parseFloat(tmp[3]);
      z = parseFloat(tmp[4]);
      
      atomType = tmp.length > 5 ? tmp[5] : "";
      resID = tmp.length > 5 ? tmp[6] : "";
      
      if (resID != prev_resid) {
        currentChain.molecules.push(currentMol = new molmil.molObject(molmil_dep.getKeyFromObject(subStructs, resID, resID), resID, currentChain));
        currentMol.MID = this.MID++;
        prev_resid = resID;
      }
      
      Xpos = currentChain.modelsXYZ[0].length;
      currentChain.modelsXYZ[0].push(x, y, z);
      
      if (atomType.indexOf(".") == -1) {
        if (molmil.AATypes.hasOwnProperty(currentMol.name.substr(0, 3))) {
          for (offset=0; offset<atomName.length; offset++) if (! molmil_dep.isNumber(atomName[offset])) break;
          if (atomName.length > 1 && ! molmil_dep.isNumber(atomName[1]) && atomName[1] == atomName[1].toLowerCase()) atomType = atomName.substring(offset, offset+2);
          else atomType = atomName.substring(offset, offset+1);
        }
        else {
          atomType = "";
          for (offset=0; offset<atomName.length; offset++) {
            if (molmil_dep.isNumber(atomName[offset])) {
              if (atomType.length) break;
              else continue;
            }
            atomType += atomName[offset];
          }
          if (atomType.length == 2) {
            atomType = atomType[0].toUpperCase() + atomType[1].toLowerCase();
            if (! molmil.configBox.vdwR.hasOwnProperty(atomType)) atomType = atomType[0];
            if (["C", "N", "O", "H", "S"].includes(atomType.substr(0,1)) && ["a", "b", "g", "d", "e", "z"].includes(atomType.substr(1,1))) atomType = atomType.substr(0,1);
          }
          else atomType = atomType[0].toUpperCase();
        }
      }
      else atomType = atomType.split(".")[0];
      
      currentMol.atoms.push(atom=new molmil.atomObject(Xpos, atomName, atomType, currentMol, currentChain));
      currentChain.atoms.push(atom);
      refmap[tmp[0]] = atom;
      if (atom.element == "H") atom.display = this.showHydrogens;
      else atom.display = true;
      atom.Bfactor = parseFloat(tmp[8]);
      
      atom.AID = this.AID++;
      this.atomRef[atom.AID] = atom;
    }

    for (i=0; i<bondData.length; i++) {
      if (! bondData[i]) continue;
      tmp = bondData[i].split(/[ ,\t]+/);
      if (tmp[3] == "ar") tmp[3] = 2;
      if (tmp[3] == "am") tmp[3] = 1;
      bt = parseInt(tmp[3]);
      currentChain.bonds.push([refmap[tmp[1]], refmap[tmp[2]], bt]);
    }
    currentChain.bondsOK = true;
  
    this.chains.push(currentChain);
    molmil.resetColors(struc, this);
  }
  
  this.calculateCOG();

  return strucs;
};

// ** loads MDL MOL data **
molmil.viewer.prototype.load_mdl3000 = function(data, filename) {
  var name = data[0].trim() || filename, offset = 0, struc;
  this.structures.push(struc = new molmil.entryObject({id: filename}));
  
  struc.chains.push(currentChain = new molmil.chainObject("", struc));
  currentChain.CID = this.CID++;
  
  currentChain.molecules.push(currentMol = new molmil.molObject(name, 1, currentChain));
  currentMol.MID = this.MID++;
  
  var i, mode = 0, tmp, atomList = {}, a1, a2;
  for (i=0; i<data.length; i++) {
    if (data[i] == "M V30 BEGIN ATOM") mode = 1;
    else if (data[i] == "M V30 END ATOM") mode = 0;
    else if (data[i] == "M V30 BEGIN BOND") mode = 2;
    else if (data[i] == "M V30 END BOND") mode = 0;
    else if (mode == 1) {
      tmp = data[i].split(" ");
      x = parseFloat(tmp[4]);
      y = parseFloat(tmp[5]);
      z = parseFloat(tmp[6]);
      element = tmp[3];
      
      if (atomList[element] === undefined) atomList[element] = 1;
      else atomList[element]++;
      
      Xpos = currentChain.modelsXYZ[0].length;
      currentChain.modelsXYZ[0].push(x, y, z);
      currentMol.atoms.push(atom=new molmil.atomObject(Xpos, element+atomList[element], element, currentMol, currentChain));
      currentChain.atoms.push(atom);
      if (atom.element == "H") atom.display = this.showHydrogens;
      else atom.display = true;
    
      atom.AID = this.AID++;
      this.atomRef[atom.AID] = atom;
    }
    else if (mode == 2) {
      tmp = data[i].split(" ");
      bt = parseInt(tmp[3]);
      a1 = parseInt(tmp[4])-1;
      a2 = parseInt(tmp[5])-1;
      currentChain.bonds.push([currentMol.atoms[a1], currentMol.atoms[a2], bt]);
    }
  }

  this.calculateCOG();
  
  molmil.resetColors(struc, this);

  return struc;
}

// ** loads MDL MOL data **
molmil.viewer.prototype.load_mdl = function(data, filename) {
  data = data.split("\n");
  if (data[3].trim().endsWith("V3000")) return this.load_mdl3000(data, filename)
  var name = data[0].trim() || filename, offset = 0, struc;
  this.structures.push(struc = new molmil.entryObject({id: filename}));

  while (true) {
    if (offset+3 >= data.length) break;

    var noa = parseInt(data[offset+3].substr(0,3).trim()), nob = parseInt(data[offset+3].substr(3,5).trim()), i, struc, currentChain, currentMol, x, y, z, Xpos, element, a1, a2, bt;
  
    struc.chains.push(currentChain = new molmil.chainObject("", struc));
    currentChain.CID = this.CID++;
  
    currentChain.molecules.push(currentMol = new molmil.molObject(name, 1, currentChain));
    currentMol.MID = this.MID++;
  
    var atomList = {};
  
    for (i=4; i<noa+4; i++) {
      x = parseFloat(data[offset+i].substring(0, 11).trim())
      y = parseFloat(data[offset+i].substring(11, 21).trim())
      z = parseFloat(data[offset+i].substring(21, 31).trim())
      element = data[offset+i].substring(31, 35).trim();
    
      if (atomList[element] === undefined) atomList[element] = 1;
      else atomList[element]++
    
      Xpos = currentChain.modelsXYZ[0].length;
      currentChain.modelsXYZ[0].push(x, y, z);
      currentMol.atoms.push(atom=new molmil.atomObject(Xpos, element+atomList[element], element, currentMol, currentChain));
      currentChain.atoms.push(atom);
      if (atom.element == "H") atom.display = this.showHydrogens;
      else atom.display = true;
    
      atom.AID = this.AID++;
      this.atomRef[atom.AID] = atom;
    }
  
    for (i=noa+4; i<noa+4+nob; i++) {
      a1 = parseInt(data[offset+i].substr(0,3).trim())-1;
      a2 = parseInt(data[offset+i].substr(3,3).trim())-1;
      bt = parseInt(data[offset+i].substr(8,1).trim());
      currentChain.bonds.push([currentMol.atoms[a1], currentMol.atoms[a2], bt]);
    }
    currentChain.bondsOK = true;
  
    this.chains.push(currentChain);

    offset += 3+noa+nob;
    
    if (filename.endsWith(".sdf") || filename.endsWith(".sdf.gz")) {
      while (true) {
        offset++;
        try {if (data[offset].trim() == "$$$$") break;}
        catch (e) {break;}
      }
      offset+=1;
    }
    else {
      while (true) {
        offset++;
        try {if (data[offset].trim() == "M  END") break;}
        catch (e) {break;}
      }
      offset+=2;
    }
  }
  
  this.calculateCOG();
  
  molmil.resetColors(struc, this);
  
  return struc;
  
};

// ** loads GRO data **
molmil.viewer.prototype.load_GRO = function(data, filename) {
  data = data.trim().split("\n");
  var currentChain = null; var ccid = null; var currentMol = null; var cmid = null; var atom, i;
  
  var chainName, molID, atomName, molName, x, y, z, offset, element, mat, temp, begin_cid, begin_mid, end_cid, end_mid, c;
  
  var helixData = [];
  var sheetData = [];
  var newModels = [];
  
  var struc = null, Xpos, tmp;

  this.structures.push(struc = new molmil.entryObject({id: filename}));
  
  chainName = "";
  struc.chains.push(currentChain = new molmil.chainObject(chainName, struc));
  currentChain.CID = this.CID++;
  ccid = chainName; cmid = null;
  
  struc.meta.cellLengths = data[data.length-1].trim().split(/[ ,]+/).map(function(x) {return parseFloat(x)*10;});
  struc.meta.cellOrigins = [0.0, 0.0, 0.0];

  for (i=2; i<data.length-1; i++) {
   
    molID = data[i].substring(0, 5).trim();
    atomName = data[i].substring(11, 15).trim();
    molName = data[i].substring(5, 11).trim();
    
    x = parseFloat(data[i].substring(20, 28).trim())*10;
    y = parseFloat(data[i].substring(28, 36).trim())*10;
    z = parseFloat(data[i].substring(36, 44).trim())*10;
    // not really correct...
    if (molID != cmid) {
      
      currentMol = new molmil.molObject(molName, molID, currentChain);
      if (currentMol.name == "HOH" || currentMol.name == "DOD" || currentMol.name == "WAT" || currentMol.name == "SOL") {
        currentMol.water = true; currentMol.ligand = false;
        currentChain.display = this.showWaters;
        if (currentChain.molecules.length && ! currentChain.molecules[currentChain.molecules.length-1].water) {
          struc.chains.push(currentChain = new molmil.chainObject(chainName, struc));
          currentChain.CID = this.CID++;
          currentChain.water = true;
        }
      }
      else if (currentChain.molecules.length && currentChain.molecules[currentChain.molecules.length-1].water) struc.chains.push(currentChain = new molmil.chainObject(chainName, struc));
      currentChain.CID = this.CID++;
      currentMol.chain = currentChain;
      currentChain.molecules.push(currentMol);
      currentMol.MID = this.MID++;
      cmid = molID;
      //if (molName = "SOL" || molName == "WAT") currentMol.display = false;
    }
    
    if (molmil.AATypes.hasOwnProperty(currentMol.name.substr(0, 3))) {
      for (offset=0; offset<atomName.length; offset++) if (! molmil_dep.isNumber(atomName[offset])) break;
      if (atomName.length > 1 && ! molmil_dep.isNumber(atomName[1]) && atomName[1] == atomName[1].toLowerCase()) element = atomName.substring(offset, offset+2);
      else element = atomName.substring(offset, offset+1);
    }
    else {
      element = "";
      for (offset=0; offset<atomName.length; offset++) {
        if (molmil_dep.isNumber(atomName[offset])) {
          if (element.length) break;
          else continue;
        }
        element += atomName[offset];
      }
      if (element.length == 2) {
        element = element[0].toUpperCase() + element[1].toLowerCase();
        if (! molmil.configBox.vdwR.hasOwnProperty(element)) element = element[0];
        if (["C", "N", "O", "H", "S"].includes(element.substr(0,1)) && ["a", "b", "g", "d", "e", "z"].includes(element.substr(1,1))) element = element.substr(0,1);
      }
      else element = element[0].toUpperCase();
    }
    
    Xpos = currentChain.modelsXYZ[0].length;
    currentChain.modelsXYZ[0].push(x, y, z);
    currentMol.atoms.push(atom=new molmil.atomObject(Xpos, atomName, element, currentMol, currentChain));
    if (atom.element == "H") atom.display = this.showHydrogens;
    else atom.display = true;
   
    if (atom.atomName == "N") {currentMol.N = atom; currentMol.ligand = false;}
    else if (atom.atomName == "CA" || atom.atomName == "CA") {currentMol.CA = atom; currentMol.ligand = false;}
    else if (atom.atomName == "C") {currentChain.isHet = false; currentMol.C = atom; currentMol.ligand = false;}
    else if (atom.atomName == "O") {currentMol.O = atom; currentMol.ligand = false;}
    else if (atom.atomName == "P") {currentMol.P = atom; currentMol.N = atom;}
    else if (atom.atomName == "C1'") {currentChain.isHet = false; currentMol.CA = atom; currentMol.xna = true; currentMol.ligand = false;}
    else if (atom.atomName == "O3'") {currentMol.C = atom; currentMol.xna = true; currentMol.ligand = false;}
    if (atom.element == "H" || atom.element == "D") atom.display = false;
    currentChain.atoms.push(atom);
    atom.AID = this.AID++;
    this.atomRef[atom.AID] = atom;
  }
  
  var c, m, mol;
  for (c=0; c<struc.chains.length; c++) {
    for (m=0; m<struc.chains[c].molecules.length; m++) {
      mol = struc.chains[c].molecules[m];
      if (mol.xna) {
        if (m == 0 && ! mol.P && mol.CA && mol.C && struc.chains[c].molecules.length > 1 && struc.chains[c].molecules[1].xna) {}
        else if ((! mol.CA || ! mol.C)) {
          mol.ligand = true;
          delete mol.P; delete mol.CA; delete mol.C;
          mol.xna = false;
        }
      }
      else if ((! mol.CA || ! mol.N || ! mol.O) && ! molmil.AATypes.hasOwnProperty(mol.name)) {
        mol.ligand = true;
        delete mol.CA; delete mol.N; delete mol.O;
      }
    }
  }
  
  this.processStrucLoader(struc);
  
  return struc;
};

// ** loads PDB data **
molmil.viewer.prototype.load_PDB = function(data, filename) {
  var currentChain = null; var ccid = null; var currentMol = null; var cmid = null; var atom, i;
  var data = data.split("\n");
  
  var chainName, molID, atomName, molName, x, y, z, offset, element, mat, temp, begin_cid, begin_mid, end_cid, end_mid, c, bf;
  
  var helixData = [];
  var sheetData = [];
  var newModels = [];
  
  var struc = null, Xpos, cmnum, strucs = [], CAonly = true, Ponly = true;
  
  for (i=0; i<data.length; i++) {
    if ((data[i].substring(0,5) == "MODEL" && currentChain) || ! struc) {
      if (struc && ! molmil.configBox.loadModelsSeparately) break;
      this.structures.push(struc = new molmil.entryObject({id: filename})); strucs.push(struc);
      cmnum = data[i].substr(5).trim();
      ccid = cmid = null;
    }
    if (data[i].substring(0,5) == "MODEL" && struc) struc.meta.modelnr = data[i].substr(5).trim();
    if (data[i].substring(0, 4) == "ATOM" || data[i].substring(0, 6) == "HETATM") {
      chainName = data[i].substring(20, 22).trim();
      molID = data[i].substring(22, 28).trim();
      atomName = data[i].substring(11, 16).trim();
      molName = data[i].substring(17, 20).trim();
      
      x = parseFloat(data[i].substring(30, 38).trim());
      y = parseFloat(data[i].substring(38, 46).trim());
      z = parseFloat(data[i].substring(46, 54).trim());
      
      if (chainName != ccid) {
        this.chains.push(currentChain = new molmil.chainObject(chainName, struc)); struc.chains.push(currentChain);
        currentChain.CID = this.CID++;
        ccid = chainName; cmid = null;
      }
      if (molID != cmid) {
        currentMol = new molmil.molObject(molName, molID, currentChain);
        if (currentMol.name == "HOH" || currentMol.name == "DOD" || currentMol.name == "WAT" || currentMol.name == "SOL" || currentMol.name == "TIP3") {
          currentMol.water = true; currentMol.ligand = false;
          currentChain.display = this.showWaters;
          if (currentChain.molecules.length && ! currentChain.molecules[currentChain.molecules.length-1].water) {
            struc.chains.push(currentChain = new molmil.chainObject(chainName, struc));
            currentChain.CID = this.CID++;
            currentChain.water = true;
          }
        }
        else if (currentChain.molecules.length && currentChain.molecules[currentChain.molecules.length-1].water) {
          struc.chains.push(currentChain = new molmil.chainObject(chainName, struc));
          currentChain.CID = this.CID++;
        }
        currentMol.chain = currentChain;
        currentChain.molecules.push(currentMol);
        currentMol.MID = this.MID++;
        cmid = molID;
        if (currentMol.name in molmil.SNFG) currentMol.SNFG = true;
      }
      
      if (data[i].length >= 76) {
        element = data[i].substr(76).trim().split(" ")[0].replace("1+", "").replace("1-", "");
      }
      else element = undefined;
      if (! element) {
        if (molmil.AATypes.hasOwnProperty(currentMol.name.substr(0, 3))) {
          for (offset=0; offset<atomName.length; offset++) if (! molmil_dep.isNumber(atomName[offset])) break;
          if (atomName.length > 1 && ! molmil_dep.isNumber(atomName[1]) && atomName[1] == atomName[1].toLowerCase()) element = atomName.substring(offset, offset+2);
          else element = atomName.substring(offset, offset+1);
        }
        else {
          element = "";
          for (offset=0; offset<atomName.length; offset++) {
            if (molmil_dep.isNumber(atomName[offset])) {
              if (element.length) break;
              else continue;
            }
            element += atomName[offset];
          }
          if (element.length == 2) {
            element = element[0].toUpperCase() + element[1].toLowerCase();
            if (! molmil.configBox.vdwR.hasOwnProperty(element)) element = element[0];
          }
          else element = element[0].toUpperCase();
        }
      }
      
      Xpos = currentChain.modelsXYZ[0].length;
      currentChain.modelsXYZ[0].push(x, y, z);
      
      currentMol.atoms.push(atom=new molmil.atomObject(Xpos, atomName, element, currentMol, currentChain));
      if (atom.element == "H") atom.display = this.showHydrogens;
      else atom.display = true;
      if (data[i].length >= 66) atom.Bfactor = parseFloat(data[i].substring(60, 66).trim());

      if (atom.atomName == "N") {currentMol.N = atom; currentMol.ligand = false;}
      else if (atom.atomName == "CA" || atom.atomName == "CH3") {currentChain.isHet = false; currentMol.CA = atom; currentMol.ligand = false;}
      else if (atom.atomName == "C") {currentChain.isHet = false; currentMol.C = atom; currentMol.ligand = false;}
      else if (atom.atomName == "O") {currentMol.O = atom; currentMol.ligand = false;}
      else if (atom.atomName == "P") {currentChain.isHet = false; currentMol.P = atom; currentMol.N = atom;}
      else if (atom.atomName == "C1'") {currentChain.isHet = false; currentMol.CA = atom; currentMol.xna = true; currentMol.ligand = false;}
      else if (atom.atomName == "O3'") {currentMol.C = atom; currentMol.xna = true; currentMol.ligand = false;}
      if (CAonly && currentMol.CA != atom) CAonly = false;
      if (Ponly && currentMol.P != atom) Ponly = false;

      currentChain.atoms.push(atom);
      atom.AID = this.AID++;
      this.atomRef[atom.AID] = atom;
    }
  }
  
  var c, m, mol;
  if (! CAonly && ! Ponly) {
    for (c=0; c<struc.chains.length; c++) {
      for (m=0; m<struc.chains[c].molecules.length; m++) {
        mol = struc.chains[c].molecules[m];
        if (mol.xna) {
          if (m == 0 && ! mol.P && mol.CA && mol.C && struc.chains[c].molecules.length > 1 && struc.chains[c].molecules[1].xna) {}
          else if ((! mol.CA || ! mol.C) && ! (mol.name in molmil.AATypes)) {
            mol.ligand = true;
            delete mol.P; delete mol.CA; delete mol.C;
            mol.xna = false;
          }
        }
        else if ((! mol.CA || ! mol.N || ! mol.O) && ! molmil.AATypes.hasOwnProperty(mol.name)) {
          mol.ligand = true;
          delete mol.CA; delete mol.N; delete mol.O;
        }
      }
    }
  }
  else if (Ponly) {
    for (c=0; c<struc.chains.length; c++) {
      for (m=0; m<struc.chains[c].molecules.length; m++) {
        mol = struc.chains[c].molecules[m];
        mol.CA = mol.P;
        mol.xna = true;
        mol.ligand = false;
        delete mol.P;
        delete mol.N;
      }
    }
  }
  
  var cid = 0, xyzs;
  
  for (; i<data.length; i++) {
    if (data[i].substring(0,5) == "MODEL") {
      for (cid=0; cid<struc.chains.length; cid++) struc.chains[cid].modelsXYZ.push([]);
      cid = 0;
      xyzs = struc.chains[cid].modelsXYZ.slice(-1)[0];
      N = struc.chains[cid].modelsXYZ[0].length;
    }
    if (data[i].substring(0, 4) == "ATOM" || data[i].substring(0, 6) == "HETATM") {
      if (xyzs.length >= N) {
        cid++;
        xyzs = struc.chains[cid].modelsXYZ.slice(-1)[0];
        N = struc.chains[cid].modelsXYZ[0].length;
      }
      x = parseFloat(data[i].substring(30, 38).trim());
      y = parseFloat(data[i].substring(38, 46).trim());
      z = parseFloat(data[i].substring(46, 54).trim());
      xyzs.push(x, y, z);
    }
  }
  
  struc.number_of_frames = struc.chains.length ? struc.chains[0].modelsXYZ.length : 0;

  for (var s=0; s<strucs.length; s++) this.processStrucLoader(strucs[s]);

  return strucs;
};

molmil.viewer.prototype.processStrucLoader = function(struc) {
  var newChains = {}, chainRef, rC, m1;
  
  // add some functionality to better deal with weird amino acids (i.e. build some way to detect and show a continuous chain...)
  for (c=0; c<struc.chains.length; c++) this.buildMolBondList(struc.chains[c]);
  
  for (c=0; c<struc.chains.length; c++) {
    currentChain = struc.chains[c];
    if (currentChain.water) {
      for (m1=0; m1<currentChain.molecules.length; m1++) currentChain.molecules[m1].chain_alt = currentChain.molecules[m1].chain;
      continue;
    };
    chainRef = currentChain, rC = currentChain.molecules.length;
    for (m1=0; m1<rC; m1++) {
      currentChain.molecules[m1].chain_alt = currentChain.molecules[m1].chain;
      currentChain.molecules[m1].chain = chainRef;
      if (!molmil.configBox.skipChainSplitting && ((! currentChain.molecules[m1].next && m1 < rC-1) || (! currentChain.molecules[m1].previous && m1 != 0)) && 
           (! (currentChain.molecules[m1].water || currentChain.molecules[m1].ligand) || (m1 && currentChain.molecules[m1-1].name != currentChain.molecules[m1].name) )
         ) {
            chainRef = new molmil.chainObject(molmil_dep.Strip(chainRef.name), chainRef.entry); chainRef.isHet = false;
            chainRef.CID = this.CID++;
            if (! newChains.hasOwnProperty(currentChain.CID)) newChains[currentChain.CID] = [currentChain];
            newChains[currentChain.CID].push(chainRef);
            if (! currentChain.molecules[m1].previous) currentChain.molecules[m1].chain = chainRef;
         }
      else if (currentChain.molecules[m1].ligand && (currentChain.molecules[m1].next || currentChain.molecules[m1].previous)) {
        currentChain.molecules[m1].weirdAA = true;
        currentChain.molecules[m1].ligand = false;
      }
    }
  }
  
  if (Object.keys(newChains).length) {
    for (c in newChains) {
      var pidx = struc.chains.indexOf(newChains[c][0]);
      for (m1=1; m1<newChains[c].length; m1++) {
        struc.chains.splice(pidx+m1, 0, newChains[c][m1])
      }
    }
    
    Array.prototype.push.apply(struc.chains, newChains);
    var tmp = [], Nmodels = 0;
    for (c=0; c<struc.chains.length; c++) if (struc.chains[c].modelsXYZ.length > Nmodels) Nmodels = struc.chains[c].modelsXYZ.length;
    for (c=0; c<struc.chains.length; c++) {
      struc.chains[c].name = (c+1)+"";
      for (m1 of struc.chains[c].molecules) tmp.push(m1);
      struc.chains[c].molecules = [];
      struc.chains[c].modelsXYZ_old = struc.chains[c].modelsXYZ; struc.chains[c].modelsXYZ = [];
      for (m1=0; m1<Nmodels; m1++) struc.chains[c].modelsXYZ.push([]);
      struc.chains[c].atoms = [];
    }
    for (m1=0; m1<tmp.length; m1++) {
      tmp[m1].chain.molecules.push(tmp[m1]);
      for (i=0; i<tmp[m1].atoms.length; i++) {
        atom = tmp[m1].atoms[i].xyz;
        for (c=0; c<tmp[m1].chain_alt.modelsXYZ_old.length; c++) tmp[m1].chain.modelsXYZ[c].push(tmp[m1].chain_alt.modelsXYZ_old[c][atom], tmp[m1].chain_alt.modelsXYZ_old[c][atom+1], tmp[m1].chain_alt.modelsXYZ_old[c][atom+2]);
        tmp[m1].atoms[i].xyz = tmp[m1].chain.modelsXYZ[0].length-3;
        tmp[m1].atoms[i].chain = tmp[m1].chain; 
      }
      Array.prototype.push.apply(tmp[m1].chain.atoms, tmp[m1].atoms);
      delete tmp[m1].chain_alt;
    }
    
    for (c=0; c<struc.chains.length; c++) delete struc.chains[c].modelsXYZ_old;
    
    for (c=0; c<struc.chains.length; c++) {
      if (struc.chains[c].molecules.length == 0) {struc.chains.splice(c, 1); c--; continue;}
      if (struc.chains[c].molecules[0].water || struc.chains[c].molecules[0].ligand) {
        struc.chains[c].name = (struc.chains[c].name ? struc.chains[c].name+" - " : "") + struc.chains[c].molecules[0].name;
        struc.chains[c].isHet = true;
        if (struc.chains[c].modelsXYZ[0].length > molmil.configBox.chainHideCutoff) struc.chains[c].display = false; // more than 100 atoms
        else struc.chains[c].display = true;
      }
      else struc.chains[c].display = true;
    }
  }

  for (c=0; c<struc.chains.length; c++) {
    this.chains.push(struc.chains[c]);
    var chain = struc.chains[c];
    chain.molWeight = 0.0;
    for (a=0; a<chain.atoms.length; a++) chain.molWeight += molmil.configBox.MW[chain.atoms[a].element] || 0;
  }
  
  for (c=0; c<struc.chains.length; c++) this.ssAssign(struc.chains[c]);
  
  molmil.resetColors(struc, this);
  
  this.calculateCOG();
}


// ** loads MMTF data ***
molmil.viewer.prototype.load_MMTF = function(data, filename) {
  var mmtf_tempStorage, polyTypes = {}, soup = this;
  
  var mmtf_onModel = function(modelData) {
    mmtf_tempStorage.struc = new molmil.entryObject({id: mmtf_tempStorage.structureId})
    mmtf_tempStorage.structures.push(mmtf_tempStorage.struc);
    mmtf_tempStorage.soup.structures.push(mmtf_tempStorage.struc);
  }
    
  var mmtf_onChain = function(chainData) {
    mmtf_tempStorage.currentChain = new molmil.chainObject(chainData.chainId, mmtf_tempStorage.struc);
    mmtf_tempStorage.struc.chains.push(mmtf_tempStorage.currentChain);
    mmtf_tempStorage.currentChain.authName = chainData.chainName;
    mmtf_tempStorage.currentChain.CID = mmtf_tempStorage.soup.CID++; 
    mmtf_tempStorage.currentChain.bondsOK = true;
  }
    
  var mmtf_onGroup = function(groupData) {
    var currentMol = mmtf_tempStorage.currentMol = new molmil.molObject(groupData.groupName, groupData.groupId, mmtf_tempStorage.currentChain);
    mmtf_tempStorage.currentChain.molecules.push(currentMol);
    currentMol.RSID = groupData.groupId;
    currentMol.MID = mmtf_tempStorage.soup.MID++;
      
    //mmtf_tempStorage.currentMol.sndStruc = {0: 4, 1: 4, 2: 3, 3: 2, 4: 4, 5: 1, 6: 4, 7: 1, "-1": 1}[groupData.secStruct]; // <-- what is the mapping???
    mmtf_tempStorage.currentMol.sndStruc = {0: 1, 1: 1, 2: 3, 3: 2, 1: 3, 5: 1, 6: 1, 7: 1, "-1": 1}[groupData.secStruct]; // <-- what is the mapping???
    /*
0	pi helix
1	bend
2	alpha helix
3	extended
4	3-10 helix
5	bridge
6	turn
7	coil
-1	undefined
    */
    if (groupData.chemCompType == "NON-POLYMER") {
      if (currentMol.name == "HOH" || currentMol.name == "DOD" || currentMol.name == "WAT") {currentMol.water = true; currentMol.ligand = false;}
      else mmtf_tempStorage.currentChain.isHet = true;
    }
    else {
      mmtf_tempStorage.currentChain.isHet = false;
      mmtf_tempStorage.currentMol.ligand = false;
    }
  }

  var mmtf_onAtom = function(atomData) {
    var currentMol = mmtf_tempStorage.currentMol;
    var currentChain = mmtf_tempStorage.currentChain;
    var atom = new molmil.atomObject(mmtf_tempStorage.currentChain.modelsXYZ[0].length, atomData.atomName, atomData.element, currentMol, currentChain);
      
    currentChain.modelsXYZ[0].push(atomData.xCoord, atomData.yCoord, atomData.zCoord);
    currentMol.atoms.push(atom);
      
    atom.display = true;
    if (atom.element == "H") atom.display = mmtf_tempStorage.soup.showHydrogens;
    atom.label_alt_id = atomData.altLoc;
    if (atom.label_alt_id == "\0") atom.label_alt_id = ""
    if (atom.label_alt_id && atom.label_alt_id != "A") atom.display = false;
    if (currentMol.water) atom.display = mmtf_tempStorage.soup.showWaters;
    if (! currentMol.ligand) {
      if (atom.atomName == "N") currentMol.N = atom;
      else if (atom.atomName == "CA") currentMol.CA = atom;
      else if (atom.atomName == "C") currentMol.C = atom;
      else if (atom.atomName == "O") {currentMol.O = atom; currentMol.xna = false;}
      //do special stuff for dna/rna
      else if (atom.atomName == "P" && ! currentMol.O) {currentMol.P = atom; currentMol.N = atom; currentMol.xna = true; if (! currentMol.CA) {currentMol.CA = atom;}}
      else if (atom.atomName == "C1'" && ! currentMol.O) {currentMol.CA = atom; currentMol.xna = true;}
      else if (atom.atomName == "O3'" && ! currentMol.O) {currentMol.C = atom; currentMol.xna = true;}
    }
      
    // do the currentMol setting stuff in onGroup instead...
    currentChain.atoms.push(atom);
    atom.AID = mmtf_tempStorage.soup.AID++;
    mmtf_tempStorage.soup.atomRef[atom.AID] = atom;
    mmtf_tempStorage.localAR[atomData.atomIndex] = atom;
  }

  var mmtf_onBond = function (bondData) {
    var a1 = mmtf_tempStorage.localAR[bondData.atomIndex1];
    var a2 = mmtf_tempStorage.localAR[bondData.atomIndex2];
    a1.chain.bonds.push([a1, a2, bondData.bondOrder]);
    if (! a1.chain.isHet && a1.molecule != a2.molecule) {
      if (a1.atomName == "N") {
        a1.molecule.previous = a2.molecule;
        a2.molecule.next = a1.molecule;
      }
      else {
        a2.molecule.previous = a1.molecule;
        a1.molecule.next = a2.molecule;
      }
    }
  }
    
  try {
    for (var i=0; i<pdb.chem_comp.id.length; i++) if (pdb.chem_comp.mon_nstd_flag[i] || pdb.chem_comp.type[i].toLowerCase().indexOf("peptide") != -1) polyTypes[  pdb.chem_comp.id[i]] = true;
    polyTypes.ACE = polyTypes.NME = true;
  }
  catch (e) {polyTypes = molmil.AATypes;}

  var mmtfData = MMTF.decode(data);    
  mmtf_tempStorage = {soup: soup, structures: [], polyTypes: polyTypes, structureId: mmtfData.structureId, localAR: {}}; // isCC???
  MMTF.traverse(mmtfData, {onModel: mmtf_onModel, onChain: mmtf_onChain, onGroup: mmtf_onGroup, onAtom: mmtf_onAtom, onBond: mmtf_onBond});
            
  mmtf_tempStorage.structures[0].number_of_frames = mmtf_tempStorage.structures[0].chains.length ? mmtf_tempStorage.structures[0].chains[0].modelsXYZ.length : 0;

  soup.calculateCOG();
  molmil.resetColors(mmtf_tempStorage.structures, soup);

  return mmtf_tempStorage.structures[0];
}

// ** end MMTF **
    
// ** loads polygon-JSON data **
molmil.viewer.prototype.load_polygonJSON = function(jso, filename, settings) { // this should be modified to use the modern renderer function instead
  settings = settings || {};
  
  var vertices = jso.vertices || [], triangles_lists = jso.triangles_lists || [], lines_lists = jso.lines_lists || [], lineVertices = [], triangleVertices = [], tmp;
  var COR = [0, 0, 0, 0];
  
  if (jso.hasOwnProperty("vertices2")) {
    for (var i=0; i<jso.vertices2.length; i++) jso.vertices2[i].splice(3, 0, 0, 0, 0);
    Array.prototype.push.apply(vertices, jso.vertices2);
  }
  
  for (var i=0, j; i<triangles_lists.length; i++) {
    tmp = [];
    for (j=0; j<triangles_lists[i].length; j++) tmp.push(triangles_lists[i][j][0], triangles_lists[i][j][1], triangles_lists[i][j][2]);
    if (tmp.length) triangleVertices.push(tmp.unique());
  }
  for (var i=0; i<lines_lists.length; i++) {
    tmp = [];
    for (j=0; j<lines_lists[i].length; j++) tmp.push(lines_lists[i][j][0], lines_lists[i][j][1]);
    if (tmp.length) {
      tmp.unique();
      lineVertices.push(tmp);
    }
  }
  
  for (var i=0; i<vertices.length; i++) {
    COR[0] += vertices[i][0]; COR[1] += vertices[i][1]; COR[2] += vertices[i][2]; COR[3] += 1;
    vertices[i][6] *= 255; vertices[i][7] *= 255; vertices[i][8] *= 255;
  }
  
  var nov_l = 0, noi_l = 0, i, j, nov_t = 0, noi_t = 0;
  
  for (i=0; i<triangleVertices.length; i++) {
    nov_t += triangleVertices[i].length;
    noi_t += triangles_lists[i].length;
  }
  
  for (i=0; i<lineVertices.length; i++) {
    nov_l += lineVertices[i].length;
    noi_l += lines_lists[i].length;
  }
  
  if (! nov_l && ! nov_t) return null;
  
  var struct = new molmil.polygonObject({filename: filename, COR: COR}); this.structures.push(struct);
  
  this.processPolygon3D(struct, vertices, nov_l, noi_l, lineVertices, lines_lists, nov_t, noi_t, triangleVertices, triangles_lists, settings);

  this.renderer.initBD = true;
  
  return struct;
};

// ** builds a render object for polygon data (xml/json) **
molmil.viewer.prototype.processPolygon3D = function(struct, vertices, nov_l, noi_l, lineVertices, lines_lists, nov_t, noi_t, triangleVertices, triangles_lists, settings) {
  var program, vbuffer, ibuffer, gl = this.renderer.gl;
  var i, j, vP, vP8, vertex, iP, vertexMap = {};

  var alpha = settings.alpha || 255;

  if (nov_l) {
    var lineVertexData = new Float32Array(nov_l*4), lineVertexData8 = new Uint8Array(lineVertexData.buffer);
    if (molmil.configBox.OES_element_index_uint) var lineIndexData = new Uint32Array(noi_l*2);
    else var lineIndexData = new Uint16Array(noi_l*2);
  
    for (i=0, vP=0, iP=0, vP8=0; i<lineVertices.length; i++) {
      for (j=0; j<lineVertices[i].length; j++, vP8+=16) {
        vertexMap[lineVertices[i][j]] = vP/4;
        vertex = vertices[lineVertices[i][j]];

        lineVertexData[vP++] = vertex[0];
        lineVertexData[vP++] = vertex[1];
        lineVertexData[vP++] = vertex[2];
      
        lineVertexData8[vP8+12] = vertex[6];
        lineVertexData8[vP8+13] = vertex[7];
        lineVertexData8[vP8+14] = vertex[8];
        lineVertexData8[vP8+15] = 255; //transparency???
        vP++;
      }
    
      for (j=0; j<lines_lists[i].length; j++) {
        lineIndexData[iP++] = vertexMap[lines_lists[i][j][0]];
        lineIndexData[iP++] = vertexMap[lines_lists[i][j][1]];
      }
    }
    
    program = molmil.geometry.build_simple_render_program(lineVertexData, lineIndexData, this.renderer, {lines_render: true});
    this.renderer.addProgram(program);
    struct.programs.push(program);
  }
  
  if (nov_t) {
    
    var triangleVertexData = new Float32Array(nov_t*7), triangleVertexData8 = new Uint8Array(triangleVertexData.buffer);
    if (molmil.configBox.OES_element_index_uint) var triangleIndexData = new Uint32Array(noi_t*3); 
    else var triangleIndexData = new Uint16Array(noi_t*3);
    vertexMap = {};
    
    if (molmil.configBox.skipClearGeometryBuffer) {
      struct.data = struct.data || {};
      struct.data.vertexBuffer = triangleVertexData;
      struct.data.indexBuffer = triangleIndexData;
      struct.data.vertexSize = 7;
    }
  
    for (i=0, vP=0, iP=0, vP8=0; i<triangleVertices.length; i++) {
      for (j=0; j<triangleVertices[i].length; j++, vP8+=28) {
        vertexMap[triangleVertices[i][j]] = vP/7;
        vertex = vertices[triangleVertices[i][j]];

        triangleVertexData[vP++] = vertex[0];
        triangleVertexData[vP++] = vertex[1];
        triangleVertexData[vP++] = vertex[2];
        
        triangleVertexData[vP++] = vertex[3];
        triangleVertexData[vP++] = vertex[4];
        triangleVertexData[vP++] = vertex[5];
      
        triangleVertexData8[vP8+24] = vertex[6];
        triangleVertexData8[vP8+25] = vertex[7];
        triangleVertexData8[vP8+26] = vertex[8];
        triangleVertexData8[vP8+27] = alpha;
        vP++;
      }
    
      for (j=0; j<triangles_lists[i].length; j++) {
        triangleIndexData[iP++] = vertexMap[triangles_lists[i][j][0]];
        triangleIndexData[iP++] = vertexMap[triangles_lists[i][j][1]];
        triangleIndexData[iP++] = vertexMap[triangles_lists[i][j][2]];
      }
    }
    program = molmil.geometry.build_simple_render_program(triangleVertexData, triangleIndexData, this.renderer, {solid: true, alphaMode: alpha != 255});
    this.renderer.addProgram(program);
    struct.programs.push(program);
  }
  
  this.renderer.initBD = true;
  
  this.calculateCOG();
  if (molmil.geometry.onGenerate) molmil_dep.asyncStart(molmil.geometry.onGenerate[0], molmil.geometry.onGenerate[1], molmil.geometry.onGenerate[2], 0);
}

// ** loads polygon-XML data **
molmil.viewer.prototype.load_polygonXML = function(xml, filename, settings) {
  if (typeof xml == "string") {
    var parser = new DOMParser();
    xml = parser.parseFromString(xml, "text/xml");
  }

  settings = settings || {};
  var triangles_lists = [], vertexRef = {}, lines_lists = [], vertices = [];
  var lineVertices = [], triangleVertices = [], vList, iList;
  
  var COR = [0, 0, 0, 0], geomRanges = [1e99, -1e99, 1e99, -1e99, 1e99, -1e99];
    
  var items = xml.documentElement.childNodes, sitems, j, data, k, user_data, bad;
  for (var i=0; i<items.length; i++) {
    if (items[i].tagName == "vertices") {
      sitems = items[i].childNodes;
      for (j=0; j<sitems.length; j++) {
        if (sitems[j].tagName != "vertex") continue;
        user_data = sitems[j].getElementsByTagName("user_data");
        if (user_data.length && settings.filter && ! settings.filter(user_data)) continue;
        data = sitems[j].getAttribute("image").trim().split(/\s+/);
        //console.log(data);
        for (k=0; k<9; k++) data[k] = parseFloat(data[k]);
        //data[6] = data[6]; data[7] = data[7]; data[8] = data[8];
        vertexRef[sitems[j].getAttribute("id")] = vertices.length;
        
        COR[0] += data[0]; COR[1] += data[1]; COR[2] += data[2]; COR[3]++;
        if (data[0] < geomRanges[0]) geomRanges[0] = data[0];
        if (data[0] > geomRanges[1]) geomRanges[1] = data[0];
      
        if (data[1] < geomRanges[2]) geomRanges[2] = data[1];
        if (data[1] > geomRanges[3]) geomRanges[3] = data[1];
      
        if (data[2] < geomRanges[4]) geomRanges[4] = data[2];
        if (data[2] > geomRanges[5]) geomRanges[5] = data[2];

        vertices.push(data);
      }
    }
    else if (items[i].tagName == "triangle_array") {
      sitems = items[i].childNodes;
      vList = []; iList = [];
      for (j=0; j<sitems.length; j++) {
        if (sitems[j].tagName != "triangle") continue;
        data = sitems[j].getAttribute("vertex").trim().split(/\s+/);
        for (k=0; k<3; k++) data[k] = vertexRef[data[k]];
        iList.push(data);
        vList.push(data[0], data[1], data[2]);
      }
      if (vList.length) {
        triangleVertices.push(vList.unique());
        triangles_lists.push(iList);
      }
    }
    else if (items[i].tagName == "quad_array") {
      sitems = items[i].childNodes;
      vList = []; iList = [];
      for (j=0; j<sitems.length; j++) {
        if (sitems[j].tagName != "quad") continue;
        data = sitems[j].getAttribute("vertex").trim().split(/\s+/);
        for (k=0; k<4; k++) data[k] = vertexRef[data[k]];
        
        // now split up this quad into two triangles...
        iList.push([data[0], data[1], data[2]]);
        vList.push(data[0], data[1], data[2]);
        
        iList.push([data[0], data[2], data[3]]);
        vList.push(data[0], data[2], data[3]);
      }
      if (vList.length) {
        triangleVertices.push(vList.unique());
        triangles_lists.push(iList);
      }
    }
    else if (items[i].tagName == "line_array") {
      sitems = items[i].childNodes;
      vList = []; iList = [];
      for (j=0; j<sitems.length; j++) {
        if (sitems[j].tagName != "line") continue;
        data = sitems[j].getAttribute("vertex").trim().split(/\s+/);
        bad = false;
        for (k=0; k<2; k++) {
          data[k] = vertexRef[data[k]];
          if (data[k] === undefined) {bad = true; break;}
        }
        if (bad) continue;
        iList.push(data);
        vList.push(data[0], data[1]);
      }
      if (vList.length) {
        lineVertices.push(vList.unique());
        lines_lists.push(iList);
      }
    }
    else if (items[i].tagName == "polyline_array") {
      sitems = items[i].childNodes;
      vList = []; iList = [];
      for (j=0; j<sitems.length; j++) {
        if (sitems[j].tagName != "polyline") continue;
        data = sitems[j].getAttribute("vertex").trim().split(/\s+/);
        for (k=0; k<data.length; k++) data[k] = vertexRef[data[k]];
        for (k=0; k<data.length-1; k++) {
          iList.push([data[k], data[k+1]]);
          vList.push(data[k], data[k+1]);
        }
      }
      if (vList.length) {
        lineVertices.push(vList.unique());
        lines_lists.push(iList);
      }
    }
  }
  
  var nov_l = 0, noi_l = 0, i, nov_t = 0, noi_t = 0;
  
  for (i=0; i<triangleVertices.length; i++) {
    nov_t += triangleVertices[i].length;
    noi_t += triangles_lists[i].length;
  }
  
  for (i=0; i<lineVertices.length; i++) {
    nov_l += lineVertices[i].length;
    noi_l += lines_lists[i].length;
  }

  var struct = new molmil.polygonObject({filename: filename, COR: COR, geomRanges: geomRanges}); this.structures.push(struct);
  
  this.processPolygon3D(struct, vertices, nov_l, noi_l, lineVertices, lines_lists, nov_t, noi_t, triangleVertices, triangles_lists, settings);

  this.renderer.initBD = true;

  return struct;
};


// ** assigns the secondary structure elements of a chain object using DSSP or CA torsion angles**
molmil.viewer.prototype.ssAssign = function(chainObj) {
  if (chainObj.molecules.length && chainObj.molecules[0].water) return;
    // the below code doesn't work properly...
  
  var mol1, mol2, a = [0, 0, 0], b = [0, 0, 0], c = [0, 0, 0], d = [0, 0, 0], c1, c2;
  for (var m=0; m<chainObj.molecules.length; m++) {
    mol1 = chainObj.molecules[m]; c1 = mol1.chain;
    if (mol1.ligand || mol1.water || mol1.name == "PRO" || mol1.xna) continue;
    if (mol1.previous) {
      try {
        mol1.NH = {xyz: [0, 0, 0]};
        a[0] = c1.modelsXYZ[0][mol1.previous.C.xyz]; a[1] = c1.modelsXYZ[0][mol1.previous.C.xyz+1]; a[2] = c1.modelsXYZ[0][mol1.previous.C.xyz+2];
        b[0] = c1.modelsXYZ[0][mol1.previous.O.xyz]; b[1] = c1.modelsXYZ[0][mol1.previous.O.xyz+1]; b[2] = c1.modelsXYZ[0][mol1.previous.O.xyz+2];
        c[0] = c1.modelsXYZ[0][mol1.N.xyz]; c[1] = c1.modelsXYZ[0][mol1.N.xyz+1]; c[2] = c1.modelsXYZ[0][mol1.N.xyz+2];

        vec3.subtract(mol1.NH.xyz, a, b);
        vec3.normalize(mol1.NH.xyz, mol1.NH.xyz);
        vec3.add(mol1.NH.xyz, mol1.NH.xyz, c);
      }
      catch (e) {mol1.NH = null;}
    }
    else mol1.NH = true;
  }
  
  var x, y, z;
  
  var distance2 = function(a, b) {
    x = b[0] - a[0]; y = b[1] - a[1]; z = b[2] - a[2];
    return x*x + y*y + z*z;
  };
  
  var BBBonds = {}, BBBondsList = {}, chains=[], chain;
  
  var m1, m2, E, NC, NO, HC, HO;
  for (m1=0; m1<chainObj.molecules.length; m1++) {
    mol1 = chainObj.molecules[m1]; c1 = mol1.chain;
    if (mol1.ligand || mol1.water || mol1.xna) continue;
    if (! mol1.previous || ! chain) chains.push(chain=[]);
    chain.push(mol1);
    for (m2=m1+2; m2<chainObj.molecules.length; m2++) {
      mol2 = chainObj.molecules[m2]; c2 = mol2.chain;
      if (mol2.ligand || mol2.water || mol1.xna || ! mol2.N || ! mol1.C || ! mol2.C || ! mol1.N) continue;
      a[0] = c1.modelsXYZ[0][mol1.N.xyz]; a[1] = c1.modelsXYZ[0][mol1.N.xyz+1]; a[2] = c1.modelsXYZ[0][mol1.N.xyz+2];
      b[0] = c2.modelsXYZ[0][mol2.C.xyz]; b[1] = c2.modelsXYZ[0][mol2.C.xyz+1]; b[2] = c2.modelsXYZ[0][mol2.C.xyz+2];
      NC = distance2(a, b);
      if (NC < 25 && mol2.NH && mol1.O) {
        NC = Math.sqrt(NC);
        c[0] = c1.modelsXYZ[0][mol1.O.xyz]; c[1] = c1.modelsXYZ[0][mol1.O.xyz+1]; c[2] = c1.modelsXYZ[0][mol1.O.xyz+2];
        NO = Math.sqrt(distance2(a, c));
        if (mol2.NH == true) {HC = NC - 1.0; HO = NO - 1.0;}
        else {
          HC = Math.sqrt(distance2(mol2.NH.xyz, b));
          HO = Math.sqrt(distance2(mol2.NH.xyz, c));
        }
        E = 0.084*((1/NO) + (1/HC) - (1/HO) - (1/NC))*332;
        if (E < -0.5) {
          BBBonds[mol1.MID+"-"+mol2.MID] = E;
          //BBBonds[mol2.MID+"-"+mol1.MID] = E;
          if (! BBBondsList.hasOwnProperty(mol1.MID)) BBBondsList[mol1.MID] = [];
          BBBondsList[mol1.MID].push(mol2);
          if (! BBBondsList.hasOwnProperty(mol2.MID)) BBBondsList[mol2.MID] = [];
          BBBondsList[mol2.MID].push(mol1);
        }
      }
      a[0] = c1.modelsXYZ[0][mol1.C.xyz]; a[1] = c1.modelsXYZ[0][mol1.C.xyz+1]; a[2] = c1.modelsXYZ[0][mol1.C.xyz+2];
      b[0] = c2.modelsXYZ[0][mol2.N.xyz]; b[1] = c2.modelsXYZ[0][mol2.N.xyz+1]; b[2] = c2.modelsXYZ[0][mol2.N.xyz+2];
      NC = distance2(b, a);
      if (NC < 25 && mol1.O && mol2.NH) {
        NC = Math.sqrt(NC);
        
        c[0] = c1.modelsXYZ[0][mol1.O.xyz]; c[1] = c1.modelsXYZ[0][mol1.O.xyz+1]; c[2] = c1.modelsXYZ[0][mol1.O.xyz+2];

        NO = Math.sqrt(distance2(b, c)); //
        if (mol2.NH == true) {HC = NC - 1.0; HO = NO - 1.0;}
        else {
          HC = Math.sqrt(distance2(mol2.NH.xyz, a));
          HO = Math.sqrt(distance2(mol2.NH.xyz, c));
        }
        E = 0.084*((1/NO) + (1/HC) - (1/HO) - (1/NC))*332;
        if (E < -0.5) {
          //BBBonds[mol1.MID+"-"+mol2.MID] = E;
          BBBonds[mol2.MID+"-"+mol1.MID] = E;
          if (! BBBondsList.hasOwnProperty(mol1.MID)) BBBondsList[mol1.MID] = [];
          BBBondsList[mol1.MID].push(mol2);
          if (! BBBondsList.hasOwnProperty(mol2.MID)) BBBondsList[mol2.MID] = [];
          BBBondsList[mol2.MID].push(mol1);
        }
      }
    }
  }

  // only CAs?
  //chains
  if (Object.keys(BBBondsList).length == 0) {
    var r2d = 180. / Math.PI; var v1 = [0, 0, 0], v2 = [0, 0, 0], v3 = [0, 0, 0], y1 = [0, 0, 0], y2 = [0, 0, 0], x1 = [0, 0, 0], torsion;
    var calcTorsion = function(a1, a2, a3, a4) {
      try {
        vec3.subtract(v1, a2, a1); vec3.subtract(v2, a3, a2); vec3.subtract(v3, a4, a3);

        vec3.scale(y1, v1, vec3.length(v2)); vec3.cross(y2, v2, v3); y = vec3.dot(y1, y2);
        vec3.cross(x1, v1, v2); x = vec3.dot(x1, y2);
        
        torsion = Math.atan2(y, x)*r2d;
        if (torsion < 0) torsion += 360;
        return torsion;
      }
      catch (e) {return 0.0;}
    };
    
    var a, b, c, d, A, B, C, D, a1, ab = [], a1L = [];
    
    for (var cx=0; cx<chains.length; cx++) {
      chain = chains[cx];

      ab = [], a1L = [];
      for (m=2; m<chain.length-1; m++) {
        a = chain[m-2].CA; b = chain[m-1].CA; c = chain[m].CA; d = chain[m+1].CA;
        if (! a || ! b || ! c || ! d) {
          ab.push(0);
          a1L.push(0);
          continue;
        }
        a = a.xyz; b = b.xyz; c = c.xyz; d = d.xyz;
        A = [chainObj.modelsXYZ[0][a], chainObj.modelsXYZ[0][a+1], chainObj.modelsXYZ[0][a+2]];
        B = [chainObj.modelsXYZ[0][b], chainObj.modelsXYZ[0][b+1], chainObj.modelsXYZ[0][b+2]];
        C = [chainObj.modelsXYZ[0][c], chainObj.modelsXYZ[0][c+1], chainObj.modelsXYZ[0][c+2]];
        D = [chainObj.modelsXYZ[0][d], chainObj.modelsXYZ[0][d+1], chainObj.modelsXYZ[0][d+2]];
        a1 = calcTorsion(A, B, C, D);
        if (a1 >= 10 && a1 <= 120) ab.push(1); // alpha helix
        else if (a1 >= 120 && a1 <= 270) ab.push(2); // beta sheet
        else ab.push(0);
        a1L.push(a1);
        
        // 10 - 120 --> alpha helix
        // 120 - 270 --> beta sheet
        // -90 - 0 --> lh alpha helix
      }
      ab.push(0);
    
      for (m=1; m<chain.length-1; m++) {
        if (ab[m] == 0) {
          if (ab[m-1] == 1 && ab[m+1] == 1) ab[m] = 1;
          if (ab[m-1] == 2 && ab[m+1] == 2) ab[m] = 2;
        }
      }
    
      ab[0] = ab[1] = ab[2];
      ab[ab.length-1] = ab[ab.length-2];

      var test = [-1, 0], i; // pos, type
    
      for (m=0; m<ab.length; m++) {
        if (ab[m] != test[1]) {
          if (test[1] != 0 && m-test[0] < 4) {for (i=test[0]; i<m; i++) ab[i] = 0;} // reset short stretches
          test[0] = m;
          test[1] = ab[m];
        }
      }
    
      //for (m=0; m<ab.length; m++) {
      //  if (ab[m] == 0 && a1L[m] >= -90 && a1L[m] <= 90) ab[m] = 3;
      //}
    
      //for (m=ab.length-2; m<=0; m--) {
      //  if (ab[m] == 0 && ab[m+1] == 3) ab[m] = 3;
      //}
    
      for (m=0; m<chain.length; m++) {
        if (ab[m] == 1) chain[m].sndStruc = 3;
        else if (ab[m] == 2) chain[m].sndStruc = 2;
        else if (ab[m] == 3) chain[m].sndStruc = 4;
      } 

    }
    return;
  }
  
  // now analyse BBBonds and determine the bb type...
  
  var getMID = function(m) {return m ? m.MID : null;};
  
  //var MID1, MID2, pattern=0, block, added;
  
  var MID1, MID2, pattern, block;
  
  var typedChains = [], typedChain, bp1, bp2, tmp1, S1, S2, patterns = [], EOL = false;
  for (var c=0; c<chains.length; c++) {
    typedChains.push(typedChain = []);
    for (m1=0; m1<chains[c].length; m1++) {
      pattern = 0;
      
      MID1 = getMID(chains[c][m1]);
      bp1 = bp2 = [c, m1];

      if ((BBBonds.hasOwnProperty(getMID(chains[c][m1+3])+"-"+MID1)) && ! EOL && (patterns.length < 3 || BBBonds.hasOwnProperty(MID1+"-"+getMID(chains[c][m1-3])))) {
        pattern = 3;
        bp1 = [c, m1];
        bp2 = [c, m1+3];
      }
      else if (BBBonds.hasOwnProperty(MID1+"-"+getMID(chains[c][m1-3])) && patterns.length > 3) {
        pattern = 3;
        bp1 = [c, m1-3];
        bp2 = [c, m1];
        EOL = true;
      }
      
      if ((BBBonds.hasOwnProperty(getMID(chains[c][m1+4])+"-"+MID1)) && ! EOL && (patterns.length < 4 || BBBonds.hasOwnProperty(MID1+"-"+getMID(chains[c][m1-4])))) {
        pattern = 3;
        bp1 = [c, m1];
        bp2 = [c, m1+4];
      }
      else if (BBBonds.hasOwnProperty(MID1+"-"+getMID(chains[c][m1-4])) && patterns.length > 4) {
        pattern = 3;
        bp1 = [c, m1-4];
        bp2 = [c, m1];
        EOL = true;
      }
      
      if (BBBonds.hasOwnProperty(getMID(chains[c][m1+5])+"-"+MID1) && ! EOL && (patterns.length < 5 || BBBonds.hasOwnProperty(MID1+"-"+getMID(chains[c][m1-5])))) {
        pattern = 5;
        bp1 = [c, m1];
        bp2 = [c, m1+5];
      }
      else if (BBBonds.hasOwnProperty(MID1+"-"+getMID(chains[c][m1-5])) && patterns.length > 5) {
        pattern = 5;
        bp1 = [c, m1-5];
        bp2 = [c, m1];
        EOL = true;
      }
      //console.log(MID1+"-"+getMID(chains[c][m1-4]), patterns.length);
      
      if (BBBonds.hasOwnProperty(getMID(chains[c][m1+4])+"-"+MID1) && ! EOL && (patterns.length < 4 || BBBonds.hasOwnProperty(MID1+"-"+getMID(chains[c][m1-4])))) {
        pattern = 4;
        bp1 = [c, m1];
        bp2 = [c, m1+4];
      }
      else if (BBBonds.hasOwnProperty(MID1+"-"+getMID(chains[c][m1-4])) && patterns.length > 3) {
        
        pattern = 4;
        bp1 = [c, m1-4];
        bp2 = [c, m1];
        EOL = true;
      }
      
      if (patterns.length && patterns[patterns.length-1] != pattern) {
        patterns = [];
        EOL = false;
      }
      patterns.push(pattern);
      
      typedChain.push([pattern, bp1, bp2]);
    }
  }

  for (var c=0; c<typedChains.length; c++) {
    typedChain = typedChains[c];
    block = []; patterns = []; pattern = 0;
    for (m1=0; m1<typedChain.length; m1++) {
      if (typedChain[m1][0] != pattern) {
        if (pattern == 3 || pattern == 4 || pattern == 5) {
          if ((block.length > 1 && pattern != 3) || block.length > 2) {
            for (m2=block[0][1][1]; m2<block[block.length-1][2][1]; m2++) chains[c][m2].sndStruc = 3;
          }
          else if (block.length) patterns.push([block[0][1][1], block[block.length-1][2][1]]);
        }
        pattern = 0;
        block = [];
      }
      if (typedChain[m1][0]) {
        block.push(typedChain[m1]);
        pattern = typedChain[m1][0];
      }
    }
    
    if (pattern == 3 || pattern == 4 || pattern == 5) {
      if ((block.length > 1 && pattern != 3) || block.length > 2) {
        for (m2=block[0][1][1]; m2<block[block.length-1][2][1]; m2++) chains[c][m2].sndStruc = 3;
      }
      else if (block.length) patterns.push([block[0][1][1], block[block.length-1][2][1]]);
    }
    
    for (m1=0; m1<patterns.length; m1++) {
      //console.log(chains[c][Math.max(0, patterns[m1][0]-1)], chains[c][Math.min(chains[c].length-1, patterns[m1][1]+1)]);
      MID1 = Math.max(0, patterns[m1][0]-1);
      MID2 = Math.min(chains[c].length-1, patterns[m1][1]+1);
      
      pattern = MID2-MID1 > 5 || chains[c][MID1].sndStruc == 3 || chains[c][MID2].sndStruc == 3 ? 3 : 4;
      //pattern = chains[c][Math.max(0, patterns[m1][0]-1)].sndStruc == 3 || chains[c][Math.min(chains[c].length-1, patterns[m1][1]+1)].sndStruc == 3 ? 3 : 4;
      for (m2=patterns[m1][0]; m2<patterns[m1][1]; m2++) chains[c][m2].sndStruc = pattern;
    }
    
  }
  
  var mh;
  
  for (var c=0; c<chains.length; c++) {
    for (m1=0; m1<chains[c].length; m1++) {
      //if (chains[c][m1].sndStruc != 3 && chains[c][m1].sndStruc != 4) {
      if (chains[c][m1].sndStruc != 3) {
        tmp1 = null;
        if (chains[c][m1].previous && chains[c][m1].next) {
          S1 = BBBondsList[getMID(chains[c][m1].previous)];
          S2 = BBBondsList[getMID(chains[c][m1].next)];
          if (S1 && S2) {
            for (var i=0, j; i<S1.length; i++) {
              for (j=0; j<S2.length; j++) {
                if (S1[i].previous && S1[i].previous == S2[j].next) {tmp1 = [S1[i].previous]; break;}
                else if (S2[j].previous && S2[j].previous == S1[i].next) {tmp1 = [S1[i].next]; break;}
              }
              if (tmp1) break;
            }
          }
        }
        if (! tmp1) {tmp1 = BBBondsList[getMID(chains[c][m1])];}
        if (tmp1) {
          for (mh=0; mh<tmp1.length; mh++) {
            if (tmp1[mh].sndStruc == 2) {chains[c][m1].sndStruc = 2; break;}
            S1 = [chains[c][m1].previous, chains[c][m1], chains[c][m1].next];
            S2 = [tmp1[mh].previous, tmp1[mh], tmp1[mh].next];

            if (BBBonds.hasOwnProperty(getMID(S1[0])+"-"+getMID(S2[1])) && BBBonds.hasOwnProperty(getMID(S2[1])+"-"+getMID(S1[2]))) {
              S1[0].sndStruc = S1[1].sndStruc = S1[2].sndStruc = S2[1].sndStruc = 2;
            }
            else if (BBBonds.hasOwnProperty(getMID(S1[1])+"-"+getMID(S2[0])) && BBBonds.hasOwnProperty(getMID(S2[2])+"-"+getMID(S1[1]))) {
              S1[1].sndStruc = S2[0].sndStruc = S2[1].sndStruc = S2[2].sndStruc = 2;
            }
            // N-C

            else if (BBBonds.hasOwnProperty(getMID(S1[1])+"-"+getMID(S2[1])) && BBBonds.hasOwnProperty(getMID(S2[1])+"-"+getMID(S1[1]))) {
              S1[1].sndStruc = S2[1].sndStruc = 2;
            }
            else if (BBBonds.hasOwnProperty(getMID(S1[0])+"-"+getMID(S2[2])) && BBBonds.hasOwnProperty(getMID(S1[2])+"-"+getMID(S2[0]))) {
              S1[0].sndStruc = S1[1].sndStruc = S1[2].sndStruc = 
              S2[0].sndStruc = S2[1].sndStruc = S2[2].sndStruc = 2;
            }
          }
          
        }
      }
    }
  }
  
};

