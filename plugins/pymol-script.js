molmil.commandLine.prototype.bindPymolInterface = function() {
  //this.environment.console.log("Pymol-like command interface bound.");
  this.pyMol = {};
  this.pyMol.keywords = {
    select: molmil.commandLines.pyMol.selectCommand, 
    color: molmil.commandLines.pyMol.colorCommand, 
    cartoon_color: molmil.commandLines.pyMol.cartoon_colorCommand, 
    set_color: molmil.commandLines.pyMol.setColorCommand, 
    show: molmil.commandLines.pyMol.showCommand,
    hide: molmil.commandLines.pyMol.hideCommand,
    enable: molmil.commandLines.pyMol.enableCommand,
    disable: molmil.commandLines.pyMol.disableCommand,
    turn: molmil.commandLines.pyMol.turnCommand,
    move: molmil.commandLines.pyMol.moveCommand,
    "stop-anim": molmil.commandLines.pyMol.stopAnimCommand,
    translate: molmil.commandLines.pyMol.translateCommand,
    fetch: molmil.commandLines.pyMol.fetchCommand,
    "fetch-cc": molmil.commandLines.pyMol.fetchCCCommand,
    "fetch-chain": molmil.commandLines.pyMol.fetchChainCommand,
    efsite: molmil.commandLines.pyMol.efsiteCommand,
    load: molmil.commandLines.pyMol.loadCommand,
    mplay: molmil.commandLines.pyMol.mplayCommand,
    mstop: molmil.commandLines.pyMol.mstopCommand,
    origin: molmil.commandLines.pyMol.originCommand,
    set: molmil.commandLines.pyMol.setCommand,
    bg_color: molmil.commandLines.pyMol.bgcCommand,
    label: molmil.commandLines.pyMol.labelCommand,
    save: molmil.commandLines.pyMol.saveCommand,
    viewport: molmil.commandLines.pyMol.viewportCommand,
    view: molmil.commandLines.pyMol.viewCommand,
    reset: molmil.commandLines.pyMol.resetCommand,
    findseq: molmil.commandLines.pyMol.findseqCommand,
    delete: molmil.commandLines.pyMol.deleteCommand,
    edmap: molmil.commandLines.pyMol.edmapCommand,
    frame: molmil.commandLines.pyMol.frameCommand,
    bond: molmil.commandLines.pyMol.bondCommand,
    stereo: molmil.commandLines.pyMol.stereoCommand,
    orient: molmil.commandLines.pyMol.orientCommand,
    alter: molmil.commandLines.pyMol.alterCommand,
    indicate: molmil.commandLines.pyMol.indicateCommand,
    png: molmil.commandLines.pyMol.pngCommand,
    repr: molmil.commandLines.pyMol.reprCommand,
    "style-if": molmil.commandLines.pyMol.styleifCommand,
    align: molmil.commandLines.pyMol.alignCommand,
    reinitialize: molmil.commandLines.pyMol.reinitializeCommand,
    quit: molmil.commandLines.pyMol.quitCommand
  };
  this.altCommandIF = molmil.commandLines.pyMol.tryExecute;
};

// ** there is some basic pymol command support implemented **
molmil.commandLines.pyMol = {};

molmil.commandLines.pyMol.tryExecute = function(env, command) { // should return true if command (and execute it), otherwise return false..
  var pre_command = (command.trim().match(/^[\S]+/) || [""])[0].toLowerCase();
  if (! this.pyMol.keywords.hasOwnProperty(pre_command)) return false; // not a pymol command (might be a javascript one...)
  
  if (! this.pyMol.keywords[pre_command].apply(null, [env, command])) {
    console.error("Something went wrong executing the command "+pre_command);
    return false;
  }

  return true;
};

molmil.commandLines.pyMol.selectCommand = function(env, command) {
  command = command.match(/select[\s]+([a-zA-Z0-9_]+)[\s]*,[\s]*(.*)/);
  try {env[command[1]] = molmil.commandLines.pyMol.select.apply(env, [command[2]]);}
  catch (e) {console.error(e); return false;}
  return true;
}
    
molmil.commandLines.pyMol.labelCommand = function(env, command) {
  command = command.match(/label[\s]+([^,]*)[\s]*,[\s]*(.*)/);
  try {molmil.commandLines.pyMol.label.apply(env, [command[1], command[2]]);}
  catch (e) {console.error(e); return false;}
  return true;
}

molmil.commandLines.pyMol.viewportCommand = function(env, command) {
  command = command.match(/viewport[\s]+([0-9]+)[\s]*,[\s]*([0-9]+)/);
  try {molmil.commandLines.pyMol.viewport.apply(env, [command[1], command[2]]);}
  catch (e) {console.error(e); return false;}
  return true;
}

molmil.commandLines.pyMol.viewCommand = function(env, command) {
  command = command.match(/view[\s]*(([a-zA-Z0-9_.]+)[\s]*(,[\s]*([a-zA-Z0-9_.]+))?)?/);
  try {molmil.commandLines.pyMol.view.apply(env, [command[2], command[4]]);}
  catch (e) {console.error(e); return false;}
  return true;
}

molmil.commandLines.pyMol.resetCommand = function(env, command) {
  command = command.match(/reset[\s]+/);
  try {molmil.commandLines.pyMol.reset.apply(env, []);}
  catch (e) {console.error(e); return false;}
  return true;
}

molmil.commandLines.pyMol.findseqCommand = function(env, command) {
  command = command.match(/findseq[\s]+(.*?),(.*?),(.*)/);
  try {molmil.commandLines.pyMol.findseq.apply(env, [command[1].trim(), command[2].trim(), command[3].trim()]);}
  catch (e) {console.error(e); return false;}
  return true;
}

molmil.commandLines.pyMol.deleteCommand = function(env, command) {
  command = command.match(/delete[\s]+(.*)/);
  try {molmil.commandLines.pyMol.delete.apply(env, [command[1].trim()]);}
  catch (e) {console.error(e); return false;}
  return true;
}


molmil.commandLines.pyMol.edmapCommand = function(env, command) {
  command = command.match(/edmap[\s]+(.*?)[\s]*,[\s]*([0-9_.]+)(,[\s]*([0-9a-zA-Z\-]+))?/);
  try {molmil.commandLines.pyMol.edmap.apply(env, [command[1].trim(), command[2].trim(), command[4] ? command[4].trim() : null]);}
  catch (e) {console.error(e); return false;}
  return true;
}

molmil.commandLines.pyMol.frameCommand = function(env, command) {
  command = command.match(/frame[\s]+([0-9]+)[\s]*/);
  try {molmil.commandLines.pyMol.frame.apply(env, [command[1].trim()]);}
  catch (e) {console.error(e); return false;}
  return true;
}

molmil.commandLines.pyMol.bondCommand = function(env, command) {
  command = command.match(/bond[\s]+(.*)[\s]*,[\s]*(.*)[\s]*(,[\s]*[0-9])?/);
  try {molmil.commandLines.pyMol.bond.apply(env, [command[1].trim(), command[2].trim(), command[3] ? command[3].trim() : 1]);}
  catch (e) {console.error(e); return false;}
  return true;
}

molmil.commandLines.pyMol.stereoCommand = function(env, command) {
  command = command.match(/stereo[\s]+(.*)[\s]*/);
  try {molmil.commandLines.pyMol.stereo.apply(env, [command[1].trim()]);}
  catch (e) {console.error(e); return false;}
  return true;
}

molmil.commandLines.pyMol.orientCommand = function(env, command) {
  command = command.match(/orient[\s]*(.*)?[\s]*/);

  try {molmil.commandLines.pyMol.orient.apply(env, [command[1] ? command[1].trim() : null]);}
  catch (e) {console.error(e); return false;}
  return true;
}

molmil.commandLines.pyMol.alterCommand = function(env, command) {
  var cmd = command.match(/alter[\s]+(.*)[\s]*,[\s]*(.*)/), options = {};

  if (cmd[2]) {
    var opts = cmd[2].split(','), kv;
    for (var i=0; i<opts.length; i++) {
      opts[i] = opts[i].trim();
      if (! opts[i]) continue;
      kv = opts[i].split("=");
      options[kv[0].trim()] = kv[1].trim();
    }
  }
  
  try {molmil.commandLines.pyMol.alter.apply(env, [cmd[1], options]);}
  catch (e) {console.error(e); return false;}
  return true;
}

molmil.commandLines.pyMol.pngCommand = function(env, command) {
  command = command.match(/png[\s]*(.*)?[\s]*/);

  try {molmil.commandLines.pyMol.png.apply(env, [command[1] ? command[1].trim() : null]);}
  catch (e) {console.error(e); return false;}
  return true;
}

molmil.commandLines.pyMol.reprCommand = function(env, command) {
  command = command.match(/repr[\s]+([^\s,]+)[\s]*(,[\s]*(.*))?/), options = {};
  try {molmil.commandLines.pyMol.repr.apply(env, [(command[1]||"").trim(), (command[2]||"").trim().trim().substr(1).trim()]);}
  catch (e) {console.error(e); return false;}
  return true;
}

molmil.commandLines.pyMol.styleifCommand = function(env, command) {
  command = command.match(/style-if[\s]*(.*)?[\s]*/);
  try {molmil.commandLines.pyMol.styleif.apply(env, [command[1] ? command[1].trim() : null]);}
  catch (e) {console.error(e); return false;}
  return true;
}


molmil.commandLines.pyMol.reinitializeCommand = function(env, command) {
  var canvas = molmil.fetchCanvas();
  molmil.clear(canvas);
  return true;
}

molmil.commandLines.pyMol.alignCommand = function(env, command) {
  command = command.match(/align[\s]+(.*),[\s]*(.*)[\s]*/);
  try {molmil.commandLines.pyMol.align.apply(env, [command[1], command[2]]);}
  catch (e) {console.error(e); return false;}
  return true;
}

molmil.quit = molmil.commandLines.pyMol.quitCommand = function(env, command) {
  if (molmil.configBox.customExitFunction) molmil.configBox.customExitFunction();
  else {} // ??
  return true;
}

molmil.commandLines.pyMol.indicateCommand = function(env, command) {
  command = command.match(/indicate[\s]*(.*)?[\s]*/);

  try {molmil.commandLines.pyMol.indicate.apply(env, [command[1] ? command[1].trim() : null]);}
  catch (e) {console.error(e); return false;}
  return true;
}


molmil.commandLines.pyMol.saveCommand = function(env, command) {
  command = command.match(/save[\s]+([a-zA-Z0-9_.\-]+)[\s]*(,[\s]*(.*))?/);
  try {molmil.commandLines.pyMol.save.apply(env, [command[1], command[2]||""]);}
  catch (e) {console.error(e); return false;}
  return true;
}
    
molmil.commandLines.pyMol.cartoon_colorCommand = function(env, command) {
  tmp = command.match(/cartoon_color[\s]+([a-zA-Z0-9_]+)[\s]*,[\s]*(.*)/);
  if (! tmp) {
    tmp = command.match(/cartoon_color[\s]+(\[[\s]*[0-9]+[\s]*,[\s]*[0-9]+[\s]*,[\s]*[0-9]+[\s]*\])[\s]*,[\s]*(.*)/);
    if (! tmp) tmp = command.match(/cartoon_color[\s]+(\[[\s]*[0-9]+[\s]*,[\s]*[0-9]+[\s]*,[\s]*[0-9]+[\s]*,[\s]*[0-9]+[\s]*\])[\s]*,[\s]*(.*)/);
  }
  command = tmp;
  try {molmil.commandLines.pyMol.cartoon_color.apply(env, [command[1], command[2]]);}
  catch (e) {console.error(e); return false;}
  return true;
}
    
