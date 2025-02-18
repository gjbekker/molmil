/*!
 * cif.js
 *
 * JavaScript CIF parser: https://github.com/gjbekker/cif-parsers
 * 
 * By Gert-Jan Bekker
 * License: MIT
 *   See https://github.com/gjbekker/cif-parsers/blob/master/LICENSE
 */

// pdbml

function PDBMLparser() {
  this.data = {};
}

PDBMLparser.prototype.parse = function(data) {
  var root = data.documentElement;
  var rootJS = this.data["data_"+root.getAttribute("datablockName")] = {}
  var category, catName, loopMode, cat, scat, skip, item, n;
  for (var i=0, j, k; i<root.childNodes.length; i++) {
    cat = root.childNodes[i];
    catName = cat.localName;
    if (! catName) continue;
    catName = catName.substr(0, catName.length-8);
    category = rootJS[catName] = {};
    loopMode = cat.childNodes.length > 3;
    n = 0;
    for (j=0; j<cat.childNodes.length; j++) {
      scat = cat.childNodes[j];
      if (! scat.localName) continue;
      skip = [];
      for (k=0; k<scat.attributes.length; k++) {
        item = scat.attributes.item(k);
        if (loopMode) {
          if (! category.hasOwnProperty(item.localName)) category[item.localName] = new Array(n);
          category[item.localName].push(item.nodeValue);
          skip.push(item.localName);
        }
        else category[item.localName] = [item.nodeValue];
      }
      for (k=0; k<scat.childNodes.length; k++) {
        item = scat.childNodes[k];
        if (! item.localName) continue;
        if (loopMode) {
          if (! category.hasOwnProperty(item.localName)) category[item.localName] = new Array(n);
          category[item.localName].push(item.textContent);
          skip.push(item.localName);
        }
        else category[item.localName] = [item.textContent];
      }
      if (loopMode) for (k in category) {if (skip.indexOf(k) == -1) category[k].push(null);}
      n++;
    }
  }
}

//registerPublic::loadPDBML
function loadPDBML(data, noCnT) {
  var parser = new PDBMLparser();
  parser.parse(data);

  if (noCnT) return parser.data;
  if (! window.__CIFDICT__) loadCIFdic();

  var func, e, e2, e3, i;
  for (e in parser.data) {
    for (e2 in parser.data[e]) {
      if (! __CIFDICT__.hasOwnProperty(e2)) continue;
      for (e3 in parser.data[e][e2]) {
        if (! __CIFDICT__[e2].hasOwnProperty(e3)) continue;
        func = __CIFDICT__[e2][e3];
        if (parser.data[e][e2][e3] instanceof Array) {
          for (i=0; i<parser.data[e][e2][e3].length; i++) parser.data[e][e2][e3][i] = func.call(null, parser.data[e][e2][e3][i]);
        }
        else parser.data[e][e2][e3] = func.call(null, parser.data[e][e2][e3]);
      }
    }
  }
  return parser.data;
}

// mmjson tree

//registerPublic::setupCIFTree
function setupCIFTree(target, jso, expandableTarget) {
  var point = target.pushNode("DIV");
  point.expandableTarget = expandableTarget;
  point.popup = target.parentNode; point.topNode = true;
  renderChildCIFTree(point, jso);
  if (point.childNodes.length == 1 && point.childNodes[0].childNodes[0].className.indexOf("optCat_p") != -1) point.childNodes[0].childNodes[0].onclick();
  return point;
}

