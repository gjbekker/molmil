function isNumber(n) {
  return ! isNaN(parseFloat(n)) && isFinite(n);
}

// loop over it normally; soup->structs->chains->molecules->atoms, then check if aid is in atomSelection; if not --> skip

molmil.saveJSO = function(soup, atomSelection, modelId, file) {
  if (! window.saveAs && ! molmil.configBox.customSaveFunction) return molmil.loadPlugin(molmil.settings.src+"lib/FileSaver.js", molmil.saveJSO, molmil, [soup, atomSelection, modelId, file]); 
  
  var format = file ? molmil.guess_format(file) : null;
  
  if (! window.CIFparser && format == "mmcif") return molmil.loadPlugin(molmil.settings.src+"lib/cif.js", molmil.saveJSO, molmil, [soup, atomSelection, modelId, file]);
  
  soup = soup || molmil.cli_soup;
  var struct;
  for (var i=0; i<soup.structures.length; i++) if (soup.structures[i] instanceof molmil.entryObject) {struct = soup.structures[i]; break;}
  
  var atom_site = {group_PDB: [], type_symbol: [], label_atom_id: [], label_alt_id: [], label_comp_id: [], label_asym_id: [], label_entity_id: [], label_seq_id: [], Cartn_x: [], Cartn_y: [], Cartn_z: [], auth_asym_id: [], id: []};
  
  var info = new Set(atomSelection);
  
  var c, id = 1;
  var m, matrix, buid;
  var chain, residue, atom;
  var xyzin = vec3.create(), xyzout = vec3.create(), cp, bucounter = 1;

  for (c=0; c<struct.chains.length; c++) {
    chain = struct.chains[c];

    for (m=0; m<chain.molecules.length; m++) {
      residue = chain.molecules[m];
    
      for (a=0; a<residue.atoms.length; a++) {
        atom = residue.atoms[a];
        if (! info.has(atom)) continue;
        atom_site.group_PDB.push(residue.ligand ? "HETATM" : "ATOM");
        atom_site.Cartn_x.push(chain.modelsXYZ[0][atom.xyz]);
        atom_site.Cartn_y.push(chain.modelsXYZ[0][atom.xyz+1]);
        atom_site.Cartn_z.push(chain.modelsXYZ[0][atom.xyz+2]);
        atom_site.auth_asym_id.push(chain.authName);
        atom_site.label_asym_id.push(chain.name);
        atom_site.label_alt_id.push(atom.label_alt_id||".");
        atom_site.label_atom_id.push(atom.atomName);
        atom_site.label_comp_id.push(residue.name);
        atom_site.label_entity_id.push(chain.entity_id||".");
        atom_site.label_seq_id.push(residue.RSID);
        atom_site.type_symbol.push(atom.element);
        atom_site.id.push(id++);
      }
    }
  }
  
  var obj = {atom_site: atom_site};
  
  if (file === undefined) return obj;

  var pdbid = (struct.meta.pdbid || "").toUpperCase();
  var jso_out = {}; jso_out["data"+(pdbid ? "_"+pdbid : "")] = obj;
  
  if (format == "mmcif") jso_out = dumpCIF(jso_out);
  else jso_out = JSON.stringify(jso_out);

  if (molmil.configBox.customSaveFunction) molmil.configBox.customSaveFunction(file, jso_out, "utf8");
  else {
    var blob = new Blob([jso_out], {type: "text/plain;charset=utf-8"});
    saveAs(blob, file);
  }
}

