// MD/analysis related stuff



// ** GROMACS TRR/XTC related stuff **

molmil.toBigEndian32 = function(buffer, offset, n, cf) {
  var arr = new Uint32Array(buffer, offset, n), i, value;
  for (i=0; i<n; i++) {
    value = arr[i];
    arr[i] = (((value & 0xFF) << 24) | ((value & 0xFF00) << 8) | ((value >> 8) & 0xFF00) | ((value >> 24) & 0xFF));
  }
  return new cf(buffer, offset, n);
}

// this function currently only works with returning a Float64Array...
molmil.toBigEndian64 = function(buffer, offset, n, cf) {
  var dv = new DataView(buffer, offset, n*8);
  var temp = new Float64Array(n);
  for (var i=0; i<n; i++) {
    temp[i] = dv.getFloat64(i*8);
  }
  return temp;
}

molmil.xtc_sizeofint = function(size) {
  var num = 1, num_of_bits = 0;
    
  while (size >= num && num_of_bits < 32) 
  {
		num_of_bits++;
		num <<= 1;
  }
  return num_of_bits;
};

var xtc_sizeofints_tmp = new Uint8Array(32);
molmil.xtc_sizeofints = function(num_of_ints, sizes) {
  var i, num, num_of_bytes, num_of_bits, bytecnt, tmp;
  num_of_bytes = 1; xtc_sizeofints_tmp[0] = 1; num_of_bits = 0;
  
  for (i=0; i<num_of_ints; i++) {
    tmp = 0;
    for (bytecnt=0; bytecnt<num_of_bytes; bytecnt++) {
      tmp = xtc_sizeofints_tmp[bytecnt] * sizes[i] + tmp;
      xtc_sizeofints_tmp[bytecnt] = tmp & 0xff;
      tmp >>= 8;
    }
    while (tmp != 0) {
      xtc_sizeofints_tmp[bytecnt++] = tmp & 0xff;
      tmp >>= 8;
    }
    num_of_bytes = bytecnt;
  }
  num = 1;
  num_of_bytes--;
  while (xtc_sizeofints_tmp[num_of_bytes] >= num) {
    num_of_bits++;
    num *= 2;
  }
  return num_of_bits + num_of_bytes * 8;
}


molmil.xtc_decodebits = function(buf, cbuf, num_of_bits, buf2) {
  var cnt, num, mask = (1 << num_of_bits) - 1;
  cnt = buf[0];

  num = 0;
  while (num_of_bits >= 8) {
    buf2[2] = (buf2[2] << 8) | cbuf[cnt++];
    num |= (buf2[2] >> buf2[1]) << (num_of_bits - 8);
    num_of_bits -= 8;
  }

  if (num_of_bits > 0) {
    if (buf2[1] < num_of_bits) {
      buf2[1] += 8;
      buf2[2] = (buf2[2] << 8) | cbuf[cnt++];
    }
    buf2[1] -= num_of_bits;
    num |= (buf2[2] >> buf2[1]) & ((1 << num_of_bits) -1);
  }
  
  num &= mask;
  buf[0] = cnt;
  buf[1] = buf2[1];
  buf[2] = buf2[2];

  return num; 
};
        
var xtc_decodeints_tmp = new Int32Array(32);
molmil.xtc_decodeints = function(buf, cbuf, num_of_ints, num_of_bits, sizes, nums, buf2) {
  var i, j, num_of_bytes = 0, p, num;
  
  xtc_decodeints_tmp[1] = xtc_decodeints_tmp[2] = xtc_decodeints_tmp[3] = 0;

  while (num_of_bits > 8) {
		xtc_decodeints_tmp[num_of_bytes++] = molmil.xtc_decodebits(buf, cbuf, 8, buf2); // this is inversed??? why??? because of the endiannness??? 
		num_of_bits -= 8;
  }
  
  if (num_of_bits > 0) {
    xtc_decodeints_tmp[num_of_bytes++] = molmil.xtc_decodebits(buf, cbuf, num_of_bits, buf2);
  }

  for (i=num_of_ints-1; i>0; i--) {
    num = 0;
    for (j=num_of_bytes-1; j>=0; j--) {
			num = (num << 8) | xtc_decodeints_tmp[j];
			p = (num / sizes[i]) | 0;
			xtc_decodeints_tmp[j] = p;
			num = num - p * sizes[i];
    }
    nums[i] = num;
  }
  nums[0] = xtc_decodeints_tmp[0] | (xtc_decodeints_tmp[1] << 8) | (xtc_decodeints_tmp[2] << 16) | (xtc_decodeints_tmp[3] << 24);
};
 
