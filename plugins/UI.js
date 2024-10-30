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
  if (! this.canvas.parentNode.classList.contains("molmil_UI_container")) {
    var container = molmil_dep.dcE("span"); container.classList.add("molmil_UI_container");
    this.canvas.parentNode.replaceChild(container, this.canvas);
    container.pushNode(this.canvas);
  }
  
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
    title = (sgl ? atom.atomName : atom.element) + " - " + (sgl ? (atom.molecule.name || "") + " " : "") + (atom.molecule.RSID || "") + (  atom.chain.name ? " - Chain " + atom.chain.name : "") + " - " + atom.chain.entry.meta.idnr + (atom.customText ? " - "+atom.customText : "");
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
      item.className = "UI_entryItem";
      item.plus = item.pushNode("a", "+");
      item.plus.className = "optCat_p";
      item.name = item.pushNode("a", file.meta.id + " ("+file.meta.idnr+")");
      item.name.title = "Left click to expand\nRight click to show the context menu for display & color options";
      item.name.className = "optCat_n";
      item.style.color = file.display ? "" : "lightgrey"
      item.plus.onclick = item.name.onclick = function(ev) {
        if (ev.ctrlKey || ev.metaKey) {
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
      // if item.options.length > 1 => show menu to select sub-components (e.g. mpbf large structures)
      
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
    if (chain.authName && chain.authName != saa) saa += " ("+chain.authName+")";
    item.name = item.pushNode("a", saa);
    item.name.title = "Left click to expand\nRight click to show the context menu for display & color options";
    item.name.className = "optCat_n";
    if (chain.display) item.style.color = "";
    item.style.color = chain.display ? "" : "lightgrey"
    item.plus.onclick = item.name.onclick = function(ev) {
      if (ev.ctrlKey || ev.metaKey) {
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
  var UI = this;
  if (molmil.VRstatus === void 0) return molmil.initVR(null, function() {UI.showLM(icon);});
  
  try {
    if (icon.parentNode.childNodes.length > 1) {
      icon.parentNode.removeChild(icon.nextSibling); icon.parentNode.removeChild(icon.nextSibling); 
      if (this.onLMhide) this.onLMhide();
      return;
    }
  }
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

    

    if ((this.UI.soup.structures.length ? this.UI.soup.structures[0].number_of_frames : 0) > 1 && (window.initVideo !== undefined || molmil.settings.molmil_video_url !== undefined || window.SharedArrayBuffer !== undefined)) {
      e = this.menu.sub.pushNode("div", "MP4 video", "molmil_UI_ME");
      e.UI = this.UI;
      e.onclick = function() {molmil.initVideo(this.UI);};
    }

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
  e.innerHTML = "Style IF";
  e.title = "Opens Molmil's styling interface";
  e.onclick = function() {this.LM.onclick(); UI.styleif("structure");};
  
  e = menu.appendChild(document.createElement("div")); e.UI = this; e.LM = icon;
  e.className = "molmil_UI_ME";
  e.innerHTML = "Settings";
  e.title = "Opens Molmil's advanced settings panel";
  e.onclick = function() {this.LM.onclick(); UI.styleif("settings");};
  
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
  
  e = menu.appendChild(document.createElement("div")); e.UI = this;
  e.className = "molmil_UI_ME";
  e.innerHTML = "Paper"; e.LM = icon;
  e.onclick = function() {window.open("https://doi.org/10.1186/s13321-016-0155-1"); this.LM.onclick();};

  icon.parentNode.appendChild(menu);
  menu.sub = icon.parentNode.appendChild(document.createElement("div"));
  menu.sub.className = "molmil_UI_LM";
  menu.sub.style.display = "none";
  
  if (this.onLMshow) this.onLMshow();
};

molmil.UI.prototype.view=function(sub) {
  molmil_dep.Clear(sub);
  var e, UI = this;
  sub.style.display = "";
  e = sub.pushNode("div", "Reset zoom", "molmil_UI_ME");
  e.onclick = function() {
    if (UI.LM && UI.LM.parentNode.childNodes.length > 1) UI.LM.onclick();
    UI.soup.renderer.camera.z = UI.soup.calcZ();
    UI.soup.canvas.update = true;
  };
  
  if (! this.soup.AisB) {
    e = sub.pushNode("div", "Configure BU", "molmil_UI_ME");
    e.onclick = function() {
      UI.styleif("bu");
      if (UI.LM && UI.LM.parentNode.childNodes.length > 1) UI.LM.onclick();
      if (UI.onLMshow) UI.onLMshow();
    };
  }
}

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
    if (this.onLMhide) this.onLMhide();
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
  if (this.onLMshow) this.onLMshow();
  
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

  var UI = this;
  popup.cancel.onclick = function() {this.popup.parentNode.removeChild(this.popup); if (UI.onLMhide) UI.onLMhide(); if (oncancel) oncancel();};
  popup.cancel.popup = popup;

  if (this.LM) this.LM.parentNode.pushNode(popup);
  
  return popup;
  
};

molmil.UI.prototype.openID=function(dbid) {
  if (this.LM && this.LM.parentNode.childNodes.length > 1) this.LM.onclick();
  if (this.onLMshow) this.onLMshow();
  
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
      molmil.commandLines.pyMol.repr("au", "");
      UI.styleif("structure");
      molmil.checkRebuild();
      UI.resetRM();
    });
    popup.cancel.onclick();
  };
  popup.inp.cancel = popup.cancel = popup.pushNode("button", "Cancel");
  popup.cancel.onclick = function() {this.popup.parentNode.removeChild(this.popup); if (UI.onLMhide) UI.onLMhide();};
  popup.cancel.popup = popup;
  
  this.LM.parentNode.pushNode(popup);
  
  popup.inp.focus();
}

molmil.UI.prototype.savePNG=function() {
  if (this.LM && this.LM.parentNode.childNodes.length > 1) this.LM.onclick();
  if (this.onLMshow) this.onLMshow();
  
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
  var UI = this;
  popup.cancel.onclick = function() {this.popup.parentNode.removeChild(this.popup); if (UI.onLMhide) UI.onLMhide();};
  popup.cancel.popup = popup;
  
  popup.range.onmousemove();
  
  this.LM.parentNode.pushNode(popup);
}


