var Zmatinfo = {};
Zmatinfo["ACE"] = [["C", "N(+1)", "CA(+1)", "C(+1)", 1.34, 120, -73], ["O", "C", "N(+1)", "CA(+1)", 1.23, 120, 0], ["CH3", "C", "N(+1)", "CA(+1)", 1.5, 120, 180]];
Zmatinfo["NME"] = [["N", "C(-1)", "O(-1)", "CA(-1)", 1.34, 120, -180], ["CH3", "N", "C(-1)", "O(-1)", 1.45, 120, 0]];

molmil.setAngle = function(a1, a2, a3, angle) {
  // vec should be perpendicular to the plane defined by a1,a2,a3
  
  var A = vec3.sub([0, 0, 0], a1, a2); vec3.normalize(A, A);
  var B = vec3.sub([0, 0, 0], a3, a2); vec3.normalize(B, B);
  var vec = vec3.cross([0, 0, 0], A, B); vec3.normalize(vec, vec);
  
  var curAngle = molmil.calcAngle(a1, a2, a3);
  
  a1[0] -= a2[0]; a1[1] -= a2[1]; a1[2] -= a2[2];
  var rotmat = mat4.create(); mat4.fromRotation(rotmat, (curAngle-angle)*(Math.PI/180.), vec);
  vec3.transformMat4(a1, a1, rotmat);
  a1[0] += a2[0]; a1[1] += a2[1]; a1[2] += a2[2];
};

molmil.setTorsion = function(a1, a2, a3, a4, angle) {
  var vec = vec3.sub([0, 0, 0], a3, a2); vec3.normalize(vec, vec);
  
  var curTorsion = molmil.calcTorsion(a1, a2, a3, a4);
  a1[0] -= a2[0]; a1[1] -= a2[1]; a1[2] -= a2[2];
  var rotmat = mat4.create(); mat4.fromRotation(rotmat, (curTorsion-angle)*(Math.PI/180.), vec);
  vec3.transformMat4(a1, a1, rotmat);
  a1[0] += a2[0]; a1[1] += a2[1]; a1[2] += a2[2];
};