function renderChildCIFTree(target, jso) {
  var item;
  var keys = Object.keys(jso);
  var table = null, row;
  if (jso[keys[0]] instanceof Array || "splice" in jso[keys[0]]) {
    var table = new drawTable(), row;
    if (! target.parentNode.showAll || (jso[keys[0]].length < 10000 && ! target.parentNode.liteRenderer)) table.tbl.setClass("dTO eqSpacedTbl");
    table.tbl.border = "1";
    table.tbl.style.width = "";
    row = table.addRowXH(keys);
    for (var i=0, j; i<(target.parentNode.showAll ? jso[keys[0]].length : Math.min(jso[keys[0]].length, 25)); i++) {
      row = table.addRow();
      for (j=0; j<keys.length; j++) {
        if (jso[keys[j]][i] instanceof Array) row.addCell(jso[keys[j]][i].toString());
        else row.addCell(jso[keys[j]][i]);
      }
    }
    target.pushNode(table.tbl);
    if (! target.parentNode.showAll && jso[keys[0]].length > 25) {
      row = target.pushNode("a", "Show all ("+jso[keys[0]].length+(jso[keys[0]].length > 2500 ? " rows, which will take some time to process and might cause your browser to become unresponsive. Alternatively, switch to flat file representation." : " rows")+")");
      row.targetObj = target; row.jso = jso; row.style.cursor = "pointer";
      row.onclick = function() {
        Clear(this.targetObj);
        this.targetObj.parentNode.showAll = true;
        renderChildCIFTree(this.targetObj, this.jso);
      };
    }
  }
  else {
    for (var i=0; i<keys.length; i++) {
      item = target.pushNode("DIV");
      item.plus = item.pushNode("a", "+");
      item.plus.setClass("optCat_p");
      item.name = item.pushNode("a", keys[i]);
      item.name.setClass("optCat_n");
      item.plus.onclick = item.name.onclick = expandCatTree;
      item.payload = jso[keys[i]];
      item.expandFunc = renderChildCIFTree;
    }
  }
}

// mmcif parser

function _loop(parserObj) {
  this.parserObj = parserObj;
  this.length = 0;
  this.refID = -1;
  this.refList = [];
  this.namesDefined = false;
}

_loop.prototype.addName = function(name) {
  var catName = molmil_dep.Partition(name, ".");
  var ref = this.parserObj.currentTarget[this.parserObj.currentTarget.length-2];
  if (catName[1]) {
    if (! ref.hasOwnProperty(catName[0])) ref[catName[0]] = {};
    if (! ref[catName[0]].hasOwnProperty(catName[2])) ref[catName[0]][catName[2]] = [];
    this.refList.push(ref[catName[0]][catName[2]]);
  }
  else {
    if (! ref.hasOwnProperty(catName[0])) ref[catName[0]] = [];
    this.refList.push(ref[catName[0]]);
  }
  this.length = this.refList.length;
};

_loop.prototype.pushValue = function(value) {
  this.namesDefined = true;
  var target = this.nextTarget();
  if (value == "stop_") return this.stopPush();
  target.push(value);
};

_loop.prototype.nextTarget = function() {
  this.refID = (this.refID+1)%this.length;
  return this.refList[this.refID];
};

_loop.prototype.stopPush = function() {
  this.refID = -1;
};

function CIFparser() {
  this.data = {};
  this.currentTarget = null;
  this.loopPointer = null;
  this.selectGlobal();
}

CIFparser.prototype.parse = function(data) {
  this.error = null;
  var lines = data.split("\n"), line, buffer = [], multi_line_mode = false, Z;
  for (var i=0; i<lines.length; i++) {
    try {
      Z = lines[i].substr(0, 1);
      if (Z == "#") continue;
      line = lines[i].trim();
      if (Z == ";") {
        if (multi_line_mode) this.setDataValue(buffer.join("\n"));
        else buffer = [];
        multi_line_mode = ! multi_line_mode;
        line = line.substr(1).trim();
      }
      if (multi_line_mode) buffer.push(line);
      else this.processContent(this.specialSplit(line));
    }
    catch (e) {
      console.error(e);
      this.error = i;
      break;
    }
  }
};

CIFparser.prototype.specialSplit = function(content) {
  var output = [["", false]], quote = false, qtype, length = content.length, isWS, olast=0;
  for (var i=0; i<length; i++) {
    isWS = content[i] == " " || content[i] == "\t";
    if ((content[i] == "'" || content[i] == '"') && (((i == 0 || content[i-1] == " " || content[i-1] == "\t") && !quote) || ((i == length-1 || content[i+1] == " " || content[i+1] == "\t") && quote && content[i] == qtype))) {quote = ! quote; qtype = content[i];}
    else if (! quote && isWS && output[olast][0] != "") {output.push(["", false]); olast++;}
    else if (! quote && content[i] == "#") break;
    else if (! isWS || quote) {output[olast][0] += content[i]; output[olast][1] = quote;}
  }
  if (output[olast][0] == "") output.pop();
  return output;
};

