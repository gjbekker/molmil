function WRL_lines(object, mesh) {
  var matrix = object[2];
  var rgba = object[3] || [255, 255, 255, 255];
  var coords = object[4];
  var indices = object[5];
  var colors = object[6];
  
  if (colors.length == 0) {
    for (var i=0; i<coords.length; i++) colors.push(rgba);
  }

  var vBuffer = mesh.lines.vertexBuffer, iBuffer = mesh.lines.indexBuffer, vP = mesh.lines.vP, iP = mesh.lines.iP, vBuffer8 = mesh.lines.vertexBuffer8, vP8 = vP*4;
  var p = vP*.25, v, xyz = [0, 0, 0];
  
  var normalMatrix = mat3.create();
  mat3.normalFromMat4(normalMatrix, matrix);
  
  for (v=0; v<coords.length; v++, vP8+=16) {
    xyz[0] = coords[v][0]; xyz[1] = coords[v][1]; xyz[2] = coords[v][2];
    vec3.transformMat4(xyz, xyz, matrix);
    vBuffer[vP++] = xyz[0];
    vBuffer[vP++] = xyz[1];
    vBuffer[vP++] = xyz[2];
    
    vBuffer8[vP8+12] = colors[v][0];
    vBuffer8[vP8+13] = colors[v][1];
    vBuffer8[vP8+14] = colors[v][2];
    vBuffer8[vP8+15] = colors[v][3];
    vP++
  }
  
  for (v=0; v<indices.length; v++) {iBuffer[iP++] = indices[v][0]+p; iBuffer[iP++] = indices[v][1]+p;}

  // update mesh metadata
  mesh.lines.vP = vP;
  mesh.lines.iP = iP;
}

function WRL_mesh(object, mesh) {
  var matrix = object[2];
  var rgba = object[3] || [255, 255, 255, 255];
  var coords = object[4];
  var indices = object[5];
  var normals = object[6];
  var colors = object[7];

  if (normals.length == 0) {
    molmil.taubinSmoothing(coords, indices, .5, -.53, 5);

    var face_normals = [], tmp1 = [0, 0, 0], tmp2 = [0, 0, 0], faceidxs = [], i, f;

    for (i=0; i<coords.length; i++) faceidxs.push([]);

    for (i=0; i<indices.length; i++) {
      vec3.sub(tmp1, coords[indices[i][0]], coords[indices[i][1]]);
      vec3.sub(tmp2, coords[indices[i][0]], coords[indices[i][2]]);
      face_normals.push(vec3.cross([0, 0, 0], tmp1, tmp2));
      faceidxs[indices[i][0]].push(face_normals.length-1);
      faceidxs[indices[i][1]].push(face_normals.length-1);
      faceidxs[indices[i][2]].push(face_normals.length-1);
    }

    for (i=0; i<coords.length; i++) {
      normal = [0, 0, 0];
      f = 0;
      for (f=0; f<faceidxs[i].length; f++) vec3.add(normal, normal, face_normals[faceidxs[i][f]]);
      vec3.normalize(normal, normal);
      normals.push(normal);
    }
    molmil.taubinSmoothing(normals, indices, .5, -.53, 5);
  }
  
  if (colors.length == 0) {
    for (var i=0; i<coords.length; i++) colors.push(rgba);
  }
  
  
  var vBuffer = mesh.triangles.vertexBuffer, iBuffer = mesh.triangles.indexBuffer, vP = mesh.triangles.vP, iP = mesh.triangles.iP, vBuffer8 = mesh.triangles.vertexBuffer8, vP8 = vP*4;
  var p = vP/7, v, xyz = [0, 0, 0];
  
  var normalMatrix = mat3.create();
  mat3.normalFromMat4(normalMatrix, matrix);
  
  for (v=0; v<coords.length; v++, vP8+=28) {
    xyz[0] = coords[v][0]; xyz[1] = coords[v][1]; xyz[2] = coords[v][2];
    vec3.transformMat4(xyz, xyz, matrix);
    vBuffer[vP++] = xyz[0];
    vBuffer[vP++] = xyz[1];
    vBuffer[vP++] = xyz[2];

    xyz[0] = normals[v][0]; xyz[1] = normals[v][1]; xyz[2] = normals[v][2];
    vec3.transformMat3(xyz, xyz, normalMatrix);
    vBuffer[vP++] = xyz[0];
    vBuffer[vP++] = xyz[1];
    vBuffer[vP++] = xyz[2];
    
    vBuffer8[vP8+24] = colors[v][0];
    vBuffer8[vP8+25] = colors[v][1];
    vBuffer8[vP8+26] = colors[v][2];
    vBuffer8[vP8+27] = colors[v][3];
    vP++
  }
  
  for (v=0; v<indices.length; v++) {iBuffer[iP++] = indices[v][0]+p; iBuffer[iP++] = indices[v][1]+p; iBuffer[iP++] = indices[v][2]+p;}
  
  // update mesh metadata
  mesh.triangles.vP = vP;
  mesh.triangles.iP = iP;
}