molmil.attachResidue = function(parentResidue, newResType, soup) {
  if (! Zmatinfo.hasOwnProperty(newResType)) {
    console.error("Unsupported residue type:", newResType)
    return;
  }
  soup = soup || molmil.cli_soup;
  
  var resType = Zmatinfo[newResType], plusOne = false, minusOne = false;
  for (var i=0; i<resType.length; i++) {
    for (var j=0; j<4; j++) {
      plusOne = plusOne || resType[i][j].endsWith("(+1)");
      minusOne = minusOne || resType[i][j].endsWith("(-1)");
    }
  }
  
  if (! plusOne && minusOne && ! parentResidue.next) resIdx = 1;
  else if (! minusOne && plusOne && ! parentResidue.previous) resIdx = -1;
  else if (! parentResidue.previous) resIdx = -1;
  else if (! parentResidue.next) resIdx = 1;
  else {
    console.error("Cannot attach...");
    return;
  }

  var newRes = new molmil.molObject(newResType, parseInt(parentResidue.id)+resIdx, parentResidue.chain);
  newRes.RSID = newRes.id+"";
  
  var a1, a2, a3, a4, atom;
  
  var name, refMol, ap;
  var fetchAtom = function(name) {
    if (name.indexOf("(-1)") != -1) {
      name = name.replace("(-1)", "");
      refMol = parentResidue;
    }
    else if (name.indexOf("(+1)") != -1) {
      name = name.replace("(+1)", "")
      refMol = parentResidue;
    }
    else refMol = newRes;
    for (ap=0; ap<refMol.atoms.length; ap++) {
      if (refMol.atoms[ap].atomName == name) return refMol.atoms[ap];
    }
  };

  var atomName, element, offset, Xpos;
  for (a=0; a<resType.length; a++) {
    a2 = fetchAtom(resType[a][1]); 
    a3 = fetchAtom(resType[a][2]); a4 = fetchAtom(resType[a][3]);
    if (! a2) {
      console.error("Missing atom (2):", resType[a][1]);
      return;
    }
    if (! a3) {
      console.error("Missing atom (3):", resType[a][2]);
      return;
    }
    if (! a4) {
      console.error("Missing atom (4):", resType[a][3]);
      return;
    }
    a2 = molmil.getAtomXYZ(a2, soup);
    a3 = molmil.getAtomXYZ(a3, soup);
    a4 = molmil.getAtomXYZ(a4, soup);

    a1 = [a2[0], a2[1], a2[2]+resType[a][4]]; // set distance
    
    molmil.setAngle(a1, a2, a3, resType[a][5]);
    molmil.setTorsion(a1, a2, a3, a4, resType[a][6]);
    
    atomName = resType[a][0];
    
    if (molmil.AATypes.hasOwnProperty(newRes.name.substr(0, 3))) {
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
    Xpos = newRes.chain.modelsXYZ[0].length;
    newRes.chain.modelsXYZ[0].push(a1[0], a1[1], a1[2]);
    
    newRes.atoms.push(atom=new molmil.atomObject(Xpos, atomName, element, newRes, newRes.chain));
  }
  
  // add the new residue to the soup.....
  
  var pidx = parentResidue.chain.molecules.indexOf(parentResidue);
  
  if (resIdx == -1) {
    parentResidue.chain.molecules.splice(pidx, 0, newRes);
    parentResidue.previous = newRes;
    newRes.next = parentResidue;
  }
  else { 
    parentResidue.chain.molecules.splice(pidx+1, 0, newRes);
    parentResidue.next = newRes;
    newRes.previous = parentResidue;
  }
  
  if (resIdx == -1) pidx = parentResidue.chain.atoms.indexOf(parentResidue.atoms[0]);
  else pidx = parentResidue.chain.atoms.indexOf(parentResidue.atoms.slice(-1)[0])+1;
  
  for (a=0; a<newRes.atoms.length; a++) {
    newRes.chain.atoms.splice(pidx, 0, newRes.atoms[a]);
    newRes.atoms[a].AID = soup.AID++;
    soup.atomRef[newRes.atoms[a].AID] = newRes.atoms[a];
  }
  newRes.MID = soup.MID++;
  
  newRes.ligand = ! molmil.AATypes.hasOwnProperty(newRes.name.substr(0, 3));
  return newRes;
}

// ** build coarse surface representation **
molmil.tubeSurface = function(chains, settings, soup) { // volumetric doesn't draw simple tubes, it adds volume (radii at different positions along the tube) to the tube
  if (chains instanceof molmil.chainObject) chains = [chains];
  if (! chains.length) return;
  
  soup = soup || molmil.cli_soup;
  settings = settings || {};
  var rgba;

  var CB_NOI = molmil.configBox.QLV_SETTINGS[soup.renderer.QLV].CB_NOI/32; // NOI per A
  
  var chainRepr = [], c, radii = [], chain;
  
  for (c=0; c<chains.length; c++) {
    chain = chains[c];
    rgba = settings.rgba || chain.rgba;
    var xyzs = [], modelsXYZ = chain.modelsXYZ[soup.renderer.modelId];
    var COG = [0.0, 0.0, 0.0, 0]
    for (var m=0; m<chain.molecules.length; m++) {
      if (! chain.molecules[m].CA) continue;
      xyzs.push([modelsXYZ[chain.molecules[m].CA.xyz], modelsXYZ[chain.molecules[m].CA.xyz+1], modelsXYZ[chain.molecules[m].CA.xyz+2]]);
    
      COG[0] += modelsXYZ[chain.molecules[m].CA.xyz];
      COG[1] += modelsXYZ[chain.molecules[m].CA.xyz+1];
      COG[2] += modelsXYZ[chain.molecules[m].CA.xyz+2]
      COG[3] += 1;
    }
    if (COG[3] < 2) continue;
    COG[0] /= COG[3]; COG[1] /= COG[3]; COG[2] /= COG[3];
  
    var n, i, j, C_ij = [[0.0, 0.0, 0.0], [0.0, 0.0, 0.0], [0.0, 0.0, 0.0]], x, y, z;
    
    for (n=0; n<xyzs.length; n++) {
      x = xyzs[n][0] - COG[0]; y = xyzs[n][1] - COG[1]; z = xyzs[n][2] - COG[2];
      C_ij[0][0] += x * x; C_ij[1][1] += y * y; C_ij[2][2] += z * z;
      C_ij[0][1] += x * y; C_ij[0][2] += x * z; C_ij[1][2] += y * z;
    }
  
    var Ninv = 1./xyzs.length;
    C_ij[0][0] *= Ninv; C_ij[1][1] *= Ninv; C_ij[2][2] *= Ninv;
    C_ij[0][1] = C_ij[1][0] = C_ij[0][1] * Ninv; C_ij[0][2] = C_ij[2][0] = C_ij[0][2] * Ninv; C_ij[1][2] = C_ij[2][1] = C_ij[1][2] * Ninv; 
  

    var v1 = [1, 1, 1];
    var A = new Float64Array(9);
    A[0] = C_ij[0][0]; A[1] = C_ij[0][1]; A[2] = C_ij[0][2];
    A[3] = C_ij[1][0]; A[4] = C_ij[1][1]; A[5] = C_ij[1][2];
    A[6] = C_ij[2][0]; A[7] = C_ij[2][1]; A[8] = C_ij[2][2];
  
  
    var maxIter = 1e4;
    var tolerance = 1e-9, i = 0, lambdaOld = 0, lambda = 0, z = new Float64Array(3);
  
    var powerIteration_vec3 = function(v) {
      i = 0; lambdaOld = 0;
      lambda = Math.sqrt(v[0]*v[0] + v[1]*v[1] + v[2]*v[2]);
      v[0] /= lambda; v[1] /= lambda; v[2] /= lambda;
  
      while (i <= maxIter) {
        vec3.transformMat3(z, v, A);
        lambda = Math.sqrt(z[0]*z[0] + z[1]*z[1] + z[2]*z[2]);
        v[0] = z[0]/lambda; v[1] = z[1]/lambda; v[2] = z[2]/lambda;
        if (Math.abs((lambda-lambdaOld)/lambda) < tolerance) break;
        lambdaOld = lambda;
        i++;
      }
     
    }
    
    powerIteration_vec3(v1);

    var sf = vec3.squaredLength(z)/lambda;
    
    var vvT = new Float64Array(9);
    vvT[0] = v1[0]*v1[0]*sf; vvT[1] = v1[0]*v1[1]*sf; vvT[2] = v1[0]*v1[2]*sf;
    vvT[3] = v1[1]*v1[0]*sf; vvT[4] = v1[1]*v1[1]*sf; vvT[5] = v1[1]*v1[2]*sf;
    vvT[6] = v1[2]*v1[0]*sf; vvT[7] = v1[2]*v1[1]*sf; vvT[8] = v1[2]*v1[2]*sf;
    
    A[0] -= vvT[0]; A[1] -= vvT[1]; A[2] -= vvT[2]; A[3] -= vvT[3]; A[4] -= vvT[4]; A[5] -= vvT[5]; A[6] -= vvT[6]; A[7] -= vvT[7]; A[8] -= vvT[8];

    var v2 = [1, 1, 1];
    
    powerIteration_vec3(v2);
    
    var sf = vec3.squaredLength(z)/lambda;
    
    var vvT = new Float64Array(9);
    vvT[0] = v2[0]*v2[0]*sf; vvT[1] = v2[0]*v2[1]*sf; vvT[2] = v2[0]*v2[2]*sf;
    vvT[3] = v2[1]*v2[0]*sf; vvT[4] = v2[1]*v2[1]*sf; vvT[5] = v2[1]*v2[2]*sf;
    vvT[6] = v2[2]*v2[0]*sf; vvT[7] = v2[2]*v2[1]*sf; vvT[8] = v2[2]*v2[2]*sf;
    
    A[0] -= vvT[0]; A[1] -= vvT[1]; A[2] -= vvT[2]; A[3] -= vvT[3]; A[4] -= vvT[4]; A[5] -= vvT[5]; A[6] -= vvT[6]; A[7] -= vvT[7]; A[8] -= vvT[8];
    
    var v3 = [1, 1, 1];
    powerIteration_vec3(v3);
    
    // v1T is what???
  
    var PC1 = [], minVal = [1e99, -1], maxVal = [-1e99, -1], PC2 = [], PC3 = [];
    for (n=0; n<xyzs.length; n++) {
      x = (xyzs[n][0]-COG[0]) * v1[0] + (xyzs[n][1]-COG[1]) * v1[1] + (xyzs[n][2]-COG[2]) * v1[2];
      y = (xyzs[n][0]-COG[0]) * v2[0] + (xyzs[n][1]-COG[1]) * v2[1] + (xyzs[n][2]-COG[2]) * v2[2];
      z = (xyzs[n][0]-COG[0]) * v3[0] + (xyzs[n][1]-COG[1]) * v3[1] + (xyzs[n][2]-COG[2]) * v3[2];
      PC1.push(x); PC2.push(Math.abs(y)); PC3.push(Math.abs(z));
      if (x < minVal[0]) {minVal[0] = x; minVal[1] = n;}
      if (x > maxVal[0]) {maxVal[0] = x; maxVal[1] = n;}
    }

    x = [xyzs[minVal[1]][0], COG[0], xyzs[maxVal[1]][0]];
    y = [xyzs[minVal[1]][1], COG[1], xyzs[maxVal[1]][1]];
    z = [xyzs[minVal[1]][2], COG[2], xyzs[maxVal[1]][2]];
  
    var base = [0, 0, 0];
    base[1] = Math.sqrt(Math.pow(x[1] - x[0], 2) + Math.pow(y[1] - y[0], 2) + Math.pow(z[1] - z[0], 2));
    base[2] = base[1] + Math.sqrt(Math.pow(x[2] - x[1], 2) + Math.pow(y[2] - y[1], 2) + Math.pow(z[2] - z[1], 2));

    x = molmil.polynomialFit(base, x, 2); y = molmil.polynomialFit(base, y, 2); z = molmil.polynomialFit(base, z, 2);
  
    var NOI = Math.ceil(base[2]*CB_NOI);
    var dbi = base[2] / NOI;
    
    var PC1_ = [];
    for (i=0; i<PC1.length; i++) PC1_.push(PC1[i]-minVal[0]);
    PC1_.push(0.0); PC1_.push(maxVal[0]-minVal[0]);
    PC2.push(0); PC2.push(0); PC3.push(0); PC3.push(0);
    
    var PC2_r = molmil.polynomialFit(PC1_, PC2, 3); 
    var PC3_r = molmil.polynomialFit(PC1_, PC3, 3);

    var waypoints = [[molmil.polynomialCalc(0.0, x), molmil.polynomialCalc(0.0, y), molmil.polynomialCalc(0.0, z)]], lambda = 0.0;
    var radius = [[settings.radius || molmil.polynomialCalc(0.0, PC2_r), settings.radius || molmil.polynomialCalc(0.0, PC3_r)]];
    
    waypoints.push(waypoints[0]);
    radius.push(radius[0]);
    
    for (i=1; i<NOI+1; i++) {
      lambda += dbi;
      waypoints.push([molmil.polynomialCalc(lambda, x), molmil.polynomialCalc(lambda, y), molmil.polynomialCalc(lambda, z)]);
      radius.push([settings.radius || Math.max(molmil.polynomialCalc(lambda, PC2_r)*2, 0.0), settings.radius || Math.max(molmil.polynomialCalc(lambda, PC3_r)*2, 0.0)]);
      //radius.push([settings.radius || Math.max(molmil.polynomialCalc(lambda, PC3_r)*2, 0.0), settings.radius || Math.max(molmil.polynomialCalc(lambda, PC2_r)*2, 0.0)]);
    }    
    waypoints.push(waypoints[waypoints.length-1]);
    radius.push(radius[radius.length-1]);
    
    radius[0][0] = radius[1][0] = (radius[0][0]+radius[2][0])*.5;
    radius[0][1] = radius[0][1] = (radius[0][1]+radius[2][1])*.5;
    radius[radius.length-1][0] = radius[radius.length-2][0] = (radius[radius.length-1][0]+radius[radius.length-3][0])*.5;
    radius[radius.length-1][1] = radius[radius.length-2][1] = (radius[radius.length-1][1]+radius[radius.length-3][1])*.5;

    chainRepr.push(waypoints);
    radii.push(radius);
  }
  var avgR = [0.0, 0]
  
  for (c=0; c<chainRepr.length; c++) {
    for (n=1; n<chainRepr[c].length-1; n++) {
      avgR[0] += radii[c][n][0] + radii[c][n][1];
      avgR[1] += 2;
    }
  }

  avgR = avgR[0]/avgR[1];

  var CB_NOVPR = Math.max(Math.ceil(molmil.configBox.QLV_SETTINGS[soup.renderer.QLV].CB_NOVPR * .125 * avgR), 6);
  
  // now draw an ellipsoid from waypoints & r
  // at the 1st and last waypoints, also draw an extra point in the center of the ring to 
  
  var theta = 0.0, rad = 2.0/CB_NOVPR, ringTemplate = [];
  for (i=0; i<CB_NOVPR; i++) {
    x = Math.cos(theta*Math.PI);
    y = Math.sin(theta*Math.PI);
    ringTemplate.push([x, y, 0]);
    theta += rad;
  }
  
  var wpl = 0;
  for (c=0; c<chainRepr.length; c++) wpl += chainRepr[c].length;

  var vBuffer = new Float32Array(((wpl*CB_NOVPR)+(2*chainRepr.length))*7);
  var vBuffer8 = new Uint8Array(vBuffer.buffer);
  if (molmil.configBox.OES_element_index_uint) var iBuffer = new Uint32Array((((wpl-1)*CB_NOVPR*2) + (CB_NOVPR*2))*3);
  else var iBuffer = new Uint16Array(((wpl*CB_NOVPR*2) + (CB_NOVPR*2))*3);
  
  var vP = 0, iP = 0, vP8 = 0;
  
  var Nx, Ny, Nz, Bx, By, Bz, Px, Py, Pz; // in the future add scaling so that a more volumetric ellipsoid can be created

  var identityMatrix = mat4.create(), rotationMatrix = mat4.create(), smallest, tangents = [], vec, normal = new Float32Array(3), binormal = new Float32Array(3), delta = 0.0001;
  
  var p = 0, p_pre = 0;
  for (c=0; c<chainRepr.length; c++) {
    waypoints = chainRepr[c];
    radius = radii[c];
    
    tangents = [];
  
    vec = new Float32Array(3); vec3.subtract(vec, waypoints[1], waypoints[0]); vec3.normalize(vec, vec); tangents.push(vec);
    for (n=1; n<waypoints.length-1; n++) {vec = new Float32Array(3); vec3.subtract(vec, waypoints[n+1], waypoints[n-1]); vec3.normalize(vec, vec); tangents.push(vec);}
    tangents.push(vec);
    vec = new Float32Array(3); 
    
    tangents[0][0] += tangents[1][0]; tangents[0][1] += tangents[1][1]; tangents[0][2] += tangents[1][2];
    vec3.normalize(tangents[0], tangents[0]);
    
    vBuffer[vP++] = waypoints[0][0]; vBuffer[vP++] = waypoints[0][1]; vBuffer[vP++] = waypoints[0][2];
    vBuffer[vP++] = -tangents[0][0]; vBuffer[vP++] = -tangents[0][1]; vBuffer[vP++] = -tangents[0][2];
    vBuffer8[vP8+24] = rgba[0]; vBuffer8[vP8+25] = rgba[1]; vBuffer8[vP8+26] = rgba[2]; vBuffer8[vP8+27] = rgba[3]; vP++; vP8 += 28;

    
    tangents[0] = tangents[1];
    
    for (i=0; i<ringTemplate.length; i++) {
      iBuffer[iP++] = p+i+2;
      iBuffer[iP++] = p+i+1;
      iBuffer[iP++] = p;
    }
    iBuffer[iP-3] = p+1;
  
    p += ringTemplate.length+1;
    p_pre = p-CB_NOVPR;

    for (n=0; n<waypoints.length; n++) {
    
      if (n == 0) {
        smallest = Number.MAX_VALUE;
        if (tangents[0][0] <= smallest) {smallest = tangents[0][0]; normal = [1, 0, 0];}
        if (tangents[0][1] <= smallest) {smallest = tangents[0][1]; normal = [0, 1, 0];}
        if (tangents[0][2] <= smallest) {smallest = tangents[0][2]; normal = [0, 0, 1];}
        vec3.cross(vec, tangents[0], normal); vec3.normalize(vec, vec);
        vec3.cross(normal, tangents[0], vec); vec3.cross(binormal=[0, 0, 0], tangents[0], normal);
      }
      else {
        vec3.cross(vec, tangents[n-1], tangents[n]);
        if (vec3.length(vec) > delta) {
          vec3.normalize(vec, vec);
          theta = Math.acos(Math.max(-1, Math.min(1, vec3.dot(tangents[n-1], tangents[n]))));
          mat4.rotate(rotationMatrix, identityMatrix, theta, vec);
          vec3.transformMat4(normal, normal, rotationMatrix);
        }
        vec3.cross(binormal, tangents[n], normal);
      }
    
      // define Nx, Bx, Px
      Px = waypoints[n][0]; Py = waypoints[n][1]; Pz = waypoints[n][2];
      Bx = binormal[0]; By = binormal[1]; Bz = binormal[2];
      Nx = normal[0]; Ny = normal[1]; Nz = normal[2];

      for (i=0; i<ringTemplate.length; i++, vP8+=28) {
        //vBuffer[vP++] = radius[n][0]*ringTemplate[i][0] * Nx + radius[n][3]*ringTemplate[i][1] * Bx + Px;
        //vBuffer[vP++] = radius[n][0]*ringTemplate[i][0] * Ny + radius[n][2]*ringTemplate[i][1] * By + Py;
        //vBuffer[vP++] = radius[n][0]*ringTemplate[i][0] * Nz + radius[n][1]*ringTemplate[i][1] * Bz + Pz;
        
        //radius[n][0] = 4.0;
        //radius[n][1] = 4.0;
        
        vBuffer[vP++] = radius[n][0]*ringTemplate[i][0] * Nx + radius[n][1]*ringTemplate[i][1] * Bx + Px;
        vBuffer[vP++] = radius[n][0]*ringTemplate[i][0] * Ny + radius[n][1]*ringTemplate[i][1] * By + Py;
        vBuffer[vP++] = radius[n][0]*ringTemplate[i][0] * Nz + radius[n][1]*ringTemplate[i][1] * Bz + Pz;
      
        if (n == 0) {
          vBuffer[vP++] = -tangents[0][0];
          vBuffer[vP++] = -tangents[0][1];
          vBuffer[vP++] = -tangents[0][2];
        }
        else if (n == waypoints.length-1) {
          vBuffer[vP++] = tangents[n][0];
          vBuffer[vP++] = tangents[n][1];
          vBuffer[vP++] = tangents[n][2];
        }
        else {
          vBuffer[vP++] = ringTemplate[i][0] * Nx + ringTemplate[i][1] * Bx;
          vBuffer[vP++] = ringTemplate[i][0] * Ny + ringTemplate[i][1] * By;
          vBuffer[vP++] = ringTemplate[i][0] * Nz + ringTemplate[i][1] * Bz;
        }

        vBuffer8[vP8+24] = rgba[0];
        vBuffer8[vP8+25] = rgba[1];
        vBuffer8[vP8+26] = rgba[2];
        vBuffer8[vP8+27] = rgba[3];
        vP++;
      }

      if (n < waypoints.length-1) {
      
        for (i=0; i<(CB_NOVPR*2)-2; i+=2, p+=1, p_pre+=1) {
          iBuffer[iP++] = p;
          iBuffer[iP++] = p_pre;
          iBuffer[iP++] = p_pre+1;
   
          iBuffer[iP++] = p_pre+1;
          iBuffer[iP++] = p+1;
          iBuffer[iP++] = p;
        }
        iBuffer[iP++] = p;
        iBuffer[iP++] = p_pre;
        iBuffer[iP++] = p_pre-(CB_NOVPR-1);

        iBuffer[iP++] = p_pre-(CB_NOVPR-1);
        iBuffer[iP++] = p-(CB_NOVPR-1);
        iBuffer[iP++] = p;

        p++; p_pre++;
      }
    }

    n--;
    vBuffer[vP++] = waypoints[n][0]; vBuffer[vP++] = waypoints[n][1]; vBuffer[vP++] = waypoints[n][2];
    vBuffer[vP++] = tangents[n][0]; vBuffer[vP++] = tangents[n][1]; vBuffer[vP++] = tangents[n][2];
    vBuffer8[vP8+24] = rgba[0]; vBuffer8[vP8+25] = rgba[1]; vBuffer8[vP8+26] = rgba[2]; vBuffer8[vP8+27] = rgba[3]; vP++; vP8 += 28;

    for (i=0; i<ringTemplate.length; i++) {
      iBuffer[iP++] = p;
      iBuffer[iP++] = p+i-ringTemplate.length;
      iBuffer[iP++] = p+i+1-ringTemplate.length;
    }
    iBuffer[iP-1] -= ringTemplate.length;
  
    p++; p_pre++;
  }
  
  if (settings.skipProgram) return {vBuffer: vBuffer, iBuffer: iBuffer};

  if (typeof(settings.solid) == "undefined") settings.solid = true;
  var program = molmil.geometry.build_simple_render_program(vBuffer, iBuffer, soup.renderer, settings);
  soup.renderer.addProgram(program);
  
  soup.calculateCOG();
  
  soup.renderer.initBuffers();
  soup.canvas.update = true;
  
}

// use an alternate way of generating the isosurface...
// 1) use a coarse grid (e.g. 4x lower density) to calculate the nearest point on the isosurface (vdw+probeR)
// 2) throw away everything that wasn't mapped
// 3) use a hq grid to calculate the sasa (previous isosurface-probeR)

//molmil.coarseSurface = function(chain, res, probeR) {
//  
//}

// ** generates a coarse surface for a chain **
molmil.coarseSurface = function(chain, res, probeR, settings) {
  settings = settings || {};

  var inv_res = 1 / res;
  // make this also work with res not being a number, but an array of integers, so Nx, Ny, Nz, where this represents the number of voxels...

  var atoms = chain.atoms;
  var modelsXYZ = chain.modelsXYZ[chain.entry.soup.renderer.modelId];
      
  var geomRanges = [1e99, -1e99, 1e99, -1e99, 1e99, -1e99], a, tmp1, elements = {}, rX, rY, rZ, dX, dY, dZ, gs, grid_r = {}, grid_a = {}, block_ranges = [0, 0, 0, 0, 0, 0],
  gr, ga, vdwR = molmil.configBox.vdwR, r, aX, aY, aZ, xi, yi, zi, mp, xb, yb, zb, dx, dy, dz, grid_x, grid_y;
      
  for (a=0; a<atoms.length; a++) {
    tmp1 = modelsXYZ[atoms[a].xyz];
    if (tmp1 < geomRanges[0]) geomRanges[0] = tmp1;
    if (tmp1 > geomRanges[1]) geomRanges[1] = tmp1;
        
    tmp1 = modelsXYZ[atoms[a].xyz+1];
    if (tmp1 < geomRanges[2]) geomRanges[2] = tmp1;
    if (tmp1 > geomRanges[3]) geomRanges[3] = tmp1;
        
    tmp1 = modelsXYZ[atoms[a].xyz+2];
    if (tmp1 < geomRanges[4]) geomRanges[4] = tmp1;
    if (tmp1 > geomRanges[5]) geomRanges[5] = tmp1;
        
    elements[atoms[a].element] = 1;
  }
      
      
  rX = Math.ceil((geomRanges[1]-geomRanges[0] + (2*probeR) + (2*1.8))/res)+2;
  rY = Math.ceil((geomRanges[3]-geomRanges[2] + (2*probeR) + (2*1.8))/res)+2;
  rZ = Math.ceil((geomRanges[5]-geomRanges[4] + (2*probeR) + (2*1.8))/res)+2;

  dX = -geomRanges[0] + probeR + 1.8 + res;
  dY = -geomRanges[2] + probeR + 1.8 + res;
  dZ = -geomRanges[4] + probeR + 1.8 + res;
      
  gs = rX*rY*rZ;

  for (a in elements) {
    grid_r[a] = new Float32Array(gs);
    grid_a[a] = [];
    for (xi=0; xi<gs; xi++) {
      grid_r[a][xi] = 1e99;
      grid_a[a].push(null);
    }
    elements[a] = molmil_dep.getKeyFromObject(vdwR, a, vdwR.DUMMY);
  }

  for (a=0; a<atoms.length; a++) {
    gr = grid_r[atoms[a].element];
    ga = grid_a[atoms[a].element];
    r = elements[atoms[a].element];
        
    aX = modelsXYZ[atoms[a].xyz]   + dX;
    aY = modelsXYZ[atoms[a].xyz+1] + dY;
    aZ = modelsXYZ[atoms[a].xyz+2] + dZ;

    block_ranges[0] = 0; block_ranges[1] = rX;
    block_ranges[2] = 0; block_ranges[3] = rY;
    block_ranges[4] = 0; block_ranges[5] = rZ;
        
    for (xi=block_ranges[0]; xi<block_ranges[1]; xi++) {
      xb = xi*res;
      for (yi=block_ranges[2]; yi<block_ranges[3]; yi++) {
        yb = yi*res;
        for (zi=block_ranges[4]; zi<block_ranges[5]; zi++) {
          zb = zi*res;
             
          mp = xi + rX * (yi + rY * zi);
              
          dx = aX-xb; dy = aY-yb; dz = aZ-zb;
          tmp1 = dx*dx + dy*dy + dz*dz;
          if (tmp1 < gr[mp]) {
            gr[mp] = tmp1; ga[mp] = r;
          }
        }
      }
        
    }        
  }
      
  // now that for each grid point & element the nearest atom is calculated --> map it back to the surface...
      
  grid_x = new Float32Array(gs);
      
  for (xi=0; xi<gs; xi++) {
    mp = 1e99;
    for (a in elements) {
      r = Math.sqrt(grid_r[a][xi]) - (probeR + grid_a[a][xi]); // distance from point - grid
      if (r < mp) mp = r;
    }
    grid_x[xi] = mp * inv_res;
  }
  
  if (! settings.deproj && ! settings.sas) {
    var probeR_alt = probeR/res;
    for (xi=0; xi<gs; xi++) grid_x[xi] += probeR_alt;
  }
  
  var surf = polygonize([rX, rY, rZ], grid_x, 0.0);
  
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
  
  if (settings.deproj) {
    
    var sf = 1./res;
  
    for (i=0; i<normals.length; i++) {
      surf.vertices[i][0] = ((surf.vertices[i][0] - normals[i][0] * probeR * sf) * res) - dX;
      surf.vertices[i][1] = ((surf.vertices[i][1] - normals[i][1] * probeR * sf) * res) - dY;
      surf.vertices[i][2] = ((surf.vertices[i][2] - normals[i][2] * probeR * sf) * res) - dZ;
    }
    
  }
  else {
    
    for (i=0; i<normals.length; i++) {
      surf.vertices[i][0] = ((surf.vertices[i][0]) * res) - dX;
      surf.vertices[i][1] = ((surf.vertices[i][1]) * res) - dY;
      surf.vertices[i][2] = ((surf.vertices[i][2]) * res) - dZ;
    }
    
  }
  
  return surf;
}

var edgeTable = new Int32Array([
		0x0, 0x109, 0x203, 0x30a, 0x406, 0x50f, 0x605, 0x70c,
		0x80c, 0x905, 0xa0f, 0xb06, 0xc0a, 0xd03, 0xe09, 0xf00,
		0x190, 0x99, 0x393, 0x29a, 0x596, 0x49f, 0x795, 0x69c,
		0x99c, 0x895, 0xb9f, 0xa96, 0xd9a, 0xc93, 0xf99, 0xe90,
		0x230, 0x339, 0x33, 0x13a, 0x636, 0x73f, 0x435, 0x53c,
		0xa3c, 0xb35, 0x83f, 0x936, 0xe3a, 0xf33, 0xc39, 0xd30,
		0x3a0, 0x2a9, 0x1a3, 0xaa, 0x7a6, 0x6af, 0x5a5, 0x4ac,
		0xbac, 0xaa5, 0x9af, 0x8a6, 0xfaa, 0xea3, 0xda9, 0xca0,
		0x460, 0x569, 0x663, 0x76a, 0x66, 0x16f, 0x265, 0x36c,
		0xc6c, 0xd65, 0xe6f, 0xf66, 0x86a, 0x963, 0xa69, 0xb60,
		0x5f0, 0x4f9, 0x7f3, 0x6fa, 0x1f6, 0xff, 0x3f5, 0x2fc,
		0xdfc, 0xcf5, 0xfff, 0xef6, 0x9fa, 0x8f3, 0xbf9, 0xaf0,
		0x650, 0x759, 0x453, 0x55a, 0x256, 0x35f, 0x55, 0x15c,
		0xe5c, 0xf55, 0xc5f, 0xd56, 0xa5a, 0xb53, 0x859, 0x950,
		0x7c0, 0x6c9, 0x5c3, 0x4ca, 0x3c6, 0x2cf, 0x1c5, 0xcc,
		0xfcc, 0xec5, 0xdcf, 0xcc6, 0xbca, 0xac3, 0x9c9, 0x8c0,
		0x8c0, 0x9c9, 0xac3, 0xbca, 0xcc6, 0xdcf, 0xec5, 0xfcc,
		0xcc, 0x1c5, 0x2cf, 0x3c6, 0x4ca, 0x5c3, 0x6c9, 0x7c0,
		0x950, 0x859, 0xb53, 0xa5a, 0xd56, 0xc5f, 0xf55, 0xe5c,
		0x15c, 0x55, 0x35f, 0x256, 0x55a, 0x453, 0x759, 0x650,
		0xaf0, 0xbf9, 0x8f3, 0x9fa, 0xef6, 0xfff, 0xcf5, 0xdfc,
		0x2fc, 0x3f5, 0xff, 0x1f6, 0x6fa, 0x7f3, 0x4f9, 0x5f0,
		0xb60, 0xa69, 0x963, 0x86a, 0xf66, 0xe6f, 0xd65, 0xc6c,
		0x36c, 0x265, 0x16f, 0x66, 0x76a, 0x663, 0x569, 0x460,
		0xca0, 0xda9, 0xea3, 0xfaa, 0x8a6, 0x9af, 0xaa5, 0xbac,
		0x4ac, 0x5a5, 0x6af, 0x7a6, 0xaa, 0x1a3, 0x2a9, 0x3a0,
		0xd30, 0xc39, 0xf33, 0xe3a, 0x936, 0x83f, 0xb35, 0xa3c,
		0x53c, 0x435, 0x73f, 0x636, 0x13a, 0x33, 0x339, 0x230,
		0xe90, 0xf99, 0xc93, 0xd9a, 0xa96, 0xb9f, 0x895, 0x99c,
		0x69c, 0x795, 0x49f, 0x596, 0x29a, 0x393, 0x99, 0x190,
		0xf00, 0xe09, 0xd03, 0xc0a, 0xb06, 0xa0f, 0x905, 0x80c,
		0x70c, 0x605, 0x50f, 0x406, 0x30a, 0x203, 0x109, 0x0 ]);

var triTable = new Int32Array([
		-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		0, 8, 3, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		0, 1, 9, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		1, 8, 3, 9, 8, 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		1, 2, 10, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		0, 8, 3, 1, 2, 10, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		9, 2, 10, 0, 2, 9, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		2, 8, 3, 2, 10, 8, 10, 9, 8, -1, -1, -1, -1, -1, -1, -1,
		3, 11, 2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		0, 11, 2, 8, 11, 0, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		1, 9, 0, 2, 3, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		1, 11, 2, 1, 9, 11, 9, 8, 11, -1, -1, -1, -1, -1, -1, -1,
		3, 10, 1, 11, 10, 3, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		0, 10, 1, 0, 8, 10, 8, 11, 10, -1, -1, -1, -1, -1, -1, -1,
		3, 9, 0, 3, 11, 9, 11, 10, 9, -1, -1, -1, -1, -1, -1, -1,
		9, 8, 10, 10, 8, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		4, 7, 8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		4, 3, 0, 7, 3, 4, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		0, 1, 9, 8, 4, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		4, 1, 9, 4, 7, 1, 7, 3, 1, -1, -1, -1, -1, -1, -1, -1,
		1, 2, 10, 8, 4, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		3, 4, 7, 3, 0, 4, 1, 2, 10, -1, -1, -1, -1, -1, -1, -1,
		9, 2, 10, 9, 0, 2, 8, 4, 7, -1, -1, -1, -1, -1, -1, -1,
		2, 10, 9, 2, 9, 7, 2, 7, 3, 7, 9, 4, -1, -1, -1, -1,
		8, 4, 7, 3, 11, 2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		11, 4, 7, 11, 2, 4, 2, 0, 4, -1, -1, -1, -1, -1, -1, -1,
		9, 0, 1, 8, 4, 7, 2, 3, 11, -1, -1, -1, -1, -1, -1, -1,
		4, 7, 11, 9, 4, 11, 9, 11, 2, 9, 2, 1, -1, -1, -1, -1,
		3, 10, 1, 3, 11, 10, 7, 8, 4, -1, -1, -1, -1, -1, -1, -1,
		1, 11, 10, 1, 4, 11, 1, 0, 4, 7, 11, 4, -1, -1, -1, -1,
		4, 7, 8, 9, 0, 11, 9, 11, 10, 11, 0, 3, -1, -1, -1, -1,
		4, 7, 11, 4, 11, 9, 9, 11, 10, -1, -1, -1, -1, -1, -1, -1,
		9, 5, 4, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		9, 5, 4, 0, 8, 3, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		0, 5, 4, 1, 5, 0, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		8, 5, 4, 8, 3, 5, 3, 1, 5, -1, -1, -1, -1, -1, -1, -1,
		1, 2, 10, 9, 5, 4, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		3, 0, 8, 1, 2, 10, 4, 9, 5, -1, -1, -1, -1, -1, -1, -1,
		5, 2, 10, 5, 4, 2, 4, 0, 2, -1, -1, -1, -1, -1, -1, -1,
		2, 10, 5, 3, 2, 5, 3, 5, 4, 3, 4, 8, -1, -1, -1, -1,
		9, 5, 4, 2, 3, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		0, 11, 2, 0, 8, 11, 4, 9, 5, -1, -1, -1, -1, -1, -1, -1,
		0, 5, 4, 0, 1, 5, 2, 3, 11, -1, -1, -1, -1, -1, -1, -1,
		2, 1, 5, 2, 5, 8, 2, 8, 11, 4, 8, 5, -1, -1, -1, -1,
		10, 3, 11, 10, 1, 3, 9, 5, 4, -1, -1, -1, -1, -1, -1, -1,
		4, 9, 5, 0, 8, 1, 8, 10, 1, 8, 11, 10, -1, -1, -1, -1,
		5, 4, 0, 5, 0, 11, 5, 11, 10, 11, 0, 3, -1, -1, -1, -1,
		5, 4, 8, 5, 8, 10, 10, 8, 11, -1, -1, -1, -1, -1, -1, -1,
		9, 7, 8, 5, 7, 9, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		9, 3, 0, 9, 5, 3, 5, 7, 3, -1, -1, -1, -1, -1, -1, -1,
		0, 7, 8, 0, 1, 7, 1, 5, 7, -1, -1, -1, -1, -1, -1, -1,
		1, 5, 3, 3, 5, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		9, 7, 8, 9, 5, 7, 10, 1, 2, -1, -1, -1, -1, -1, -1, -1,
		10, 1, 2, 9, 5, 0, 5, 3, 0, 5, 7, 3, -1, -1, -1, -1,
		8, 0, 2, 8, 2, 5, 8, 5, 7, 10, 5, 2, -1, -1, -1, -1,
		2, 10, 5, 2, 5, 3, 3, 5, 7, -1, -1, -1, -1, -1, -1, -1,
		7, 9, 5, 7, 8, 9, 3, 11, 2, -1, -1, -1, -1, -1, -1, -1,
		9, 5, 7, 9, 7, 2, 9, 2, 0, 2, 7, 11, -1, -1, -1, -1,
		2, 3, 11, 0, 1, 8, 1, 7, 8, 1, 5, 7, -1, -1, -1, -1,
		11, 2, 1, 11, 1, 7, 7, 1, 5, -1, -1, -1, -1, -1, -1, -1,
		9, 5, 8, 8, 5, 7, 10, 1, 3, 10, 3, 11, -1, -1, -1, -1,
		5, 7, 0, 5, 0, 9, 7, 11, 0, 1, 0, 10, 11, 10, 0, -1,
		11, 10, 0, 11, 0, 3, 10, 5, 0, 8, 0, 7, 5, 7, 0, -1,
		11, 10, 5, 7, 11, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		10, 6, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		0, 8, 3, 5, 10, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		9, 0, 1, 5, 10, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		1, 8, 3, 1, 9, 8, 5, 10, 6, -1, -1, -1, -1, -1, -1, -1,
		1, 6, 5, 2, 6, 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		1, 6, 5, 1, 2, 6, 3, 0, 8, -1, -1, -1, -1, -1, -1, -1,
		9, 6, 5, 9, 0, 6, 0, 2, 6, -1, -1, -1, -1, -1, -1, -1,
		5, 9, 8, 5, 8, 2, 5, 2, 6, 3, 2, 8, -1, -1, -1, -1,
		2, 3, 11, 10, 6, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		11, 0, 8, 11, 2, 0, 10, 6, 5, -1, -1, -1, -1, -1, -1, -1,
		0, 1, 9, 2, 3, 11, 5, 10, 6, -1, -1, -1, -1, -1, -1, -1,
		5, 10, 6, 1, 9, 2, 9, 11, 2, 9, 8, 11, -1, -1, -1, -1,
		6, 3, 11, 6, 5, 3, 5, 1, 3, -1, -1, -1, -1, -1, -1, -1,
		0, 8, 11, 0, 11, 5, 0, 5, 1, 5, 11, 6, -1, -1, -1, -1,
		3, 11, 6, 0, 3, 6, 0, 6, 5, 0, 5, 9, -1, -1, -1, -1,
		6, 5, 9, 6, 9, 11, 11, 9, 8, -1, -1, -1, -1, -1, -1, -1,
		5, 10, 6, 4, 7, 8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		4, 3, 0, 4, 7, 3, 6, 5, 10, -1, -1, -1, -1, -1, -1, -1,
		1, 9, 0, 5, 10, 6, 8, 4, 7, -1, -1, -1, -1, -1, -1, -1,
		10, 6, 5, 1, 9, 7, 1, 7, 3, 7, 9, 4, -1, -1, -1, -1,
		6, 1, 2, 6, 5, 1, 4, 7, 8, -1, -1, -1, -1, -1, -1, -1,
		1, 2, 5, 5, 2, 6, 3, 0, 4, 3, 4, 7, -1, -1, -1, -1,
		8, 4, 7, 9, 0, 5, 0, 6, 5, 0, 2, 6, -1, -1, -1, -1,
		7, 3, 9, 7, 9, 4, 3, 2, 9, 5, 9, 6, 2, 6, 9, -1,
		3, 11, 2, 7, 8, 4, 10, 6, 5, -1, -1, -1, -1, -1, -1, -1,
		5, 10, 6, 4, 7, 2, 4, 2, 0, 2, 7, 11, -1, -1, -1, -1,
		0, 1, 9, 4, 7, 8, 2, 3, 11, 5, 10, 6, -1, -1, -1, -1,
		9, 2, 1, 9, 11, 2, 9, 4, 11, 7, 11, 4, 5, 10, 6, -1,
		8, 4, 7, 3, 11, 5, 3, 5, 1, 5, 11, 6, -1, -1, -1, -1,
		5, 1, 11, 5, 11, 6, 1, 0, 11, 7, 11, 4, 0, 4, 11, -1,
		0, 5, 9, 0, 6, 5, 0, 3, 6, 11, 6, 3, 8, 4, 7, -1,
		6, 5, 9, 6, 9, 11, 4, 7, 9, 7, 11, 9, -1, -1, -1, -1,
		10, 4, 9, 6, 4, 10, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		4, 10, 6, 4, 9, 10, 0, 8, 3, -1, -1, -1, -1, -1, -1, -1,
		10, 0, 1, 10, 6, 0, 6, 4, 0, -1, -1, -1, -1, -1, -1, -1,
		8, 3, 1, 8, 1, 6, 8, 6, 4, 6, 1, 10, -1, -1, -1, -1,
		1, 4, 9, 1, 2, 4, 2, 6, 4, -1, -1, -1, -1, -1, -1, -1,
		3, 0, 8, 1, 2, 9, 2, 4, 9, 2, 6, 4, -1, -1, -1, -1,
		0, 2, 4, 4, 2, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		8, 3, 2, 8, 2, 4, 4, 2, 6, -1, -1, -1, -1, -1, -1, -1,
		10, 4, 9, 10, 6, 4, 11, 2, 3, -1, -1, -1, -1, -1, -1, -1,
		0, 8, 2, 2, 8, 11, 4, 9, 10, 4, 10, 6, -1, -1, -1, -1,
		3, 11, 2, 0, 1, 6, 0, 6, 4, 6, 1, 10, -1, -1, -1, -1,
		6, 4, 1, 6, 1, 10, 4, 8, 1, 2, 1, 11, 8, 11, 1, -1,
		9, 6, 4, 9, 3, 6, 9, 1, 3, 11, 6, 3, -1, -1, -1, -1,
		8, 11, 1, 8, 1, 0, 11, 6, 1, 9, 1, 4, 6, 4, 1, -1,
		3, 11, 6, 3, 6, 0, 0, 6, 4, -1, -1, -1, -1, -1, -1, -1,
		6, 4, 8, 11, 6, 8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		7, 10, 6, 7, 8, 10, 8, 9, 10, -1, -1, -1, -1, -1, -1, -1,
		0, 7, 3, 0, 10, 7, 0, 9, 10, 6, 7, 10, -1, -1, -1, -1,
		10, 6, 7, 1, 10, 7, 1, 7, 8, 1, 8, 0, -1, -1, -1, -1,
		10, 6, 7, 10, 7, 1, 1, 7, 3, -1, -1, -1, -1, -1, -1, -1,
		1, 2, 6, 1, 6, 8, 1, 8, 9, 8, 6, 7, -1, -1, -1, -1,
		2, 6, 9, 2, 9, 1, 6, 7, 9, 0, 9, 3, 7, 3, 9, -1,
		7, 8, 0, 7, 0, 6, 6, 0, 2, -1, -1, -1, -1, -1, -1, -1,
		7, 3, 2, 6, 7, 2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		2, 3, 11, 10, 6, 8, 10, 8, 9, 8, 6, 7, -1, -1, -1, -1,
		2, 0, 7, 2, 7, 11, 0, 9, 7, 6, 7, 10, 9, 10, 7, -1,
		1, 8, 0, 1, 7, 8, 1, 10, 7, 6, 7, 10, 2, 3, 11, -1,
		11, 2, 1, 11, 1, 7, 10, 6, 1, 6, 7, 1, -1, -1, -1, -1,
		8, 9, 6, 8, 6, 7, 9, 1, 6, 11, 6, 3, 1, 3, 6, -1,
		0, 9, 1, 11, 6, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		7, 8, 0, 7, 0, 6, 3, 11, 0, 11, 6, 0, -1, -1, -1, -1,
		7, 11, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		7, 6, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		3, 0, 8, 11, 7, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		0, 1, 9, 11, 7, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		8, 1, 9, 8, 3, 1, 11, 7, 6, -1, -1, -1, -1, -1, -1, -1,
		10, 1, 2, 6, 11, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		1, 2, 10, 3, 0, 8, 6, 11, 7, -1, -1, -1, -1, -1, -1, -1,
		2, 9, 0, 2, 10, 9, 6, 11, 7, -1, -1, -1, -1, -1, -1, -1,
		6, 11, 7, 2, 10, 3, 10, 8, 3, 10, 9, 8, -1, -1, -1, -1,
		7, 2, 3, 6, 2, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		7, 0, 8, 7, 6, 0, 6, 2, 0, -1, -1, -1, -1, -1, -1, -1,
		2, 7, 6, 2, 3, 7, 0, 1, 9, -1, -1, -1, -1, -1, -1, -1,
		1, 6, 2, 1, 8, 6, 1, 9, 8, 8, 7, 6, -1, -1, -1, -1,
		10, 7, 6, 10, 1, 7, 1, 3, 7, -1, -1, -1, -1, -1, -1, -1,
		10, 7, 6, 1, 7, 10, 1, 8, 7, 1, 0, 8, -1, -1, -1, -1,
		0, 3, 7, 0, 7, 10, 0, 10, 9, 6, 10, 7, -1, -1, -1, -1,
		7, 6, 10, 7, 10, 8, 8, 10, 9, -1, -1, -1, -1, -1, -1, -1,
		6, 8, 4, 11, 8, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		3, 6, 11, 3, 0, 6, 0, 4, 6, -1, -1, -1, -1, -1, -1, -1,
		8, 6, 11, 8, 4, 6, 9, 0, 1, -1, -1, -1, -1, -1, -1, -1,
		9, 4, 6, 9, 6, 3, 9, 3, 1, 11, 3, 6, -1, -1, -1, -1,
		6, 8, 4, 6, 11, 8, 2, 10, 1, -1, -1, -1, -1, -1, -1, -1,
		1, 2, 10, 3, 0, 11, 0, 6, 11, 0, 4, 6, -1, -1, -1, -1,
		4, 11, 8, 4, 6, 11, 0, 2, 9, 2, 10, 9, -1, -1, -1, -1,
		10, 9, 3, 10, 3, 2, 9, 4, 3, 11, 3, 6, 4, 6, 3, -1,
		8, 2, 3, 8, 4, 2, 4, 6, 2, -1, -1, -1, -1, -1, -1, -1,
		0, 4, 2, 4, 6, 2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		1, 9, 0, 2, 3, 4, 2, 4, 6, 4, 3, 8, -1, -1, -1, -1,
		1, 9, 4, 1, 4, 2, 2, 4, 6, -1, -1, -1, -1, -1, -1, -1,
		8, 1, 3, 8, 6, 1, 8, 4, 6, 6, 10, 1, -1, -1, -1, -1,
		10, 1, 0, 10, 0, 6, 6, 0, 4, -1, -1, -1, -1, -1, -1, -1,
		4, 6, 3, 4, 3, 8, 6, 10, 3, 0, 3, 9, 10, 9, 3, -1,
		10, 9, 4, 6, 10, 4, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		4, 9, 5, 7, 6, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		0, 8, 3, 4, 9, 5, 11, 7, 6, -1, -1, -1, -1, -1, -1, -1,
		5, 0, 1, 5, 4, 0, 7, 6, 11, -1, -1, -1, -1, -1, -1, -1,
		11, 7, 6, 8, 3, 4, 3, 5, 4, 3, 1, 5, -1, -1, -1, -1,
		9, 5, 4, 10, 1, 2, 7, 6, 11, -1, -1, -1, -1, -1, -1, -1,
		6, 11, 7, 1, 2, 10, 0, 8, 3, 4, 9, 5, -1, -1, -1, -1,
		7, 6, 11, 5, 4, 10, 4, 2, 10, 4, 0, 2, -1, -1, -1, -1,
		3, 4, 8, 3, 5, 4, 3, 2, 5, 10, 5, 2, 11, 7, 6, -1,
		7, 2, 3, 7, 6, 2, 5, 4, 9, -1, -1, -1, -1, -1, -1, -1,
		9, 5, 4, 0, 8, 6, 0, 6, 2, 6, 8, 7, -1, -1, -1, -1,
		3, 6, 2, 3, 7, 6, 1, 5, 0, 5, 4, 0, -1, -1, -1, -1,
		6, 2, 8, 6, 8, 7, 2, 1, 8, 4, 8, 5, 1, 5, 8, -1,
		9, 5, 4, 10, 1, 6, 1, 7, 6, 1, 3, 7, -1, -1, -1, -1,
		1, 6, 10, 1, 7, 6, 1, 0, 7, 8, 7, 0, 9, 5, 4, -1,
		4, 0, 10, 4, 10, 5, 0, 3, 10, 6, 10, 7, 3, 7, 10, -1,
		7, 6, 10, 7, 10, 8, 5, 4, 10, 4, 8, 10, -1, -1, -1, -1,
		6, 9, 5, 6, 11, 9, 11, 8, 9, -1, -1, -1, -1, -1, -1, -1,
		3, 6, 11, 0, 6, 3, 0, 5, 6, 0, 9, 5, -1, -1, -1, -1,
		0, 11, 8, 0, 5, 11, 0, 1, 5, 5, 6, 11, -1, -1, -1, -1,
		6, 11, 3, 6, 3, 5, 5, 3, 1, -1, -1, -1, -1, -1, -1, -1,
		1, 2, 10, 9, 5, 11, 9, 11, 8, 11, 5, 6, -1, -1, -1, -1,
		0, 11, 3, 0, 6, 11, 0, 9, 6, 5, 6, 9, 1, 2, 10, -1,
		11, 8, 5, 11, 5, 6, 8, 0, 5, 10, 5, 2, 0, 2, 5, -1,
		6, 11, 3, 6, 3, 5, 2, 10, 3, 10, 5, 3, -1, -1, -1, -1,
		5, 8, 9, 5, 2, 8, 5, 6, 2, 3, 8, 2, -1, -1, -1, -1,
		9, 5, 6, 9, 6, 0, 0, 6, 2, -1, -1, -1, -1, -1, -1, -1,
		1, 5, 8, 1, 8, 0, 5, 6, 8, 3, 8, 2, 6, 2, 8, -1,
		1, 5, 6, 2, 1, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		1, 3, 6, 1, 6, 10, 3, 8, 6, 5, 6, 9, 8, 9, 6, -1,
		10, 1, 0, 10, 0, 6, 9, 5, 0, 5, 6, 0, -1, -1, -1, -1,
		0, 3, 8, 5, 6, 10, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		10, 5, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		11, 5, 10, 7, 5, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		11, 5, 10, 11, 7, 5, 8, 3, 0, -1, -1, -1, -1, -1, -1, -1,
		5, 11, 7, 5, 10, 11, 1, 9, 0, -1, -1, -1, -1, -1, -1, -1,
		10, 7, 5, 10, 11, 7, 9, 8, 1, 8, 3, 1, -1, -1, -1, -1,
		11, 1, 2, 11, 7, 1, 7, 5, 1, -1, -1, -1, -1, -1, -1, -1,
		0, 8, 3, 1, 2, 7, 1, 7, 5, 7, 2, 11, -1, -1, -1, -1,
		9, 7, 5, 9, 2, 7, 9, 0, 2, 2, 11, 7, -1, -1, -1, -1,
		7, 5, 2, 7, 2, 11, 5, 9, 2, 3, 2, 8, 9, 8, 2, -1,
		2, 5, 10, 2, 3, 5, 3, 7, 5, -1, -1, -1, -1, -1, -1, -1,
		8, 2, 0, 8, 5, 2, 8, 7, 5, 10, 2, 5, -1, -1, -1, -1,
		9, 0, 1, 5, 10, 3, 5, 3, 7, 3, 10, 2, -1, -1, -1, -1,
		9, 8, 2, 9, 2, 1, 8, 7, 2, 10, 2, 5, 7, 5, 2, -1,
		1, 3, 5, 3, 7, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		0, 8, 7, 0, 7, 1, 1, 7, 5, -1, -1, -1, -1, -1, -1, -1,
		9, 0, 3, 9, 3, 5, 5, 3, 7, -1, -1, -1, -1, -1, -1, -1,
		9, 8, 7, 5, 9, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		5, 8, 4, 5, 10, 8, 10, 11, 8, -1, -1, -1, -1, -1, -1, -1,
		5, 0, 4, 5, 11, 0, 5, 10, 11, 11, 3, 0, -1, -1, -1, -1,
		0, 1, 9, 8, 4, 10, 8, 10, 11, 10, 4, 5, -1, -1, -1, -1,
		10, 11, 4, 10, 4, 5, 11, 3, 4, 9, 4, 1, 3, 1, 4, -1,
		2, 5, 1, 2, 8, 5, 2, 11, 8, 4, 5, 8, -1, -1, -1, -1,
		0, 4, 11, 0, 11, 3, 4, 5, 11, 2, 11, 1, 5, 1, 11, -1,
		0, 2, 5, 0, 5, 9, 2, 11, 5, 4, 5, 8, 11, 8, 5, -1,
		9, 4, 5, 2, 11, 3, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		2, 5, 10, 3, 5, 2, 3, 4, 5, 3, 8, 4, -1, -1, -1, -1,
		5, 10, 2, 5, 2, 4, 4, 2, 0, -1, -1, -1, -1, -1, -1, -1,
		3, 10, 2, 3, 5, 10, 3, 8, 5, 4, 5, 8, 0, 1, 9, -1,
		5, 10, 2, 5, 2, 4, 1, 9, 2, 9, 4, 2, -1, -1, -1, -1,
		8, 4, 5, 8, 5, 3, 3, 5, 1, -1, -1, -1, -1, -1, -1, -1,
		0, 4, 5, 1, 0, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		8, 4, 5, 8, 5, 3, 9, 0, 5, 0, 3, 5, -1, -1, -1, -1,
		9, 4, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		4, 11, 7, 4, 9, 11, 9, 10, 11, -1, -1, -1, -1, -1, -1, -1,
		0, 8, 3, 4, 9, 7, 9, 11, 7, 9, 10, 11, -1, -1, -1, -1,
		1, 10, 11, 1, 11, 4, 1, 4, 0, 7, 4, 11, -1, -1, -1, -1,
		3, 1, 4, 3, 4, 8, 1, 10, 4, 7, 4, 11, 10, 11, 4, -1,
		4, 11, 7, 9, 11, 4, 9, 2, 11, 9, 1, 2, -1, -1, -1, -1,
		9, 7, 4, 9, 11, 7, 9, 1, 11, 2, 11, 1, 0, 8, 3, -1,
		11, 7, 4, 11, 4, 2, 2, 4, 0, -1, -1, -1, -1, -1, -1, -1,
		11, 7, 4, 11, 4, 2, 8, 3, 4, 3, 2, 4, -1, -1, -1, -1,
		2, 9, 10, 2, 7, 9, 2, 3, 7, 7, 4, 9, -1, -1, -1, -1,
		9, 10, 7, 9, 7, 4, 10, 2, 7, 8, 7, 0, 2, 0, 7, -1,
		3, 7, 10, 3, 10, 2, 7, 4, 10, 1, 10, 0, 4, 0, 10, -1,
		1, 10, 2, 8, 7, 4, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		4, 9, 1, 4, 1, 7, 7, 1, 3, -1, -1, -1, -1, -1, -1, -1,
		4, 9, 1, 4, 1, 7, 0, 8, 1, 8, 7, 1, -1, -1, -1, -1,
		4, 0, 3, 7, 4, 3, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		4, 8, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		9, 10, 8, 10, 11, 8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		3, 0, 9, 3, 9, 11, 11, 9, 10, -1, -1, -1, -1, -1, -1, -1,
		0, 1, 10, 0, 10, 8, 8, 10, 11, -1, -1, -1, -1, -1, -1, -1,
		3, 1, 10, 11, 3, 10, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		1, 2, 11, 1, 11, 9, 9, 11, 8, -1, -1, -1, -1, -1, -1, -1,
		3, 0, 9, 3, 9, 11, 1, 2, 9, 2, 11, 9, -1, -1, -1, -1,
		0, 2, 11, 8, 0, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		3, 2, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		2, 3, 8, 2, 8, 10, 10, 8, 9, -1, -1, -1, -1, -1, -1, -1,
		9, 10, 2, 0, 9, 2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		2, 3, 8, 2, 8, 10, 0, 1, 8, 1, 10, 8, -1, -1, -1, -1,
		1, 10, 2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		1, 3, 8, 9, 1, 8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		0, 9, 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		0, 3, 8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1 ]);

// size indicates the size of the 3D array (x, y, z)
// gridCoords is a 3D array
// gridVals is a 1D array
// isolevel indicates the value at which to generate the mesh
function polygonize(size, gridVals, isolevel, selectFunc) {
	var cubeIndex = 0, vertlist = [], i, x, y, z, v0 = [0, 0, 0], v1 = [0, 0, 0], iv = 0, faces = [], lines = [], vertexIndex = {}, vertices = [], face_normals = [], idx, vert1, vert2, vert3;
  var grid0, grid1, grid2, grid3, grid4, grid5, grid6, grid7, idx1, idx2, idx3;

  for (i=0; i<12; i++) vertlist.push([0.0, 0.0, 0.0]);
  
  for (z=0; z<size[2]-1; z++) {
    for (y=0; y<size[1]-1; y++) {
      for (x=0; x<size[0]-1; x++) {

        if (selectFunc) {
          grid0 = selectFunc(x,   y,   z);
          grid1 = selectFunc(x+1, y,   z);
          grid2 = selectFunc(x+1, y,   z+1);
          grid3 = selectFunc(x,   y,   z+1);
          grid4 = selectFunc(x,   y+1, z);
          grid5 = selectFunc(x+1, y+1, z);
          grid6 = selectFunc(x+1, y+1, z+1);
          grid7 = selectFunc(x,   y+1, z+1);
        }
        else {
          grid0 = x + size[0] * (y + size[1] * z);
          grid1 = (x+1) + size[0] * (y + size[1] * z);
          grid2 = (x+1) + size[0] * (y + size[1] * (z+1));
          grid3 = x + size[0] * (y + size[1] * (z+1));
          grid4 = x + size[0] * ((y+1) + size[1] * z);
          grid5 = (x+1) + size[0] * ((y+1) + size[1] * z);
          grid6 = (x+1) + size[0] * ((y+1) + size[1] * (z+1));
          grid7 = x + size[0] * ((y+1) + size[1] * (z+1));
        }
        
        cubeIndex = 0;
        if (gridVals[grid0] < isolevel) cubeIndex |= 1;
      	if (gridVals[grid1] < isolevel) cubeIndex |= 2;
	      if (gridVals[grid2] < isolevel) cubeIndex |= 4;
	      if (gridVals[grid3] < isolevel) cubeIndex |= 8;
	      if (gridVals[grid4] < isolevel) cubeIndex |= 16;
	      if (gridVals[grid5] < isolevel) cubeIndex |= 32;
	      if (gridVals[grid6] < isolevel) cubeIndex |= 64;
	      if (gridVals[grid7] < isolevel) cubeIndex |= 128;

        
	      if (edgeTable[cubeIndex] === 0) continue;
  
	      if (edgeTable[cubeIndex] & 1) {
          v0[0] = x; v0[1] = y; v0[2] = z; // grid0
          v1[0] = x+1; v1[1] = y; v1[2] = z; // grid1
          iv = (isolevel-gridVals[grid0]) / (gridVals[grid1]-gridVals[grid0]);
          vec3.lerp(vertlist[0], v0, v1, iv);
        }
	      if (edgeTable[cubeIndex] & 2) {
          v0[0] = x+1; v0[1] = y; v0[2] = z; // grid1
          v1[0] = x+1; v1[1] = y; v1[2] = z+1; // grid2
          iv = (isolevel-gridVals[grid1]) / (gridVals[grid2]-gridVals[grid1]);
          vec3.lerp(vertlist[1], v0, v1, iv);
        }
	      if (edgeTable[cubeIndex] & 4) {
          v0[0] = x+1; v0[1] = y; v0[2] = z+1; // grid2
          v1[0] = x; v1[1] = y; v1[2] = z+1; // grid3
          iv = (isolevel-gridVals[grid2]) / (gridVals[grid3]-gridVals[grid2]);
          vec3.lerp(vertlist[2], v0, v1, iv);
        }
	      if (edgeTable[cubeIndex] & 8) {
          v0[0] = x; v0[1] = y; v0[2] = z+1; // grid3
          v1[0] = x; v1[1] = y; v1[2] = z; // grid0
          iv = (isolevel-gridVals[grid3]) / (gridVals[grid0]-gridVals[grid3]);
          vec3.lerp(vertlist[3], v0, v1, iv);
        }
	      if (edgeTable[cubeIndex] & 16) {
          v0[0] = x; v0[1] = y+1; v0[2] = z; // grid4
          v1[0] = x+1; v1[1] = y+1; v1[2] = z; // grid5
          iv = (isolevel-gridVals[grid4]) / (gridVals[grid5]-gridVals[grid4]);
          vec3.lerp(vertlist[4], v0, v1, iv);
        }
	      if (edgeTable[cubeIndex] & 32) {
          v0[0] = x+1; v0[1] = y+1; v0[2] = z; // grid5
          v1[0] = x+1; v1[1] = y+1; v1[2] = z+1; // grid6
          iv = (isolevel-gridVals[grid5]) / (gridVals[grid6]-gridVals[grid5]);
          vec3.lerp(vertlist[5], v0, v1, iv);
        }
	      if (edgeTable[cubeIndex] & 64) {
          v0[0] = x+1; v0[1] = y+1; v0[2] = z+1; // grid6
          v1[0] = x; v1[1] = y+1; v1[2] = z+1; // grid7
          iv = (isolevel-gridVals[grid6]) / (gridVals[grid7]-gridVals[grid6]);
          vec3.lerp(vertlist[6], v0, v1, iv);
        }
	      if (edgeTable[cubeIndex] & 128) {
          v0[0] = x; v0[1] = y+1; v0[2] = z+1; // grid7
          v1[0] = x; v1[1] = y+1; v1[2] = z; // grid4
          iv = (isolevel-gridVals[grid7]) / (gridVals[grid4]-gridVals[grid7]);
          vec3.lerp(vertlist[7], v0, v1, iv);
        }
	      if (edgeTable[cubeIndex] & 256) {
          v0[0] = x; v0[1] = y; v0[2] = z; // grid0
          v1[0] = x; v1[1] = y+1; v1[2] = z; // grid4
          iv = (isolevel-gridVals[grid0]) / (gridVals[grid4]-gridVals[grid0]);
          vec3.lerp(vertlist[8], v0, v1, iv);
        }
	      if (edgeTable[cubeIndex] & 512) {
          v0[0] = x+1; v0[1] = y; v0[2] = z; // grid1
          v1[0] = x+1; v1[1] = y+1; v1[2] = z; // grid5
          iv = (isolevel-gridVals[grid1]) / (gridVals[grid5]-gridVals[grid1]);
          vec3.lerp(vertlist[9], v0, v1, iv);
        }
	      if (edgeTable[cubeIndex] & 1024) {
          v0[0] = x+1; v0[1] = y; v0[2] = z+1; // grid2
          v1[0] = x+1; v1[1] = y+1; v1[2] = z+1; // grid6
          iv = (isolevel-gridVals[grid2]) / (gridVals[grid6]-gridVals[grid2]);
          vec3.lerp(vertlist[10], v0, v1, iv);
        }
	      if (edgeTable[cubeIndex] & 2048) {
          v0[0] = x; v0[1] = y; v0[2] = z+1; // grid3
          v1[0] = x; v1[1] = y+1; v1[2] = z+1; // grid7
          iv = (isolevel-gridVals[grid3]) / (gridVals[grid7]-gridVals[grid3]);
          vec3.lerp(vertlist[11], v0, v1, iv);
        }

	      for (i=0; triTable[16 * cubeIndex + i] != -1; i+=3) {
          vert1 = vertlist[triTable[16 * cubeIndex + i + 1]];
          vert2 = vertlist[triTable[16 * cubeIndex + i + 2]];
          vert3 = vertlist[triTable[16 * cubeIndex + i]];

          // represent the position as an index with respect to the grid size
          idx1 = (vert1[0] | 0) + size[0] * ((vert1[1] | 0) + size[1] * (vert1[2] | 0));
          idx2 = (vert2[0] | 0) + size[0] * ((vert2[1] | 0) + size[1] * (vert2[2] | 0));
          idx3 = (vert3[0] | 0) + size[0] * ((vert3[1] | 0) + size[1] * (vert3[2] | 0));

          var triangle = [-1, -1, -1];
          
          // vertices that map to the same index (i.e. have the same or have virtually the same position), are not added again, but are instead referenced (i.e. via indexed buffers)
          
          if (! vertexIndex[idx1]) {
            vertexIndex[idx1] = [vertices.length, []];
            vertices.push([vert1[0], vert1[1], vert1[2]]);
          }
          vertexIndex[idx1][1].push(faces.length);
          
          if (! vertexIndex[idx2]) {
            vertexIndex[idx2] = [vertices.length, []];
            vertices.push([vert2[0], vert2[1], vert2[2]]);
          }
          vertexIndex[idx2][1].push(faces.length);
          
          if (! vertexIndex[idx3]) {
            vertexIndex[idx3] = [vertices.length, []];
            vertices.push([vert3[0], vert3[1], vert3[2]]);
          }
          vertexIndex[idx3][1].push(faces.length);

          
          if (selectFunc) {
            triangle[0] = vertexIndex[idx3][0];
            triangle[1] = vertexIndex[idx2][0];
            triangle[2] = vertexIndex[idx1][0];
            vec3.sub(v0, vert2, vert1); vec3.sub(v1, vert3, vert1); var normal = [0.0, 0.0, 0.0]; vec3.cross(normal, v1, v0);
          }
          else {
            triangle[0] = vertexIndex[idx1][0];
            triangle[1] = vertexIndex[idx2][0];
            triangle[2] = vertexIndex[idx3][0];
            vec3.sub(v0, vert2, vert1); vec3.sub(v1, vert3, vert1); var normal = [0.0, 0.0, 0.0]; vec3.cross(normal, v0, v1);
          }
          
          lines.push([triangle[0], triangle[1]]); lines.push([triangle[1], triangle[2]]); lines.push([triangle[0], triangle[2]]);
          faces.push(triangle);
          face_normals.push(normal);
        }
      }
    }
  }
  
  return {vertices:vertices, faces:faces, lines:lines, vertexIndex:vertexIndex, face_normals:face_normals};
};



// ** performs taubin smoothing for geometry (such as coarse/ccp4 surface) **
molmil.taubinSmoothing = function(vertices, faces, lambda, mu, iter) {
  var i, f, v, avgCoord = [0.0, 0.0, 0.0, 0], ref, tmp;
  var vertexInfo = [], vertexTemp = [];
      
  for (v=0; v<vertices.length; v++) {
    vertexInfo.push({});
    vertexTemp.push([0.0, 0.0, 0.0]);
  }
      
  for (f=0; f<faces.length; f++) {
    vertexInfo[faces[f][0]][faces[f][1]] = true; vertexInfo[faces[f][0]][faces[f][2]] = true;
    vertexInfo[faces[f][1]][faces[f][0]] = true; vertexInfo[faces[f][1]][faces[f][2]] = true;
    vertexInfo[faces[f][2]][faces[f][0]] = true; vertexInfo[faces[f][2]][faces[f][1]] = true;
  }
  for (v=0; v<vertices.length; v++) vertexInfo[v] = Object.keys(vertexInfo[v]);
      
  var smoothFunc = function(factor) {
    for (v=0; v<vertices.length; v++) {
      avgCoord[0] = 0.0; avgCoord[1] = 0.0; avgCoord[2] = 0.0; avgCoord[3] = 0;
      for (i=0; i<vertexInfo[v].length; i++) {
        ref = vertices[vertexInfo[v][i]];
        avgCoord[0] += ref[0]; avgCoord[1] += ref[1]; avgCoord[2] += ref[2]; avgCoord[3] += 1;
      }
      if (avgCoord[3] == 0) continue;
      tmp = 1./avgCoord[3];
      avgCoord[0] *= tmp; avgCoord[1] *= tmp; avgCoord[2] *= tmp;
          
      vertexTemp[v][0] = vertices[v][0] + factor * (avgCoord[0] - vertices[v][0]);
      vertexTemp[v][1] = vertices[v][1] + factor * (avgCoord[1] - vertices[v][1]);
      vertexTemp[v][2] = vertices[v][2] + factor * (avgCoord[2] - vertices[v][2]);
      
    }
  };
      
   for (var it=0; it<iter; it++) {
     smoothFunc(lambda);
     for (v=0; v<vertices.length; v++) {vertices[v][0] = vertexTemp[v][0]; vertices[v][1] = vertexTemp[v][1]; vertices[v][2] = vertexTemp[v][2];}
     smoothFunc(mu);
    for (v=0; v<vertices.length; v++) {vertices[v][0] = vertexTemp[v][0]; vertices[v][1] = vertexTemp[v][1]; vertices[v][2] = vertexTemp[v][2];}
  }
}

// ** biological unit generation **
 
//no_identity, NOC
molmil.buCheck = function(assembly_id, displayMode, colorMode, struct, soup) {
  soup = soup || molmil.cli_soup;
  if (! struct) {for (var i=0; i<soup.structures.length; i++) if (soup.structures[i] instanceof molmil.entryObject) {struct = soup.structures[i]; break;}}
  
  var sceneBU = {};
  sceneBU.displayedChains = {}; // shouldn't this contain everything???
  sceneBU.COR = JSON.parse(JSON.stringify(soup.COR));
  sceneBU.geomRanges = JSON.parse(JSON.stringify(soup.geomRanges));  
  
  
//no_identity, NOC
  

  for (var c=0; c<struct.chains.length; c++) {
    if (struct.chains[c].display) sceneBU.displayedChains[struct.chains[c].name] = true;
  }

  var BU = struct.BUassemblies[assembly_id];
  
  var selectionAtoms, chain;
  var selectionAtoms = JSON.parse(JSON.stringify(molmil.configBox.backboneAtoms4Display)); selectionAtoms.CA = 1;
  
  var p=0, i, c, m, b, asym_ids, asym_ids_list = [], COM, COM_avg = [0, 0, 0, 0], COM_tmp = [0, 0, 0], atom;
  
  var toggleIdentity = {}, noe;
  
  for (p, c=0; p<BU.length; p++) {
    asym_ids = [];
    for (i=0; i<BU[p][1].length; i++) {
      if (soup.poly_asym_ids.indexOf(BU[p][1][i]) != -1) asym_ids.push(BU[p][1][i]);
      else toggleIdentity[BU[p][1][i]] = asym_ids;
    }
    asym_ids_list.push(asym_ids);
    
    for (i=0, b=0; i<BU[p][0].length; i++) {
      m = struct.BUmatrices[BU[p][0][i]];
      if (m[0] == "identity operation") continue;
      b++;
    }
    
    c += asym_ids.length*b;
  }
  
  
  var chainInfo = {}, any_identity = false, NOC = 0;
  // simpleDM
  // displayMode
  for (p=0; p<BU.length; p++) {
    asym_ids = asym_ids_list[p];
    // generate stuff...
    
    for (i=0; i<asym_ids.length; i++) {
      no_identity = true;
      if (! chainInfo.hasOwnProperty(asym_ids[i])) chainInfo[asym_ids[i]] = [];
      for (c=0; c<BU[p][0].length; c++) {
        m = struct.BUmatrices[BU[p][0][c]];
        if (m[0] == "identity operation") {no_identity = false; continue;}
        chainInfo[asym_ids[i]].push(m[1]);
      }
      
      var matrices = [];
      
      // bb cpk, ca cpk, ca structure
      if ((displayMode == 1 && colorMode == 1) || (displayMode == 2 && colorMode == 1) || (displayMode == 2 && colorMode == 4)) {
        for (c=0; c<BU[p][0].length; c++) {
          m = struct.BUmatrices[BU[p][0][c]];
          if (m[0] == "identity operation") {no_identity = false; continue;}
          matrices.push(m[1]);
        }

      }
      else if ((displayMode == 3 || displayMode == 4) && colorMode == 4) {
        for (c=0; c<BU[p][0].length; c++) {
          m = struct.BUmatrices[BU[p][0][c]];
          if (m[0] == "identity operation") {no_identity = false; continue;}
          matrices.push(m[1]);
        }
      
        
      }
      else if ((displayMode == 3 || displayMode == 4 || displayMode == 5) && (colorMode == 2 || colorMode == 3 || colorMode == 5)) {
        for (c=0; c<BU[p][0].length; c++) {
          m = struct.BUmatrices[BU[p][0][c]];
          if (m[0] == "identity operation") {no_identity = false; continue;}
          matrices.push(m[1]);
        }
      }
      else {
        for (c=0; c<BU[p][0].length; c++) {
          m = struct.BUmatrices[BU[p][0][c]];
          if (m[0] == "identity operation") {no_identity = false; continue;}
          matrices.push(m[1]);          
        }
      }

      for (c=0; c<matrices.length; c++) NOC++;
      if (! no_identity) any_identity = true;
    }
  }
  
  sceneBU.chainInfo = chainInfo;
  sceneBU.NOC = NOC;
  sceneBU.no_identity = ! any_identity;
  


  var tst = soup.pdbxData.pdbx_struct_assembly || {details: []};
  var ref = ["octahedral", "tetrahedral", "dihedral", "circular", "point"];
  var OK = false, OK_type = 0;
  for (var i=0, j; i<tst.details.length; i++) {
    for (j=0; j<ref.length; j++) {
      if (tst.details[i].toLowerCase().indexOf(ref[j]) != -1) {OK = true; OK_type = 1; break;}
    }
    if (OK) break;
  }
  
  var ref = ["icosahedral", "helical"];
  for (var i=0, j; i<tst.details.length; i++) {
    for (j=0; j<ref.length; j++) {
      if (tst.details[i].toLowerCase().indexOf(ref[j]) != -1) {OK = true; OK_type = 2; break;}
    }
    if (OK) break;
  }
  
  var sinfo = {}, norInfo = {};
  if (soup.pdbxData.entity_poly && soup.pdbxData.entity_poly.entity_id) {
    for (var i=0; i<soup.pdbxData.entity_poly.entity_id.length; i++) sinfo[soup.pdbxData.entity_poly.entity_id[i]] = soup.pdbxData.entity_poly.pdbx_seq_one_letter_code_can[i].replace(/\s/g, '').length;
  }
  for (var i=0; i<soup.pdbxData.struct_asym.id.length; i++) norInfo[soup.pdbxData.struct_asym.id[i]] = sinfo[soup.pdbxData.struct_asym.entity_id[i]] || 0;

  var nor, sz = 0;
  if (assembly_id != -1) {
    for (var i=0,j; i<struct.BUassemblies[assembly_id].length; i++) {
      nor = 0;
      for (j=0; j<struct.BUassemblies[assembly_id][i][1].length; j++) nor += norInfo[struct.BUassemblies[assembly_id][i][1][j]] || 0;
      sz += struct.BUassemblies[assembly_id][i][0].length * nor;
    }
  }
  sceneBU.isBU = OK;
  sceneBU.size = sz;
  sceneBU.type = OK_type;

  var update = false;
  for (c=0; c<struct.chains.length; c++) { // add some functionality to check whether no changes to the AU were made, and if not --> don't update this stuff...
    if (toggleIdentity.hasOwnProperty(struct.chains[c].name)) {
      asym_ids = toggleIdentity[struct.chains[c].name];
      if (asym_ids instanceof Array) {
        b = false;
        for (i=0; i<asym_ids.length; i++) {
          if (toggleIdentity.hasOwnProperty(asym_ids[i])) {b = true; break;}
        }
        if (! b) {
          sceneBU.displayedChains[struct.chains[c].name] = false;
          continue;
        }
      }
      if (! sceneBU.displayedChains[struct.chains[c].name]) sceneBU.displayedChains[struct.chains[c].name] = true;
    }
    else if (sceneBU.displayedChains[struct.chains[c].name]) sceneBU.displayedChains[struct.chains[c].name] = false;
  }

  sceneBU.assembly_id = assembly_id;

  return sceneBU;
  
} 

molmil.figureOutAssemblyId = function(pdbxData, BUassemblies) {
  var assembly_id = null;
      
  if (pdbxData.pdbx_struct_assembly) {
    var tst = pdbxData.pdbx_struct_assembly || {details: []};
    for (var i=0; i<tst.details.length; i++) {
      if (tst.details[i].substr(0, 19) == "author_and_software") {assembly_id = tst.id[i]; break;}
    }
    if (assembly_id == null) {
      for (var i=0; i<tst.details.length; i++) {
        if (tst.details[i].substr(0, 6) == "author") {assembly_id = tst.id[i]; break;}
      }
    }
    if (assembly_id == null) {
      for (var i=0; i<tst.details.length; i++) {
        if (tst.details[i].substr(0, 8) == "software") {assembly_id = tst.id[i]; break;}
      }
    }
  }

  if (assembly_id == null) {
    var sinfo = {}, norInfo = {};
    if (pdbxData.entity_poly && pdbxData.entity_poly.entity_id) {
      for (var i=0; i<pdbxData.entity_poly.entity_id.length; i++) sinfo[pdbxData.entity_poly.entity_id[i]] = pdbxData.entity_poly.pdbx_seq_one_letter_code_can[i].replace(/\s/g, '').length;
    }
    for (var i=0; i<pdbxData.struct_asym.id.length; i++) norInfo[pdbxData.struct_asym.id[i]] = sinfo[pdbxData.struct_asym.entity_id[i]] || 0;
        
    var largest = [null, 0];        
        
    for (var aid in BUassemblies) {
      var nor, sz = 0;
      if (isNaN(parseInt(aid, 10))) continue;
      for (var i=0,j; i<BUassemblies[aid].length; i++) {
        nor = 0;
        for (j=0; j<BUassemblies[aid][i][1].length; j++) nor += norInfo[BUassemblies[aid][i][1][j]] || 0;
        sz += BUassemblies[aid][i][0].length * nor;
      }
          
      if (sz > largest[1]) {largest[0] = aid; largest[1] = sz;}
    }
        
    if (largest[0] != null) assembly_id = largest[0];
        
  }
      
  if (assembly_id == null) assembly_id = -1;
      
  return assembly_id;
}


// separate display & color modes...
// displayModes:
//  - 1 --> backbone (wireframe)
//  - 2 --> ca (wireframe)
//  - 3 --> tube
//  - 4 --> cartoon
//  - 5 --> coarse grained surface (maybe in the future also add highres surface?) <-- now implement this one...
// colorModes:
//  - 1 --> cpk (only for displayModes 1/2)
//  - 2 --> asym chain
//  - 3 --> chain
//  - 4 --> structure
//  - list --> custom list of colors
molmil.toggleBU = function(assembly_id, displayMode, colorMode, struct, soup) {molmil.selectBU(assembly_id, displayMode, colorMode, {}, struct, soup);}
molmil.selectBU = function(assembly_id, displayMode, colorMode, options, struct, soup) {
  options = options || {};
  soup = soup || molmil.cli_soup;
  if (! struct) {for (var i=0; i<soup.structures.length; i++) if (soup.structures[i] instanceof molmil.entryObject) {struct = soup.structures[i]; break;}}
  
  var renderer = soup.renderer;
  var gl = renderer.gl;
  var models = soup.models;
  
  if (! soup.sceneBU) {
    soup.sceneBU = {};
    soup.sceneBU.displayedChains = {}; // shouldn't this contain everything???
    soup.sceneBU.COR = JSON.parse(JSON.stringify(soup.COR));
    soup.sceneBU.geomRanges = JSON.parse(JSON.stringify(soup.geomRanges));
  }
  
  for (c=0; c<struct.chains.length; c++) {
    if (struct.chains[c].display) struct.chains[c].display = soup.sceneBU.displayedChains[struct.chains[c].name] = true;
  }
  
  // delete old programs... --> note that geometry will stay cached in the gpu memory...
  for (var p=0; p<renderer.programs.length; p++) if (renderer.programs[p].BUprogram) {renderer.programs.splice(p, 1); p--;}
  
  // get single COM
  if (assembly_id == -1) {
    soup.COR = JSON.parse(JSON.stringify(soup.sceneBU.COR));
    soup.geomRanges = JSON.parse(JSON.stringify(soup.sceneBU.geomRanges));
  
    var update = false;

    for (c=0; c<struct.chains.length; c++) {
      if (! struct.chains[c].display) {
        struct.chains[c].display = soup.sceneBU.displayedChains[struct.chains[c].name] = true;
        update = true;
      }
    }
    
    if (soup.sceneBU.no_identity) {
      soup.renderer.program1.status = soup.renderer.program2.status = soup.renderer.program3.status = true;
      soup.sceneBU.no_identity = false;
    }  
    
    if (update) renderer.initBuffers();
    soup.canvas.update = true;
    
    if (soup.sceneBU.assembly_id != assembly_id) renderer.camera.z = soup.calcZ();
    soup.sceneBU.assembly_id = assembly_id;
    
    return;
  }
  
  var xyzs = [];
  
  var BU = struct.BUassemblies[assembly_id];

  var selectionAtoms, chain;
  var selectionAtoms = JSON.parse(JSON.stringify(molmil.configBox.backboneAtoms4Display)); selectionAtoms.CA = 1;
  
  var lines2draw, atoms2draw, rgba, vertices, vertices8, indices, refy, vbuffer, ibuffer;
  var p=0, j, i, c, m, m8, b, asym_ids, asym_ids_list = [], COM, COM_avg = [0, 0, 0, 0], COM_tmp = [0, 0, 0], atom;

  var matSz = 0;
  var toggleIdentity = {}, noe;
  
  for (p, c=0; p<BU.length; p++) {
    asym_ids = [];
    for (i=0; i<BU[p][1].length; i++) {
      if (soup.poly_asym_ids.indexOf(BU[p][1][i]) != -1) asym_ids.push(BU[p][1][i]);
      else toggleIdentity[BU[p][1][i]] = asym_ids;
    }
    asym_ids_list.push(asym_ids);
    
    for (i=0, b=0; i<BU[p][0].length; i++) {
      m = struct.BUmatrices[BU[p][0][i]];
      if (m[0] == "identity operation") continue;
      b++;
    }
    
    matSz += b;
    
    c += asym_ids.length*b;
  }
  
  var uniform_colors = [], no_identity = true, detail_or;
  if (colorMode == 2) b = (asym_ids_list[0] || []).length; // asym chain
  else if (colorMode == 3) b = c; // chain
  else if (colorMode instanceof Array) {
    uniform_colors = colorMode;
    if (! (uniform_colors[0] instanceof Array)) uniform_colors = [uniform_colors];
    colorMode = 5; b = 0;
  }

  for (i=0, m=0; i<b; i++, m++) {
    if (m >= molmil.configBox.bu_colors.length) m = 0;
    if (displayMode == 5) uniform_colors.push(molmil.lighterRGB(molmil.configBox.bu_colors[m], 0.5));
    else uniform_colors.push(molmil.configBox.bu_colors[m]);
    
  }

  var xMin = 1e99, xMax = -1e99, yMin = 1e99, yMax = -1e99, zMin = 1e99, zMax = -1e99, A = [0, 0, 0], B = [0, 0, 0];
  
  var chainInfo = {}, any_identity = false, NOC = 0, rangeInfo;
  
  for (p=0, j=0; p<BU.length; p++) {
    asym_ids = asym_ids_list[p];
    // generate stuff...
    for (i=0; i<asym_ids.length; i++) {
      rangeInfo = null;
      no_identity = true;
      if (! chainInfo.hasOwnProperty(asym_ids[i])) chainInfo[asym_ids[i]] = [];
      if (soup.BUcache.hasOwnProperty(asym_ids[i]) && soup.BUcache[asym_ids[i]].hasOwnProperty(displayMode) && ! molmil.geometry.skipClearBuffer) {
        c = soup.BUcache[asym_ids[i]][displayMode]; vbuffer = c[0]; ibuffer = c[1]; COM = c[2]; noe = c[3]; rangeInfo = c[4]; vertices = c[5];
      }
      else if (displayMode == 3 || displayMode == 4 || displayMode == 6) { // tube or cartoon
        var dm_cache = [], rgba_cache = [], tmp, xyz, chains = [];
      
        var DM = 2;
        if (displayMode == 4) DM = 3;
        if (displayMode == 6) DM = 4;
        COM = [0, 0, 0, 0];
        A[0] = A[1] = A[2] = 1e99; // xyzMin
        B[0] = B[1] = B[2] = -1e99; // xyzMax

        for (c=0; c<struct.chains.length; c++) {
          //if (struct.chains[c].molecules.length < 1 || struct.chains[c].isHet || struct.chains[c].molecules[0].water) continue;
          if (struct.chains[c].molecules.length < 1 || struct.chains[c].molecules[0].water) continue;
          if (struct.chains[c].name != asym_ids[i]) continue;
          chains.push(struct.chains[c]);
          dm_cache.push(struct.chains[c].displayMode);
          struct.chains[c].display = true;
          if (struct.chains[c].displayMode != DM) {
            struct.chains[c].displayMode = DM;
            struct.chains[c].twoDcache = null;
          }
          rgba_cache.push(tmp=[]);
          for (m=0; m<struct.chains[c].molecules.length; m++) {
            tmp.push(struct.chains[c].molecules[m].rgba);
            struct.chains[c].molecules[m].rgba = molmil_dep.getKeyFromObject(molmil.configBox.sndStrucColor, struct.chains[c].molecules[m].sndStruc, molmil.configBox.sndStrucColor[1]);
            
            struct.chains[c].molecules[m].displayMode = DM == 4 ? 31 : 3;
            if (struct.chains[c].molecules[m].CA) {
              xyz = struct.chains[c].molecules[m].CA.xyz;
              COM[0] += struct.chains[c].modelsXYZ[0][xyz];
              COM[1] += struct.chains[c].modelsXYZ[0][xyz+1];
              COM[2] += struct.chains[c].modelsXYZ[0][xyz+2];
              COM[3] += 1;
              
              if (struct.chains[c].modelsXYZ[0][xyz] < A[0]) A[0] = struct.chains[c].modelsXYZ[0][xyz];
              if (struct.chains[c].modelsXYZ[0][xyz+1] < A[1]) A[1] = struct.chains[c].modelsXYZ[0][xyz+1];
              if (struct.chains[c].modelsXYZ[0][xyz+2] < A[2]) A[2] = struct.chains[c].modelsXYZ[0][xyz+2];
              if (struct.chains[c].modelsXYZ[0][xyz] > B[0]) B[0] = struct.chains[c].modelsXYZ[0][xyz];
              if (struct.chains[c].modelsXYZ[0][xyz+1] > B[1]) B[1] = struct.chains[c].modelsXYZ[0][xyz+1];
              if (struct.chains[c].modelsXYZ[0][xyz+2] > B[2]) B[2] = struct.chains[c].modelsXYZ[0][xyz+2];
            }
            else {
              for (var a=0; a<struct.chains[c].molecules[m].atoms.length; a++) {
                xyz = struct.chains[c].molecules[m].atoms[a].xyz;
                
                COM[0] += struct.chains[c].modelsXYZ[0][xyz];
                COM[1] += struct.chains[c].modelsXYZ[0][xyz+1];
                COM[2] += struct.chains[c].modelsXYZ[0][xyz+2];
                COM[3] += 1;
              
                if (struct.chains[c].modelsXYZ[0][xyz] < A[0]) A[0] = struct.chains[c].modelsXYZ[0][xyz];
                if (struct.chains[c].modelsXYZ[0][xyz+1] < A[1]) A[1] = struct.chains[c].modelsXYZ[0][xyz+1];
                if (struct.chains[c].modelsXYZ[0][xyz+2] < A[2]) A[2] = struct.chains[c].modelsXYZ[0][xyz+2];
                if (struct.chains[c].modelsXYZ[0][xyz] > B[0]) B[0] = struct.chains[c].modelsXYZ[0][xyz];
                if (struct.chains[c].modelsXYZ[0][xyz+1] > B[1]) B[1] = struct.chains[c].modelsXYZ[0][xyz+1];
                if (struct.chains[c].modelsXYZ[0][xyz+2] > B[2]) B[2] = struct.chains[c].modelsXYZ[0][xyz+2];
                
              }
            }
          }
        }
        COM[0] /= COM[3]; COM[1] /= COM[3]; COM[2] /= COM[3];
        
        molmil.geometry.reset();
        
        detail_or = 0;
        if (matSz > 10) detail_or--;
        if (matSz > 100) detail_or--;
        if (matSz > 1000) detail_or--;
        
        molmil.geometry.initChains(chains, renderer, detail_or);
        molmil.geometry.initCartoon(chains);
        molmil.geometry.generateCartoon(chains);
        vbuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vbuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices = molmil.geometry.buffer3.vertexBuffer, gl.STATIC_DRAW);
  
        ibuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices = molmil.geometry.buffer3.indexBuffer, gl.STATIC_DRAW);

        if (! soup.BUcache.hasOwnProperty(asym_ids[i])) soup.BUcache[asym_ids[i]] = {};
        
        soup.BUcache[asym_ids[i]][displayMode] = [vbuffer, ibuffer, COM, noe = molmil.geometry.buffer3.indexBuffer.length, [], vertices];

        for (c=0; c<chains.length; c++) {
          chains[c].displayMode = dm_cache[c];
          for (m=0; m<chains[c].molecules.length; m++) chains[c].molecules[m].rgba = rgba_cache[c][m];
        }
        
        molmil.geometry.reset();
        
      }
      else if (displayMode == 5) { // lowres surface...
        var surf, c2;
        for (c=0; c<struct.chains.length; c++) {
          if (struct.chains[c].molecules.length < 1 || struct.chains[c].isHet || struct.chains[c].molecules[0].water) continue;
          if (struct.chains[c].name != asym_ids[i]) continue;
          surf = molmil.coarseSurface(struct.chains[c], 7.5, 7.5*.75, {deproj: true});
          
          // build vbuffer, ibuffer, COM, noe
          
          vertices = new Float32Array(surf.vertices.length*8); // x, y, z, nx, ny, nz, rgba, none
          vertices8 = new Uint8Array(vertices.buffer);
          if (molmil.configBox.OES_element_index_uint) indices = new Uint32Array(surf.faces.length*3);
          else indices = new Uint16Array(surf.faces.length*3);
          COM = [0, 0, 0, 0];
          A[0] = A[1] = A[2] = 1e99; // xyzMin
          B[0] = B[1] = B[2] = -1e99; // xyzMax
          
          for (c2=0, m=0, m8=0; c2<surf.vertices.length; c2++, m8 += 32) {
            vertices[m++] = surf.vertices[c2][0];
            vertices[m++] = surf.vertices[c2][1];
            vertices[m++] = surf.vertices[c2][2];
            
            COM[0] += surf.vertices[c2][0]; COM[1] += surf.vertices[c2][1]; COM[2] += surf.vertices[c2][2]; COM[3] += 1;
            
            if (surf.vertices[c2][0] < A[0]) A[0] = surf.vertices[c2][0];
            if (surf.vertices[c2][1] < A[1]) A[1] = surf.vertices[c2][1];
            if (surf.vertices[c2][2] < A[2]) A[2] = surf.vertices[c2][2];
            if (surf.vertices[c2][0] > B[0]) B[0] = surf.vertices[c2][0];
            if (surf.vertices[c2][1] > B[1]) B[1] = surf.vertices[c2][1];
            if (surf.vertices[c2][2] > B[2]) B[2] = surf.vertices[c2][2];
            
            vertices[m++] = surf.normals[c2][0];
            vertices[m++] = surf.normals[c2][1];
            vertices[m++] = surf.normals[c2][2];
            
            m++; // color
            m++; // AID
          }
          
          COM[0] /= COM[3]; COM[1] /= COM[3]; COM[2] /= COM[3];
          
          for (c2=0, m=0; c2<surf.faces.length; c2++) {indices[m++] = surf.faces[c2][0]; indices[m++] = surf.faces[c2][1]; indices[m++] = surf.faces[c2][2];}
          
          vbuffer = gl.createBuffer();
          gl.bindBuffer(gl.ARRAY_BUFFER, vbuffer);
          gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
  
          ibuffer = gl.createBuffer();
          gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibuffer);
          gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
        
          if (! soup.BUcache.hasOwnProperty(asym_ids[i])) soup.BUcache[asym_ids[i]] = {};
        
          soup.BUcache[asym_ids[i]][displayMode] = [vbuffer, ibuffer, COM, noe = surf.faces.length*3, [], vertices];
        }
      }
      else {
        lines2draw = [];
        atoms2draw = {};
        if (displayMode == 1) {
          
          for (c=0; c<struct.chains.length; c++) {
            chain = struct.chains[c];
            if (! chain.bondsOK) renderer.soup.buildBondList(chain, false);
            for (b=0; b<chain.bonds.length; b++) 
              if (selectionAtoms.hasOwnProperty(chain.bonds[b][0].atomName) && selectionAtoms.hasOwnProperty(chain.bonds[b][1].atomName) && chain.bonds[b][0].molecule.chain.name == asym_ids[i] && chain.bonds[b][1].molecule.chain.name == asym_ids[i]) {
                lines2draw.push(chain.bonds[b]);
                atoms2draw[chain.bonds[b][0].AID] = chain.bonds[b][0];
                atoms2draw[chain.bonds[b][1].AID] = chain.bonds[b][1];
              }
            
          }
        }
        else if (displayMode == 2) {
          for (c=0; c<struct.chains.length; c++) {
            chain = struct.chains[c];
            
            for (m=0; m<chain.molecules.length; m++) {
              if (chain.molecules[m].CA && chain.molecules[m].next && chain.molecules[m].chain.name == asym_ids[i]) {
                lines2draw.push([chain.molecules[m].CA, chain.molecules[m].next.CA]);
              
                atoms2draw[chain.molecules[m].CA.AID] = chain.molecules[m].CA;
                atoms2draw[chain.molecules[m].next.CA.AID] = chain.molecules[m].next.CA;
              }
            }
            
          }
        }
        
        AIDs = Object.keys(atoms2draw); refy = {};
        // convert this to 32bit rgba
        vertices = new Float32Array((AIDs.length)*5); // x, y, z, rgba, AID
        vertices8 = new Uint8Array(vertices.buffer);
        if (molmil.configBox.OES_element_index_uint) indices = new Uint32Array(lines2draw.length*2);
        else indices = new Uint16Array(lines2draw.length*2);
        COM = [0, 0, 0, 0];
        A[0] = A[1] = A[2] = 1e99; // xyzMin
        B[0] = B[1] = B[2] = -1e99; // xyzMax
        
        if (displayMode == 2 && colorMode == 4) { // ca structure...

          for (c=0, m=0, m8=0; c<AIDs.length; c++, m8 += 20) {
            atom = atoms2draw[AIDs[c]]; chain = atom.chain;

            vertices[m++] = chain.modelsXYZ[0][atom.xyz];
            vertices[m++] = chain.modelsXYZ[0][atom.xyz+1];
            vertices[m++] = chain.modelsXYZ[0][atom.xyz+2];
          
            COM[0] += vertices[m-3]; COM[1] += vertices[m-2]; COM[2] += vertices[m-1];
            
            if (vertices[m-3] < A[0]) A[0] = vertices[m-3];
            if (vertices[m-2] < A[1]) A[1] = vertices[m-2];
            if (vertices[m-1] < A[2]) A[2] = vertices[m-1];
            if (vertices[m-3] > B[0]) B[0] = vertices[m-3];
            if (vertices[m-2] > B[1]) B[1] = vertices[m-2];
            if (vertices[m-1] > B[2]) B[2] = vertices[m-1];
         
            rgba = molmil_dep.getKeyFromObject(molmil.configBox.sndStrucColor, atoms2draw[AIDs[c]].molecule.sndStruc, molmil.configBox.sndStrucColor[1]);
            vertices8[m8+12] = rgba[0];
            vertices8[m8+13] = rgba[1];
            vertices8[m8+14] = rgba[2];
            vertices8[m8+15] = rgba[3];
            m++;
          
            vertices[m++] = AIDs[c];
           
            refy[AIDs[c]] = c;
          }
        
        }
        else {
          for (c=0, m=0, m8=0; c<AIDs.length; c++, m8 += 20) {
            atom = atoms2draw[AIDs[c]]; chain = atom.chain;

            vertices[m++] = chain.modelsXYZ[0][atom.xyz];
            vertices[m++] = chain.modelsXYZ[0][atom.xyz+1];
            vertices[m++] = chain.modelsXYZ[0][atom.xyz+2];
          
            COM[0] += vertices[m-3]; COM[1] += vertices[m-2]; COM[2] += vertices[m-1];
            
            if (vertices[m-3] < A[0]) A[0] = vertices[m-3];
            if (vertices[m-2] < A[1]) A[1] = vertices[m-2];
            if (vertices[m-1] < A[2]) A[2] = vertices[m-1];
            if (vertices[m-3] > B[0]) B[0] = vertices[m-3];
            if (vertices[m-2] > B[1]) B[1] = vertices[m-2];
            if (vertices[m-1] > B[2]) B[2] = vertices[m-1];
         
            rgba = molmil_dep.getKeyFromObject(molmil.configBox.elementColors, atoms2draw[AIDs[c]].element, molmil.configBox.elementColors.DUMMY);
            vertices8[m8+12] = rgba[0];
            vertices8[m8+13] = rgba[1];
            vertices8[m8+14] = rgba[2];
            vertices8[m8+15] = rgba[3];
            m++;
          
            vertices[m++] = AIDs[c];
           
            refy[AIDs[c]] = c;
          }
          
        }
        COM[0] /= AIDs.length; COM[1] /= AIDs.length; COM[2] /= AIDs.length;
        COM[3] = AIDs.length;
        
        for (c=0, m=0; c<lines2draw.length; c++) {
          indices[m++] = refy[lines2draw[c][0].AID];
          indices[m++] = refy[lines2draw[c][1].AID];
        }
        
        vbuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vbuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
  
        ibuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
        
        if (! soup.BUcache.hasOwnProperty(asym_ids[i])) soup.BUcache[asym_ids[i]] = {};
        
        soup.BUcache[asym_ids[i]][displayMode] = [vbuffer, ibuffer, COM, noe = indices.length, [], vertices];
      }

      for (c=0; c<BU[p][0].length; c++) {
        m = struct.BUmatrices[BU[p][0][c]];
        if (m[0] == "identity operation") {no_identity = false; continue;}
        chainInfo[asym_ids[i]].push(m[1]);
      }

      var settings = {multiMatrix: true}, matrices = [], uniform_color = [];
      
      // bb cpk, ca cpk, ca structure
      if ((displayMode == 1 && colorMode == 1) || (displayMode == 2 && colorMode == 1) || (displayMode == 2 && colorMode == 4)) {
        for (c=0; c<BU[p][0].length; c++) {
          m = struct.BUmatrices[BU[p][0][c]];
          if (m[0] == "identity operation") {no_identity = false; continue;}
          matrices.push(m[1]);
        }
        
        settings.has_ID = true;
        settings.lines_render = true;
      }
      else if ((displayMode == 3 || displayMode == 4 || displayMode == 6) && colorMode == 4) {
        for (c=0; c<BU[p][0].length; c++) {
          m = struct.BUmatrices[BU[p][0][c]];
          if (m[0] == "identity operation") {no_identity = false; continue;}
          matrices.push(m[1]);
        }
      
        settings.solid = true;
        settings.has_ID = true;
      }
      else if ((displayMode == 3 || displayMode == 4 || displayMode == 5 || displayMode == 6) && (colorMode == 2 || colorMode == 3 || colorMode == 5)) {
        uniform_color = [];
        for (c=0; c<BU[p][0].length; c++) {
          m = struct.BUmatrices[BU[p][0][c]];
          if (m[0] == "identity operation") {no_identity = false; continue;}
          matrices.push(m[1]);
          if (colorMode == 2) uniform_color.push(uniform_colors[i] || [255, 255, 255]); // asym chain
          else if (colorMode == 3) {
            uniform_color.push(uniform_colors[j++] || [255, 255, 255]); // chain
          }
          else if (colorMode == 5) {
            if (options.customColorAsym) uniform_color.push(uniform_colors[i] || [255, 255, 255]); // chain
            else uniform_color.push(uniform_colors[j++] || [255, 255, 255]); // chain
          }
          if (j >= uniform_colors.length) j = 0;
        }
        
        settings.solid = true;
        settings.uniform_color = true;
        settings.has_ID = true;
      }
      else {
        uniform_color = [];
        for (c=0; c<BU[p][0].length; c++) {
          m = struct.BUmatrices[BU[p][0][c]];
          if (m[0] == "identity operation") {no_identity = false; continue;}
          matrices.push(m[1]);          
          if (colorMode == 2) uniform_color.push(uniform_colors[i]); // asym chain
          else if (colorMode == 3) {
            uniform_color.push(uniform_colors[j++]); // chain
          }
          else if (colorMode == 5) {
            uniform_color.push(uniform_colors[j++] || [255, 255, 255]); // chain
          }
          if (j >= uniform_colors.length) j = 0;
        }
        
        settings.lines_render = true;
        settings.uniform_color = true;
        settings.has_ID = true;
      }

      var program = molmil.geometry.build_simple_render_program(null, null, renderer, settings);
      program.vertexBuffer = vbuffer; program.indexBuffer = ibuffer; program.nElements = noe;
      if (molmil.geometry.skipClearBuffer) program.data = {vertices: vertices, indices: indices};
      program.BUprogram = true; program.matrices = matrices; program.uniform_color = uniform_color;
      if (program.matrices.length) {
        renderer.addProgram(program);
        if (options.orient) {
          var saa = settings.lines_render ? 4 : 7, temp = vec3.create(), j, c;
          if (settings.has_ID) saa++;
          if (! settings.lines_render) saa *= 10; // we don't have to save every vertex
          for (j=0; j<vertices.length; j+=saa) {
            temp[0] = vertices[j]; temp[1] = vertices[j+1]; temp[2] = vertices[j+2];
            for (c=0; c<matrices.length; c++) xyzs.push(vec3.transformMat4([], temp, matrices[c]));
          }
        }
      }
      if (rangeInfo) {A = rangeInfo[0]; B = rangeInfo[1];}
      else {
        try {soup.BUcache[asym_ids[i]][displayMode][4] = [[A[0], A[1], A[2]], [B[0], B[1], B[2]]];}
        catch (e) {}
      }
      if (! no_identity) {
        if (COM[3] != 0) {
          COM_avg[0] += COM[0]*COM[3]; COM_avg[1] += COM[1]*COM[3]; COM_avg[2] += COM[2]*COM[3]; COM_avg[3] += COM[3];
          if (A[0] < xMin) xMin = A[0];
          if (A[1] < yMin) yMin = A[1];
          if (A[2] < zMin) zMin = A[2];
          if (B[0] > xMax) xMax = B[0];
          if (B[1] > yMax) yMax = B[1];
          if (B[2] > zMax) zMax = B[2];
        }
        toggleIdentity[asym_ids[i]] = 1;
        any_identity = true;
      }

      // only do this if it is NOT a reducing BU...
      if (vertices.length) {
        for (c=0; c<program.matrices.length; c++) {
          if (COM[3] == 0) continue;
          vec3.transformMat4(COM_tmp, COM, program.matrices[c]);
          COM_avg[0] += COM_tmp[0]*COM[3]; COM_avg[1] += COM_tmp[1]*COM[3]; COM_avg[2] += COM_tmp[2]*COM[3]; COM_avg[3] += COM[3];
          vec3.transformMat4(COM_tmp, A, program.matrices[c]);
          if (COM_tmp[0] < xMin) xMin = COM_tmp[0];
          if (COM_tmp[1] < yMin) yMin = COM_tmp[1];
          if (COM_tmp[2] < zMin) zMin = COM_tmp[2];
          vec3.transformMat4(COM_tmp, B, program.matrices[c]);
          if (COM_tmp[0] > xMax) xMax = COM_tmp[0];
          if (COM_tmp[1] > yMax) yMax = COM_tmp[1];
          if (COM_tmp[2] > zMax) zMax = COM_tmp[2];
          NOC++;
        }
      }
    }
  }
  
  if (COM_avg[3]) {COM_avg[0] /= COM_avg[3]; COM_avg[1] /= COM_avg[3]; COM_avg[2] /= COM_avg[3];}
  
  if (! soup.skipCOGupdate) {
    soup.COR[0] = COM_avg[0];
    soup.COR[1] = COM_avg[1];
    soup.COR[2] = COM_avg[2];
  }
  
  soup.sceneBU.chainInfo = chainInfo;
  soup.sceneBU.NOC = NOC;
  
  if (! any_identity) {
    soup.renderer.program1.status = soup.renderer.program2.status = soup.renderer.program3.status = false;
  }
  else {
    soup.renderer.program1.status = soup.renderer.program2.status = soup.renderer.program3.status = true;
  }
  
  soup.sceneBU.no_identity = ! any_identity;
  
  //console.log(toggleIdentity, struct, no_identity);
  var update = false;
  
  for (c=0; c<struct.chains.length; c++) { // add some functionality to check whether no changes to the AU were made, and if not --> don't update this stuff...
    if (toggleIdentity.hasOwnProperty(struct.chains[c].name)) {
      asym_ids = toggleIdentity[struct.chains[c].name];
      
      if (asym_ids instanceof Array) {
        b = false;
        for (i=0; i<asym_ids.length; i++) {
          if (toggleIdentity.hasOwnProperty(asym_ids[i])) {b = true; break;}
        }
        
        if (struct.chains[c].molecules[0].water && ! soup.showWaters) b = false; // make sure that waters are hidden...
        
        if (! b) {
          struct.chains[c].display = soup.sceneBU.displayedChains[struct.chains[c].name] = false;
          update = true;
          continue;
        }
      }
      if (! struct.chains[c].display) {
        struct.chains[c].display = soup.sceneBU.displayedChains[struct.chains[c].name] = true;
        update = true;
      }
    }
    else if (struct.chains[c].display) {
      struct.chains[c].display = soup.sceneBU.displayedChains[struct.chains[c].name] = false;
      update = true;
    }
  }

  for (c=0; c<struct.chains.length; c++) {
    if (struct.chains[c].display && struct.chains[c].isHet) {
      for (i=0; i<struct.chains[c].atoms.length; i++) {
        if (! struct.chains[c].atoms[i].display) continue;
        b = struct.chains[c].atoms[i].xyz;
        if (struct.chains[c].modelsXYZ[0][b] < xMin) xMin = struct.chains[c].modelsXYZ[0][b];
        if (struct.chains[c].modelsXYZ[0][b+1] < yMin) yMin = struct.chains[c].modelsXYZ[0][b+1];
        if (struct.chains[c].modelsXYZ[0][b+2] < zMin) zMin = struct.chains[c].modelsXYZ[0][b+2];
        
        if (struct.chains[c].modelsXYZ[0][b] > xMax) xMax = struct.chains[c].modelsXYZ[0][b];
        if (struct.chains[c].modelsXYZ[0][b+1] > yMax) yMax = struct.chains[c].modelsXYZ[0][b+1];
        if (struct.chains[c].modelsXYZ[0][b+2] > zMax) zMax = struct.chains[c].modelsXYZ[0][b+2];
      }
    }
  }
  soup.sceneBU.info = {};
  soup.sceneBU.info.COR = COM_avg;
  soup.sceneBU.info.geomRanges = [xMin-COM_avg[0], xMax-COM_avg[0], yMin-COM_avg[1], yMax-COM_avg[1], zMin-COM_avg[2], zMax-COM_avg[2]];
  if (xMin < 1e9 && ! soup.skipCOGupdate) soup.geomRanges = [xMin-COM_avg[0], xMax-COM_avg[0], yMin-COM_avg[1], yMax-COM_avg[1], zMin-COM_avg[2], zMax-COM_avg[2]];
  
  // geomRanges doesn't appear to be correct...
    
  if (COM_avg[3] == 0 && ! soup.skipCOGupdate) {
    soup.COR = JSON.parse(JSON.stringify(soup.sceneBU.COR));
    soup.geomRanges = JSON.parse(JSON.stringify(soup.sceneBU.geomRanges));
  }

  // add some way to update stdXYZ to deal properly with fog (and DoF in the future)
  
  if (update || ! renderer.initBD) renderer.initBuffers();
  
  if (soup.sceneBU.assembly_id != assembly_id) renderer.camera.z = soup.calcZ();
  soup.sceneBU.assembly_id = assembly_id;
  soup.sceneBU.displayMode = displayMode;
  soup.sceneBU.colorMode = colorMode;
 
  if (options.orient) {
    var chain, modelsXYZ;
    for (c=0; c<struct.chains.length; c++) {
      chain = struct.chains[c];
      modelsXYZ = chain.modelsXYZ[soup.renderer.modelId];
      if (chain.display && ! chain.molecules[0].water) {
        for (i=0; i<chain.atoms.length; i++) {
          if (! chain.atoms[i].display) continue;
          xyzs.push([modelsXYZ[chain.atoms[i].xyz], modelsXYZ[chain.atoms[i].xyz+1], modelsXYZ[chain.atoms[i].xyz+2]]);
        }
      }
    }
    molmil.orient(null, soup, xyzs);
  }

  soup.canvas.update = true;
}