CIFparser.prototype.processContent = function(content) {
  for (var i=0; i<content.length; i++) {
    if (content[i][0] == "global_" && ! content[i][0]) {
      this.loopPointer = null;
      this.selectGlobal();
    }
    else if (content[i][0].substr(0, 5) == "data_" && ! content[i][1]) {
      this.loopPointer = null;
      this.selectData(content[i][0]);
    }
    else if (content[i][0].substr(0, 5) == "save_" && ! content[i][1]) {
      this.loopPointer = null;
      if (content[i][0].substr(5).length) this.selectFrame(content[i][0]);
      else this.endFrame();
    }
    else if (content[i][0] == "loop_" && ! content[i][1]) this.loopPointer = new _loop(this);
    else if (content[i][0].substr(0, 1) == "_" && ! content[i][1] && this.dataSet != false) this.setDataName(content[i][0].substr(1));
    else {
      if (! this.loopPointer && this.dataSet) continue;
      //console.log(content[i][0]);
      this.setDataValue(content[i][0]);
    }
  }
};

CIFparser.prototype.setDataName = function(name) {
  if (this.loopPointer != null) {
    if (this.loopPointer.namesDefined) this.loopPointer = null;
    else return this.loopPointer.addName(name);
  }
  var name = molmil_dep.Partition(name, ".");
  this.currentTarget.pop();
  if (name[1]) {
    if (! this.currentTarget[this.currentTarget.length-1].hasOwnProperty(name[0])) this.currentTarget[this.currentTarget.length-1][name[0]] = {};
    this.currentTarget[this.currentTarget.length-1][name[0]][name[2]] = "";
    this.currentTarget.push([this.currentTarget[this.currentTarget.length-1][name[0]], name[2]]);
  }
  else {
    this.currentTarget[this.currentTarget.length-1][name[0]] = "";
    this.currentTarget.push([this.currentTarget[this.currentTarget.length-1], name[0]]);
  }
  this.dataSet = false;
};

CIFparser.prototype.setDataValue = function(value) {
  if (this.loopPointer != null) this.loopPointer.pushValue(value);
  else {var tmp = this.currentTarget[this.currentTarget.length-1]; tmp[0][tmp[1]] = [value]; this.dataSet = true;}
};

CIFparser.prototype.selectGlobal = function() {this.currentTarget = [this.data, this.data, null];};

CIFparser.prototype.selectData = function(name) {
  if (! this.data.hasOwnProperty(name)) this.data[name] = {};
  this.currentTarget = [this.data, this.data[name], null];
};

CIFparser.prototype.selectFrame = function(name) {
  if (! this.currentTarget[1].hasOwnProperty(name)) this.currentTarget[1][name] = {};
  this.currentTarget = this.currentTarget.slice(0, 2); this.currentTarget.push(this.currentTarget[1][name]); this.currentTarget.push(null);
};

CIFparser.prototype.endData = function() {this.currentTarget = this.currentTarget.slice(0, 2);};

CIFparser.prototype.endFrame = function() {this.currentTarget = this.currentTarget.slice(0, 3);};

function parseCIFdictionary(data) {
  var ref = data[Object.keys(data)[0]], name, dic = {};
  for (var e in ref) {
    if (typeof ref[e] != "object" || ref[e] instanceof Array || ! ref[e].hasOwnProperty("item_type")) continue;
    name = Partition(e.substr(6), ".");
    if (! dic.hasOwnProperty(name[0])) dic[name[0]] = {};
    dic[name[0]][name[2]] = ref[e].item_type.code[0].trim()
  }
  return dic;
}

function loadCIFdic(dic, doReturn) {
  if (! dic || typeof dic == "string") {
    var dic = {};
    var request = new molmil_dep.CallRemote("GET");
    try {
      if (! window.cifDicLocJSON) throw 0;
      request.Send(cifDicLocJSON);
      dic = JSON.parse(request.request.responseText);
    }
    catch(e) {
      var request = new molmil_dep.CallRemote("GET");
      request.Send(cifDicLoc);
    
      var parser = new CIFparser();
      parser.parse(request.request.responseText);
      
      dic = parseCIFdictionary(dic);
    }
  }
    
  var typing = {}, e2;
  for (var e in dic) {
    for (e2 in dic[e]) {
      if (dic[e][e2] == "int") {
        if (! typing.hasOwnProperty(e)) typing[e] = {};
        typing[e][e2] = parseInt;
      }
      else if (dic[e][e2] == "float") {
        if (! typing.hasOwnProperty(e)) typing[e] = {};
        typing[e][e2] = parseFloat;
      }
      else if (dic[e][e2] == "int-range") {
        if (! typing.hasOwnProperty(e)) typing[e] = {};
        typing[e][e2] = parseIntRange;
      }
      else if (dic[e][e2] == "float-range") {
        if (! typing.hasOwnProperty(e)) typing[e] = {};
        typing[e][e2] = parseFloatRange;
      }
    }
  }
  if (doReturn) return typing;
  __CIFDICT__ = typing;
}

