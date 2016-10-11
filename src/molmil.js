/*!
 * molmil.js
 *
 * Molmil molecular web viewer: https://github.com/gjbekker/molmil
 * 
 * By Gert-Jan Bekker
 * License: LGPLv3
 *   See https://github.com/gjbekker/molmil/blob/master/LICENCE.md
 */

// ** settings objects **
 
var molmil = molmil || {};

molmil.canvasList = []; molmil.mouseDown = false; molmil.mouseDownS = {}; molmil.mouseMoved = false; molmil.Xcoord = 0; molmil.Ycoord = 0; molmil.Zcoord = 0; molmil.activeCanvas = null; molmil.touchList = null; molmil.touchMode = false;
molmil.longTouchTID = null; molmil.previousTouchEvent = null;
molmil.ignoreBlackList = false;

// switch PDBj URLs to newweb file service
molmil.settings_default = {
  src: "/molmil/",
  pdb_url: "//ipr.pdbj.org/rest/displayPDBfile?format=mmjson-all&id=__ID__",
  comp_url: "//ipr.pdbj.org/rest/displayCOMPfile?format=mmjson&id=__ID__",
  promodeE_check_url: "//ipr.pdbj.org/rest/quick_search?fields=5&query=__ID__",
  promodeE_base_structure_url: "//ipr.pdbj.org/rest/displayPromodeEfile?format=min&id=__ID__",
  promodeE_mode_vectors_url: "//ipr.pdbj.org/rest/displayPromodeEfile?format=vec&id=__ID_____MODE__",
  promodeE_animation_url: "//ipr.pdbj.org/rest/displayPromodeEfile?format=anm&id=__ID_____MODE__",
  
  molmil_video_url: "http://127.0.0.1:8080/app/",
};

molmil.cli_canvas = null;
molmil.cli_soup = null;

molmil.settings = window.molmil_settings || molmil.settings_default;
for (var e in molmil.settings_default) if (! molmil.settings.hasOwnProperty(e)) molmil.settings[e] = molmil.settings_default[e];

molmil.configBox = {
  initFinished: false,
  liteMode: false,
  cullFace: true,
  
  vdwR: {
    DUMMY: 1.7, 
    H: 1.09, 
    D: 1.09, 
    C: 1.7, 
    N: 1.55, 
    O: 1.52, 
    S: 1.8,
    Cl: 1.75,
    B: 1.8,
    P: 1.8,
    Fe: 1.8,
    Ba: 1.8,
    So: 1.8,
    Mg: 1.8,
    Zn: 1.8,
    Cu: 1.4,
    Ni: 1.8,
    Br: 1.95,
    Ca: 1.8,
    Mn: 1.8,
    Al: 1.8,
    Ti: 1.8,
    Cr: 1.8,
    Ag: 1.8,
    F: 1.47,
    Si: 1.8,
    Au: 1.8,
    I: 2.15,
    Li: 1.8,
    He: 1.8,
    Se: 1.9
  },

  sndStrucInfo: {1: [255, 255, 255], 2: [255, 255, 0], 3: [255, 0, 255], 4: [0, 0, 255]},
  
  zNear: 20.0,
  zFar: 20000.0,
  
  QLV_SETTINGS: [
    {SPHERE_TESS_LV: 0, CB_NOI: 4, CB_NOVPR: 4, CB_DOME_TESS_LV: 0}, 
    {SPHERE_TESS_LV: 1, CB_NOI: 4, CB_NOVPR: 8, CB_DOME_TESS_LV: 1}, 
    {SPHERE_TESS_LV: 2, CB_NOI: 8, CB_NOVPR: 16, CB_DOME_TESS_LV: 2}, 
    {SPHERE_TESS_LV: 3, CB_NOI: 12, CB_NOVPR: 32, CB_DOME_TESS_LV: 3},
    {SPHERE_TESS_LV: 4, CB_NOI: 16, CB_NOVPR: 32, CB_DOME_TESS_LV: 4}],
  
  
  OES_element_index_uint: null,
  EXT_frag_depth: null,
  BGCOLOR: [0.0, 0.0, 0.0, 1.0],
  
  backboneAtoms4Display: {"N": 1, "C": 1, "O": 1, "H": 1, "OXT": 1, "H1": 1, "H2": 1, "H3": 1, "HA": 1, "HA2": 1, "HA3": 1},
  backboneAtoms4DisplayXNA: {"P": 1, "O5'": 1, "OP1": 1, "OP2": 1, "C3'": 1, "C4'": 1, "C5'": 1, "O4'": 1, "C2'": 1, "O3'": 1, "O2'": 1, "H": 1},
  xna_simple_base_atoms: {"O5'": 1, "C5'": 1, "C4'": 1, "O4'": 1, "C3'": 1, "O3'": 1, "C2'":1, "O6": 1, "N2": 1, "N4": 1, "P": 1, "OP1": 1, "OP2": 1, "O2": 1, "O2'": 1, "N6": 1, "O4": 1, "DO3'": 1, "D41": 1, "D42": 1, "D21": 1, "D22": 1, "D61": 1, "D62": 1},
  projectionMode: 1, // 1: perspective, 2: orthographic
  colorMode: 1, // 1: rasmol, 2: jmol
  
  smoothFactor: 2,
  
  glsl_shaders: [
    ["shaders/standard.glsl"], 
    ["shaders/lines.glsl"], 
    ["shaders/picking.glsl"], 
    ["shaders/linesPicking.glsl"], 
    ["shaders/atomSelection.glsl"], 
    //["shaders/imposterPoints.glsl", "points", "", ["EXT_frag_depth"]],
    ["shaders/lines.glsl", "lines_uniform_color", "#define UNIFORM_COLOR 1\n"],
    ["shaders/standard.glsl", "standard_alpha", "#define ALPHA_MODE 1\n"],
    ["shaders/standard.glsl", "standard_uniform_color", "#define UNIFORM_COLOR 1\n"],
    ["shaders/standard.glsl", "standard_alpha_uniform_color", "#define ALPHA_MODE 1\n#define UNIFORM_COLOR 1\n"],
    //["shaders/imposterPoints.glsl", "points_uniform_color", "#define UNIFORM_COLOR 1\n"],
    ["shaders/anaglyph.glsl"], 
    ["shaders/billboardShader.glsl"]
  ],
  glsl_fog: 0, // 0: off, 1: on
  skipClearGeometryBuffer: true,
  stereoMode: 0,
  stereoFocalFraction: 1.5,
  stereoEyeSepFraction: 30,
  camera_fovy: 45.0,
  HQsurface_gridSpacing: 1.0,
  webGL2: false
};

molmil.AATypes = {"ALA": 1, "CYS": 1, "ASP": 1, "GLU": 1, "PHE": 1, "GLY": 1, "HIS": 1, "ILE": 1, "LYS": 1, "LEU": 1, "MET": 1, "ASN": 1, "PRO": 1, "GLN": 1, "ARG": 1, 
"SER": 1, "THR": 1, "VAL": 1, "TRP": 1, "TYR": 1, "ACE": 1, "NME": 1, "HIP": 1, "HIE": 1, "HID": 1, "CYX": 1,
"A": 1, "T": 1, "G": 1, "C": 1, "DA": 1, "DT": 1, "DG": 1, "DC": 1, "U": 1, "DU": 1, "MSE": 1, "SEQ": 1, "CSW": 1};

molmil.AATypesBase = {"ALA": 1, "CYS": 1, "ASP": 1, "GLU": 1, "PHE": 1, "GLY": 1, "HIS": 1, "ILE": 1, "LYS": 1, "LEU": 1, "MET": 1, "ASN": 1, "PRO": 1, "GLN": 1, "ARG": 1, "SER": 1, "THR": 1, "VAL": 1, "TRP": 1, "TYR": 1, "ACE": 1, "NME": 1, "HIP": 1, "HIE": 1, "HID": 1};

molmil.initSettings = function () {
  var colors, cmode = localStorage.getItem("molmil.settings_COLORS") || 1;
  if (cmode == 2) {
    colors = {
      DUMMY: [255, 20, 147],
      H: [255, 255, 255],
      D: [255, 255, 255],
      C: [144,144,144],
      N: [48,80,248],
      O: [255,13,13],
      S: [255,255,48],
      Cl: [31,240,31],
      B: [255,181,181],
      P: [255,128,0],
      Fe: [224,102,51],
      Ba: [0,201,0],
      Mg: [138,255,0],
      Zn: [125,128,176],
      Cu: [200,128,51],
      Ni: [80,208,80],
      Br: [165, 42, 42],
      Ca: [61,255,0],
      Mn: [156,122,199],
      Al: [191,166,166],
      Ti: [191,194,199],
      Cr: [138,153,199],
      Ag: [192,192,192],
      F: [144,224,80],
      Si: [240,200,160],
      Au: [255,209,35],
      I: [148,0,148],
      Li: [204,128,255],
      He: [217,255,255]
    };
  }
  else if (cmode == 3) {
    colors = {
      DUMMY: [255, 127, 0],
      H: [204, 204, 204],
      D: [204, 204, 204],
      C: [0,255,255],
      N: [0,0,255],
      O: [255,0,0],
      P: [255,255,0],
      S: [0,255,0],
    };
  }
  else {
    colors = {
      DUMMY: [255, 20, 147],
      H: [255, 255, 255],
      D: [255, 255, 255],
      C: [200, 200, 200],
      N: [143, 143, 255],
      O: [240, 0, 0],
      S: [255, 200, 50],
      Cl: [0, 255, 0],
      B: [0, 255, 0],
      P: [255, 165, 0],
      Fe: [255, 165, 0],
      Ba: [255, 165, 0],
      Mg: [34, 139, 34],
      Zn: [165, 42, 42],
      Cu: [165, 42, 42],
      Ni: [165, 42, 42],
      Br: [165, 42, 42],
      Ca: [128, 128, 144],
      Mn: [128, 128, 144],
      Al: [128, 128, 144],
      Ti: [128, 128, 144],
      Cr: [128, 128, 144],
      Ag: [128, 128, 144],
      F: [218, 165, 32],
      Si: [218, 165, 32],
      Au: [218, 165, 32],
      I: [160, 32, 240],
      Li: [178, 34, 34],
      He: [255, 192, 203]
    };
  }
 
  molmil.configBox.elementColors = {};
  for (var e in colors) molmil.configBox.elementColors[e] = [colors[e][0], colors[e][1], colors[e][2], 255];
  
  molmil.configBox.sndStrucColor = {};
  for (var e in molmil.configBox.sndStrucInfo) molmil.configBox.sndStrucColor[e] = [molmil.configBox.sndStrucInfo[e][0], molmil.configBox.sndStrucInfo[e][1], molmil.configBox.sndStrucInfo[e][2], 255];
  
  molmil.configBox.bu_colors = [[0, 204, 255], [255, 51, 255], [0, 255, 102], [153, 102, 255], [255, 255, 0], [204, 102, 102], [153, 204, 102], [204, 153, 204], [153, 153, 102], [0, 204, 204], [153, 153, 153], [51, 153, 204], [0, 255, 153], [51, 153, 255], [204, 102, 153], [0, 255, 204], [51, 204, 255], [204, 102, 204], [0, 255, 255], [102, 153, 204], [204, 153, 0], [51, 204, 102], [102, 153, 255], [204, 153, 51], [51, 204, 153], [102, 204, 255], [204, 153, 102], [51, 204, 204], [153, 102, 204], [204, 153, 153], [51, 255, 51], [51, 255, 102], [153, 153, 204], [204, 204, 0], [51, 255, 153], [153, 153, 255], [204, 204, 51], [51, 255, 204], [153, 204, 255], [204, 204, 102], [51, 255, 255], [204, 102, 255], [204, 204, 153], [102, 153, 153], [204, 153, 255], [204, 204, 204], [102, 204, 51], [204, 204, 255], [255, 51, 204], [102, 204, 102], [102, 204, 153], [255, 102, 51], [102, 204, 204], [255, 102, 102], [102, 255, 0], [255, 102, 153], [102, 255, 51], [255, 102, 204], [102, 255, 102], [255, 102, 255], [102, 255, 153], [255, 153, 0], [102, 255, 204], [255, 153, 51], [102, 255, 255], [255, 153, 102], [153, 204, 0], [255, 153, 153], [153, 204, 51], [255, 153, 204], [255, 153, 255], [153, 204, 153], [255, 204, 0], [153, 204, 204], [255, 204, 51], [153, 255, 0], [255, 204, 102], [153, 255, 51], [255, 204, 153], [153, 255, 102], [255, 204, 204], [153, 255, 153], [255, 204, 255], [153, 255, 204], [153, 255, 255], [255, 255, 51], [204, 255, 0], [255, 255, 102], [204, 255, 51], [255, 255, 153], [204, 255, 102], [255, 255, 204], [204, 255, 153], [255, 255, 255], [204, 255, 204], [204, 255, 255]];
  
  molmil.configBox.glsl_fog = localStorage.getItem("molmil.settings_glsl_fog") == 1;
  molmil.configBox.projectionMode = localStorage.getItem("molmil.settings_PROJECTION") || 1;
  molmil.configBox.stereoMode = parseInt(localStorage.getItem("molmil.settings_STEREO")) || 0;
  
  molmil.configBox.smoothFactor = localStorage.getItem("molmil.settings_BBSF") || 2;
  
  var tmp = localStorage.getItem("molmil.settings_BGCOLOR");
  if (tmp) {
    try {molmil.configBox.BGCOLOR = JSON.parse(tmp);}
    catch (e) {}
  }

}

// display modes
molmil.displayMode_None = 0;
molmil.displayMode_Visible = 0.5;
molmil.displayMode_Default = 1;
molmil.displayMode_Spacefill = 2;
molmil.displayMode_Spacefill_SC = 2.5;
molmil.displayMode_BallStick = 3;
molmil.displayMode_BallStick_SC = 3.5;
molmil.displayMode_Stick = 4;
molmil.displayMode_Stick_SC = 4.5;
molmil.displayMode_Wireframe = 5;
molmil.displayMode_Wireframe_SC = 5.5;
molmil.displayMode_CaTrace = 6;
molmil.displayMode_Tube = 7;
molmil.displayMode_Cartoon = 8;
molmil.displayMode_CartoonRocket = 8.5;
molmil.displayMode_ChainSurfaceCG = 10;
molmil.displayMode_ChainSurfaceSimple = 11;

molmil.displayMode_XNA = 400;

// color modes
molmil.colorEntry_Default = 1;
molmil.colorEntry_Structure = 2;
molmil.colorEntry_CPK = 3;
molmil.colorEntry_Group = 4;
molmil.colorEntry_Chain = 5;
molmil.colorEntry_Custom = 6;
molmil.colorEntry_ChainAlt = 7;
molmil.colorEntry_ABEGO = 8;

// ** data objects **

molmil.atomObject = function (Xpos, AN, element, molObj, chainObj) {
  this.xyz = Xpos; // this should become an idx
  this.element = element.charAt(0).toUpperCase() + element.slice(1).toLowerCase();
  this.atomName = AN;
  this.displayMode = 0;
  this.display = 1;
  this.rgba = [0, 0, 0, 255];
  this.molecule = molObj;
  this.chain = chainObj;
  this.radius = 0.0;
  this.AID = 0;
}

molmil.atomObject.prototype.toString = function() {
  var sgl = this.molecule.atoms.length > 1;
  return (sgl ? this.atomName : this.element) + " ("+this.AID+") - " + (sgl ? (this.molecule.name || "") + " " : "") + (this.molecule.RSID || "") + (this.molecule.chain.name ? " - Chain " + this.molecule.chain.name : "");
};

molmil.molObject = function (name, id, chain) {
  this.atoms = [];
  this.name = name;
  this.id = id;
  this.RSID = id;
  this.chain = chain;
  this.ligand = true;
  this.water = false;
  this.display = 1;
  this.next = null, this.previous = null;
  this.rgba = [0, 0, 0, 255];
  this.sndStruc = 1;
  this.xna = false;
  this.showSC = false;
}

molmil.molObject.prototype.toString = function() {var sgl = this.atoms.length > 1; return (sgl ? (this.name || "") + " " : "") + (this.RSID || "") + (this.chain.name ? " - Chain " + this.chain.name : "");};

molmil.chainObject = function (name, entry) {
  this.name = name;
  this.authName = name;
  this.molecules = [];
  this.entry = entry;
  this.display = true;
  this.modelsXYZ = [[]];
  this.atoms = [];
  this.bonds = [];
  this.bondsOK = false;
  this.displayMode = molmil.displayMode_Default;
  this.isHet = true;
  this.rgba = [255, 255, 255, 255];
  this.display = true;
}

molmil.chainObject.prototype.toString = function() {return (this.name ? "Chain " + this.name : "");};

molmil.entryObject = function (meta) { // this should become a structure object instead --> models should only be virtual; i.e. only the coordinates should be saved, the structure (chain->residue->atom) is determined by the initial model
  this.chains = [];
  this.meta = meta || {};
  this.display = true;
};

molmil.entryObject.prototype.toString = function() {return "Entry "+(this.meta.id || "");};

molmil.polygonObject = function (meta) {
  this.programs = [];
  this.meta = meta || {};
};

molmil.labelObject = function(soup) {
  this.soup = soup;
  this.texture = null;
  this.settings = {dx: 0.0, dy: 0.0, dz: 0.0, color: [0, 255, 0], fontSize: 20};
  this.xyz = [0.0, 0.0, 0.0];
  this.display = true;
  this.text = "";
  this.status = false;
}

// ** object controlling animation (multiple models & trajectories) **

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
  this.init = true;
  this.infoBox = infoBox;
};

molmil.animationObj.prototype.updateInfoBox = function() {
  if (! this.infoBox) return;
  if (this.infoBox.timeBox) {
    if (this.soup.frameInfo) this.infoBox.timeBox.innerHTML = this.soup.frameInfo[this.frameNo][1]+"ps";
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
  this.frameNo += 1;
  //if (this.frameNo >= this.renderer.framesBuffer.length) {
  if (this.frameNo >= this.number_of_frames) {
    if (this.motionMode == 3) {this.frameNo -= 1; return this.backwardRenderer();}
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





// ** main molmil object **

molmil.viewer = function (canvas) {
  this.canvas = canvas;

  this.renderer = new molmil.render(this);
  this.UI = new molmil.UI(this);
  
  this.defaultCanvas = [canvas, this.renderer];
  
  this.onAtomPick = function() {};
  
  this.animation = new molmil.animationObj(this);
  
  this.clear();
};

molmil.viewer.prototype.toString = function() {return " SOUP";};

molmil.viewer.prototype.reloadSettings = function() {
  this.renderer.reloadSettings();
};

molmil.viewer.prototype.clear = function() {
  this.structureFiles = [];
  this.trajectory = [];
  this.structures = [];
  this.chains = [];
  
  this.files = [];
  this.infoBag = {};

  this.bumats = [];
  this.BUmatrices = {};
  this.BUassemblies = {};
  this.poly_asym_ids = [];
  this.BUcache = {};
  this.BUmode = false;
  this.avgX = 0.0;
  this.avgY = 0.0;
  this.avgZ = 0.0;
  this.stdX = 0.0;
  this.stdY = 0.0;
  this.stdZ = 0.0;
  this.avgXYZ = [];
  this.stdXYZ = [];
  this.COR = [0, 0, 0];
  this.geomRanges = [0, 0, 0, 0, 0, 0];
  this.maxRange = 0;

  this.texturedBillBoards = [];
 
  //this.polygonData = [];
  this.atomRef = {};
  this.AID = 1;
  this.CID = 1;
  this.MID = 1;
  
  this.BU = false;
  
  this.atomSelection = [];
  
  this.hideWaters = true;
  this.hideHydrogens = true;
  
  this.sceneBU = null;
  
  this.canvases = [];
  
  this.SCstuff = false;
  
  if (this.canvas) {
    this.canvas.atomCORset = false;
    this.canvases = [this.canvas];
  }
  this.renderer.clear();
  
  this.renderer.camera.z_set = false;
};


molmil.viewer.prototype.gotoMol = function(mol) {
  // for residue:
  // along N-CA-C axis
  // then zoom out 10A?
  
  var one = mol.N;
  var two = mol.CA;
  var three = mol.C;
  
  if (! (mol.N && mol.CA && mol.C)) {
    
    var xyz = mol.chain.modelsXYZ[this.renderer.modelId], x, y, z, COG = [0, 0, 0];
    
    for (var i=0; i<mol.atoms.length; i++) {
      x = xyz[mol.atoms[i].xyz]; y = xyz[mol.atoms[i].xyz+1]; z = xyz[mol.atoms[i].xyz+2];
      COG[0] += x;
      COG[1] += y;
      COG[2] += z;
    }
    COG[0] /= mol.atoms.length;
    COG[1] /= mol.atoms.length;
    COG[2] /= mol.atoms.length;
    
    var nearest = [1e99, -1], r;
    for (var i=0; i<mol.atoms.length; i++) {
      x = xyz[mol.atoms[i].xyz]; y = xyz[mol.atoms[i].xyz+1]; z = xyz[mol.atoms[i].xyz+2];
      
      r = Math.pow(COG[0]-x, 2) + Math.pow(COG[1]-y, 2) + Math.pow(COG[2]-z, 2);
      if (r < nearest[0]) {nearest[0] = r; nearest[1] = i}
    }
    
    two = mol.atoms[nearest[1]];
    
    var x2, y2, z2, farthest = [-1, -1, -1];
    for (var i=0; i<mol.atoms.length; i++) {
      x = xyz[mol.atoms[i].xyz]; y = xyz[mol.atoms[i].xyz+1]; z = xyz[mol.atoms[i].xyz+2];
      for (var j=i+1; j<mol.atoms.length; j++) {
        x2 = xyz[mol.atoms[j].xyz]; y2 = xyz[mol.atoms[j].xyz+1]; z2 = xyz[mol.atoms[j].xyz+2];
        
        r = Math.pow(x-x2, 2) + Math.pow(y-y2, 2) + Math.pow(z-z2, 2);
        if (r > farthest[0]) {
          farthest[0] = r;
          farthest[1] = i;
          farthest[2] = j;
        }
      }
    }
    
    one = mol.atoms[farthest[1]];
    three = mol.atoms[farthest[2]];
  }
  
  this.renderer.camera.reset();
  if (this.canvas.atomCORset) this.resetCOR();

  if (! one || ! three || one == two || two == three) {
    var x = xyz[two.xyz]; var y = xyz[two.xyz+1]; var z = xyz[two.xyz+2];
    
    this.renderer.camera.x = -x+this.COR[0];
    this.renderer.camera.y = -y+this.COR[1];
    this.renderer.camera.z = -z-molmil.configBox.zNear+this.COR[2]-2;

    return;
  }
    
  // norm(CA - ((C+N)*.5))
  var xyz1, xyz2, xyz3, vec = [0, 0, 0];
  var xyz1 = [mol.chain.modelsXYZ[this.renderer.modelId][one.xyz], mol.chain.modelsXYZ[this.renderer.modelId][one.xyz+1], mol.chain.modelsXYZ[this.renderer.modelId][one.xyz+2]];
  var xyz2 = [mol.chain.modelsXYZ[this.renderer.modelId][three.xyz], mol.chain.modelsXYZ[this.renderer.modelId][three.xyz+1], mol.chain.modelsXYZ[this.renderer.modelId][three.xyz+2]];
  var xyz3 = [mol.chain.modelsXYZ[this.renderer.modelId][two.xyz], mol.chain.modelsXYZ[this.renderer.modelId][two.xyz+1], mol.chain.modelsXYZ[this.renderer.modelId][two.xyz+2]];
    
  xyz1[0] -= this.avgXYZ[0]; xyz1[1] -= this.avgXYZ[1]; xyz1[2] -= this.avgXYZ[2];
  xyz2[0] -= this.avgXYZ[0]; xyz2[1] -= this.avgXYZ[1]; xyz2[2] -= this.avgXYZ[2];
  xyz3[0] -= this.avgXYZ[0]; xyz3[1] -= this.avgXYZ[1]; xyz3[2] -= this.avgXYZ[2];
    
  vec[0] = xyz3[0] - ((xyz1[0] + xyz2[0]) * .5);
  vec[1] = xyz3[1] - ((xyz1[1] + xyz2[1]) * .5);
  vec[2] = xyz3[2] - ((xyz1[2] + xyz2[2]) * .5);
  vec3.normalize(vec, vec);
    
  var A = [xyz1[0]-xyz3[0], xyz1[1]-xyz3[1], xyz1[2]-xyz3[2]]; vec3.normalize(A, A);
  var B = [xyz2[0]-xyz3[0], xyz2[1]-xyz3[1], xyz2[2]-xyz3[2]]; vec3.normalize(B, B);
  var C = vec3.cross([0, 0, 0], A, B); vec3.normalize(C, C);
   
  var eye = [vec[0]*5 - xyz3[0], vec[1]*5 - xyz3[1], vec[2]*5 - xyz3[2]];
  var s = vec3.cross([0, 0, 0], vec, C); vec3.normalize(s, s);
  var u = vec3.cross([0, 0, 0], s, vec);

  var matrix = mat4.create();
  matrix[0] = s[0]; matrix[4] = s[1]; matrix[8] = s[2];
  matrix[1] = u[0]; matrix[5] = u[1]; matrix[9] = u[2];
  matrix[2] = -vec[0]; matrix[6] = -vec[1]; matrix[10] = -vec[2];
  matrix[12] = -vec3.dot(s, eye); matrix[13] = -vec3.dot(u, eye); matrix[14] = -vec3.dot(vec, eye);
  
  this.renderer.camera.x = -matrix[12];
  this.renderer.camera.y = -matrix[13];
  this.renderer.camera.z = matrix[14]-molmil.configBox.zNear;

  quat.fromMat3(this.renderer.camera.QView, mat3.fromMat4(mat3.create(), matrix));
  quat.normalize(this.renderer.camera.QView, this.renderer.camera.QView);
};

molmil.viewer.prototype.waterToggle = function(show) {
  for (var m=0, c, a; m<this.structures.length; m++) {
    if (! this.structures[m].chains) continue;
    for (c=0; c<this.structures[m].chains.length; c++) {
      for (a=0; a<this.structures[m].chains[c].atoms.length; a++) {
        if (this.structures[m].chains[c].atoms[a].molecule.water && (! this.hideHydrogens || this.structures[m].chains[c].atoms[a].element != "H")) 
          this.structures[m].chains[c].atoms[a].display = show;
      }
    }
  }
  this.hideWaters = ! show;
};

molmil.viewer.prototype.hydrogenToggle = function(show) {
  for (var m=0, c, a; m<this.structures.length; m++) {
    if (! this.structures[m].chains) continue;
    for (c=0; c<this.structures[m].chains.length; c++) {
      for (a=0; a<this.structures[m].chains[c].atoms.length; a++) {
        if (this.structures[m].chains[c].atoms[a].element == "H" || this.structures[m].chains[c].atoms[a].element == "D") this.structures[m].chains[c].atoms[a].display = show;
      }
    }
  }

  this.hideHydrogens = ! show;
};

molmil.viewer.prototype.restoreDefaultCanvas = function(canvas) {
  this.canvas = this.defaultCanvas[0];
  this.renderer = this.defaultCanvas[1];
}



molmil.getSelectedAtom = function(n, soup) {
  n = n || 0;
  soup = soup || molmil.cli_soup;
  
  if (n >= soup.atomSelection.length) return;
  return soup.atomSelection[n];
};

// ** this function is executed when a user clicks on something on the screen **
molmil.viewer.prototype.selectObject = function(x, y, event) {
  y = this.canvas.height-y;
  var gl = this.renderer.gl;
  
  if (! this.renderer.FBOs.pickingBuffer) {
    this.renderer.FBOs.pickingBuffer = new molmil.FBO(gl, this.renderer.width, this.renderer.height);
    this.renderer.FBOs.pickingBuffer.addTexture("colourBuffer", gl.RGBA, gl.RGBA);
    this.renderer.FBOs.pickingBuffer.setup();
  }
  else if (this.renderer.FBOs.pickingBuffer.width != this.renderer.width || this.renderer.FBOs.pickingBuffer.height != this.renderer.height) this.renderer.FBOs.pickingBuffer.resize(this.renderer.width, this.renderer.height);
  
  this.renderer.FBOs.pickingBuffer.bind();
  this.renderer.renderPicking();
  var data = new Uint8Array(4);
  gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, data);
  var ID = Math.round(vec4.dot([data[0]/255., data[1]/255., data[2]/255., data[3]/255.], [1.0/(255.0*255.0*255.0), 1.0/(255.0*255.0), 1.0/255.0, 1.0]) * 4228250625.); //4228250625
  this.renderer.FBOs.pickingBuffer.unbind();
  if (ID != 0) {
    var atom = this.atomRef[ID];
    if (atom) {
      var cbox = this.canvas.commandLine ? this.canvas.commandLine.environment.console : console;
      cbox.log("Clicked on atom: "+atom); console.log("Clicked on atom: ", atom);
      if (event && event.ctrlKey) {
        var add = true;
        for (var i=0; i<this.atomSelection.length; i++) if (this.atomSelection[i] == atom) {add = false; break;}
        if (add) this.atomSelection.push(atom);
        if (this.atomSelection.length == 2) {
          cbox.log("Distance: ", molmil.calcMMDistance(this.atomSelection[0], this.atomSelection[1], this), " | ", this.atomSelection[0], this.atomSelection[1]);
        }
        else if (this.atomSelection.length == 3) {
          cbox.log("Angle: ", molmil.calcMMAngle(this.atomSelection[0], this.atomSelection[1], this.atomSelection[2], this), " | ", this.atomSelection[0], this.atomSelection[1], this.atomSelection[2]);
        }
        else if (this.atomSelection.length == 4) {
          cbox.log("Torsion: ", molmil.calcMMTorsion(this.atomSelection[0], this.atomSelection[1], this.atomSelection[2], this.atomSelection[3], this), " | ", this.atomSelection[0], this.atomSelection[1], this.atomSelection[2], this.atomSelection[3]);
        }
      }
      else this.atomSelection = [atom];
      this.onAtomPick(atom);
      this.canvas.renderer.updateSelection();
    }
  }
  else {
    this.atomSelection = [];
    this.canvas.renderer.updateSelection();
  }
  this.canvas.update = true;
};

// ** loads a file from a URL **
molmil.viewer.prototype.loadStructure = function(loc, format, ondone, settings) { // ignore format here...
  settings = settings || {};
  var gz = loc.substr(-3).toLowerCase() == ".gz" && ! settings.no_pako_gz;
  if (gz && ! window.hasOwnProperty("pako")) {
    var head = document.getElementsByTagName("head")[0];
    var obj = molmil_dep.dcE("script"); obj.src = molmil.settings.src+"pako.js"; 
    obj.soup = this; obj.argList = [loc, format, ondone, settings]; obj.onload = function() {molmil_dep.asyncStart(this.soup.loadStructure, this.argList, this.soup, 0);};
    head.appendChild(obj);
    return;
  }
  var request = new molmil_dep.CallRemote("GET"), async = molmil_dep.getKeyFromObject(settings || {}, "async", true); request.ASYNC = async; request.target = this;
  request.gz = gz;
  if (request.gz) request.responseType = "arraybuffer";
  if (this.onloaderror) request.OnError = this.onloaderror;
  request.filename = loc.substr(loc.lastIndexOf("/")+1);
  if (format == 1 || (format+"").toLowerCase() == "mmjson") {
    var loc_ = loc;
    if (request.ASYNC && ! request.gz) request.responseType = "json"; // add gzip support...
    request.parse = function() {
      if (this.gz) var jso = JSON.parse(pako.inflate(new Uint8Array(this.request.response), {to: "string"}));
      else var jso = request.request.response;
      if (typeof jso != "object" && jso != null) jso = JSON.parse(this.request.responseText);
      else if (jso == null) {throw "";}
      return this.target.load_PDBx(jso, this.pdbid, this.filename);
    };
  }
  else if (format == 2 || (format+"").toLowerCase() == "mmcif") {
    request.parse = function() {
      return this.target.load_mmCIF(this.gz ? pako.inflate(new Uint8Array(this.request.response), {to: "string"}) : this.request.responseText, this.filename);
    };
  }
  else if (format == 3 || (format+"").toLowerCase() == "pdbml") {
    request.parse = function() {
      return this.target.load_PDBML(this.gz ? pako.inflate(new Uint8Array(this.request.response), {to: "string"}) : this.request.responseXML, this.filename);
    };
  }
  else if (format == 4 || (format+"").toLowerCase() == "pdb") {
    request.parse = function() {
      return this.target.load_PDB(this.gz ? pako.inflate(new Uint8Array(this.request.response), {to: "string"}) : this.request.responseText, this.filename);
    };
  }
  else if (format == 5 || (format+"").toLowerCase() == "polygon-xml") {
    request.parse = function() {
      return this.target.load_polygonXML(this.gz ? pako.inflate(new Uint8Array(this.request.response), {to: "string"}) : this.request.responseXML || this.request.responseText, this.filename, settings);
    };
  }
  else if (format == 6 || (format+"").toLowerCase() == "polygon-json") {
    request.ASYNC = true; request.responseType = "json";
    request.parse = function() {
      var jso = this.gz ? JSON.parse(pako.inflate(new Uint8Array(this.request.response), {to: "string"})) : request.request.response;
      if (typeof jso != "object" && jso != null) jso = JSON.parse(this.request.responseText);
      return this.target.load_polygonJSON(jso, this.filename);
    };
  }
  else if (format == 7 || (format+"").toLowerCase() == "gro") {
    request.parse = function() {
      return this.target.load_GRO(this.gz ? pako.inflate(new Uint8Array(this.request.response), {to: "string"}) : this.request.responseText, this.filename);
    };
  }
  else if (format == 8 || (format+"").toLowerCase() == "mpbf") {
    request.ASYNC = true; request.responseType = "arraybuffer";
    request.parse = function() {
      return this.target.load_MPBF(this.request.response, this.filename);
    };
  }
  else if ((format+"").toLowerCase() == "ccp4") {
    request.ASYNC = true; request.responseType = "arraybuffer";
    request.parse = function() {
      return this.target.load_ccp4(this.request.response, this.filename, settings);
    };
  }
  else if ((format+"").toLowerCase() == "obj") {
    request.ASYNC = true;
    request.parse = function() {
      return this.target.load_obj(this.request.response, this.filename);
    };
  }
  else if ((format+"").toLowerCase() == "mdl") {
    request.parse = function() {
      return this.target.load_mdl(this.gz ? pako.inflate(new Uint8Array(this.request.response), {to: "string"}) : this.request.responseText, this.filename);
    };
  }
  else if ((format+"").toLowerCase() == "mol2") {
    request.parse = function() {
      return this.target.load_mol2(this.gz ? pako.inflate(new Uint8Array(this.request.response), {to: "string"}) : this.request.responseText, this.filename);
    };
  }
  else if ((format+"").toLowerCase() == "xyz") {
    request.parse = function() {
      return this.target.load_xyz(this.gz ? pako.inflate(new Uint8Array(this.request.response), {to: "string"}) : this.request.responseText, this.filename, settings);
    };
  }
  else if (format.toLowerCase() == "gromacs-trr") {
    request.ASYNC = true; request.responseType = "arraybuffer";
    request.parse = function() {
      return this.target.loadGromacsTRR(this.request.response, this.filename);
    };
  }
  else if (format.toLowerCase() == "gromacs-xtc") {
    request.ASYNC = true; request.responseType = "arraybuffer";
    request.parse = function() {
      return this.target.loadGromacsXTC(this.request.response, this.filename);
    };
  }
  else if (format.toLowerCase() == "psygene-traj") {
    request.ASYNC = true; request.responseType = "arraybuffer";
    request.parse = function() {
      var buffer = this.request.response;
      this.target.loadMyPrestoTrj(buffer, molmil_dep.getKeyFromObject(settings || {}, "fxcell", null));
      return this.target.structures;
    };
  }
  else {console.log("Unknown format: "+format); return;}
  request.ondone = ondone;
  request.OnDone = function() {
    var structures = this.parse();
    if (! structures) return;
    molmil.safeStartViewer(this.target.canvas);
    if (ondone) ondone(this.target, structures);
    else {
      molmil.displayEntry(structures, 1);
      molmil.colorEntry(structures, 1, null, true, this.target);
    }
  };
  request.Send(loc);
};

molmil.toBigEndian32 = function(buffer, offset, n, cf) {
  var arr = new Uint32Array(buffer, offset, n), i, value;
  for (i=0; i<n; i++) {
    value = arr[i];
    arr[i] = (((value & 0xFF) << 24) | ((value & 0xFF00) << 8) | ((value >> 8) & 0xFF00) | ((value >> 24) & 0xFF));
  }
  return new cf(buffer, offset, n);
}

// ** GROMACS TRR/XTC related stuff **

// this function currently only works with returning a Float64Array...
molmil.toBigEndian64 = function(buffer, offset, n, cf) {
  var dv = new DataView(buffer, offset, n*8);
  var temp = new Float64Array(n);
  for (var i=0; i<n; i++) {
    temp[i] = dv.getFloat64(i*8);
  }
  return temp;
}

molmil.toBigEndian64_ = function(buffer, offset, n, cf) {
  var arr = new Uint32Array(buffer, offset, n), i, value, value2;
  for (i=0; i<n*2; i+=2) {
    value = arr[i];
    value2 = arr[i+1];
    arr[i+1] = ((value & 0xFF) << 24) | ((value & 0xFF00) << 8) | ((value >> 8) & 0xFF00) | ((value >> 24) & 0xFF);
    arr[i] = ((value2 & 0xFF) << 24) | ((value2 & 0xFF00) << 8) | ((value2 >> 8) & 0xFF00) | ((value2 >> 24) & 0xFF);
  }
  if (cf == Float64Array && offset%8 != 0) {
    // do something weird to make this work...
    var dv = new DataView(buffer, offset, n);
    var temp = new Float64Array(n);
    for (i=0; i<n; i++) {
      //temp[i] = 
    }
  }
  
  return new cf(buffer, offset, n);
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
    
molmil.xtc_sizeofints = function(num_of_ints, sizes) {
  var i, num, num_of_bytes, num_of_bits, bytes=new Uint8Array(32), bytecnt, tmp;
  num_of_bytes = 1; bytes[0] = 1; num_of_bits = 0;
  
  for (i=0; i<num_of_ints; i++) {
    tmp = 0;
    for (bytecnt=0; bytecnt<num_of_bytes; bytecnt++) {
      tmp = bytes[bytecnt] * sizes[i] + tmp;
      bytes[bytecnt] = tmp & 0xff;
      tmp >>= 8;
    }
    while (tmp != 0) {
      bytes[bytecnt++] = tmp & 0xff;
      tmp >>= 8;
    }
    num_of_bytes = bytecnt;
  }
  num = 1;
  num_of_bytes--;
  while (bytes[num_of_bytes] >= num) {
    num_of_bits++;
    num *= 2;
  }
  return num_of_bits + num_of_bytes * 8;
}


molmil.xtc_decodebits = function(buf, cbuf, num_of_bits) {
  var cnt, num, mask = (1 << num_of_bits) - 1, lastBB = new Uint32Array(buf.subarray(1, 3));
  cnt = buf[0];

  num = 0;
  while (num_of_bits >= 8) {
    lastBB[1] = (lastBB[1] << 8) | cbuf[cnt++];
    num |= (lastBB[1] >> lastBB[0]) << (num_of_bits - 8);
    num_of_bits -= 8;
  }

  if (num_of_bits > 0) {
    if (lastBB[0] < num_of_bits) {
      lastBB[0] += 8;
      lastBB[1] = (lastBB[1] << 8) | cbuf[cnt++];
    }
    lastBB[0] -= num_of_bits;
    num |= (lastBB[1] >> lastBB[0]) & ((1 << num_of_bits) -1);
  }
  
  num &= mask;
  buf[0] = cnt;
  buf[1] = lastBB[0];
  buf[2] = lastBB[1];

  return num; 
};
        
molmil.xtc_decodeints = function(buf, cbuf, num_of_ints, num_of_bits, sizes, nums) {
  var bytes = new Int32Array(32), i, j, num_of_bytes, p, num;
  
  bytes[1] = bytes[2] = bytes[3] = 0;
  num_of_bytes = 0;

  while (num_of_bits > 8) {
		bytes[num_of_bytes++] = molmil.xtc_decodebits(buf, cbuf, 8); // this is inversed??? why??? because of the endiannness??? 
		num_of_bits -= 8;
  }
  
  if (num_of_bits > 0) {
    bytes[num_of_bytes++] = molmil.xtc_decodebits(buf, cbuf, num_of_bits);
  }

  for (i=num_of_ints-1; i>0; i--) {
    num = 0;
    for (j=num_of_bytes-1; j>=0; j--) {
			num = (num << 8) | bytes[j];
			p = (num / sizes[i]) | 0;
			bytes[j] = p;
			num = num - p * sizes[i];
    }
    nums[i] = num;
  }
  nums[0] = bytes[0] | (bytes[1] << 8) | (bytes[2] << 16) | (bytes[3] << 24);
};
 
molmil.viewer.prototype.loadGromacsXTC = function(buffer) { 
  var chains = this.structures[0].chains, coffset = [], c, traj = [];
  for (c=0; c<chains.length; c++) {
    coffset.push([(chains[c].atoms[0].AID-1)*3, chains[c].atoms.length*3]);
    chains[c].modelsXYZ = []; // don't use original pdb data, only use it for the topology...
  }
  
  this.frameInfo = [];


  var magicints = [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 10, 12, 16, 20, 25, 32, 40, 50, 64,
    80, 101, 128, 161, 203, 256, 322, 406, 512, 645, 812, 1024, 1290,
    1625, 2048, 2580, 3250, 4096, 5060, 6501, 8192, 10321, 13003, 
    16384, 20642, 26007, 32768, 41285, 52015, 65536,82570, 104031, 
    131072, 165140, 208063, 262144, 330280, 416127, 524287, 660561, 
    832255, 1048576, 1321122, 1664510, 2097152, 2642245, 3329021, 
    4194304, 5284491, 6658042, 8388607, 10568983, 13316085, 16777216 
  ];

  var FIRSTIDX = 9;
  /* note that magicints[FIRSTIDX-1] == 0 */
  var LASTIDX = magicints.length;
  
  // int magic
  // int natoms
  // int step
  // float time
  // float box[3][3]
  // 3dfcoord x[natoms]
  
  var offset = 0, tmp, frame, getFloat = molmil.toBigEndian32, c, lsize, precision, minMaxInt, sizeint,
  bitsizeint, bitsize, smallidx, maxidx, minidx, smaller, smallnum, sizesmall, larger, buf, buf8, rndup,
  inv_precision, run, i, thiscoord, prevcoord, flag, is_smaller, k, lfp, adz;
  
  var buf = new Int32Array(3);

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
      buf[0] = buf[1] = buf[2] = 0.0;
      sizeint = [0, 0, 0]; sizesmall = [0, 0, 0]; bitsizeint = [0, 0, 0]; thiscoord = [0, 0, 0]; prevcoord = [0, 0, 0];
      
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
      //if (smallidx == 0) {alert("Undocumented error 1"); return;}
     
      tmp = smallidx+8;
      maxidx = (LASTIDX<tmp) ? LASTIDX : tmp;
      minidx = maxidx - 8; /* often this equal smallidx */
      tmp = smallidx-1;
      tmp = (FIRSTIDX>tmp) ? FIRSTIDX : tmp;
      smaller = (magicints[tmp] / 2) | 0;
      smallnum = (magicints[smallidx] / 2) | 0;
      
      sizesmall[0] = sizesmall[1] = sizesmall[2] = magicints[smallidx] ;
      larger = magicints[maxidx];
      
      adz = molmil.toBigEndian32(buffer, offset, 1, Int32Array)[0]; offset += 4;
      adz = Math.ceil(adz/4)*4;
      //if (tmp == 0) {alert("Undocumented error 2"); return;}
      
      //buf = new Int32Array(buffer, offset);
      //buf8 = new Uint8Array(buffer, offset);
      
      //tmp += 3; rndup = tmp%4;
      //for (i=tmp+rndup-1; i>=tmp; i--) buf8[i] = 0;

      // now unpack buf2...
      
      inv_precision = 1.0 / precision; run = 0; i = 0;
      
      buf8 = new Uint8Array(buffer, offset); // 229...
      
      thiscoord[0] = thiscoord[1] = thiscoord[2] = 0;
      
      while (i < lsize) {
        if (bitsize == 0) {
          thiscoord[0] = molmil.xtc_decodebits(buf, buf8, bitsizeint[0]);
          thiscoord[1] = molmil.xtc_decodebits(buf, buf8, bitsizeint[1]);
          thiscoord[2] = molmil.xtc_decodebits(buf, buf8, bitsizeint[2]);
        }
        else molmil.xtc_decodeints(buf, buf8, 3, bitsize, sizeint, thiscoord);

        i++;
        
        thiscoord[0] += minMaxInt[0];
        thiscoord[1] += minMaxInt[1];
        thiscoord[2] += minMaxInt[2];
  
        prevcoord[0] = thiscoord[0];
        prevcoord[1] = thiscoord[1];
        prevcoord[2] = thiscoord[2];
        
        flag = molmil.xtc_decodebits(buf, buf8, 1);
        is_smaller = 0;
        
        if (flag == 1) {
          run = molmil.xtc_decodebits(buf, buf8, 5);
          is_smaller = run % 3;
          run -= is_smaller;
          is_smaller--;
        }
        
//		if ((lfp-ptrstart)+run > size3)
//		{
//			fprintf(stderr, "(xdrfile error) Buffer overrun during decompression.\n");
//			return 0;
//		}
  
        if (run > 0) {
          thiscoord[0] = thiscoord[1] = thiscoord[2] = 0;
          
          for (k=0; k<run; k+=3) {
            molmil.xtc_decodeints(buf, buf8, 3, smallidx, sizesmall, thiscoord);
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
          if (smallidx > FIRSTIDX) smaller = (magicints[smallidx - 1] /2) | 0;
          else smaller = 0;
        }
        else if (is_smaller > 0) {
          smaller = smallnum;
          smallnum = (magicints[smallidx] / 2) | 0;
        }
        sizesmall[0] = sizesmall[1] = sizesmall[2] = magicints[smallidx];
          
        if (sizesmall[0]==0 || sizesmall[1]==0 || sizesmall[2]==0) {
          console.error("(xdrfile error) Undefined error.");
          return;
        }
      }
      offset += adz;
    }
    
    traj.push(frame.x);
    for (c=0; c<coffset.length; c++) chains[c].modelsXYZ.push(frame.x.subarray(coffset[c][0], coffset[c][0]+coffset[c][1]));
    
    for (c=0; c<frame.natoms*3; c++) frame.x[c] *= 10;
    
    this.frameInfo.push([frame.step, frame.time]);
    
    if (offset >= buffer.byteLength) break;
  }
  
  this.structures[0].number_of_frames = this.structures[0].chains.length ? this.structures[0].chains[0].modelsXYZ.length : 0;
  
  return [this.structures.length ? this.structures[0] : {}];
  
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
  
  return [this.structures.length ? this.structures[0] : {}];
  
};

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

  return [this.structures.length ? this.structures[0] : {}];
  
};

// ** loads arbitrary data **

molmil.viewer.prototype.loadStructureData = function(data, format, filename, ondone, settings) {
  var struc;
  if (format == 1 || (format+"").toLowerCase() == "mmjson") struc = this.load_PDBx(typeof data == "string" ? JSON.parse(data) : data, filename);
  else if (format == 2 || (format+"").toLowerCase() == "cif") struc = this.load_mmCIF(data, filename);
  else if (format == 3 || (format+"").toLowerCase() == "pdbml") struc = this.load_PDBML(data, filename);
  else if (format == 4 || (format+"").toLowerCase() == "pdb") struc = this.load_PDB(data, filename);
  else if (format == 5 || (format+"").toLowerCase() == "polygon-xml") struc = this.load_polygonXML(data, filename, settings);
  else if (format == 6 || (format+"").toLowerCase() == "polygon-json") struc = this.load_polygonJSON(typeof data == "object" ? data : JSON.parse(data), filename);
  else if (format == 7 || (format+"").toLowerCase() == "gro") struc = this.load_GRO(data, filename);
  else if (format == 8 || (format+"").toLowerCase() == "mpbf") struc = this.load_MPBF(data, filename);
  else if ((format+"").toLowerCase() == "mdl") struc = this.load_mdl(data, filename);
  else if ((format+"").toLowerCase() == "mol2") struc = this.load_mol2(data, filename);
  else if ((format+"").toLowerCase() == "xyz") struc = this.load_xyz(data, filename, settings);
  else if ((format+"").toLowerCase() == "ccp4") struc = this.load_ccp4(data, filename, settings);
  else if ((format+"").toLowerCase() == "obj") struc = this.load_obj(data, filename, settings);
  else if ((format+"").toLowerCase() == "psygene-traj") struc = this.loadMyPrestoTrj(data, molmil_dep.getKeyFromObject(settings || {}, "fxcell", null));
  else if ((format+"").toLowerCase() == "gromacs-trr") struc = this.loadGromacsTRR(data);
  else if ((format+"").toLowerCase() == "gromacs-xtc") struc = this.loadGromacsXTC(data);
  if (! struc) return;
  if (this.canvas) molmil.safeStartViewer(this.canvas);
  if (ondone) ondone(this, struc);
  else if (this.customLoaderFunc) this.customLoaderFunc(this, struc);
  else {
    molmil.displayEntry(struc, 1);
    molmil.colorEntry(struc, 1, null, true, this);
  }
};

// ** connects amino bonds within a chain object **
molmil.viewer.prototype.buildAminoChain = function(chain) {
  if (chain.isHet || (chain.molecules.length && chain.molecules[0].water)) return;
  if (chain.molecules.length == 1 && chain.molecules[0].xna) {
    chain.molecules[0].ligand = chain.isHet = true; chain.molecules[0].xna = false;
    delete chain.molecules[0].N;
    delete chain.molecules[0].CA;
    delete chain.molecules[0].C;
    return;
  }
  var m1, m2, xyz1, xyz2, rC, newChains, struc = chain.entry;
  var xyzRef = chain.modelsXYZ[0];
  chain.bonds = [];
  for (m1=0; m1<chain.molecules.length; m1++) {
    rC = chain.molecules[m1].xna ? 64 : 16;
    for (m2=m1+1; m2<chain.molecules.length; m2++) {
      if (chain.molecules[m1].xna != chain.molecules[m2].xna) continue;
      if (chain.molecules[m1].C && chain.molecules[m2].N) {
        xyz1 = chain.molecules[m1].C.xyz;
        xyz2 = chain.molecules[m2].N.xyz;
        dx = xyzRef[xyz1]-xyzRef[xyz2]; dx *= dx;
        dy = xyzRef[xyz1+1]-xyzRef[xyz2+1]; dy *= dy;
        dz = xyzRef[xyz1+2]-xyzRef[xyz2+2]; dz *= dz;
        r = dx+dy+dz;
        if (r <= 3.24) {chain.molecules[m1].next = chain.molecules[m2]; chain.molecules[m2].previous = chain.molecules[m1]; chain.bonds.push([chain.molecules[m1].C, chain.molecules[m2].N, 1]); break;}
        else if (chain.molecules[m2].C && chain.molecules[m1].N) { // for weird entries like 2n4n
          xyz1 = chain.molecules[m2].C.xyz;
          xyz2 = chain.molecules[m1].N.xyz;
          dx = xyzRef[xyz1]-xyzRef[xyz2]; dx *= dx;
          dy = xyzRef[xyz1+1]-xyzRef[xyz2+1]; dy *= dy;
          dz = xyzRef[xyz1+2]-xyzRef[xyz2+2]; dz *= dz;
          r = dx+dy+dz;
          if (r <= 3.24) {chain.molecules[m1].next = chain.molecules[m2]; chain.molecules[m2].previous = chain.molecules[m1]; chain.bonds.push([chain.molecules[m1].C, chain.molecules[m2].N, 1]); break;}
        }
      }
      else if (chain.molecules[m1].CA && chain.molecules[m2].CA) {
        xyz1 = chain.molecules[m1].CA.xyz;
        xyz2 = chain.molecules[m2].CA.xyz;
        dx = xyzRef[xyz1]-xyzRef[xyz2]; dx *= dx;
        dy = xyzRef[xyz1+1]-xyzRef[xyz2+1]; dy *= dy;
        dz = xyzRef[xyz1+2]-xyzRef[xyz2+2]; dz *= dz;
        r = dx+dy+dz;
        if (r <= rC) {chain.molecules[m1].next = chain.molecules[m2]; chain.molecules[m2].previous = chain.molecules[m1]; break;}
      }
    }
  }
};

// ** builds list of bonds within a chain object **
molmil.viewer.prototype.buildBondList = function(chain, rebuild) {
  var m1, m2, SG1, SG2;
  var dx, dy, dz, r, a1, a2, xyz1, xyz2, vdwR = molmil.configBox.vdwR;

  if (rebuild || chain.bonds.length == 0) this.buildAminoChain(chain);
  
  var xyzRef = chain.modelsXYZ[0], ligand = false;
  chain.bondsOK = true;
  
  for (m1=0; m1<chain.molecules.length; m1++) {
    molmil.buildBondsList4Molecule(chain.bonds, chain.molecules[m1], xyzRef);
    if (chain.molecules[m1].CA) {
      // cystine bonds
      if (chain.molecules[m1].name == "CYS") { // this doesn't work in lazy mode...
        SG1 = molmil.getAtomFromMolecule(chain.molecules[m1], "SG");
        if (! SG1) continue;
        for (m2=m1+1; m2<chain.molecules.length; m2++) if (chain.molecules[m1].CA) {
          if (chain.molecules[m2].name != "CYS") continue;
          SG2 = molmil.getAtomFromMolecule(chain.molecules[m2], "SG");
          if (! SG2) continue;
          xyz1 = SG1.xyz;
          xyz2 = SG2.xyz;
          dx = xyzRef[xyz1]-xyzRef[xyz2]; dx *= dx;
          dy = xyzRef[xyz1+1]-xyzRef[xyz2+1]; dy *= dy;
          dz = xyzRef[xyz1+2]-xyzRef[xyz2+2]; dz *= dz;
          r = dx+dy+dz;
          if (r <= 5) {chain.bonds.push([SG1, SG2, 1]); break;}
        }
      }
    }
    else if (chain.molecules[m1].ligand) { // handle suger molecules...
      for (m2=m1+1; m2<chain.molecules.length; m2++) {
        if (! chain.molecules[m2].ligand) continue;
        for (a1=0; a1<chain.molecules[m1].atoms.length; a1++) {
          if (chain.molecules[m1].atoms[a1].element == "H" || chain.molecules[m1].atoms[a1].element == "D") continue
          xyz1 = chain.molecules[m1].atoms[a1].xyz;
          for (a2=0; a2<chain.molecules[m2].atoms.length; a2++) {
            if (chain.molecules[m2].atoms[a2].element == "H" || chain.molecules[m2].atoms[a2].element == "D") continue
            xyz2 = chain.molecules[m2].atoms[a2].xyz;
            
            dx = xyzRef[xyz1]-xyzRef[xyz2]; dx *= dx;
            dy = xyzRef[xyz1+1]-xyzRef[xyz2+1]; dy *= dy;
            dz = xyzRef[xyz1+2]-xyzRef[xyz2+2]; dz *= dz;
            r = dx+dy+dz;
            maxDistance = 3.24;
            if (vdwR[chain.molecules[m1].atoms[a1].element] === undefined || vdwR[chain.molecules[m1].atoms[a1].element] >= 1.8) {
              if (vdwR[chain.molecules[m2].atoms[a2].element] === undefined || vdwR[chain.molecules[m2].atoms[a2].element] >= 1.8) maxDistance = 6.0;
              else maxDistance = 4.5;
            }
            else if (vdwR[chain.molecules[m2].atoms[a2].element] === undefined || vdwR[chain.molecules[m2].atoms[a2].element] >= 1.8) {
              if (vdwR[chain.molecules[m1].atoms[a1].element] === undefined || vdwR[chain.molecules[m1].atoms[a1].element] >= 1.8) maxDistance = 6.0;
              else maxDistance = 4.5;
            }
            if (r <= maxDistance) chain.bonds.push([chain.molecules[m1].atoms[a1], chain.molecules[m2].atoms[a2], 1]);
          }
        }
      }
    }
  }
};

molmil.viewer.prototype.getChain = function(struc, cid) {
  var chain = [];
  for (var c=0; c<struc.chains.length; c++) {if (struc.chains[c].name == cid) chain.push(struc.chains[c]);}
  return chain;
}

molmil.viewer.prototype.getChainAuth = function(struc, cid) {
  var chain = [];
  for (var c=0; c<struc.chains.length; c++) {if (struc.chains[c].authName == cid) chain.push(struc.chains[c]);}
  return chain;
}

molmil.viewer.prototype.getMolObject4Chain = function(chain, id) {
  if (! (chain instanceof Array)) chain = [chain];
  for (var c=0,m; c<chain.length; c++) {
    for (m=0; m<chain[c].molecules.length; m++) {
      if (chain[c].molecules[m].id == id) return chain[c].molecules[m];
    }
  }
  return null;
}

molmil.viewer.prototype.getMolObject4ChainAlt = function(chain, RSID) {
  if (! (chain instanceof Array)) chain = [chain];
  for (var c=0,m; c<chain.length; c++) {
    for (m=0; m<chain[c].molecules.length; m++) {
      if (chain[c].molecules[m].RSID == RSID) return chain[c].molecules[m];
    }
  }
  return null;
}

// ** Load CCP4 data **

molmil.decodeUtf8=function(arrayBuffer) {
  var result = "", i = 0, c = 0, c1 = 0, c2 = 0, data = new Uint8Array(arrayBuffer);
 
  // If we have a BOM skip it
  if (data.length >= 3 && data[0] === 0xef && data[1] === 0xbb && data[2] === 0xbf) i = 3;
 
  while (i < data.length) {
    c = data[i];
 
    if (c < 128) {
      result += String.fromCharCode(c);
      i++;
    } 
    else if (c > 191 && c < 224) {
      if( i+1 >= data.length ) throw "UTF-8 Decode failed. Two byte character was truncated.";
      c2 = data[i+1];
      result += String.fromCharCode( ((c&31)<<6) | (c2&63) );
      i += 2;
    } 
    else {
      if (i+2 >= data.length) throw "UTF-8 Decode failed. Multi byte character was truncated.";
      c2 = data[i+1];
      c3 = data[i+2];
      result += String.fromCharCode( ((c&15)<<12) | ((c2&63)<<6) | (c3&63) );
      i += 3;
    }
  }
  return result;
}

molmil.viewer.prototype.load_obj = function(data, filename, settings) {
  if (! settings) settings = {solid: true};
  data = data.split("\n");
  var tmp, i;
  var pos = [], norm = [], idx = [], n, hihi = [0, 0, 0, 0];
  
  var geomRanges = [1e99, -1e99, 1e99, -1e99, 1e99, -1e99];
  
  for (i=0; i<data.length; i++) {
    if (data[i].substr(0,2) == "vn") {
      tmp = data[i].split(/\s+/);
      norm.push(n=[parseFloat(tmp[1]), parseFloat(tmp[2]), parseFloat(tmp[3])]);
      vec3.normalize(n, n);
    }
    else if (data[i].substr(0,1) == "v") {
      tmp = data[i].split(/\s+/);
      pos.push(n=[parseFloat(tmp[1]), parseFloat(tmp[2]), parseFloat(tmp[3])]);
      
      if (n[0] < geomRanges[0]) geomRanges[0] = n[0];
      if (n[0] > geomRanges[1]) geomRanges[1] = n[0];
      
      if (n[1] < geomRanges[2]) geomRanges[2] = n[1];
      if (n[1] > geomRanges[3]) geomRanges[3] = n[1];
     
      if (n[2] < geomRanges[4]) geomRanges[4] = n[2];
      if (n[2] > geomRanges[5]) geomRanges[5] = n[2];
      
      hihi[0] += n[0];
      hihi[1] += n[1];
      hihi[2] += n[2];
      hihi[3] += 1;
      
    }
    else if (data[i].substr(0,1) == "f") {
      tmp = data[i].split(/\s+/);
      idx.push([parseInt(tmp[1].split("//")[0])-1, parseInt(tmp[2].split("//")[0])-1, parseInt(tmp[3].split("//")[0])-1]);
    }
  }

  var vertices = new Float32Array(pos.length*7); // x, y, z, nx, ny, nz, rgba
  var indices = new Int32Array(idx.length*3);
      
  var vertices8 = new Uint8Array(vertices.buffer);
  
  var i, p=0, p8=0;
  
  for (i=0; i<pos.length; i++, p8 += 28) {
    vertices[p++] = pos[i][0];
    vertices[p++] = pos[i][1];
    vertices[p++] = pos[i][2];
    
    vertices[p++] = norm[i][0];
    vertices[p++] = norm[i][1];
    vertices[p++] = norm[i][2];
    
    vertices8[p8+24] = 255;
    vertices8[p8+25] = 255;
    vertices8[p8+26] = 255;
    vertices8[p8+27] = 255;
    p++;
  }
  
  p = 0;
  for (i=0; i<idx.length; i++) {
    indices[p++] = idx[i][0];
    indices[p++] = idx[i][1];
    indices[p++] = idx[i][2];
  }
  
  var struct = new molmil.polygonObject({filename: filename, COR: hihi}); canvas.molmilViewer.structures.push(struct);
  struct.options = [];
  struct.meta.geomRanges = geomRanges;
  
  var program = molmil.geometry.build_simple_render_program(vertices, indices, canvas.renderer, settings);
  canvas.renderer.programs.push(program);
  struct.programs.push(program);
  
  canvas.molmilViewer.calculateCOG();
  
  canvas.renderer.initBuffers();
  canvas.update = true;
          
  molmil.safeStartViewer(canvas);
  
};

molmil.viewer.prototype.load_ccp4 = function(buffer, filename, settings) {
  if (! settings) settings = {sigma: 1.0};
  var a = new Int32Array(buffer, 0, 10); // col, row, section, mode, number of first row, number of first column, number of first section, number of intervals x, number of intervals y, number of intervals z
  var b = new Float32Array(buffer, 40, 6); // length in x, length in y, length in z, alpha, beta, gamma
  var c = new Int32Array(buffer, 64, 3); // axis cols, axis rows, axis section
  var d = new Float32Array(buffer, 76, 3); // min density, max density, mean density
  var e = new Int32Array(buffer, 88, 1); // space gap
  var f = new Int32Array(buffer, 92, 233); // header
  var g = new Float32Array(buffer, 1024, f[0]/4); // crystallographic symmetry table
  var h = new Float32Array(buffer, 0, 256); // crystallographic symmetry table

      
  if (! settings.hasOwnProperty("solid")) settings.solid = true;
  if (! settings.hasOwnProperty("sigma")) settings.sigma = 1.0;
      
  var sz = a[0]*a[1]*a[2];
  var voxels = new Float32Array(buffer, 1024+f[0], sz); 
  // ^ this should actually be based on mode (a[4]):
  // 0: 8bit
  // 1: 16bit
  // 2: 32bit (float)
  // 3: 32bit (fourier int)
  // 4: 64bit (fourier float)
      
  // the data should be normalized so that mean = 0.0 and std = 1.0
  if (! settings.skipNormalization) {
    var dev = 1.0 / new Float32Array(buffer, 54*4, 1)[0];
    for (var i=0; i<sz; i++) voxels[i] = (voxels[i] - d[2])*dev;
  }
      
  var idx_inv = [c[0]-1, c[1]-1, c[2]-1];
      
  var voxel_size = [b[idx_inv[0]]/a[idx_inv[0]+7], b[idx_inv[1]]/a[idx_inv[1]+7], b[idx_inv[2]]/a[idx_inv[2]+7]];
  var first = [voxel_size[0]*a[idx_inv[0]+4], voxel_size[1]*a[idx_inv[1]+4], voxel_size[2]*a[idx_inv[2]+4]];

  var selectFunc = function(x, y, z) {return arguments[idx_inv[0]] + a[0] * (arguments[idx_inv[1]] + a[1] * arguments[idx_inv[2]]);}
  var surf = polygonize([a[idx_inv[0]], a[idx_inv[1]], a[idx_inv[2]]], voxels, settings.sigma, selectFunc);

  var voxel_size = [b[0]/a[0+7], b[1]/a[1+7], b[2]/a[2+7]];
  
  for (i=0; i<surf.vertices.length; i++) {
    surf.vertices[i][0] = ((surf.vertices[i][0]) * voxel_size[0]) + first[0];
    surf.vertices[i][1] = ((surf.vertices[i][1]) * voxel_size[1]) + first[1];
    surf.vertices[i][2] = ((surf.vertices[i][2]) * voxel_size[2]) + first[2];
  }
  
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

  var vertices = new Float32Array(surf.vertices.length*7); // x, y, z, nx, ny, nz, rgba
  var indices = new Int32Array(surf.faces.length*3);
      
  var vertices8 = new Uint8Array(vertices.buffer);
    
  var hihi = [0, 0, 0, 0], tmp = [0, 0, 0];
  var geomRanges = [1e99, -1e99, 1e99, -1e99, 1e99, -1e99];
  for (var v=0, v2, v3; v<surf.vertices.length; v++) {
    v2 = v*7;
    v3 = v*28;
        
    vertices[v2+3] = normals[v][0];
    vertices[v2+4] = normals[v][1];
    vertices[v2+5] = normals[v][2];
        
    vertices[v2] = surf.vertices[v][0];
    vertices[v2+1] = surf.vertices[v][1];
    vertices[v2+2] = surf.vertices[v][2];
        
    hihi[0] += surf.vertices[v][0];
    hihi[1] += surf.vertices[v][1];
    hihi[2] += surf.vertices[v][2];
    hihi[3] += 1;
        
    if (vertices[v2] < geomRanges[0]) geomRanges[0] = vertices[v2];
    if (vertices[v2] > geomRanges[1]) geomRanges[1] = vertices[v2];
      
    if (vertices[v2+1] < geomRanges[2]) geomRanges[2] = vertices[v2+1];
    if (vertices[v2+1] > geomRanges[3]) geomRanges[3] = vertices[v2+1];
     
    if (vertices[v2+2] < geomRanges[4]) geomRanges[4] = vertices[v2+2];
    if (vertices[v2+2] > geomRanges[5]) geomRanges[5] = vertices[v2+2];
        
        

    vertices8[v3+24] = 255;
    vertices8[v3+25] = 255;
    vertices8[v3+26] = 255;
    vertices8[v3+27] = 255;
  }
      
  var struct = new molmil.polygonObject({filename: filename, COR: hihi}); canvas.molmilViewer.structures.push(struct);
  struct.options = [];
  struct.meta.geomRanges = geomRanges;
      
  for (var i=0, i2; i<surf.faces.length; i++) {
    i2 = i*3;
    indices[i2] = surf.faces[i][0];
    indices[i2+1] = surf.faces[i][1];
    indices[i2+2] = surf.faces[i][2];
  }

  var program = molmil.geometry.build_simple_render_program(vertices, indices, canvas.renderer, settings);
  canvas.renderer.programs.push(program);
  struct.programs.push(program);

  canvas.molmilViewer.calculateCOG();
  
  canvas.renderer.initBuffers();
  canvas.update = true;
          
  molmil.safeStartViewer(canvas);
      
};
    

// ** loads MPBF data **
molmil.viewer.prototype.load_MPBF = function(buffer, filename) {
  var offset = 0;

  while (offset < buffer.byteLength) {
    var COR = [0, 0, 0, 0];
    var metadata = new Int32Array(buffer, offset, 4); offset += 16;
         
    var name = molmil.decodeUtf8(new Uint8Array(buffer, offset, metadata[3])); offset += metadata[3] + (metadata[3]%4 != 0 ? 4-metadata[3]%4 : 0); // padding has to be skipped
   
    var vertices_offset = offset;
    var vertices = new Float32Array(buffer, offset, 7*metadata[1]); offset += 7*metadata[1]*4;
    var indices = new Int32Array(buffer, offset, metadata[2]*3); offset += metadata[2]*3*4;

    var geomRanges = [1e99, -1e99, 1e99, -1e99, 1e99, -1e99];

    for (var i=0; i<vertices.length; i+=7) {
      COR[0] += vertices[i];
      COR[1] += vertices[i+1];
      COR[2] += vertices[i+2];
      COR[3]++;
      if (vertices[i] < geomRanges[0]) geomRanges[0] = vertices[i];
      if (vertices[i] > geomRanges[1]) geomRanges[1] = vertices[i];
      
      if (vertices[i+1] < geomRanges[2]) geomRanges[2] = vertices[i+1];
      if (vertices[i+1] > geomRanges[3]) geomRanges[3] = vertices[i+1];
      
      if (vertices[i+2] < geomRanges[4]) geomRanges[4] = vertices[i+2];
      if (vertices[i+2] > geomRanges[5]) geomRanges[5] = vertices[i+2];
    }
    
    var struct = new molmil.polygonObject({filename: filename, COR: COR}); this.structures.push(struct);
    struct.options = [];
    struct.meta.geomRanges = geomRanges;

    var renderer = this.renderer;
    var gl = renderer.gl;
          
    var vbuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
  
    var ibuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
          
    var program = {};
    program.gl = renderer.gl; program.renderer = renderer;
    program.nElements = metadata[2]*3;
    program.vertexBuffer = vbuffer;
    program.indexBuffer = ibuffer;

    program.angle = renderer.angle;

    program.shader = renderer.shaders.standard_alpha;
    program.attributes = renderer.shaders.standard_alpha.attributes;
    program.status = true;
          
    program.render = function(modelViewMatrix, COR) {
      if (! this.status) return;
      var normalMatrix = mat3.create();
      mat3.normalFromMat4(normalMatrix, modelViewMatrix);
      
      this.gl.useProgram(this.shader.program);
      this.gl.uniformMatrix4fv(this.shader.uniforms.modelViewMatrix, false, modelViewMatrix);
      this.gl.uniformMatrix3fv(this.shader.uniforms.normalMatrix, false, normalMatrix);
      this.gl.uniformMatrix4fv(this.shader.uniforms.projectionMatrix, false, this.renderer.projectionMatrix);
      this.gl.uniform3f(this.shader.uniforms.COR, COR[0], COR[1], COR[2]);
      this.gl.uniform1f(this.shader.uniforms.focus, this.renderer.fogStart);
      this.gl.uniform1f(this.shader.uniforms.fogSpan, this.renderer.fogStart+(this.renderer.clearCut*2));
      
      this.gl.uniform4f(this.shader.uniforms.backgroundColor, molmil.configBox.BGCOLOR[0], molmil.configBox.BGCOLOR[1], molmil.configBox.BGCOLOR[2], 1.0);
  
      this.render_internal();
    };

    program.render_internal = function() {
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer); 

      molmil.resetAttributes(this.gl);
      molmil.bindAttribute(this.gl, this.attributes.in_Position, 3, this.gl.FLOAT, false, 28, 0);
      molmil.bindAttribute(this.gl, this.attributes.in_Normal, 3, this.gl.FLOAT, false, 28, 12);
      molmil.bindAttribute(this.gl, this.attributes.in_Colour, 4, this.gl.UNSIGNED_BYTE, true, 28, 24);
      molmil.clearAttributes(this.gl);
    
      this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
      if (this.angle) { // angle sucks, it only allows a maximum of 3M "vertices" to be drawn per call...
        var dv = 0, vtd;
        while (true) {
          vtd = Math.min(this.nElements-dv, 3000000);
          if (vtd < 1) break;
          this.gl.drawElements(this.gl.TRIANGLES, vtd, gl.INDEXINT, dv*4);
          dv += vtd;
        }
      }
      else this.gl.drawElements(this.gl.TRIANGLES, this.nElements, gl.INDEXINT, 0);
    };
          
    program.renderPicking = function() {};
          
    renderer.programs.push(program);
    struct.programs.push(program);
            
    // also add an entry to the structures menu for easy enabling/disabling
    struct.options.push([name, program]);

    if (molmil.configBox.skipClearGeometryBuffer) {
      struct.data = struct.data || {};
      struct.data.vertexBuffer = vertices;
      struct.data.indexBuffer = indices;
      struct.data.vertexSize = 7;
      struct.data.vertices_offset = vertices_offset;
    }
  
  }
  
  this.renderer.initBD = true;
  
  this.calculateCOG();
  
  if (molmil.geometry.onGenerate) molmil_dep.asyncStart(molmil.geometry.onGenerate[0], molmil.geometry.onGenerate[1], molmil.geometry.onGenerate[2], 0);
  
  return struct;
  
}

// ** loads XYZ data **

molmil.viewer.prototype.load_xyz = function(data, filename, settings) {
  settings = settings || {};
  var struc, currentChain, atomName, x, y, z, currentMol;
  
  data = data.split("\n");
  
  for (i=0; i<data.length; i++) {
    data[i] = molmil_dep.Strip(data[i]);
    if (! data[i].length) continue;
    data[i] = data[i].split(/[ ,\t]+/);
    if (data[i].length == 1 && data[i] && !isNaN(parseInt(data[i][0], 10))) {
      this.structures.push(struc = new molmil.entryObject({id: filename}));
      struc.chains.push(currentChain = new molmil.chainObject("", struc));
      currentChain.CID = this.CID++;
      this.chains.push(currentChain);
      currentChain.molecules.push(currentMol = new molmil.molObject("???", 0, currentChain));
      if (settings.skipBonds) currentChain.bondsOK = true;
      i++;
      continue;
    }

    atomName = data[i][0];
    x = parseFloat(data[i][1]);
    y = parseFloat(data[i][2]);
    z = parseFloat(data[i][3]);

    Xpos = currentChain.modelsXYZ[0].length;
    currentChain.modelsXYZ[0].push(x, y, z);
    currentMol.atoms.push(atom=new molmil.atomObject(Xpos, atomName, atomName, currentMol, currentChain));
    atom.AID = this.AID++;
    this.atomRef[atom.AID] = atom;
    currentChain.atoms.push(atom);
  }

  this.calculateCOG();
  
  molmil.resetColors(struc, this);
  
  return struc;
}

// ** loads MOL2 data **

molmil.viewer.prototype.load_mol2 = function(data, filename) {
  data = data.split("\n");
  var i, name="", atomMode=false, atomData=[], bondMode=false, bondData=[], ssMode=false, subStructs={}, tmp, struc;
  
  for (i=0; i<data.length; i++) {
    if (data[i].substr(0,9).toUpperCase() == "@<TRIPOS>") {
      atomMode = false;
      bondMode = false;
      ssMode = false;
    }
    
    if (atomMode) atomData.push(data[i]);
    if (bondMode) bondData.push(data[i]);
    if (ssMode) {
      tmp = data[i].trim().split(/[ ,]+/);
      subStructs[parseInt(tmp[0])] = tmp[1];
    }
    
    if (data[i].substr(0,17).toUpperCase() == "@<TRIPOS>MOLECULE") name = data[i+1].trim();
    else if (data[i].substr(0,13).toUpperCase() == "@<TRIPOS>ATOM") atomMode = true;
    else if (data[i].substr(0,13).toUpperCase() == "@<TRIPOS>BOND") bondMode = true;
    else if (data[i].substr(0,21).toUpperCase() == "@<TRIPOS>SUBSTRUCTURE") ssMode = true;
  }

  
  var x, y, z, atomName, atomType, resID, prev_resid, currentChain, currentMol;
  
  this.structures.push(struc = new molmil.entryObject({id: filename}));
  struc.chains.push(currentChain = new molmil.chainObject("", struc));
  currentChain.CID = this.CID++;
  
  for (i=0; i<atomData.length; i++) {
    
    tmp = atomData[i].trim().split(/[ ,]+/);
    
    //atomName = atomData[i].substring(7, 12).trim();
    //x = parseFloat(atomData[i].substring(12, 22).trim());
    //y = parseFloat(atomData[i].substring(22, 31).trim());
    //z = parseFloat(atomData[i].substring(31, 40).trim());
    
    //atomType = atomData[i].substring(40, 49).trim();
    //resID = atomData[i].substring(49, 54).trim();
    
    atomName = tmp[1];
    x = parseFloat(tmp[2]);
    y = parseFloat(tmp[3]);
    z = parseFloat(tmp[4]);
    
    atomType = tmp.length > 5 ? tmp[5] : "";
    resID = tmp.length > 5 ? tmp[6] : "";
    
    if (resID != prev_resid) {
      currentChain.molecules.push(currentMol = new molmil.molObject(molmil_dep.getKeyFromObject(subStructs, resID, resID), resID, currentChain));
      currentMol.MID = this.MID++;
      prev_resid = resID;
    }
    
    Xpos = currentChain.modelsXYZ[0].length;
    currentChain.modelsXYZ[0].push(x, y, z);
    currentMol.atoms.push(atom=new molmil.atomObject(Xpos, atomName, atomType.split(".")[0], currentMol, currentChain));
    currentChain.atoms.push(atom);

    atom.display = true;
    
    atom.AID = this.AID++;
    this.atomRef[atom.AID] = atom;
  }
  
  this.calculateCOG();

  for (i=0; i<bondData.length; i++) {
    tmp = bondData[i].trim().split(/[ ,]+/);
    if (tmp[0] == "") continue;
    a1 = parseInt(tmp[1])-1;
    a2 = parseInt(tmp[2])-1;
    if (tmp[3] == "ar") tmp[3] = 2;
    if (tmp[3] == "am") tmp[3] = 1;
    bt = parseInt(tmp[3]);
    
    currentChain.bonds.push([currentChain.atoms[a1], currentChain.atoms[a2], bt]);
  }
  currentChain.bondsOK = true;
  
  this.chains.push(currentChain);
  
  molmil.resetColors(struc, this);
  
  return struc;
  
  
};

// ** loads MDL MOL data **
molmil.viewer.prototype.load_mdl = function(data, filename) {
  data = data.split("\n");
  var name = data[0].trim() || filename, offset = 0, struc;
  this.structures.push(struc = new molmil.entryObject({id: filename}));
  
  while (true) {
    if (offset+3 >= data.length) break;

    var nfo = data[offset+3].match(/\S+/g);
    var noa = parseInt(nfo[0]), nob = parseInt(nfo[1]), i, struc, currentChain, currentMol, x, y, z, Xpos, element, a1, a2, bt;
  
    struc.chains.push(currentChain = new molmil.chainObject("", struc));
    currentChain.CID = this.CID++;
  
    currentChain.molecules.push(currentMol = new molmil.molObject(name, 1, currentChain));
    currentMol.MID = this.MID++;
  
    var atomList = {};
  
    for (i=4; i<noa+4; i++) {
      x = parseFloat(data[offset+i].substring(0, 11).trim())
      y = parseFloat(data[offset+i].substring(11, 21).trim())
      z = parseFloat(data[offset+i].substring(21, 31).trim())
      element = data[offset+i].substring(31, 35).trim();
    
      if (atomList[element] === undefined) atomList[element] = 1;
      else atomList[element]++
    
      Xpos = currentChain.modelsXYZ[0].length;
      currentChain.modelsXYZ[0].push(x, y, z);
      currentMol.atoms.push(atom=new molmil.atomObject(Xpos, element+atomList[element], element, currentMol, currentChain));
      currentChain.atoms.push(atom);

      atom.display = true;
    
      atom.AID = this.AID++;
      this.atomRef[atom.AID] = atom;
    }
  
    for (i=noa+4; i<noa+4+nob; i++) {
      nfo = data[offset+i].trim().split(/[ ,]+/);
      a1 = parseInt(nfo[0])-1;
      a2 = parseInt(nfo[1])-1;
      bt = parseInt(nfo[2]);
      currentChain.bonds.push([currentMol.atoms[a1], currentMol.atoms[a2], bt]);
    }
    currentChain.bondsOK = true;
  
    this.chains.push(currentChain);

    offset += 4+noa+nob;
    while (true) {
      offset++;
      try {if (data[offset].trim() == "M  END") break;}
      catch (e) {break;}
    }
    offset+=2;
  }
  
  this.calculateCOG();
  
  molmil.resetColors(struc, this);
  
  return struc;
  
};

// ** loads GRO data **
molmil.viewer.prototype.load_GRO = function(data, filename) {
  data = data.trim().split("\n");
  var currentChain = null; var ccid = null; var currentMol = null; var cmid = null; var atom, i;
  
  var chainName, molID, atomName, molName, x, y, z, offset, element, mat, temp, begin_cid, begin_mid, end_cid, end_mid, c;
  
  var helixData = [];
  var sheetData = [];
  var newModels = [];
  
  var struc = null, Xpos, cmnum;

  this.structures.push(struc = new molmil.entryObject({id: filename}));
  
  chainName = "";
  struc.chains.push(currentChain = new molmil.chainObject(chainName, struc));
  currentChain.CID = this.CID++;
  ccid = chainName; cmid = null;
  
  for (i=2; i<data.length-1; i++) {
   
    molID = data[i].substring(0, 5).trim();
    atomName = data[i].substring(11, 15).trim();
    molName = data[i].substring(5, 11).trim();
    
    x = parseFloat(data[i].substring(20, 28).trim())*10;
    y = parseFloat(data[i].substring(28, 36).trim())*10;
    z = parseFloat(data[i].substring(36, 44).trim())*10;
    
    if (molID != cmid) {
      
      currentMol = new molmil.molObject(molName, molID, currentChain);
      if (currentMol.name == "HOH" || currentMol.name == "DOD" || currentMol.name == "WAT" || currentMol.name == "SOL") {
        currentMol.water = true; currentMol.ligand = false;
        if (currentChain.molecules.length && ! currentChain.molecules[currentChain.molecules.length-1].water) {
          struc.chains.push(currentChain = new molmil.chainObject(chainName, struc));
          currentChain.water = true;
        }
      }
      else if (currentChain.molecules.length && currentChain.molecules[currentChain.molecules.length-1].water) struc.chains.push(currentChain = new molmil.chainObject(chainName, struc));
      currentMol.chain = currentChain;
      currentChain.molecules.push(currentMol);
      currentMol.MID = this.MID++;
      cmid = molID;
      //if (molName = "SOL" || molName == "WAT") currentMol.display = false;
    }
    
    for (offset=0; offset<atomName.length; offset++) if (! molmil_dep.isNumber(atomName[offset])) break;
    if (atomName.length > 1 && ! molmil_dep.isNumber(atomName[1]) && atomName[1] == atomName[1].toLowerCase()) element = atomName.substring(offset, offset+2);
    else element = atomName.substring(offset, offset+1);
    
    Xpos = currentChain.modelsXYZ[0].length;
    currentChain.modelsXYZ[0].push(x, y, z);
    currentMol.atoms.push(atom=new molmil.atomObject(Xpos, atomName, element, currentMol, currentChain));
   
    if (! molmil.AATypes.hasOwnProperty(currentMol.name.substr(0, 3))) {
      if (currentMol.water) atom.display = false;
      //do special stuff for dna/rna
      else if (atom.atomName == "P") {currentMol.P = atom; currentMol.N = atom; currentMol.xna = true; currentMol.ligand = false; if (! currentMol.CA) {currentChain.isHet = false; currentMol.CA = atom;}}
      else if (atom.atomName == "C1'") {currentChain.isHet = false; currentMol.CA = atom; currentMol.xna = true; currentMol.ligand = false;}
      else if (atom.atomName == "O3'") {currentMol.C = atom; currentMol.xna = true; currentMol.ligand = false;}
    }
    else {
      if (atom.atomName == "N") {currentMol.N = atom; currentMol.ligand = false;}
      else if (atom.atomName == "CA") {currentMol.CA = atom; currentMol.ligand = false;}
      else if (atom.atomName == "C") {currentChain.isHet = false; currentMol.C = atom; currentMol.ligand = false;}
      else if (atom.atomName == "O") {currentMol.O = atom; currentMol.ligand = false;}
    }
    if (atom.element == "H" || atom.element == "D") atom.display = false;
    currentChain.atoms.push(atom);
    atom.AID = this.AID++;
    this.atomRef[atom.AID] = atom;
  }
  
  var newChains = [], chainRef, rC, m1;
  
  for (c=0; c<struc.chains.length; c++) this.buildAminoChain(struc.chains[c]);
  
  for (c=0; c<struc.chains.length; c++) {
    currentChain = struc.chains[c];
    if (currentChain.water) continue;
    chainRef = currentChain, rC = currentChain.molecules.length;
    for (m1=0; m1<rC; m1++) {
      currentChain.molecules[m1].chain_alt = currentChain.molecules[m1].chain;
      currentChain.molecules[m1].chain = chainRef;
      if ( ((! currentChain.molecules[m1].next && m1 < rC-1) || (! currentChain.molecules[m1].previous && m1 != 0)) && 
           (! (currentChain.molecules[m1].water || currentChain.molecules[m1].ligand) || (m1 && currentChain.molecules[m1-1].name != currentChain.molecules[m1].name) )
         ) {
            chainRef = new molmil.chainObject(molmil_dep.Strip(chainRef.name), chainRef.entry); chainRef.isHet = false;
            newChains.push(chainRef);
            if (! currentChain.molecules[m1].previous) currentChain.molecules[m1].chain = chainRef;
         }
    }
  }
  
  if (newChains.length) {
    Array.prototype.push.apply(struc.chains, newChains);
    var tmp = [];
    for (c=0; c<struc.chains.length; c++) {
      if (struc.chains[c].water) continue;
      struc.chains[c].name = (c+1)+"";
      Array.prototype.push.apply(tmp, struc.chains[c].molecules);
      struc.chains[c].molecules = [];
      struc.chains[c].modelsXYZ_old = struc.chains[c].modelsXYZ; struc.chains[c].modelsXYZ = [];
      for (m1=0; m1<struc.chains[c].modelsXYZ_old.length; m1++) struc.chains[c].modelsXYZ.push([]);
      struc.chains[c].atoms = [];
    }
    for (m1=0; m1<tmp.length; m1++) {
      tmp[m1].chain.molecules.push(tmp[m1]);
      for (i=0; i<tmp[m1].atoms.length; i++) {
        atom = tmp[m1].atoms[i].xyz;
        for (c=0; c<tmp[m1].chain_alt.modelsXYZ_old.length; c++) {
          tmp[m1].chain.modelsXYZ[c].push(
            tmp[m1].chain_alt.modelsXYZ_old[c][atom], 
            tmp[m1].chain_alt.modelsXYZ_old[c][atom+1], 
            tmp[m1].chain_alt.modelsXYZ_old[c][atom+2]
          );
        }
        tmp[m1].atoms[i].xyz = tmp[m1].chain.modelsXYZ[0].length-3;
        tmp[m1].atoms[i].chain = tmp[m1].chain; 
      }
      Array.prototype.push.apply(tmp[m1].chain.atoms, tmp[m1].atoms);
      delete tmp[m1].chain_alt;
    }
    
    for (c=0; c<struc.chains.length; c++) delete struc.chains[c].modelsXYZ_old;
    
    for (c=0; c<struc.chains.length; c++) {
      if (struc.chains[c].molecules.length == 0) {struc.chains.splice(c, 1); c--; continue;}
      if (struc.chains[c].molecules[0].water || struc.chains[c].molecules[0].ligand) {
        struc.chains[c].name = (struc.chains[c].name ? struc.chains[c].name+" - " : "") + struc.chains[c].molecules[0].name;
        struc.chains[c].isHet = true;
      }
    }
  }
  
  this.calculateCOG();
  
  for (c=0; c<struc.chains.length; c++) this.chains.push(struc.chains[c]);
  
  for (c=0; c<struc.chains.length; c++) this.ssAssign(struc.chains[c]);
  
  molmil.resetColors(struc, this);
  
  return struc;
};

// ** loads PDB data **
molmil.viewer.prototype.load_PDB = function(data, filename) {
  var currentChain = null; var ccid = null; var currentMol = null; var cmid = null; var atom, i;
  var data = data.split("\n");
  
  var chainName, molID, atomName, molName, x, y, z, offset, element, mat, temp, begin_cid, begin_mid, end_cid, end_mid, c;
  
  var helixData = [];
  var sheetData = [];
  var newModels = [];
  
  var struc = null, Xpos, cmnum;
  
  for (i=0; i<data.length; i++) {
    if ((data[i].substring(0,5) == "MODEL" && currentChain) || ! struc) {
      if (struc) break;
      this.structures.push(struc = new molmil.entryObject({id: filename}));
      cmnum = data[i].substr(5).trim();
      ccid = cmid = null;
    }
    if (data[i].substring(0, 4) == "ATOM" || data[i].substring(0, 6) == "HETATM") {
      chainName = data[i].substring(21, 22).trim();
      molID = data[i].substring(22, 28).trim();
      atomName = data[i].substring(11, 16).trim();
      molName = data[i].substring(17, 21).trim();
      
      x = parseFloat(data[i].substring(30, 38).trim());
      y = parseFloat(data[i].substring(38, 46).trim());
      z = parseFloat(data[i].substring(46, 54).trim());
      
      for (offset=0; offset<atomName.length; offset++) if (! molmil_dep.isNumber(atomName[offset])) break;
      if (atomName.length > 1 && ! molmil_dep.isNumber(atomName[1]) && atomName[1] == atomName[1].toLowerCase()) element = atomName.substring(offset, offset+2);
      else element = atomName.substring(offset, offset+1);

      if (chainName != ccid) {
        this.chains.push(currentChain = new molmil.chainObject(chainName, struc)); struc.chains.push(currentChain);
        currentChain.CID = this.CID++;
        ccid = chainName; cmid = null;
      }
      if (molID != cmid) {
        currentChain.molecules.push(currentMol = new molmil.molObject(molName, molID, currentChain));
        currentMol.MID = this.MID++;
        cmid = molID;
      }
 
      Xpos = currentChain.modelsXYZ[0].length;
      currentChain.modelsXYZ[0].push(x, y, z);
      currentMol.atoms.push(atom=new molmil.atomObject(Xpos, atomName, element, currentMol, currentChain));

      if (data[i].substr(0, 4) != "ATOM" || ! molmil.AATypes.hasOwnProperty(currentMol.name.substr(0, 3))) {
        if (currentMol.name == "HOH" || currentMol.name == "DOD" || currentMol.name == "WAT" || currentMol.name == "SOL") {currentMol.water = true; currentMol.ligand = false; atom.display = false;}
        //do special stuff for dna/rna
        else if (atom.atomName == "P") {currentMol.P = atom; currentMol.N = atom; currentMol.xna = true; currentMol.ligand = false; if (! currentMol.CA) {currentChain.isHet = false; currentMol.CA = atom;}}
        else if (atom.atomName == "C1'") {currentChain.isHet = false; currentMol.CA = atom; currentMol.xna = true; currentMol.ligand = false;}
        else if (atom.atomName == "O3'") {currentMol.C = atom; currentMol.xna = true; currentMol.ligand = false;}
      }
      else {
        if (atom.atomName == "N") {currentMol.N = atom; currentMol.ligand = false;}
        else if (atom.atomName == "CA") {currentMol.CA = atom; currentMol.ligand = false;}
        else if (atom.atomName == "C") {currentChain.isHet = false; currentMol.C = atom; currentMol.ligand = false;}
        else if (atom.atomName == "O") {currentMol.O = atom; currentMol.ligand = false;}
      }
      if (atom.element == "H" || atom.element == "D") atom.display = false;
      currentChain.atoms.push(atom);
      atom.AID = this.AID++;
      this.atomRef[atom.AID] = atom;
    }
  }
  
  var cid = 0, xyzs;
  
  for (; i<data.length; i++) {
    if (data[i].substring(0,5) == "MODEL") {
      ccid = cid = -1;
    }
    if (data[i].substring(0, 4) == "ATOM" || data[i].substring(0, 6) == "HETATM") {
      chainName = data[i].substring(21, 22).trim();
      
      x = parseFloat(data[i].substring(30, 38).trim());
      y = parseFloat(data[i].substring(38, 46).trim());
      z = parseFloat(data[i].substring(46, 54).trim());

      if (chainName != ccid) {
        ccid = chainName; cid += 1;
        struc.chains[cid].modelsXYZ.push(xyzs=[]);
      }
      
      xyzs.push(x, y, z);
    }
  }
  
  struc.number_of_frames = struc.chains.length ? struc.chains[0].modelsXYZ.length : 0;
  
  // add code to load multiple models...
  
  this.calculateCOG();
  
  for (c=0; c<struc.chains.length; c++) this.buildAminoChain(struc.chains[c]);
  
  var newChains = [], chainRef, rC, m1;
  for (c=0; c<struc.chains.length; c++) {
    currentChain = struc.chains[c];
    chainRef = currentChain, rC = currentChain.molecules.length;
    for (m1=0; m1<rC; m1++) {
      currentChain.molecules[m1].chain_alt = currentChain.molecules[m1].chain;
      currentChain.molecules[m1].chain = chainRef;
      if ( ((! currentChain.molecules[m1].next && m1 < rC-1) || (! currentChain.molecules[m1].previous && m1 != 0)) && 
           (! (currentChain.molecules[m1].water || currentChain.molecules[m1].ligand) || (m1 && currentChain.molecules[m1-1].name != currentChain.molecules[m1].name) )
         ) {
            chainRef = new molmil.chainObject(molmil_dep.Strip(chainRef.name), chainRef.entry); chainRef.isHet = false;
            newChains.push(chainRef);
            if (! currentChain.molecules[m1].previous) currentChain.molecules[m1].chain = chainRef;
         }
    }
  }
  
  if (newChains.length) {
    Array.prototype.push.apply(this.chains, newChains);
    Array.prototype.push.apply(struc.chains, newChains);
    var tmp = [];
    for (c=0; c<struc.chains.length; c++) {
      Array.prototype.push.apply(tmp, struc.chains[c].molecules);
      struc.chains[c].molecules = [];
      struc.chains[c].modelsXYZ_old = struc.chains[c].modelsXYZ; struc.chains[c].modelsXYZ = [];
      for (m1=0; m1<struc.chains[c].modelsXYZ_old.length; m1++) struc.chains[c].modelsXYZ.push([]);
      struc.chains[c].atoms = [];
    }
    for (m1=0; m1<tmp.length; m1++) {
      tmp[m1].chain.molecules.push(tmp[m1]);
      for (i=0; i<tmp[m1].atoms.length; i++) {
        atom = tmp[m1].atoms[i].xyz;
        for (c=0; c<tmp[m1].chain_alt.modelsXYZ_old.length; c++) {
          if (c >= tmp[m1].chain.modelsXYZ.length) tmp[m1].chain.modelsXYZ.push([]); // find a more efficient spot to put this --> maybe this chain isn't part of struc.chains???
          tmp[m1].chain.modelsXYZ[c].push(
            tmp[m1].chain_alt.modelsXYZ_old[c][atom], 
            tmp[m1].chain_alt.modelsXYZ_old[c][atom+1], 
            tmp[m1].chain_alt.modelsXYZ_old[c][atom+2]
          );
        }
        tmp[m1].atoms[i].xyz = tmp[m1].chain.modelsXYZ[0].length-3;
        tmp[m1].atoms[i].chain = tmp[m1].chain; 
      }
      Array.prototype.push.apply(tmp[m1].chain.atoms, tmp[m1].atoms);
      delete tmp[m1].chain_alt;
    }
    
    for (c=0; c<struc.chains.length; c++) delete struc.chains[c].modelsXYZ_old;
    
    for (c=0; c<struc.chains.length; c++) {
      if (struc.chains[c].molecules.length == 0) {struc.chains.splice(c, 1); c--; continue;}
      if (struc.chains[c].molecules[0].water || struc.chains[c].molecules[0].ligand) {
        struc.chains[c].name = (struc.chains[c].name ? struc.chains[c].name+" - " : "") + struc.chains[c].molecules[0].name;
        struc.chains[c].isHet = true;
      }
    }
  }
  
  for (c=0; c<struc.chains.length; c++) this.ssAssign(struc.chains[c]);
  
  molmil.resetColors(struc, this);
  
  return struc;
};

// ** calculates the optimal zoom amount **
molmil.viewer.prototype.calcZ = function(geomRanges) {
  var test = geomRanges;
  geomRanges = geomRanges || this.geomRanges;
  var mx = Math.max(Math.abs(geomRanges[0]), Math.abs(geomRanges[1]), Math.abs(geomRanges[2]), Math.abs(geomRanges[3]), Math.abs(geomRanges[4]), Math.abs(geomRanges[5]));
  if (test) this.renderer.maxRange = (Math.max(Math.abs(geomRanges[1]-geomRanges[0]), Math.abs(geomRanges[3]-geomRanges[2]), Math.abs(geomRanges[5]-geomRanges[4]))*.5)-molmil.configBox.zNear-5;
  if (molmil.configBox.stereoMode) return -(mx*molmil.configBox.zFar/9000)-molmil.configBox.zNear-1;
  if (molmil.configBox.projectionMode == 1) return -(mx*molmil.configBox.zFar/3000)-molmil.configBox.zNear-1;
  else return -((mx/Math.min(this.renderer.width, this.renderer.height))*molmil.configBox.zFar*(.625))-molmil.configBox.zNear-1;
}

// ** loads polygon-JSON data **
molmil.viewer.prototype.load_polygonJSON = function(jso, filename, settings) { // this should be modified to use the modern renderer function instead
  settings = settings || {};
  
  var vertices = jso.vertices || [], triangles_lists = jso.triangles_lists || [], lines_lists = jso.lines_lists || [], lineVertices = [], triangleVertices = [], tmp;
  var COR = [0, 0, 0, 0];
  
  if (jso.hasOwnProperty("vertices2")) {
    for (var i=0; i<jso.vertices2.length; i++) jso.vertices2[i].splice(3, 0, 0, 0, 0);
    Array.prototype.push.apply(vertices, jso.vertices2);
  }
  
  for (var i=0, j; i<triangles_lists.length; i++) {
    tmp = [];
    for (j=0; j<triangles_lists[i].length; j++) tmp.push(triangles_lists[i][j][0], triangles_lists[i][j][1], triangles_lists[i][j][2]);
    if (tmp.length) triangleVertices.push(tmp.unique());
  }
  for (var i=0; i<lines_lists.length; i++) {
    tmp = [];
    for (j=0; j<lines_lists[i].length; j++) tmp.push(lines_lists[i][j][0], lines_lists[i][j][1]);
    if (tmp.length) {
      tmp.unique();
      lineVertices.push(tmp);
    }
  }
  
  for (var i=0; i<vertices.length; i++) {
    COR[0] += vertices[i][0]; COR[1] += vertices[i][1]; COR[2] += vertices[i][2]; COR[3] += 1;
    vertices[i][6] *= 255; vertices[i][7] *= 255; vertices[i][8] *= 255;
  }
  
  var nov_l = 0, noi_l = 0, i, j, nov_t = 0, noi_t = 0;
  
  for (i=0; i<triangleVertices.length; i++) {
    nov_t += triangleVertices[i].length;
    noi_t += triangles_lists[i].length;
  }
  
  for (i=0; i<lineVertices.length; i++) {
    nov_l += lineVertices[i].length;
    noi_l += lines_lists[i].length;
  }
  
  if (! nov_l && ! nov_t) return null;
  
  var struct = new molmil.polygonObject({filename: filename, COR: COR}); this.structures.push(struct);
  
  this.processPolygon3D(struct, vertices, nov_l, noi_l, lineVertices, lines_lists, nov_t, noi_t, triangleVertices, triangles_lists, settings);

  this.renderer.initBD = true;
  
  return struct;
};

// ** builds a render object for polygon data (xml/json) **
molmil.viewer.prototype.processPolygon3D = function(struct, vertices, nov_l, noi_l, lineVertices, lines_lists, nov_t, noi_t, triangleVertices, triangles_lists, settings) {
  var program, vbuffer, ibuffer, gl = this.renderer.gl;
  var i, j, vP, vP8, vertex, iP, vertexMap = {};

  var alpha = settings.alpha || 255;

  if (nov_l) {
    var lineVertexData = new Float32Array(nov_l*4), lineVertexData8 = new Uint8Array(lineVertexData.buffer);
    if (molmil.configBox.OES_element_index_uint) var lineIndexData = new Uint32Array(noi_l*2);
    else var lineIndexData = new Uint16Array(noi_l*2);
  
    for (i=0, vP=0, iP=0, vP8=0; i<lineVertices.length; i++) {
      for (j=0; j<lineVertices[i].length; j++, vP8+=16) {
        vertexMap[lineVertices[i][j]] = vP/4;
        vertex = vertices[lineVertices[i][j]];

        lineVertexData[vP++] = vertex[0];
        lineVertexData[vP++] = vertex[1];
        lineVertexData[vP++] = vertex[2];
      
        lineVertexData8[vP8+12] = vertex[6];
        lineVertexData8[vP8+13] = vertex[7];
        lineVertexData8[vP8+14] = vertex[8];
        lineVertexData8[vP8+15] = 255; //transparency???
        vP++;
      }
    
      for (j=0; j<lines_lists[i].length; j++) {
        lineIndexData[iP++] = vertexMap[lines_lists[i][j][0]];
        lineIndexData[iP++] = vertexMap[lines_lists[i][j][1]];
      }
    }
    
    program = molmil.geometry.build_simple_render_program(lineVertexData, lineIndexData, this.renderer, {lines_render: true});
    this.renderer.programs.push(program);
    struct.programs.push(program);
  }
  
  if (nov_t) {
    
    var triangleVertexData = new Float32Array(nov_t*7), triangleVertexData8 = new Uint8Array(triangleVertexData.buffer);
    if (molmil.configBox.OES_element_index_uint) var triangleIndexData = new Uint32Array(noi_t*3); 
    else var triangleIndexData = new Uint16Array(noi_t*3);
    vertexMap = {};
    
    if (molmil.configBox.skipClearGeometryBuffer) {
      struct.data = struct.data || {};
      struct.data.vertexBuffer = triangleVertexData;
      struct.data.indexBuffer = triangleIndexData;
      struct.data.vertexSize = 7;
    }
  
    for (i=0, vP=0, iP=0, vP8=0; i<triangleVertices.length; i++) {
      for (j=0; j<triangleVertices[i].length; j++, vP8+=28) {
        vertexMap[triangleVertices[i][j]] = vP/7;
        vertex = vertices[triangleVertices[i][j]];

        triangleVertexData[vP++] = vertex[0];
        triangleVertexData[vP++] = vertex[1];
        triangleVertexData[vP++] = vertex[2];
        
        triangleVertexData[vP++] = vertex[3];
        triangleVertexData[vP++] = vertex[4];
        triangleVertexData[vP++] = vertex[5];
      
        triangleVertexData8[vP8+24] = vertex[6];
        triangleVertexData8[vP8+25] = vertex[7];
        triangleVertexData8[vP8+26] = vertex[8];
        triangleVertexData8[vP8+27] = alpha;
        vP++;
      }
    
      for (j=0; j<triangles_lists[i].length; j++) {
        triangleIndexData[iP++] = vertexMap[triangles_lists[i][j][0]];
        triangleIndexData[iP++] = vertexMap[triangles_lists[i][j][1]];
        triangleIndexData[iP++] = vertexMap[triangles_lists[i][j][2]];
      }
    }
    program = molmil.geometry.build_simple_render_program(triangleVertexData, triangleIndexData, this.renderer, {solid: true, alphaMode: alpha != 255});
    this.renderer.programs.push(program);
    struct.programs.push(program);
  }
  
  this.renderer.initBD = true;
  
  this.calculateCOG();
  if (molmil.geometry.onGenerate) molmil_dep.asyncStart(molmil.geometry.onGenerate[0], molmil.geometry.onGenerate[1], molmil.geometry.onGenerate[2], 0);
}

// ** loads polygon-XML data **
molmil.viewer.prototype.load_polygonXML = function(xml, filename, settings) {
  if (typeof xml == "string") {
    var parser = new DOMParser();
    xml = parser.parseFromString(xml, "text/xml");
  }

  settings = settings || {};
  var triangles_lists = [], vertexRef = {}, lines_lists = [], vertices = [];
  var lineVertices = [], triangleVertices = [], vList, iList;
  
  var COR = [0, 0, 0, 0], geomRanges = [1e99, -1e99, 1e99, -1e99, 1e99, -1e99];

  var items = xml.documentElement.childNodes, sitems, j, data, k;
  for (var i=0; i<items.length; i++) {
    if (items[i].tagName == "vertices") {
      sitems = items[i].childNodes;
      for (j=0; j<sitems.length; j++) {
        if (sitems[j].tagName != "vertex") continue;
        data = sitems[j].getAttribute("image").trim().split(/\s+/);
        //console.log(data);
        for (k=0; k<9; k++) data[k] = parseFloat(data[k]);
        //data[6] = data[6]; data[7] = data[7]; data[8] = data[8];
        vertexRef[sitems[j].getAttribute("id")] = vertices.length;
        
        COR[0] += data[0]; COR[1] += data[1]; COR[2] += data[2]; COR[3]++;
        if (data[0] < geomRanges[0]) geomRanges[0] = data[0];
        if (data[0] > geomRanges[1]) geomRanges[1] = data[0];
      
        if (data[1] < geomRanges[2]) geomRanges[2] = data[1];
        if (data[1] > geomRanges[3]) geomRanges[3] = data[1];
      
        if (data[2] < geomRanges[4]) geomRanges[4] = data[2];
        if (data[2] > geomRanges[5]) geomRanges[5] = data[2];

        vertices.push(data);
      }
    }
    else if (items[i].tagName == "triangle_array") {
      sitems = items[i].childNodes;
      vList = []; iList = [];
      for (j=0; j<sitems.length; j++) {
        if (sitems[j].tagName != "triangle") continue;
        data = sitems[j].getAttribute("vertex").trim().split(/\s+/);
        for (k=0; k<3; k++) data[k] = vertexRef[data[k]];
        iList.push(data);
        vList.push(data[0], data[1], data[2]);
      }
      if (vList.length) {
        triangleVertices.push(vList.unique());
        triangles_lists.push(iList);
      }
    }
    else if (items[i].tagName == "quad_array") {
      sitems = items[i].childNodes;
      vList = []; iList = [];
      for (j=0; j<sitems.length; j++) {
        if (sitems[j].tagName != "quad") continue;
        data = sitems[j].getAttribute("vertex").trim().split(/\s+/);
        for (k=0; k<4; k++) data[k] = vertexRef[data[k]];
        
        // now split up this quad into two triangles...
        iList.push([data[0], data[1], data[2]]);
        vList.push(data[0], data[1], data[2]);
        
        iList.push([data[0], data[2], data[3]]);
        vList.push(data[0], data[2], data[3]);
      }
      if (vList.length) {
        triangleVertices.push(vList.unique());
        triangles_lists.push(iList);
      }
    }
    else if (items[i].tagName == "line_array") {
      sitems = items[i].childNodes;
      vList = []; iList = [];
      for (j=0; j<sitems.length; j++) {
        if (sitems[j].tagName != "line") continue;
        data = sitems[j].getAttribute("vertex").trim().split(/\s+/);
        for (k=0; k<2; k++) data[k] = vertexRef[data[k]];
        iList.push(data);
        vList.push(data[0], data[1]);
      }
      if (vList.length) {
        lineVertices.push(vList.unique());
        lines_lists.push(iList);
      }
    }
    else if (items[i].tagName == "polyline_array") {
      sitems = items[i].childNodes;
      vList = []; iList = [];
      for (j=0; j<sitems.length; j++) {
        if (sitems[j].tagName != "polyline") continue;
        data = sitems[j].getAttribute("vertex").trim().split(/\s+/);
        for (k=0; k<data.length; k++) data[k] = vertexRef[data[k]];
        for (k=0; k<data.length-1; k++) {
          iList.push([data[k], data[k+1]]);
          vList.push(data[k], data[k+1]);
        }
      }
      if (vList.length) {
        lineVertices.push(vList.unique());
        lines_lists.push(iList);
      }
    }
  }
  
  var nov_l = 0, noi_l = 0, i, nov_t = 0, noi_t = 0;
  
  for (i=0; i<triangleVertices.length; i++) {
    nov_t += triangleVertices[i].length;
    noi_t += triangles_lists[i].length;
  }
  
  for (i=0; i<lineVertices.length; i++) {
    nov_l += lineVertices[i].length;
    noi_l += lines_lists[i].length;
  }

  if (! nov_l && ! nov_t) return null;

  
  var struct = new molmil.polygonObject({filename: filename, COR: COR, geomRanges: geomRanges}); this.structures.push(struct);
  
  this.processPolygon3D(struct, vertices, nov_l, noi_l, lineVertices, lines_lists, nov_t, noi_t, triangleVertices, triangles_lists, settings);

  this.renderer.initBD = true;
  
  return struct;
};

// ** loads mmcif data **
molmil.viewer.prototype.load_mmCIF = function(data) {
  var jso = loadCIF(data);
  return this.load_PDBx(jso);
};

// ** loads pdbml data **
molmil.viewer.prototype.load_PDBML = function(xml) {
  if (typeof xml == "string") {
    var parser = new DOMParser();
    xml = parser.parseFromString(xml, "text/xml");
  }
  var jso = loadPDBML(xml);
  return this.load_PDBx(jso);
};

// ** loads PDBx formatted data such as mmcif, pdbml and mmjson **
molmil.viewer.prototype.load_PDBx = function(mmjso) { // this should be updated for the new model system
  var entries = Object.keys(mmjso), structs = [], offset;
  for (var e=0; e<entries.length; e++) {

    //var entryId = Object.keys(mmjso)[0].substr(5).split("-")[0];
    var entryId = entries[e].substr(5).split("-")[0];
    var pdb = mmjso[entries[e]];
    var atom_site = pdb.atom_site || pdb.chem_comp_atom || pdb.pdbx_chem_comp_model_atom || null;
    
    if (! atom_site) continue;
    
    var isCC = pdb.hasOwnProperty("chem_comp_atom");

    var Cartn_x = atom_site.Cartn_x || (atom_site.pdbx_model_Cartn_x_ideal && atom_site.pdbx_model_Cartn_x_ideal[0] != null ? atom_site.pdbx_model_Cartn_x_ideal : atom_site.model_Cartn_x) || atom_site.model_Cartn_x; // x
    var Cartn_y = atom_site.Cartn_y || (atom_site.pdbx_model_Cartn_y_ideal && atom_site.pdbx_model_Cartn_x_ideal[0] != null ? atom_site.pdbx_model_Cartn_y_ideal : atom_site.model_Cartn_y) || atom_site.model_Cartn_y; // y
    var Cartn_z = atom_site.Cartn_z || (atom_site.pdbx_model_Cartn_z_ideal && atom_site.pdbx_model_Cartn_x_ideal[0] != null ? atom_site.pdbx_model_Cartn_z_ideal : atom_site.model_Cartn_z) || atom_site.model_Cartn_z; // z
    
    var id = atom_site.id; // aid
  
    var auth_seq_id = atom_site.auth_seq_id || []; // residue id
    var auth_comp_id = atom_site.auth_comp_id; // residue name
    var label_seq_id = atom_site.label_seq_id || []; // residue id
    var label_comp_id = atom_site.label_comp_id || atom_site.comp_id || atom_site.model_id; // residue name
    var auth_asym_id = atom_site.auth_asym_id || []; // chain name
    var label_asym_id = atom_site.label_asym_id || []; // chain label
  
    var label_alt_id = atom_site.label_alt_id || [];
  
    var auth_atom_id = atom_site.auth_atom_id || atom_site.atom_id || []; // atom name
    var label_atom_id = atom_site.label_atom_id || []; // atom name
    var type_symbol = atom_site.type_symbol || []; // Element
  
    var pdbx_PDB_model_num = atom_site.pdbx_PDB_model_num;
  
    var currentChain = null; var ccid = null; var currentMol = null; var cmid = null; var atom;
  
    var struc = null, Xpos, cmnum;
  
    var polyTypes = {};
    //try {for (var i=0; i<pdb.entity_poly_seq.mon_id.length; i++) polyTypes[pdb.entity_poly_seq.mon_id[i]] = true;}
    //try {for (var i=0; i<pdb.chem_comp.id.length; i++) if (pdb.chem_comp.mon_nstd_flag[i]) polyTypes[pdb.chem_comp.id[i]] = true;}
    try {
      for (var i=0; i<pdb.chem_comp.id.length; i++) if (pdb.chem_comp.mon_nstd_flag[i] || pdb.chem_comp.type[i].toLowerCase().indexOf("peptide") != -1) polyTypes[pdb.chem_comp.id[i]] = true;
      polyTypes.ACE = polyTypes.NME = true;
    }
    catch (e) {polyTypes = molmil.AATypes;}

    for (var a=0; a<Cartn_x.length; a++) {
      // split this up in structure loading (1st model) & coordinate only loading (2+ models)
    
      if ((pdbx_PDB_model_num && pdbx_PDB_model_num[a] != cmnum) || ! struc) {
        if (struc) break;
        this.structures.push(struc = new molmil.entryObject({id: entryId}));
        cmnum = pdbx_PDB_model_num ? pdbx_PDB_model_num[a] : 0; ccid = cmid = null;
      }

      // label_asym_id auth_asym_id
      if (label_asym_id[a] != ccid || ! currentChain) {
        this.chains.push(currentChain = new molmil.chainObject(label_asym_id[a], struc)); struc.chains.push(currentChain);
        currentChain.authName = auth_asym_id[a];
        currentChain.CID = this.CID++;
        ccid = label_asym_id[a]; cmid = -1;
        //console.log(ccid);
      }
      
      //console.log(label_comp_id[a]);
      
      if ((label_seq_id[a] || auth_seq_id[a]) != cmid || ! currentMol || cmid == -1) {
        currentChain.molecules.push(currentMol = new molmil.molObject((label_comp_id[a] || auth_comp_id[a]), (label_seq_id[a] || auth_seq_id[a]), currentChain));
        currentMol.RSID = auth_seq_id[a] || label_seq_id[a];
        currentMol.MID = this.MID++;
        cmid = (label_seq_id[a] || auth_seq_id[a]);
      }

      //console.log(Cartn_x[a], Cartn_y[a], Cartn_z[a]);
    
      Xpos = currentChain.modelsXYZ[0].length;
      currentChain.modelsXYZ[0].push(Cartn_x[a], Cartn_y[a], Cartn_z[a]);
    
      currentMol.atoms.push(atom=new molmil.atomObject(Xpos, auth_atom_id[a] || label_atom_id[a] || "", type_symbol[a] || "", currentMol, currentChain));
      
      if (! atom.element) {
        for (offset=0; offset<atom.atomName.length; offset++) if (! molmil_dep.isNumber(atom.atomName[offset])) break;
        if (atom.atomName.length > 1 && ! molmil_dep.isNumber(atom.atomName[1]) && atom.atomName[1] == atom.atomName[1].toLowerCase()) atom.element = atom.atomName.substring(offset, offset+2);
        else atom.element = atom.atomName.substring(offset, offset+1);
      }
      
    
      atom.label_alt_id = label_alt_id[a];
      if (atom.label_alt_id && atom.label_alt_id != "A") atom.display = false;
      if (isCC || ! polyTypes.hasOwnProperty(currentMol.name)) {
        if (currentMol.name == "HOH" || currentMol.name == "DOD" || currentMol.name == "WAT") {currentMol.water = true; currentMol.ligand = false;}
      }
      else {
        currentChain.isHet = false;
        if (atom.atomName == "N") {currentMol.N = atom; currentMol.ligand = false;}
        else if (atom.atomName == "CA") { currentMol.CA = atom; currentMol.ligand = false;}
        else if (atom.atomName == "C") {currentMol.C = atom; currentMol.ligand = false;}
        else if (atom.atomName == "O") {currentMol.O = atom; currentMol.ligand = false; currentMol.xna = false; }
        //do special stuff for dna/rna
        else if (atom.atomName == "P" && ! currentMol.O) {currentMol.P = atom;currentMol.N = atom; currentMol.xna = true; currentMol.ligand = false; if (! currentMol.CA) {currentMol.CA = atom;}}
        else if (atom.atomName == "C1'" && ! currentMol.O) {currentMol.CA = atom; currentMol.xna = true; currentMol.ligand = false;}
        else if (atom.atomName == "O3'" && ! currentMol.O) {currentMol.C = atom; currentMol.xna = true; currentMol.ligand = false;}
      }
      currentChain.atoms.push(atom);
      atom.AID = this.AID++;
      this.atomRef[atom.AID] = atom;
    }
    
    structs.push(struc);
    
    var cid = 0, xyzs;
    for (; a<Cartn_x.length; a++) {
      if (pdbx_PDB_model_num && pdbx_PDB_model_num[a] != cmnum) {
        cmnum = pdbx_PDB_model_num ? pdbx_PDB_model_num[a] : 0; ccid = null; cid = -1;
      }
    
      if (label_asym_id[a] != ccid || ! currentChain) { 
        ccid = label_asym_id[a]; cid += 1;
        if (cid >= struc.chains.length) xyzs = []; // trash
        else struc.chains[cid].modelsXYZ.push(xyzs=[]);
      }
    
      xyzs.push(Cartn_x[a], Cartn_y[a], Cartn_z[a]);
    }
  
    struc.number_of_frames = struc.chains.length ? struc.chains[0].modelsXYZ.length : 0;
  
    this.calculateCOG();
  
    var cb = pdb.chem_comp_bond || pdb.pdbx_chem_comp_model_bond;
    if (cb) {
      var atomRef = {};
      for (var i=0; i<struc.chains[0].atoms.length; i++) atomRef[struc.chains[0].atoms[i].atomName] = struc.chains[0].atoms[i];
      var a1, a2;
      for (var i=0; i<cb.atom_id_1.length; i++) {
        a1 = atomRef[cb.atom_id_1[i]];
        a2 = atomRef[cb.atom_id_2[i]];
        struc.chains[0].bonds.push([a1, a2, cb.value_order[i] == "DOUB" ? 2 : 1]);
      }
      struc.chains[0].bondsOK = true;
    }
    else {for (var i=0; i<struc.chains.length; i++ ) this.buildAminoChain(struc.chains[i]);}
  
    //var conf_type_id, beg_auth_asym_id, beg_auth_seq_id, end_auth_asym_id, end_auth_seq_id, start, end;
    var conf_type_id, beg_label_asym_id, beg_label_seq_id, end_label_asym_id, end_label_seq_id, start, end;
  
    var struct_set = false;
  
    // add a check here to make sure it's not adding CRAP
    var struct_conf = pdb.struct_conf;
    if (struct_conf && Cartn_x.length) {
      for (var i=0, m; i<struct_conf.id.length; i++) {
        conf_type_id = struct_conf.conf_type_id[i];
        if (conf_type_id == "HELX_P") conf_type_id = 3;
        else if (conf_type_id == "TURN_P") conf_type_id = 4;
        else continue;
        beg_label_asym_id = struct_conf.beg_label_asym_id[i];
        beg_label_seq_id = struct_conf.beg_label_seq_id[i];
        end_label_asym_id = struct_conf.end_label_asym_id[i];
        end_label_seq_id = struct_conf.end_label_seq_id[i];
        //if (end_label_seq_id-beg_label_seq_id < 3) conf_type_id = 4;

        start = this.getMolObject4Chain(this.getChain(struc, beg_label_asym_id), beg_label_seq_id);
        end = this.getMolObject4Chain(this.getChain(struc, end_label_asym_id), end_label_seq_id);
        while (end) {
          if (start == null) break;
          start.sndStruc = conf_type_id;
          if (start == end) break;
          start = start.next;
        }
      }
      struct_set = true;
    }
  
    var struct_sheet_range = pdb.struct_sheet_range;  
    if (struct_sheet_range && Cartn_x.length) {
      for (var i=0, m; i<struct_sheet_range.beg_label_asym_id.length; i++) {
        beg_label_asym_id = struct_sheet_range.beg_label_asym_id[i];
        beg_label_seq_id = struct_sheet_range.beg_label_seq_id[i];
        end_label_asym_id = struct_sheet_range.end_label_asym_id[i];
        end_label_seq_id = struct_sheet_range.end_label_seq_id[i];
        start = this.getMolObject4Chain(this.getChain(struc, beg_label_asym_id), beg_label_seq_id);
        end = this.getMolObject4Chain(this.getChain(struc, end_label_asym_id), end_label_seq_id);
        while (end) {
          if (start == null) break;
          start.sndStruc = 2;
          if (start == end) break;
          start = start.next;
        }
      }
      struct_set = true;
    }
    
    if (! struct_set) {for (c=0; c<struc.chains.length; c++) this.ssAssign(struc.chains[c]);}
  
    var poly;
    if (pdb.hasOwnProperty("entity_poly")) {
      poly = pdb.entity_poly.entity_id;
      for (var i=0; i<pdb.struct_asym.id.length; i++) {if (poly.indexOf(pdb.struct_asym.entity_id[i]) != -1) this.poly_asym_ids.push(pdb.struct_asym.id[i]);}
    }

    var pdbx_struct_oper_list = pdb.pdbx_struct_oper_list;
    if (pdbx_struct_oper_list) {
      var i, length = pdbx_struct_oper_list.type.length;
      var xmode = ! pdbx_struct_oper_list.hasOwnProperty("matrix[1][1]");
      for (i=0; i<length; i++) {
        mat = mat4.create();
      
        mat[0] = pdbx_struct_oper_list[xmode ? "matrix11" : "matrix[1][1]"][i];
        mat[4] = pdbx_struct_oper_list[xmode ? "matrix12" : "matrix[1][2]"][i];
        mat[8] = pdbx_struct_oper_list[xmode ? "matrix13" : "matrix[1][3]"][i];
        mat[12] = pdbx_struct_oper_list[xmode ? "vector1" : "vector[1]"][i];
      
        mat[1] = pdbx_struct_oper_list[xmode ? "matrix21" : "matrix[2][1]"][i];
        mat[5] = pdbx_struct_oper_list[xmode ? "matrix22" : "matrix[2][2]"][i];
        mat[9] = pdbx_struct_oper_list[xmode ? "matrix23" : "matrix[2][3]"][i];
        mat[13] = pdbx_struct_oper_list[xmode ? "vector2" : "vector[2]"][i];
      
        mat[2] = pdbx_struct_oper_list[xmode ? "matrix31" : "matrix[3][1]"][i];
        mat[6] = pdbx_struct_oper_list[xmode ? "matrix32" : "matrix[3][2]"][i];
        mat[10] = pdbx_struct_oper_list[xmode ? "matrix33" : "matrix[3][3]"][i];
        mat[14] = pdbx_struct_oper_list[xmode ? "vector3" : "vector[3]"][i];
      
        if ( mat[ 0] == 1 && mat[ 1] == 0 && mat[ 2] == 0 && mat[ 3] == 0 && 
             mat[ 4] == 0 && mat[ 5] == 1 && mat[ 6] == 0 && mat[ 7] == 0 &&
             mat[ 8] == 0 && mat[ 9] == 0 && mat[10] == 1 && mat[11] == 0 && 
             mat[12] == 0 && mat[13] == 0 && mat[14] == 0 && mat[15] == 1    ) this.BUmatrices[pdbx_struct_oper_list.id[i]] = ["identity operation", mat];
        else this.BUmatrices[pdbx_struct_oper_list.id[i]] = [pdbx_struct_oper_list.type[i], mat];
      
        //this.BUmatrices[pdbx_struct_oper_list.id[i]] = [pdbx_struct_oper_list.type[i], mat];
      }
      
      this.AisB = (! pdbx_struct_oper_list || ! pdb.pdbx_struct_assembly || (pdbx_struct_oper_list.id.length == 1 && pdb.pdbx_struct_assembly.id == 1));
    
      var pdbx_struct_assembly_gen = pdb.pdbx_struct_assembly_gen, tmp1, tmp2, tmp3=mat4.create(), j, k, mats;
      length = pdbx_struct_assembly_gen.assembly_id.length;
      var xpnd = function(inp) {
        tmp2 = [];
        inp = inp.split(",");
        for (j=0; j<inp.length; j++) {
          if (inp[j].indexOf("-") != -1) {
            inp[j] = inp[j].replace("(", "").replace(")", "").split("-");
            for (k=parseInt(inp[j][0]); k<parseInt(inp[j][1])+1; k++) tmp2.push(k)
          }
          else tmp2.push(inp[j].replace("(", "").replace(")", ""));
        }
        return tmp2;
      }
    
      
      //pdbx_struct_assembly_gen.oper_expression
      //sum (number of residues in each pdbx_struct_assembly_gen.asym_id_list)
      // A*B


      for (i=0; i<length; i++) {
        if (! this.BUassemblies.hasOwnProperty(pdbx_struct_assembly_gen.assembly_id[i])) this.BUassemblies[pdbx_struct_assembly_gen.assembly_id[i]] = [];
        mats = [];
        if (pdbx_struct_assembly_gen.oper_expression[i].indexOf(")(") != -1) {
          tmp1 = pdbx_struct_assembly_gen.oper_expression[i].split(")(");
          tmp1[0] = xpnd(tmp1[0].substr(1));
          tmp1[1] = xpnd(tmp1[1].substr(0, tmp1[1].length-1));
          // build new matrices
          for (j=0; j<tmp1[0].length; j++) {
            for (k=0; k<tmp1[1].length; k++) {
              poly = "combi_"+tmp1[0][j]+"_"+tmp1[1][k];
              if (! this.BUmatrices.hasOwnProperty(poly)) {
                mat4.multiply(tmp3, this.BUmatrices[tmp1[0][j]][1], this.BUmatrices[tmp1[1][k]][1]);
                if ( tmp3[ 0] == 1 && tmp3[ 1] == 0 && tmp3[ 2] == 0 && tmp3[ 3] == 0 && 
                     tmp3[ 4] == 0 && tmp3[ 5] == 1 && tmp3[ 6] == 0 && tmp3[ 7] == 0 &&
                     tmp3[ 8] == 0 && tmp3[ 9] == 0 && tmp3[10] == 1 && tmp3[11] == 0 && 
                     tmp3[12] == 0 && tmp3[13] == 0 && tmp3[14] == 0 && tmp3[15] == 1    ) this.BUmatrices[poly] = ["identity operation", tmp3];
                else this.BUmatrices[poly] = ["combined", mat4.clone(tmp3)];
              }
              mats.push(poly);
            }
          }
        }
        else {
          mats = xpnd(pdbx_struct_assembly_gen.oper_expression[i]);
        }
        this.BUassemblies[pdbx_struct_assembly_gen.assembly_id[i]].push([mats, pdbx_struct_assembly_gen.asym_id_list[i].split(",")]);
      }
    }
    
    // loop over all residues and set showSC to true if a weird residue...
    for (var c=0, m, mol; c<struc.chains.length; c++) {
      for (m=0; m<struc.chains[c].molecules.length; m++) {
        mol = struc.chains[c].molecules[m];
        if (! mol.ligand && ! mol.water && ! mol.xna && ! molmil.AATypesBase.hasOwnProperty(mol.name)) mol.weirdAA = true;
      }
    }
  
    molmil.resetColors(struc, this);
    
    this.pdbxData = pdb;
    delete pdb.atom_site;
  }
  
  return structs[0];
};

// ** calculates the center of gravity of a system **
molmil.viewer.prototype.calculateCOG = function() {
  if (this.skipCOGupdate) return;
  this.avgX = 0;
  this.avgY = 0;
  this.avgZ = 0;
  this.stdX = 0;
  this.stdY = 0;
  this.stdZ = 0;
  this.avgXYZ = [0, 0, 0];
  this.stdXYZ = [0, 0, 0];
  var n = 0;
  var CA;
  var xyzRef, Xpos;
  var poss = [];
  
  this.geomRanges = [0, 0, 0, 0, 0, 0], ALTs = [];
  var struct, chain, s, c, m, a;
  
  //molmil.polygonObject
  
  for (s=0; s<this.structures.length; s++) {
    struct = this.structures[s];
    if (struct instanceof molmil.entryObject) {
      for (c=0; c<struct.chains.length; c++) {
        chain = struct.chains[c];
        xyzRef = chain.modelsXYZ[0];
        if (chain.molecules.length && chain.molecules[0].water) continue;
      
        for (m=0; m<chain.molecules.length; m++) {
          if (! chain.molecules[m].display) continue;
          if (chain.molecules[m].ligand || chain.molecules[m].water) {
            for (a=0; a<chain.molecules[m].atoms.length; a++) {
              Xpos = chain.molecules[m].atoms[a].xyz;
              xyz = [xyzRef[Xpos], xyzRef[Xpos+1], xyzRef[Xpos+2]];
              this.avgX += xyz[0];
              this.avgY += xyz[1];
              this.avgZ += xyz[2];
              poss.push(xyz);
              n++;
            }
          }
          else {
            CA = chain.molecules[m].CA;
            if (CA != null) {
              Xpos = CA.xyz;
              xyz = [xyzRef[Xpos], xyzRef[Xpos+1], xyzRef[Xpos+2]];
              this.avgX += xyz[0];
              this.avgY += xyz[1];
              this.avgZ += xyz[2];
              poss.push(xyz);
              n += 1;
            }
          }
        } 
      }
    }
    else if (struct instanceof molmil.polygonObject) {
      this.avgX += struct.meta.COR[0];
      this.avgY += struct.meta.COR[1];
      this.avgZ += struct.meta.COR[2];
      n += struct.meta.COR[3];
      if (struct.meta.hasOwnProperty("geomRanges")) ALTs.push(struct.meta.geomRanges, struct.meta.COR[3]);
    }
  }
  
  if (n == 0) return;

  this.avgX /= n;
  this.avgY /= n;
  this.avgZ /= n;
  
  
  var xMin = 1e99, xMax = -1e99, yMin = 1e99, yMax = -1e99, zMin = 1e99, zMax = -1e99;
  
  var tmp, n_tmp;
  for (var i=0; i<poss.length; i++) {
    tmp = poss[i][0]-this.avgX; 
    this.stdX += tmp*tmp;
    
    if (tmp < xMin) xMin = tmp;
    if (tmp > xMax) xMax = tmp;
    
    
    tmp = poss[i][1]-this.avgY; 
    this.stdY += tmp*tmp;
    
    if (tmp < yMin) yMin = tmp;
    if (tmp > yMax) yMax = tmp;
    
    tmp = poss[i][2]-this.avgZ;
    this.stdZ += tmp*tmp;
    
    if (tmp < zMin) zMin = tmp;
    if (tmp > zMax) zMax = tmp;
  }
  
  for (var i=0; i<ALTs.length; i+=2) {
    n_tmp = ALTs[i][1];
    tmp = ALTs[i][0]-this.avgX;
    this.stdX += (tmp*tmp)*n_tmp*.5;
    if (tmp < xMin) xMin = tmp;
    
    tmp = ALTs[i][1]-this.avgX;
    this.stdX += (tmp*tmp)*n_tmp*.5;
    if (tmp > xMax) xMax = tmp;
    
    tmp = ALTs[i][2]-this.avgY; 
    this.stdY += (tmp*tmp)*n_tmp*.5;
    if (tmp < yMin) yMin = tmp;
    
    tmp = ALTs[i][3]-this.avgY;
    this.stdY += (tmp*tmp)*n_tmp*.5;
    if (tmp > yMax) yMax = tmp;
    
    tmp = ALTs[i][4]-this.avgZ; 
    this.stdZ += (tmp*tmp)*n_tmp*.5;
    if (tmp < zMin) zMin = tmp;
    
    tmp = ALTs[i][5]-this.avgZ;
    this.stdZ += (tmp*tmp)*n_tmp*.5;
    if (tmp > zMax) zMax = tmp;
  }

  this.stdX = Math.sqrt(this.stdX/n);
  this.stdY = Math.sqrt(this.stdY/n);
  this.stdZ = Math.sqrt(this.stdZ/n);

  
  this.avgXYZ = [this.avgX, this.avgY, this.avgZ];
  this.stdXYZ = [this.stdX, this.stdY, this.stdZ];
  this.COR = this.avgXYZ;

  this.geomRanges = [xMin, xMax, yMin, yMax, zMin, zMax];
}

// ** assigns the secondary structure elements of a chain object using DSSP or CA torsion angles**
molmil.viewer.prototype.ssAssign = function(chainObj) {
  if (chainObj.molecules.length && chainObj.molecules[0].water) return;
    // the below code doesn't work properly...
  
  var mol1, mol2, a = [0, 0, 0], b = [0, 0, 0], c = [0, 0, 0], d = [0, 0, 0], c1, c2;
  for (var m=0; m<chainObj.molecules.length; m++) {
    mol1 = chainObj.molecules[m]; c1 = mol1.chain;
    if (mol1.ligand || mol1.water || mol1.name == "PRO" || mol1.xna) continue;
    if (mol1.previous) {
      try {
        mol1.NH = {xyz: [0, 0, 0]};
        a[0] = c1.modelsXYZ[0][mol1.previous.C.xyz]; a[1] = c1.modelsXYZ[0][mol1.previous.C.xyz+1]; a[2] = c1.modelsXYZ[0][mol1.previous.C.xyz+2];
        b[0] = c1.modelsXYZ[0][mol1.previous.O.xyz]; b[1] = c1.modelsXYZ[0][mol1.previous.O.xyz+1]; b[2] = c1.modelsXYZ[0][mol1.previous.O.xyz+2];
        c[0] = c1.modelsXYZ[0][mol1.N.xyz]; c[1] = c1.modelsXYZ[0][mol1.N.xyz+1]; c[2] = c1.modelsXYZ[0][mol1.N.xyz+2];

        vec3.subtract(mol1.NH.xyz, a, b);
        vec3.normalize(mol1.NH.xyz, mol1.NH.xyz);
        vec3.add(mol1.NH.xyz, mol1.NH.xyz, c);
      }
      catch (e) {mol1.NH = null;}
    }
    else mol1.NH = true;
  }
  
  var x, y, z;
  
  var distance2 = function(a, b) {
    x = b[0] - a[0]; y = b[1] - a[1]; z = b[2] - a[2];
    return x*x + y*y + z*z;
  };
  
  var BBBonds = {}, BBBondsList = {}, chains=[], chain;
  
  var m1, m2, E, NC, NO, HC, HO;
  for (m1=0; m1<chainObj.molecules.length; m1++) {
    mol1 = chainObj.molecules[m1]; c1 = mol1.chain;
    if (mol1.ligand || mol1.water || mol1.xna) continue;
    if (! mol1.previous) chains.push(chain=[]);
    chain.push(mol1);
    for (m2=m1+2; m2<chainObj.molecules.length; m2++) {
      mol2 = chainObj.molecules[m2]; c2 = mol2.chain;
      if (mol2.ligand || mol2.water || mol1.xna || ! mol1.N || ! mol2.C || ! mol1.C || ! mol2.N) continue;
      a[0] = c1.modelsXYZ[0][mol1.N.xyz]; a[1] = c1.modelsXYZ[0][mol1.N.xyz+1]; a[2] = c1.modelsXYZ[0][mol1.N.xyz+2];
      b[0] = c2.modelsXYZ[0][mol2.C.xyz]; b[1] = c2.modelsXYZ[0][mol2.C.xyz+1]; b[2] = c2.modelsXYZ[0][mol2.C.xyz+2];
      NC = distance2(a, b);
      if (NC < 25 && mol1.NH && mol2.O) {
        NC = Math.sqrt(NC);
        c[0] = c2.modelsXYZ[0][mol2.O.xyz]; c[1] = c2.modelsXYZ[0][mol2.O.xyz+1]; c[2] = c2.modelsXYZ[0][mol2.O.xyz+2];
        NO = Math.sqrt(distance2(a, c));
        if (mol1.NH == true) {HC = NC - 1.0; HO = NO - 1.0;}
        else {
          HC = Math.sqrt(distance2(mol1.NH.xyz, b));
          HO = Math.sqrt(distance2(mol1.NH.xyz, c));
        }
        E = 0.084*((1/NO) + (1/HC) - (1/HO) - (1/NC))*332;
        //console.log(NO, HC, HO, NC);
        if (E < -0.67) {
          BBBonds[mol1.MID+"-"+mol2.MID] = E;
          //BBBonds[mol2.MID+"-"+mol1.MID] = E;
          if (! BBBondsList.hasOwnProperty(mol1.MID)) BBBondsList[mol1.MID] = [];
          BBBondsList[mol1.MID].push(mol2);
          if (! BBBondsList.hasOwnProperty(mol2.MID)) BBBondsList[mol2.MID] = [];
          BBBondsList[mol2.MID].push(mol1);
        }
      }
      a[0] = c1.modelsXYZ[0][mol1.C.xyz]; a[1] = c1.modelsXYZ[0][mol1.C.xyz+1]; a[2] = c1.modelsXYZ[0][mol1.C.xyz+2];
      b[0] = c2.modelsXYZ[0][mol2.N.xyz]; b[1] = c2.modelsXYZ[0][mol2.N.xyz+1]; b[2] = c2.modelsXYZ[0][mol2.N.xyz+2];
      NC = distance2(b, a);
      if (NC < 25 && mol1.O && mol2.NH) {
        NC = Math.sqrt(NC);
        
        c[0] = c1.modelsXYZ[0][mol1.O.xyz]; c[1] = c1.modelsXYZ[0][mol1.O.xyz+1]; c[2] = c1.modelsXYZ[0][mol1.O.xyz+2];
        
        
        NO = Math.sqrt(distance2(b, c)); //
        if (mol2.NH == true) {HC = NC - 1.0; HO = NO - 1.0;}
        else {
          HC = Math.sqrt(distance2(mol2.NH.xyz, a));
          HO = Math.sqrt(distance2(mol2.NH.xyz, c));
        }
        E = 0.084*((1/NO) + (1/HC) - (1/HO) - (1/NC))*332;
        
        if (E < -0.67) {
          //BBBonds[mol1.MID+"-"+mol2.MID] = E;
          BBBonds[mol2.MID+"-"+mol1.MID] = E;
          if (! BBBondsList.hasOwnProperty(mol1.MID)) BBBondsList[mol1.MID] = [];
          BBBondsList[mol1.MID].push(mol2);
          if (! BBBondsList.hasOwnProperty(mol2.MID)) BBBondsList[mol2.MID] = [];
          BBBondsList[mol2.MID].push(mol1);
        }
      }
    }
  }
  
  // only CAs?
  //chains
  if (Object.keys(BBBondsList).length == 0) {
    var r2d = 180. / Math.PI; var v1 = [0, 0, 0], v2 = [0, 0, 0], v3 = [0, 0, 0], y1 = [0, 0, 0], y2 = [0, 0, 0], x1 = [0, 0, 0], torsion;
    var calcTorsion = function(a1, a2, a3, a4) {
      try {
        vec3.subtract(v1, a2, a1); vec3.subtract(v2, a3, a2); vec3.subtract(v3, a4, a3);

        vec3.scale(y1, v1, vec3.length(v2)); vec3.cross(y2, v2, v3); y = vec3.dot(y1, y2);
        vec3.cross(x1, v1, v2); x = vec3.dot(x1, y2);
        
        torsion = Math.atan2(y, x)*r2d;
        if (torsion < 0) torsion += 360;
        return torsion;
      }
      catch (e) {return 0.0;}
    };
    
    var a, b, c, d, A, B, C, D, a1, ab = [], a1L = [];
    
    for (var cx=0; cx<chains.length; cx++) {
      chain = chains[cx];

      ab = [], a1L = [];
      for (m=2; m<chain.length-1; m++) {
        a = chain[m-2].CA; b = chain[m-1].CA; c = chain[m].CA; d = chain[m+1].CA;
        if (! a || ! b || ! c || ! d) {
          ab.push(0);
          a1L.push(0);
          continue;
        }
        a = a.xyz; b = b.xyz; c = c.xyz; d = d.xyz;
        A = [chainObj.modelsXYZ[0][a], chainObj.modelsXYZ[0][a+1], chainObj.modelsXYZ[0][a+2]];
        B = [chainObj.modelsXYZ[0][b], chainObj.modelsXYZ[0][b+1], chainObj.modelsXYZ[0][b+2]];
        C = [chainObj.modelsXYZ[0][c], chainObj.modelsXYZ[0][c+1], chainObj.modelsXYZ[0][c+2]];
        D = [chainObj.modelsXYZ[0][d], chainObj.modelsXYZ[0][d+1], chainObj.modelsXYZ[0][d+2]];
        a1 = calcTorsion(A, B, C, D);
        if (a1 >= 10 && a1 <= 120) ab.push(1); // alpha helix
        else if (a1 >= 120 && a1 <= 270) ab.push(2); // beta sheet
        else ab.push(0);
        a1L.push(a1);
        
        // 10 - 120 --> alpha helix
        // 120 - 270 --> beta sheet
        // -90 - 0 --> lh alpha helix
      }
      ab.push(0);
    
      for (m=1; m<chain.length-1; m++) {
        if (ab[m] == 0) {
          if (ab[m-1] == 1 && ab[m+1] == 1) ab[m] = 1;
          if (ab[m-1] == 2 && ab[m+1] == 2) ab[m] = 2;
        }
      }
    
      ab[0] = ab[1] = ab[2];
      ab[ab.length-1] = ab[ab.length-2];

      var test = [-1, 0], i; // pos, type
    
      for (m=0; m<ab.length; m++) {
        if (ab[m] != test[1]) {
          if (test[1] != 0 && m-test[0] < 4) {for (i=test[0]; i<m; i++) ab[i] = 0;} // reset short stretches
          test[0] = m;
          test[1] = ab[m];
        }
      }
    
      //for (m=0; m<ab.length; m++) {
      //  if (ab[m] == 0 && a1L[m] >= -90 && a1L[m] <= 90) ab[m] = 3;
      //}
    
      //for (m=ab.length-2; m<=0; m--) {
      //  if (ab[m] == 0 && ab[m+1] == 3) ab[m] = 3;
      //}
    
      for (m=0; m<chain.length; m++) {
        if (ab[m] == 1) chain[m].sndStruc = 3;
        else if (ab[m] == 2) chain[m].sndStruc = 2;
        else if (ab[m] == 3) chain[m].sndStruc = 4;
      } 

    }
    return;
  }
  
  // now analyse BBBonds and determine the bb type...
  
  var getMID = function(m) {return m ? m.MID : null;};
  
  //var MID1, MID2, pattern=0, block, added;
  
  var MID1, MID2, pattern, block;
  
  var typedChains = [], typedChain, bp1, bp2, tmp1, S1, S2, patterns = [], EOL = false;
  
  for (var c=0; c<chains.length; c++) {
    typedChains.push(typedChain = []);
    for (m1=0; m1<chains[c].length; m1++) {
      pattern = 0;
      
      MID1 = getMID(chains[c][m1]);
      bp1 = bp2 = [c, m1];
      
      //console.log(BBBonds.hasOwnProperty("90-87"), BBBonds.hasOwnProperty("91-87"), BBBonds.hasOwnProperty("92-87"));
      // 87-91 --> 1.9822A...
      
      //console.log(BBBonds.hasOwnProperty("91-87"), MID1+"-"+getMID(chains[c][m1-4]));
      
      if ((BBBonds.hasOwnProperty(getMID(chains[c][m1+3])+"-"+MID1)) && ! EOL && (patterns.length < 3 || BBBonds.hasOwnProperty(MID1+"-"+getMID(chains[c][m1-3])))) {
        pattern = 3;
        bp1 = [c, m1];
        bp2 = [c, m1+3];
      }
      else if (BBBonds.hasOwnProperty(MID1+"-"+getMID(chains[c][m1-3])) && patterns.length > 3) {
        pattern = 3;
        bp1 = [c, m1-3];
        bp2 = [c, m1];
        EOL = true;
      }
      
      if (BBBonds.hasOwnProperty(getMID(chains[c][m1+5])+"-"+MID1) && ! EOL && (patterns.length < 5 || BBBonds.hasOwnProperty(MID1+"-"+getMID(chains[c][m1-5])))) {
        pattern = 5;
        bp1 = [c, m1];
        bp2 = [c, m1+5];
      }
      else if (BBBonds.hasOwnProperty(MID1+"-"+getMID(chains[c][m1-5])) && patterns.length > 5) {
        pattern = 5;
        bp1 = [c, m1-5];
        bp2 = [c, m1];
        EOL = true;
      }
      
      //console.log(MID1+"-"+getMID(chains[c][m1-4]), patterns.length);
      
      if (BBBonds.hasOwnProperty(getMID(chains[c][m1+4])+"-"+MID1) && ! EOL && (patterns.length < 4 || BBBonds.hasOwnProperty(MID1+"-"+getMID(chains[c][m1-4])))) {
        pattern = 4;
        bp1 = [c, m1];
        bp2 = [c, m1+4];
      }
      else if (BBBonds.hasOwnProperty(MID1+"-"+getMID(chains[c][m1-4])) && patterns.length > 3) {
        
        pattern = 4;
        bp1 = [c, m1-4];
        bp2 = [c, m1];
        EOL = true;
      }
      
      if (patterns.length && patterns[patterns.length-1] != pattern) {
        patterns = [];
        EOL = false;
      }
      patterns.push(pattern);
      
      typedChain.push([pattern, bp1, bp2]);
    }
  }
  
  for (var c=0; c<typedChains.length; c++) {
    typedChain = typedChains[c];
    block = []; patterns = []; pattern = 0;
    for (m1=0; m1<typedChain.length; m1++) {
      if (typedChain[m1][0] != pattern) {
        if (pattern == 3 || pattern == 4 || pattern == 5) {
          if ((block.length > 1 && pattern != 3) || block.length > 2) {
            for (m2=block[0][1][1]; m2<block[block.length-1][2][1]; m2++) chains[c][m2].sndStruc = 3;
          }
          else if (block.length) patterns.push([block[0][1][1], block[block.length-1][2][1]]);
        }
        pattern = 0;
        block = [];
      }
      if (typedChain[m1][0]) {
        block.push(typedChain[m1]);
        pattern = typedChain[m1][0];
      }
    }
    //console.log(patterns);
    
    for (m1=0; m1<patterns.length; m1++) {
      //console.log(chains[c][Math.max(0, patterns[m1][0]-1)], chains[c][Math.min(chains[c].length-1, patterns[m1][1]+1)]);
      MID1 = Math.max(0, patterns[m1][0]-1);
      MID2 = Math.min(chains[c].length-1, patterns[m1][1]+1);
      
      //pattern = MID2-MID1 > 4 || chains[c][MID1].sndStruc == 3 || chains[c][MID2].sndStruc == 3 ? 3 : 4;
      pattern = chains[c][Math.max(0, patterns[m1][0]-1)].sndStruc == 3 || chains[c][Math.min(chains[c].length-1, patterns[m1][1]+1)].sndStruc == 3 ? 3 : 4;
      for (m2=patterns[m1][0]; m2<patterns[m1][1]; m2++) chains[c][m2].sndStruc = pattern;
    }
    
  }
  
  var mh;
  
  for (var c=0; c<chains.length; c++) {
    for (m1=0; m1<chains[c].length; m1++) {
      //if (chains[c][m1].sndStruc != 3 && chains[c][m1].sndStruc != 4) {
      if (chains[c][m1].sndStruc != 3) {
        tmp1 = null;
        if (chains[c][m1].previous && chains[c][m1].next) {
          S1 = BBBondsList[getMID(chains[c][m1].previous)];
          S2 = BBBondsList[getMID(chains[c][m1].next)];
          if (S1 && S2) {
            for (var i=0, j; i<S1.length; i++) {
              for (j=0; j<S2.length; j++) {
                if (S1[i].previous && S1[i].previous == S2[j].next) {tmp1 = [S1[i].previous]; break;}
                else if (S2[j].previous && S2[j].previous == S1[i].next) {tmp1 = [S1[i].next]; break;}
              }
              if (tmp1) break;
            }
          }
        }
        if (! tmp1) {tmp1 = BBBondsList[getMID(chains[c][m1])];}
        if (tmp1) {
          for (mh=0; mh<tmp1.length; mh++) {
            if (tmp1[mh].sndStruc == 2) {chains[c][m1].sndStruc = 2; break;}
            S1 = [chains[c][m1].previous, chains[c][m1], chains[c][m1].next];
            S2 = [tmp1[mh].previous, tmp1[mh], tmp1[mh].next];

            if (BBBonds.hasOwnProperty(getMID(S1[0])+"-"+getMID(S2[1])) && BBBonds.hasOwnProperty(getMID(S2[1])+"-"+getMID(S1[2]))) {
              S1[0].sndStruc = S1[1].sndStruc = S1[2].sndStruc = S2[1].sndStruc = 2;
            }
            else if (BBBonds.hasOwnProperty(getMID(S1[1])+"-"+getMID(S2[0])) && BBBonds.hasOwnProperty(getMID(S2[2])+"-"+getMID(S1[1]))) {
              S1[1].sndStruc = S2[0].sndStruc = S2[1].sndStruc = S2[2].sndStruc = 2;
            }
            // N-C

            else if (BBBonds.hasOwnProperty(getMID(S1[1])+"-"+getMID(S2[1])) && BBBonds.hasOwnProperty(getMID(S2[1])+"-"+getMID(S1[1]))) {
              S1[1].sndStruc = S2[1].sndStruc = 2;
            }
            else if (BBBonds.hasOwnProperty(getMID(S1[0])+"-"+getMID(S2[2])) && BBBonds.hasOwnProperty(getMID(S1[2])+"-"+getMID(S2[0]))) {
              S1[0].sndStruc = S1[1].sndStruc = S1[2].sndStruc = 
              S2[0].sndStruc = S2[1].sndStruc = S2[2].sndStruc = 2;
            }
          }
          
        }
      }
    }
  }
  
};

// ** center of rotation manipulation **

molmil.viewer.prototype.setCOR=function(selection) {
  var modelId = this.renderer.modelId
  if (this.lastKnowAS) resetCOR();
  this.lastKnownAS = null;
  if (! this.atomSelection.length && ! selection) return;
  if (! selection) selection = [this.atomSelection[0].chain.modelsXYZ[modelId][this.atomSelection[0].xyz], this.atomSelection[0].chain.modelsXYZ[modelId][this.atomSelection[0].xyz+1], this.atomSelection[0].chain.modelsXYZ[modelId][this.atomSelection[0].xyz+2]];
  this.lastKnownAS = [selection[0], selection[1], selection[2]];
  var rotMat = mat3.create(); mat3.fromMat4(rotMat, this.renderer.modelViewMatrix);
  var delta = vec3.subtract([0, 0, 0], this.lastKnownAS, this.avgXYZ);
  vec3.transformMat3(delta, delta, rotMat);
  this.renderer.camera.x += delta[0];
  this.renderer.camera.y += delta[1];
  this.renderer.camera.z += delta[2];
  for (var i=0; i<this.canvases.length; i++) this.canvases[i].molmilViewer.COR = this.lastKnownAS;
  this.canvas.atomCORset = true;
}

molmil.viewer.prototype.resetCOR=function() {
  var rotMat = mat3.create(); mat3.fromMat4(rotMat, this.renderer.modelViewMatrix);
  var delta = vec3.subtract([0, 0, 0], this.avgXYZ, this.lastKnownAS);
  vec3.transformMat3(delta, delta, rotMat);
  this.renderer.camera.x += delta[0];
  this.renderer.camera.y += delta[1];
  this.renderer.camera.z += delta[2];
  for (var i=0; i<this.canvases.length; i++) this.canvases[i].molmilViewer.COR = this.avgXYZ;
  this.canvas.atomCORset = false;
  this.lastKnownAS = null;
}

// geometry functions

// ** generates a PLY file **
molmil.exportPLY = function(soup) {
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
  saveAs(blob, "molmil.ply")
  
  // de-init
  molmil.geometry.skipClearBuffer = false;
};

// ** generates an STL file **
molmil.exportSTL = function(soup) {
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
        
  var header = "generated by molmil"; header += new Array(80-header.length+1).join(" ");
  var nof_ = new Uint32Array(1); nof_[0] = nof;
  var bin = [header, nof_];
        
  var m, floatT, uint16T, vB, iB, i, v1 = [0, 0, 0], v2 = [0, 0, 0], v3 = [0, 0, 0], u1 = [0, 0, 0], u2 = [0, 0, 0];
        
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

  saveAs(blob, "molmil.stl")
  
  // de-init
  molmil.geometry.skipClearBuffer = false;
};

// ** geometry object, used to generate protein geometry; atoms, bonds, loops, helices, sheets **

molmil.geometry = {
  templates: {sphere: {}, cylinder: [], dome: {}},
  detail_lvs: 5,
  dome: [0, 0, -1],
  radius: .25,
  sheetHeight: .125,
  skipClearBuffer: false,
  onGenerate: null
};

molmil.geometry.generator = function(objects, soup, name, programOptions) {
  programOptions = programOptions || {};
  var detail_lv = molmil.configBox.QLV_SETTINGS[soup.renderer.QLV].SPHERE_TESS_LV;
  var CB_NOI = molmil.configBox.QLV_SETTINGS[soup.renderer.QLV].CB_NOI;
  var CB_NOVPR = molmil.configBox.QLV_SETTINGS[soup.renderer.QLV].CB_NOVPR;
  
  var o, object;
  
  var cylinder = molmil.geometry.getCylinder(detail_lv);
  var nov = 0, noi = 0;
  
  for (var o=0; o<objects.length; o++) {
    object = objects[o];
    if (object.type == "sphere") {
      // create a sphere with radius object.radius on object.coords[0]
    }
    if (object.type == "cylinder") {
      // create a cylinder with radius object.radius on object.coords[0] & object.coords[1]
      nov += (cylinder.vertices.length/3);
      noi += cylinder.indices.length;
      // for now, no capping...
    }
  }
  
  var vBuffer = new Float32Array(nov * 7); // x, y, z, nx, ny, nz, rgba
  var vBuffer8 = new Uint8Array(vBuffer.buffer);
  var iBuffer = new Uint32Array(noi);
  
  var rotationMatrix = mat4.create();
  var vertex = [0, 0, 0, 0], normal = [0, 0, 0, 0];
  var r = 4.0, rgba, v=0, vP8=0, vP=0, p=0, iP = 0, v, dx, dy, dz, dij, angle;
  
  for (var o=0; o<objects.length; o++) {
    object = objects[o];
    rgba = object.rgba;
    if (object.type == "sphere") {
      // create a sphere with radius object.radius on object.coords[0]
    }
    if (object.type == "cylinder") {
      // create a cylinder with radius object.radius on object.coords[0] & object.coords[1]
      r = object.radius;
      dx = object.coords[1][0]-object.coords[0][0];
      dy = object.coords[1][1]-object.coords[0][1];
      dz = object.coords[1][2]-object.coords[0][2];
      dij = Math.sqrt((dx*dx) + (dy*dy) + (dz*dz));
      dx /= dij; dy /= dij; dz /= dij;
      angle = Math.acos(-dz);
      mat4.identity(rotationMatrix);
      mat4.rotate(rotationMatrix, rotationMatrix, angle, [dy, -dx, 0.0]);
      for (v=0; v<cylinder.indices.length; v++, iP++) iBuffer[iP] = cylinder.indices[v]+p; // a2
      
      for (v=0; v<cylinder.vertices.length; v+=3, vP8+=28) {
        vec3.transformMat4(vertex, [cylinder.vertices[v]*r, cylinder.vertices[v+1]*r, cylinder.vertices[v+2]*dij*2], rotationMatrix);
        //vec3.transformMat4(vertex, [(cylinder.vertices[v]*r)+offsetX, (cylinder.vertices[v+1]*r)+offsetY, (cylinder.vertices[v+2]+offsetZ)*dij], rotationMatrix);
        vec3.transformMat4(normal, [cylinder.normals[v], cylinder.normals[v+1], cylinder.normals[v+2]], rotationMatrix);

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
          
      p += cylinder.vertices.length / 3;
      
    }
  }

  var program = molmil.geometry.build_simple_render_program(vBuffer, iBuffer, soup.renderer, programOptions);
  soup.renderer.programs.push(program);
  soup.renderer.initBuffers();
  soup.canvas.update = true;
  return program;
}

molmil.geometry.getSphere = function(r, detail_lv) {
  if (r in this.templates.sphere) return this.templates.sphere[r][detail_lv];
  else return this.generateSphere(r)[detail_lv];
  // pull a sphere from the this.templates.sphere object if it exists for the given radius
}

molmil.geometry.getCylinder = function(detail_lv) {
  return this.templates.cylinder[detail_lv];
}

molmil.geometry.generateCylinder = function() {
  // generates a cylinder with length 0.5
  // afterwards apply a transformation matrix ()
  // 5
  // 10
  // 20
  // 40
  
  var nop, rad, theta, p, x, y, z, dij;
  for (var lod=0; lod<this.detail_lvs; lod++) {
    nop = (lod+1)*4;
    theta = 0.0;
    rad = 2.0/nop;
    this.templates.cylinder.push({vertices: [], normals: [], indices: []});
    for (p=0; p<nop; p++) {
      x = Math.cos(theta*Math.PI);
      y = Math.sin(theta*Math.PI);
      this.templates.cylinder[lod].vertices.push(x, y, .0);
      this.templates.cylinder[lod].vertices.push(x, y, .5);
      dij = Math.sqrt(x*x + y*y);
      this.templates.cylinder[lod].normals.push(x/dij, y/dij, .0);
      this.templates.cylinder[lod].normals.push(x/dij, y/dij, .0);
      theta += rad;
    }
    
    for (p=0; p<(nop-1)*2; p+=2) {
      this.templates.cylinder[lod].indices.push(p, p+2, p+3);
      this.templates.cylinder[lod].indices.push(p+3, p+1, p);
    }
    this.templates.cylinder[lod].indices.push(p, 0, 1);
    this.templates.cylinder[lod].indices.push(1, p+1, p);
  }
  return this.templates.cylinder;
}; molmil.geometry.generateCylinder();

molmil.geometry.generateSphere = function(r) {
  this.templates.sphere[r] = [];
  var t, i, nfo, sphere;
  for (t=0; t<this.detail_lvs; t++) {
    nfo = {vertices: [], normals: [], indices: []};
    sphere = molmil.octaSphereBuilder(t);
    for (i=0; i<sphere.vertices.length; i++) nfo.vertices.push(sphere.vertices[i][0]*r, sphere.vertices[i][1]*r, sphere.vertices[i][2]*r);
    for (i=0; i<sphere.faces.length; i++) nfo.indices.push(sphere.faces[i][0], sphere.faces[i][1], sphere.faces[i][2]);
    for (i=0; i<sphere.vertices.length; i++) nfo.normals.push(sphere.vertices[i][0], sphere.vertices[i][1], sphere.vertices[i][2]);
    this.templates.sphere[r].push(nfo);
  }
  return this.templates.sphere[r];
}




// three levels;
// - atom (ball/sticks/CA-trace)
// - wireframe
// - cartoon/rocket

// ** main **
molmil.geometry.generate = function(structures, render, detail_or) {
  this.reset();
  var chains = [], cchains = [];
  for (var s=0, c; s<structures.length; s++) {
    if (! (structures[s] instanceof molmil.entryObject) || structures[s].display == false) continue;
    for (var c=0; c<structures[s].chains.length; c++) {
      if (! structures[s].chains[c]) continue;
      if (structures[s].chains[c].display && structures[s].chains[c].molecules.length > 0 && ! structures[s].chains[c].isHet && ! structures[s].chains[c].molecules[0].water) cchains.push(structures[s].chains[c]);
      chains.push(structures[s].chains[c]);
    }
  }

  this.initChains(chains, render, detail_or);
  this.initCartoon(cchains);
  
  if (molmil.configBox.EXT_frag_depth) this.generateAtomsImposters();
  else this.generateAtoms();
  this.generateBonds();
  this.generateWireframe();
  this.generateCartoon();
  //this.generateRockets();
  
  this.generateSurfaces(cchains, render.soup);
  
  this.registerPrograms(render);
  
  if (! this.skipClearBuffer) this.reset();
  if (this.onGenerate) molmil_dep.asyncStart(this.onGenerate[0], this.onGenerate[1], this.onGenerate[2], 0);
};

molmil.geometry.build_simple_render_program = function(vertices_, indices_, renderer, settings) {
  var gl = renderer.gl;
          
  var program = {}; program.settings = settings;
  program.gl = renderer.gl; program.renderer = renderer;
  
  program.setBuffers = function(vertices, indices) {
    var vbuffer = this.gl.createBuffer();
    this.gl.bindBuffer(gl.ARRAY_BUFFER, vbuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.STATIC_DRAW);
  
    var ibuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, ibuffer);
    this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, indices, this.gl.STATIC_DRAW);
  
    this.nElements = indices.length;
    this.vertexBuffer = vbuffer;
    this.indexBuffer = ibuffer;
  };
  if (vertices_ && indices_) program.setBuffers(vertices_, indices_);
  
  program.angle = renderer.angle;
  
  program.point_shader = renderer.shaders.points;
  if (program.point_shader) program.point_attributes = program.point_shader.attributes;
  
  if (settings.uniform_color) {
    program.standard_shader = renderer.shaders.standard_uniform_color;
    program.wireframe_shader = renderer.shaders.lines_uniform_color;
    program.point_shader = renderer.shaders.points_uniform_color;
  }
  else {
    if (settings.alphaMode) program.standard_shader = renderer.shaders.standard_alpha;
    else program.standard_shader = renderer.shaders.standard;
    program.wireframe_shader = renderer.shaders.lines;
    program.point_shader = renderer.shaders.points;
  }
  program.standard_attributes = program.standard_shader.attributes;
  program.wireframe_attributes = program.wireframe_shader.attributes;
  
  //program.point_attributes = program.point_shader.attributes;
      
  program.status = true; 
  
  program.point_render = function(modelViewMatrix, COR, i) {
    if (! this.status) return;
    
    this.gl.activeTexture(this.gl.TEXTURE0);
    this.gl.bindTexture(this.gl.TEXTURE_2D, renderer.textures.atom_imposter);
    
    var normalMatrix = mat3.create();
    this.gl.useProgram(this.point_shader.program);
    this.gl.uniformMatrix4fv(this.point_shader.uniforms.modelViewMatrix, false, modelViewMatrix);
    this.gl.uniformMatrix4fv(this.point_shader.uniforms.projectionMatrix, false, this.renderer.projectionMatrix);
    this.gl.uniform3f(this.point_shader.uniforms.COR, COR[0], COR[1], COR[2]);
    this.gl.uniform1f(this.point_shader.uniforms.focus, this.renderer.fogStart);
    this.gl.uniform1f(this.point_shader.uniforms.fogSpan, this.renderer.fogStart+(this.renderer.clearCut*2));
    
    this.gl.uniform1f(this.point_shader.uniforms.zFar, molmil.configBox.zFar);
    this.gl.uniform1f(this.point_shader.uniforms.zNear, molmil.configBox.zNear);    
    this.gl.uniform1i(this.point_shader.uniforms.textureMap, 0);
    
    this.gl.uniform1f(this.point_shader.uniforms.zInvDiff, 1./((1./molmil.configBox.zFar) - (1./molmil.configBox.zNear)));
    this.gl.uniform1f(this.point_shader.uniforms.zNearInv, 1./molmil.configBox.zNear); 
    
    
    this.gl.enable(this.gl.DEPTH_TEST);
   
    if (this.settings.uniform_color) this.gl.uniform3f(this.point_shader.uniforms.uniform_color, this.uniform_color[i][0]/255, this.uniform_color[i][1]/255, this.uniform_color[i][2]/255);
    
    if (this.renderer.settings.slab) {
      this.gl.uniform1f(this.point_shader.uniforms.slabNear, -modelViewMatrix[14]+this.renderer.settings.slabNear-molmil.configBox.zNear);
      this.gl.uniform1f(this.point_shader.uniforms.slabFar, -modelViewMatrix[14]+this.renderer.settings.slabFar-molmil.configBox.zNear);
    }
    
    this.gl.uniform4f(this.point_shader.uniforms.backgroundColor, molmil.configBox.BGCOLOR[0], molmil.configBox.BGCOLOR[1], molmil.configBox.BGCOLOR[2], 1.0);
  
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
    
    molmil.resetAttributes(this.gl);
    if (this.settings.has_ID) {
      molmil.bindAttribute(this.gl, this.point_attributes.in_Position, 3, this.gl.FLOAT, false, 28, 0);
      molmil.bindAttribute(this.gl, this.point_attributes.in_radius, 1, this.gl.FLOAT, false, 28, 12);
      molmil.bindAttribute(this.gl, this.point_attributes.in_Colour, 4, this.gl.UNSIGNED_BYTE, true, 28, 16);
      molmil.bindAttribute(this.gl, this.point_attributes.in_ScreenSpaceOffset, 2, this.gl.SHORT, false, 28, 20);
      //molmil.bindAttribute(this.gl, this.point_attributes.in_ID, 1, this.gl.FLOAT, false, 28, 24);
    }
    else {
      molmil.bindAttribute(this.gl, this.point_attributes.in_Position, 3, this.gl.FLOAT, false, 24, 0);
      molmil.bindAttribute(this.gl, this.point_attributes.in_radius, 1, this.gl.FLOAT, false, 24, 12);
      molmil.bindAttribute(this.gl, this.point_attributes.in_Colour, 4, this.gl.UNSIGNED_BYTE, true, 24, 16);
      molmil.bindAttribute(this.gl, this.point_attributes.in_ScreenSpaceOffset, 2, this.gl.SHORT, false, 24, 20);
    }
    molmil.clearAttributes(this.gl);
    
    

    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    
    if (this.angle) { // angle sucks, it only allows a maximum of 3M "vertices" to be drawn per call...
      var dv = 0, vtd;
      while ((vtd = Math.min(this.nElements-dv, 3000000)) > 0) {this.gl.drawElements(this.gl.TRIANGLES, vtd, gl.INDEXINT, dv*4); dv += vtd;}
    }
    else this.gl.drawElements(this.gl.TRIANGLES, this.nElements, gl.INDEXINT, 0);

  };
  
  program.wireframe_render = function(modelViewMatrix, COR, i) {
    if (! this.status) return;
    var normalMatrix = mat3.create();
    this.gl.useProgram(this.wireframe_shader.program);
    this.gl.uniformMatrix4fv(this.wireframe_shader.uniforms.modelViewMatrix, false, modelViewMatrix);
    this.gl.uniformMatrix4fv(this.wireframe_shader.uniforms.projectionMatrix, false, this.renderer.projectionMatrix);
    this.gl.uniform3f(this.wireframe_shader.uniforms.COR, COR[0], COR[1], COR[2]);
    this.gl.uniform1f(this.wireframe_shader.uniforms.focus, this.renderer.fogStart);
    this.gl.uniform1f(this.wireframe_shader.uniforms.fogSpan, this.renderer.fogStart+(this.renderer.clearCut*2));
    if (this.settings.uniform_color) this.gl.uniform3f(this.wireframe_shader.uniforms.uniform_color, this.uniform_color[i][0]/255, this.uniform_color[i][1]/255, this.uniform_color[i][2]/255);
    
    if (this.renderer.settings.slab) {
      this.gl.uniform1f(this.wireframe_shader.uniforms.slabNear, -modelViewMatrix[14]+this.renderer.settings.slabNear-molmil.configBox.zNear);
      this.gl.uniform1f(this.wireframe_shader.uniforms.slabFar, -modelViewMatrix[14]+this.renderer.settings.slabFar-molmil.configBox.zNear);
    }
    
    this.gl.uniform4f(this.wireframe_shader.uniforms.backgroundColor, molmil.configBox.BGCOLOR[0], molmil.configBox.BGCOLOR[1], molmil.configBox.BGCOLOR[2], 1.0);
  
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer); 

    molmil.resetAttributes(this.gl);
    if (this.settings.lines_render) {      
      if (this.settings.has_ID) {
        molmil.bindAttribute(this.gl, this.wireframe_attributes.in_Position, 3, this.gl.FLOAT, false, 20, 0);
        if (! this.settings.uniform_color) molmil.bindAttribute(this.gl, this.wireframe_attributes.in_Colour, 4, this.gl.UNSIGNED_BYTE, true, 20, 12);
        //molmil.bindAttribute(this.gl, this.wireframe_attributes.in_ID, 1, this.gl.FLOAT, false, 20, 16);
      }
      else {
        molmil.bindAttribute(this.gl, this.wireframe_attributes.in_Position, 3, this.gl.FLOAT, false, 16, 0);
        molmil.bindAttribute(this.gl, this.wireframe_attributes.in_Colour, 4, this.gl.UNSIGNED_BYTE, true, 16, 12);
      }
    }
    else {
      if (this.settings.has_ID) {
        molmil.bindAttribute(this.gl, this.wireframe_attributes.in_Position, 3, this.gl.FLOAT, false, 32, 0);
        //molmil.bindAttribute(this.gl, this.wireframe_attributes.in_Normal, 3, this.gl.FLOAT, false, 32, 12);
        molmil.bindAttribute(this.gl, this.wireframe_attributes.in_Colour, 4, this.gl.UNSIGNED_BYTE, true, 32, 24);
        //molmil.bindAttribute(this.gl, this.wireframe_attributes.in_ID, 1, this.gl.FLOAT, false, 32, 28);
      }
      else {
        molmil.bindAttribute(this.gl, this.wireframe_attributes.in_Position, 3, this.gl.FLOAT, false, 28, 0);
        //molmil.bindAttribute(this.gl, this.wireframe_attributes.in_Normal, 3, this.gl.FLOAT, false, 28, 12);
        molmil.bindAttribute(this.gl, this.wireframe_attributes.in_Colour, 4, this.gl.UNSIGNED_BYTE, true, 28, 24);
      }
    }
    molmil.clearAttributes(this.gl);
    
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

    if (this.angle) { // angle sucks, it only allows a maximum of 3M "vertices" to be drawn per call...
      var dv = 0, vtd;
      while ((vtd = Math.min(this.nElements-dv, 3000000)) > 0) {this.gl.drawElements(this.gl.LINES, vtd, gl.INDEXINT, dv*4); dv += vtd;}
    }
    else this.gl.drawElements(this.gl.LINES, this.nElements, gl.INDEXINT, 0);
  };
      
  program.standard_render = function(modelViewMatrix, COR, i) {
    if (! this.status) return;
    var normalMatrix = mat3.create();
    mat3.normalFromMat4(normalMatrix, modelViewMatrix);
      
    this.gl.useProgram(this.standard_shader.program);
    this.gl.uniformMatrix4fv(this.standard_shader.uniforms.modelViewMatrix, false, modelViewMatrix);
    this.gl.uniformMatrix3fv(this.standard_shader.uniforms.normalMatrix, false, normalMatrix);
    this.gl.uniformMatrix4fv(this.standard_shader.uniforms.projectionMatrix, false, this.renderer.projectionMatrix);
    this.gl.uniform3f(this.standard_shader.uniforms.COR, COR[0], COR[1], COR[2]);
    this.gl.uniform1f(this.standard_shader.uniforms.focus, this.renderer.fogStart);
    this.gl.uniform1f(this.standard_shader.uniforms.fogSpan, this.renderer.fogStart+(this.renderer.clearCut*2));
    if (this.settings.uniform_color) this.gl.uniform3f(this.standard_shader.uniforms.uniform_color, this.uniform_color[i][0]/255, this.uniform_color[i][1]/255, this.uniform_color[i][2]/255);
    
    this.gl.uniform4f(this.standard_shader.uniforms.backgroundColor, molmil.configBox.BGCOLOR[0], molmil.configBox.BGCOLOR[1], molmil.configBox.BGCOLOR[2], 1.0);
    if (this.renderer.settings.slab) {
      this.gl.uniform1f(this.standard_shader.uniforms.slabNear, -modelViewMatrix[14]+this.renderer.settings.slabNear-molmil.configBox.zNear);
      this.gl.uniform1f(this.standard_shader.uniforms.slabFar, -modelViewMatrix[14]+this.renderer.settings.slabFar-molmil.configBox.zNear);
    }
  
        
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer); 
    
    molmil.resetAttributes(this.gl);
    if (this.settings.has_ID) {
      molmil.bindAttribute(this.gl, this.standard_attributes.in_Position, 3, this.gl.FLOAT, false, 32, 0);
      molmil.bindAttribute(this.gl, this.standard_attributes.in_Normal, 3, this.gl.FLOAT, false, 32, 12);
      if (! this.settings.uniform_color) molmil.bindAttribute(this.gl, this.standard_attributes.in_Colour, 4, this.gl.UNSIGNED_BYTE, true, 32, 24);
      //molmil.bindAttribute(this.gl, this.standard_attributes.in_ID, 1, this.gl.FLOAT, false, 32, 28);
    }
    else {
      molmil.bindAttribute(this.gl, this.standard_attributes.in_Position, 3, this.gl.FLOAT, false, 28, 0);
      molmil.bindAttribute(this.gl, this.standard_attributes.in_Normal, 3, this.gl.FLOAT, false, 28, 12);
      molmil.bindAttribute(this.gl, this.standard_attributes.in_Colour, 4, this.gl.UNSIGNED_BYTE, true, 28, 24);
    }
    molmil.clearAttributes(this.gl);

    // in yasara only the "outside" is transparent, while the "inside" is opaque...

    if (this.settings.alphaMode) {
      if (molmil.configBox.cullFace) {this.gl.disable(this.gl.CULL_FACE);}
      this.gl.enable(this.gl.BLEND);
      this.gl.blendEquation(this.gl.FUNC_ADD); 
      this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
      this.gl.disable(this.gl.DEPTH);
    }
    
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        
    if (this.angle) { // angle sucks, it only allows a maximum of 3M "vertices" to be drawn per call...
      var dv = 0, vtd;
      while ((vtd = Math.min(this.nElements-dv, 3000000)) > 0) {this.gl.drawElements(this.gl.TRIANGLES, vtd, gl.INDEXINT, dv*4); dv += vtd;}
    }
    else this.gl.drawElements(this.gl.TRIANGLES, this.nElements, gl.INDEXINT, 0);
    
    if (this.settings.alphaMode) {
      if (molmil.configBox.cullFace) {this.gl.enable(this.gl.CULL_FACE);} 
      this.gl.disable(this.gl.BLEND);
      this.gl.enable(this.gl.DEPTH);
    }
    
  };

  if (! settings.multiMatrix) {
    if (settings.imposterPoints) program.render = program.point_render;
    else if (! settings.solid) program.render = program.wireframe_render;
    else program.render = program.standard_render;
  }
  else {
    program.render = function(modelViewMatrix, COR) {
      var mat = mat4.create();
      for (var i=0; i<this.matrices.length; i++) {
        mat4.multiply(mat, modelViewMatrix, this.matrices[i]);
        this.render_internal(mat, COR, i);
      }
    };
    if (! settings.solid) {program.render_internal = program.wireframe_render; program.shader = program.wireframe_shader;}
    else {program.render_internal = program.standard_render; program.shader = program.standard_shader;}
  }

  if (settings.has_ID) {
    if (settings.lines_render) {
      
      program.pickingShader = renderer.shaders.linesPicking;
      program.pickingAttributes = renderer.shaders.linesPicking.attributes;
      
      program.renderPicking = function(modelViewMatrix, COR) {
        if (! this.status) return;
        this.gl.useProgram(this.pickingShader.program);
        this.gl.uniformMatrix4fv(this.pickingShader.uniforms.modelViewMatrix, false, modelViewMatrix);
        this.gl.uniformMatrix4fv(this.pickingShader.uniforms.projectionMatrix, false, this.renderer.projectionMatrix);
        this.gl.uniform3f(this.pickingShader.uniforms.COR, COR[0], COR[1], COR[2]);
      
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
        
        molmil.resetAttributes(this.gl);
        molmil.bindAttribute(this.gl, this.pickingAttributes.in_Position, 3, this.gl.FLOAT, false, 20, 0);
        molmil.bindAttribute(this.gl, this.pickingAttributes.in_ID, 1, this.gl.FLOAT, false, 20, 16);
        molmil.clearAttributes(this.gl);

        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        if (this.angle) { // angle sucks, it only allows a maximum of 3M "vertices" to be drawn per call...
          var dv = 0, vtd;
          while ((vtd = Math.min(this.nElements-dv, 3000000)) > 0) {this.gl.drawElements(this.gl.POINTS, vtd, gl.INDEXINT, dv*4); dv += vtd;}
        }
        else this.gl.drawElements(this.gl.POINTS, this.nElements, gl.INDEXINT, 0);
      };
    }
    else {
      program.pickingShader = renderer.shaders.picking;
      program.pickingAttributes = renderer.shaders.picking.attributes;
      
      program.renderPicking = function(modelViewMatrix, COR) {
        if (! this.status) return;
        this.gl.useProgram(this.pickingShader.program);
        this.gl.uniformMatrix4fv(this.pickingShader.uniforms.modelViewMatrix, false, modelViewMatrix);
        this.gl.uniformMatrix4fv(this.pickingShader.uniforms.projectionMatrix, false, this.renderer.projectionMatrix);
        this.gl.uniform3f(this.pickingShader.uniforms.COR, COR[0], COR[1], COR[2]);
      
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);

        molmil.resetAttributes(this.gl);
        molmil.bindAttribute(this.gl, this.pickingAttributes.in_Position, 3, this.gl.FLOAT, false, 32, 0);
        molmil.bindAttribute(this.gl, this.pickingAttributes.in_ID, 1, this.gl.FLOAT, false, 32, 28);
        molmil.clearAttributes(this.gl);
      
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        if (this.angle) { // angle sucks, it only allows a maximum of 3M "vertices" to be drawn per call...
          var dv = 0, vtd;
          while ((vtd = Math.min(this.nElements-dv, 3000000)) > 0) {this.gl.drawElements(this.gl.TRIANGLES, vtd, gl.INDEXINT, dv*4); dv += vtd;}
        }
        else this.gl.drawElements(this.gl.TRIANGLES, this.nElements, gl.INDEXINT, 0);
      };
      
      
    }
  }
  else program.renderPicking = function() {};

  return program;
};

// ** creates and registers the programs within the renderer object **
molmil.geometry.registerPrograms = function(renderer)  {
  if (! renderer.program1) {
    renderer.program1 = this.build_simple_render_program(null, null, renderer, {has_ID: true, solid: true});
    renderer.programs.push(renderer.program1);
  }
  if (! renderer.program2) {
    renderer.program2 = this.build_simple_render_program(null, null, renderer, {has_ID: true, lines_render: true});
    renderer.programs.push(renderer.program2);
  }
  if (! renderer.program3) {
    renderer.program3 = this.build_simple_render_program(null, null, renderer, {has_ID: true, solid: true});
    renderer.programs.push(renderer.program3);
  }
  if (! renderer.program4) {
    renderer.program4 = this.build_simple_render_program(null, null, renderer, {has_ID: false, solid: true});
    renderer.programs.push(renderer.program4);
  }
  
  if (molmil.configBox.EXT_frag_depth) {
  
    if (! renderer.program5) {
      renderer.program5 = this.build_simple_render_program(null, null, renderer, {has_ID: true, imposterPoints: true});
      renderer.programs.push(renderer.program5);
    }
    renderer.program5.setBuffers(this.buffer5.vertexBuffer, this.buffer5.indexBuffer);
  }
  
  renderer.program1.setBuffers(this.buffer1.vertexBuffer, this.buffer1.indexBuffer);
  renderer.program2.setBuffers(this.buffer2.vertexBuffer, this.buffer2.indexBuffer);
  renderer.program3.setBuffers(this.buffer3.vertexBuffer, this.buffer3.indexBuffer);
  renderer.program4.setBuffers(this.buffer4.vertexBuffer, this.buffer4.indexBuffer);
  
  if (molmil.configBox.liteMode) molmil.geometry.reset();
  
}

// ** resets all geometry related buffered data **

molmil.geometry.reset = function() {
  this.atoms2draw = [];
  this.wfatoms2draw = [];
  this.trace = [];
  this.bonds2draw = [];
  this.lines2draw = [];
  this.bondRef = {};
  
  this.buffer1 = {vP: 0, iP: 0}; // atoms & bonds
  this.buffer2 = {vP: 0, iP: 0}; // wireframe
  this.buffer3 = {vP: 0, iP: 0}; // cartoon
  this.buffer4 = {vP: 0, iP: 0}; // surfaces
  this.buffer5 = {vP: 0, iP: 0}; // points
}

// ** calculates and initiates buffer sizes **
molmil.geometry.initChains = function(chains, render, detail_or) {
  detail_or = detail_or || 0;

  var chain, a, b;
  
  var atoms2draw = this.atoms2draw; var wfatoms2draw = this.wfatoms2draw;
  
  var bonds2draw = this.bonds2draw; var lines2draw = this.lines2draw; var bondRef = this.bondRef;
  
  var nor = 0, nob = 0, stat;
  
  for (var c=0; c<chains.length; c++) {
    chain = chains[c]; stat = false;
    if (! chain.display) continue;
    //chain.displayMode = 3; //////////!!!!!!!!!!!!
    
    
    
    for (var a=0; a<chain.atoms.length; a++) {
      if (chain.atoms[a].displayMode == 0 || ! chain.atoms[a].display) continue; // don't display
      else if (chain.atoms[a].displayMode == 4) wfatoms2draw.push(chain.atoms[a]); // wireframe (for wireframe use gl_lines)
      else atoms2draw.push(chain.atoms[a]);
      stat = true;
    }
    
    if (stat && ! chain.bondsOK) render.soup.buildBondList(chain, false);
    
    for (var b=0; b<chain.bonds.length; b++) {
      if (chain.bonds[b][0].displayMode < 2 || chain.bonds[b][1].displayMode < 2 || ! chain.bonds[b][0].display || ! chain.bonds[b][1].display) continue;
      if (chain.bonds[b][0].displayMode == 4 || chain.bonds[b][1].displayMode == 4) lines2draw.push(chain.bonds[b]);
      else {
        bonds2draw.push(chain.bonds[b]);
        nob += chain.bonds[b][2]*2;
        if (! bondRef.hasOwnProperty(chain.bonds[b][0].AID)) bondRef[chain.bonds[b][0].AID] = [];
        if (! bondRef.hasOwnProperty(chain.bonds[b][1].AID)) bondRef[chain.bonds[b][1].AID] = [];
        bondRef[chain.bonds[b][0].AID].push(chain.bonds[b][1]);
        bondRef[chain.bonds[b][1].AID].push(chain.bonds[b][0]);
      }
    }
    
    if (chain.displayMode == 1) {
      if (! chain.bondsOK) render.soup.buildBondList(chain, false);
      for (var m=0; m<chain.molecules.length; m++) {
        if (chain.molecules[m].CA) {
          if (chain.molecules[m].next && chain.molecules[m].next.displayMode == 1 && chain.molecules[m].next.CA) {
            atoms2draw.push(chain.molecules[m].CA);
            bonds2draw.push([chain.molecules[m].CA, chain.molecules[m].next.CA]);
            nob += 2;
          }
          else if (chain.molecules[m].previous && chain.molecules[m].previous.displayMode == 1 && chain.molecules[m].previous.CA) atoms2draw.push(chain.molecules[m].CA);
        }
      }
    }
    
    if (chain.displayMode > 1 && (chain.displayMode != molmil.displayMode_ChainSurfaceCG || chain.displayMode != molmil.displayMode_ChainSurfaceSimple)) {
      if (! chain.twoDcache || this.reInitChains) molmil.prepare2DRepr(chain, this.modelId || 0);
      nor += chain.molecules.length;
    }    
  }

  this.reInitChains = false;
  
  var detail_lv = molmil.configBox.QLV_SETTINGS[render.QLV].SPHERE_TESS_LV;
  var CB_NOI = molmil.configBox.QLV_SETTINGS[render.QLV].CB_NOI;
  var CB_NOVPR = molmil.configBox.QLV_SETTINGS[render.QLV].CB_NOVPR;
  
  
  if (molmil.configBox.EXT_frag_depth) {
    var vs = 0;
  }
  else {
    var vs = atoms2draw.length*(6*Math.pow(4, detail_lv+1));
  }

  vs += bonds2draw.length*(detail_lv+1)*4*2;
  vs += nor*CB_NOI*CB_NOVPR;

  if (vs > 1e7) detail_lv -= 1;
  if (vs > 3e7) detail_lv -= 1;
  if (vs > 1e8) detail_lv -= 1;
  if (vs < 2.5e5 && detail_lv < 3) detail_lv += 1;
  
  //detail_lv = 1;
  detail_lv = this.detail_lv = Math.max(detail_lv+detail_or, 0);
  if (molmil.configBox.liteMode) detail_lv = this.detail_lv = 1;
  
  // use a separate detail lv for atoms in case of < 250 atoms --> higher quality
  
  this.noi = molmil.configBox.QLV_SETTINGS[this.detail_lv].CB_NOI; // number of interpolation points per residue
  this.novpr = molmil.configBox.QLV_SETTINGS[this.detail_lv].CB_NOVPR;
  if (molmil.configBox.liteMode) this.noi = 1;
  
  
  var buffer1 = this.buffer1, buffer2 = this.buffer2;
  
  var vs = 0, is = 0;
  
  if (molmil.configBox.EXT_frag_depth) {
    this.buffer5.vertexBuffer = new Float32Array(atoms2draw.length*4*7); // x, y, z, r, ss_offset (4x gl.BYTE), rgba, aid
    if (molmil.configBox.OES_element_index_uint) this.buffer5.indexBuffer = new Uint32Array(atoms2draw.length*6);
    else this.buffer5.indexBuffer = new Uint16Array(atoms2draw.length*4);
  }
  else {
    var sphere = this.getSphere(1, detail_lv);
    vs += (sphere.vertices.length/3)*atoms2draw.length;
    is += sphere.indices.length*atoms2draw.length;
  }
  
  var cylinder = this.getCylinder(detail_lv);
  vs += (cylinder.vertices.length/3)*nob;
  is += cylinder.indices.length*nob;
  
  buffer1.vertexBuffer = new Float32Array(vs*8); // x, y, z, nx, ny, nz, rgba, aid
  buffer1.vertexBuffer8 = new Uint8Array(buffer1.vertexBuffer.buffer);
  if (molmil.configBox.OES_element_index_uint) buffer1.indexBuffer = new Uint32Array(is);
  else buffer1.indexBuffer = new Uint16Array(is);
  
  buffer2.vertexBuffer = new Float32Array(wfatoms2draw.length*5); // x, y, z, r, rgba, aid
  buffer2.vertexBuffer8 = new Uint8Array(buffer2.vertexBuffer.buffer);
  if (molmil.configBox.OES_element_index_uint) buffer2.indexBuffer = new Uint32Array(lines2draw.length*2);
  else buffer2.indexBuffer = new Uint16Array(lines2draw.length*2);
};

// ** builds a cartoon representation **
molmil.geometry.initCartoon = function(chains) {
  var c, chain, b, vs=0, is=0, currentBlock, nor=0, cartoonChains = this.cartoonChains = [], nowp, nowps = this.nowps = [];
  
  var noi = this.noi;
  var novpr = this.novpr;
  
  if (this.dome[2] != this.detail_lv) {
    var dome = this.dome = [molmil.buildOctaDome(molmil.configBox.QLV_SETTINGS[this.detail_lv].CB_DOME_TESS_LV, 0), molmil.buildOctaDome(molmil.configBox.QLV_SETTINGS[this.detail_lv].CB_DOME_TESS_LV, 1), this.detail_lv];
    var fixMat = mat4.create(); 
    mat4.rotateZ(fixMat, fixMat, (45*Math.PI)/180);
    for (var i=0; i<this.dome[0].vertices.length; i++) {
      vec3.transformMat4(this.dome[0].vertices[i], this.dome[0].vertices[i], fixMat);
      vec3.transformMat4(this.dome[1].vertices[i], this.dome[1].vertices[i], fixMat);
    }
    var ringTemplate = this.ringTemplate = [];
  
    var nop = novpr, theta = 0.0, rad = 2.0/nop, x, y, p, dij;
    for (p=0; p<nop; p++) {
      x = Math.cos(theta*Math.PI);
      y = Math.sin(theta*Math.PI);
      ringTemplate.push([x, y, 0]);
      theta += rad;
    }
  
    this.squareVertices = [
      [-1,  1, 0],
      [ 1,  1, 0],
      [ 1, -1, 0],
      [-1, -1, 0],
      [-1,  1, 0] // cheat
    ];
    
    this.squareVerticesN = [
      [-1,  0, 0],
      [ 0,  1, 0],
      [ 1,  0, 0],
      [ 0, -1, 0],
      [-1,  0, 0] // cheat
    ];
    
  }
  else {
    var dome = this.dome;
  }
  
  for (c=0; c<chains.length; c++) {
    
    chain = chains[c];
    if (chain.displayMode < 2 || chain.displayMode == molmil.displayMode_ChainSurfaceCG || chain.displayMode == molmil.displayMode_ChainSurfaceSimple) continue;
    nowp = 0;
    cartoonChains.push(chain);

    for (b=0; b<chain.twoDcache.length; b++) {
      currentBlock = chain.twoDcache[b];

      if (chain.displayMode > 2 && currentBlock.sndStruc == 2) { // sheet
      
        if (! currentBlock.isFirst) { // N-cap
          vs += novpr;
          is += novpr*2;
        }
        vs += 4 + (currentBlock.molecules.length*8*(noi+1)) + 8 + novpr; // open + body + arrow-heads'back + close
        is += 2 + (currentBlock.molecules.length*8*(noi+1)) + (novpr*2);
        if (! currentBlock.isLast) vs += novpr; // next loop start
        
        nowp += currentBlock.molecules.length*(noi+1);
        if (currentBlock.isLast) nowp -= noi;
      }
      else if (currentBlock.rocket) { // cylinder
        if (currentBlock.skip) continue;
        // for cylinders, there are no molecules, but waypoints instead...

        // something is still going wrong somewhere (maybe the connection points between cylinders and loops???)

        vs += novpr+1 + (currentBlock.waypoints.length*novpr) + novpr+1;
        is += novpr + (currentBlock.waypoints.length*novpr*2) + novpr;

        if (! currentBlock.isFirst) {
          vs += novpr*(Math.round(noi*.5)+1);
          is += novpr*2*(Math.round(noi*.5)+1);
        }
        
        if (! currentBlock.isLast) {
          vs += novpr; // next loop start
          vs += novpr*(Math.round(noi*.5)+2);
          is += novpr*2*(Math.round(noi*.5)+2);
        }
        
        nowp += currentBlock.molecules.length*(noi+1);
        
      }
      else { // helix/loop
        if (currentBlock.isFirst) {vs += dome[0].vertices.length; is += dome[0].faces.length-(novpr*2);} // N-term cap
        if (currentBlock.isLast) {vs += dome[0].vertices.length + novpr; is += dome[0].faces.length+(novpr*2);} // C-term cap
        vs += currentBlock.molecules.length*novpr*(noi+1);
        is += currentBlock.molecules.length*novpr*2*(noi+1);
        
        nowp += currentBlock.molecules.length*(noi+1);
        
        if (currentBlock.isLast) {
          nowp -= noi;
          vs -= novpr*(noi+1);
          is -= novpr*2*(noi+1);
        }
      }
    }
    nowps.push(nowp);
  }
  
  var buffer3 = this.buffer3;
  buffer3.vertexBuffer = new Float32Array(vs*8); // x, y, z, nx, ny, nz, rgba, aid
  buffer3.vertexBuffer8 = new Uint8Array(buffer3.vertexBuffer.buffer);
  if (molmil.configBox.OES_element_index_uint) buffer3.indexBuffer = new Uint32Array(is*3);
  else buffer3.indexBuffer = new Uint16Array(is*3);
};

molmil.geometry.generateAtomsImposters = function() {
  var atoms2draw = this.atoms2draw, vdwR = molmil.configBox.vdwR, r, sphere, a, v, rgba
  vBuffer = this.buffer5.vertexBuffer, vP = this.buffer5.vP, iP = this.buffer5.iP,
  vP8 = vP*4, vP16 = vP*2;
  
  var vBuffer8 = new Uint8Array(this.buffer5.vertexBuffer.buffer);
  var vBuffer16 = new Uint16Array(this.buffer5.vertexBuffer.buffer);
  
  var iBuffer = this.buffer5.indexBuffer;

  var mdl = this.modelId || 0, tmp;

  var x, y, z, n;
  
  var ssOffset = [[-1, +1], [+1, +1], [+1, -1], [-1, -1]];

  
  var p = vP/7;
  
  for (a=0; a<atoms2draw.length; a++) {
    if (atoms2draw[a].displayMode == 1) r = molmil_dep.getKeyFromObject(vdwR, atoms2draw[a].element, vdwR.DUMMY);
    else if (atoms2draw[a].displayMode == 2) r = .33;
    else r = .15;

    tmp = mdl;
    if (atoms2draw[a].chain.modelsXYZ.length <= mdl) mdl = 0;
    
    x = atoms2draw[a].chain.modelsXYZ[mdl][atoms2draw[a].xyz];
    y = atoms2draw[a].chain.modelsXYZ[mdl][atoms2draw[a].xyz+1];
    z = atoms2draw[a].chain.modelsXYZ[mdl][atoms2draw[a].xyz+2];
    rgba = atoms2draw[a].rgba;
    
    for (n=0; n<4; n++) {
      vBuffer[vP++] = x;
      vBuffer[vP++] = y;
      vBuffer[vP++] = z;
      vBuffer[vP++] = r;
    
      vBuffer8[vP8+16] = rgba[0];
      vBuffer8[vP8+17] = rgba[1];
      vBuffer8[vP8+18] = rgba[2];
      vBuffer8[vP8+19] = rgba[3];
      vP++
      
      vBuffer16[vP16+10] = ssOffset[n][0];
      vBuffer16[vP16+11] = ssOffset[n][1];      
      vP++
    
      vBuffer[vP++] = atoms2draw[a].AID; // ID
      vP8 += 28; vP16 += 14;
    }
    
    iBuffer[iP++] = 3+p;
    iBuffer[iP++] = 2+p;
    iBuffer[iP++] = 1+p;
    iBuffer[iP++] = 3+p;
    iBuffer[iP++] = 1+p;
    iBuffer[iP++] = 0+p;
    p += 4;
  }

  this.buffer5.vP = vP;
  this.buffer5.iP = iP;
};

// ** build atoms representation (spheres) **
molmil.geometry.generateAtoms = function() {
  var atoms2draw = this.atoms2draw, vdwR = molmil.configBox.vdwR, r, sphere, a, v, rgba
  vBuffer = this.buffer1.vertexBuffer, iBuffer = this.buffer1.indexBuffer, vP = this.buffer1.vP, iP = this.buffer1.iP, detail_lv = this.detail_lv,
  vBuffer8 = this.buffer1.vertexBuffer8, vP8 = vP*4;
    
    
  var p = vP/8;
  
  var mdl = this.modelId || 0, tmp;

  var x, y, z;
  
  sphere = this.getSphere(1.7, detail_lv);
  var nov = sphere.vertices.length/3;
  
  for (a=0; a<atoms2draw.length; a++) {
    if (atoms2draw[a].displayMode == 1) r = molmil_dep.getKeyFromObject(vdwR, atoms2draw[a].element, vdwR.DUMMY);
    else if (atoms2draw[a].displayMode == 2) r = .33;
    else r = .15;
  
    sphere = this.getSphere(r, detail_lv);
  
    for (v=0; v<sphere.indices.length; v++, iP++) iBuffer[iP] = sphere.indices[v]+p;
    
    tmp = mdl;
    if (atoms2draw[a].chain.modelsXYZ.length <= mdl) mdl = 0;
    
    x = atoms2draw[a].chain.modelsXYZ[mdl][atoms2draw[a].xyz];
    y = atoms2draw[a].chain.modelsXYZ[mdl][atoms2draw[a].xyz+1];
    z = atoms2draw[a].chain.modelsXYZ[mdl][atoms2draw[a].xyz+2];
    rgba = atoms2draw[a].rgba;
    
    for (v=0; v<sphere.vertices.length; v+=3, vP8+=32) {
      vBuffer[vP++] = sphere.vertices[v]+x;
      vBuffer[vP++] = sphere.vertices[v+1]+y;
      vBuffer[vP++] = sphere.vertices[v+2]+z;
    
      vBuffer[vP++] = sphere.normals[v];
      vBuffer[vP++] = sphere.normals[v+1];
      vBuffer[vP++] = sphere.normals[v+2];

      vBuffer8[vP8+24] = rgba[0];
      vBuffer8[vP8+25] = rgba[1];
      vBuffer8[vP8+26] = rgba[2];
      vBuffer8[vP8+27] = rgba[3];
      vP++
      
      vBuffer[vP++] = atoms2draw[a].AID; // ID
    }
    p += nov;
  }
  
  this.buffer1.vP = vP;
  this.buffer1.iP = iP;
};

// ** build bond representation (cylinders) **
molmil.geometry.generateBonds = function() {
  var cylinder = this.getCylinder(this.detail_lv);

  var mdl = this.modelId || 0, tmp;
  var bonds2draw = this.bonds2draw,
  vBuffer = this.buffer1.vertexBuffer, iBuffer = this.buffer1.indexBuffer, vP = this.buffer1.vP, iP = this.buffer1.iP, detail_lv = this.detail_lv,
  vBuffer8 = this.buffer1.vertexBuffer8, vP8 = vP*4;
  
  var nov = cylinder.vertices.length / 3;
  
  var r, offsetX, offsetY, offsetZ, v1=[0,0,0], v2=[0,0,0], c1=[0,0,0];
  
  var p = vP/8, x, y, z, x2, y2, z2, m, rgba;
  
  var rotationMatrix = mat4.create();
  var vertex = [0, 0, 0, 0], normal = [0, 0, 0, 0], dx, dy, dz, dij, angle;
  
  //bonds
  for (b=0; b<bonds2draw.length; b++) {
    m = bonds2draw[b][2] == 2 ? 4 : 2;
    
    tmp = mdl;
    if (bonds2draw[b][0].chain.modelsXYZ.length <= mdl) mdl = 0;
    
    x = bonds2draw[b][0].chain.modelsXYZ[mdl][bonds2draw[b][0].xyz];
    y = bonds2draw[b][0].chain.modelsXYZ[mdl][bonds2draw[b][0].xyz+1];
    z = bonds2draw[b][0].chain.modelsXYZ[mdl][bonds2draw[b][0].xyz+2];
    
    x2 = bonds2draw[b][1].chain.modelsXYZ[mdl][bonds2draw[b][1].xyz];
    y2 = bonds2draw[b][1].chain.modelsXYZ[mdl][bonds2draw[b][1].xyz+1];
    z2 = bonds2draw[b][1].chain.modelsXYZ[mdl][bonds2draw[b][1].xyz+2];
    
    dx = x-x2;
    dy = y-y2;
    dz = z-z2;
    dij = Math.sqrt((dx*dx) + (dy*dy) + (dz*dz));
    
    dx /= dij; dy /= dij; dz /= dij;
    angle = Math.acos(-dz);

    
    mat4.identity(rotationMatrix);
    mat4.rotate(rotationMatrix, rotationMatrix, angle, [dy, -dx, 0.0]);
    
    r = .15;
    offsetX = 0;
    offsetY = 0;
    offsetZ = 0;

    if (bonds2draw[b][2] == 2) {
      r = .075;
      offsetX = -.075;
    }
    rgba = bonds2draw[b][0].rgba;
    
    for (v=0; v<cylinder.indices.length; v++, iP++) iBuffer[iP] = cylinder.indices[v]+p; // a2
    for (v=0; v<cylinder.vertices.length; v+=3, vP8+=32) {
      vec3.transformMat4(vertex, [(cylinder.vertices[v]*r)+offsetX, (cylinder.vertices[v+1]*r)+offsetY, (cylinder.vertices[v+2]+offsetZ)*dij], rotationMatrix);
      vec3.transformMat4(normal, [cylinder.normals[v], cylinder.normals[v+1], cylinder.normals[v+2]], rotationMatrix);
      
      vBuffer[vP++] = vertex[0]+x;
      vBuffer[vP++] = vertex[1]+y;
      vBuffer[vP++] = vertex[2]+z;
    
      vBuffer[vP++] = normal[0];
      vBuffer[vP++] = normal[1];
      vBuffer[vP++] = normal[2];
    
      vBuffer8[vP8+24] = rgba[0];
      vBuffer8[vP8+25] = rgba[1];
      vBuffer8[vP8+26] = rgba[2];
      vBuffer8[vP8+27] = rgba[3];
      vP++
      
      vBuffer[vP++] = 0; // ID
    } 
    
    p += nov;

    offsetZ += .5;
    rgba = bonds2draw[b][1].rgba;
    
    
    for (v=0; v<cylinder.indices.length; v++, iP++) iBuffer[iP] = cylinder.indices[v]+p; // a2
    
    for (v=0; v<cylinder.vertices.length; v+=3, vP8+=32) {
      vec3.transformMat4(vertex, [(cylinder.vertices[v]*r)+offsetX, (cylinder.vertices[v+1]*r)+offsetY, (cylinder.vertices[v+2]+offsetZ)*dij], rotationMatrix);
      vec3.transformMat4(normal, [cylinder.normals[v], cylinder.normals[v+1], cylinder.normals[v+2]], rotationMatrix);
      
      vBuffer[vP++] = vertex[0]+x;
      vBuffer[vP++] = vertex[1]+y;
      vBuffer[vP++] = vertex[2]+z;
    
      vBuffer[vP++] = normal[0];
      vBuffer[vP++] = normal[1];
      vBuffer[vP++] = normal[2];
    
      vBuffer8[vP8+24] = rgba[0];
      vBuffer8[vP8+25] = rgba[1];
      vBuffer8[vP8+26] = rgba[2];
      vBuffer8[vP8+27] = rgba[3];
      vP++
      
      vBuffer[vP++] = 0; // ID
    } 
    
    p += nov;
    
    
    if (bonds2draw[b][2] == 2) {
      r = .075;
      offsetX = .075;
      offsetZ = 0;
      rgba = bonds2draw[b][0].rgba;
      
      for (v=0; v<cylinder.indices.length; v++, iP++) iBuffer[iP] = cylinder.indices[v]+p; // a2
    
      for (v=0; v<cylinder.vertices.length; v+=3, vP8+=32) {
        vec3.transformMat4(vertex, [(cylinder.vertices[v]*r)+offsetX, (cylinder.vertices[v+1]*r)+offsetY, (cylinder.vertices[v+2]+offsetZ)*dij], rotationMatrix);
        vec3.transformMat4(normal, [cylinder.normals[v], cylinder.normals[v+1], cylinder.normals[v+2]], rotationMatrix);
      
        vBuffer[vP++] = vertex[0]+x;
        vBuffer[vP++] = vertex[1]+y;
        vBuffer[vP++] = vertex[2]+z;
    
        vBuffer[vP++] = normal[0];
        vBuffer[vP++] = normal[1];
        vBuffer[vP++] = normal[2];
    
        vBuffer8[vP8+24] = rgba[0];
        vBuffer8[vP8+25] = rgba[1];
        vBuffer8[vP8+26] = rgba[2];
        vBuffer8[vP8+27] = rgba[3];
        vP++
      
        vBuffer[vP++] = 0; // ID
      } 
    
      p += nov;

      
      offsetZ += .5;
      rgba = bonds2draw[b][1].rgba;
      
      
      for (v=0; v<cylinder.indices.length; v++, iP++) iBuffer[iP] = cylinder.indices[v]+p; // a2
    
      for (v=0; v<cylinder.vertices.length; v+=3, vP8+=32) {
        vec3.transformMat4(vertex, [(cylinder.vertices[v]*r)+offsetX, (cylinder.vertices[v+1]*r)+offsetY, (cylinder.vertices[v+2]+offsetZ)*dij], rotationMatrix);
        vec3.transformMat4(normal, [cylinder.normals[v], cylinder.normals[v+1], cylinder.normals[v+2]], rotationMatrix);
      
        vBuffer[vP++] = vertex[0]+x;
        vBuffer[vP++] = vertex[1]+y;
        vBuffer[vP++] = vertex[2]+z;
    
        vBuffer[vP++] = normal[0];
        vBuffer[vP++] = normal[1];
        vBuffer[vP++] = normal[2];
    
        vBuffer8[vP8+24] = rgba[0];
        vBuffer8[vP8+25] = rgba[1];
        vBuffer8[vP8+26] = rgba[2];
        vBuffer8[vP8+27] = rgba[3];
        vP++
      
        vBuffer[vP++] = 0; // ID
      } 
    
      p += nov;
  
    }
    
  }

  this.buffer1.vP = vP;
  this.buffer1.iP = iP;

};

// ** build wireframe representation **
molmil.geometry.generateWireframe = function() {
  var wfatoms2draw = this.wfatoms2draw, lines2draw = this.lines2draw, a,
  vBuffer = this.buffer2.vertexBuffer, iBuffer = this.buffer2.indexBuffer, vP = this.buffer2.vP, iP = this.buffer2.iP,
  vBuffer8 = this.buffer2.vertexBuffer8, vP8 = vP*4;

  var shf = 0.5;
  
  var p = vP/5;
  var wfatomsRef = {};
  var mdl = this.modelId || 0;
  
  for (var a=0; a<wfatoms2draw.length; a++, p++, vP8+=20) {
    wfatomsRef[wfatoms2draw[a].AID] = p;
    vBuffer[vP++] = wfatoms2draw[a].chain.modelsXYZ[mdl][wfatoms2draw[a].xyz];
    vBuffer[vP++] = wfatoms2draw[a].chain.modelsXYZ[mdl][wfatoms2draw[a].xyz+1];
    vBuffer[vP++] = wfatoms2draw[a].chain.modelsXYZ[mdl][wfatoms2draw[a].xyz+2];
   
    vBuffer8[vP8+12] = wfatoms2draw[a].rgba[0];
    vBuffer8[vP8+13] = wfatoms2draw[a].rgba[1];
    vBuffer8[vP8+14] = wfatoms2draw[a].rgba[2];
    vBuffer8[vP8+16] = wfatoms2draw[a].rgba[3];
    vP++
    
    vBuffer[vP++] = wfatoms2draw[a].AID;
  }

  for (var b=0; b<lines2draw.length; b++) {
    iBuffer[iP++] = wfatomsRef[lines2draw[b][0].AID];
    iBuffer[iP++] = wfatomsRef[lines2draw[b][1].AID];
  }

  this.buffer2.vP = vP;
  this.buffer2.iP = iP;  
};

// ** build coarse surface representation **
molmil.geometry.generateSurfaces = function(chains, soup) {
  
  var c, surf, surfaces = [], surfaces2 = [], verts = 0, idcs = 0, settings;
  
  for (c=0; c<chains.length; c++) {
    if (chains[c].displayMode == molmil.displayMode_ChainSurfaceCG) {
      if (chains[c].HQsurface) surf = molmil.coarseSurface(chains[c], molmil.configBox.HQsurface_gridSpacing, 1.4);
      else surf = molmil.coarseSurface(chains[c], 7.5, 7.5*.75, {deproj: true});
      surf.rgba = chains[c].rgba;
      surfaces.push(surf);
      verts += surf.vertices.length;
      idcs += surf.faces.length*3;
    }
    else if (chains[c].displayMode == molmil.displayMode_ChainSurfaceSimple) {
      settings = chains[c].displaySettings || {};
      settings.skipProgram = true;
      surf = molmil.tubeSurface(chains[c], settings, soup);
      verts += surf.vBuffer.length;
      idcs += surf.iBuffer.length;
      surf.rgba = chains[c].rgba;
      surfaces2.push(surf);
    }
  }

  var vertices = new Float32Array(verts*7); // x, y, z, nx, ny, nz, rgba
  var vertices8 = new Uint8Array(vertices.buffer);
  var indices = new Uint32Array(idcs);
  var m=0, m8=0, s, rgba, offset = 0, i=0;
  for (s=0; s<surfaces.length; s++) {
    surf = surfaces[s]; rgba = surf.rgba;
    for (c=0; c<surf.vertices.length; c++, m8 += 28) {
      vertices[m++] = surf.vertices[c][0];
      vertices[m++] = surf.vertices[c][1];
      vertices[m++] = surf.vertices[c][2];
            
      vertices[m++] = surf.normals[c][0];
      vertices[m++] = surf.normals[c][1];
      vertices[m++] = surf.normals[c][2];
            
            
      vertices8[m8+24] = rgba[0];
      vertices8[m8+25] = rgba[1];
      vertices8[m8+26] = rgba[2];
      vertices8[m8+27] = rgba[3];
      m++; // color
    }
          
    for (c=0; c<surf.faces.length; c++) {
      indices[i++] = surf.faces[c][0]+offset; indices[i++] = surf.faces[c][1]+offset; indices[i++] = surf.faces[c][2]+offset;
    }
    offset += surf.vertices.length;
  }
  
  
  
  for (s=0; s<surfaces2.length; s++) {
    surf = surfaces2[s];
    
    vertices.set(surf.vBuffer, m);
    m += surf.vBuffer.length;
    m8 += surf.vBuffer.length*4;
    
    for (c=0; c<surf.iBuffer.length; c++) indices[i++] = surf.iBuffer[c]+offset;
    
    offset += surf.vBuffer.length/7;
  }
  
  var buffer4 = this.buffer4;
  buffer4.vertexBuffer = vertices;
  buffer4.vertexBuffer8 = vertices8;
  buffer4.indexBuffer = indices;
}

// ** build cartoon representation **
molmil.geometry.generateCartoon = function() {
  var chains = this.cartoonChains, c, b, b2, m, line, tangents, binormals, normals, rgba, aid, ref, i, TG, BN, N, t = 0, normal, binormal, vec = [0, 0, 0], delta = 0.0001, t_ranges;
  var noi = this.noi;
  var novpr = this.novpr;
  
  var nowp, wp, tmp, rotationMatrix;
  
  // in the future speed this up a bit by using a line[idx]/tangents[idx] instead of .push()

  var int_ratio = [];
  for (i=0; i<noi+1; i++) int_ratio.push(i/(noi+1));
  for (c=0; c<chains.length; c++) {
    nowp = this.nowps[c]; wp = 0;
    tangents = [], binormals = [], normals = [], rgba = new Array(nowp), aid = new Float32Array(nowp);
    chain = chains[c]; line = []; BNs = []; t_ranges = [];
    if (chain.displayMode == 0) continue;
    
    for (b=0; b<chain.twoDcache.length; b++) {
      t_ranges.push(line.length);
      currentBlock = chain.twoDcache[b];
      if (currentBlock.rocket) { // cylinder
        if (currentBlock.skip) continue;
        
        currentBlock.rocketPre = 0;
        currentBlock.rocketPost = 0;
        
        if (! currentBlock.isFirst) {
          currentBlock.rocketPre = Math.round(noi*.5)+2;
          molmil.hermiteInterpolate(chain.twoDcache[b-1].xyz[m], currentBlock.waypoints[0], chain.twoDcache[b-1].tangents[m], currentBlock.waypoint_tangents[0], Math.round(noi*.5)+1, line, tangents);
          for (i=0; i<Math.round(noi*.5)+2; i++) {
            rgba[wp] = currentBlock.molecules[0].rgba;
            aid[wp] = 0;
            wp++;
          }
        }
        
        // add waypoints instead of CAs, also no interpolation
        for (m=0; m<currentBlock.waypoints.length; m++) {
          rgba[wp] = currentBlock.molecules[0].rgba;
          aid[wp] = 0;
          wp++;
          line.push(currentBlock.waypoints[m]);
          tangents.push(currentBlock.waypoint_tangents[m]);
        }
        
        // for some reason this doesn't work properly...
        if (! currentBlock.isLast) {
          currentBlock.rocketPost = Math.round(noi*.5)+2;
          
          for (b2=b+1; b2<chain.twoDcache.length; b2++) if (! chain.twoDcache[b2].skip) break;
          
          tmp = tangents.length;
          
          molmil.hermiteInterpolate(currentBlock.waypoints[m-1], chain.twoDcache[b2].xyz[0], currentBlock.waypoint_tangents[m-1], chain.twoDcache[b2].tangents[0], Math.round(noi*.5)+1, line, tangents);
          
          vec[0] = tangents[tmp][0]+tangents[tmp+1][0]; vec[1] = tangents[tmp][1]+tangents[tmp+1][1]; vec[2] = tangents[tmp][2]+tangents[tmp+1][2];
          vec3.normalize(vec, vec);
          tangents[tmp][0] = vec[0]; tangents[tmp][1] = vec[1]; tangents[tmp][2] = vec[2];
          
          
          for (i=0; i<Math.round(noi*.5)+2; i++) {
            rgba[wp] = currentBlock.molecules[0].rgba;
            aid[wp] = 0;
            wp++;
          }
          
        }
        
      }
      else {
        for (m=0; m<currentBlock.molecules.length-1; m++) {
          molmil.hermiteInterpolate(currentBlock.xyz[m], currentBlock.xyz[m+1], currentBlock.tangents[m], currentBlock.tangents[m+1], noi, line, tangents);
          for (i=0; i<noi+1; i++) {
            rgba[wp] = currentBlock.molecules[m].rgba;
            aid[wp] = currentBlock.molecules[m].CA.AID;
            wp++;
          }
        }
        if (! currentBlock.isLast) {
          if (! chain.twoDcache[b+1].rocket) {
            molmil.hermiteInterpolate(currentBlock.xyz[m], chain.twoDcache[b+1].xyz[0], currentBlock.tangents[m], currentBlock.tangents[m+1], noi, line, tangents);
            for (i=0; i<noi+1; i++) {
              rgba[wp] = currentBlock.molecules[m].rgba;
              aid[wp] = currentBlock.molecules[m].CA.AID;
              wp++;
            }
          }
        }
        else {
          line.push([currentBlock.xyz[m][0], currentBlock.xyz[m][1], currentBlock.xyz[m][2]]);
          if (tangents.length) tangents.push(tangents[wp-1]);
          else tangents.push([1, 0, 0]);
          rgba[wp] = currentBlock.molecules[m].rgba;
          aid[wp] = currentBlock.molecules[m].CA.AID;
          wp++;
        }
      }
    }
    t_ranges.push(line.length);

    for (b=0, t=0; b<chain.twoDcache.length; b++) {
      currentBlock = chain.twoDcache[b];
      
      //if (chain.displayMode > 2 && (currentBlock.sndStruc == 2 || currentBlock.sndStruc == 3) && t > 0) { // the problem is here...
      if (chain.displayMode > 2 && (currentBlock.sndStruc == 2 || currentBlock.sndStruc == 3) && ! currentBlock.rocket) {
        ref = null;
        if (currentBlock.sndStruc == 2) {
          ref = currentBlock.normals;
          tmp = currentBlock.molecules.length-(currentBlock.isLast ? 1 : 0);
          for (m=0; m<tmp; m++) {
            for (i=0; i<noi+1; i++, t++) {
              TG = tangents[t];
              N = vec3.lerp([0, 0, 0], ref[m], ref[m+1], int_ratio[i]); vec3.normalize(N, N); 
              vec3.scaleAndAdd(N, N, TG, -vec3.dot(N, TG)/vec3.dot(TG, TG)); vec3.normalize(N, N);
              normals.push(N);
              BN = vec3.cross([0, 0, 0], N, TG); vec3.normalize(BN, BN); vec3.negate(BN, BN); binormals.push(BN);
            }
          }
          if (tmp != currentBlock.molecules.length) { // last one...
            TG = tangents[t];
            N = vec3.lerp([0, 0, 0], ref[m], ref[m+1], int_ratio[i]); vec3.normalize(N, N); 
            vec3.scaleAndAdd(N, N, TG, -vec3.dot(N, TG)/vec3.dot(TG, TG)); vec3.normalize(N, N);
            normals.push(N);
            BN = vec3.cross([0, 0, 0], N, TG); vec3.normalize(BN, BN); vec3.negate(BN, BN); binormals.push(BN);
            t++
          }
        }
        else if (currentBlock.sndStruc == 3) {
          ref = currentBlock.binormals;
          if (! currentBlock.isFirst && ! currentBlock.Nresume && rotationMatrix) {
            vec3.cross(vec, tangents[t-1], tangents[t]);
            if (vec3.length(vec) > delta) {
              vec3.normalize(vec, vec);
              theta = Math.acos(Math.max(-1, Math.min(1, vec3.dot(tangents[t-1], tangents[t]))));
              mat4.rotate(rotationMatrix, identityMatrix, theta, vec);
              vec3.transformMat4(normal, normal, rotationMatrix);
            }
            vec3.cross(binormal, tangents[t], normal);
            ref[0] = [binormal[0], binormal[1], binormal[2]];

            if (vec3.dot(ref[0], ref[1]) < 0) { // meant for loop-->helix transition
              tmp = currentBlock; i = 1;
              while (true) {
                for (m=i; m<tmp.molecules.length; m++) vec3.negate(tmp.binormals[m], tmp.binormals[m]);
                tmp.invertedBinormals = ! tmp.invertedBinormals;
                
                tmp = tmp.nextBlock; i = 0;
                if (! tmp) break;
              }
            }
          }

          tmp = currentBlock.molecules.length-(currentBlock.isLast ? 1 : 0);

          for (m=0; m<tmp; m++) {
            for (i=0; i<noi+1; i++, t++) {
              TG = tangents[t];
              BN = vec3.lerp([0, 0, 0], ref[m], ref[m+1], int_ratio[i]); vec3.normalize(BN, BN);
              vec3.scaleAndAdd(BN, BN, TG, -vec3.dot(BN, TG)/vec3.dot(TG, TG)); vec3.normalize(BN, BN); 
              binormals.push(BN);
              N = vec3.cross([0, 0, 0], BN, TG); vec3.normalize(N, N); normals.push(N);
            }
          }
          if (tmp != currentBlock.molecules.length) { // last one...
            TG = tangents[t];
            BN = [ref[m+1][0], ref[m+1][1], ref[m+1][2]]; vec3.normalize(BN, BN); 
            vec3.scaleAndAdd(BN, BN, TG, -vec3.dot(BN, TG)/vec3.dot(TG, TG)); vec3.normalize(BN, BN); 
            binormals.push(BN);
            N = vec3.cross([0, 0, 0], BN, TG); vec3.normalize(N, N); normals.push(N);
            t++
          }
        }
      }
      else { // otherwise --> PTF
        t = normals.length;

        rotationMatrix = mat4.create(), identityMatrix = mat4.create();
        if (t == 0) {
          smallest = Number.MAX_VALUE;
          if (tangents[0][0] <= smallest) {smallest = tangents[0][0]; normal = [1, 0, 0];}
          if (tangents[0][1] <= smallest) {smallest = tangents[0][1]; normal = [0, 1, 0];}
          if (tangents[0][2] <= smallest) {smallest = tangents[0][2]; normal = [0, 0, 1];}
          vec3.cross(vec, tangents[0], normal); vec3.normalize(vec, vec);
          vec3.cross(normal, tangents[0], vec); vec3.cross(binormal=[0, 0, 0], tangents[0], normal);
          normals.push([normal[0], normal[1], normal[2]]); binormals.push([binormal[0], binormal[1], binormal[2]]);
          t++;
        }
        else {normal = [normals[t-1][0], normals[t-1][1], normals[t-1][2]]; binormal = [binormals[t-1][0], binormals[t-1][1], binormals[t-1][2]];}
        for (; t<t_ranges[b+1]; t++) {
          vec3.cross(vec, tangents[t-1], tangents[t]);
          if (vec3.length(vec) > delta) {
            vec3.normalize(vec, vec);
            theta = Math.acos(Math.max(-1, Math.min(1, vec3.dot(tangents[t-1], tangents[t]))));
            mat4.rotate(rotationMatrix, identityMatrix, theta, vec);
            vec3.transformMat4(normal, normal, rotationMatrix);
          }
          vec3.cross(binormal, tangents[t], normal);
          normals.push([normal[0], normal[1], normal[2]]); binormals.push([binormal[0], binormal[1], binormal[2]]);
        }
      }
    }

    normals.push(normals[normals.length-1]);
    binormals.push(binormals[binormals.length-1]);

    t = 0;
    
    for (b=0; b<chain.twoDcache.length; b++) {
      currentBlock = chain.twoDcache[b];
      if (chain.displayMode > 2) {
        if (currentBlock.sndStruc == 2) {
          t = this.buildSheet(t_ranges[b], t_ranges[b+1], line, tangents, normals, binormals, rgba, aid, currentBlock.isFirst, currentBlock.isLast); // bad
          continue;
        }
        else if (currentBlock.rocket) {
          if (currentBlock.skip) continue;

          
          t = this.buildLoop(t_ranges[b], t_ranges[b]+currentBlock.rocketPre+(currentBlock.rocketPre ? 1 : 0), line, tangents, normals, binormals, rgba, aid);
          t = this.buildRocket(t_ranges[b]+currentBlock.rocketPre, t_ranges[b+1]-currentBlock.rocketPost, line, tangents, normals, binormals, rgba, aid, currentBlock.isLast);
          t = this.buildLoop(t_ranges[b+1]-currentBlock.rocketPost, t_ranges[b+1], line, tangents, normals, binormals, rgba, aid);

          continue;
        }
        else if (currentBlock.sndStruc == 3) { // caps also need to be added...
          if (currentBlock.isFirst) {
            this.buildLoopNcap(t_ranges[b], line, tangents, normals, binormals, rgba, aid); t++;
            t_ranges[b] += 1;
          }
          t = this.buildHelix(t_ranges[b], t_ranges[b+1], line, tangents, normals, binormals, rgba, aid, currentBlock);
          if (currentBlock.isLast) {
            this.buildLoopCcap(t_ranges[b+1]-1, line, tangents, normals, binormals, rgba, aid);
          }
          continue;
        }
      }

      if (currentBlock.isFirst) {
        this.buildLoopNcap(t_ranges[b], line, tangents, normals, binormals, rgba, aid); t++;
        t_ranges[b] += 1;
      }
      
      t = this.buildLoop(t_ranges[b], t_ranges[b+1], line, tangents, normals, binormals, rgba, aid);
      
      if (currentBlock.isLast) {
        this.buildLoopCcap(t_ranges[b+1]-1, line, tangents, normals, binormals, rgba, aid);
      }
    }
  }
};

// ** n-terminal loop (cap) **
molmil.geometry.buildLoopNcap = function(t, P, T, N, B, rgba, aid) {
  var dome = this.dome[0], radius = this.radius, i, ringTemplate = this.ringTemplate;
  
  var vBuffer = this.buffer3.vertexBuffer, iBuffer = this.buffer3.indexBuffer, vP = this.buffer3.vP, iP = this.buffer3.iP, Px, Py, Pz, Nx, Ny, Nz, Bx, By, Bz, Tx, Ty, Tz, rgba_, aid_,
  vBuffer8 = this.buffer3.vertexBuffer8, vP8 = vP*4;
  var p = vP*.125;

  Px = P[t][0], Py = P[t][1], Pz = P[t][2], Tx = T[t][0], Ty = T[t][1], Tz = T[t][2], Nx = N[t][0], Ny = N[t][1], Nz = N[t][2], Bx = B[t][0], By = B[t][1], Bz = B[t][2], rgba_ = rgba[t], aid_ = aid[t];
  for (i=0; i<dome.vertices.length; i++, vP8+=32) {
    vBuffer[vP++] = radius*dome.vertices[i][0] * Nx + radius*dome.vertices[i][1] * Bx + radius*dome.vertices[i][2] * Tx + Px;
    vBuffer[vP++] = radius*dome.vertices[i][0] * Ny + radius*dome.vertices[i][1] * By + radius*dome.vertices[i][2] * Ty + Py;
    vBuffer[vP++] = radius*dome.vertices[i][0] * Nz + radius*dome.vertices[i][1] * Bz + radius*dome.vertices[i][2] * Tz + Pz;
    
    vBuffer[vP++] = dome.vertices[i][0] * Nx + dome.vertices[i][1] * Bx + dome.vertices[i][2] * Tx;
    vBuffer[vP++] = dome.vertices[i][0] * Ny + dome.vertices[i][1] * By + dome.vertices[i][2] * Ty;
    vBuffer[vP++] = dome.vertices[i][0] * Nz + dome.vertices[i][1] * Bz + dome.vertices[i][2] * Tz;

    vBuffer8[vP8+24] = rgba_[0];
    vBuffer8[vP8+25] = rgba_[1];
    vBuffer8[vP8+26] = rgba_[2];
    vBuffer8[vP8+27] = rgba_[3];
    vP++;

    vBuffer[vP++] = aid[t]; // ID
  }
  
  for (i=0;i<dome.faces.length; i++) {
    iBuffer[iP++] = dome.faces[i][0]+p;
    iBuffer[iP++] = dome.faces[i][1]+p;
    iBuffer[iP++] = dome.faces[i][2]+p;
  }
  
  for (i=0; i<ringTemplate.length; i++, vP8+=32) {
    vBuffer[vP++] = radius*ringTemplate[i][0] * Nx + radius*ringTemplate[i][1] * Bx + Px;
    vBuffer[vP++] = radius*ringTemplate[i][0] * Ny + radius*ringTemplate[i][1] * By + Py;
    vBuffer[vP++] = radius*ringTemplate[i][0] * Nz + radius*ringTemplate[i][1] * Bz + Pz;
      
    vBuffer[vP++] = ringTemplate[i][0] * Nx + ringTemplate[i][1] * Bx;
    vBuffer[vP++] = ringTemplate[i][0] * Ny + ringTemplate[i][1] * By;
    vBuffer[vP++] = ringTemplate[i][0] * Nz + ringTemplate[i][1] * Bz;

    vBuffer8[vP8+24] = rgba_[0];
    vBuffer8[vP8+25] = rgba_[1];
    vBuffer8[vP8+26] = rgba_[2];
    vBuffer8[vP8+27] = rgba_[3];
    vP++;
      
    vBuffer[vP++] = aid[t]; // ID
  }
  
  this.buffer3.vP = vP;
  this.buffer3.iP = iP;
};

// ** c-terminal loop (cap) **
molmil.geometry.buildLoopCcap = function(t, P, T, N, B, rgba, aid) {
  var dome = this.dome[1], radius = this.radius, i, ringTemplate = this.ringTemplate;
  
  var vBuffer = this.buffer3.vertexBuffer, iBuffer = this.buffer3.indexBuffer, vP = this.buffer3.vP, iP = this.buffer3.iP, Px, Py, Pz, Nx, Ny, Nz, Bx, By, Bz, Tx, Ty, Tz, rgba_, aid_,
  vBuffer8 = this.buffer3.vertexBuffer8, vP8 = vP*4;
  var p = vP*.125;
  
  Px = P[t][0], Py = P[t][1], Pz = P[t][2], Tx = T[t][0], Ty = T[t][1], Tz = T[t][2], Nx = N[t][0], Ny = N[t][1], Nz = N[t][2], Bx = B[t][0], By = B[t][1], Bz = B[t][2], rgba_ = rgba[t], aid_ = aid[t];
  for (i=0; i<dome.vertices.length; i++, vP8+=32) {
    vBuffer[vP++] = radius*dome.vertices[i][0] * Nx + radius*dome.vertices[i][1] * Bx + radius*dome.vertices[i][2] * Tx + Px;
    vBuffer[vP++] = radius*dome.vertices[i][0] * Ny + radius*dome.vertices[i][1] * By + radius*dome.vertices[i][2] * Ty + Py;
    vBuffer[vP++] = radius*dome.vertices[i][0] * Nz + radius*dome.vertices[i][1] * Bz + radius*dome.vertices[i][2] * Tz + Pz;
    
    vBuffer[vP++] = dome.vertices[i][0] * Nx + dome.vertices[i][1] * Bx + dome.vertices[i][2] * Tx;
    vBuffer[vP++] = dome.vertices[i][0] * Ny + dome.vertices[i][1] * By + dome.vertices[i][2] * Ty;
    vBuffer[vP++] = dome.vertices[i][0] * Nz + dome.vertices[i][1] * Bz + dome.vertices[i][2] * Tz;
    
    vBuffer8[vP8+24] = rgba_[0];
    vBuffer8[vP8+25] = rgba_[1];
    vBuffer8[vP8+26] = rgba_[2];
    vBuffer8[vP8+27] = rgba_[3];
    vP++;
      
    vBuffer[vP++] = aid_; // ID
  }

  for (i=0;i<dome.faces.length; i++) {
    iBuffer[iP++] = dome.faces[i][0]+p;
    iBuffer[iP++] = dome.faces[i][1]+p;
    iBuffer[iP++] = dome.faces[i][2]+p;
  }
  
  this.buffer3.vP = vP;
  this.buffer3.iP = iP;
};

// ** build loop representation **
molmil.geometry.buildLoop = function(t, t_next, P, T, N, B, rgba, aid) {
  var dome = this.dome[0], radius = this.radius, i, novpr = this.novpr;
  
  var ringTemplate = this.ringTemplate, radius = this.radius, Px, Py, Pz, Nx, Ny, Nz, Bx, By, Bz, Tx, Ty, Tz, rgba_, aid_;
  
  var vBuffer = this.buffer3.vertexBuffer, iBuffer = this.buffer3.indexBuffer, vP = this.buffer3.vP, iP = this.buffer3.iP,
  vBuffer8 = this.buffer3.vertexBuffer8, vP8 = vP*4;
  var p = vP*.125;
  var p_pre = p-novpr;
  
  for (t; t<t_next; t++) {
    Px = P[t][0], Py = P[t][1], Pz = P[t][2], Tx = T[t][0], Ty = T[t][1], Tz = T[t][2], Nx = N[t][0], Ny = N[t][1], Nz = N[t][2], Bx = B[t][0], By = B[t][1], Bz = B[t][2], rgba_ = rgba[t], aid_ = aid[t];
    for (i=0; i<ringTemplate.length; i++, vP8+=32) {
      vBuffer[vP++] = radius*ringTemplate[i][0] * Nx + radius*ringTemplate[i][1] * Bx + Px;
      vBuffer[vP++] = radius*ringTemplate[i][0] * Ny + radius*ringTemplate[i][1] * By + Py;
      vBuffer[vP++] = radius*ringTemplate[i][0] * Nz + radius*ringTemplate[i][1] * Bz + Pz;
      
      vBuffer[vP++] = ringTemplate[i][0] * Nx + ringTemplate[i][1] * Bx;
      vBuffer[vP++] = ringTemplate[i][0] * Ny + ringTemplate[i][1] * By;
      vBuffer[vP++] = ringTemplate[i][0] * Nz + ringTemplate[i][1] * Bz;

      vBuffer8[vP8+24] = rgba_[0];
      vBuffer8[vP8+25] = rgba_[1];
      vBuffer8[vP8+26] = rgba_[2];
      vBuffer8[vP8+27] = rgba_[3];
      vP++;
      
      vBuffer[vP++] = aid_; // ID
    }
    
    for (i=0; i<(novpr*2)-2; i+=2, p+=1, p_pre+=1) {
      iBuffer[iP++] = p;
      iBuffer[iP++] = p_pre;
      iBuffer[iP++] = p_pre+1;
    
      iBuffer[iP++] = p_pre+1;
      iBuffer[iP++] = p+1;
      iBuffer[iP++] = p;
    }
    iBuffer[iP++] = p;
    iBuffer[iP++] = p_pre;
    iBuffer[iP++] = p_pre-(novpr-1);

    iBuffer[iP++] = p_pre-(novpr-1);
    iBuffer[iP++] = p-(novpr-1);
    iBuffer[iP++] = p;
    
    p++; p_pre++;
  }
  
  this.buffer3.vP = vP;
  this.buffer3.iP = iP;
  return t;
};


// note that everything has been optimized for an alpha helix...
// how does this work for other helices???
molmil.geometry.buildRocket = function(t, t_next, P, T, N, B, rgba, aid, isLast) {
  var radius = 1.15, i, novpr = this.novpr, go = false;
  var ringTemplate = this.ringTemplate, Px, Py, Pz, Nx, Ny, Nz, Bx, By, Bz, Tx, Ty, Tz, rgba_, aid_;
  
  var vBuffer = this.buffer3.vertexBuffer, iBuffer = this.buffer3.indexBuffer, vP = this.buffer3.vP, iP = this.buffer3.iP,
  vBuffer8 = this.buffer3.vertexBuffer8, vP8 = vP*4;
  var p = vP*.125;
  var p_pre = p-novpr;
  
  var before = vP;
  
  // N-terminal cap: flat (1-ring + 1 vertices)
  
  Px = P[t][0], Py = P[t][1], Pz = P[t][2], Tx = T[t][0], Ty = T[t][1], Tz = T[t][2], Nx = N[t][0], Ny = N[t][1], Nz = N[t][2], Bx = B[t][0], By = B[t][1], Bz = B[t][2], rgba_ = rgba[t], aid_ = aid[t];

  vBuffer[vP++] = Px;
  vBuffer[vP++] = Py;
  vBuffer[vP++] = Pz;

  vBuffer[vP++] = -Tx;
  vBuffer[vP++] = -Ty;
  vBuffer[vP++] = -Tz;

  vBuffer8[vP8+24] = rgba_[0];
  vBuffer8[vP8+25] = rgba_[1];
  vBuffer8[vP8+26] = rgba_[2];
  vBuffer8[vP8+27] = rgba_[3];
  vP++;
      
  vBuffer[vP++] = aid_; // ID
  vP8 += 32;

  for (i=0; i<ringTemplate.length; i++, vP8+=32) {
    vBuffer[vP++] = radius*ringTemplate[i][0] * Nx + radius*ringTemplate[i][1] * Bx + Px;
    vBuffer[vP++] = radius*ringTemplate[i][0] * Ny + radius*ringTemplate[i][1] * By + Py;
    vBuffer[vP++] = radius*ringTemplate[i][0] * Nz + radius*ringTemplate[i][1] * Bz + Pz;
      
    vBuffer[vP++] = -Tx;
    vBuffer[vP++] = -Ty;
    vBuffer[vP++] = -Tz;

    vBuffer8[vP8+24] = rgba_[0];
    vBuffer8[vP8+25] = rgba_[1];
    vBuffer8[vP8+26] = rgba_[2];
    vBuffer8[vP8+27] = rgba_[3];
    vP++;
      
    vBuffer[vP++] = aid_; // ID
  }

  for (i=0; i<ringTemplate.length; i++) {
    iBuffer[iP++] = p+i+2;
    iBuffer[iP++] = p+i+1;
    iBuffer[iP++] = p;
  }
  iBuffer[iP-3] = p+1;
  
  p += ringTemplate.length+1;
  p_pre = p-novpr;

  // center region (cylinder)
  
  for (t; t<t_next; t++) {
    Px = P[t][0], Py = P[t][1], Pz = P[t][2], Tx = T[t][0], Ty = T[t][1], Tz = T[t][2], Nx = N[t][0], Ny = N[t][1], Nz = N[t][2], Bx = B[t][0], By = B[t][1], Bz = B[t][2], rgba_ = rgba[t], aid_ = aid[t];
    for (i=0; i<ringTemplate.length; i++, vP8+=32) {
      vBuffer[vP++] = radius*ringTemplate[i][0] * Nx + radius*ringTemplate[i][1] * Bx + Px;
      vBuffer[vP++] = radius*ringTemplate[i][0] * Ny + radius*ringTemplate[i][1] * By + Py;
      vBuffer[vP++] = radius*ringTemplate[i][0] * Nz + radius*ringTemplate[i][1] * Bz + Pz;
      
      vBuffer[vP++] = ringTemplate[i][0] * Nx + ringTemplate[i][1] * Bx;
      vBuffer[vP++] = ringTemplate[i][0] * Ny + ringTemplate[i][1] * By;
      vBuffer[vP++] = ringTemplate[i][0] * Nz + ringTemplate[i][1] * Bz;

      vBuffer8[vP8+24] = rgba_[0];
      vBuffer8[vP8+25] = rgba_[1];
      vBuffer8[vP8+26] = rgba_[2];
      vBuffer8[vP8+27] = rgba_[3];
      vP++;
      
      vBuffer[vP++] = aid_; // ID
    }
    
    for (i=0; i<(novpr*2)-2; i+=2, p+=1, p_pre+=1) {
      iBuffer[iP++] = p+novpr;
      iBuffer[iP++] = p_pre+novpr;
      iBuffer[iP++] = p_pre+1+novpr;
    
      iBuffer[iP++] = p_pre+1+novpr;
      iBuffer[iP++] = p+1+novpr;
      iBuffer[iP++] = p+novpr;
    }
    iBuffer[iP++] = p+novpr;
    iBuffer[iP++] = p_pre+novpr;
    iBuffer[iP++] = p_pre-(novpr-1)+novpr;

    iBuffer[iP++] = p_pre-(novpr-1)+novpr;
    iBuffer[iP++] = p-(novpr-1)+novpr;
    iBuffer[iP++] = p+novpr;
    
    p++; p_pre++;
  }

  for (i=vP-(ringTemplate.length*8); i<vP; i+=8) {
    vBuffer[i] -= Tx*2;
    vBuffer[i+1] -= Ty*2;
    vBuffer[i+2] -= Tz*2;
  }
    
    
  for (i=0; i<ringTemplate.length; i++, vP8+=32) {
    vBuffer[vP++] = radius*ringTemplate[i][0] * Nx + radius*ringTemplate[i][1] * Bx + Px - Tx*2;
    vBuffer[vP++] = radius*ringTemplate[i][0] * Ny + radius*ringTemplate[i][1] * By + Py - Ty*2;
    vBuffer[vP++] = radius*ringTemplate[i][0] * Nz + radius*ringTemplate[i][1] * Bz + Pz - Tz*2;

    vBuffer[vP++] = ringTemplate[i][0] * Nx + ringTemplate[i][1] * Bx;
    vBuffer[vP++] = ringTemplate[i][0] * Ny + ringTemplate[i][1] * By;
    vBuffer[vP++] = ringTemplate[i][0] * Nz + ringTemplate[i][1] * Bz;

    vBuffer8[vP8+24] = rgba_[0];
    vBuffer8[vP8+25] = rgba_[1];
    vBuffer8[vP8+26] = rgba_[2];
    vBuffer8[vP8+27] = rgba_[3];
    vP++;
      
    vBuffer[vP++] = aid_; // ID
  }
    
  
  // add the same head as for sheets...
  
  vBuffer[vP++] = Px;
  vBuffer[vP++] = Py;
  vBuffer[vP++] = Pz;

  vBuffer[vP++] = Tx;
  vBuffer[vP++] = Ty;
  vBuffer[vP++] = Tz;

  vBuffer8[vP8+24] = rgba_[0];
  vBuffer8[vP8+25] = rgba_[1];
  vBuffer8[vP8+26] = rgba_[2];
  vBuffer8[vP8+27] = rgba_[3];
  vP++;
  vP8 += 32;
  
  vBuffer[vP++] = aid_; // ID
  
  for (i=0; i<ringTemplate.length; i++) {
    iBuffer[iP++] = p+ringTemplate.length;
    iBuffer[iP++] = p+i;
    iBuffer[iP++] = p+i+1;
  }
  iBuffer[iP-1] = p;
  
  p += ringTemplate.length+1;
  p_pre = p-novpr;
    
    
  radius = this.radius;

  if (! isLast) {
    var h = this.radius;

    for (i=0; i<ringTemplate.length; i++, vP8+=32) {
      vBuffer[vP++] = h*ringTemplate[i][0] * Nx + h*ringTemplate[i][1] * Bx + Px  - Tx*radius*2;
      vBuffer[vP++] = h*ringTemplate[i][0] * Ny + h*ringTemplate[i][1] * By + Py  - Ty*radius*2;
      vBuffer[vP++] = h*ringTemplate[i][0] * Nz + h*ringTemplate[i][1] * Bz + Pz  - Tz*radius*2;
      
      vBuffer[vP++] = ringTemplate[i][0] * Nx + ringTemplate[i][1] * Bx;
      vBuffer[vP++] = ringTemplate[i][0] * Ny + ringTemplate[i][1] * By;
      vBuffer[vP++] = ringTemplate[i][0] * Nz + ringTemplate[i][1] * Bz;

      vBuffer8[vP8+24] = rgba_[0];
      vBuffer8[vP8+25] = rgba_[1];
      vBuffer8[vP8+26] = rgba_[2];
      vBuffer8[vP8+27] = rgba_[3];
      vP++;
      
      vBuffer[vP++] = aid_; // ID
    }
  }
  
  
  this.buffer3.vP = vP;
  this.buffer3.iP = iP;
  return t;

}

// ** build helix representation **
molmil.geometry.buildHelix = function(t, t_next, P, T, N, B, rgba, aid, currentBlock) {
  var dome = this.dome[0], radius = this.radius, i, novpr = this.novpr;

  var ringTemplate = this.ringTemplate, radius = this.radius, Px, Py, Pz, Nx, Ny, Nz, Bx, By, Bz, Tx, Ty, Tz, rgba_, aid_;
  
  var vBuffer = this.buffer3.vertexBuffer, iBuffer = this.buffer3.indexBuffer, vP = this.buffer3.vP, iP = this.buffer3.iP,
  vBuffer8 = this.buffer3.vertexBuffer8, vP8 = vP*4;
  var p = vP*.125;
  var p_pre = p-novpr;
  
  var factor, Ys, Ysi;
  
  var invertedBinormals = currentBlock.invertedBinormals, Nresume = currentBlock.Nresume, Cresume = currentBlock.Cresume;

  var tmp = [0, 0], noi = this.noi, t_start = t, n = Nresume ? noi : 0;
  for (t; t<t_next; t++) {
    Px = P[t][0], Py = P[t][1], Pz = P[t][2], Tx = T[t][0], Ty = T[t][1], Tz = T[t][2], Nx = N[t][0], Ny = N[t][1], Nz = N[t][2], Bx = B[t][0], By = B[t][1], Bz = B[t][2], rgba_ = rgba[t], aid_ = aid[t];

    if (! Nresume && t < t_start+noi) {factor = (n/noi); n++;}
    else if (! Cresume && t > t_next-noi-2) {factor = (n/(noi)); n--;}
    else factor = 1.0;
    Ys = (5*factor)+1.0; Ysi = 1./Ys;

    for (i=0; i<ringTemplate.length; i++, vP8+=32) {
      vBuffer[vP++] = radius*ringTemplate[i][0] * Nx + Ys*radius*ringTemplate[i][1] * Bx + Px;
      vBuffer[vP++] = radius*ringTemplate[i][0] * Ny + Ys*radius*ringTemplate[i][1] * By + Py;
      vBuffer[vP++] = radius*ringTemplate[i][0] * Nz + Ys*radius*ringTemplate[i][1] * Bz + Pz;

      tmp[0] = ringTemplate[i][0]; tmp[1] = Ysi*ringTemplate[i][1]; vec2.normalize(tmp, tmp);
      vBuffer[vP++] = tmp[0] * Nx + tmp[1] * Bx;
      vBuffer[vP++] = tmp[0] * Ny + tmp[1] * By;
      vBuffer[vP++] = tmp[0] * Nz + tmp[1] * Bz;
      
      if (factor > .5 && ((invertedBinormals && vBuffer[vP-3]*Nx + vBuffer[vP-2]*Ny + vBuffer[vP-1]*Nz < -0.01) || (! invertedBinormals && vBuffer[vP-3]*Nx + vBuffer[vP-2]*Ny + vBuffer[vP-1]*Nz > 0.01))) {
        vBuffer8[vP8+24] = 255;
        vBuffer8[vP8+25] = 255;
        vBuffer8[vP8+26] = 255;
        vBuffer8[vP8+27] = 255;
      }
      else {
        vBuffer8[vP8+24] = rgba_[0];
        vBuffer8[vP8+25] = rgba_[1];
        vBuffer8[vP8+26] = rgba_[2];
        vBuffer8[vP8+27] = rgba_[3];
      }
      vP++;
      
      vBuffer[vP++] = aid_; // ID
    }

    for (i=0; i<(novpr*2)-2; i+=2, p+=1, p_pre+=1) {
      iBuffer[iP++] = p;
      iBuffer[iP++] = p_pre;
      iBuffer[iP++] = p_pre+1;
    
      iBuffer[iP++] = p_pre+1;
      iBuffer[iP++] = p+1;
      iBuffer[iP++] = p;
    }
    iBuffer[iP++] = p;
    iBuffer[iP++] = p_pre;
    iBuffer[iP++] = p_pre-(novpr-1);

    iBuffer[iP++] = p_pre-(novpr-1);
    iBuffer[iP++] = p-(novpr-1);
    iBuffer[iP++] = p;
    
    p++; p_pre++;
  }
  
  this.buffer3.vP = vP;
  this.buffer3.iP = iP;
  return t;
};

// ** build sheet representation **
molmil.geometry.buildSheet = function(t, t_next, P, T, N, B, rgba, aid, isFirst, isLast) {
  var dome = this.dome[0], radius = this.radius, i, novpr = this.novpr;
  var ringTemplate = this.ringTemplate, radius = this.radius, Px, Py, Pz, Nx, Ny, Nz, Bx, By, Bz, Tx, Ty, Tz, rgba_, aid_;
  
  
  var vBuffer = this.buffer3.vertexBuffer, iBuffer = this.buffer3.indexBuffer, vP = this.buffer3.vP, iP = this.buffer3.iP,
  vBuffer8 = this.buffer3.vertexBuffer8, vP8 = vP*4;
  var p = vP*.125;
  var p_pre = p-novpr;
  var squareVertices = this.squareVertices, noi = this.noi, squareVerticesN = this.squareVerticesN;
  
  var h = this.sheetHeight, w = h*8;
  
  if (! isFirst) {
    Px = (P[t][0]*.75)+(P[t+1][0]*.25), Py = (P[t][1]*.75)+(P[t][1]*.25), Pz = (P[t][2]*.75)+(P[t][2]*.25), Tx = T[t-1][0], Ty = T[t-1][1], Tz = T[t-1][2], 
    Nx = N[t-1][0], Ny = N[t-1][1], Nz = N[t-1][2], Bx = B[t-1][0], By = B[t-1][1], Bz = B[t-1][2], rgba_ = rgba[t-1], aid_ = aid[t];
    for (i=0; i<ringTemplate.length; i++, vP8+=32) {
      vBuffer[vP++] = h*.5*ringTemplate[i][0] * Nx + h*.5*ringTemplate[i][1] * Bx + Px;
      vBuffer[vP++] = h*.5*ringTemplate[i][0] * Ny + h*.5*ringTemplate[i][1] * By + Py;
      vBuffer[vP++] = h*.5*ringTemplate[i][0] * Nz + h*.5*ringTemplate[i][1] * Bz + Pz;
      
      vBuffer[vP++] = ((ringTemplate[i][0] * Nx + ringTemplate[i][1] * Bx)+Tx)*.5;
      vBuffer[vP++] = ((ringTemplate[i][0] * Ny + ringTemplate[i][1] * By)+Ty)*.5;
      vBuffer[vP++] = ((ringTemplate[i][0] * Nz + ringTemplate[i][1] * Bz)+Tz)*.5;
      
      vBuffer8[vP8+24] = rgba_[0];
      vBuffer8[vP8+25] = rgba_[1];
      vBuffer8[vP8+26] = rgba_[2];
      vBuffer8[vP8+27] = rgba_[3];
      vP++;

      vBuffer[vP++] = aid[t-1]; // ID
    }
    
    for (i=0; i<(novpr*2)-2; i+=2, p+=1, p_pre+=1) {
      iBuffer[iP++] = p;
      iBuffer[iP++] = p_pre;
      iBuffer[iP++] = p_pre+1;
    
      iBuffer[iP++] = p_pre+1;
      iBuffer[iP++] = p+1;
      iBuffer[iP++] = p;
    }
    iBuffer[iP++] = p;
    iBuffer[iP++] = p_pre;
    iBuffer[iP++] = p_pre-(novpr-1);

    iBuffer[iP++] = p_pre-(novpr-1);
    iBuffer[iP++] = p-(novpr-1);
    iBuffer[iP++] = p;
    
    p++; p_pre++;
    
    
  }

  // draw arrow bottom

  Px = P[t][0], Py = P[t][1], Pz = P[t][2], Tx = T[t][0], Ty = T[t][1], Tz = T[t][2], Nx = N[t][0], Ny = N[t][1], Nz = N[t][2], Bx = B[t][0], By = B[t][1], Bz = B[t][2], rgba_ = rgba[t], aid_ = aid[t];
  for (i=0; i<4; i++, vP8+=32) {
    vBuffer[vP++] = h*squareVertices[i][0] * Nx + w*squareVertices[i][1] * Bx + Px;
    vBuffer[vP++] = h*squareVertices[i][0] * Ny + w*squareVertices[i][1] * By + Py;
    vBuffer[vP++] = h*squareVertices[i][0] * Nz + w*squareVertices[i][1] * Bz + Pz;
      
    vBuffer[vP++] = -Tx;
    vBuffer[vP++] = -Ty;
    vBuffer[vP++] = -Tz;
    
    vBuffer8[vP8+24] = 255;
    vBuffer8[vP8+25] = 255;
    vBuffer8[vP8+26] = 255;
    vBuffer8[vP8+27] = 255;
    vP++;
      
    vBuffer[vP++] = aid_; // ID
  }  
  
  iBuffer[iP++] = p; iBuffer[iP++] = p+1; iBuffer[iP++] = p+2; iBuffer[iP++] = p; iBuffer[iP++] = p+2; iBuffer[iP++] = p+3;
  
  p += 4;
  // draw arrow tail
  
  var as = Math.ceil(noi/1.5);
  var dw = (h*12)/as;
  as = t_next - as;
  
  var n = 0;
  for (t; t<as; t++, n++) {
    Px = P[t][0], Py = P[t][1], Pz = P[t][2], Tx = T[t][0], Ty = T[t][1], Tz = T[t][2], Nx = N[t][0], Ny = N[t][1], Nz = N[t][2], Bx = B[t][0], By = B[t][1], Bz = B[t][2], rgba_ = rgba[t], aid_ = aid[t];
    for (i=0; i<4; i++, vP8+=32) {
      
      vBuffer[vP++] = h*squareVertices[i][0] * Nx + w*squareVertices[i][1] * Bx + Px;
      vBuffer[vP++] = h*squareVertices[i][0] * Ny + w*squareVertices[i][1] * By + Py;
      vBuffer[vP++] = h*squareVertices[i][0] * Nz + w*squareVertices[i][1] * Bz + Pz;
      
      vBuffer[vP++] = squareVerticesN[i][0] * Nx + squareVerticesN[i][1] * Bx;
      vBuffer[vP++] = squareVerticesN[i][0] * Ny + squareVerticesN[i][1] * By;
      vBuffer[vP++] = squareVerticesN[i][0] * Nz + squareVerticesN[i][1] * Bz;
      
      if (i == 1 || i== 3) {
        vBuffer8[vP8+24] = 255;
        vBuffer8[vP8+25] = 255;
        vBuffer8[vP8+26] = 255;
        vBuffer8[vP8+27] = 255;
      }
      else {
        vBuffer8[vP8+24] = rgba_[0];
        vBuffer8[vP8+25] = rgba_[1];
        vBuffer8[vP8+26] = rgba_[2];
        vBuffer8[vP8+27] = rgba_[3];
      }
      vP++;

      vBuffer[vP++] = aid_; // ID
      
      vP8 += 32;
      
      //========
      
      
      vBuffer[vP++] = h*squareVertices[i][0] * Nx + w*squareVertices[i][1] * Bx + Px;
      vBuffer[vP++] = h*squareVertices[i][0] * Ny + w*squareVertices[i][1] * By + Py;
      vBuffer[vP++] = h*squareVertices[i][0] * Nz + w*squareVertices[i][1] * Bz + Pz;
      
      vBuffer[vP++] = squareVerticesN[i+1][0] * Nx + squareVerticesN[i+1][1] * Bx;
      vBuffer[vP++] = squareVerticesN[i+1][0] * Ny + squareVerticesN[i+1][1] * By;
      vBuffer[vP++] = squareVerticesN[i+1][0] * Nz + squareVerticesN[i+1][1] * Bz;
      
      if (i == 0 || i== 2) {
        vBuffer8[vP8+24] = 255;
        vBuffer8[vP8+25] = 255;
        vBuffer8[vP8+26] = 255;
        vBuffer8[vP8+27] = 255;
      }
      else {
        vBuffer8[vP8+24] = rgba_[0];
        vBuffer8[vP8+25] = rgba_[1];
        vBuffer8[vP8+26] = rgba_[2];
        vBuffer8[vP8+27] = rgba_[3];
      }
      vP++;
      
      
      vBuffer[vP++] = aid_; // ID
    }

    if (n > 0) {
      iBuffer[iP++] = p-8; iBuffer[iP++] = p-1; iBuffer[iP++] = p+7; iBuffer[iP++] = p-8; iBuffer[iP++] = p+7; iBuffer[iP++] = p+0;
      iBuffer[iP++] = p-7; iBuffer[iP++] = p+1; iBuffer[iP++] = p+2; iBuffer[iP++] = p-7; iBuffer[iP++] = p+2; iBuffer[iP++] = p-6;
      iBuffer[iP++] = p-5; iBuffer[iP++] = p+3; iBuffer[iP++] = p+4; iBuffer[iP++] = p-5; iBuffer[iP++] = p+4; iBuffer[iP++] = p-4;
      iBuffer[iP++] = p-2; iBuffer[iP++] = p-3; iBuffer[iP++] = p+5; iBuffer[iP++] = p-2; iBuffer[iP++] = p+5; iBuffer[iP++] = p+6;
    }
    
    p += 8;
  }
  
  w = h*12;
  t--;
  for (; t<t_next; t++, n++) {
    if (t >= as) w -= dw;

    Px = P[t][0], Py = P[t][1], Pz = P[t][2], Tx = T[t][0], Ty = T[t][1], Tz = T[t][2], Nx = N[t][0], Ny = N[t][1], Nz = N[t][2], Bx = B[t][0], By = B[t][1], Bz = B[t][2], rgba_ = rgba[t], aid_ = aid[t];
    for (i=0; i<4; i++, vP8+=32) {
    
      vBuffer[vP++] = h*squareVertices[i][0] * Nx + w*squareVertices[i][1] * Bx + Px;
      vBuffer[vP++] = h*squareVertices[i][0] * Ny + w*squareVertices[i][1] * By + Py;
      vBuffer[vP++] = h*squareVertices[i][0] * Nz + w*squareVertices[i][1] * Bz + Pz;
      
      vBuffer[vP++] = squareVerticesN[i][0] * Nx + squareVerticesN[i][1] * Bx;
      vBuffer[vP++] = squareVerticesN[i][0] * Ny + squareVerticesN[i][1] * By;
      vBuffer[vP++] = squareVerticesN[i][0] * Nz + squareVerticesN[i][1] * Bz;
      
      if (i == 1 || i== 3) {
        vBuffer8[vP8+24] = 255;
        vBuffer8[vP8+25] = 255;
        vBuffer8[vP8+26] = 255;
        vBuffer8[vP8+27] = 255;
      }
      else {
        vBuffer8[vP8+24] = rgba_[0];
        vBuffer8[vP8+25] = rgba_[1];
        vBuffer8[vP8+26] = rgba_[2];
        vBuffer8[vP8+27] = rgba_[3];
      }
      vP++;
      
      vP8 += 32;
      
      
      vBuffer[vP++] = aid_; // ID
      
      
      //========
      
      
      vBuffer[vP++] = h*squareVertices[i][0] * Nx + w*squareVertices[i][1] * Bx + Px;
      vBuffer[vP++] = h*squareVertices[i][0] * Ny + w*squareVertices[i][1] * By + Py;
      vBuffer[vP++] = h*squareVertices[i][0] * Nz + w*squareVertices[i][1] * Bz + Pz;
      
      vBuffer[vP++] = squareVerticesN[i+1][0] * Nx + squareVerticesN[i+1][1] * Bx;
      vBuffer[vP++] = squareVerticesN[i+1][0] * Ny + squareVerticesN[i+1][1] * By;
      vBuffer[vP++] = squareVerticesN[i+1][0] * Nz + squareVerticesN[i+1][1] * Bz;
      
      if (i == 0 || i== 2) {
        vBuffer8[vP8+24] = 255;
        vBuffer8[vP8+25] = 255;
        vBuffer8[vP8+26] = 255;
        vBuffer8[vP8+27] = 255;
      }
      else {
        vBuffer8[vP8+24] = rgba_[0];
        vBuffer8[vP8+25] = rgba_[1];
        vBuffer8[vP8+26] = rgba_[2];
        vBuffer8[vP8+27] = rgba_[3];
      }
      vP++;
      
      vBuffer[vP++] = aid_; // ID
    }

    if (n > 0) {
      iBuffer[iP++] = p-8; iBuffer[iP++] = p-1; iBuffer[iP++] = p+7; iBuffer[iP++] = p-8; iBuffer[iP++] = p+7; iBuffer[iP++] = p+0;
      iBuffer[iP++] = p-7; iBuffer[iP++] = p+1; iBuffer[iP++] = p+2; iBuffer[iP++] = p-7; iBuffer[iP++] = p+2; iBuffer[iP++] = p-6;
      iBuffer[iP++] = p-5; iBuffer[iP++] = p+3; iBuffer[iP++] = p+4; iBuffer[iP++] = p-5; iBuffer[iP++] = p+4; iBuffer[iP++] = p-4;
      iBuffer[iP++] = p-2; iBuffer[iP++] = p-3; iBuffer[iP++] = p+5; iBuffer[iP++] = p-2; iBuffer[iP++] = p+5; iBuffer[iP++] = p+6;
    }
    
    p += 8;
  }
  
  
  // draw arrow head
  if (! isLast) {
    Tx = T[t][0], Ty = T[t][1], Tz = T[t][2], Nx = N[t][0], Ny = N[t][1], Nz = N[t][2], Bx = B[t][0], By = B[t][1], Bz = B[t][2], rgba_ = rgba[t], aid_ = aid[t];
    
    for (i=0; i<ringTemplate.length; i++, vP8+=32) {
      vBuffer[vP++] = Px;
      vBuffer[vP++] = Py;
      vBuffer[vP++] = Pz;
      
      vBuffer[vP++] = -Tx;
      vBuffer[vP++] = -Ty;
      vBuffer[vP++] = -Tz;

      vBuffer8[vP8+24] = rgba_[0];
      vBuffer8[vP8+25] = rgba_[1];
      vBuffer8[vP8+26] = rgba_[2];
      vBuffer8[vP8+27] = rgba_[3];
      vP++;

      vBuffer[vP++] = aid[t]; // ID
    }
  
    p += ringTemplate.length;
    
    for (i=0; i<ringTemplate.length; i++, vP8+=32) {
      vBuffer[vP++] = h*ringTemplate[i][0] * Nx + h*ringTemplate[i][1] * Bx + Px;
      vBuffer[vP++] = h*ringTemplate[i][0] * Ny + h*ringTemplate[i][1] * By + Py;
      vBuffer[vP++] = h*ringTemplate[i][0] * Nz + h*ringTemplate[i][1] * Bz + Pz;
      
      vBuffer[vP++] = ((ringTemplate[i][0] * Nx + ringTemplate[i][1] * Bx)-Tx)*.5;
      vBuffer[vP++] = ((ringTemplate[i][0] * Ny + ringTemplate[i][1] * By)-Ty)*.5;
      vBuffer[vP++] = ((ringTemplate[i][0] * Nz + ringTemplate[i][1] * Bz)-Tz)*.5;

      vBuffer8[vP8+24] = rgba_[0];
      vBuffer8[vP8+25] = rgba_[1];
      vBuffer8[vP8+26] = rgba_[2];
      vBuffer8[vP8+27] = rgba_[3];
      vP++;
      
      vBuffer[vP++] = aid[t]; // ID
    }
  
    p_pre = p-novpr;
    for (i=0; i<(novpr*2)-2; i+=2, p+=1, p_pre+=1) {
      iBuffer[iP++] = p;
      iBuffer[iP++] = p_pre;
      iBuffer[iP++] = p_pre+1;
    
      iBuffer[iP++] = p_pre+1;
      iBuffer[iP++] = p+1;
      iBuffer[iP++] = p;
    }
    iBuffer[iP++] = p;
    iBuffer[iP++] = p_pre;
    iBuffer[iP++] = p_pre-(novpr-1);

    iBuffer[iP++] = p_pre-(novpr-1);
    iBuffer[iP++] = p-(novpr-1);
    iBuffer[iP++] = p;
    
    p++; p_pre++;
  }

  this.buffer3.vP = vP;
  this.buffer3.iP = iP;
  return t;
};

// ** priestle smoothing for loop & sheet regions **
molmil.priestle_smoothing = function(points, from, to, skip, steps) {
  var s, nom = to-from, tmp = new Array(nom), local = new Array(nom);
  for (m=0; m<nom; m++) {tmp[m] = [0, 0, 0];}
  for (s=0; s<steps; s++) {
    for (m=1; m<nom-1; m++) {
      tmp[m][0] = (points[from+m-1][0]+points[from+m+1][0])*.5; tmp[m][1] = (points[from+m-1][1]+points[from+m+1][1])*.5; tmp[m][2] = (points[from+m-1][2]+points[from+m+1][2])*.5;
      tmp[m][0] = (tmp[m][0] + points[from+m][0])*.5; tmp[m][1] = (tmp[m][1] + points[from+m][1])*.5; tmp[m][2] = (tmp[m][2] + points[from+m][2])*.5;
    }
    for (m=1; m<nom-1; m++) {
      if (! skip.hasOwnProperty(m)) {
        points[from+m][0] = tmp[m][0]; points[from+m][1] = tmp[m][1]; points[from+m][2] = tmp[m][2];}
    }
  }
};

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

molmil.polynomialCalc = function(x, polynomial) {
  var i, y = polynomial[0];
  for (i=1; i<polynomial.length; i++) y += polynomial[i]*Math.pow(x, i);
  return y;
}

// ** prepare for secondary structure element representation; transport frame calculation **
molmil.prepare2DRepr = function (chain, mdl) {
  if (chain.modelsXYZ.length <= mdl) mdl = 0;

  var ha = 32*Math.PI/180, hb = -11*Math.PI/180, cha = Math.cos(ha), sha = Math.sin(ha), chb = Math.cos(hb), shb = Math.sin(hb), hhf = 4.7, ohf = 0.5, dhf = 5.2, hf, 
  //var ha = 0*Math.PI/180, hb = 0*Math.PI/180, cha = Math.cos(ha), sha = Math.sin(ha), chb = Math.cos(hb), shb = Math.sin(hb), hhf = 4.7, ohf = .5, 
  cvec = [0, 0, 0], rvec = [0, 0, 0], vec1 = [0, 0, 0], vec2 = [0, 0, 0], smoothFactor = molmil.configBox.smoothFactor, skip;
  
  if (chain.molecules.length < 2 || chain.isHet) return chain.displayMode = 0;
  var twoDcache = chain.twoDcache = [], m, previous_sndStruc, currentBlock, b, nor = chain.molecules.length, m0, m1, m2, m3, BN, temp = [], n, smooth, maxR;
  
  for (m=0; m<nor; m++) {
    if (! chain.molecules[m].CA) continue;
    if (chain.molecules[m].sndStruc != previous_sndStruc || chain.molecules[m].previous == null) {
      previous_sndStruc = chain.molecules[m].sndStruc;
      twoDcache.push(currentBlock = {molecules: [], xyz: [], sndStruc: previous_sndStruc});
    }
    currentBlock.molecules.push(chain.molecules[m]);
    
    /*if (chain.molecules[m].xna) {
      if (chain.molecules[m].P) m0 = chain.molecules[m].P.xyz;
      else {
        if (m > 1 && chain.molecules[m-1].P) {
          m0 = chain.molecules[m-1].P.xyz; m1 = [chain.modelsXYZ[mdl][m0], chain.modelsXYZ[mdl][m0+1], chain.modelsXYZ[mdl][m0+2]];
          m0 = chain.molecules[m-2].P.xyz; m1[0] -= chain.modelsXYZ[mdl][m0]; m1[1] -= chain.modelsXYZ[mdl][m0+1]; m1[2] -= chain.modelsXYZ[mdl][m0+2];
          m0 = chain.molecules[m-1].P.xyz; m1[0] += chain.modelsXYZ[mdl][m0]; m1[1] += chain.modelsXYZ[mdl][m0+1]; m1[2] += chain.modelsXYZ[mdl][m0+2];
          currentBlock.xyz.push(m1);
          temp.push(m1);
          continue;
        }
        else if (m < chain.molecules.length-1 && chain.molecules[m+1].P) {
          m0 = chain.molecules[m+1].P.xyz; m1 = [chain.modelsXYZ[mdl][m0], chain.modelsXYZ[mdl][m0+1], chain.modelsXYZ[mdl][m0+2]];
          m0 = chain.molecules[m+2].P.xyz; m1[0] -= chain.modelsXYZ[mdl][m0]; m1[1] -= chain.modelsXYZ[mdl][m0+1]; m1[2] -= chain.modelsXYZ[mdl][m0+2];
          m0 = chain.molecules[m+1].P.xyz; m1[0] += chain.modelsXYZ[mdl][m0]; m1[1] += chain.modelsXYZ[mdl][m0+1]; m1[2] += chain.modelsXYZ[mdl][m0+2];
          currentBlock.xyz.push(m1);
          temp.push(m1);
          continue;
        }
        else m0 = chain.molecules[m].P.xyz;
      }
    }
    else */
      m0 = chain.molecules[m].CA.xyz;
    m1 = [chain.modelsXYZ[mdl][m0], chain.modelsXYZ[mdl][m0+1], chain.modelsXYZ[mdl][m0+2]];
    currentBlock.xyz.push(m1);
    temp.push(m1);
  }
  nor = temp.length;
  

  for (b=0, n=0; b<twoDcache.length; b++) {
    currentBlock = twoDcache[b];
    
    if (currentBlock.molecules[0].xna) currentBlock.sndStruc = molmil.displayMode_XNA;
    currentBlock.isFirst = currentBlock.molecules[0].previous == null ||
                           currentBlock.molecules[0].previous.name == "ACE" ||
                           ! currentBlock.molecules[0].previous.CA;
    currentBlock.isLast = currentBlock.molecules[currentBlock.molecules.length-1].next == null || 
                          currentBlock.molecules[currentBlock.molecules.length-1].next.name == "NME" ||
                          ! currentBlock.molecules[currentBlock.molecules.length-1].next.CA; 
    if (currentBlock.sndStruc == 3) { // helix or turn...
      if (currentBlock.molecules.length > 2) {
        
        currentBlock.waypoints = []; currentBlock.waypoint_tangents = [];
        
        var base = [], x = [], y = [], z = [], deg = Math.floor(currentBlock.molecules.length / 8);
        if (deg > 5) deg = 5;
        else if (deg < 1) deg = 1;

        if (! currentBlock.isFirst) {
          base.push(-(Math.sqrt(Math.pow(temp[n-1][0]-temp[n][0], 2)+Math.pow(temp[n-1][1]-temp[n][1], 2)+Math.pow(temp[n-1][2]-temp[n][2], 2))));
          x.push(temp[n-1][0]); y.push(temp[n-1][1]); z.push(temp[n-1][2]);
        }
      
        
        for (m0=0; m0<currentBlock.molecules.length; m0++) {
          if (currentBlock.molecules[m0].displayMode == 31) currentBlock.rocket = true;
          if (m0 > 0) base.push(base[base.length-1]+Math.sqrt(Math.pow(temp[n+m0][0]-temp[n+m0-1][0], 2)+Math.pow(temp[n+m0][1]-temp[n+m0-1][1], 2)+Math.pow(temp[n+m0][2]-temp[n+m0-1][2], 2)));
          else base.push(0.0);

          x.push(temp[n+m0][0]); y.push(temp[n+m0][1]); z.push(temp[n+m0][2]);
        }
      
        if (! currentBlock.isLast) {
          base.push(base[m0-1]+Math.sqrt(Math.pow(temp[n+m0-1][0]-temp[n+m0][0], 2)+Math.pow(temp[n+m0-1][1]-temp[n+m0][1], 2)+Math.pow(temp[n+m0-1][2]-temp[n+m0][2], 2)));
          x.push(temp[n+m0][0]); y.push(temp[n+m0][1]); z.push(temp[n+m0][2]);
        }
      
        x = molmil.polynomialFit(base, x, deg);
        y = molmil.polynomialFit(base, y, deg);
        z = molmil.polynomialFit(base, z, deg);

        var nop = Math.round(currentBlock.molecules.length/2); if (nop < 2) nop = 2;
        if (molmil.configBox.liteMode) nop = 2;
        var sl = (base[base.length-1]-6.0)/(nop-1), tl = 3.0;
        
        for (m0=0; m0<nop; m0++) {
          currentBlock.waypoints.push([molmil.polynomialCalc(tl, x), molmil.polynomialCalc(tl, y), molmil.polynomialCalc(tl, z)]);
          tl += sl;
        }

        currentBlock.waypoint_tangents.push([currentBlock.waypoints[1][0]-currentBlock.waypoints[0][0], currentBlock.waypoints[1][1]-currentBlock.waypoints[0][1], currentBlock.waypoints[1][2]-currentBlock.waypoints[0][2]]);
        for (m0=1; m0<currentBlock.waypoints.length-1; m0++) currentBlock.waypoint_tangents.push([currentBlock.waypoints[m0+1][0]-currentBlock.waypoints[m0-1][0], currentBlock.waypoints[m0+1][1]-currentBlock.waypoints[m0-1][1], currentBlock.waypoints[m0+1][2]-currentBlock.waypoints[m0-1][2]]);
        m0 = currentBlock.waypoints.length-1;
        currentBlock.waypoint_tangents.push([currentBlock.waypoints[m0][0]-currentBlock.waypoints[m0-1][0], currentBlock.waypoints[m0][1]-currentBlock.waypoints[m0-1][1], currentBlock.waypoints[m0][2]-currentBlock.waypoints[m0-1][2]]);
        
        for (m0=0; m0<currentBlock.waypoint_tangents.length; m0++) vec3.normalize(currentBlock.waypoint_tangents[m0], currentBlock.waypoint_tangents[m0]);

        if (vec3.distance(currentBlock.waypoints[0], currentBlock.waypoints[currentBlock.waypoints.length-1]) < 2) {
          currentBlock.rocket = false;
          currentBlock.sndStruc = 1;
        }
        
        if (currentBlock.rocket) {
          temp[n] = currentBlock.waypoints[0];
          temp[n+currentBlock.molecules.length-1] = currentBlock.waypoints[currentBlock.waypoints.length-1];
        }
      }
      else currentBlock.sndStruc = 1;
    }
    n += currentBlock.molecules.length;
  }
  
  
  
  for (b=0, n=0; b<twoDcache.length; b++) {
    currentBlock = twoDcache[b];
    
    //console.log(currentBlock.molecules[currentBlock.molecules.length-1]);
    if (currentBlock.molecules.length < 3) currentBlock.sndStruc = 1;
    if (currentBlock.sndStruc != 3 && currentBlock.sndStruc != 4 && currentBlock.sndStruc != molmil.displayMode_XNA) { // not helix or turn...
      if (currentBlock.sndStruc == 2) { // sheet
        currentBlock.normals = [[]], BN = null;
        for (m=1; m<currentBlock.molecules.length-1; m++) {
          BN = vec3.add([0, 0, 0], currentBlock.xyz[m-1], currentBlock.xyz[m+1]);
          BN[0] /= 2; BN[1] /= 2; BN[2] /= 2;
          vec3.subtract(BN, currentBlock.xyz[m], BN);
          vec3.normalize(BN, BN);
          if (m > 1 && vec3.dot(currentBlock.normals[m-1], BN) < 0) vec3.negate(BN, BN); // there are still some problems with this, e.g. 4mie...
          currentBlock.normals.push(BN);
        }
        if (BN == null) { // length = 1
          if (! currentBlock.isFirst && ! currentBlock.isLast) {
            //calculated incorrectly...
            m0 = twoDcache[b-1].xyz[twoDcache[b-1].xyz.length-1];
            m1 = currentBlock.xyz[0];
            m2 = twoDcache[b+1].xyz[0];
            BN = vec3.add([0, 0, 0], m0, m2);
            BN[0] /= 2; BN[1] /= 2; BN[2] /= 2;
            vec3.subtract(BN, m1, BN);
            vec3.normalize(BN, BN);
            vec1[0] = m2[0] - m1[0]; vec1[1] = m2[1] - m1[1]; vec1[2] = m2[2] - m1[2]; vec3.normalize(vec1, vec1); vec3.cross(vec2, vec1, BN); vec3.cross(BN, vec2, vec1);
            currentBlock.normals.push(BN);
          }
          else {
            BN = [0, 0, 0]; // hack
            currentBlock.normals.push(BN);
          }
        }
        else currentBlock.normals.push(BN);
        while (currentBlock.normals.length < currentBlock.molecules.length) currentBlock.normals.push(BN);
        currentBlock.normals[0] = currentBlock.normals[1]; currentBlock.normals[currentBlock.normals.length-1] = currentBlock.normals[currentBlock.normals.length-2];
        smooth = new Array(currentBlock.normals.length);
        for (m0=0; m0<2; m0++) { // smooth two times...
          for (m=1; m<currentBlock.molecules.length-1; m++) {
            smooth[m] = [currentBlock.normals[m-1][0]+currentBlock.normals[m][0]+currentBlock.normals[m+1][0], currentBlock.normals[m-1][1]+currentBlock.normals[m][1]+currentBlock.normals[m+1][1], currentBlock.normals[m-1][2]+currentBlock.normals[m][2]+currentBlock.normals[m+1][2]]
            vec3.normalize(smooth[m], smooth[m]);
          }
          for (m=1; m<currentBlock.molecules.length-1; m++) currentBlock.normals[m] = smooth[m];
          currentBlock.normals[0] = currentBlock.normals[1]; currentBlock.normals[currentBlock.normals.length-1] = currentBlock.normals[currentBlock.normals.length-2];
        }
        for (m=0; m<currentBlock.molecules.length-1; m++) {
          vec1[0] = currentBlock.xyz[m+1][0] - currentBlock.xyz[m][0]; vec1[1] = currentBlock.xyz[m+1][1] - currentBlock.xyz[m][1]; vec1[2] = currentBlock.xyz[m+1][2] - currentBlock.xyz[m][2];
          vec3.cross(vec2, vec1, currentBlock.normals[m]);
          vec3.cross(currentBlock.normals[m], vec2, vec1);
          vec3.normalize(currentBlock.normals[m], currentBlock.normals[m]);
        }
        currentBlock.normals.push(currentBlock.normals[currentBlock.normals.length-1]);
      }
      if (smoothFactor > 0) {
        skip = {};
        for (m=0; m<currentBlock.molecules.length; m++) if (currentBlock.molecules[m].showSC) skip[m+(currentBlock.isFirst ? 0 : 1)] = true;
        if (! currentBlock.isLast && twoDcache[b+1].molecules[0].showSC) skip[currentBlock.molecules.length] = true;
        molmil.priestle_smoothing(temp, n-(currentBlock.isFirst ? 0 : 1), n+currentBlock.molecules.length+(currentBlock.isLast ? 0 : 1), skip, smoothFactor);
      }
    }
    n += currentBlock.molecules.length;
  }
  
  for (b=0, n=0; b<twoDcache.length; b++) {
    currentBlock = twoDcache[b];
    
    currentBlock.tangents = new Array(currentBlock.molecules.length+1);
    for (m=0; m<currentBlock.molecules.length+1; m++) currentBlock.tangents[m] = [0, 0, 0];
    if ((currentBlock.sndStruc == 3 || currentBlock.sndStruc == 4) && currentBlock.molecules.length < 3) currentBlock.sndStruc = 1;
    if (currentBlock.molecules[0].xna) hf = dhf;
    else hf = hhf;
    
    if (currentBlock.sndStruc == molmil.displayMode_XNA) { //???
      //currentBlock.binormals = new Array(currentBlock.molecules.length+1);
      m = 0;
      if (m+n < 1) {m1 = temp[0]; m3 = temp[2];}
      else if (m+n == nor-1) {m1 = temp[m+n-1]; m3 = temp[m+n];}
      else if (m+n < nor-1) {m1 = temp[m+n-1]; m3 = temp[m+n+1];}
      vec1[0] = m3[0] - m1[0]; vec1[1] = m3[1] - m1[1]; vec1[2] = m3[2] - m1[2];
      vec3.normalize(vec1, vec1);
      currentBlock.tangents[0] = [vec1[0]*hf, vec1[1]*hf, vec1[2]*hf];
      BN = currentBlock.molecules.length-(b == twoDcache.length-1);
      
      for (m=1; m<BN; m++) {
        m1 = temp[m+n-1]; m2 = temp[m+n]; m3 = temp[m+n+1];
        
        currentBlock.tangents[m][0] = m3[0]-m1[0]; currentBlock.tangents[m][1] = m3[1]-m1[1]; currentBlock.tangents[m][2] = m3[2]-m1[2];
        vec3.normalize(currentBlock.tangents[m], currentBlock.tangents[m]);
        currentBlock.tangents[m][0] *= hf;
        currentBlock.tangents[m][1] *= hf;
        currentBlock.tangents[m][2] *= hf;
      }
      
      if (m+n < 1) {m1 = temp[0]; m3 = temp[2];}
      else if (m+n == nor-1) {m1 = temp[m+n-1]; m3 = temp[m+n];}
      else if (m+n < nor-1) {m1 = temp[m+n-1]; m3 = temp[m+n+1];}
      vec1[0] = m3[0] - m1[0]; vec1[1] = m3[1] - m1[1]; vec1[2] = m3[2] - m1[2];
      vec3.normalize(vec1, vec1);
      currentBlock.tangents[currentBlock.tangents.length-1] = [vec1[0]*hf, vec1[1]*hf, vec1[2]*hf];
      
      if (BN != currentBlock.molecules.length && currentBlock.molecules.length > 2) {currentBlock.tangents[currentBlock.tangents.length-2] = currentBlock.tangents[currentBlock.tangents.length-1];}
    }
    else if (currentBlock.sndStruc == 3 || currentBlock.sndStruc == 4) { // helix or turn...
      currentBlock.binormals = new Array(currentBlock.molecules.length+1);
      m = 0;
      if (m+n < 1) {m1 = temp[0]; m3 = temp[2];}
      else if (m+n == nor-1) {m1 = temp[m+n-1]; m3 = temp[m+n];}
      else if (m+n < nor-1) {m1 = temp[m+n-1]; m3 = temp[m+n+1];}
      vec1[0] = m3[0] - m1[0]; vec1[1] = m3[1] - m1[1]; vec1[2] = m3[2] - m1[2];
      vec3.normalize(vec1, vec1);
      currentBlock.tangents[0] = [vec1[0]*hf, vec1[1]*hf, vec1[2]*hf];
      BN = currentBlock.molecules.length-(b == twoDcache.length-1);
      
      for (m=1; m<BN; m++) {
        m1 = temp[m+n-1]; m2 = temp[m+n]; m3 = temp[m+n+1];
        currentBlock.tangents[m][0] = m3[0]-m1[0]; currentBlock.tangents[m][1] = m3[1]-m1[1]; currentBlock.tangents[m][2] = m3[2]-m1[2];
        
        cvec[0] = m3[0] - m1[0]; cvec[1] = m3[1] - m1[1]; cvec[2] = m3[2] - m1[2];
        vec3.normalize(cvec, cvec);
        
        vec1[0] = m2[0] - m1[0]; vec1[1] = m2[1] - m1[1]; vec1[2] = m2[2] - m1[2];
        vec2[0] = m3[0] - m2[0]; vec2[1] = m3[1] - m2[1]; vec2[2] = m3[2] - m2[2];
        
        vec3.cross(rvec, vec1, vec2)
        vec3.normalize(rvec, rvec);
        
        vec1[0] = cha * rvec[0]; vec1[1] = cha * rvec[1]; vec1[2] = cha * rvec[2];
        vec2[0] = sha * cvec[0]; vec2[1] = sha * cvec[1]; vec2[2] = sha * cvec[2];
        currentBlock.binormals[m] = [vec1[0]+vec2[0], vec1[1]+vec2[1], vec1[2]+vec2[2]];

        vec1[0] = chb * cvec[0]; vec1[1] = chb * cvec[1]; vec1[2] = chb * cvec[2];
        vec2[0] = shb * rvec[0]; vec2[1] = shb * rvec[1]; vec2[2] = shb * rvec[2];
        
        currentBlock.tangents[m][0] = (vec1[0]+vec2[0])*hf; currentBlock.tangents[m][1] = (vec1[1]+vec2[1])*hf; currentBlock.tangents[m][2] = (vec1[2]+vec2[2])*hf;
        vec3.cross(vec1, currentBlock.binormals[m], currentBlock.tangents[m]);
        vec3.cross(currentBlock.binormals[m], currentBlock.tangents[m], vec1);
        vec3.normalize(currentBlock.binormals[m], currentBlock.binormals[m]);
      }
      
      if (m+n < 1) {m1 = temp[0]; m3 = temp[2];}
      else if (m+n == nor-1) {m1 = temp[m+n-1]; m3 = temp[m+n];}
      else if (m+n < nor-1) {m1 = temp[m+n-1]; m3 = temp[m+n+1];}
      vec1[0] = m3[0] - m1[0]; vec1[1] = m3[1] - m1[1]; vec1[2] = m3[2] - m1[2];
      vec3.normalize(vec1, vec1);
      currentBlock.tangents[currentBlock.tangents.length-1] = [vec1[0]*hf, vec1[1]*hf, vec1[2]*hf];

      
      if (BN != currentBlock.molecules.length) {
        currentBlock.tangents[currentBlock.tangents.length-2] = currentBlock.tangents[currentBlock.tangents.length-1];
        //currentBlock.binormals[currentBlock.binormals.length-2] = currentBlock.binormals[currentBlock.binormals.length-3];
        vec1 = currentBlock.binormals[currentBlock.binormals.length-3]; currentBlock.binormals[currentBlock.binormals.length-2] = [-vec1[0], -vec1[1], -vec1[2]]; // 2mp8, 3vg9
      }

      currentBlock.binormals[0] = currentBlock.binormals[1];
      currentBlock.binormals[currentBlock.binormals.length-1] = currentBlock.binormals[currentBlock.binormals.length-2];
    }
    else {
      maxR = currentBlock.sndStruc == 5 ? 144 : 60;
      if (temp.length < 3) {
        if (temp.length == 1) currentBlock.tangents[0] = currentBlock.tangents[1] = [1, 0, 0];
        else {
          currentBlock.tangents[0] = currentBlock.tangents[1] = currentBlock.tangents[2] = [temp[1][0] - temp[0][0], temp[1][1] - temp[0][1], temp[1][2] - temp[0][2]];
        }
      }
      else {
        for (m=0; m<currentBlock.molecules.length+1; m++) {
          if (m+n < 1) {m1 = temp[0]; m3 = temp[2];}
          else if (m+n == nor-1) {m1 = temp[m+n-1]; m3 = temp[m+n];}
          else if (m+n < nor-1) {m1 = temp[m+n-1]; m3 = temp[m+n+1];}
          vec1[0] = m3[0] - m1[0]; vec1[1] = m3[1] - m1[1]; vec1[2] = m3[2] - m1[2];
          if (vec1[0]*vec1[0] + vec1[1]*vec1[1] + vec1[2]*vec1[2] > maxR) {currentBlock.tangents[m] = currentBlock.tangents[m > 0 ? m-1 : m+1];}
          else {currentBlock.tangents[m][0] = vec1[0]*ohf; currentBlock.tangents[m][1] = vec1[1]*ohf; currentBlock.tangents[m][2] = vec1[2]*ohf;}
        }
        if (currentBlock.molecules[m-2].next == null && m+n-3 > -1) {currentBlock.tangents[m-1][0] = temp[m+n-2][0]-temp[m+n-3][0]; currentBlock.tangents[m-1][1] = temp[m+n-2][1]-temp[m+n-3][1]; currentBlock.tangents[m-1][2] = temp[m+n-2][2]-temp[m+n-3][2];}
      }
    }
    n += currentBlock.molecules.length;
  }
  
  var nextBlock;
  for (b=0; b<twoDcache.length; b++) {
    currentBlock = twoDcache[b];
    
    //console.log(b, currentBlock.molecules.length);
    
    if (currentBlock.sndStruc == 3 && ! currentBlock.rocket) { // helix...
      //BN = currentBlock.molecules.length-(b == twoDcache.length-1)-1;
      BN = currentBlock.molecules.length-(b == twoDcache.length-1 ? 1 : 0);
      for (m=1; m<BN; m++) {
        if (vec3.dot(currentBlock.binormals[m-1], currentBlock.binormals[m]) < 0) {
          nextBlock = {molecules: [], xyz: [], tangents: [], binormals:[], sndStruc: 3};
          currentBlock.nextBlock = nextBlock;
          currentBlock.Cresume = true; 
          nextBlock.Nresume = true; 
          nextBlock.invertedBinormals = ! currentBlock.invertedBinormals;
          nextBlock.isLast = currentBlock.isLast; currentBlock.isLast = false;
          
          for (n=m; n<currentBlock.binormals.length; n++) vec3.negate(currentBlock.binormals[n], currentBlock.binormals[n]);
          
          nextBlock.molecules = currentBlock.molecules.slice(m);
          nextBlock.tangents = currentBlock.tangents.slice(m);
          nextBlock.binormals = currentBlock.binormals.slice(m);
          nextBlock.xyz = currentBlock.xyz.slice(m);
          
          currentBlock.molecules = currentBlock.molecules.splice(0, m);
          currentBlock.tangents = currentBlock.tangents.splice(0, m+1);
          currentBlock.binormals = currentBlock.binormals.splice(0, m+1);
          currentBlock.xyz = currentBlock.xyz.splice(0, m);
          
          if (currentBlock.rocket) {
            nextBlock.rocket = nextBlock.skip = true;
            nextBlock.waypoints = currentBlock.waypoints;
            nextBlock.waypoint_tangents = currentBlock.waypoint_tangents;
          }
          
          if (currentBlock.molecules.length == 1) currentBlock.invertedBinormals = ! currentBlock.invertedBinormals;
          
          twoDcache.splice(b+1, 0, nextBlock);
          break;
        }
      }
      if (vec3.dot(currentBlock.binormals[m-1], currentBlock.binormals[m]) < 0) vec3.negate(currentBlock.binormals[m], currentBlock.binormals[m]);
    }
  }
};


// ** renderer object **

molmil.render = function (soup) { // render object
  this.canvas = null;
  
  this.reloadSettings();
  
  this.programs = [];
  
  this.clearCut = 0;
  this.fogStart = 0;
  this.camera = new molmil.glCamera();
  this.soup = soup;
  this.modelViewMatrix = mat4.create();
  this.projectionMatrix = mat4.create();
  
  this.pitch = 0;
  this.heading = 0;
  this.TransX = 0;
  this.TransY = 0;
  this.TransZ = 0;
  this.pitchAngle = 0;
  this.headingAngle = 0;
  
  this.TransB = [.5, .5, 0];
  
  this.animationMode = false;
  this.framesDefinition = []; // list of modelObject and polygonObject objects for each frame
  this.framesBuffer = []; // list of vertex data for each frame
  
  
  
  this.textures = {};
  this.FBOs = {};
  this.shaders = {};
  this.buffers = {};
  this.gl = null;
  this.modelId = 0;
  // new init...
  
};

// ** resets the buffer **
molmil.render.prototype.clear = function() {
  for (var i=0; i<this.programs.length; i++) {
    this.gl.deleteBuffer(this.programs[i].vertexBuffer);
    this.gl.deleteBuffer(this.programs[i].indexBuffer);
  }
  this.programs = [];
  this.program1 = this.program2 = this.program3 = this.program4 = this.program5 = undefined;
  
};

molmil.render.prototype.reloadSettings=function() {
  this.QLV = localStorage.getItem("molmil.settings_QLV");
  if (this.QLV == null) {
    this.QLV = 2;
    localStorage.setItem("molmil.settings_QLV", this.QLV)
  }
  else this.QLV = parseInt(this.QLV);
  if (molmil.configBox.liteMode) this.QLV = 1;
  if (this.gl) this.gl.clearColor.apply(this.gl, molmil.configBox.BGCOLOR);
  this.settings = {};
};

molmil.render.prototype.selectDefaultContext=function() {
  this.gl = this.defaultContext;
};

molmil.render.prototype.selectDataContext=function() {
  if (! this.dataContext) this.dataContext = this.canvas.getContext("webgl", {preserveDrawingBuffer: true}) || this.canvas.getContext("experimental-webgl", {preserveDrawingBuffer: true});
  this.gl = this.dataContext;
};

molmil.generateSphereImposterTexture = function(res, gl) {
  var lightPos = [50.0, 50.0, 100.0+250.0], u, v, r, theta, phi, pos = [0., 0., 0.], lightDir = [0., 0., 0.], viewDir = [0., 0., 0.], reflectDir = [0., 0., 0.], lambertian, specular;
  
  var out = new Uint8Array(res*res*4); // RGB set to lambertian, specular, boolean
  
  for (var i=0; i<res; i++) {
    u = ((i/res)*2.0)-1.;
    for (var j=0; j<res; j++) {
      v = ((j/res)*2.0)-1.;
      r = Math.sqrt(Math.pow(u, 2.0)+Math.pow(v, 2.0));
      if (r < 1.0) {
        pos[0] = u;
        pos[1] = v;
        pos[2] = Math.sqrt(1-pos[0]*pos[0]-pos[1]*pos[1]);
        
        lightDir[0] = lightPos[0]-pos[0]; lightDir[1] = lightPos[1]-pos[1]; lightDir[2] = lightPos[2]-pos[2]; vec3.normalize(lightDir, lightDir);
      
        lambertian = Math.min(Math.max(vec3.dot(pos, lightDir), 0.0), 1.0);
        
        specular = vec3.dot(pos, lightDir);
        reflectDir[0] = lightDir[0] - 2.0 * specular * pos[0];
        reflectDir[1] = lightDir[1] - 2.0 * specular * pos[1];
        reflectDir[2] = lightDir[2] - 2.0 * specular * pos[2];
        vec3.negate(viewDir, pos); vec3.normalize(viewDir, viewDir);
        specular = Math.pow(Math.max(vec3.dot(reflectDir, viewDir), 0.0), 64.0)*.5;

        out[((j*(res*4)) + (i*4)) + 0] = lambertian*255.;
        out[((j*(res*4)) + (i*4)) + 1] = specular*255.; // specular doesn't work properly...
        out[((j*(res*4)) + (i*4)) + 2] = pos[2]*255.;
        out[((j*(res*4)) + (i*4)) + 3] = 255.;
      }
      else {
        out[((j*(res*4)) + (i*4)) + 0] = 0.0;
        out[((j*(res*4)) + (i*4)) + 1] = 0.0;
        out[((j*(res*4)) + (i*4)) + 2] = 0.0;
        out[((j*(res*4)) + (i*4)) + 3] = 0.0;
      }
    }
  }

  var texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, res, res, 0, gl.RGBA, gl.UNSIGNED_BYTE, out);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.bindTexture(gl.TEXTURE_2D, null);
  texture.loaded = true;

  return texture;
}

// ** initiates the WebGL context **
molmil.render.prototype.initGL = function(canvas, width, height) {
  if (window.WebGL2RenderingContext && molmil.configBox.webGL2) {
    this.defaultContext = canvas.getContext("webgl2") || canvas.getContext("experimental-webgl2");
    if (this.defaultContext) molmil.configBox.webGL2 = true;
  }
  this.defaultContext = this.defaultContext || canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
  canvas.renderer = this;
  if (! this.defaultContext) {
    this.altCanvas = molmil.__webglNotSupported__(canvas);
    return false;
  }
  this.gl = this.defaultContext;
	this.gl.boundAttributes = {};
  
  molmil.configBox.OES_element_index_uint = this.gl.getExtension('OES_element_index_uint');
  
  this.textures.atom_imposter = molmil.generateSphereImposterTexture(128, this.gl);
  
  this.gl.INDEXINT = molmil.configBox.OES_element_index_uint ? this.gl.UNSIGNED_INT : this.gl.UNSIGNED_SHORT;
  

  this.width = width | canvas.width;
  this.height = height | canvas.height;
  
  this.gl.viewportWidth = this.width;
  this.gl.viewportHeight = this.height;
  
  canvas.onmousedown = molmil.handle_molmilViewer_mouseDown;
  document.onmouseup = molmil.handle_molmilViewer_mouseUp;
  document.onmousemove = molmil.handle_molmilViewer_mouseMove;
  
  canvas.addEventListener(molmil_dep.dBT.MFF ? "DOMMouseScroll" : "mousewheel", molmil.handle_molmilViewer_mouseScroll, false);
  canvas.addEventListener("touchstart", molmil.handle_molmilViewer_touchStart, false);
  canvas.addEventListener("touchmove", molmil.handle_molmilViewer_touchMove, false);
  canvas.addEventListener("touchend", molmil.handle_molmilViewer_touchEnd, false);
  
  this.gl.clearColor.apply(this.gl, molmil.configBox.BGCOLOR);
  this.gl.enable(this.gl.DEPTH_TEST);
  
  if (molmil.configBox.cullFace) {
    this.gl.enable(this.gl.CULL_FACE);
    this.gl.cullFace(this.gl.BACK);
  }
  
  this.canvas = canvas;
  
  var h = this.gl.getParameter(this.gl.ALIASED_LINE_WIDTH_RANGE);
  this.angle = h && h.length == 2 && h[0] == 1 && h[1] == 1;


  // add labels program here...
  this.billboardProgram = {};
  this.billboardProgram.data = this.soup.texturedBillBoards; this.billboardProgram.gl = this.gl; this.billboardProgram.renderer = this;
  this.billboardProgram.render = function(modelViewMatrix, COR) {    
    //first check for new/modified billboards (texturedBillBoards[i].status == false)
    var N = [], i, status = true;
    for (i=0; i<this.data.length; i++) {
      if (! this.data[i].status) {this.data[i].status = true; status = false;}
      if (! this.data[i].display) continue;
      N.push(this.data[i]);
    }
    
    if (! status) { // if the number of visible billboards has changed, rebuild the vertex array...
      var ssOffset = [[-1, +1], [+1, +1], [+1, -1], [-1, -1]], n, p = 0, vP = 0, vP16 = 0, iP = 0;
      var vBuffer = new Float32Array(N.length*4*4), iBuffer; // x, y, z, offset
      if (molmil.configBox.OES_element_index_uint) iBuffer = new Uint32Array(N.length*2*3);
      else iBuffer = new Uint16Array(N.length*2*3);
      var vBuffer16 = new Uint16Array(vBuffer.buffer);
      
      for (i=0; i<N.length; i++) {
        for (n=0; n<4; n++) {
          vBuffer[vP++] = N[i].settings.xyz[0];
          vBuffer[vP++] = N[i].settings.xyz[1];
          vBuffer[vP++] = N[i].settings.xyz[2];
      
          vBuffer16[vP16+6] = ssOffset[n][0];
          vBuffer16[vP16+7] = ssOffset[n][1];      
          vP++
    
          vP16 += 8;
        }
        iBuffer[iP++] = 3+p;
        iBuffer[iP++] = 2+p;
        iBuffer[iP++] = 1+p;
        iBuffer[iP++] = 3+p;
        iBuffer[iP++] = 1+p;
        iBuffer[iP++] = 0+p;
        p += 4;
      }
      
      var vbuffer = this.gl.createBuffer();
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vbuffer);
      this.gl.bufferData(this.gl.ARRAY_BUFFER, vBuffer, this.gl.STATIC_DRAW);
  
      var ibuffer = this.gl.createBuffer();
      this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, ibuffer);
      this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, iBuffer, this.gl.STATIC_DRAW);
  
      this.nElements = iBuffer.length;
      this.vertexBuffer = vbuffer;
      this.indexBuffer = ibuffer;
    }
    if (N == 0) return;
    
    if (! this.shader) {
      this.shader = this.renderer.shaders.billboardShader;
      this.attributes = this.shader.attributes;
    }
    
    // pre-render
    
    var normalMatrix = mat3.create();
    mat3.normalFromMat4(normalMatrix, modelViewMatrix);
      
    this.gl.useProgram(this.shader.program);
    this.gl.uniformMatrix4fv(this.shader.uniforms.modelViewMatrix, false, modelViewMatrix);
    this.gl.uniformMatrix3fv(this.shader.uniforms.normalMatrix, false, normalMatrix);
    this.gl.uniformMatrix4fv(this.shader.uniforms.projectionMatrix, false, this.renderer.projectionMatrix);
    this.gl.uniform3f(this.shader.uniforms.COR, COR[0], COR[1], COR[2]);
    this.gl.uniform1f(this.shader.uniforms.focus, this.renderer.fogStart);
    this.gl.uniform1f(this.shader.uniforms.fogSpan, this.renderer.fogStart+(this.renderer.clearCut*2));
      
    this.gl.uniform4f(this.shader.uniforms.backgroundColor, molmil.configBox.BGCOLOR[0], molmil.configBox.BGCOLOR[1], molmil.configBox.BGCOLOR[2], 1.0);

    // render
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer); 
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

    molmil.resetAttributes(this.gl);
    molmil.bindAttribute(this.gl, this.attributes.in_Position, 3, this.gl.FLOAT, false, 16, 0);
    molmil.bindAttribute(this.gl, this.attributes.in_ScreenSpaceOffset, 2, this.gl.SHORT, false, 16, 12);
    molmil.clearAttributes(this.gl);
    
    this.gl.enable(this.gl.BLEND);
    this.gl.blendFunc(this.gl.ONE, this.gl.ONE_MINUS_SRC_ALPHA);
    this.gl.uniform1f(this.shader.uniforms.scaleFactor, Math.sqrt(1000/this.renderer.width)*.000375 * (molmil.configBox.projectionMode == 2 ? 0.2 : 1.0));
    this.gl.depthMask(false);
    
    for (i=0; i<N.length; i++) {
      // set uniforms (e.g. screen-space translation...)
      
      this.gl.activeTexture(this.gl.TEXTURE0);
      this.gl.bindTexture(this.gl.TEXTURE_2D, N[i].texture);
      this.gl.uniform1i(this.shader.uniforms.textureMap, 0);
      this.gl.uniform2f(this.shader.uniforms.sizeOffset, N[i].texture.renderWidth, N[i].texture.renderHeight);
      this.gl.uniform3f(this.shader.uniforms.positionOffset, N[i].settings.dx, N[i].settings.dy, N[i].settings.dz);
      this.gl.uniform3f(this.shader.uniforms.color, N[i].settings.color[0]/255, N[i].settings.color[1]/255, N[i].settings.color[2]/255);
      
      this.gl.drawElements(this.gl.TRIANGLES, 6, this.gl.INDEXINT, i*24);
    }
    
    this.gl.disable(this.gl.BLEND);
    this.gl.depthMask(true);
    
  };
  this.billboardProgram.renderPicking = function() {};
  
  return true;
};

molmil.render.prototype.initRenderer = function() { // use this to initalize the renderer, such as call initShaders...
  this.initShaders(molmil.configBox.glsl_shaders);
  this.resizeViewPort();
  
  // new init
  
};

// ** initiates the shaders **

molmil.shaderEngine = {code: {}};

molmil.shaderEngine.recompile = function(renderer) {
  var global_defines = ""
  if (molmil.configBox.glsl_fog) global_defines += "#define ENABLE_FOG 1\n";
  if (renderer.settings.slab) global_defines += "#define ENABLE_SLAB 1\n"
  
  
  for (var s in renderer.shaders) renderer.shaders[s].compile(global_defines);
}

molmil.render.prototype.initShaders = function(programs) {
  var renderer = this;
  
  /*
  
  //molmil.configBox.EXT_frag_depth = this.gl.getExtension('EXT_frag_depth');
  //molmil.configBox.EXT_frag_depth = true;
  
  ["shaders/imposterPoints.glsl", "points", "", ["EXT_frag_depth"]],
  */
  
  var name, fragmentShader, vertexShader, e, ploc, programs = molmil.configBox.glsl_shaders, exts, bad;
  for (var p=0; p<programs.length; p++) {
    ploc = programs[p][0];
    name = programs[p][1] || ploc.replace(/\\/g,'/').replace( /.*\//, '' ).split(".")[0];
    exts = programs[p].length > 3 ? programs[p][3] : []; bad = false;
    for (var i=0; i<exts.length; i++) {
      if (! molmil.configBox[exts[i]]) molmil.configBox[exts[i]] = this.gl.getExtension(exts[i]);
      bad = bad || ! molmil.configBox[exts[i]];
    }
    if (bad) continue;
    
    if (! molmil.shaderEngine.code.hasOwnProperty(molmil.settings.src+ploc)) {
      var request = new molmil_dep.CallRemote("GET"); request.ASYNC = false;
      request.Send(molmil.settings.src+ploc);
      molmil.shaderEngine.code[molmil.settings.src+ploc] = request.request.responseText;
    }
  }

  var name, fragmentShader, vertexShader, e, ploc, defines, programs = molmil.configBox.glsl_shaders, program;
  for (var p=0; p<programs.length; p++) {
    ploc = programs[p][0];
    name = programs[p][1] || ploc.replace(/\\/g,'/').replace( /.*\//, '' ).split(".")[0];
    e = molmil.shaderEngine.code[molmil.settings.src+ploc];
    if (! e) continue;
    source = e.split("//#");
    program = JSON.parse(source[0]);
    program.name = name;
    program.vertexShader = source[1].substr(7);
    program.fragmentShader = source[2].substr(9);
    program.defines = programs[p][2] || "";
    program.compile = function(global_defines) {
      this.program = renderer.gl.createProgram();
      molmil.setupShader(renderer.gl, this.name+"_v", this.program, global_defines+this.defines+this.vertexShader, renderer.gl.VERTEX_SHADER);
      molmil.setupShader(renderer.gl, this.name+"_f", this.program, global_defines+this.defines+this.fragmentShader, renderer.gl.FRAGMENT_SHADER);
      renderer.gl.linkProgram(this.program);
      if (! renderer.gl.getProgramParameter(this.program, renderer.gl.LINK_STATUS)) {console.log("Could not initialise shaders for "+this.name);}
      renderer.gl.useProgram(this.program);
      for (e in this.attributes) {
        this.attributes[e] = renderer.gl.getAttribLocation(this.program, e);
      }
      for (e in this.uniforms) {this.uniforms[e] = renderer.gl.getUniformLocation(this.program, e);}
    };
    renderer.shaders[name] = program;
  }
    
  molmil.shaderEngine.recompile(renderer);
}

// ** initializes a shader **
molmil.setupShader = function (gl, name, program, src, type) {
  //var defines = "";
  //if (document.BrowserType.MSIE) defines += "# define MSIE";
  //src = defines+"\n"+src;
  var shader = gl.createShader(type);
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (! gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {console.log(name+":\n"+gl.getShaderInfoLog(shader)); return null;}
  gl.attachShader(program, shader);
  return shader;
}


// ** updates the atom selection **
molmil.render.prototype.updateSelection = function() {
  var selectionData = new Float32Array(this.soup.atomSelection.length*8*6), rgb = [255, 255, 0];  
  
  var r;
  
  for (var i=0, p=0, j; i<this.soup.atomSelection.length; i++) {
    if (this.soup.atomSelection[i].displayMode == 1) r = molmil_dep.getKeyFromObject(molmil.configBox.vdwR, this.soup.atomSelection[i].element, molmil.configBox.vdwR.DUMMY)*1.1;
    else r = 0.5;
    
    for (j=0; j<6; j++) {
      selectionData[p++] = this.soup.atomSelection[i].chain.modelsXYZ[this.modelId][this.soup.atomSelection[i].xyz];
      selectionData[p++] = this.soup.atomSelection[i].chain.modelsXYZ[this.modelId][this.soup.atomSelection[i].xyz+1];
      selectionData[p++] = this.soup.atomSelection[i].chain.modelsXYZ[this.modelId][this.soup.atomSelection[i].xyz+2];
    
      selectionData[p++] = rgb[0];
      selectionData[p++] = rgb[1];
      selectionData[p++] = rgb[2];
    
      if (j == 0 || j == 5) {
        selectionData[p++] = -r;
        selectionData[p++] = +r;
      }
      else if (j == 1) {
        selectionData[p++] = +r;
        selectionData[p++] = +r;
      }
      else if (j == 2 || j == 3) {
        selectionData[p++] = +r;
        selectionData[p++] = -r;
      }
      else if (j == 4) {
        selectionData[p++] = -r;
        selectionData[p++] = -r;
      }
    }
  }
  
  if (! this.buffers.atomSelectionBuffer) this.buffers.atomSelectionBuffer = this.gl.createBuffer();
  this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.atomSelectionBuffer);
  this.gl.bufferData(this.gl.ARRAY_BUFFER, selectionData, this.gl.STATIC_DRAW);
  
  this.buffers.atomSelectionBuffer.items = this.soup.atomSelection.length*6;
};

// create an api so that the buffers can be initialised for each model without uploading to the gpu...

molmil.render.prototype.selectFrame = function(i, detail_or) {
  this.modelId = molmil.geometry.modelId = i;
  molmil.geometry.reInitChains = true;
  molmil.geometry.generate(this.soup.structures, this, detail_or);
  this.initBD = true;
}

molmil.render.prototype.initBuffers = function() {
  molmil.geometry.generate(this.soup.structures, this);
  this.updateSelection();
  this.initBD = true;
};

// ** action when screen is clicked on **
molmil.render.prototype.renderPicking = function() {
  if (! this.initBD) return;
  this.gl.clearColor(0, 0, 0, 0);
  this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
  
  var COR = [0, 0, 0];
  var tmp = mat3.create(); mat3.fromMat4(tmp, this.modelViewMatrix);
  vec3.transformMat3(COR, this.soup.COR, tmp);

  for (var p=0; p<this.programs.length; p++) this.programs[p].renderPicking(this.modelViewMatrix, COR);
  
  
  this.gl.useProgram(null);  
};

// ** renders the scene **
molmil.render.prototype.render = function() {
  if (! this.canvas.update || ! this.initBD) return;
  if (this.canvas.update) {
    if (this.canvas.update != -1) {
      for (var c=0; c<this.soup.canvases.length; c++) if (this.soup.canvases[c] != this.canvas) this.soup.canvases[c].update = -1;
    }
    this.canvas.update = false;
    this.camera.pitchAngle = this.pitchAngle || this.pitch*Math.min(Math.max((Math.pow(Math.abs(this.camera.z), .1)*.25), .5), 2.);
    this.camera.headingAngle = this.headingAngle || this.heading*Math.min(Math.max((Math.pow(Math.abs(this.camera.z), .1)*.25), .5), 2.);
    
    if (this.TransX || this.TransY) {
      var invMat = mat4.invert(mat4.create(), this.projectionMatrix);
      var zPos = (-this.camera.z-molmil.configBox.zNear)/(molmil.configBox.zFar-molmil.configBox.zNear);
      
      
      var from = vec3.lerp([0, 0, 0], molmil.unproject(this.TransB[0], this.TransB[1], 0, invMat), molmil.unproject(this.TransB[0], this.TransB[1], 1, invMat), zPos);
      this.TransB[0] += this.TransX/this.width; this.TransB[1] -= this.TransY/this.height;
      var to = vec3.lerp([0, 0, 0], molmil.unproject(this.TransB[0], this.TransB[1], 0, invMat), molmil.unproject(this.TransB[0], this.TransB[1], 1, invMat), zPos);
      
      this.camera.x += 2*(to[0]-from[0]);
      this.camera.y += 2*(to[1]-from[1]);
    }
    this.camera.z += this.TransZ*Math.max(-this.camera.z/(this.width*.5), 0.05);
    
    if (this.camera.z > this.maxRange) this.camera.z = this.maxRange;
    if (this.camera.z < -(this.maxRange+molmil.configBox.zFar)) this.camera.z = -(this.maxRange+molmil.configBox.zFar);
  
    this.pitch=0, this.heading=0, this.TransX=0, this.TransY=0, this.TransZ = 0, this.pitchAngle = 0, this.headingAngle = 0;
    this.camera.positionCamera();
    
    this.modelViewMatrix = this.camera.generateMatrix();
  
    if (molmil.configBox.projectionMode == 2) {
      var zoomFraction = -(this.camera.z*2)/molmil.configBox.zFar;
      mat4.ortho(this.projectionMatrix, -this.width*zoomFraction, this.width*zoomFraction, -this.height*zoomFraction, this.height*zoomFraction, Math.max(molmil.configBox.zNear, 0.1), this.camera.z+(molmil.configBox.zFar*10));
    }
  }
  else this.canvas.update = false;

  this.clearCut = ((1.0-Math.abs(this.camera.QView[0]))*this.soup.stdXYZ[0])+((1.0-Math.abs(this.camera.QView[1]))*this.soup.stdXYZ[1])+((1.0-Math.abs(this.camera.QView[2]))*this.soup.stdXYZ[2]);
  this.fogStart = -this.camera.z-(this.clearCut*.5);
  if (this.fogStart < molmil.configBox.zNear+1) this.fogStart = molmil.configBox.zNear+1;

  // rendering
  
  var BGCOLOR = molmil.configBox.BGCOLOR.slice();
  if (BGCOLOR[3] == 0) BGCOLOR[0] = BGCOLOR[1] = BGCOLOR[2] = 0;
  
  var COR = [0, 0, 0];
  var tmp = mat3.create(); mat3.fromMat4(tmp, this.modelViewMatrix);
  vec3.transformMat3(COR, this.soup.COR, tmp);

  if (molmil.configBox.stereoMode) {
    if (! this.FBOs.hasOwnProperty("stereoLeft")) {
      this.FBOs.stereoLeft = new molmil.FBO(this.gl, this.width, this.height);
      this.FBOs.stereoLeft.addTexture("stereoLeft", this.gl.RGBA, this.gl.RGBA);//GL2.GL_RGB32F, this.gl.GL_RGB
      this.FBOs.stereoLeft.setup();
      
      this.FBOs.stereoRight = new molmil.FBO(this.gl, this.width, this.height);
      this.FBOs.stereoRight.addTexture("stereoRight", this.gl.RGBA, this.gl.RGBA);//GL2.GL_RGB32F, this.gl.GL_RGB
      this.FBOs.stereoRight.setup();
    }

    var tmpVal = this.modelViewMatrix[12];
    var sCC = molmil.configBox.stereoCameraConfig; //[bottom, top, a, b, c, eyeSep, convergence, zNear, zfar];
    var left, right, zNear = sCC[7], zFar = sCC[8];
    
    // left eye
    this.modelViewMatrix[12] = tmpVal - sCC[5]*.5;
    
    left = -sCC[3] * (zNear/sCC[6]);
    right = sCC[4] * (zNear/sCC[6]);
    mat4.frustum(this.projectionMatrix, left, right, sCC[0], sCC[1], zNear, zFar);
    
    if (molmil.configBox.stereoMode == 1) { // anaglyph
      this.FBOs.stereoLeft.bind();
      this.gl.clearColor.apply(this.gl, BGCOLOR); this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
      for (var p=0; p<this.programs.length; p++) if (this.programs[p].nElements) this.programs[p].render(this.modelViewMatrix, COR);
      this.FBOs.stereoLeft.unbind();
    }
    else if (molmil.configBox.stereoMode == 2) { // VR
      this.gl.viewport(this.width, 0, this.width, this.height);
      this.gl.scissor(this.width, 0, this.width, this.height);
      this.gl.clearColor.apply(this.gl, BGCOLOR); this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
      for (var p=0; p<this.programs.length; p++) if (this.programs[p].nElements) this.programs[p].render(this.modelViewMatrix, COR);
    }
    
    // right eye
    this.modelViewMatrix[12] = tmpVal + sCC[5]*.5;
    
    left = -sCC[4] * (zNear/sCC[6]);
    right = sCC[3] * (zNear/sCC[6]);
    mat4.frustum(this.projectionMatrix, left, right, sCC[0], sCC[1], zNear, zFar);
    
    if (molmil.configBox.stereoMode == 1) { // anaglyph
      this.FBOs.stereoRight.bind();
      this.gl.clearColor.apply(this.gl, BGCOLOR); this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
      for (var p=0; p<this.programs.length; p++) if (this.programs[p].nElements) this.programs[p].render(this.modelViewMatrix, COR);
      this.FBOs.stereoRight.unbind();
    }
    else if (molmil.configBox.stereoMode == 2) { // VR
      this.gl.viewport(0, 0, this.width, this.height);
      this.gl.scissor(0, 0, this.width, this.height);
      for (var p=0; p<this.programs.length; p++) if (this.programs[p].nElements) this.programs[p].render(this.modelViewMatrix, COR);
    }
    
    if (molmil.configBox.stereoMode == 1) {
      var shader = this.shaders.anaglyph;
    
      this.gl.clearColor.apply(this.gl, BGCOLOR); this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    
      this.gl.useProgram(shader.program);
      
      this.FBOs.stereoLeft.bindTextureToUniform("stereoLeft", shader.uniforms.stereoLeft, 0);
      this.FBOs.stereoRight.bindTextureToUniform("stereoRight", shader.uniforms.stereoRight, 1);
    
      var buffer = this.gl.createBuffer();
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
      this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array([-1.0, -1.0, 1.0, -1.0, -1.0,  1.0, -1.0,  1.0, 1.0, -1.0, 1.0,  1.0]), this.gl.STATIC_DRAW);
      
      molmil.resetAttributes(this.gl);
      molmil.bindAttribute(this.gl, shader.attributes.in_Position, 2, this.gl.FLOAT, false, 0, 0);
      molmil.clearAttributes(this.gl);
      
      this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
    }
    
    // reset
    this.modelViewMatrix[12] = tmpVal;
  }
  else {
    this.gl.clearColor.apply(this.gl, BGCOLOR);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    for (var p=0; p<this.programs.length; p++) {
      if (this.programs[p].nElements) this.programs[p].render(this.modelViewMatrix, COR);
    }
    this.billboardProgram.render(this.modelViewMatrix, COR);
  }
  
  if (this.buffers.atomSelectionBuffer) { // this doesn't work properly with stereoscopy...
    this.renderAtomSelection(this.modelViewMatrix, COR);
  }
  
  if (this.onRenderFinish) this.onRenderFinish();
  
  this.gl.useProgram(null);
}

molmil.render.prototype.initFBOs = function() {
  if ("scene" in this.FBOs) {
    this.FBOs.depth.resize(this.width, this.height);
    this.FBOs.scene.resize(this.width, this.height);
  }
  else {
    this.FBOs.depth = new molmil.FBO(this.gl, this.width, this.height);
    this.FBOs.depth.addTexture("depthBuffer", this.gl.RGBA, this.gl.RGBA);//GL2.GL_RGB32F, this.gl.GL_RGB
    this.FBOs.depth.setup();
  
    this.FBOs.scene = new molmil.FBO(this.gl, this.width, this.height);
    this.FBOs.scene.addTexture("colourBuffer", this.gl.RGBA, this.gl.RGBA);//GL2.GL_RGB32F, this.gl.GL_RGB
    this.FBOs.scene.setup();
  }
};

molmil.render.prototype.resizeViewPort = function() {
  this.width = this.canvas.width; this.height = this.canvas.height;
  if (molmil.configBox.stereoMode == 2) this.width *= 0.5;
  if (molmil.configBox.projectionMode == 1) {
    mat4.perspective(this.projectionMatrix, molmil.configBox.camera_fovy*(Math.PI/360), this.width/this.height, molmil.configBox.zNear, molmil.configBox.zFar);
  }

  var convergence = molmil.configBox.zNear * molmil.configBox.stereoFocalFraction;
  var eyeSep = convergence/molmil.configBox.stereoEyeSepFraction;
  var top, bottom;
  top = molmil.configBox.zNear * Math.tan(molmil.configBox.camera_fovy/2) * .25;
  bottom = -top;
  a = (this.width/this.height) * Math.tan(molmil.configBox.camera_fovy/2) * convergence;
  b = a - (eyeSep/2);
  c = a + (eyeSep/2);
  
  delete this.FBOs.stereoLeft;
  
  molmil.configBox.stereoCameraConfig = [bottom, top, a, b, c, eyeSep, convergence, molmil.configBox.zNear*.25, molmil.configBox.zFar*.25];
  
  this.gl.viewport(0, 0, this.width, this.height);
  //this.initFBOs();
};

molmil.render.prototype.renderAtomSelection = function(modelViewMatrix, COR) {
  if (! this.buffers.atomSelectionBuffer.items) return;
  this.gl.useProgram(this.shaders.atomSelection.program);
  this.gl.uniform3f(this.shaders.atomSelection.uniforms.COR, COR[0], COR[1], COR[2]);
  this.gl.uniformMatrix4fv(this.shaders.atomSelection.uniforms.modelViewMatrix, false, modelViewMatrix);
  this.gl.uniformMatrix4fv(this.shaders.atomSelection.uniforms.projectionMatrix, false, this.projectionMatrix);
    
  this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.atomSelectionBuffer);

  molmil.resetAttributes(this.gl);
  molmil.bindAttribute(this.gl, this.shaders.atomSelection.attributes.in_Position, 3, this.gl.FLOAT, false, 32, 0);
  molmil.bindAttribute(this.gl, this.shaders.atomSelection.attributes.in_Colour, 3, this.gl.FLOAT, false, 32, 12);
  molmil.bindAttribute(this.gl, this.shaders.atomSelection.attributes.in_ScreenSpaceOffset, 2, this.gl.FLOAT, false, 32, 24);
  molmil.clearAttributes(this.gl);
  
  this.gl.enable(this.gl.BLEND); if (molmil.configBox.cullFace) {this.gl.disable(this.gl.CULL_FACE);}
  this.gl.blendEquation(this.gl.FUNC_ADD); this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
  
  this.gl.drawArrays(this.gl.TRIANGLES, 0, this.buffers.atomSelectionBuffer.items);
  
  if (molmil.configBox.cullFace) {this.gl.enable(this.gl.CULL_FACE);} this.gl.disable(this.gl.BLEND);
};

// fbo

molmil.FBO = function (gl, width, height) {
  this.width = width; this.height = height; this.gl = gl;
  this.textures = {}; // textureID, GLTextureID, colourNumber, internalFormat, format
  this.colourNumber = 0;
  this.fbo = null;
  this.depthBuffer = null;
}

molmil.FBO.prototype.addTexture=function(textureID, internalFormat, format) {
  if (textureID in this.textures) {this.gl.bindTexture(this.gl.TEXTURE_2D, this.textures[textureID][0]);}
  else {
    var texture = this.gl.createTexture();
    this.textures[textureID] = [texture, this.colourNumber++, internalFormat, format];
    this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
  }
  this.gl.texImage2D(this.gl.TEXTURE_2D, 0, internalFormat, this.width, this.height, 0, format, this.gl.UNSIGNED_BYTE, null);
  this.gl.bindTexture(this.gl.TEXTURE_2D, null);
};

molmil.FBO.prototype.setup=function() {
  if (this.fbo != null) this.rebindTextures(true);
  else {
    this.fbo = this.gl.createFramebuffer();
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.fbo);
    this.rebindTextures(false);
    this.depthBuffer = this.gl.createRenderbuffer();
    this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, this.depthBuffer);
    this.gl.renderbufferStorage(this.gl.RENDERBUFFER, this.gl.DEPTH_COMPONENT16, this.width, this.height); // this.gl.DEPTH_COMPONENT16 --> GL_DEPTH_COMPONENT24
    this.gl.framebufferRenderbuffer(this.gl.FRAMEBUFFER, this.gl.DEPTH_ATTACHMENT, this.gl.RENDERBUFFER, this.depthBuffer);
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
  }
};

molmil.FBO.prototype.rebindTextures=function(unbind) {
  this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.fbo);
  var textureList = [];
  for (var t in this.textures) {
    this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0+this.textures[t][1], this.gl.TEXTURE_2D, this.textures[t][0], 0);
    textureList.push(this.gl.COLOR_ATTACHMENT0+this.textures[t][1]);
  }
  //this.gl.drawBuffers(textureList.length, textureList);
  this.gl.framebufferRenderbuffer(this.gl.FRAMEBUFFER, this.gl.DEPTH_ATTACHMENT, this.gl.RENDERBUFFER, this.depthBuffer);
  if (unbind) this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
  
};

molmil.FBO.prototype.bindTextureToUniform=function(textureID, uniformLocation, bindLocation) {
  this.gl.activeTexture(this.gl.TEXTURE0+bindLocation);
  this.gl.bindTexture(this.gl.TEXTURE_2D, this.textures[textureID][0]);
  this.gl.uniform1i(uniformLocation, bindLocation);
};

molmil.FBO.prototype.resize=function(width, height) {
  if (width == this.width && height == this.height) return;
  this.width = width; this.height = height;
  for (var t in this.textures) this.addTexture(t, this.textures[t][2], this.textures[t][3]);
  this.rebindTextures(false);
  this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, this.depthBuffer);
  this.gl.renderbufferStorage(this.gl.RENDERBUFFER, this.gl.DEPTH_COMPONENT16, this.width, this.height); 
  this.gl.framebufferRenderbuffer(this.gl.FRAMEBUFFER, this.gl.DEPTH_ATTACHMENT, this.gl.RENDERBUFFER, this.depthBuffer);
  this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
};

molmil.FBO.prototype.bind=function() {this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.fbo);};

molmil.FBO.prototype.unbind=function() {this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);};

// ** camera object **

molmil.glCamera = function () {this.reset();}

molmil.glCamera.prototype.reset = function() {
  this.x = this.y = this.z = this.pitchAngle = this.headingAngle = 0.0;
  this.QPitch = quat.create();
  this.QHeading = quat.create();
  this.QView = quat.create();
  this.pitchAngle = this.headingAngle = 0.0;
}

molmil.glCamera.prototype.generateMatrix = function() {
  var matrix = mat4.create(); mat4.fromQuat(matrix, this.QView);
  matrix[12] = this.x;
  matrix[13] = this.y;
  matrix[14] = this.z;
  return matrix;
}

molmil.glCamera.prototype.positionCamera = function() {
  quat.setAxisAngle(this.QPitch, [1, 0, 0], (this.pitchAngle/180)*Math.PI);
  quat.setAxisAngle(this.QHeading, [0, 1, 0], (this.headingAngle/180)*Math.PI);
  var q = quat.create();
  quat.multiply(q, this.QPitch, this.QHeading);
  quat.multiply(this.QView, q, this.QView);
  this.headingAngle = this.pitchAngle = 0.0;
}

// ** mouse/touch interface helper fucntions **

molmil.handle_molmilViewer_mouseDown = function (event) {
  molmil.activeCanvas = this;
  molmil.mouseDown = 1;
  molmil.mouseDownS[event.which] = 1;
  molmil.Xcoord = event.clientX;
  molmil.Ycoord = event.clientY;
  molmil.Zcoord = event.clientY;
  molmil.mouseMoved = false;
  document.oncontextmenu = molmil.disableContextMenu;
}

molmil.disableContextMenu = function (e) {
  if (e.stopPropagation) e.stopPropagation();
  if (e.preventDefault) e.preventDefault();
  e.cancelBubble = true;
  e.cancel = true;
  e.returnValue = false;
  return false;
} 

molmil.getOffset = function (evt) {
  var el = evt.target, x = 0, y = 0;

  while (el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {
    x += el.offsetLeft - el.scrollLeft;
    y += el.offsetTop - el.scrollTop;
    el = el.offsetParent;
  }

  x = evt.clientX - x;
  y = evt.clientY - y;

  return { x: x, y: y };
}

molmil.handle_molmilViewer_mouseUp = function (event) {
  var activeCanvas = molmil.activeCanvas;
  if (! molmil.mouseMoved && activeCanvas) {
    if (event.ctrlKey != activeCanvas.atomCORset) {
      if (event.ctrlKey) activeCanvas.molmilViewer.setCOR();
      else activeCanvas.molmilViewer.resetCOR();
      activeCanvas.renderer.modelViewMatrix = activeCanvas.renderer.camera.generateMatrix();
    }
    if (activeCanvas.isFullScreen) var offset = {x: event.screenX, y: event.screenY};
    else var offset = molmil.getOffset(event);
    var dpr = window.devicePixelRatio || 1;
    activeCanvas.renderer.soup.selectObject(offset.x*dpr, offset.y*dpr, event);
    if (event.which == 3) {
      activeCanvas.renderer.soup.UI.showContextMenuAtom(event.clientX, event.clientY, event.pageX);
    }
  }

  molmil.mouseDownS[event.which] = 0;
  if (molmil_dep.dBT.mac && ! event.ctrlKey && molmil.mouseDownS[3]) molmil.mouseDownS[3] = 0;

  var nm = true;
  for (var e in molmil.mouseDownS) if (molmil.mouseDownS[e]) {nm = false; break;}
  molmil.mouseDown = nm ? 0 : 1;
  if (nm) {
    setTimeout(function() {document.oncontextmenu = null;}, 10);
    activeCanvas = null;
  }
  else {
    event.preventDefault();
    return false;
  }
}

molmil.handle_molmilViewer_mouseMove = function (event) {
  var activeCanvas = molmil.activeCanvas;
  if (! molmil.mouseDown || ! activeCanvas) {return;}
  molmil.mouseMoved = true;
  if (molmil.mouseDownS[2] || (molmil.mouseDownS[1] && molmil.mouseDownS[3]) || (molmil.mouseDownS[1] && event.shiftKey)) {
    activeCanvas.renderer.TransX += (event.clientX-molmil.Xcoord)*.5;
    activeCanvas.renderer.TransY += (event.clientY-molmil.Ycoord)*.5;
    molmil.Xcoord = event.clientX;
    molmil.Zcoord = molmil.Ycoord = event.clientY;
  }
  else if (molmil.mouseDownS[1]) {
    activeCanvas.renderer.heading += event.clientX - molmil.Xcoord;
    activeCanvas.renderer.pitch += event.clientY - molmil.Ycoord;
    molmil.Xcoord = event.clientX;
    molmil.Ycoord = event.clientY;
  }
  else if (molmil.mouseDownS[3]) {
    activeCanvas.renderer.TransZ = (event.clientY-molmil.Zcoord);
    molmil.Zcoord = event.clientY;
  }
  if (event.ctrlKey != activeCanvas.atomCORset) {
    if (event.ctrlKey) activeCanvas.molmilViewer.setCOR();
    else activeCanvas.molmilViewer.resetCOR();
  }
  
  activeCanvas.update = true;
    
  event.preventDefault();
}

molmil.handle_molmilViewer_mouseScroll = function (event) {
  event.target.renderer.TransZ -= (event.wheelDelta || -event.detail*40);
  event.target.update = true;
  try {event.preventDefault();}
  catch (e) {}
  return false;
}

molmil.onDocumentMouseMove = function (event) { // maybe deprecated
  if (molmil.mouseXstart == null) {molmil.mouseXstart = event.clientX; molmil.mouseYstart = event.clientY;}
  mouseX = event.clientX-molmil.mouseXstart;
  mouseY = event.clientY-molmil.mouseYstart;
  molmil.mouseXstart = event.clientX; molmil.mouseYstart = event.clientY;
}

molmil.handle_molmilViewer_touchStart = function (event) {
  if (document.body.onmousedown) {
    document.body.onmousedown();
    document.body.onmousedown = null;
  }
  molmil.activeCanvas = this;
  molmil.touchList = [];
  for (var t=0; t<event.touches.length; t++) molmil.touchList.push([event.touches[t].clientX, event.touches[t].clientY]);
  if (molmil.touchList.length == 1) {
    molmil.touchMode = 1;
    molmil.previousTouchEvent = event;
    molmil.longTouchTID = setTimeout(molmil.handle_molmilViewer_touchHold, 500);
  }
  else if (molmil.touchList.length == 2) {
    var D = vec2.distance([0, 0], [screen.width, screen.height]);
    var b = vec2.distance(molmil.touchList[0], molmil.touchList[1]);
    if (b/D < 0.075) molmil.touchMode = 3;
    else molmil.touchMode = 2;
  }
  event.preventDefault();
  //touchMode = 0;
}

molmil.handle_molmilViewer_touchHold = function () {
  if (! molmil.longTouchTID) return;
  if (molmil.previousTouchEvent) {
    if (Math.sqrt((Math.pow(molmil.previousTouchEvent.touches[0].clientX - molmil.touchList[0][0], 2)) + (Math.pow(molmil.previousTouchEvent.touches[0].clientY - molmil.touchList[0][1], 2))) < 1) {
      if (molmil.activeCanvas.isFullScreen) var offset = {x: molmil.previousTouchEvent.touches[0].screenX, y: molmil.previousTouchEvent.touches[0].screenY};
      else var offset = molmil.getOffset(molmil.previousTouchEvent.touches[0]);
      var dpr = window.devicePixelRatio || 1;
      molmil.activeCanvas.renderer.soup.selectObject(offset.x*dpr, offset.y*dpr, event);
    }
    molmil.activeCanvas.renderer.soup.UI.showContextMenuAtom(molmil.previousTouchEvent.touches[0].clientX, molmil.previousTouchEvent.touches[0].clientY, molmil.previousTouchEvent.touches[0].pageX);
  }
  
  molmil.longTouchTID = null; molmil.previousTouchEvent = null;
}

molmil.handle_molmilViewer_touchMove = function (event) {
  if (! molmil.touchList.length || ! molmil.activeCanvas) {return;}
  if (molmil.longTouchTID) {
    clearTimeout(molmil.longTouchTID);
    molmil.longTouchTID = null; //previousTouchEvent = event;
  }
  var tmp = [];

  for (var t=0; t<event.touches.length; t++) tmp.push([event.touches[t].clientX, event.touches[t].clientY]);

  if (molmil.touchMode == 1) {
    molmil.activeCanvas.renderer.heading += tmp[0][0] - molmil.touchList[0][0];
    molmil.activeCanvas.renderer.pitch += tmp[0][1] - molmil.touchList[0][1];
  }
  else if (molmil.touchMode == 2) {
    molmil.activeCanvas.renderer.TransZ = (vec2.distance(tmp[0], tmp[1])-vec2.distance(molmil.touchList[0], molmil.touchList[1]))*5.0;
  }
  else if (molmil.touchMode == 3) {
    var D = vec2.distance([0, 0], [screen.width, screen.height]);
    var b = vec2.distance(molmil.touchList[0], molmil.touchList[1]);
    if (b/D < 0.075) {
      molmil.activeCanvas.renderer.TransX = ((tmp[0][0]+tmp[1][0])/2)-((molmil.touchList[0][0]+molmil.touchList[1][0])/2);
      molmil.activeCanvas.renderer.TransY = ((tmp[0][1]+tmp[1][1])/2)-((molmil.touchList[0][1]+molmil.touchList[1][1])/2);
    }
  }
  molmil.touchList = tmp;
  
  molmil.activeCanvas.update = true;
  
  event.preventDefault();
}

molmil.handle_molmilViewer_touchEnd = function () {
  if (molmil.previousTouchEvent && molmil.touchMode == 1) {
    if (Math.sqrt((Math.pow(molmil.previousTouchEvent.touches[0].clientX - molmil.touchList[0][0], 2)) + (Math.pow(molmil.previousTouchEvent.touches[0].clientY - molmil.touchList[0][1], 2))) < 1) {
      if (molmil.activeCanvas.isFullScreen) var offset = {x: molmil.previousTouchEvent.touches[0].screenX, y: molmil.previousTouchEvent.touches[0].screenY};
      else var offset = molmil.getOffset(molmil.previousTouchEvent.touches[0]);
      var dpr = window.devicePixelRatio || 1;
      molmil.activeCanvas.renderer.soup.selectObject(offset.x*dpr, offset.y*dpr, event);
    }
  }

  molmil.touchList = []; molmil.touchMode = 0; molmil.longTouchTID = null;
}


molmil.setOnContextMenu = function (obj, func) {
  obj.oncontextmenu = func;

  obj.addEventListener("touchstart", molmil.handle_contextMenu_touchStart, false);
  obj.addEventListener("touchend", molmil.handle_contextMenu_touchEnd, false);
}

molmil.handle_contextMenu_touchStart = function (event) {
  previousTouchEvent = event;
  longTouchTID = setTimeout(molmil.handle_contextMenu_touchHold, 500);
  event.preventDefault();
}

molmil.handle_contextMenu_touchHold = function () {
  if (! longTouchTID) return;
  longTouchTID = null;
  previousTouchEvent.touches[0].target.oncontextmenu(previousTouchEvent.touches[0]);
  previousTouchEvent = null;
}

molmil.handle_contextMenu_touchEnd = function (event) {
  if (previousTouchEvent) previousTouchEvent.touches[0].target.onclick();
  longTouchTID = null; clearTimeout(longTouchTID);
}

// UI


// ** menu interface **

molmil.UI = function (soup) {
  this.soup = soup;
  this.canvas = soup.canvas;
  this.LM = null;
  this.RM = null;
  // handles the molmil UI functions:
  //  - options menu on the left side (e.g. open, etc)
  //  - structure menu on the right side (tree of structures/chains/residues)
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
  
  // also set full screen handlers

  var CANVAS = this.canvas

  var fullScreenChange = function(e) {
    var canvas = document.molmil_FSC;
    if (canvas != CANVAS) return;
    var dpr = window.devicePixelRatio || 1;
    if (! canvas.isFullScreen) {
      canvas.renderer.width = canvas.width = screen.width*dpr;
      canvas.renderer.height = canvas.height = screen.height*dpr;
      canvas.style.width = screen.width+"px";
      canvas.style.height = screen.height+"px";
      canvas.isFullScreen = true;
    }
    else {
      canvas.renderer.width = canvas.width = canvas.defaultSize[0] * dpr;
      canvas.renderer.height = canvas.height = canvas.defaultSize[1] * dpr;
      canvas.style.width = canvas.defaultSize[0]+"px";
      canvas.style.height = canvas.defaultSize[1]+"px";
      canvas.isFullScreen = false;
      document.molmil_FSC = null;
    }
    canvas.renderer.resizeViewPort(); canvas.update = true; canvas.renderer.render();
  };
  
  document.addEventListener("webkitfullscreenchange", fullScreenChange, false);
  document.addEventListener("mozfullscreenchange", fullScreenChange, false);
  document.addEventListener("MSFullscreenChange", fullScreenChange, false);
  document.addEventListener("fullscreenchange", fullScreenChange, false);
};

molmil.UI.prototype.deleteEntry=function(entry) {
};

molmil.UI.prototype.displayEntry=function(entry, dm) {
  if (entry.ref) molmil.displayEntry(entry.ref, dm, true, this.soup);
  document.body.onmousedown();
};

// ** color menu **
molmil.UI.prototype.colorEntry=function(entry, cm) {
  if (entry.ref) {
    if (cm == molmil.colorEntry_Custom) {      
      var popup = molmil_dep.dcE("div");
      popup.setClass("molmil_menu_popup");
      popup.pushNode("span", "Color by: ");

      var ci = popup.pushNode("input");
      ci.type = "color"; ci.value = "#FFFFFF";
      
      var apply = popup.pushNode("button", "Apply"); apply.style.marginLeft = "1em"; apply.entry = entry; apply.ci = ci; apply.popup = popup; apply.soup = this.soup; apply.UI = this;
      apply.onclick = function() {
        var rgba = molmil.hex2rgb(this.ci.value); rgba.push(255);
        if (this.entry.mtype == 3.1) {
          entry.ref.rgba = rgba;
          this.UI.soup.renderer.initBuffers();
          this.UI.soup.renderer.canvas.update = true;
        }
        else if (this.entry.mtype == 3.2) {
          for (a=0; a<entry.ref.atoms.length; a++) entry.ref.atoms[a].rgba = rgba;
          this.UI.soup.renderer.initBuffers();
          this.UI.soup.renderer.canvas.update = true;
        }
        else {
          molmil.colorEntry(this.entry.ref, molmil.colorEntry_Custom, rgba, true, this.soup); // final variable should hold an rgba value [r, g, b, a]
        }
        this.popup.parentNode.removeChild(this.popup);
      };
      this.LM.parentNode.pushNode(popup);
    }
    else molmil.colorEntry(entry.ref, cm, null, true, this.soup);
  }
  document.body.onmousedown();
};

molmil.UI.prototype.showColorMenu=function(ref, entry) {
  if (ref.subMenu) {
    ref.subMenu.style.zIndex = 9999;
    clearTimeout(ref.subMenu.TID);
    ref.subMenu.style.display = "";
    return;
  }
  var pos = molmil_dep.findPos(ref);
  var menu = ref.subMenu = molmil_dep.dcE("div");
  
  menu.className = "contextMenu cM_sub";
  //if (entry.inv) {menu.style.left = "auto"; menu.style.right = "10.75em";}
  if (ref.inv || entry.inv) {menu.style.left = "auto"; menu.style.right = ((ref.parentNode.clientWidth/molmil_dep.fontSize)+1.8)+"em";}
  else {menu.style.left = ((ref.parentNode.clientWidth/molmil_dep.fontSize)+1.8)+"em";}
  var item, UI=this;
  
  var addEntry=function(name, action, hover) {
    item = menu.pushNode("div", name);
    item.className = "contextMenu_E";
    item.UI = UI; item.entry = entry;
    item.onclick = action;
    if (hover) {
      item.onmouseover = action;
      item.next = item.pushNode("span", ">");
    }
    else item.addEventListener("touchstart", function() {this.onclick();}, false);
  };

  if (entry.mtype != 3.1 && entry.mtype != 3.2) addEntry("Default", function() {this.UI.colorEntry(entry, 1);});
  
  if (entry.mtype != 3.2) addEntry("Structure", function() {
    if (entry.mtype == 3.1) { // cartoon
      var mol = entry.ref;
      mol.rgba = molmil_dep.getKeyFromObject(molmil.configBox.sndStrucColor, mol.sndStruc, molmil.configBox.sndStrucColor[1]);
      this.UI.soup.renderer.initBuffers();
      this.UI.soup.renderer.canvas.update = true;
      document.body.onmousedown();
    }
    else this.UI.colorEntry(entry, 2);
  });
  if (entry.mtype != 3.1) addEntry("Atom (CPK)", function() {
    if (entry.mtype == 3.2) {
      var mol = entry.ref;
      for (a=0; a<mol.atoms.length; a++) mol.atoms[a].rgba = molmil_dep.getKeyFromObject(molmil.configBox.elementColors, mol.atoms[a].element, molmil.configBox.elementColors.DUMMY);
      this.UI.soup.renderer.initBuffers();
      this.UI.soup.renderer.canvas.update = true;
      document.body.onmousedown();
    }
    else this.UI.colorEntry(entry, 3);
  });
  if (entry.mtype == 1 || entry.mtype == 2 || entry.mtype == .5) {
    addEntry("Group", function() {this.UI.colorEntry(entry, 4);});
    addEntry("ABEGO", function() {this.UI.colorEntry(entry, molmil.colorEntry_ABEGO);});
  }
  if (entry.mtype == 1 || entry.mtype == .5) {
    addEntry("Chain", function() {this.UI.colorEntry(entry, 5);});
    addEntry("Chain alt.", function() {this.UI.colorEntry(entry, molmil.colorEntry_ChainAlt);});
  }
  addEntry("Custom", function() {this.UI.colorEntry(entry, 6);});
  
   
  ref.onmouseout = function() {
    this.subMenu.style.zIndex = 9998;
    this.subMenu.TID = molmil_dep.asyncStart(function(){this.style.display = "none";}, [], ref.subMenu, 500);
  };
  ref.pushNode(menu);
};

molmil.UI.prototype.showDisplayMenuCM=function(ref) {
  var atoms = this.soup.atomSelection;
  if (! atoms.length) return;
  
  if (ref.subMenu) {
    ref.subMenu.style.zIndex = 9999;
    clearTimeout(ref.subMenu.TID);
    ref.subMenu.style.display = "";
    return;
  }

  var pos = molmil_dep.findPos(ref);
  var menu = ref.subMenu = molmil_dep.dcE("div");
  if (ref.inv) {menu.style.left = "auto"; menu.style.right = ((ref.parentNode.clientWidth/molmil_dep.fontSize)+1.8)+"em";}
  else {menu.style.left = ((ref.parentNode.clientWidth/molmil_dep.fontSize)+1.8)+"em";}
  
  var pageX = pos[0]+(ref.inv ? -1 : 1)*(ref.parentNode.clientWidth+(2*molmil_dep.fontSize))
  var mw = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
  var inv = mw < pageX+(molmil_dep.fontSize*25);

  menu.className = "contextMenu cM_sub";
  var item, UI=this;

  var addEntry=function(name, action, hover) {
    item = menu.pushNode("div", name);
    item.className = "contextMenu_E";
    item.UI = UI; item.entry = null;
    item.onclick = action;
    if (hover) {
      item.onmouseover = action;
      item.next = item.pushNode("span", ">");
    }
    else item.addEventListener("touchstart", function() {this.onclick();}, false);
  };

  var molecules = [];
  var chains = [];
  for (var a=0; a<atoms.length; a++) {
    molecules.push(atoms[a].molecule);
    chains.push(atoms[a].molecule.chain);
  }
  
  addEntry("Residue", function() {this.UI.showDisplayMenu(this, {mtype: 3, ref: molecules, inv: inv});}, true);
  addEntry("Chain", function() {this.UI.showDisplayMenu(this, {mtype: 2, ref: chains, inv: inv});}, true);
  
  ref.onmouseout = function() {
    this.subMenu.style.zIndex = 9998;
    this.subMenu.TID = molmil_dep.asyncStart(function(){this.style.display = "none";}, [], ref.subMenu, 500);
  };
  ref.pushNode(menu);
};



molmil.UI.prototype.editLabel=function(settings) {
  var obj=null, text;
  
  if (settings instanceof molmil.labelObject) {
    obj = settings;
    settings = obj.settings;
    text = obj.text;
  }
  else {
    text = settings.text;
    settings.dx = settings.dx || 0.0; settings.dy = settings.dy || 0.0; settings.dz = settings.dz || 0.0;
    settings.fontSize = settings.fontSize || 20;
    settings.color = settings.color || [0, 255, 0];
  }
  
  var infoBox = {xyz: settings.xyz};

  var popup = molmil_dep.dcE("div");
  popup.setClass("molmil_menu_popup");
  
  popup.pushNode("div", "Label");
  popup.pushNode("hr");
  
  var tbl = popup.pushNode("table"), tr, td;
  
  tr = tbl.pushNode("tr");
  tr.pushNode("td", "Text:");
  infoBox.text = td = tr.pushNode("td").pushNode("input");
  td.value = text;
  
  tr = tbl.pushNode("tr");
  tr.pushNode("td", "Color:");
  infoBox.color = td = tr.pushNode("td").pushNode("input");
  td.type = "color";
  td.value = molmil.rgb2hex(settings.color[0], settings.color[1], settings.color[2]);
  
  
  tr = tbl.pushNode("tr");
  tr.pushNode("td", "Font-size:");
  infoBox.fontSize = td = tr.pushNode("td").pushNode("input");
  td.value = settings.fontSize;
  
  tr = tbl.pushNode("tr");
  tr.pushNode("td", "Offset-x");
  infoBox.dx = td = tr.pushNode("td").pushNode("input");
  td.value = settings.dx;
  
  tr = tbl.pushNode("tr");
  tr.pushNode("td", "Offset-y");
  infoBox.dy = td = tr.pushNode("td").pushNode("input");
  td.value = settings.dy;
  
  tr = tbl.pushNode("tr");
  tr.pushNode("td", "Offset-z");
  infoBox.dz = td = tr.pushNode("td").pushNode("input");
  td.value = settings.dz;
  
  if (obj == null) {
    popup.add = popup.pushNode("button", "Add"); 
    popup.add.onclick = function() {
      var settings = {};
      settings.color = molmil.hex2rgb(this.infoBox.color.value);
      settings.fontSize = parseFloat(this.infoBox.fontSize.value);
      settings.dx = parseFloat(this.infoBox.dx.value); settings.dy = parseFloat(this.infoBox.dy.value); settings.dz = parseFloat(this.infoBox.dz.value);
      settings.xyz = this.infoBox.xyz;
      molmil.addLabel(this.infoBox.text.value, settings, this.soup);
      this.close.onclick();
    };

  }
  else {
    popup.add = popup.pushNode("button", "Apply");
    popup.add.labelObject = obj;
    popup.add.onclick = function() {
      var settings = {};
      settings.color = molmil.hex2rgb(this.infoBox.color.value);
      settings.fontSize = parseFloat(this.infoBox.fontSize.value);
      settings.dx = parseFloat(this.infoBox.dx.value); settings.dy = parseFloat(this.infoBox.dy.value); settings.dz = parseFloat(this.infoBox.dz.value);
      settings.xyz = this.infoBox.xyz;
      molmil.addLabel(this.infoBox.text.value, settings, this.labelObject);
    };
  }

  popup.add.style.display = "inline-block"; popup.add.style.marginLeft = popup.add.style.marginRight = "1em";
  popup.add.infoBox = infoBox;
  popup.add.soup = this.soup;
  popup.add.popup = popup;
  
  
  popup.close = popup.pushNode("button", "Close"); popup.close.style.display = "inline-block"; popup.close.style.marginLeft = popup.close.style.marginRight = "auto";
  popup.close.onclick = function() {this.popup.parentNode.removeChild(this.popup);};
  popup.close.popup = popup;
  
  popup.add.close = popup.close;
  
  this.LM.parentNode.pushNode(popup);
  
  infoBox.text.focus();
};

molmil.UI.prototype.showLabelMenuCM=function(ref) {
  var atoms = this.soup.atomSelection;
  if (! atoms.length) return;
  
  if (ref.subMenu) {
    ref.subMenu.style.zIndex = 9999;
    clearTimeout(ref.subMenu.TID);
    ref.subMenu.style.display = "";
    return;
  }

  var pos = molmil_dep.findPos(ref);
  var menu = ref.subMenu = molmil_dep.dcE("div");
  if (ref.inv) {menu.style.left = "auto"; menu.style.right = ((ref.parentNode.clientWidth/molmil_dep.fontSize)+1.8)+"em";}
  else {menu.style.left = ((ref.parentNode.clientWidth/molmil_dep.fontSize)+1.8)+"em";}
  
  var pageX = pos[0]+(ref.inv ? -1 : 1)*(ref.parentNode.clientWidth+(2*molmil_dep.fontSize))
  var mw = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
  var inv = mw < pageX+(molmil_dep.fontSize*25);
  
  
  menu.className = "contextMenu cM_sub";
  var item, UI=this;

  var addEntry=function(name, action, hover) {
    item = menu.pushNode("div", name);
    item.className = "contextMenu_E";
    item.UI = UI; item.entry = null;
    item.onclick = action;
    if (hover) {
      item.onmouseover = action;
      item.next = item.pushNode("span", ">");
    }
    else item.addEventListener("touchstart", function() {this.onclick();}, false);
  };
  
  var molecules = [];
  var chains = [];
  for (var a=0; a<atoms.length; a++) {
    molecules.push(atoms[a].molecule);
    chains.push(atoms[a].molecule.chain);
  }

  addEntry("Atom", function() {document.body.onmousedown(); var info = molmil.calcCenter(atoms); this.UI.editLabel({text: atoms[0].toString(), xyz: info[0], dz: info[1]+2.0});}, false);
  addEntry("Residue", function() {document.body.onmousedown(); var info = molmil.calcCenter(molecules); this.UI.editLabel({text: molecules[0].toString(), xyz: info[0], dz: info[1]+2.0});}, false);
  addEntry("Chain", function() {document.body.onmousedown(); var info = molmil.calcCenter(chains); this.UI.editLabel({text: chains[0].toString(), xyz: info[0], dz: info[1]+2.0});}, false);
  
  ref.onmouseout = function() {
    this.subMenu.style.zIndex = 9998;
    this.subMenu.TID = molmil_dep.asyncStart(function(){this.style.display = "none";}, [], ref.subMenu, 500);
  };
  ref.pushNode(menu);
};

molmil.UI.prototype.showColorMenuCM=function(ref) {
  var atoms = this.soup.atomSelection;
  if (! atoms.length) return;
  
  if (ref.subMenu) {
    ref.subMenu.style.zIndex = 9999;
    clearTimeout(ref.subMenu.TID);
    ref.subMenu.style.display = "";
    return;
  }

  var pos = molmil_dep.findPos(ref);
  var menu = ref.subMenu = molmil_dep.dcE("div");
  if (ref.inv) {menu.style.left = "auto"; menu.style.right = ((ref.parentNode.clientWidth/molmil_dep.fontSize)+1.8)+"em";}
  else {menu.style.left = ((ref.parentNode.clientWidth/molmil_dep.fontSize)+1.8)+"em";}
  
  var pageX = pos[0]+(ref.inv ? -1 : 1)*(ref.parentNode.clientWidth+(2*molmil_dep.fontSize))
  var mw = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
  var inv = mw < pageX+(molmil_dep.fontSize*25);
  
  
  menu.className = "contextMenu cM_sub";
  var item, UI=this;

  var addEntry=function(name, action, hover) {
    item = menu.pushNode("div", name);
    item.className = "contextMenu_E";
    item.UI = UI; item.entry = null;
    item.onclick = action;
    if (hover) {
      item.onmouseover = action;
      item.next = item.pushNode("span", ">");
    }
    else item.addEventListener("touchstart", function() {this.onclick();}, false);
  };
  
  var molecules = [];
  var chains = [];
  for (var a=0; a<atoms.length; a++) {
    molecules.push(atoms[a].molecule);
    chains.push(atoms[a].molecule.chain);
  }

  addEntry("Atom", function() {this.UI.showColorMenu(this, {mtype: 4, ref: atoms, inv: inv});}, true);
  addEntry("Residue", function() {this.UI.showColorMenu(this, {mtype: 3, ref: molecules, inv: inv});}, true);
  addEntry("Residue (cartoon)", function() {this.UI.showColorMenu(this, {mtype: 3.1, ref: molecules, inv: inv});}, true);
  addEntry("Residue (atoms)", function() {this.UI.showColorMenu(this, {mtype: 3.2, ref: molecules, inv: inv});}, true);
  addEntry("Chain", function() {this.UI.showColorMenu(this, {mtype: 2, ref: chains, inv: inv});}, true);
  
  ref.onmouseout = function() {
    this.subMenu.style.zIndex = 9998;
    this.subMenu.TID = molmil_dep.asyncStart(function(){this.style.display = "none";}, [], ref.subMenu, 500);
  };
  ref.pushNode(menu);
};

molmil.UI.prototype.showDisplayMenu=function(ref, entry) {
  if (ref.subMenu) {
    ref.subMenu.style.zIndex = 9999;
    clearTimeout(ref.subMenu.TID);
    ref.subMenu.style.display = "";
    return;
  }
  var pos = molmil_dep.findPos(ref);
  var menu = ref.subMenu = molmil_dep.dcE("div");
  
  menu.className = "contextMenu cM_sub";
  var item, UI=this;
  if (ref.inv || entry.inv) {menu.style.left = "auto"; menu.style.right = ((ref.parentNode.clientWidth/molmil_dep.fontSize)+1.8)+"em";}
  else {menu.style.left = ((ref.parentNode.clientWidth/molmil_dep.fontSize)+1.8)+"em";}
  
  var pageX = pos[0]+(ref.inv ? -1 : 1)*(ref.parentNode.clientWidth+(2*molmil_dep.fontSize))
  var mw = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
  var inv = mw < pageX+(molmil_dep.fontSize*25);

  var addEntry=function(name, action, hover) {
    item = menu.pushNode("div", name);
    item.className = "contextMenu_E"; item.inv = inv;
    item.UI = UI; item.entry = entry;
    item.onclick = action;
    if (hover) {
      item.onmouseover = action;
      item.next = item.pushNode("span", ">");
    }
    else item.addEventListener("touchstart", function() {this.onclick();}, false);
  };
  
//  if (entry.mtype == 1 || entry.mtype == 2) {
    if (entry.ref[0].display) addEntry("Hidden", function() {this.UI.displayEntry(entry, 0.0);});
    else addEntry("Visible", function() {this.UI.displayEntry(entry, 0.5);});
  //}
  //else addEntry("None", function() {this.UI.displayEntry(entry, 0);});
  if (entry.mtype != 3) addEntry("Default", function() {this.UI.displayEntry(entry, 1);});
  
  if (entry.mtype != 10) {
    if (entry.mtype == 3 && (entry.ref[0].ligand || entry.ref[0].water)) {
      addEntry("Space fill", function() {this.UI.displayEntry(entry, 2);});
      addEntry("Ball & stick", function() {this.UI.displayEntry(entry, 3);});
      addEntry("Stick", function() {this.UI.displayEntry(entry, 4);});
      addEntry("Wireframe", function() {this.UI.displayEntry(entry, 5);});
    }
    else {
      var aaMenu = function(ref2, tp) {
        if (ref2.subMenu) {
          ref2.subMenu.style.zIndex = 9999;
          clearTimeout(ref2.subMenu.TID);
          ref2.subMenu.style.display = "";
          return;
        }
        var pos = molmil_dep.findPos(ref2);
        var menu2 = ref2.subMenu = molmil_dep.dcE("div");
        
        if (ref2.inv) {menu2.style.left = "auto"; menu2.style.right = ((ref2.parentNode.clientWidth/molmil_dep.fontSize)+1.8)+"em";}
        else {menu2.style.left = ((ref2.parentNode.clientWidth/molmil_dep.fontSize)+1.8)+"em";}
        
        // figure out whether or not to invert the placement of this menu...
  
        menu2.className = "contextMenu cM_sub";
        var item;
  
        var addEntry2=function(name, action, hover) {
          item = menu2.pushNode("div", name);
          item.className = "contextMenu_E";
          item.UI = UI; item.entry = entry;
          item.onclick = action;
          if (hover) {
            item.onmouseover = action;
            item.next = item.pushNode("span", ">");
          }
          else item.addEventListener("touchstart", function() {this.onclick();}, false);
        };
        
        addEntry2("Space fill", function() {this.UI.displayEntry(entry, tp == 1 ? 2 : 2.5);});
        addEntry2("Ball & stick", function() {this.UI.displayEntry(entry, tp == 1 ? 3 : 3.5);});
        addEntry2("Stick", function() {this.UI.displayEntry(entry, tp == 1 ? 4 : 4.5);});
        addEntry2("Wireframe", function() {this.UI.displayEntry(entry, tp == 1 ? 5 : 5.5);});
        
        ref2.onmouseout = function() {
          this.subMenu.style.zIndex = 9998;
          this.subMenu.TID = molmil_dep.asyncStart(function(){this.style.display = "none";}, [], ref2.subMenu, 500);
        };
        ref2.pushNode(menu2);
      };

      addEntry("Amino acid", function() {aaMenu(this, 1);}, true);
      addEntry("Side chain", function() {aaMenu(this, 2);}, true);
    }
    if (entry.mtype < 3 && ! (entry.ref[0].ligand || entry.ref[0].water)) {
      addEntry("Ca trace", function() {this.UI.displayEntry(entry, 6);});
      addEntry("Tube", function() {this.UI.displayEntry(entry, 7);});
      addEntry("Cartoon", function() {this.UI.displayEntry(entry, 8);});
      addEntry("Rocket", function() {this.UI.displayEntry(entry, 8.5);});
      addEntry("CG Surface", function() {this.UI.displayEntry(entry, molmil.displayMode_ChainSurfaceCG);});
      addEntry("Simple Surface", function() {this.UI.displayEntry(entry, molmil.displayMode_ChainSurfaceSimple);});
    }
  }

  ref.onmouseout = function() {
    this.subMenu.style.zIndex = 9998;
    this.subMenu.TID = molmil_dep.asyncStart(function(){this.style.display = "none";}, [], ref.subMenu, 500);
  };
  ref.pushNode(menu);
};

molmil.UI.prototype.showContextMenuAtom=function(x, y, pageX) {
  if (document.body.onmousedown) document.body.onmousedown();
  
  var atoms = this.soup.atomSelection;
  if (! atoms.length) return;
  
  var delta = 0;
  var mw = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
  if (mw < pageX+(molmil_dep.fontSize*12)) delta = (pageX+(molmil_dep.fontSize*12))-mw;
  var inv = mw < pageX+(molmil_dep.fontSize*25);
  
  //scrollTop
  var menu = molmil_dep.dcE("div");
  menu.className = "contextMenu";
  menu.style.left = x-delta+"px";
  menu.style.top = y+(document.body.scrollTop || 0)+"px";
  
  if (atoms.length > 1){
    menu.pushNode("div", this.soup.atomSelection.length+" atoms selected");
  }
  else {
    var atom = atoms[0];
    var sgl = atom.molecule.atoms.length > 1;
    var info = menu.pushNode("div", (sgl ? atom.atomName : atom.element) + " - " + (sgl ? (atom.molecule.name || "") + " " : "") + (atom.molecule.RSID || "") + (atom.molecule.chain.name ? " - Chain " + atom.molecule.chain.name : ""));
  }
  
  menu.pushNode("HR");
  
  var UI = this;
  
  var addEntry=function(name, action, hover) {
    item = menu.pushNode("div", name);
    if (! item.pushNode) return; // workaround for weird bug in IE --> makes it non-functional
    item.className = "contextMenu_E";
    item.UI = UI; item.entry = null; item.inv = inv;
    item.onclick = action;
    if (hover) {
      item.onmouseover = action;
      item.next = item.pushNode("span", ">");
    }
    else item.addEventListener("touchstart", function() {this.onclick();}, false);
  };
  
  addEntry("Display", function() {this.UI.showDisplayMenuCM(this);}, true);
  addEntry("Color", function() {this.UI.showColorMenuCM(this);}, true);
  addEntry("Label", function() {this.UI.showLabelMenuCM(this);}, true);
  
  document.body.pushNode(menu);
  document.body.onmousedown = function(ev) {
    if (ev && ev.target.className.indexOf("contextMenu_E") != -1) return;
    var cms = document.getElementsByClassName("contextMenu");
    for (var e=0; e<cms.length; e++) cms[e].parentNode.removeChild(cms[e]);
    cms = document.getElementsByClassName("contextMenu_E_sel")[0];
    document.body.onmousedown = null;
  };
  return false;
};

molmil.UI.prototype.showLabelCM=function(e, entry) {
  if (document.body.onmousedown) document.body.onmousedown();
  
  var delta = 0;
  var mw = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
  if (mw < e.pageX+(molmil_dep.fontSize*12)) delta = (e.pageX+(molmil_dep.fontSize*12))-mw;
  entry.inv = mw < e.pageX+(molmil_dep.fontSize*25);
  
  var menu = molmil_dep.dcE("div");
  menu.className = "contextMenu";
  menu.style.left = e.pageX-delta+"px";
  menu.style.top = e.pageY+"px";
  var item, UI=this;
  
  // make sure that un-hover is not activated on e...
  entry.setClass("contextMenu_E_sel");
  
  
  var addEntry=function(name, action, hover) {
    item = menu.pushNode("div", name);
    item.className = "contextMenu_E";
    item.UI = UI; item.entry = entry;
    item.onclick = action;
    if (hover) {
      item.onmouseover = action;
      item.next = item.pushNode("span", ">");
    }
    else item.addEventListener("touchstart", function() {this.onclick();}, false);
  };

  if (entry.label.display) {addEntry("Hidden", function() {this.entry.label.display = false; this.UI.soup.canvas.update = true; document.body.onmousedown();});}
  else addEntry("Visible", function() {this.entry.label.display = true; this.UI.soup.canvas.update = true; document.body.onmousedown();});
  
  addEntry("Edit", function() {this.UI.editLabel(this.entry.label);});
  
  document.body.pushNode(menu);
  document.body.onmousedown = function(ev) {
    if (ev && ev.target.className.indexOf("contextMenu_E") != -1) return;
    var cms = document.getElementsByClassName("contextMenu");
    for (var e=0; e<cms.length; e++) cms[e].parentNode.removeChild(cms[e]);
    cms = document.getElementsByClassName("contextMenu_E_sel")[0];
    if (cms) entry.removeClass("contextMenu_E_sel")
    document.body.onmousedown = null;
  };
  
  try {e.preventDefault();}
  catch (e) {}
  return false;
  
}

molmil.UI.prototype.showCM=function(e, entry) {
  if (document.body.onmousedown) document.body.onmousedown();
  
  var delta = 0;
  var mw = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
  if (mw < e.pageX+(molmil_dep.fontSize*12)) delta = (e.pageX+(molmil_dep.fontSize*12))-mw;
  entry.inv = mw < e.pageX+(molmil_dep.fontSize*25);
  
  var menu = molmil_dep.dcE("div");
  menu.className = "contextMenu";
  menu.style.left = e.pageX-delta+"px";
  menu.style.top = e.pageY+"px";
  var item, UI=this;
  
  // make sure that un-hover is not activated on e...
  entry.setClass("contextMenu_E_sel");
  
  
  var addEntry=function(name, action, hover) {
    item = menu.pushNode("div", name);
    item.className = "contextMenu_E";
    item.UI = UI; item.entry = entry;
    item.onclick = action;
    if (hover) {
      item.onmouseover = action;
      item.next = item.pushNode("span", ">");
    }
    else item.addEventListener("touchstart", function() {this.onclick();}, false);
  };
  
  //addEntry("Delete", function() {this.UI.deleteEntry(entry);});
  if (entry.mtype == 0.5 || entry.mtype == 1) { // make this somehow a global setting
    if (this.soup.hideWaters) addEntry("Show waters", function() {this.UI.toggleWaters(1);});
    else addEntry("Hide waters", function() {this.UI.toggleWaters(0);});
    if (this.soup.hideHydrogens) addEntry("Show hydrogens", function() {this.UI.toggleHydrogens(1);});
    else addEntry("Hide hydrogens", function() {this.UI.toggleHydrogens(0);});
  }
  
  addEntry("Display", function() {this.UI.showDisplayMenu(this, entry);}, true);
  if (entry.mtype != 10) addEntry("Color", function() {this.UI.showColorMenu(this, entry);}, true);
  addEntry("Label", function() {
    var info = molmil.calcCenter(entry.ref);
    this.UI.editLabel({text: entry.ref.toString(), xyz: info[0], dz: info[1]+2.0});
    document.body.onmousedown();
  }, false);
  
  
  document.body.pushNode(menu);
  document.body.onmousedown = function(ev) {
    if (ev && ev.target.className.indexOf("contextMenu_E") != -1) return;
    var cms = document.getElementsByClassName("contextMenu");
    for (var e=0; e<cms.length; e++) cms[e].parentNode.removeChild(cms[e]);
    cms = document.getElementsByClassName("contextMenu_E_sel")[0];
    if (cms) entry.removeClass("contextMenu_E_sel")
    document.body.onmousedown = null;
  };
  
  try {e.preventDefault();}
  catch (e) {}
  return false;
};


molmil.UI.prototype.showRM=function(icon) {
  var menu = icon.parentNode.menu;
  molmil_dep.Clear(menu);
  if (menu.style.display == "none") {
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
  menu.pushNode("span", "Structures:").className = "optCat_k";;
  menu.pushNode("hr");
  var model, item, file;
  for (var i=0; i<files.length; i++) {
    file = files[i];
    if (file instanceof molmil.entryObject) {
      item = menu.pushNode("div");
      item.plus = item.pushNode("a", "+");
      item.plus.className = "optCat_p";
      item.name = item.pushNode("a", file.meta.id);
      item.name.title = "Left click to expand\nRight click to show the context menu for display & color options";
      item.name.className = "optCat_n";
      item.plus.onclick = item.name.onclick = molmil_dep.expandCatTree;
      item.name.UI = item.UI = this;
      molmil.setOnContextMenu(item.name, function(e) {this.UI.showCM(e, this);});
      item.name.mtype = 1;
      item.payload = item.name.ref = [file];
      item.expandFunc = this.showChains;
    }
    else {
      item = menu.pushNode("div", file.filename);
      item.className = "optCat_n";
      item.style.marginLeft = "1.25em";
      item.UI = this;
      molmil.setOnContextMenu(item, function(e) {this.UI.showCM(e, this);});
      item.mtype = 10;
      item.ref = [file.polygon];
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
    molmil.setOnContextMenu(item, function(e) {this.UI.showLabelCM(e, this);});
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
    item.name = item.pushNode("a", chain.name ? chain.name : i+1);
    item.name.title = "Left click to expand\nRight click to show the context menu for display & color options";
    item.name.className = "optCat_n";
    item.plus.onclick = item.name.onclick = molmil_dep.expandCatTree;
    item.payload = chain;
    item.name.UI = item.UI = this.UI;
    item.expandFunc = this.UI.showResidues;
    molmil.setOnContextMenu(item.name, function(e) {this.UI.showCM(e, this);});
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
    item = target.pushNode("div", mol.name+(mol.id ? " ("+mol.id+")" : ""));
    item.title = "Double click to jump to residue\nRight click to show the context menu for display & color options";
    item.className = "optCat_n";
    item.payload = mol; item.UI = this.UI;
    molmil.setOnContextMenu(item, function(e) {this.UI.showCM(e, this);});
    item.mtype = 3;
    item.ref = [mol];
    item.ondblclick = function() {
      this.UI.canvas.molmilViewer.gotoMol(this.payload);
    };
    item.onclick = function() {
      this.UI.canvas.molmilViewer.atomSelection = [this.payload.CA || this.payload.atoms[0]];
      this.UI.canvas.renderer.updateSelection();
      this.UI.canvas.update = true;
    };
  }
  target.pushNode("hr");
};


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
      var rfs = this.canvas.requestFullScreen || this.canvas.webkitRequestFullScreen || this.canvas.mozRequestFullScreen || this.canvas.msRequestFullscreen || null;
      if (rfs) {
        document.molmil_FSC = this.canvas;
        rfs.call(this.canvas);
      }
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
    slider.value = slider.min = 0;
    slider.max = this.soup.frameInfo.length;
    slider.soup = this.soup;
    slider.oninput = function(e) {this.soup.animation.go2Frame(e.srcElement.valueAsNumber);};
    popup.sliderBox = slider;

    var timeBox = popup.pushNode("span", this.soup.frameInfo[0][1]+"ps");
    popup.timeBox = timeBox;
  }
  else {
    var slider = popup.pushNode("input");
    slider.type = "range";
    slider.value = slider.min = 0;
    slider.max = this.soup.chains[0].modelsXYZ.length;
    slider.soup = this.soup;
    slider.oninput = function(e) {this.soup.animation.go2Frame(e.srcElement.valueAsNumber);};
    popup.sliderBox = slider;

    var timeBox = popup.pushNode("span", "0");
    popup.timeBox = timeBox;
  }
  
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
    if (this.RM.parentNode.menu.style.display != "none") this.showRM(this.RM);  
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
    if (popup.dpm1.inp.checked) {
      this.canvas.molmilViewer.loadStructure(molmil.settings.promodeE_base_structure_url.replace("__ID__", id), 4);
      this.canvas.molmilViewer.loadStructure(molmil.settings.promodeE_mode_vectors_url.replace("__ID__", id).replace("__MODE__", mode), 5);
    }
    else {
      this.canvas.molmilViewer.loadStructure(molmil.settings.promodeE_animation_url.replace("__ID__", id).replace("__MODE__", mode), 4, function(soup, struc) {
        molmil.displayEntry(struc, soup.AID > 1e5 ? 5 : 1);
        molmil.colorEntry(struc, 1);
        soup.animation.motionMode = 3;
        soup.animation.play();
      });
    }
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
    var mult = parseInt(popup.range.value);
    if (mult != 1) {
      var width = this.canvas.width; var height = this.canvas.height; var opacity = molmil.configBox.BGCOLOR[3];
      // there appears to be a problem with chrome and changing the canvas w/h --> but only at very high resolutions...
      this.canvas.width *= mult; this.canvas.height *= mult; molmil.configBox.BGCOLOR[3] = 0;
      this.canvas.renderer.selectDataContext(); this.canvas.renderer.resizeViewPort();
      this.canvas.update = true; this.canvas.renderer.render();
      this.canvas.toBlob(function(blob) {saveAs(blob, "image.png");});
      this.canvas.renderer.selectDefaultContext();
      this.canvas.width = width; this.canvas.height = height; molmil.configBox.BGCOLOR[3] = opacity;
      this.canvas.renderer.resizeViewPort();
      this.canvas.update = true; this.canvas.renderer.render();
    }
    else {
      var opacity = molmil.configBox.BGCOLOR[3]; molmil.configBox.BGCOLOR[3] = 0;
      this.canvas.renderer.selectDataContext();
      this.canvas.update = true;
      this.canvas.renderer.render();
      this.canvas.toBlob(function(blob) {saveAs(blob, "image.png");});
      this.canvas.renderer.selectDefaultContext();
      molmil.configBox.BGCOLOR[3] = opacity;
      this.canvas.update = true; this.canvas.renderer.render();
    }
  
    popup.cancel.onclick();
  };
  popup.cancel = popup.pushNode("button", "Cancel");
  popup.cancel.onclick = function() {this.popup.parentNode.removeChild(this.popup);};
  popup.cancel.popup = popup;
  
  popup.range.onmousemove();
  
  this.LM.parentNode.pushNode(popup);
}


molmil.UI.prototype.videoRenderer=function() {
  if (this.LM && this.LM.parentNode.childNodes.length > 1) this.LM.onclick();
  
  var videoID = null;
  var pixels = null;
  
  this.canvas.renderer.onRenderFinish = function() {
    if (! videoID) return;
    if (pixels == null) pixels = new Uint8Array(this.canvas.width * this.canvas.width * 4);
    var req = new molmil_dep.CallRemote("POST");
    req.AddParameter("id", videoID);
    req.AddParameter("data", canvas.toDataURL());
          
    this.canvas.renderer.gl.readPixels(0, 0, this.canvas.width, this.canvas.width, this.canvas.renderer.gl.RGBA, this.canvas.renderer.gl.UNSIGNED_BYTE, pixels);
          
    req.Send(molmil.settings.molmil_video_url+"addFrame");
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
      var req = new molmil_dep.CallRemote("GET");
      req.AddParameter("id", videoID);
      req.Send(molmil.settings.molmil_video_url+"deInitVideo");
      console.log(molmil.settings.molmil_video_url+"getVideo?id="+videoID);
      window.open(molmil.settings.molmil_video_url+"getVideo?id="+videoID);
      videoID = null;
    }
  }


  popup.record.onclick = function() {
    // make sure that both the width & height are divisible by 2 (ffmpeg issue)
    var w = this.canvas.width, h = this.canvas.height;
    if (w%2 == 1) w--;
    if (h%2 == 1) h--;
    if (w != this.canvas.width || h != this.canvas.height) this.canvas.renderer.resizeViewPort();
    
    var req = new molmil_dep.CallRemote("GET");
    req.AddParameter("w", this.canvas.width);
    req.AddParameter("h", this.canvas.height);
    req.Send(molmil.settings.molmil_video_url+"initVideo");
    videoID = req.request.responseText;
    //canvas.renderer.selectDataContext();
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
}


// ** quick functions **

// ** shows/hides (part of) a structure **
molmil.toggleEntry = function (obj, dm, rebuildGeometry, soup) {
  soup = soup || molmil.cli_soup;
  var m, a, mol;
  if (obj instanceof molmil.entryObject) {
    for (m=0; m<obj.molecules.length; m++) {
      mol = obj.molecules[m];
      if (! mol.ligand && ! mol.water) {for (a=0; a<mol.atoms.length; a++) mol.atoms[a].display = dm;}
      mol.display = dm;
    }
  }
  else if (obj instanceof molmil.chainObject) {
    for (m=0; m<obj.molecules.length; m++) {
      mol = obj.molecules[m];
      for (a=0; a<mol.atoms.length; a++) mol.atoms[a].display = dm;
      mol.display = dm;
    }
  }
  else if (obj instanceof molmil.molObject) {
    for (a=0; a<obj.atoms.length; a++) obj.atoms[a].display = dm;
    obj.display = dm;
  }
  else if (obj instanceof molmil.atomObject) {  
    obj.display = false;
  }
  else if (obj instanceof polygonObject) obj.display = dm;
  else {return;}

  if (rebuildGeometry) {
    soup.renderer.initBuffers();
    soup.renderer.canvas.update = true;
  }
}


// ** change display mode of a system/chain/molecule/atom **
molmil.displayEntry = function (obj, dm, rebuildGeometry, soup, settings) {
  soup = soup || molmil.cli_soup;
  if (obj instanceof Array) {
    for (var i=0; i<obj.length; i++) molmil.displayEntry(obj[i], dm, null, null, settings);
    if (rebuildGeometry) {
      soup.renderer.initBuffers();
      soup.renderer.canvas.update = true;  
    }
    return;
  }

  if (soup && ((soup.SCstuff && dm%1 == 0) || (! soup.SCstuff && dm%1 != 0))) molmil.geometry.reInitChains = true;

  var m, a, c, chain, mol, backboneAtoms = molmil.configBox.backboneAtoms4Display, backboneAtomsXNA = molmil.configBox.backboneAtoms4DisplayXNA, xna_atoms = molmil.configBox.xna_simple_base_atoms, backboneAtomsRef;
  
  
  if (obj instanceof molmil.entryObject) {
    if (dm == molmil.displayMode_None) { // new none function...
      obj.display = false;
    }
    else if (dm == molmil.displayMode_Visible) {
      obj.display = true;
    }
    else if (dm == molmil.displayMode_None) {
      for (c=0; c<obj.chains.length; c++) {
        chain = obj.chains[c];
        chain.displayMode = 0;
        for (var a=0; a<chain.atoms.length; a++) chain.atoms[a].displayMode = 0;
        for (var m=0; m<chain.molecules.length; m++) {
          chain.molecules[m].displayMode = 0;
          chain.molecules[m].showSC = false;
        }
      }
    }
    else if (dm == molmil.displayMode_Default) {
      for (c=0; c<obj.chains.length; c++) {
        chain = obj.chains[c];
        chain.displayMode = 3;
        for (m=0; m<chain.molecules.length; m++) {
          mol = chain.molecules[m];
          if (mol.ligand || mol.water) {for (a=0; a<mol.atoms.length; a++) mol.atoms[a].displayMode = 3;}
          else if (mol.xna) for (a=0; a<mol.atoms.length; a++) mol.atoms[a].displayMode = xna_atoms.hasOwnProperty(mol.atoms[a].atomName) || mol.atoms[a].element == "H" ? 0 : 3;
          else if (mol.weirdAA) { 
            for (a=0; a<mol.atoms.length; a++) {
              if (backboneAtoms.hasOwnProperty(mol.atoms[a].atomName)) mol.atoms[a].displayMode = 0;
              else mol.atoms[a].displayMode = 3;
            }
          }
          else for (a=0; a<mol.atoms.length; a++) mol.atoms[a].displayMode = 0;
          mol.displayMode = 3;
          mol.showSC = mol.weirdAA;
        }
      }
      molmil.geometry.reInitChains = true;
    }
    else if (dm == molmil.displayMode_Spacefill) {
      for (c=0; c<obj.chains.length; c++) {
        chain = obj.chains[c];
        chain.displayMode = 1;
        for (var a=0; a<chain.atoms.length; a++) chain.atoms[a].displayMode = 1;
        for (var m=0; m<chain.molecules.length; m++) {
          chain.molecules[m].displayMode = 0;
          chain.molecules[m].showSC = true;
          chain.twoDcache = null;
        }
      }
    }
    else if (dm == molmil.displayMode_Spacefill_SC) {
      for (c=0; c<obj.chains.length; c++) {
        chain = obj.chains[c];
        for (var a=0; a<chain.atoms.length; a++) {
          if (chain.atoms[a].molecule.xna) backboneAtomsRef = backboneAtomsXNA;
          else backboneAtomsRef = backboneAtoms;
          if (! chain.atoms[a].molecule.ligand && ! chain.atoms[a].molecule.water && backboneAtomsRef.hasOwnProperty(chain.atoms[a].atomName)) chain.atoms[a].displayMode = 0;
          else chain.atoms[a].displayMode = 1;
        }
        for (var m=0; m<chain.molecules.length; m++) {chain.molecules[m].showSC = true; chain.twoDcache = null;}
      }
    }
    else if (dm == molmil.displayMode_BallStick) {
      for (c=0; c<obj.chains.length; c++) {
        chain = obj.chains[c];
        chain.displayMode = 1;
        for (var a=0; a<chain.atoms.length; a++) chain.atoms[a].displayMode = 2;
        for (var m=0; m<chain.molecules.length; m++) {
          chain.molecules[m].displayMode = 0;
          chain.molecules[m].showSC = true;
          chain.twoDcache = null;
        }
      }
    }
    else if (dm == molmil.displayMode_BallStick_SC) {
      for (c=0; c<obj.chains.length; c++) {
        chain = obj.chains[c];
        for (var a=0; a<chain.atoms.length; a++) {
          if (chain.atoms[a].molecule.xna) backboneAtomsRef = backboneAtomsXNA;
          else backboneAtomsRef = backboneAtoms;
          if (! chain.atoms[a].molecule.ligand && ! chain.atoms[a].molecule.water && backboneAtomsRef.hasOwnProperty(chain.atoms[a].atomName)) chain.atoms[a].displayMode = 0;
          else chain.atoms[a].displayMode = 2;
        }
        for (var m=0; m<chain.molecules.length; m++) {chain.molecules[m].showSC = true; chain.twoDcache = null;}
      }
    }
    else if (dm == molmil.displayMode_Stick) {
      for (c=0; c<obj.chains.length; c++) {
        chain = obj.chains[c];
        chain.displayMode = 1;
        for (var a=0; a<chain.atoms.length; a++) chain.atoms[a].displayMode = 3;
        for (var m=0; m<chain.molecules.length; m++) {
          chain.molecules[m].displayMode = 0;
          chain.molecules[m].showSC = true;
          chain.twoDcache = null;
        }
      }
    }
    else if (dm == molmil.displayMode_Stick_SC) {
      for (c=0; c<obj.chains.length; c++) {
        chain = obj.chains[c];
        for (var a=0; a<chain.atoms.length; a++) {
          if (chain.atoms[a].molecule.xna) backboneAtomsRef = backboneAtomsXNA;
          else backboneAtomsRef = backboneAtoms;
          if (! chain.atoms[a].molecule.ligand && ! chain.atoms[a].molecule.water && backboneAtomsRef.hasOwnProperty(chain.atoms[a].atomName)) chain.atoms[a].displayMode = 0;
          else chain.atoms[a].displayMode = 3;
        }
        for (var m=0; m<chain.molecules.length; m++) {
          chain.molecules[m].showSC = true;
          chain.twoDcache = null;
        }
      }
    }
    else if (dm == molmil.displayMode_Wireframe) {
      for (c=0; c<obj.chains.length; c++) {
        chain = obj.chains[c];
        chain.displayMode = 1;
        for (var a=0; a<chain.atoms.length; a++) chain.atoms[a].displayMode = 4;
        for (var m=0; m<chain.molecules.length; m++) {
          chain.molecules[m].displayMode = 0;
          chain.molecules[m].showSC = true;
          chain.twoDcache = null;
        }
      }
    }
    else if (dm == molmil.displayMode_Wireframe_SC) {
      for (c=0; c<obj.chains.length; c++) {
        chain = obj.chains[c];
        for (var a=0; a<chain.atoms.length; a++) {
          if (chain.atoms[a].molecule.xna) backboneAtomsRef = backboneAtomsXNA;
          else backboneAtomsRef = backboneAtoms;
          if (! chain.atoms[a].molecule.ligand && ! chain.atoms[a].molecule.water && backboneAtomsRef.hasOwnProperty(chain.atoms[a].atomName)) chain.atoms[a].displayMode = 0;
          else chain.atoms[a].displayMode = 4;
        }
        for (var m=0; m<chain.molecules.length; m++) {
          chain.molecules[m].showSC = true;
          chain.twoDcache = null;
        }
      }
    }
    else if (dm == molmil.displayMode_CaTrace) {
      for (c=0; c<obj.chains.length; c++) {
        chain = obj.chains[c];
        chain.displayMode = 1;
        for (m=0; m<chain.molecules.length; m++) {
          mol = chain.molecules[m];
          if (! mol.ligand && ! mol.water) {for (a=0; a<mol.atoms.length; a++) mol.atoms[a].displayMode = 0;}
          mol.displayMode = 1;
          mol.showSC = false;
        }
      }
    }
    else if (dm == molmil.displayMode_Tube) {
      for (c=0; c<obj.chains.length; c++) {
        chain = obj.chains[c];
        chain.displayMode = 2;
        for (m=0; m<chain.molecules.length; m++) {
          mol = chain.molecules[m];
          if (! mol.ligand && ! mol.water) {for (a=0; a<mol.atoms.length; a++) mol.atoms[a].displayMode = 0;}
          mol.displayMode = 2;
          mol.showSC = false;
        }
      }
    }
    else if (dm == molmil.displayMode_Cartoon) {
      for (c=0; c<obj.chains.length; c++) {
        chain = obj.chains[c];
        chain.displayMode = 3;
        for (m=0; m<chain.molecules.length; m++) {
          mol = chain.molecules[m];
          if (! mol.ligand && ! mol.water) {for (a=0; a<mol.atoms.length; a++) mol.atoms[a].displayMode = 0;}
          mol.displayMode = 3;
          mol.showSC = false;
        }
      }
    }
    else if (dm == molmil.displayMode_CartoonRocket) {
      for (c=0; c<obj.chains.length; c++) {
        chain = obj.chains[c];
        chain.displayMode = 3;
        chain.twoDcache = null;
        for (m=0; m<chain.molecules.length; m++) {
          mol = chain.molecules[m];
          if (! mol.ligand && ! mol.water) {for (a=0; a<mol.atoms.length; a++) mol.atoms[a].displayMode = 0;}
          mol.displayMode = 31;
          mol.showSC = false;
        }
      }
    }
    else if (dm == molmil.displayMode_ChainSurfaceCG) {
      for (c=0; c<obj.chains.length; c++) {
        chain = obj.chains[c];
        chain.displayMode = molmil.displayMode_ChainSurfaceCG;
        chain.HQsurface = false;
      }
    }
    else if (dm == molmil.displayMode_ChainSurfaceCG+0.5) {
      for (c=0; c<obj.chains.length; c++) {
        chain = obj.chains[c];
        chain.displayMode = molmil.displayMode_ChainSurfaceCG;
        chain.HQsurface = true;
      }
    }
    else if (dm == molmil.displayMode_ChainSurfaceSimple) {
      for (c=0; c<obj.chains.length; c++) {
        chain = obj.chains[c];
        chain.displayMode = molmil.displayMode_ChainSurfaceSimple;
        chain.displaySettings = settings;
      }
    }
  }
  else if (obj instanceof molmil.chainObject) {
    if (dm == molmil.displayMode_None) {
      obj.display = false;
    }
    else if (dm == molmil.displayMode_Visible) {
      obj.display = true;
    }
    else if (dm == molmil.displayMode_None) {
      obj.display = false;
      obj.displayMode = 0;
      for (m=0; m<obj.molecules.length; m++) {
        mol = obj.molecules[m];
        mol.displayMode = 0;
        for (a=0; a<mol.atoms.length; a++) mol.atoms[a].displayMode = 0;
        mol.showSC = false;
      }
    }
    else if (dm == molmil.displayMode_Default) {
      obj.displayMode = 3;
      for (m=0; m<obj.molecules.length; m++) {
        mol = obj.molecules[m];
        if (mol.ligand && ! mol.water) {for (a=0; a<mol.atoms.length; a++) mol.atoms[a].displayMode = 3;}
        else if (mol.xna) for (a=0; a<mol.atoms.length; a++) mol.atoms[a].displayMode = xna_atoms.hasOwnProperty(mol.atoms[a].atomName) || mol.atoms[a].element == "H" ? 0 : 3;
        else {for (a=0; a<mol.atoms.length; a++) mol.atoms[a].displayMode = 0;}
        mol.displayMode = 3;
        mol.showSC = false;
      }
    }
    else if (dm == molmil.displayMode_Spacefill) {
      obj.displayMode = 1;
      for (m=0; m<obj.molecules.length; m++) {
        mol = obj.molecules[m];
        mol.displayMode = 0;
        for (a=0; a<mol.atoms.length; a++) mol.atoms[a].displayMode = 1;
        mol.showSC = true;
        mol.chain.twoDcache = null;
      }
    }
    else if (dm == molmil.displayMode_Spacefill_SC) {
      for (m=0; m<obj.molecules.length; m++) {
        mol = obj.molecules[m];
        for (a=0; a<mol.atoms.length; a++) {
          if (mol.xna) backboneAtomsRef = backboneAtomsXNA;
          else backboneAtomsRef = backboneAtoms;
          if (! mol.ligand && ! mol.water && backboneAtomsRef.hasOwnProperty(mol.atoms[a].atomName)) mol.atoms[a].displayMode = 0;
          else mol.atoms[a].displayMode = 1;
        }
        mol.showSC = true;
        mol.chain.twoDcache = null;
      }
    }
    else if (dm == molmil.displayMode_BallStick) {
      obj.displayMode = 1;
      for (m=0; m<obj.molecules.length; m++) {
        mol = obj.molecules[m];
        mol.displayMode = 0;
        for (a=0; a<mol.atoms.length; a++) mol.atoms[a].displayMode = 2;
        mol.showSC = true;
        mol.chain.twoDcache = null;
      }
    }
    else if (dm == molmil.displayMode_BallStick_SC) {
      for (m=0; m<obj.molecules.length; m++) {
        mol = obj.molecules[m];
        for (a=0; a<mol.atoms.length; a++) {
          if (mol.xna) backboneAtomsRef = backboneAtomsXNA;
          else backboneAtomsRef = backboneAtoms;
          if (! mol.ligand && ! mol.water && backboneAtomsRef.hasOwnProperty(mol.atoms[a].atomName)) mol.atoms[a].displayMode = 0;
          else mol.atoms[a].displayMode = 2;
        }
        mol.showSC = true;
        mol.chain.twoDcache = null;
      }
    }
    else if (dm == molmil.displayMode_Stick) {
      obj.displayMode = 1;
      for (m=0; m<obj.molecules.length; m++) {
        mol = obj.molecules[m];
        mol.displayMode = 0;
        for (a=0; a<mol.atoms.length; a++) mol.atoms[a].displayMode = 3;
        mol.showSC = true;
        mol.chain.twoDcache = null;
      }
    }
    else if (dm == molmil.displayMode_Stick_SC) {
      for (m=0; m<obj.molecules.length; m++) {
        mol = obj.molecules[m];
        for (a=0; a<mol.atoms.length; a++) {
          if (mol.xna) backboneAtomsRef = backboneAtomsXNA;
          else backboneAtomsRef = backboneAtoms;
          if (! mol.ligand && ! mol.water && backboneAtomsRef.hasOwnProperty(mol.atoms[a].atomName)) mol.atoms[a].displayMode = 0;
          else mol.atoms[a].displayMode = 3;
        }
        mol.showSC = true;
        mol.chain.twoDcache = null;
      }
    }
    else if (dm == molmil.displayMode_Wireframe) {
      obj.displayMode = 1;
      for (m=0; m<obj.molecules.length; m++) {
        mol = obj.molecules[m];
        mol.displayMode = 0;
        for (a=0; a<mol.atoms.length; a++) mol.atoms[a].displayMode = 4;
        mol.showSC = true;
        mol.chain.twoDcache = null;
      }
    }
    else if (dm == molmil.displayMode_Wireframe_SC) {
      obj.displayMode = 1;
      for (m=0; m<obj.molecules.length; m++) {
        mol = obj.molecules[m];
        for (a=0; a<mol.atoms.length; a++) {
          if (mol.xna) backboneAtomsRef = backboneAtomsXNA;
          else backboneAtomsRef = backboneAtoms;
          if (! mol.ligand && ! mol.water && backboneAtomsRef.hasOwnProperty(mol.atoms[a].atomName)) mol.atoms[a].displayMode = 0;
          else mol.atoms[a].displayMode = 4;
        }
        mol.showSC = true;
        mol.chain.twoDcache = null;
      }
    }
    else if (dm == molmil.displayMode_CaTrace) {
      obj.displayMode = 1;
      for (m=0; m<obj.molecules.length; m++) {
        mol = obj.molecules[m];
        if (! mol.ligand && ! mol.water) {for (a=0; a<mol.atoms.length; a++) mol.atoms[a].displayMode = 0;}
        mol.displayMode = 1;
        mol.showSC = false;
      }
    }
    else if (dm == molmil.displayMode_Tube) {
      obj.displayMode = 2;
      for (m=0; m<obj.molecules.length; m++) {
        mol = obj.molecules[m];
        if (! mol.ligand && ! mol.water) {for (a=0; a<mol.atoms.length; a++) mol.atoms[a].displayMode = 0;}
        mol.displayMode = 2;
        mol.showSC = false;
      }
    }
    else if (dm == molmil.displayMode_Cartoon) {
      if (obj.displayMode == 3) obj.twoDcache = null;
      obj.displayMode = 3;
      for (m=0; m<obj.molecules.length; m++) {
        mol = obj.molecules[m];
        if (! mol.ligand && ! mol.water) {for (a=0; a<mol.atoms.length; a++) mol.atoms[a].displayMode = 0;}
        mol.displayMode = 3;
        mol.showSC = false;
      }      
    }
    else if (dm == molmil.displayMode_CartoonRocket) {
      if (obj.displayMode == 3) obj.twoDcache = null;
      obj.displayMode = 3;
      for (m=0; m<obj.molecules.length; m++) {
        mol = obj.molecules[m];
        if (! mol.ligand && ! mol.water) {for (a=0; a<mol.atoms.length; a++) mol.atoms[a].displayMode = 0;}
        mol.displayMode = 31;
        mol.showSC = false;
      }
    }
    else if (dm == molmil.displayMode_ChainSurfaceCG) {
      obj.displayMode = molmil.displayMode_ChainSurfaceCG;
    }
    else if (dm == molmil.displayMode_ChainSurfaceCG+0.5) {
      obj.displayMode = molmil.displayMode_ChainSurfaceCG;
      obj.HQsurface = true;
    }
    else if (dm == molmil.displayMode_ChainSurfaceSimple) {
      obj.displayMode = molmil.displayMode_ChainSurfaceSimple;
      obj.displaySettings = settings;
    }
  }
  else if (obj instanceof molmil.molObject) {
    if (dm == molmil.displayMode_None) {
      obj.display = false;
      for (a=0; a<obj.atoms.length; a++) obj.atoms[a].display = false;
    }
    else if (dm == molmil.displayMode_Visible) {
      obj.display = true;
      for (a=0; a<obj.atoms.length; a++) obj.atoms[a].display = true;
    }
    else if (dm == molmil.displayMode_None) {
      for (a=0; a<obj.atoms.length; a++) obj.atoms[a].displayMode = 0;
    }
    else if (dm == molmil.displayMode_Default) {
      if (obj.ligand || obj.water) {for (a=0; a<obj.atoms.length; a++) obj.atoms[a].displayMode = 3;}
      else if (obj.xna) for (a=0; a<obj.atoms.length; a++) obj.atoms[a].displayMode = xna_atoms.hasOwnProperty(obj.atoms[a].atomName) || obj.atoms[a].element == "H" ? 0 : 3;
      else {for (a=0; a<obj.atoms.length; a++) obj.atoms[a].displayMode = 0;}
      obj.displayMode = 3;
      obj.showSC = false;
    }
    else if (dm == molmil.displayMode_Spacefill) {
      for (a=0; a<obj.atoms.length; a++) obj.atoms[a].displayMode = 1;
      obj.showSC = true;
      obj.chain.twoDcache = null;
    }
    else if (dm == molmil.displayMode_Spacefill_SC) {
      for (a=0; a<obj.atoms.length; a++) {
        if (obj.xna) backboneAtomsRef = backboneAtomsXNA;
        else backboneAtomsRef = backboneAtoms;
        if (! obj.ligand && ! obj.water && backboneAtomsRef.hasOwnProperty(obj.atoms[a].atomName)) obj.atoms[a].displayMode = 0;
        else obj.atoms[a].displayMode = 1;
      }
      obj.showSC = true;
      obj.chain.twoDcache = null;
    }
    else if (dm == molmil.displayMode_BallStick) {
      for (a=0; a<obj.atoms.length; a++) obj.atoms[a].displayMode = 2;
      obj.showSC = true;
      obj.chain.twoDcache = null;
    }
    else if (dm == molmil.displayMode_BallStick_SC) {
      for (a=0; a<obj.atoms.length; a++) {
        if (obj.xna) backboneAtomsRef = backboneAtomsXNA;
        else backboneAtomsRef = backboneAtoms;
        if (! obj.ligand && ! obj.water && backboneAtomsRef.hasOwnProperty(obj.atoms[a].atomName)) obj.atoms[a].displayMode = 0;
        else obj.atoms[a].displayMode = 2;
      }
      obj.showSC = true;
      obj.chain.twoDcache = null;
    }
    else if (dm == molmil.displayMode_Stick) {
      for (a=0; a<obj.atoms.length; a++) obj.atoms[a].displayMode = 3;
      obj.showSC = true;
      obj.chain.twoDcache = null;
    }
    else if (dm == molmil.displayMode_Stick_SC) {
      for (a=0; a<obj.atoms.length; a++) {
        if (obj.xna) backboneAtomsRef = backboneAtomsXNA;
        else backboneAtomsRef = backboneAtoms;
        if (! obj.ligand && ! obj.water && backboneAtomsRef.hasOwnProperty(obj.atoms[a].atomName)) obj.atoms[a].displayMode = 0;
        else obj.atoms[a].displayMode = 3;
      }
      obj.showSC = true;
      obj.chain.twoDcache = null;
    }
    else if (dm == molmil.displayMode_Wireframe) {
      for (a=0; a<obj.atoms.length; a++) obj.atoms[a].displayMode = 4;
      obj.showSC = true;
      obj.chain.twoDcache = null;
    }
    else if (dm == molmil.displayMode_Wireframe_SC) {
      for (a=0; a<obj.atoms.length; a++) {
        if (obj.xna) backboneAtomsRef = backboneAtomsXNA;
        else backboneAtomsRef = backboneAtoms;
        if (! obj.ligand && ! obj.water && backboneAtomsRef.hasOwnProperty(obj.atoms[a].atomName)) obj.atoms[a].displayMode = 0;
        else obj.atoms[a].displayMode = 4;
      }
      obj.showSC = true;
      obj.chain.twoDcache = null;
    }
    else if (dm == molmil.displayMode_CaTrace) {
      if (! obj.ligand && ! obj.water) {for (a=0; a<obj.atoms.length; a++) obj.atoms[a].displayMode = 0;}
      obj.displayMode = 1;
      obj.showSC = false;
    }
    else if (dm == molmil.displayMode_Tube) {
      if (! obj.ligand && ! obj.water) {for (a=0; a<obj.atoms.length; a++) obj.atoms[a].displayMode = 0;}
      obj.displayMode = 2;
      obj.showSC = false;
    }
    else if (dm == molmil.displayMode_Cartoon) {
      if (! obj.ligand && ! obj.water) {for (a=0; a<obj.atoms.length; a++) obj.atoms[a].displayMode = 0;}
      obj.displayMode = 3;
      obj.showSC = false;
    }
    else if (dm == molmil.displayMode_Cartoon) {
      if (! obj.ligand && ! obj.water) {for (a=0; a<obj.atoms.length; a++) obj.atoms[a].displayMode = 0;}
      obj.displayMode = 31;
      obj.showSC = false;
    }
  }
  else if (obj instanceof molmil.atomObject) {  
    if (dm == molmil.displayMode_None) {
      obj.display = false;
    }
    else if (dm == molmil.displayMode_Visible) {
      obj.display = true;
    }
    else if (dm == molmil.displayMode_Spacefill) {
      obj.displayMode = 1;
    }
    else if (dm == molmil.displayMode_BallStick) {
      obj.displayMode = 2;
    }
    else if (dm == molmil.displayMode_Stick) {
      obj.displayMode = 3;
    }
    else if (dm == molmil.displayMode_Wireframe) {
      obj.displayMode = 4;
    }
   
  }
  else if (obj instanceof molmil.polygonObject) obj.display = dm ? true : false;

  if (rebuildGeometry) {
    soup.renderer.initBuffers();
    soup.renderer.canvas.update = true;  
  }
}

// ** change color mode of a system/chain/molecule/atom **
molmil.colorEntry = function (obj, cm, setting, rebuildGeometry, soup) {
  soup = soup || molmil.cli_soup;
  if (obj instanceof Array) {
    for (var i=0; i<obj.length; i++) molmil.colorEntry(obj[i], cm, setting, null, soup);
    if (rebuildGeometry) {
      soup.renderer.initBuffers();
      soup.renderer.canvas.update = true;  
    }
    return;
  }
  
  var m, a, c, chain, mol, c, chain, list;
  if (obj instanceof molmil.entryObject) {
    if (cm == molmil.colorEntry_Default) { // default
      for (c=0; c<obj.chains.length; c++) {
        chain = obj.chains[c];
        chain.rgba = [255, 255, 255, 255];
        for (m=0; m<chain.molecules.length; m++) {
          mol = chain.molecules[m];
          mol.rgba = molmil_dep.getKeyFromObject(molmil.configBox.sndStrucColor, mol.sndStruc, molmil.configBox.sndStrucColor[1]);
          for (a=0; a<mol.atoms.length; a++) {
            mol.atoms[a].rgba = molmil_dep.getKeyFromObject(molmil.configBox.elementColors, mol.atoms[a].element, molmil.configBox.elementColors.DUMMY);
          }
        }
      }
    }
    else if (cm == molmil.colorEntry_Structure) { // structure
      for (c=0; c<obj.chains.length; c++) {
        chain = obj.chains[c];
        for (m=0; m<chain.molecules.length; m++) {
          mol = chain.molecules[m];
          mol.rgba = molmil_dep.getKeyFromObject(molmil.configBox.sndStrucColor, mol.sndStruc, molmil.configBox.sndStrucColor[1]);
          for (a=0; a<mol.atoms.length; a++) mol.atoms[a].rgba = mol.rgba;
        }
      }
    }
    else if (cm == molmil.colorEntry_CPK) { // atom (cpk)
      for (c=0; c<obj.chains.length; c++) {
        chain = obj.chains[c];
        for (m=0; m<chain.molecules.length; m++) {
          mol = chain.molecules[m];
          for (a=0; a<mol.atoms.length; a++) mol.atoms[a].rgba = molmil_dep.getKeyFromObject(molmil.configBox.elementColors, mol.atoms[a].element, molmil.configBox.elementColors.DUMMY);
          mol.rgba = molmil_dep.getKeyFromObject(molmil.configBox.elementColors, "C", molmil.configBox.elementColors.DUMMY);
        }
      }
    }
    else if (cm == molmil.colorEntry_Group) { // group
      list = [];
      for (c=0; c<obj.chains.length; c++) {
        chain = obj.chains[c];
        if (chain.molecules.length > 1) list = molmil.interpolateBR(chain.molecules.length);
        else list = [[0, 0, 255, 255]];
        for (m=0; m<chain.molecules.length; m++) {
          mol = chain.molecules[m];
          mol.rgba = list[m];
          for (a=0; a<mol.atoms.length; a++) mol.atoms[a].rgba = list[m];
        }
      }
    }
    else if (cm == molmil.colorEntry_Chain) { // chain
      list = molmil.interpolateBR(obj.chains.length);
      for (c=0; c<obj.chains.length; c++) {
        chain = obj.chains[c];
        chain.rgba = list[c];
        for (m=0; m<chain.molecules.length; m++) {
          mol = chain.molecules[m];
          mol.rgba = list[c];
          for (a=0; a<mol.atoms.length; a++) mol.atoms[a].rgba = list[c];
        }
      }
    }
    else if (cm == molmil.colorEntry_Custom) { // custom
      for (c=0; c<obj.chains.length; c++) {
        chain = obj.chains[c];
        chain.rgba = setting;
        for (m=0; m<chain.molecules.length; m++) {
          mol = chain.molecules[m];
          mol.rgba = setting;
          for (a=0; a<mol.atoms.length; a++) mol.atoms[a].rgba = setting;
        }
      }
    }
    else if (cm == molmil.colorEntry_ChainAlt) {
      list = molmil.configBox.bu_colors
      var j = 0;
      for (c=0; c<obj.chains.length; c++) {
        chain = obj.chains[c];
        chain.rgba = [list[j][0], list[j][1], list[j][2], 255]; j++
        for (m=0; m<chain.molecules.length; m++) {
          mol = chain.molecules[m];
          mol.rgba = obj.chains[c].rgba;
          for (a=0; a<mol.atoms.length; a++) mol.atoms[a].rgba = obj.chains[c].rgba;
        }
        if (j >= list.length) j = 0;
      }
    }
    else if (cm == molmil.colorEntry_ABEGO) {
      for (c=0; c<obj.chains.length; c++) {
        chain = obj.chains[c];
        chain.rgba = [255, 255, 255, 255];
        if (chain.isHet) continue;
        if (chain.molecules[0].phiAngle == undefined) molmil.calculateBBTorsions(chain, soup);
        for (m=0; m<chain.molecules.length; m++) {
          mol = chain.molecules[m];
          mol.rgba = [255, 255, 255, 255];
          if (mol.omegaAngle < 45 && mol.omegaAngle > -45) mol.rgba = [128, 128, 128, 255]; // grey
          else if (mol.phiAngle < 0) {
            if (mol.psiAngle > 50 || mol.psiAngle < -75) mol.rgba = [0, 0, 255, 255]; // blue
            else mol.rgba = [255, 0, 0, 255]; // red
          }
          else {
            if (mol.psiAngle > 100 || mol.psiAngle < -100) mol.rgba = [255, 255, 0, 255]; // yellow
            else mol.rgba = [0, 255, 0, 255]; // green
          }
          for (a=0; a<mol.atoms.length; a++) mol.atoms[a].rgba = mol.rgba;
        }
      }
    }
  }
  else if (obj instanceof molmil.chainObject) {
    if (cm == molmil.colorEntry_Default) { // default
      obj.rgba = [255, 255, 255, 255];
      for (m=0; m<obj.molecules.length; m++) {
        mol = obj.molecules[m];
        mol.rgba = molmil_dep.getKeyFromObject(molmil.configBox.sndStrucColor, mol.sndStruc, molmil.configBox.sndStrucColor[1]);
        for (a=0; a<mol.atoms.length; a++) mol.atoms[a].rgba = molmil_dep.getKeyFromObject(molmil.configBox.elementColors, mol.atoms[a].element, molmil.configBox.elementColors.DUMMY);
      }
    }
    else if (cm == molmil.colorEntry_Structure) { // structure
      for (m=0; m<obj.molecules.length; m++) {
        mol = obj.molecules[m];
        mol.rgba = molmil_dep.getKeyFromObject(molmil.configBox.sndStrucColor, mol.sndStruc, molmil.configBox.sndStrucColor[1]);
        for (a=0; a<mol.atoms.length; a++) mol.atoms[a].rgba = mol.rgba;
      }
    }
    else if (cm == molmil.colorEntry_CPK) { // atom (cpk)
      for (m=0; m<obj.molecules.length; m++) {
        mol = obj.molecules[m];
        for (a=0; a<mol.atoms.length; a++) mol.atoms[a].rgba = molmil_dep.getKeyFromObject(molmil.configBox.elementColors, mol.atoms[a].element, molmil.configBox.elementColors.DUMMY);
        mol.rgba = molmil_dep.getKeyFromObject(molmil.configBox.elementColors, "C", molmil.configBox.elementColors.DUMMY);
      }
    }
    else if (cm == molmil.colorEntry_Group) { // group
      list = [];
      chain = obj;
      if (chain.molecules.length > 1) list = molmil.interpolateBR(chain.molecules.length);
      else list = [[1, 1, 1]];
      for (m=0; m<chain.molecules.length; m++) {
        mol = chain.molecules[m];
        mol.rgba = list[m];
        for (a=0; a<mol.atoms.length; a++) mol.atoms[a].rgba = list[m];
      }
    }
    else if (cm == molmil.colorEntry_Custom) { // custom
      obj.rgba = setting;
      for (m=0; m<obj.molecules.length; m++) {
        mol = obj.molecules[m];
        mol.rgba = setting;
        for (a=0; a<mol.atoms.length; a++) mol.atoms[a].rgba = setting;
      }
    }
    else if (cm == molmil.colorEntry_ABEGO && ! obj.isHet) {
      chain = obj;
      chain.rgba = [255, 255, 255, 255];
      if (chain.molecules[0].phiAngle == undefined) molmil.calculateBBTorsions(chain, soup);
      for (m=0; m<chain.molecules.length; m++) {
        mol = chain.molecules[m];
        mol.rgba = [255, 255, 255, 255];
        if (mol.omegaAngle < 45 && mol.omegaAngle > -45) mol.rgba = [128, 128, 128, 255]; // grey
        else if (mol.phiAngle < 0) {
          if (mol.psiAngle > 50 || mol.psiAngle < -75) mol.rgba = [0, 0, 255, 255]; // blue
          else mol.rgba = [255, 0, 0, 255]; // red
        }
        else {
          if (mol.psiAngle > 100 || mol.psiAngle < -100) mol.rgba = [255, 255, 0, 255]; // yellow
          else mol.rgba = [0, 255, 0, 255]; // green
        }
        for (a=0; a<mol.atoms.length; a++) mol.atoms[a].rgba = mol.rgba;
      }
    }
  }
  else if (obj instanceof molmil.molObject) {
    if (cm == molmil.colorEntry_Default) { // default
      mol = obj;
      mol.rgba = molmil_dep.getKeyFromObject(molmil.configBox.sndStrucColor, mol.sndStruc, molmil.configBox.sndStrucColor[1]);
      for (a=0; a<mol.atoms.length; a++) mol.atoms[a].rgba = molmil_dep.getKeyFromObject(molmil.configBox.elementColors, mol.atoms[a].element, molmil.configBox.elementColors.DUMMY);
    }
    else if (cm == molmil.colorEntry_Structure) { // structure
      mol = obj;
      mol.rgba = molmil_dep.getKeyFromObject(molmil.configBox.sndStrucColor, mol.sndStruc, molmil.configBox.sndStrucColor[1]);
      for (a=0; a<mol.atoms.length; a++) mol.atoms[a].rgba = mol.rgba;
    }
    else if (cm == molmil.colorEntry_CPK) { // atom (cpk)
      mol = obj;
      for (a=0; a<mol.atoms.length; a++) mol.atoms[a].rgba = molmil_dep.getKeyFromObject(molmil.configBox.elementColors, mol.atoms[a].element, molmil.configBox.elementColors.DUMMY);
      mol.rgba = molmil_dep.getKeyFromObject(molmil.configBox.elementColors, "C", molmil.configBox.elementColors.DUMMY);
    }
    else if (cm == 3.2) { // atom (cpk)
      mol = obj;
      for (a=0; a<mol.atoms.length; a++) mol.atoms[a].rgba = molmil_dep.getKeyFromObject(molmil.configBox.elementColors, mol.atoms[a].element, molmil.configBox.elementColors.DUMMY);
    }
    else if (cm == molmil.colorEntry_Custom) { // custom
      obj.rgba = setting;
      for (a=0; a<obj.atoms.length; a++) obj.atoms[a].rgba = obj.rgba;
    }
  }
  else if (obj instanceof molmil.atomObject) {
    if (cm == molmil.colorEntry_Default || cm == molmil.colorEntry_CPK) { // default or atom (cpk)
      obj.rgba = molmil_dep.getKeyFromObject(molmil.configBox.elementColors, obj.element, molmil.configBox.elementColors.DUMMY);
    }
    else if (cm == molmil.colorEntry_Structure) { // structure
      mol = obj.molecule;
      obj.rgba = molmil_dep.getKeyFromObject(molmil.configBox.sndStrucColor, mol.sndStruc, molmil.configBox.sndStrucColor[1]);
    }
    else if (cm == molmil.colorEntry_Custom) { // custom
      obj.rgba = setting; // convert to 32bit int
    }
  }
  else if (obj instanceof molmil.polygonObject) {
  }
  else {return;}
  if (rebuildGeometry) {
    soup.renderer.initBuffers();
    soup.renderer.canvas.update = true;  
  }
}


// ** misc functions **

molmil.getAtomFromMolecule = function (molecule, atomName) {
  for (var a=0; a<molecule.atoms.length; a++) if (molecule.atoms[a].atomName == atomName) return molecule.atoms[a];
  return null;
}

molmil.resetColors = function (struc, soup) {
  if (soup) struc.soup = soup;
  soup = soup || molmil.cli_soup;
  for (var m=0, a, c, M, chain; m<soup.structures.length; m++) {
    if (struc && soup.structures[m] != struc) continue;
    if (! soup.structures[m].chains) continue;
    for (c=0; c<soup.structures[m].chains.length; c++) {
      chain = soup.structures[m].chains[c];
      for (a=0; a<chain.atoms.length; a++) chain.atoms[a].rgba = molmil_dep.getKeyFromObject(molmil.configBox.elementColors, chain.atoms[a].element, molmil.configBox.elementColors.DUMMY);
      for (M=0; M<chain.molecules.length; M++) chain.molecules[M].rgba = molmil_dep.getKeyFromObject(molmil.configBox.sndStrucColor, chain.molecules[M].sndStruc, molmil.configBox.sndStrucColor[1]);
    }
  }
};

molmil.fetchFrom = function(obj, what) {
  var out = [], i;
  if (obj instanceof Array) {
    for (i=0; i<obj.length; i++) out = out.concat(molmil.getProteinChains(obj[i], what));
  }
  else if (obj instanceof molmil.atomObject) {
    if (what == molmil.molObject) out.push(obj.molecule);
    else if (what == molmil.chainObject) out.push(obj.chain);
    else if (what == molmil.entryObject) out.push(obj.chain.entry);
  }
  else if (obj instanceof molmil.molObject) {
    if (what == molmil.atomObject) out = out.concat(obj.atoms);
    else if (what == molmil.chainObject) out.push(obj.chain);
    else if (what == molmil.entryObject) out.push(obj.chain.entry);
  }
  else if (obj instanceof molmil.chainObject) {
    if (what == molmil.atomObject) out = out.concat(obj.atoms);
    else if (what == molmil.molObject) out = out.concat(obj.molecules);
    else if (what == molmil.entryObject) out.push(obj.entry);
  }
  else if (obj instanceof molmil.entryObject) {
    if (what == molmil.atomObject) {
      for (i=0; i<obj.chains.length; i++) out = out.concat(obj.atoms[i]);
    }
    else if (what == molmil.molObject) {
      for (i=0; i<obj.chains.length; i++) out = out.concat(obj.molecules[i]);
    }
    else if (what == molmil.chainObject) out = out.concat(obj.chains);
  }
  return out.unique();
};

molmil.getProteinChains = function(obj) {
  var out = [];
  if (obj instanceof Array) {
    for (var i=0; i<obj.length; i++) out = out.concat(molmil.getProteinChains(obj[i]));
  }
  else if (obj instanceof molmil.entryObject) {
    for (var c=0; c<obj.chains.length; c++) {if (! obj.chains[c].isHet && obj.chains[c].molecules.length && ! obj.chains[c].molecules[0].water) out.push(obj.chains[c]);}
  }
  else if (obj instanceof molmil.chainObj) {
    if (! obj.isHet && obj.molecules.length && ! obj.molecules[0].water) out.push(obj);
  }
  return out
}

molmil.getResiduesForChain = function(chain, first, last) {
  var out = [];
  for (var m=0; m<chain.molecules.length; m++) {
    if (chain.molecules[m].RSID >= first && chain.molecules[m].RSID <= last) out.push(chain.molecules[m]);
  }
  return out;
}

molmil.setCanvas = function (soupObject, canvas) {
  soupObject.canvas = canvas;
  if (! canvas.renderer) {
    soupObject.renderer = canvas.renderer = new molmil.render(soupObject);
  }
}

molmil.initTexture = function (src, gl) { // maybe deprecated
  var texture = gl.createTexture(); texture.image = new Image(); texture.image.texture = texture;
  texture.loaded = false;
  texture.image.onload = function() {molmil.handleLoadedTexture(this.texture, gl)}
  texture.image.src = src;
  return texture;
}

molmil.handleLoadedTexture = function (texture, gl) {
  gl.bindTexture(gl.TEXTURE_2D, texture);
  //gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); // ?? needed???????????
  //gl.pixelStorei(gl.UNPACK_FLIP_X_WEBGL, true); // ?? needed???????????
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.bindTexture(gl.TEXTURE_2D, null);
  texture.loaded = true;
}

molmil.resetAttributes = function(gl) {
  for (var e in gl.boundAttributes) if (gl.boundAttributes[e] != 0) gl.boundAttributes[e] = -1;
}

molmil.bindAttribute = function(gl, index, size, type, normalized, stride, offset) {
  if (! gl.boundAttributes[index]) {gl.enableVertexAttribArray(index); gl.boundAttributes[index] = 1;}
  else if (gl.boundAttributes[index] == -1) gl.boundAttributes[index] = 1;
  gl.vertexAttribPointer(index, size, type, normalized, stride, offset);
}

molmil.clearAttributes = function(gl) {
  for (var e in gl.boundAttributes) if (gl.boundAttributes[e] == -1) {gl.disableVertexAttribArray(e); gl.boundAttributes[e] = 0;}
}


// ** waits until all requirements are loaded, then starts the renderer **
molmil.safeStartViewer = function (canvas) {
  if (!canvas.renderer.camera.z_set) {
    canvas.renderer.camera.z = canvas.molmilViewer.calcZ();
    canvas.renderer.camera.z_set = true;
  }
  if (canvas.initialized) return;
  for (var t in canvas.renderer.textures) {
    if (! canvas.renderer.textures[t].loaded) return molmil_dep.asyncStart(molmil.safeStartViewer, [canvas], null, 100);
  }
  canvas.renderer.resizeViewPort();
  molmil.canvasList.push(canvas); canvas.initialized = true;
  if (document.body.classList !== undefined) document.body.classList.add("entryLoaded");
}

molmil.animate_molmilViewers = function () {
  molmil.settings.animationFrameID = requestAnimationFrame(molmil.animate_molmilViewers);
  for (var c=0; c<molmil.canvasList.length; c++) molmil.canvasList[c].renderer.render();
}


molmil.unproject = function (dx, dy, cz, mat) {
  dx = 2 * dx - 1; 
  dy = 2 * dy - 1; 
  cz = 2 * cz - 1; 
  var n = [dx, dy, cz, 1];
  vec4.transformMat4(n, n, mat);
  n[3] = 1/n[3];
  return [n[0]*n[3],n[1]*n[3],n[2]*n[3]];
}

// ** hermite interpolation for geometry **
molmil.hermiteInterpolate = function (a1, a2, T1, T2, nop, line, tangents, post2) {
  "use strict";
  var t, s, s2, s3, h1, h2, h3, h4, tmp;
  for (t=0; t<(nop+(post2 ? 2 : 1)); t+=1) {
    s = t/(nop+1); s2 = s*s; s3 = s2*s;
    h1 = 2*s3 - 3*s2 + 1; h2 = -2*s3 + 3*s2; h3 = s3 - 2*s2 + s; h4 = s3 - s2;
    line.push([(a1[0]*h1) + (a2[0]*h2) + (T1[0]*h3) + (T2[0]*h4), (a1[1]*h1) + (a2[1]*h2) + (T1[1]*h3) + (T2[1]*h4), (a1[2]*h1) + (a2[2]*h2) + (T1[2]*h3) + (T2[2]*h4)]);
  } 

  for (t=0; t<(nop+(post2 ? 2 : 1)); t+=1) {
    s = t/(nop+1); s2 = s*s;
    h1 = 6*(s2-s);
    h2 = 6*(-s2+s);
    h3 = 3*s2-4*s+1;
    h4 = 3*s2-2*s;
    tmp = [(a1[0]*h1) + (a2[0]*h2) + (T1[0]*h3) + (T2[0]*h4), (a1[1]*h1) + (a2[1]*h2) + (T1[1]*h3) + (T2[1]*h4), (a1[2]*h1) + (a2[2]*h2) + (T1[2]*h3) + (T2[2]*h4)];
    vec3.normalize(tmp, tmp);
    tangents.push(tmp);
  }
}

// ** builds a octahedron sphere **
molmil.octaSphereBuilder = function (recursionLevel) {
  var vertices = [], faces = [], index = 0, i, f, faces2, a, b, c, t, addVertex, length, getCenterPoint, centerPointIndex = {};
  addVertex = function(x, y, z) {
    length =  Math.sqrt(x*x + y*y + z*z);
    vertices.push([x/length, y/length, z/length]);
    return index++;
  };
  getCenterPoint = function(v1, v2) {
    var firstIsSmaller = v1 < v2;
    smallerIndex = firstIsSmaller ? v1 : v2;
    greaterIndex = firstIsSmaller ? v2 : v1;
    key = [smallerIndex, greaterIndex];
    
    ret = molmil_dep.getKeyFromObject(centerPointIndex, key, null);
    if (ret != null) return ret;
    
    
    var vert1 = vertices[v1];
    var vert2 = vertices[v2];
    
    var i = addVertex((vert1[0]+vert2[0])*.5, (vert1[1]+vert2[1])*.5, (vert1[2]+vert2[2])*.5);
    centerPointIndex[key] = i;
    return i;
    
  }; 
  addVertex(-1, 1, 0); addVertex(1, 1, 0); addVertex(1, -1, 0); addVertex(-1, -1, 0); addVertex(0, 0, -1); addVertex(0, 0, 1);
  faces.push([0, 1, 4]); faces.push([1, 2, 4]); faces.push([2, 3, 4]); faces.push([3, 0, 4]);
  faces.push([5, 1, 0]); faces.push([5, 2, 1]); faces.push([5, 3, 2]); faces.push([5, 0, 3]);
  
  for (i=0; i<recursionLevel; i++) {
    faces2 = [];
    for (f=0; f<faces.length; f++) {
      a = getCenterPoint(faces[f][0], faces[f][1]);
      b = getCenterPoint(faces[f][1], faces[f][2]);
      c = getCenterPoint(faces[f][2], faces[f][0]);
      faces2.push([faces[f][0], a, c]);
      faces2.push([faces[f][1], b, a]);
      faces2.push([faces[f][2], c, b]);
      faces2.push([a, b, c]);
    }
    faces = faces2;
  }
  return {vertices: vertices, faces: faces};
}

// ** builds half a octahedron sphere **
molmil.buildOctaDome = function (t, side) {
  var sphere = molmil.octaSphereBuilder(t), dx, dy, dz, d, mfd = [], j;
  for (var i=0; i<sphere.vertices.length; i++) {
    dx = sphere.vertices[4][0]-sphere.vertices[i][0];
    dy = sphere.vertices[4][1]-sphere.vertices[i][1];
    dz = sphere.vertices[4][2]-sphere.vertices[i][2];
    d = dx*dx + dy*dy + dz*dz;
    if ((side == 0 && d > 2.00001) || (side == 1 && d < 1.99999)) mfd.push(i);
  }
  for (var i=mfd.length-1; i>-1; i--) sphere.vertices.splice(mfd[i], 1);
  for (i=0; i<sphere.faces.length; i++) { 
    if (mfd.indexOf(sphere.faces[i][0]) != -1 || mfd.indexOf(sphere.faces[i][1]) != -1 || mfd.indexOf(sphere.faces[i][2]) != -1) {
      sphere.faces.splice(i, 1);
      i -= 1;
    }
    else {
      for (j=0; j<sphere.faces[i].length; j++) {for (k=mfd.length-1; k>-1; k--) {if (sphere.faces[i][j] > mfd[k]) sphere.faces[i][j] -= 1;}}
    }
  }
  return sphere;
}

// ** buils a list of bonds for a molecule/residue **
molmil.buildBondsList4Molecule = function (bonds, molecule, xyzRef) {
  var dx, dy, dz, r, a1, a2, xyz1, xyz2, vdwR = molmil.configBox.vdwR;
  for (a1=0; a1<molecule.atoms.length; a1++) {
    for (a2=a1+1; a2<molecule.atoms.length; a2++) {
      if (molecule.atoms[a1].label_alt_id != molecule.atoms[a2].label_alt_id && molecule.atoms[a1].label_alt_id != null && molecule.atoms[a2].label_alt_id != null) continue;
      xyz1 = molecule.atoms[a1].xyz;
      xyz2 = molecule.atoms[a2].xyz;
      dx = xyzRef[xyz1]-xyzRef[xyz2]; dx *= dx;
      dy = xyzRef[xyz1+1]-xyzRef[xyz2+1]; dy *= dy;
      dz = xyzRef[xyz1+2]-xyzRef[xyz2+2]; dz *= dz;
      r = dx+dy+dz;
      maxDistance = 3.24;
      if (vdwR[molecule.atoms[a1].element] === undefined || vdwR[molecule.atoms[a1].element] >= 1.8) {
        if (vdwR[molecule.atoms[a2].element] === undefined || vdwR[molecule.atoms[a2].element] >= 1.8) maxDistance = 6.0;
        else maxDistance = 4.5;
      }
      else if (vdwR[molecule.atoms[a2].element] === undefined || vdwR[molecule.atoms[a2].element] >= 1.8) {
        if (vdwR[molecule.atoms[a1].element] === undefined || vdwR[molecule.atoms[a1].element] >= 1.8) maxDistance = 6.0;
        else maxDistance = 4.5;
      }
      else if (molecule.atoms[a1].element == "H" || molecule.atoms[a2].element == "H" || molecule.atoms[a1].element == "D" || molecule.atoms[a2].element == "D") maxDistance = 1.6;
      if (r <= maxDistance) bonds.push([molecule.atoms[a1], molecule.atoms[a2], 1]);
    }
  }
}

// ** osx 10.6 is unstable **
molmil.isBlackListed = function () {
  if (molmil.ignoreBlackList) return false;
  if (navigator.userAgent.indexOf("Mac OS X 10.6") != -1) return true;
  else if (navigator.userAgent.indexOf("Mac OS X 10_6") != -1) return true;
  return false;
}

molmil.addEnableMolmilButton = function (canvas) {
  canvas.renderer = canvas.molmilViewer.renderer;
  var div = molmil_dep.dcE("DIV");
  var button = div.pushNode(molmil_dep.createButton("Enable")); // implement in molmil_dep
  canvas.style.display = "none";
  canvas.parentNode.pushNode(div);
  button.onclick = function() {molmil.ignoreBlackList = true; molmil_dep.reloadPage();};
  return div;
}

// ** initializes a viewer object (quick function) **
molmil.createViewer = function (target, width, height, soupObject, noUI) {
  var canvas;
  var dpr = window.devicePixelRatio || 1;
  if (target.tagName.toLowerCase() == "canvas") canvas = target;
  else canvas = target.pushNode("canvas");
  width = width || canvas.width; height = height || canvas.height;
  canvas.width = width*dpr; canvas.height = height*dpr; canvas.defaultSize = [width, height];

  canvas.style.width = width+"px";
  canvas.style.height = height+"px";

  canvas.setSize = function(w, h) {
    var dpr = window.devicePixelRatio || 1;
    this.renderer.width = this.width = w * dpr;
    this.renderer.height = this.height = h * dpr;
    this.style.width = w+"px";
    this.style.height = h+"px";
    this.renderer.resizeViewPort(); this.update = true; this.renderer.render();
  };
  
  if (soupObject) {
    canvas.molmilViewer = soupObject;
    molmil.setCanvas(soupObject, canvas);
    canvas.molmilViewer.renderer.camera = canvas.molmilViewer.defaultCanvas[1].camera;
    canvas.molmilViewer.renderer.QLV = canvas.molmilViewer.defaultCanvas[1].QLV;
  }
  else {
    canvas.molmilViewer = new molmil.viewer(canvas);
    if (molmil.isBlackListed()) {return molmil.addEnableMolmilButton(canvas);}
  }
  if (! canvas.molmilViewer.renderer.initGL(canvas)) return canvas.molmilViewer.renderer.altCanvas;
  canvas.style.backgroundColor = "rgb("+Math.round(molmil.configBox.BGCOLOR[0]*255)+", "+Math.round(molmil.configBox.BGCOLOR[1]*255)+", "+Math.round(molmil.configBox.BGCOLOR[2]*255)+")";
  if (! noUI) canvas.molmilViewer.UI.init();
  canvas.molmilViewer.renderer.initRenderer();
  if (soupObject) {
    canvas.renderer.initBuffers();
    canvas.update = true;
    molmil.safeStartViewer(canvas);
  }
  return canvas;
}

molmil.selectQLV = function (renderer, QLV, rebuildGeometry) {
  QLV = Math.min(Math.max(QLV, 0), molmil.configBox.QLV_SETTINGS.length-1);
  if (molmil.configBox.liteMode) QLV = 1;
  renderer.QLV = QLV;
  if (rebuildGeometry) {
    renderer.initBuffers();
    renderer.canvas.update = true;
  }
}

// ** generates a smooth interpolation between blue and red **
molmil.interpolateBR = function (length) {
  if (length == 1) return [[0, 0, 255, 255]];
  var list = [], tmp;
  for (var i=0; i<length; i++) {
    tmp = molmil.hslToRgb123((1-(i/(length-1)))*(2/3), 1.0, 0.5);
    list.push([tmp[0]*255, tmp[1]*255, tmp[2]*255, 255]);
  }
  return list;
}

molmil.resetCOG = function (canvas, recalc) {
  if (recalc) canvas.molmilViewer.calculateCOG();
  canvas.molmilViewer.avgXYZ = [canvas.molmilViewer.avgX, canvas.molmilViewer.avgY, canvas.molmilViewer.avgZ];
  canvas.molmilViewer.stdXYZ = [canvas.molmilViewer.stdX, canvas.molmilViewer.stdY, canvas.molmilViewer.stdZ]; // don't know yet how to calculate this one...

  canvas.molmilViewer.COR = canvas.molmilViewer.avgXYZ;
  //canvas.renderer.camera.z = -Math.pow(canvas.molmilViewer.stdXYZ[0]+canvas.molmilViewer.stdXYZ[1], 1.25)-((canvas.molmilViewer.stdXYZ[0]+canvas.molmilViewer.stdXYZ[1])*5)-12;
  canvas.renderer.camera.z = canvas.molmilViewer.calcZ();
}

// ** quick-load functions **

molmil.loadFile = function(loc, format, cb, async, soup) {
  soup = soup || molmil.cli_soup;
  soup.loadStructure(loc, format, cb || function(target, struc) {
    molmil.displayEntry(struc, 1);
    molmil.colorEntry(struc, 1, null, true, soup);
  }, {async: async ? true : false});
};

molmil.loadPDBlite = function(pdbid, cb, async, soup) {
  molmil.configBox.liteMode = true;
  
  soup = soup || molmil.cli_soup;
  
  var requestA = new molmil_dep.CallRemote("GET"), async = true; requestA.ASYNC = async;
  requestA.OnDone = function() {this.atom_data = JSON.parse(this.request.responseText);}
  requestA.OnError = function() {
    this.error = true;
    soup = soup || molmil.cli_soup;
    soup.loadStructure(molmil.settings.pdb_url.replace("__ID__", pdbid), 1, cb || function(target, struc) {
      delete target.pdbxData;
      molmil.displayEntry(struc, molmil.displayMode_Default);
      molmil.displayEntry(struc, molmil.displayMode_CartoonRocket);
      molmil.colorEntry(struc, 1, null, true, soup);
    }, {async: async ? true : false});
    
    
  };
  requestA.Send(molmil.settings.pdb_url.replace("format=mmjson-all", "format=mmjson-lite").replace("__ID__", pdbid));
  var requestB = new molmil_dep.CallRemote("GET"), async = true; requestB.ASYNC = async; requestB.target = this; requestB.requestA = requestA; 
  requestB.OnDone = function() {
    if (this.requestA.error) return;
    if (! this.requestA.atom_data) return molmil_dep.asyncStart(this.OnDone, [], this, 100);
    var jso = JSON.parse(this.request.responseText);
    jso["data_"+pdbid.toUpperCase()]["atom_site"] = this.requestA.atom_data["data_"+pdbid.toUpperCase()]["atom_site"];
    soup.loadStructureData(jso, "mmjson", pdbid+".json", cb || function(target, struc) { // later switch this to use the new lite mmjson files...
      delete target.pdbxData;
      molmil.displayEntry(struc, molmil.displayMode_Default);
      molmil.displayEntry(struc, molmil.displayMode_CartoonRocket);
      molmil.colorEntry(struc, 1, null, true, soup);
    });
  };
  requestB.Send(molmil.settings.pdb_url.replace("__ID__", pdbid).replace("format=mmjson-all", "format=mmjson-plus-noatom"));
};

molmil.loadPDB = function(pdbid, cb, async, soup) {
  soup = soup || molmil.cli_soup;
  soup.loadStructure(molmil.settings.pdb_url.replace("__ID__", pdbid), 1, cb || function(target, struc) {
    if (soup.AID > 150000 && (navigator.userAgent.toLowerCase().indexOf("mobile") != -1 || navigator.userAgent.toLowerCase().indexOf("android") != -1 || window.navigator.msMaxTouchPoints)) molmil.displayEntry(struc, molmil.displayMode_Wireframe);
    else molmil.displayEntry(struc, 1);
    molmil.colorEntry(struc, 1, null, true, soup);
  }, {async: async ? true : false});
};

molmil.loadCC = function(comp_id, cb, async, soup) {
  soup = soup || molmil.cli_soup;
  soup.loadStructure(molmil.settings.comp_url.replace("__ID__", comp_id), 1, cb || function(target, struc) {
    molmil.displayEntry(struc, 1);
    molmil.colorEntry(struc, 1, null, true, soup);
  }, {async: async ? true : false});
};

// ** resets molmil (empties the system) **
molmil.clear = function(canvas) {
  canvas = canvas || molmil.cli_canvas;
  canvas.molmilViewer.clear();
  canvas.renderer.initBuffers();
  canvas.renderer.camera.reset();
  canvas.update = true;
  if (document.body.classList !== undefined) document.body.classList.remove("entryLoaded");
};

molmil.tubeSurface = function(chains, settings, soup) { // volumetric doesn't draw simple tubes, it adds volume (radii at different positions along the tube) to the tube
  if (chains instanceof molmil.chainObject) chains = [chains];
  if (! chains.length) return;
  
  soup = soup || molmil.cli_soup;
  settings = settings || {};
  var rgba;

  var CB_NOI = molmil.configBox.QLV_SETTINGS[soup.renderer.QLV].CB_NOI/32; // NOI per A
  
  var chainRepr = [], c, radii = [];
  
  for (c=0; c<chains.length; c++) {
    chain = chains[c];
    rgba = settings.rgba || chain.rgba;
    var xyzs = [], modelsXYZ = chain.modelsXYZ[0]; // set correct ID
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
  
    // the downside of this method is that we don't know what the other PCs...
  
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
  
  soup.renderer.programs.push(program);
  
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
  var modelsXYZ = chain.modelsXYZ[0];
      
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
	var cubeIndex = 0, vertlist = [], i, x, y, z, v0 = [0, 0, 0], v1 = [0, 0, 0], iv = 0, faces = [], vertexIndex = {}, vertices = [], face_normals = [], idx, vert1, vert2, vert3;
  
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
          
          faces.push(triangle);
          face_normals.push(normal);
        }
      }
    }
  }
  
  return {vertices: vertices, faces: faces, vertexIndex: vertexIndex, face_normals: face_normals};
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

molmil.lighterRGB = function(rgbIn, factor, nR) {
  var rgb = [rgbIn[0], rgbIn[1], rgbIn[2]];
  var total = rgb[0]+rgb[1]+rgb[2];
  var adjust = ((255.0 * 3 - total) * factor) / 3;
  rgb[0] += adjust;
  rgb[1] += adjust;
  rgb[2] += adjust;
  rgb = molmil.redistributeRGB(rgb);
  if (nR) return rgb;
  else return [Math.round(rgb[0]), Math.round(rgb[1]), Math.round(rgb[2])];
}

molmil.redistributeRGB = function(rgb) {
  var threshold = 255;
  var m = Math.max(Math.max(rgb[0], rgb[1]), rgb[2]);
  if (m <= threshold) return rgb;
  var total = rgb[0]+rgb[1]+rgb[2];
  if (total >= 3*threshold) return [threshold, threshold, threshold];
  var x = (3 * threshold - total) / (3 * m - total);
  var gray = threshold - x * m;
  rgb[0] = gray + x * rgb[0];
  rgb[1] = gray + x * rgb[1];
  rgb[2] = gray + x * rgb[2];
  return rgb;
}
 
// ** biological unit generation **
 
//no_identity, NOC
// var is required temporarily for newweb compatibility
var buCheck = molmil.buCheck = function(assembly_id, displayMode, colorMode, struct, soup) {
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

  var BU = soup.BUassemblies[assembly_id];
  
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
      m = soup.BUmatrices[BU[p][0][i]];
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
        m = soup.BUmatrices[BU[p][0][c]];
        if (m[0] == "identity operation") {no_identity = false; continue;}
        chainInfo[asym_ids[i]].push(m[1]);
      }
      
      var matrices = [];
      
      // bb cpk, ca cpk, ca structure
      if ((displayMode == 1 && colorMode == 1) || (displayMode == 2 && colorMode == 1) || (displayMode == 2 && colorMode == 4)) {
        for (c=0; c<BU[p][0].length; c++) {
          m = soup.BUmatrices[BU[p][0][c]];
          if (m[0] == "identity operation") {no_identity = false; continue;}
          matrices.push(m[1]);
        }

      }
      else if ((displayMode == 3 || displayMode == 4) && colorMode == 4) {
        for (c=0; c<BU[p][0].length; c++) {
          m = soup.BUmatrices[BU[p][0][c]];
          if (m[0] == "identity operation") {no_identity = false; continue;}
          matrices.push(m[1]);
        }
      
        
      }
      else if ((displayMode == 3 || displayMode == 4 || displayMode == 5) && (colorMode == 2 || colorMode == 3 || colorMode == 5)) {
        for (c=0; c<BU[p][0].length; c++) {
          m = soup.BUmatrices[BU[p][0][c]];
          if (m[0] == "identity operation") {no_identity = false; continue;}
          matrices.push(m[1]);
        }
      }
      else {
        for (c=0; c<BU[p][0].length; c++) {
          m = soup.BUmatrices[BU[p][0][c]];
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
molmil.toggleBU = function(assembly_id, displayMode, colorMode, struct, soup) {
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
  
  
  var BU = soup.BUassemblies[assembly_id];

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
      m = soup.BUmatrices[BU[p][0][i]];
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
      if (soup.BUcache.hasOwnProperty(asym_ids[i]) && soup.BUcache[asym_ids[i]].hasOwnProperty(displayMode)) {
        c = soup.BUcache[asym_ids[i]][displayMode]; vbuffer = c[0]; ibuffer = c[1]; COM = c[2]; noe = c[3]; rangeInfo = c[4];
      }
      else if (displayMode == 3 || displayMode == 4) { // tube or cartoon
        var dm_cache = [], rgba_cache = [], tmp, xyz, chains = [];
      
        var DM = 2;
        if (displayMode == 4) DM = 3;
        COM = [0, 0, 0, 0];
        A[0] = A[1] = A[2] = 1e99; // xyzMin
        B[0] = B[1] = B[2] = -1e99; // xyzMax
        
        for (c=0; c<struct.chains.length; c++) {
          if (struct.chains[c].molecules.length < 1 || struct.chains[c].isHet || struct.chains[c].molecules[0].water) continue;
          if (struct.chains[c].name != asym_ids[i]) continue;
          chains.push(struct.chains[c]);
          dm_cache.push(struct.chains[c].displayMode);
          struct.chains[c].displayMode = DM;
          rgba_cache.push(tmp=[]);
          for (m=0; m<struct.chains[c].molecules.length; m++) {
            tmp.push(struct.chains[c].molecules[m].rgba);
            struct.chains[c].molecules[m].rgba = molmil_dep.getKeyFromObject(molmil.configBox.sndStrucColor, struct.chains[c].molecules[m].sndStruc, molmil.configBox.sndStrucColor[1]);
            
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
        gl.bufferData(gl.ARRAY_BUFFER, molmil.geometry.buffer3.vertexBuffer, gl.STATIC_DRAW);
  
        ibuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, molmil.geometry.buffer3.indexBuffer, gl.STATIC_DRAW);

        if (! soup.BUcache.hasOwnProperty(asym_ids[i])) soup.BUcache[asym_ids[i]] = {};
        
        soup.BUcache[asym_ids[i]][displayMode] = [vbuffer, ibuffer, COM, noe = molmil.geometry.buffer3.indexBuffer.length, []];

        for (c=0; c<chains.length; c++) {
          chains[c].displayMode = dm_cache[c];
          for (m=0; m<chains[c].molecules.length; m++) chains[c].molecules[m].rgba = rgba_cache[c][m];
        }
        
        molmil.geometry.reset();
        
      }
      else if (displayMode == 5) { // lowres surface...
        var surf;
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
          
          for (c=0, m=0, m8=0; c<surf.vertices.length; c++, m8 += 32) {
            vertices[m++] = surf.vertices[c][0];
            vertices[m++] = surf.vertices[c][1];
            vertices[m++] = surf.vertices[c][2];
            
            COM[0] += surf.vertices[c][0]; COM[1] += surf.vertices[c][1]; COM[2] += surf.vertices[c][2]; COM[3] += 1;
            
            if (surf.vertices[c][0] < A[0]) A[0] = surf.vertices[c][0];
            if (surf.vertices[c][1] < A[1]) A[1] = surf.vertices[c][1];
            if (surf.vertices[c][2] < A[2]) A[2] = surf.vertices[c][2];
            if (surf.vertices[c][0] > B[0]) B[0] = surf.vertices[c][0];
            if (surf.vertices[c][1] > B[1]) B[1] = surf.vertices[c][1];
            if (surf.vertices[c][2] > B[2]) B[2] = surf.vertices[c][2];
            
            vertices[m++] = surf.normals[c][0];
            vertices[m++] = surf.normals[c][1];
            vertices[m++] = surf.normals[c][2];
            
            m++; // color
            m++; // AID
          }
          
          COM[0] /= COM[3]; COM[1] /= COM[3]; COM[2] /= COM[3];
          
          for (c=0, m=0; c<surf.faces.length; c++) {indices[m++] = surf.faces[c][0]; indices[m++] = surf.faces[c][1]; indices[m++] = surf.faces[c][2];}
          
          vbuffer = gl.createBuffer();
          gl.bindBuffer(gl.ARRAY_BUFFER, vbuffer);
          gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
  
          ibuffer = gl.createBuffer();
          gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibuffer);
          gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
        
          if (! soup.BUcache.hasOwnProperty(asym_ids[i])) soup.BUcache[asym_ids[i]] = {};
        
          soup.BUcache[asym_ids[i]][displayMode] = [vbuffer, ibuffer, COM, noe = surf.faces.length*3, []];
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
        
        soup.BUcache[asym_ids[i]][displayMode] = [vbuffer, ibuffer, COM, noe = indices.length, []];
      }

      for (c=0; c<BU[p][0].length; c++) {
        m = soup.BUmatrices[BU[p][0][c]];
        if (m[0] == "identity operation") {no_identity = false; continue;}
        chainInfo[asym_ids[i]].push(m[1]);
      }

      var settings = {multiMatrix: true}, matrices = [], uniform_color = [];
      
      // bb cpk, ca cpk, ca structure
      if ((displayMode == 1 && colorMode == 1) || (displayMode == 2 && colorMode == 1) || (displayMode == 2 && colorMode == 4)) {
        for (c=0; c<BU[p][0].length; c++) {
          m = soup.BUmatrices[BU[p][0][c]];
          if (m[0] == "identity operation") {no_identity = false; continue;}
          matrices.push(m[1]);
        }
        
        settings.has_ID = true;
        settings.lines_render = true;
      }
      else if ((displayMode == 3 || displayMode == 4) && colorMode == 4) {
        for (c=0; c<BU[p][0].length; c++) {
          m = soup.BUmatrices[BU[p][0][c]];
          if (m[0] == "identity operation") {no_identity = false; continue;}
          matrices.push(m[1]);
        }
      
        settings.solid = true;
        settings.has_ID = true;
      }
      else if ((displayMode == 3 || displayMode == 4 || displayMode == 5) && (colorMode == 2 || colorMode == 3 || colorMode == 5)) {
        uniform_color = [];
        for (c=0; c<BU[p][0].length; c++) {
          m = soup.BUmatrices[BU[p][0][c]];
          if (m[0] == "identity operation") {no_identity = false; continue;}
          matrices.push(m[1]);
          if (colorMode == 2) uniform_color.push(uniform_colors[i] || [255, 255, 255]); // asym chain
          else if (colorMode == 3) {
            uniform_color.push(uniform_colors[j++] || [255, 255, 255]); // chain
          }
          else if (colorMode == 5) {
            uniform_color.push(uniform_colors[j++] || [255, 255, 255]); // chain
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
          m = soup.BUmatrices[BU[p][0][c]];
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
      program.BUprogram = true; program.matrices = matrices; program.uniform_color = uniform_color;
      
      if (program.matrices.length) renderer.programs.push(program);
      if (rangeInfo) {A = rangeInfo[0]; B = rangeInfo[1];}
      else {
        try {soup.BUcache[asym_ids[i]][displayMode][4] = [[A[0], A[1], A[2]], [B[0], B[1], B[2]]];}
        catch (e) {}
      }
      
      if (! no_identity) {
        if (COM[3] != 0) {
          COM_avg[0] += COM[0]; COM_avg[1] += COM[1]; COM_avg[2] += COM[2]; COM_avg[3] += 1;
          if (A[0] < xMin) xMin = A[0];
          if (A[1] < yMin) yMin = A[1];
          if (A[2] < zMin) zMin = A[2];
          if (B[0] > xMax) xMax = B[0];
          if (B[1] > yMax) yMax = B[1];
          if (B[2] > zMax) zMax = B[2];
        }
        toggleIdentity[asym_ids[i]] = 1;
      }
      
      
      
      for (c=0; c<program.matrices.length; c++) {
        if (COM[3] == 0) continue;
        vec3.transformMat4(COM_tmp, COM, program.matrices[c]);
        COM_avg[0] += COM_tmp[0]; COM_avg[1] += COM_tmp[1]; COM_avg[2] += COM_tmp[2]; COM_avg[3] += 1;
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
      
      if (! no_identity) any_identity = true;
    }
  }
  
  if (COM_avg[3]) {COM_avg[0] /= COM_avg[3]; COM_avg[1] /= COM_avg[3]; COM_avg[2] /= COM_avg[3];}
      
  soup.COR[0] = COM_avg[0];
  soup.COR[1] = COM_avg[1];
  soup.COR[2] = COM_avg[2];
  
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
  
  if (xMin < 1e9) soup.geomRanges = [xMin-COM_avg[0], xMax-COM_avg[0], yMin-COM_avg[1], yMax-COM_avg[1], zMin-COM_avg[2], zMax-COM_avg[2]];
  
  // geomRanges doesn't appear to be correct...
    
  if (COM_avg[3] == 0) {
    soup.COR = JSON.parse(JSON.stringify(soup.sceneBU.COR));
    soup.geomRanges = JSON.parse(JSON.stringify(soup.sceneBU.geomRanges));
  }

  // add some way to update stdXYZ to deal properly with fog (and DoF in the future)
  
  if (update || ! renderer.initBD) renderer.initBuffers();
  
  
  if (soup.sceneBU.assembly_id != assembly_id) renderer.camera.z = soup.calcZ();
  soup.sceneBU.assembly_id = assembly_id;
 
  soup.canvas.update = true;
  
  
  //console.log(! canvas.molmilViewer.sceneBU.no_identity , canvas.molmilViewer.sceneBU.NOC > 1);
  
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

molmil.calcHbonds  = function(group1, group2, soup) { // find H-bonds between group1 and group2
  if (! (group1 instanceof Array)) group1 = [group1];
  if (! (group2 instanceof Array)) group2 = [group2];
    
  // acceptors: list of acceptor atom
  // donors: list of [donor atom, hydrogen atom]
  var acceptors1 = [], acceptors2 = [], donors1 = [], donors2 = []; // first fetch all the possible acceptors and donors from each group...
  var c, i, j, a, a2, hcon = {}, nbonds = {};
    
    
    
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
    if (! group1[c].bondsOK) soup.buildBondList(group1[c], false);
    for (a=0; a<group1[c].atoms.length; a++) nbonds[group1[c].atoms[a].AID] = 0;
    for (a=0; a<group1[c].bonds.length; a++) {
      if (group1[c].bonds[a][0].element == "H") {
        if (! hcon[group1[c].bonds[a][1].AID]) hcon[group1[c].bonds[a][1].AID] = [];
        hcon[group1[c].bonds[a][1].AID].push(group1[c].bonds[a][0]);
      }
      if (group1[c].bonds[a][1].element == "H") {
        if (! hcon[group1[c].bonds[a][0].AID]) hcon[group1[c].bonds[a][0].AID] = [];
        hcon[group1[c].bonds[a][0].AID].push(group1[c].bonds[a][1]);
      }
      nbonds[group1[c].bonds[a][0].AID]++;
      nbonds[group1[c].bonds[a][1].AID]++;
    }
    getAcceptors4Chain(group1[c], acceptors1);
    getDonors4Chain(group1[c], donors1);
  }
    
  for (c=0; c<group2.length; c++) {
    if (! group2[c].bondsOK) soup.buildBondList(group2[c], false);
    for (a=0; a<group2[c].atoms.length; a++) nbonds[group2[c].atoms[a].AID] = 0;
    for (a=0; a<group2[c].bonds.length; a++) {
      if (group2[c].bonds[a][0].element == "H") {
        if (! hcon[group2[c].bonds[a][1].AID]) hcon[group2[c].bonds[a][1].AID] = [];
        hcon[group2[c].bonds[a][1].AID].push(group2[c].bonds[a][0]);
      }
      if (group2[c].bonds[a][1].element == "H") {
        if (! hcon[group2[c].bonds[a][0].AID]) hcon[group2[c].bonds[a][0].AID] = [];
        hcon[group2[c].bonds[a][0].AID].push(group2[c].bonds[a][1]);
      }
      nbonds[group2[c].bonds[a][0].AID]++;
      nbonds[group2[c].bonds[a][1].AID]++;
    }
    getAcceptors4Chain(group2[c], acceptors2);
    getDonors4Chain(group2[c], donors2);
  }
    
  // now find matches between acceptors1-donors2 and acceptors2-donors1 (within 3A D-A and 45degrees D-H-A)
    
  var pairs = [];
    
  for (i=0; i<acceptors1.length; i++) {
    for (j=0; j<donors2.length; j++) {
      r = molmil.calcMMDistance(acceptors1[i], donors2[j][0], soup);
      if (r < 3.0) {
        theta = molmil.calcMMAngle(acceptors1[i], donors2[j][1], donors2[j][0], soup);
        if (theta > 135) pairs.push([acceptors1[i], donors2[j][1]]);
      }
    }
  }
    
  for (i=0; i<acceptors2.length; i++) {
    for (j=0; j<donors1.length; j++) {
      r = molmil.calcMMDistance(acceptors2[i], donors1[j][0], soup);
      if (r < 3.0) {
        theta = molmil.calcMMAngle(acceptors2[i], donors1[j][1], donors1[j][0], soup);
        if (theta > 135) pairs.push([acceptors2[i], donors1[j][1]]);
      }
    }
  }
    
  // now create some 3D graphics to depict these bonds...
  var objects = [], object;
  for (i=0; i<pairs.length; i++) objects.push({type: "cylinder", coords: [molmil.getAtomXYZ(pairs[i][0], soup), molmil.getAtomXYZ(pairs[i][1], soup)], rgba: [255, 255, 0, 255], radius: 0.05});
    
  molmil.geometry.generator(objects, soup, "Hydrogen bonds", {solid: true});
    
  return pairs;
}
  

molmil.hslToRgb123 = function (h, s, l) {
  var r, g, b;
  if (s == 0) r = g = b = l; // achromatic
  else {
    function hue2rgb(p, q, t) {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    }
    var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    var p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  return [r, g, b];
}

// ** distance/angle/torsion calculation **

molmil.getAtomXYZ = function (atom, soup) {
  var modelId = soup.renderer.modelId;
  return [atom.chain.modelsXYZ[modelId][atom.xyz], atom.chain.modelsXYZ[modelId][atom.xyz+1], atom.chain.modelsXYZ[modelId][atom.xyz+2]];
}

molmil.calcMMDistance = function (a1, a2, soup) {
  var modelId = soup.renderer.modelId, xyz1, xyz2;
  xyz1 = [a1.chain.modelsXYZ[modelId][a1.xyz], a1.chain.modelsXYZ[modelId][a1.xyz+1], a1.chain.modelsXYZ[modelId][a1.xyz+2]];
  xyz2 = [a2.chain.modelsXYZ[modelId][a2.xyz], a2.chain.modelsXYZ[modelId][a2.xyz+1], a2.chain.modelsXYZ[modelId][a2.xyz+2]];
  
  try {return vec3.distance(xyz1, xyz2);}
  catch (e) {return NaN;}
}

molmil.calcMMAngle = function (a1, a2, a3, soup) {
  var modelId = soup.renderer.modelId, xyz1, xyz2, xyz3;
  xyz1 = [a1.chain.modelsXYZ[modelId][a1.xyz], a1.chain.modelsXYZ[modelId][a1.xyz+1], a1.chain.modelsXYZ[modelId][a1.xyz+2]];
  xyz2 = [a2.chain.modelsXYZ[modelId][a2.xyz], a2.chain.modelsXYZ[modelId][a2.xyz+1], a2.chain.modelsXYZ[modelId][a2.xyz+2]];
  xyz3 = [a3.chain.modelsXYZ[modelId][a3.xyz], a3.chain.modelsXYZ[modelId][a3.xyz+1], a3.chain.modelsXYZ[modelId][a3.xyz+2]];
  
  var r2d = 180. / Math.PI, v1 = [0, 0, 0], v2 = [0, 0, 0];
  try{
    vec3.subtract(v1, xyz1, xyz2); vec3.normalize(v1, v1);
    vec3.subtract(v2, xyz3, xyz2); vec3.normalize(v2, v2);
    return Math.acos(vec3.dot(v1, v2))*r2d;
  }
  catch (e) {return NaN;}
}

molmil.calcMMTorsion = function (a1, a2, a3, a4, soup) {
  var modelId = soup.renderer.modelId, xyz1, xyz2, xyz3, xyz4;
  xyz1 = [a1.chain.modelsXYZ[modelId][a1.xyz], a1.chain.modelsXYZ[modelId][a1.xyz+1], a1.chain.modelsXYZ[modelId][a1.xyz+2]];
  xyz2 = [a2.chain.modelsXYZ[modelId][a2.xyz], a2.chain.modelsXYZ[modelId][a2.xyz+1], a2.chain.modelsXYZ[modelId][a2.xyz+2]];
  xyz3 = [a3.chain.modelsXYZ[modelId][a3.xyz], a3.chain.modelsXYZ[modelId][a3.xyz+1], a3.chain.modelsXYZ[modelId][a3.xyz+2]];
  xyz4 = [a4.chain.modelsXYZ[modelId][a4.xyz], a4.chain.modelsXYZ[modelId][a4.xyz+1], a4.chain.modelsXYZ[modelId][a4.xyz+2]];
  
  var r2d = 180. / Math.PI, b0 = [0, 0, 0], b1 = [0, 0, 0], b2 = [0, 0, 0], v = [0, 0, 0], w = [0, 0, 0], x, y, tmp = [0, 0, 0];
  
  try {
    vec3.subtract(b0, xyz2, xyz1); vec3.negate(b0, b0);
    vec3.subtract(b1, xyz3, xyz2); vec3.normalize(b1, b1);
    vec3.subtract(b2, xyz4, xyz3);
  
    vec3.subtract(v, b0, vec3.scale(tmp, b1, vec3.dot(b0, b1)));
    vec3.subtract(w, b2, vec3.scale(tmp, b1, vec3.dot(b2, b1)));
    x = vec3.dot(v, w);
    y = vec3.dot(vec3.cross(tmp, b1, v), w);
    return Math.atan2(y, x)*r2d;
  }
  catch (e) {return NaN;}
}

molmil.calculateBBTorsions = function(chain, soup) {
  // calculate the phi/psi angles for the given chain...
  // phi: C_-N-CA-C
  // psi: N-CA-C-N^
  if (chain.molecules.length < 2) return;
  
  for (var m=1; m<chain.molecules.length-1; m++) {
    chain.molecules[m].phiAngle = molmil.calcMMTorsion(chain.molecules[m-1].C, chain.molecules[m].N, chain.molecules[m].CA, chain.molecules[m].C, soup);
    chain.molecules[m].psiAngle = molmil.calcMMTorsion(chain.molecules[m].N, chain.molecules[m].CA, chain.molecules[m].C, chain.molecules[m+1].N, soup);
    chain.molecules[m].omegaAngle = molmil.calcMMTorsion(chain.molecules[m-1].CA, chain.molecules[m-1].C, chain.molecules[m].N, chain.molecules[m].CA, soup);
  }
  
  chain.molecules[0].psiAngle = molmil.calcMMTorsion(chain.molecules[0].N, chain.molecules[0].CA, chain.molecules[0].C, chain.molecules[1].N, soup);
  chain.molecules[m].phiAngle = molmil.calcMMTorsion(chain.molecules[m-1].C, chain.molecules[m].N, chain.molecules[m].CA, chain.molecules[m].C, soup);
  chain.molecules[m].omegaAngle = molmil.calcMMTorsion(chain.molecules[m-1].CA, chain.molecules[m-1].C, chain.molecules[m].N, chain.molecules[m].CA, soup);
  
  chain.molecules[0].phiAngle = chain.molecules[1].phiAngle;
  chain.molecules[m].psiAngle = chain.molecules[m-1].psiAngle;
  chain.molecules[0].omegaAngle = chain.molecules[1].omegaAngle;
  
  
  
};

// ** used by efsite to synchronize canvases (camera orientation) **
molmil.linkCanvases = function (canvases) {
  for (var i=1; i<canvases.length; i++) canvases[i].renderer.camera = canvases[0].renderer.camera;
  for (var i=0; i<canvases.length; i++) canvases[i].molmilViewer.canvases = canvases;
}

molmil.__webglNotSupported__ = function (canvas) {
  if (window["webglNotSupported"]) return webglNotSupported(canvas);
  var div = molmil_dep.dcE("DIV");
  div.innerHTML = "Your browser does not seem to support WebGL. Please visit the <a target=\"blank\" class=\"external\" href=\"http://get.webgl.org/\">WebGL website</a> for more info on how to gain WebGL support on your browser.<br />";
  div.style.border = "1px solid #ddd";
  div.style.margin = div.style.padding = ".25em";
  canvas.parentNode.replaceChild(div, canvas);
  return div;
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
    x_k = new Float32Array(noa*3);
    y_k = new Float32Array(noa*3);
    for (var i=0, n=0; i<noa; i++, n+=3) {
      x_k[n] = atoms1[i].xyz[0]; x_k[n+1] = atoms1[i].xyz[1]; x_k[n+2] = atoms1[i].xyz[2];
      y_k[n] = atoms2[i].xyz[0]; y_k[n+1] = atoms2[i].xyz[1]; y_k[n+2] = atoms2[i].xyz[2];
    
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

// end

// ** Molmil's command line interface **

molmil.invertColor = function (hexTripletColor) {return "#"+("000000" + (0xFFFFFF ^ parseInt(hexTripletColor.substring(1), 16)).toString(16)).slice(-6);}
molmil.componentToHex = function(c) {var hex = c.toString(16); return hex.length == 1 ? "0" + hex : hex;}
molmil.rgb2hex = function (r, g, b) {return "#" + molmil.componentToHex(r) + molmil.componentToHex(g) + molmil.componentToHex(b);}
molmil.hex2rgb = function(hex) {hex = (hex.charAt(0) == "#" ? hex.substr(1, 7) : hex); return [parseInt(hex.substring(0, 2), 16), parseInt(hex.substring(2, 4), 16), parseInt(hex.substring(4, 6), 16)];}
    
molmil.commandLines = {};
    
molmil.commandLine = function(canvas) {
  this.environment = {};
  for (var e in window) this.environment[e] = undefined;
  
  this.environment.setTimeout = function(cb, tm) {window.setTimeout(cb, tm);}
  this.environment.clearTimeout = function() {window.clearTimeout();}
  this.environment.navigator = window.navigator;
  this.environment.window = this;
  
  this.environment.console = {};
  this.environment.molmil = molmil;
  this.environment.molmil_dep = molmil_dep;
  this.canvas = this.environment.cli_canvas = canvas; this.soup = this.environment.cli_soup = canvas.molmilViewer;
  canvas.commandLine = this;
  
  this.buildGUI();
  
  this.environment.console.log = function() {
    if (this.debugMode) console.log.apply(console, arguments);
    arguments = Array.prototype.slice.call(arguments, 0);
    var tmp = document.createElement("div"); tmp.textContent = arguments.join(", ");
    this.custom(tmp);
  };
  this.environment.console.warning = function() {
    if (this.debugMode) console.warming.apply(console, arguments);
    arguments = Array.prototype.slice.call(arguments, 0);
    var tmp = document.createElement("div"); tmp.textContent = arguments.join(", ");
    tmp.style.color = "yellow";
    this.custom(tmp);
  };
  this.environment.console.error = function() {
    if (this.debugMode) console.error.apply(console, arguments);
    arguments = Array.prototype.slice.call(arguments, 0);
    //console.error.apply(console, arguments);
    var tmp = document.createElement("div"); tmp.textContent = arguments.join(", ");
    tmp.style.color = "red";
    this.custom(tmp);
  };
  this.environment.console.logCommand = function() {
    if (this.cli.environment.scriptUrl) return;
    arguments = Array.prototype.slice.call(arguments, 0);
    var tmp = document.createElement("div"); tmp.textContent = arguments.join("\n");
    tmp.style.color = "#00BFFF";
    this.custom(tmp, true);
  };
  this.environment.console.custom = function(obj, noPopup) {
    if (! obj.textContent) return;
    this.logBox.appendChild(obj);
    this.logBox.scrollTop = this.logBox.scrollHeight;
    if (noPopup != true) this.logBox.icon.onclick(true);
  };
  this.environment.console.runCommand = function(command) {
    if (! molmil.isBalancedStatement(command)) return;
    
    if (command.indexOf("{") == -1 && command.indexOf(";") != -1) {
      var sub_commands = command.split(";");
      for (var i=0; i<sub_commands.length; i++) {
        sub_commands[i] = sub_commands[i].trim();
        this.logCommand(sub_commands[i]);
        this.cli.eval(sub_commands[i]);
        this.backlog.unshift(sub_commands[i]);
      }
    }
    else {
      command = command.trim();
      this.logCommand(command);
      this.cli.eval(command);
      this.backlog.unshift(command);
    }
    this.buffer = ""; this.blSel = -1;
  };
  this.environment.console.backlog = [];
  this.environment.console.buffer = "";
  this.environment.console.blSel = -1;
  
  
  this.environment.console.logBox = this.logBox; this.environment.console.cli = this;
  
  this.environment.colors = {red: [255, 0, 0, 255], green: [0, 255, 0, 255], blue: [0, 0, 255, 255], grey: [100, 100, 100, 255]};
  
  
  //this.bindNullInterface();
  this.bindPymolInterface();
  this.icon.onclick(); this.icon.onclick();
};

molmil.commandLine.prototype.buildGUI = function() {
  this.consoleBox = this.canvas.parentNode.pushNode("span");
  this.consoleBox.className = "molmil_UI_cl_box"; this.consoleBox.style.overflow = "initial";
  
  this.logBox = this.consoleBox.pushNode("span");
  this.logBox.icon = this.icon = this.consoleBox.pushNode("span");
  this.icon.innerHTML = "<"; this.icon.title = "Display command line";
  this.icon.className = "molmil_UI_cl_icon";
  this.icon.style.color = molmil.invertColor(molmil.rgb2hex(molmil.configBox.BGCOLOR[0]*255, molmil.configBox.BGCOLOR[1]*255, molmil.configBox.BGCOLOR[2]*255));
  this.icon.onclick = function (mini) {
    if (mini == true) {
      if (this.inp.style.display != "") {
        this.cli.logBox.style.display = "";
        this.cli.consoleBox.style.height = "8em";
        this.cli.logBox.style.pointerEvents = "none";
        this.cli.logBox.style.overflow = "hidden";
        var invC = molmil.invertColor(molmil.rgb2hex(molmil.configBox.BGCOLOR[0]*255, molmil.configBox.BGCOLOR[1]*255, molmil.configBox.BGCOLOR[2]*255));
        this.cli.consoleBox.style.color = invC;
        this.logBox.scrollTop = this.logBox.scrollHeight;
      }
      return;
    }
    if (this.inp.style.display == "") {
      this.innerHTML = "<"; this.title = "Display command line";
      this.inp.style.display = "none"; this.cli.logBox.style.display = "none";
    }
    else {
      this.innerHTML = ">"; this.title = "Hide command line";
      var invC = molmil.invertColor(molmil.rgb2hex(molmil.configBox.BGCOLOR[0]*255, molmil.configBox.BGCOLOR[1]*255, molmil.configBox.BGCOLOR[2]*255));
      this.cli.logBox.style.border = "1px solid "+invC;
      this.cli.logBox.style.borderBottom = "";
      this.cli.logBox.style.borderRadius = ".33em";
      this.cli.consoleBox.style.color = invC;
      this.cli.logBox.style.backgroundColor = "rgba("+molmil.configBox.BGCOLOR[0]*255+","+molmil.configBox.BGCOLOR[1]*255+","+molmil.configBox.BGCOLOR[2]*255+",.5)";
      this.inp.style.backgroundColor = "rgb("+molmil.configBox.BGCOLOR[0]*255+","+molmil.configBox.BGCOLOR[1]*255+","+molmil.configBox.BGCOLOR[2]*255+")";
    
      this.inp.style.display = ""; this.cli.logBox.style.display = "";
      this.cli.consoleBox.style.height = this.cli.consoleBox.style.maxHeight = "calc("+this.cli.canvas.clientHeight+"px - 6em)";
      this.cli.consoleBox.style.overflow = "";
      this.cli.logBox.style.pointerEvents = "";
      this.inp.focus();
    }
  };
  this.logBox.onmouseover = function() {this.style.backgroundColor = "rgba("+molmil.configBox.BGCOLOR[0]*255+","+molmil.configBox.BGCOLOR[1]*255+","+molmil.configBox.BGCOLOR[2]*255+",.85)";};
  this.logBox.onmouseout = function() {this.style.backgroundColor = "rgba("+molmil.configBox.BGCOLOR[0]*255+","+molmil.configBox.BGCOLOR[1]*255+","+molmil.configBox.BGCOLOR[2]*255+",.25)";};
  this.inp = this.icon.inp = this.consoleBox.pushNode("span");
  this.inp.className = "molmil_UI_cl_input"; this.inp.style.display = "none";
  this.inp.contentEditable = true;
  this.inp.cli = this.icon.cli = this;
  this.icon.logBox = this.inp.logBox = this.logBox;
  
  this.logBox.className = "molmil_UI_cl_logbox"; this.logBox.style.display = "none";
  
  this.inp.console = this.environment.console;
  
  this.inp.onkeydown = function(e) {
    var command = this.textContent;
    if (e.keyCode == 13 && ! e.shiftKey && molmil.isBalancedStatement(command)) {
      this.console.runCommand(command);
      this.textContent = "";
      return false;
    }
    if (e.keyCode == 38 && e.ctrlKey) {
      this.console.blSel++;
      if (this.console.blSel >= this.console.backlog.length) this.console.blSel = this.console.backlog.length-1;
      this.textContent = this.console.backlog[this.console.blSel];
    }
    if (e.keyCode == 40 && e.ctrlKey) {
      this.console.blSel--;
      if (this.console.blSel < -1) this.console.blSel = 0;
      if (this.console.blSel == -1) this.textContent = this.console.buffer;
      else this.textContent = this.console.backlog[this.console.blSel]; 
    }
    if (this.console.blSel == -1) this.console.buffer = command;
  };
};

molmil.loadScript = function(url) {
  var request = new molmil_dep.CallRemote("GET"); request.ASYNC = true;
  var cli = this.cli_canvas.commandLine;
  request.OnDone = function() {
    cli.environment.scriptUrl = url.substr(0,url.lastIndexOf('/')) + "/";
    cli.environment.console.runCommand(this.request.responseText);
  }
  request.Send(url);
}

molmil.commandLine.prototype.eval = function(command) {
  // instead of having two command lines (e.g. pymol & javascript), only have one command line (javascript), but rewrite the incoming /command/ from pymol --> javascript...
  
  if (! this.altCommandIF(this.environment, command)) this.runCommand.apply(this.environment, [command]);
};

molmil.commandLine.prototype.runCommand = function(command) { // note the /this/ stuff will not work properly... if there are many functions and internal /var/s...
  molmil.cli_canvas = this.cli_canvas; molmil.cli_soup = this.cli_soup;
  command = (' '+command).replace(/(\s|;)var\s+(\w+)\s*=/g, "$1this.$2 ="); // make sure that variables are stored in /this/ and not in the local scope...
  command = command.replace(/(\s|;)function\s+(\w+)/g, "$1this.$2 = function"); // make sure that functions are stored in /this/ and not in the local scope...
  command = command.replace(/(\s|;)return\sthis;/g, "$1return window;"); // make sure that it is impossible to get back the real window object
  try {with (this) {eval(command);}}
  catch (e) {this.console.error(e.message);}
  molmil.cli_canvas = null; molmil.cli_soup = null;
};

molmil.isBalancedStatement = function (string) {
  var parentheses = "[]{}()", stack = [], i, character, bracePosition;
  for (i=0; character=string[i]; i++) {
    bracePosition = parentheses.indexOf(character);
    if (bracePosition === -1) continue;

    if (bracePosition % 2 === 0) stack.push(bracePosition + 1);
    else if (stack.pop() !== bracePosition) return false;
  }
  return stack.length === 0;
}

molmil.commandLine.prototype.bindNullInterface = function() {
  if (this.altCommandIF) this.environment.console.log("Previous command interface unbound.");
  this.altCommandIF = function(env, command) {return false;};
}


molmil.commandLine.prototype.bindPymolInterface = function() {
  this.environment.console.log("Pymol-like command interface bound.");
  this.pyMol = {};
  this.pyMol.keywords = {
    select: molmil.commandLines.pyMol.selectCommand, 
    color: molmil.commandLines.pyMol.colorCommand, 
    set_color: molmil.commandLines.pyMol.setColorCommand, 
    show: molmil.commandLines.pyMol.showCommand
  };
  this.altCommandIF = molmil.commandLines.pyMol.tryExecute;
};

// ** there is some basic pymol command support implemented **
molmil.commandLines.pyMol = {};

/*

select
color
set_color
show
zoom
load <-- local only?
count_atoms
hide
center
frame
dss



*/


molmil.commandLines.pyMol.tryExecute = function(env, command) { // should return true if command (and execute it), otherwise return false..
  var pre_command = (command.trim().match(/^[\S]+/) || [""])[0].toLowerCase();
  if (! this.pyMol.keywords.hasOwnProperty(pre_command) || ! this.pyMol.keywords[pre_command].apply(null, [env, command])) return false;
  return true;
};

molmil.commandLines.pyMol.selectCommand = function (env, command) {
  command = command.match(/select[\s]+([a-zA-Z0-9_]+)[\s]*,[\s]*(.*)/);
  try {env[command[1]] = molmil.commandLines.pyMol.select.apply(env, [command[2]]);}
  catch (e) {return false;}
  return true;
}
    
molmil.commandLines.pyMol.colorCommand = function (env, command) {
  command = command.match(/color[\s]+([a-zA-Z0-9_]+)[\s]*,[\s]*(.*)/);
  try {molmil.commandLines.pyMol.color.apply(env, [command[1], command[2]]);}
  catch (e) {return false;}
  return true;
}
    
molmil.commandLines.pyMol.setColorCommand = function (env, command) {
  command = command.match(/set_color[\s]+([a-zA-Z0-9_]+)[\s]*,[\s]*(.*)/);
  try {molmil.commandLines.pyMol.set_color.apply(env, [command[1], JSON.parse(command[2])]);}
  catch (e) {return false;}
  return true;
}
    
molmil.commandLines.pyMol.showCommand = function (env, command) {
  command = command.match(/show[\s]+([a-zA-Z0-9_]+)[\s]*,[\s]*(.*)/);
  try {molmil.commandLines.pyMol.show.apply(env, [command[1], command[2]]);}
  catch (e) {return false;}
  return true;
}
    

molmil.quickSelect = molmil.commandLines.pyMol.select = molmil.commandLines.pyMol.pymolSelectEngine = function (expr, soup) {
  if (! molmil.isBalancedStatement(expr)) throw "Incorrect statement"; // safety check
  var new_expr = "";
  var word = "", key, toUpper = false, ss = false, ss_conv = {h: 3, s: 2, l: 1};
  
  this.soupObject = this.soupObject || molmil.cli_soup || soup || this.cli_soup;
  
  var sub_expr_handler = function() {
    if (key && word) {
      if (toUpper) word = word.toUpperCase();
      else if (ss) {
        if (word) word = ss_conv[word];
        tmp = ss_conv[tmp];
      }
      new_expr += key.replace("%s", word);
    }
    else if (word == "hydro") new_expr += "this.soupObject.atomRef[a].molecule.water == true"
    else if (word == "hetatm") new_expr += "this.soupObject.atomRef[a].molecule.ligand == true"
  };
      
  for (var i=0; i<expr.length; i++) {
    if (expr[i].match(/\s/)) {
      toUpper = false, ss = false;
      if (word == "name") {key = "this.soupObject.atomRef[a].atomName == '%s'"; toUpper = true;}
      else if (word == "symbol") key = "this.soupObject.atomRef[a].element == '%s'";
      else if (word == "resn") key = "this.soupObject.atomRef[a].molecule.name.toLowerCase() == '%s'.toLowerCase()";
      else if (word == "resi") key = "this.soupObject.atomRef[a].molecule.RSID == %s";
      else if (word == "ss") {key = "this.soupObject.atomRef[a].molecule.sndStruc == %s"; ss = true;}
      else if (word == "chain") key = "this.soupObject.atomRef[a].molecule.chain.name == '%s'";
      else if (word == "hydro") new_expr += "this.soupObject.atomRef[a].molecule.water == true";
      else if (word == "hetatm") new_expr += "this.soupObject.atomRef[a].molecule.ligand == true";
      else if (word == "and") new_expr += " && ";
      else if (word == "or") new_expr += " || ";
      else if (key && word) new_expr += key.replace("%s", word);
      else key = "";
      word = "";
    }
    else if (expr[i] == "+" && key) {
      var tmp = expr.substr(i+1), pos = tmp.search(/[^a-zA-Z0-9]/), tmp = pos != -1 ? tmp.substr(0, pos) : tmp;
      if (tmp) {
        if (toUpper) {tmp = tmp.toUpperCase(); word = word.toUpperCase();}
        if (ss) {
          if (word) word = ss_conv[word];
          tmp = ss_conv[tmp];
        }
        new_expr += (word ? key.replace("%s", word) : "")+" || "+key.replace("%s", tmp);
        word = "";
      }
      i += pos == -1 ? tmp.length : pos;
    }
    else if (expr[i] == "-") { // only valid for resi
      var tmp = expr.substr(i+1), pos = tmp.search(/[^a-zA-Z0-9]/), tmp = pos != -1 ? tmp.substr(0, pos) : tmp;
      new_expr += "(" + key.replace(/ == %s/, " >= "+word) + " && " + key.replace(/ == %s/, " <= "+tmp) + ")";
      word = "";
      i += pos == -1 ? tmp.length : pos;
    }
    else if (expr[i].match(/\(|\)|!/)) {
      sub_expr_handler();
      new_expr += expr[i];
      key = word = "";
    }
    else {
      word += expr[i];
    }
  }
  sub_expr_handler();
      
  var list = [];
  new_expr = "for (var a in this.soupObject.atomRef) if ("+new_expr+") list.push(this.soupObject.atomRef[a]);";

  try{eval(new_expr);}
  catch(e) {this.console.error("Unable to process PyMol command: "+e);}
  return list;
}
    
molmil.commandLines.pyMol.color = function (clr, atoms, quiet) {
  if (typeof atoms != "object") {
    if (this.hasOwnProperty(atoms)) atoms = this[atoms];
    else atoms = molmil.commandLines.pyMol.select(atoms);
  }
  if (clr == "default") {
    var mols = [];
    for (var i=0; i<atoms.length; i++) mols.push(atoms[i].molecule);
     molmil.colorEntry(mols, 1, null, quiet);
   }
   else if (clr == "structure") {
     var mols = [];
     for (var i=0; i<atoms.length; i++) mols.push(atoms[i].molecule);
     molmil.colorEntry(mols, 2, null, quiet);
   }
   else if (clr == "cpk") {
     molmil.colorEntry(atoms, 3, null, quiet);
   }
   else if (clr == "group") {
     var mols = [];
     for (var i=0; i<atoms.length; i++) mols.push(atoms[i].molecule);
     molmil.colorEntry(mols, 4, null, quiet);
   }
   else if (clr == "chain") {
     var mols = [];
     for (var i=0; i<atoms.length; i++) mols.push(atoms[i].molecule);
     molmil.colorEntry(mols, 5, null, quiet);
  }
  else {
    if (typeof clr == "string") {
      var rgba = this.colors[clr];
      if (! rgba) {
        rgba = JSON.parse(clr);
        if (rgba[0] > 1 || rgba[1] > 1 || rgba[2] > 1 || rgba[3] > 1) rgba = [rgba[0], rgba[1], rgba[2], rgba[3]];
      }
    }
    else var rgba = clr;

    for (var i=0; i<atoms.length; i++) {
      atoms[i].rgba = rgba;
      if (atoms[i].molecule.CA == atoms[i]) atoms[i].molecule.rgba = rgba;
    }

    if (! quiet) {
      this.soupObject.renderer.initBuffers();
      this.soupObject.renderer.canvas.update = true;  
    }
  }
}
    
molmil.commandLines.pyMol.set_color = function (name, rgba) {
  console.log(this);
  if (rgba[0] > 1 || rgba[1] > 1 || rgba[2] > 1 || rgba[3] > 1) rgba = [rgba[0], rgba[1], rgba[2], rgba[3]];
  this.colors[name] = rgba;
}
    
molmil.commandLines.pyMol.show = function (repr, atoms, quiet) {
  if (typeof atoms != "object") {
    if (this.hasOwnProperty(atoms)) atoms = this[atoms];
    else atoms = molmil.commandLines.pyMol.select(atoms);
  }
      
  if (repr == "spheres") {
    for (var i=0; i<atoms.length; i++) {
      atoms[i].displayMode = 1;
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
      if (atoms[i].molecule.CA == atoms[i]) {
        atoms[i].molecule.displayMode = 3;
        atoms[i].molecule.showSC = false;
      }
    }
  }
  else if (repr == "tube") {
    for (var i=0; i<atoms.length; i++) {
      atoms[i].displayMode = 0;
      if (atoms[i].molecule.CA == atoms[i]) {
        atoms[i].molecule.displayMode = 2;
        atoms[i].molecule.showSC = false;
      }
    }
  }
  else if (repr == "ca-trace") {
    for (var i=0; i<atoms.length; i++) {
      atoms[i].displayMode = 0;
      if (atoms[i].molecule.CA == atoms[i]) {
        atoms[i].molecule.displayMode = 1;
        atoms[i].molecule.showSC = false;
      }
    }
  }
  
  if (! quiet) {
    this.soupObject.renderer.initBuffers();
    this.soupObject.renderer.canvas.update = true;  
  }
}


// END

// ** drag-and-drop support for various files **
molmil.bindCanvasInputs = function(canvas) {
  
  var cancelDB = function (ev) {
    ev.preventDefault();
    return false;
  }

  var dropDB = function (ev) {
    ev.preventDefault()
    var count = 0, files = [];
    try{
      files = ev.dataTransfer.files;
      count = files.length;
    } catch (e) {}
      
    var fr, i, j;
      
    for (i=0; i<count; i++) {
      fr = new FileReader();
      fr.filename = files[i].name;
      fr.fileHandle = files[i];
      
      for (j=0; j<this.inputFunctions.length; j++) {
        if (this.inputFunctions[j](canvas, fr)) break;
      }
    }
      
    return false;
  }

  canvas.addEventListener("dragover", cancelDB);
  canvas.addEventListener("dragenter", cancelDB);
  canvas.addEventListener("drop", dropDB);
  
  canvas.inputFunctions = [];
  
  // .gz file
  canvas.inputFunctions.push(function(canvas, fr) {
    if (fr.filename.indexOf(".gz", fr.filename.length-3) !== -1) {
      if (! window.hasOwnProperty("pako")) {var obj = molmil_dep.dcE("script"); obj.src = molmil.settings.src+"pako.js"; document.getElementsByTagName("head")[0].appendChild(obj);}
      fr.onload = function(e) {
        if (! window.hasOwnProperty("pako")) return molmil_dep.asyncStart(this.onload, [e], this, 50);

        var fakeObj = {filename:fr.filename.substr(0, fr.filename.length-3)};
        fakeObj.readAsText = function() {var out = pako.inflate(new Uint8Array(e.target.result), {to: "string"}); this.onload({target: {result: out}});};
        fakeObj.readAsArrayBuffer = function() {var out = pako.inflate(new Uint8Array(e.target.result)); this.onload({target: {result: out.buffer}});};

        for (j=0; j<canvas.inputFunctions.length; j++) {
          if (canvas.inputFunctions[j](canvas, fakeObj)) break;
        }
      }

      fr.readAsArrayBuffer(fr.fileHandle);
      return true;
    }
  });
  
  
  // pdb file
  canvas.inputFunctions.push(function(canvas, fr) {
    if (fr.filename.indexOf(".pdb", fr.filename.length-4) !== -1 || fr.filename.indexOf(".ent", fr.filename.length-4) !== -1) {
      fr.onload = function(e) {
        canvas.molmilViewer.loadStructureData(e.target.result, 4, this.filename);
      }
      fr.readAsText(fr.fileHandle);
      return true;
    }
  });
  
  // cif file
  canvas.inputFunctions.push(function(canvas, fr) {
    if (fr.filename.indexOf(".cif", fr.filename.length-4) !== -1) {
      fr.onload = function(e) {
        canvas.molmilViewer.loadStructureData(e.target.result, 'cif', this.filename);
      }
      fr.readAsText(fr.fileHandle);
      return true;
    }
  });
  
  // gro file
  canvas.inputFunctions.push(function(canvas, fr) {
    if (fr.filename.indexOf(".gro", fr.filename.length-4) !== -1) {
      fr.onload = function(e) {
        canvas.molmilViewer.loadStructureData(e.target.result, 7, this.filename);
      }
      fr.readAsText(fr.fileHandle);
      return true;
    }
  });
  
  // gromacs trajectory file (trr)
  canvas.inputFunctions.push(function(canvas, fr) {
    if (fr.filename.indexOf(".trr", fr.filename.length-4) !== -1) {
      fr.onload = function(e) {
        canvas.molmilViewer.loadStructureData(e.target.result, "gromacs-trr", this.filename);
      }
      fr.readAsArrayBuffer(fr.fileHandle);
      return true;
    }
  });
  
  // gromacs trajectory file (xtc)
  canvas.inputFunctions.push(function(canvas, fr) {
    if (fr.filename.indexOf(".xtc", fr.filename.length-4) !== -1) {
      fr.onload = function(e) {
        canvas.molmilViewer.loadStructureData(e.target.result, "gromacs-xtc", this.filename);
      }
      fr.readAsArrayBuffer(fr.fileHandle);
      return true;
    }
  });
  
  // mypresto trajectory file
  canvas.inputFunctions.push(function(canvas, fr) {
    if (fr.filename.indexOf(".cor", fr.filename.length-4) !== -1 || fr.filename.indexOf(".cod", fr.filename.length-4) !== -1) {
      fr.onload = function(e) {
        canvas.molmilViewer.loadStructureData(e.target.result, "psygene-traj", this.filename);
      }
      fr.readAsArrayBuffer(fr.fileHandle);
      return true;
    }
  });
  
  // mpbf
  canvas.inputFunctions.push(function(canvas, fr) {
    if (fr.filename.indexOf(".mpbf", fr.filename.length-5) !== -1) {
      fr.onload = function(e) {
        canvas.molmilViewer.loadStructureData(e.target.result, 8, this.filename);
      }
      fr.readAsArrayBuffer(fr.fileHandle);
      return true;
    }
  });
  
  // ccp4
  canvas.inputFunctions.push(function(canvas, fr) {
    if (fr.filename.indexOf(".ccp4", fr.filename.length-5) !== -1) {
      fr.onload = function(e) {
        canvas.molmilViewer.UI.ccp4_input_popup(e.target.result, this.filename);
      }
      fr.readAsArrayBuffer(fr.fileHandle);
      return true;
    }
  });
  
  // mdl
  canvas.inputFunctions.push(function(canvas, fr) {
    if (fr.filename.indexOf(".mdl", fr.filename.length-4) !== -1 || fr.filename.indexOf(".mol", fr.filename.length-4) !== -1, fr.filename.indexOf(".sdf", fr.filename.length-4) !== -1) {
      fr.onload = function(e) {
        canvas.molmilViewer.loadStructureData(e.target.result, 'mdl', this.filename);
      }
      fr.readAsText(fr.fileHandle);
      return true;
    }
  });
  
  // mol2
  canvas.inputFunctions.push(function(canvas, fr) {
    if (fr.filename.indexOf(".mol2", fr.filename.length-5) !== -1) {
      fr.onload = function(e) {
        canvas.molmilViewer.loadStructureData(e.target.result, 'mol2', this.filename);
      }
      fr.readAsText(fr.fileHandle);
      return true;
    }
  });
  
  // xyz
  canvas.inputFunctions.push(function(canvas, fr) {
    if (fr.filename.indexOf(".xyz", fr.filename.length-5) !== -1) {
      fr.onload = function(e) {
        canvas.molmilViewer.UI.xyz_input_popup(e.target.result, this.filename);
      }
      fr.readAsText(fr.fileHandle);
      return true;
    }
  });
  
};

// ** video support **
molmil.initVideo = function(UI) {
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

// END

// misc stuff

molmil.setSlab = function(near, far, soup) {
  soup = soup || molmil.cli_soup;
  
  if (! soup.renderer.settings.slab) {
    soup.renderer.settings.slab = true;
    molmil.configBox.glsl_fog = false;
    molmil.shaderEngine.recompile(soup.renderer);
  }
  
  soup.renderer.settings.slabNear = near;
  soup.renderer.settings.slabFar = far;
  
  soup.canvas.update = true;
};

molmil.selectAtoms = function(atoms, append, soup) {
  soup = soup || molmil.cli_soup;
  if (! append) soup.atomSelection = [];
  
  for (var a=0; a<atoms.length; a++) soup.atomSelection.push(atoms[a]);
};

// dna/rna cartoon through phosphor

molmil.resetFocus = function(soup, t) {
  t = t || 0;
  soup = soup || molmil.cli_soup;  
  
  soup.atomSelection = [];
  
  soup.renderer.updateSelection();

  molmil.zoomTo(soup.avgXYZ, soup.COR, [0.0, 0.0, soup.calcZ()], soup, t);
}

molmil.zoomTo = function(newCOR, oldCOR, newXYZ, soup, t) {
  for (var i=0; i<soup.canvases.length; i++) soup.canvases[i].molmilViewer.COR = newCOR;
  
  var framerate = 50, nFrames = Math.round(t*(1000./framerate));
  if (nFrames > 1) {
    var CORvec = [soup.COR[0]-oldCOR[0], soup.COR[1]-oldCOR[1], soup.COR[2]-oldCOR[2]], xyzStart = [0., 0., 0.];
    vec3.transformMat4(xyzStart, CORvec, soup.renderer.camera.generateMatrix());
    
    var dX = (xyzStart[0]-newXYZ[0])/nFrames, dY = (xyzStart[1]-newXYZ[1])/nFrames, dZ = (xyzStart[2]-newXYZ[2])/nFrames;
    
    clearTimeout(molmil.zoomTID);
    var updateCamera = function(fid) {
      soup.renderer.camera.x = xyzStart[0]-(dX*(fid+1));
      soup.renderer.camera.y = xyzStart[1]-(dY*(fid+1));
      soup.renderer.camera.z = xyzStart[2]-(dZ*(fid+1));
      soup.renderer.modelViewMatrix = soup.renderer.camera.generateMatrix();
      soup.canvas.update = true;
      if (fid < nFrames-1) molmil.zoomTID = molmil_dep.asyncStart(updateCamera, [fid+1], null, framerate);
    }
    if (dX > 0.01 || dY > 0.01 || dZ > 0.01) return updateCamera(0);
  }
  
  soup.renderer.camera.x = newXYZ[0]; soup.renderer.camera.y = newXYZ[1]; soup.renderer.camera.z = newXYZ[2];
  soup.renderer.modelViewMatrix = soup.renderer.camera.generateMatrix();
  soup.canvas.update = true;
}

molmil.selectionFocus = function(soup, t) {
  t = t || 0;
  soup = soup || molmil.cli_soup;
  
  // center & zoom on atomSelection
  
  var xyz, Xpos, xyzRef, modelId = soup.renderer.modelId, avgX = 0.0, avgY = 0.0, avgZ = 0.0;
  
  var geomRanges = [1e99, -1e99, 1e99, -1e99, 1e99, -1e99];
  
  for (var a=0; a<soup.atomSelection.length; a++) {
    Xpos = soup.atomSelection[a].xyz;
    xyzRef = soup.atomSelection[a].chain.modelsXYZ[modelId];
    xyz = [xyzRef[Xpos], xyzRef[Xpos+1], xyzRef[Xpos+2]];
    avgX += xyz[0];
    avgY += xyz[1];
    avgZ += xyz[2];
  }
  avgX /= soup.atomSelection.length;
  avgY /= soup.atomSelection.length;
  avgZ /= soup.atomSelection.length;
  
  
  for (var a=0; a<soup.atomSelection.length; a++) {
    Xpos = soup.atomSelection[a].xyz;
    xyzRef = soup.atomSelection[a].chain.modelsXYZ[modelId];
    xyz = [xyzRef[Xpos]-avgX, xyzRef[Xpos+1]-avgY, xyzRef[Xpos+2]-avgZ];
    
    if (xyz[0] < geomRanges[0]) geomRanges[0] = xyz[0];
    if (xyz[0] > geomRanges[1]) geomRanges[1] = xyz[0];
    
    if (xyz[1] < geomRanges[2]) geomRanges[2] = xyz[1];
    if (xyz[1] > geomRanges[3]) geomRanges[3] = xyz[1];
    
    if (xyz[2] < geomRanges[4]) geomRanges[4] = xyz[2];
    if (xyz[2] > geomRanges[5]) geomRanges[5] = xyz[2];
  }

  soup.renderer.updateSelection();
  
  molmil.zoomTo([avgX, avgY, avgZ], soup.COR, [0.0, 0.0, soup.calcZ(geomRanges)], soup, t);
};

molmil.selectSequence = function(seq, soup) {
  soup = soup || molmil.cli_soup;

  var seq3 = [], conv = {"A": "ALA", "C": "CYS", "D": "ASP", "E": "GLU", "F": "PHE", "G": "GLY", "H": "HIS", "I": "ILE", "K": "LYS", "L": "LEU", "M": "MET", "N": "ASN", "P": "PRO", "Q": "GLN", "R": "ARG", "S": "SER", "T": "THR", "V": "VAL", "W": "TRP", "Y": "TYR"};
  molmil.AATypesBase = {"ALA": 1, "CYS": 1, "ASP": 1, "GLU": 1, "PHE": 1, "GLY": 1, "HIS": 1, "ILE": 1, "LYS": 1, "LEU": 1, "MET": 1, "ASN": 1, "PRO": 1, "GLN": 1, "ARG": 1, "SER": 1, "THR": 1, "VAL": 1, "TRP": 1, "TYR": 1, "ACE": 1, "NME": 1, "HIP": 1, "HIE": 1, "HID": 1};
  for (var i=0; i<seq.length; i++) {
    if (conv.hasOwnProperty(seq[i])) seq3.push(conv[seq[i]]);
    else seq3.push("***");
  }
  
  var output = [], m1, m2, n, OK;
  for (var c=0; c<soup.chains.length; c++) {
    for (m1=0; m1<soup.chains[c].molecules.length; m1++) {
      OK = true;
      for (m2=m1, n=0; m2<Math.min(soup.chains[c].molecules.length, m1+seq3.length); m2++, n++) if (soup.chains[c].molecules[m2].name != seq3[n]) {OK = false; break;}
      if (OK) for (m2=m1; m2<m1+seq3.length; m2++) output.push(soup.chains[c].molecules[m2]);
    }
  }
  return output;
}

molmil.calcCenter = function(input) {
  if (! (input instanceof Array)) input = [input];
  var coords = [], tmp, j, c;
  for (var i=0; i<input.length; i++) {
    if (input[i] instanceof molmil.atomObject) {
      if (input[i].element == "H") continue;
      coords.push([input[i].chain.modelsXYZ[0][input[i].xyz], input[i].chain.modelsXYZ[0][input[i].xyz+1], input[i].chain.modelsXYZ[0][input[i].xyz+2]]);
    }
    else if (input[i] instanceof molmil.molObject) {
      tmp = input[i].chain.modelsXYZ[0];
      for (j=0; j<input[i].atoms.length; j++) if (input[i].atoms[j].element != "H") coords.push([tmp[input[i].atoms[j].xyz], tmp[input[i].atoms[j].xyz+1], tmp[input[i].atoms[j].xyz+2]]);
    }
    else if (input[i] instanceof molmil.chainObject) {
      tmp = input[i].modelsXYZ[0];
      for (j=0; j<input[i].atoms.length; j++) if (input[i].atoms[j].element != "H") coords.push([tmp[input[i].atoms[j].xyz], tmp[input[i].atoms[j].xyz+1], tmp[input[i].atoms[j].xyz+2]]);
    }
    else if (input[i] instanceof molmil.entryObject) {
      for (c=0; c<input[i].chains.length; c++) {
        tmp = input[i].chains[c].modelsXYZ[0];
        for (j=0; j<input[i].chains[c].atoms.length; j++) if (input[i].chains[c].atoms[j].element != "H") coords.push([tmp[input[i].chains[c].atoms[j].xyz], tmp[input[i].chains[c].atoms[j].xyz+1], tmp[input[i].chains[c].atoms[j].xyz+2]]);
      }
    }
  }
  
  var avgXYZ = [0.0, 0.0, 0.0], N=0;
  for (i=0; i<coords.length; i++) {
    avgXYZ[0] += coords[i][0]; avgXYZ[1] += coords[i][1]; avgXYZ[2] += coords[i][2];
    N++;
  }
  avgXYZ[0] /= N; avgXYZ[1] /= N; avgXYZ[2] /= N;
  
  var xMin = 1e99, xMax = -1e99, yMin = 1e99, yMax = -1e99, zMin = 1e99, zMax = -1e99;
  
  var tmp, n_tmp;
  for (var i=0; i<coords.length; i++) {
    tmp = coords[i][0]-avgXYZ[0];
    if (tmp < xMin) xMin = tmp;
    if (tmp > xMax) xMax = tmp;
    
    tmp = coords[i][1]-avgXYZ[1]; 
    if (tmp < yMin) yMin = tmp;
    if (tmp > yMax) yMax = tmp;
    
    tmp = coords[i][2]-avgXYZ[2];
    if (tmp < zMin) zMin = tmp;
    if (tmp > zMax) zMax = tmp;
  }

  return [avgXYZ, Math.max((xMax-xMin)*.5, (yMax-yMin)*.5, (zMax-zMin)*.5)];
}

molmil.addLabel = function(text, settings, soup) {
  soup = soup || molmil.cli_soup;
  settings = settings || {};
  
  var obj;
  if (soup instanceof molmil.labelObject) {
    obj = soup;
    soup = obj.soup
    
    text = text || obj.text;
    settings.xyz = settings.xyz || obj.settings.xyz;
  }
  else {
    if (! settings.hasOwnProperty("xyz")) return console.error("Cannot create label: no xyz variable set...");
    obj = new molmil.labelObject(soup); soup.texturedBillBoards.push(obj);
  }
  
  settings.fontSize = settings.fontSize || obj.settings.fontSize; settings.color = settings.color || obj.settings.color;
  
  if (text != obj.text || settings.fontSize != obj.settings.fontSize || settings.color[0] != obj.settings.color[0] || settings.color[1] != obj.settings.color[1] || settings.color[2] != obj.settings.color[2]) {
    settings.fontSize *= 4;
    var textCtx = document.createElement("canvas").getContext("2d");
  
    var tmp = text.split("\n"), h, w, i;
    h = tmp.length*settings.fontSize; w = 0;
    for (var i=0; i<tmp.length; i++) if (tmp[i].length > w) w = tmp[i].length;
    w = (w*settings.fontSize*.6)+6;

    textCtx.canvas.width = w; textCtx.canvas.height = h;
    textCtx.font = "bold "+settings.fontSize+"px Consolas, \"Liberation Mono\", Courier, monospace"; textCtx.textAlign = "center"; textCtx.textBaseline = "middle"; textCtx.fillStyle = 'white';
    textCtx.clearRect(0, 0, textCtx.canvas.width, textCtx.canvas.height);
    for (var i=0; i<tmp.length; i++) textCtx.fillText(tmp[i], w / 2, (settings.fontSize / 2) + (settings.fontSize*i));

    var gl = soup.renderer.gl;
    var textTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, textTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textCtx.canvas);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    gl.bindTexture(gl.TEXTURE_2D, null);
    
    obj.status = false;
    obj.texture = textTex;
    obj.texture.renderWidth = w*.25;
    obj.texture.renderHeight = h*.25;
    settings.fontSize *= .25;
  }
  
  obj.text = text;
  for (var e in settings) obj.settings[e] = settings[e];
  
  soup.canvas.update = true;

  return obj;
}

molmil.mergeStructuresToModels = function(entries) { // merges multiple structures into separate models
}

molmil.splitModelsToStructures = function(entry) { // splits multiple models into separate structures
}

// END

if (typeof(requestAnimationFrame) != "undefined") molmil.animate_molmilViewers();

if (! window.molmil_dep) {
  var dep = document.createElement("script")
  dep.src = molmil.settings.src+"molmil_dep.js";
  var head = document.getElementsByTagName("head")[0];
  head.appendChild(dep);
}

molmil.initSettings();