molmil.BU2JSO = function(assembly_id, options, struct, soup) {
  options = options || {};
  soup = soup || molmil.cli_soup;
  if (! struct) {for (var i=0; i<soup.structures.length; i++) if (soup.structures[i] instanceof molmil.entryObject) {struct = soup.structures[i]; break;}}
  
  var atom_site = {group_PDB: [], type_symbol: [], label_atom_id: [], label_alt_id: [], label_comp_id: [], label_asym_id: [], label_entity_id: [], label_seq_id: [], Cartn_x: [], Cartn_y: [], Cartn_z: [], auth_asym_id: [], id: []};
  var pdbx_chain_remapping = {entity_id: [], label_asym_id: [], auth_asym_id: [], orig_label_asym_id: [], orig_auth_asym_id: [], applied_operations: []};
  if (options.modelMode) atom_site.pdbx_PDB_model_num = [];
  
  if (assembly_id == -1) var BU = [[[null], undefined]];
  else var BU = struct.BUassemblies[assembly_id];
  
  var p=0, i, c, asym_ids, id = 1;
  var m, matrix, buid;
  var oldChain, oldResidue, oldAtom;
  var xyzin = vec3.create(), xyzout = vec3.create(), cp, bucounter = 1;
  
  var buid_identity = null;
  for (p in struct.BUmatrices) if (struct.BUmatrices[p][0] == "identity operation") {buid_identity = p; break;}

  for (p=0; p<BU.length; p++) {
    asym_ids = BU[p][1] ? new Set(BU[p][1]) : BU[p][1];
    
    for (cp=0; cp<BU[p][0].length; cp++) {
      m = BU[p][0][cp] == null ? ["identity operation", mat4.create()] : struct.BUmatrices[BU[p][0][cp]];
      if (options.modelMode) buid = null;
      if (m[0] == "identity operation") buid = "";
      else {buid = "-"+BU[p][0][cp]; bucounter++;}
      matrix = m[1];

      for (c=0; c<struct.chains.length; c++) {
        oldChain = struct.chains[c];
        
        pdbx_chain_remapping.entity_id.push(oldChain.entity_id);
        pdbx_chain_remapping.label_asym_id.push(oldChain.name+buid);
        pdbx_chain_remapping.auth_asym_id.push(oldChain.authName+buid);
        pdbx_chain_remapping.orig_label_asym_id.push(oldChain.name);
        pdbx_chain_remapping.orig_auth_asym_id.push(oldChain.authName);
        if (buid == "") pdbx_chain_remapping.applied_operations.push(buid_identity);
        else pdbx_chain_remapping.applied_operations.push(buid.substr(1));

        if (asym_ids !== undefined && ! asym_ids.has(oldChain.name)) continue;

        for (m=0; m<oldChain.molecules.length; m++) {
          oldResidue = oldChain.molecules[m];
        
          for (a=0; a<oldResidue.atoms.length; a++) {
            oldAtom = oldResidue.atoms[a];
            
            xyzin[0] = oldChain.modelsXYZ[0][oldAtom.xyz];
            xyzin[1] = oldChain.modelsXYZ[0][oldAtom.xyz+1];
            xyzin[2] = oldChain.modelsXYZ[0][oldAtom.xyz+2];
            vec3.transformMat4(xyzout, xyzin, matrix);
            
            atom_site.group_PDB.push(oldResidue.ligand ? "HETATM" : "ATOM");
            atom_site.Cartn_x.push(xyzout[0]);
            atom_site.Cartn_y.push(xyzout[1]);
            atom_site.Cartn_z.push(xyzout[2]);
            atom_site.auth_asym_id.push(oldChain.authName+buid);
            atom_site.label_asym_id.push(oldChain.name+buid);
            atom_site.label_alt_id.push(oldAtom.label_alt_id||".");
            atom_site.label_atom_id.push(oldAtom.atomName);
            atom_site.label_comp_id.push(oldResidue.name);
            atom_site.label_entity_id.push(oldChain.entity_id||".");
            atom_site.label_seq_id.push(oldResidue.RSID);
            atom_site.type_symbol.push(oldAtom.element);
            atom_site.id.push(id++);
            
            if (options.modelMode) atom_site.pdbx_PDB_model_num.push(bucounter);
          }
        }
      }
    }
  }
  
  var obj = {atom_site: atom_site};
  if (! options.modelMode) obj.pdbx_chain_remapping = pdbx_chain_remapping;
  return obj;
}

