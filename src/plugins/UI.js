// ** menu interface **

molmil.UI = function (soup) {
  this.soup = soup;
  this.canvas = soup.canvas;
  this.LM = null;
  this.RM = null;
  this.molSelection = [];
  this.molRef = {};
  // handles the molmil UI functions:
  //  - options menu on the left side (e.g. open, etc)
  //  - structure menu on the right side (tree of structures/chains/residues)
  
  
  // new...
  this.initMenus();
}

molmil.UI.prototype.init=function() {
  var cont, icon;
  cont = document.createElement("span");
  cont.className = "molmil_UI_LB unselectableText";
  this.LM = icon = document.createElement("span");
  icon.className = "molmil_UI_LB_icon";
  icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" id="Layer_1" style="enable-background:new 0 0 32 32;/* background-color: red; */" version="1.1" viewBox="0 0 32 32" xml:space="preserve"><path d="M4,10h24c1.104,0,2-0.896,2-2s-0.896-2-2-2H4C2.896,6,2,6.896,2,8S2.896,10,4,10z M28,14H4c-1.104,0-2,0.896-2,2  s0.896,2,2,2h24c1.104,0,2-0.896,2-2S29.104,14,28,14z M28,22H4c-1.104,0-2,0.896-2,2s0.896,2,2,2h24c1.104,0,2-0.896,2-2  S29.104,22,28,22z" fill="red"/></svg>';
  
  icon.UI = this;
  icon.onclick = function() {
    this.UI.showLM(this);
  };
  cont.appendChild(icon);
  (this.canvas ? this.canvas.parentNode : document.body).appendChild(cont);

  cont = document.createElement("span");
  cont.className = "molmil_UI_RB unselectableText";
  this.RM = icon = document.createElement("div");
  if (molmil.configBox.BGCOLOR[0] == 0 && molmil.configBox.BGCOLOR[1] == 0 && molmil.configBox.BGCOLOR[2] == 0) icon.style.color = "white";
  icon.className = "molmil_UI_RB_icon";
  icon.innerHTML = "&lt;<br/>&lt;<br/>&lt;";
  icon.title = "Structures panel: contains a list of all loaded entries";
  icon.UI = this;
  icon.onclick = function() {
    this.UI.showRM(this);
  };
  cont.appendChild(icon);
  cont.menu = cont.pushNode("div"); cont.menu.style.display = "none";
  cont.menu.className = "molmil_UI_RM";
  (this.canvas ? this.canvas.parentNode : document.body).appendChild(cont);
};

molmil.UI.prototype.deleteEntry=function(entry) {
};

molmil.UI.prototype.displayEntry=function(entry, dm) {
  if (entry.ref) molmil.displayEntry(entry.ref, dm, true, this.soup);
  document.body.onmousedown();
};


molmil.UI.prototype.editLabel=function(settings) {
  var obj=null, text;
  
  var onOK = null;
  
  if (settings instanceof molmil.labelObject) {
    obj = settings;
    settings = obj.settings;
    text = obj.text;
    
    onOK = function(infoBox) {
      var settings = {};
      settings.color = molmil.hex2rgb(infoBox.color.value);
      settings.fontSize = parseFloat(infoBox.fontSize.value);
      settings.dx = parseFloat(infoBox.dx.value) || 0.0; settings.dy = parseFloat(infoBox.dy.value) || 0.0; settings.dz = parseFloat(infoBox.dz.value) || 0.0;
      settings.xyz = infoBox.xyz;
      molmil.addLabel(infoBox.text.value, settings, obj);
    };
  }
  else {
    text = settings.text;
    settings.dx = settings.dx || 0.0; settings.dy = settings.dy || 0.0; settings.dz = settings.dz || 0.0;
    settings.fontSize = settings.fontSize || 20;
    settings.color = settings.color || [0, 255, 0];
    onOK = function(infoBox) {
      var settings = {};
      settings.color = molmil.hex2rgb(infoBox.color.value);
      settings.fontSize = parseFloat(infoBox.fontSize.value);
      settings.dx = parseFloat(infoBox.dx.value) || 0.0; settings.dy = parseFloat(infoBox.dy.value) || 0.0; settings.dz = parseFloat(infoBox.dz.value) || 0.0;
      settings.xyz = infoBox.xyz;
      molmil.addLabel(infoBox.text.value, infoBox.settings, infoBox.soup);
    };
  }
  
  this.popupMenuBuilder("Label", [
    ["Text:", "text", "text", settings.text], 
    ["Color:", "color", "color", settings.color],
    ["Font-size:", "fontSize", "text", settings.fontSize],
    ["Offset-x:", "dx", "text", settings.dx],
    ["Offset-y:", "dy", "text", settings.dy],
    ["Offset-z:", "dz", "text", settings.dz],
    ["", "settings", "hidden", settings],
    ["", "soup", "hidden", this.soup]
  ], onOK);
};

molmil.UI.prototype.showContextMenuAtom=function(x, y, pageX) {
  if (document.body.onmousedown) document.body.onmousedown();
  
  var atoms = this.soup.atomSelection;
  if (! atoms.length) return;

  this.complexMenu.position = [x, y, pageX];
  var title = "";
  if (atoms.length > 1){
    title = this.soup.atomSelection.length+" atoms selected";
  }
  else {
    var atom = atoms[0];
    var sgl = atom.molecule.atoms.length > 1;
    title = (sgl ? atom.atomName : atom.element) + " - " + (sgl ? (atom.molecule.name || "") + " " : "") + (atom.molecule.RSID || "") + (  atom.chain.name ? " - Chain " + atom.chain.name : "") + " - " + atom.chain.entry.meta.idnr;
  }
  this.buildComplexMenu(title, this.contextMenuCanvas, null, atoms);
};

molmil.setOnContextMenu = function (obj, func, lefttoo) {
  obj.oncontextmenu = func;
  if (lefttoo) obj.onclick = func;

  obj.addEventListener("touchstart", molmil.handle_contextMenu_touchStart, false);
  obj.addEventListener("touchend", molmil.handle_contextMenu_touchEnd, false);
}

molmil.UI.prototype.showRM=function(icon, reset) {
  var menu = icon.parentNode.menu;
  molmil_dep.Clear(menu);menu.innerHTML = "";
  if (menu.style.display == "none" || reset) {
    icon.innerHTML = "&gt;<br/>&gt;<br/>&gt;";
    menu.style.maxHeight = ((this.canvas ? this.canvas : document.body)-32)+"px";
    menu.style.display = "";
  }
  else {
    icon.innerHTML = "&lt;<br/>&lt;<br/>&lt;";
    menu.style.display = "none";
  }
  
  var files = this.canvas ? this.canvas.molmilViewer.structures : [];

  if (menu.childNodes.length > 0) {
    if (files.length == menu.nof) return;
  }
  
  menu.nof = files.length;
  menu.pushNode("span", "Structures:").className = "optCat_k";
  var options = menu.pushNode("span", "&#9964;"); options.UI = this;
  molmil.setOnContextMenu(options, function(e) {
    this.UI.complexMenu.position = [e.clientX, e.clientY, e.pageX];
    this.UI.buildComplexMenu("Options", this.UI.contextMenuStructuresMenu, null, this.UI.soup);
    return false;
  }, true);
  menu.pushNode("hr");
  var model, item, file;
  for (var i=0; i<files.length; i++) {
    file = files[i];
    if (file instanceof molmil.entryObject) {
      item = menu.pushNode("div");
      item.plus = item.pushNode("a", "+");
      item.plus.className = "optCat_p";
      item.name = item.pushNode("a", file.meta.id + " ("+file.meta.idnr+")");
      item.name.title = "Left click to expand\nRight click to show the context menu for display & color options";
      item.name.className = "optCat_n";
      item.style.color = file.display ? "" : "lightgrey"
      item.plus.onclick = item.name.onclick = function(ev) {
        if (ev.ctrlKey) {
          if (this.parentNode.payload[0].display) {
            molmil.displayEntry(this.parentNode.payload, molmil.displayMode_None, true, this.UI.soup);
            this.parentNode.style.color = "lightgrey";
          }
          else {
            molmil.displayEntry(this.parentNode.payload, molmil.displayMode_Visible, true, this.UI.soup);
            this.parentNode.style.color = "";
          }
        }
        else molmil_dep.expandCatTree.apply(this, []);
      }
      item.name.UI = item.UI = this;
      molmil.setOnContextMenu(item.name, function(e) {
        this.UI.complexMenu.position = [e.clientX, e.clientY, e.pageX];
        this.UI.buildComplexMenu(this.parentNode.payload[0].meta.id, this.UI.contextMenuStructuresEntry, null, this.parentNode.payload);
        return false;
      });
      
      item.name.mtype = 1;
      item.payload = item.name.ref = [file];
      item.expandFunc = this.showChains;
    }
    else {
      item = menu.pushNode("div", file.meta.filename + (file.meta.idnr ? " ("+file.meta.idnr+")" : ""));
      
      item.className = "optCat_n";
      item.style.marginLeft = "1.25em";
      item.UI = this;
      molmil.setOnContextMenu(item, function(e) {
        this.UI.complexMenu.position = [e.clientX, e.clientY, e.pageX];
        this.UI.buildComplexMenu(this.ref[0].meta.id, this.ref[0].meta.mode == "general" ? this.UI.contextMenuVRML : this.UI.contextMenuIsosurfaceEntry, null, this.ref);
        return false;
      }); // TODO
      item.mtype = 10;
      item.ref = [file];
    }
  }
  
  menu.pushNode("hr");
  menu.pushNode("span", "Labels:").className = "optCat_k";;
  menu.pushNode("hr");
  
  var labels = this.canvas ? this.canvas.molmilViewer.texturedBillBoards : [];
  for (var i=0; i<labels.length; i++) {
    item = menu.pushNode("div", labels[i].text);
    item.className = "optCat_n";
    item.style.marginLeft = "1.25em";
    item.UI = this; item.label = labels[i];
    molmil.setOnContextMenu(item, function(e) {
      this.UI.complexMenu.position = [e.clientX, e.clientY, e.pageX];
      this.UI.buildComplexMenu(this.innerHTML, this.UI.contextMenuLabel, null, this.label);
      return false;
    });
  }
};

molmil.UI.prototype.showChains=function(target, payload) {
  var chain, item;
  target.pushNode("span", "Chains:").className = "optCat_k";
  target.pushNode("hr");
  payload = payload instanceof Array ? payload[0] : payload;
  for (var i=0; i<payload.chains.length; i++) {
    chain = payload.chains[i];
    item = target.pushNode("div");
    item.plus = item.pushNode("a", "+");
    item.plus.className = "optCat_p";
    var saa = chain.name ? chain.name : i+1;
    if (chain.authName != saa) saa += " ("+chain.authName+")";
    item.name = item.pushNode("a", saa);
    item.name.title = "Left click to expand\nRight click to show the context menu for display & color options";
    item.name.className = "optCat_n";
    if (chain.display) item.style.color = "";
    item.style.color = chain.display ? "" : "lightgrey"
    item.plus.onclick = item.name.onclick = function(ev) {
      if (ev.ctrlKey) {
        if (this.parentNode.payload.display) {
          molmil.displayEntry(this.parentNode.payload, molmil.displayMode_None, true, this.UI.soup);
          this.parentNode.style.color = "lightgrey";
        }
        else {
          molmil.displayEntry(this.parentNode.payload, molmil.displayMode_Visible, true, this.UI.soup);
          this.parentNode.style.color = "";
        }
      }
      else molmil_dep.expandCatTree.apply(this, []);
    }
    item.payload = chain;
    item.name.UI = item.UI = this.UI;
    item.expandFunc = this.UI.showResidues;
    molmil.setOnContextMenu(item.name, function(e) {
      this.UI.complexMenu.position = [e.clientX, e.clientY, e.pageX];
      this.UI.buildComplexMenu(this.parentNode.payload, this.UI.contextMenuStructuresChain, null, this.parentNode.payload);
      return false;
    });
    item.name.mtype = 2;
    item.name.ref = [chain];
  }
  target.pushNode("hr");
};