molmil.savePDB = function(soup, atomSelection, modelId, file) {
  if (! window.saveAs && ! molmil.configBox.customSaveFunction) return molmil.loadPlugin(molmil.settings.src+"lib/FileSaver.js", molmil.savePDB, molmil, [soup, atomSelection, modelId, file]); 
  var info = new Set(atomSelection);
  var saveMapping = {};
  
  var s, c, a, atom, aid = 1, out = "", gname, aname, rname, cname, rid, x, y, z, prevChain = null, b;
  var saveModel = function(modelId_) {
    for (s=0; s<soup.structures.length; s++) {
      for (c=0; c<soup.structures[s].chains.length; c++) {
        for (a=0; a<soup.structures[s].chains[c].atoms.length; a++) {
          atom = soup.structures[s].chains[c].atoms[a];
          if (! info.has(atom)) continue;
          if (molmil.configBox.save_pdb_chain_only_change) {
            if (prevChain && (prevChain.authName || prevChain.name || "") != (atom.chain.authName || atom.chain.name || "")) out += "TER\n"
          }
          else if (prevChain && atom.chain != prevChain) out += "TER\n"
          prevChain = atom.chain;
          aid = aid%99999;
        
          gname = "ATOM  ";
          if (atom.molecule.ligand) gname = "HETATM";

          aname = atom.atomName.substr(0,4);
          rname = atom.molecule.name;
          
          if (aname != rname && ! isNumber(aname[0]) && aname.length < 4) aname = ' ' + aname;
    
          rid = molmil.configBox.save_pdb_label ? (atom.molecule.id||"") : (atom.molecule.RSID||"").substr(0,4);

          cname = (atom.chain.authName || atom.chain.name || "").substr(0,1);

          x = atom.chain.modelsXYZ[modelId_][atom.xyz].toFixed(3);
          y = atom.chain.modelsXYZ[modelId_][atom.xyz+1].toFixed(3);
          z = atom.chain.modelsXYZ[modelId_][atom.xyz+2].toFixed(3);
    
          out += gname + (aid+'').padStart(5) + " " + aname.padEnd(4) + " " + rname.padStart(3) + cname.padStart(2) + (rid+'').padStart(4) + "    " + (x+'').padStart(8) + (y+'').padStart(8) + (z+'').padStart(8) + ('1.00').padStart(6) + ('0.00').padStart(6) + "          " + atom.element.toUpperCase().padStart(2) + "\n";
          saveMapping[atom.AID] = aid;
          aid++;
        }
      }
    }
  };
  

  if (modelId == "all") {
    var nmod = soup.structures[0].chains[0].modelsXYZ.length;
    for (var i=0; i<nmod; i++) {
      out += "MODEL" + ((i+1)+'').padStart(9) + "\n";
      aid = 1;
      saveModel(i);
      out += "ENDMDL\n";
    }
  }
  else saveModel(modelId);

  for (s=0; s<soup.structures.length; s++) {
    for (c=0; c<soup.structures[s].chains.length; c++) {
      if (soup.structures[s].chains[c].isHet && ! soup.structures[s].chains[c].bondsOK) soup.buildBondList(soup.structures[s].chains[c], false);
    }
  }
  
  var CONECT = {};
  
  var a1, a2, aid1, aid2;
  for (s=0; s<soup.structures.length; s++) {
    for (c=0; c<soup.structures[s].chains.length; c++) {
      for (b=0; b<soup.structures[s].chains[c].bonds.length; b++) {
        a1 = soup.structures[s].chains[c].bonds[b][0];
        a2 = soup.structures[s].chains[c].bonds[b][1];
        if (! a1.molecule.ligand && ! a2.molecule.ligand) continue;
        aid1 = saveMapping[a1.AID]; aid2 = saveMapping[a2.AID];
        if (aid1 === undefined || aid2 === undefined) continue;
        if (a1.molecule.ligand) {
          if (CONECT[aid1] === undefined) CONECT[aid1] = new Set();
          CONECT[aid1].add(aid2);
        }
        if (a2.molecule.ligand) {
          if (CONECT[aid2] === undefined) CONECT[aid2] = new Set();
          CONECT[aid2].add(aid1);
        }
      }
    }
  }
    
  for (aid1 in CONECT) {
    if (CONECT[aid1].size == 0) continue;
    out += "CONECT" + (aid1+'').padStart(5);
    for (aid2 of CONECT[aid1]) out += (aid2+'').padStart(5);
    out += "\n";
  }

  if (molmil.configBox.customSaveFunction) molmil.configBox.customSaveFunction(file, out, "utf8");
  else {
    var blob = new Blob([out], {type: "text/plain;charset=utf-8"});
    saveAs(blob, file);
  }
}