var xtc_magicints = new Uint32Array([
  0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 10, 12, 16, 20, 25, 32, 40, 50, 64,
  80, 101, 128, 161, 203, 256, 322, 406, 512, 645, 812, 1024, 1290,
  1625, 2048, 2580, 3250, 4096, 5060, 6501, 8192, 10321, 13003, 
  16384, 20642, 26007, 32768, 41285, 52015, 65536,82570, 104031, 
  131072, 165140, 208063, 262144, 330280, 416127, 524287, 660561, 
  832255, 1048576, 1321122, 1664510, 2097152, 2642245, 3329021, 
  4194304, 5284491, 6658042, 8388607, 10568983, 13316085, 16777216 
]);
 
molmil.viewer.prototype.loadGromacsXTC = function(buffer, settings) {
  var structure = settings && settings.structure ? settings.structure : this.structures[0];
  var chains = structure.chains, coffset = [], c, traj = [], mn = 1e99;
  for (c=0; c<chains.length; c++) if (chains[c].atoms[0].AID < mn) mn = chains[c].atoms[0].AID;
  for (c=0; c<chains.length; c++) {
    coffset.push([(chains[c].atoms[0].AID-mn)*3, chains[c].atoms.length*3]);
    chains[c].modelsXYZ = []; // don't use original pdb data, only use it for the topology...
  }
  
  this.frameInfo = [];

  var FIRSTIDX = 9;
  /* note that xtc_magicints[FIRSTIDX-1] == 0 */
  var LASTIDX = xtc_magicints.length;
  
  // int magic
  // int natoms
  // int step
  // float time
  // float box[3][3]
  // 3dfcoord x[natoms]
  
  var offset = 0, tmp, frame, getFloat = molmil.toBigEndian32, c, lsize, precision, minMaxInt, sizeint = new Int32Array(3),
  bitsizeint = new Int32Array(3), bitsize, smallidx, maxidx, minidx, smaller, smallnum, sizesmall = new Uint32Array(3), larger, buf, buf8, rndup,
  inv_precision, run, i, thiscoord = new Float32Array(3), prevcoord = new Float32Array(3), flag, is_smaller, k, lfp, adz;
  
  var buf = new Int32Array(3);
  var buf2 = new Uint32Array(buf.buffer);

  while (true) {
    frame = {};

    tmp = molmil.toBigEndian32(buffer, offset, 3, Int32Array); offset += 12;
    frame.magicnum = tmp[0]; frame.natoms = tmp[1]; frame.step = tmp[2];
    
    tmp = getFloat(buffer, offset, 10, Float32Array); offset += 40;
    frame.time = tmp[0];
    frame.box = tmp.subarray(1);
    
    if (frame.natoms <= 9) { // no compression
      frame.x = getFloat(buffer, offset, frame.natoms*3, Float32Array); offset += frame.natoms*4;
    }
    else {
      buf[0] = buf[1] = buf[2] = sizesmall[0] = sizesmall[1] = sizesmall[2] = thiscoord[0] = thiscoord[1] = thiscoord[2] = 0;
      
      frame.x = new Float32Array(frame.natoms*3);
      lfp = 0;
      
      lsize = molmil.toBigEndian32(buffer, offset, 1, Int32Array)[0]; offset += 4;
      precision = getFloat(buffer, offset, 1, Float32Array)[0]; offset += 4;
      
      minMaxInt = molmil.toBigEndian32(buffer, offset, 6, Int32Array); offset += 24;
      sizeint[0] = minMaxInt[3] - minMaxInt[0]+1;
      sizeint[1] = minMaxInt[4] - minMaxInt[1]+1;
      sizeint[2] = minMaxInt[5] - minMaxInt[2]+1;
      
	    if ((sizeint[0] | sizeint[1] | sizeint[2] ) > 0xffffff) {
		    bitsizeint[0] = molmil.xtc_sizeofint(sizeint[0]);
		    bitsizeint[1] = molmil.xtc_sizeofint(sizeint[1]);
 		    bitsizeint[2] = molmil.xtc_sizeofint(sizeint[2]);
	 	    bitsize = 0; /* flag the use of large sizes */
      }
      else bitsize = molmil.xtc_sizeofints(3, sizeint);
  
      smallidx = molmil.toBigEndian32(buffer, offset, 1, Int32Array)[0]; offset += 4;
     
      tmp = smallidx+8;
      maxidx = (LASTIDX<tmp) ? LASTIDX : tmp;
      minidx = maxidx - 8;
      tmp = smallidx-1;
      tmp = (FIRSTIDX>tmp) ? FIRSTIDX : tmp;
      smaller = (xtc_magicints[tmp]*.5) | 0;
      smallnum = (xtc_magicints[smallidx]*.5) | 0;
      
      sizesmall[0] = sizesmall[1] = sizesmall[2] = xtc_magicints[smallidx];
      larger = xtc_magicints[maxidx];
      
      adz = Math.ceil(molmil.toBigEndian32(buffer, offset, 1, Int32Array)[0]*.25)*4; offset += 4;
      
      inv_precision = 1.0 / precision; run = 0; i = 0;
      
      buf8 = new Uint8Array(buffer, offset);
      
      while (i < lsize) {
        if (bitsize == 0) {
          thiscoord[0] = molmil.xtc_decodebits(buf, buf8, bitsizeint[0], buf2);
          thiscoord[1] = molmil.xtc_decodebits(buf, buf8, bitsizeint[1], buf2);
          thiscoord[2] = molmil.xtc_decodebits(buf, buf8, bitsizeint[2], buf2);
        }
        else molmil.xtc_decodeints(buf, buf8, 3, bitsize, sizeint, thiscoord, buf2);

        i++;
        
        thiscoord[0] += minMaxInt[0];
        thiscoord[1] += minMaxInt[1];
        thiscoord[2] += minMaxInt[2];
  
        prevcoord[0] = thiscoord[0];
        prevcoord[1] = thiscoord[1];
        prevcoord[2] = thiscoord[2];
        
        flag = molmil.xtc_decodebits(buf, buf8, 1, buf2);
        is_smaller = 0;
        
        if (flag == 1) {
          run = molmil.xtc_decodebits(buf, buf8, 5, buf2);
          is_smaller = run % 3;
          run -= is_smaller;
          is_smaller--;
        }
  
        if (run > 0) {
          thiscoord[0] = thiscoord[1] = thiscoord[2] = 0;
          
          for (k=0; k<run; k+=3) {
            molmil.xtc_decodeints(buf, buf8, 3, smallidx, sizesmall, thiscoord, buf2);
            i++;
            
            thiscoord[0] += prevcoord[0] - smallnum;
            thiscoord[1] += prevcoord[1] - smallnum;
            thiscoord[2] += prevcoord[2] - smallnum;
            

            if (k == 0) {
              /* interchange first with second atom for better
              * compression of water molecules
              */
              tmp = thiscoord[0]; thiscoord[0] = prevcoord[0];
              prevcoord[0] = tmp;
              tmp = thiscoord[1]; thiscoord[1] = prevcoord[1];
              prevcoord[1] = tmp;
              tmp = thiscoord[2]; thiscoord[2] = prevcoord[2];
              prevcoord[2] = tmp;
              
              
              frame.x[lfp++] = prevcoord[0] * inv_precision;
              frame.x[lfp++] = prevcoord[1] * inv_precision;
              frame.x[lfp++] = prevcoord[2] * inv_precision;
            }
            else {
              prevcoord[0] = thiscoord[0];
              prevcoord[1] = thiscoord[1];
              prevcoord[2] = thiscoord[2];
            }
            frame.x[lfp++] = thiscoord[0] * inv_precision;
            frame.x[lfp++] = thiscoord[1] * inv_precision;
            frame.x[lfp++] = thiscoord[2] * inv_precision;
          }
        }
        else {
          frame.x[lfp++] = thiscoord[0] * inv_precision;
          frame.x[lfp++] = thiscoord[1] * inv_precision;
          frame.x[lfp++] = thiscoord[2] * inv_precision;
        }
        
        smallidx += is_smaller;

        if (is_smaller < 0) {
          smallnum = smaller;
          if (smallidx > FIRSTIDX) smaller = (xtc_magicints[smallidx - 1]*.5) | 0;
          else smaller = 0;
        }
        else if (is_smaller > 0) {
          smaller = smallnum;
          smallnum = (xtc_magicints[smallidx]*.5) | 0;
        }
        sizesmall[0] = sizesmall[1] = sizesmall[2] = xtc_magicints[smallidx];
        
        if (sizesmall[0] == 0) {
          console.error("(xdrfile error) Undefined error.");
          return;
        }
      }
      offset += adz;
    }
    
    traj.push(frame.x);
    for (c=0; c<coffset.length; c++) chains[c].modelsXYZ.push(frame.x.subarray(coffset[c][0], coffset[c][0]+coffset[c][1]));
    
    for (c=0; c<frame.natoms*3; c++) frame.x[c] *= 10;
    
    this.frameInfo.push([frame.step, frame.time, frame.box]);
    
    if (offset >= buffer.byteLength) break;
  }

  structure.number_of_frames = structure.chains.length ? structure.chains[0].modelsXYZ.length : 0;
  
  return [];
}
    