molmil.commandLines.pyMol.colorCommand = function(env, command) {
  tmp = command.match(/color[\s]+([a-zA-Z0-9_]+)[\s]*,[\s]*(.*)/);
  if (! tmp) {
    tmp = command.match(/color[\s]+(\[[\s]*[0-9]+[\s]*,[\s]*[0-9]+[\s]*,[\s]*[0-9]+[\s]*\])[\s]*,[\s]*(.*)/);
    if (! tmp) tmp = command.match(/color[\s]+(\[[\s]*[0-9]+[\s]*,[\s]*[0-9]+[\s]*,[\s]*[0-9]+[\s]*,[\s]*[0-9]+[\s]*\])[\s]*,[\s]*(.*)/);
  }
  command = tmp;
  try {molmil.commandLines.pyMol.color.apply(env, [command[1], command[2]]);}
  catch (e) {console.error(e); return false;}
  return true;
}
    
molmil.commandLines.pyMol.setColorCommand = function(env, command) {
  command = command.match(/set_color[\s]+([a-zA-Z0-9_]+)[\s]*,[\s]*(.*)/);
  try {molmil.commandLines.pyMol.set_color.apply(env, [command[1], JSON.parse(command[2])]);}
  catch (e) {console.error(e); return false;}
  return true;
}

molmil.commandLines.pyMol.bgcCommand = function(env, command) {
  var cmd = command.match(/bg_color[\s]*(.*)/);
  molmil.commandLines.pyMol.bg_color.apply(env, [cmd[1]]);
  return true;
}

molmil.commandLines.pyMol.setCommand = function(env, command) {
  var mc = command.match(/set[\s]+([a-zA-Z0-9_]+)[\s]*,[\s]*([a-zA-Z0-9_.-]+)[\s]*,[\s]*(.*)/);
  if (! mc) {
    mc = command.match(/set[\s]+([a-zA-Z0-9_]+)[\s]*,[\s]*(.*)[\s]*/);
    try {molmil.commandLines.pyMol.set.apply(env, [mc[1], mc[2], null]);}
    catch (e) {console.error(e); return false;}
  }
  else {
    try {molmil.commandLines.pyMol.set.apply(env, [mc[1], mc[2], mc[3]]);}
    catch (e) {console.error(e); return false;}
  }
  return true;
}
    
molmil.commandLines.pyMol.showCommand = function(env, command) {
  command = command.match(/show[\s]+([a-zA-Z0-9_\-]+)[\s]*(,[\s]*(.*))?/);
  try {molmil.commandLines.pyMol.show.apply(env, [command[1], command[2]]);}
  catch (e) {console.error(e); return false;}
  return true;
}

molmil.commandLines.pyMol.originCommand = function(env, command) {
  var cmd = command.match(/origin[\s]*(.*)/);
  molmil.commandLines.pyMol.origin.apply(env, [cmd[1]]);
  return true;
}

molmil.commandLines.pyMol.hideCommand = function(env, command) {
  var cmd = command.match(/hide[\s]+([a-zA-Z0-9_\-]+)[\s]*,[\s]*(.*)/);
  if (cmd == null) {
    cmd = command.match(/hide[\s]+[\s]*(.*)/);
    try {molmil.commandLines.pyMol.hide.apply(env, [cmd[1], null]);}
    catch (e) {console.error(e); return false;}
  }
  else {
    try {molmil.commandLines.pyMol.hide.apply(env, [cmd[1], cmd[2]]);}
    catch (e) {console.error(e); return false;}
  }
  return true;
}

molmil.commandLines.pyMol.enableCommand = function(env, command) {
  cmd = command.match(/enable[\s]+[\s]*(.*)/);
  try {molmil.commandLines.pyMol.enable.apply(env, [cmd[1]]);}
  catch (e) {console.error(e); return false;}
  return true;
}

molmil.commandLines.pyMol.disableCommand = function(env, command) {
  cmd = command.match(/disable[\s]+[\s]*(.*)/);
  try {molmil.commandLines.pyMol.disable.apply(env, [cmd[1]]);}
  catch (e) {console.error(e); return false;}
  return true;
}

molmil.commandLines.pyMol.turnCommand = function(env, command) {
  var cmd = command.match(/turn[\s]+([xyz]),[\s]*([-+]?[0-9]*\.?[0-9]+)[\s]*(,[\s]*([-+]?[0-9]*\.?[0-9]+)[\s]*(,[\s]*([-+]?[0-9]*\.?[0-9]+))?)?/);
  if (cmd != null) {
    try {molmil.commandLines.pyMol.turn.apply(env, [cmd[1], cmd[2], cmd[4], cmd[6]]);}
    catch (e) {console.error(e); return false;}
  }
  else return false;
  return true;
}

molmil.commandLines.pyMol.moveCommand = function(env, command) {
  var cmd = command.match(/move[\s]+([xyz]),[\s]*([-+]?[0-9]*\.?[0-9]+)[\s]*(,[\s]*([-+]?[0-9]*\.?[0-9]+)[\s]*(,[\s]*([-+]?[0-9]*\.?[0-9]+))?)?/);
  if (cmd != null) {
    try {molmil.commandLines.pyMol.move.apply(env, [cmd[1], cmd[2], cmd[4], cmd[6]]);}
    catch (e) {console.error(e); return false;}
  }
  else return false;
  return true;
}

molmil.commandLines.pyMol.stopAnimCommand = function(env, command) {
  var cmd = command.match(/stop-anim[\s]*/);
  if (cmd != null) {
    try {molmil.commandLines.pyMol.stopAnim.apply(env, []);}
    catch (e) {console.error(e); return false;}
  }
  else return false;
  return true;
}

molmil.commandLines.pyMol.translateCommand = function(env, command) {
  var cmd = command.match(/translate[\s]+\[[\s]*([-+]?[0-9]*\.?[0-9]+)[\s]*,[\s]*([-+]?[0-9]*\.?[0-9]+)[\s]*,[\s]*([-+]?[0-9]*\.?[0-9]+)[\s]*\][\s]*,[\s]*(.*)/);
  if (cmd != null) {
    try {molmil.commandLines.pyMol.translate.apply(env, [[parseFloat(cmd[1]), parseFloat(cmd[2]), parseFloat(cmd[3])], cmd[4]]);}
    catch (e) {console.error(e); return false;}
  }
  else return false;
  return true;
}

molmil.commandLines.pyMol.fetchCommand = function(env, command) {
  var cmd = command.match(/fetch[\s]+([a-zA-Z0-9]{4})/);
  if (cmd != null) {
    var cb = function(soup, struc) {
      struc.meta.pdbid = cmd[1].trim().toLowerCase();
      if (soup.AID > 150000 && (navigator.userAgent.toLowerCase().indexOf("mobile") != -1 || navigator.userAgent.toLowerCase().indexOf("android") != -1 || window.navigator.msMaxTouchPoints)) molmil.displayEntry(struc, molmil.displayMode_Wireframe);
      else molmil.displayEntry(struc, 1);
      molmil.colorEntry(struc, 1);
      soup.renderer.rebuildRequired = true;
      env.fileObjects[cmd[1].trim()] = struc;
    };
    
    try {molmil.loadPDB(cmd[1], cb);}
    catch (e) {console.error(e); return false;}
  }
  else return false;
  return true;
}

molmil.commandLines.pyMol.fetchChainCommand = function(env, command) {
  var cmd = command.match(/fetch-chain[\s]+(.*?)$/);
  if (cmd != null) {
    var cb = function(soup, struc) {
      if (soup.AID > 150000 && (navigator.userAgent.toLowerCase().indexOf("mobile") != -1 || navigator.userAgent.toLowerCase().indexOf("android") != -1 || window.navigator.msMaxTouchPoints)) molmil.displayEntry(struc, molmil.displayMode_Wireframe);
      else molmil.displayEntry(struc, 1);
      molmil.colorEntry(struc, 1);
      soup.renderer.rebuildRequired = true;
      env.fileObjects[cmd[1].trim()] = struc;
    };
    
    try {molmil.loadPDBchain(cmd[1].trim(), cb);}
    catch (e) {console.error(e); return false;}
  }
  else return false;
  return true;
}

molmil.commandLines.pyMol.efsiteCommand = function(env, command) {
  var cmd = command.match(/efsite[\s]+(.*?)$/);
  
  if (cmd != null) {
    var efsite_id = cmd[1];
    
    var pdbid = cmd[1].split("-")[0].split("_")[0], proteinStruc;
    
    var pdb_cb = function(soup, struc) {
      // delete whatever chains are not required...
      // if nmr structure, set the correct model id
      struc.meta.pdbid = pdbid;
      var model_id = 0, auth_chains = [];
      
      if (cmd[1].indexOf("_") != -1) model_id = parseInt(cmd[1].split("_")[1].split("-")[0])-1;
      if (cmd[1].indexOf("-") != -1) auth_chains = cmd[1].split("-")[1].split(",").filter(function(x){return x.trim();});
      
      if (auth_chains.length) {
        for (var c=0; c<struc.chains.length; c++) {
          if (! auth_chains.includes(struc.chains[c].authName)) {
            struc.chains.splice(c, 1);
            c--;
          }
        }
      }
      
      if (model_id) molmil.geometry.modelId = soup.renderer.modelId = model_id;
      proteinStruc = struc;
    };
    
    var mpbf_cb = function(soup, obj) {
      if (proteinStruc === undefined) return molmil_dep.asyncStart(mpbf_cb, [], null, 100);
      obj.structures.forEach(function(obj) {
        obj.programs[0].settings.alphaSet = 0.5;
        if (proteinStruc.structureTransform != null) {
          var normalMat = molmil.normalFromMat3(proteinStruc.structureTransform, mat3.create());
          for (var i=0; i<obj.data.vertexBuffer.length; i+=7) {
            temp = new Float32Array(obj.data.buffer, obj.data.vertices_offset+(i*4), 3);
            vec3.transformMat3(temp, temp, proteinStruc.structureTransform);
            
            temp = new Float32Array(obj.data.buffer, obj.data.vertices_offset+(i*4)+12, 3);
            vec3.transformMat3(temp, temp, normalMat);
          }
        }
        obj.programs[0].rebuild(proteinStruc.structureTransform != null);
      });
      soup.renderer.rebuildRequired = true;
    }

    molmil.loadPDB(pdbid, pdb_cb);
    molmil.cli_soup.loadStructure(molmil.settings.data_url+"efsite/data_web/"+efsite_id+".mpbf", "mpbf", mpbf_cb, {});
    
    return true;
  }
  else return false;
  
  /*
   - fetch pdb entry -> delete chains that are not required
   - fetch efsite entry -> do extra handling if required
  */
}



molmil.commandLines.pyMol.fetchCCCommand = function(env, command) {
  var cmd = command.match(/fetch-cc[\s]+([a-zA-Z0-9]*)/);
  if (cmd != null) {
    try {molmil.loadCC(cmd[1]);}
    catch (e) {console.error(e); return false;}
  }
  else return false;
  return true;
}

molmil.commandLines.pyMol.mplayCommand = function(env, command) {
  if (molmil.cli_soup.animation.frameNo >= molmil.cli_soup.animation.number_of_frames) molmil.cli_soup.animation.frameNo = 0;
  molmil.cli_soup.animation.play();
  return true;
}

molmil.commandLines.pyMol.mstopCommand = function(env, command) {
  molmil.cli_soup.animation.pause();
  return true;
}

