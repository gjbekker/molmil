function isNumber(n) {
  return ! isNaN(parseFloat(n)) && isFinite(n);
}

// loop over it normally; soup->structs->chains->molecules->atoms, then check if aid is in atomSelection; if not --> skip

molmil.savePDB = function(soup, atomSelection, modelId, file) {
  if (! window.saveAs && ! molmil.configBox.customSaveFunction) return molmil.loadPlugin(molmil.settings.src+"lib/FileSaver.js", molmil.savePDB, molmil, [soup, atomSelection, modelId, file]); 
  var info = new Set(atomSelection);
  
  var s, c, a, atom, aid = 1, out = "", gname, aname, rname, cname, rid, x, y, z, prevChain = null;
  var saveModel = function(modelId_) {
    for (s=0; s<soup.structures.length; s++) {
      for (c=0; c<soup.structures[s].chains.length; c++) {
        for (a=0; a<soup.structures[s].chains[c].atoms.length; a++) {
          atom = soup.structures[s].chains[c].atoms[a];
          if (! info.has(atom)) continue;
          if (prevChain && atom.chain != prevChain) {
            out += "TER\n"
          }
          prevChain = atom.chain;
          aid = aid%99999;
        
          gname = "ATOM  ";
          if (atom.molecule.ligand) gname = "HETATM";

          aname = atom.atomName.substr(0,4);
    
          if (! isNumber(aname[0]) && aname.length < 4) aname = ' ' + aname;
    
          rname = atom.molecule.name;
    
          rid = (atom.molecule.RSID||"").substr(0,4);

          cname = (atom.chain.authName || atom.chain.name || "").substr(0,2);

          x = atom.chain.modelsXYZ[modelId_][atom.xyz].toFixed(3);
          y = atom.chain.modelsXYZ[modelId_][atom.xyz+1].toFixed(3);
          z = atom.chain.modelsXYZ[modelId_][atom.xyz+2].toFixed(3);
    
          out += gname + (aid+'').padStart(5) + " " + aname.padEnd(4) + " " + rname.padStart(3) + cname.padStart(2) + (rid+'').padStart(4) + "    " + (x+'').padStart(8) + (y+'').padStart(8) + (z+'').padStart(8) + "\n";
        
          aid++;
        }
      }
    }
  };
  

  if (modelId == "all") {
    var nmod = soup.structures[0].chains[0].modelsXYZ.length;
    for (var i=0; i<nmod; i++) {
      out += "MODEL" + ((i+1)+'').padStart(9) + "\n";
      saveModel(i);
      out += "ENDMDL\n";
    }
  }
  else saveModel(modelId);

  if (molmil.configBox.customSaveFunction) molmil.configBox.customSaveFunction(file, out, "utf8");
  else {
    var blob = new Blob([out], {type: "text/plain;charset=utf-8"});
    saveAs(blob, file);
  }
}

// ** generates a PLY file **
molmil.exportPLY = function(soup) {
  if (! window.saveAs) return molmil.loadPlugin(molmil.settings.src+"lib/FileSaver.js", this.exportPLY, this, [soup]); 
  
  soup = soup || molmil.cli_soup;
  
  molmil.geometry.skipClearBuffer = true;
  molmil.geometry.reInitChains = true;
  
  soup.renderer.initBuffers();
  soup.renderer.canvas.update = true;
  molmil.geometry.generate(soup.structures, soup.renderer);
  
  // regenerate 
  var meshes = [];
  if (molmil.geometry.buffer1) meshes.push(molmil.geometry.buffer1);
  if (molmil.geometry.buffer3) meshes.push(molmil.geometry.buffer3);
  if (molmil.geometry.buffer4) meshes.push(molmil.geometry.buffer4);
  for (var i=0; i<soup.structures.length; i++) {
    if (soup.structures[i] instanceof molmil.polygonObject) {
      for (var p=0; p<soup.structures[i].programs.length; p++) {
        if (soup.structures[i].programs[p].data) {
          var tmp = soup.structures[i].programs[p].data;
          meshes.push({vertexSize: tmp.vertexSize, vertexBuffer: tmp.vertices, indexBuffer: tmp.indices});
        }
      }
    }
  }
  // output
  
  var m, nov=0, nof=0, vs;
        
  for (m=0; m<meshes.length; m++) {
    vs = meshes[m].vertexSize || 8;
    nov += meshes[m].vertexBuffer.length / vs;
    nof += meshes[m].indexBuffer.length / 3;
  }
        
  var header = "ply\nformat binary_little_endian 1.0\nelement vertex "+nov+"\nproperty float x\nproperty float y\nproperty float z\nproperty float nx\nproperty float ny\nproperty float nz\nproperty uint8 red\nproperty uint8 green\nproperty uint8 blue\nproperty uint8 alpha\nelement face "+nof+"\nproperty list int32 int32 vertex_indices\nend_header\n";
        
  var vout = new Float32Array(nov*7);
  var vout8 = new Uint8Array(vout.buffer);
  var iout = new Int32Array(nof*4);
        
  var v, v8, vo=0, vo8=0, io=0, vB, vB8, voffset = 0;
      
  for (m=0; m<meshes.length; m++) {
    vs = meshes[m].vertexSize || 8;
          
    vB = meshes[m].vertexBuffer;
    vB8 = new Uint8Array(vB.buffer, meshes[m].vertices_offset);
    for (v=0, v8=0; v<vB.length; v+=vs, v8+=(vs*4), vo8+=28) {
      vout[vo++] = vB[v];   // x
      vout[vo++] = vB[v+1]; // y
      vout[vo++] = vB[v+2]; // z
      vout[vo++] = vB[v+3]; // nx
      vout[vo++] = vB[v+4]; // ny
      vout[vo++] = vB[v+5]; // nz
      vout8[vo8+24] = vB8[v8+24]; vout8[vo8+25] = vB8[v8+25]; vout8[vo8+26] = vB8[v8+26]; vout8[vo8+27] = vB8[v8+27]; vo++; // rgba
    }
          
    vB = meshes[m].indexBuffer;
    for (v=0; v<vB.length; v+=3) {
      iout[io++] = 3;
      iout[io++] = voffset+vB[v];
      iout[io++] = voffset+vB[v+1];
      iout[io++] = voffset+vB[v+2];
    }
          
    voffset += meshes[m].vertexBuffer.length/vs;
  }
        
  var blob = new Blob([header, vout, iout], {type: "application/octet-binary"});
  saveAs(blob, "molmil.ply");
  
  // de-init
  molmil.geometry.skipClearBuffer = false;
};