// the goal of this function is to simply duplicate the BU (i.e. instead of doing on the GPU, create explicit in-memory copies of the structure and transform its location...)
molmil.duplicateBU = function(assembly_id, options, struct, soup) {
  options = options || {};
  soup = soup || molmil.cli_soup;
  if (! struct) {for (var i=0; i<soup.structures.length; i++) if (soup.structures[i] instanceof molmil.entryObject) {struct = soup.structures[i]; break;}}
  
  var newStrucs = [];
  
  var renderer = soup.renderer;
  var gl = renderer.gl;
  var models = soup.models;
  
  var BU = struct.BUassemblies[assembly_id];
  
  var p=0, i, c, asym_ids;
  
  var m, matrix, cpID = 1;
  
  var newStruc, newChain, newResidue, newAtom;
  var oldChain, oldResidue, oldAtom;
  
  var xyzin = vec3.create(), xyzout = vec3.create(), cp;
  
  var keep_chains = [];
  
  for (p=0; p<BU.length; p++) {    
    asym_ids = BU[p][1];
    
    for (cp=0; cp<BU[p][0].length; cp++) {
      m = struct.BUmatrices[BU[p][0][cp]];
      matrix = m[1];
      
      if (m[0] == "identity operation") {
        keep_chains = keep_chains.concat(asym_ids);
        continue;
      }
      
      if (options.mergeAll) {
        newStruc = struct;
        newStruc.temp_chains = [];
      }
      else {
        newStruc = new molmil.entryObject({id: "bu_"+cpID, "idnr": struct.meta.idnr+"."+cpID});
        newStruc.soup = soup;
      }

      for (i=0; i<asym_ids.length; i++) {
        for (c=0; c<struct.chains.length; c++) {
          oldChain = struct.chains[c];
          if (oldChain.name != asym_ids[i]) continue;

          if (options.mergeAll) newStruc.temp_chains.push(newChain = new molmil.chainObject(oldChain.name, newStruc));
          else newStruc.chains.push(newChain = new molmil.chainObject(oldChain.name, newStruc));
          newChain.modelsXYZ[0] = oldChain.modelsXYZ[0].slice();
          
          for (m=0; m<oldChain.molecules.length; m++) {
            oldResidue = oldChain.molecules[m];
            newChain.molecules.push(newResidue = new molmil.molObject(oldResidue.name, oldResidue.id, newChain));
          
            for (a=0; a<oldResidue.atoms.length; a++) {
              oldAtom = oldResidue.atoms[a];
              newResidue.atoms.push(newAtom=new molmil.atomObject(oldAtom.xyz, oldAtom.atomName, oldAtom.element, newResidue, newChain));
              newChain.atoms.push(newAtom);
              newAtom.display = oldAtom.display;
              newAtom.ligand = oldAtom.ligand;
              newAtom.AID = soup.AID++;
              soup.atomRef[newAtom.AID] = newAtom;
            
              newAtom.displayMode = oldAtom.displayMode;
              newAtom.rgba = oldAtom.rgba.slice();
              newAtom.radius = oldAtom.radius;
            
              xyzin[0] = newChain.modelsXYZ[0][newAtom.xyz];
              xyzin[1] = newChain.modelsXYZ[0][newAtom.xyz+1];
              xyzin[2] = newChain.modelsXYZ[0][newAtom.xyz+2];
            
              vec3.transformMat4(xyzout, xyzin, matrix);

              newChain.modelsXYZ[0][newAtom.xyz] = xyzout[0];
              newChain.modelsXYZ[0][newAtom.xyz+1] = xyzout[1];
              newChain.modelsXYZ[0][newAtom.xyz+2] = xyzout[2];
            
              if (oldResidue.N == oldAtom) newResidue.N = newAtom;
              if (oldResidue.CA == oldAtom) newResidue.CA = newAtom;
              if (oldResidue.C == oldAtom) newResidue.C = newAtom;
              if (oldResidue.O == oldAtom) newResidue.O = newAtom;
            }

            newResidue.RSID = oldResidue.RSID;
            newResidue.ligand = oldResidue.ligand;
            newResidue.water = oldResidue.water;
            newResidue.display = oldResidue.display;
            newResidue.rgba = oldResidue.rgba.slice();
            newResidue.sndStruc = oldResidue.sndStruc;
            newResidue.xna = oldResidue.xna;
            newResidue.showSC = oldResidue.showSC;
          }
        
          newChain.authName = oldChain.authName;
          newChain.entity_id = oldChain.entity_id;
          newChain.CID = oldChain.CID;
          newChain.display = oldChain.display;
          newChain.displayMode = oldChain.displayMode;
          newChain.isHet = oldChain.isHet;
          newChain.rgba = oldChain.rgba.slice();
          newChain.CID = oldChain.CID;
        
          soup.buildMolBondList(newChain);
        }
      }
      
      if (options.mergeAll) {
        newStruc.temp_chains.forEach(function(x, i){newStruc.chains.push(x); x.name += "_"+i; keep_chains.push(x.name);});
        newStruc.temp_chains = undefined;
      }
      else if (newStruc.chains.length) {newStrucs.push(newStruc); soup.structures.push(newStruc); cpID++;}
    }
  }

  keep_chains = new Set(keep_chains);
  for (c=0; c<struct.chains.length; c++) { // add some functionality to check whether no changes to the AU were made, and if not --> don't update this stuff...
    if (! keep_chains.has(struct.chains[c].name)) {
      for (a=0; a<struct.chains[c].atoms.length; a++) delete soup.atomRef[struct.chains[c].atoms[a].AID];
      struct.chains.splice(c, 1); c--;
    }
  }
  
/*

  for (c=0; c<struct.chains.length; c++) { // add some functionality to check whether no changes to the AU were made, and if not --> don't update this stuff...
    if (toggleIdentity.hasOwnProperty(struct.chains[c].name)) {
      asym_ids = toggleIdentity[struct.chains[c].name];
      
      if (asym_ids instanceof Array) {
        b = false;
        for (i=0; i<asym_ids.length; i++) {
          if (toggleIdentity.hasOwnProperty(asym_ids[i])) {b = true; break;}
        }
        
        if (struct.chains[c].molecules[0].water && ! soup.showWaters) b = false; // make sure that waters are hidden...
        
        if (! b) {
          struct.chains[c].display = soup.sceneBU.displayedChains[struct.chains[c].name] = false;
          update = true;
          continue;
        }
      }
      if (! struct.chains[c].display) {
        struct.chains[c].display = soup.sceneBU.displayedChains[struct.chains[c].name] = true;
        update = true;
      }
    }
    else if (struct.chains[c].display) {
      struct.chains[c].display = soup.sceneBU.displayedChains[struct.chains[c].name] = false;
      update = true;
    }
  }

*/
  
  
  if (! options.skipInit) {
    soup.calculateCOG();
    soup.renderer.initBuffers();
    soup.canvas.update = true;
  }

  return newStrucs;
}