function WRL_sphere(object, mesh) {
  var quality = object[1];
  var matrix = object[2];
  var rgba = object[3];
  var radius = object[4];
  
  var sphereTemplate = mesh.sphereTemplate(quality);
  
  var vBuffer = mesh.triangles.vertexBuffer, iBuffer = mesh.triangles.indexBuffer, vP = mesh.triangles.vP, iP = mesh.triangles.iP, vBuffer8 = mesh.triangles.vertexBuffer8, vP8 = vP*4;
  var p = vP/7, v, xyz = [0, 0, 0];
  
  for (v=0; v<sphereTemplate.faces.length; v++) {
    iBuffer[iP++] = sphereTemplate.faces[v][0]+p;
    iBuffer[iP++] = sphereTemplate.faces[v][1]+p;
    iBuffer[iP++] = sphereTemplate.faces[v][2]+p;
  }
  
  var normalMatrix = mat3.create();
  mat3.normalFromMat4(normalMatrix, matrix);
  
  for (v=0; v<sphereTemplate.vertices.length; v++, vP8+=28) {
  
    xyz[0] = sphereTemplate.vertices[v][0]*radius; xyz[1] = sphereTemplate.vertices[v][1]*radius; xyz[2] = sphereTemplate.vertices[v][2]*radius;
    vec3.transformMat4(xyz, xyz, matrix);
    vBuffer[vP++] = xyz[0];
    vBuffer[vP++] = xyz[1];
    vBuffer[vP++] = xyz[2];

    xyz[0] = sphereTemplate.vertices[v][0]; xyz[1] = sphereTemplate.vertices[v][1]; xyz[2] = sphereTemplate.vertices[v][2];
    vec3.transformMat3(xyz, xyz, normalMatrix);
    vBuffer[vP++] = xyz[0];
    vBuffer[vP++] = xyz[1];
    vBuffer[vP++] = xyz[2];
    
    vBuffer8[vP8+24] = rgba[0];
    vBuffer8[vP8+25] = rgba[1];
    vBuffer8[vP8+26] = rgba[2];
    vBuffer8[vP8+27] = rgba[3];
    vP++
  }
  
  // update mesh metadata
  mesh.triangles.vP = vP;
  mesh.triangles.iP = iP;
}