molmil.UI.prototype.showResidues=function(target, payload) {
  target.pushNode("span", "Residues/Ligands:").className = "optCat_k";;
  target.pushNode("hr");
  var mol, item;
  payload = payload instanceof Array ? payload[0] : payload;
  for (var i=0; i<payload.molecules.length; i++) {
    mol = payload.molecules[i];
    item = target.pushNode("div", mol.name+(mol.RSID ? " ("+mol.RSID+")" : ""));
    item.title = "Double click to jump to residue\nRight click to show the context menu for display & color options";
    item.className = "optCat_n";
    item.payload = mol; item.UI = this.UI;
    if (this.UI.molSelection.indexOf(mol) != -1) item.style.fontWeight = "bold";
    this.UI.molRef[mol.MID] = item;
    molmil.setOnContextMenu(item, function(e) {
      this.onclick(e, true);
      this.UI.complexMenu.position = [e.clientX, e.clientY, e.pageX];
      this.UI.buildComplexMenu(this.payload, this.UI.contextMenuStructuresResidue, null, this.UI.molSelection);
      return false;
    });
    item.mtype = 3;
    item.ref = [mol];
    item.ondblclick = function() {
      this.UI.canvas.molmilViewer.gotoMol(this.payload);
    };
    item.onclick = function(e, passThrough) {
      if (e.detail > 1) return;
      if (passThrough && this.UI.molSelection.indexOf(this.payload) != -1) return;
      if (e.altKey) {
        var idx = this.UI.canvas.molmilViewer.atomSelection.indexOf(this.payload.CA || this.payload.atoms[0]);
        if (idx == -1) this.UI.canvas.molmilViewer.atomSelection.push(this.payload.CA || this.payload.atoms[0]);
        else this.UI.canvas.molmilViewer.atomSelection.splice(idx, 1);
        
        var idx = this.UI.molSelection.indexOf(this.payload);
        if (idx == -1) {this.UI.molSelection.push(this.payload); this.style.fontWeight = "bold";}
        else {this.UI.molSelection.splice(idx, 1); this.style.fontWeight = "";}
      }
      else if (e.shiftKey) { // check 
        if (this.UI.molSelection.length) {
          // figure out all the residues in between and mark those...
          var lastMID = this.UI.molSelection[this.UI.molSelection.length-1].MID
          var currMID = this.payload.MID;
          if (lastMID > currMID) {var tmp = lastMID; lastMID = currMID; currMID = tmp;}
          var i, tmp;
          for (i=lastMID; i<=currMID; i++) {
            tmp = this.UI.molRef[i];
            if (! tmp || this.UI.molSelection.indexOf(tmp.payload) != -1) continue;
            this.UI.molSelection.push(tmp.payload); 
            tmp.style.fontWeight = "bold";
          }
        }
        else {this.UI.molSelection = [this.payload]; this.style.fontWeight = "bold";}
      }
      else {
        if (this.UI.molSelection.length == 1 && this.UI.molSelection[0] == this.payload) {
          this.UI.molSelection = [];
          this.style.fontWeight = "";
          this.UI.canvas.molmilViewer.atomSelection = [];
        }
        else {
          this.UI.canvas.molmilViewer.atomSelection = [this.payload.CA || this.payload.atoms[0]];
          for (var i=0; i<this.UI.molSelection.length; i++) this.UI.molRef[this.UI.molSelection[i].MID].style.fontWeight = "";
          this.UI.molSelection = [this.payload];
          this.style.fontWeight = "bold";
        }
      }
      this.UI.canvas.renderer.updateSelection();
      this.UI.canvas.update = true;
    };
  }
  target.pushNode("hr");
};


// add a new File IO handler, because the current list is getting too long (and it still doesn't include everything...)

//molmil.UI.prototype.

molmil.UI.prototype.showLM=function(icon) {
  try {if (icon.parentNode.childNodes.length > 1) {icon.parentNode.removeChild(icon.nextSibling); icon.parentNode.removeChild(icon.nextSibling); return;}}
  catch (e) {}
  
  var menu = document.createElement("div"), e;
  menu.className = "molmil_UI_LM";

  e = menu.appendChild(document.createElement("div")); e.menu = menu; e.UI = this;
  e.className = "molmil_UI_ME";
  e.innerHTML = "Open >";
  e.title = "Open files or entries";
  e.onclick = function() {
    molmil_dep.Clear(this.menu.sub);
    var e;
    this.menu.sub.style.display = "";
    if (! molmil_dep.dBT.ios_version) {
      e = this.menu.sub.pushNode("div", "mmCIF file", "molmil_UI_ME");
      e.UI = this.UI;
      e.onclick = function() {this.UI.open("mmCIF", 2);};
      e = this.menu.sub.pushNode("div", "PDBML file", "molmil_UI_ME");
      e.UI = this.UI;
      e.onclick = function() {this.UI.open("PDBML", 3);};
      e = this.menu.sub.pushNode("div", "mmJSON file", "molmil_UI_ME");
      e.UI = this.UI;
      e.onclick = function() {this.UI.open("mmJSON", 1);};
      e = this.menu.sub.pushNode("div", "PDB (flat) file", "molmil_UI_ME");
      e.UI = this.UI;
      e.onclick = function() {this.UI.open("PDB", 4);};
      e = this.menu.sub.pushNode("div", "GRO file", "molmil_UI_ME");
      e.UI = this.UI;
      e.onclick = function() {this.UI.open("GRO", 7);};
      e = this.menu.sub.pushNode("div", "CCP4 file", "molmil_UI_ME");
      e.UI = this.UI;
      e.onclick = function() {this.UI.open("CCP4", "ccp4", null, null, true);};
      e = this.menu.sub.pushNode("div", "MDL mol file", "molmil_UI_ME");
      e.UI = this.UI;
      e.onclick = function() {this.UI.open("MDL mol", "mdl");};
      e = this.menu.sub.pushNode("div", "Mol2 file", "molmil_UI_ME");
      e.UI = this.UI;
      e.onclick = function() {this.UI.open("Mol2", "mol2");};
      e = this.menu.sub.pushNode("div", "Polygon XML file", "molmil_UI_ME");
      e.UI = this.UI;
      e.onclick = function() {this.UI.open("Polygon XML file", 5);};
      e = this.menu.sub.pushNode("div", "Polygon JSON file", "molmil_UI_ME");
      e.UI = this.UI;
      e.onclick = function() {this.UI.open("Polygon JSON file", 6);};

      this.menu.sub.pushNode("hr");
    }

    e = this.menu.sub.pushNode("div", "PDB (PDBj)", "molmil_UI_ME");
    e.UI = this.UI;
    e.onclick = function() {this.UI.openID(1);};
    e = this.menu.sub.pushNode("div", "PDB chem_comp (PDBj)", "molmil_UI_ME");
    e.UI = this.UI;
    e.onclick = function() {this.UI.openID(2);};
    
    e = this.menu.sub.pushNode("div", "Promode Elastic (PDBj)", "molmil_UI_ME");
    e.UI = this.UI;
    e.onclick = function() {this.UI.openPMEID();};
    
  };

  e = menu.appendChild(document.createElement("div")); e.menu = menu; e.UI = this;
  e.className = "molmil_UI_ME";
  e.innerHTML = "Save >";
  e.onclick = function() {
    molmil_dep.Clear(this.menu.sub);
    var e;
    this.menu.sub.style.display = "";
    e = this.menu.sub.pushNode("div", "PNG image", "molmil_UI_ME");
    e.UI = this.UI;
    e.onclick = function() {this.UI.savePNG();};
    
    e = this.menu.sub.pushNode("div", "MP4 video", "molmil_UI_ME");
    e.UI = this.UI;
    e.onclick = function() {molmil.initVideo(this.UI);};

    e = this.menu.sub.pushNode("div", "PLY polygon file", "molmil_UI_ME");
    e.UI = this.UI;
    e.onclick = function() {molmil.exportPLY(this.UI.soup);};
    
    e = this.menu.sub.pushNode("div", "STL polygon file", "molmil_UI_ME");
    e.UI = this.UI;
    e.onclick = function() {molmil.exportSTL(this.UI.soup);};
    
    e = this.menu.sub.pushNode("div", "MPBF polygon file", "molmil_UI_ME");
    e.UI = this.UI;
    e.onclick = function() {molmil.exportMPBF(this.UI.soup);};
  };
  
  
  menu.pushNode("hr");
  
  e = menu.appendChild(document.createElement("div")); e.UI = this; e.LM = icon;
  e.className = "molmil_UI_ME";
  e.innerHTML = "Settings";
  e.title = "Opens Molmil's advanced settings panel";
  e.onclick = function() {this.LM.onclick(); this.UI.settings();};
  
  e = menu.appendChild(document.createElement("div")); e.UI = this; e.LM = icon;
  e.className = "molmil_UI_ME";
  e.innerHTML = "View >";
  e.title = "View options";
  e.onclick = function() {this.UI.view(menu.sub);};
  
  
  var number_of_frames = this.soup.structures.length ? this.soup.structures[0].number_of_frames : 0;
  
  if (number_of_frames > 1) {
    e = menu.appendChild(document.createElement("div")); e.menu = menu; e.UI = this;
    e.className = "molmil_UI_ME";
    e.innerHTML = "Animation";
    e.canvas = this.canvas; e.LM = icon;
    e.title = "Displays Animation panel, useful for exploring multiple models or playing MD trajectories";
    e.onclick = function() {
      this.UI.animationPopUp();
      this.LM.onclick();
    };
    menu.pushNode("hr");
  }
  
  if (! molmil_dep.dBT.ios_version) {
    e = menu.pushNode("div");
    e.className = "molmil_UI_ME";
    e.innerHTML = "Enable full-screen";
    e.canvas = this.canvas; e.LM = icon;
    e.title = "Enables full screen mode";
    e.onclick = function() {
      var cc = this.canvas.parentNode;
      var rfs = cc.requestFullScreen || cc.webkitRequestFullScreen || cc.mozRequestFullScreen || cc.msRequestFullscreen || null;
      if (rfs) rfs.call(cc);
      this.LM.onclick();
    };
  }

  if (molmil.vrDisplays && molmil.vrDisplays.length) {
    e = menu.pushNode("div");
    e.className = "molmil_UI_ME";
    e.innerHTML = "Enable WebVR";
    e.canvas = this.canvas; e.LM = icon;
    e.title = "Enables Virtual Reality mode";
    e.onclick = function() {
      molmil.initVR(this.canvas.molmilViewer);
      this.LM.onclick();
    };
  }

  e = menu.appendChild(document.createElement("div")); e.UI = this;
  e.className = "molmil_UI_ME";
  e.innerHTML = "Toggle CLI";
  e.title = "Toggles between displaying and hiding the Command Line Interface";
  e.onclick = function() {this.UI.toggleCLI();};
  
  e = menu.appendChild(document.createElement("div")); e.UI = this;
  e.className = "molmil_UI_ME";
  e.innerHTML = "Clear";
  e.title = "Removes all loaded entries from this canvas";
  e.onclick = function() {this.UI.clear();};
  
  menu.pushNode("hr");
  
  e = menu.appendChild(document.createElement("div")); e.UI = this;
  e.className = "molmil_UI_ME";
  e.innerHTML = "Help"; e.LM = icon;
  e.onclick = function() {window.open("https://github.com/gjbekker/molmil/wiki"); this.LM.onclick();};
  
  e = menu.appendChild(document.createElement("div")); e.UI = this;
  e.className = "molmil_UI_ME";
  e.innerHTML = "Manual"; e.LM = icon;
  e.onclick = function() {window.open(molmil.settings.src+"manual.html"); this.LM.onclick();};

  icon.parentNode.appendChild(menu);
  menu.sub = icon.parentNode.appendChild(document.createElement("div"));
  menu.sub.className = "molmil_UI_LM";
  menu.sub.style.display = "none";
};

molmil.UI.prototype.view=function(sub) {
  molmil_dep.Clear(sub);
  var e;
  sub.style.display = "";
  e = sub.pushNode("div", "Reset zoom", "molmil_UI_ME");
  e.UI = this;
  e.onclick = function() {
    if (this.UI.LM && this.UI.LM.parentNode.childNodes.length > 1) this.UI.LM.onclick();
    this.UI.soup.renderer.camera.z = this.UI.soup.calcZ();
    this.UI.soup.canvas.update = true;
  };
  
  e = sub.pushNode("div", "Configure slab", "molmil_UI_ME");
  e.UI = this;
  e.onclick = function() {this.UI.configureSlab.apply(this.UI);};
  
  if (! this.soup.AisB) {
    e = sub.pushNode("div", "Configure BU", "molmil_UI_ME");
    e.UI = this;
    e.onclick = function() {this.UI.configureBU.apply(this.UI);};
  }
}

