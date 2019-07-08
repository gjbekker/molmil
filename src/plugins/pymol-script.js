molmil.commandLine.prototype.bindPymolInterface = function() {
  this.environment.console.log("Pymol-like command interface bound.");
  this.pyMol = {};
  this.pyMol.keywords = {
    select: molmil.commandLines.pyMol.selectCommand, 
    color: molmil.commandLines.pyMol.colorCommand, 
    cartoon_color: molmil.commandLines.pyMol.cartoon_colorCommand, 
    set_color: molmil.commandLines.pyMol.setColorCommand, 
    show: molmil.commandLines.pyMol.showCommand,
    hide: molmil.commandLines.pyMol.hideCommand,
    turn: molmil.commandLines.pyMol.turnCommand,
    move: molmil.commandLines.pyMol.moveCommand,
    fetch: molmil.commandLines.pyMol.fetchCommand,
    "fetch-cc": molmil.commandLines.pyMol.fetchCCCommand,
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
    findseq: molmil.commandLines.pyMol.findseqCommand,
    delete: molmil.commandLines.pyMol.deleteCommand,
    edmap: molmil.commandLines.pyMol.edmapCommand,
    frame: molmil.commandLines.pyMol.frameCommand,
    bond: molmil.commandLines.pyMol.bondCommand,
    stereo: molmil.commandLines.pyMol.stereoCommand,
    orient: molmil.commandLines.pyMol.orientCommand,
    alter: molmil.commandLines.pyMol.alterCommand
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
  command = command.match(/label[\s]+(.*)[\s]*,[\s]*(.*)/);
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
  command = command.match(/edmap[\s]+(.*?)[\s]*,[\s]*([0-9_.]+)/);
  try {molmil.commandLines.pyMol.edmap.apply(env, [command[1].trim(), command[2].trim()]);}
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

molmil.commandLines.pyMol.saveCommand = function(env, command) {
  command = command.match(/save[\s]+([a-zA-Z0-9_.]+)[\s]*(,[\s]*(.*))?/);
  try {molmil.commandLines.pyMol.save.apply(env, [command[1], command[2]||""]);}
  catch (e) {console.error(e); return false;}
  return true;
}
    
molmil.commandLines.pyMol.cartoon_colorCommand = function(env, command) {
  tmp = command.match(/cartoon_color[\s]+([a-zA-Z0-9_]+)[\s]*,[\s]*(.*)/);
  if (! tmp) command = command.match(/cartoon_color[\s]+(\[[\s]*[0-9]+[\s]*,[\s]*[0-9]+[\s]*,[\s]*[0-9]+[\s]*\])[\s]*,[\s]*(.*)/);
  else command = tmp;
  try {molmil.commandLines.pyMol.cartoon_color.apply(env, [command[1], command[2]]);}
  catch (e) {console.error(e); return false;}
  return true;
}
    
molmil.commandLines.pyMol.colorCommand = function(env, command) {
  tmp = command.match(/color[\s]+([a-zA-Z0-9_]+)[\s]*,[\s]*(.*)/);
  if (! tmp) command = command.match(/color[\s]+(\[[\s]*[0-9]+[\s]*,[\s]*[0-9]+[\s]*,[\s]*[0-9]+[\s]*\])[\s]*,[\s]*(.*)/);
  else command = tmp;
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

molmil.commandLines.pyMol.turnCommand = function(env, command) {
  var cmd = command.match(/turn[\s]+([xyz]),[\s]+([-+]?[0-9]*\.?[0-9]+)/);
  if (cmd != null) {
    try {molmil.commandLines.pyMol.turn.apply(env, [cmd[1], cmd[2]]);}
    catch (e) {console.error(e); return false;}
  }
  else return false;
  return true;
}

molmil.commandLines.pyMol.moveCommand = function(env, command) {
  var cmd = command.match(/move[\s]+([xyz]),[\s]+([-+]?[0-9]*\.?[0-9]+)/);
  if (cmd != null) {
    try {molmil.commandLines.pyMol.move.apply(env, [cmd[1], cmd[2]]);}
    catch (e) {console.error(e); return false;}
  }
  else return false;
  return true;
}


molmil.commandLines.pyMol.fetchCommand = function(env, command) {
  var cmd = command.match(/fetch[\s]+([a-zA-Z0-9]{4})/);
  if (cmd != null) {
    var cb = function(soup, struc) {
      if (soup.AID > 150000 && (navigator.userAgent.toLowerCase().indexOf("mobile") != -1 || navigator.userAgent.toLowerCase().indexOf("android") != -1 || window.navigator.msMaxTouchPoints)) molmil.displayEntry(struc, molmil.displayMode_Wireframe);
      else molmil.displayEntry(struc, 1);
      molmil.colorEntry(struc, 1);
      soup.renderer.rebuildRequired = true;
    };
    
    try {molmil.loadPDB(cmd[1], cb);}
    catch (e) {console.error(e); return false;}
  }
  else return false;
  return true;
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
  
  var canvas = molmil.fetchCanvas();
  var mjs_fileBin = canvas.mjs_fileBin || {};
  
  if (mjs_fileBin.hasOwnProperty(cmd[1])) {
    // load it manually...
    var fakeObj = mjs_fileBin[cmd[1]];
    
    for (var j=0, ok=false; j<canvas.inputFunctions.length; j++) {
      if (canvas.inputFunctions[j](canvas, fakeObj)) break;
    }
    
    return true;
  }
  
  // load cmd[1]
  var formats = [];
  if (cmd != null) {
    try {
      molmil.cli_soup.loadStructure(cmd[1], options.format, function(soup, structures) {molmil.displayEntry(structures, 1); molmil.colorEntry(structures, 1); soup.renderer.rebuildRequired = true;}, options);
    }
    catch (e) {console.error(e); return false;}
  }
  else return false;
  return true;
}

molmil.quickSelect = molmil.commandLines.pyMol.select = molmil.commandLines.pyMol.pymolSelectEngine = function(expr, soup) {
  if (! molmil.isBalancedStatement(expr)) throw "Incorrect statement"; // safety check
  
  var new_expr = [];
  var word = "", key, ss_conv = {h: 3, s: 2, l: 1}, tmp, i, j;
  var toUpper = false, toUpper_, toLower = false, toLower_, ss = false, ss_;
  
  this.soupObject = this.soupObject || molmil.cli_soup || soup || this.cli_soup;
  if (expr == "all") return Object.values(this.soupObject.atomRef);
  
  var sub_expr_handler = function() { // define new way to handle this...
  };
  
  new_expr

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
  
  // need to upgrade this parser in the future to something more flexible...

  var backboneAtoms = molmil.configBox.backboneAtoms4Display;
  for (i=0; i<expr.length; i++) {
    if (expr[i].match(/\s/) || expr[i] == ")") {
      toUpper_ = false, ss_ = false;
      if (word == "name") {key = "this.soupObject.atomRef[a].atomName == '%s'"; toUpper_ = true;}
      else if (word == "index") key = "this.soupObject.atomRef[a].AID == %s-1";
      else if (word == "symbol") key = "this.soupObject.atomRef[a].element == '%s'";
      else if (word == "resn") {key = "this.soupObject.atomRef[a].molecule.name.toLowerCase() == '%s'"; toLower_ = true;}
      else if (word == "resi") key = "this.soupObject.atomRef[a].molecule.RSID == %s";
      else if (word == "resid") key = "this.soupObject.atomRef[a].molecule.id == %s";
      else if (word == "ss") {key = "this.soupObject.atomRef[a].molecule.sndStruc == %s"; ss_ = true;}
      else if (word == "chain") {
        if (this.cif_use_auth) key = "this.soupObject.atomRef[a].molecule.chain.authName == '%s'";
        else key = "this.soupObject.atomRef[a].molecule.chain.name == '%s'";
      }
      else if (word == "b") key = "this.soupObject.atomRef[a].Bfactor %s %s";
      else if (word == "hydro") new_expr.push("this.soupObject.atomRef[a].molecule.water == true");
      else if (word == "hetatm") new_expr.push("this.soupObject.atomRef[a].molecule.ligand == true");
      else if (word == "model") {
        // two modes, by name & by number (1-...)
        if (expr[i+1] == "#") key = "this.soupObject.atomRef[a].chain.entry.meta.idnr == '%s'";
        else {key = "this.soupObject.atomRef[a].chain.entry.meta.id.toLowerCase() == '%s'"; toLower_ = true;}
      }
      else if (word == "around") {
        //console.log(word, key, new_expr);
      }
      else if (word == "and") new_expr.push("&&");
      else if (word == "or") new_expr.push("||");
      else if (word == "backbone") {
        new_expr.push("(! this.soupObject.atomRef[a].molecule.ligand && ! this.soupObject.atomRef[a].molecule.water && ! this.soupObject.atomRef[a].molecule.xna && backboneAtoms.hasOwnProperty(this.soupObject.atomRef[a].atomName))");
      }
      else if (word == "sidechain") {
        new_expr.push("(! this.soupObject.atomRef[a].molecule.ligand && ! this.soupObject.atomRef[a].molecule.water && ! this.soupObject.atomRef[a].molecule.xna && ((this.soupObject.atomRef[a].molecule.name == 'PRO' && this.soupObject.atomRef[a].atomName == 'N') || ! backboneAtoms.hasOwnProperty(this.soupObject.atomRef[a].atomName)))");
      }
      else if (this[word]) new_expr.push("this."+word+".indexOf(this.soupObject.atomRef[a]) != -1");
      else if (key && word) {
        if (toUpper) word = word.toUpperCase();
        else if (toLower) word = word.toLowerCase();
        if (ss) word = ss_conv[word];
        if (word == "=") word = "==";
        key = key.replace("%s", word)
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
    
    else if (expr[i] == "(" || expr[i] == "!") new_expr.push(expr[i]);
    else word += expr[i];
  }
//console.log(new_expr);
  new_expr = new_expr.join(" ");

  //console.log(new_expr);

  var list = [];
  new_expr = "for (var a in this.soupObject.atomRef) if ("+new_expr+") list.push(this.soupObject.atomRef[a]);";
  try{eval(new_expr);}
  catch(e) {(this.console || console).error("Unable to process PyMol command: "+e);}
  
  return list;
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
  if (typeof atoms != "object") {
    if (this.hasOwnProperty(atoms)) atoms = this[atoms];
    //else atoms = molmil.commandLines.pyMol.select(atoms);
    else atoms = molmil.commandLines.pyMol.select.apply(this, [atoms]);
  }
  
  var soup = this.cli_soup, deleted=false;
  
  var idx, a;
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
    
    delete soup.atomRef[atoms[a].AID];
    idx = atoms[a].chain.atoms.indexOf(atoms[a]);
    if (idx != -1) atoms[a].chain.atoms.splice(idx, 1);
    if (atoms[a].chain.atoms.length == 0) {
      idx = atoms[a].chain.entry.chains.indexOf(atoms[a].chain);
      atoms[a].chain.entry.chains.splice(idx, 1);
    }
    
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

  this.cli_soup.renderer.selectFrame(modelId, 0);
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

molmil.commandLines.pyMol.alter = function(atoms, options) {
  if (typeof atoms != "object" && atoms != null) {
    if (this.hasOwnProperty(atoms)) atoms = this[atoms];
    else atoms = molmil.commandLines.pyMol.select.apply(this, [atoms]);
  }

  if (options.b) {
    for (var a=0; a<atoms.length; a++) atoms[a].bfactor = options.b; // maybe in the future change this so that this'll actually execute something...
  }
  
  return true;
}

molmil.commandLines.pyMol.edmap = function(atoms, border) {
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
  
  var sigma = 1.0;
  var solid = false;
  var rgba = this.mesh_color || [0, 255, 255, 255];
  

  var request = new molmil_dep.CallRemote("POST");
  request.AddParameter("xyz", JSON.stringify(XYZ));
  request.AddParameter("border", border*.5);
  request.AddParameter("pdbid", atoms[0].chain.entry.meta.id);
  request.timeout = 0; request.ASYNC = true; request.responseType = "arraybuffer";
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
    var struct = soup.load_ccp4(this.request.response, "???", settings);
    struct.meta.idnr = "#"+(soup.SID++);
  };
  request.Send("https://pdbj.org/rest/edmap2");
}

molmil.commandLines.pyMol.save = function(file, command) {
  command = command.split(","); var selection= "all", state, format=null;
  if (command.length > 1) selection = command[1].trim() || "all";
  if (command.length > 2) state = parseInt(command[2].trim());
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
  
  //var info = molmil.calcCenter(atoms);
  molmil.addLabel(text, {atomSelection: atoms, dz_: 2}, this.cli_soup);
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
    for (i=0; i<atoms.length; i++) hash[atoms[i].molecule.chain.CID] = atoms[i].molecule.chain;
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
  if (typeof atoms != "object") {
    if (this.hasOwnProperty(atoms)) atoms = this[atoms];
    //else atoms = molmil.commandLines.pyMol.select(atoms);
    else atoms = molmil.commandLines.pyMol.select.apply(this, [atoms]);
  }
  
  if (clr == "default") {
    var mols = [];
    for (var i=0; i<atoms.length; i++) mols.push(atoms[i].molecule);
     molmil.colorEntry(mols, 1, null, true);
   }
   else if (clr == "structure") {
     var mols = [];
     for (var i=0; i<atoms.length; i++) mols.push(atoms[i].molecule);
     molmil.colorEntry(mols, 2, null, true);
   }
   else if (clr == "cpk") {
     molmil.colorEntry(atoms, 3, null, true);
   }
   else if (clr == "group") {
     var chains = {};
     for (var i=0; i<atoms.length; i++) chains[atoms[i].chain.CID] = atoms[i].chain;
     molmil.colorEntry(Object.values(chains), 4, null, true);
   }
   else if (clr == "chain") {
     var entries = {};
     for (var i=0; i<atoms.length; i++) entries[JSON.stringify(atoms[i].chain.entry.meta)] = atoms[i].chain.entry;
     molmil.colorEntry(Object.values(entries), molmil.colorEntry_Chain, null, true);
  }
   else if (clr == "chainAlt") {
     var entries = {};
     for (var i=0; i<atoms.length; i++) entries[JSON.stringify(atoms[i].chain.entry.meta)] = atoms[i].chain.entry;
     molmil.colorEntry(Object.values(entries), molmil.colorEntry_ChainAlt, null, true);
  }
  else if (clr == "bfactor") {
    var values = []
    for (var i=0; i<atoms.length; i++) values.push(atoms[i].Bfactor);
    if (molmil.configBox.bfactor_low != undefined) var min = molmil.configBox.bfactor_low;
    else var min = Math.min.apply(null, values);
    if (molmil.configBox.bfactor_high != undefined) var max = molmil.configBox.bfactor_high;
    else var max = Math.max.apply(null, values); 
    var diffInv = 1./(max-min), tmp;
    for (var i=0; i<atoms.length; i++) {
      tmp = 1-((values[i]-min)*diffInv); ///TODO
      atoms[i].rgba = molmil.hslToRgb123(tmp*(2/3), 1.0, 0.5); atoms[i].rgba[0] *= 255; atoms[i].rgba[1] *= 255; atoms[i].rgba[2] *= 255; atoms[i].rgba.push(255);
      if (atoms[i].molecule.CA == atoms[i]) atoms[i].molecule.rgba = atoms[i].rgba;
    }
    this.cli_soup.renderer.rebuildRequired = true;
  }
  else {
    if (typeof clr == "string") {
      var rgba = molmil.color2rgba(clr);
      if (rgba == clr) {
        rgba = JSON.parse(clr);
        if (rgba[0] > 1 || rgba[1] > 1 || rgba[2] > 1 || rgba[3] > 1) rgba = [rgba[0], rgba[1], rgba[2], rgba[3]];
      }
    }
    else var rgba = clr;

    for (var i=0; i<atoms.length; i++) atoms[i].rgba = rgba;

    // in the future upgrade all this so that this is executed after the command buffer is empty...
    this.cli_soup.renderer.rebuildRequired = true;
  }
  
  return true;
}
    
molmil.commandLines.pyMol.set_color = function(name, rgba) {
  if (rgba[0] > 1 || rgba[1] > 1 || rgba[2] > 1 || rgba[3] > 1) rgba = [rgba[0], rgba[1], rgba[2], rgba[3]];
  this.colors[name] = rgba;
}

molmil.commandLines.pyMol.hide = function(repr, atoms, quiet) {
  if (typeof atoms != "object") {
    if (this.hasOwnProperty(atoms)) atoms = this[atoms];
    //else atoms = molmil.commandLines.pyMol.select(atoms);
    else atoms = molmil.commandLines.pyMol.select.apply(this, [atoms]);
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
  else if (repr == "coarse-surface") {
    //for (var i=0; i<atoms.length; i++) atoms[i].molecule.displayMode = atoms[i].chain.displayMode = 0;
    for (var i=0; i<atoms.length; i++) atoms[i].chain.displayMode = 0;
  }
  else if (repr == "sticks") {
    for (var i=0; i<atoms.length; i++) atoms[i].displayMode = 0;
  }
  else if (repr == "solvent") {
    this.cli_soup.waterToggle();
  }

  this.cli_soup.renderer.rebuildRequired = true;
  
  return true;
}

molmil.commandLines.pyMol.turn = function(axis, degrees) {
  console.log(axis, parseFloat(degrees));
  if (axis == "x") this.cli_soup.renderer.camera.pitchAngle += parseFloat(degrees) || 0;
  else if (axis == "y") this.cli_soup.renderer.camera.headingAngle += parseFloat(degrees) || 0;
  else if (axis == "z") this.cli_soup.renderer.camera.rollAngle += parseFloat(degrees) || 0;
  
  this.cli_soup.renderer.camera.positionCamera();
  this.cli_soup.renderer.canvas.update = true;  
  
  return true;
}

molmil.commandLines.pyMol.move = function(axis, degrees) {
  if (axis == "x") this.cli_soup.renderer.camera.x += parseFloat(degrees) || 0;
  if (axis == "y") this.cli_soup.renderer.camera.y += parseFloat(degrees) || 0;
  if (axis == "z") this.cli_soup.renderer.camera.z += parseFloat(degrees) || 0;
  
  this.cli_soup.renderer.canvas.update = true;  
}

molmil.commandLines.pyMol.set = function(key, value, atoms, quiet) {
  if (typeof atoms != "object") {
    if (this.hasOwnProperty(atoms)) atoms = this[atoms];
    //else atoms = molmil.commandLines.pyMol.select(atoms);
    else atoms = molmil.commandLines.pyMol.select.apply(this, [atoms]);
  }
  
  var i;
  if (key == "stick_radius") {
    value = parseFloat(value);
    for (var i=0; i<atoms.length; i++) {
      atoms[i].stickRadius = value;
    }
  }
  else if (key == "depth_cue") {
    molmil.configBox.glsl_fog = value == 1;
    molmil.shaderEngine.recompile(this.cli_soup.renderer);
    this.cli_soup.canvas.update = true;
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
  else if (key == "label_color") {
    var rgba = molmil.color2rgba(value);
    if (rgba == value) {
      rgba = JSON.parse(value);
      if (rgba[0] > 1 || rgba[1] > 1 || rgba[2] > 1 || rgba[3] > 1) rgba = [rgba[0], rgba[1], rgba[2], rgba[3]];
    }
    molmil.defaultSettings_label.color = [rgba[0], rgba[1], rgba[2]];
  }
  else if (key == "label_position") {
    value = value.replace('(', '').replace(')', '').split(",");
    molmil.defaultSettings_label.dx = parseFloat(value[0].trim()); molmil.defaultSettings_label.dy = -parseFloat(value[1].trim()); molmil.defaultSettings_label.dz = parseFloat(value[2].trim());
  }
  else if (key == "label_size") {
    molmil.defaultSettings_label.fontSize = parseFloat(value);
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
  else if (key == "mesh_color") {
    var rgba = molmil.color2rgba(value);
    if (rgba == value) {
      rgba = JSON.parse(value);
      if (rgba[0] > 1 || rgba[1] > 1 || rgba[2] > 1 || rgba[3] > 1) rgba = [rgba[0], rgba[1], rgba[2], rgba[3]];
    }
    this.mesh_color = rgba;
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
  if (atoms === undefined) atoms = Object.values(molmil.cli_soup.atomRef);
  else if (typeof atoms != "object") {
    atoms = atoms.replace(/,/, '').trim();
    if (this.hasOwnProperty(atoms)) atoms = this[atoms];
    //else atoms = molmil.commandLines.pyMol.select(atoms);
    else atoms = molmil.commandLines.pyMol.select.apply(this, [atoms]);
  }
  
  if (repr == "spheres") {
    for (var i=0; i<atoms.length; i++) {
      atoms[i].displayMode = 1;
      atoms[i].chain.entry.display = true;
      if (atoms[i].molecule.CA == atoms[i]) {
        atoms[i].molecule.displayMode = 0;
        atoms[i].molecule.showSC = true;
        atoms[i].molecule.chain.twoDcache = null;
      }
    }
  }
  else if (repr == "ball_stick") {
    for (var i=0; i<atoms.length; i++) {
      atoms[i].displayMode = 2;
      atoms[i].chain.entry.display = true;
      if (atoms[i].molecule.CA == atoms[i]) {
        atoms[i].molecule.displayMode = 0;
        atoms[i].molecule.showSC = true;
        atoms[i].molecule.chain.twoDcache = null;
      }
    }
  }
  else if (repr == "sticks") {
    for (var i=0; i<atoms.length; i++) {
      atoms[i].displayMode = 3;
      atoms[i].chain.entry.display = true;
      if (atoms[i].molecule.CA == atoms[i]) {
        atoms[i].molecule.displayMode = 0;
        atoms[i].molecule.showSC = true;
        atoms[i].molecule.chain.twoDcache = null;
      }
    }
  }
  else if (repr == "lines") {
    for (var i=0; i<atoms.length; i++) {
      atoms[i].displayMode = 4;
      atoms[i].chain.entry.display = true;
      if (atoms[i].molecule.CA == atoms[i]) {
        atoms[i].molecule.displayMode = 0;
        atoms[i].molecule.showSC = true;
        atoms[i].molecule.chain.twoDcache = null;
      }
    }
  }
  else if (repr == "cartoon") {
    for (var i=0; i<atoms.length; i++) {
      atoms[i].displayMode = 0;
      atoms[i].chain.display = atoms[i].chain.entry.display = true;
      if (atoms[i].molecule.CA == atoms[i]) {
        atoms[i].molecule.displayMode = 3;
        atoms[i].molecule.showSC = false;
        atoms[i].molecule.chain.displayMode = 3;
      }
    }
  }
  else if (repr == "coarse-surface") {
    //for (var i=0; i<atoms.length; i++) atoms[i].molecule.displayMode = atoms[i].chain.displayMode = 0;
    for (var i=0; i<atoms.length; i++) {
      atoms[i].chain.entry.display = true;
      atoms[i].chain.displayMode = molmil.displayMode_ChainSurfaceCG;
      atoms[i].chain.displayMode = molmil.displayMode_ChainSurfaceCG;
    }
  }
  else if (repr == "tube") {
    for (var i=0; i<atoms.length; i++) {
      atoms[i].displayMode = 0;
      atoms[i].chain.entry.display = true;
      if (atoms[i].molecule.CA == atoms[i]) {
        atoms[i].molecule.displayMode = 2;
        atoms[i].molecule.showSC = false;
        atoms[i].molecule.chain.displayMode = 2;
      }
    }
  }
  else if (repr == "ca-trace") {
    for (var i=0; i<atoms.length; i++) {
      atoms[i].displayMode = 0;
      atoms[i].chain.entry.display = true;
      if (atoms[i].molecule.CA == atoms[i]) {
        atoms[i].molecule.displayMode = 1;
        atoms[i].molecule.showSC = false;
        atoms[i].molecule.chain.displayMode = 1;
      }
    }
  }
  else if (repr == "visible") {
    for (var i=0; i<atoms.length; i++) {
      atoms[i].chain.entry.display = true;
      atoms[i].display = true;
    }
  }
  else {
    console.error(repr+" is unknown...");
  }
  
  this.cli_soup.renderer.rebuildRequired = true;
}