molmil.findContacts = function(atoms1, atoms2, r, soup) {
  var modelId = soup.renderer.modelId, xyz1, xyz2, i, j, dx, dy, dz, r2 = r*r, contacts_ = {};
  
  for (i=0; i<atoms1.length; i++) {
    xyz1 = [atoms1[i].chain.modelsXYZ[modelId][atoms1[i].xyz], atoms1[i].chain.modelsXYZ[modelId][atoms1[i].xyz+1], atoms1[i].chain.modelsXYZ[modelId][atoms1[i].xyz+2]];
    for (j=0; j<atoms2.length; j++) {
      xyz2 = [atoms2[j].chain.modelsXYZ[modelId][atoms2[j].xyz], atoms2[j].chain.modelsXYZ[modelId][atoms2[j].xyz+1], atoms2[j].chain.modelsXYZ[modelId][atoms2[j].xyz+2]];
      
      dx = xyz1[0]-xyz2[0];
      dy = xyz1[1]-xyz2[1];
      dz = xyz1[2]-xyz2[2];
      
      if (dx*dx + dy*dy + dz*dz < r2) contacts_[atoms2[j].AID] = atoms2[j];
    }
  }
  var contacts = [];
  for (i in contacts_) contacts.push(contacts_[i]);
  
  return contacts;
}