molmil.viewer.prototype.loadGromacsTRR = function(buffer) {
  var frame, offset = 0, version_sz, i, tmp, floatSize, getFloat, floatArrayType, traj = [], c;
  
  var chains = this.structures[0].chains, coffset = [];
  for (c=0; c<chains.length; c++) {
    coffset.push([(chains[c].atoms[0].AID-1)*3, chains[c].atoms.length*3]);
    chains[c].modelsXYZ = []; // don't use original pdb data, only use it for the topology...
  }
  
  this.frameInfo = [];
  
  while (true) {
    frame = {};
    
    tmp = molmil.toBigEndian32(buffer, offset, 2, Int32Array); offset += 8;
    frame.magicnum = tmp[0]; frame.i1 = tmp[1];
    
    version_sz = molmil.toBigEndian32(buffer, offset, 1, Int32Array)[0]; offset += 4;
    frame.version = molmil.decodeUtf8(new Uint8Array(buffer, offset, version_sz)); offset += version_sz;
    
    tmp = molmil.toBigEndian32(buffer, offset, 13, Int32Array); offset += 13*4;
    frame.ir_size = tmp[0]; frame.e_size = tmp[1]; frame.box_size = tmp[2]; frame.vir_size = tmp[3]; frame.pres_size = tmp[4]; frame.top_size = tmp[5]; frame.sym_size = tmp[6]; frame.x_size = tmp[7]; frame.v_size = tmp[8]; frame.f_size = tmp[9]; frame.natoms = tmp[10]; frame.step = tmp[11]; frame.nre = tmp[12];
    
    floatSize = frame.box_size/9;
    
    if (floatSize == 8) {
      getFloat = molmil.toBigEndian64;
      floatArrayType = Float64Array;
    }
    else {
      getFloat = molmil.toBigEndian32;
      floatArrayType = Float32Array;
    }
    
    tmp = getFloat(buffer, offset, 2, floatArrayType); offset += 2*floatSize;
    frame.time = tmp[0]; frame.lam = tmp[1];
    
    if (frame.box_size) {
      frame.box = getFloat(buffer, offset, 9, floatArrayType); 
      offset += frame.box_size;
    }
    
    if (frame.vir_size) {
      frame.vir = getFloat(buffer, offset, 9, floatArrayType); 
      offset += frame.vir_size;
    }
    
    if (frame.pres_size) {
      frame.pres = getFloat(buffer, offset, 9, floatArrayType); 
      offset += frame.pres_size;
    }
    if (frame.x_size) {
      frame.x = getFloat(buffer, offset, frame.natoms*3, floatArrayType); 
      for (c=0; c<frame.natoms*3; c++) frame.x[c] *= 10;
      offset += frame.x_size;
      
      traj.push(frame.x);
      for (c=0; c<coffset.length; c++) chains[c].modelsXYZ.push(frame.x.subarray(coffset[c][0], coffset[c][0]+coffset[c][1]));
    }
  
    if (frame.v_size) {
      //frame.v = getFloat(buffer, offset, frame.natoms*3, floatArrayType); 
      //for (c=0; c<frame.natoms*3; c++) frame.x[c] *= 10;
      offset += frame.v_size;
    }
    
    if (frame.f_size) {
      //frame.f = getFloat(buffer, offset, frame.natoms*3, floatArrayType); 
      //for (c=0; c<frame.natoms*3; c++) frame.x[c] *= 10;
      offset += frame.f_size;
    }
    
    this.frameInfo.push([frame.step, frame.time]);
    
    if (offset >= buffer.byteLength) break;
  }
  
  this.structures[0].number_of_frames = this.structures[0].chains.length ? this.structures[0].chains[0].modelsXYZ.length : 0;
  
  // do wrapping (same as for psygene...)
  
  return [];
  //return [this.structures.length ? this.structures[0] : {}];
  
};