molmil.UI.prototype.configureBU = function(target) {
  if (this.LM && this.LM.parentNode.childNodes.length > 1) this.LM.onclick();

  var assembly = this.soup.infoBag.BU_assembly || -1; // make this configurable...
  var rm = this.soup.infoBag.BU_rm || [3, 2]; // make this configurable...
  
  var popup = molmil_dep.dcE("div");
  popup.setClass("molmil_menu_popup");
  
  popup.pushNode("div", "Biological Unit configuration");
  popup.pushNode("hr");
  
  var table = popup.pushNode("table"), tr, td;
  var US, BUrm;
  
  tr = table.pushNode("tr");
  td = tr.pushNode("td", "Unit selection:");
  
  US = tr.pushNode("td").pushNode("select");
  
  
  var soup = this.soup;
  var noc = 0, i, c, tmp;
  for (c=0; c<soup.chains.length; c++) {if (soup.poly_asym_ids.indexOf(soup.chains[c].name) != -1) noc++;}

  td = US.pushNode("option", "Asymmetric unit (%NOC)".replace("%NOC", noc)); td.value = -1;
  
  var assembly_id = -1;
  if (Object.keys(soup.BUmatrices).length > 1 || Object.keys(soup.BUassemblies).length > 1) {
    for (var e in soup.BUassemblies) {
      noc = 0;
      for (i=0; i<soup.BUassemblies[e].length; i++) {
        tmp = 0;
        for (c=0; c<soup.BUassemblies[e][i][1].length; c++) {if (soup.poly_asym_ids.indexOf(soup.BUassemblies[e][i][1][c]) != -1) tmp++;}
        noc += tmp*soup.BUassemblies[e][i][0].length;
      }

      td = US.pushNode("option", "Biological unit %N (%NOC)".replace("%NOC", noc).replace("%N", e)); td.value = e;
    }
    if (assembly && (assembly == -1 || soup.BUassemblies.hasOwnProperty(assembly))) assembly_id = assembly;
    else {
      assembly = figureOutAssemblyId(soup.pdbxData, soup.BUassemblies);
      if (soup.BUassemblies.hasOwnProperty(assembly)) assembly_id = assembly;
    }
  }
  
  US.value = assembly_id;
  
  tr = table.pushNode("tr");
  td = tr.pushNode("td", "Unit repr.:");
  
  BUrm = tr.pushNode("td").pushNode("select");
  
  td = BUrm.pushNode("option", "Only backbone, colored by CPK"); td.value = [1, 1];
  td = BUrm.pushNode("option", "Only backbone, colored by each asymmetric chain"); td.value = [1, 2];
  td = BUrm.pushNode("option", "Only backbone, colored by each chain"); td.value = [1, 3];
  td = BUrm.pushNode("option", "Only alpha carbon and phosphorus, colored by CPK"); td.value = [2, 1];
  td = BUrm.pushNode("option", "Only alpha carbon and phosphorus, colored by each asymmetric chain"); td.value = [2, 2];
  td = BUrm.pushNode("option", "Only alpha carbon and phosphorus, colored by each chain"); td.value = [2, 3];
  
  
  td = BUrm.pushNode("option", "Tube, colored by each asymmetric chain"); td.value = [3, 2];
  td = BUrm.pushNode("option", "Tube, colored by each chain"); td.value = [3, 3];
  td = BUrm.pushNode("option", "Tube, colored by secondary structure"); td.value = [3, 4];
  td = BUrm.pushNode("option", "Cartoon, colored by each asymmetric chain"); td.value = [4, 2];
  td = BUrm.pushNode("option", "Cartoon, colored by each chain"); td.value = [4, 3];
  td = BUrm.pushNode("option", "Cartoon, colored by secondary structure"); td.value = [4, 4];
  td = BUrm.pushNode("option", "Rocket, colored by each asymmetric chain"); td.value = [6, 2];
  td = BUrm.pushNode("option", "Rocket, colored by each chain"); td.value = [6, 3];
  td = BUrm.pushNode("option", "Rocket, colored by secondary structure"); td.value = [6, 4];
  
  td = BUrm.pushNode("option", "Coarse surface, colored by each asymmetric chain"); td.value = [5, 2];
  td = BUrm.pushNode("option", "Coarse surface, colored by each chain"); td.value = [5, 3];
  
  BUrm.value = rm;
  
  US.soup = BUrm.soup = soup;
  
  US.oninput = BUrm.oninput = function() {
    var tmp = BUrm.value.split(",");
    this.soup.infoBag.BU_assembly = US.value;
    this.soup.infoBag.BU_rm = [parseInt(tmp[0]), parseInt(tmp[1])];
    
    molmil.toggleBU(this.soup.infoBag.BU_assembly, this.soup.infoBag.BU_rm[0], this.soup.infoBag.BU_rm[1], null, this.soup);
  }
  
  var closeButton = popup.pushNode("button", "Close");
  closeButton.style.marginLeft = "1em";
  closeButton.onclick = function() {popup.parentNode.removeChild(popup);};
  
  if (target) target.pushNode(popup);
  else this.LM.parentNode.pushNode(popup);
}

molmil.UI.prototype.configureSlab=function(target) {
  if (this.LM && this.LM.parentNode.childNodes.length > 1) this.LM.onclick();
  
  var popup = molmil_dep.dcE("div");
  popup.setClass("molmil_menu_popup");
  
  popup.pushNode("div", "Slab configuration");
  popup.pushNode("hr");
  
  
  var table = popup.pushNode("table"), tr, td;
  var slab_near, slab_far
  tr = table.pushNode("tr");
  tr.pushNode("td", "Slab near:");
  slab_near = tr.pushNode("td").pushNode("input");
  slab_near.type = "range";
  td = tr.pushNode("td", "0"); td.style.minWidth = "4em"; td.style.textAlign = "right";
  
  tr = table.pushNode("tr");
  tr.pushNode("td", "Slab far:");
  slab_far = tr.pushNode("td").pushNode("input");
  slab_far.type = "range";
  td = tr.pushNode("td", "0"); td.style.minWidth = "4em"; td.style.textAlign = "right";
  
  slab_near.oninput = function() { // handle modification of the slab-near slider
    this.parentNode.nextSibling.innerHTML = Math.round(parseFloat(this.value)*10)/10;
    if (parseFloat(slab_far.value) <= parseFloat(this.value)) {
      slab_far.value = parseFloat(this.value)+1;
      slab_far.oninput();
    }
    else molmil.setSlab(parseFloat(slab_near.value), parseFloat(slab_far.value), canvas.molmilViewer); // sets the slab values
  };
  
  slab_far.oninput = function() { // handle modification of the slab-far slider
    this.parentNode.nextSibling.innerHTML = Math.round(parseFloat(this.value)*10)/10;
    if (parseFloat(slab_near.value) >= parseFloat(this.value)) {
      slab_near.value = parseFloat(this.value)-1;
      slab_near.oninput();
    }
    else molmil.setSlab(parseFloat(slab_near.value), parseFloat(slab_far.value), canvas.molmilViewer); // sets the slab values
  };

  var szI = Math.min(this.soup.geomRanges[0], this.soup.geomRanges[2], this.soup.geomRanges[4]) + molmil.configBox.zNear;
  var szA = Math.max(this.soup.geomRanges[1], this.soup.geomRanges[3], this.soup.geomRanges[5]) + molmil.configBox.zNear;

  if (szI > szA - 1) szA = szI + 1;
 
  slab_near.min = slab_far.min = szI;
  slab_near.max = slab_far.max = szA;
  
  slab_near.step = slab_far.step = .1;
  
  slab_near.value = this.soup.renderer.settings.slabNear || szI;
  slab_far.value = this.soup.renderer.settings.slabFar || szA

  slab_near.oninput();
  slab_far.oninput();
  
  
  var closeButton = popup.pushNode("button", "Close");
  closeButton.style.marginLeft = "1em";
  closeButton.onclick = function() {popup.parentNode.removeChild(popup);};
  
  if (target) target.pushNode(popup);
  else this.LM.parentNode.pushNode(popup);
  
}

molmil.UI.prototype.settings=function() {
  
  var popup = molmil_dep.dcE("div");
  popup.setClass("molmil_menu_popup");
  
  popup.pushNode("div", "Settings");
  popup.pushNode("hr");
  
  var saveButton = molmil_dep.dcE("button"), tmp;

  saveButton.qlv = molmil_dep.dcE("input");
  saveButton.qlv.type = "range"; saveButton.qlv.min = "0"; saveButton.qlv.max = "4"; saveButton.qlv.step = "1";
  saveButton.qlv.value = localStorage.getItem("molmil.settings_QLV");
  saveButton.qlv.ref = molmil_dep.dcE("span"); saveButton.qlv.ref.innerHTML = saveButton.qlv.value;
  saveButton.qlv.onmousemove = function() {this.ref.innerHTML = this.value;};
  
  saveButton.bbsf = molmil_dep.dcE("input");
  saveButton.bbsf.value = molmil.configBox.smoothFactor;
  
  saveButton.fog = molmil_dep.dcE("input");
  saveButton.fog.type = "checkbox";
  saveButton.fog.checked = localStorage.getItem("molmil.settings_glsl_fog") == 1;
  
  saveButton.projectionMode = molmil_dep.dcE("select");
  tmp = saveButton.projectionMode.pushNode("option", "Perspective projection"); tmp.value = 1;
  tmp = saveButton.projectionMode.pushNode("option", "Orthographic projection"); tmp.value = 2;
  if (molmil.configBox.projectionMode == 2) tmp.selected = true;
  
  saveButton.stereoMode = molmil_dep.dcE("select");
  tmp = saveButton.stereoMode.pushNode("option", "None"); tmp.value = 0;
  tmp = saveButton.stereoMode.pushNode("option", "Anaglyph"); tmp.value = 1;
  if (molmil.configBox.stereoMode == 1) tmp.selected = true;
  tmp = saveButton.stereoMode.pushNode("option", "Side-by-side"); tmp.value = 2;
  if (molmil.configBox.stereoMode == 2) tmp.selected = true;
  tmp = saveButton.stereoMode.pushNode("option", "Cross-eyed"); tmp.value = 4;
  if (molmil.configBox.stereoMode == 4) tmp.selected = true;
  
  saveButton.colorMode = molmil_dep.dcE("select");
  tmp = saveButton.colorMode.pushNode("option", "Rasmol"); tmp.value = 1;
  tmp = saveButton.colorMode.pushNode("option", "Jmol"); tmp.value = 2; if (localStorage.getItem("molmil.settings_COLORS") == 2) tmp.selected = true;
  tmp = saveButton.colorMode.pushNode("option", "Basic"); tmp.value = 3; if (localStorage.getItem("molmil.settings_COLORS") == 3) tmp.selected = true;
  
  saveButton.bgcolor = molmil_dep.dcE("span");
  saveButton.bgcolor.pushNode("span", "R: ");
  saveButton.bgcolor.R = saveButton.bgcolor.pushNode("input");
  saveButton.bgcolor.pushNode("span", " G: ");
  saveButton.bgcolor.G = saveButton.bgcolor.pushNode("input");
  saveButton.bgcolor.pushNode("span", " B: ");
  saveButton.bgcolor.B = saveButton.bgcolor.pushNode("input");
  saveButton.bgcolor.pushNode("span", " A: ");
  saveButton.bgcolor.A = saveButton.bgcolor.pushNode("input");
  saveButton.bgcolor.R.style.width = saveButton.bgcolor.G.style.width = saveButton.bgcolor.B.style.width = saveButton.bgcolor.A.style.width = "2.5em";
  saveButton.bgcolor.R.value = Math.round(molmil.configBox.BGCOLOR[0]*255); saveButton.bgcolor.G.value = Math.round(molmil.configBox.BGCOLOR[1]*255); saveButton.bgcolor.B.value = Math.round(molmil.configBox.BGCOLOR[2]*255); saveButton.bgcolor.A.value = Math.round(molmil.configBox.BGCOLOR[3]*255);

  var tbl = popup.pushNode("table"), tr, tmp;
  tr = tbl.pushNode("tr");
  tr.pushNode("td", "Quality:");
  tmp = molmil_dep.dcE("div");
  tmp.pushNode(saveButton.qlv);
  tmp.pushNode(saveButton.qlv.ref);
  tr.pushNode("td").pushNode(tmp);
  
  
  tr = tbl.pushNode("tr");
  tr.pushNode("td", "Sheet/loop backbone smooth factor:");
  tmp = molmil_dep.dcE("div");
  tmp.pushNode(saveButton.bbsf);
  tr.pushNode("td").pushNode(tmp);
  
  tr = tbl.pushNode("tr");
  tr.pushNode("td", "Fog:");
  tmp = molmil_dep.dcE("div");
  tmp.pushNode(saveButton.fog);
  tr.pushNode("td").pushNode(tmp);
  
  tr = tbl.pushNode("tr");
  tr.pushNode("td", "Projection mode:");
  tr.pushNode("td").pushNode(saveButton.projectionMode);
  
  tr = tbl.pushNode("tr");
  tr.pushNode("td", "Stereoscopy:");
  tr.pushNode("td").pushNode(saveButton.stereoMode);
  
  tr = tbl.pushNode("tr");
  tr.pushNode("td", "Color scheme*:");
  tr.pushNode("td").pushNode(saveButton.colorMode);
  tr.title = "Atom (CPK) colors need to be manually re-applied to become effective";
  
  tr = tbl.pushNode("tr");
  tr.pushNode("td", "BG color:");
  tr.pushNode("td").pushNode(saveButton.bgcolor);
  
  popup.pushNode("hr");
  
  saveButton.innerHTML = "Apply";
  saveButton.UI = this; saveButton.popup = popup;
  saveButton.onclick = function() {
    // save settings
    localStorage.setItem("molmil.settings_QLV", this.qlv.value);
    localStorage.setItem("molmil.settings_glsl_fog", (molmil.configBox.glsl_fog=this.fog.checked) ? "1" : "0");
    localStorage.setItem("molmil.settings_PROJECTION", this.projectionMode.value);
    localStorage.setItem("molmil.settings_STEREO", this.stereoMode.value);
    localStorage.setItem("molmil.settings_COLORS", this.colorMode.value);
    localStorage.setItem("molmil.settings_BGCOLOR", JSON.stringify([parseFloat(this.bgcolor.R.value)/255, parseFloat(this.bgcolor.G.value)/255, parseFloat(this.bgcolor.B.value)/255, parseFloat(this.bgcolor.A.value)/255]));
    localStorage.setItem("molmil.settings_BBSF", this.bbsf.value);
    
    // reload settings
    molmil.initSettings();
    this.UI.soup.reloadSettings();
    molmil.configBox.projectionMode = this.projectionMode.value; molmil.configBox.stereoMode = parseInt(this.stereoMode.value); this.UI.soup.renderer.resizeViewPort();
    molmil.shaderEngine.recompile(this.UI.soup.renderer);
    //this.UI.soup.renderer.initShaders(molmil.configBox.glsl_shaders);
    
    // re-render
    this.UI.soup.renderer.initBuffers();
    this.UI.soup.canvas.update = true;
    
    // close
    this.popup.parentNode.removeChild(this.popup);
  };
  
  popup.pushNode(saveButton);
  
  var cancelButton = popup.pushNode("button", "Cancel");
  cancelButton.style.marginLeft = "1em";
  cancelButton.onclick = function() {popup.parentNode.removeChild(popup);};
  
  this.LM.parentNode.pushNode(popup);
  
};

molmil.UI.prototype.toggleWaters=function(show) {
  this.soup.waterToggle(show);
  this.soup.renderer.initBuffers();
  this.soup.canvas.update = true;
  document.body.onmousedown();
};

molmil.UI.prototype.toggleHydrogens=function(show) {
  this.soup.hydrogenToggle(show);
  this.soup.renderer.initBuffers();
  this.soup.canvas.update = true;
  document.body.onmousedown();
};