function WRL_cylinder(object, mesh) {
  var quality = object[1];
  var matrix = object[2];
  var rgba = object[3];
  var radius = object[4];
  var height = object[5];

  var novpr = parseInt(quality);

  var ringTemplate = mesh.ringTemplate(quality), i;
  var vBuffer = mesh.triangles.vertexBuffer, iBuffer = mesh.triangles.indexBuffer, vP = mesh.triangles.vP, iP = mesh.triangles.iP, vBuffer8 = mesh.triangles.vertexBuffer8, vP8 = vP*4;
  var p = vP/7;

  var xyzIn = [0, 0, 0], xyzOut = [0, 0, 0];

  var Nx = matrix[0], Ny = matrix[1], Nz = matrix[2], 
  Bx = matrix[4], By = matrix[5], Bz = matrix[6], 
  Tx = matrix[8], Ty = matrix[9], Tz = matrix[10];
  
  var x, y, z, w, Ypos = -0.5*height;
  var segment = function (sign) {
    for (i=0; i<novpr; i++, vP8+=28) {
      xyzIn[0] = ringTemplate[i][0]*radius; xyzIn[1] = Ypos; xyzIn[2] = ringTemplate[i][2]*radius;
      vec3.transformMat4(xyzOut, xyzIn, matrix);
      vBuffer[vP++] = xyzOut[0]; vBuffer[vP++] = xyzOut[1]; vBuffer[vP++] = xyzOut[2];
  
      if (sign == -1) {
        vBuffer[vP++] = -Bx;
        vBuffer[vP++] = -By;
        vBuffer[vP++] = -Bz;
      }
      else if (sign == 1) {
        vBuffer[vP++] = Bx;
        vBuffer[vP++] = By;
        vBuffer[vP++] = Bz;
      }
      else {
        vBuffer[vP++] = (ringTemplate[i][0] * Nx + ringTemplate[i][2] * Tx);
        vBuffer[vP++] = (ringTemplate[i][0] * Ny + ringTemplate[i][2] * Ty);
        vBuffer[vP++] = (ringTemplate[i][0] * Nz + ringTemplate[i][2] * Tz);
      }
      vBuffer8[vP8+24] = rgba[0];
      vBuffer8[vP8+25] = rgba[1];
      vBuffer8[vP8+26] = rgba[2];
      vBuffer8[vP8+27] = rgba[3];
      vP++;
    }
  };
  
  // cap1
  
  xyzIn[0] = 0; xyzIn[1] = Ypos; xyzIn[2] = 0;
  vec3.transformMat4(xyzOut, xyzIn, matrix);
  
  vBuffer[vP++] = xyzOut[0]; vBuffer[vP++] = xyzOut[1]; vBuffer[vP++] = xyzOut[2];
  vBuffer[vP++] = -Bx; vBuffer[vP++] = -By; vBuffer[vP++] = -Bz;
  vBuffer8[vP8+24] = rgba[0]; vBuffer8[vP8+25] = rgba[1]; vBuffer8[vP8+26] = rgba[2]; vBuffer8[vP8+27] = rgba[3];
  vP++; vP8 += 28;
  
  segment(-1);
  for (i=0; i<novpr; i++) {
    iBuffer[iP++] = p;
    iBuffer[iP++] = p+i+1;
    iBuffer[iP++] = p+i+2;
  }
  iBuffer[iP-1] = p+1;
  p += novpr+1;

  // center
  segment(0); 
  Ypos += height;
  segment(0);

  for (i=0; i<(novpr*2)-2; i+=2, p+=1) {
    iBuffer[iP++] = p+1;
    iBuffer[iP++] = p;
    iBuffer[iP++] = p+novpr;

    iBuffer[iP++] = p+novpr;
    iBuffer[iP++] = p+1+novpr;
    iBuffer[iP++] = p+1;
  }
  iBuffer[iP++] = p-(novpr-1);
  iBuffer[iP++] = p;
  iBuffer[iP++] = p+novpr;

  iBuffer[iP++] = p+novpr;
  iBuffer[iP++] = p+1;
  iBuffer[iP++] = p-(novpr-1);
  p += novpr;
  
  // cap2
  segment(1);
  
  xyzIn[0] = 0; xyzIn[1] = Ypos; xyzIn[2] = 0;
  vec3.transformMat4(xyzOut, xyzIn, matrix);
  
  vBuffer[vP++] = xyzOut[0]; vBuffer[vP++] = xyzOut[1]; vBuffer[vP++] = xyzOut[2];
  vBuffer[vP++] = Bx; vBuffer[vP++] = By; vBuffer[vP++] = Bz;
  vBuffer8[vP8+24] = rgba[0]; vBuffer8[vP8+25] = rgba[1]; vBuffer8[vP8+26] = rgba[2]; vBuffer8[vP8+27] = rgba[3];
  vP++; vP8 += 28;
  for (i=0; i<novpr; i++) {
    iBuffer[iP++] = p+i+1;
    iBuffer[iP++] = p+i;
    iBuffer[iP++] = p+novpr;
  }
  iBuffer[iP-3] -= novpr;
  
  // update mesh metadata
  mesh.triangles.vP = vP;
  mesh.triangles.iP = iP;
}