// ** parses myPresto mnt format **
molmil.viewer.prototype.loadMyPrestoMnt = function(buffer, fxcell) {
  var offset = 0, metadata, coords, chain_coords, c;
  this.trajectoryMD = [];
  var traj = [];

  // this is an entire BLOB of data, but molmil has been redesigned using per-chain data!!!!!
  // so after loading in the trajectory data, it needs to be split up in separate blocks
  // the Float32Array(buffer, from, to) can be used to create a pointer to the sub-buffer and append that to the modelsXYZ list
  
  // first make a list of per-chain ranges (indexes)
  
  
  var chains = this.structures[0].chains, coffset = [];
  for (c=0; c<chains.length; c++) {
    coffset.push([(chains[c].atoms[0].AID-1)*3, chains[c].atoms.length*3]);
    chains[c].modelsXYZ = []; // don't use original pdb data, only use it for the topology...
  }
  
  var slowView = new DataView(buffer);
  
  metadata = [];
  offset += 4; // gomi
  offset += 5; // idiot fileid
  offset += 4; // version
  var format = slowView.getInt32(offset, littleEndian=true); offset += 4
  
  offset += 4; // gomi
  offset += 4; // gomi
  
  var num = slowView.getInt32(offset, littleEndian=true); offset += 4; var nlen = num*3;
  offset += num*4; // skip atomids
  offset += 4; // gomi
  
  
  var array = Float32Array, N = 4; slowView.getFloat = slowView.getFloat32;
  

  var loopn, epot, i, arr;
  while (true) {
    offset += 4; // gomi
    loopn = slowView.getInt32(offset, littleEndian=true); offset += 4;
    epot = slowView.getFloat(offset, littleEndian=true); offset += 4;

    
    for (c=0; c<coffset.length; c++) {
      arr = new array(coffset[c][1]);
      for (i=0; i<coffset[c][1]; i++) {arr[i] = slowView.getFloat(offset, littleEndian=true); offset += N;}
      chains[c].modelsXYZ.push(arr);
    }
    offset += 4; // gomi
    if (offset >= buffer.byteLength) break;
  }
  
  this.structures[0].number_of_frames = this.structures[0].chains.length ? this.structures[0].chains[0].modelsXYZ.length : 0;
  
  return [];

}