function parseIntRange(inp) {
  try {
    var pos = inp.indexOf("-", 1);
    if (pos == -1) throw -1;
    return [parseInt(inp.substr(0, pos)), parseInt(inp.substr(pos+1))];
  }
  catch (e) {return [parseInt(inp)];}
}

function parseFloatRange(inp) {
  try {
    var pos = inp.indexOf("-", 1);
    if (pos == -1) throw -1;
    return [parseFloat(inp.substr(0, pos)), parseFloat(inp.substr(pos+1))];
  }
  catch (e) {return [parseFloat(inp)];}
}

//registerPublic::loadCIF
function loadCIF(data, noCnT) {
  var parser = new CIFparser();
  parser.parse(data);
  
  if (noCnT) return parser.data;
  if (! window.__CIFDICT__) loadCIFdic();
  
  var e, e2, e3, i;
  for (e in parser.data) {
    for (e2 in parser.data[e]) {
      for (e3 in parser.data[e][e2]) {
        if (parser.data[e][e2][e3] instanceof Array) {for (i=0; i<parser.data[e][e2][e3].length; i++) parser.data[e][e2][e3][i] = ! (parser.data[e][e2][e3][i] == "?" || parser.data[e][e2][e3][i] == ".") ? parser.data[e][e2][e3][i] : null;}
        else parser.data[e][e2][e3] = ! (parser.data[e][e2][e3] == "?" || parser.data[e][e2][e3] == ".") ? parser.data[e][e2][e3] : null;
      }
    }
  }
  
  var func;
  for (e in parser.data) {
    for (e2 in parser.data[e]) {
      if (! __CIFDICT__.hasOwnProperty(e2)) continue;
      for (e3 in parser.data[e][e2]) {
        if (! __CIFDICT__[e2].hasOwnProperty(e3)) continue;
        func = __CIFDICT__[e2][e3];
        if (parser.data[e][e2][e3] instanceof Array) {for (i=0; i<parser.data[e][e2][e3].length; i++) parser.data[e][e2][e3][i] = func.call(null, parser.data[e][e2][e3][i]);}
        else parser.data[e][e2][e3] = func.call(null, parser.data[e][e2][e3]);
      }
    }
  }
  return parser.data;
}

function cleanJSONcopy_withDict(data, cifdic) {
  cifdic = cifdic || window.__CIFDICT__;
  
  var copy = {};
  
  var e, e2, e3, i;
  for (e in data) {
    copy[e] = {};
    for (e2 in data[e]) {
      copy[e][e2] = {}
      for (e3 in data[e][e2]) {
        if (data[e][e2][e3] instanceof Array) {
          copy[e][e2][e3] = new Array(data[e][e2][e3].length).fill("");
          for (i=0; i<data[e][e2][e3].length; i++) {copy[e][e2][e3][i] = ! (data[e][e2][e3][i] == "?" || data[e][e2][e3][i] == ".") ? data[e][e2][e3][i] : null;}
        }
        else copy[e][e2][e3] = ! (data[e][e2][e3] == "?" || data[e][e2][e3] == ".") ? data[e][e2][e3] : null;
      }
    }
  }
  
  var func;
  for (e in copy) {
    for (e2 in copy[e]) {
      if (! cifdic.hasOwnProperty(e2)) continue;
      for (e3 in copy[e][e2]) {
        if (! cifdic[e2].hasOwnProperty(e3)) continue;
        func = cifdic[e2][e3];
        if (copy[e][e2][e3] instanceof Array) {for (i=0; i<copy[e][e2][e3].length; i++) copy[e][e2][e3][i] = copy[e][e2][e3][i] == null ? null : func.call(null, copy[e][e2][e3][i]);}
        else copy[e][e2][e3] = copy[e][e2][e3] == null ? null : func.call(null, copy[e][e2][e3]);
      }
    }
  }
  return copy;
}