molmil.viewer.prototype.load_wrl = function(data, filename, settings) {
  if (! molmil.taubinSmoothing) return molmil.loadPlugin(molmil.settings.src+"plugins/misc.js", this.load_wrl, this, [data, filename, settings]); 
  
  var env = {};
  env.rotation = [0, 0, 0, 1];
  env.translation = [0, 0, 0];
  env.scale = [1, 1, 1];
  env.quality = molmil.configBox.QLV_SETTINGS[this.renderer.QLV];
  
  var objects = [];
  process_WRLChild(vrmlParser.parse(data), env, objects);
  
  var meshObject = {triangles: {}, lines: {}};
  meshObject.ringTemplateBuffer = {};
  meshObject.sphereTemplateBuffer = {};
  meshObject.sphereTemplate = function(quality) {
    quality = parseInt(quality);
    if (! this.sphereTemplateBuffer.hasOwnProperty(quality)) this.sphereTemplateBuffer[quality] = molmil.octaSphereBuilder(quality);
    return this.sphereTemplateBuffer[quality];
  };
  meshObject.ringTemplate = function(quality) {
    quality = parseInt(quality);
    if (! this.ringTemplateBuffer.hasOwnProperty(quality)) {
      var theta = 0.0, rad = 2.0/quality, x, y, p, temp = [];
       for (p=0; p<quality; p++) {
        temp.push([Math.cos(theta*Math.PI), 0, Math.sin(theta*Math.PI)]);
        theta += rad;
      }
      this.ringTemplateBuffer[quality] = temp;
    }
    return this.ringTemplateBuffer[quality];
  };
  
  var i, obj, vs = 0, is = 0, vs_line = 0, is_line = 0;
  for (i=0; i<objects.length; i++) {
    if (objects[i][0] == "cylinder") {
      vs += (objects[i][1] * 4) + 2;
      is += objects[i][1]*12;
    }
    else if (objects[i][0] == "sphere") {
      var sphereTemplate = meshObject.sphereTemplate(objects[i][1]);
      vs += sphereTemplate.vertices.length;
      is += sphereTemplate.faces.length*3;
    }
    else if (objects[i][0] == "mesh") {
      vs += objects[i][4].length;
      is += objects[i][5].length*3;
    }
    else if (objects[i][0] == "lines") {
      vs_line += objects[i][4].length;
      is_line += objects[i][5].length*2;
    }
  }
  
  
  meshObject.triangles.vP = meshObject.triangles.iP = 0;
  meshObject.triangles.vertexBuffer = new Float32Array(vs*7); // x, y, z, nx, ny, nz, rgba
  meshObject.triangles.vertexBuffer8 = new Uint8Array(meshObject.triangles.vertexBuffer.buffer);
  if (molmil.configBox.OES_element_index_uint) meshObject.triangles.indexBuffer = new Uint32Array(is);
  else meshObject.triangles.indexBuffer = new Uint16Array(is);
  
  meshObject.lines.vP = meshObject.lines.iP = 0;
  meshObject.lines.vertexBuffer = new Float32Array(vs_line*4); // x, y, z, rgba
  meshObject.lines.vertexBuffer8 = new Uint8Array(meshObject.lines.vertexBuffer.buffer);
  if (molmil.configBox.OES_element_index_uint) meshObject.lines.indexBuffer = new Uint32Array(is_line);
  else meshObject.lines.indexBuffer = new Uint16Array(is_lines);

  var alphaMode = false;
  for (i=0; i<objects.length; i++) {
    if (objects[i][0] == "cylinder") WRL_cylinder(objects[i], meshObject);
    else if (objects[i][0] == "sphere") WRL_sphere(objects[i], meshObject);
    else if (objects[i][0] == "mesh") WRL_mesh(objects[i], meshObject);
    else if (objects[i][0] == "lines") WRL_lines(objects[i], meshObject);
    
    if (objects[i][3][3] != 255) alphaMode = true;
  }
  
  
  // 
  var geomRanges = [1e99, -1e99, 1e99, -1e99, 1e99, -1e99], hihi = [0, 0, 0, 0], x, y, z;
  
  var struct = new molmil.polygonObject({filename: filename, COR: hihi, geomRanges: geomRanges, mode: "general"}); this.structures.push(struct); struct.options = [];
  
  if (meshObject.triangles.vP) {
    for (var i=0; i<meshObject.triangles.vP; i+=7) {
      x = meshObject.triangles.vertexBuffer[i];
      y = meshObject.triangles.vertexBuffer[i+1];
      z = meshObject.triangles.vertexBuffer[i+2];
      
      if (x < geomRanges[0]) geomRanges[0] = x;
      if (x > geomRanges[1]) geomRanges[1] = x;
      
      if (y < geomRanges[2]) geomRanges[2] = y;
      if (y > geomRanges[3]) geomRanges[3] = y;
     
      if (z < geomRanges[4]) geomRanges[4] = z;
      if (z > geomRanges[5]) geomRanges[5] = z;
      
      hihi[0] += x; hihi[1] += y; hihi[2] += z; hihi[3] += 1;
    }

    var program = molmil.geometry.build_simple_render_program(meshObject.triangles.vertexBuffer, meshObject.triangles.indexBuffer, this.renderer, {alphaMode: alphaMode, solid: true});
    
    this.renderer.addProgram(program); struct.programs.push(program);
  }
  
  if (meshObject.lines.vP) {
    for (var i=0; i<meshObject.lines.vP; i+=4) {
      x = meshObject.lines.vertexBuffer[i];
      y = meshObject.lines.vertexBuffer[i+1];
      z = meshObject.lines.vertexBuffer[i+2];
      
      if (x < geomRanges[0]) geomRanges[0] = x;
      if (x > geomRanges[1]) geomRanges[1] = x;
      
      if (y < geomRanges[2]) geomRanges[2] = y;
      if (y > geomRanges[3]) geomRanges[3] = y;
     
      if (z < geomRanges[4]) geomRanges[4] = z;
      if (z > geomRanges[5]) geomRanges[5] = z;
      
      hihi[0] += x; hihi[1] += y; hihi[2] += z; hihi[3] += 1;
    }

    var program = molmil.geometry.build_simple_render_program(meshObject.lines.vertexBuffer, meshObject.lines.indexBuffer, this.renderer, {lines_render: true});
    
    this.renderer.addProgram(program); struct.programs.push(program);
  }
  
  this.calculateCOG();

  this.renderer.initBuffers();
  this.canvas.update = true;
  
  molmil.safeStartViewer(this.canvas);
  
  return struct;
}