molmil.calcHbonds = function(group1, group2, settings, soup) { // find H-bonds between group1 and group2
  soup = soup || molmil.cli_soup;
  if (! (group1 instanceof Array)) group1 = [group1];
  if (! (group2 instanceof Array)) group2 = [group2];
    
  // acceptors: list of acceptor atom
  // donors: list of [donor atom, hydrogen atom]
  var acceptors1 = [], acceptors2 = [], donors1 = [], donors2 = []; // first fetch all the possible acceptors and donors from each group...
  var c, i, j, a, a2, hcon = {}, nbonds = {}, tmp;
    
    
  var getAcceptors4Chain = function(chain, target) {
    // oxygens with less than 3 bonds
    // nitrogens with less than 4 bonds
    for (a=0; a<chain.atoms.length; a++) {
      if (chain.atoms[a].element == "O" && nbonds[chain.atoms[a].AID] < 3) target.push(chain.atoms[a]);
      else if (chain.atoms[a].element == "N" && nbonds[chain.atoms[a].AID] < 4) target.push(chain.atoms[a]);
    }
  };
    
  var getDonors4Chain = function(chain, target) {
    // oxygens with attached hydrogen
    // nitogens with 3+ bonds (of which one is a hydrogen)
    for (a=0; a<chain.atoms.length; a++) {
      if ((chain.atoms[a].element == "O" || (chain.atoms[a].element == "N" && nbonds[chain.atoms[a].AID] > 2)) && hcon[chain.atoms[a].AID]) {
        for (a2=0; a2<hcon[chain.atoms[a].AID].length; a2++) target.push([chain.atoms[a], hcon[chain.atoms[a].AID][a2]]);
      }
    }
  };
    
  for (c=0; c<group1.length; c++) {
    for (a=0; a<group1[c].atoms.length; a++) nbonds[group1[c].atoms[a].AID] = 0;
    if (group1[c] instanceof molmil.chainObject) tmp = group1[c];
    else if (group1[c] instanceof molmil.molObject) tmp = group1[c].chain;
    else {console.log("Cannot process object #1..."); return;}
    if (! tmp.bondsOK) soup.buildBondList(tmp, false);
    for (a=0; a<tmp.bonds.length; a++) {
      if (tmp.bonds[a][0].element == "H") {
        if (! hcon[tmp.bonds[a][1].AID]) hcon[tmp.bonds[a][1].AID] = [];
        hcon[tmp.bonds[a][1].AID].push(tmp.bonds[a][0]);
      }
      if (tmp.bonds[a][1].element == "H") {
        if (! hcon[tmp.bonds[a][0].AID]) hcon[tmp.bonds[a][0].AID] = [];
        hcon[tmp.bonds[a][0].AID].push(tmp.bonds[a][1]);
      }
      nbonds[tmp.bonds[a][0].AID]++;
      nbonds[tmp.bonds[a][1].AID]++;
    }
    getAcceptors4Chain(group1[c], acceptors1);
    getDonors4Chain(group1[c], donors1);
  }
    
  for (c=0; c<group2.length; c++) {
    for (a=0; a<group2[c].atoms.length; a++) nbonds[group2[c].atoms[a].AID] = 0;
    if (group2[c] instanceof molmil.chainObject) tmp = group2[c];
    else if (group2[c] instanceof molmil.molObject) tmp = group2[c].chain;
    else {console.log("Cannot process object #2..."); return;}
    if (! tmp.bondsOK) soup.buildBondList(tmp, false);
    for (a=0; a<tmp.bonds.length; a++) {
      if (tmp.bonds[a][0].element == "H") {
        if (! hcon[tmp.bonds[a][1].AID]) hcon[tmp.bonds[a][1].AID] = [];
        hcon[tmp.bonds[a][1].AID].push(tmp.bonds[a][0]);
      }
      if (tmp.bonds[a][1].element == "H") {
        if (! hcon[tmp.bonds[a][0].AID]) hcon[tmp.bonds[a][0].AID] = [];
        hcon[tmp.bonds[a][0].AID].push(tmp.bonds[a][1]);
      }
      nbonds[tmp.bonds[a][0].AID]++;
      nbonds[tmp.bonds[a][1].AID]++;
    }
    getAcceptors4Chain(group2[c], acceptors2);
    getDonors4Chain(group2[c], donors2);
  }
    
  // now find matches between acceptors1-donors2 and acceptors2-donors1 (within 3A D-A and 45degrees D-H-A)
  
  var pairs = [];
  
  var hbond_distance = settings.hbond_distance || 2.5, hbond_angle = settings.hbond_angle || 120;
    
  for (i=0; i<acceptors1.length; i++) {
    for (j=0; j<donors2.length; j++) {
      r = molmil.calcMMDistance(acceptors1[i], donors2[j][1], soup);
      if (r <= hbond_distance) {
        theta = molmil.calcMMAngle(acceptors1[i], donors2[j][1], donors2[j][0], soup);
        if (theta >= hbond_angle) pairs.push([acceptors1[i], donors2[j][1]]);
      }
    }
  }
    
  for (i=0; i<acceptors2.length; i++) {
    for (j=0; j<donors1.length; j++) {
      r = molmil.calcMMDistance(acceptors2[i], donors1[j][1], soup);
      if (r <= hbond_distance) {
        theta = molmil.calcMMAngle(acceptors2[i], donors1[j][1], donors1[j][0], soup);
        if (theta >= hbond_angle) pairs.push([acceptors2[i], donors1[j][1]]);
      }
    }
  }
  // now create some 3D graphics to depict these bonds...
  renderHbonds(pairs, soup, settings);
  
  var i, atm, other, b, tmp = [];
  
  var backboneAtoms = molmil.configBox.backboneAtoms4Display;
  
  var test = {}, tmp2 = {};
  
  for (i=0; i<pairs.length; i++) {
    tmp2[pairs[i][0].molecule.MID] = pairs[i][0].molecule;
    tmp2[pairs[i][1].molecule.MID] = pairs[i][1].molecule;
    test[pairs[i][0].molecule.MID] = test[pairs[i][0].molecule.MID] || (pairs[i][0].atomName in backboneAtoms);
    test[pairs[i][1].molecule.MID] = test[pairs[i][1].molecule.MID] || (pairs[i][1].atomName in backboneAtoms);
    tmp.push(pairs[i][0]); 
    tmp.push(pairs[i][1]);
  }

  for (i in test) molmil.displayEntry(tmp2[i], test[i] ? molmil.displayMode_Stick : molmil.displayMode_Stick_SC, soup);

  for (i=0; i<tmp.length; i++) {
    atm = tmp[i];

    if (atm.element != "H") continue;
    other = null;
    for (b=0; b<atm.chain.bonds.length; b++) {
      if (atm.chain.bonds[b][0].AID == atm.AID) {
        other = atm.chain.bonds[b][1];
        break;
      }
      else if (atm.chain.bonds[b][1].AID == atm.AID) {
        other = atm.chain.bonds[b][0];
        break;
      }
    }
    if (other) {
      for (b=0; b<atm.chain.bonds.length; b++) {
        if (atm.chain.bonds[b][0].AID == other.AID) atm.chain.bonds[b][1].display = true;
        else if (atm.chain.bonds[b][1].AID == other.AID) atm.chain.bonds[b][0].display = true;
      }
    }
  }
    
  soup.renderer.initBuffers();
  soup.renderer.canvas.update = true;  
  
    
  return pairs;
}