molmil.UI.prototype.videoRenderer=function(justStart) {
  if (this.LM && this.LM.parentNode.childNodes.length > 1) this.LM.onclick();
  if (this.onLMshow) this.onLMshow();
  
  var videoID = null;
  
  this.canvas.renderer.onRenderFinish = function() {
    if (! videoID) return;
    
    if (window.addFrameCanvas) addFrameCanvas(this.canvas);
    else if (window.addFrame) addFrame(this.canvas.toDataURL());
    else {
      var req = new molmil_dep.CallRemote("POST");
      req.AddParameter("id", videoID);
      req.AddParameter("data", this.canvas.toDataURL());
      req.Send(molmil.settings.molmil_video_url+"addFrame");
    }
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
    this.canvas.molmilViewer.animation.pause();
    this.canvas.molmilViewer.animation.beginning();
    this.canvas.molmilViewer.animation.play();
  }
    
  
  popup.endVideo = function() {
    if (this.canvas.molmilViewer.animation.playing) molmil_dep.asyncStart(this.endVideo, [], this, 250);
    else {
      this.canvas.renderer.selectDefaultContext();
      molmil.settings.recordingMode = false;
      if (window.finalizeVideo) finalizeVideo();
      else {
        var req = new molmil_dep.CallRemote("GET");
        req.AddParameter("id", videoID);
        req.Send(molmil.settings.molmil_video_url+"deInitVideo");
        if (molmil.settings.systemName) window.location = molmil.settings.molmil_video_url+"getVideo?id="+videoID+"&filename="+molmil.settings.systemName+".mp4";
        else window.location = molmil.settings.molmil_video_url+"getVideo?id="+videoID;
        popup.cancel.onclick();
      }
      videoID = null;
    }
  }


  popup.record.onclick = function() {
    popup.innerHTML = "Rendering & encoding MP4 file...";
    popup.wasplaying = this.canvas.molmilViewer.animation.TID != null;
    // make sure that both the width & height are divisible by 2 (ffmpeg issue)
    var w = this.canvas.width, h = this.canvas.height;
    if (w%2 == 1) w--;
    if (h%2 == 1) h--;
    molmil.settings.recordingMode = true;
    this.canvas.renderer.selectDataContext();
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
    this.canvas.molmilViewer.animation.pause();
    this.canvas.molmilViewer.animation.beginning();
    this.canvas.molmilViewer.animation.play();
    this.popup.endVideo();
  }
  
  popup.cancel = popup.pushNode("button", "Cancel");
  popup.cancel.canvas = this.canvas;
  popup.cancel.onclick = function() {
    this.canvas.molmilViewer.animation.end();
    if (popup.wasplaying) {
      this.canvas.molmilViewer.animation.beginning();
      this.canvas.molmilViewer.animation.play();
    }
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
    ev.preventDefault();
    processFiles(ev.dataTransfer.items, ev.dataTransfer.files);
    return false;
  }
  
  var pasteDB = function(ev) {
    if (ev.srcElement.className.includes("molmil_UI_cl_input")) return;
    ev.preventDefault();
    processFiles([], ev.clipboardData.files);
  };
  
  var processFiles = function(files, files2) {
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
          file = dict[items[i]];
          if (file instanceof File) {
            fr = new FileReader();
            fr.filename = file.name;
            fr.fileHandle = file;
          }
          else fr = file;
          canvas.mjs_fileBin[items[i]] = fr;
        }
        mjsFunc(canvas, canvas.mjs_fileBin[mjsFile]);
        return false;
      }
      nfilesproc[1] = count;

      for (i=0; i<count; i++) {
        file = dict[items[i]];
        if (file instanceof File) {
          fr = new FileReader();
          fr.filename = file.name;
          fr.fileHandle = file;
        }
        else fr = file;
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
    
    for (var i=0; i<files.length; i++) {
      item = files[i];
      if (item.kind != 'file') continue;
      if (item.getAsEntry) entry = item.getAsEntry();
      else if (item.webkitGetAsEntry) entry = item.webkitGetAsEntry();
      else {dict = null; break;} // not supported
      processEntry(entry);
    }

    if (dict == null || files.length == 0) {
      var count = 0, files = [];
      try {
        files = files2;
        count = files.length;
      } catch (e) {}
      
      var dict = {};
      for (i=0; i<count; i++) dict[files[i].name] = files[i];
      bakacheck();
    }
  };
  
  

  window.addEventListener("paste", pasteDB);
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
  
  // .zip file
  canvas.inputFunctions.push(function(canvas, fr) {
    if (fr.filename.endsWith(".zip")) {
      if (! window.hasOwnProperty("unzip")) {var obj = molmil_dep.dcE("script"); obj.src = molmil.settings.src+"lib/unzipit.min.js"; document.getElementsByTagName("head")[0].appendChild(obj);}
      fr.onload = function(e) {
        if (! window.hasOwnProperty("unzipit")) return molmil_dep.asyncStart(this.onload, [e], this, 50);
        unzipit.unzip(e.target.result).then(function(zipfile) {
          var files = Object.values(zipfile.entries), files2 = [];
          for (var f=0; f<files.length; f++) {
            if (files[f].isDirectory) continue;
            files2.push({
              name: files[f].name,
              filename: files[f].name,
              fileObj: files[f],
              onload: function() {},
              readAsText: function() {
                var fobj = this;
                this.fileObj.text().then(function(data) {fobj.onload({target: {result: data}});});
              },
              readAsArrayBuffer: function() {
                var fobj = this;
                this.fileObj.arrayBuffer().then(function(data) {fobj.onload({target: {result: data}});});
              }
            });
          }
          processFiles([], files2);
          canvas.molmilViewer.downloadInProgress = false;
        });
      }
      fr.readAsArrayBuffer(fr.fileHandle);
      canvas.molmilViewer.downloadInProgress = true;
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
};


// ** video support **
molmil.initVideo = function(UI) {
  if (window.initVideo) {
    molmil_dep.asyncStart(UI.videoRenderer, [], UI, 0);
    return;
  }
  if (molmil.settings.molmil_video_url === undefined && window.SharedArrayBuffer !== undefined) {
    var head = document.getElementsByTagName("head")[0];
    var obj = molmil_dep.dcE("script"); obj.src = molmil.settings.src+"lib/ffmpeg_handler.js"; 
    obj.onload = function() {UI.videoRenderer();};
    head.appendChild(obj);
    return;
  }
  if (molmil.settings.molmil_video_url === undefined) {
    console.error("Current configuration is not compatible with video output...");
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
    if (this.soup.frameInfo) this.infoBox.timeBox.innerHTML = this.soup.frameInfo[this.frameNo][1].toFixed(1)+" ps ("+(this.frameNo+1)+")";
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
  if (molmil.settings.recordingMode) this.renderer.render();
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
  if (molmil.settings.recordingMode) this.renderer.render();
};

molmil.animationObj.prototype.forwardRenderer = function() {
  if (this.number_of_frames < 2) return;
  this.frameNo += 1;
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
    if (molmil.settings.recordingMode) this.renderer.render();
  }
};

molmil.animationObj.prototype.backwardRenderer = function() {
  if (this.number_of_frames < 2) return;
  this.frameNo -= 1;
  if (this.frameNo < 0) {
    if (this.motionMode == 3 && ! molmil.settings.recordingMode) {this.frameNo += 1; return this.forwardRenderer();}
    else this.playing = false;
  }
  else {
    this.renderer.selectFrame(this.frameNo, this.detail_or);
    this.soup.canvas.update = true;
    this.TID = molmil_dep.asyncStart(this.backwardRenderer, [], this, this.delay);
    this.frameAction();
    this.updateInfoBox();
    if (molmil.settings.recordingMode) this.renderer.render();
  }
};


// new UI:
//  - code wise, better structured
//  - slide-based menu (no hierarchal display)



molmil.UI.prototype.meshOptionsFunction = function(payload, lv, mode) {
  if (! (payload instanceof Array)) payload = [payload];
  var mesh = payload[0], UI = this;
  if (! (mesh instanceof molmil.polygonObject)) mesh = mesh.structures[0];
  
  UI.styleif_mesh(mesh, {clientX: window.innerWidth*.25, clientY: window.innerHeight*.25}, {ondelete: function() {
    UI.deleteMeshFunction(payload);
  }});
  
  this.resetRM();
};

molmil.UI.prototype.deleteMeshFunction = function(payload, lv, mode) {
  if (! (payload instanceof Array)) payload = [payload];
  
  var tmp = [];
  for (var f=0; f<payload.length; f++) {
    if (payload[f].structures === undefined) tmp.push(payload[f]);
    else {
    for (var s=0; s<payload[f].structures.length; s++) if (payload[f].structures[s] instanceof molmil.polygonObject) {
      tmp.push(payload[f].structures[s]);
      payload[f].structures[s].refref = payload[f];
    }
    }
  }
  payload = tmp;
  
  var files = this.soup.structures;
  
  for (var f=0; f<payload.length; f++) {
    var pnames = Object.keys(payload[f].programs);
    for (var p=0; p<pnames.length; p++) this.soup.renderer.removeProgram(payload[f].programs[pnames[p]]);
    var idx = files.indexOf(payload[f]);
    if (idx != -1) this.soup.structures.splice(idx, 1);
    else {
      idx = files.indexOf(payload[f].refref);
      if (idx != -1) this.soup.structures.splice(idx, 1);
    }
  }
  
  this.soup.renderer.canvas.update = true;
  this.resetRM();
}

molmil.UI.prototype.displayFunction = function(payload, lv, mode) {
  if (! (payload instanceof Array)) payload = [payload]
  
  var tmp = [];
  for (var f=0; f<payload.length; f++) {
    if (payload[f].structures === undefined) tmp.push(payload[f]);
    else {
      for (var s=0; s<payload[f].structures.length; s++) if (payload[f].structures[s] instanceof molmil.polygonObject) tmp.push(payload[f].structures[s]);
    }
  }
  payload = tmp;
  
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
    payload[0].remove();
    this.soup.canvas.update = true;
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
      var obj = payload[0].structures === undefined ? payload[0] : payload[0].structures[0];
      if (obj.display) {structure[3][2] = molmil.displayMode_None; return "Hide";}
      else {structure[3][2] = molmil.displayMode_Visible; return "Show";}
    }, this.displayFunction, this, [null, 0, 0]],
    ["Options", this.meshOptionsFunction, this, [null, 0, 0]],
    ["Delete", this.deleteMeshFunction, this, [null, 0, 0]]
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

molmil.UI.prototype.styleif_au = function(contentBox) {
  var UI = this;
  
  contentBox.pushNode("h1", "Structure styling options");
  contentBox.pushNode("hr");
  
  contentBox.pushNode("b", "Quick styling options: ");
  
  
  var styleSelect = contentBox.pushNode("select"), tmp;
  
  tmp = styleSelect.pushNode("option", "Style"); tmp.disabled = true; tmp.value = "placeholder"; tmp.style.display = "none";
  tmp = styleSelect.pushNode("option", "Cartoon"); tmp.value = molmil.displayMode_Default;
  tmp = styleSelect.pushNode("option", "Cartoon with sidechains"); tmp.value = molmil.displayMode_Stick_SC;
  tmp = styleSelect.pushNode("option", "Sticks"); tmp.value = molmil.displayMode_Stick;
  tmp = styleSelect.pushNode("option", "Wireframe"); tmp.value = molmil.displayMode_Wireframe;


  contentBox.pushNode("span", "&nbsp;");
  var colorSelect = contentBox.pushNode("select");
  
  tmp = colorSelect.pushNode("option", "Color"); tmp.disabled = true; tmp.value = "placeholder"; tmp.style.display = "none";
  tmp = colorSelect.pushNode("option", "Group"); tmp.value = 0;
  tmp = colorSelect.pushNode("option", "Structure"); tmp.value = 1;
  tmp = colorSelect.pushNode("option", "Chain"); tmp.value = 2;
  tmp = colorSelect.pushNode("option", "Entity"); tmp.value = 3;
  tmp = colorSelect.pushNode("option", "B-factor"); tmp.value = 4;

  styleSelect.oninput = function() {
    if (styleSelect.value == "placeholder") return;
    if (styleSelect.value == molmil.displayMode_Stick_SC) molmil.displayEntry(UI.soup.structures, molmil.displayMode_Default, false, UI.soup, {newweb: true});
    molmil.displayEntry(UI.soup.structures, styleSelect.value, true, UI.soup, {newweb: true});
    styleSelect.value = "placeholder";
  }
  
  colorSelect.oninput = function() {
    if (colorSelect.value == "placeholder") return;
    if (colorSelect.value == 1) molmil.colorEntry(UI.soup.structures, molmil.colorEntry_Default, null, true, UI.soup);
    else if (colorSelect.value == 2) molmil.colorEntry(UI.soup.structures, molmil.colorEntry_ChainAlt, {carbonOnly: true}, true, UI.soup);
    else if (colorSelect.value == 3) molmil.colorEntry(UI.soup.structures, molmil.colorEntry_Entity, {carbonOnly: true}, true, UI.soup);
    else if (colorSelect.value == 0) {
      var c, chain, m, mol, a, list;
      for (c=0; c<UI.soup.chains.length; c++) {
        chain = UI.soup.chains[c];
        if (chain.molecules.length > 1) list = molmil.interpolateBR(chain.molecules.length);
        else list = [[255, 255, 255, 255]];
        for (m=0; m<chain.molecules.length; m++) {
          mol = chain.molecules[m];
          mol.rgba = list[m];
          for (a=0; a<mol.atoms.length; a++) mol.atoms[a].rgba = molmil_dep.getKeyFromObject(molmil.configBox.elementColors, mol.atoms[a].element, molmil.configBox.elementColors.DUMMY);
        }
      }
      UI.soup.renderer.initBuffers();
      UI.soup.renderer.canvas.update = true; 
    }
    else if (colorSelect.value == 4) {
      var selection = [];
      for (var s=0; s<UI.soup.structures.length; s++) {
        var obj = UI.soup.structures[s];
        for (c=0; c<obj.chains.length; c++) {
          chain = obj.chains[c];
          for (a=0; a<chain.atoms.length; a++) selection.push(chain.atoms[a]);
        }
      }
      var values = []
      for (var i=0; i<selection.length; i++) values.push(selection[i].Bfactor);
      if (molmil.configBox.bfactor_low != undefined) var min = molmil.configBox.bfactor_low;
      else var min = Math.min.apply(null, values);
      if (molmil.configBox.bfactor_high != undefined) var max = molmil.configBox.bfactor_high;
      else var max = Math.max.apply(null, values); 
      var diffInv = 1./(max-min), tmp;
      for (var i=0; i<selection.length; i++) {
        tmp = 1-((values[i]-min)*diffInv); ///TODO
        selection[i].rgba = molmil.hslToRgb123(tmp*(2/3), 1.0, 0.5); selection[i].rgba[0] *= 255; selection[i].rgba[1] *= 255; selection[i].rgba[2] *= 255; selection[i].rgba.push(255);
        if (selection[i].molecule.CA == selection[i]) selection[i].molecule.rgba = selection[i].rgba;
      }
      UI.soup.renderer.initBuffers();
      UI.soup.renderer.canvas.update = true; 
    }
    colorSelect.value = "placeholder";
  }
  
  contentBox.pushNode("br");
  
  contentBox.pushNode("b", "Quick operations:");
  
  ul = contentBox.pushNode("span");
  opt = ul.pushNode("button", "Reposition camera");
  opt.onclick = function() {
    UI.soup.renderer.camera.reset();
    UI.soup.renderer.camera.z = UI.soup.calcZ();
    UI.canvas.update = true;
  };
  
  opt = ul.pushNode("button", "Orient camera to structure");
  opt.onclick = function() {
    molmil.orient(null, UI.soup);
    UI.canvas.update = true;
  };
  
  if (navigator.clipboard) {
    opt = ul.pushNode("button", "Copy image to clipboard");
    opt.onclick = function() {
      if (molmil.configBox.stereoMode != 1 && ! molmil.configBox.keepBackgroundColor) {
        var opacity = molmil.configBox.BGCOLOR[3]; molmil.configBox.BGCOLOR[3] = 0;
      }
      var canvas = molmil.fetchCanvas();
      canvas.renderer.selectDataContext();
      canvas.update = true;
      canvas.renderer.render();
      canvas.toBlob(function(blob) {
        navigator.clipboard.write([new ClipboardItem({"image/png": blob})]);
        console.log("Image pasted to clipboard.");
      });
      canvas.renderer.selectDefaultContext();
      if (molmil.configBox.stereoMode != 1 && ! molmil.configBox.keepBackgroundColor) molmil.configBox.BGCOLOR[3] = opacity;
      canvas.update = true; canvas.renderer.render();
    };
    
    
    opt = ul.pushNode("button", "Copy URL for current orientation to clipboard");
    opt.onclick = function() {
      var x = UI.soup.renderer.camera.QView[0], y = UI.soup.renderer.camera.QView[1], z = UI.soup.renderer.camera.QView[2], w = UI.soup.renderer.camera.QView[3], t0, t1, X, Y, Z;
      
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
      
      var command = window.location + "; view null; turn x, "+X+"; turn y, "+Y+"; turn z, "+Z+"; move x, "+UI.soup.renderer.camera.x+"; move y, "+UI.soup.renderer.camera.y+"; move z, "+UI.soup.renderer.camera.z+";"
      
      navigator.clipboard.writeText(command);
      
    };
    
  }
  
  contentBox.pushNode("br");
  
  contentBox.pushNode("span", "For more advanced styling, please use the command line (bottom of the page), the structure menu (right-side of the page) or right-click on an atom/cartoon to show a context menu with styling options. Also, see <a href=\""+molmil.settings.src+"manual.html#style-interface\" target=\"_blank\">our manual</a> or <a href=\"https://doi.org/10.1002/pro.4211\" target=\"blank\">our recent paper</a> for more information.");
};

molmil.UI.prototype.styleif_bu = function(contentBox, afterDL) {
  var UI = this;
  
  if (! this.soup.AisB && ! molmil.figureOutAssemblyId) {
    this.soup.downloadInProgress++;
    return molmil.loadPlugin(molmil.settings.src+"plugins/misc.js", UI.styleif_bu, UI, [contentBox, true]);
  }
  if (afterDL) delete this.soup.downloadInProgress--;
  
  contentBox.pushNode("h1", "Biological unit styling options");
  contentBox.pushNode("hr");
  
  if (this.soup.AisB) {
    contentBox.pushNode("span", "For this entry, the biological unit corresponds to the assymetric unit.")
    return;
  }

  if (! this.soup.sceneBU) {
    var sceneBU = molmil.buCheck(molmil.figureOutAssemblyId(this.soup.pdbxData, this.soup.structures[0].BUassemblies), 3, 2, null, this.soup);
    if (sceneBU.NOC > 1 && sceneBU.isBU && (sceneBU.type == 2 || sceneBU.size > 30000)) sceneBU.displayMode = 5;
    else sceneBU.displayMode = 3;
    sceneBU.colorMode = 2;
    molmil.selectBU(sceneBU.assembly_id, sceneBU.displayMode, sceneBU.colorMode, {orient: true}, this.soup.structures.slice(-1)[0], this.soup);
  }

  var assembly = this.soup.sceneBU.assembly_id;
  var rm = [this.soup.sceneBU.displayMode, this.soup.sceneBU.colorMode];

  var table = contentBox.pushNode("table"), tr, td;
  var US, BUrm;
  
  tr = table.pushNode("tr");
  td = tr.pushNode("td", "Unit selection:");
  
  US = tr.pushNode("td").pushNode("select");
  
  
  var soup = this.soup;
  var struct = soup.structures[0];
  var noc = 0, i, c, tmp, MW = 0;
  

  var asym2mw = {};
  if (struct.meta.pdbxData.struct_asym && struct.meta.pdbxData.struct_asym && struct.meta.pdbxData.entity) {
    for (c=0; c<struct.meta.pdbxData.struct_asym.entity_id.length; c++) asym2mw[struct.meta.pdbxData.struct_asym.id[c]] = struct.meta.pdbxData.entity.formula_weight[struct.meta.pdbxData.entity.id.indexOf(struct.meta.pdbxData.struct_asym.entity_id[c])];
  }

  for (c=0; c<soup.chains.length; c++) {
    if (soup.poly_asym_ids.indexOf(soup.chains[c].name) != -1) noc++;
    MW += asym2mw[soup.chains[c].name] || 0;
  }
  
  

  td = US.pushNode("option", "Asymmetric unit (%NOC chains, %D D)".replace("%NOC", noc).replace("%D", molmil_dep.Rounding(MW, 2))); td.value = -1;
  
  
  // calculate molecular weight of each unit....
  
  var assembly_id = -1, tmp2;
  if (Object.keys(struct.BUmatrices).length > 1 || Object.keys(struct.BUassemblies).length > 1) {
    for (var e in struct.BUassemblies) {
      noc = 0;
      MW = 0;
      for (i=0; i<struct.BUassemblies[e].length; i++) {
        tmp = 0;
        tmp2 = 0;
        for (c=0; c<struct.BUassemblies[e][i][1].length; c++) {
          if (soup.poly_asym_ids.indexOf(struct.BUassemblies[e][i][1][c]) != -1) tmp++;
          tmp2 += asym2mw[struct.BUassemblies[e][i][1][c]] || 0;
        }
        noc += tmp*struct.BUassemblies[e][i][0].length;
        MW += tmp2*struct.BUassemblies[e][i][0].length;
      }
      var idx = struct.meta.pdbxData && struct.meta.pdbxData.pdbx_struct_assembly && struct.meta.pdbxData.pdbx_struct_assembly.id ? struct.meta.pdbxData.pdbx_struct_assembly.id.indexOf(e) : -1;
      var txt = "";
      if (idx != -1) {
        txt = struct.meta.pdbxData.pdbx_struct_assembly.details[idx];
        txt = txt.charAt(0).toUpperCase() + txt.slice(1);
        txt += " (%NOC chains, %D D)".replace("%NOC", noc).replace("%D", molmil_dep.Rounding(MW, 2));
      }
      else {
        txt = "Biological unit %N (%NOC chains, %D D)".replace("%NOC", noc).replace("%D", molmil_dep.Rounding(MW, 2));
      }
      td = US.pushNode("option", txt); td.value = e;
    }
    if (assembly && (assembly == -1 || struct.BUassemblies.hasOwnProperty(assembly))) assembly_id = assembly;
    else {
      assembly = figureOutAssemblyId(soup.pdbxData, struct.BUassemblies);
      if (struct.BUassemblies.hasOwnProperty(assembly)) assembly_id = assembly;
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
  
  tr = table.pushNode("tr");
  
  td = tr.pushNode("td", "Save BU as:");
  td = tr.pushNode("td");
  
  var save = td.pushNode("button");
  save.innerHTML = "mmJSON";
  save.onclick = function() {molmil.saveBU(soup.sceneBU.assembly_id, {format: "mmjson"}, null, soup);};
  
  save = td.pushNode("button");
  save.innerHTML = "mmCIF";
  save.onclick = function() {molmil.saveBU(soup.sceneBU.assembly_id, {format: "mmcif"}, null, soup);};
  
  save = td.pushNode("button");
  save.innerHTML = "PDB";
  save.onclick = function() {molmil.saveBU(soup.sceneBU.assembly_id, {format: "pdb"}, null, soup);};
  
};

molmil.UI.prototype.styleif_cc = function(contentBox, afterDL) {
  var UI = this;
  
  contentBox.pushNode("h1", "Chemical component styling options");
  contentBox.pushNode("hr");
  
  var ul = contentBox.pushNode("div"), opt;
  var showHbtn = opt = ul.pushNode("button", "Show hydrogens");
  opt.onclick = function() {
    if (! UI.soup.showHydrogens) {
      UI.soup.hydrogenToggle(true);
      this.innerHTML = "Hide hydrogens";
    }
    else {
      UI.soup.hydrogenToggle(false);
      this.innerHTML = "Show hydrogens";
    }

    UI.soup.renderer.initBuffers();
    UI.soup.canvas.update = true;
  };
  
  ul.pushNode("br");
  
  var labels;
  opt = ul.pushNode("button", "Show atom labels");
  opt.onclick = function() {
    if (labels === undefined) {
      labels = molmil.commandLines.pyMol.label.apply(UI.canvas.commandLine.environment, ["all", '"%s"%(name)']);
      for (var i=0; i<labels.length; i++) {labels[i].display = true; labels[i].status = false;}
    }
    if (this.innerHTML == "Show atom labels") {
      for (var i=0; i<labels.length; i++) {
        if (labels[i].settings.atomSelection[0].element == "H" && ! UI.soup.showHydrogens) labels[i].display = false;
        else labels[i].display = true;
        labels[i].status = false;
      }
      this.innerHTML = "Hide atom labels";
    }
    else {
      for (var i=0; i<labels.length; i++) labels[i].display = labels[i].status = false;
      this.innerHTML = "Show atom labels";
    }
    
    UI.soup.renderer.canvas.update = true;
  };
  
  contentBox.pushNode("br");
};

molmil.UI.prototype.drag_panel = function(title, top, left) {
  var div = molmil_dep.dcE("div");
  div.classList.add("dragdiv");
  var titlediv = div.pushNode("div", title);
  div.close = function() {this.parentNode.removeChild(this);};
  
  var posx, posy;
  
  var stopdragMe = function() {
    document.onmouseup = molmil.handle_molmilViewer_mouseUp;
    document.onmousemove = molmil.handle_molmilViewer_mouseMove;
  };
  
  var dragMe = function(ev) {
    ev.preventDefault();
    
    var dx = posx - ev.clientX;
    var dy = posy - ev.clientY;
    posx = ev.clientX;
    posy = ev.clientY;
    
    div.style.top = (div.offsetTop - dy)+"px";
    div.style.left = (div.offsetLeft - dx)+"px";
  };
  
  titlediv.onmousedown = function(ev) {
    ev.preventDefault();
    posx = ev.clientX;
    posy = ev.clientY;
    document.onmouseup = stopdragMe;
    document.onmousemove = dragMe;
  };

  div.style.top = top+"px";
  div.style.left = left+"px";
  
  document.documentElement.pushNode(div);
  
  return div;
}

molmil.UI.prototype.styleif_mesh = function(mesh, ev, options) {
  var UI = this; 
  
  var fname = options.filename||mesh.meta.filename;
  if (document.getElementById("mesh_options_for_"+fname)) return;
  
  var div = UI.drag_panel("Mesh options for "+fname, ev.clientY+6, ev.clientX+6);
  div.id = "mesh_options_for_"+fname;
  
  var settings = mesh.programs[0].settings;
  
  var cont, item;
  
  cont = div.pushNode("span");
  item = cont.pushNode("label");
  var wf_mode = item.pushNode(molmil_dep.createINPUT("radio", "mode", "wireframe"));
  item.pushNode(document.createTextNode("Wireframe"));
  if (! settings.solid) wf_mode.checked = true;
  item.onclick = function() {
    if (! settings.solid) return;
    mesh.programs[0].toggleWF();
    UI.soup.renderer.canvas.update = true;
    transp.disabled = true;
  }

  item = cont.pushNode("label");
  var solid_mode = item.pushNode(molmil_dep.createINPUT("radio", "mode", "solid"));
  item.pushNode(document.createTextNode("Solid"));
  if (settings.solid) solid_mode.checked = true;
  item.onclick = function() {
    if (settings.solid) return;
    if (! ("alphaSet" in settings)) settings.alphaSet = 1.0;
    mesh.programs[0].toggleWF();
    UI.soup.renderer.canvas.update = true;
    transp.disabled = false;
  }
  
  if (settings.rgba) {
    cont = div.pushNode("div");
    item = cont.pushNode("input");
    item.type = "color";
    item.value = molmil.rgb2hex(settings.rgba[0], settings.rgba[1], settings.rgba[2]);
    item.oninput = function() {
      var rgb = molmil.hex2rgb(this.value);
      settings.rgba[0] = rgb[0]; settings.rgba[1] = rgb[1]; settings.rgba[2] = rgb[2];
      UI.soup.renderer.canvas.update = true;
    }
  }

  cont = div.pushNode("div");
  item = cont.pushNode("span", "<b>Transparency:</b> ");
  var transp = cont.pushNode("input")
  transp.type = "range"; transp.min = 0; transp.max = 255;
  if (! settings.solid) transp.disabled = true;
  transp.value = (settings.alphaSet === undefined ? 1 : settings.alphaSet)*255;
  transp.oninput = function() {
    settings.alphaSet = parseFloat(this.value)/255;
    if (mesh.programs[0].settings.alphaSet != 1 && mesh.programs[0].pre_shader != UI.soup.renderer.shaders.alpha_dummy) mesh.programs[0].rebuild();
    UI.soup.renderer.canvas.update = true;
  };
  cont.pushNode("br");

  if ("sigma" in settings) {
    cont = div.pushNode("div");
    cont.pushNode("span", "Contour level ");
    item = cont.pushNode("input");
    item.value = settings.sigma;
    item.type = "number";
    item.min = 0; item.max = 10; item.step = 0.1;
    item.onchange = function() {
      settings.sigma = parseFloat(this.value);
      UI.soup.load_ccp4(mesh, undefined, settings);
    };
    cont.pushNode("span", " \u03c3");
  }
  
  if (options.ondelete) {
    cont = div.pushNode("button", "Delete");
    cont.onclick = function() {
      if (options.ondelete) options.ondelete();
      div.close();
    };
  }
  
  cont = div.pushNode("button", "Close");
  cont.onclick = function() {
    div.close();
  };

}

molmil.UI.prototype.styleif_edmap = function(contentBox, callOptions) {
  molmil.loadPlugin(molmil.settings.src+"plugins/misc.js");
  molmil.loadPlugin(molmil.settings.src+"plugins/loaders.js");
  
  var UI = this;
  
  // check if edmap is supported && which files are available (both or 2fo-fc or fo-fc)
  var struct = this.soup.structures[0];
  if (! struct) return;
  if (struct.meta.styleif === undefined) return setTimeout(function() {UI.styleif_edmap(contentBox, callOptions);}, 100);
  var pdbid = struct.meta.pdbid.toLowerCase();
  
  var edmap2_downloads = function() {
    molmil_dep.Clear(downloads);
    var content = "<b>Downloads: </b>";
    var idx;
    var nwfls = struct.meta.styleif.__files;
    
    idx = nwfls.type.indexOf("sf");
    if (idx != -1) content += '<a href="'+molmil.settings.data_url+nwfls.name[idx]+'" download>Structure factors</a>';
    
    idx = nwfls.type.indexOf("2fo-fc-cif");
    if (idx != -1) content += '<a href="'+molmil.settings.data_url+nwfls.name[idx]+'" download>2fo-fc map (cif)</a>';
    
    idx = nwfls.type.indexOf("fo-fc-cif");
    if (idx != -1) content += '<a href="'+molmil.settings.data_url+nwfls.name[idx]+'" download>fo-fc map (cif)</a>';
    
    idx = nwfls.type.indexOf("2fo-fc-mtz");
    if (idx != -1) content += '<a href="'+molmil.settings.data_url+nwfls.name[idx]+'" download>2fo-fc map (mtz)</a>';
    
    idx = nwfls.type.indexOf("fo-fc-mtz");
    if (idx != -1) content += '<a href="'+molmil.settings.data_url+nwfls.name[idx]+'" download>fo-fc map (mtz)</a>';
    
    idx = nwfls.type.indexOf("2fo-fc-ccp4");
    if (idx != -1) content += '<a href="'+molmil.settings.data_url+nwfls.name[idx]+'" download>2fo-fc map (ccp4)</a>';
    
    idx = nwfls.type.indexOf("fo-fc-ccp4");
    if (idx != -1) content += '<a href="'+molmil.settings.data_url+nwfls.name[idx]+'" download>fo-fc map (ccp4)</a>';
    
    downloads.innerHTML = content;
    
    for (var i=0; i<struct.meta.meshes.length; i++) {
      var cont = downloads.pushNode("div");
      var dl = cont.pushNode("span", "Download "+struct.meta.meshes[i].meta.filename);
      dl.mesh = struct.meta.meshes[i];
      dl.onclick = function() {
        if (! window.saveAs) return molmil.loadPlugin(molmil.settings.src+"lib/FileSaver.js", this.onclick, this, []); 
        var data = this.mesh.buffer;
        saveAs(new Blob([data]), this.mesh.meta.filename);
      };
      
      // drag_panel
      
      var options = cont.pushNode("p", "\u2699");
      options.mesh = dl.mesh;
      options.idx = i;
      options.cont = cont;
      options.onclick = function(ev) {
        var idx = this.idx, cont = this.cont, mesh = this.mesh;
        UI.styleif_mesh(this.mesh, ev, {ondelete: function() {
          struct.meta.meshes.splice(idx, 1);
          UI.soup.renderer.removeProgram(mesh.programs[0]);
          UI.soup.structures.Remove(mesh);
          UI.soup.renderer.canvas.update = true;
          cont.parentNode.removeChild(cont);
        }});
      }
    }
    
  }
  
  
  contentBox.pushNode("h1", "EDMap options");
  contentBox.pushNode("hr");

  var has_2fofc = struct.meta.styleif.__files.type.includes("2fo-fc-mtz"), has_fofc = struct.meta.styleif.__files.type.includes("fo-fc-mtz");
  if (! has_2fofc && ! has_fofc) {
    contentBox.pushNode("span", "For this entry, no structure factor information is available.")
    return;
  }
  
  var mode = callOptions ? callOptions[0] : "both";
  
  var flexCont = contentBox.pushNode("div");// flexCont.style.display = "flex";
  
  var form = flexCont.pushNode("form");
  form.pdbid = pdbid;

  if (struct.meta.fileCounter === undefined) {
    struct.meta.fileCounter = 0;
    struct.meta.meshes = [];
  }

  form.mode = "wwpdb";
  if (mode == "2fo-fc" || mode == "fo-fc") form.mode = mode;
  
  var cont, item, downloads = flexCont.pushNode("div"); downloads.id = "nw_edmap_dl";
  cont = form.pushNode("span", "<b>Type of map:</b>");
  
  var handleMT = function() {
    var A = this.value == "both" || this.value == "2fo-fc";
    var B = this.value == "both" || this.value == "fo-fc";
    form.sigma1.parentNode.style.display = A ? "" : "none";
    form.sigma2.parentNode.style.display = B ? "" : "none";
  }
  
  cont = form.pushNode("span");
  item = cont.pushNode("label");
  item.pushNode(molmil_dep.createINPUT("radio", "modeSel", "both"));
  item.innerHTML += "Both"
  item.firstChild.onchange = handleMT;

  item = cont.pushNode("label");
  item.pushNode(molmil_dep.createINPUT("radio", "modeSel", "2fo-fc"));
  item.innerHTML += "2fo-fc";
  item.firstChild.onchange = handleMT;
  
  item = cont.pushNode("label", );
  item.pushNode(molmil_dep.createINPUT("radio", "modeSel", "fo-fc"));
  item.innerHTML += "fo-fc";
  item.firstChild.onchange = handleMT;

  cont = form.pushNode("span");
  item = cont.pushNode("span", " <b>Map size:</b> ");
  item = cont.pushNode(molmil_dep.createTextBox("25")); item.name = "mapsize"; item.style.width = "4em";
  item = cont.pushNode("span", " <b>\u212B</b>");
  
  cont = form.pushNode("span");
  item = cont.pushNode("span", " <b>Contour level (2fo-fc):</b> ");
  item = cont.pushNode(molmil_dep.createTextBox("1")); item.name = "sigma1"; item.style.width = "4em";
  item = cont.pushNode("span", " <b>\u03c3</b>");
  cont = form.pushNode("span");
  item = cont.pushNode("span", " <b>Contour level (fo-fc):</b> ");
  item = cont.pushNode(molmil_dep.createTextBox("2")); item.name = "sigma2"; item.style.width = "4em";
  item = cont.pushNode("span", " <b>\u03c3</b>");
  
  item.pushNode("span", " ");
  item = form.pushNode("button", "Create map");
  item.onclick = function() {
    var size = parseFloat(form.mapsize.value) || 25;
    var sigma1 = parseFloat(form.sigma1.value) || 1;
    var sigma2 = parseFloat(form.sigma2.value) || 2;
    
    if (! form.atom) {
      alert("Please select an atom...");
      return false;
    }
    var XYZ = [[form.atom.chain.modelsXYZ[0][form.atom.xyz], form.atom.chain.modelsXYZ[0][form.atom.xyz+1], form.atom.chain.modelsXYZ[0][form.atom.xyz+2]]];
    var doRequest = function(mode, filename, red, green, blue, sigma) {
      var request = new molmil_dep.CallRemote("POST");
      request.AddParameter("xyz", JSON.stringify(XYZ));
      request.AddParameter("border", form.mapsize.value*.5);
      request.AddParameter("pdbid", pdbid);
      request.AddParameter("mode", mode);
      request.timeout = 0; request.ASYNC = true; request.responseType = "arraybuffer";
      request.OnDone = function() {
        var settings = {};
        settings.sigma = parseFloat(sigma);
        settings.solid = false;
        settings.skipNormalization = true; // already normalized by mapmask
        settings.skipCOG = true;
        settings.denormalize = true;
        settings.rgba = [red, green, blue, 255];
        settings.alphaSet = 0.5;

        var mesh = UI.soup.load_ccp4(this.request.response, filename, settings);
        struct.meta.meshes.push(mesh);
        edmap2_downloads();
      };
      request.Send(molmil.settings.newweb_rest+"edmap");
    };
    
    if (form.modeSel[1].checked) doRequest("2fo-fc", "edmap_2fo-fc_"+struct.meta.fileCounter+".ccp4", 0, 255, 255, sigma1);
    else if (form.modeSel[2].checked) doRequest("fo-fc", "edmap_fo-fc_"+struct.meta.fileCounter+".ccp4", 255, 0, 255, sigma2);
    else if (form.modeSel[0].checked) {
      doRequest("2fo-fc", "edmap_2fo-fc_"+struct.meta.fileCounter+".ccp4", 0, 255, 255, sigma1);
      doRequest("fo-fc", "edmap_fo-fc_"+struct.meta.fileCounter+".ccp4", 255, 0, 255, sigma2);
    }
    else return false;
    struct.meta.fileCounter++;

    return false;
  };
  
  if (callOptions) {
    if (callOptions[0] == "2fo-fc") {
      form.modeSel[1].checked = true;
      form.modeSel[1].onchange();
    }
    else if (callOptions[0] == "fo-fc") {
      form.modeSel[2].checked = true;
      form.modeSel[2].onchange();
    }
  }
  if (! form.modeSel[1].checked && ! form.modeSel[2].checked) {
    form.modeSel[0].checked = true;
    form.modeSel[0].onchange();
  }
  
  
  this.soup.onAtomPick = function(atom) {
    form.atom = atom;
  };
  
  edmap2_downloads();
};

molmil.UI.prototype.styleif_sites = function(contentBox) {
  var UI = this;
  
  var mmjsonGroupData = function(obj, field) {
    if (! obj) return {};
    var output = {}, tmp;
    var keys = Object.keys(obj);
    for (var i=0, k; i<obj[field].length; i++) {
      if (! (obj[field][i] in output)) output[obj[field][i]] = [];
      tmp = {};
      for (k=0; k<keys.length; k++) tmp[keys[k]] = obj[keys[k]][i];
      output[obj[field][i]].push(tmp);
    }
    return output;
  }
  
  var toggleSite = function() {
    if (this.checked) {
      molmil.displayEntry(this.data.residueList, molmil.displayMode_Stick_SC, false, UI.soup);
      molmil.colorEntry(this.data.residueList, molmil.colorEntry_Custom+.5, {rgba: this.data.color, carbonOnly: true}, false, UI.soup);
    }
    else {
      molmil.displayEntry(this.data.residueList, molmil.displayMode_Default, false, UI.soup);
      molmil.colorEntry(this.data.residueList, molmil.colorEntry_CPK, null, false, UI.soup);
    }
 
    UI.soup.renderer.initBuffers();
    UI.soup.renderer.canvas.update = true;  
  };
  
  
  for (var s=0; s<this.soup.structures.length; s++) {
    var struct = this.soup.structures[s];
    if (! struct && ! struct.meta || ! struct.meta.pdbid) continue;
    if (struct.meta.styleif === undefined) return setTimeout(function() {UI.styleif_sites(contentBox);}, 100);
  }
  
  var downloads = contentBox.pushNode("div"); downloads.id = "nw_edmap_dl";
  
  for (var i=0; i<this.soup.structures.length; i++) {
    if (! this.soup.structures[i].meta || ! this.soup.structures[i].meta.filename || ! this.soup.structures[i].meta.filename.endsWith(".mpbf")) continue;
    var cont = downloads.pushNode("div");
    cont.pushNode("span", this.soup.structures[i].meta.filename);
    
    // afterwards split this up over multiple sub-meshes... (for large structures);
    
    var options = cont.pushNode("p", "\u2699");
    options.filename = this.soup.structures[i].meta.filename;
    options.mesh = this.soup.structures[i].structures[0];
    options.onclick = function(ev) {
      UI.styleif_mesh(this.mesh, ev, {filename: this.filename});
    }
    UI.showSites = true;
  }
  
  for (var s=0; s<this.soup.structures.length; s++) {
    var struct = this.soup.structures[s];
    if (! struct && ! struct.meta || ! struct.meta.pdbid) continue;
      
    var pdbid = struct.meta.pdbid.toLowerCase();

    if (! struct.meta.styleif.fgroups) {
      var struct_site_pdbmlplus = struct.meta.styleif.struct_site_pdbmlplus || {info_subtype: []},
      struct_site_gen_pdbmlplus = struct.meta.styleif.struct_site_gen_pdbmlplus,
      entity_poly = struct.meta.pdbxData.entity_poly || struct.meta.styleif.entity_poly,
      struct_site = struct.meta.pdbxData.struct_site || struct.meta.styleif.struct_site || {id: []},
      struct_site_gen = struct.meta.pdbxData.struct_site_gen || struct.meta.styleif.struct_site_gen;
      
      var buffer = {};
      for (var e in struct_site_pdbmlplus) buffer[e] = struct_site_pdbmlplus[e].map(function(x) {return x;});
      for (var e in struct_site) {
        if (! (e in buffer)) buffer[e] = [];
        buffer[e].push.apply(buffer[e], struct_site[e]);
      }
      
      var buffer2 = mmjsonGroupData(struct_site_gen_pdbmlplus, "site_id");
      var tmp = mmjsonGroupData(struct_site_gen, "site_id");
      for (var e in tmp) buffer2[e] = tmp[e];
      
      var fgroups = [], fgroup;
      
      var chainid, resid, residx, residx2, chains, c, r, tmp, tmp2, tmpList, seq, i, j, mol;
      
      
      var aaCode = {"ALA":"A","CYS":"C","ASP":"D","GLU":"E","PHE":"F","GLY":"G","HIS":"H","ILE":"I","LYS":"K","LEU":"L","MET":"M","ASN":"N","PYL":"O","PRO":"P","GLN":"Q","ARG":"R","SER":"S","THR":"T","SEC":"U","VAL":"V","TRP":"W","TYR":"Y"} ;

      for (i=0; i<buffer.id.length; i++) {
        fgroup = {
          name: "", 
          sequence: [],
          description: buffer.details[i],
          source: buffer.info_subtype[i] ? buffer.info_subtype[i]+" : "+buffer.id[i] : undefined,
          residueList: [] // list of molObject/s 
        };
        
        residues = buffer2[buffer.id[i]] || [];
        tmp = [];
        fgroup.ligand = residues.length ? residues[0].ligand : null;

        if (buffer.info_subtype[i] == "binding" || buffer.info_subtype[i] == "prosite") {
          for (r=0; r<residues.length; r++) {
            tmpList = [];
            
            chainid = residues[r].auth_asym_id;
            residx = parseInt(residues[r].beg_auth_seq_id);
            residx2 = parseInt(residues[r].end_auth_seq_id);

            chains = UI.soup.getChainAuth(struct, chainid);
            
            for (c=residx; c<=residx2; c++) {
              mol = UI.soup.getMolObject4ChainAlt(chains, c);
              if (! mol) continue;
              fgroup.sequence.push(aaCode[mol.name] || mol.name);
              fgroup.residueList.push(mol);
            }

            tmp.push([chainid+": "+residues[r].beg_auth_seq_id+(residues[r].beg_auth_seq_id != residues[r].end_auth_seq_id ? "-"+residues[r].end_auth_seq_id : "")]);
          }
        }
        else {
          for (r=0; r<residues.length; r++) {
            tmpList = [];
            chainid = residues[r].auth_asym_id; residx = null; tmp2 = [], residx = residx2 = null;
            if (residues[r].beg_auth_seq_id) {
              try {
                residx = parseInt(residues[r].beg_auth_seq_id.replace(/\D/g,''));
                residx2 = parseInt(residues[r].end_auth_seq_id.replace(/\D/g,''));
                tmp2 = [residues[r].beg_auth_seq_id, residues[r].end_auth_seq_id];
              }
              catch (e) {}
            }
            if (residx == null) {
              if (! residues[r].auth_seq_id) continue;
              resid2 = residx = parseInt(residues[r].auth_seq_id.replace(/\D/g,''));
              tmp2 = [null, null];
            }
            if (! residx2) residx2 = residx;

            chains = UI.soup.getChainAuth(struct, chainid);

            for (c=residx; c<=residx2; c++) {
              mol = UI.soup.getMolObject4ChainAlt(chains, c);
              if (! mol) continue;
              fgroup.sequence.push(aaCode[mol.name] || mol.name);
              fgroup.residueList.push(mol);
            }

            try {
              if (tmp2[0] == null) tmp2 = [UI.soup.getMolObject4ChainAlt(chains, residx).RSID, UI.soup.getMolObject4ChainAlt(chains, residx2).RSID];
            }
            catch (e) {}

            if (tmp2[0] != null) tmp.push([chainid+": "+tmp2[0]+(tmp2[0] != tmp2[1] ? "-"+tmp2[1] : "")]);
          }
        }
        
        fgroup.name = tmp.join(", ")+(buffer.info_subtype[i] && buffer.info_subtype[i] != "pdb" ? " ("+buffer.info_subtype[i]+")" : "");
        if (fgroup.residueList.length) fgroups.push(fgroup);
      }
    }
    else var fgroups = struct.meta.styleif.fgroups;
   

    var tbl = molmil_dep.dcE("table"), tr, td, tbl2, tr2, td2, check;
    tbl.id = "nw_site_tbl";
    
    var site_color_list = molmil.configBox.bu_colors;
    var n = 0;
    var arr = [];
    var top = null;
    for (var i=0; i<fgroups.length; i++) {
      var nrows = tbl.rows.length;
      
      tr = tbl.pushNode("tr");
      
      top = td = tr.pushNode("td");
      check = td.pushNode("input");
      check.type = "checkbox";
      check.onchange = toggleSite;
      check.data = fgroups[i];
      check.data.color = [site_color_list[n][0], site_color_list[n][1], site_color_list[n][2], 255];
      
      td = tr.pushNode("td", fgroups[i].name)
      td.colSpan = 2;
      td.style.color = "rgba("+site_color_list[n].join(",")+")";
      td.onclick = function() {this.check.click();};
      td.ondblclick = function() {
        this.check.checked = false;
        this.check.click();
        var atoms = this.check.data.residueList.map(function(x) {return x.atoms;}).flat();
        molmil.orient(atoms, UI.soup);
      }
      td.check = check;

      if (fgroups[i].sequence) {
        tr = tbl.pushNode("tr");
        tr.pushNode("td", "Sequence:");
        tr.pushNode("td", fgroups[i].sequence.join(", "));
      }
      
      if (fgroups[i].description) {
        tr = tbl.pushNode("tr");
        tr.pushNode("td", "Description:");
        tr.pushNode("td", fgroups[i].description);
      }
      
      if (fgroups[i].source) {
        tr = tbl.pushNode("tr");
        tr.pushNode("td", "Source:");
        tr.pushNode("td", fgroups[i].source);
      }
      
      if (fgroups[i].ligand) {
        tr = tbl.pushNode("tr");
        tr.pushNode("td", "Ligand:");
        tr.pushNode("td", fgroups[i].ligand);
      }
      
      top.rowSpan = (tbl.rows.length-nrows);
      
      n += 1;
      if (n >= site_color_list.length) n = 0;
    }

    contentBox.pushNode("span", struct.meta.id)
    contentBox.pushNode(tbl);
   
  }
};

molmil.UI.prototype.styleif_align = function(contentBox) {
  var UI = this;
  
  const alignments = [];
  
  contentBox.id = "nw_align";
  
  for (var i in molmil.alignInfo) {
    if (! UI.soup.chains.includes(molmil.alignInfo[i].chain1) || ! UI.soup.chains.includes(molmil.alignInfo[i].chain2)) continue;
    alignments.push(molmil.alignInfo[i]);
  }
  
  if (alignments.length > 1) {
    for (var i=0; i<alignments.length; i++) {
      var tmp = contentBox.pushNode("span", alignments[i].chain1.CID + " vs " + alignments[i].chain2.CID);
      tmp.aid = i;
      tmp.onclick = function() {show(this.aid);};
    }
  }
  
  
  var alignmentInfo = contentBox.pushNode("div"), nlen = 60;
  var show = function(aid) {
    molmil_dep.Clear(alignmentInfo);
    
    var alignment = alignments[aid];
    if (! alignment) return;

    var name1 = alignment.chain1.entry.meta.id.indexOf("_") == -1 ? alignment.chain1.entry.meta.pdbid + alignment.chain1.name : alignment.chain1.entry.meta.id;
    var name2 = alignment.chain2.entry.meta.id.indexOf("_") == -1 ? alignment.chain2.entry.meta.pdbid + alignment.chain2.name : alignment.chain2.entry.meta.id;
    alignmentInfo.pushNode("div", "Alignment of <b style='color: cyan;'>"+name1+"</b> vs <b style='color: magenta;'>"+name2+"</b>");
    alignmentInfo.pushNode("div", "Initial RMSD: " + alignment.initial_rmsd.toFixed(2) + " \u212B (over all matched residues)");
    alignmentInfo.pushNode("div", "Optimized RMSD: " + alignment.rmsd.toFixed(2) + " \u212B (over all green matched residues)");

    var alignTable = alignmentInfo.pushNode("table"), tr;
    var pos = 0, c1pos = 0, c2pos = 0;

    while (true) {
      fpos = pos + nlen;
      if (fpos >= alignment.alignment.length) fpos = alignment.alignment.length-1;
      
      tr = alignTable.pushNode("tr");
      tr.pushNode("td", alignment.chain1.molecules[c1pos].RSID);
      tr.pushNode("td", alignment.seq1.substring(pos, fpos));
      c1pos += Array.from(alignment.seq1.substring(pos, fpos)).filter(x=>x!="-").length;
      tr.pushNode("td", c1pos ? alignment.chain1.molecules[c1pos-1].RSID : alignment.chain1.molecules[c1pos].RSID);
      
      var tmp = alignment.optimized_alignment.substring(pos, fpos);
      var tmp2 = Array.from(alignment.alignment.substring(pos, fpos)).map(function(x, i) {return tmp[i] == "|" ? "<b>|</b>" : x;}).join("");
      tr = alignTable.pushNode("tr");
      tr.pushNode("td", "");
      tr.pushNode("td", tmp2).classList.add("nw_align_align");
      tr.pushNode("td", "");

      tr = alignTable.pushNode("tr");
      tr.pushNode("td", alignment.chain2.molecules[c2pos].RSID);
      tr.pushNode("td", alignment.seq2.substring(pos, fpos));
      c2pos += Array.from(alignment.seq2.substring(pos, fpos)).filter(x=>x!="-").length;
      tr.pushNode("td", alignment.chain2.molecules[c2pos-1].RSID);
      
      pos += nlen;
      if (pos >= alignment.alignment.length) break;
    }
  };

  show(0);
};

molmil.UI.prototype.styleif_settings = function(contentBox) {
/*

  if (this.LM && this.LM.parentNode.childNodes.length > 1) this.LM.onclick();
  if (this.onLMshow) this.onLMshow();
  
  var canvas = this.soup.canvas;
  
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
  var UI = this;
  closeButton.onclick = function() {popup.parentNode.removeChild(popup); if (UI.onLMhide) UI.onLMhide();};
  
  if (target) target.pushNode(popup);
  else this.LM.parentNode.pushNode(popup);


*/
  
  var UI = this;
  var saveContainer = {}, tmp;
  
  var easySet = function(what, to) {
    if (localStorage.getItem(what) == to) return;
    localStorage.setItem(what, to);
    return true;
  };
  
  var applyUpdate = function() {
    var resizeVP = false, recompile = false, rebuild = false, slab = false;
    
    // save settings
    if (easySet("molmil.settings_QLV", saveContainer.qlv.value)) {
      rebuild = true;
    }
    if (easySet("molmil.settings_glsl_fog", (molmil.configBox.glsl_fog=saveContainer.fog.checked) ? "1" : "0")) {
      recompile = true;
      if (saveContainer.fog.checked) saveContainer.slab.toggle.checked = UI.soup.renderer.settings.slab = false;
    }
    if (easySet("molmil.settings_PROJECTION", saveContainer.projectionMode.value)) {
      resizeVP = true;
    }
    if (easySet("molmil.settings_STEREO", saveContainer.stereoMode.value)) {
      
    }
    if (easySet("molmil.settings_BGCOLOR", JSON.stringify(molmil.hex2rgb(saveContainer.bgcolor.RGB.value).concat([parseInt(saveContainer.bgcolor.A.value)]).map(function(x){return x/255;})))) {
      
    }
    if (easySet("molmil.settings_keepBackgroundColor", saveContainer.bgcolor.keepbgpng.checked ? "1" : "0")) {
      
    }
    if (easySet("molmil.settings_BBSF", saveContainer.bbsf.value)) {
      rebuild = true;
      molmil.geometry.reInitChains = true;
    }
    
    if (easySet("molmil.settings_slab_near_ratio", saveContainer.slab.near.value)) slab = true;
    if (easySet("molmil.settings_slab_far_ratio", saveContainer.slab.far.value)) slab = true;
    
    // reload settings
    molmil.initSettings();
    UI.soup.reloadSettings();
    molmil.configBox.projectionMode = saveContainer.projectionMode.value; molmil.configBox.stereoMode = parseInt(saveContainer.stereoMode.value); 
    
    if (saveContainer.slab.toggle.checked != UI.soup.renderer.settings.slab) {
      UI.soup.renderer.settings.slab = saveContainer.slab.toggle.checked;
      slab = true;
      recompile = true;
    }
    
    if (resizeVP) UI.soup.renderer.resizeViewPort();
    if (recompile) molmil.shaderEngine.recompile(UI.soup.renderer);
    if (slab) {
      var szI = Math.min(UI.soup.geomRanges[0], UI.soup.geomRanges[2], UI.soup.geomRanges[4]) + molmil.configBox.zNear;
      var szA = Math.max(UI.soup.geomRanges[1], UI.soup.geomRanges[3], UI.soup.geomRanges[5]) + molmil.configBox.zNear;
      if (szI > szA - 1) szA = szI + 1;
      
      var tot = szA-szI;
      UI.soup.renderer.settings.slabNear = parseFloat(saveContainer.slab.near.value)*tot + szI;
      UI.soup.renderer.settings.slabFar = parseFloat(saveContainer.slab.far.value)*tot + szI;
    }
    
    // re-render
    if (rebuild) UI.soup.renderer.initBuffers();
    UI.soup.canvas.update = true;
  };
  
  
  contentBox.id = "nw_settings";

  contentBox.pushNode("h1", "Settings");
  contentBox.pushNode("hr");
  
  

  saveContainer.qlv = molmil_dep.dcE("input");
  saveContainer.qlv.type = "range"; saveContainer.qlv.min = "0"; saveContainer.qlv.max = "4"; saveContainer.qlv.step = "1";
  saveContainer.qlv.value = localStorage.getItem("molmil.settings_QLV");
  saveContainer.qlv.ref = molmil_dep.dcE("span"); saveContainer.qlv.ref.innerHTML = saveContainer.qlv.value;
  saveContainer.qlv.onmousemove = function() {this.ref.innerHTML = this.value;};
  saveContainer.qlv.onchange = function() {applyUpdate();}
  
  saveContainer.bbsf = molmil_dep.dcE("input");
  saveContainer.bbsf.type = "range"; saveContainer.bbsf.min = "0"; saveContainer.bbsf.max = "4"; saveContainer.bbsf.step = "1";
  saveContainer.bbsf.value = molmil.configBox.smoothFactor;
  saveContainer.bbsf.ref = molmil_dep.dcE("span"); saveContainer.bbsf.ref.innerHTML = saveContainer.bbsf.value;
  saveContainer.bbsf.onmousemove = function() {this.ref.innerHTML = this.value;};
  saveContainer.bbsf.onchange = function() {applyUpdate();}
  
  
  // split into basic and slab modes...
  
  saveContainer.fog = molmil_dep.dcE("input");
  saveContainer.fog.type = "checkbox";
  saveContainer.fog.checked = localStorage.getItem("molmil.settings_glsl_fog") == 1;
  saveContainer.fog.onchange = function() {
    saveContainer.slab.toggle.disabled = saveContainer.slab.near.disabled = saveContainer.slab.far.disabled = saveContainer.fog.checked;
    applyUpdate();
  }
  
  saveContainer.slab = molmil_dep.dcE("span");
  saveContainer.slab.toggle = saveContainer.slab.pushNode("input");
  saveContainer.slab.pushNode("span", "&nbsp;|&nbsp;Near:&nbsp;");
  
  saveContainer.slab.near = saveContainer.slab.pushNode("input");
  saveContainer.slab.pushNode("span", "&nbsp;|&nbsp;Far:&nbsp;");
  saveContainer.slab.far = saveContainer.slab.pushNode("input");
  
  saveContainer.slab.toggle.type = "checkbox";
  saveContainer.slab.near.type = saveContainer.slab.far.type = "range";
  
  saveContainer.slab.near.min = saveContainer.slab.far.min = 0;
  saveContainer.slab.near.max = saveContainer.slab.far.max = 1;
  saveContainer.slab.near.step = saveContainer.slab.far.step = 0.001;

  saveContainer.slab.toggle.disabled = saveContainer.slab.near.disabled = saveContainer.slab.far.disabled = saveContainer.fog.checked;
  
  saveContainer.slab.toggle.checked = UI.soup.renderer.settings.slab;
  saveContainer.slab.near.value = molmil.configBox.slab_near_ratio;
  saveContainer.slab.far.value = molmil.configBox.slab_far_ratio;
  saveContainer.slab.near.oninput = saveContainer.slab.far.oninput = function() {applyUpdate();}
  saveContainer.slab.toggle.onchange = function() {applyUpdate();}
  
  
  saveContainer.projectionMode = molmil_dep.dcE("select");
  tmp = saveContainer.projectionMode.pushNode("option", "Perspective projection"); tmp.value = 1;
  tmp = saveContainer.projectionMode.pushNode("option", "Orthographic projection"); tmp.value = 2;
  if (molmil.configBox.projectionMode == 2) tmp.selected = true;
  saveContainer.projectionMode.onchange = function() {applyUpdate();}
  
  saveContainer.stereoMode = molmil_dep.dcE("select");
  tmp = saveContainer.stereoMode.pushNode("option", "None"); tmp.value = 0;
  tmp = saveContainer.stereoMode.pushNode("option", "Anaglyph"); tmp.value = 1;
  if (molmil.configBox.stereoMode == 1) tmp.selected = true;
  tmp = saveContainer.stereoMode.pushNode("option", "Side-by-side"); tmp.value = 2;
  if (molmil.configBox.stereoMode == 2) tmp.selected = true;
  tmp = saveContainer.stereoMode.pushNode("option", "Cross-eyed"); tmp.value = 4;
  if (molmil.configBox.stereoMode == 4) tmp.selected = true;
  saveContainer.stereoMode.onchange = function() {applyUpdate();}
  
  //change this to a proper color input + slider for alpha
  saveContainer.bgcolor = molmil_dep.dcE("span");
  
  saveContainer.bgcolor.RGB = saveContainer.bgcolor.pushNode("input");
  saveContainer.bgcolor.RGB.value = molmil.rgb2hex(molmil.configBox.BGCOLOR[0]*255, molmil.configBox.BGCOLOR[1]*255, molmil.configBox.BGCOLOR[2]*255);
  saveContainer.bgcolor.RGB.type = "color";
  saveContainer.bgcolor.RGB.onchange = function() {applyUpdate();}
  
  saveContainer.bgcolor.pushNode("span", "&nbsp;Transparency:");
  saveContainer.bgcolor.A = saveContainer.bgcolor.pushNode("input");
  saveContainer.bgcolor.A.type = "range";
  saveContainer.bgcolor.A.min = 0; saveContainer.bgcolor.A.max = 255; saveContainer.bgcolor.A.step = 1; saveContainer.bgcolor.A.value = molmil.configBox.BGCOLOR[3]*255;
  saveContainer.bgcolor.A.ref = saveContainer.bgcolor.pushNode("span"); saveContainer.bgcolor.A.ref.innerHTML = saveContainer.bgcolor.A.value;
  saveContainer.bgcolor.A.onmousemove = function() {this.ref.innerHTML = this.value;};
  saveContainer.bgcolor.A.onchange = function() {applyUpdate();}
  
  saveContainer.bgcolor.pushNode("span", "<br/>Apply BG color in png:");
  saveContainer.bgcolor.keepbgpng = saveContainer.bgcolor.pushNode("input");
  saveContainer.bgcolor.keepbgpng.type = "checkbox";
  saveContainer.bgcolor.keepbgpng.checked = molmil.configBox.keepBackgroundColor;
  saveContainer.bgcolor.keepbgpng.onchange = function() {applyUpdate();}

  var tbl = contentBox.pushNode("table"), tr, tmp;
  tr = tbl.pushNode("tr");
  tr.pushNode("td", "Quality:");
  tmp = molmil_dep.dcE("div");
  tmp.pushNode(saveContainer.qlv);
  tmp.pushNode(saveContainer.qlv.ref);
  tr.pushNode("td").pushNode(tmp);
  
  
  tr = tbl.pushNode("tr");
  tr.pushNode("td", "Sheet/loop backbone smooth factor:");
  tmp = molmil_dep.dcE("div");
  tmp.pushNode(saveContainer.bbsf);
  tmp.pushNode(saveContainer.bbsf.ref);
  tr.pushNode("td").pushNode(tmp);
  
  tr = tbl.pushNode("tr");
  tr.pushNode("td", "Fog:");
  tmp = molmil_dep.dcE("div");
  tmp.pushNode(saveContainer.fog);
  tr.pushNode("td").pushNode(tmp);
  
  tr = tbl.pushNode("tr");
  tr.pushNode("td", "Slab:");
  tmp = molmil_dep.dcE("div");
  tmp.pushNode(saveContainer.slab);
  tr.pushNode("td").pushNode(tmp);
  
  tr = tbl.pushNode("tr");
  tr.pushNode("td", "Projection mode:");
  tr.pushNode("td").pushNode(saveContainer.projectionMode);
  
  tr = tbl.pushNode("tr");
  tr.pushNode("td", "Stereoscopy:");
  tr.pushNode("td").pushNode(saveContainer.stereoMode);
  
  tr = tbl.pushNode("tr");
  tr.pushNode("td", "BG color:");
  tr.pushNode("td").pushNode(saveContainer.bgcolor);
};


molmil.UI.prototype.styleif = function(showOption, callOptions) {
  var UI = this;
  var initStruct = function(struct) {
    if (! struct.meta.id || ! struct.meta.pdbid) return;
    var pdbid = struct.meta.pdbid.toLowerCase();
    if (struct.meta.styleif === undefined) {
      var request = new molmil_dep.CallRemote("GET"); request.ASYNC = true; 
      request.OnDone = function() {
        var jso = JSON.parse(this.request.responseText);
        struct.meta.styleif = Object.values(jso)[0];
        var has_2fofc = struct.meta.styleif.__files.type.includes("2fo-fc-mtz"), has_fofc = struct.meta.styleif.__files.type.includes("fo-fc-mtz");
        if (has_2fofc) UI.showEDMap = true;
        var tmp1 = struct.meta.styleif.struct_site_pdbmlplus || {info_subtype: []};
        var tmp2 = struct.meta.pdbxData.struct_site || struct.meta.styleif.struct_site || {id: []};
        if (tmp1.info_subtype.length || tmp2.id.length) UI.showSites = true;
      };
      request.Send(molmil.settings.newweb_rest+"fetch/rdb?entryId="+pdbid+"&schemaName=pdbj&tables=__files,struct_site_pdbmlplus,struct_site_gen_pdbmlplus"+("entity_poly" in struct.meta.pdbxData ? "" : ",entity_poly,struct_site,struct_site_gen"));
    }
  };
  
  for (var i=0; i<UI.soup.structures.length; i++) initStruct(UI.soup.structures[i]);
  
  var nwif = document.getElementById("styleif");

  if (! nwif) {
    nwif = this.canvas.parentNode.pushNode("div");
    nwif.id = "styleif";
    nwif.contentBox = nwif.pushNode("div");
    if (window.MutationObserver !== undefined) {
      var styleif_height = localStorage.getItem("molmil.settings_styleif_height");
      //if (styleif_height != "hidden") nwif.contentBox.style.height = styleif_height;
      //else showOption = "hide";
      if (styleif_height == "hidden") showOption = "hide";
      var observer = new MutationObserver(function(mutations) {
        if (nwif.contentBox.classList.contains("visible")) localStorage.setItem("molmil.settings_styleif_height", nwif.contentBox.style.height);
        else localStorage.setItem("molmil.settings_styleif_height", "hidden");
      });
      observer.observe(nwif.contentBox, { attributes: true });
    }
    nwif.button = nwif.pushNode("div", "Style menu"); // see if we can also make this button dragable, so that it can be used to resize the menu...
    nwif.options = nwif.pushNode("div");
    
    var options = [
      ["Structure", "structure", null, function() {UI.styleif_au(nwif.contentBox);}], 
      ["BU", "bu", function() {return ! UI.soup.AisB;}, function() {UI.styleif_bu(nwif.contentBox);}], 
      ["Chemical compontent", "cc", function() {return UI.soup.pdbxData && UI.soup.pdbxData.chem_comp_atom && UI.soup.pdbxData.struct
 === undefined}, function() {UI.styleif_cc(nwif.contentBox);}], 
      ["EDMap", "edmap", function() {return UI.showEDMap;}, function() {UI.styleif_edmap(nwif.contentBox, callOptions);}], 
      ["Sites", "sites", function() {return UI.showSites;}, function() {UI.styleif_sites(nwif.contentBox);}], 
      ["Alignment", "align", function() {return Object.keys(molmil.alignInfo).length;}, function() {UI.styleif_align(nwif.contentBox);}], 
      ["Settings", "settings", null, function() {UI.styleif_settings(nwif.contentBox);}], 
      ["Hide", "hide"]
    ];
    if (molmil.configBox.menuOptions && molmil.configBox.menuOptions.length) options = options.concat(molmil.configBox.menuOptions);
    
    var doHandler = function(ev, callOptions) {
      for (var i=0; i<options.length; i++) {
        if (this.value == options[i][1] && options[i][3]) {
          molmil_dep.Clear(nwif.contentBox);
          options[i][3](nwif.contentBox, callOptions);
        }
      }
      
      if (this.value == "hide") nwif.contentBox.classList.remove("visible");
      else nwif.contentBox.classList.add("visible");

      if (! nwif.contentBox.classList.contains("visible")) {
        if (nwif.firstChild.style.height) nwif.heightSet = nwif.firstChild.style.height;
        nwif.firstChild.style.height = "";
      }
      else if (nwif.heightSet) nwif.firstChild.style.height = nwif.heightSet;
      
      nwif.options.classList.remove("visible");
    };
    
    for (var i=0; i<options.length; i++) {
      var opt = nwif.options.pushNode("div", options[i][0]);
      if (options[i][2]) opt.checkHandler = options[i][2];
      else opt.checkHandler = function() {return true;};
      opt.value = options[i][1];
      opt.onclick = doHandler;
    }
    
    nwif.button.onclick = function() {
      for (var i=0; i<nwif.options.childNodes.length; i++) nwif.options.childNodes[i].style.display = nwif.options.childNodes[i].checkHandler() ? "" : "none";
      nwif.options.classList.toggle("visible");
    }
  }
  
  if (showOption == "bu" && UI.soup.AisB) showOption = "structure";
  
  for (var i=0; i<nwif.options.childNodes.length; i++) {
    var opt = nwif.options.childNodes[i];
    if (opt.value == showOption) opt.onclick(null, callOptions);
  }
  
};