molmil.commandLines.pyMol.loadCommand = function(env, command) {
  var cmd = command.match(/load[\s]+([^\s,]+)[\s]*(,[\s]*(.*))?/), options = {};

  if (cmd[2]) {
    var opts = cmd[2].split(','), kv;
    for (var i=0; i<opts.length; i++) {
      opts[i] = opts[i].trim();
      if (! opts[i]) continue;
      kv = opts[i].split("=");
      options[kv[0].trim()] = kv[1].trim();
    }
  }
  options.rgba = env.mesh_color;
  
  var canvas = molmil.fetchCanvas();
  var mjs_fileBin = canvas.mjs_fileBin || {};
  
  if (cmd[1].startsWith('`') && cmd[1].endsWith('`')) cmd[1] = new Function("return "+cmd[1]+";")();
  
  if (mjs_fileBin.hasOwnProperty(cmd[1])) {
    // load it manually...
    var fakeObj = mjs_fileBin[cmd[1]], ok = false;
    
    for (var j=0; j<canvas.inputFunctions.length; j++) {
      if (canvas.inputFunctions[j](canvas, fakeObj)) {ok=true; break;}
    }
    
    if (! ok) {
      for (var j in molmil.formatList) {
        if (typeof molmil.formatList[j] != "function" || ! cmd[1].endsWith(j)) continue;
        molmil.loadFilePointer(fakeObj, molmil.formatList[j], canvas);
        break;
      }
    }
    
    return true;
  }

  if (cmd != null) {
    try {
      molmil.cli_soup.loadStructure(cmd[1], options.format, function(soup, structures) {molmil.displayEntry(structures, 1); molmil.colorEntry(structures, 1); soup.renderer.rebuildRequired = true;}, options);
    }
    catch (e) {console.error(e); return false;}
  }
  else return false;
  return true;
}

molmil.commandLines.pyMol.selectModel = function(expr, soup) {
  expr = expr.trim();
  var soupObject = this.soupObject || molmil.cli_soup || soup || this.cli_soup;
  if (expr.startsWith("#")) {
    for (var i=0; i<soupObject.structures.length; i++) if (soupObject.structures[i].meta.idnr == expr) return [soupObject.structures[i]];
  }
  else {
    expr = expr.toLowerCase();
    for (var i=0; i<soupObject.structures.length; i++) if ((soupObject.structures[i].meta.id || soupObject.structures[i].meta.filename).toLowerCase() == expr) return [soupObject.structures[i]];
  }
  return [];
}