molmil.geometry.generator = function(objects, soup, name, programOptions) {
  programOptions = programOptions || {};
  var detail_lv = molmil.configBox.QLV_SETTINGS[soup.renderer.QLV].SPHERE_TESS_LV;
  var CB_NOI = molmil.configBox.QLV_SETTINGS[soup.renderer.QLV].CB_NOI;
  var CB_NOVPR = molmil.configBox.QLV_SETTINGS[soup.renderer.QLV].CB_NOVPR;
  
  var o, i, object, tmp1, tmp2;
  
  var sphere = molmil.geometry.getSphere(1, detail_lv);
  var cylinder = molmil.geometry.getCylinder(detail_lv);
  var ringTemplate = [];
  var theta = 0.0, rad = 2.0/CB_NOVPR, x, y, p, p_pre, dij;
  for (p=0; p<CB_NOVPR; p++) {
    x = Math.cos(theta*Math.PI);
    y = Math.sin(theta*Math.PI);
    ringTemplate.push([x, y, 0]);
    theta += rad;
  }
  
  var detail_lv_LQ = molmil.configBox.QLV_SETTINGS[0].SPHERE_TESS_LV;
  var CB_NOI_LQ = molmil.configBox.QLV_SETTINGS[0].CB_NOI;
  var CB_NOVPR_LQ = molmil.configBox.QLV_SETTINGS[0].CB_NOVPR;
  
  var sphereLQ = molmil.geometry.getSphere(1, detail_lv_LQ);
  var cylinderLQ = molmil.geometry.getCylinder(detail_lv_LQ);
  var ringTemplateLQ = [];
  var theta = 0.0, rad = 2.0/CB_NOVPR_LQ, x, y, p, p_pre, dij;
  for (p=0; p<CB_NOVPR_LQ; p++) {
    x = Math.cos(theta*Math.PI);
    y = Math.sin(theta*Math.PI);
    ringTemplateLQ.push([x, y, 0]);
    theta += rad;
  }
  
  var nov = 0, noi = 0, tmpObj;
  
  for (o=0; o<objects.length; o++) {
    object = objects[o];
    if (object.type == "sphere") {
      // create a sphere with radius object.radius on object.coords[0]
      tmpObj = object.lowQuality ? sphereLQ : sphere;
      nov += tmpObj.vertices.length/3;
      noi += tmpObj.indices.length;
    }
    if (object.type == "cylinder") {
      // create a cylinder with radius object.radius on object.coords[0] & object.coords[1]
      tmpObj = object.lowQuality ? cylinderLQ : cylinder;
      nov += tmpObj.vertices.length/3;
      noi += tmpObj.indices.length;
    }
    if (object.type == "dotted-cylinder") {
      tmpObj = object.lowQuality ? cylinderLQ : cylinder;
      object.N = object.N || 1;
      nov += (tmpObj.vertices.length/3) * object.N;
      noi += tmpObj.indices.length * object.N;
      nov += 2 * object.N; // caps
      noi += tmpObj.indices.length * object.N; // caps
    }
    if (object.type == "tube") {
      tmpObj = object.lowQuality ? sphereLQ : sphere;
      nov += (tmpObj.vertices.length/3) * 2; // caps
      noi += tmpObj.indices.length * 2; // caps

      tmpObj = object.lowQuality ? CB_NOVPR_LQ : CB_NOVPR;
      nov += tmpObj * object.coords.length;
      noi += (object.coords.length-1)*tmpObj*2*3 + (tmpObj*3);
    }
  }
  
  var vBuffer = new Float32Array(nov * 7); // x, y, z, nx, ny, nz, rgba
  var vBuffer8 = new Uint8Array(vBuffer.buffer);
  var iBuffer = new Uint32Array(noi);
  
  var rotationMatrix = mat4.create();
  var vertex = [0, 0, 0, 0], normal = [0, 0, 0, 0], VEC = [0, 0, 0], NORMAL = [0, 0, 0], BINORMAL = [0, 0, 0];
  var r = 4.0, r2 = 4.0, rgba, v=0, vP8=0, vP=0, p=0, iP = 0, v, dx, dy, dz, dij, angle;
  
  var cylNverts;
  var genCylinder = function() {
    tmpObj = object.lowQuality ? cylinderLQ : cylinder;
    // create a cylinder with radius object.radius on object.coords[0] & object.coords[1]
    r = object.radius;
    r2 = object.radius2 || r;
    dx = object.coords[1][0]-object.coords[0][0];
    dy = object.coords[1][1]-object.coords[0][1];
    dz = object.coords[1][2]-object.coords[0][2];
    dij = Math.sqrt((dx*dx) + (dy*dy) + (dz*dz));
    dx /= dij; dy /= dij; dz /= dij;

    angle = Math.acos(-dz);
    mat4.identity(rotationMatrix);
    mat4.rotate(rotationMatrix, rotationMatrix, angle, [dy, -dx, 0.0]);
    for (v=0; v<tmpObj.indices.length; v++, iP++) iBuffer[iP] = tmpObj.indices[v]+p; // a2

    for (v=0; v<tmpObj.vertices.length; v+=3, vP8+=28) {
      if (v%2 == 0) vec3.transformMat4(vertex, [tmpObj.vertices[v]*r, tmpObj.vertices[v+1]*r, tmpObj.vertices[v+2]*dij*2], rotationMatrix);
      else vec3.transformMat4(vertex, [tmpObj.vertices[v]*r2, tmpObj.vertices[v+1]*r2, tmpObj.vertices[v+2]*dij*2], rotationMatrix);
      vec3.transformMat4(normal, [tmpObj.normals[v], tmpObj.normals[v+1], tmpObj.normals[v+2]], rotationMatrix);

      vBuffer[vP++] = vertex[0]+object.coords[1][0];
      vBuffer[vP++] = vertex[1]+object.coords[1][1];
      vBuffer[vP++] = vertex[2]+object.coords[1][2];
      
      vBuffer[vP++] = normal[0];
      vBuffer[vP++] = normal[1];
      vBuffer[vP++] = normal[2];
    
      vBuffer8[vP8+24] = rgba[0];
      vBuffer8[vP8+25] = rgba[1];
      vBuffer8[vP8+26] = rgba[2];
      vBuffer8[vP8+27] = rgba[3];
      vP++
    } 
          
    p += tmpObj.vertices.length / 3;
  }
  
  var genSphere = function(idx, radius) {
    // create a sphere with radius object.radius on object.coords[0]
    tmpObj = object.lowQuality ? detail_lv_LQ : detail_lv;
    idx = idx || 0;
    tmpObj = molmil.geometry.getSphere(radius || object.radius, tmpObj);

    for (v=0; v<tmpObj.indices.length; v++, iP++) iBuffer[iP] = tmpObj.indices[v]+p;

    for (v=0; v<tmpObj.vertices.length; v+=3, vP8+=28) {
      vBuffer[vP++] = tmpObj.vertices[v]+object.coords[idx][0];
      vBuffer[vP++] = tmpObj.vertices[v+1]+object.coords[idx][1];
      vBuffer[vP++] = tmpObj.vertices[v+2]+object.coords[idx][2];
    
      vBuffer[vP++] = tmpObj.normals[v];
      vBuffer[vP++] = tmpObj.normals[v+1];
      vBuffer[vP++] = tmpObj.normals[v+2];

      vBuffer8[vP8+24] = rgba[0];
      vBuffer8[vP8+25] = rgba[1];
      vBuffer8[vP8+26] = rgba[2];
      vBuffer8[vP8+27] = rgba[3];
      vP++
    }

    p += tmpObj.vertices.length / 3;
    
  }
  // in the future also add support for billboarded spheres...
  
  var genCone = function() {
    // 1 out
    // ring out
    // ring in
    // 1 in
  };
  
  var genTube = function() {
    if (object.hasOwnProperty("rgbaPath")) rgba = object.rgbaPath[0];
    genSphere();
    
    tmpObj = object.lowQuality ? ringTemplateLQ : ringTemplate;
    var CB_NOVPR__ = object.lowQuality ? CB_NOVPR_LQ : CB_NOVPR;

    var delta_radius = 0;
    if (object.radius2) delta_radius = (object.radius2-object.radius)/(object.coords.length-1);
    
    
    for (i=0; i<tmpObj.length; i++) {
      iBuffer[iP++] = p+i+2;
      iBuffer[iP++] = p+i+1;
      iBuffer[iP++] = p;
    }
    iBuffer[iP-3] = p+1;
  
    //p += tmpObj.length+1;
    p_pre = p-CB_NOVPR__;
    
    
    var rotationMatrix = mat4.create(), identityMatrix = mat4.create();
    var Px, Py, Pz, Bx, By, Bz, Nx, Ny, Nz, delta = 0.0001;
    var tangents = [[object.coords[1][0]-object.coords[0][0], object.coords[1][1]-object.coords[0][1], object.coords[1][2]-object.coords[0][2]]], smallest;
    vec3.normalize(tangents[0], tangents[0]);
    for (v=1; v<object.coords.length-1; v++) {
      tangents.push([object.coords[v+1][0]-object.coords[v-1][0], object.coords[v+1][1]-object.coords[v-1][1], object.coords[v+1][2]-object.coords[v-1][2]]);
      vec3.normalize(tangents[v], tangents[v]);
    }
    tangents.push([object.coords[v][0]-object.coords[v-1][0], object.coords[v][1]-object.coords[v-1][1], object.coords[v][2]-object.coords[v-1][2]]);
    vec3.normalize(tangents[v], tangents[v]);
    
    for (v=0; v<object.coords.length; v++) {
      r = object.radius + (v*delta_radius);
      
      if (object.hasOwnProperty("rgbaPath")) rgba = object.rgbaPath[v];
      if (v == 0) {
        smallest = Number.MAX_VALUE;
        if (tangents[0][0] <= smallest) {smallest = tangents[0][0]; NORMAL = [1, 0, 0];}
        if (tangents[0][1] <= smallest) {smallest = tangents[0][1]; NORMAL = [0, 1, 0];}
        if (tangents[0][2] <= smallest) {smallest = tangents[0][2]; NORMAL = [0, 0, 1];}
        vec3.cross(VEC, tangents[0], NORMAL); vec3.normalize(VEC, VEC);
        vec3.cross(NORMAL, tangents[0], VEC); vec3.cross(BINORMAL=[0, 0, 0], tangents[0], NORMAL);
      }
      else {
        vec3.cross(VEC, tangents[v-1], tangents[v]);
        if (vec3.length(VEC) > delta) {
          vec3.normalize(VEC, VEC);
          theta = Math.acos(Math.max(-1, Math.min(1, vec3.dot(tangents[v-1], tangents[v]))));
          mat4.rotate(rotationMatrix, identityMatrix, theta, VEC);
          vec3.transformMat4(NORMAL, NORMAL, rotationMatrix);
        }
        vec3.cross(BINORMAL, tangents[v], NORMAL);
      }
    
      // define Nx, Bx, Px
      Px = object.coords[v][0]; Py = object.coords[v][1]; Pz = object.coords[v][2];
      
      Bx = BINORMAL[0]; By = BINORMAL[1]; Bz = BINORMAL[2];
      Nx = NORMAL[0]; Ny = NORMAL[1]; Nz = NORMAL[2];
      
      for (i=0; i<tmpObj.length; i++, vP8+=28) {
        vBuffer[vP++] = r*tmpObj[i][0] * Nx + r*tmpObj[i][1] * Bx + Px;
        vBuffer[vP++] = r*tmpObj[i][0] * Ny + r*tmpObj[i][1] * By + Py;
        vBuffer[vP++] = r*tmpObj[i][0] * Nz + r*tmpObj[i][1] * Bz + Pz;

        vBuffer[vP++] = tmpObj[i][0] * Nx + tmpObj[i][1] * Bx;
        vBuffer[vP++] = tmpObj[i][0] * Ny + tmpObj[i][1] * By;
        vBuffer[vP++] = tmpObj[i][0] * Nz + tmpObj[i][1] * Bz;

        vBuffer8[vP8+24] = rgba[0];
        vBuffer8[vP8+25] = rgba[1];
        vBuffer8[vP8+26] = rgba[2];
        vBuffer8[vP8+27] = rgba[3];
        vP++;
      }
      
      if (v > 0) {
        for (i=0; i<(CB_NOVPR__*2)-2; i+=2, p+=1, p_pre+=1) {
          iBuffer[iP++] = p;
          iBuffer[iP++] = p_pre;
          iBuffer[iP++] = p_pre+1;
   
          iBuffer[iP++] = p_pre+1;
          iBuffer[iP++] = p+1;
          iBuffer[iP++] = p;
        }
        iBuffer[iP++] = p;
        iBuffer[iP++] = p_pre;
        iBuffer[iP++] = p_pre-(CB_NOVPR__-1);

        iBuffer[iP++] = p_pre-(CB_NOVPR__-1);
        iBuffer[iP++] = p-(CB_NOVPR__-1);
        iBuffer[iP++] = p;

        p++; p_pre++;
      }
      else {
        p += CB_NOVPR__;
        p_pre += CB_NOVPR__;
      }
    }
    
    p = vP / 7;
    
    if (object.hasOwnProperty("rgbaPath")) rgba = object.rgbaPath[object.coords.length-1];
    genSphere(object.coords.length-1, object.radius2);
  }
  
  for (var o=0; o<objects.length; o++) {
    object = objects[o];
    rgba = object.rgba;
    if (object.type == "sphere") genSphere();
    else if (object.type == "cylinder") genCylinder();
    else if (object.type == "tube") genTube();
    else if (object.type == "cone") genCone();
    else if (object.type == "dotted-cylinder") {
      tmpObj = object.lowQuality ? cylinderLQ : cylinder;
      cylNverts = tmpObj.vertices.length/3
      tmp2 = [(object.coords[1][0]-object.coords[0][0])/object.N, (object.coords[1][1]-object.coords[0][1])/object.N, (object.coords[1][2]-object.coords[0][2])/object.N];
      var tmp3 = object.coords[0];
      var x0, y0, z0, x1, y1, z1;
      for (i=0; i<object.N; i++) {
        x0 = tmp3[0] + tmp2[0]*(i+.25);
        y0 = tmp3[1] + tmp2[1]*(i+.25);
        z0 = tmp3[2] + tmp2[2]*(i+.25);
        x1 = tmp3[0] + tmp2[0]*(i+.75);
        y1 = tmp3[1] + tmp2[1]*(i+.75);
        z1 = tmp3[2] + tmp2[2]*(i+.75);
        object.coords = [[x0, y0, z0], [x1, y1, z1]];

        // cap 1
        vBuffer[vP++] = x0;
        vBuffer[vP++] = y0;
        vBuffer[vP++] = z0;
      
        normal[0] = tmp2[0]; normal[1] = tmp2[1]; normal[2] = tmp2[2];
        vec3.normalize(normal, normal); vec3.negate(normal, normal);
      
        vBuffer[vP++] = normal[0];
        vBuffer[vP++] = normal[1];
        vBuffer[vP++] = normal[2];
    
        vBuffer8[vP8+24] = rgba[0];
        vBuffer8[vP8+25] = rgba[1];
        vBuffer8[vP8+26] = rgba[2];
        vBuffer8[vP8+27] = rgba[3];
        vP++; vP8 += 28;
        
        for (v=0; v<tmpObj.vertices.length/6; v++) {
          iBuffer[iP++] = p;
          iBuffer[iP++] = v*2 + p+2;
          iBuffer[iP++] = (v+1)*2 + p+2;
        }
        iBuffer[iP-1] = p+2;
        p++;
 
        
        genCylinder();
        
        // cap 2
        vBuffer[vP++] = x1;
        vBuffer[vP++] = y1;
        vBuffer[vP++] = z1;
      
        normal[0] = tmp2[0]; normal[1] = tmp2[1]; normal[2] = tmp2[2];
        vec3.normalize(normal, normal); 
      
        vBuffer[vP++] = normal[0];
        vBuffer[vP++] = normal[1];
        vBuffer[vP++] = normal[2];
    
        vBuffer8[vP8+24] = rgba[0];
        vBuffer8[vP8+25] = rgba[1];
        vBuffer8[vP8+26] = rgba[2];
        vBuffer8[vP8+27] = rgba[3];
        vP++; vP8 += 28;
        
        for (v=0; v<tmpObj.vertices.length/6; v++) {
          iBuffer[iP++] = (v+1)*2 + p - cylNverts;
          iBuffer[iP++] = v*2 + p - cylNverts;
          iBuffer[iP++] = p;
        }
        iBuffer[iP-3] = p - cylNverts;
        p++;
      }
      
    }
    
  }
  var program = molmil.geometry.build_simple_render_program(vBuffer, iBuffer, soup.renderer, programOptions);
  program.idname = name;
  soup.renderer.addProgram(program);
  soup.renderer.initBuffers();
  soup.canvas.update = true;
  return program;
}