function process_WRLChild(tree, env, objects) {
  // make sure that the js file has been loaded...

  var o, env_local, branch, tmp, val1, val2, val3;
  for (o=0; o<tree.length; o++) {
    branch = tree[o];
    env_local = JSON.parse(JSON.stringify(env));
    
    if (branch.rotation) {
      tmp = [0, 0, 0, 0]; quat.setAxisAngle(tmp, [branch.rotation.x, branch.rotation.y, branch.rotation.z], branch.rotation.radians); quat.multiply(env_local.rotation, tmp, env_local.rotation);
    }
    if (branch.translation) {
      env_local.translation[0] += branch.translation.x; env_local.translation[1] += branch.translation.y; env_local.translation[2] += branch.translation.z;
    }
    if (branch.scale) {
      env_local.scale[0] *= branch.scale.x; env_local.scale[1] *= branch.scale.y; env_local.scale[2] *= branch.scale.z;
    }
    if (branch.geometry) {
      var matrix = mat4.create(), rgba = [255, 255, 255, 255];
      mat4.fromRotationTranslationScale(matrix, env_local.rotation, env_local.translation, env_local.scale);
      if (branch.appearance && branch.appearance.material && branch.appearance.material.diffuseColor) rgba = [255*branch.appearance.material.diffuseColor.x, 255*branch.appearance.material.diffuseColor.y, 255*branch.appearance.material.diffuseColor.z, (branch.appearance.material.hasOwnProperty("transparency") ? 1-(branch.appearance.material.transparency) : 1)*255];
      else if (branch.geometry.color && branch.geometry.color.color) rgba = [255*branch.geometry.color.color[0].x, 255*branch.geometry.color.color[0].y, 255*branch.geometry.color.color[0].z, 255];
      
      if (branch.geometry.node.toLowerCase() == "cylinder") {
        // this isn't completly correct
        // when "inheriting", we should transfer the matrix, then combine the matrices before going to the next stage...

        val1 = env_local.scale[0]*branch.geometry.radius; val2 = env_local.scale[2]*branch.geometry.radius;
        val1 *= val1; val2 *= val2;
        val1 = Math.sqrt(val1+val2);
        val2 = val1*env.quality.CB_NOVPR*Math.PI*.125;
        if (val2 < 4) val2 = 4;
        
        objects.push(["cylinder", val2, matrix, rgba, branch.geometry.radius, branch.geometry.height]);
      }
      else if (branch.geometry.node.toLowerCase() == "sphere") {            
        val1 = env_local.scale[0]*branch.geometry.radius; val2 = env_local.scale[1]*branch.geometry.radius; val3 = env_local.scale[2]*branch.geometry.radius;
        val1 *= val1; val2 *= val2; val3 *= val3;
        val1 = Math.sqrt(val1+val2+val3);
        val2 = val1*(env.quality.SPHERE_TESS_LV+1)*Math.PI*.1;
        val3 = Math.round(Math.log(val2)/Math.log(3));
        
        objects.push(["sphere", val3, matrix, rgba, branch.geometry.radius]);
      }
      else if (branch.geometry.node.toLowerCase() == "indexedfaceset") {
        var coords = [], indices = [], normals = [], colors = [];
        val1 = branch.geometry.coord.point;
        for (val2=0; val2<val1.length; val2++) coords.push([val1[val2].x, val1[val2].y, val1[val2].z]);

        val1 = branch.geometry.coordIndex;
        for (val2=0; val2<val1.length; val2++) indices.push([parseInt(val1[val2][0]), parseInt(val1[val2][1]), parseInt(val1[val2][2])]);
        
        objects.push(["mesh", 0, matrix, rgba, coords, indices, normals, colors]);
      }
      else if (branch.geometry.node.toLowerCase() == "indexedlineset") {
        //coordIndex
        var coords = [], indices = [], colors = [];
        val1 = branch.geometry.coord.point;
        for (val2=0; val2<val1.length; val2++) coords.push([val1[val2].x, val1[val2].y, val1[val2].z]);
        
        val1 = branch.geometry.coordIndex;
        for (val2=0; val2<val1.length; val2++) indices.push([parseInt(val1[val2][0]), parseInt(val1[val2][1])]);
        
        objects.push(["lines", 0, matrix, rgba, coords, indices, colors]);
      }
    }
    
    // here, create the objects and apply the above operations...
    if (tree[o].children) process_WRLChild(tree[o].children, env_local, objects);
  
  }

}