// ** parses myPresto trajectory format **
molmil.viewer.prototype.loadMyPrestoTrj = function(buffer, fxcell) {
  var offset = 0, metadata, coords, chain_coords, c;
  this.trajectoryMD = [];
  var traj = [];

  // this is an entire BLOB of data, but molmil has been redesigned using per-chain data!!!!!
  // so after loading in the trajectory data, it needs to be split up in separate blocks
  // the Float32Array(buffer, from, to) can be used to create a pointer to the sub-buffer and append that to the modelsXYZ list
  
  // first make a list of per-chain ranges (indexes)
  
  
  var chains = this.structures[0].chains, coffset = [];
  for (c=0; c<chains.length; c++) {
    coffset.push([(chains[c].atoms[0].AID-1)*3, chains[c].atoms.length*3]);
    chains[c].modelsXYZ = []; // don't use original pdb data, only use it for the topology...
  }
  
  while (true) {
    metadata = [];
    Array.prototype.push.apply(metadata, new Int32Array(buffer, offset, 2)); offset += 8;
    Array.prototype.push.apply(metadata, new Float32Array(buffer, offset, 7)); offset += 28;
    Array.prototype.push.apply(metadata, new Int32Array(buffer, offset, 2)); offset += 8;
    Array.prototype.push.apply(metadata, new Float32Array(buffer, offset, 1)); offset += 4;
    Array.prototype.push.apply(metadata, new Int32Array(buffer, offset, 2)); offset += 8;
    this.trajectoryMD.push(metadata);
    coords = new Float32Array(buffer, offset, metadata[13]/4); offset += metadata[13];
    offset += 4; // empty byte
    traj.push(coords);
    
    for (c=0; c<coffset.length; c++) chains[c].modelsXYZ.push(coords.subarray(coffset[c][0], coffset[c][0]+coffset[c][1]));
    
    if (offset >= buffer.byteLength) break;
  }
  
  this.structures[0].number_of_frames = this.structures[0].chains.length ? this.structures[0].chains[0].modelsXYZ.length : 0;
  
  // fix atoms which have moved out of the cell... --> based on Kamiya-san's code
  if (fxcell && fxcell.length && (fxcell[0] != 0.0 || fxcell[1] != 0.0 || fxcell[2] != 0.0)) {
    var struc = this.structures[0];
    var i, c, m, a, N1, N1x, N1y, N1z, N2, N2x, N2y, N2z, atoms, rdiff, imove, mround = Math.round, mols, snapshot, p1, p2;
    for (i=0; i<traj.length; i++) {
      snapshot = traj[i];
      for (c=0; c<struc.chains.length; c++) {
        mols = struc.chains[c].molecules;
        for (m=0; m<mols.length-1; m++) {
          N1 = mols[m].N || mols[m].CA;
          if (! N1) continue;
          N2 = mols[m+1].N || mols[m+1].CA;
          if (! N2) continue;
          
          p1 = (N2.AID-1)*3; p2 = (N1.AID-1)*3;
          rdiff = snapshot[p1]-snapshot[p2];
          imove = mround(rdiff/fxcell[0]);
          snapshot[p2] += imove*fxcell[0];
          
          p1++; p2++;
          rdiff = snapshot[p1]-snapshot[p2];
          imove = mround(rdiff/fxcell[1]);
          snapshot[p2] += imove*fxcell[1];

          p1++; p2++;
          rdiff = snapshot[p1]-snapshot[p2];
          imove = mround(rdiff/fxcell[2]);
          snapshot[p2] += imove*fxcell[2];
        }
        for (m=1; m<mols.length; m++) {
          N1 = mols[m].N || mols[m].CA;
          if (! N1) continue;
          N2 = mols[m-1].N || mols[m-1].CA;
          if (! N2) continue;

          p1 = (N2.AID-1)*3; p2 = (N1.AID-1)*3;
          rdiff = snapshot[p1]-snapshot[p2];
          imove = mround(rdiff/fxcell[0]);
          snapshot[p2] += imove*fxcell[0];
          
          p1++; p2++;
          rdiff = snapshot[p1]-snapshot[p2];
          imove = mround(rdiff/fxcell[1]);
          snapshot[p2] += imove*fxcell[1];

          p1++; p2++;
          rdiff = snapshot[p1]-snapshot[p2];
          imove = mround(rdiff/fxcell[2]);
          snapshot[p2] += imove*fxcell[2];
          
          atoms = mols[m].atoms;
          for (a=0; a<atoms.length; a++) {
          
            p1 = (N1.AID-1)*3; p2 = (atoms[a].AID-1)*3;
            rdiff = snapshot[p1]-snapshot[p2];
            imove = mround(rdiff/fxcell[0]);
            snapshot[p2] += imove*fxcell[0];
          
            p1++; p2++;
            rdiff = snapshot[p1]-snapshot[p2];
            imove = mround(rdiff/fxcell[1]);
            snapshot[p2] += imove*fxcell[1];

            p1++; p2++;
            rdiff = snapshot[p1]-snapshot[p2];
            imove = mround(rdiff/fxcell[2]);
            snapshot[p2] += imove*fxcell[2];
          }
        }
      }
    }
  }

  return [];
  //return [this.structures.length ? this.structures[0] : {}];
};