molmil.UI.prototype.animationPopUp=function() {

  var popup = molmil_dep.dcE("div");
  popup.setClass("molmil_menu_popup");
  
  popup.pushNode("div", "Animation controls");
  popup.pushNode("hr");
  
  this.soup.animation.initialise(popup);

  if (this.soup.frameInfo) {
    var slider = popup.pushNode("input");
    slider.type = "range";
    slider.value = this.soup.animation.frameNo;
    slider.min = 0;
    slider.max = this.soup.frameInfo.length-1;
    slider.soup = this.soup;
    slider.oninput = function(e) {this.soup.animation.go2Frame(parseInt(this.value));};
    popup.sliderBox = slider;

    var timeBox = popup.pushNode("span", this.soup.frameInfo[0][1].toFixed(1)+"ps");
    popup.timeBox = timeBox;
  }
  else {
    var slider = popup.pushNode("input");
    slider.type = "range";
    slider.value = this.soup.animation.frameNo;
    slider.min = 0;
    slider.max = this.soup.chains[0].modelsXYZ.length-1;
    slider.soup = this.soup;
    slider.oninput = function(e) {this.soup.animation.go2Frame(parseInt(this.value));};
    popup.sliderBox = slider;

    var timeBox = popup.pushNode("span", "0");
    popup.timeBox = timeBox;
  }
  this.soup.animation.updateInfoBox();
  
  popup.pushNode("br");
  
  popup.pushNode("span", "Motion:");
  
  label = popup.pushNode("label");
  inp = label.pushNode("input"); inp.type = "radio"; inp.name = "motion"; if (this.soup.animation.motionMode == 1) inp.checked = true;
  label.pushNode("span", "Forward");
  label.AI = this.soup.animation;
  label.onclick = function() {this.AI.motionMode = 1;};
  
  label = popup.pushNode("label");
  inp = label.pushNode("input"); inp.type = "radio"; inp.name = "motion"; if (this.soup.animation.motionMode == 2) inp.checked = true;
  label.pushNode("span", "Backward");
  label.AI = this.soup.animation;
  label.onclick = function() {this.AI.motionMode = 2;};
  
  label = popup.pushNode("label");
  inp = label.pushNode("input"); inp.type = "radio"; inp.name = "motion"; if (this.soup.animation.motionMode == 3) inp.checked = true;
  label.pushNode("span", "Swing");
  label.AI = this.soup.animation;
  label.onclick = function() {this.AI.motionMode = 3;};
  
  popup.pushNode("br");
  
  label = popup.pushNode("div"); label.setClass("unselectableText"); label.style.fontStyle = "normal"; label.style.textAlign = "center";
  inp = label.pushNode("span", "|&#8920;"); inp.setClass("smallButton");
  inp.AI = this.soup.animation;
  inp.onclick = function() {this.AI.beginning();}
  
  inp = label.pushNode("span", "<"); inp.setClass("smallButton");
  inp.AI = this.soup.animation;
  inp.onclick = function() {this.AI.previous();}
  
  inp = label.pushNode("span", "ll"); inp.setClass("smallButton");
  inp.AI = this.soup.animation;
  inp.onclick = function() {this.AI.pause();}
  
  inp = label.pushNode("span", "&#9658;"); inp.setClass("smallButton");
  inp.AI = this.soup.animation;
  inp.onclick = function() {this.AI.play();}
  
  inp = label.pushNode("span", ">"); inp.setClass("smallButton");
  inp.AI = this.soup.animation;
  inp.onclick = function() {this.AI.next();}
  
  inp = label.pushNode("span", "&#8921;|"); inp.setClass("smallButton");
  inp.AI = this.soup.animation;
  inp.onclick = function() {this.AI.end();}
  
  
  popup.close = popup.pushNode("button", "Close"); popup.close.style.display = "block"; popup.close.style.marginLeft = popup.close.style.marginRight = "auto";
  popup.close.onclick = function() {this.popup.parentNode.removeChild(this.popup);};
  popup.close.popup = popup;
  
  this.LM.parentNode.pushNode(popup);
  
  
    // animation popup...
    // forward, backward, both
    // repeat
    // beginning, previous, pause, play, next, end buttons
}

molmil.UI.prototype.resetRM=function() {
  try {
    molmil_dep.Clear(this.RM.parentNode.menu);
    if (this.RM.parentNode.menu.style.display != "none") this.showRM(this.RM, true);
  }
  catch (e) {}
};

molmil.UI.prototype.toggleCLI=function() {
  if (this.LM && this.LM.parentNode.childNodes.length > 1) this.LM.onclick();
  
  if (! this.canvas.commandLine) new molmil.commandLine(this.canvas);
  this.canvas.commandLine.icon.onclick();

  this.resetRM();
};

molmil.UI.prototype.clear=function() {
  if (this.LM && this.LM.parentNode.childNodes.length > 1) this.LM.onclick();
  
  var popup = molmil_dep.dcE("div");
  popup.setClass("molmil_menu_popup");
  
  popup.pushNode("div", "Do you want to clear all loaded structures?");
  popup.yes = popup.pushNode("button", "Yes"); popup.yes.canvas = this.canvas; popup.yes.UI = this;
  popup.yes.onclick = function() {
    if (this.canvas) molmil.clear(this.canvas);
    this.UI.resetRM();
    popup.cancel.onclick();
  };
  popup.cancel = popup.pushNode("button", "Cancel");
  popup.cancel.onclick = function() {this.popup.parentNode.removeChild(this.popup);};
  popup.cancel.popup = popup;
  
  this.LM.parentNode.pushNode(popup);
};

molmil.UI.prototype.showDialog=function(func) {
  if (this.LM && this.LM.parentNode.childNodes.length > 1) this.LM.onclick();
  
  var popup = molmil_dep.dcE("div");
  popup.setClass("molmil_menu_popup");
  
  if (func) func.apply(this, [popup]);
  
  if (this.LM) this.LM.parentNode.pushNode(popup);
  
  return popup;
}

molmil.UI.prototype.xyz_input_popup=function(fp, fn, cb) {
  this.showDialog(function(dialog) {
    var table = dialog.pushNode("table"), tr, td, load, cancel;
    var skipBonds;

    tr = table.pushNode("tr");
    tr.pushNode("td", "Filename:");
    tr.pushNode("td", fn);
          
    tr = table.pushNode("tr");
    tr.pushNode("td", "Skip bond building:");
    skipBonds = tr.pushNode("td").pushNode("input");
    skipBonds.type = "checkbox";
          
    load = dialog.pushNode("button", "Load");
    load.onclick = function() {
      var settings = {};
            
      settings.skipBonds = skipBonds.checked;

      this.UI.soup.loadStructureData(fp, "xyz", fn, cb, settings);
            
      dialog.parentNode.removeChild(dialog);
    }
    load.UI = this;

    cancel = dialog.pushNode("button", "Cancel");
    cancel.onclick = function() {dialog.parentNode.removeChild(dialog);};
          

  });
}


molmil.UI.prototype.ccp4_input_popup=function(fp, fn, cb) {
  this.showDialog(function(dialog) {
    var table = dialog.pushNode("table"), tr, td, load, cancel;
    var sigma, solid, skipnorm;

    tr = table.pushNode("tr");
    tr.pushNode("td", "Filename:");
    tr.pushNode("td", fn);
          
    tr = table.pushNode("tr");
    tr.pushNode("td", "Sigma:");
    sigma = tr.pushNode("td").pushNode("input");
    sigma.value = 1.0;
          
    tr = table.pushNode("tr");
    tr.pushNode("td", "Solid:");
    solid = tr.pushNode("td").pushNode("input");
    solid.type = "checkbox";
    solid.checked = true;
          
    tr = table.pushNode("tr");
    tr.pushNode("td", "Skip normalization:");
    skipnorm = tr.pushNode("td").pushNode("input");
    skipnorm.type = "checkbox";
          
    load = dialog.pushNode("button", "Load");
    load.onclick = function() {
      var settings = {};
      try {settings.sigma = parseFloat(sigma.value);}
      catch (e) {return alert("Incorrect value for sigma");}
            
      settings.solid = solid.checked;
      settings.skipNormalization = skipnorm.checked;

      this.UI.soup.loadStructureData(fp, "ccp4", fn, cb, settings);
            
      dialog.parentNode.removeChild(dialog);
    }
    load.UI = this;

    cancel = dialog.pushNode("button", "Cancel");
    cancel.onclick = function() {dialog.parentNode.removeChild(dialog);};
          

  });
}

molmil.UI.prototype.open=function(name, format, ondone, oncancel, binary) {
  if (this.LM && this.LM.parentNode.childNodes.length > 1) this.LM.onclick();
  
  var soup = this.soup;
  var UI = this;
  
  var popup = molmil_dep.dcE("div");
  popup.setClass("molmil_menu_popup");
  
  popup.pushNode("div", "Open "+name+" file: ");
  popup.inp = popup.pushNode("input");
  popup.inp.type = "file";
  
  popup.load = popup.pushNode("button", "Load");
  popup.load.fileFormat = format;
  popup.settings = {};
  popup.load.onclick = function() {
    if (! popup.inp.files.length) return;
    var r = new FileReader();
    r.fileFormat = this.fileFormat;
    r.filename = popup.inp.files[0].name;
    r.onload = function(e) {
      popup.cancel.onclick();
      
      var cb = function(soup, struc) {
        UI.resetRM();
        if (ondone) ondone(soup, struc);
        else {
          molmil.displayEntry(struc, soup.AID > 1e5 ? 5 : 1);
          molmil.colorEntry(struc, 1, [], true, soup);
        }
      };
      
      if (this.fileFormat == "ccp4") UI.ccp4_input_popup(e.target.result, this.filename, cb);
      else if (this.fileFormat) soup.loadStructureData(e.target.result, this.fileFormat, this.filename, cb, popup.settings);
      else ondone(this.filename, e.target.result);
      oncancel = null;
   };
   if (binary) r.readAsArrayBuffer(popup.inp.files[0]);
   else r.readAsText(popup.inp.files[0]);
  };
  popup.cancel = popup.pushNode("button", "Cancel");

  popup.cancel.onclick = function() {this.popup.parentNode.removeChild(this.popup); if (oncancel) oncancel();};
  popup.cancel.popup = popup;

  if (this.LM) this.LM.parentNode.pushNode(popup);
  
  return popup;
  
};

molmil.UI.prototype.openPMEID=function() {
  if (this.LM && this.LM.parentNode.childNodes.length > 1) this.LM.onclick();
  
  var UI = this;
  var popup = molmil_dep.dcE("div");
  popup.setClass("molmil_menu_popup");
  
  popup.pushNode("div", "Promode Elastic");
  popup.pushNode("hr");
  
  popup.pushNode("span", "Display: ");
  popup.dpm1 = popup.pushNode("label");
  popup.dpm1.inp = popup.dpm1.pushNode("input");
  popup.dpm1.inp.type = "radio";
  popup.dpm1.inp.name = "displayMode";
  popup.dpm1.pushNode("span", "Displacement vectors");
  popup.dpm1.inp.checked = true;
  
  popup.pushNode("br");
  
  popup.dpm2 = popup.pushNode("label");
  popup.dpm2.inp = popup.dpm2.pushNode("input");
  popup.dpm2.inp.type = "radio";
  popup.dpm2.inp.name = "displayMode";
  popup.dpm2.pushNode("span", "Animation");
  
  popup.pushNode("br");
  
  popup.pushNode("span", "Mode:").style.paddingRight = "1.125em";
  popup.mode = popup.pushNode("select");
  popup.mode.style.width = "10em";
  for (var i=0; i<10; i++) popup.mode.pushNode("option", i+1);
  
  popup.pushNode("br");
  
  popup.pushNode("span", "PDB ID: ");
  popup.inp = popup.pushNode("input");
  popup.inp.type = "text";
  popup.inp.style.width = "10em";
  popup.inp.onkeyup = function(ev) {
    if (ev.keyCode == 13) this.load.onclick();
    else if (ev.keyCode == 27) this.cancel.onclick();
  };
  
  popup.pushNode("br");
  
  popup.pushNode("span", "Variant:").style.paddingRight = ".25em";
  popup.sel = popup.pushNode("select");
  popup.sel.style.width = "10em";
  
  popup.pushNode("br");
  
  popup.inp.load = popup.load = popup.pushNode("button", "Load");
  popup.load.canvas = this.canvas;
  popup.load.inpBuf = null;
  popup.load.doLoad = function(id) {
    id = id || popup.sel.childNodes[popup.sel.selectedIndex].innerHTML;
    var mode = popup.mode.childNodes[popup.mode.selectedIndex].innerHTML;
    
    molmil.promode_elastic(id, mode, popup.dpm1.inp.checked ? 1 : 2, this.canvas.molmilViewer);
    popup.cancel.onclick();
  };
  popup.load.onclick = function() {
    if (popup.inp.value != this.inpBuf) {
      this.inpBuf = popup.inp.value;
      var request = new molmil_dep.CallRemote("GET"); request.ASYNC = true; 
      request.OnDone = function() {
        molmil_dep.Clear(popup.sel);
        var jso = JSON.parse(this.request.responseText);
        if (jso.length == 1) {return popup.load.doLoad(jso[0][2]);};
        for (var i=0; i<jso.length; i++) popup.sel.pushNode("option", jso[i][2]);
      };
      request.Send(molmil.settings.promodeE_check_url.replace("__ID__", this.inpBuf));
    }
    else if (popup.sel.length) popup.load.doLoad();
  };
  popup.inp.cancel = popup.cancel = popup.pushNode("button", "Cancel");
  popup.cancel.onclick = function() {this.popup.parentNode.removeChild(this.popup);};
  popup.cancel.popup = popup;
  
  this.LM.parentNode.pushNode(popup);
  
  popup.inp.focus();
};