molmil.saveBU = function(assembly_id, options, struct, soup) {
  if (! molmil.BU2JSO) return molmil.loadPlugin(molmil.settings.src+"plugins/misc.js", molmil.saveBU, molmil, [assembly_id, options, struct, soup]);
  if (! molmil.configBox.customSaveFunction && ! window.saveAs) return molmil.loadPlugin(molmil.settings.src+"lib/FileSaver.js", molmil.saveBU, molmil, [assembly_id, options, struct, soup]);
  if (! window.CIFparser && options.format == "mmcif") return molmil.loadPlugin(molmil.settings.src+"lib/cif.js", molmil.saveBU, molmil, [assembly_id, options, struct, soup]);
  soup = soup || molmil.cli_soup;
  if (! struct) {for (var i=0; i<soup.structures.length; i++) if (soup.structures[i] instanceof molmil.entryObject) {struct = soup.structures[i]; break;}}
  var pdbid = (struct.meta.pdbid || "").toUpperCase();
  
  options = options || {};
  options.format = options.format || "mmjson";
  if (options.format == "pdb") options.modelMode = true;
  var jso = molmil.BU2JSO(assembly_id, options, struct, soup);
  var out = "";
  
  if (options.format == "mmjson") {
    if (! options.filename) options.filename = "BU"+(pdbid ? "_"+pdbid : "")+".json";
    var jso_out = {}; jso_out["data"+(pdbid ? "_"+pdbid : "")+"_BU"] = jso;
    out = JSON.stringify(jso_out);
  }
  else if (options.format == "mmcif") {
    if (! options.filename) options.filename = "BU"+(pdbid ? "_"+pdbid : "")+".cif";
    var jso_out = {}; jso_out["data"+(pdbid ? "_"+pdbid : "")+"_BU"] = jso;
    out = dumpCIF(jso_out);
  }
  else if (options.format == "pdb") {
    if (! options.filename) options.filename = "BU"+(pdbid ? "_"+pdbid : "")+".pdb";
    var aname, cname, rid, prevMdl;
    for (var aid=0; aid<jso.atom_site.Cartn_x.length; aid++) {
      if (prevMdl != jso.atom_site.pdbx_PDB_model_num[aid]) {
        if (aid != 0) out += "ENDMDL\n";
        out += "MODEL "+jso.atom_site.pdbx_PDB_model_num[aid]+"\n";
        prevMdl = jso.atom_site.pdbx_PDB_model_num[aid];
      }
      aname = jso.atom_site.label_atom_id[aid].substr(0,4);
      if (! isNumber(aname[0]) && aname.length < 4) aname = ' ' + aname;
      cname = (jso.atom_site.auth_asym_id[aid] || jso.atom_site.label_asym_id[aid] || "").substr(0,2);
      rid = (jso.atom_site.label_seq_id[aid]||"").substr(0,4);

      out += jso.atom_site.group_PDB[aid].padEnd(6) + ((aid+1)+'').padStart(5) + " " + aname.padEnd(4) + " " + jso.atom_site.label_comp_id[aid].padStart(3) + cname.padStart(2) + (rid+'').padStart(4) + "    " + jso.atom_site.Cartn_x[aid].toFixed(3).padStart(8) + jso.atom_site.Cartn_y[aid].toFixed(3).padStart(8) + jso.atom_site.Cartn_z[aid].toFixed(3).padStart(8) + "\n";
    }
  }
  else {
    return console.error("Unsupported format", options.format);
  }
  
  if (molmil.configBox.customSaveFunction) molmil.configBox.customSaveFunction(options.filename, out, "utf8");
  else {
    var blob = new Blob([out], {type: "text/plain;charset=utf-8"});
    saveAs(blob, options.filename);
  }
  
}