molmil.exportMPBF = function(soup) {
  if (! window.saveAs) return molmil.loadPlugin(molmil.settings.src+"lib/FileSaver.js", this.exportMPBF, this, [soup]); 
  
  molmil.geometry.skipClearBuffer = true;
  //molmil.geometry.reInitChains = true;
  
  soup.renderer.initBuffers();
  soup.renderer.canvas.update = true;
  molmil.geometry.generate(soup.structures, soup.renderer);
  // do bu stuff...
  
  if (soup.sceneBU && soup.sceneBU.assembly_id != -1) {
    molmil.toggleBU(soup.sceneBU.assembly_id, soup.sceneBU.displayMode, soup.sceneBU.colorMode);
  }
  
  var meshes = soup.renderer.programs;
  
  var prep = [], size = 0;
  
  var rgbaToFloat = function(r, g, b, a) {
    var bits = (a << 24 | b << 16 | g << 8 | r)
    return pack(bits & 0xfeffffff)
}
  
  var m, metadata, name, i, vs, nov, nof;
  for (m=0; m<meshes.length; m++) {
    if (! meshes[m].status || ! meshes[m].data) continue;
    name = m+"";
    while (name.length < 4) name = "0"+name;
    vs = meshes[m].vertexSize || 8;
    nov = meshes[m].data.vertices.length/vs;
    nof = meshes[m].data.indices.length/3;
    
    if (nov == 0) continue;
      // also add support for lines...
    
    if (meshes[m].BUprogram) {
      for (i=0; i<meshes[m].matrices.length; i++) {
        metadata = [3, nov, nof, 0];
    
        size += 4*4; // 4 int32
        size += nov*7*4;
        size += meshes[m].data.indices.length*4;
        prep.push([metadata, meshes[m], i]);
      }   
    }
    else {
      metadata = [3, nov, nof, 0];
    
      size += 4*4; // 4 int32
      size += nov*7*4;
      size += meshes[m].data.indices.length*4;
      prep.push([metadata, meshes[m], null]);
    }
  }
  
  var buffer = new ArrayBuffer(size), offset = 0;
  
  var bufferfloat32 = new Float32Array(buffer);
  var bufferuint8 = new Uint8Array(buffer);
  var bufferint32 = new Int32Array(buffer);

  var xyz = [0, 0, 0], nxyz = [0, 0, 0], rgba = [0, 0, 0, 0], normalMatrix = mat3.create(), matrix, offset8, saa;
  
  for (m=0; m<prep.length; m++) {
    
    bufferint32[offset] = prep[m][0][0]; offset++;
    bufferint32[offset] = prep[m][0][1]; offset++;
    bufferint32[offset] = prep[m][0][2]; offset++;
    bufferint32[offset] = prep[m][0][3]; offset++;

    matrix = prep[m][2] == null ? null : prep[m][1].matrices[prep[m][2]];
    
    if (matrix != null) {
      mat3.normalFromMat4(normalMatrix, matrix);
    }
    
    vs = prep[m][1].vertexSize;
    
    for (i=0, saa=0; i<prep[m][0][1]; i++, offset+=7) {
      saa = i*vs;
      xyz[0] = prep[m][1].data.vertices[saa]; saa++;
      xyz[1] = prep[m][1].data.vertices[saa]; saa++;
      xyz[2] = prep[m][1].data.vertices[saa]; saa++;
      nxyz[0] = prep[m][1].data.vertices[saa]; saa++;
      nxyz[1] = prep[m][1].data.vertices[saa]; saa++;
      nxyz[2] = prep[m][1].data.vertices[saa]; saa++;
      
      if (matrix != null) {
        vec3.transformMat4(xyz, xyz, matrix);
        vec3.transformMat3(nxyz, nxyz, normalMatrix);
        
        if (prep[m][1].settings.uniform_color) {
          offset8 = offset*4;
          bufferuint8[offset8+24] = prep[m][1].uniform_color[prep[m][2]][0];
          bufferuint8[offset8+25] = prep[m][1].uniform_color[prep[m][2]][1];
          bufferuint8[offset8+26] = prep[m][1].uniform_color[prep[m][2]][2];
          bufferuint8[offset8+27] = prep[m][1].uniform_color[prep[m][2]][3];
          saa++;
        }
        else {bufferfloat32[offset+6] = prep[m][1].data.vertices[saa]; saa++;}
      }
      else {bufferfloat32[offset+6] = prep[m][1].data.vertices[saa]; saa++;}
      
      bufferfloat32[offset+0] = xyz[0];
      bufferfloat32[offset+1] = xyz[1];
      bufferfloat32[offset+2] = xyz[2];
      bufferfloat32[offset+3] = nxyz[0];
      bufferfloat32[offset+4] = nxyz[1];
      bufferfloat32[offset+5] = nxyz[2];
    }

    bufferint32.set(prep[m][1].data.indices, offset); offset += prep[m][1].data.indices.length;
  }
  var blob = new Blob([buffer], {type: "application/octet-binary"});
  saveAs(blob, "molmil.mpbf");
  
  molmil.geometry.skipClearBuffer = false;
}