molmil.UI.prototype.openID=function(dbid) {
  if (this.LM && this.LM.parentNode.childNodes.length > 1) this.LM.onclick();
  
  var text, url;
  
  if (dbid == 1) { // PDB
    text = "PDB ID";
    url = molmil.settings.pdb_url;
  }
  else if (dbid == 2) { // chem_comp
    text = "Comp ID";
    url = molmil.settings.comp_url;
  }
  else return;
  
  var UI = this;
  var popup = molmil_dep.dcE("div");
  popup.setClass("molmil_menu_popup");
  
  popup.pushNode("span", text+": ");
  popup.inp = popup.pushNode("input");
  popup.inp.type = "text";
  popup.inp.onkeyup = function(ev) {
    if (ev.keyCode == 13) this.load.onclick();
    else if (ev.keyCode == 27) this.cancel.onclick();
  };
  
  popup.inp.load = popup.load = popup.pushNode("button", "Load");
  popup.load.canvas = this.canvas;
  popup.load.url = url;
  popup.load.onclick = function() {
    if (! popup.inp.value) return;
    this.canvas.molmilViewer.loadStructure(this.url.replace("__ID__", popup.inp.value), 1, function(soup, struc) {
      molmil.displayEntry(struc, soup.AID > 1e5 ? 5 : 1);
      molmil.colorEntry(struc, 1, [], true, soup);
      UI.resetRM();
    });
    popup.cancel.onclick();
  };
  popup.inp.cancel = popup.cancel = popup.pushNode("button", "Cancel");
  popup.cancel.onclick = function() {this.popup.parentNode.removeChild(this.popup);};
  popup.cancel.popup = popup;
  
  this.LM.parentNode.pushNode(popup);
  
  popup.inp.focus();
}

molmil.UI.prototype.savePNG=function() {
  if (this.LM && this.LM.parentNode.childNodes.length > 1) this.LM.onclick();
  
  var popup = molmil_dep.dcE("div");
  popup.setClass("molmil_menu_popup");
  
  popup.pushNode("span", " ");
  popup.range = popup.pushNode("input");
  popup.range.type = "range";
  popup.range.min = "0.25";
  popup.range.max = "4";
  popup.range.step = ".25";
  popup.range.value = "1.0";
  popup.range.onmousemove = function() {this.nfo.innerHTML = (this.canvas.width*this.value)+"px x "+(this.canvas.height*this.value)+"px";};
  popup.range.nfo = popup.pushNode("span");
  popup.range.nfo.style.display = "inline-block";
  
  popup.save = popup.pushNode("button", "Save"); popup.range.canvas = popup.save.canvas = this.canvas;
  popup.save.onclick = function() {
    if (! window.saveAs) return molmil.loadPlugin(molmil.settings.src+"lib/FileSaver.js", this.onclick, this, []); 
    
    if (molmil.configBox.stereoMode != 1 && ! molmil.configBox.keepBackgroundColor) {
      var opacity = molmil.configBox.BGCOLOR[3]; molmil.configBox.BGCOLOR[3] = 0;
    }
    var mult = parseFloat(popup.range.value);
    if (mult != 1) {
      var width = this.canvas.width; var height = this.canvas.height; var opacity = molmil.configBox.BGCOLOR[3];
      // there appears to be a problem with chrome and changing the canvas w/h --> but only at very high resolutions...
      this.canvas.width *= mult; this.canvas.height *= mult; 
      this.canvas.renderer.selectDataContext(); this.canvas.renderer.resizeViewPort();
      this.canvas.update = true; this.canvas.renderer.render();
      this.canvas.toBlob(function(blob) {saveAs(blob, "image.png");});
      this.canvas.renderer.selectDefaultContext();
      this.canvas.width = width; this.canvas.height = height;
      this.canvas.renderer.resizeViewPort();
    }
    else {
      this.canvas.renderer.selectDataContext();
      this.canvas.update = true;
      this.canvas.renderer.render();
      this.canvas.toBlob(function(blob) {saveAs(blob, "image.png");});
      this.canvas.renderer.selectDefaultContext();
    }
    if (molmil.configBox.stereoMode != 1 && ! molmil.configBox.keepBackgroundColor) molmil.configBox.BGCOLOR[3] = opacity;
    this.canvas.update = true; this.canvas.renderer.render();
  
    popup.cancel.onclick();
  };
  popup.cancel = popup.pushNode("button", "Cancel");
  popup.cancel.onclick = function() {this.popup.parentNode.removeChild(this.popup);};
  popup.cancel.popup = popup;
  
  popup.range.onmousemove();
  
  this.LM.parentNode.pushNode(popup);
}


molmil.UI.prototype.videoRenderer=function(justStart) {
  if (this.LM && this.LM.parentNode.childNodes.length > 1) this.LM.onclick();
  
  var videoID = null;
  var pixels = null;
  
  this.canvas.renderer.onRenderFinish = function() {
    if (! videoID) return;
    if (pixels == null) pixels = new Uint8Array(this.canvas.width * this.canvas.width * 4);
    
    if (window.addFrame) addFrame(canvas.toDataURL());
    else {
      var req = new molmil_dep.CallRemote("POST");
      req.AddParameter("id", videoID);
      req.AddParameter("data", canvas.toDataURL());
      req.Send(molmil.settings.molmil_video_url+"addFrame");
    }
          
    this.canvas.renderer.gl.readPixels(0, 0, this.canvas.width, this.canvas.height, this.canvas.renderer.gl.RGBA, this.canvas.renderer.gl.UNSIGNED_BYTE, pixels);

  };
  
  var popup = molmil_dep.dcE("div");
  popup.setClass("molmil_menu_popup");

  // add handler buttons...
  
  popup.preview = popup.pushNode("button", "Play & Preview");
  popup.pushNode("br");
  popup.record = popup.pushNode("button", "Play & Record");
  popup.pushNode("br");
  
  popup.canvas = popup.preview.canvas = popup.record.canvas = this.canvas;
  popup.preview.popup = popup.record.popup = popup;
  
  popup.preview.onclick = function() {
    videoID = null;
    //canvas.renderer.selectDefaultContext();
    this.canvas.molmilViewer.animation.beginning();
    this.canvas.molmilViewer.animation.play();
  }
    
  
  popup.endVideo = function() {
    if (this.canvas.molmilViewer.animation.playing) molmil_dep.asyncStart(this.endVideo, [], this, 250);
    else {
      if (window.finalizeVideo) finalizeVideo();
      else {
        var req = new molmil_dep.CallRemote("GET");
        req.AddParameter("id", videoID);
        req.Send(molmil.settings.molmil_video_url+"deInitVideo");
        console.log(molmil.settings.molmil_video_url+"getVideo?id="+videoID);
        window.open(molmil.settings.molmil_video_url+"getVideo?id="+videoID);
      }
      videoID = null;
    }
  }


  popup.record.onclick = function() {
    // make sure that both the width & height are divisible by 2 (ffmpeg issue)
    var w = this.canvas.width, h = this.canvas.height;
    if (w%2 == 1) w--;
    if (h%2 == 1) h--;
    if (w != this.canvas.width || h != this.canvas.height) {this.canvas.width = w; this.canvas.height = h; this.canvas.renderer.resizeViewPort();}
    if (window.initVideo) {videoID = 1; initVideo(molmil.configBox.video_path, this.canvas.width, this.canvas.height, molmil.configBox.video_framerate);}
    else {
      var req = new molmil_dep.CallRemote("GET");
      req.AddParameter("w", this.canvas.width);
      req.AddParameter("h", this.canvas.height);
      req.Send(molmil.settings.molmil_video_url+"initVideo");
      videoID = req.request.responseText;
      //canvas.renderer.selectDataContext();
    }
    this.canvas.molmilViewer.animation.beginning();
    this.canvas.molmilViewer.animation.play();
    this.popup.endVideo();
  }
  
  popup.cancel = popup.pushNode("button", "Cancel");
  popup.cancel.canvas = this.canvas;
  popup.cancel.onclick = function() {
    this.canvas.molmilViewer.animation.end();
    this.popup.endVideo();
    this.popup.parentNode.removeChild(this.popup);
  };
  popup.cancel.popup = popup;
  
  this.LM.parentNode.pushNode(popup);
  
  if (justStart) popup.record.onclick();
}