function countDUMP(data) {
  var outputN = 0;
  
  var cifStrCheck = new RegExp("[\\s\(\)]");
  var cifStrNLCheck = new RegExp("[\n]");
  
  var sliceConst = '';
  for (var i=0; i<1024; i++) sliceConst += ' ';
  var padString = function(inp, flength) {"use strict";
    return inp+sliceConst.slice(inp.length, flength);
  };
  
  var dumpCat = function(v) {
    outputN++;
    var k, i, noi;
    noi = Object.keys(v); if (noi.length == 0) return;
    noi = v[noi[0]].length;
    if (noi == 0) return;
    if (noi == 1) {for (k2 in v) outputN++;}
    else {
      outputN++;
      for (k2 in v) outputN++;
      for (i=0; i<noi; i++) outputN++;
    }
    outputN++;
  }
  
  var dumpPart = function(part, skip) {
    var k;
    for (k in part) {
      if (typeof(part[k]) == "object" && ! Array.isArray(part[k])) {
        if (k.substr(0, 5) != "data_" && k.substr(0, 5) != "save_" && k.substr(0, 7) != "global_") dumpCat(part[k]);
        else {outputN++; dumpPart(part[k]);}
      }
    }
    outputN++;
  }
  dumpPart(data);
  
  return outputN;
}


//registerPublic::dumpCIF
function dumpCIF(data, settings) {
  settings = settings || {};
  var output = "";
  
  var cifStrCheck = new RegExp("[\\s\(\)\.]");
  var cifStrNLCheck = new RegExp("[\n]");
  
  var sliceConst = '';
  for (var i=0; i<1024; i++) sliceConst += ' ';
  var padString = function(inp, flength) {"use strict";
    return inp+sliceConst.slice(inp.length, flength);
  };
  
  var dumpStr = function(inp) {
    if (inp == null) return "?";
    else {
      if (typeof(inp) != "string") return inp+"";
      if (cifStrCheck.test(inp)) {
        if (inp.indexOf("'") != -1 || inp.indexOf('"') != -1 || cifStrNLCheck.test(inp)) return "\n;"+inp+"\n;";
        else return "'"+inp+"'";
      }
      return inp;
    }
  };
  
  var dumpCat = function(k, v) {
    if (! settings.omitHash) output += "#\n";
    var k, i, noi, pad, tmp0, tmp1 = "", tmp2 = [], j;
    noi = Object.keys(v); if (noi.length == 0) return;
    noi = v[noi[0]].length;
    if (noi == 0 && ! settings.forceLoop) return "";
    if (noi == 1 && ! settings.forceLoop) {
      pad = 0
      for (k2 in v) if (k2.length > pad) pad = k2.length;
      pad += 3;
      for (k2 in v) output += "_"+k+"."+padString(k2, pad)+dumpStr(v[k2][0], pad)+"\n"
    }
    else {
      output += "loop_\n";
      pad = [];
      for (k2 in v) {
        output += "_"+k+"."+k2+"\n";
        pad.push(0);
      }
      if (settings.splitLoop) output += "#" + settings.splitLoop + "#\n";
      
      for (i=0; i<noi; i++) {
        j = 0;
        for (k2 in v) {
          tmp1 = dumpStr(v[k2][i]);
          if (tmp1.substr(0,2) != '\n;' && tmp1.length > pad[j]) pad[j] = tmp1.length;
          j++;
        }
      }
      
      for (j=0; j<pad.length; j++) pad[j]++;
      
      for (i=0; i<noi; i++) {
        j = 0;
        tmp1 = "";
        for (k2 in v) {
          tmp0 = padString(dumpStr(v[k2][i]), pad[j]);
          if (tmp1.endsWith(";") && !tmp0.startsWith("\n")) tmp0 = "\n" + tmp0;
          tmp1 += tmp0
          j++;
        }
        output += tmp1+"\n";
        if (i%200000 == 0) output[0]; // prevent chrome (aka V8) from crapping out
      }
    }
    if (output.length && output[output.length-1] != "\n") output += "\n";
  }
  
  var inner = true;
  var dumpPart = function(part, skip) {
    var k;
    for (k in part) {
      if (typeof(part[k]) == "object" && ! Array.isArray(part[k])) {
        if (k.substr(0, 5) != "data_" && k.substr(0, 5) != "save_" && k.substr(0, 7) != "global_") dumpCat(k, part[k], true);
        else {output += k+"\n"; dumpPart(part[k]); inner = false;}
      }
    }
    if (!(skip || ! inner)) output += (settings.omitHash ? "" : "#")+"\n";
    output[0]; // prevent chrome (aka V8) from crapping out
  }
  dumpPart(data);

  return output;
}