// ** generates an STL file **
molmil.exportSTL = function(soup) {
  if (! window.saveAs) return molmil.loadPlugin(molmil.settings.src+"lib/FileSaver.js", this.exportSTL, this, [soup]); 
  
  soup = soup || molmil.cli_soup;
  
  molmil.geometry.skipClearBuffer = true;
  molmil.geometry.reInitChains = true;
  
  soup.renderer.initBuffers();
  soup.renderer.canvas.update = true;
  molmil.geometry.generate(soup.structures, soup.renderer);
  
  // regenerate 
  
  var meshes = [];
  if (molmil.geometry.buffer1) meshes.push(molmil.geometry.buffer1);
  if (molmil.geometry.buffer3) meshes.push(molmil.geometry.buffer3);
  if (molmil.geometry.buffer4) meshes.push(molmil.geometry.buffer4);
  for (var i=0; i<soup.structures.length; i++) {
    if (soup.structures[i] instanceof molmil.polygonObject && soup.structures[i].data) meshes.push(soup.structures[i].data);
  }
  
  // output
  
  var m, nov=0, nof=0, vs;
        
  for (m=0; m<meshes.length; m++) {
    vs = meshes[m].vertexSize || 8;
    nov += meshes[m].vertexBuffer.length / vs;
    nof += meshes[m].indexBuffer.length / 3;
 }
        
  var header = "generated by Molmil"; header += new Array(80-header.length+1).join(" ");
  var nof_ = new Uint32Array(1); nof_[0] = nof;
  var bin = [header, nof_];
        
  var m, floatT, uint16T, vB, iB, i, v1 = [0, 0, 0], v2 = [0, 0, 0], v3 = [0, 0, 0], u1 = [0, 0, 0], u2 = [0, 0, 0], v;
        
  for (m=0; m<meshes.length; m++) {
    vB = meshes[m].vertexBuffer;
    iB = meshes[m].indexBuffer;
    vs = meshes[m].vertexSize || 8;
    for (v=0; v<iB.length; v+=3) {
      floatT = new Float32Array(12);
      uint16T = new Uint16Array(1); uint16T[0] = 0;
                   
      i = iB[v] * vs;
      v1[0] = floatT[ 3] = vB[i]; // x1
      v1[1] = floatT[ 4] = vB[i+1]; // y1
      v1[2] = floatT[ 5] = vB[i+2]; // z1
                        
      i = iB[v+1] * vs;
      v2[0] = floatT[ 6] = vB[i]; // x1
      v2[1] = floatT[ 7] = vB[i+1]; // y1
      v2[2] = floatT[ 8] = vB[i+2]; // z1
            
      i = iB[v+2] * vs;
      v3[0] = floatT[ 9] = vB[i]; // x1
      v3[1] = floatT[10] = vB[i+1]; // y1
      v3[2] = floatT[11] = vB[i+2]; // z1

      vec3.min(u1, v2, v1); vec3.normalize(u1, u1);
      vec3.min(u2, v3, v1); vec3.normalize(u2, u2);
            
      floatT[ 0] = u1[1]*u2[2] - u1[2]*u2[1]; // nx
      floatT[ 1] = u1[2]*u2[0] - u1[0]*u2[2]; // ny
      floatT[ 2] = u1[0]*u2[1] - u1[1]*u2[0]; // nz
            
      bin.push(floatT);
      bin.push(uint16T);
    }
          
  }

  var blob = new Blob(bin, {type: "application/octet-binary"});

  saveAs(blob, "molmil.stl");
  
  // de-init
  molmil.geometry.skipClearBuffer = false;
};