// ** drag-and-drop support for various files **
molmil.bindCanvasInputs = function(canvas) {
  if (! canvas.molmilViewer.UI) {
    canvas.molmilViewer.UI = new molmil.UI(canvas.molmilViewer);
    canvas.molmilViewer.UI.init();
    canvas.molmilViewer.animation = new molmil.animationObj(canvas.molmilViewer);
  }
  
  var mjsFunc = function(canvas, fr) {
    if (fr.filename.endsWith(".mjs")) {
      fr.onload = function(e) {
        canvas.commandLine.environment.scriptUrl = "";
        canvas.commandLine.environment.console.runCommand(e.target.result.replace(/\/\*[\s\S]*?\*\/|([^:]|^)\/\/.*$/gm, ""));
      }
      fr.readAsText(fr.fileHandle);
      return true;
    }
  };
  
  var cancelDB = function (ev) {
    ev.preventDefault();
    return false;
  }

  var nfilesproc = [0, 0, []];
  var renderOnlyFinal = function(soup, structures) {
    nfilesproc[0]++;
    if (Array.isArray(structures)) nfilesproc[2] = nfilesproc[2].concat(structures)
    else nfilesproc[2].push(structures);
    if (nfilesproc[0] < nfilesproc[1]) return;
    molmil.displayEntry(nfilesproc[2], 1);
    molmil.colorEntry(nfilesproc[2], 1, null, true, soup);
    nfilesproc[2] = [];
  }

  var dropDB = function (ev) {
    ev.preventDefault()
      
    var fr, i, j, mjsFile = null, file;
    
    var dict = {}, item, entry, bakacounter = 0;

    var bakacheck = function() {
      if (bakacounter > 0) return;
      
      var items = Object.keys(dict).sort(molmil_dep.naturalSort);
      var count = items.length;
      for (i=0; i<count; i++) {
        if (items[i].toLowerCase().endsWith(".mjs")) {mjsFile = items[i]; break;}
      }
      
      if (mjsFile != null) {
        canvas.mjs_fileBin = {};
        for (i=0; i<count; i++) {
          fr = new FileReader();
          file = dict[items[i]];
          fr.filename = file.name;
          fr.fileHandle = file;
          canvas.mjs_fileBin[items[i]] = fr;
        }
        mjsFunc(canvas, canvas.mjs_fileBin[mjsFile]);
        return false;
      }
      nfilesproc[1] = count;

      for (i=0; i<count; i++) {
        fr = new FileReader();
        file = dict[items[i]];
        fr.filename = file.name;
        fr.fileHandle = file;
        var ok = false;
      
        for (j=0; j<canvas.inputFunctions.length; j++) {
          if (canvas.inputFunctions[j](canvas, fr)) {ok=true; break;}
        }
        
        if (! ok) {
          for (var j in molmil.formatList) {
            if (typeof molmil.formatList[j] != "function" || ! cmd[1].endsWith(j)) continue;
            molmil.loadFilePointer(fr, molmil.formatList[j], canvas);
            break;
          }
        }
      }
      
      
    };
    
    var processEntry = function(item) {
      if (item.isFile) {
        bakacounter += 1;
        item.file(function(baka) {
          dict[item.fullPath.replace(/^\//, "")] = baka;
          bakacounter -= 1;
          bakacheck();
        });
      }
      if (! item.isDirectory) return;
      var directoryReader = item.createReader();
      bakacounter += 1;
      directoryReader.readEntries(function(entries) {entries.forEach(processEntry); bakacounter -= 1;});
    };
    
    for (var i=0; i<ev.dataTransfer.items.length; i++) {
      item = ev.dataTransfer.items[i];
      if (item.kind != 'file') continue;
      if (item.getAsEntry) entry = item.getAsEntry();
      else if (item.webkitGetAsEntry) entry = item.webkitGetAsEntry();
      else {dict = null; break;} // not supported
      processEntry(entry);
    }
    
    if (dict == null) {
      var count = 0, files = [];
      try{
        files = ev.dataTransfer.files;
        count = files.length;
      } catch (e) {}
      
      var dict = {};
      for (i=0; i<count; i++) dict[files[i].name] = files[i];
      bakacheck();
    }
    
    return false;
  }

  canvas.addEventListener("dragover", cancelDB);
  canvas.addEventListener("dragenter", cancelDB);
  canvas.addEventListener("drop", dropDB);
  
  // mjs file
  canvas.inputFunctions.push(mjsFunc);
  
  // .gz file
  canvas.inputFunctions.push(function(canvas, fr) {
    if (fr.filename.endsWith(".gz")) {
      if (! window.hasOwnProperty("pako")) {var obj = molmil_dep.dcE("script"); obj.src = molmil.settings.src+"lib/pako.js"; document.getElementsByTagName("head")[0].appendChild(obj);}
      fr.onload = function(e) {
        if (! window.hasOwnProperty("pako")) return molmil_dep.asyncStart(this.onload, [e], this, 50);

        var fakeObj = {filename:fr.filename.substr(0, fr.filename.length-3)};
        fakeObj.readAsText = function() {var out = pako.inflate(new Uint8Array(e.target.result), {to: "string"}); this.onload({target: {result: out}});};
        fakeObj.readAsArrayBuffer = function() {var out = pako.inflate(new Uint8Array(e.target.result)); this.onload({target: {result: out.buffer}});};

        for (j=0; j<canvas.inputFunctions.length; j++) {
          if (canvas.inputFunctions[j](canvas, fakeObj)) break;
        }
      }
      canvas.molmilViewer.downloadInProgress = true;
      fr.readAsArrayBuffer(fr.fileHandle);
      return true;
    }
  });
  
  
  // pdb file
  canvas.inputFunctions.push(function(canvas, fr) {
    if (fr.filename.endsWith(".pdb") || fr.filename.endsWith(".ent")) {
      fr.onload = function(e) {
        canvas.molmilViewer.loadStructureData(e.target.result, 4, this.filename, renderOnlyFinal);
        delete canvas.molmilViewer.downloadInProgress;
      }
      canvas.molmilViewer.downloadInProgress = true;
      fr.readAsText(fr.fileHandle);
      return true;
    }
  });
  
  // mmtf file
  canvas.inputFunctions.push(function(canvas, fr) {
    if (fr.filename.endsWith(".mmtf")) {
      fr.onload = function(e) {
        canvas.molmilViewer.loadStructureData(e.target.result, "mmtf", this.filename, renderOnlyFinal);
        delete canvas.molmilViewer.downloadInProgress;
      }
      canvas.molmilViewer.downloadInProgress = true;
      fr.readAsText(fr.fileHandle);
      return true;
    }
  });
  
  // cif file
  canvas.inputFunctions.push(function(canvas, fr) {
    if (fr.filename.endsWith(".cif")) {
      fr.onload = function(e) {
        canvas.molmilViewer.loadStructureData(e.target.result, 'cif', this.filename, renderOnlyFinal);
        delete canvas.molmilViewer.downloadInProgress;
      }
      canvas.molmilViewer.downloadInProgress = true;
      fr.readAsText(fr.fileHandle);
      return true;
    }
  });
  
  // gro file
  canvas.inputFunctions.push(function(canvas, fr) {
    if (fr.filename.endsWith(".gro")) {
      fr.onload = function(e) {
        canvas.molmilViewer.loadStructureData(e.target.result, 7, this.filename, renderOnlyFinal);
        delete canvas.molmilViewer.downloadInProgress;
      }
      canvas.molmilViewer.downloadInProgress = true;
      fr.readAsText(fr.fileHandle);
      return true;
    }
  });
  
  // gromacs trajectory file (trr)
  canvas.inputFunctions.push(function(canvas, fr) {
    if (fr.filename.endsWith(".trr")) {
      fr.onload = function(e) {
        canvas.molmilViewer.loadStructureData(e.target.result, "gromacs-trr", this.filename, renderOnlyFinal);
        delete canvas.molmilViewer.downloadInProgress;
      }
      canvas.molmilViewer.downloadInProgress = true;
      fr.readAsArrayBuffer(fr.fileHandle);
      return true;
    }
  });
  
  // gromacs trajectory file (xtc)
  canvas.inputFunctions.push(function(canvas, fr) {
    if (fr.filename.endsWith(".xtc")) {
      fr.onload = function(e) {
        canvas.molmilViewer.loadStructureData(e.target.result, "gromacs-xtc", this.filename, renderOnlyFinal);
        delete canvas.molmilViewer.downloadInProgress;
      }
      canvas.molmilViewer.downloadInProgress = true;
      fr.readAsArrayBuffer(fr.fileHandle);
      return true;
    }
  });
  
  // mypresto trajectory file
  canvas.inputFunctions.push(function(canvas, fr) {
    if (fr.filename.endsWith(".cor") || fr.filename.endsWith(".cod")) {
      fr.onload = function(e) {
        canvas.molmilViewer.loadStructureData(e.target.result, "presto-traj", this.filename, renderOnlyFinal);
        delete canvas.molmilViewer.downloadInProgress;
      }
      canvas.molmilViewer.downloadInProgress = true;
      fr.readAsArrayBuffer(fr.fileHandle);
      return true;
    }
  });
  
  // mypresto mnt file
  canvas.inputFunctions.push(function(canvas, fr) {
    if (fr.filename.endsWith(".mnt")) {
      fr.onload = function(e) {
        canvas.molmilViewer.loadStructureData(e.target.result, "presto-mnt", this.filename, renderOnlyFinal);
        delete canvas.molmilViewer.downloadInProgress;
      }
      canvas.molmilViewer.downloadInProgress = true;
      fr.readAsArrayBuffer(fr.fileHandle);
      return true;
    }
  });
  
  // mpbf
  canvas.inputFunctions.push(function(canvas, fr) {
    if (fr.filename.endsWith(".mpbf")) {
      fr.onload = function(e) {
        canvas.molmilViewer.loadStructureData(e.target.result, 8, this.filename, renderOnlyFinal);
        delete canvas.molmilViewer.downloadInProgress;
      }
      canvas.molmilViewer.downloadInProgress = true;
      fr.readAsArrayBuffer(fr.fileHandle);
      return true;
    }
  });
  
  // ccp4
  canvas.inputFunctions.push(function(canvas, fr) {
    if (fr.filename.endsWith(".ccp4")) {
      fr.onload = function(e) {
        canvas.molmilViewer.UI.ccp4_input_popup(e.target.result, this.filename, renderOnlyFinal);
        delete canvas.molmilViewer.downloadInProgress;
      }
      canvas.molmilViewer.downloadInProgress = true;
      fr.readAsArrayBuffer(fr.fileHandle);
      return true;
    }
  });
  
  // mdl
  canvas.inputFunctions.push(function(canvas, fr) {
    if (fr.filename.endsWith(".mdl") || fr.filename.endsWith(".mol") || fr.filename.endsWith(".sdf")) {
      fr.onload = function(e) {
        canvas.molmilViewer.loadStructureData(e.target.result, 'mdl', this.filename, renderOnlyFinal);
        delete canvas.molmilViewer.downloadInProgress;
      }
      canvas.molmilViewer.downloadInProgress = true;
      fr.readAsText(fr.fileHandle);
      return true;
    }
  });
  
  // mol2
  canvas.inputFunctions.push(function(canvas, fr) {
    if (fr.filename.endsWith(".mol2")) {
      fr.onload = function(e) {
        canvas.molmilViewer.loadStructureData(e.target.result, 'mol2', this.filename, renderOnlyFinal);
        delete canvas.molmilViewer.downloadInProgress;
      }
      canvas.molmilViewer.downloadInProgress = true;
      fr.readAsText(fr.fileHandle);
      return true;
    }
  });
  
  // xyz
  canvas.inputFunctions.push(function(canvas, fr) {
    if (fr.filename.endsWith(".xyz")) {
      fr.onload = function(e) {
        canvas.molmilViewer.UI.xyz_input_popup(e.target.result, this.filename, renderOnlyFinal);
        delete canvas.molmilViewer.downloadInProgress;
      }
      canvas.molmilViewer.downloadInProgress = true;
      fr.readAsText(fr.fileHandle);
      return true;
    }
  });
  
  // obj
  canvas.inputFunctions.push(function(canvas, fr) {
    if (fr.filename.endsWith(".obj")) {
      fr.onload = function(e) {
        canvas.molmilViewer.loadStructureData(e.target.result, "obj", this.filename, renderOnlyFinal);
        delete canvas.molmilViewer.downloadInProgress;
      }
      canvas.molmilViewer.downloadInProgress = true;
      fr.readAsText(fr.fileHandle);
      return true;
    }
  });
  
  // wrl
  canvas.inputFunctions.push(function(canvas, fr) {
    if (fr.filename.endsWith(".wrl")) {
      fr.onload = function(e) {
        canvas.molmilViewer.loadStructureData(e.target.result, "wrl", this.filename, renderOnlyFinal);
        delete canvas.molmilViewer.downloadInProgress;
      }
      canvas.molmilViewer.downloadInProgress = true;
      fr.readAsText(fr.fileHandle);
      return true;
    }
  });
  
  // efvet
  canvas.inputFunctions.push(function(canvas, fr) {
    if (fr.filename.endsWith(".efvet")) {
      fr.onload = function(e) {
        canvas.molmilViewer.loadStructureData(e.target.result, "efvet", this.filename, renderOnlyFinal);
        delete canvas.molmilViewer.downloadInProgress;
      }
      canvas.molmilViewer.downloadInProgress = true;
      fr.readAsText(fr.fileHandle);
      return true;
    }
  });
  
};


// ** video support **
molmil.initVideo = function(UI) {
  if (window.initVideo) {
    molmil_dep.asyncStart(UI.videoRenderer, [], UI, 0);
    return;
  }
  var request = new molmil_dep.CallRemote("POST");request.ASYNC = true; request.UI = UI;
  request.OnDone = function() {
    var jso = JSON.parse(this.request.responseText);
    if (! jso.found) return this.OnError();
    molmil_dep.asyncStart(this.UI.videoRenderer, [], this.UI, 0);
  };
  request.OnError = function() {
    alert("The support server to construct the video could not be found...");
  };
  request.Send(molmil.settings.molmil_video_url+"has_molmil_video_support");
}

molmil.animationObj = function (soup) {
  this.soup = soup;
  this.renderer = soup.renderer;
  this.frameNo = 0;
  this.motionMode = 1;
  this.init = false;
  this.delay = 66;
  this.frameAction = function() {};
  this.detail_or = -1;
  this.infoBox = null;
}

molmil.animationObj.prototype.initialise = function(infoBox) { // redo
  this.renderer.animationMode = true;
  this.number_of_frames = this.soup.structures.length ? this.soup.structures[0].number_of_frames : 0;
  this.frameNo = this.renderer.modelId;
  this.init = true;
  this.infoBox = infoBox;
};

molmil.animationObj.prototype.updateInfoBox = function() {
  if (! this.infoBox) return;
  if (this.infoBox.timeBox) {
    if (this.soup.frameInfo) this.infoBox.timeBox.innerHTML = this.soup.frameInfo[this.frameNo][1].toFixed(1)+"ps";
    else this.infoBox.timeBox.innerHTML = this.frameNo;
  }
  if (this.infoBox.sliderBox) {
    if (this.soup.frameInfo) this.infoBox.timeBox.value = this.soup.frameInfo[this.frameNo][1];
    else this.infoBox.timeBox.value = this.frameNo;
    this.infoBox.sliderBox.value = this.frameNo;
  }
};

molmil.animationObj.prototype.beginning = function() {
  if (! this.init) this.initialise();
  this.frameNo = 0;
  this.renderer.selectFrame(this.frameNo, this.detail_or);
  this.soup.canvas.update = true;
  this.frameAction();
  this.updateInfoBox();
};

molmil.animationObj.prototype.go2Frame = function(fid) {
  if (! this.init) this.initialise();
  this.frameNo = fid;
  this.renderer.selectFrame(this.frameNo, this.detail_or);
  this.soup.canvas.update = true;
  this.frameAction();
  this.updateInfoBox();
}


molmil.animationObj.prototype.previous = function() {
  if (! this.init) this.initialise();
  this.frameNo -= 1;
  if (this.frameNo < 0) this.frameNo = 0;
  this.renderer.selectFrame(this.frameNo, this.detail_or);
  this.soup.canvas.update = true;
  this.frameAction();
  this.updateInfoBox();
};

molmil.animationObj.prototype.pause = function() {
  if (this.TID) {
    clearTimeout(this.TID);
    this.TID = null;
  }
};

molmil.animationObj.prototype.play = function() {
  if (! this.init) this.initialise();
  this.playing = true;
  if (this.motionMode == 2) this.TID = molmil_dep.asyncStart(this.backwardRenderer, [], this, this.delay);
  else this.TID = molmil_dep.asyncStart(this.forwardRenderer, [], this, this.delay);
};

molmil.animationObj.prototype.next = function() {
  if (! this.init) this.initialise();
  this.frameNo += 1;
  //if (this.frameNo >= this.renderer.framesBuffer.length) this.frameNo = this.renderer.framesBuffer.length-1;
  if (this.frameNo >= this.number_of_frames) this.frameNo = this.number_of_frames-1;
  this.renderer.selectFrame(this.frameNo, this.detail_or);
  this.soup.canvas.update = true;
  this.frameAction();
  this.updateInfoBox();
};

molmil.animationObj.prototype.end = function() {
  if (! this.init) this.initialise();
  //this.frameNo = this.renderer.framesBuffer.length-1;
  this.frameNo = this.number_of_frames-1;
  this.renderer.selectFrame(this.frameNo, this.detail_or);
  this.soup.canvas.update = true;
  this.frameAction();
  this.updateInfoBox();
};

molmil.animationObj.prototype.forwardRenderer = function() {
  if (this.number_of_frames < 2) return;
  this.frameNo += 1;
  //if (this.frameNo >= this.renderer.framesBuffer.length) {
  if (this.frameNo >= this.number_of_frames) {
    if (this.motionMode == 3 || this.motionMode == 3.5) {this.frameNo -= 1; return this.backwardRenderer();}
    else this.playing = false;
  }
  else {
    this.renderer.selectFrame(this.frameNo, this.detail_or);
    this.soup.canvas.update = true;
    this.TID = molmil_dep.asyncStart(this.forwardRenderer, [], this, this.delay);
    this.frameAction();
    this.updateInfoBox();
  }
};

molmil.animationObj.prototype.backwardRenderer = function() {
  if (this.number_of_frames < 2) return;
  this.frameNo -= 1;
  if (this.frameNo < 0) {
    if (this.motionMode == 3) {this.frameNo += 1; return this.forwardRenderer();}
    else this.playing = false;
  }
  else {
    this.renderer.selectFrame(this.frameNo, this.detail_or);
    this.soup.canvas.update = true;
    this.TID = molmil_dep.asyncStart(this.backwardRenderer, [], this, this.delay);
    this.frameAction();
    this.updateInfoBox();
  }
};


// new UI:
//  - code wise, better structured
//  - slide-based menu (no hierarchal display)



molmil.UI.prototype.deleteMeshFunction = function(payload, lv, mode) {
  if (! (payload instanceof Array)) payload = [payload]
  
  var files = this.soup.structures;
  
  for (var f=0; f<payload.length; f++) {
    var pnames = Object.keys(payload[f].programs);
    for (var p=0; p<pnames.length; p++) this.soup.renderer.removeProgram(payload[f].programs[pnames[p]]);
    var idx = files.indexOf(payload[f]);
    if (idx != -1) this.soup.structures.splice(idx, 1);
  }
  
  this.soup.renderer.canvas.update = true;
  this.resetRM();
}

molmil.UI.prototype.displayFunction = function(payload, lv, mode) {
  if (! (payload instanceof Array)) payload = [payload]
  
  if (mode == 10001) {
    var tmp1 = [], tmp2 = [];
    if (lv == 2) {
      for (var i=0; i<payload.length; i++) {
        tmp1.push(payload[i].molecule);
        for (var j=0; j<payload[i].chain.entry.chains.length; j++) if (tmp2.indexOf(payload[i].chain.entry.chains[j]) == -1) tmp2.push(payload[i].chain.entry.chains[j]);
      }
    }
    else if (lv == 3) {
      for (var i=0; i<payload.length; i++) {
        tmp1.push(payload[i].chain);
        for (var j=0; j<payload[i].chain.entry.chains.length; j++) if (tmp2.indexOf(payload[i].chain.entry.chains[j]) == -1) tmp2.push(payload[i].chain.entry.chains[j]);
      }
    }
    molmil.calcHbonds(tmp1, tmp2, this.soup); var tmp = [];
  }
  else if (mode == 10002) {
    // display all residues within 3.5 A...
    var tmp = [];
    for (var i=0; i<payload.length; i++) tmp.push(payload[i].molecule);
    
    molmil.showNearbyResidues(tmp, 3.5, this.soup);
  }
  
  // 10001 => hydrogen bonds of the selected residue (and everything)
  // 10002 => all residues (ligands/waters) within 3.5A from the selected residue
  
  for (var i=0; i<payload.length; i++) {
    if (payload[i] instanceof molmil.atomObject) {
      if (lv == 2) payload[i] = payload[i].molecule;
      if (lv == 3) payload[i] = payload[i].chain;
      if (lv == 4) payload[i] = payload[i].chain.entry;
    }
  }
  
  molmil.displayEntry(payload, mode, true, this.soup);
};

// field: title, id, type, options...
molmil.UI.prototype.popupMenuBuilder = function(title, fields, ondone, oncancel) {
  var popup = molmil_dep.dcE("div"); popup.className = "molmil_popup";
  popup.titleDIV = popup.pushNode("div", title);
  popup.contentTable = popup.pushNode("table");
  popup.objects = {}; popup.ondone = ondone; popup.oncancel = oncancel;
  
  popup.destroy = function() {this.parentNode.removeChild(this);}
  
  var i, field, tmp;
  for (i=0; i<fields.length; i++) {
    field = popup.contentTable.pushNode("tr");
    field.nameBox = field.pushNode("td", fields[i][0]);
    field.valueBox = field.pushNode("td");
    if (fields[i][2] == "color") {
      tmp = field.valueBox.pushNode("input"); tmp.type = "color";
      if (fields[i][3]) tmp.value = molmil.rgb2hex(fields[i][3][0], fields[i][3][1], fields[i][3][2]);
    }
    else if (fields[i][2] == "checkbox") {
      tmp = field.valueBox.pushNode("input"); tmp.type = "checkbox";
      if (fields[i][3]) tmp.checked = true;
    }
    else if (fields[i][2] == "hidden") {
      popup.contentTable.removeChild(field);
      tmp = fields[i][3];
    }
    else {
      tmp = field.valueBox.pushNode("input", fields[i][3] || ""); tmp.type = "text"
      tmp.value = fields[i][3] || "";
    }
    popup.objects[fields[i][1]] = tmp;
  }
  
  var OK = popup.pushNode("button", "OK"); OK.popup = popup;
  OK.onclick = function() {this.popup.ondone(this.popup.objects); this.popup.destroy();};
  var cancel = popup.pushNode("button", "Cancel"); cancel.popup = popup;
  cancel.onclick = function() {if (this.popup.oncancel) {this.popup.oncancel(this.popup.objects);} this.popup.destroy();};
  
  document.documentElement.pushNode(popup);
};

molmil.UI.prototype.colorFunction = function(payload, lv, mode, setting) {
  if (mode == molmil.colorEntry_Custom && ! setting) {
    var UI = this;
    return this.popupMenuBuilder("Color object", [["Color by:", "color", "color"], ["Color cartoon", "colorCartoon", "checkbox", true]], function(objects) {
      var rgba = molmil.hex2rgb(objects.color.value); rgba.push(255);
      UI.colorFunction(payload, lv, objects.colorCartoon.checked ? mode : mode+.5, rgba);
    });
  }
  if (! (payload instanceof Array)) payload = [payload];
  
  for (var i=0; i<payload.length; i++) {
    if (payload[i] instanceof molmil.atomObject) {
      if (lv == 2) payload[i] = payload[i].molecule;
      if (lv == 3) payload[i] = payload[i].chain;
      if (lv == 4) payload[i] = payload[i].chain.entry;
    }
  }
  
  if (lv == 103) mode += .25;
  else if (lv == 104) mode += .5;
  molmil.colorEntry(payload, lv == 104 ? mode+.5 : mode, setting, true, this.soup);
};

molmil.UI.prototype.labelFunction = function(payload, lv) {
  if (! (payload instanceof Array)) payload = [payload];
  var objs = [], text = "";
  
  if (lv == 0) { // hide
    payload[0].display = payload[0].status = false;
    this.soup.canvas.update = true;
    return;
  }
  if (lv == 1000) { // show
    payload[0].display = true; payload[0].status = false;
    this.soup.canvas.update = true;
    return;
  }
  if (lv == 0.5) {
    return this.editLabel(payload[0]);
  }
  if (lv == -1) {
    // delete
    return;
  }
  
  if (lv == 1) { // atom
    for (var i=0; i<payload.length; i++) {
      if (payload[i] instanceof molmil.atomObject) objs.push(payload[i]);
    }
    if (objs.length == 1) text = objs[0].toString()
    else text = objs.length+" atoms";
  }
  else if (lv == 2) { // residue
    for (var i=0; i<payload.length; i++) {
      if (payload[i] instanceof molmil.atomObject) objs.push(payload[i].molecule);
      if (payload[i] instanceof molmil.molObject) objs.push(payload[i]);
    }
    if (objs.length == 1) text = objs[0].toString()
    else text = objs.length+" residues";
  }
  else if (lv == 3) { // chain
    for (var i=0; i<payload.length; i++) {
      if (payload[i] instanceof molmil.atomObject) objs.push(payload[i].chain);
      if (payload[i] instanceof molmil.chainObject) objs.push(payload[i]);
    }
    if (objs.length == 1) text = objs[0].toString()
    else text = objs.length+" chains";
  }
  else if (lv == 4) { // entry
    for (var i=0; i<payload.length; i++) {
      if (payload[i] instanceof molmil.atomObject) objs.push(payload[i].chain.entry);
      if (payload[i] instanceof molmil.entryObject) objs.push(payload[i]);
    }
    if (objs.length == 1) text = objs[0].toString()
    else text = objs.length+" entries";
  }

  var info = molmil.calcCenter(objs);
  this.editLabel({text: text, xyz: info[0], dz: info[1]+2});
};

molmil.UI.prototype.initMenus = function() {
  //   1 => molmil.atomObject
  //   2 => molmil.molObject
  //   3 => molmil.chainObject
  //   4 => molmil.entryObject
  //   5 => molmil.polygonObject
  //   6 => molmil.labelObject
  // 102 => side-chain
  // 103 => cartoon-component
  // 104 => atom-component
//return;
  this.contextMenuCanvas = [
    ["Display", 0, [
      ["Residue", 0, [
        [function(payload, structure) {
          if (payload[0].molecule.display) {structure[3][2] = molmil.displayMode_None; return "Hidden";}
          else {structure[3][2] = molmil.displayMode_Visible; return "Visible";}
        }, this.displayFunction, this, [null, 2, 0]],
        ["Amino acid", 0, [
          ["Space fill", this.displayFunction, this, [null, 2, molmil.displayMode_Spacefill]],
          ["Ball & stick", this.displayFunction, this, [null, 2, molmil.displayMode_BallStick]],
          ["Stick", this.displayFunction, this, [null, 2, molmil.displayMode_Stick]],
          ["Wireframe", this.displayFunction, this, [null, 2, molmil.displayMode_Wireframe]]
        ]],
        ["Sidechain", 0, [
          ["Space fill", this.displayFunction, this, [null, 2, molmil.displayMode_Spacefill_SC]],
          ["Ball & stick", this.displayFunction, this, [null, 2, molmil.displayMode_BallStick_SC]],
          ["Stick", this.displayFunction, this, [null, 2, molmil.displayMode_Stick_SC]],
          ["Wireframe", this.displayFunction, this, [null, 2, molmil.displayMode_Wireframe_SC]]
        ]],
        ["Hydrogen bonds", this.displayFunction, this, [null, 2, 10001]],
        ["Nearby residues (3.5 A)", this.displayFunction, this, [null, 2, 10002]],
      ]],
      ["Chain", 0, [
        [function(payload, structure) {
          if (payload[0].chain.display) {structure[3][2] = molmil.displayMode_None; return "Hidden";}
          else {structure[3][2] = molmil.displayMode_Visible; return "Visible";}
        }, this.displayFunction, this, [null, 3, molmil.displayMode_None]],
        ["Default", this.displayFunction, this, [null, 3, molmil.displayMode_Default]],
        ["Amino acid", 0, [
          ["Space fill", this.displayFunction, this, [null, 3, molmil.displayMode_Spacefill]],
          ["Ball & stick", this.displayFunction, this, [null, 3, molmil.displayMode_BallStick]],
          ["Stick", this.displayFunction, this, [null, 3, molmil.displayMode_Stick]],
          ["Wireframe", this.displayFunction, this, [null, 3, molmil.displayMode_Wireframe]]
        ]],
        ["Sidechain", 0, [
          ["Space fill", this.displayFunction, this, [null, 3, molmil.displayMode_Spacefill_SC]],
          ["Ball & stick", this.displayFunction, this, [null, 3, molmil.displayMode_BallStick_SC]],
          ["Stick", this.displayFunction, this, [null, 3, molmil.displayMode_Stick_SC]],
          ["Wireframe", this.displayFunction, this, [null, 3, molmil.displayMode_Wireframe_SC]]
        ]],
        ["Ca trace", this.displayFunction, this, [null, 3, molmil.displayMode_CaTrace]],
        ["Tube", this.displayFunction, this, [null, 3, molmil.displayMode_Tube]],
        ["Cartoon", this.displayFunction, this, [null, 3, molmil.displayMode_Cartoon]],
        ["Rocket", this.displayFunction, this, [null, 3, molmil.displayMode_CartoonRocket]],
        ["CG Surface", this.displayFunction, this, [null, 3, molmil.displayMode_ChainSurfaceCG]],
        ["Simple Surface", this.displayFunction, this, [null, 3, molmil.displayMode_ChainSurfaceSimple]],
        ["Hydrogen bonds", this.displayFunction, this, [null, 3, 10001]],
      ]]
    ]],
    ["Color", 0, [
      ["Atom", 0, [
        ["Default", this.colorFunction, this, [null, 1, molmil.colorEntry_Default]],
        ["Structure", this.colorFunction, this, [null, 1, molmil.colorEntry_Structure]],
        ["Atom (CPK)", this.colorFunction, this, [null, 1, molmil.colorEntry_CPK]],
        ["Custom", this.colorFunction, this, [null, 1, molmil.colorEntry_Custom]]
      ]],
      ["Residue", 0, [
        ["Default", this.colorFunction, this, [null, 2, molmil.colorEntry_Default]],
        ["Structure", this.colorFunction, this, [null, 2, molmil.colorEntry_Structure]],
        ["Atom (CPK)", this.colorFunction, this, [null, 2, molmil.colorEntry_CPK]],
        ["Custom", this.colorFunction, this, [null, 2, molmil.colorEntry_Custom]]
      ]],
      ["Residue (cartoon)", 0, [
        ["Structure", this.colorFunction, this, [null, 103, molmil.colorEntry_Structure]],
        ["Custom", this.colorFunction, this, [null, 103, molmil.colorEntry_Custom]]
      ]],
      ["Residue (atoms)", 0, [
        ["Atom (CPK)", this.colorFunction, this, [null, 104, molmil.colorEntry_CPK]],
        ["Custom", this.colorFunction, this, [null, 104, molmil.colorEntry_Custom]]
      ]],
      ["Chain", 0, [
        ["Default", this.colorFunction, this, [null, 3, molmil.colorEntry_Default]],
        ["Structure", this.colorFunction, this, [null, 3, molmil.colorEntry_Structure]],
        ["Atom (CPK)", this.colorFunction, this, [null, 3, molmil.colorEntry_CPK]],
        ["Group", this.colorFunction, this, [null, 3, molmil.colorEntry_Group]],
        ["ABEGO", this.colorFunction, this, [null, 3, molmil.colorEntry_ABEGO]],
        ["Custom", this.colorFunction, this, [null, 3, molmil.colorEntry_Custom]]
      ]],
    ]],
    ["Label", 0, [
      ["Atom", this.labelFunction, this, [null, 1]],
      ["Residue", this.labelFunction, this, [null, 2]],
      ["Chain", this.labelFunction, this, [null, 3]]
    ]]
  ];
  
  this.contextMenuStructuresMenu = [
    [function(payload, structure) {return payload.showWaters ? "Hide waters" : "Show waters";}, function(payload) {
      payload.waterToggle(!payload.showWaters);
      payload.renderer.initBuffers();
      payload.canvas.update = true;
    }, this, [null, 0, 0]],
    [function(payload, structure) {return payload.showHydrogens ? "Hide hydrogens" : "Show hydrogens";}, function(payload) {
      payload.hydrogenToggle(!payload.showHydrogens);
      payload.renderer.initBuffers();
      payload.canvas.update = true;
    }, this, [null, 0, 0]],
  ];
  
  this.contextMenuVRML = [
    [function(payload, structure) {
      if (payload[0].display) {structure[3][2] = molmil.displayMode_None; return "Hide";}
      else {structure[3][2] = molmil.displayMode_Visible; return "Show";}
    }, this.displayFunction, this, [null, 0, 0]]
  ];
  
  this.contextMenuIsosurfaceEntry = [
    [function(payload, structure) {
      if (payload[0].display) {structure[3][2] = molmil.displayMode_None; return "Hide";}
      else {structure[3][2] = molmil.displayMode_Visible; return "Show";}
    }, this.displayFunction, this, [null, 0, 0]],
    ["Color", this.colorFunction, this, [null, 0, 0]],
    ["Isosurface cutoff", this.displayFunction, this, [null, 0, 0]],
    ["Delete", this.deleteMeshFunction, this, [null, 0, 0]],
  ];
  
  this.contextMenuStructuresEntry = [
      ["Display", 0, [
        [function(payload, structure) {
          if (payload instanceof Array) payload = payload[0];
          if (payload.display) {structure[3][2] = molmil.displayMode_None; return "Hidden";}
          else {structure[3][2] = molmil.displayMode_Visible; return "Visible";}
          }, this.displayFunction, this, [null, 4, 0]],
        ["Default", this.displayFunction, this, [null, 4, molmil.displayMode_Default]],
        ["Amino acid", 0, [
          ["Space fill", this.displayFunction, this, [null, 4, molmil.displayMode_Spacefill]],
          ["Ball & stick", this.displayFunction, this, [null, 4, molmil.displayMode_BallStick]],
          ["Stick", this.displayFunction, this, [null, 4, molmil.displayMode_Stick]],
          ["Wireframe", this.displayFunction, this, [null, 4, molmil.displayMode_Wireframe]]
        ]],
        ["Sidechain", 0, [
          ["Space fill", this.displayFunction, this, [null, 4, molmil.displayMode_Spacefill_SC]],
          ["Ball & stick", this.displayFunction, this, [null, 4, molmil.displayMode_BallStick_SC]],
          ["Stick", this.displayFunction, this, [null, 4, molmil.displayMode_Stick_SC]],
          ["Wireframe", this.displayFunction, this, [null, 4, molmil.displayMode_Wireframe_SC]]
        ]],
        ["Ca trace", this.displayFunction, this, [null, 4, molmil.displayMode_CaTrace]],
        ["Tube", this.displayFunction, this, [null, 4, molmil.displayMode_Tube]],
        ["Cartoon", this.displayFunction, this, [null, 4, molmil.displayMode_Cartoon]],
        ["Rocket", this.displayFunction, this, [null, 4, molmil.displayMode_CartoonRocket]],
        ["CG Surface", this.displayFunction, this, [null, 4, molmil.displayMode_ChainSurfaceCG]],
        ["Simple Surface", this.displayFunction, this, [null, 4, molmil.displayMode_ChainSurfaceSimple]],
        ["Hydrogen bonds", this.displayFunction, this, [null, 4, 10001]]
      ]],
      ["Color", 0, [
        ["Default", this.colorFunction, this, [null, 4, molmil.colorEntry_Default]],
        ["Structure", this.colorFunction, this, [null, 4, molmil.colorEntry_Structure]],
        ["Atom (CPK)", this.colorFunction, this, [null, 4, molmil.colorEntry_CPK]],
        ["Group", this.colorFunction, this, [null, 4, molmil.colorEntry_Group]],
        ["ABEGO", this.colorFunction, this, [null, 4, molmil.colorEntry_ABEGO]],
        ["Chain", this.colorFunction, this, [null, 4, molmil.colorEntry_Chain]],
        ["Chain alt", this.colorFunction, this, [null, 4, molmil.colorEntry_ChainAlt]],
        ["Custom", this.colorFunction, this, [null, 4, molmil.colorEntry_Custom]]
      ]],
      ["Label", this.labelFunction, this, [null, 4]],
    ];
  this.contextMenuStructuresChain = [
      ["Display", 0, [
        [function(payload, structure) {
          if (payload.display) {structure[3][2] = molmil.displayMode_None; return "Hidden";}
          else {structure[3][2] = molmil.displayMode_Visible; return "Visible";}
          }, this.displayFunction, this, [null, 3, 0]],
        ["Default", this.displayFunction, this, [null, 3, molmil.displayMode_Default]],
        ["Amino acid", 0, [
          ["Space fill", this.displayFunction, this, [null, 3, molmil.displayMode_Spacefill]],
          ["Ball & stick", this.displayFunction, this, [null, 3, molmil.displayMode_BallStick]],
          ["Stick", this.displayFunction, this, [null, 3, molmil.displayMode_Stick]],
          ["Wireframe", this.displayFunction, this, [null, 3, molmil.displayMode_Wireframe]]
        ]],
        ["Sidechain", 0, [
          ["Space fill", this.displayFunction, this, [null, 3, molmil.displayMode_Spacefill_SC]],
          ["Ball & stick", this.displayFunction, this, [null, 3, molmil.displayMode_BallStick_SC]],
          ["Stick", this.displayFunction, this, [null, 3, molmil.displayMode_Stick_SC]],
          ["Wireframe", this.displayFunction, this, [null, 3, molmil.displayMode_Wireframe_SC]]
        ]],
        ["Ca trace", this.displayFunction, this, [null, 3, molmil.displayMode_CaTrace]],
        ["Tube", this.displayFunction, this, [null, 3, molmil.displayMode_Tube]],
        ["Cartoon", this.displayFunction, this, [null, 3, molmil.displayMode_Cartoon]],
        ["Rocket", this.displayFunction, this, [null, 3, molmil.displayMode_CartoonRocket]],
        ["CG Surface", this.displayFunction, this, [null, 3, molmil.displayMode_ChainSurfaceCG]],
        ["Simple Surface", this.displayFunction, this, [null, 3, molmil.displayMode_ChainSurfaceSimple]],
        ["Hydrogen bonds", this.displayFunction, this, [null, 3, 10001]]
      ]],
      ["Color", 0, [
        ["Default", this.colorFunction, this, [null, 3, molmil.colorEntry_Default]],
        ["Structure", this.colorFunction, this, [null, 3, molmil.colorEntry_Structure]],
        ["Atom (CPK)", this.colorFunction, this, [null, 3, molmil.colorEntry_CPK]],
        ["Group", this.colorFunction, this, [null, 3, molmil.colorEntry_Group]],
        ["ABEGO", this.colorFunction, this, [null, 3, molmil.colorEntry_ABEGO]],
        ["Custom", this.colorFunction, this, [null, 3, molmil.colorEntry_Custom]]
      ]],
      ["Label", this.labelFunction, this, [null, 3]],
    ];
  this.contextMenuStructuresResidue = [
    ["Display", 0, [
      [function(payload, structure) {
        if (payload instanceof Array) payload = payload[0];
        if (payload.display) {structure[3][2] = molmil.displayMode_None; return "Hidden";}
        else {structure[3][2] = molmil.displayMode_Visible; return "Visible";}
      }, this.displayFunction, this, [null, 2, 0]],
      ["Amino acid", 0, [
        ["Space fill", this.displayFunction, this, [null, 2, molmil.displayMode_Spacefill]],
        ["Ball & stick", this.displayFunction, this, [null, 2, molmil.displayMode_BallStick]],
        ["Stick", this.displayFunction, this, [null, 2, molmil.displayMode_Stick]],
        ["Wireframe", this.displayFunction, this, [null, 2, molmil.displayMode_Wireframe]]
      ]],
      ["Sidechain", 0, [
        ["Space fill", this.displayFunction, this, [null, 2, molmil.displayMode_Spacefill]],
        ["Ball & stick", this.displayFunction, this, [null, 2, molmil.displayMode_BallStick]],
        ["Stick", this.displayFunction, this, [null, 2, molmil.displayMode_Stick]],
        ["Wireframe", this.displayFunction, this, [null, 2, molmil.displayMode_Wireframe]]
      ]],
      ["Hydrogen bonds", this.displayFunction, this, [null, 2, 10001]]
    ]],
    ["Color", 0, [
      ["Default", this.colorFunction, this, [null, 2, molmil.colorEntry_Default]],
      ["Structure", this.colorFunction, this, [null, 2, molmil.colorEntry_Structure]],
      ["Atom (CPK)", this.colorFunction, this, [null, 2, molmil.colorEntry_CPK]],
      ["Custom", this.colorFunction, this, [null, 2, molmil.colorEntry_Custom]]
    ]],
    ["Label", this.labelFunction, this, [null, 2]],
  ];
  
  this.contextMenuLabel = [
    [function(payload, structure) {
      structure[3][1] = payload.display ? 0 : 1000;
      return payload.display ? "Hidden" : "Visible";
    }, this.labelFunction, this, [null, 0]],
    ["Edit", this.labelFunction, this, [null, 0.5]],
    ["Delete", this.labelFunction, this, [null, -1]]
  ];
  
  
  // build the structure
  
  this.complexMenu = molmil_dep.dcE("table");
  this.complexMenu.id = "molmil_UI_complexMenu";
  this.complexMenu.style.display = "none";
  
  this.complexMenu.titleDIV = this.complexMenu.pushNode("tr").pushNode("td");
  this.complexMenu.titleDIV.colSpan = 2;
  var tmp = this.complexMenu.pushNode("tr");
  this.complexMenu.previousButton = tmp.pushNode("td");
  this.complexMenu.menuList = tmp.pushNode("td");
  
  document.body.appendChild(this.complexMenu);
  
  this.complexMenu.previousButton.UI = this;
};


// structure is an array of:
// ["text", nextCall, selfObj, args]
molmil.UI.prototype.buildComplexMenu = function(title, structure, previousCall, payload) {
  this.complexMenu.style.display = "";
  molmil_dep.Clear(this.complexMenu.menuList);
  
  if (! previousCall) {
    // calculate correct position

    var delta = 0;
    var mw = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    if (mw < this.complexMenu.position[2]+(molmil_dep.fontSize*15)) delta = (this.complexMenu.position[2]+(molmil_dep.fontSize*15))-mw;

    this.complexMenu.style.left = this.complexMenu.position[0]-delta+"px";
    this.complexMenu.style.top = this.complexMenu.position[1]+(molmil_dep.fontSize*.67)+(document.documentElement.scrollTop || 0)+"px";
    
    this.complexMenu.title.innerHTML = "";
    
    this.complexMenu.previousButton.style.visibility = "hidden";
    this.complexMenu.previousButton.onclick = null;
    
    document.body.onmousedown = function(ev) {
      var obj = document.getElementById("molmil_UI_complexMenu");
      if (obj.contains(ev.target)) return;
      obj.style.display = "none";
      document.body.onmousedown = null;
    };
  }
  else {
    this.complexMenu.previousButton.style.visibility = "";
    this.complexMenu.previousButton.onclick = function() {this.UI.buildComplexMenu.apply(this.UI, previousCall);};
  }
  this.complexMenu.previousButton.innerHTML = "<<br/><<br/><";
  
  
  this.complexMenu.previousCall = previousCall;
  if (title) this.complexMenu.titleDIV.innerHTML = title;
  
  // each item contains:
  //  - title for the item
  //  - function to call || 0 (=> next menu level)
  //  - selfObj || title for next menu
  //  - arguments || items for next menu
  var i, item;
  for (i=0; i<structure.length; i++) {
    item = this.complexMenu.menuList.pushNode("div");
    item.UI = this; item.structure = structure[i];
    if (typeof structure[i][0] == "function") item.text = item.pushNode("span", structure[i][0].apply(this, [payload, structure[i]])); // if structure[i][0] is a function -> execute this function
    else item.text = item.pushNode("span", structure[i][0]);
    item.button = item.pushNode("span", structure[i][1] ? "&nbsp;" : ">");
    item.onclick = function() {
      if (! this.structure[1]) this.UI.buildComplexMenu((this.UI.complexMenu.titleDIV.innerHTML ? this.UI.complexMenu.titleDIV.innerHTML + " > " : "") + this.structure[0], this.structure[2], [title, structure, previousCall, payload], payload);
      else {
        this.UI.complexMenu.style.display = "none"; // external command: close the popup
        this.structure[3][0] = payload;
        this.structure[1].apply(this.structure[2], this.structure[3]);
      }
    };
  }
  
  this.complexMenu.display = "";
  
  
};