// ** generates a PLY file **
molmil.exportPLY = function(soup, file) {
  if (! window.saveAs) return molmil.loadPlugin(molmil.settings.src+"lib/FileSaver.js", this.exportPLY, this, [soup, file]);
  file = file || "molmil.ply";
  
  soup = soup || molmil.cli_soup;
  
  molmil.geometry.skipClearBuffer = true;
  molmil.geometry.reInitChains = true;
  
  soup.renderer.initBuffers();
  soup.renderer.canvas.update = true;
  molmil.geometry.generate(soup.structures, soup.renderer);
  
  // regenerate 
  var meshes = [], edges = [];
  if (molmil.geometry.buffer1) meshes.push(molmil.geometry.buffer1);
  if (molmil.geometry.buffer2) edges.push(molmil.geometry.buffer2);
  if (molmil.geometry.buffer3) meshes.push(molmil.geometry.buffer3);
  if (molmil.geometry.buffer4) meshes.push(molmil.geometry.buffer4);
  for (var i=0; i<soup.structures.length; i++) {
    if (soup.structures[i] instanceof molmil.polygonObject && soup.structures[i].data) meshes.push(soup.structures[i].data);
    if (soup.structures[i].structures) {
      for (var j=0; j<soup.structures[i].structures.length; j++) if (soup.structures[i].structures[j] instanceof molmil.polygonObject && soup.structures[i].structures[j].data) meshes.push(soup.structures[i].structures[j].data);
    }
  }

  // output
  
  var m, nov=0, nof=0, vs, edgeMode = false;
        
  for (m=0; m<meshes.length; m++) {
    vs = meshes[m].vertexSize || 8;
    nov += meshes[m].vertexBuffer.length / vs;
    nof += meshes[m].indexBuffer.length / 3;
  }
  
  if (nov == 0) { // skip to edge mode
    edgeMode = true;
    for (m=0; m<edges.length; m++) {
      vs = edges[m].vertexSize || 5;
      nov += edges[m].vertexBuffer.length / vs;
      nof += edges[m].indexBuffer.length / 2; // not actually faces
    }
    
    var header = "ply\nformat binary_little_endian 1.0\nelement vertex "+nov+"\nproperty float x\nproperty float y\nproperty float z\nproperty uint8 red\nproperty uint8 green\nproperty uint8 blue\nproperty uint8 alpha\nelement edge "+nof+"\nproperty int vertex1\nproperty int vertex2\nend_header\n";

    var vout = new Float32Array(nov*4);
    var vout8 = new Uint8Array(vout.buffer);
    var iout = new Int32Array(nof*2);
          
    var v, v8, vo=0, vo8=0, io=0, vB, vB8, voffset = 0;
        
    for (m=0; m<edges.length; m++) {
      vs = edges[m].vertexSize || 5;
      
      vB = edges[m].vertexBuffer;
      vB8 = new Uint8Array(vB.buffer, edges[m].vertices_offset);
      for (v=0, v8=0; v<vB.length; v+=vs, v8+=(vs*4), vo8+=16) {
        vout[vo++] = vB[v];   // x
        vout[vo++] = vB[v+1]; // y
        vout[vo++] = vB[v+2]; // z
        vout8[vo8+12] = vB8[v8+12]; vout8[vo8+13] = vB8[v8+13]; vout8[vo8+14] = vB8[v8+14]; vout8[vo8+15] = vB8[v8+15]; vo++; // rgba
      }
      
      vB = edges[m].indexBuffer;
      for (v=0; v<vB.length; v+=2) {
        iout[io++] = voffset+vB[v];
        iout[io++] = voffset+vB[v+1];
      }
      
      voffset += edges[m].vertexBuffer.length/vs;
    }
  }
  else {
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
  }

  var blob = new Blob([header, vout, iout], {type: "application/octet-binary"});
  //saveAs(blob, "molmil.ply");
  
 
  if (molmil.configBox.customSaveFunction) blobToBase64(blob).then(function(content) {molmil.configBox.customSaveFunction(file, content, "base64-bin");});
  else saveAs(blob, file);
  
  // de-init
  molmil.geometry.skipClearBuffer = false;
};

function blobToBase64(blob) {
  const reader = new FileReader();
  reader.readAsDataURL(blob);
  return new Promise(resolve => {
    reader.onloadend = () => {
      resolve(reader.result);
    };
  });
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
    if (soup.structures[i].structures) {
      for (var j=0; j<soup.structures[i].structures.length; j++) if (soup.structures[i].structures[j] instanceof molmil.polygonObject && soup.structures[i].structures[j].data) meshes.push(soup.structures[i].structures[j].data);
    }
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