// numeric.js-1.2.6 extract

var numeric = (typeof exports === "undefined")?(function numeric() {}):(exports);
if(typeof global !== "undefined") { global.numeric = numeric; }

numeric.version = "1.2.6";

numeric.dotMMsmall = function(x,y) {
    var i,j,k,p,q,r,ret,foo,bar,woo,i0,k0,p0,r0;
    p = x.length; q = y.length; r = y[0].length;
    ret = Array(p);
    for(i=p-1;i>=0;i--) {
        foo = Array(r);
        bar = x[i];
        for(k=r-1;k>=0;k--) {
            woo = bar[q-1]*y[q-1][k];
            for(j=q-2;j>=1;j-=2) {
                i0 = j-1;
                woo += bar[j]*y[j][k] + bar[i0]*y[i0][k];
            }
            if(j===0) { woo += bar[0]*y[0][k]; }
            foo[k] = woo;
        }
        ret[i] = foo;
    }
    return ret;
}
numeric._getCol = function(A,j,x) {
    var n = A.length, i;
    for(i=n-1;i>0;--i) {
        x[i] = A[i][j];
        --i;
        x[i] = A[i][j];
    }
    if(i===0) x[0] = A[0][j];
}
numeric.dotMMbig = function(x,y){
    var gc = numeric._getCol, p = y.length, v = Array(p);
    var m = x.length, n = y[0].length, A = new Array(m), xj;
    var VV = numeric.dotVV;
    var i,j,k,z;
    --p;
    --m;
    for(i=m;i!==-1;--i) A[i] = Array(n);
    --n;
    for(i=n;i!==-1;--i) {
        gc(y,i,v);
        for(j=m;j!==-1;--j) {
            z=0;
            xj = x[j];
            A[j][i] = VV(xj,v);
        }
    }
    return A;
}

numeric.dotMV = function(x,y) {
    var p = x.length, q = y.length,i;
    var ret = Array(p), dotVV = numeric.dotVV;
    for(i=p-1;i>=0;i--) { ret[i] = dotVV(x[i],y); }
    return ret;
}

numeric.dotVM = function(x,y) {
    var i,j,k,p,q,r,ret,foo,bar,woo,i0,k0,p0,r0,s1,s2,s3,baz,accum;
    p = x.length; q = y[0].length;
    ret = Array(q);
    for(k=q-1;k>=0;k--) {
        woo = x[p-1]*y[p-1][k];
        for(j=p-2;j>=1;j-=2) {
            i0 = j-1;
            woo += x[j]*y[j][k] + x[i0]*y[i0][k];
        }
        if(j===0) { woo += x[0]*y[0][k]; }
        ret[k] = woo;
    }
    return ret;
}

numeric.dotVV = function(x,y) {
    var i,n=x.length,i1,ret = x[n-1]*y[n-1];
    for(i=n-2;i>=1;i-=2) {
        i1 = i-1;
        ret += x[i]*y[i] + x[i1]*y[i1];
    }
    if(i===0) { ret += x[0]*y[0]; }
    return ret;
}

numeric.dot = function(x,y) {
    var d = numeric.dim;
    switch(d(x).length*1000+d(y).length) {
    case 2002:
        if(y.length < 10) return numeric.dotMMsmall(x,y);
        else return numeric.dotMMbig(x,y);
    case 2001: return numeric.dotMV(x,y);
    case 1002: return numeric.dotVM(x,y);
    case 1001: return numeric.dotVV(x,y);
    case 1000: return numeric.mulVS(x,y);
    case 1: return numeric.mulSV(x,y);
    case 0: return x*y;
    default: throw new Error('numeric.dot only works on vectors and matrices');
    }
}

numeric.dim = function(x) {
    var y,z;
    if(typeof x === "object") {
        y = x[0];
        if(typeof y === "object") {
            z = y[0];
            if(typeof z === "object") {
                return numeric._dim(x);
            }
            return [x.length,y.length];
        }
        return [x.length];
    }
    return [];
}

numeric.transpose = function(x) {
    var i,j,m = x.length,n = x[0].length, ret=Array(n),A0,A1,Bj;
    for(j=0;j<n;j++) ret[j] = Array(m);
    for(i=m-1;i>=1;i-=2) {
        A1 = x[i];
        A0 = x[i-1];
        for(j=n-1;j>=1;--j) {
            Bj = ret[j]; Bj[i] = A1[j]; Bj[i-1] = A0[j];
            --j;
            Bj = ret[j]; Bj[i] = A1[j]; Bj[i-1] = A0[j];
        }
        if(j===0) {
            Bj = ret[0]; Bj[i] = A1[0]; Bj[i-1] = A0[0];
        }
    }
    if(i===0) {
        A0 = x[0];
        for(j=n-1;j>=1;--j) {
            ret[j][0] = A0[j];
            --j;
            ret[j][0] = A0[j];
        }
        if(j===0) { ret[0][0] = A0[0]; }
    }
    return ret;
}
numeric.inv = function(x) {
    var s = numeric.dim(x), abs = Math.abs, m = s[0], n = s[1];
    var A = numeric.clone(x), Ai, Aj;
    var I = numeric.identity(m), Ii, Ij;
    var i,j,k,x;
    for(j=0;j<n;++j) {
        var i0 = -1;
        var v0 = -1;
        for(i=j;i!==m;++i) { k = abs(A[i][j]); if(k>v0) { i0 = i; v0 = k; } }
        Aj = A[i0]; A[i0] = A[j]; A[j] = Aj;
        Ij = I[i0]; I[i0] = I[j]; I[j] = Ij;
        x = Aj[j];
        for(k=j;k!==n;++k)    Aj[k] /= x; 
        for(k=n-1;k!==-1;--k) Ij[k] /= x;
        for(i=m-1;i!==-1;--i) {
            if(i!==j) {
                Ai = A[i];
                Ii = I[i];
                x = Ai[j];
                for(k=j+1;k!==n;++k)  Ai[k] -= Aj[k]*x;
                for(k=n-1;k>0;--k) { Ii[k] -= Ij[k]*x; --k; Ii[k] -= Ij[k]*x; }
                if(k===0) Ii[0] -= Ij[0]*x;
            }
        }
    }
    return I;
}
numeric.sclone = numeric.clone = function(A,k,n) {
    if(typeof k === "undefined") { k=0; }
    if(typeof n === "undefined") { n = numeric.dim(A).length; }
    var i,ret = Array(A.length);
    if(k === n-1) {
        for(i in A) { if(A.hasOwnProperty(i)) ret[i] = A[i]; }
        return ret;
    }
    for(i in A) {
        if(A.hasOwnProperty(i)) ret[i] = numeric.clone(A[i],k+1,n);
    }
    return ret;
}

numeric.identity = function(n) { return numeric.diag(numeric.rep([n],1)); }

numeric.diag = function(d) {
    var i,i1,j,n = d.length, A = Array(n), Ai;
    for(i=n-1;i>=0;i--) {
        Ai = Array(n);
        i1 = i+2;
        for(j=n-1;j>=i1;j-=2) {
            Ai[j] = 0;
            Ai[j-1] = 0;
        }
        if(j>i) { Ai[j] = 0; }
        Ai[i] = d[i];
        for(j=i-1;j>=1;j-=2) {
            Ai[j] = 0;
            Ai[j-1] = 0;
        }
        if(j===0) { Ai[0] = 0; }
        A[i] = Ai;
    }
    return A;
}

numeric.rep = function(s,v,k) {
    if(typeof k === "undefined") { k=0; }
    var n = s[k], ret = Array(n), i;
    if(k === s.length-1) {
        for(i=n-2;i>=0;i-=2) { ret[i+1] = v; ret[i] = v; }
        if(i===-1) { ret[0] = v; }
        return ret;
    }
    for(i=n-1;i>=0;i--) { ret[i] = numeric.rep(s,v,k+1); }
    return ret;
}

// end numeric.js extract


molmil.polynomialFit = function(x, y, order) {
  var xMatrix = [], xTemp, i, j;
  var yMatrix = numeric.transpose([y]);
  
  for (j=0; j<x.length; j++) {
    xTemp = [1];
    for (i=1; i<=order; i++) xTemp.push(xTemp[i-1]*x[j]);
    xMatrix.push(xTemp);
  }
  var xMatrixT = numeric.transpose(xMatrix);
  var dot1 = numeric.dot(xMatrixT,xMatrix);
  var dotInv = numeric.inv(dot1);
  var dot2 = numeric.dot(xMatrixT,yMatrix);
  var solution = numeric.dot(dotInv,dot2);
  
  var out = [];
  for (i=0; i<solution.length; i++) out.push(solution[i][0]);
  
  return out;
}