// ** RMSD calculation betwen two arrays of atoms **
molmil.calcRMSD = function (atoms1, atoms2, transform) { // use w_k ???
  if (atoms1.length != atoms2.length) {console.log("ERROR: both structures should have the same number of atoms"); return;}
  var corX1=0.0, corX2=0.0, corY1=0.0, corY2=0.0, corZ1=0.0, corZ2=0.0, noa = atoms1.length, x_k, y_k;
  if (atoms1 instanceof Float32Array) {
    x_k = atoms1; y_k = atoms2; noa /= 3;
    for (var i=0, n=0; i<noa; i++, n+=3) {
      corX1 += x_k[n]; corY1 += x_k[n+1]; corZ1 += x_k[n+2];
      corX2 += y_k[n]; corY2 += y_k[n+1]; corZ2 += y_k[n+2];
    }
  }
  else {
    var idx;
    x_k = new Float32Array(noa*3);
    y_k = new Float32Array(noa*3);
    for (var i=0, n=0; i<noa; i++, n+=3) {
      idx = atoms1[i].xyz; x_k[n] = atoms1[i].chain.modelsXYZ[0][idx]; x_k[n+1] = atoms1[i].chain.modelsXYZ[0][idx+1]; x_k[n+2] = atoms1[i].chain.modelsXYZ[0][idx+2];
      idx = atoms2[i].xyz; y_k[n] = atoms2[i].chain.modelsXYZ[0][idx]; y_k[n+1] = atoms2[i].chain.modelsXYZ[0][idx+1]; y_k[n+2] = atoms2[i].chain.modelsXYZ[0][idx+2];
    
      corX1 += x_k[n]; corY1 += x_k[n+1]; corZ1 += x_k[n+2];
      corX2 += y_k[n]; corY2 += y_k[n+1]; corZ2 += y_k[n+2];
    }
  }

  var x_norm = 0.0, y_norm = 0.0;
  corX1 /= noa; corY1 /= noa; corZ1 /= noa;
  corX2 /= noa; corY2 /= noa; corZ2 /= noa;
  
  for (var i=0, n=0; i<noa; i++, n+=3) {
    x_k[n] -= corX1; x_k[n+1] -= corY1; x_k[n+2] -= corZ1;
    y_k[n] -= corX2; y_k[n+1] -= corY2; y_k[n+2] -= corZ2;
    
    x_norm += x_k[n]*x_k[n] + x_k[n+1]*x_k[n+1] + x_k[n+2]*x_k[n+2];
    y_norm += y_k[n]*y_k[n] + y_k[n+1]*y_k[n+1] + y_k[n+2]*y_k[n+2];
  }
  
  var R = new Float64Array(9);
  
  for (var i=0; i<noa*3; i+=3) {
    R[0] += x_k[i] * y_k[i];
    R[1] += x_k[i] * y_k[i+1];
    R[2] += x_k[i] * y_k[i+2];
    
    R[3] += x_k[i+1] * y_k[i];
    R[4] += x_k[i+1] * y_k[i+1];
    R[5] += x_k[i+1] * y_k[i+2];

    R[6] += x_k[i+2] * y_k[i];
    R[7] += x_k[i+2] * y_k[i+1];
    R[8] += x_k[i+2] * y_k[i+2];
  }
  
  
  var S = new Float64Array(16);
  S[0] = R[0] + R[4] + R[8];
  S[5] = R[0] - R[4] - R[8];
  S[10] = - R[0] + R[4] - R[8];
  S[15] = - R[0] - R[4] + R[8];
  
  S[1] = S[4] = R[5] - R[7];
  S[2] = S[8] = R[6] - R[2];
  S[3] = S[12] = R[1] - R[3];
  
  S[6] = S[9] = R[1] + R[3];
  S[7] = S[13] = R[2] + R[6];
  S[11] = S[14] = R[5] + R[7];
  
  var q = [1, 1, 1, 1];
  var lambda = molmil.EVpowerMethod(q, S);
  vec4.negate(q, q);
  
  var output = [Math.sqrt(Math.max(0., (x_norm+y_norm)-(2*lambda))/noa)];
  
  if (transform) {
    var b0 = 2.*q[0], b1 = 2.*q[1], b2 = 2.*q[2], b3 = 2.*q[3];
    var q00 = b0*q[0]-1., q01 = b0*q[1], q02 = b0*q[2], q03 = b0*q[3],
        q11 = b1*q[1], q12 = b1*q[2], q13 = b1*q[3],
        q22 = b2*q[2], q23 = b2*q[3], q33 = b3*q[3];

    var rotMat = new Float64Array(16);
    rotMat[0] = q00+q11;
    rotMat[1] = q12-q03;
    rotMat[2] = q13+q02;

    rotMat[4] = q12+q03;
    rotMat[5] = q00+q22;
    rotMat[6] = q23-q01;

    rotMat[8] = q13-q02;
    rotMat[9] = q23+q01;
    rotMat[10] = q00+q33;

    rotMat[15] = 1;
    
    output.push(rotMat, [corX1, corY1, corZ1], [corX2, corY2, corZ2]);
  }

  return output;
}

// ** calculates the largest eigen value+vector using the power method **
molmil.EVpowerMethod = function (v, A, maxIter) {
  maxIter = maxIter || 1e4;
  var tolerance = 1e-9, i = 0, lambdaOld = 0, lambda = 0, z = new Float64Array(4);
  lambda = Math.sqrt(v[0]*v[0] + v[1]*v[1] + v[2]*v[2] + v[3]*v[3]);
  v[0] /= lambda; v[1] /= lambda; v[2] /= lambda; v[3] /= lambda;
  
  while (i <= maxIter) {
    vec4.transformMat4(z, v, A);
    lambda = Math.sqrt(z[0]*z[0] + z[1]*z[1] + z[2]*z[2] + z[3]*z[3]);
    v[0] = z[0]/lambda; v[1] = z[1]/lambda; v[2] = z[2]/lambda; v[3] = z[3]/lambda;
    if (Math.abs((lambda-lambdaOld)/lambda) < tolerance) return lambda;
    lambdaOld = lambda;
    i++;
  }
  return null;
}