molmil.quickSelect = molmil.commandLines.pyMol.select = molmil.commandLines.pyMol.pymolSelectEngine = function(expr, soup) {
  if (! molmil.isBalancedStatement(expr)) throw "Incorrect statement"; // safety check
  
  var new_expr = [];
  var word = "", key, ss_conv = {h: 3, s: 2, l: 1}, tmp, i, j, NOT = false, operator;
  var toUpper = false, toUpper_, toLower = false, toLower_, ss = false, ss_;
  
  this.soupObject = this.soupObject || molmil.cli_soup || soup || this.cli_soup;
  if (expr == "all") return Object.values(this.soupObject.atomRef);

  expr = expr + " ";
  
  // see if x+x+x can be converted into (x || x || x) with regex
  
  tmp = "";
  
  i = 0;
  while (true) {
    i = expr.indexOf("+", i);
    if (i == -1) break;
    
    j = expr.indexOf(' ', i);
    i = expr.lastIndexOf(' ', i)+1;
    
    expr = expr.substring(0, i) + "(" + expr.substring(i, j) + ")" + expr.substring(j);
    i = j;
  }
  
  var executeExpr = function (expr2exe) {
    if (! expr2exe) return;
    var list = [];
    expr2exe = "for (var a in this.soupObject.atomRef) if ("+expr2exe+") list.push(this.soupObject.atomRef[a]);";
    try{eval(expr2exe);}
    catch(e) {(this.console || console).error("Unable to process PyMol command: "+e);}
    return list;
  }
  
  var gatherAhead = function(weak) {
    var N = 0, sub_expr = "", sfs = false;
    while (i < expr.length) {
      if (expr[i] == "(") N++;
      if (expr[i] == ")") N--;
      if (N > -1) sub_expr += expr[i];
      if (weak) {
        if ((expr[i] == ")" && N <= 0)) break;
      }
      else {
        if ((sfs && expr[i].match(/\s/)) || (expr[i] == ")" && N <= 0)) break;
        if (! expr[i].match(/\s/)) sfs = true;
      }
      i++;
    }
    //if (N > -1) i++;
    if (N < 0) i--;
    else if (expr[i] == ")") i++;
    return sub_expr;
  };
  
  var gatherBehind = function() {
    var N = 0, sub_expr = "", I = new_expr.length-1;
    while (I > -1) {
      if (new_expr[I] == ")") N++;
      if (new_expr[I] == "(") N--;
      sub_expr = new_expr.pop() + sub_expr;
      if (N == 0) break;
      I--;
    }
    return sub_expr;
  };
  
  // need to upgrade this parser in the future to something more flexible...

  var backboneAtoms = molmil.configBox.backboneAtoms4Display;
  var baseAtoms = {"O4'": 1, "C4'": 1, "C3'": 1, "C2'": 1, "O2'": 1, "O3'": 1, "P": 1, "OP1": 1, "OP2": 1, "O5'": 1, "C5'": 1};
  var TEMPLIST = [];

  for (i=0; i<expr.length; i++) {

    if (expr[i].match(/\s/) || expr[i] == ")") {
      word = word.trim();
      if (word.length == 0) {
        if (expr[i] == "(" || expr[i] == ")") new_expr.push(expr[i]);
        continue;
      }
      toUpper_ = false, ss_ = false;
      //operator = NOT ? "!=" : "=="; NOT = false;
      operator = "==";
      if (word == "name") {key = "this.soupObject.atomRef[a].atomName "+operator+" '%s'"; toUpper_ = true;}
      else if (word == "index") key = "this.soupObject.atomRef[a].AID "+operator+" %s";
      else if (word == "symbol") key = "this.soupObject.atomRef[a].element "+operator+" '%s'";
      else if (word == "resn") {key = "this.soupObject.atomRef[a].molecule.name.toLowerCase() "+operator+" '%s'"; toLower_ = true;}
      else if (word == "resi") key = "this.soupObject.atomRef[a].molecule.RSID "+operator+" %s";
      else if (word == "resid") key = "this.soupObject.atomRef[a].molecule.id "+operator+" %s";
      else if (word == "ss") {key = "this.soupObject.atomRef[a].molecule.sndStruc "+operator+" %s"; ss_ = true;}
      else if (word == "entity") key = "this.soupObject.atomRef[a].molecule.chain.entity_id "+operator+" %s";
      else if (word == "chain_auth") key = "this.soupObject.atomRef[a].molecule.chain.authName "+operator+" '%s'";
      else if (word == "chain") {
        if (this.cif_use_auth) key = "this.soupObject.atomRef[a].molecule.chain.authName "+operator+" '%s'";
        else key = "this.soupObject.atomRef[a].molecule.chain.name "+operator+" '%s'";
      }
      else if (word == "b") key = "this.soupObject.atomRef[a].Bfactor %s %s";
      else if (word == "hydro") new_expr.push("this.soupObject.atomRef[a].molecule.water "+operator+" true");
      else if (word == "disulf") new_expr.push("(this.soupObject.atomRef[a].molecule.name "+operator+" 'CYS' && this.soupObject.atomRef[a].molecule.weirdAA)");
      else if (word == "hetatm") new_expr.push("this.soupObject.atomRef[a].molecule.ligand "+operator+" true");
      else if (word == "snfg") new_expr.push("this.soupObject.atomRef[a].molecule.SNFG "+operator+" true");
      else if (word == "altloc") {key = "this.soupObject.atomRef[a].label_alt_id "+operator+" '%s'";}
      else if (word == "model") {
        // two modes, by name & by number (1-...)
        if (expr[i+1] == "#") key = "this.soupObject.atomRef[a].chain.entry.meta.idnr "+operator+" '%s'";
        else {key = "(this.soupObject.atomRef[a].chain.entry.meta.id || this.soupObject.atomRef[a].chain.entry.meta.filename).toLowerCase() "+operator+" '%s'"; toLower_ = true;}
      }
      else if (word == "around") {
        var atomList = []
        molmil.fetchNearbyAtoms(executeExpr.apply(this, [gatherBehind()]), parseFloat(gatherAhead()), atomList, soup);
        TEMPLIST.push(atomList);
        new_expr.push("TEMPLIST["+(TEMPLIST.length-1)+"].indexOf(this.soupObject.atomRef[a]) != -1");
      }
      else if (word == "byobject") {
        var atomList = molmil.autoGetAtoms(molmil.atoms2objects(molmil.quickSelect.apply(this, [gatherAhead(true)])));
        TEMPLIST.push(atomList);
        new_expr.push("TEMPLIST["+(TEMPLIST.length-1)+"].indexOf(this.soupObject.atomRef[a]) != -1")
      }
      else if (word == "bychain") {
        var atomList = molmil.autoGetAtoms(molmil.atoms2chains(molmil.quickSelect.apply(this, [gatherAhead(true)])));
        TEMPLIST.push(atomList);
        new_expr.push("TEMPLIST["+(TEMPLIST.length-1)+"].indexOf(this.soupObject.atomRef[a]) != -1");
      }
      else if (word == "byres") {
        var atomList = molmil.autoGetAtoms(molmil.atoms2residues(molmil.quickSelect.apply(this, [gatherAhead(true)])));
        TEMPLIST.push(atomList);
        new_expr.push("TEMPLIST["+(TEMPLIST.length-1)+"].indexOf(this.soupObject.atomRef[a]) != -1");
      }
      //else if (word.toLowerCase() == "not" || word == "!") NOT = true;
      else if (word.toLowerCase() == "not" || word == "!") new_expr.push("!");
      else if (word == "and") new_expr.push("&&");
      else if (word == "or") new_expr.push("||");
      else if (word == "backbone") {
        new_expr.push("(! this.soupObject.atomRef[a].molecule.ligand && ! this.soupObject.atomRef[a].molecule.water && ! this.soupObject.atomRef[a].molecule.xna && backboneAtoms.hasOwnProperty(this.soupObject.atomRef[a].atomName))");
      }
      else if (word == "sidechain") {
        new_expr.push("(! this.soupObject.atomRef[a].molecule.ligand && ! this.soupObject.atomRef[a].molecule.water && ! this.soupObject.atomRef[a].molecule.xna && ((this.soupObject.atomRef[a].molecule.name == 'PRO' && this.soupObject.atomRef[a].atomName == 'N') || ! backboneAtoms.hasOwnProperty(this.soupObject.atomRef[a].atomName)))");
      }
      else if (word == "base") {
        new_expr.push("(! this.soupObject.atomRef[a].molecule.ligand && ! this.soupObject.atomRef[a].molecule.water && this.soupObject.atomRef[a].molecule.xna && ! baseAtoms.hasOwnProperty(this.soupObject.atomRef[a].atomName))");
      }
      else if (word == "xna") {
        new_expr.push("(this.soupObject.atomRef[a].molecule.xna)");
      }
      else if (this[word]) new_expr.push("this."+word+".indexOf(this.soupObject.atomRef[a]) != -1");
      else if (key && word) {
        if (toUpper) word = word.toUpperCase();
        else if (toLower) word = word.toLowerCase();
        if (ss) word = ss_conv[word];
        if (word == "=") word = "==";
        if (word == "''") word = "";
        key = key.replace("%s", word.replace(/'/g, "\\'"));
        if (key.indexOf("%s") == -1) {
          new_expr.push(key);
          toUpper = ss = toLower = false;
          toUpper_ = ss_ = toLower_ = false;
        }
      }
      else key = "";
      if (expr[i] == ")") new_expr.push(expr[i]);
      word = "";
      toUpper = toUpper_; ss_ = ss; toLower = toLower_;
    }
    else if (expr[i] == "+" && key) {
      tmp = expr.substr(i+1), pos = tmp.search(/[^a-zA-Z0-9]/), tmp = pos != -1 ? tmp.substr(0, pos) : tmp;
      if (tmp) {
        if (toUpper) {tmp = tmp.toUpperCase(); word = word.toUpperCase();}
        else if (toUpper) {tmp = tmp.toLowerCase(); word = word.toLowerCase();}
        if (ss) {
          if (word) word = ss_conv[word];
          tmp = ss_conv[tmp];
        }
        new_expr.push((word ? key.replace("%s", word) : "")+" || "+key.replace("%s", tmp));
        word = "";
      }
      i += pos == -1 ? tmp.length : pos;
    }
    else if (expr[i] == "-" && key.indexOf(".RSID") != -1) {
      tmp = expr.substr(i+1), pos = tmp.search(/[^a-zA-Z0-9]/), tmp = pos != -1 ? tmp.substr(0, pos) : tmp;
      new_expr.push("(" + key.replace(/ == %s/, " >= "+word) + " && " + key.replace(/ == %s/, " <= "+tmp) + ")");
      word = "";
      i += pos == -1 ? tmp.length : pos;
    }
    
    else if (expr[i] == "(" || expr[i] == ")") new_expr.push(expr[i]);
    //else if (expr[i] == "!") NOT = true;
    else if (expr[i] == "!") new_expr.push("!");
    else word += expr[i];
  }
  
  return executeExpr.apply(this, [new_expr.join(" ")]);
}

molmil.commandLines.pyMol.viewport = function(width, height) {
  width = parseInt(width);
  height = parseInt(height);
  window.onresize = null;
  this.cli_soup.renderer.canvas.setSize(width, height);
}

molmil.commandLines.pyMol.view = function(key, action) {
  if (key) {
    if (! action) action = "recall";
    if (key == "null") {
      if (action.toLowerCase() != "recall") return;
      return this.cli_soup.renderer.camera.reset();
    }
    if (! this.cli_soup.renderer.cameraHistory.hasOwnProperty(key)) return console.error("Key "+key+" does not exist...");
    if (action.toLowerCase() == "recall") {
      this.cli_soup.renderer.camera.QView = vec4.copy(vec4.create(), this.cli_soup.renderer.cameraHistory[key][0]);
      this.cli_soup.renderer.camera.x = this.cli_soup.renderer.cameraHistory[key][1];
      this.cli_soup.renderer.camera.y = this.cli_soup.renderer.cameraHistory[key][2];
      this.cli_soup.renderer.camera.z = this.cli_soup.renderer.cameraHistory[key][3];
    }
    else if (action.toLowerCase() == "store") this.cli_soup.renderer.cameraHistory[key] = [this.cli_soup.renderer.camera.QView, this.cli_soup.renderer.camera.x, this.cli_soup.renderer.camera.y, this.cli_soup.renderer.camera.z];
  }
  else { // output a bunch of commands... (move & turn)
    var x = this.cli_soup.renderer.camera.QView[0], y = this.cli_soup.renderer.camera.QView[1], z = this.cli_soup.renderer.camera.QView[2], w = this.cli_soup.renderer.camera.QView[3], t0, t1, X, Y, Z;
    
    t0 = 2.0 * (w * x + y * z);
    t1 = 1.0 - 2.0 * (x * x + y * y);
    X = Math.atan2(t0, t1);

    t2 = 2.0 * (w * y - z * x);
	  if(t2 > 1.0) t2 = 1.0;
    else if(t2 < -1.0) t2 = -1.0;
    Y = Math.asin(t2);

    t3 = 2.0 * (w * z + x * y);
    t4 = 1.0 - 2.0 * (y * y + z * z);
    Z = Math.atan2(t3, t4);
    
    X *= 180/Math.PI;
    Y *= 180/Math.PI;
    Z *= 180/Math.PI;
    
    this.console.log("view null; turn x, "+X+"; turn y, "+Y+"; turn z, "+Z+"; move x, "+this.cli_soup.renderer.camera.x+"; move y, "+this.cli_soup.renderer.camera.y+"; move z, "+this.cli_soup.renderer.camera.z+";");
  }
}

molmil.commandLines.pyMol.reset = function() {
  this.cli_soup.renderer.camera.reset();
  this.cli_soup.renderer.camera.z = this.cli_soup.calcZ();
}

molmil.commandLines.pyMol.findseq = function(seq, target, selName) {
  var ress = molmil.selectSequence(seq);
  var selection = molmil.commandLines.pyMol.select.apply(this, [target]);
  
  var r, a, output = [];
  for (r=0; r<ress.length; r++) {
    for (a=0; a<ress[r].atoms.length; a++) if (selection.indexOf(ress[r].atoms[a]) != -1) output.push(ress[r].atoms[a]);
  }

  this[selName] = output;
}
  
molmil.commandLines.pyMol.delete = function(atoms) {
  var soup = this.cli_soup, deleted=false;
  if (typeof atoms != "object") {
    if (this.hasOwnProperty(atoms)) atoms = this[atoms];
    else {
      if (atoms.startsWith("mesh ")) {
        var idnr = atoms.split("mesh ")[1].trim();
        var files = this.cli_soup.structures;
        
        for (var i=0; i<files.length; i++) {
          if (files[i].meta.idnr == idnr && files[i] instanceof molmil.polygonObject) {
            var pnames = Object.keys(files[i].programs);
            for (var p=0; p<pnames.length; p++) this.cli_soup.renderer.removeProgram(files[i].programs[pnames[p]]);
            files.splice(i, 1);
            this.cli_soup.renderer.canvas.update = true;
            return;
          }
        }
        return console.error("Unknown mesh...");
      }
      else if (atoms.startsWith("label ")) {
        var idnr = atoms.split("label ")[1].trim();
        for (var i=0; i<soup.texturedBillBoards.length; i++) {
          if (soup.texturedBillBoards[i].text == idnr) {
            soup.texturedBillBoards[i].remove();
            this.cli_soup.renderer.canvas.update = true;
            return;
          }
        }
      }
      else atoms = molmil.commandLines.pyMol.select.apply(this, [atoms]);
    }
  }
  
  var idx, a, CIDs = new Set();
  for (a=0; a<atoms.length; a++) {
    idx = atoms[a].molecule.atoms.indexOf(atoms[a]);
    if (idx != -1) {
      atoms[a].molecule.atoms.splice(idx, 1);
      deleted = true;
    }
    
    if (atoms[a].molecule.atoms.length == 0) {
      if (atoms[a].molecule.previous) atoms[a].molecule.previous.next = null;
      if (atoms[a].molecule.next) atoms[a].molecule.next.previous = null;
      
      idx = atoms[a].molecule.chain.molecules.indexOf(atoms[a].molecule);
      atoms[a].molecule.chain.molecules.splice(idx, 1);
    }
    CIDs.add(atoms[a].chain.CID)
    
    
    delete soup.atomRef[atoms[a].AID];
    idx = atoms[a].chain.atoms.indexOf(atoms[a]);
    if (idx != -1) atoms[a].chain.atoms.splice(idx, 1);

    if (atoms[a].chain.atoms.length == 0) {
      idx = atoms[a].chain.entry.chains.indexOf(atoms[a].chain);
      if (idx != -1) atoms[a].chain.entry.chains.splice(idx, 1);
    }
    
  }
  for (var c=0; c<soup.chains.length; c++) {
    var chain = soup.chains[c];
    if (! CIDs.has(chain.CID)) continue;
    var bonds = [];
    for (var b=0; b<chain.bonds.length; b++) {
      if (chain.bonds[b][0].AID in soup.atomRef && chain.bonds[b][1].AID in soup.atomRef) bonds.push(chain.bonds[b]);
    }
    chain.bonds = bonds;
  }
  
  if (deleted) {
    molmil.geometry.reInitChains = true;
    soup.renderer.rebuildRequired = true;
  }
  
}

molmil.commandLines.pyMol.frame = function(modelId) {
  modelId = parseInt(modelId);
  //console.log(modelId);
  if (! modelId) return; // weird modelId
  modelId--;

  if (this.cli_soup && this.cli_soup.animation) this.cli_soup.animation.go2Frame(modelId);
  else this.cli_soup.renderer.selectFrame(modelId, 0);
};

molmil.commandLines.pyMol.bond = function(atom1, atom2, order) {
  if (typeof atom1 != "object") {
    if (this.hasOwnProperty(atom1)) atom1 = this[atom1];
    //else atom1 = molmil.commandLines.pyMol.select(atom1);
    else atom1 = molmil.commandLines.pyMol.select.apply(this, [atom1]);
  }
  if (typeof atom2 != "object") {
    if (this.hasOwnProperty(atom2)) atom2 = this[atom2];
    //else atom2 = molmil.commandLines.pyMol.select(atom2);
    else atom2 = molmil.commandLines.pyMol.select.apply(this, [atom2]);
  }
  atom1 = atom1[0];
  atom2 = atom2[0];
  
  
  atom1.chain.bonds.push([atom1, atom2, order]);
  
  this.cli_soup.renderer.rebuildRequired = true;
}

molmil.commandLines.pyMol.stereo = function(mode) {
  if (mode == "off") molmil.configBox.stereoMode = 0;
  else if (mode == "crosseye" || mode == "cross-eyed") molmil.configBox.stereoMode = 4;
  else if (mode == "sidebyside") molmil.configBox.stereoMode = 2;
  else if (mode == "anaglyph") molmil.configBox.stereoMode = 1;
  
  this.cli_soup.renderer.resizeViewPort();
  
  return true;
}

molmil.commandLines.pyMol.orient = function(atoms) {
  if (typeof atoms != "object" && atoms != null) {
    if (this.hasOwnProperty(atoms)) atoms = this[atoms];
    else atoms = molmil.commandLines.pyMol.select.apply(this, [atoms]);
  }
  molmil.orient(atoms, this.cli_soup);
  
  return true;
}

molmil.commandLines.pyMol.indicate = function(atoms) {
  if (typeof atoms != "object" && atoms != null) {
    if (this.hasOwnProperty(atoms)) atoms = this[atoms];
    else atoms = molmil.commandLines.pyMol.select.apply(this, [atoms]);
  }
  
  molmil.selectAtoms(atoms, false, this.cli_soup);
  this.cli_canvas.renderer.updateSelection();
  return true;
}

molmil.commandLines.pyMol.png = function(filename) {
  if (! filename && ! navigator.clipboard) filename = "image.png";
  
  if (filename && ! window.saveAs && ! molmil.configBox.customSaveFunction) return molmil.loadPlugin(molmil.settings.src+"lib/FileSaver.js", arguments.callee, this, [filename]);

  if (molmil.configBox.stereoMode != 1 && ! molmil.configBox.keepBackgroundColor) {
    var opacity = molmil.configBox.BGCOLOR[3]; molmil.configBox.BGCOLOR[3] = 0;
  }

  var canvas = molmil.fetchCanvas();
  canvas.renderer.selectDataContext();
  canvas.update = true;
  canvas.renderer.render();
  if (! filename) {
    canvas.toBlob(function(blob) {
      navigator.clipboard.write([new ClipboardItem({"image/png": blob})]);
      console.log("Image pasted to clipboard.");
    });
  }
  else if (molmil.configBox.customSaveFunction) molmil.configBox.customSaveFunction(filename, canvas.toDataURL(), "base64-bin");
  else canvas.toBlob(function(blob) {saveAs(blob, filename);});
  canvas.renderer.selectDefaultContext();
  if (molmil.configBox.stereoMode != 1 && ! molmil.configBox.keepBackgroundColor) molmil.configBox.BGCOLOR[3] = opacity;
  canvas.update = true; canvas.renderer.render();
  
  return true;
}

molmil.commandLines.pyMol.repr = function(mode, options, afterDL) {
  mode = mode.trim();
  var optionsObj = {};
  options.split(",").map(function(x) {return x.split("=").map(function(y) {return y.trim();})}).filter(function(x){return x[0];}).forEach(function (x) {optionsObj[x[0]] = x[1];});
  // some kind of options parser...

  var soup = this.cli_soup || molmil.cli_soup;

  if (mode == "au") {
    molmil.orient(null, soup);
    return molmil.quickModelColor("newweb-au", {do_styling: true}, soup);
  }
  else if (mode == "bu") {
    // make sure that misc.js has been loaded => this will be so much easier to do when async/await is used instead of the current mess...
    if (! molmil.figureOutAssemblyId) { // download misc.js & block execution
      soup.downloadInProgress++;
      return molmil.loadPlugin(molmil.settings.src+"plugins/misc.js", molmil.commandLines.pyMol.repr, this, [mode, options, true]);
    }
    if (afterDL) delete soup.downloadInProgress--; // unblock execution
    
    molmil.quickModelColor("newweb-au", {do_styling: true}, soup);
    
    optionsObj.assembly_id = optionsObj.assembly_id || molmil.figureOutAssemblyId(soup.pdbxData, soup.structures[0].BUassemblies);
    if (! optionsObj.displayMode) {
      var sceneBU = molmil.buCheck(optionsObj.assembly_id, 3, 2, null, soup);
      if (sceneBU.NOC > 1 && sceneBU.isBU && (sceneBU.type == 2 || sceneBU.size > 30000)) optionsObj.displayMode = optionsObj.displayMode || 5;
      else optionsObj.displayMode = optionsObj.displayMode || 3;
    }
    optionsObj.colorMode = optionsObj.colorMode || 2;
    molmil.selectBU(optionsObj.assembly_id, optionsObj.displayMode, optionsObj.colorMode, {orient: true}, soup.structures.slice(-1)[0], soup);
    return;
  }
  else if (mode == "cc") {
    molmil.orient(null, soup);
    molmil.quickModelColor("sticks", {do_styling: true}, soup);
    return;
  }
  else if (mode == "objects") {
    molmil.orient(null, soup);
    return molmil.quickModelColor("chain", {carbonOnly: true}, soup);
  }
  else {
    molmil.orient(null, soup);
    return molmil.quickModelColor(mode, {}, soup);
  }
  this.console.log("repr command is to be implemented", mode, options);
}

molmil.commandLines.pyMol.styleif = function(cmds) {
  if (! this.cli_soup.canvas.setupDone) return molmil_dep.asyncStart(molmil.commandLines.pyMol.styleif, [cmds], this, 100);
  cmds = cmds ? cmds.split(",").map(function(x){return x.trim()}) : ["structure"];
  this.cli_soup.UI.styleif(cmds[0], cmds.slice(1));
}

molmil.commandLines.pyMol.align = function(name1, name2) {
  name1 = name1.split(":"); name2 = name2.split(":");
  var obj1, obj2;
  if (name1 in this.fileObjects) obj1 = this.fileObjects[name1[0]];
  if (name2 in this.fileObjects) obj2 = this.fileObjects[name2[0]];

  if (!obj1) obj1 = this.cli_soup.structures.find(function(x) {return x.meta.id == name1[0] || x.meta.idnr == name1[0]});
  if (!obj2) obj2 = this.cli_soup.structures.find(function(x) {return x.meta.id == name2[0] || x.meta.idnr == name2[0]});

  if (! obj1) return this.console.log("Unknown object", name1);
  if (! obj2) return this.console.log("Unknown object", name2);
  
  obj1 = obj1.chains.find(function(x) {return x.name == name1[1]}) || obj1.chains[0];
  obj2 = obj2.chains.find(function(x) {return x.name == name2[1]}) || obj2.chains[0];
  
  molmil.align(obj1, obj2);
  return true;
}

molmil.commandLines.pyMol.alter = function(atoms, options) {
  if (typeof atoms != "object" && atoms != null) {
    if (this.hasOwnProperty(atoms)) atoms = this[atoms];
    else atoms = molmil.commandLines.pyMol.select.apply(this, [atoms]);
  }

  if (options.b) {
    for (var a=0; a<atoms.length; a++) atoms[a].Bfactor = parseFloat(options.b); // maybe in the future change this so that this'll actually execute something...
  }
  if (options.chain) {
    for (var a=0; a<atoms.length; a++) atoms[a].chain.authName = atoms[a].chain.labelName = options.chain;
  }
  if (options.ss) {
    for (var a=0; a<atoms.length; a++) atoms[a].molecule.sndStruc = {"loop": 1, "sheet": 2, "helix": 3, "turn": 4}[options.ss] || 1;
  }
  
  return true;
}

molmil.commandLines.pyMol.edmap = function(atoms, border, mode) {
  if (typeof atoms != "object") {
    if (this.hasOwnProperty(atoms)) atoms = this[atoms];
    //else atoms = molmil.commandLines.pyMol.select(atoms);
    else atoms = molmil.commandLines.pyMol.select.apply(this, [atoms]);
  }
  
  var XYZ = [], x, y, z;
  var soup = this.cli_soup;
  var mdl = soup.renderer.modelId;
  for (var a=0; a<atoms.length; a++) {
    x = atoms[a].chain.modelsXYZ[mdl][atoms[a].xyz]; y = atoms[a].chain.modelsXYZ[mdl][atoms[a].xyz+1]; z = atoms[a].chain.modelsXYZ[mdl][atoms[a].xyz+2];
    XYZ.push([x, y, z]);
  }
  
  border = parseFloat(border);
  
  var sigma = this.edmap_sigma || 1.0;
  var solid = false;
  var rgba = this.mesh_color || (mode == "fo-fc" ? [255, 0, 255, 255] : [0, 255, 255, 255]);

  var request = new molmil_dep.CallRemote("POST");
  request.AddParameter("xyz", JSON.stringify(XYZ));
  request.AddParameter("border", border*.5);
  request.AddParameter("pdbid", atoms[0].chain.entry.meta.id);
  if (mode) request.AddParameter("mode", mode);
  request.timeout = 0; request.ASYNC = true; request.responseType = "arraybuffer";
  request.console = this.console;
  request.OnDone = function() {
    if (! molmil.conditionalPluginLoad(molmil.settings.src+"plugins/loaders.js", this.OnDone, this, [])) return;
    if (! molmil.conditionalPluginLoad(molmil.settings.src+"plugins/misc.js", this.OnDone, this, [])) return;
    var settings = {};
    settings.sigma = parseFloat(sigma);
    settings.solid = solid;
    settings.skipNormalization = true; // already normalized by mapmask
    settings.denormalize = true;
    settings.rgba = rgba; // make this changable...
    settings.skipCOG = true;
    settings.alphaMode = false;
    var struct = soup.load_ccp4(this.request.response, "edmap mesh", settings);
    struct.meta.idnr = "#"+(soup.SID++);
    soup.downloadInProgress--;
  };
  soup.downloadInProgress++;
  request.OnError = function() {this.console.error("Unable to retrieve map...");};
  request.Send(molmil.settings.newweb_rest+"edmap");
}

molmil.commandLines.pyMol.save = function(file, command) {
  command = command.split(","); var selection= "all", state, format=null;
  if (command.length > 1) selection = command[1].trim() || "all";
  if (command.length > 2) state = command[2].trim() == "all" ? "all" : parseInt(command[2].trim());
  if (command.length > 3) format = command[3].trim();
  var soup = this.cli_soup;
  
  if (! format) format = molmil.guess_format(file);

  if (state == undefined || soup.structures.length == 0 || state >= soup.structures[0].number_of_frames) state = 0;
  var prevState = soup.renderer.modelId;
  if (state == -1) state = soup.renderer.modelId;
  
  if (this.hasOwnProperty(selection)) selection = this[selection];
  //else selection = molmil.commandLines.pyMol.select(selection);
  else selection = molmil.commandLines.pyMol.select.apply(this, [selection]);

  if (format == "pdb") molmil.savePDB(soup, selection, state, file);
  else if (format == "ply") molmil.exportPLY(soup, file);
  else if (format == "mmcif" || format == "mmjson") molmil.saveJSO(soup, selection, state, file);
  
  soup.renderer.modelId = prevState;
}

// selection, state, format

molmil.commandLines.pyMol.label = function(atoms, lbl) {
  if (typeof atoms != "object") {
    if (this.hasOwnProperty(atoms)) atoms = this[atoms];
    //else atoms = molmil.commandLines.pyMol.select(atoms);
    else atoms = molmil.commandLines.pyMol.select.apply(this, [atoms]);
  }
  
  var text = lbl, settings = {};
  var regex = new RegExp('"[\s]*%[\s]*\\(');
  if (regex.test(text)) { // dynamic mode
    var tmp = text.split(regex);
    var content = tmp[0].substr(1), vars = tmp[1].slice(0,-1).split(",").map(function(x) {return x.trim();}), labels = [];
    for (var a=0; a<atoms.length; a++) {
      var data = [];
      for (var i=0; i<vars.length; i++) {
        if (vars[i] == "name") data.push(atoms[a].atomName)
        else if (vars[i] == "resn") data.push(atoms[a].molecule.name);
        else if (vars[i] == "resi") data.push(atoms[a].molecule.RSID);
        else if (vars[i] == "chain") data.push(atoms[a].chain.authName);
        else if (vars[i] == "b") data.push(atoms[a].Bfactor);
        else data.push("??");
      }
      var dtext = content.replace(/%s/g, function () {return data.shift();});
      labels.push(molmil.addLabel(dtext, {atomSelection: [atoms[a]], dz_: 2}, this.cli_soup));
    }
    return labels;
  }
  else return molmil.addLabel(text, {atomSelection: atoms, dz_: 2}, this.cli_soup);
}
    
molmil.commandLines.pyMol.cartoon_color = function(clr, atoms, quiet) {
  if (typeof atoms != "object") {
    if (this.hasOwnProperty(atoms)) atoms = this[atoms];
    //else atoms = molmil.commandLines.pyMol.select(atoms);
    else atoms = molmil.commandLines.pyMol.select.apply(this, [atoms]);
  }
  
  if (clr == "default" || clr == "structure") {
    for (var i=0; i<atoms.length; i++) {
      atoms[i].molecule.rgba = molmil_dep.getKeyFromObject(molmil.configBox.sndStrucColor, atoms[i].molecule.sndStruc, molmil.configBox.sndStrucColor[1]);
    }
  }
  else if (clr == "group") {
    var hash = {}, mols, list, i;
    for (i=0; i<atoms.length; i++) hash[atoms[i].chain.entry.meta.idnr+"_"+atoms[i].chain.CID] = atoms[i].chain;
    for (var e in hash) {
      mols = hash[e].molecules;
      if (mols.length > 1) list = molmil.interpolateBR(mols.length);
      else list = [[0, 0, 255, 255]];
      for (i=0; i<mols.length; i++) mols[i].rgba = list[i];
    }
  }
  else if (clr == "chain") {
    var hash = {}, mols, list, i, j;
    for (i=0; i<atoms.length; i++) {
      if (! atoms[i].molecule.ligand && ! atoms[i].molecule.water) hash[atoms[i].molecule.chain.CID] = atoms[i].molecule.chain;
    }
    if (Object.keys(hash).length > 1) list = molmil.interpolateBR(Object.keys(hash).length);
    else list = [[0, 0, 255, 255]];
    j = 0;
    for (var e in hash) {
      hash[e].rgba = list[j];
      mols = hash[e].molecules;
      for (i=0; i<mols.length; i++) atoms[i].chain.rgba = mols[i].rgba = list[j];
      j++;
    }
  }
  else if (clr == "chainAlt") {
    var hash = {}, mols, list, i, j;
    for (i=0; i<atoms.length; i++) hash[atoms[i].molecule.chain.CID] = atoms[i].molecule.chain;
    list = molmil.configBox.bu_colors; j = 0;
    for (var e in hash) {
      hash[e].rgba = [list[j][0], list[j][1], list[j][2], 255];
      mols = hash[e].molecules;
      for (i=0; i<mols.length; i++) atoms[i].chain.rgba = mols[i].rgba = list[j];
      j++;
      if (j >= list.length) j = 0;
    }
  }
  else if (clr == "ABEGO") {
    var hash = {}, mols, list, i, j;
    for (i=0; i<atoms.length; i++) hash[atoms[i].molecule.chain.CID] = atoms[i].molecule.chain;
    for (var e in hash) {
      hash[e].rgba = [255, 255, 255, 255];
      if (hash[e].isHet) continue;
      mols = hash[e].molecules;
      if (mols[0].phiAngle == undefined) molmil.calculateBBTorsions(hash[e], this.cli_soup);
      for (i=0; i<mols.length; i++) {
        mols[i].rgba = [255, 255, 255, 255];
        if (mols[i].omegaAngle < 45 && mols[i].omegaAngle > -45) mols[i].rgba = [128, 128, 128, 255]; // grey
        else if (mols[i].phiAngle < 0) {
          if (mols[i].psiAngle > 50 || mols[i].psiAngle < -75) mols[i].rgba = [0, 0, 255, 255]; // blue
          else mols[i].rgba = [255, 0, 0, 255]; // red
        }
        else {
          if (mols[i].psiAngle > 100 || mols[i].psiAngle < -100) mols[i].rgba = [255, 255, 0, 255]; // yellow
          else mols[i].rgba = [0, 255, 0, 255]; // green
        }
      }
    }
  }
  else {
    if (typeof clr == "string") {
      var rgba = molmil.color2rgba(clr);
      if (rgba == clr && this.colors.hasOwnProperty(clr)) rgba = this.colors[clr];
      if (rgba == clr) {
        rgba = JSON.parse(clr);
        if (rgba[0] > 1 || rgba[1] > 1 || rgba[2] > 1 || rgba[3] > 1) rgba = [rgba[0], rgba[1], rgba[2], rgba[3] || rgba[3] == 0 ? rgba[3] : 255];
      }
    }
    else var rgba = clr;

    for (var i=0; i<atoms.length; i++) atoms[i].chain.rgba = atoms[i].molecule.rgba = rgba;
  }
  
  this.cli_soup.renderer.rebuildRequired = true;
}

    
molmil.commandLines.pyMol.color = function(clr, atoms) {
  var selection = atoms, selMode = 1;
  if (typeof atoms != "object") {
    if (this.hasOwnProperty(atoms)) atoms = this[atoms];
    else {selection = molmil.commandLines.pyMol.select.apply(this, [atoms]) || []; selMode = 1;}
    if (! selection.length) {selection = molmil.commandLines.pyMol.selectModel.apply(this, [atoms]) || []; selMode = 2}
  }
  
  // for (var i=0; i<atoms.length; i++) if (atoms[i] instanceof molmil.polygonObject) atoms[i].programs[0].settings.rgba = rgba;
  
  if (selMode == 1) {
    if (clr == "default") {
      var mols = [];
      for (var i=0; i<selection.length; i++) mols.push(selection[i].molecule);
       molmil.colorEntry(mols, 1, null, true);
     }
     else if (clr == "structure") {
       var mols = [];
       for (var i=0; i<selection.length; i++) mols.push(selection[i].molecule);
       molmil.colorEntry(mols, 2, null, true);
     }
     else if (clr == "cpk") {
       molmil.colorEntry(selection, 3, null, true);
     }
     else if (clr == "group") {
       var chains = {};
       for (var i=0; i<selection.length; i++) chains[selection[i].chain.CID] = selection[i].chain;
       molmil.colorEntry(Object.values(chains), 4, null, true);
     }
     else if (clr == "chain") {
       var entries = {};
       for (var i=0; i<selection.length; i++) entries[JSON.stringify(selection[i].chain.entry.meta)] = selection[i].chain.entry;
       molmil.colorEntry(Object.values(entries), molmil.colorEntry_Chain, null, true);
    }
     else if (clr == "chainAlt") {
       var entries = {};
       for (var i=0; i<selection.length; i++) entries[JSON.stringify(selection[i].chain.entry.meta)] = selection[i].chain.entry;
       molmil.colorEntry(Object.values(entries), molmil.colorEntry_ChainAlt, null, true);
    }
    else if (clr == "bfactor") molmil.colorBfactor(selection, this.cli_soup);
    else if (clr == "snfg") {
      for (var i=0; i<selection.length; i++) {
        selection[i].molecule.rgba = selection[i].rgba = (molmil.SNFG[selection[i].molecule.name] || molmil.SNFG.__UNKNOWN__).rgba.slice();
      }
      this.cli_soup.renderer.rebuildRequired = true;
    }
    else {
      if (typeof clr == "string") {
        var rgba = molmil.color2rgba(clr);
        if (rgba == clr && this.colors.hasOwnProperty(clr)) rgba = this.colors[clr];
        if (rgba == clr) {
          rgba = JSON.parse(clr);
          if (rgba[0] > 1 || rgba[1] > 1 || rgba[2] > 1 || rgba[3] > 1) rgba = [rgba[0], rgba[1], rgba[2], rgba[3] || rgba[3] == 0 ? rgba[3] : 255];
        }
      }
      else var rgba = clr;

      for (var i=0; i<selection.length; i++) selection[i].rgba = rgba;

      this.cli_soup.renderer.rebuildRequired = true;
    }
  }
  else if (selMode == 2) {
    if (typeof clr == "string") {
      var rgba = molmil.color2rgba(clr);
      if (rgba == clr && this.colors.hasOwnProperty(clr)) rgba = this.colors[clr];
      if (rgba == clr) {
        rgba = JSON.parse(clr);
        if (rgba[0] > 1 || rgba[1] > 1 || rgba[2] > 1 || rgba[3] > 1) rgba = [rgba[0], rgba[1], rgba[2], rgba[3] || rgba[3] == 0 ? rgba[3] : 255];
      }
    }
    else var rgba = clr;

    var pita = function(x) {
      x.programs[0].settings.rgba = rgba;
      x.programs[0].settings.alphaSet = (rgba[3] === undefined ? 255 : rgba[3])/255;
      if (x.programs[0].settings.alphaSet != 1 && x.programs[0].pre_shader != cli_soup.renderer.shaders.alpha_dummy) x.programs[0].rebuild();
    }, cli_soup = this.cli_soup;

    for (var i=0; i<selection.length; i++) {
      if (selection[i].structures) selection[i].structures.forEach(function(x) {pita(x);});
      else pita(selection[i]);
    }
    
    this.cli_soup.renderer.rebuildRequired = true;
  }
  
  return true;
}
    
molmil.commandLines.pyMol.set_color = function(name, rgba) {
  if (rgba[0] > 1 || rgba[1] > 1 || rgba[2] > 1 || rgba[3] > 1) rgba = [rgba[0], rgba[1], rgba[2], rgba[3]];
  this.colors[name] = rgba;
}

molmil.commandLines.pyMol.hide = function(repr, key, quiet) {
  var backboneAtoms = molmil.configBox.backboneAtoms4Display, atoms = [];

  if (typeof key != "object") {
    if (this.hasOwnProperty(key)) atoms = this[key];
    //else atoms = molmil.commandLines.pyMol.select(key);
    else atoms = molmil.commandLines.pyMol.select.apply(this, [key]);
  }
  
  if (repr == "hydro" || repr == "h.") {
    this.cli_soup.hydrogenToggle(false);
  }
  else if (repr == "all" || repr == "*") {
    if (atoms.length) molmil.displayEntry(atoms, molmil.displayMode_None);
    else molmil.displayEntry(this.cli_soup.structures, molmil.displayMode_None);
    for (var i=0; i<atoms.length; i++) atoms[i].chain.display = false;
  }
  else if (repr == "cartoon") {
    for (var i=0; i<atoms.length; i++) atoms[i].molecule.displayMode = atoms[i].chain.displayMode = 0;
  }
  else if (repr == "snfg-icon") {
    for (var i=0; i<atoms.length; i++) {
      if (atoms[i].molecule.SNFG) atoms[i].molecule.displayMode = atoms[i].chain.displayMode = atoms[i].displayMode = 0;
      else if (atoms[i].molecule.snfg_con && ! backboneAtoms.hasOwnProperty(atoms[i].atomName)) {
        atoms[i].displayMode = 0;
        atoms[i].molecule.showSC = false;
      }
    }
  }
  else if (repr == "coarse-surface") {
    //for (var i=0; i<atoms.length; i++) atoms[i].molecule.displayMode = atoms[i].chain.displayMode = 0;
    for (var i=0; i<atoms.length; i++) atoms[i].chain.displayMode = 0;
  }
  else if (repr == "spheres") {
    for (var i=0; i<atoms.length; i++) if (atoms[i].displayMode == 1) atoms[i].displayMode = 0;
  }
  else if (repr == "ball_stick") {
    for (var i=0; i<atoms.length; i++) if (atoms[i].displayMode == 2) atoms[i].displayMode = 0;
  }
  else if (repr == "sticks") {
    for (var i=0; i<atoms.length; i++) if (atoms[i].displayMode == 3) atoms[i].displayMode = 0;
  }
  else if (repr == "lines") {
    for (var i=0; i<atoms.length; i++) if (atoms[i].displayMode == 4) atoms[i].displayMode = 0;
  }
  else if (repr == "solvent") {
    this.cli_soup.waterToggle(false);
  }
  else if (repr == "cell") {
    this.cli_soup.hideCell();
  }
  else if (repr == "label") {
    var soup = molmil.cli_soup;
    for (var i=0; i<soup.texturedBillBoards.length; i++) {
      if (soup.texturedBillBoards[i].text == key) {
        soup.texturedBillBoards[i].display = false;
        soup.texturedBillBoards[i].status = false;
        this.cli_soup.renderer.canvas.update = true;
        return;
      }
    }
  }

  this.cli_soup.renderer.rebuildRequired = true;
  
  return true;
}

molmil.commandLines.pyMol.enable = function(atoms) {
  var selection = atoms, selMode = 1;
  if (typeof atoms != "object") {
    try {
      if (this.hasOwnProperty(atoms)) selection = this[atoms];
      else {selection = molmil.commandLines.pyMol.select.apply(this, [atoms]) || []; selMode = 1;}
    } catch (e) {selection = [];}
    if (! selection.length) {selection = molmil.commandLines.pyMol.selectModel.apply(this, [atoms]) || []; selMode = 2}
  }
  
  if (selMode == 1) {
    for (var i=0; i<selection.length; i++) selection[i].chain.entry.display = true;
  }
  else if (selMode == 2) {
    for (var i=0; i<selection.length; i++) {
      selection[i].display = false;
      if (selection[i].structures) selection[i].structures.forEach(function(x) {for (var m=0; m<x.programs.length; m++) x.programs[m].status = true;});
      else {for (var m=0; m<selection[i].programs.length; m++) selection[i].programs[m].status = true;}
    }
  }

  var entries = document.getElementsByClassName("UI_entryItem");
  for (var i=0; i<entries.length; i++) if (entries[i].payload[0].display) entries[i].style.color = "";
  
  this.cli_soup.renderer.rebuildRequired = true;
}

molmil.commandLines.pyMol.disable = function(atoms) {
  var selection = atoms, selMode = 1;
  if (typeof atoms != "object") {
    try {
      if (this.hasOwnProperty(atoms)) selection = this[atoms];
      else {selection = molmil.commandLines.pyMol.select.apply(this, [atoms]) || []; selMode = 1;}
    } catch (e) {selection = [];}
    if (! selection.length) {selection = molmil.commandLines.pyMol.selectModel.apply(this, [atoms]) || []; selMode = 2}
  }

  if (selMode == 1) {
    for (var i=0; i<selection.length; i++) selection[i].chain.entry.display = false;
  }
  else if (selMode == 2) {
    for (var i=0; i<selection.length; i++) {
      selection[i].display = false;
      if (selection[i].structures) selection[i].structures.forEach(function(x) {for (var m=0; m<x.programs.length; m++) x.programs[m].status = false;});
      else {for (var m=0; m<selection[i].programs.length; m++) selection[i].programs[m].status = false;}
    }
  }
  
  var entries = document.getElementsByClassName("UI_entryItem");
  for (var i=0; i<entries.length; i++) if (! entries[i].payload[0].display) entries[i].style.color = "lightgrey";
  
  this.cli_soup.renderer.rebuildRequired = true;
}

molmil.commandLines.pyMol.turn = function(axis, degrees, interval, frames) {
  interval = parseFloat(interval);
  if (isNaN(interval)) interval = 0;
  var fid = 0;
  
  var camera = this.cli_soup.renderer.camera, canvas = this.cli_canvas, obj = [0];
  this.animObjects = this.animObjects || [];
  this.animObjects.push(obj);
  
  if (canvas.renderer.onRenderFinish !== undefined) canvas.molmilViewer.downloadInProgress++;
  
  var update = function() {
    if (axis == "x") camera.pitchAngle += parseFloat(degrees) || 0;
    else if (axis == "y") camera.headingAngle += parseFloat(degrees) || 0;
    else if (axis == "z") camera.rollAngle += parseFloat(degrees) || 0;
    
    camera.positionCamera();
    canvas.update = true;
    fid++;
    if (interval > 0 && fid != frames) {
      if (canvas.renderer.onRenderFinish !== undefined) {
        canvas.renderer.initBD = true;
        canvas.renderer.render();
      }
      obj[0] = setTimeout(update, interval);
    }
    else if (canvas.renderer.onRenderFinish !== undefined) canvas.molmilViewer.downloadInProgress--;
  };
  update();
  
  return true;
}

molmil.commandLines.pyMol.move = function(axis, amount, interval, frames) {
  interval = parseFloat(interval);
  if (isNaN(interval)) interval = 0;
  var fid = 0;
  
  var camera = this.cli_soup.renderer.camera, canvas = this.cli_canvas, obj = [0];
  this.animObjects = this.animObjects || [];
  this.animObjects.push(obj);
  
  var update = function() {
    if (axis == "x") camera.x += parseFloat(amount) || 0;
    else if (axis == "y") camera.y += parseFloat(amount) || 0;
    else if (axis == "z") camera.z += parseFloat(amount) || 0;
    
    canvas.update = true;
    fid++;
    if (interval > 0 && fid != frames) obj[0] = setTimeout(update, interval);
  };
  update();
  
  return true;
}

molmil.commandLines.pyMol.stopAnim = function() {
  this.animObjects.forEach(function (x) {clearTimeout(x);});
  return;
}



molmil.commandLines.pyMol.translate = function(xyz, selection) {
  var soup = molmil.cli_soup;
  if (typeof selection != "object") {
    selection = selection.replace(/,/, '').trim();
    if (this.hasOwnProperty(selection)) selection = this[selection];
    else selection = molmil.commandLines.pyMol.select.apply(this, [selection]) || [];
  }
  
  // rotate in camera space
  var mat = mat3.fromMat4(mat3.create(), soup.renderer.camera.generateMatrix()); mat3.invert(mat, mat);
  vec3.transformMat3(xyz, xyz, mat);
  
  var mdl = soup.renderer.modelId, xyzpos;
  for (var i=0; i<selection.length; i++) {
    xyzpos = selection[i].xyz;
    selection[i].chain.modelsXYZ[mdl][xyzpos+0] += xyz[0];
    selection[i].chain.modelsXYZ[mdl][xyzpos+1] += xyz[1];
    selection[i].chain.modelsXYZ[mdl][xyzpos+2] += xyz[2];
  }
  
  molmil.geometry.reInitChains = true;
  molmil.geometry.generate(soup.structures, soup.renderer, 0);
  for (var i=0; i<soup.texturedBillBoards.length; i++) soup.texturedBillBoards[i].dynamicsUpdate();
  soup.renderer.initBD = true;
}

molmil.commandLines.pyMol.set = function(key, value, atoms, quiet) {
  var selection = atoms, selMode = 1;
  if (typeof atoms != "object") {
    if (this.hasOwnProperty(atoms)) selection = this[atoms];
    else {selection = molmil.commandLines.pyMol.select.apply(this, [atoms]) || []; selMode = 1;}
    if (! selection.length) {selection = molmil.commandLines.pyMol.selectModel.apply(this, [atoms]) || []; selMode = 2}
  }
  
  var i;
  if (key == "stick_radius") {
    value = parseFloat(value);
    for (var i=0; i<selection.length; i++) {
      selection[i].stickRadius = value;
    }
  }
  else if (key == "depth_cue") {
    molmil.configBox.glsl_fog = value == 1;
    molmil.shaderEngine.recompile(this.cli_soup.renderer);
    this.cli_soup.canvas.update = true;
  }
  else if (key == "cartoon_highlight_color") {
    if (value == -1) molmil.configBox.cartoon_highlight_color = -1;
    else {
      var rgba = molmil.color2rgba(value);
      if (rgba == value) {
        rgba = JSON.parse(value);
        if (rgba[0] > 1 || rgba[1] > 1 || rgba[2] > 1 || rgba[3] > 1) rgba = [rgba[0], rgba[1], rgba[2], rgba[3]];
      }
      molmil.configBox.cartoon_highlight_color = [rgba[0], rgba[1], rgba[2]];
    }
  }
  else if (key == "field_of_view") {
    molmil.configBox.camera_fovy = parseFloat(value);
    this.cli_soup.renderer.resizeViewPort();
    this.cli_soup.canvas.update = true;
  }
  else if (key == "orthoscopic") {
    if (value.toLowerCase() == "on") molmil.configBox.projectionMode = 2
    else molmil.configBox.projectionMode = 1;
  }
  else if (key == "label_bg_color") {
    var rgba = molmil.color2rgba(value);
    if (rgba == value) {
      rgba = JSON.parse(value);
      if (rgba[0] > 1 || rgba[1] > 1 || rgba[2] > 1 || rgba[3] > 1) rgba = [rgba[0], rgba[1], rgba[2], rgba[3]];
    }
    if (value == -1) molmil.defaultSettings_label.bg_color = undefined;
    else molmil.defaultSettings_label.bg_color = [rgba[0], rgba[1], rgba[2]];
  }  
  else if (key == "label_outline_color") {
    var rgba = molmil.color2rgba(value);
    if (rgba == value) {
      rgba = JSON.parse(value);
      if (rgba[0] > 1 || rgba[1] > 1 || rgba[2] > 1 || rgba[3] > 1) rgba = [rgba[0], rgba[1], rgba[2], rgba[3]];
    }
    molmil.defaultSettings_label.outline_color = [rgba[0], rgba[1], rgba[2]];
  }
  else if (key == "label_color") {
    var rgba = molmil.color2rgba(value);
    if (rgba == value) {
      rgba = JSON.parse(value);
      if (rgba[0] > 1 || rgba[1] > 1 || rgba[2] > 1 || rgba[3] > 1) rgba = [rgba[0], rgba[1], rgba[2], rgba[3]];
    }
    molmil.defaultSettings_label.color = [rgba[0], rgba[1], rgba[2]];
  }
  else if (key == "label_border") {
    molmil.defaultSettings_label.addBorder = value.toLowerCase() == "on";
  }
  else if (key == "label_position") {
    value = value.replace('(', '').replace(')', '').split(",");
    molmil.defaultSettings_label.dx = parseFloat(value[0].trim()); molmil.defaultSettings_label.dy = -parseFloat(value[1].trim()); molmil.defaultSettings_label.dz = parseFloat(value[2].trim());
  }
  else if (key == "label_atom_center") {
    molmil.defaultSettings_label.label_atom_center = value;
  }
  else if (key == "label_size") {
    molmil.defaultSettings_label.fontSize = parseFloat(value);
  }
  else if (key == "label_front") {
    molmil.defaultSettings_label.alwaysFront = value == 1;
  }
  else if (key == "cartoon_smooth_loops") {
    value = parseInt(value);
    molmil.configBox.smoothFactor = value;
  }
  else if (key == "all_states") {
    //set all_states, on 
    if (value.toLowerCase() == "on") molmil.configBox.loadModelsSeparately = true;
    else molmil.configBox.loadModelsSeparately = false;
  }
  else if (key == "movie_mode") {
    if (value.toLowerCase() == "forward") this.cli_soup.animation.motionMode = 1;
    else if (value.toLowerCase() == "backward") this.cli_soup.animation.motionMode = 2;
    else if (value.toLowerCase() == "swing") this.cli_soup.animation.motionMode = 3;
    else if (value.toLowerCase() == "swing-once") this.cli_soup.animation.motionMode = 3.5;
  }
  else if (key == "edmap_sigma") {
    this.edmap_sigma = parseFloat(value);
  }
  else if (key == "mesh_color") {
    var rgba = molmil.color2rgba(value);
    if (rgba == value) {
      rgba = JSON.parse(value);
      if (rgba[0] > 1 || rgba[1] > 1 || rgba[2] > 1 || rgba[3] > 1) rgba = [rgba[0], rgba[1], rgba[2], rgba[3]];
    }
    this.mesh_color = rgba;
  }
  else if (selMode == 2 && key == "surface_color") {
    var rgba = molmil.color2rgba(value);
    if (rgba == value) {
      rgba = JSON.parse(value);
      if (rgba[0] > 1 || rgba[1] > 1 || rgba[2] > 1 || rgba[3] > 1) rgba = [rgba[0], rgba[1], rgba[2], rgba[3]];
    }
    
    for (var i=0; i<selection.length; i++) {
      if (selection[i].structures) selection[i].structures.forEach(function(x) {for (var m=0; m<x.programs.length; m++) x.programs[m].settings.rgba = rgba;});
      else {for (var m=0; m<selection[i].programs.length; m++) selection[i].programs[m].settings.rgba = rgba;}
    }
  }
  else if (key == "cif_use_auth") {
    if (value == "on") this.cif_use_auth = true;
    else this.cif_use_auth = false;
  }
  else if (key == "stereo_mode") {
    value = parseInt(value);
    if (value == 10) molmil.configBox.stereoMode = 1; // anaglyph
    else if (value == 5) molmil.configBox.stereoMode = 2; // side-by-side
    else if (value == 2) molmil.configBox.stereoMode = 4; // cross-eyed
    else molmil.configBox.stereoMode = 0; // not supported
    
    this.cli_soup.renderer.resizeViewPort();
  }
  else if (key == "connect_cutoff") {
    molmil.configBox.connect_cutoff = parseFloat(value);
  }
  else if (key == "transparency") {
    for (var i=0; i<selection.length; i++) selection[i].molecule.rgba = [selection[i].molecule.rgba[0], selection[i].molecule.rgba[2], selection[i].molecule.rgba[1], (1-value)*255];
    this.cli_soup.renderer.rebuildRequired = true;
  }
  else if (key == "transparency_sticks") {
    for (var i=0; i<selection.length; i++) selection[i].rgba = [selection[i].rgba[0], selection[i].rgba[2], selection[i].rgba[1], (1-value)*255];
    this.cli_soup.renderer.rebuildRequired = true;
  }

  else if (key == "backface_cull") {
    var gl = this.cli_soup.renderer.gl;
    if (value == 1) {
      molmil.configBox.cullFace = true;
      gl.enable(gl.CULL_FACE);
      gl.cullFace(gl.BACK);
    }
    else {
      molmil.configBox.cullFace = false;
      gl.disable(gl.CULL_FACE);
    }
    
  }
  
  return true;
}

molmil.commandLines.pyMol.bg_color = function(clr) {
  var rgba = molmil.color2rgba(clr);
  if (rgba == clr) {
    rgba = JSON.parse(clr);
    if (rgba[0] > 1 || rgba[1] > 1 || rgba[2] > 1 || rgba[3] > 1) rgba = [rgba[0], rgba[1], rgba[2], rgba[3]];
  }

  molmil.configBox.BGCOLOR[0] = rgba[0]/255;
  molmil.configBox.BGCOLOR[1] = rgba[1]/255;
  molmil.configBox.BGCOLOR[2] = rgba[2]/255;
  molmil.configBox.BGCOLOR[3] = rgba[3]/255;
  molmil.updateBGcolor();
  
  this.cli_soup.canvas.update = true;
  
  return true;
}

molmil.commandLines.pyMol.origin = function(atoms) {
  if (atoms === undefined) atoms = Object.values(molmil.cli_soup.atomRef);
  else if (typeof atoms != "object") {
    if (this.hasOwnProperty(atoms)) atoms = this[atoms];
    //else atoms = molmil.commandLines.pyMol.select(atoms);
    else atoms = molmil.commandLines.pyMol.select.apply(this, [atoms]);
  }

  molmil.cli_soup.calculateCOG(atoms);
  
  return true;
}


    
molmil.commandLines.pyMol.show = function(repr, atoms, quiet) {
  // atoms => all
  var backboneAtoms = molmil.configBox.backboneAtoms4Display;


  var soup = molmil.cli_soup;
  var selection = atoms, selMode = 1;
  if (atoms === undefined) atoms = Object.values(soup.atomRef);
  else if (typeof atoms != "object") {
    atoms = atoms.replace(/,/, '').trim();
    if (this.hasOwnProperty(atoms)) selection = this[atoms];
    else {selection = molmil.commandLines.pyMol.select.apply(this, [atoms]) || []; selMode = 1;}
    if (! selection.length) {selection = molmil.commandLines.pyMol.selectModel.apply(this, [atoms]) || []; selMode = 2}
  }

  if (selMode == 1) {
    if (repr == "spheres") {
      for (var i=0; i<selection.length; i++) {
        selection[i].displayMode = 1;
        if (selection[i].element == "H") selection[i].display = soup.showHydrogens;
        else selection[i].display = true;
        selection[i].chain.entry.display = true;
        if (selection[i].molecule.CA == selection[i]) {
          selection[i].molecule.displayMode = 0;
          selection[i].molecule.showSC = true;
          selection[i].molecule.chain.twoDcache = null;
        }
        else if (selection[i].molecule.ligand) {
          selection[i].molecule.displayMode = 0;
          selection[i].molecule.display = true;
          selection[i].chain.display = true;
        }
      }
    }
    else if (repr == "ball_stick") {
      for (var i=0; i<selection.length; i++) {
        selection[i].displayMode = 2;
        if (selection[i].element == "H") selection[i].display = soup.showHydrogens;
        else selection[i].display = true;
        selection[i].chain.entry.display = true;
        if (selection[i].molecule.CA == selection[i]) {
          selection[i].molecule.displayMode = 0;
          selection[i].molecule.showSC = true;
          selection[i].molecule.chain.twoDcache = null;
        }
        else if (selection[i].molecule.ligand) {
          selection[i].molecule.displayMode = 0;
          selection[i].molecule.display = true;
          selection[i].chain.display = true;
        }
      }
    }
    else if (repr == "sticks") {
      for (var i=0; i<selection.length; i++) {
        selection[i].displayMode = 3;
        if (selection[i].element == "H") selection[i].display = soup.showHydrogens;
        else selection[i].display = true;
        selection[i].chain.entry.display = true;
        if (selection[i].molecule.CA == selection[i]) {
          selection[i].molecule.displayMode = 0;
          selection[i].molecule.display = true;
          selection[i].molecule.showSC = true;
          selection[i].molecule.chain.twoDcache = null;
        }
        else if (selection[i].molecule.ligand) {
          selection[i].molecule.displayMode = 0;
          selection[i].molecule.display = true;
          selection[i].chain.display = true;
        }
      }
    }
    else if (repr == "lines") {
      for (var i=0; i<selection.length; i++) {
        selection[i].displayMode = 4;
        if (selection[i].element == "H") selection[i].display = soup.showHydrogens;
        else selection[i].display = true;
        selection[i].chain.entry.display = true;
        if (selection[i].molecule.CA == selection[i]) {
          selection[i].molecule.displayMode = 0;
          selection[i].molecule.showSC = true;
          selection[i].molecule.chain.twoDcache = null;
        }
      }
    }
    else if (repr == "cartoon") {
      var resshow = {};
      for (var i=0; i<selection.length; i++) {
        selection[i].displayMode = 0;
        selection[i].chain.display = selection[i].chain.entry.display = true;
        if (selection[i].molecule.CA == selection[i] || selection[i].molecule.SNFG) {
          selection[i].molecule.displayMode = 3;
          selection[i].molecule.showSC = false;
          selection[i].molecule.chain.displayMode = 3;
        }
        if (selection[i].molecule.SNFG && selection[i].molecule.res_con) resshow[selection[i].molecule.res_con.MID] = selection[i].molecule.res_con;
      }
      for (var i in resshow) {
        resshow[i].showSC = true;
        for (var a=0; a<(resshow[i].selection)||[].length; a++) {
          if (! backboneAtoms.hasOwnProperty(resshow[i].selection[a].atomName)) resshow[i].selection[a].displayMode = 0;
        }
      }
      molmil.geometry.reInitChains = true;
    }
    else if (repr == "rocket") {
      for (var i=0; i<selection.length; i++) {
        selection[i].displayMode = 0;
        selection[i].chain.display = selection[i].chain.entry.display = true;
        if (selection[i].molecule.CA == selection[i]) {
          selection[i].molecule.displayMode = 31;
          selection[i].molecule.showSC = false;
          selection[i].molecule.chain.displayMode = 4;
        }
        else if (selection[i].molecule.SNFG) {
          selection[i].molecule.displayMode = 31;
          selection[i].molecule.chain.displayMode = 4;
          selection[i].displayMode = 3;
        }
      }
      molmil.geometry.reInitChains = true;
    }
    else if (repr == "snfg-icon") {
      var resshow = {};
      for (var i=0; i<selection.length; i++) {
        selection[i].displayMode = 0;
        selection[i].chain.display = selection[i].chain.entry.display = true;
        if (selection[i].molecule.SNFG) {
          selection[i].molecule.displayMode = 31;
          selection[i].molecule.chain.displayMode = 4;
          selection[i].displayMode = 3;
          if (selection[i].molecule.res_con && selection[i].molecule.res_con.selection) resshow[selection[i].molecule.res_con.MID] = selection[i].molecule.res_con;
        }
      }
      for (var i in resshow) {
        resshow[i].showSC = true;
        for (var a=0; a<resshow[i].selection.length; a++) {
          if (! backboneAtoms.hasOwnProperty(resshow[i].selection[a].atomName)) resshow[i].selection[a].displayMode = resshow[i].selection[a].displayMode || 3;
        }
      }
    }
    else if (repr == "coarse-surface") {
      //for (var i=0; i<selection.length; i++) selection[i].molecule.displayMode = selection[i].chain.displayMode = 0;
      for (var i=0; i<selection.length; i++) {
        selection[i].chain.entry.display = true;
        selection[i].chain.displayMode = molmil.displayMode_ChainSurfaceCG;
        selection[i].chain.displayMode = molmil.displayMode_ChainSurfaceCG;
      }
    }
    else if (repr == "tube") {
      for (var i=0; i<selection.length; i++) {
        selection[i].displayMode = 0;
        selection[i].chain.entry.display = true;
        if (selection[i].molecule.CA == selection[i]) {
          selection[i].molecule.displayMode = 2;
          selection[i].molecule.showSC = false;
          selection[i].molecule.chain.displayMode = 2;
        }
      }
    }
    else if (repr == "ca-trace") {
      for (var i=0; i<selection.length; i++) {
        selection[i].displayMode = 0;
        selection[i].chain.entry.display = true;
        if (selection[i].molecule.CA == selection[i]) {
          selection[i].molecule.displayMode = 1;
          selection[i].molecule.showSC = false;
          selection[i].molecule.chain.displayMode = 1;
        }
      }
    }
    else if (repr == "hydro" || repr == "h.") {
      this.cli_soup.hydrogenToggle(true);
    }
    else if (repr == "solvent") {
      this.cli_soup.waterToggle(true);
    }
    else if (repr == "visible") {
      for (var i=0; i<selection.length; i++) {
        selection[i].chain.entry.display = true;
        selection[i].display = true;
      }
    }
    else if (repr == "cell") {
      soup.showCell();
    }
    else {
      console.error(repr+" is unknown...");
    }
  }
  else if (selMode == 2) {
    if (repr == "lines") {
      for (var i=0; i<selection.length; i++) {
        selection[i].display = false;
        if (selection[i].structures) selection[i].structures.forEach(function(x) {for (var m=0; m<x.programs.length; m++) if (x.programs[m].settings.solid) x.programs[m].toggleWF();});
        else {for (var m=0; m<selection[i].programs.length; m++) if (selection[i].programs[m].settings.solid) selection[i].programs[m].toggleWF();}
      }
    }
    else if (repr == "solid") {
      for (var i=0; i<selection.length; i++) {
        selection[i].display = false;
        if (selection[i].structures) selection[i].structures.forEach(function(x) {for (var m=0; m<x.programs.length; m++) if (! x.programs[m].settings.solid) x.programs[m].toggleWF();});
        else {for (var m=0; m<selection[i].programs.length; m++) if (! selection[i].programs[m].settings.solid) selection[i].programs[m].toggleWF();}
      }
    }
    else if (repr = "label") {
      for (var i=0; i<soup.texturedBillBoards.length; i++) {
        if (soup.texturedBillBoards[i].text == atoms) {
          soup.texturedBillBoards[i].display = true;
          this.cli_soup.renderer.canvas.update = true;
          return;
        }
      }
    }
  }
  
  this.cli_soup.renderer.rebuildRequired = true;
}
