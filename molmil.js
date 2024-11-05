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
 
// modify the render engine so that each input entry is loaded into a different render object
// then, set it up so that each object can be clipped differently
// molmil.entryObject.programs = [];
// dynamically update the programs (e.g. if a wireframe one isn't necessary, don't use it)
 
var molmil = molmil || {};

molmil.canvasList = []; molmil.mouseDown = false; molmil.mouseDownS = {}; molmil.mouseMoved = false; molmil.Xcoord = 0; molmil.Ycoord = 0; molmil.Zcoord = 0; molmil.activeCanvas = null; molmil.touchList = null; molmil.touchMode = false; molmil.preRenderFuncs = [];
molmil.longTouchTID = null; molmil.previousTouchEvent = null;
molmil.ignoreBlackList = false;
molmil.vrDisplay = null;
molmil.vrPose = [0, 0, 0];
molmil.vrOrient = [0, 0, 0, 0];
molmil.pdbj_data = "https://data.pdbjlc1.pdbj.org/";

// switch PDBj URLs to newweb file service
molmil.settings_default = {
  src: document.currentScript ? document.currentScript.src.split("/").slice(0, -1).join("/")+"/" : "https://pdbj.org/molmil2/",
  pdb_url: molmil.pdbj_data+"pdbjplus/data/pdb/mmjson/__ID__.json",
  pdb_chain_url: molmil.pdbj_data+"pdbjplus/data/pdb/mmjson-chain/__ID__-chain.json",
  comp_url: molmil.pdbj_data+"pdbjplus/data/cc/mmjson/__ID__.json",
  data_url: molmil.pdbj_data,
  newweb_rest: molmil.pdbj_data = window.location.host.endsWith(".pdbj.org") ? "https://"+window.location.host+(window.location.pathname.startsWith("/molmil_dev/") ? "/dev" : "")+"/rest/newweb/" : "https://pdbj.org"+(window.location.pathname.startsWith("/molmil_dev/") ? "/dev" : "")+"/rest/newweb/",
 
 
  /* change the implementation to force usage of molmil-app */
  molmil_video_url: undefined,
  dependencies: ["lib/gl-matrix-min.js"],
};

molmil.cli_canvas = null;
molmil.cli_soup = null;

molmil.settings = window.molmil_settings || molmil.settings_default;
for (var e in molmil.settings_default) if (! molmil.settings.hasOwnProperty(e)) molmil.settings[e] = molmil.settings_default[e];

molmil.configBox = {
  version: 2,
  buildDate: null,
  initFinished: false,
  liteMode: false,
  cullFace: true,
  loadModelsSeparately: false,
  wheelZoomRequiresCtrl: false,
  recordingMode: false,
  save_pdb_chain_only_change: false,
  xna_force_C1p: undefined,
  
  // Co, Mo, D, Ru, W, Q, YB, gd, ir, os, Y, sm, pr, tb, re, eu, ta, rh, lu, ho
  
  vdwR: {
    DUMMY: 1.7, 
    H: 1.2,
    He: 1.4,
    Li: 1.82,
    Be: 1.53,
    B: 1.92,
    C: 1.7,
    N: 1.55,
    O: 1.52,
    F: 1.47,
    Ne: 1.54,
    Na: 2.27,
    Mg: 1.73,
    Al: 1.84,
    Si: 2.1,
    P: 1.8,
    S: 1.8,
    Cl: 1.75,
    Ar: 1.88,
    K: 2.75,
    Ca: 2.31,
    Sc: 2.11,
    Ti: 1.47,
    V: 1.34,
    Cr: 1.27,
    Mn: 1.26,
    Fe: 1.26,
    Ni: 1.63,
    Cu: 1.4,
    Zn: 1.39,
    Ga: 1.87,
    Ge: 2.11,
    As: 1.85,
    Se: 1.9,
    Br: 1.85,
    Kr: 2.02,
    Rb: 3.03,
    Sr: 2.49,
    Pd: 1.63,
    Ag: 1.72,
    Cd: 1.58,
    In: 1.93,
    Sn: 2.17,
    Sb: 2.06,
    Te: 2.06,
    I: 1.98,
    Xe: 2.16,
    Cs: 3.43,
    Ba: 2.68,
    Pt: 1.75,
    Au: 1.66,
    Hg: 1.55,
    Tl: 1.96,
    Pb: 2.02,
    Bi: 2.07,
    Po: 1.97,
    At: 2.02,
    Rn: 2.2,
    Fr: 3.48,
    Ra: 2.83,
    U: 1.86
  },

  MW: {
    H: 1.0079,
    He: 4.0026,
    Li: 6.941,
    Be: 9.0122,
    B: 10.811,
    C: 12.0107,
    N: 14.0067,
    O: 15.9994,
    F: 18.9984,
    Ne: 20.1797,
    Na: 22.9897,
    Mg: 24.305,
    Al: 26.9815,
    Si: 28.0855,
    P: 30.9738,
    S: 32.065,
    Cl: 35.453,
    K: 39.0983,
    Ar: 39.948,
    Ca: 40.078,
    Sc: 44.9559,
    Ti: 47.867,
    V: 50.9415,
    Cr: 51.9961,
    Mn: 54.938,
    Fe: 55.845,
    Ni: 58.6934,
    Co: 58.9332,
    Cu: 63.546,
    Zn: 65.39,
    Ga: 69.723,
    Ge: 72.64,
    As: 74.9216,
    Se: 78.96,
    Br: 79.904,
    Kr: 83.8,
    Rb: 85.4678,
    Sr: 87.62,
    Y: 88.9059,
    Zr: 91.224,
    Nb: 92.9064,
    Mo: 95.94,
    Tc: 98,
    Ru: 101.07,
    Rh: 102.9055,
    Pd: 106.42,
    Ag: 107.8682,
    Cd: 112.411,
    In: 114.818,
    Sn: 118.71,
    Sb: 121.76,
    I: 126.9045,
    Te: 127.6,
    Xe: 131.293,
    Cs: 132.9055,
    Ba: 137.327,
    La: 138.9055,
    Ce: 140.116,
    Pr: 140.9077,
    Nd: 144.24,
    Pm: 145,
    Sm: 150.36,
    Eu: 151.964,
    Gd: 157.25,
    Tb: 158.9253,
    Dy: 162.5,
    Ho: 164.9303,
    Er: 167.259,
    Tm: 168.9342,
    Yb: 173.04,
    Lu: 174.967,
    Hf: 178.49,
    Ta: 180.9479,
    W: 183.84,
    Re: 186.207,
    Os: 190.23,
    Ir: 192.217,
    Pt: 195.078,
    Au: 196.9665,
    Hg: 200.59,
    Tl: 204.3833,
    Pb: 207.2,
    Bi: 208.9804,
    Po: 209,
    At: 210,
    Rn: 222,
    Fr: 223,
    Ra: 226,
    Ac: 227,
    Pa: 231.0359,
    Th: 232.0381,
    Np: 237,
    U: 238.0289,
    Am: 243,
    Pu: 244,
    Cm: 247,
    Bk: 247,
    Cf: 251,
    Es: 252,
    Fm: 257,
    Md: 258,
    No: 259,
    Rf: 261,
    Lr: 262,
    Db: 262,
    Bh: 264,
    Sg: 266,
    Mt: 268,
    Rg: 272,
    Hs: 277
  },

  sndStrucInfo: {1: [255, 255, 255], 2: [255, 255, 0], 3: [255, 0, 255], 4: [0, 0, 255]},
  
  zNear: 10.0,
  zFar: 20000.0,
  
  QLV_SETTINGS: [
    {SPHERE_TESS_LV: 0, CB_NOI: 2, CB_NOVPR: 6, CB_DOME_TESS_LV: 0}, 
    {SPHERE_TESS_LV: 1, CB_NOI: 3, CB_NOVPR: 10, CB_DOME_TESS_LV: 1}, 
    {SPHERE_TESS_LV: 2, CB_NOI: 8, CB_NOVPR: 10, CB_DOME_TESS_LV: 2}, 
    {SPHERE_TESS_LV: 3, CB_NOI: 12, CB_NOVPR: 15, CB_DOME_TESS_LV: 3},
    {SPHERE_TESS_LV: 4, CB_NOI: 16, CB_NOVPR: 31, CB_DOME_TESS_LV: 4}],
  
  
  OES_element_index_uint: null,
  EXT_frag_depth: null,
  imposterSpheres: false,
  BGCOLOR: [1.0, 1.0, 1.0, 1.0],
  
  backboneAtoms4Display: {"N": 1, "C": 1, "O": 1, "H": 1, "OXT": 1, "OC1": 1, "OC2": 1, "H1": 1, "H2": 1, "H3": 1, "HA": 1, "HA2": 1, "HA3": 1, "CN": 1, "CM": 1, "CH3": 1},
  projectionMode: 1, // 1: perspective, 2: orthographic
  colorMode: 1, // 1: rasmol, 2: jmol
  
  smoothFactor: 2,
  
  glsl_shaders: [
    ["shaders/standard.glsl"], 
    ["shaders/lines.glsl"], 
    ["shaders/picking.glsl"], 
    ["shaders/linesPicking.glsl"], 
    ["shaders/atomSelection.glsl"], 
//    ["shaders/imposterPoints.glsl", "points", "", ["EXT_frag_depth"]], // upgrade this to webgl2...
    ["shaders/lines.glsl", "lines_uniform_color", "#define UNIFORM_COLOR 1\n"],
    ["shaders/alpha_dummy.glsl", "alpha_dummy", ""],
    ["shaders/standard.glsl", "standard_alpha", "#define ALPHA_MODE 1\n"],
    ["shaders/standard.glsl", "standard_alphaSet", "#define ALPHA_SET 1\n"],
    ["shaders/standard.glsl", "standard_uniform_color", "#define UNIFORM_COLOR 1\n"],
    ["shaders/standard.glsl", "standard_shader_opaque", "#define ALPHA_MODE 1\n#define OPAQUE_ONLY 1"],
    ["shaders/standard.glsl", "standard_shader_transparent", "#define ALPHA_MODE 1\n#define TRANSPARENT_ONLY 1"],
    ["shaders/standard.glsl", "standard_alpha_uniform_color", "#define ALPHA_MODE 1\n#define UNIFORM_COLOR 1\n"],
    ["shaders/standard.glsl", "standard_alphaSet_uniform_color", "#define ALPHA_SET 1\n#define UNIFORM_COLOR 1\n"],
    ["shaders/standard.glsl", "standard_slab", "#define ENABLE_SLAB 1\n"], // standard_slab
    ["shaders/standard.glsl", "standard_slabColor", "#define ENABLE_SLAB 1\n#define ENABLE_SLABCOLOR 1\n"], // standard_slabColor
    //["shaders/imposterPoints.glsl", "points_uniform_color", "#define UNIFORM_COLOR 1\n", ["EXT_frag_depth"]],  // upgrade this to webgl2...
    ["shaders/anaglyph.glsl"], 
    ["shaders/billboardShader.glsl"]
  ],
  glsl_fog: 0, // 0: off, 1: on
  skipClearGeometryBuffer: true,
  stereoMode: 0,
  stereoFocalFraction: 1.5,
  stereoEyeSepFraction: 30,
  camera_fovy: 22.5,
  HQsurface_gridSpacing: 1.0,
  webGL2: false,
  vdwSphereMultiplier: 1.0,
  stickRadius: 0.15,
  groupColorFirstH: 240,
  groupColorLastH: 0,
  cartoon_highlight_color: [255, 255, 255, 255],
  connect_cutoff: 0.35,
  orientMODELs: false,
  chainHideCutoff: 300, 
  video_framerate: 15,
  video_path: "video.mp4",
  skipChainSplitting: false
};

molmil.AATypes = {"ALA": 1, "CYS": 1, "ASP": 1, "GLU": 1, "PHE": 1, "GLY": 1, "HIS": 1, "ILE": 1, "LYS": 1, "LEU": 1, "MET": 1, "ASN": 1, "PRO": 1, "GLN": 1, "ARG": 1, 
"SER": 1, "THR": 1, "VAL": 1, "TRP": 1, "TYR": 1, "ACE": 1, "NME": 1, "NH2": 1, "HIP": 1, "HIE": 1, "HID": 1, "CYX": 1, "PTR": 1,
"A": 1, "T": 1, "G": 1, "C": 1, "DA": 1, "DT": 1, "DG": 1, "DC": 1, "U": 1, "DU": 1, "U5": 1, "U3": 1, "A5": 1, "MSE": 1, "SEQ": 1, "CSW": 1, "ALY": 1, "CYM": 1};

molmil.AATypesBase = {"ALA": 1, "CYS": 1, "ASP": 1, "GLU": 1, "PHE": 1, "GLY": 1, "HIS": 1, "ILE": 1, "LYS": 1, "LEU": 1, "MET": 1, "ASN": 1, "PRO": 1, "GLN": 1, "ARG": 1, "SER": 1, "THR": 1, "VAL": 1, "TRP": 1, "TYR": 1, "ACE": 1, "NME": 1, "NH2": 1, "HIP": 1, "HIE": 1, "HID": 1, "CYM": 1};

molmil.localStorageGET = function(field, except) {
  try {return localStorage.getItem(field) || except;}
  catch (e) {return except;}
};

molmil.SNFG = {};
molmil.SNFG["0MK"] = molmil.SNFG["32O"] = molmil.SNFG.BDR = molmil.SNFG.RIB = molmil.SNFG.RIP = molmil.SNFG.YYM = molmil.SNFG.Z6J = molmil.SNFG.RIB = {"type": "5-star", "rgba": [246, 158, 161, 255], "name": "Rib"};
molmil.SNFG["1GN"] = molmil.SNFG.X6X = {"type": "cube", "rgba": [255, 212, 0, 255], "rgba2": [255, 255, 255, 255], "name": "GalN"};
molmil.SNFG["1S4"] = molmil.SNFG.MUR = molmil.SNFG.MUR = {"type": "flat-hex", "rgba": [161, 122, 77, 255], "name": "Mur"};
molmil.SNFG["289"] = {"type": "flat-hex", "rgba": [246, 158, 161, 255], "name": "DDmanHep"};
molmil.SNFG["3MK"] = molmil.SNFG.SHD = molmil.SNFG.Z6H = molmil.SNFG.ALT = {"type": "sphere", "rgba": [246, 158, 161, 255], "name": "Alt"};
molmil.SNFG["49T"] = {"type": "oct-pyramid", "rgba": [237, 28, 36, 255], "rgba2": [255, 255, 255, 255], "name": "FucNAc"};
molmil.SNFG["4GL"] = molmil.SNFG.GL0 = molmil.SNFG.GUP = molmil.SNFG.Z8H = molmil.SNFG.GUL = molmil.SNFG.GUP = molmil.SNFG.GL0 = {"type": "sphere", "rgba": [244, 121, 32, 255], "name": "Gul"};
molmil.SNFG["4N2"] = molmil.SNFG.Z0F = molmil.SNFG.ZCD = molmil.SNFG.IDO = {"type": "sphere", "rgba": [161, 122, 77, 255], "name": "Ido"};
molmil.SNFG["64K"] = molmil.SNFG.AHR = molmil.SNFG.ARA = molmil.SNFG.ARB = molmil.SNFG.BXX = molmil.SNFG.BXY = molmil.SNFG.FUB = molmil.SNFG.SEJ = molmil.SNFG.ARA = molmil.SNFG.AHR = {"type": "5-star", "rgba": [0, 166, 81, 255], "name": "Ara"};
molmil.SNFG["66O"] = {"type": "oct-pyramid", "rgba": [244, 121, 32, 255], "name": "6dGul"};
molmil.SNFG["95Z"] = {"type": "cube", "rgba": [0, 166, 81, 255], "rgba2": [255, 255, 255, 255], "name": "ManN"};
molmil.SNFG.A2G = molmil.SNFG.NGA = molmil.SNFG.YYQ = molmil.SNFG.NGA = {"type": "cube", "rgba": [255, 212, 0, 255], "name": "GalNAc"};
molmil.SNFG.A5C = molmil.SNFG.SDY = molmil.SNFG.ZEE = molmil.SNFG.TAL = {"type": "sphere", "rgba": [165, 67, 153, 255], "name": "Tal"};
molmil.SNFG.ABE = molmil.SNFG.ABE = {"type": "rect", "rgba": [244, 121, 32, 255], "name": "Abe"};
molmil.SNFG.ADA = molmil.SNFG.GTK = molmil.SNFG.GTR = molmil.SNFG.ADA = {"type": "diamond", "rgba": [255, 212, 0, 255], "rgba2": [255, 255, 255, 255], "name": "GalA"};
molmil.SNFG.AFD = molmil.SNFG.ALL = molmil.SNFG.WOO = molmil.SNFG.Z2D = molmil.SNFG.ALL = molmil.SNFG.WOO = {"type": "sphere", "rgba": [165, 67, 153, 255], "name": "All"};
molmil.SNFG.AMU = molmil.SNFG.MUB = {"type": "flat-hex", "rgba": [165, 67, 153, 255], "name": "MurNAc"};
molmil.SNFG.BDF = molmil.SNFG.FRU = molmil.SNFG.LFR = molmil.SNFG.Z9N = molmil.SNFG.FRU = {"type": "pentagon", "rgba": [0, 166, 81, 255], "name": "Fru"};
molmil.SNFG.BDP = molmil.SNFG.GCU = molmil.SNFG.GCU = {"type": "diamond", "rgba": [0, 144, 188, 255], "rgba2": [255, 255, 255, 255], "name": "GlcA"};
molmil.SNFG.BEM = molmil.SNFG.MAV = molmil.SNFG.MAV = molmil.SNFG.BEM = {"type": "diamond", "rgba": [0, 166, 81, 255], "rgba2": [255, 255, 255, 255], "name": "ManA"};
molmil.SNFG.BGC = molmil.SNFG.GLC = molmil.SNFG.Z8T = molmil.SNFG.GLC = molmil.SNFG.MAL = molmil.SNFG.BGC = {"type": "sphere", "rgba": [0, 144, 188, 255], "name": "Glc"};
molmil.SNFG.BM3 = molmil.SNFG.BM7 = {"type": "cube", "rgba": [0, 166, 81, 255], "name": "ManNAc"};
molmil.SNFG.BMA = molmil.SNFG.MAN = molmil.SNFG.MAN = molmil.SNFG.BMA = {"type": "sphere", "rgba": [0, 166, 81, 255], "name": "Man"};
molmil.SNFG.DDA = molmil.SNFG.RAE = molmil.SNFG.Z5J = molmil.SNFG.OLI = {"type": "rect", "rgba": [0, 144, 188, 188], "name": "Oli"};
molmil.SNFG.FCA = molmil.SNFG.FCB = molmil.SNFG.FUC = molmil.SNFG.FUL = molmil.SNFG.GYE = molmil.SNFG.FUC = molmil.SNFG.FUL = {"type": "oct-pyramid", "rgba": [237, 28, 36, 255], "name": "Fuc"};
molmil.SNFG.G6D = molmil.SNFG.YYK = molmil.SNFG.QUI = {"type": "oct-pyramid", "rgba": [0, 144, 188, 255], "name": "Qui"};
molmil.SNFG.GAL = molmil.SNFG.GIV = molmil.SNFG.GLA = molmil.SNFG.GXL = molmil.SNFG.GZL = molmil.SNFG.GAL = molmil.SNFG.GLA = {"type": "sphere", "rgba": [255, 212, 0, 255], "name": "Gal"};
molmil.SNFG.GCS = molmil.SNFG.PA1 = molmil.SNFG.GCS = {"type": "cube", "rgba": [0, 144, 188, 255], "rgba2": [255, 255, 255, 255], "name": "GlcN"};
molmil.SNFG.GMH = {"type": "flat-hex", "rgba": [0, 166, 81, 255], "name": "LDmanHep"};
molmil.SNFG.HSQ = molmil.SNFG.LXZ = {"type": "cube", "rgba": [161, 122, 77, 255], "name": "IdoNAc"};
molmil.SNFG.HSY = molmil.SNFG.LXC = molmil.SNFG.XYP = molmil.SNFG.XYS = molmil.SNFG.XYZ = molmil.SNFG.XYL = molmil.SNFG.XYS = molmil.SNFG.LXC = molmil.SNFG.XYP = {"type": "5-star", "rgba": [244, 121, 32, 255], "name": "Xyl"};
molmil.SNFG.IDR = molmil.SNFG.IDS = {"type": "diamond", "rgba": [255, 255, 255, 255], "rgba2": [161, 122, 77, 255], "name": "IdoA"};
molmil.SNFG.KDM = molmil.SNFG.KDN = molmil.SNFG.KDN = {"type": "diamond", "rgba": [0, 166, 81, 255], "name": "Kdn"};
molmil.SNFG.KDO = molmil.SNFG.KDO = {"type": "flat-hex", "rgba": [255, 212, 0, 255], "name": "Kdo"};
molmil.SNFG.LDY = molmil.SNFG.Z4W = molmil.SNFG.LYX = {"type": "5-star", "rgba": [255, 212, 0, 255], "name": "Lyx"};
molmil.SNFG.LGU = molmil.SNFG.LGU = {"type": "diamond", "rgba": [244, 121, 32, 255], "rgba2": [255, 255, 255, 255], "name": "GulA"};
molmil.SNFG.LXB = {"type": "cube", "rgba": [244, 121, 32, 255], "name": "GulNAc"};
molmil.SNFG.NAA = {"type": "cube", "rgba": [165, 67, 153, 255], "name": "AllNAc"};
molmil.SNFG.NAG = molmil.SNFG.NDG = molmil.SNFG.NGZ = molmil.SNFG.NAG = molmil.SNFG["4YS"] = molmil.SNFG.SGN = molmil.SNFG.BGLN = molmil.SNFG.NDG = {"type": "cube", "rgba": [0, 144, 188, 255], "name": "GlcNAc"};
molmil.SNFG.NGC = molmil.SNFG.NGE = {"type": "diamond", "rgba": [165, 67, 153, 255], "name": "Neu5Gc"};
molmil.SNFG.PSV = molmil.SNFG.SF6 = molmil.SNFG.SF9 = molmil.SNFG.TTV = molmil.SNFG.PSI = {"type": "pentagon", "rgba": [246, 158, 161, 255], "name": "Psi"};
molmil.SNFG.PZU = molmil.SNFG.PAR = {"type": "rect", "rgba": [246, 158, 161, 255], "name": "Par"};
molmil.SNFG.RAM = molmil.SNFG.RM4 = molmil.SNFG.XXR = molmil.SNFG.RAM = {"type": "oct-pyramid", "rgba": [0, 166, 81, 255], "name": "Rha"};
molmil.SNFG.SIA = molmil.SNFG.SLB = molmil.SNFG.SIA = {"type": "diamond", "rgba": [165, 67, 153, 255], "name": "Neu5Ac"};
molmil.SNFG.SOE = molmil.SNFG.UEA = molmil.SNFG.SOR = {"type": "pentagon", "rgba": [244, 121, 32, 255], "name": "Sor"};
molmil.SNFG.T6T = molmil.SNFG.TAG = {"type": "pentagon", "rgba": [255, 212, 0, 255], "name": "Tag"};
molmil.SNFG.TYV = molmil.SNFG.TYV = {"type": "rect", "rgba": [0, 166, 81, 255], "name": "Tyv"};
molmil.SNFG.X0X = molmil.SNFG.X1X = {"type": "diamond", "rgba": [165, 67, 153, 255], "rgba2": [255, 255, 255, 255], "name": "TalA"};
molmil.SNFG.XXM = molmil.SNFG.API = {"type": "pentagon", "rgba": [0, 144, 188, 255], "name": "Api"};
molmil.SNFG.Z3U = molmil.SNFG.DIG = {"type": "rect", "rgba": [165, 67, 153, 255], "name": "Dig"};
molmil.SNFG.Z9W = {"type": "oct-pyramid", "rgba": [0, 144, 188, 255], "rgba2": [255, 255, 255, 255], "name": "QuiNAc"};
molmil.SNFG.__UNKNOWN__ = {"type": "flat-hex", "rgba": [255, 255, 255, 255], "name": "__UNKNOWN__"};
molmil.SNFG.COL = {"type": "rect", "rgba": [165, 67, 153, 255], "name": "Col"};
molmil.SNFG.BAC = {"type": "flat-hex", "rgba": [0, 144, 188, 255], "name": "Bac"};
molmil.SNFG.DHA = {"type": "flat-hex", "rgba": [244, 121, 32, 255], "name": "Dha"};
molmil.SNFG.NEU = {"type": "diamond", "rgba": [161, 122, 77, 255], "name": "Neu"};
molmil.SNFG.GMH = {"type": "flat-hex", "rgba": [0, 166, 81, 255], "name": "LDmanHep"};

molmil.initSettings = function () {
  cifDicLocJSON = "https://pdbj.org/molmil2/mmcif_pdbx_v50_summary.json";
  cifDicLoc = "https://data.pdbj.org/pdbjplus/dictionaries/mmcif_pdbx.dic";
  
  var colors = {
    DUMMY: [255, 20, 147],
    H: [255, 255, 255],
    D: [255, 255, 255],
    C: [200, 200, 200],
    N: [143, 143, 255],
    O: [240, 0, 0],
    S: [255, 200, 50],
    Cl: [0, 255, 0],
    Na: [0, 0, 255],
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
 
  molmil.configBox.elementColors = {};
  for (var e in colors) molmil.configBox.elementColors[e] = [colors[e][0], colors[e][1], colors[e][2], 255];
  
  molmil.configBox.sndStrucColor = {};
  for (var e in molmil.configBox.sndStrucInfo) molmil.configBox.sndStrucColor[e] = [molmil.configBox.sndStrucInfo[e][0], molmil.configBox.sndStrucInfo[e][1], molmil.configBox.sndStrucInfo[e][2], 255];
  
  molmil.configBox.bu_colors = [[0, 204, 255], [255, 51, 255], [0, 255, 102], [153, 102, 255], [255, 255, 0], [204, 102, 102], [153, 204, 102], [204, 153, 204], [153, 153, 102], [0, 204, 204], [153, 153, 153], [51, 153, 204], [0, 255, 153], [51, 153, 255], [204, 102, 153], [0, 255, 204], [51, 204, 255], [204, 102, 204], [0, 255, 255], [102, 153, 204], [204, 153, 0], [51, 204, 102], [102, 153, 255], [204, 153, 51], [51, 204, 153], [102, 204, 255], [204, 153, 102], [51, 204, 204], [153, 102, 204], [204, 153, 153], [51, 255, 51], [51, 255, 102], [153, 153, 204], [204, 204, 0], [51, 255, 153], [153, 153, 255], [204, 204, 51], [51, 255, 204], [153, 204, 255], [204, 204, 102], [51, 255, 255], [204, 102, 255], [204, 204, 153], [102, 153, 153], [204, 153, 255], [204, 204, 204], [102, 204, 51], [204, 204, 255], [255, 51, 204], [102, 204, 102], [102, 204, 153], [255, 102, 51], [102, 204, 204], [255, 102, 102], [102, 255, 0], [255, 102, 153], [102, 255, 51], [255, 102, 204], [102, 255, 102], [255, 102, 255], [102, 255, 153], [255, 153, 0], [102, 255, 204], [255, 153, 51], [102, 255, 255], [255, 153, 102], [153, 204, 0], [255, 153, 153], [153, 204, 51], [255, 153, 204], [255, 153, 255], [153, 204, 153], [255, 204, 0], [153, 204, 204], [255, 204, 51], [153, 255, 0], [255, 204, 102], [153, 255, 51], [255, 204, 153], [153, 255, 102], [255, 204, 204], [153, 255, 153], [255, 204, 255], [153, 255, 204], [153, 255, 255], [255, 255, 51], [204, 255, 0], [255, 255, 102], [204, 255, 51], [255, 255, 153], [204, 255, 102], [255, 255, 204], [204, 255, 153], [255, 255, 255], [204, 255, 204], [204, 255, 255]];
  
  molmil.configBox.glsl_fog = molmil.localStorageGET("molmil.settings_glsl_fog") == 1;
  molmil.configBox.projectionMode = molmil.localStorageGET("molmil.settings_PROJECTION") || 1;
  molmil.configBox.stereoMode = parseInt(molmil.localStorageGET("molmil.settings_STEREO")) || 0;
  molmil.configBox.slab_near_ratio = parseFloat(molmil.localStorageGET("molmil.settings_slab_near_ratio")) || 0;
  molmil.configBox.slab_far_ratio = parseFloat(molmil.localStorageGET("molmil.settings_slab_far_ratio")) || 1;
  molmil.configBox.smoothFactor = molmil.localStorageGET("molmil.settings_BBSF") || 2;
  
  var tmp = molmil.localStorageGET("molmil.settings_BGCOLOR");
  if (tmp) {
    try {molmil.configBox.BGCOLOR = JSON.parse(tmp);}
    catch (e) {}
  }
  
  molmil.configBox.keepBackgroundColor = molmil.localStorageGET("molmil.settings_keepBackgroundColor") == 1;
  
  molmil.updateBGcolor();
}

molmil.updateBGcolor = function() {
  var fgcolor = molmil.hex2rgb(molmil.invertColor(molmil.rgb2hex(molmil.configBox.BGCOLOR[0]*255, molmil.configBox.BGCOLOR[1]*255, molmil.configBox.BGCOLOR[2]*255)));
  let root = document.documentElement;
  root.style.setProperty("--BACKGROUND_COLOR", (molmil.configBox.BGCOLOR[0]*255).toFixed()+","+(molmil.configBox.BGCOLOR[1]*255).toFixed()+","+(molmil.configBox.BGCOLOR[2]*255).toFixed());
  root.style.setProperty("--FOREGROUND_COLOR", (fgcolor[0]*255).toFixed()+","+(fgcolor[1]*255).toFixed()+","+(fgcolor[2]*255).toFixed());  

  var sf = .75, isf = 1-sf;
  root.style.setProperty("--BACKGROUND_LIGHT_COLOR", ((molmil.configBox.BGCOLOR[0]*sf + fgcolor[0]*isf)*255).toFixed()+","+((molmil.configBox.BGCOLOR[1]*sf + fgcolor[1]*isf)*255).toFixed()+","+((molmil.configBox.BGCOLOR[2]*sf + fgcolor[2]*isf)*255).toFixed());
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
molmil.colorEntry_Entity = 9;

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
  this.Bfactor = 0;
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
  this.branches = [];
  this.showBBatoms = [];
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
  this.programs = [];
  this.BUmatrices = {};
  this.BUassemblies = {};
};

molmil.simpleEntry = function() {
  /*
  this.altLocList; // wrap
  this.atomIdList; // not --> index+1
  this.bFactorList; // wrap
  this.bioAssemblyList;
  this.bondAtomList; // probably nowrap
  this.bondOrderList; // probably nowrap
  this.chainIdList; // probably nowrap
  this.chainNameList; // probably nowrap
  this.chainsPerModel; // required???
  this.depositionDate; // not
  this.entityList; // required???
  this.experimentalMethods; // not
  this.groupIdList; // not --> index+1
  this.groupList;
  this.groupTypeList; // wrap-del
  this.groupsPerChain; // required???
  this.insCodeList; // required???
  this.mmtfProducer; //not
  this.mmtfVersion; //not
  this.ncsOperatorList; //not
  this.numAtoms; // wrap-del
  this.numBonds; // wrap-del
  this.numChains;
  this.numGroups;
  this.numModels;
  this.occupancyList;
  this.releaseDate;
  this.secStructList;
  this.sequenceIndexList;
  this.spaceGroup;
  this.structureId;
  this.title;
  this.xCoordList
  this.yCoordList;
  this.zCoordList;
  */
  
};

molmil.entryObject.prototype.toString = function() {return "Entry "+(this.meta.id || "");};

molmil.polygonObject = function (meta) {
  this.programs = [];
  this.meta = meta || {};
  this.display = true;
};

molmil.defaultSettings_label = {dx: 0.0, dy: 0.0, dz: 0.0, color: [0, 255, 0], fontSize: 20};

molmil.labelObject = function(soup) {
  this.soup = soup;
  this.texture = null;
  this.settings = JSON.parse(JSON.stringify(molmil.defaultSettings_label));
  this.xyz = [0.0, 0.0, 0.0];
  this.display = true;
  this.text = "";
  this.status = false;
}

// ** object controlling animation (multiple models & trajectories) **

molmil.fetchCanvas = function() {
  for (var i=0; i<molmil.canvasList.length; i++) if (molmil.canvasList[i].molmilViewer) return molmil.canvasList[i];
};

// ** main molmil object **

molmil.viewer = function (canvas) {
  this.canvas = canvas;

  this.renderer = new molmil.render(this);
  
  this.defaultCanvas = [canvas, this.renderer];
  
  this.onAtomPick = function() {};
  this.downloadInProgress = 0;
  
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
  this.AisB = true;

  this.texturedBillBoards = [];
 
  //this.polygonData = [];
  this.atomRef = {};
  this.AID = 1;
  this.CID = 1;
  this.MID = 1;
  this.SID = 1;
  
  this.BU = false;
  
  this.atomSelection = [];
  
  this.showWaters = false;
  this.showHydrogens = false;
  
  this.sceneBU = null;
  
  this.canvases = [];
  
  this.SCstuff = false;
  
  if (this.canvas) {
    this.canvas.atomCORset = false;
    this.canvases = [this.canvas];
  }
  this.renderer.clear();
  
  this.renderer.camera.z_set = false;
  
  this.extraREST = {};
  this.extraRESTHeaders = {};
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
  
  this.canvas.update = true;
};

molmil.viewer.prototype.waterToggle = function(show) {
  for (var m=0, c, a; m<this.structures.length; m++) {
    if (! this.structures[m].chains) continue;
    for (c=0; c<this.structures[m].chains.length; c++) {
      if (this.structures[m].chains[c].molecules.length && this.structures[m].chains[c].molecules[0].water) this.structures[m].chains[c].display = show;
    }
  }
  this.showWaters = show;
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

  this.showHydrogens = show;
};

molmil.viewer.prototype.restoreDefaultCanvas = function(canvas) {
  this.canvas = this.defaultCanvas[0];
  this.renderer = this.defaultCanvas[1];
}



molmil.getSelectedAtom = function(n, soup) {
  n = n || 0;
  soup = soup || molmil.cli_soup || molmil.fetchCanvas().molmilViewer;
  
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
  if (this.hasOwnProperty("__cwd__")) {
    var r = new RegExp('^(?:[a-z]+:)?//', 'i');
    if (! r.test(loc) && ! loc.startsWith(this.__cwd__)) loc = this.__cwd__ + loc;
  }
  else if (molmil.hasOwnProperty("__cwd__")) {
    var r = new RegExp('^(?:[a-z]+:)?//', 'i');
    if (! r.test(loc) && ! loc.startsWith(molmil.__cwd__)) loc = molmil.__cwd__ + loc;
  }

  if (! format) format = molmil.guess_format(loc);
  
  if (format == "mjs") return molmil.loadScript(loc);

  var preloadLoadersJS = [molmil.settings.src+"plugins/loaders.js"];
  
  this.downloadInProgress++;
  
  settings = settings || {};
  if (settings.bakadl) {
    delete settings.bakadl;
    this.downloadInProgress--;
  }
  var gz = loc.substr(-3).toLowerCase() == ".gz" && ! settings.no_pako_gz;
  if (settings.gzipped == true || settings.gzipped == 1) gz = true;
  if (gz && ! window.hasOwnProperty("pako")) {
    settings.bakadl = true;
    var head = document.getElementsByTagName("head")[0];
    var obj = molmil_dep.dcE("script"); obj.src = molmil.settings.src+"lib/pako.js"; 
    obj.soup = this; obj.argList = [loc, format, ondone, settings]; obj.onload = function() {molmil_dep.asyncStart(this.soup.loadStructure, this.argList, this.soup, 0);};
    head.appendChild(obj);
    return;
  }

  var request = molmil.xhr(loc); //loc = request.URL;
  
  var async = molmil_dep.getKeyFromObject(settings || {}, "async", true); request.ASYNC = async; request.target = this;
  request.gz = gz;
  if (request.gz) request.responseType = "arraybuffer";
  if (this.onloaderror) request.OnError = this.onloaderror;
  request.filename = settings.object || loc.substr(loc.lastIndexOf("/")+1);

  if (format == 1 || (format+"").toLowerCase() == "mmjson") {
    preloadLoadersJS = [];
    var loc_ = loc;
    if (async && ! request.gz) request.responseType = "json"; // add gzip support...
    request.parse = function() {
      if (this.gz) var jso = JSON.parse(pako.inflate(new Uint8Array(this.request.response), {to: "string"}));
      else var jso = request.request.response;
      if (typeof jso != "object" && jso != null) jso = JSON.parse(this.request.responseText);
      else if (jso == null) {throw "";}
      return this.target.load_PDBx(jso, this.pdbid, settings);
    };
  }
  else if (format == 2 || (format+"").toLowerCase() == "mmcif") {
    settings.bakadl = true;
    if (! window.CIFparser) return molmil.loadPlugin(molmil.settings.src+"lib/cif.js", this.loadStructure, this, [loc, format, ondone, settings]); 
    preloadLoadersJS = [];
    request.parse = function() {
      return this.target.load_mmCIF(this.gz ? pako.inflate(new Uint8Array(this.request.response), {to: "string"}) : this.request.responseText, settings);
    };
  }
  else if (format == 3 || (format+"").toLowerCase() == "pdbml") {
    settings.bakadl = true;
    if (! window.loadPDBML) return molmil.loadPlugin(molmil.settings.src+"lib/cif.js", this.loadStructure, this, [loc, format, ondone, settings]); 
    preloadLoadersJS = [];
    request.parse = function() {
      return this.target.load_PDBML(this.gz ? pako.inflate(new Uint8Array(this.request.response), {to: "string"}) : this.request.responseXML, settings);
    };
  }
  else if (format == 4 || (format+"").toLowerCase() == "pdb") {
    request.parse = function() {
      return this.target.load_PDB(this.gz ? pako.inflate(new Uint8Array(this.request.response), {to: "string"}) : this.request.responseText, this.filename);
    };
  }
  else if ((format+"").toLowerCase() == "mmtf") {
    settings.bakadl = true;
    if (! window.MMTF) return molmil.loadPlugin(molmil.settings.src+"lib/mmtf.js", this.loadStructure, this, [loc, format, ondone, settings]); 
    request.ASYNC = true; request.responseType = "arraybuffer";
    request.parse = function() {
      return this.target.load_MMTF(this.gz ? pako.inflate(new Uint8Array(this.request.response)) : this.request.response, this.filename, settings);
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
      return this.target.load_MPBF(this.gz ? pako.inflate(new Uint8Array(this.request.response)).buffer : this.request.response, this.filename, settings);
    };
  }
  else if ((format+"").toLowerCase() == "ccp4") {
    preloadLoadersJS.push(molmil.settings.src+"plugins/misc.js");
    request.ASYNC = true; request.responseType = "arraybuffer";
    request.parse = function() {
      return this.target.load_ccp4(this.gz ? pako.inflate(new Uint8Array(this.request.response)) : this.request.response, this.filename, settings);
    };
  }
  else if ((format+"").toLowerCase() == "obj") {
    request.parse = function() {
      return this.target.load_obj(this.gz ? pako.inflate(new Uint8Array(this.request.response), {to: "string"}) : this.request.responseText, this.filename, settings);
    };
  }
  else if ((format+"").toLowerCase() == "wrl") {
    preloadLoadersJS.push(molmil.settings.src+"plugins/vrml.js");
    preloadLoadersJS.push(molmil.settings.src+"lib/vrml.min.js");
    request.parse = function() {
      return this.target.load_wrl(this.gz ? pako.inflate(new Uint8Array(this.request.response), {to: "string"}) : this.request.responseText, this.filename, settings);
    };
  }
  else if ((format+"").toLowerCase() == "stl") {
    request.ASYNC = true; request.responseType = "arraybuffer";
    request.parse = function() {
      return this.target.load_stl(this.gz ? pako.inflate(new Uint8Array(this.request.response)) : this.request.response, this.filename);
    };
  }
  else if ((format+"").toLowerCase() == "ply") {
    request.ASYNC = true; request.responseType = "arraybuffer";
    request.parse = function() {
      return this.target.load_ply(this.gz ? pako.inflate(new Uint8Array(this.request.response)) : this.request.response, this.filename);
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
  else if ((format+"").toLowerCase() == "gromacs-trr") {
    request.ASYNC = true; request.responseType = "arraybuffer";
    request.parse = function() {
      this.target.loadGromacsTRR(this.request.response, this.filename);
      return this.target.structures[0];
    };
  }
  else if ((format+"").toLowerCase() == "gromacs-xtc") {
    request.ASYNC = true; request.responseType = "arraybuffer";
    request.parse = function() {
      this.target.loadGromacsXTC(this.request.response, settings || {});
      return null;
    };
  }
  else if ((format+"").toLowerCase() == "psygene-traj" || (format+"").toLowerCase() == "presto-traj") {
    request.ASYNC = true; request.responseType = "arraybuffer";
    request.parse = function() {
      var buffer = this.request.response;
      this.target.loadMyPrestoTrj(buffer, molmil_dep.getKeyFromObject(settings || {}, "fxcell", null));
      return this.target.structures[0];
    };
  }
  else if ((format+"").toLowerCase() == "presto-mnt") {
    request.ASYNC = true; request.responseType = "arraybuffer";
    request.parse = function() {
      var buffer = this.request.response;
      this.target.loadMyPrestoMnt(buffer, molmil_dep.getKeyFromObject(settings || {}, "fxcell", null));
      return this.target.structures[0];
    };
  }
  else if (typeof(format) == "function") {
    request.ASYNC = async;
    request.parseFunction = format;
    if (settings.responseType) request.responseType = settings.responseType;
    request.parse = function() {
      if (settings.responseType == "arraybuffer" || settings.responseType == "json") return this.parseFunction.apply(this.target, [this.request.response, this.filename]);
      else return this.parseFunction.apply(this.target, [this.request.responseText, this.filename])
    };
  }
  else {
    var fakeObj = {filename: loc, readAsText: function() {}, readAsArrayBuffer: function() {}};
    for (var j=0; j<this.canvas.inputFunctions.length; j++) {
      if (this.canvas.inputFunctions[j](this.canvas, fakeObj)) {
        request.inputFunction = this.canvas.inputFunctions[j];
        request.canvas = this.canvas;
        request.parse = function() {
          var fakeObj = {
            filename: loc, 
            readAsText: function() {fakeObj.onload({target: {result: request.request.responseText}});},
            readAsArrayBuffer: function() {fakeObj.onload({target: {result: request.request.response}});}
          };
          this.inputFunction(this.canvas, fakeObj);
        };
        break;
      }
    }
    if (request.inputFunction === undefined) {console.log("Unknown format: "+format); return;}
  }

  request.ondone = ondone;
  request.OnDone = function() {
    this.target.downloadInProgress--;

    var structures = this.parse();
    if (! structures) {
      if (settings.alwaysCallONDONE) ondone();
      return;
    }
    if (! (structures instanceof Array)) structures = [structures];
    if (structures.length == 0) {
      if (settings.alwaysCallONDONE) ondone();
      return;
    }
    
    var id = this.target.SID++;
    if (structures.length == 1) structures[0].meta.idnr = "#"+id;
    else {
      for (var s=0; s<structures.length; s++) {
        if (structures[s].meta.modelnr) structures[s].meta.idnr = "#"+id+"."+structures[s].meta.modelnr;  
        else {id = this.target.SID++; structures[s].meta.idnr = "#"+id;}
      }
    }
    molmil.safeStartViewer(this.target.canvas);
    if (ondone) ondone(this.target, structures.length == 1 ? structures[0] : structures);
    else {
      molmil.displayEntry(structures, 1);
      molmil.colorEntry(structures, 1, null, true, this.target);
    }
    if (this.target.UI) this.target.UI.resetRM();
  };
  if (preloadLoadersJS.length) {
    for (var i=0; i<preloadLoadersJS.length; i++) molmil.loadPlugin(preloadLoadersJS[i], null, null, null, request.async);
  }
  
  for (var e in this.extraREST) request.AddParameter(e, this.extraREST[e]);
  for (var e in this.extraRESTHeaders) request.headers[e] = this.extraRESTHeaders[e];
  request.Send();
};

molmil.viewer.prototype.loadGromacsXTC = function(buffer, settings) { 
  return molmil.loadPlugin(molmil.settings.src+"plugins/md-anal.js", this.loadGromacsXTC, this, [buffer, settings]);
}

molmil.viewer.prototype.loadGromacsTRR = function(buffer) {
  return molmil.loadPlugin(molmil.settings.src+"plugins/md-anal.js", this.loadGromacsTRR, this, [buffer]);
}

molmil.viewer.prototype.loadMyPrestoMnt = function(buffer, fxcell) {
  return molmil.loadPlugin(molmil.settings.src+"plugins/md-anal.js", this.loadMyPrestoMnt, this, [buffer, fxcell]);
}

molmil.viewer.prototype.loadMyPrestoTrj = function(buffer, fxcell) {
  return molmil.loadPlugin(molmil.settings.src+"plugins/md-anal.js", this.loadMyPrestoTrj, this, [buffer, fxcell]);
}

// ** loads arbitrary data **
molmil.viewer.prototype.loadStructureData = function(data, format, filename, ondone, settings) {
  if (! format) format = molmil.guess_format(filename);
  var structures;
  if (format == 1 || (format+"").toLowerCase() == "mmjson") structures = this.load_PDBx(typeof data == "string" ? JSON.parse(data) : data, settings);
  else if (format == 2 || (format+"").toLowerCase() == "cif") {
    if (! window.CIFparser) return molmil.loadPlugin(molmil.settings.src+"lib/cif.js", this.loadStructureData, this, [data, format, filename, ondone, settings]); 
    structures = this.load_mmCIF(data, settings);
  }
  else if (format == 3 || (format+"").toLowerCase() == "pdbml") {
    if (! window.loadPDBML) return molmil.loadPlugin(molmil.settings.src+"lib/cif.js", this.loadStructureData, this, [data, format, filename, ondone, settings]); 
    structures = this.load_PDBML(data, settings);
  }
  else if (format == 4 || (format+"").toLowerCase() == "pdb") structures = this.load_PDB(data, filename);
  else if ((format+"").toLowerCase() == "mmtf") {
    if (! window.MMTF) return molmil.loadPlugin(molmil.settings.src+"lib/mmtf.js", this.loadStructureData, this, [data, format, filename, ondone, settings]); 
    structures = this.load_MMTF(data, filename);
  }
  else if (format == 5 || (format+"").toLowerCase() == "polygon-xml") structures = this.load_polygonXML(data, filename, settings);
  else if (format == 6 || (format+"").toLowerCase() == "polygon-json") structures = this.load_polygonJSON(typeof data == "object" ? data : JSON.parse(data), filename);
  else if (format == 7 || (format+"").toLowerCase() == "gro") structures = this.load_GRO(data, filename);
  else if (format == 8 || (format+"").toLowerCase() == "mpbf") structures = this.load_MPBF(data, filename, settings);
  else if ((format+"").toLowerCase() == "ply") structures = this.load_ply(data, filename, settings);
  else if ((format+"").toLowerCase() == "mdl") structures = this.load_mdl(data, filename);
  else if ((format+"").toLowerCase() == "mol2") structures = this.load_mol2(data, filename);
  else if ((format+"").toLowerCase() == "xyz") structures = this.load_xyz(data, filename, settings);
  else if ((format+"").toLowerCase() == "ccp4") structures = this.load_ccp4(data, filename, settings);
  else if ((format+"").toLowerCase() == "stl") structures = this.load_stl(data, filename, settings);
  else if ((format+"").toLowerCase() == "obj") structures = this.load_obj(data, filename, settings);
  else if ((format+"").toLowerCase() == "wrl") {
    if (! this.load_wrl) return molmil.loadPlugin(molmil.settings.src+"plugins/vrml.js", this.loadStructureData, this, [data, format, filename, ondone, settings], true); 
    if (! window.vrmlParser) return molmil.loadPlugin(molmil.settings.src+"lib/vrml.min.js", this.loadStructureData, this, [data, format, filename, ondone, settings], true);
    structures = this.load_wrl(data, filename, settings);
  }
  else if ((format+"").toLowerCase() == "psygene-traj" || (format+"").toLowerCase() == "presto-traj") structures = this.loadMyPrestoTrj(data, molmil_dep.getKeyFromObject(settings || {}, "fxcell", null));
  else if ((format+"").toLowerCase() == "presto-mnt") structures = this.loadMyPrestoMnt(data, molmil_dep.getKeyFromObject(settings || {}, "fxcell", null));
  else if ((format+"").toLowerCase() == "gromacs-trr") structures = this.loadGromacsTRR(data);
  else if ((format+"").toLowerCase() == "gromacs-xtc") structures = this.loadGromacsXTC(data);
  else if (format == "mjs") {
    this.__cwd__ = this.canvas.commandLine.environment.scriptUrl = filename.substr(0,filename.lastIndexOf('/')) + "/";
    this.canvas.commandLine.environment.console.runCommand(data.replace(/\/\*[\s\S]*?\*\/|([^:]|^)\/\/.*$/gm, ""));
  }
  if (! structures) return;
  if (! (structures instanceof Array)) structures = [structures];
  if (structures.length == 0) return;
  var id = this.SID++;
  if (structures.length == 1) structures[0].meta.idnr = "#"+id;
  else {
    for (var s=0; s<structures.length; s++) {
      if (structures[s].meta.modelnr) structures[s].meta.idnr = "#"+id+"."+structures[s].meta.modelnr;  
      else {id = this.SID++; structures[s].meta.idnr = "#"+id;}
    }
  }
  if (this.canvas) molmil.safeStartViewer(this.canvas);
  if (ondone) ondone(this, structures.length == 1 ? structures[0] : structures);
  else if (this.customLoaderFunc) this.customLoaderFunc(this, structures.length == 1 ? structures[0] : structures);
  else {
    molmil.displayEntry(structures, 1);
    molmil.colorEntry(structures, 1, null, true, this);
  }
  if (this.UI) this.UI.resetRM();
};

// ** connects amino bonds within a chain object **
molmil.viewer.prototype.buildAminoChain = function(chain) {
  if (chain.isHet || (chain.molecules.length && (chain.molecules[0].water))) return;
  var snfg = true;
  for (var m1=0; m1<chain.molecules.length; m1++) if (! chain.molecules[m1].SNFG) snfg = false;
  if (snfg) return this.buildSNFG(chain);
  if (chain.molecules.length == 1 && chain.molecules[0].xna) {
    chain.molecules[0].ligand = chain.isHet = true; chain.molecules[0].xna = false;
    delete chain.molecules[0].N;
    delete chain.molecules[0].CA;
    delete chain.molecules[0].C;
    return;
  }
  
  var m1, m2, xyz1, xyz2, rC, newChains, struc = chain.entry, dx, dy, dz, r, tmpArray;
  var xyzRef = chain.modelsXYZ[0];
  chain.bonds = [];
  
  for (m1=0; m1<chain.molecules.length; m1++) {
    rC = 17;
    if (chain.molecules[m1].xna) {
      rC = 100; tmpArray = [];
      for (m2=0; m2<chain.molecules[m1].atoms.length; m2++) tmpArray.push(chain.molecules[m1].atoms[m2].atomName);
      if (! chain.molecules[m1].CA && tmpArray.indexOf("O5'") != -1) chain.molecules[m1].CA = chain.molecules[m1].atoms[[tmpArray.indexOf("O5'")]];
      if (tmpArray.indexOf("O2") != -1) {
        m2 = tmpArray.indexOf("N3");
        if (m2 != -1) chain.molecules[m1].outer = chain.molecules[m1].atoms[m2];
      }
      else {
        m2 = tmpArray.indexOf("N1");
        if (m2 != -1) chain.molecules[m1].outer = chain.molecules[m1].atoms[m2];
      }
    }
    for (m2=m1+1; m2<chain.molecules.length; m2++) {
      if (chain.molecules[m1].xna != chain.molecules[m2].xna) continue;
      if (chain.molecules[m1].C && chain.molecules[m2].N) {
        xyz1 = chain.molecules[m1].C.xyz;
        xyz2 = chain.molecules[m2].N.xyz;
        dx = xyzRef[xyz1]-xyzRef[xyz2]; dx *= dx;
        dy = xyzRef[xyz1+1]-xyzRef[xyz2+1]; dy *= dy;
        dz = xyzRef[xyz1+2]-xyzRef[xyz2+2]; dz *= dz;
        r = dx+dy+dz;

        if (r <= 3.0) {
          chain.molecules[m1].next = chain.molecules[m2]; 
          chain.molecules[m2].previous = chain.molecules[m1]; 
          chain.bonds.push([chain.molecules[m1].C, chain.molecules[m2].N, 1]); 
          break;
        }
        else if (chain.molecules[m2].C && chain.molecules[m1].N) { // for weird entries like 2n4n
          xyz1 = chain.molecules[m2].C.xyz;
          xyz2 = chain.molecules[m1].N.xyz;
          dx = xyzRef[xyz1]-xyzRef[xyz2]; dx *= dx;
          dy = xyzRef[xyz1+1]-xyzRef[xyz2+1]; dy *= dy;
          dz = xyzRef[xyz1+2]-xyzRef[xyz2+2]; dz *= dz;
          r = dx+dy+dz;

          if (r <= 3.0) {
            chain.molecules[m1].next = chain.molecules[m2];
            chain.molecules[m2].previous = chain.molecules[m1];
            chain.bonds.push([chain.molecules[m1].C, chain.molecules[m2].N, 1]);
            break;
          }
        }
      }
      else if (chain.molecules[m1].CA && chain.molecules[m2].CA && m2 == m1+1) { // only allow sequential
        xyz1 = chain.molecules[m1].CA.xyz;
        xyz2 = chain.molecules[m2].CA.xyz;
        dx = xyzRef[xyz1]-xyzRef[xyz2]; dx *= dx;
        dy = xyzRef[xyz1+1]-xyzRef[xyz2+1]; dy *= dy;
        dz = xyzRef[xyz1+2]-xyzRef[xyz2+2]; dz *= dz;
        r = dx+dy+dz;

        if (r <= rC) {
          chain.molecules[m1].next = chain.molecules[m2];
          chain.molecules[m2].previous = chain.molecules[m1]; 
          break;
        }
      }
    }
    // cyclic check...
    if (chain.molecules[0].N && chain.molecules[m1].C) {
      xyz1 = chain.molecules[0].N.xyz;
      xyz2 = chain.molecules[m1].C.xyz;
      dx = xyzRef[xyz1]-xyzRef[xyz2]; dx *= dx;
      dy = xyzRef[xyz1+1]-xyzRef[xyz2+1]; dy *= dy;
      dz = xyzRef[xyz1+2]-xyzRef[xyz2+2]; dz *= dz;
      r = dx+dy+dz;
      if (r <= 3.0) {
        chain.bonds.push([chain.molecules[0].N, chain.molecules[m1].C, 1]);
        chain.showBBatoms.push(chain.molecules[0].N);
        chain.showBBatoms.push(chain.molecules[m1].C);
        chain.isCyclic = true;
      }
    }
  }
};

molmil.viewer.prototype.buildSNFG = function(chain) {
  chain.SNFG = true;
  chain.branches = [];
  if (chain.bonds.length == 0 && chain.atoms.length > 1) return this.buildBondList(chain);
  
  for (var i=0; i<chain.bonds.length; i++) {
    if (chain.bonds[i][0].molecule != chain.bonds[i][1].molecule) {
      chain.bonds[i][0].molecule.weirdAA = chain.bonds[i][1].molecule.weirdAA = false;
      if (chain.bonds[i][0].molecule.CA) {
        chain.bonds[i][0].molecule.snfg_con = chain.bonds[i][1].molecule;
        chain.bonds[i][1].molecule.res_con = chain.bonds[i][0].molecule
      }
      else if (chain.bonds[i][1].molecule.CA) {
        chain.bonds[i][1].molecule.snfg_con = chain.bonds[i][0].molecule;
        chain.bonds[i][0].molecule.res_con = chain.bonds[i][1].molecule;
      }
      chain.branches.push([chain.bonds[i][0].molecule, chain.bonds[i][1].molecule]);
    }
  }
};

molmil.viewer.prototype.buildMolBondList = function(chain, rebuild) {
  var m1, m2, SG1, SG2;
  var dx, dy, dz, r, a1, a2, xyz1, xyz2, vdwR = molmil.configBox.vdwR;

  var x1, x2, y1, y2, z1, z2;

  if ((rebuild || chain.bonds.length == 0) && ! chain.SNFG) this.buildAminoChain(chain);
  
  // bonds
  var xyzRef = chain.modelsXYZ[0], ligand = false;
  
  if (chain.struct_conn && chain.struct_conn.length) {
    var a1, a2, snfg = true;
    for (m1=0; m1<chain.molecules.length; m1++) {
      if (! chain.molecules[m1].SNFG) snfg = false;
      molmil.buildBondsList4Molecule(chain.bonds, chain.molecules[m1], xyzRef);
    }
    for (m1=0; m1<chain.struct_conn.length; m1++) {
      
      chain.bonds.push(chain.struct_conn[m1]);
      a1 = chain.struct_conn[m1][0]; a2 = chain.struct_conn[m1][1];

      if (a1.molecule.SNFG && a2.molecule.SNFG) continue;
      if ((a1.molecule.next != a2.molecule && a1.molecule.previous != a2.molecule) || ! a1.molecule.CA || ! a2.molecule.CA || a1.molecule == a2.molecule) {
        chain.showBBatoms.push(chain.struct_conn[m1][0]);
        chain.showBBatoms.push(chain.struct_conn[m1][1]);
        if (chain.struct_conn[m1][0].molecule.CA) chain.showBBatoms.push(chain.struct_conn[m1][0].molecule.CA);
        if (chain.struct_conn[m1][1].molecule.CA) chain.showBBatoms.push(chain.struct_conn[m1][1].molecule.CA);
      }
    }
    if (snfg) this.buildSNFG(chain);
    return;
  }
  
  if (molmil.configBox.skipComplexBondSearch) return;

  var snfg = true;
  for (m1=0; m1<chain.molecules.length; m1++) {
    if (! chain.molecules[m1].SNFG) snfg = false;
    SG1 = chain.bonds.length;

    if (chain.molecules[m1].CA) {
      // cysteine bonds
      if (chain.molecules[m1].name == "CYS") { // this doesn't work in lazy mode...
        SG1 = molmil.getAtomFromMolecule(chain.molecules[m1], "SG");
        if (! SG1) continue;
        for (m2=m1+1; m2<chain.molecules.length; m2++) if (chain.molecules[m1].CA) {
          if (chain.molecules[m2].name != "CYS") continue;
          SG2 = molmil.getAtomFromMolecule(chain.molecules[m2], "SG");
          if (! SG2) continue;
          xyz1 = SG1.xyz; xyz2 = SG2.xyz;
          dx = xyzRef[xyz1]-xyzRef[xyz2]; dx *= dx;
          dy = xyzRef[xyz1+1]-xyzRef[xyz2+1]; dy *= dy;
          dz = xyzRef[xyz1+2]-xyzRef[xyz2+2]; dz *= dz;
          r = dx+dy+dz;
          if (r <= 5) {chain.bonds.push([SG1, SG2, 1]); SG1.molecule.weirdAA = SG2.molecule.weirdAA = true; break;}
        }
      }
    }
    else if (chain.molecules[m1].ligand && ! chain.molecules[m1].water && chain.molecules[m1].atoms.length > 1 && chain.molecules.length < 10) {
      var altchain, altxyzRef;
      for (c=0; c<chain.entry.chains.length; c++) { // for every chain
        altchain = chain.entry.chains[c];
        if (altchain == chain || altchain.ligand) continue;
        altxyzRef = altchain.modelsXYZ[0];
        for (a1=0; a1<chain.molecules[m1].atoms.length; a1++) { // for every atom in THIS chain
          xyz1 = chain.molecules[m1].atoms[a1].xyz;
          x1 = xyzRef[xyz1]; y1 = xyzRef[xyz1+1]; z1 = xyzRef[xyz1+2];
          
          for (m2=0; m2<altchain.molecules.length; m2++) { // for every residue in OTHER chains
            if (! altchain.molecules[m2].ligand && ! altchain.molecules[m2].CA) continue;
            if (altchain.molecules[m2].water || altchain.molecules[m2].atoms.length == 1) continue;
            if (altchain.molecules[m2].CA) {
              xyz2 = altchain.molecules[m2].CA.xyz;
              dx = x1-altxyzRef[xyz2]; dx *= dx;
              dy = y1-altxyzRef[xyz2+1]; dy *= dy;
              dz = z1-altxyzRef[xyz2+2]; dz *= dz;
              r = dx+dy+dz;
              if (r > 40) continue; // very unlikely that this residue is close enough to make a covalent bond...
            }
            for (a2=0; a2<altchain.molecules[m2].atoms.length; a2++) { // for every atom in OTHER chains
              xyz2 = altchain.molecules[m2].atoms[a2].xyz;
              dx = x1-altxyzRef[xyz2]; dx *= dx;
              dy = y1-altxyzRef[xyz2+1]; dy *= dy;
              dz = z1-altxyzRef[xyz2+2]; dz *= dz;
              r = dx+dy+dz;
              if (r > 6) continue; // unlikely that it'll create a covalent bond
              maxDistance = molmil.configBox.connect_cutoff;
              maxDistance += ((vdwR[chain.molecules[m1].atoms[a1].element] || 1.8) + (vdwR[altchain.molecules[m2].atoms[a2].element] || 1.8))*.5;
              if (chain.molecules[m1].atoms[a1].element == "H" || altchain.molecules[m2].atoms[a2].element == "H") maxDistance -= .2;
              maxDistance *= maxDistance;

              if (r <= maxDistance) chain.bonds.push([chain.molecules[m1].atoms[a1], altchain.molecules[m2].atoms[a2], 1]);
            }
          }
        }
      }
    
      for (m2=0; m2<chain.molecules.length; m2++) { // handle suger molecules...
        if (m2 < m1+1 && chain.molecules[m2].ligand) continue;
        for (a1=0; a1<chain.molecules[m1].atoms.length; a1++) {
          if (chain.molecules[m1].atoms[a1].element == "H" || chain.molecules[m1].atoms[a1].element == "D") continue
          xyz1 = chain.molecules[m1].atoms[a1].xyz;
          for (a2=0; a2<chain.molecules[m2].atoms.length; a2++) {
            if (chain.molecules[m2].atoms[a2].element == "H" || chain.molecules[m2].atoms[a2].element == "D") continue;
            xyz2 = chain.molecules[m2].atoms[a2].xyz;
            
            dx = xyzRef[xyz1]-xyzRef[xyz2]; dx *= dx;
            dy = xyzRef[xyz1+1]-xyzRef[xyz2+1]; dy *= dy;
            dz = xyzRef[xyz1+2]-xyzRef[xyz2+2]; dz *= dz;
            r = dx+dy+dz;

            maxDistance = molmil.configBox.connect_cutoff;
            maxDistance += ((vdwR[chain.molecules[m1].atoms[a1].element] || 1.8) + (vdwR[chain.molecules[m2].atoms[a2].element] || 1.8))*.5;
            maxDistance *= maxDistance;
            if (r <= maxDistance) chain.bonds.push([chain.molecules[m1].atoms[a1], chain.molecules[m2].atoms[a2], 1]);
          }
        }
      }
    }
  }
  
  if (snfg) this.buildSNFG(chain);
}


// ** builds list of bonds within a chain object **
molmil.viewer.prototype.buildBondList = function(chain, rebuild) {
  var m1;
  
  if ((rebuild || chain.bonds.length == 0) && ! chain.SNFG) this.buildAminoChain(chain);
  
  // bonds
  var xyzRef = chain.modelsXYZ[0], ligand = false;
  chain.bondsOK = true;
  
  if (chain.struct_conn && chain.struct_conn.length) return;

  for (m1=0; m1<chain.molecules.length; m1++) {
    molmil.buildBondsList4Molecule(chain.bonds, chain.molecules[m1], xyzRef);
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


molmil.viewer.prototype.load_obj = function(data, filename, settings) {
  return molmil.loadPlugin(molmil.settings.src+"plugins/loaders.js", this.load_obj, this, [data, filename, settings]);
};

molmil.viewer.prototype.load_ccp4 = function(buffer, filename, settings) {
  //if (! molmil.conditionalPluginLoad(molmil.settings.src+"plugins/loaders.js", this.load_ccp4, this, [buffer, filename, settings])) return;
  return molmil.loadPlugin(molmil.settings.src+"plugins/loaders.js", this.load_ccp4, this, [buffer, filename, settings]);
};

molmil.viewer.prototype.load_stl = function(buffer, filename, settings) {
  return molmil.loadPlugin(molmil.settings.src+"plugins/loaders.js", this.load_stl, this, [buffer, filename, settings]);
};
    

// ** loads MPBF data **
molmil.viewer.prototype.load_MPBF = function(buffer, filename, settings) {
  return molmil.loadPlugin(molmil.settings.src+"plugins/loaders.js", this.load_MPBF, this, [buffer, filename, settings]);
}

// ** loads XYZ data **

molmil.viewer.prototype.load_xyz = function(data, filename, settings) {
  return molmil.loadPlugin(molmil.settings.src+"plugins/loaders.js", this.load_xyz, this, [data, filename, settings]);
}

// ** loads MOL2 data **

molmil.viewer.prototype.load_mol2 = function(data, filename) {
  return molmil.loadPlugin(molmil.settings.src+"plugins/loaders.js", this.load_mol2, this, [data, filename]);
};

// ** loads MDL MOL data **
molmil.viewer.prototype.load_mdl = function(data, filename) {
  return molmil.loadPlugin(molmil.settings.src+"plugins/loaders.js", this.load_mdl, this, [data, filename]);
};

// ** loads GRO data **
molmil.viewer.prototype.load_GRO = function(data, filename) {
  return molmil.loadPlugin(molmil.settings.src+"plugins/loaders.js", this.load_GRO, this, [data, filename]);
};

// ** loads PDB data **
molmil.viewer.prototype.load_PDB = function(data, filename) {
  return molmil.loadPlugin(molmil.settings.src+"plugins/loaders.js", this.load_PDB, this, [data, filename]);
};

// ** loads MMTF data **
molmil.viewer.prototype.load_MMTF = function(data, filename) {
  return molmil.loadPlugin(molmil.settings.src+"plugins/loaders.js", this.load_MMTF, this, [data, filename]);
};

// ** save PDB data **
molmil.savePDB = function(soup, atomSelection, modelId, file) {
  return molmil.loadPlugin(molmil.settings.src+"plugins/savers.js", molmil.savePDB, null, [soup, atomSelection, modelId, file]);
};

// ** save mmJSON data **
molmil.saveJSO = function(soup, atomSelection, modelId, file) {
  return molmil.loadPlugin(molmil.settings.src+"plugins/savers.js", molmil.saveJSO, null, [soup, atomSelection, modelId, file]);
};

molmil.saveBU = function(assembly_id, options, struct, soup) {
  return molmil.loadPlugin(molmil.settings.src+"plugins/savers.js", molmil.saveBU, null, [assembly_id, options, struct, soup]);
};

// ** calculates the optimal zoom amount **
molmil.viewer.prototype.calcZ = function(geomRanges) {
  var test = geomRanges;
  geomRanges = geomRanges || this.geomRanges;
  //var mx = Math.max(Math.abs(geomRanges[0]), Math.abs(geomRanges[1]), Math.abs(geomRanges[2]), Math.abs(geomRanges[3]), Math.abs(geomRanges[4]), Math.abs(geomRanges[5]));
  var mx = Math.max(geomRanges[1]-geomRanges[0], geomRanges[3]-geomRanges[2], geomRanges[4]-geomRanges[5]);

  if (test) this.renderer.maxRange = (Math.max(Math.abs(geomRanges[1]-geomRanges[0]), Math.abs(geomRanges[3]-geomRanges[2]), Math.abs(geomRanges[5]-geomRanges[4]))*.5)-molmil.configBox.zNear-5;
  if (molmil.configBox.stereoMode) {
    if (molmil.configBox.stereoMode == 3) return -(mx*molmil.vrDisplay.depthFar/4500)-molmil.vrDisplay.depthNear-1;
    else return -(mx*molmil.configBox.zFar/9000)-molmil.configBox.zNear-1;
  }
  
  if (molmil.configBox.projectionMode == 1) {
    var zmove = ((mx/Math.sin(molmil.configBox.camera_fovy*(Math.PI/180)))*1.125), aspect = this.renderer.height/this.renderer.width;
    if (aspect > 1) zmove *= aspect;
    return -zmove - molmil.configBox.zNear - 2;
  }
  else if (molmil.configBox.projectionMode == 2) return -((mx/Math.min(this.renderer.width, this.renderer.height))*molmil.configBox.zFar*(.5))-molmil.configBox.zNear-1;
}

// ** loads polygon-JSON data **
molmil.viewer.prototype.load_polygonJSON = function(jso, filename, settings) { // this should be modified to use the modern renderer function instead
  return molmil.loadPlugin(molmil.settings.src+"plugins/loaders.js", this.load_polygonJSON, this, [jso, filename, settings]);
};

// ** loads polygon-XML data **
molmil.viewer.prototype.load_polygonXML = function(xml, filename, settings) {
  return molmil.loadPlugin(molmil.settings.src+"plugins/loaders.js", this.load_polygonXML, this, [xml, filename, settings]);
};

// ** loads mmcif data **
molmil.viewer.prototype.load_mmCIF = function(data, settings) {
  var jso = loadCIF(data);
  return this.load_PDBx(jso, settings);
};

// ** loads pdbml data **
molmil.viewer.prototype.load_PDBML = function(xml, settings) {
  if (typeof xml == "string") {
    var parser = new DOMParser();
    xml = parser.parseFromString(xml, "text/xml");
  }
  var jso = loadPDBML(xml);
  return this.load_PDBx(jso, settings);
};

// ** loads PDBx formatted data such as mmcif, pdbml and mmjson **
molmil.viewer.prototype.load_PDBx = function(mmjso, settings) { // this should be updated for the new model system
  var entries = Object.keys(mmjso), structs = [], offset, isHet;
  settings = settings || {};
  for (var e=0; e<entries.length; e++) {

    //var entryId = Object.keys(mmjso)[0].substr(5).split("-")[0];
    var entryId = entries[e].substr(5).split("-")[0];
    var pdb = mmjso[entries[e]];

    var atom_site = pdb.atom_site || pdb.chem_comp_atom || pdb.pdbx_chem_comp_model_atom || pdb.
ihm_starting_model_coord
 || null;
    
    if (! atom_site) continue;
    
    var isCC = ! pdb.hasOwnProperty("atom_site");

    var Cartn_x = atom_site.Cartn_x || (atom_site.pdbx_model_Cartn_x_ideal && atom_site.pdbx_model_Cartn_x_ideal[0] != null ? atom_site.pdbx_model_Cartn_x_ideal : atom_site.model_Cartn_x) || atom_site.model_Cartn_x; // x
    var Cartn_y = atom_site.Cartn_y || (atom_site.pdbx_model_Cartn_y_ideal && atom_site.pdbx_model_Cartn_x_ideal[0] != null ? atom_site.pdbx_model_Cartn_y_ideal : atom_site.model_Cartn_y) || atom_site.model_Cartn_y; // y
    var Cartn_z = atom_site.Cartn_z || (atom_site.pdbx_model_Cartn_z_ideal && atom_site.pdbx_model_Cartn_x_ideal[0] != null ? atom_site.pdbx_model_Cartn_z_ideal : atom_site.model_Cartn_z) || atom_site.model_Cartn_z; // z
    
    var id = atom_site.id; // aid
  
    var auth_seq_id = atom_site.auth_seq_id || []; // residue id
    var auth_comp_id = atom_site.auth_comp_id; // residue name
    var label_seq_id = atom_site.label_seq_id || []; // residue id
    var label_comp_id = atom_site.label_comp_id || atom_site.comp_id || atom_site.model_id || []; // residue name

    var label_asym_id = atom_site.label_asym_id || atom_site.auth_asym_id || []; // chain label
    var auth_asym_id = atom_site.auth_asym_id || label_asym_id; // chain name
  
    var label_alt_id = atom_site.label_alt_id || [];
  
    var auth_atom_id = atom_site.auth_atom_id || atom_site.atom_id || []; // atom name
    var label_atom_id = atom_site.label_atom_id || []; // atom name
    var type_symbol = atom_site.type_symbol || []; // Element
  
    var pdbx_PDB_model_num = atom_site.pdbx_PDB_model_num;
    var group_PDB = atom_site.group_PDB || [];
    var B_iso_or_equiv = atom_site.B_iso_or_equiv || [];
    var label_entity_id = atom_site.label_entity_id || [];
  
    var pdbx_PDB_ins_code = atom_site.pdbx_PDB_ins_code || [];
    var currentChain = null; var ccid = false; var currentMol = null; var cmid = false; var atom;

    var struc = null, Xpos, cmnum, Xpos_first = {}, isLigand, alt_loc_handler = null;
  
    var polyTypes = {}, ligands = {};
    try {for (var i=0; i<pdb.entity_poly_seq.mon_id.length; i++) polyTypes[pdb.entity_poly_seq.mon_id[i]] = false;}
    catch (e) {}
    //try {for (var i=0; i<pdb.chem_comp.id.length; i++) if (pdb.chem_comp.mon_nstd_flag[i]) polyTypes[pdb.chem_comp.id[i]] = true;}
    try {
      for (var i=0; i<pdb.chem_comp.id.length; i++) {
        if (pdb.chem_comp.mon_nstd_flag[i] || pdb.chem_comp.type[i].toLowerCase().indexOf("peptide") != -1) polyTypes[pdb.chem_comp.id[i]] = true;
        else if (pdb.chem_comp.type[i] == "non-polymer") ligands[pdb.chem_comp.id[i]] = true;
      }
      polyTypes.ACE = polyTypes.NME = true;
    }
    catch (e) {polyTypes = molmil.AATypes;}

    var branch_ids = {};
    if (pdb.pdbx_entity_branch) {for (var i=0; i<pdb.pdbx_entity_branch.entity_id.length; i++) branch_ids[pdb.pdbx_entity_branch.entity_id[i]] = true;}
    
    var baka = 0;
    for (var a=0; a<Cartn_x.length; a++) {
      if (Cartn_x[a] == null) continue;
      if (Cartn_x[a] == 0 && Cartn_y[a] == 0 && Cartn_z[a] == 0) {
        baka++;
        if (baka > 1) continue;
      }
    
      if ((pdbx_PDB_model_num && pdbx_PDB_model_num[a] != cmnum) || ! struc) {
        if (struc && ! molmil.configBox.loadModelsSeparately) break;
        this.structures.push(struc = new molmil.entryObject({id: entryId})); structs.push(struc);
        if (pdbx_PDB_model_num) struc.meta.modelnr = pdbx_PDB_model_num[a];
        cmnum = pdbx_PDB_model_num ? pdbx_PDB_model_num[a] : 0; ccid = cmid = false;
      }
      
      if ((label_asym_id && label_asym_id[a] != ccid) || ! currentChain) {
        this.chains.push(currentChain = new molmil.chainObject(label_asym_id[a] || "", struc)); struc.chains.push(currentChain);
        currentChain.authName = auth_asym_id[a]; // afterwards get rid of this and set chain.name to auth_asym_id[a]...
        currentChain.labelName = label_asym_id[a];
        currentChain.CID = this.CID++;
        ccid = label_asym_id[a]; currentMol = null;
        Xpos_first[currentChain] = currentChain.modelsXYZ[0].length;
        currentChain.entity_id = label_entity_id[a];
      }

      if ((label_seq_id[a] || auth_seq_id[a]) != cmid || ! currentMol || cmid == -1 || currentMol.name != (label_comp_id[a] || auth_comp_id[a])) {
        currentChain.molecules.push(currentMol = new molmil.molObject((label_comp_id[a] || auth_comp_id[a]), (label_seq_id[a] || auth_seq_id[a]), currentChain));
        currentMol.RSID = (auth_seq_id[a] || label_seq_id[a] || "")+(pdbx_PDB_ins_code[a] || "");
        currentMol.MID = this.MID++;
        cmid = (label_seq_id[a] || auth_seq_id[a]);
        if ((isCC || ! polyTypes.hasOwnProperty(currentMol.name)) && (currentMol.name == "HOH" || currentMol.name == "DOD" || currentMol.name == "WAT")) {currentMol.water = true; currentMol.ligand = false;}
        if (polyTypes.hasOwnProperty(currentMol.name) && polyTypes[currentMol.name] == false) currentMol.weirdAA = true;
        isLigand = isCC || ligands.hasOwnProperty(currentMol.name);
        if (currentMol.name in molmil.SNFG || label_entity_id[a] in branch_ids) currentMol.SNFG = true;
      }

      Xpos = currentChain.modelsXYZ[0].length;
      currentChain.modelsXYZ[0].push(Cartn_x[a], Cartn_y[a], Cartn_z[a]);

      currentMol.atoms.push(atom=new molmil.atomObject(Xpos, auth_atom_id[a] || label_atom_id[a] || "", type_symbol[a] || "", currentMol, currentChain));
      
      if (label_alt_id[a]) {
        if (alt_loc_handler == null) alt_loc_handler = label_alt_id[a];
        if (label_alt_id[a] != alt_loc_handler) atom.display = false;
      }
      
      if (! atom.element) {
        for (offset=0; offset<atom.atomName.length; offset++) if (! molmil_dep.isNumber(atom.atomName[offset])) break;
        if (atom.atomName.length > 1 && ! molmil_dep.isNumber(atom.atomName[1]) && atom.atomName[1] == atom.atomName[1].toLowerCase()) atom.element = atom.atomName.substring(offset, offset+2);
        else atom.element = atom.atomName.substring(offset, offset+1);
      }
      if (atom.element == "H") atom.display = this.showHydrogens;

      isHet = true;
      if (group_PDB.length) {if (group_PDB[a] != "HETATM" || polyTypes.hasOwnProperty(currentMol.name)) isHet = false;}
      else isHet = false;

      atom.label_alt_id = label_alt_id[a] || "";
      if (currentMol.water) currentChain.display = this.showWaters;
      if (atom.element == "H") atom.display = this.showHydrogens;
      else if (atom.display) {
        currentChain.isHet = false;
        if (atom.atomName == "N") {currentMol.N = atom; currentMol.ligand = isLigand;}
        else if (atom.atomName == "CA") {currentMol.CA = atom; currentMol.ligand = isLigand;}
        else if (atom.atomName == "C") {currentMol.C = atom; currentMol.ligand = isLigand;}
        else if (atom.atomName == "O") {currentMol.O = atom; currentMol.ligand = isLigand; currentMol.xna = false; }
        //do special stuff for dna/rna
        else if (! isHet && atom.atomName == "P" && ! (currentMol.N || currentMol.CA) && !molmil.configBox.xna_force_C1p) {currentMol.N = currentMol.CA = atom; currentMol.xna = true; currentMol.ligand = isLigand;}
        else if (! isHet && atom.atomName == "C1'" && ! (currentMol.N || currentMol.CA) && molmil.configBox.xna_force_C1p) {currentMol.CA = atom; currentMol.xna = true; currentMol.ligand = isLigand;}
        else if (! isHet && atom.atomName == "O3'" && ! (currentMol.C)) {currentMol.C = atom; currentMol.xna = true; currentMol.ligand = isLigand;}
      }
      else {
        currentChain.isHet = false;
        if (atom.atomName == "N") {currentMol.N = currentMol.N || atom; currentMol.ligand = isLigand;}
        else if (atom.atomName == "CA") {currentMol.CA = currentMol.CA || atom; currentMol.ligand = isLigand;}
        else if (atom.atomName == "C") {currentMol.C = currentMol.C || atom; currentMol.ligand = isLigand;}
        else if (atom.atomName == "O") {currentMol.O = currentMol.O || atom; currentMol.ligand = isLigand; currentMol.xna = false; }
        //do special stuff for dna/rna
        else if (! isHet && atom.atomName == "P" && ! (currentMol.N || currentMol.CA) && !molmil.configBox.xna_force_C1p) {currentMol.N = currentMol.CA = atom; currentMol.xna = true; currentMol.ligand = isLigand;}
        else if (! isHet && atom.atomName == "C1'" && ! (currentMol.N || currentMol.CA) && molmil.configBox.xna_force_C1p) {currentMol.CA = atom; currentMol.xna = true; currentMol.ligand = isLigand;}
        else if (! isHet && atom.atomName == "O3'" && ! (currentMol.C)) {currentMol.C = currentMol.C || atom; currentMol.xna = true; currentMol.ligand = isLigand;}
      }
      
      atom.Bfactor = B_iso_or_equiv[a] || 0.0;

      currentChain.atoms.push(atom);
      atom.AID = this.AID++;
      this.atomRef[atom.AID] = atom;
    }
    
    struc.meta.pdbid = entryId.toLowerCase();
    if (pdb.meta_pdbjplus) {
      currentChain.name = pdb.meta_pdbjplus.auth_asym_id;
      currentChain.authName = pdb.meta_pdbjplus.label_asym_id;
      struc.meta.pdbid = pdb.meta_pdbjplus.pdbid;
    }
    
    struc.structureTransform = null;
    if (pdb.hasOwnProperty("atom_sites")) {
      var scaleN = [pdb.atom_sites["fract_transf_matrix[1][1]"], pdb.atom_sites["fract_transf_matrix[1][2]"], pdb.atom_sites["fract_transf_matrix[1][3]"], pdb.atom_sites["fract_transf_matrix[2][1]"], pdb.atom_sites["fract_transf_matrix[2][2]"], pdb.atom_sites["fract_transf_matrix[2][3]"], pdb.atom_sites["fract_transf_matrix[3][1]"], pdb.atom_sites["fract_transf_matrix[3][2]"], pdb.atom_sites["fract_transf_matrix[3][3]"]];
      
      var badY = false, badZ = false, unit, vec;
      //console.log(scaleN);
      if (scaleN[3] != 0 || scaleN[5] != 0) {
        //badY = true;
        unit = [0, 1, 0];
        vec = [scaleN[3], scaleN[4], scaleN[5]];
        //console.log(vec); ///////////////
      }
      else if (scaleN[6] != 0 || scaleN[7] != 0) {
        badZ = true;
        unit = [0, 0, 1];
        vec = [scaleN[6], scaleN[7], scaleN[8]];
      }
      
      // 4xxd: badY
      // 1gof: badZ
      
      if (badY || badZ) { // deal with badly oriented structures
        var uvw, rcos, rsin, R;
        vec3.normalize(vec, vec);
         
        uvw = vec3.cross([0, 0, 0], vec, unit);
        rcos = vec3.dot(vec, unit);
        rsin = vec3.length(uvw);
        if (Math.abs(rsin) > 1e-6) {uvw[0] /= rsin; uvw[1] /= rsin; uvw[2] /= rsin;}

        R = mat3.create();
        mat3.multiplyScalar(R, R, rcos);

        R[0] += 0;
        R[1] += -uvw[2] * rsin;
        R[2] += uvw[1] * rsin;
        R[3] += uvw[2] * rsin;
        R[4] += 0;
        R[5] += -uvw[0] * rsin;
        R[6] += -uvw[1] * rsin;
        R[7] += uvw[0] * rsin;
        R[8] += 0;
        
        R[0] += uvw[0]*uvw[0]*(1-rcos);
        R[1] += uvw[1]*uvw[0]*(1-rcos);
        R[2] += uvw[2]*uvw[0]*(1-rcos);
        R[3] += uvw[0]*uvw[1]*(1-rcos);
        R[4] += uvw[1]*uvw[1]*(1-rcos);
        R[5] += uvw[2]*uvw[1]*(1-rcos);
        R[6] += uvw[0]*uvw[2]*(1-rcos);
        R[7] += uvw[1]*uvw[2]*(1-rcos);
        R[8] += uvw[2]*uvw[2]*(1-rcos);
        
        mat3.transpose(R, R);
        struc.structureTransform = R;

        var temp = [0, 0, 0], c, i;
        for (c=0; c<struc.chains.length; c++) {
          currentChain = struc.chains[c];
          for (i=0; i<currentChain.modelsXYZ[0].length; i+=3) {
            temp[0] = currentChain.modelsXYZ[0][i]; temp[1] = currentChain.modelsXYZ[0][i+1]; temp[2] = currentChain.modelsXYZ[0][i+2];
            vec3.transformMat3(temp, temp, R);
            currentChain.modelsXYZ[0][i] = temp[0]; currentChain.modelsXYZ[0][i+1] = temp[1]; currentChain.modelsXYZ[0][i+2] = temp[2];
          }
        }
      }
     
      // deal with fract_transf_vector[1] somehow 
    }
    
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
  
    for (var s=0; s<structs.length; s++) {
      
      struc = structs[s];
      
      // loop over all residues and set showSC to true if a weird residue...
      for (var c=0, m, mol; c<struc.chains.length; c++) {
        for (m=0; m<struc.chains[c].molecules.length; m++) {
          mol = struc.chains[c].molecules[m];
          if (! mol.ligand && ! mol.water && ! mol.xna && ! molmil.AATypesBase.hasOwnProperty(mol.name)) mol.weirdAA = true;
        }
      }
  
      var struct_conn = pdb.struct_conn || {id: []}, a1, a2;
      
      if (struct_conn.id.length) {
        var backboneAtoms = molmil.configBox.backboneAtoms4Display;
        for (c=0; c<struc.chains.length; c++) struc.chains[c].struct_conn = [];
        for (var i=0, c; i<struct_conn.id.length; i++) {
          if (struct_conn.conn_type_id && (struct_conn.conn_type_id[i] == "hydrog" || struct_conn.conn_type_id[i] == "metalc" )) continue;
          if ((struct_conn.ptnr1_symmetry && struct_conn.ptnr1_symmetry[i] != "1_555") || (struct_conn.ptnr2_symmetry && struct_conn.ptnr2_symmetry[i] != "1_555")) continue;
          a1 = molmil.searchAtom(struc, struct_conn.ptnr1_label_asym_id[i], struct_conn.ptnr1_auth_seq_id[i], struct_conn.ptnr1_label_atom_id[i]);
          if (! a1) continue;
          a2 = molmil.searchAtom(struc, struct_conn.ptnr2_label_asym_id[i], struct_conn.ptnr2_auth_seq_id[i], struct_conn.ptnr2_label_atom_id[i]);
          if (! a2) continue;
          a1.chain.struct_conn.push([a1, a2, 1]); 
          if (a1.chain != a2.chain) a2.chain.struct_conn.push([a2, a1, 1]);
          if (a1.molecule.ligand || ! backboneAtoms.hasOwnProperty(a1.atomName)) a1.molecule.weirdAA = true;
          if (a2.molecule.ligand || ! backboneAtoms.hasOwnProperty(a2.atomName)) a2.molecule.weirdAA = true;
        }
      }

      var cb = pdb.chem_comp_bond || pdb.pdbx_chem_comp_model_bond || {comp_id: []}, cbMat = {};
      for (var i=0; i<cb.comp_id.length; i++) {
        if (! (cb.comp_id[i] in cbMat)) cbMat[cb.comp_id[i]] = {};
        cbMat[cb.comp_id[i]][cb.atom_id_1[i]+"_"+cb.atom_id_2[i]] = cbMat[cb.comp_id[i]][cb.atom_id_2[i]+"_"+cb.atom_id_1[i]] = cb.value_order[i].toLowerCase() == "doub" ? 2 : 1;
      }
      struc.cbMat = cbMat;
      
      for (var i=0; i<struc.chains.length; i++ ) {
        if (! struc.chains[i].isHet && struc.chains[i].molecules.length == 1) {
          struc.chains[i].isHet = true;
          struc.chains[i].molecules[0].ligand = true;
        }
        this.buildMolBondList(struc.chains[i]);
        var chain = struc.chains[i];
        chain.molWeight = 0.0;
        for (a=0; a<chain.atoms.length; a++) chain.molWeight += molmil.configBox.MW[chain.atoms[a].element] || 0;
      }
  
      //var conf_type_id, beg_auth_asym_id, beg_auth_seq_id, end_auth_asym_id, end_auth_seq_id, start, end;
      var conf_type_id, beg_label_asym_id, beg_label_seq_id, end_label_asym_id, end_label_seq_id, start, end;
  
      var struct_set = false;
  
      // add a check here to make sure it's not adding CRAP
      var struct_conf = pdb.struct_conf;
      if (struct_conf && Cartn_x.length) {
        for (var i=0, m; i<struct_conf.id.length; i++) {
          conf_type_id = struct_conf.conf_type_id[i];
          if (conf_type_id == "HELX_P") conf_type_id = 3;
          //else if (conf_type_id == "TURN_P") conf_type_id = 4;
          else continue;
          beg_label_asym_id = struct_conf.beg_label_asym_id[i];
          beg_label_seq_id = struct_conf.beg_label_seq_id[i];
          end_label_asym_id = struct_conf.end_label_asym_id[i];
          end_label_seq_id = struct_conf.end_label_seq_id[i];
          //if (end_label_seq_id-beg_label_seq_id < 3) conf_type_id = 4;

          start = this.getMolObject4Chain(this.getChain(struc, beg_label_asym_id), beg_label_seq_id);
          end = this.getMolObject4Chain(this.getChain(struc, end_label_asym_id), end_label_seq_id);
          if (start == end) continue;
          while (end) {
            if (start == null) break;
            start.sndStruc = conf_type_id;
            if (start == end) break;
            start = start.next;
          }
          struct_set = true;
        }
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
          if (start == end) continue;
          while (end) {
            if (start == null) break;
            start.sndStruc = 2;
            if (start == end) break;
            start = start.next;
          }
          struct_set = true;
        }
      }

      if (! struct_set) {for (c=0; c<struc.chains.length; c++) this.ssAssign(struc.chains[c]);}
  
      molmil.resetColors(struc, this);
      
    }
    
    var poly;
    if (pdb.hasOwnProperty("entity_poly")) {
      poly = pdb.entity_poly.entity_id;
      for (var i=0; i<pdb.struct_asym.id.length; i++) {if (poly.indexOf(pdb.struct_asym.entity_id[i]) != -1) this.poly_asym_ids.push(pdb.struct_asym.id[i]);}
    }

    var pdbx_struct_oper_list = pdb.pdbx_struct_oper_list;
    if (pdbx_struct_oper_list) {
      var i, length = pdbx_struct_oper_list.type.length;
      var xmode = ! pdbx_struct_oper_list.hasOwnProperty("matrix[1][1]"), mat;
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
             mat[12] == 0 && mat[13] == 0 && mat[14] == 0 && mat[15] == 1    ) struc.BUmatrices[pdbx_struct_oper_list.id[i]] = ["identity operation", mat];
        else struc.BUmatrices[pdbx_struct_oper_list.id[i]] = [pdbx_struct_oper_list.type[i], mat];
      
        //struc.BUmatrices[pdbx_struct_oper_list.id[i]] = [pdbx_struct_oper_list.type[i], mat];
      }
      
      this.AisB = (! pdbx_struct_oper_list || ! pdb.pdbx_struct_assembly || (pdbx_struct_oper_list.id.length == 1 && pdb.pdbx_struct_assembly.id == 1));
    
      var pdbx_struct_assembly_gen = pdb.pdbx_struct_assembly_gen, tmp1, tmp2, tmp3=mat4.create(), j, k, mats;
      try {length = pdbx_struct_assembly_gen.assembly_id.length;} catch (e) {length = 0;}
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
        if (! struc.BUassemblies.hasOwnProperty(pdbx_struct_assembly_gen.assembly_id[i])) struc.BUassemblies[pdbx_struct_assembly_gen.assembly_id[i]] = [];
        mats = [];
        if (pdbx_struct_assembly_gen.oper_expression[i].indexOf(")(") != -1) {
          tmp1 = pdbx_struct_assembly_gen.oper_expression[i].split(")(");
          tmp1[0] = xpnd(tmp1[0].substr(1));
          tmp1[1] = xpnd(tmp1[1].substr(0, tmp1[1].length-1));
          // build new matrices
          for (j=0; j<tmp1[0].length; j++) {
            for (k=0; k<tmp1[1].length; k++) {
              poly = tmp1[0][j]+"-"+tmp1[1][k];
              if (! struc.BUmatrices.hasOwnProperty(poly)) {
                mat4.multiply(tmp3, struc.BUmatrices[tmp1[0][j]][1], struc.BUmatrices[tmp1[1][k]][1]);
                if ( tmp3[ 0] == 1 && tmp3[ 1] == 0 && tmp3[ 2] == 0 && tmp3[ 3] == 0 && 
                     tmp3[ 4] == 0 && tmp3[ 5] == 1 && tmp3[ 6] == 0 && tmp3[ 7] == 0 &&
                     tmp3[ 8] == 0 && tmp3[ 9] == 0 && tmp3[10] == 1 && tmp3[11] == 0 && 
                     tmp3[12] == 0 && tmp3[13] == 0 && tmp3[14] == 0 && tmp3[15] == 1    ) struc.BUmatrices[poly] = ["identity operation", tmp3];
                else struc.BUmatrices[poly] = ["combined", mat4.clone(tmp3)];
              }
              mats.push(poly);
            }
          }
        }
        else {
          mats = xpnd(pdbx_struct_assembly_gen.oper_expression[i]);
        }
        struc.BUassemblies[pdbx_struct_assembly_gen.assembly_id[i]].push([mats, pdbx_struct_assembly_gen.asym_id_list[i].split(",")]);
      }
    }
    
    this.pdbxData = pdb;
    struc.meta.pdbxData = pdb;
    if (! settings.skipDeleteJSO) delete pdb.atom_site;
  }
  
  

  return structs;
};

// ** calculates the center of gravity of a system **
molmil.viewer.prototype.calculateCOG = function(atomList) {
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
  var poss = [], ALTs = [];
  
  this.geomRanges = [0, 0, 0, 0, 0, 0];
  var struct, chain, s, c, m, a, xyz, modelId = this.renderer.modelId;
  
  //molmil.polygonObject
  
  if (atomList) {
    for (a=0; a<atomList.length; a++) {
      Xpos = atomList[a].xyz;
      xyzRef = atomList[a].chain.modelsXYZ[modelId];
      xyz = [xyzRef[Xpos], xyzRef[Xpos+1], xyzRef[Xpos+2]];
      this.avgX += xyz[0];
      this.avgY += xyz[1];
      this.avgZ += xyz[2];
      poss.push(xyz);
      n++;
    }
  }
  else {
    for (s=0; s<this.structures.length; s++) {
      struct = this.structures[s];
      if (struct instanceof molmil.entryObject) {
        for (c=0; c<struct.chains.length; c++) {
          chain = struct.chains[c];
          xyzRef = chain.modelsXYZ[modelId];
          if (xyzRef === undefined) continue;
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
                n++;
              }
            }
          } 
        }
      }
      else if (struct instanceof molmil.polygonObject && struct.meta.COR) {
        this.avgX += struct.meta.COR[0];
        this.avgY += struct.meta.COR[1];
        this.avgZ += struct.meta.COR[2];
        n += struct.meta.COR[3];
        if (struct.meta.hasOwnProperty("geomRanges")) ALTs.push(struct.meta.geomRanges, struct.meta.COR[3]);
      }
      else if (struct.structures) {
        for (var i=0; i<struct.structures.length; i++) {
          this.avgX += struct.structures[i].meta.COR[0];
          this.avgY += struct.structures[i].meta.COR[1];
          this.avgZ += struct.structures[i].meta.COR[2];
          n += struct.structures[i].meta.COR[3];
          if (struct.structures[i].meta.hasOwnProperty("geomRanges")) ALTs.push(struct.structures[i].meta.geomRanges, struct.structures[i].meta.COR[3]);
        }
      }
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
  return molmil.loadPlugin(molmil.settings.src+"plugins/loaders.js", this.ssAssign, this, [chainObj]);
};

// ** center of rotation manipulation **

molmil.viewer.prototype.setCOR=function(selection) {
  var modelId = this.renderer.modelId;
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

molmil.viewer.prototype.hideCell=function() {
  this.renderer.removeProgramByName("molmil.Cell");
};

molmil.viewer.prototype.showCell=function() {
  this.hideCell();
  for (var i=0; i<this.structures.length; i++) {
    if (this.structures[i].meta.cellLengths) { // for now, just support a simple box...
      var cell = this.structures[i].meta.cellLengths;
      var objects = [];
     
      var POSs = [
        [0.0, 0.0, 0.0],
        [cell[0], 0.0, 0.0],
        [0.0, cell[1], 0.0],
        [0.0, 0.0, cell[2]],
        [cell[0], cell[1], 0.0],
        [cell[0], 0.0, cell[2]],
        [0.0, cell[1], cell[2]],
        [cell[0], cell[1], cell[2]]
      ];
     
     
      objects.push({type: "sphere", coords: [POSs[0]], rgba:[0, 0, 0, 255], radius: 0.15});
      objects.push({type: "sphere", coords: [POSs[1]], rgba:[0, 0, 0, 255], radius: 0.15});
      objects.push({type: "sphere", coords: [POSs[2]], rgba:[0, 0, 0, 255], radius: 0.15});
      objects.push({type: "sphere", coords: [POSs[3]], rgba:[0, 0, 0, 255], radius: 0.15});
     
      objects.push({type: "sphere", coords: [POSs[4]], rgba:[0, 0, 0, 255], radius: 0.15});
      objects.push({type: "sphere", coords: [POSs[5]], rgba:[0, 0, 0, 255], radius: 0.15});
      objects.push({type: "sphere", coords: [POSs[6]], rgba:[0, 0, 0, 255], radius: 0.15});
      objects.push({type: "sphere", coords: [POSs[7]], rgba:[0, 0, 0, 255], radius: 0.15});
     
      objects.push({type: "cylinder", coords: [POSs[0], POSs[1]], rgba: [0, 0, 0, 255], radius: 0.15});
      objects.push({type: "cylinder", coords: [POSs[0], POSs[2]], rgba: [0, 0, 0, 255], radius: 0.15});
      objects.push({type: "cylinder", coords: [POSs[3], POSs[0]], rgba: [0, 0, 0, 255], radius: 0.15});
     
      objects.push({type: "cylinder", coords: [POSs[7], POSs[4]], rgba: [0, 0, 0, 255], radius: 0.15});
      objects.push({type: "cylinder", coords: [POSs[5], POSs[7]], rgba: [0, 0, 0, 255], radius: 0.15});
      objects.push({type: "cylinder", coords: [POSs[6], POSs[7]], rgba: [0, 0, 0, 255], radius: 0.15});
     
      objects.push({type: "cylinder", coords: [POSs[1], POSs[4]], rgba: [0, 0, 0, 255], radius: 0.15});
      objects.push({type: "cylinder", coords: [POSs[5], POSs[1]], rgba: [0, 0, 0, 255], radius: 0.15});
     
      objects.push({type: "cylinder", coords: [POSs[2], POSs[4]], rgba: [0, 0, 0, 255], radius: 0.15});
      objects.push({type: "cylinder", coords: [POSs[6], POSs[2]], rgba: [0, 0, 0, 255], radius: 0.15});
     
      objects.push({type: "cylinder", coords: [POSs[3], POSs[5]], rgba: [0, 0, 0, 255], radius: 0.15});
      objects.push({type: "cylinder", coords: [POSs[3], POSs[6]], rgba: [0, 0, 0, 255], radius: 0.15});
      
      return molmil.geometry.generator(objects, this, "molmil.Cell", {solid: true});
      
    }
  }
  
}

// geometry functions

// ** generates a PLY file **
molmil.exportPLY = function(soup, file) {
  return molmil.loadPlugin(molmil.settings.src+"plugins/savers.js", this.exportPLY, this, [soup, file]);
};

molmil.exportMPBF = function(soup) {
  return molmil.loadPlugin(molmil.settings.src+"plugins/savers.js", this.exportMPBF, this, [soup]);
};

// ** generates an STL file **
molmil.exportSTL = function(soup) {
  return molmil.loadPlugin(molmil.settings.src+"plugins/savers.js", this.exportSTL, this, [soup]);
};

// ** geometry object, used to generate protein geometry; atoms, bonds, loops, helices, sheets **

molmil.geometry = {
  templates: {sphere: {base: {}}, cylinder: [], dome: {}},
  detail_lvs: 5,
  dome: [0, 0, -1],
  radius: .25,
  sheetHeight: .125,
  skipClearBuffer: false,
  onGenerate: null
};

molmil.geometry.generator = function(objects, soup, name, programOptions) {
  return molmil.loadPlugin(molmil.settings.src+"plugins/misc.js", this.generator, this, [objects, soup, name, programOptions]);
}

molmil.buCheck = function(assembly_id, displayMode, colorMode, struct, soup) {
  return molmil.loadPlugin(molmil.settings.src+"plugins/misc.js", this.buCheck, this, [assembly_id, displayMode, colorMode, struct, soup]); 
}

molmil.geometry.getSphere = function(r, detail_lv) {
  if (detail_lv > 6) detail_lv = 6;
  if (r in this.templates.sphere && detail_lv in this.templates.sphere[r]) return this.templates.sphere[r][detail_lv];
  else return this.generateSphere(r, detail_lv);
  // pull a sphere from the this.templates.sphere object if it exists for the given radius
}

molmil.geometry.getCylinder = function(detail_lv) {
  return this.templates.cylinder[detail_lv] || molmil.geometry.generateCylinder(detail_lv)[detail_lv];
}

molmil.geometry.generateCylinder = function(detail_lv) {
  // generates a cylinder with length 0.5
  // afterwards apply a transformation matrix ()
  // 5
  // 10
  // 20
  // 40
  
  var nop, rad, theta, p, x, y, z, dij, that = this;
  var DO = function(lod) {
    nop = (lod+1)*4;
    theta = 0.0;
    rad = 2.0/nop;
    that.templates.cylinder.push({vertices: [], normals: [], indices: []});
    for (p=0; p<nop; p++) {
      x = Math.cos(theta*Math.PI);
      y = Math.sin(theta*Math.PI);
      that.templates.cylinder[lod].vertices.push(x, y, .0);
      that.templates.cylinder[lod].vertices.push(x, y, .5);
      dij = Math.sqrt(x*x + y*y);
      that.templates.cylinder[lod].normals.push(x/dij, y/dij, .0);
      that.templates.cylinder[lod].normals.push(x/dij, y/dij, .0);
      theta += rad;
    }
    
    for (p=0; p<(nop-1)*2; p+=2) {
      that.templates.cylinder[lod].indices.push(p, p+2, p+3);
      that.templates.cylinder[lod].indices.push(p+3, p+1, p);
    }
    that.templates.cylinder[lod].indices.push(p, 0, 1);
    that.templates.cylinder[lod].indices.push(1, p+1, p);
  }
  if (detail_lv) DO(detail_lv);
  else {for (var lod=0; lod<this.detail_lvs; lod++) DO(lod);}
  return this.templates.cylinder;
}; molmil.geometry.generateCylinder();

molmil.geometry.generateSphere = function(r, detail_lv) {
  this.templates.sphere[r] = {};
  var i, nfo, sphere;
  if (! this.templates.sphere.base[detail_lv]) sphere = this.templates.sphere.base[detail_lv] = molmil.octaSphereBuilder(detail_lv);
  else sphere = this.templates.sphere.base[detail_lv];
  nfo = {vertices: [], normals: [], indices: []};
  for (i=0; i<sphere.vertices.length; i++) nfo.vertices.push(sphere.vertices[i][0]*r, sphere.vertices[i][1]*r, sphere.vertices[i][2]*r);
  for (i=0; i<sphere.faces.length; i++) nfo.indices.push(sphere.faces[i][0], sphere.faces[i][1], sphere.faces[i][2]);
  for (i=0; i<sphere.vertices.length; i++) nfo.normals.push(sphere.vertices[i][0], sphere.vertices[i][1], sphere.vertices[i][2]);
  this.templates.sphere[r][detail_lv] = nfo;
  return nfo;
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
  
  if (molmil.configBox.EXT_frag_depth && molmil.configBox.imposterSpheres) this.generateAtomsImposters();
  else this.generateAtoms();
  this.generateBonds();
  this.generateWireframe();
  this.generateCartoon();
  this.generateSNFG();
  //this.generateRockets();
  
  this.generateSurfaces(cchains, render.soup);

  this.registerPrograms(render);
  
  if (! this.skipClearBuffer) this.reset();
  if (this.onGenerate) molmil_dep.asyncStart(this.onGenerate[0], this.onGenerate[1], this.onGenerate[2], 0);
};

molmil.geometry.build_simple_render_program = function(vertices_, indices_, renderer, settings) {
  settings = settings || {};
  if (settings.hasOwnProperty("setBuffers")) {
    var program = settings;
    settings = program.settings;
  }
  else {
    var program = {}; program.settings = settings;
  }
  
  program.renderer = renderer;
  
  //settings.solid = false;

  program.setBuffers = function(vertices, indices) {
    var vbuffer = this.renderer.gl.createBuffer();
    this.renderer.gl.bindBuffer(this.renderer.gl.ARRAY_BUFFER, vbuffer);
    this.renderer.gl.bufferData(this.renderer.gl.ARRAY_BUFFER, vertices, this.renderer.gl.STATIC_DRAW);
  
    var ibuffer = this.renderer.gl.createBuffer();
    this.renderer.gl.bindBuffer(this.renderer.gl.ELEMENT_ARRAY_BUFFER, ibuffer);
    this.renderer.gl.bufferData(this.renderer.gl.ELEMENT_ARRAY_BUFFER, indices, this.renderer.gl.STATIC_DRAW);
    this.size = [vertices.length, indices.length];
    
    this.nElements = indices.length;
    this.vertexBuffer = vbuffer;
    this.indexBuffer = ibuffer;

    if (molmil.geometry.skipClearBuffer || settings.storeVertices) {
      this.data = {vertices: vertices, indices: indices, vertexSize: 7};
    }
    
  };
  if (vertices_ && indices_) program.setBuffers(vertices_, indices_);
  
  program.toggleWF = function() {
    if (this.settings.solid) {
      if (this.settings.wireframeIdxs) {
        var ibuffer = this.renderer.gl.createBuffer();
        this.renderer.gl.bindBuffer(this.renderer.gl.ELEMENT_ARRAY_BUFFER, ibuffer);
        this.renderer.gl.bufferData(this.renderer.gl.ELEMENT_ARRAY_BUFFER, this.settings.wireframeIdxs, this.renderer.gl.STATIC_DRAW);
        this.indexBuffer = ibuffer;
        this.nElements = this.settings.wireframeIdxs.length;
      }
      this.settings.solid = false;
    }
    else {
      if (this.settings.triangleIdxs) {
        var ibuffer = this.renderer.gl.createBuffer();
        this.renderer.gl.bindBuffer(this.renderer.gl.ELEMENT_ARRAY_BUFFER, ibuffer);
        this.renderer.gl.bufferData(this.renderer.gl.ELEMENT_ARRAY_BUFFER, this.settings.triangleIdxs, this.renderer.gl.STATIC_DRAW);
        this.indexBuffer = ibuffer;
        this.nElements = this.settings.triangleIdxs.length;
      }
      this.settings.solid = true;
    }
    if (this.rebuild) this.rebuild();
  };
  
  if (! settings.solid && ! settings.lines_render && ! program.rebuild) {settings.solid = true; program.toggleWF();}
  
  program.rebuild = function(resetBuffers) {
    if (resetBuffers) molmil.geometry.build_simple_render_program(vertices_, indices_, this.renderer, this);
    else molmil.geometry.build_simple_render_program(null, null, this.renderer, this);
  };
  
  program.angle = renderer.angle;
  
  program.point_shader = renderer.shaders.points;
  if (program.point_shader) program.point_attributes = program.point_shader.attributes;

  if (settings.uniform_color || settings.rgba) {
    if (settings.alphaSet) {
      program.pre_shader = renderer.shaders.alpha_dummy;
      program.standard_shader = renderer.shaders.standard_alphaSet_uniform_color;
    }
    else program.standard_shader = renderer.shaders.standard_uniform_color;
    program.wireframe_shader = renderer.shaders.lines_uniform_color;
    program.point_shader = renderer.shaders.points_uniform_color;
  }
  else {
    if ("alphaMode" in settings) {
      program.pre_shader = renderer.shaders.alpha_dummy;
      program.standard_shader = renderer.shaders.standard_alpha;
      program.standard_shader_opaque = renderer.shaders.standard_shader_opaque;
      program.standard_shader_transparent = renderer.shaders.standard_shader_transparent;
    }
    else if ("alphaSet" in settings) {
      program.pre_shader = renderer.shaders.alpha_dummy;
      program.standard_shader = renderer.shaders.standard_alphaSet;
    }
    else if ("slab" in settings) {
      if (settings.slabColor) program.standard_shader = renderer.shaders.standard_slabColor;
      else program.standard_shader = renderer.shaders.standard_slab;
    }
    else program.standard_shader = renderer.shaders.standard;
    
    program.wireframe_shader = renderer.shaders.lines;
    program.point_shader = renderer.shaders.points;
  }

  program.standard_attributes = program.standard_shader.attributes;
  if (program.pre_shader) program.pre_attributes = program.pre_shader.attributes;
  program.wireframe_attributes = program.wireframe_shader.attributes;
  
  //program.point_attributes = program.point_shader.attributes;
      
  program.status = true; 
  
  program.point_render = function(modelViewMatrix, COR, i) {
    if (! this.status) return;
    
    this.renderer.gl.activeTexture(this.renderer.gl.TEXTURE0);
    this.renderer.gl.bindTexture(this.renderer.gl.TEXTURE_2D, renderer.textures.atom_imposter);
    
    var normalMatrix = mat3.create();
    this.renderer.gl.useProgram(this.point_shader.program);
    this.renderer.gl.uniformMatrix4fv(this.point_shader.uniforms.modelViewMatrix, false, modelViewMatrix);
    this.renderer.gl.uniformMatrix4fv(this.point_shader.uniforms.projectionMatrix, false, this.renderer.projectionMatrix);
    this.renderer.gl.uniform3f(this.point_shader.uniforms.COR, COR[0], COR[1], COR[2]);
    this.renderer.gl.uniform1f(this.point_shader.uniforms.focus, this.renderer.fogStart);
    this.renderer.gl.uniform1f(this.point_shader.uniforms.fogSpan, this.renderer.fogSpan);
    
    this.renderer.gl.uniform1f(this.point_shader.uniforms.zFar, molmil.configBox.zFar);
    this.renderer.gl.uniform1f(this.point_shader.uniforms.zNear, molmil.configBox.zNear);    
    this.renderer.gl.uniform1i(this.point_shader.uniforms.textureMap, 0);
    
    this.renderer.gl.uniform1f(this.point_shader.uniforms.zInvDiff, 1./((1./molmil.configBox.zFar) - (1./molmil.configBox.zNear)));
    this.renderer.gl.uniform1f(this.point_shader.uniforms.zNearInv, 1./molmil.configBox.zNear); 
    
    
    this.renderer.gl.enable(this.renderer.gl.DEPTH_TEST);
    
    if (this.settings.rgba) this.renderer.gl.uniform3f(this.point_shader.uniforms.uniform_color, this.settings.rgba[0]/255, this.settings.rgba[1]/255, this.settings.rgba[2]/255);
    else if (this.settings.uniform_color) this.renderer.gl.uniform3f(this.point_shader.uniforms.uniform_color, this.uniform_color[i][0]/255, this.uniform_color[i][1]/255, this.uniform_color[i][2]/255);
    
    if (this.renderer.settings.slab) {
      this.renderer.gl.uniform1f(this.point_shader.uniforms.slabNear, -modelViewMatrix[14]+this.renderer.settings.slabNear-molmil.configBox.zNear);
      this.renderer.gl.uniform1f(this.point_shader.uniforms.slabFar, -modelViewMatrix[14]+this.renderer.settings.slabFar-molmil.configBox.zNear);
    }
    
    if (molmil.configBox.fogColor) this.renderer.gl.uniform4f(this.point_shader.uniforms.backgroundColor, molmil.configBox.fogColor[0], molmil.configBox.fogColor[1], molmil.configBox.fogColor[2], 1.0);
    else this.renderer.gl.uniform4f(this.point_shader.uniforms.backgroundColor, molmil.configBox.BGCOLOR[0], molmil.configBox.BGCOLOR[1], molmil.configBox.BGCOLOR[2], 1.0);
  
    this.renderer.gl.bindBuffer(this.renderer.gl.ARRAY_BUFFER, this.vertexBuffer);
    
    molmil.resetAttributes(this.renderer.gl);

    if (this.settings.has_ID) {
      molmil.bindAttribute(this.renderer.gl, this.point_attributes.in_Position, 3, this.renderer.gl.FLOAT, false, 28, 0);
      molmil.bindAttribute(this.renderer.gl, this.point_attributes.in_radius, 1, this.renderer.gl.FLOAT, false, 28, 12);
      if (! this.settings.uniform_color && ! this.settings.rgba) molmil.bindAttribute(this.renderer.gl, this.point_attributes.in_Colour, 4, this.renderer.gl.UNSIGNED_BYTE, true, 28, 16);
      molmil.bindAttribute(this.renderer.gl, this.point_attributes.in_ScreenSpaceOffset, 2, this.renderer.gl.SHORT, false, 28, 20);
      //molmil.bindAttribute(this.renderer.gl, this.point_attributes.in_ID, 1, this.renderer.gl.FLOAT, false, 28, 24);
    }
    else {
      molmil.bindAttribute(this.renderer.gl, this.point_attributes.in_Position, 3, this.renderer.gl.FLOAT, false, 24, 0);
      molmil.bindAttribute(this.renderer.gl, this.point_attributes.in_radius, 1, this.renderer.gl.FLOAT, false, 24, 12);
      if (! this.settings.uniform_color && ! this.settings.rgba) molmil.bindAttribute(this.renderer.gl, this.point_attributes.in_Colour, 4, this.renderer.gl.UNSIGNED_BYTE, true, 24, 16);
      molmil.bindAttribute(this.renderer.gl, this.point_attributes.in_ScreenSpaceOffset, 2, this.renderer.gl.SHORT, false, 24, 20);
    }
    molmil.clearAttributes(this.renderer.gl);
    
    

    this.renderer.gl.bindBuffer(this.renderer.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    
    if (this.angle) { // angle sucks, it only allows a maximum of 3M "vertices" to be drawn per call...
      var dv = 0, vtd;
      while ((vtd = Math.min(this.nElements-dv, 3000000)) > 0) {this.renderer.gl.drawElements(this.renderer.gl.TRIANGLES, vtd, this.renderer.gl.INDEXINT, dv*4); dv += vtd;}
    }
    else this.renderer.gl.drawElements(this.renderer.gl.TRIANGLES, this.nElements, gl.INDEXINT, 0);

  };
  
  program.wireframe_render = function(modelViewMatrix, COR, i) {
    if (! this.status) return;
    i = i || 0;
    var normalMatrix = mat3.create();
    this.renderer.gl.useProgram(this.wireframe_shader.program);
    this.renderer.gl.uniformMatrix4fv(this.wireframe_shader.uniforms.modelViewMatrix, false, modelViewMatrix);
    this.renderer.gl.uniformMatrix4fv(this.wireframe_shader.uniforms.projectionMatrix, false, this.renderer.projectionMatrix);
    this.renderer.gl.uniform3f(this.wireframe_shader.uniforms.COR, COR[0], COR[1], COR[2]);
    this.renderer.gl.uniform1f(this.wireframe_shader.uniforms.focus, this.renderer.fogStart);
    this.renderer.gl.uniform1f(this.wireframe_shader.uniforms.fogSpan, this.renderer.fogSpan);
    if (this.settings.rgba) this.renderer.gl.uniform3f(this.wireframe_shader.uniforms.uniform_color, this.settings.rgba[0]/255, this.settings.rgba[1]/255, this.settings.rgba[2]/255);
    else if (this.settings.uniform_color) this.renderer.gl.uniform3f(this.wireframe_shader.uniforms.uniform_color, this.uniform_color[i][0]/255, this.uniform_color[i][1]/255, this.uniform_color[i][2]/255);
    
    if (this.renderer.settings.slab) {
      this.renderer.gl.uniform1f(this.wireframe_shader.uniforms.slabNear, -modelViewMatrix[14]+this.renderer.settings.slabNear-molmil.configBox.zNear);
      this.renderer.gl.uniform1f(this.wireframe_shader.uniforms.slabFar, -modelViewMatrix[14]+this.renderer.settings.slabFar-molmil.configBox.zNear);
    }
    
    if (molmil.configBox.fogColor) this.renderer.gl.uniform4f(this.wireframe_shader.uniforms.backgroundColor, molmil.configBox.fogColor[0], molmil.configBox.fogColor[1], molmil.configBox.fogColor[2], 1.0);
    else this.renderer.gl.uniform4f(this.wireframe_shader.uniforms.backgroundColor, molmil.configBox.BGCOLOR[0], molmil.configBox.BGCOLOR[1], molmil.configBox.BGCOLOR[2], 1.0);
  
    this.renderer.gl.bindBuffer(this.renderer.gl.ARRAY_BUFFER, this.vertexBuffer); 

    molmil.resetAttributes(this.renderer.gl);
    if (this.settings.lines_render) {      
      if (this.settings.has_ID) {
        molmil.bindAttribute(this.renderer.gl, this.wireframe_attributes.in_Position, 3, this.renderer.gl.FLOAT, false, 20, 0);
        if (! this.settings.uniform_color && ! this.settings.rgba) molmil.bindAttribute(this.renderer.gl, this.wireframe_attributes.in_Colour, 4, this.renderer.gl.UNSIGNED_BYTE, true, 20, 12);
        //molmil.bindAttribute(this.renderer.gl, this.wireframe_attributes.in_ID, 1, this.renderer.gl.FLOAT, false, 20, 16);
      }
      else {
        molmil.bindAttribute(this.renderer.gl, this.wireframe_attributes.in_Position, 3, this.renderer.gl.FLOAT, false, 16, 0);
        if (! this.settings.uniform_color && ! this.settings.rgba) molmil.bindAttribute(this.renderer.gl, this.wireframe_attributes.in_Colour, 4, this.renderer.gl.UNSIGNED_BYTE, true, 16, 12);
      }
    }
    else {
      if (this.settings.has_ID) {
        molmil.bindAttribute(this.renderer.gl, this.wireframe_attributes.in_Position, 3, this.renderer.gl.FLOAT, false, 32, 0);
        //molmil.bindAttribute(this.renderer.gl, this.wireframe_attributes.in_Normal, 3, this.renderer.gl.FLOAT, false, 32, 12);
        if (! this.settings.uniform_color && ! this.settings.rgba) molmil.bindAttribute(this.renderer.gl, this.wireframe_attributes.in_Colour, 4, this.renderer.gl.UNSIGNED_BYTE, true, 32, 24);
        //molmil.bindAttribute(this.renderer.gl, this.wireframe_attributes.in_ID, 1, this.renderer.gl.FLOAT, false, 32, 28);
      }
      else {
        molmil.bindAttribute(this.renderer.gl, this.wireframe_attributes.in_Position, 3, this.renderer.gl.FLOAT, false, 28, 0);
        //molmil.bindAttribute(this.renderer.gl, this.wireframe_attributes.in_Normal, 3, this.renderer.gl.FLOAT, false, 28, 12);
        if (! this.settings.uniform_color && ! this.settings.rgba) molmil.bindAttribute(this.renderer.gl, this.wireframe_attributes.in_Colour, 4, this.renderer.gl.UNSIGNED_BYTE, true, 28, 24);
      }
    }
    molmil.clearAttributes(this.renderer.gl);
    
    this.renderer.gl.bindBuffer(this.renderer.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

    if (this.angle) { // angle sucks, it only allows a maximum of 3M "vertices" to be drawn per call...
      var dv = 0, vtd;
      while ((vtd = Math.min(this.nElements-dv, 3000000)) > 0) {this.renderer.gl.drawElements(this.renderer.gl.LINES, vtd, this.renderer.gl.INDEXINT, dv*4); dv += vtd;}
    }
    else this.renderer.gl.drawElements(this.renderer.gl.LINES, this.nElements, this.renderer.gl.INDEXINT, 0);
  };
  
  program.alphaPre = function(modelViewMatrix, COR) {
    this.renderer.gl.useProgram(this.pre_shader.program);
    
    this.renderer.gl.uniformMatrix4fv(this.pre_shader.uniforms.modelViewMatrix, false, modelViewMatrix);
    this.renderer.gl.uniformMatrix4fv(this.pre_shader.uniforms.projectionMatrix, false, this.renderer.projectionMatrix);
    this.renderer.gl.uniform3f(this.pre_shader.uniforms.COR, COR[0], COR[1], COR[2]);

    this.renderer.gl.bindBuffer(this.renderer.gl.ARRAY_BUFFER, this.vertexBuffer); 
    
    molmil.resetAttributes(this.renderer.gl);
    
    if (this.settings.has_ID) {
      molmil.bindAttribute(this.renderer.gl, this.standard_attributes.in_Position, 3, this.renderer.gl.FLOAT, false, 32, 0);
      if (! this.settings.uniform_color) molmil.bindAttribute(this.renderer.gl, this.standard_attributes.in_Colour, 4, this.renderer.gl.UNSIGNED_BYTE, true, 32, 24);
    }
    else {
      molmil.bindAttribute(this.renderer.gl, this.standard_attributes.in_Position, 3, this.renderer.gl.FLOAT, false, 28, 0);
      if (! this.settings.uniform_color && ! this.settings.rgba) molmil.bindAttribute(this.renderer.gl, this.standard_attributes.in_Colour, 4, this.renderer.gl.UNSIGNED_BYTE, true, 28, 24);
    }
    molmil.clearAttributes(this.renderer.gl);
    
    this.renderer.gl.bindBuffer(this.renderer.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

    this.renderer.gl.colorMask(false, false, false, false);

    if (this.angle) { // angle sucks, it only allows a maximum of 3M "vertices" to be drawn per call...
      var dv = 0, vtd;
      while ((vtd = Math.min(this.nElements-dv, 3000000)) > 0) {this.renderer.gl.drawElements(this.renderer.gl.TRIANGLES, vtd, this.renderer.gl.INDEXINT, dv*4); dv += vtd;}
    }
    else this.renderer.gl.drawElements(this.renderer.gl.TRIANGLES, this.nElements, this.renderer.gl.INDEXINT, 0);
    
    this.renderer.gl.colorMask(true, true, true, true);
  }
  
  program.standard_render_core = function(modelViewMatrix, COR, i, opaqueMode) {
    i = i || 0;
    
    var normalMatrix = mat3.create();
    mat3.normalFromMat4(normalMatrix, modelViewMatrix);
    
    var shader = this.standard_shader;
    if (opaqueMode == 1) shader = this.standard_shader_opaque;
    else if (opaqueMode == 2) shader = this.standard_shader_transparent;

    this.renderer.gl.useProgram(shader.program);
    this.renderer.gl.uniformMatrix4fv(shader.uniforms.modelViewMatrix, false, modelViewMatrix);
    this.renderer.gl.uniformMatrix3fv(shader.uniforms.normalMatrix, false, normalMatrix);
    this.renderer.gl.uniformMatrix4fv(shader.uniforms.projectionMatrix, false, this.renderer.projectionMatrix);
    this.renderer.gl.uniform3f(shader.uniforms.COR, COR[0], COR[1], COR[2]);
    this.renderer.gl.uniform1f(shader.uniforms.focus, this.renderer.fogStart);
    this.renderer.gl.uniform1f(shader.uniforms.fogSpan, this.renderer.fogSpan);
    if (this.settings.rgba) {
      if (this.settings.alphaMode) this.renderer.gl.uniform3f(shader.uniforms.uniform_color, this.settings.rgba[0]/255, this.settings.rgba[1]/255, this.settings.rgba[2]/255, this.settings.rgba[3]/255);
      else this.renderer.gl.uniform3f(shader.uniforms.uniform_color, this.settings.rgba[0]/255, this.settings.rgba[1]/255, this.settings.rgba[2]/255);
    }
    else if (this.settings.uniform_color) {
      if (this.settings.alphaMode) this.renderer.gl.uniform3f(shader.uniforms.uniform_color, this.uniform_color[i][0]/255, this.uniform_color[i][1]/255, this.uniform_color[i][2]/255, this.uniform_color[i][3]/255);
      else this.renderer.gl.uniform3f(shader.uniforms.uniform_color, this.uniform_color[i][0]/255, this.uniform_color[i][1]/255, this.uniform_color[i][2]/255);
    }
    
    if (molmil.configBox.fogColor) this.renderer.gl.uniform4f(shader.uniforms.backgroundColor, molmil.configBox.fogColor[0], molmil.configBox.fogColor[1], molmil.configBox.fogColor[2], 1.0);
    else this.renderer.gl.uniform4f(shader.uniforms.backgroundColor, molmil.configBox.BGCOLOR[0], molmil.configBox.BGCOLOR[1], molmil.configBox.BGCOLOR[2], 1.0);
    if (this.settings.slab) {
      if (this.settings.slabColor) {this.renderer.gl.uniform4f(shader.uniforms.slabColor, this.settings.slabColor[0], this.settings.slabColor[1], this.settings.slabColor[2], this.settings.slabColor[3]);}
      this.renderer.gl.uniform1f(shader.uniforms.slabNear, -modelViewMatrix[14]+this.settings.slabNear-molmil.configBox.zNear);
      this.renderer.gl.uniform1f(shader.uniforms.slabFar, -modelViewMatrix[14]+this.settings.slabFar-molmil.configBox.zNear);
    }
    else if (this.renderer.settings.slab) {
      this.renderer.gl.uniform1f(shader.uniforms.slabNear, -modelViewMatrix[14]+this.renderer.settings.slabNear-molmil.configBox.zNear);
      this.renderer.gl.uniform1f(shader.uniforms.slabFar, -modelViewMatrix[14]+this.renderer.settings.slabFar-molmil.configBox.zNear);
    }
    
    if ("alphaSet" in this.settings) {
      this.renderer.gl.uniform1f(shader.uniforms.alpha, this.settings.alphaSet);
    }

    this.renderer.gl.bindBuffer(this.renderer.gl.ARRAY_BUFFER, this.vertexBuffer); 
    
    molmil.resetAttributes(this.renderer.gl);
    if (this.settings.has_ID) {
      molmil.bindAttribute(this.renderer.gl, this.standard_attributes.in_Position, 3, this.renderer.gl.FLOAT, false, 32, 0);
      molmil.bindAttribute(this.renderer.gl, this.standard_attributes.in_Normal, 3, this.renderer.gl.FLOAT, false, 32, 12);
      if (! this.settings.uniform_color) molmil.bindAttribute(this.renderer.gl, this.standard_attributes.in_Colour, 4, this.renderer.gl.UNSIGNED_BYTE, true, 32, 24);
      //molmil.bindAttribute(this.renderer.gl, this.standard_attributes.in_ID, 1, this.renderer.gl.FLOAT, false, 32, 28);
    }
    else {
      molmil.bindAttribute(this.renderer.gl, this.standard_attributes.in_Position, 3, this.renderer.gl.FLOAT, false, 28, 0);
      molmil.bindAttribute(this.renderer.gl, this.standard_attributes.in_Normal, 3, this.renderer.gl.FLOAT, false, 28, 12);
      if (! this.settings.uniform_color && ! this.settings.rgba) molmil.bindAttribute(this.renderer.gl, this.standard_attributes.in_Colour, 4, this.renderer.gl.UNSIGNED_BYTE, true, 28, 24);
    }
    molmil.clearAttributes(this.renderer.gl);
    
    if (this.settings.alphaMode || "alphaSet" in this.settings) {
      this.renderer.gl.enable(this.renderer.gl.BLEND);
      this.renderer.gl.blendEquation(this.renderer.gl.FUNC_ADD); 
      this.renderer.gl.blendFunc(this.renderer.gl.SRC_ALPHA, this.renderer.gl.ONE_MINUS_SRC_ALPHA);
    }
    
    this.renderer.gl.bindBuffer(this.renderer.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

    if (this.angle) { // angle sucks, it only allows a maximum of 3M "vertices" to be drawn per call...
      var dv = 0, vtd;
      while ((vtd = Math.min(this.nElements-dv, 3000000)) > 0) {this.renderer.gl.drawElements(this.renderer.gl.TRIANGLES, vtd, this.renderer.gl.INDEXINT, dv*4); dv += vtd;}
    }
    else this.renderer.gl.drawElements(this.renderer.gl.TRIANGLES, this.nElements, this.renderer.gl.INDEXINT, 0);
  }
  
  program.alphaMode_opaque_render = function(modelViewMatrix, COR, i) {
    if (! this.status) return;
    program.standard_render_core(modelViewMatrix, COR, i, 1); // opaque only
  };
  
  program.standard_render = function(modelViewMatrix, COR, i) {
    if (! this.status) return;
    if (this.settings.alphaSet) {
      if (molmil.configBox.cullFace) {this.renderer.gl.disable(this.renderer.gl.CULL_FACE);}
      this.alphaPre(modelViewMatrix, COR); // do pre thing
      program.standard_render_core(modelViewMatrix, COR, i, 0);
      if (molmil.configBox.cullFace) {this.renderer.gl.enable(this.renderer.gl.CULL_FACE); this.renderer.gl.cullFace(this.renderer.gl.BACK);}
      this.renderer.gl.disable(this.renderer.gl.BLEND);
    }
    else if (this.settings.alphaMode && this.standard_shader_opaque) {
      //program.standard_render_core(modelViewMatrix, COR, i, 1); // opaque only
      if (molmil.configBox.cullFace) {this.renderer.gl.disable(this.renderer.gl.CULL_FACE);}
      this.alphaPre(modelViewMatrix, COR); // do pre thing
      program.standard_render_core(modelViewMatrix, COR, i, 2); // render transparent only
      if (molmil.configBox.cullFace) {this.renderer.gl.enable(this.renderer.gl.CULL_FACE); this.renderer.gl.cullFace(this.renderer.gl.BACK);}
      this.renderer.gl.disable(this.renderer.gl.BLEND);
    }
    else {
      if (this.settings.disableCulling) this.renderer.gl.disable(this.renderer.gl.CULL_FACE);
      program.standard_render_core(modelViewMatrix, COR, i, 0);
      if (this.settings.disableCulling) {this.renderer.gl.enable(this.renderer.gl.CULL_FACE); this.renderer.gl.cullFace(this.renderer.gl.BACK);}
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
        if (! this.status || ! this.vertexBuffer) return;
        this.renderer.gl.useProgram(this.pickingShader.program);
        this.renderer.gl.uniformMatrix4fv(this.pickingShader.uniforms.modelViewMatrix, false, modelViewMatrix);
        this.renderer.gl.uniformMatrix4fv(this.pickingShader.uniforms.projectionMatrix, false, this.renderer.projectionMatrix);
        this.renderer.gl.uniform3f(this.pickingShader.uniforms.COR, COR[0], COR[1], COR[2]);
      
        this.renderer.gl.bindBuffer(this.renderer.gl.ARRAY_BUFFER, this.vertexBuffer);
        
        molmil.resetAttributes(this.renderer.gl);
        molmil.bindAttribute(this.renderer.gl, this.pickingAttributes.in_Position, 3, this.renderer.gl.FLOAT, false, 20, 0);
        molmil.bindAttribute(this.renderer.gl, this.pickingAttributes.in_ID, 1, this.renderer.gl.FLOAT, false, 20, 16);
        molmil.clearAttributes(this.renderer.gl);

        this.renderer.gl.bindBuffer(this.renderer.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        if (this.angle) { // angle sucks, it only allows a maximum of 3M "vertices" to be drawn per call...
          var dv = 0, vtd;
          while ((vtd = Math.min(this.nElements-dv, 3000000)) > 0) {this.renderer.gl.drawElements(this.renderer.gl.POINTS, vtd, this.renderer.gl.INDEXINT, dv*4); dv += vtd;}
        }
        else this.renderer.gl.drawElements(this.renderer.gl.POINTS, this.nElements, this.renderer.gl.INDEXINT, 0);
      };
    }
    else {
      program.pickingShader = renderer.shaders.picking;
      program.pickingAttributes = renderer.shaders.picking.attributes;
      
      program.renderPicking = function(modelViewMatrix, COR) {
        if (! this.status || ! this.vertexBuffer) return;
        this.renderer.gl.useProgram(this.pickingShader.program);
        this.renderer.gl.uniformMatrix4fv(this.pickingShader.uniforms.modelViewMatrix, false, modelViewMatrix);
        this.renderer.gl.uniformMatrix4fv(this.pickingShader.uniforms.projectionMatrix, false, this.renderer.projectionMatrix);
        this.renderer.gl.uniform3f(this.pickingShader.uniforms.COR, COR[0], COR[1], COR[2]);
      
        this.renderer.gl.bindBuffer(this.renderer.gl.ARRAY_BUFFER, this.vertexBuffer);

        molmil.resetAttributes(this.renderer.gl);
        molmil.bindAttribute(this.renderer.gl, this.pickingAttributes.in_Position, 3, this.renderer.gl.FLOAT, false, 32, 0);
        molmil.bindAttribute(this.renderer.gl, this.pickingAttributes.in_ID, 1, this.renderer.gl.FLOAT, false, 32, 28);
        molmil.clearAttributes(this.renderer.gl);
      
        this.renderer.gl.bindBuffer(this.renderer.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        if (this.angle) { // angle sucks, it only allows a maximum of 3M "vertices" to be drawn per call...
          var dv = 0, vtd;
          while ((vtd = Math.min(this.nElements-dv, 3000000)) > 0) {this.renderer.gl.drawElements(this.renderer.gl.TRIANGLES, vtd, this.renderer.gl.INDEXINT, dv*4); dv += vtd;}
        }
        else this.renderer.gl.drawElements(this.renderer.gl.TRIANGLES, this.nElements, this.renderer.gl.INDEXINT, 0);
      };
    }
  }
  else program.renderPicking = function() {};

  return program;
};

// ** creates and registers the programs within the renderer object **
molmil.geometry.registerPrograms = function(renderer, initOnly) {
  if (! renderer.program1 || ! renderer.gl.programInit) {
    renderer.program1 = this.build_simple_render_program(null, null, renderer, {has_ID: true, solid: true, alphaMode: this.buffer1 ? this.buffer1.alphaMode : false});
    renderer.addProgram(renderer.program1);
  }
  else renderer.program1.settings.alphaMode = this.buffer1 ? this.buffer1.alphaMode : false;
  if (! renderer.program2 || ! renderer.gl.programInit) {
    renderer.program2 = this.build_simple_render_program(null, null, renderer, {has_ID: true, lines_render: true});
    renderer.addProgram(renderer.program2);
  }
  if (! renderer.program3 || ! renderer.gl.programInit) {
    renderer.program3 = this.build_simple_render_program(null, null, renderer, {has_ID: true, solid: true, alphaMode: this.buffer3 ? this.buffer3.alphaMode : false});
    renderer.addProgram(renderer.program3);
  }
  else renderer.program3.settings.alphaMode = this.buffer3 ? this.buffer3.alphaMode : false;
  if (! renderer.program4 || this.buffer4.reinit || ! renderer.gl.programInit) {
    if (renderer.program4) renderer.programs.splice(renderer.programs.indexOf(renderer.program4), 1);
    renderer.program4 = this.build_simple_render_program(null, null, renderer, {has_ID: false, solid: true, alphaMode: this.buffer4 ? this.buffer4.alphaMode : false});
    renderer.addProgram(renderer.program4);
    renderer.program4.vertexSize = 7;
  }
  
  if (molmil.configBox.EXT_frag_depth && molmil.configBox.imposterSpheres) {
  
    if (! renderer.program5 || ! renderer.gl.programInit) {
      renderer.program5 = this.build_simple_render_program(null, null, renderer, {has_ID: true, imposterPoints: true});
      renderer.addProgram(renderer.program5);
    }
    renderer.program5.setBuffers(this.buffer5.vertexBuffer, this.buffer5.indexBuffer);
  }
  
  if (initOnly) return;
  
  renderer.program1.setBuffers(this.buffer1.vertexBuffer, this.buffer1.indexBuffer);
  renderer.program2.setBuffers(this.buffer2.vertexBuffer, this.buffer2.indexBuffer);
  renderer.program3.setBuffers(this.buffer3.vertexBuffer, this.buffer3.indexBuffer);
  renderer.program4.setBuffers(this.buffer4.vertexBuffer, this.buffer4.indexBuffer);
  
  if (molmil.configBox.liteMode) molmil.geometry.reset();
  
  renderer.gl.programInit = true;
}

// ** resets all geometry related buffered data **

molmil.geometry.reset = function() {
  this.atoms2draw = [];
  this.xna2draw = [];
  this.wfatoms2draw = [];
  this.trace = [];
  this.bonds2draw = [];
  this.lines2draw = [];
  this.bondRef = {};
  
  this.buffer1 = {vP: 0, iP: 0, alphaMode: false}; // atoms & bonds
  this.buffer2 = {vP: 0, iP: 0}; // wireframe
  this.buffer3 = {vP: 0, iP: 0}; // cartoon
  this.buffer4 = {vP: 0, iP: 0}; // surfaces
  this.buffer5 = {vP: 0, iP: 0}; // points
}

molmil.shapes3d = {}; // vertices, indices
molmil.shapes3d["flat-hex"] = {vertices: [[0, 0, 0.25], [-0.5, -0.75, 0.25], [0.5, -0.75, 0.25], [1, 0, 0.25], [0.5, 0.75, 0.25], [-0.5, 0.75, 0.25], [-1, 0, 0.25], [0, 0, -0.25], [-0.5, -0.75, -0.25], [0.5, -0.75, -0.25], [1, 0, -0.25], [0.5, 0.75, -0.25], [-0.5, 0.75, -0.25], [-1, 0, -0.25], [-0.5, -0.75, 0.25], [0.5, -0.75, 0.25], [-0.5, -0.75, -0.25], [0.5, -0.75, -0.25], [0.5, -0.75, 0.25], [1, 0, 0.25], [0.5, -0.75, -0.25], [1, 0, -0.25], [1, 0, 0.25], [0.5, 0.75, 0.25], [1, 0, -0.25], [0.5, 0.75, -0.25], [0.5, 0.75, 0.25], [-0.5, 0.75, 0.25], [0.5, 0.75, -0.25], [-0.5, 0.75, -0.25], [-0.5, 0.75, 0.25], [-1, 0, 0.25], [-0.5, 0.75, -0.25], [-1, 0, -0.25], [-1, 0, 0.25], [-0.5, -0.75, 0.25], [-1, 0, -0.25], [-0.5, -0.75, -0.25]], indices: [[0, 1, 2], [0, 2, 3], [0, 3, 4], [0, 4, 5], [0, 5, 6], [0, 6, 1], [9, 8, 7], [10, 9, 7], [11, 10, 7], [12, 11, 7], [13, 12, 7], [8, 13, 7], [15, 14, 16], [16, 17, 15], [19, 18, 20], [20, 21, 19], [23, 22, 24], [24, 25, 23], [27, 26, 28], [28, 29, 27], [31, 30, 32], [32, 33, 31], [35, 34, 36], [36, 37, 35]]};
molmil.shapes3d.cube = {vertices: [[1, -1, -1], [-1, -1, -1], [1, 1, -1], [-1, 1, -1], [-1, -1, 1], [1, -1, 1], [-1, 1, 1], [1, 1, 1], [-1, -1, -1], [-1, -1, 1], [-1, 1, -1], [-1, 1, 1], [1, -1, 1], [1, -1, -1], [1, 1, 1], [1, 1, -1], [-1, -1, -1], [1, -1, -1], [-1, -1, 1], [1, -1, 1], [-1, 1, 1], [1, 1, 1], [-1, 1, -1], [1, 1, -1]], indices: [[0, 1, 2], [1, 3, 2], [4, 5, 6], [5, 7, 6], [8, 9, 10], [9, 11, 10], [12, 13, 14], [13, 15, 14], [16, 17, 18], [17, 19, 18], [20, 21, 22], [21, 23, 22]], rgba2idxs: [0, 2, 4, 6, 8, 10]};
molmil.shapes3d.diamond = {vertices: [[0, 1, 0], [1, 0, 1], [-1, 0, 1], [0, 1, 0], [1, 0, -1], [1, 0, 1], [0, 1, 0], [-1, 0, -1], [1, 0, -1], [0, 1, 0], [-1, 0, 1], [-1, 0, -1], [0, -1, 0], [1, 0, 1], [-1, 0, 1], [0, -1, 0], [1, 0, -1], [1, 0, 1], [0, -1, 0], [-1, 0, -1], [1, 0, -1], [0, -1, 0], [-1, 0, 1], [-1, 0, -1]], indices: [[2, 1, 0], [5, 4, 3], [8, 7, 6], [11, 10, 9], [12, 13, 14], [15, 16, 17], [18, 19, 20], [21, 22, 23]], rgba2idxs: [0, 1, 2, 3]};
molmil.shapes3d["oct-pyramid"] = {vertices: [[0, -1, 0], [0, -1, -1], [0.7071067811865475, -1, -0.7071067811865475], [1, -1, 0], [0.7071067811865475, -1, 0.7071067811865475], [0, -1, 1], [-0.7071067811865475, -1, 0.7071067811865475], [-1, -1, 0], [-0.7071067811865475, -1, -0.7071067811865475], [0, 1, 0], [0, -1, -1], [0.7071067811865475, -1, -0.7071067811865475], [0, 1, 0], [0.7071067811865475, -1, -0.7071067811865475], [1, -1, 0], [0, 1, 0], [1, -1, 0], [0.7071067811865475, -1, 0.7071067811865475], [0, 1, 0], [0.7071067811865475, -1, 0.7071067811865475], [0, -1, 1], [0, 1, 0], [0, -1, 1], [-0.7071067811865475, -1, 0.7071067811865475], [0, 1, 0], [-0.7071067811865475, -1, 0.7071067811865475], [-1, -1, 0], [0, 1, 0], [-1, -1, 0], [-0.7071067811865475, -1, -0.7071067811865475], [0, 1, 0], [-0.7071067811865475, -1, -0.7071067811865475], [0, -1, -1]], indices: [[0, 1, 2], [0, 2, 3], [0, 3, 4], [0, 4, 5], [0, 5, 6], [0, 6, 7], [0, 7, 8], [0, 8, 1], [11, 10, 9], [14, 13, 12], [17, 16, 15], [20, 19, 18], [23, 22, 21], [26, 25, 24], [29, 28, 27], [32, 31, 30]], rgba2idxs: [0, 1, 2, 3, 10, 11, 12, 13]};
molmil.shapes3d.rect = {vertices: [[1, -0.5, -0.5], [-1, -0.5, -0.5], [1, 0.5, -0.5], [-1, 0.5, -0.5], [-1, -0.5, 0.5], [1, -0.5, 0.5], [-1, 0.5, 0.5], [1, 0.5, 0.5], [-1, -0.5, -0.5], [-1, -0.5, 0.5], [-1, 0.5, -0.5], [-1, 0.5, 0.5], [1, -0.5, 0.5], [1, -0.5, -0.5], [1, 0.5, 0.5], [1, 0.5, -0.5], [-1, -0.5, -0.5], [1, -0.5, -0.5], [-1, -0.5, 0.5], [1, -0.5, 0.5], [-1, 0.5, 0.5], [1, 0.5, 0.5], [-1, 0.5, -0.5], [1, 0.5, -0.5]], indices: [[0, 1, 2], [1, 3, 2], [4, 5, 6], [5, 7, 6], [8, 9, 10], [9, 11, 10], [12, 13, 14], [13, 15, 14], [16, 17, 18], [17, 19, 18], [20, 21, 22], [21, 23, 22]]};
molmil.shapes3d["5-star"] = {vertices: [[0, 0, 0.25], [0.4045084971874737, -0.29389262614623657, 0], [1.0, 0.0, 0], [0.4045084971874737, 0.29389262614623657, 0], [0, 0, 0.25], [1.0, 0.0, 0], [0.4045084971874737, 0.29389262614623657, 0], [0.30901699437494745, 0.9510565162951535, 0], [0, 0, 0.25], [0.4045084971874737, 0.29389262614623657, 0], [0.30901699437494745, 0.9510565162951535, 0], [-0.15450849718747367, 0.4755282581475768, 0], [0, 0, 0.25], [0.30901699437494745, 0.9510565162951535, 0], [-0.15450849718747367, 0.4755282581475768, 0], [-0.8090169943749473, 0.5877852522924732, 0], [0, 0, 0.25], [-0.15450849718747367, 0.4755282581475768, 0], [-0.8090169943749473, 0.5877852522924732, 0], [-0.5, 6.123233995736766e-17, 0], [0, 0, 0.25], [-0.8090169943749473, 0.5877852522924732, 0], [-0.5, 6.123233995736766e-17, 0], [-0.8090169943749476, -0.587785252292473, 0], [0, 0, 0.25], [-0.5, 6.123233995736766e-17, 0], [-0.8090169943749476, -0.587785252292473, 0], [-0.15450849718747378, -0.47552825814757677, 0], [0, 0, 0.25], [-0.8090169943749476, -0.587785252292473, 0], [-0.15450849718747378, -0.47552825814757677, 0], [0.30901699437494723, -0.9510565162951536, 0], [0, 0, 0.25], [-0.15450849718747378, -0.47552825814757677, 0], [0.30901699437494723, -0.9510565162951536, 0], [0.40450849718747367, -0.2938926261462367, 0], [0, 0, 0.25], [0.30901699437494723, -0.9510565162951536, 0], [0.40450849718747367, -0.2938926261462367, 0], [1.0, -2.4492935982947064e-16, 0], [0, 0, -0.25], [0.4045084971874737, -0.29389262614623657, 0], [1.0, 0.0, 0], [0.4045084971874737, 0.29389262614623657, 0], [0, 0, -0.25], [1.0, 0.0, 0], [0.4045084971874737, 0.29389262614623657, 0], [0.30901699437494745, 0.9510565162951535, 0], [0, 0, -0.25], [0.4045084971874737, 0.29389262614623657, 0], [0.30901699437494745, 0.9510565162951535, 0], [-0.15450849718747367, 0.4755282581475768, 0], [0, 0, -0.25], [0.30901699437494745, 0.9510565162951535, 0], [-0.15450849718747367, 0.4755282581475768, 0], [-0.8090169943749473, 0.5877852522924732, 0], [0, 0, -0.25], [-0.15450849718747367, 0.4755282581475768, 0], [-0.8090169943749473, 0.5877852522924732, 0], [-0.5, 6.123233995736766e-17, 0], [0, 0, -0.25], [-0.8090169943749473, 0.5877852522924732, 0], [-0.5, 6.123233995736766e-17, 0], [-0.8090169943749476, -0.587785252292473, 0], [0, 0, -0.25], [-0.5, 6.123233995736766e-17, 0], [-0.8090169943749476, -0.587785252292473, 0], [-0.15450849718747378, -0.47552825814757677, 0], [0, 0, -0.25], [-0.8090169943749476, -0.587785252292473, 0], [-0.15450849718747378, -0.47552825814757677, 0], [0.30901699437494723, -0.9510565162951536, 0], [0, 0, -0.25], [-0.15450849718747378, -0.47552825814757677, 0], [0.30901699437494723, -0.9510565162951536, 0], [0.40450849718747367, -0.2938926261462367, 0], [0, 0, -0.25], [0.30901699437494723, -0.9510565162951536, 0], [0.40450849718747367, -0.2938926261462367, 0], [1.0, -2.4492935982947064e-16, 0]], indices: [[0, 1, 2], [4, 5, 6], [8, 9, 10], [12, 13, 14], [16, 17, 18], [20, 21, 22], [24, 25, 26], [28, 29, 30], [32, 33, 34], [36, 37, 38], [42, 41, 40], [46, 45, 44], [50, 49, 48], [54, 53, 52], [58, 57, 56], [62, 61, 60], [66, 65, 64], [70, 69, 68], [74, 73, 72], [78, 77, 76]]};
molmil.shapes3d["flat-diamond"] = {vertices: [[0, 0.5, 0], [1, 0, 0.5], [-1, 0, 0.5], [0, 0.5, 0], [1, 0, -0.5], [1, 0, 0.5], [0, 0.5, 0], [-1, 0, -0.5], [1, 0, -0.5], [0, 0.5, 0], [-1, 0, 0.5], [-1, 0, -0.5], [0, -0.5, 0], [1, 0, 0.5], [-1, 0, 0.5], [0, -0.5, 0], [1, 0, -0.5], [1, 0, 0.5], [0, -0.5, 0], [-1, 0, -0.5], [1, 0, -0.5], [0, -0.5, 0], [-1, 0, 0.5], [-1, 0, -0.5]], indices: [[2, 1, 0], [5, 4, 3], [8, 7, 6], [11, 10, 9], [12, 13, 14], [15, 16, 17], [18, 19, 20], [21, 22, 23]], rgba2idxs: [0, 1, 2, 3]};
molmil.shapes3d.pentagon = {vertices: [[0, 0, 0.25], [1.0, 0.0, 0.25], [0.30901699437494745, 0.9510565162951535, 0.25], [-0.8090169943749473, 0.5877852522924732, 0.25], [-0.8090169943749476, -0.587785252292473, 0.25], [0.30901699437494723, -0.9510565162951536, 0.25], [0, 0, -0.25], [1.0, 0.0, -0.25], [0.30901699437494745, 0.9510565162951535, -0.25], [-0.8090169943749473, 0.5877852522924732, -0.25], [-0.8090169943749476, -0.587785252292473, -0.25], [0.30901699437494723, -0.9510565162951536, -0.25], [1.0, 0.0, 0.25], [0.30901699437494745, 0.9510565162951535, 0.25], [1.0, 0.0, -0.25], [0.30901699437494745, 0.9510565162951535, -0.25], [0.30901699437494745, 0.9510565162951535, 0.25], [-0.8090169943749473, 0.5877852522924732, 0.25], [0.30901699437494745, 0.9510565162951535, -0.25], [-0.8090169943749473, 0.5877852522924732, -0.25], [-0.8090169943749473, 0.5877852522924732, 0.25], [-0.8090169943749476, -0.587785252292473, 0.25], [-0.8090169943749473, 0.5877852522924732, -0.25], [-0.8090169943749476, -0.587785252292473, -0.25], [-0.8090169943749476, -0.587785252292473, 0.25], [0.30901699437494723, -0.9510565162951536, 0.25], [-0.8090169943749476, -0.587785252292473, -0.25], [0.30901699437494723, -0.9510565162951536, -0.25], [0.30901699437494723, -0.9510565162951536, 0.25], [1.0, -2.4492935982947064e-16, 0.25], [0.30901699437494723, -0.9510565162951536, -0.25], [1.0, -2.4492935982947064e-16, -0.25]], indices: [[0, 1, 2], [0, 2, 3], [0, 3, 4], [0, 4, 5], [0, 5, 1], [8, 7, 6], [9, 8, 6], [10, 9, 6], [11, 10, 6], [7, 11, 6], [12, 14, 13], [14, 15, 13], [16, 18, 17], [18, 19, 17], [20, 22, 21], [22, 23, 21], [24, 26, 25], [26, 27, 25], [28, 30, 29], [30, 31, 29]]};

//molmil.SNFG.__UNKNOWN__ = {"type": "rect", "rgba": [255, 0, 0, 255], "rgba2": [255, 255, 255, 255], "name": "__UNKNOWN__"};
//molmil.SNFG.__UNKNOWN__ = {"type": "diamond", "rgba": [255, 0, 0, 255], "name": "__UNKNOWN__"};


// calculate normals for shapes...

molmil.geometry.updateNormals = function(obj) {
  if (obj.normals) return;
  
  var vertices = obj.vertices, indices = obj.indices;

  if (obj.rgba2idxs) {
    var in_rgba1 = [], in_rgba2 = [], vmapping = {}, rgba2idxs = obj.rgba2idxs;
    for (i=0; i<indices.length; i++) {
      if (rgba2idxs.includes(i)) {in_rgba2.push(indices[i][0]); in_rgba2.push(indices[i][1]); in_rgba2.push(indices[i][2]);}
      else {in_rgba1.push(indices[i][0]); in_rgba1.push(indices[i][1]); in_rgba1.push(indices[i][2]);}
    }
    
    for (i=0; i<in_rgba2.length; i++) {
      if (in_rgba1.includes(in_rgba2[i])) {
        vmapping[in_rgba2[i]] = vertices.length;
        vertices.push(vertices[in_rgba2[i]].slice());
      }
    }
    var tmp = [];
    for (i=0; i<indices.length; i++) {
      if (rgba2idxs.includes(i)) {
        if (indices[i][0] in vmapping) indices[i][0] = vmapping[indices[i][0]];
        if (indices[i][1] in vmapping) indices[i][1] = vmapping[indices[i][1]];
        if (indices[i][2] in vmapping) indices[i][2] = vmapping[indices[i][2]];
      }
      tmp.push(indices[i][0]);
      tmp.push(indices[i][1]);
      tmp.push(indices[i][2]);
    }
    
    obj.rgba2idxs = new Int8Array(vertices.length);
  
    for (i=0; i<rgba2idxs.length; i++) {
     obj.rgba2idxs[indices[rgba2idxs[i]][0]] = 1;
     obj.rgba2idxs[indices[rgba2idxs[i]][1]] = 1;
     obj.rgba2idxs[indices[rgba2idxs[i]][2]] = 1;
    }
  }
  else obj.rgba2idxs = new Int8Array(vertices.length);

  obj.nov = vertices.length; obj.noi = indices.length;
  obj.vertices = new Float32Array(vertices.length*3);
  obj.normals = new Float32Array(vertices.length*3);
  obj.indices = new Float32Array(indices.length*3);
  
  var i, ii, p1 = vec3.create(), p2 = vec3.create(), a = vec3.create(), b = vec3.create(), c, face_normals = [], faceidxs = [], max_r = 0, r;
  for (i=0; i<vertices.length; i++) {
    r = vec3.length(vertices[i]);
    if (r > max_r) max_r = r;
    faceidxs.push([]);
  }
  var sf = 0.5/max_r;
  for (i=0; i<vertices.length; i++) vec3.scale(vertices[i], vertices[i], sf);
  for (i=0, ii=0; i<indices.length; i++) {
    vec3.subtract(a, vertices[indices[i][0]], vertices[indices[i][1]]); vec3.normalize(a, a);
    vec3.subtract(b, vertices[indices[i][0]], vertices[indices[i][2]]); vec3.normalize(b, b);
   
    c = vec3.create();
    vec3.cross(c, a, b); vec3.normalize(c, c);
    face_normals.push(c);
    
    faceidxs[indices[i][0]].push(face_normals.length-1);
    faceidxs[indices[i][1]].push(face_normals.length-1);
    faceidxs[indices[i][2]].push(face_normals.length-1);
    
    obj.indices[ii++] = indices[i][0]; obj.indices[ii++] = indices[i][1]; obj.indices[ii++] = indices[i][2];
  }
  
  var normal, f;
  for (i=0, ii=0; i<vertices.length; i++) {
    normal = [0, 0, 0];
    for (f=0; f<faceidxs[i].length; f++) vec3.add(normal, normal, face_normals[faceidxs[i][f]]);
    vec3.normalize(normal, normal);
    obj.normals[ii] = normal[0]; obj.normals[ii+1] = normal[1]; obj.normals[ii+2] = normal[2];
    obj.vertices[ii++] = vertices[i][0]; obj.vertices[ii++] = vertices[i][1]; obj.vertices[ii++] = vertices[i][2];
  }
};

// ** calculates and initiates buffer sizes **
molmil.geometry.initChains = function(chains, render, detail_or) {
  detail_or = detail_or || 0;

  var chain, a, b;
  
  var atoms2draw = this.atoms2draw; var wfatoms2draw = this.wfatoms2draw; var xna2draw = this.xna2draw;
  
  var bonds2draw = this.bonds2draw; var lines2draw = this.lines2draw; var bondRef = this.bondRef;
  var snfg_objs = this.snfg_objs = [], upvec_scan = {};

  var obj, Xpos, xyzRef, norm_upvec = vec3.create(), uvsi;
  var a2, a3, xyz = vec3.create(), xyz2 = vec3.create(), xyz3 = vec3.create(), v1 = vec3.create(), v2 = vec3.create(), v3 = vec3.create();
  
  var nor = 0, nob = 0, stat, snfg_nov = 0, snfg_noi = 0, snfg_nos = 0, snfg_nob = 0, modelId = this.modelId;

  // add code for SNFG...
  // fixed number of vertices, except for spheres

  for (var c=0; c<chains.length; c++) {
    chain = chains[c]; stat = false;
    if (! chain.display) continue;
        
    for (var a=0; a<chain.atoms.length; a++) {
      if (chain.atoms[a].displayMode == 0 || ! chain.atoms[a].display) continue; // don't display
      else if (chain.atoms[a].displayMode == 4) wfatoms2draw.push(chain.atoms[a]); // wireframe (for wireframe use gl_lines)
      else atoms2draw.push(chain.atoms[a]);
      stat = true;
    }

    if (stat && ! chain.bondsOK) render.soup.buildBondList(chain, false);

    for (var b=0; b<chain.bonds.length; b++) {
      if (chain.bonds[b][0].displayMode < 2 || chain.bonds[b][1].displayMode < 2 || ! chain.bonds[b][0].display || ! chain.bonds[b][1].display) continue;
      if (chain.bonds[b][0].displayMode == 4 || chain.bonds[b][1].displayMode == 4) {
        if (chain.bonds[b][0].displayMode != 4) wfatoms2draw.push(chain.bonds[b][0]);
        if (chain.bonds[b][1].displayMode != 4) wfatoms2draw.push(chain.bonds[b][1]);
        lines2draw.push(chain.bonds[b]);
      }
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
    
    if (chain.displayMode == 3 && chain.molecules.length && chain.molecules[0].xna) { // default?
      
      for (var m=0; m<chain.molecules.length; m++) {
        if (chain.molecules[0].displayMode == 3 && chain.molecules[m].outer && chain.molecules[m].CA) xna2draw.push([chain.molecules[m].CA, chain.molecules[m].outer]);
      }
    }
    
    if (chain.SNFG && (chain.displayMode == 3 || chain.displayMode == 4)) {
      xyzRef = chain.modelsXYZ[modelId || 0];
      for (var m=0; m<chain.molecules.length; m++) {
        if (! chain.molecules[m].SNFG) continue;
        obj = {center: [0, 0, 0], id: snfg_objs.length};
        chain.molecules[m].SNFG_obj = obj;
        
        // also, see if we can calculate the backvector of the ring, then that should be used...
        var rings = findResidueRings(chain.molecules[m]);
        if (rings.length) {
          rings = rings[0];
          obj.backvec = vec3.create();
          for (var a=0, a2, a3; a<rings.length; a++) {
            Xpos = rings[a].xyz;
            
            obj.center[0] += xyzRef[Xpos];
            obj.center[1] += xyzRef[Xpos+1];
            obj.center[2] += xyzRef[Xpos+2];
            
            a2 = a + 1; if (a2 >= rings.length) a2 -= rings.length;
            a3 = a + 2; if (a3 >= rings.length) a3 -= rings.length;
            Xpos2 = rings[a2].xyz;
            Xpos3 = rings[a3].xyz;
            
            xyz[0] = xyzRef[Xpos];
            xyz[1] = xyzRef[Xpos+1];
            xyz[2] = xyzRef[Xpos+2];
            
            Xpos = rings[a2].xyz; xyz2[0] = xyzRef[Xpos]; xyz2[1] = xyzRef[Xpos+1]; xyz2[2] = xyzRef[Xpos+2];
            Xpos = rings[a3].xyz; xyz3[0] = xyzRef[Xpos]; xyz3[1] = xyzRef[Xpos+1]; xyz3[2] = xyzRef[Xpos+2];
            
            vec3.subtract(v1, xyz, xyz2);
            vec3.subtract(v2, xyz, xyz3);
            vec3.cross(v3, v1, v2);
            if (a > 0 && vec3.dot(v3, obj.backvec) < 0) vec3.subtract(obj.backvec, obj.backvec, v3);
            else vec3.add(obj.backvec, obj.backvec, v3);
          }
          vec3.normalize(obj.backvec, obj.backvec);
          obj.center[0] /= rings.length;
          obj.center[1] /= rings.length;
          obj.center[2] /= rings.length;
        }
        else {
          for (var a=0; a<chain.molecules[m].atoms.length; a++) {
            Xpos = chain.molecules[m].atoms[a].xyz;
            obj.center[0] += xyzRef[Xpos];
            obj.center[1] += xyzRef[Xpos+1];
            obj.center[2] += xyzRef[Xpos+2];
          }
          obj.center[0] /= chain.molecules[m].atoms.length;
          obj.center[1] /= chain.molecules[m].atoms.length;
          obj.center[2] /= chain.molecules[m].atoms.length;
        }
        obj.mode = chain.displayMode;

        obj.mesh = molmil.SNFG[chain.molecules[m].name] || molmil.SNFG.__UNKNOWN__;
        if (obj.mesh.type == "sphere") snfg_nos++;
        else if (obj.mesh.type in molmil.shapes3d) {
          snfg_nov += molmil.shapes3d[obj.mesh.type].nov || molmil.shapes3d[obj.mesh.type].vertices.length;
          snfg_noi += (molmil.shapes3d[obj.mesh.type].noi || molmil.shapes3d[obj.mesh.type].indices.length)*3;
        }
        snfg_objs.push(obj);
        upvec_scan[obj.id] = vec4.create();
      }
    }
    if (chain.displayMode > 1 && (chain.displayMode != molmil.displayMode_ChainSurfaceCG || chain.displayMode != molmil.displayMode_ChainSurfaceSimple)) {
      if (! chain.twoDcache || this.reInitChains) molmil.prepare2DRepr(chain, modelId || 0);
      nor += chain.molecules.length;
    }
  }
  
  var assignSNFG_obj = function(mol) {
    mol.SNFG_obj = {center: [0, 0, 0]};
    xyzRef = mol.chain.modelsXYZ[modelId || 0];
    for (var a=0; a<mol.atoms.length; a++) {
      Xpos = mol.atoms[a].xyz;
      mol.SNFG_obj.center[0] += xyzRef[Xpos];
      mol.SNFG_obj.center[1] += xyzRef[Xpos+1];
      mol.SNFG_obj.center[2] += xyzRef[Xpos+2];
    }
    mol.SNFG_obj.center[0] /= mol.atoms.length;
    mol.SNFG_obj.center[1] /= mol.atoms.length;
    mol.SNFG_obj.center[2] /= mol.atoms.length;
    
    var nearest = [1e9, -1], dx, dy, dz, r2;
    
    for (var a=0; a<mol.atoms.length; a++) {
      Xpos = mol.atoms[a].xyz;
      
      dx = xyzRef[Xpos]-mol.SNFG_obj.center[0]; dy = xyzRef[Xpos+1]-mol.SNFG_obj.center[1]; dz = xyzRef[Xpos+2]-mol.SNFG_obj.center[2];
      r2 = dx*dx + dy*dy + dz*dz;
      if (r2 < nearest[0]) nearest = [r2, Xpos];
    }
    Xpos = nearest[1];
    mol.SNFG_obj.center[0] = xyzRef[Xpos];
    mol.SNFG_obj.center[1] = xyzRef[Xpos+1];
    mol.SNFG_obj.center[2] = xyzRef[Xpos+2];
  }
  
  for (var c=0; c<chains.length; c++) {
    chain = chains[c];
    if (! chain.display) continue;
    if (chain.SNFG && (chain.displayMode == 3 || chain.displayMode == 4)) {
      if (chain.displayMode == 3) snfg_nob += chain.branches.length;
      for (var m=0; m<chain.branches.length; m++) {
        obj = {mesh: {type: "cylinder", rgba: [127, 127, 127, 255]}, radius: 0.25};
        obj.center = chain.branches[m][0].SNFG_obj.center;
        // what to do if it's connected to a protein? -> get the Calpha instead...
        if (chain.branches[m][0].CA) {
          if (! chain.branches[m][1].SNFG_obj) assignSNFG_obj(chain.branches[m][1]);
          xyzRef = chain.branches[m][0].chain.modelsXYZ[modelId || 0];
          Xpos = chain.branches[m][0].CA.xyz;
          xyz[0] = xyzRef[Xpos]; xyz[1] = xyzRef[Xpos+1]; xyz[2] = xyzRef[Xpos+2];
          obj.backvec = [xyz[0]-chain.branches[m][1].SNFG_obj.center[0], xyz[1]-chain.branches[m][1].SNFG_obj.center[1], xyz-chain.branches[m][1].SNFG_obj.center[2]]; 
        }
        else if (chain.branches[m][1].CA) {
          if (! chain.branches[m][0].SNFG_obj) assignSNFG_obj(chain.branches[m][0]);
          xyzRef = chain.branches[m][1].chain.modelsXYZ[modelId || 0];
          Xpos = chain.branches[m][1].CA.xyz;
          xyz[0] = xyzRef[Xpos]; xyz[1] = xyzRef[Xpos+1]; xyz[2] = xyzRef[Xpos+2];
          obj.backvec = [chain.branches[m][0].SNFG_obj.center[0]-xyz[0], chain.branches[m][0].SNFG_obj.center[1]-xyz[1], chain.branches[m][0].SNFG_obj.center[2]-xyz[2]]; 
        }
        else {
          if (! chain.branches[m][0].SNFG_obj) assignSNFG_obj(chain.branches[m][0]);
          if (! chain.branches[m][1].SNFG_obj) assignSNFG_obj(chain.branches[m][1]);
          obj.backvec = [chain.branches[m][0].SNFG_obj.center[0]-chain.branches[m][1].SNFG_obj.center[0], chain.branches[m][0].SNFG_obj.center[1]-chain.branches[m][1].SNFG_obj.center[1], chain.branches[m][0].SNFG_obj.center[2]-chain.branches[m][1].SNFG_obj.center[2]]; 
        }
        obj.length = vec3.length(obj.backvec);
        vec3.normalize(obj.backvec, obj.backvec);
        if (chain.displayMode == 3) snfg_objs.push(obj);
        if (chain.branches[m][0].SNFG) {
          uvsi = upvec_scan[chain.branches[m][0].SNFG_obj.id];
          if (uvsi[4] == 0) vec3.add(uvsi, uvsi, obj.backvec);
          else {
            if (vec3.dot(obj.backvec, uvsi) < 0) vec3.subtract(uvsi, uvsi, obj.backvec);
            else vec3.add(uvsi, uvsi, obj.backvec);
          }
          uvsi[3]++;
        }

        if (chain.branches[m][1].SNFG) {
          uvsi = upvec_scan[chain.branches[m][1].SNFG_obj.id];
          if (uvsi) {
            if (uvsi[4] == 0) vec3.add(uvsi, uvsi, obj.backvec);
            else {
              if (vec3.dot(obj.backvec, uvsi) < 0) vec3.subtract(uvsi, uvsi, obj.backvec);
              else vec3.add(uvsi, uvsi, obj.backvec);
            }
            uvsi[3]++;
          }
        }
      }
      
      for (var m in upvec_scan) {
        snfg_objs[m].sidevec = vec3.normalize(vec3.create(), upvec_scan[m]);
        if (snfg_objs[m].backvec) {
          vec3.cross(v1, snfg_objs[m].sidevec, snfg_objs[m].backvec);
          vec3.cross(snfg_objs[m].sidevec, v1, snfg_objs[m].backvec);
          delete snfg_objs[m].backvec;
        }
      }
    }
  }
  
  this.reInitChains = false;
  
  var detail_lv = molmil.configBox.QLV_SETTINGS[render.QLV].SPHERE_TESS_LV;
  var CB_NOI = molmil.configBox.QLV_SETTINGS[render.QLV].CB_NOI;
  var CB_NOVPR = molmil.configBox.QLV_SETTINGS[render.QLV].CB_NOVPR;
  
  if (molmil.configBox.EXT_frag_depth && molmil.configBox.imposterSpheres) {
    var vs = 0;
  }
  else {
    var vs = (atoms2draw.length+(xna2draw.length*2))*(6*Math.pow(4, detail_lv+1));
    vs += snfg_nos * 6*Math.pow(4, detail_lv+1);
  }

  vs += (bonds2draw.length+(xna2draw.length*0.5))*(detail_lv+1)*4*2;
  vs += nor*CB_NOI*CB_NOVPR;
  vs += snfg_nov + (snfg_nob * (detail_lv+1)*4);
  
  if (molmil.configBox.customDetailLV) detail_lv = this.detail_lv = molmil.configBox.customDetailLV(vs, detail_lv);
  else {
    if (vs > 1e7) detail_lv -= 1;
    if (vs > 3e7) detail_lv -= 1;
    if (vs > 1e8) detail_lv -= 1;
    if (vs < 2.5e5 && detail_lv < 3) detail_lv += 1;
    if (typeof molmil.configBox.strictDetailLV == "number" && detail_lv < molmil.configBox.strictDetailLV) detail_lv = molmil.configBox.strictDetailLV;
    else if (molmil.configBox.strictDetailLV == true) molmil.configBox.strictDetailLV = molmil.configBox.QLV_SETTINGS[render.QLV].SPHERE_TESS_LV;
    //detail_lv = 1;
    detail_lv = this.detail_lv = Math.max(detail_lv+detail_or, 0);
    if (molmil.configBox.liteMode && ! molmil.configBox.strictDetailLV) detail_lv = this.detail_lv = 1;
  }

  // use a separate detail lv for atoms in case of < 250 atoms --> higher quality
  
  this.noi = molmil.configBox.QLV_SETTINGS[this.detail_lv].CB_NOI; // number of interpolation points per residue
  this.novpr = molmil.configBox.QLV_SETTINGS[this.detail_lv].CB_NOVPR;
  if (molmil.configBox.liteMode) this.noi = 1;
  
  var buffer1 = this.buffer1, buffer2 = this.buffer2;
  
  var vs = 0, is = 0;
  
  var nspheres = atoms2draw.length + xna2draw.length*2 + snfg_nos;
  
  if (molmil.configBox.EXT_frag_depth && molmil.configBox.imposterSpheres) {
    this.buffer5.vertexBuffer = new Float32Array(nspheres*4*7); // x, y, z, r, ss_offset (4x gl.BYTE), rgba, aid
    if (molmil.configBox.OES_element_index_uint) this.buffer5.indexBuffer = new Uint32Array(nspheres*6);
    else this.buffer5.indexBuffer = new Uint16Array(nspheres*4);
  }
  else {
    var sphere = this.getSphere(1, detail_lv);
    vs += (sphere.vertices.length/3)*nspheres;
    is += sphere.indices.length*nspheres;
  }
  
  nob += xna2draw.length;
  nob += snfg_nob; // snfg branch connectors
  var cylinder = this.getCylinder(detail_lv);

  vs += (cylinder.vertices.length/3)*nob;
  is += cylinder.indices.length*nob;
  
  // snfg objects (except spheres)
  vs += snfg_nov;
  is += snfg_noi;
  
  buffer1.vertexBuffer = new Float32Array(vs*8); // x, y, z, nx, ny, nz, rgba, aid
  buffer1.vertexBuffer8 = new Uint8Array(buffer1.vertexBuffer.buffer);
  if (molmil.configBox.OES_element_index_uint) buffer1.indexBuffer = new Uint32Array(is);
  else buffer1.indexBuffer = new Uint16Array(is);
  
  buffer2.vertexBuffer = new Float32Array(wfatoms2draw.length*5); // x, y, z, r, rgba, aid
  buffer2.vertexBuffer8 = new Uint8Array(buffer2.vertexBuffer.buffer);
  if (molmil.configBox.OES_element_index_uint) buffer2.indexBuffer = new Uint32Array(lines2draw.length*2);
  else buffer2.indexBuffer = new Uint16Array(lines2draw.length*2);
};

function findResidueRings(molObj) {
  var bondInfo = {}, atomRef = {}, i;
  for (i=0; i<molObj.atoms.length; i++) {
    bondInfo[molObj.atoms[i].AID] = [];
    atomRef[molObj.atoms[i].AID] = molObj.atoms[i];
  }
  for (var i=0; i<molObj.chain.bonds.length; i++) {
    if (molObj.chain.bonds[i][0].AID in bondInfo) bondInfo[molObj.chain.bonds[i][0].AID].push(molObj.chain.bonds[i][1]);
    if (molObj.chain.bonds[i][1].AID in bondInfo) bondInfo[molObj.chain.bonds[i][1].AID].push(molObj.chain.bonds[i][0]);
  }

  var ringlist = {}, N = 0;
  var scancyclic = function(atom, seq) {
    N++;
    var newseq = seq.slice(), b, bonds = bondInfo[atom.AID], midx; newseq.push(atom.AID);
    if (bonds === undefined) return;
    if (N > 1e6) return; // give up on broken mess...
    for (b=0; b<bonds.length; b++) {
      midx = newseq.indexOf(bonds[b].AID);
      if (midx == -1) scancyclic(bonds[b], newseq);
      else if (newseq.length-midx > 5) ringlist[newseq.slice().sort(function (a, b) {return a-b;}).join("-")] = newseq.map(function(x) {return atomRef[x];});
    }
    return bonds.length;
  };
  scancyclic(molObj.atoms[0], []);
  return Object.values(ringlist);
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
    
    this.squareVerticesNhead = [
      [-1,  0, 0],
      [ 29/41,  29/41, 0],
      [ 1,  0, 0],
      [ -29/41, -29/41, 0],
      [-1,  0, 0] // cheat
    ];
    
  }
  else {
    var dome = this.dome;
  }
  
  for (c=0; c<chains.length; c++) {
    
    chain = chains[c];
    if (chain.displayMode < 2 || chain.displayMode == molmil.displayMode_ChainSurfaceCG || chain.displayMode == molmil.displayMode_ChainSurfaceSimple || chain.SNFG) continue;
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
  buffer3.alphaMode = false;
  buffer3.vertexBuffer = new Float32Array(vs*8); // x, y, z, nx, ny, nz, rgba, aid
  buffer3.vertexBuffer8 = new Uint8Array(buffer3.vertexBuffer.buffer);
  if (molmil.configBox.OES_element_index_uint) buffer3.indexBuffer = new Uint32Array(is*3);
  else buffer3.indexBuffer = new Uint16Array(is*3);
};

molmil.geometry.generateAtomsImposters = function() {
  var atoms2draw = this.atoms2draw, xna2draw = this.xna2draw, vdwR = molmil.configBox.vdwR, r, sphere, a, v, rgba,
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
    if (atoms2draw[a].displayMode == 1) r = molmil_dep.getKeyFromObject(vdwR, atoms2draw[a].element, vdwR.DUMMY)*molmil.configBox.vdwSphereMultiplier;
    else if (atoms2draw[a].displayMode == 2) r = .33;
    else r = atoms2draw[a].stickRadius || molmil.configBox.stickRadius;

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
  
  var atomlist = [];
  for (a=0; a<xna2draw.length; a++) {atomlist.push(xna2draw[a][0]); atomlist.push(xna2draw[a][1]);}
  
  for (a=0; a<atomlist.length; a++) {
    if (atomlist[a].displayMode == 1) r = molmil_dep.getKeyFromObject(vdwR, atomlist[a].element, vdwR.DUMMY)*molmil.configBox.vdwSphereMultiplier;
    else if (atomlist[a].displayMode == 2) r = .33;
    else r = atomlist[a].stickRadius || molmil.configBox.stickRadius;

    tmp = mdl;
    if (atomlist[a].chain.modelsXYZ.length <= mdl) mdl = 0;
    
    x = atomlist[a].chain.modelsXYZ[mdl][atomlist[a].xyz];
    y = atomlist[a].chain.modelsXYZ[mdl][atomlist[a].xyz+1];
    z = atomlist[a].chain.modelsXYZ[mdl][atomlist[a].xyz+2];
    rgba = atomlist[a].molecule.rgba;
    
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
    
      vBuffer[vP++] = atomlist[a].AID; // ID
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
  var atoms2draw = this.atoms2draw, xna2draw = this.xna2draw, vdwR = molmil.configBox.vdwR, r, sphere, a, v, rgba, vBuffer = this.buffer1.vertexBuffer, iBuffer = this.buffer1.indexBuffer, vP = this.buffer1.vP, iP = this.buffer1.iP, detail_lv = this.detail_lv,
  vBuffer8 = this.buffer1.vertexBuffer8, vP8 = vP*4;
    
  var p = vP/8;
  
  var mdl = this.modelId || 0, tmp;

  var x, y, z;
  
  sphere = this.getSphere(1.7, detail_lv);
  var nov = sphere.vertices.length/3;
  
  for (a=0; a<atoms2draw.length; a++) {
    if (atoms2draw[a].displayMode == 1) r = molmil_dep.getKeyFromObject(vdwR, atoms2draw[a].element, vdwR.DUMMY)*molmil.configBox.vdwSphereMultiplier;
    else if (atoms2draw[a].displayMode == 2) r = .33;
    else r = atoms2draw[a].stickRadius || molmil.configBox.stickRadius;
  
    sphere = this.getSphere(r, detail_lv);
  
    for (v=0; v<sphere.indices.length; v++, iP++) iBuffer[iP] = sphere.indices[v]+p;
    
    tmp = mdl;
    if (atoms2draw[a].chain.modelsXYZ.length <= mdl) mdl = 0;
    
    x = atoms2draw[a].chain.modelsXYZ[mdl][atoms2draw[a].xyz];
    y = atoms2draw[a].chain.modelsXYZ[mdl][atoms2draw[a].xyz+1];
    z = atoms2draw[a].chain.modelsXYZ[mdl][atoms2draw[a].xyz+2];
    rgba = atoms2draw[a].rgba;
    if (rgba[3] != 255) this.buffer1.alphaMode = true;
    
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
  
  var atomlist = [];
  for (a=0; a<xna2draw.length; a++) {atomlist.push(xna2draw[a][0]); atomlist.push(xna2draw[a][1]);}
  
  for (a=0; a<atomlist.length; a++) {
    if (atomlist[a].displayMode == 1) r = molmil_dep.getKeyFromObject(vdwR, atomlist[a].element, vdwR.DUMMY)*molmil.configBox.vdwSphereMultiplier;
    else if (atomlist[a].displayMode == 2) r = .33;
    else r = atomlist[a].stickRadius || molmil.configBox.stickRadius;
  
    sphere = this.getSphere(r, detail_lv);
  
    for (v=0; v<sphere.indices.length; v++, iP++) iBuffer[iP] = sphere.indices[v]+p;
    
    tmp = mdl;
    if (atomlist[a].chain.modelsXYZ.length <= mdl) mdl = 0;
    
    x = atomlist[a].chain.modelsXYZ[mdl][atomlist[a].xyz];
    y = atomlist[a].chain.modelsXYZ[mdl][atomlist[a].xyz+1];
    z = atomlist[a].chain.modelsXYZ[mdl][atomlist[a].xyz+2];
    rgba = atomlist[a].molecule.rgba;
    
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
      
      vBuffer[vP++] = atomlist[a].AID; // ID
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
  
  var p = vP/8, x, y, z, x2, y2, z2, m, rgba, v;
  
  var rotationMatrix = mat4.create();
  var vertex = [0, 0, 0, 0], normal = [0, 0, 0, 0], dx, dy, dz, dij, angle;
  
  //bonds
  for (var b=0; b<bonds2draw.length; b++) {
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
    
    r = bonds2draw[b][0].stickRadius || molmil.configBox.stickRadius;
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
  
  var xna2draw = this.xna2draw;

  for (var b=0; b<xna2draw.length; b++) {
    
    tmp = mdl;
    if (xna2draw[b][0].chain.modelsXYZ.length <= mdl) mdl = 0;
    
    x = xna2draw[b][0].chain.modelsXYZ[mdl][xna2draw[b][0].xyz];
    y = xna2draw[b][0].chain.modelsXYZ[mdl][xna2draw[b][0].xyz+1];
    z = xna2draw[b][0].chain.modelsXYZ[mdl][xna2draw[b][0].xyz+2];
    
    x2 = xna2draw[b][1].chain.modelsXYZ[mdl][xna2draw[b][1].xyz];
    y2 = xna2draw[b][1].chain.modelsXYZ[mdl][xna2draw[b][1].xyz+1];
    z2 = xna2draw[b][1].chain.modelsXYZ[mdl][xna2draw[b][1].xyz+2];
    
    dx = x-x2;
    dy = y-y2;
    dz = z-z2;
    dij = Math.sqrt((dx*dx) + (dy*dy) + (dz*dz));
    
    dx /= dij; dy /= dij; dz /= dij;
    angle = Math.acos(-dz);
    
    mat4.identity(rotationMatrix);
    mat4.rotate(rotationMatrix, rotationMatrix, angle, [dy, -dx, 0.0]);
    
    r = xna2draw[b][0].stickRadius || molmil.configBox.stickRadius;
    offsetX = 0;
    offsetY = 0;
    offsetZ = 0;

    if (xna2draw[b][2] == 2) {
      r = .075;
      offsetX = -.075;
    }
    rgba = xna2draw[b][0].molecule.rgba;
    
    for (v=0; v<cylinder.indices.length; v++, iP++) iBuffer[iP] = cylinder.indices[v]+p; // a2
    for (v=0; v<cylinder.vertices.length; v+=3, vP8+=32) {
      vec3.transformMat4(vertex, [(cylinder.vertices[v]*r)+offsetX, (cylinder.vertices[v+1]*r)+offsetY, (cylinder.vertices[v+2]+offsetZ)*dij*2], rotationMatrix);
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
  var c, surf, surfaces = [], surfaces2 = [], verts = 0, idcs = 0, settings, alpha = false;
  
  for (c=0; c<chains.length; c++) {
    if (chains[c].displayMode == molmil.displayMode_ChainSurfaceCG) {
      if (chains[c].HQsurface) surf = molmil.coarseSurface(chains[c], molmil.configBox.HQsurface_gridSpacing, 1.4);
      else surf = molmil.coarseSurface(chains[c], 7.5, 7.5*.75, {deproj: true});
      surf.rgba = chains[c].rgba;
      surfaces.push(surf);
      verts += surf.vertices.length;
      idcs += surf.faces.length*3;
      alpha = alpha || surf.rgba[3] != 255;
    }
    else if (chains[c].displayMode == molmil.displayMode_ChainSurfaceSimple) {
      settings = chains[c].displaySettings || {};
      settings.skipProgram = true;
      surf = molmil.tubeSurface(chains[c], settings, soup);
      verts += surf.vBuffer.length;
      idcs += surf.iBuffer.length;
      surf.rgba = chains[c].rgba;
      surfaces2.push(surf);
      alpha = alpha || surf.rgba[3] != 255;
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
  if (buffer4.alphaMode != alpha) buffer4.reinit = true;
  buffer4.alphaMode = alpha;
  buffer4.vertexBuffer = vertices;
  buffer4.vertexBuffer8 = vertices8;
  buffer4.indexBuffer = indices;
  buffer4.vertexSize = 7;
}

// ** build cartoon representation **
molmil.geometry.generateCartoon = function() {
  var chains = this.cartoonChains, c, b, b2, m, chain, line, tangents, binormals, normals, rgba, aid, ref, i, TG, BN, N, t = 0, normal, binormal, vec = [0, 0, 0], delta = 0.0001, t_ranges, BNs, currentBlock;
  var noi = this.noi;
  var novpr = this.novpr;
  
  var nowp, wp, tmp, rotationMatrix, identityMatrix, theta, smallest;
  
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
          t = this.buildSheet(t_ranges[b], t_ranges[b+1], line, tangents, normals, binormals, rgba, aid, currentBlock.isFirst, currentBlock.isLast, chain.cartoonRadius || this.radius); // bad
          continue;
        }
        else if (currentBlock.rocket) {
          if (currentBlock.skip) continue;

          
          t = this.buildLoop(t_ranges[b], t_ranges[b]+currentBlock.rocketPre+(currentBlock.rocketPre ? 1 : 0), line, tangents, normals, binormals, rgba, aid, chain.cartoonRadius || this.radius);
          t = this.buildRocket(t_ranges[b]+currentBlock.rocketPre, t_ranges[b+1]-currentBlock.rocketPost, line, tangents, normals, binormals, rgba, aid, currentBlock.isLast, chain.cartoonRadius || this.radius);
          t = this.buildLoop(t_ranges[b+1]-currentBlock.rocketPost, t_ranges[b+1], line, tangents, normals, binormals, rgba, aid, chain.cartoonRadius || this.radius);

          continue;
        }
        else if (currentBlock.sndStruc == 3) { // caps also need to be added...
          if (currentBlock.isFirst) {
            this.buildLoopNcap(t_ranges[b], line, tangents, normals, binormals, rgba, aid, chain.cartoonRadius || this.radius); t++;
            t_ranges[b] += 1;
          }
          t = this.buildHelix(t_ranges[b], t_ranges[b+1], line, tangents, normals, binormals, rgba, aid, currentBlock, chain.cartoonRadius || this.radius);
          if (currentBlock.isLast) {
            this.buildLoopCcap(t_ranges[b+1]-1, line, tangents, normals, binormals, rgba, aid, chain.cartoonRadius || this.radius);
          }
          continue;
        }
      }

      if (currentBlock.isFirst) {
        this.buildLoopNcap(t_ranges[b], line, tangents, normals, binormals, rgba, aid, chain.cartoonRadius || this.radius); t++;
        t_ranges[b] += 1;
      }
      
      t = this.buildLoop(t_ranges[b], t_ranges[b+1], line, tangents, normals, binormals, rgba, aid, chain.cartoonRadius || this.radius);
      
      if (currentBlock.isLast) {
        this.buildLoopCcap(t_ranges[b+1]-1, line, tangents, normals, binormals, rgba, aid, chain.cartoonRadius || this.radius);
      }
    }
  }
};

// ** n-terminal loop (cap) **
molmil.geometry.buildLoopNcap = function(t, P, T, N, B, rgba, aid, coreRadius) {
  var dome = this.dome[0], radius = coreRadius, i, ringTemplate = this.ringTemplate;
  
  
  var vBuffer = this.buffer3.vertexBuffer, iBuffer = this.buffer3.indexBuffer, vP = this.buffer3.vP, iP = this.buffer3.iP, Px, Py, Pz, Nx, Ny, Nz, Bx, By, Bz, Tx, Ty, Tz, rgba_, aid_,
  vBuffer8 = this.buffer3.vertexBuffer8, vP8 = vP*4;
  var p = vP*.125;

  Px = P[t][0], Py = P[t][1], Pz = P[t][2], Tx = T[t][0], Ty = T[t][1], Tz = T[t][2], Nx = N[t][0], Ny = N[t][1], Nz = N[t][2], Bx = B[t][0], By = B[t][1], Bz = B[t][2], rgba_ = rgba[t], aid_ = aid[t];
  if (rgba_[3] != 255) this.buffer3.alphaMode = true;
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
molmil.geometry.buildLoopCcap = function(t, P, T, N, B, rgba, aid, coreRadius) {
  var dome = this.dome[1], radius = coreRadius, i, ringTemplate = this.ringTemplate;
  
  var vBuffer = this.buffer3.vertexBuffer, iBuffer = this.buffer3.indexBuffer, vP = this.buffer3.vP, iP = this.buffer3.iP, Px, Py, Pz, Nx, Ny, Nz, Bx, By, Bz, Tx, Ty, Tz, rgba_, aid_,
  vBuffer8 = this.buffer3.vertexBuffer8, vP8 = vP*4;
  var p = vP*.125;
  
  Px = P[t][0], Py = P[t][1], Pz = P[t][2], Tx = T[t][0], Ty = T[t][1], Tz = T[t][2], Nx = N[t][0], Ny = N[t][1], Nz = N[t][2], Bx = B[t][0], By = B[t][1], Bz = B[t][2], rgba_ = rgba[t], aid_ = aid[t];
  if (rgba_[3] != 255) this.buffer3.alphaMode = true;
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
molmil.geometry.buildLoop = function(t, t_next, P, T, N, B, rgba, aid, coreRadius) {
  var dome = this.dome[0], radius = coreRadius, i, novpr = this.novpr;
  
  var ringTemplate = this.ringTemplate, radius = coreRadius, Px, Py, Pz, Nx, Ny, Nz, Bx, By, Bz, Tx, Ty, Tz, rgba_, aid_;
  
  var vBuffer = this.buffer3.vertexBuffer, iBuffer = this.buffer3.indexBuffer, vP = this.buffer3.vP, iP = this.buffer3.iP,
  vBuffer8 = this.buffer3.vertexBuffer8, vP8 = vP*4;
  var p = vP*.125;
  var p_pre = p-novpr;
  
  for (t; t<t_next; t++) {
    Px = P[t][0], Py = P[t][1], Pz = P[t][2], Tx = T[t][0], Ty = T[t][1], Tz = T[t][2], Nx = N[t][0], Ny = N[t][1], Nz = N[t][2], Bx = B[t][0], By = B[t][1], Bz = B[t][2], rgba_ = rgba[t], aid_ = aid[t];
    if (rgba_[3] != 255) this.buffer3.alphaMode = true;
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
molmil.geometry.buildRocket = function(t, t_next, P, T, N, B, rgba, aid, isLast, coreRadius) {
  var radius = 1.15, i, novpr = this.novpr, go = false;
  var ringTemplate = this.ringTemplate, Px, Py, Pz, Nx, Ny, Nz, Bx, By, Bz, Tx, Ty, Tz, rgba_, aid_;
  
  var vBuffer = this.buffer3.vertexBuffer, iBuffer = this.buffer3.indexBuffer, vP = this.buffer3.vP, iP = this.buffer3.iP,
  vBuffer8 = this.buffer3.vertexBuffer8, vP8 = vP*4;
  var p = vP*.125;
  var p_pre = p-novpr;
  
  var before = vP;
  
  // N-terminal cap: flat (1-ring + 1 vertices)
  
  Px = P[t][0], Py = P[t][1], Pz = P[t][2], Tx = T[t][0], Ty = T[t][1], Tz = T[t][2], Nx = N[t][0], Ny = N[t][1], Nz = N[t][2], Bx = B[t][0], By = B[t][1], Bz = B[t][2], rgba_ = rgba[t], aid_ = aid[t];
  if (rgba_[3] != 255) this.buffer3.alphaMode = true;

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
    if (rgba_[3] != 255) this.buffer3.alphaMode = true;
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
    
    
  radius = coreRadius;

  if (! isLast) {
    var h = coreRadius;

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
molmil.geometry.buildHelix = function(t, t_next, P, T, N, B, rgba, aid, currentBlock, coreRadius) {
  var dome = this.dome[0], radius = coreRadius, i, novpr = this.novpr;

  var ringTemplate = this.ringTemplate, radius = coreRadius, Px, Py, Pz, Nx, Ny, Nz, Bx, By, Bz, Tx, Ty, Tz, rgba_, aid_;
  var cartoon_highlight_color = molmil.configBox.cartoon_highlight_color;
  
  var vBuffer = this.buffer3.vertexBuffer, iBuffer = this.buffer3.indexBuffer, vP = this.buffer3.vP, iP = this.buffer3.iP,
  vBuffer8 = this.buffer3.vertexBuffer8, vP8 = vP*4;
  var p = vP*.125;
  var p_pre = p-novpr;
  
  var factor, Ys;
  
  var invertedBinormals = currentBlock.invertedBinormals, Nresume = currentBlock.Nresume, Cresume = currentBlock.Cresume;

  var tmp = [0, 0], noi = this.noi, t_start = t, n = Nresume ? noi : 0;
  for (t; t<t_next; t++) {
    Px = P[t][0], Py = P[t][1], Pz = P[t][2], Tx = T[t][0], Ty = T[t][1], Tz = T[t][2], Nx = N[t][0], Ny = N[t][1], Nz = N[t][2], Bx = B[t][0], By = B[t][1], Bz = B[t][2], rgba_ = rgba[t], aid_ = aid[t];
    if (rgba_[3] != 255) this.buffer3.alphaMode = true;

    if (! Nresume && t < t_start+noi) {factor = (n/noi); n++;}
    else if (! Cresume && t > t_next-noi-2) {factor = (n/(noi)); n--;}
    else factor = 1.0;
    Ys = (5*factor)+1.0;

    for (i=0; i<ringTemplate.length; i++, vP8+=32) {
      vBuffer[vP++] = radius*ringTemplate[i][0] * Nx + Ys*radius*ringTemplate[i][1] * Bx + Px;
      vBuffer[vP++] = radius*ringTemplate[i][0] * Ny + Ys*radius*ringTemplate[i][1] * By + Py;
      vBuffer[vP++] = radius*ringTemplate[i][0] * Nz + Ys*radius*ringTemplate[i][1] * Bz + Pz;

      tmp[0] = Ys*ringTemplate[i][0]; tmp[1] = ringTemplate[i][1]; vec2.normalize(tmp, tmp);
      vBuffer[vP++] = tmp[0] * Nx + tmp[1] * Bx;
      vBuffer[vP++] = tmp[0] * Ny + tmp[1] * By;
      vBuffer[vP++] = tmp[0] * Nz + tmp[1] * Bz;
      
      if ((factor > .5 && ((invertedBinormals && vBuffer[vP-3]*Nx + vBuffer[vP-2]*Ny + vBuffer[vP-1]*Nz < -0.01) || (! invertedBinormals && vBuffer[vP-3]*Nx + vBuffer[vP-2]*Ny + vBuffer[vP-1]*Nz > 0.01))) && cartoon_highlight_color != -1) {
        vBuffer8[vP8+24] = cartoon_highlight_color[0];
        vBuffer8[vP8+25] = cartoon_highlight_color[1];
        vBuffer8[vP8+26] = cartoon_highlight_color[2];
        vBuffer8[vP8+27] = rgba_[3];
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
molmil.geometry.buildSheet = function(t, t_next, P, T, N, B, rgba, aid, isFirst, isLast, coreRadius) {
  var dome = this.dome[0], radius = coreRadius, i, novpr = this.novpr;
  var ringTemplate = this.ringTemplate, radius = coreRadius, Px, Py, Pz, Nx, Ny, Nz, Bx, By, Bz, Tx, Ty, Tz, rgba_, aid_;
  
  var cartoon_highlight_color = molmil.configBox.cartoon_highlight_color;
  
  
  var vBuffer = this.buffer3.vertexBuffer, iBuffer = this.buffer3.indexBuffer, vP = this.buffer3.vP, iP = this.buffer3.iP,
  vBuffer8 = this.buffer3.vertexBuffer8, vP8 = vP*4;
  var p = vP*.125;
  var p_pre = p-novpr;
  var squareVertices = this.squareVertices, noi = this.noi, squareVerticesN = this.squareVerticesN, squareVerticesNhead = this.squareVerticesNhead, flag;
  
  var h = this.sheetHeight, w = h*8;
  
  if (! isFirst) {
    Px = (P[t][0]*.75)+(P[t+1][0]*.25), Py = (P[t][1]*.75)+(P[t][1]*.25), Pz = (P[t][2]*.75)+(P[t][2]*.25), Tx = T[t-1][0], Ty = T[t-1][1], Tz = T[t-1][2], 
    Nx = N[t-1][0], Ny = N[t-1][1], Nz = N[t-1][2], Bx = B[t-1][0], By = B[t-1][1], Bz = B[t-1][2], rgba_ = rgba[t-1], aid_ = aid[t];
    if (rgba_[3] != 255) this.buffer3.alphaMode = true;
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
  if (rgba_[3] != 255) this.buffer3.alphaMode = true;
  for (i=0; i<4; i++, vP8+=32) {
    vBuffer[vP++] = h*squareVertices[i][0] * Nx + w*squareVertices[i][1] * Bx + Px;
    vBuffer[vP++] = h*squareVertices[i][0] * Ny + w*squareVertices[i][1] * By + Py;
    vBuffer[vP++] = h*squareVertices[i][0] * Nz + w*squareVertices[i][1] * Bz + Pz;
      
    vBuffer[vP++] = -Tx;
    vBuffer[vP++] = -Ty;
    vBuffer[vP++] = -Tz;
    
    if (cartoon_highlight_color != -1) {
      vBuffer8[vP8+24] = cartoon_highlight_color[0];
      vBuffer8[vP8+25] = cartoon_highlight_color[1];
      vBuffer8[vP8+26] = cartoon_highlight_color[2];
      vBuffer8[vP8+27] = rgba_[3];
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
  
  iBuffer[iP++] = p; iBuffer[iP++] = p+1; iBuffer[iP++] = p+2; iBuffer[iP++] = p; iBuffer[iP++] = p+2; iBuffer[iP++] = p+3;
  
  p += 4;
  // draw arrow tail
  
  var as = Math.ceil(noi/1.5);
  var dw = (h*12)/as;
  as = t_next - as;
  
  
  var n = 0;
  for (t; t<as; t++, n++) {
    Px = P[t][0], Py = P[t][1], Pz = P[t][2], Tx = T[t][0], Ty = T[t][1], Tz = T[t][2], Nx = N[t][0], Ny = N[t][1], Nz = N[t][2], Bx = B[t][0], By = B[t][1], Bz = B[t][2], rgba_ = rgba[t], aid_ = aid[t];
    if (rgba_[3] != 255) this.buffer3.alphaMode = true;
    for (i=0; i<4; i++, vP8+=32) {
      
      vBuffer[vP++] = h*squareVertices[i][0] * Nx + w*squareVertices[i][1] * Bx + Px;
      vBuffer[vP++] = h*squareVertices[i][0] * Ny + w*squareVertices[i][1] * By + Py;
      vBuffer[vP++] = h*squareVertices[i][0] * Nz + w*squareVertices[i][1] * Bz + Pz;
      
      vBuffer[vP++] = squareVerticesN[i][0] * Nx + squareVerticesN[i][1] * Bx;
      vBuffer[vP++] = squareVerticesN[i][0] * Ny + squareVerticesN[i][1] * By;
      vBuffer[vP++] = squareVerticesN[i][0] * Nz + squareVerticesN[i][1] * Bz;
      
      if ((i == 1 || i== 3) && cartoon_highlight_color != -1) {
        vBuffer8[vP8+24] = cartoon_highlight_color[0];
        vBuffer8[vP8+25] = cartoon_highlight_color[1];
        vBuffer8[vP8+26] = cartoon_highlight_color[2];
        vBuffer8[vP8+27] = rgba_[3];
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
      
      if ((i == 0 || i== 2) && cartoon_highlight_color != -1) {
        vBuffer8[vP8+24] = cartoon_highlight_color[0];
        vBuffer8[vP8+25] = cartoon_highlight_color[1];
        vBuffer8[vP8+26] = cartoon_highlight_color[2];
        vBuffer8[vP8+27] = rgba_[3];
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
  if (isLast) as--;

  for (; t<t_next; t++, n++) {
    if (t >= as) w -= dw;

    Px = P[t][0], Py = P[t][1], Pz = P[t][2], Tx = T[t][0], Ty = T[t][1], Tz = T[t][2], Nx = N[t][0], Ny = N[t][1], Nz = N[t][2], Bx = B[t][0], By = B[t][1], Bz = B[t][2], rgba_ = rgba[t], aid_ = aid[t];
    if (rgba_[3] != 255) this.buffer3.alphaMode = true;
    for (i=0; i<4; i++, vP8+=32) {
    
      vBuffer[vP++] = h*squareVertices[i][0] * Nx + w*squareVertices[i][1] * Bx + Px;
      vBuffer[vP++] = h*squareVertices[i][0] * Ny + w*squareVertices[i][1] * By + Py;
      vBuffer[vP++] = h*squareVertices[i][0] * Nz + w*squareVertices[i][1] * Bz + Pz;
      
      vBuffer[vP++] = squareVerticesNhead[i][0] * Nx + squareVerticesNhead[i][1] * Bx;
      vBuffer[vP++] = squareVerticesNhead[i][0] * Ny + squareVerticesNhead[i][1] * By;
      vBuffer[vP++] = squareVerticesNhead[i][0] * Nz + squareVerticesNhead[i][1] * Bz;
      
      if ((i == 1 || i== 3) && cartoon_highlight_color != -1) {
        vBuffer8[vP8+24] = cartoon_highlight_color[0];
        vBuffer8[vP8+25] = cartoon_highlight_color[1];
        vBuffer8[vP8+26] = cartoon_highlight_color[2];
        vBuffer8[vP8+27] = rgba_[3];
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
      
      vBuffer[vP++] = squareVerticesNhead[i+1][0] * Nx + squareVerticesNhead[i+1][1] * Bx;
      vBuffer[vP++] = squareVerticesNhead[i+1][0] * Ny + squareVerticesNhead[i+1][1] * By;
      vBuffer[vP++] = squareVerticesNhead[i+1][0] * Nz + squareVerticesNhead[i+1][1] * Bz;
      
      if ((i == 0 || i== 2) && cartoon_highlight_color != -1) {
        vBuffer8[vP8+24] = cartoon_highlight_color[0];
        vBuffer8[vP8+25] = cartoon_highlight_color[1];
        vBuffer8[vP8+26] = cartoon_highlight_color[2];
        vBuffer8[vP8+27] = rgba_[3];
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
    if (rgba_[3] != 255) this.buffer3.alphaMode = true;
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

molmil.geometry.generateSNFG = function() {
  // generate snfg objects...

  var defaultRadius = 4.0, radius, length, transVec, rotationMatrix = mat4.create(), angle, vertex = vec3.create(), normal = vec3.create();

  var sphere = this.getSphere(0.5, this.detail_lv);
  
  var cylinder = this.getCylinder(this.detail_lv);
  
  var mdl = this.modelId || 0, tmp;
  var bonds2draw = this.bonds2draw,
  vBuffer = this.buffer1.vertexBuffer, iBuffer = this.buffer1.indexBuffer, vP = this.buffer1.vP, iP = this.buffer1.iP, detail_lv = this.detail_lv,
  vBuffer8 = this.buffer1.vertexBuffer8, vP8 = vP*4, p = vP/8;
  
  // loop over everything...
  
  var obj, mesh, rgbas = [null, null], rgba;
  for (var i=0; i<this.snfg_objs.length; i++) {
    obj = this.snfg_objs[i];
    
    if (obj.mesh.type == "sphere") mesh = sphere;
    else if (obj.mesh.type == "cylinder") mesh = cylinder;
    else mesh = molmil.shapes3d[obj.mesh.type];

    for (v=0; v<mesh.indices.length; v++, iP++) iBuffer[iP] = mesh.indices[v]+p;
    
    rgbas[0] = obj.mesh.rgba;
    rgbas[1] = obj.mesh.rgba2 || obj.mesh.rgba;
    radius = obj.radius;
    if (! radius) radius = obj.mode == 3 ? 4 : 2;
    length = (obj.length || 0.5)*2;
    mat4.identity(rotationMatrix);
    if (obj.backvec) {
      angle = Math.acos(-obj.backvec[2]);
      mat4.rotate(rotationMatrix, rotationMatrix, angle, [obj.backvec[1], -obj.backvec[0], 0.0]);
    }
    else if (obj.upvec) {
      angle = Math.acos(-obj.upvec[1]);
      mat4.rotate(rotationMatrix, rotationMatrix, angle, [-obj.upvec[2], 0.0, obj.upvec[0]]);
    }
    else if (obj.sidevec) {
      angle = Math.acos(-obj.sidevec[0]);
      mat4.rotate(rotationMatrix, rotationMatrix, angle, [0.0, obj.sidevec[2], -obj.sidevec[1]]);
    }
    
    if (obj.radius) length /= radius;
    for (v=0; v<mesh.vertices.length; v+=3, vP8+=32) {
      vec3.transformMat4(vertex, [mesh.vertices[v]*radius, mesh.vertices[v+1]*radius, mesh.vertices[v+2]*radius*length], rotationMatrix);
      vec3.transformMat4(normal, [mesh.normals[v], mesh.normals[v+1], mesh.normals[v+2]], rotationMatrix);

      vBuffer[vP++] = vertex[0]+obj.center[0];
      vBuffer[vP++] = vertex[1]+obj.center[1];
      vBuffer[vP++] = vertex[2]+obj.center[2];
      
      vBuffer[vP++] = normal[0];
      vBuffer[vP++] = normal[1];
      vBuffer[vP++] = normal[2];
      
      rgba = rgbas[mesh.rgba2idxs ? mesh.rgba2idxs[v/3] : 0];
      vBuffer8[vP8+24] = rgba[0];
      vBuffer8[vP8+25] = rgba[1];
      vBuffer8[vP8+26] = rgba[2];
      vBuffer8[vP8+27] = rgba[3];
      vP++
      
      vBuffer[vP++] = -1; // ID
    }
    p += mesh.vertices.length/3;
    
  }

  this.buffer1.vP = vP;
  this.buffer1.iP = iP;  
};

// ** priestle smoothing for loop & sheet regions **
molmil.priestle_smoothing = function(points, from, to, skip, steps) {
  var s, m, nom = to-from, tmp = new Array(nom), local = new Array(nom);
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

molmil.polynomialFit = function(x, y, order) {
  return molmil.loadPlugin(molmil.settings.src+"plugins/misc.js", this.polynomialFit, this, [x, y, order]); 
}

molmil.polynomialCalc = function(x, polynomial) {
  var i, y = polynomial[0];
  for (i=1; i<polynomial.length; i++) y += polynomial[i]*Math.pow(x, i);
  return y;
}

// ** prepare for secondary structure element representation; transport frame calculation **
molmil.prepare2DRepr = function (chain, mdl) {
  if (chain.modelsXYZ.length <= mdl) mdl = 0;

  var ha = 32*Math.PI/180, hb = -11*Math.PI/180, cha = Math.cos(ha), sha = Math.sin(ha), chb = Math.cos(hb), shb = Math.sin(hb), hhf = 4.7, ohf = 0.5, dhf = 6.5, hf, 
  //var ha = 0*Math.PI/180, hb = 0*Math.PI/180, cha = Math.cos(ha), sha = Math.sin(ha), chb = Math.cos(hb), shb = Math.sin(hb), hhf = 4.7, ohf = .5, 
  cvec = [0, 0, 0], rvec = [0, 0, 0], vec1 = [0, 0, 0], vec2 = [0, 0, 0], smoothFactor = molmil.configBox.smoothFactor, skip;
  
  if (chain.molecules.length < 2 || chain.isHet) {
    if (chain.SNFG) return;
    return chain.displayMode = 0;
  }
  var twoDcache = chain.twoDcache = [], m, previous_sndStruc, current_sndStruc, currentBlock, b, nor = chain.molecules.length, m0, m1, m2, m3, BN, temp = [], n, smooth, maxR;
  
  for (m=0; m<nor; m++) {
    if (! chain.molecules[m].CA) continue;
    current_sndStruc = chain.molecules[m].sndStruc;
    if (current_sndStruc != previous_sndStruc || chain.molecules[m].previous == null) {
      previous_sndStruc = chain.molecules[m].sndStruc;
      twoDcache.push(currentBlock = {molecules: [], xyz: [], sndStruc: previous_sndStruc});
    }
    currentBlock.molecules.push(chain.molecules[m]);
    
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
                           //currentBlock.molecules[0].previous.name == "ACE" ||
                           ! currentBlock.molecules[0].previous.CA || b == 0;
    currentBlock.isLast = currentBlock.molecules[currentBlock.molecules.length-1].next == null || 
                          //currentBlock.molecules[currentBlock.molecules.length-1].next.name == "NME" ||
                          ! currentBlock.molecules[currentBlock.molecules.length-1].next.CA || b == twoDcache.length-1; 
    if (currentBlock.sndStruc == 3) { // helix or turn...
      if (currentBlock.molecules.length > 2 && chain.displayMode == 4) {
        
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
      
      // get rid of this...
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
      else if (currentBlock.molecules.length <= 2) currentBlock.sndStruc = 1;
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
          if (m > 0 && vec1[0]*vec1[0] + vec1[1]*vec1[1] + vec1[2]*vec1[2] > maxR) {currentBlock.tangents[m] = currentBlock.tangents[m-1];}
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
  this.roll = 0;
  this.TransX = 0;
  this.TransY = 0;
  this.TransZ = 0;
  this.pitchAngle = 0;
  this.headingAngle = 0;
  this.rollAngle = 0;
  
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
  
  this.cameraHistory = {};
  
};

// ** resets the buffer **
molmil.render.prototype.clear = function() {
  for (var i=0; i<this.programs.length; i++) {
    this.gl.deleteBuffer(this.programs[i].vertexBuffer);
    this.gl.deleteBuffer(this.programs[i].indexBuffer);
  }
  this.programs = [];
  this.program1 = this.program2 = this.program3 = this.program4 = this.program5 = undefined;
  this.cameraHistory = {};
};

molmil.render.prototype.addProgram = function(program) {
  if (program.settings.alphaMode) this.programs.push(program);
  else this.programs.unshift(program);
}

molmil.render.prototype.removeProgram = function(program) {
  if (program instanceof Array) {
    for (var i=0; i<program.length; i++) this.removeProgram(program[i]);
    return;
  }
  var ndx = this.programs.indexOf(program);
  if (ndx > -1) this.programs.splice(ndx, 1);
}

molmil.render.prototype.removeProgramByName = function(idname) {
  var ndx = -1;
  for (var i=0; i<this.programs.length; i++) if (this.programs[i].idname == idname) ndx = i;
  if (ndx > -1) this.programs.splice(ndx, 1);
}

molmil.render.prototype.reloadSettings=function() {
  this.QLV = molmil.localStorageGET("molmil.settings_QLV");
  if (this.QLV == null) {
    this.QLV = 2;
    try {localStorage.setItem("molmil.settings_QLV", this.QLV);}
    catch (e) {}
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
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, res, res, 0, gl.RGBA, gl.UNSIGNED_BYTE, out);
  gl.bindTexture(gl.TEXTURE_2D, null);
  texture.loaded = true;

  return texture;
}

// ** initiates the WebGL context **
molmil.render.prototype.initGL = function(canvas, width, height) {
  var glAttribs = molmil.configBox.glAttribs || {};
  if (molmil.vrDisplay && molmil.vrDisplay.capabilities.hasExternalDisplay) glAttribs.preserveDrawingBuffer = true;
  
  if (molmil.configBox.webGL2) {
    if (window.WebGL2RenderingContext) {
      this.defaultContext = canvas.getContext("webgl2", glAttribs);
      if (! this.defaultContext) molmil.configBox.webGL2 = false;
      else {
        molmil.configBox.OES_element_index_uint = true;
        molmil.configBox.EXT_frag_depth = true;
      }
    }
    else molmil.configBox.webGL2 = false;
  }
  if (! molmil.configBox.webGL2) {
    this.defaultContext = this.defaultContext || canvas.getContext("webgl", glAttribs) || canvas.getContext("experimental-webgl", glAttribs);
  }
  
  canvas.renderer = this;
  
  this.FBOs = {};
  
  if (! this.defaultContext) {
    this.altCanvas = molmil.__webglNotSupported__(canvas);
    return false;
  }
  this.gl = this.defaultContext;
	this.gl.boundAttributes = {};
  
  if (! molmil.configBox.webGL2) {
    molmil.configBox.OES_element_index_uint = this.gl.getExtension('OES_element_index_uint');
  }
  
  this.textures.atom_imposter = molmil.generateSphereImposterTexture(128, this.gl);
  
  this.gl.INDEXINT = molmil.configBox.OES_element_index_uint ? this.gl.UNSIGNED_INT : this.gl.UNSIGNED_SHORT;
  this.gl.__glAttribs = glAttribs;

  this.width = width | canvas.width;
  this.height = height | canvas.height;
  
  this.gl.viewportWidth = this.width;
  this.gl.viewportHeight = this.height;
  
  canvas.onmousedown = molmil.handle_molmilViewer_mouseDown;
  document.onmouseup = molmil.handle_molmilViewer_mouseUp;
  document.onmousemove = molmil.handle_molmilViewer_mouseMove;
  
  if (! molmil.vrDisplay) {
    
    window.addEventListener("vrdisplaypointerrestricted", function() {
      canvas.requestPointerLock();
    }, false);
    
    window.addEventListener("vrdisplaypointerunrestricted", function() {
      document.exitPointerLock()
      canvas.bindTouch();
    }, false);
    
  //window.addEventListener('vrdisplaypointerrestricted', () => webglCanvas.requestPointerLock(), false);
  //window.addEventListener('vrdisplaypointerunrestricted', document.exitPointerLock(), false);
    
    canvas.bindMouseTouch = function() {
      canvas.addEventListener("wheel", molmil.handle_molmilViewer_mouseScroll, false);
      canvas.addEventListener("touchstart", molmil.handle_molmilViewer_touchStart, false);
      canvas.addEventListener("touchmove", molmil.handle_molmilViewer_touchMove, false);
      canvas.addEventListener("touchend", molmil.handle_molmilViewer_touchEnd, false);
    };
    
    canvas.bindMouseTouch();
    canvas.addEventListener("webglcontextlost", function(event) {event.preventDefault();}, false);
    canvas.addEventListener("webglcontextrestored", function() {
      this.reinitRenderer();
    }, false);
  }
  
  this.gl.clearColor.apply(this.gl, molmil.configBox.BGCOLOR);
  this.gl.enable(this.gl.DEPTH_TEST);
  
  if (molmil.configBox.cullFace) {
    this.gl.enable(this.gl.CULL_FACE);
    this.gl.cullFace(this.gl.BACK);
  }
  
  this.canvas = canvas;
  
  var h = this.gl.getParameter(this.gl.ALIASED_LINE_WIDTH_RANGE);
  this.angle = h && h.length == 2 && h[0] == 1 && h[1] == 1;

  if (this.billboardProgram) {
    for (var i=0; i<this.billboardProgram.data.length; i++) this.billboardProgram.data[i].status = false
  }
  else {
    // add labels program here...
    this.billboardProgram = {};
    this.billboardProgram.data = this.soup.texturedBillBoards; this.billboardProgram.renderer = this;
    this.billboardProgram.render = function(modelViewMatrix, COR) {
      //first check for new/modified billboards (texturedBillBoards[i].status == false)
      
      var N = [], i, status = true, scaleFactor;
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

        var vbuffer = this.renderer.gl.createBuffer();
        this.renderer.gl.bindBuffer(this.renderer.gl.ARRAY_BUFFER, vbuffer);
        this.renderer.gl.bufferData(this.renderer.gl.ARRAY_BUFFER, vBuffer, this.renderer.gl.STATIC_DRAW);
  
        var ibuffer = this.renderer.gl.createBuffer();
        this.renderer.gl.bindBuffer(this.renderer.gl.ELEMENT_ARRAY_BUFFER, ibuffer);
        this.renderer.gl.bufferData(this.renderer.gl.ELEMENT_ARRAY_BUFFER, iBuffer, this.renderer.gl.STATIC_DRAW);
  
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
      
      this.renderer.gl.useProgram(this.shader.program);
      this.renderer.gl.uniformMatrix4fv(this.shader.uniforms.modelViewMatrix, false, modelViewMatrix);
      this.renderer.gl.uniformMatrix3fv(this.shader.uniforms.normalMatrix, false, normalMatrix);
      this.renderer.gl.uniformMatrix4fv(this.shader.uniforms.projectionMatrix, false, this.renderer.projectionMatrix);
      this.renderer.gl.uniform3f(this.shader.uniforms.COR, COR[0], COR[1], COR[2]);
      this.renderer.gl.uniform1f(this.shader.uniforms.focus, this.renderer.fogStart);
      this.renderer.gl.uniform1f(this.shader.uniforms.fogSpan, this.renderer.fogSpan);
      this.renderer.gl.uniform1f(this.shader.uniforms.disableFog, false);
      if (this.renderer.settings.slab) {
        this.renderer.gl.uniform1f(this.shader.uniforms.slabNear, -modelViewMatrix[14]+this.renderer.settings.slabNear-molmil.configBox.zNear);
        this.renderer.gl.uniform1f(this.shader.uniforms.slabFar, -modelViewMatrix[14]+this.renderer.settings.slabFar-molmil.configBox.zNear);
      }
      if (molmil.configBox.fogColor) this.renderer.gl.uniform4f(this.shader.uniforms.backgroundColor, molmil.configBox.fogColor[0], molmil.configBox.fogColor[1], molmil.configBox.fogColor[2], 1.0);
      else this.renderer.gl.uniform4f(this.shader.uniforms.backgroundColor, molmil.configBox.BGCOLOR[0], molmil.configBox.BGCOLOR[1], molmil.configBox.BGCOLOR[2], 1.0);

      // render
      this.renderer.gl.bindBuffer(this.renderer.gl.ARRAY_BUFFER, this.vertexBuffer); 
      this.renderer.gl.bindBuffer(this.renderer.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

      molmil.resetAttributes(this.renderer.gl);
      molmil.bindAttribute(this.renderer.gl, this.attributes.in_Position, 3, this.renderer.gl.FLOAT, false, 16, 0);
      molmil.bindAttribute(this.renderer.gl, this.attributes.in_ScreenSpaceOffset, 2, this.renderer.gl.SHORT, false, 16, 12);
      molmil.clearAttributes(this.renderer.gl);
    
      this.renderer.gl.enable(this.renderer.gl.BLEND);
      this.renderer.gl.blendFunc(this.renderer.gl.ONE, this.renderer.gl.ONE_MINUS_SRC_ALPHA);
      this.renderer.gl.depthMask(false);
    
    
      for (i=0; i<N.length; i++) {
        // set uniforms (e.g. screen-space translation...)
      
        this.renderer.gl.activeTexture(this.renderer.gl.TEXTURE0);
        this.renderer.gl.bindTexture(this.renderer.gl.TEXTURE_2D, N[i].texture);
        this.renderer.gl.uniform1i(this.shader.uniforms.textureMap, 0);
        
        scaleFactor = 0.0003*.5*(N[i].settings.scaleFactor||1);
        if (molmil.configBox.stereoMode == 3 && molmil.vrDisplay && ! N[i].settings.skipVRscale) scaleFactor *= 4;
        
        if (N[i].settings.customWidth && N[i].settings.customHeight) scaleFactor *= Math.min(N[i].settings.customHeight/N[i].texture.renderHeight, N[i].settings.customWidth/N[i].texture.renderWidth);
        this.renderer.gl.uniform1f(this.shader.uniforms.scaleFactor, scaleFactor);
        
        if (N[i].settings.viewpointAligned) this.renderer.gl.uniform1i(this.shader.uniforms.renderMode, 1);
        else this.renderer.gl.uniform1i(this.shader.uniforms.renderMode, 0);
        
        this.renderer.gl.uniform2f(this.shader.uniforms.sizeOffset, N[i].texture.renderWidth, N[i].texture.renderHeight);
        this.renderer.gl.uniform3f(this.shader.uniforms.positionOffset, N[i].settings.dx, N[i].settings.dy, N[i].settings.dz);
        
        if (N[i].settings.alwaysFront) {
          this.renderer.gl.disable(this.renderer.gl.DEPTH_TEST);
          this.renderer.gl.uniform1f(this.shader.uniforms.disableFog, true);
        }
        this.renderer.gl.drawElements(this.renderer.gl.TRIANGLES, 6, this.renderer.gl.INDEXINT, i*24);
        if (N[i].settings.alwaysFront) {
          this.renderer.gl.enable(this.renderer.gl.DEPTH_TEST);
          this.renderer.gl.uniform1f(this.shader.uniforms.disableFog, false);
        }
      }
    
      this.renderer.gl.disable(this.renderer.gl.BLEND);
      this.renderer.gl.depthMask(true);
    
    };
    this.billboardProgram.renderPicking = function() {};
  }
  
  for (var e in molmil.shapes3d) molmil.geometry.updateNormals(molmil.shapes3d[e]);

  return true;
};

molmil.render.prototype.reinitRenderer = function() {
  this.initGL(this);
  // we need to recompile the shaders (in case the GPU changed...)
  molmil.shaderEngine.recompile(this);
  this.buffers.atomSelectionBuffer = undefined;
  this.initBuffers();
};

molmil.render.prototype.initRenderer = function() { // use this to initalize the renderer, such as call initShaders...
  this.initShaders(molmil.configBox.glsl_shaders);
  this.resizeViewPort();
  molmil.geometry.registerPrograms(this, true);
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
      if (ploc.indexOf("//") == -1) request.Send(molmil.settings.src+ploc);
      else request.Send(ploc);
      molmil.shaderEngine.code[molmil.settings.src+ploc] = request.request.responseText;
    }
  }

  var name, fragmentShader, vertexShader, e, ploc, defines, vertDefines, fragDefines, programs = molmil.configBox.glsl_shaders, program, source;
  for (var p=0; p<programs.length; p++) {
    ploc = programs[p][0];
    name = programs[p][1] || ploc.replace(/\\/g,'/').replace( /.*\//, '' ).split(".")[0];
    exts = programs[p].length > 3 ? programs[p][3] : []; bad = false;
    bad = false, vertDefines = "", fragDefines = "";
    for (var i=0; i<exts.length; i++) {
      if (! molmil.configBox[exts[i]]) bad = true;
    }
    if (bad) continue;
    e = molmil.shaderEngine.code[molmil.settings.src+ploc];
    if (! e) continue;
    source = e.split("//#");
    program = JSON.parse(source[0]);
    program.name = name;
    program.vertexShader = source[1].substr(7);
    program.fragmentShader = source[2].substr(9);
    program.defines = programs[p][2] || ""; program.vertDefines = vertDefines; program.fragDefines = fragDefines;
    program.compile = function(global_defines) {
      this.program = renderer.gl.createProgram();
      molmil.setupShader(renderer.gl, this.name+"_v", this.program, global_defines+this.vertDefines+this.defines+this.vertexShader, renderer.gl.VERTEX_SHADER);
      molmil.setupShader(renderer.gl, this.name+"_f", this.program, global_defines+this.fragDefines+this.defines+this.fragmentShader, renderer.gl.FRAGMENT_SHADER);
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
  for (var i=0; i<this.soup.texturedBillBoards.length; i++) this.soup.texturedBillBoards[i].dynamicsUpdate();
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

molmil.render.prototype.renderPrograms = function(COR) {
  for (var p=0; p<this.programs.length; p++) {
    if (this.programs[p].nElements && this.programs[p].status) {
      if (this.programs[p].settings.alphaMode) this.programs[p].alphaMode_opaque_render(this.modelViewMatrix, COR);
      else if (! this.programs[p].settings.alphaSet) this.programs[p].render(this.modelViewMatrix, COR);
    }
  }
  
  for (var p=0; p<this.programs.length; p++) {
    if (this.programs[p].nElements && this.programs[p].status && (this.programs[p].settings.alphaMode || this.programs[p].settings.alphaSet)) this.programs[p].render(this.modelViewMatrix, COR);
  }
  
  // pass1: render only opaque meshes (standard)
  // pass2: render only transparent meshes to the z-buffer (so not to the frame buffer)
  // pass3: render only transparent meshes to frame buffer, alpha blending it (discard any pixel not equal to that in the depth buffer)
  
}

// ** renders the scene **
molmil.render.prototype.render = function() {
  if (! this.canvas.update || ! this.initBD) {
    if (molmil.vrDisplay) {
      var frameData = new VRFrameData(); molmil.vrDisplay.getFrameData(frameData);
      var curFramePose = frameData.pose;
      if (curFramePose.position == null && curFramePose.orientation == null) {
        if (molmil.vrDisplay.displayName == "HTC Vive DVT") molmil.vrDisplay.submitFrame();
        // maybe the above also needs to be enabled for the fujitsu one...
        return;
      }
    }
    else return;
  }
  else if (molmil.vrDisplay) {
    var frameData = new VRFrameData(); molmil.vrDisplay.getFrameData(frameData);
    var curFramePose = frameData.pose;
  }
  
  // figure out whether the VR scene has been updated, if not -> return to save power (and prevent overheating...)
  
  if (frameData && this.camera.vrXYZupdated) {
    var tempMat = mat4.copy(mat4.create(), frameData.leftViewMatrix);
    tempMat[12] = tempMat[13] = tempMat[14];
    var invMat = mat4.invert(mat4.create(), tempMat);
    var trans = vec3.transformMat4([0, 0, 0], this.camera.vrXYZ, invMat);
    this.camera.x += trans[0]; this.camera.y += trans[1]; this.camera.z += trans[2];
    this.camera.vrXYZ[0] = this.camera.vrXYZ[1] = this.camera.vrXYZ[2] = 0.0;
    this.camera.vrXYZupdated = false;
  }
  else if (frameData && molmil.vrDisplay.displayName.toLowerCase().indexOf("cardboard") != -1) {
    var epsilon1 = 0.0001, epsilon2 = 0.1, epsilon_cutoff = 0.001;
    // now, use two versions of epsilon...
    if (this.camera.vrMatrix_backup) {
      var a = this.camera.vrMatrix_backup, b = frameData.leftViewMatrix, now = Date.now();
      var temp = [Math.abs(a[0]-b[0]), Math.abs(a[1]-b[1]), Math.abs(a[2]-b[2]), Math.abs(a[3]-b[3]), Math.abs(a[4]-b[4]), Math.abs(a[5]-b[5]), Math.abs(a[6]-b[6]), Math.abs(a[7]-b[7]), Math.abs(a[8]-b[8]), Math.abs(a[9]-b[9]), Math.abs(a[10]-b[10]), Math.abs(a[11]-b[11]), Math.abs(a[12]-b[12]), Math.abs(a[13]-b[13]), Math.abs(a[14]-b[14]), Math.abs(a[15]-b[15])], maxDiff;
      maxDiff = Math.max.apply(null, temp);

      if (maxDiff < this.camera.vrMatrix_epsilon) {
        this.canvas.update = false;
        return;
      }
      
      // let's render
      if (this.camera.vrMatrix_epsilon == epsilon1) { // currently fast-polling mode
        if (maxDiff < epsilon_cutoff) { // not moving that much (twilight zone)
          if (this.camera.vrMatrix_timestamp+2000 < now) { // so the matrix has been more-or-less stable at least for two seconds 
            this.camera.vrMatrix_epsilon = epsilon2; // switch to slow-polling mode
            this.camera.vrMatrix_timestamp = now; // reset the timer
          }
        }
        else this.camera.vrMatrix_timestamp = now;
      }
      else { // currently low-polling mode
        this.camera.vrMatrix_epsilon = epsilon1; // switch to fast-polling mode
        this.camera.vrMatrix_timestamp = now; // reset the timer
      }
    }
    
    if (! this.camera.vrMatrix_backup) { // only set this for cardboard renderer...
      this.camera.vrMatrix_backup = mat4.create();
      this.camera.vrMatrix_epsilon = epsilon1;
      this.camera.vrMatrix_timestamp = now;
    }
    mat4.copy(this.camera.vrMatrix_backup, frameData.leftViewMatrix);
  }

  if (this.canvas.update || molmil.vrDisplay) {
    if (this.canvas.update != -1) {
      for (var c=0; c<this.soup.canvases.length; c++) if (this.soup.canvases[c] != this.canvas) this.soup.canvases[c].update = -1;
    }
    this.canvas.update = false;
    
    this.camera.pitchAngle = this.pitchAngle || this.pitch*Math.min(Math.max((Math.pow(Math.abs(this.camera.z), .1)*.25), .5), 2.);
    this.camera.headingAngle = this.headingAngle || this.heading*Math.min(Math.max((Math.pow(Math.abs(this.camera.z), .1)*.25), .5), 2.);
    this.camera.rollAngle = this.rollAngle || this.roll*Math.min(Math.max((Math.pow(Math.abs(this.camera.z), .1)*.25), .5), 2.);
    
    
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
  
    this.pitch=0, this.heading=0, this.TransX=0, this.TransY=0, this.TransZ = 0, this.pitchAngle = 0, this.headingAngle = 0, this.rollAngle = 0;

    this.camera.positionCamera();
    
    this.modelViewMatrix = this.camera.generateMatrix();
  
    if (molmil.configBox.projectionMode == 2) {
      var zoomFraction = -(this.camera.z*2)/molmil.configBox.zFar;
      mat4.ortho(this.projectionMatrix, -this.width*zoomFraction, this.width*zoomFraction, -this.height*zoomFraction, this.height*zoomFraction, Math.max(molmil.configBox.zNear, 0.1), this.camera.z+(molmil.configBox.zFar*10));
    }
  }
  else {
    var frameData = new VRFrameData();
    molmil.vrDisplay.getFrameData(frameData);
    this.canvas.update = false;
  }
  
  if (this.customFogRange) {
    this.fogStart = this.customFogRange[0];
    this.fogSpan  = this.customFogRange[1];
  }
  else {
    this.clearCut = ((1.0-Math.abs(this.camera.QView[0]))*this.soup.stdXYZ[0])+((1.0-Math.abs(this.camera.QView[1]))*this.soup.stdXYZ[1])+((1.0-Math.abs(this.camera.QView[2]))*this.soup.stdXYZ[2]);
    this.fogStart = -this.camera.z-(this.clearCut*.5);
    if (this.fogStart < molmil.configBox.zNear+1) this.fogStart = molmil.configBox.zNear+1;
    this.fogSpan = this.fogStart+(this.clearCut*2);
  }
 
  // rendering
  var BGCOLOR = molmil.configBox.BGCOLOR.slice();
  if (BGCOLOR[3] == 0) BGCOLOR[0] = BGCOLOR[1] = BGCOLOR[2] = 0;
  
  var COR = [0, 0, 0];
  var tmp = mat3.create(); mat3.fromMat4(tmp, this.modelViewMatrix);
  vec3.transformMat3(COR, this.soup.COR, tmp);

  if (molmil.configBox.jitRenderFunc) molmil.configBox.jitRenderFunc.apply(this, [{frameData: frameData}]);
  
  if (molmil.configBox.stereoMode && (molmil.configBox.stereoMode != 3 || molmil.vrDisplay)) {
    if (! this.FBOs.hasOwnProperty("stereoLeft")) {
      this.FBOs.stereoLeft = new molmil.FBO(this.gl, this.width, this.height);
      this.FBOs.stereoLeft.multisample = "stereoLeft";
      this.FBOs.stereoLeft.addTexture("stereoLeft", this.gl.RGBA, this.gl.RGBA);//GL2.GL_RGB32F, this.gl.GL_RGB
      this.FBOs.stereoLeft.setup();
      
      this.FBOs.stereoRight = new molmil.FBO(this.gl, this.width, this.height);
      this.FBOs.stereoRight.multisample = "stereoRight";
      this.FBOs.stereoRight.addTexture("stereoRight", this.gl.RGBA, this.gl.RGBA);//GL2.GL_RGB32F, this.gl.GL_RGB
      this.FBOs.stereoRight.setup();
    }

    if (molmil.configBox.stereoMode != 3) {
    
      var tmpVal = this.modelViewMatrix[12];
      var sCC = molmil.configBox.stereoCameraConfig; //[bottom, top, a, b, c, eyeSep, convergence, zNear, zfar];
      var left, right, zNear = sCC[7], zFar = sCC[8];
    
      // left eye
      this.modelViewMatrix[12] = tmpVal - sCC[5]*.5;
    
      left = -sCC[3] * (zNear/sCC[6]);
      right = sCC[4] * (zNear/sCC[6]);
      mat4.frustum(this.projectionMatrix, left, right, sCC[0], sCC[1], zNear, zFar);
    }
    else var tmpMMat = mat4.create(), tmp2MMat = mat4.create(), tmp3MVec = vec3.create();
    
    if (molmil.configBox.stereoMode == 1) { // anaglyph
      this.FBOs.stereoLeft.bind();
      this.gl.clearColor.apply(this.gl, BGCOLOR); this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
      this.renderPrograms(COR);
      this.FBOs.stereoLeft.post();
      this.FBOs.stereoLeft.unbind();
    }
    else if (molmil.configBox.stereoMode == 2) { // side-by-side
      this.gl.viewport(this.width, 0, this.width, this.height);
      this.gl.scissor(this.width, 0, this.width, this.height);
      this.gl.clearColor.apply(this.gl, BGCOLOR); this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
      this.renderPrograms(COR);
    }
    else if (molmil.configBox.stereoMode == 4) { // crossed-eye
      this.gl.viewport(0, 0, this.width, this.height);
      this.gl.scissor(0, 0, this.width, this.height);
      this.gl.clearColor.apply(this.gl, BGCOLOR); this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
      this.renderPrograms(COR);
    }
    else if (molmil.configBox.stereoMode == 3) { // webvr
      mat4.copy(tmp2MMat, frameData.leftViewMatrix);
      tmp2MMat[12] *= 100; tmp2MMat[13] *= 100; tmp2MMat[14] *= 100;
      
      tmp3MVec[0] = tmp2MMat[12]-frameData.leftViewMatrix[12];
      tmp3MVec[1] = tmp2MMat[13]-frameData.leftViewMatrix[13];
      tmp3MVec[2] = tmp2MMat[14]-frameData.leftViewMatrix[14];

      if (molmil.configBox.altVR) mat4.multiply(tmpMMat, this.modelViewMatrix, tmp2MMat);
      else mat4.multiply(tmpMMat, tmp2MMat, this.modelViewMatrix);
            
      var tmp = mat3.create(); mat3.fromMat4(tmp, tmpMMat);
      vec3.transformMat3(COR, this.soup.COR, tmp);
      this.projectionMatrix = frameData.leftProjectionMatrix;
      this.gl.viewport(0, 0, this.width * 0.5, this.height);

      this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
      for (var p=0; p<this.programs.length; p++) if (this.programs[p].nElements && this.programs[p].status) this.programs[p].render(tmpMMat, COR);
      this.billboardProgram.render(tmpMMat, COR);
    }
    
    if (molmil.configBox.stereoMode != 3) {
      // right eye
      this.modelViewMatrix[12] = tmpVal + sCC[5]*.5;
    
      left = -sCC[4] * (zNear/sCC[6]);
      right = sCC[3] * (zNear/sCC[6]);
      mat4.frustum(this.projectionMatrix, left, right, sCC[0], sCC[1], zNear, zFar);
    }
    
    if (molmil.configBox.stereoMode == 1) { // anaglyph
      this.FBOs.stereoRight.bind();
      this.gl.clearColor.apply(this.gl, BGCOLOR); this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
      this.renderPrograms(COR);
      this.FBOs.stereoRight.post();
      this.FBOs.stereoRight.unbind();
    }
    else if (molmil.configBox.stereoMode == 2) { // side-by-side
      this.gl.viewport(0, 0, this.width, this.height);
      this.gl.scissor(0, 0, this.width, this.height);
      this.renderPrograms(COR);
    }
    else if (molmil.configBox.stereoMode == 4) { // crossed-eye
      this.gl.viewport(this.width, 0, this.width, this.height);
      this.gl.scissor(this.width, 0, this.width, this.height);
      this.renderPrograms(COR);
    }
    else if (molmil.configBox.stereoMode == 3) { // webvr
      mat4.copy(tmp2MMat, frameData.rightViewMatrix);
      tmp2MMat[12] += tmp3MVec[0];
      tmp2MMat[13] += tmp3MVec[1];
      tmp2MMat[14] += tmp3MVec[2];
      
      if (molmil.configBox.altVR) mat4.multiply(tmpMMat, this.modelViewMatrix, tmp2MMat);
      else mat4.multiply(tmpMMat, tmp2MMat, this.modelViewMatrix);
      
      var tmp = mat3.create(); mat3.fromMat4(tmp, tmpMMat);
      vec3.transformMat3(COR, this.soup.COR, tmp);
      this.projectionMatrix = frameData.rightProjectionMatrix;
      this.gl.viewport(this.width * 0.5, 0, this.width * 0.5, this.height);

      var tmp = mat3.create(); mat3.fromMat4(tmp, tmpMMat);
      vec3.transformMat3(COR, this.soup.COR, tmp);
      
      for (var p=0; p<this.programs.length; p++) if (this.programs[p].nElements && this.programs[p].status) this.programs[p].render(tmpMMat, COR);
      this.billboardProgram.render(tmpMMat, COR);
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
    if (molmil.configBox.stereoMode != 3) this.modelViewMatrix[12] = tmpVal;
  }
  else {
    this.gl.clearColor.apply(this.gl, BGCOLOR);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    this.renderPrograms(COR);
    this.billboardProgram.render(this.modelViewMatrix, COR);
  }
  
  if (this.buffers.atomSelectionBuffer) { // this doesn't work properly with stereoscopy...
    this.renderAtomSelection(this.modelViewMatrix, COR);
  }

  if (molmil.configBox.stereoMode == 3 && molmil.vrDisplay) {
    molmil.vrDisplay.submitFrame();
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
  if (molmil.configBox.stereoMode == 2 || molmil.configBox.stereoMode == 4) this.width *= 0.5;
  if (molmil.configBox.projectionMode == 1) {
    mat4.perspective(this.projectionMatrix, molmil.configBox.camera_fovy*(Math.PI/180), this.width/this.height, molmil.configBox.zNear, molmil.configBox.zFar);
  }

  var convergence = molmil.configBox.zNear * molmil.configBox.stereoFocalFraction;
  var eyeSep = convergence/molmil.configBox.stereoEyeSepFraction;
  var top, bottom, a, b, c;
  top = molmil.configBox.zNear * Math.tan(molmil.configBox.camera_fovy) * .25;
  bottom = -top;
  a = (this.width/this.height) * Math.tan(molmil.configBox.camera_fovy) * convergence;
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
  this.gl.depthMask(false);
  
  this.gl.drawArrays(this.gl.TRIANGLES, 0, this.buffers.atomSelectionBuffer.items);
  
  if (molmil.configBox.cullFace) {this.gl.enable(this.gl.CULL_FACE);} this.gl.disable(this.gl.BLEND);
  this.gl.disable(this.gl.BLEND);
  this.gl.depthMask(true);
};

// fbo

molmil.FBO = function (gl, width, height) {
  this.width = width; this.height = height; this.gl = gl;
  this.textures = {}; // textureID, GLTextureID, colourNumber, internalFormat, format
  this.colourNumber = 0;
  this.fbo = null;
  this.depthBuffer = null;
  this.multisample = false;
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
    if (this.multisample && this.multisample in this.textures && molmil.configBox.webGL2) {
      var texture = this.textures[this.multisample];
      this.fbo2 = this.gl.createFramebuffer();
      this.colorRenderbuffer = this.gl.createRenderbuffer();
      this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, this.colorRenderbuffer);
      this.gl.renderbufferStorageMultisample(this.gl.RENDERBUFFER, 4, this.gl.RGBA, this.width, this.height);
      
      this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.fbo);
      this.gl.framebufferRenderbuffer(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0+texture[1], this.gl.RENDERBUFFER, this.colorRenderbuffer);
      this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
      
      this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.fbo2);
      this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0+texture[1], this.gl.TEXTURE_2D, texture[0], 0);
      this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
    }
    else {
      this.multisample = false;
      
      this.fbo = this.gl.createFramebuffer();
      this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.fbo);
      this.rebindTextures(false);
      this.depthBuffer = this.gl.createRenderbuffer();
      this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, this.depthBuffer);
      this.gl.renderbufferStorage(this.gl.RENDERBUFFER, this.gl.DEPTH_COMPONENT16, this.width, this.height); // this.gl.DEPTH_COMPONENT16 --> GL_DEPTH_COMPONENT24
      this.gl.framebufferRenderbuffer(this.gl.FRAMEBUFFER, this.gl.DEPTH_ATTACHMENT, this.gl.RENDERBUFFER, this.depthBuffer);
      this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
    }
    
  }
};

molmil.FBO.prototype.post=function() {
  if (this.multisample) {
    this.gl.bindFramebuffer(this.gl.READ_FRAMEBUFFER, this.fbo);
    this.gl.bindFramebuffer(this.gl.DRAW_FRAMEBUFFER, this.fbo2);
    this.gl.clearBufferfv(this.gl.COLOR, 0, [0.0, 0.0, 0.0, 1.0]);
    this.gl.blitFramebuffer(
      0, 0, this.width, this.height,
      0, 0, this.width, this.height,
      this.gl.COLOR_BUFFER_BIT, this.gl.NEAREST
    );
  }
};

molmil.FBO.prototype.rebindTextures=function(unbind) {
  this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.fbo);
  for (var t in this.textures) this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0+this.textures[t][1], this.gl.TEXTURE_2D, this.textures[t][0], 0);
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

  if (this.multisample) {
    this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, this.colorRenderbuffer);
    this.gl.renderbufferStorageMultisample(this.gl.RENDERBUFFER, 4, this.gl.RGBA8, this.width, this.height);
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.fbo2);
    this.gl.framebufferRenderbuffer(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.RENDERBUFFER, this.colorRenderbuffer);
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
  }
};

molmil.FBO.prototype.bind=function() {
  this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.fbo);
  //if (this.multisample) this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.fbo2);
};

molmil.FBO.prototype.unbind=function() {
  this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
};

// ** camera object **

molmil.glCamera = function () {this.reset();}

molmil.glCamera.prototype.reset = function() {
  this.x = this.y = this.z = 0.0;
  this.QPitch = quat.create();
  this.QHeading = quat.create();  
  this.QView = quat.create();
  this.QRoll = quat.create();
  this.Qtmp = quat.create();
  this.pitchAngle = this.headingAngle = this.rollAngle = 0.0;
  this.vrXYZ = [0.0, 0.0, 0.0];
  this.vrXYZupdated = false;
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
  quat.setAxisAngle(this.QRoll, [0, 0, 1], (this.rollAngle/180)*Math.PI);
  var q = quat.create();
  quat.multiply(q, this.QPitch, this.QHeading); quat.multiply(q, q, this.QRoll);
  quat.multiply(this.QView, q, this.QView);
  this.headingAngle = this.pitchAngle = this.rollAngle = 0.0;
}

// ** mouse/touch interface helper fucntions **

molmil.handle_molmilViewer_mouseDown = function (event) {
  if (molmil.settings.recordingMode) return;
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
    x += el.offsetLeft;// - el.scrollLeft;
    y += el.offsetTop;// - el.scrollTop;
    el = el.offsetParent;
  }

  x -= window.pageXOffset || 0;
  y -= window.pageYOffset || 0;

  x = evt.clientX - x;
  y = evt.clientY - y;

  return { x: x, y: y };
}

molmil.handle_molmilViewer_mouseUp = function (event) {
  if (molmil.settings.recordingMode) return;
  var activeCanvas = molmil.activeCanvas;
  if (! molmil.mouseMoved && activeCanvas) {
    if (event.srcElement != activeCanvas) return;
    if (event.ctrlKey != activeCanvas.atomCORset) {
      if (event.ctrlKey) activeCanvas.molmilViewer.setCOR();
      else activeCanvas.molmilViewer.resetCOR();
      activeCanvas.renderer.modelViewMatrix = activeCanvas.renderer.camera.generateMatrix();
    }
    if (document.fullscreenElement) var offset = {x: event.screenX, y: event.screenY};
    else var offset = molmil.getOffset(event);
    var dpr = window.devicePixelRatio || 1;
    activeCanvas.renderer.soup.selectObject(offset.x*dpr, offset.y*dpr, event);
    if (event.which == 3 && activeCanvas.renderer.soup.UI) {
      activeCanvas.renderer.soup.UI.showContextMenuAtom(event.clientX, event.clientY, event.pageX);
    }
  }

  molmil.mouseDownS[event.which] = 0;
  if (navigator.userAgent.indexOf("Mac") != -1 && ! event.ctrlKey && molmil.mouseDownS[3]) molmil.mouseDownS[3] = 0;

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
  if (molmil.settings.recordingMode) return;
  var movementX = event.movementX, movementY = event.movementY;
  if (movementX === undefined) movementX = event.clientX-molmil.Xcoord;
  if (movementY === undefined) movementY = event.clientY-molmil.Ycoord;
  
  if (movementX == 0 && movementY == 0) return; // workaround weird browser bug
  
  var activeCanvas = molmil.activeCanvas;
  
  if (! molmil.mouseDown || ! activeCanvas) {return;}
  molmil.mouseMoved = true;
  if (molmil.mouseDownS[2] || (molmil.mouseDownS[1] && molmil.mouseDownS[3]) || (molmil.mouseDownS[1] && event.shiftKey)) {
    activeCanvas.renderer.TransX += movementX*.5;
    activeCanvas.renderer.TransY += movementY*.5;
    molmil.Xcoord = event.clientX;
    molmil.Zcoord = molmil.Ycoord = event.clientY;
  }
  else if (molmil.mouseDownS[1]) {
    activeCanvas.renderer.heading += movementX;
    activeCanvas.renderer.pitch += movementY;
    molmil.Xcoord = event.clientX;
    molmil.Ycoord = event.clientY;
  }
  else if (molmil.mouseDownS[3]) {
    activeCanvas.renderer.TransZ = (event.clientY-molmil.Zcoord) || movementY;
    molmil.Zcoord = event.clientY;
  }
  if (event.ctrlKey != activeCanvas.atomCORset) {
    if (event.ctrlKey) activeCanvas.molmilViewer.setCOR();
    else activeCanvas.molmilViewer.resetCOR();
  }
  
  activeCanvas.update = true;
    
  event.preventDefault();
}

molmil.infoPopUp = function(text) {
  var popup = document.getElementById("molmil_info_popup");
  if (popup == null) {
    popup = molmil_dep.dcE("div")
    popup.id = "molmil_info_popup";
    document.body.pushNode(popup);
  }
  if (text === undefined) {
    if (popup.timeout) clearTimeout(popup.timeout);
    popup.classList.remove("visible");
    return;
  }
  popup.innerHTML = text;
  popup.classList.add("visible")
  if (popup.timeout) clearTimeout(popup.timeout);
  popup.timeout = setTimeout(function() {
    popup.classList.remove("visible");
  }, 5000);
}

molmil.handle_molmilViewer_mouseScroll = function (event) { // not always firing in vr mode...
  if (molmil.settings.recordingMode) return;
  if (molmil.configBox.wheelZoomRequiresCtrl && ! document.fullscreenElement) {
    if (! event.ctrlKey) return molmil.infoPopUp("Press Ctrl button while scrolling to enable zoom");
    else molmil.infoPopUp();
  }
  event.target.renderer.TransZ -= (event.wheelDelta || -event.detail*40 || event.deltaY*40 || event.deltaX*40);
  if (molmil_dep.dBT.MSIE) event.target.renderer.TransZ /= 50;
  event.target.update = true;
  try {event.preventDefault();}
  catch (e) {}
  return false;
}

molmil.onDocumentMouseMove = function (event) { // maybe deprecated
  if (molmil.settings.recordingMode) return;
  if (molmil.mouseXstart == null) {molmil.mouseXstart = event.clientX; molmil.mouseYstart = event.clientY;}
  mouseX = event.clientX-molmil.mouseXstart;
  mouseY = event.clientY-molmil.mouseYstart;
  molmil.mouseXstart = event.clientX; molmil.mouseYstart = event.clientY;
}

molmil.handle_molmilViewer_touchStart = function (event) {
  if (molmil.settings.recordingMode) return;
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
  if (molmil.settings.recordingMode) return;
  if (! molmil.longTouchTID) return;
  if (molmil.previousTouchEvent) {
    if (Math.sqrt((Math.pow(molmil.previousTouchEvent.touches[0].clientX - molmil.touchList[0][0], 2)) + (Math.pow(molmil.previousTouchEvent.touches[0].clientY - molmil.touchList[0][1], 2))) < 1) {
      if (document.fullscreenElement) var offset = {x: molmil.previousTouchEvent.touches[0].screenX, y: molmil.previousTouchEvent.touches[0].screenY};
      else var offset = molmil.getOffset(molmil.previousTouchEvent.touches[0]);
      var dpr = window.devicePixelRatio || 1;
      molmil.activeCanvas.renderer.soup.selectObject(offset.x*dpr, offset.y*dpr, event);
    }
    if (molmil.activeCanvas.renderer.soup.UI) molmil.activeCanvas.renderer.soup.UI.showContextMenuAtom(molmil.previousTouchEvent.touches[0].clientX, molmil.previousTouchEvent.touches[0].clientY, molmil.previousTouchEvent.touches[0].pageX);
  }
  
  molmil.longTouchTID = null; molmil.previousTouchEvent = null;
}

molmil.handle_molmilViewer_touchMove = function (event) {
  if (molmil.settings.recordingMode) return;
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
  if (molmil.settings.recordingMode) return;
  if (molmil.previousTouchEvent && molmil.touchMode == 1) {
    if (Math.sqrt((Math.pow(molmil.previousTouchEvent.touches[0].clientX - molmil.touchList[0][0], 2)) + (Math.pow(molmil.previousTouchEvent.touches[0].clientY - molmil.touchList[0][1], 2))) < 1) {
      if (document.fullscreenElement) var offset = {x: molmil.previousTouchEvent.touches[0].screenX, y: molmil.previousTouchEvent.touches[0].screenY};
      else var offset = molmil.getOffset(molmil.previousTouchEvent.touches[0]);
      var dpr = window.devicePixelRatio || 1;
      molmil.activeCanvas.renderer.soup.selectObject(offset.x*dpr, offset.y*dpr, event);
    }
  }

  molmil.touchList = []; molmil.touchMode = 0; molmil.longTouchTID = null;
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


// ** quick functions **

// ** shows/hides (part of) a structure **
molmil.toggleEntry = function (obj, dm, rebuildGeometry, soup) {molmil.displayEntry(obj, dm ? molmil.displayMode_Visible : molmil.displayMode_None, rebuildGeometry, soup);}


// ** change display mode of a system/chain/molecule/atom **
molmil.displayEntry = function (obj, dm, rebuildGeometry, soup, settings) {
  soup = soup || molmil.cli_soup || molmil.fetchCanvas().molmilViewer;
  if (obj instanceof Array) {
    for (var i=0; i<obj.length; i++) molmil.displayEntry(obj[i], dm, null, null, settings);
    if (rebuildGeometry) {
      soup.renderer.initBuffers();
      soup.renderer.canvas.update = true;  
    }
    return;
  }
  settings = settings || {};

  if (soup && ((soup.SCstuff && dm%1 == 0) || (! soup.SCstuff && dm%1 != 0))) molmil.geometry.reInitChains = true;

  var m, a, c, chain, mol, backboneAtoms = molmil.configBox.backboneAtoms4Display;

  //xna
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
      var atmDM = settings.newweb ? 2 : 3;
      for (c=0; c<obj.chains.length; c++) {
        chain = obj.chains[c];
        if (settings.newweb && (chain.molWeight < 550 || (chain.molWeight < 2000 && chain.isCyclic) || chain.molecules.length < 4)) chain.displayMode = 1;
        else chain.displayMode = 3;
        for (m=0; m<chain.molecules.length; m++) {
          mol = chain.molecules[m];
          if ((mol.ligand && ! mol.SNFG) || mol.water) {for (a=0; a<mol.atoms.length; a++) mol.atoms[a].displayMode = atmDM;}
          else if (mol.xna) for (a=0; a<mol.atoms.length; a++) mol.atoms[a].displayMode = 0;
          else if (mol.weirdAA && ! mol.SNFG) {
            for (a=0; a<mol.atoms.length; a++) {
              if (chain.displayMode != 1 && backboneAtoms.hasOwnProperty(mol.atoms[a].atomName)) mol.atoms[a].displayMode = 0;
              else mol.atoms[a].displayMode = atmDM;
            }
          }
          else if (! mol.SNFG && (chain.displayMode == 1)) {for (a=0; a<mol.atoms.length; a++) mol.atoms[a].displayMode = atmDM;}
          else for (a=0; a<mol.atoms.length; a++) mol.atoms[a].displayMode = 0;
          
          if (mol.SNFG) {
            mol.showSC = false;
            mol.chain.displayMode = 3;
            if (mol.res_con) {
              mol.res_con.showSC = true;
              for (var a=0; a<(mol.res_con.selection || []).length; a++) {
                if (! backboneAtoms.hasOwnProperty(mol.res_con.selection[a].atomName)) mol.res_con.selection[a].displayMode = 0;
              }
            }
          }
          else mol.showSC = mol.weirdAA;
          
          mol.displayMode = 3;
        }
      }
      
      for (c=0; c<obj.chains.length; c++) {
        chain = obj.chains[c];
        for (a=0; a<chain.showBBatoms.length; a++) {
          if (! chain.showBBatoms[a].molecule.SNFG && ! chain.showBBatoms[a].molecule.snfg_con) chain.showBBatoms[a].displayMode = atmDM;
          else if (chain.showBBatoms[a].molecule.snfg_con) chain.showBBatoms[a].molecule.showSC = true;
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
          if (chain.atoms[a].molecule.xna) chain.atoms[a].displayMode = 1;
          else {
            if (! chain.atoms[a].molecule.ligand && ! chain.atoms[a].molecule.water && backboneAtoms.hasOwnProperty(chain.atoms[a].atomName)) chain.atoms[a].displayMode = 0;
            else chain.atoms[a].displayMode = 1;
          }
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
          if (chain.atoms[a].molecule.xna) chain.atoms[a].displayMode = 2;
          else {
            if (! chain.atoms[a].molecule.ligand && ! chain.atoms[a].molecule.water && backboneAtoms.hasOwnProperty(chain.atoms[a].atomName)) chain.atoms[a].displayMode = 0;
            else chain.atoms[a].displayMode = 2;
          }
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
          if (chain.atoms[a].molecule.xna) chain.atoms[a].displayMode = 3;
          else {
            if (! chain.atoms[a].molecule.ligand && ! chain.atoms[a].molecule.water && ! (chain.atoms[a].molecule.name == "PRO" && chain.atoms[a].atomName == "N") && backboneAtoms.hasOwnProperty(chain.atoms[a].atomName)) chain.atoms[a].displayMode = 0;
            else chain.atoms[a].displayMode = 3;
          }
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
          if (chain.atoms[a].molecule.xna) chain.atoms[a].displayMode = 4;
          else {
            if (! chain.atoms[a].molecule.ligand && ! chain.atoms[a].molecule.water && ! (chain.atoms[a].molecule.name == "PRO" && chain.atoms[a].atomName == "N") && backboneAtoms.hasOwnProperty(chain.atoms[a].atomName)) chain.atoms[a].displayMode = 0;
            else chain.atoms[a].displayMode = 4;
          }
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
          if ((! mol.ligand && ! mol.water) || mol.SNFG) {for (a=0; a<mol.atoms.length; a++) mol.atoms[a].displayMode = 0;}
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
          if ((! mol.ligand && ! mol.water) || mol.SNFG) {for (a=0; a<mol.atoms.length; a++) mol.atoms[a].displayMode = 0;}
          mol.displayMode = 3;
          mol.showSC = false;
        }
      }
    }
    else if (dm == molmil.displayMode_CartoonRocket) {
      for (c=0; c<obj.chains.length; c++) {
        chain = obj.chains[c];
        chain.displayMode = 4;
        chain.twoDcache = null;
        for (m=0; m<chain.molecules.length; m++) {
          mol = chain.molecules[m];
          if (! mol.ligand && ! mol.water) {for (a=0; a<mol.atoms.length; a++) mol.atoms[a].displayMode = 0;}
          else if (mol.SNFG) {for (a=0; a<mol.atoms.length; a++) mol.atoms[a].displayMode = 3;}
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
        if ((mol.ligand && ! mol.SNFG) && ! mol.water) {for (a=0; a<mol.atoms.length; a++) mol.atoms[a].displayMode = 3;}
        else if (mol.xna) for (a=0; a<mol.atoms.length; a++) mol.atoms[a].displayMode = 0;
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
          if (mol.xna) mol.atoms[a].displayMode = 1;
          else {
            if (! mol.ligand && ! mol.water && backboneAtoms.hasOwnProperty(mol.atoms[a].atomName)) mol.atoms[a].displayMode = 0;
            else mol.atoms[a].displayMode = 1;
          }
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
          if (mol.xna) mol.atoms[a].displayMode = 2;
          else {
            if (! mol.ligand && ! mol.water && ! (mol.name == "PRO" && mol.atoms[a].atomName == "N") && backboneAtoms.hasOwnProperty(mol.atoms[a].atomName)) mol.atoms[a].displayMode = 0;
            else mol.atoms[a].displayMode = 2;
          }
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
          if (mol.xna) mol.atoms[a].displayMode = 3;
          else {
            if (! mol.ligand && ! mol.water && ! (mol.name == "PRO" && mol.atoms[a].atomName == "N") && backboneAtoms.hasOwnProperty(mol.atoms[a].atomName)) mol.atoms[a].displayMode = 0;
            else mol.atoms[a].displayMode = 3;
          }
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
      //obj.displayMode = 1;
      for (m=0; m<obj.molecules.length; m++) {
        mol = obj.molecules[m];
        for (a=0; a<mol.atoms.length; a++) {
          if (mol.xna) mol.atoms[a].displayMode = 4;
          else {
            if (! mol.ligand && ! mol.water && ! (mol.name == "PRO" && mol.atoms[a].atomName == "N") && backboneAtoms.hasOwnProperty(mol.atoms[a].atomName)) mol.atoms[a].displayMode = 0;
            else mol.atoms[a].displayMode = 4;
          }
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
        if ((! mol.ligand && ! mol.water) || mol.SNFG) {for (a=0; a<mol.atoms.length; a++) mol.atoms[a].displayMode = 0;}
        mol.displayMode = 2;
        mol.showSC = false;
      }
    }
    else if (dm == molmil.displayMode_Cartoon) {
      if (obj.displayMode == 3) obj.twoDcache = null;
      obj.displayMode = 3;
      for (m=0; m<obj.molecules.length; m++) {
        mol = obj.molecules[m];
        if ((! mol.ligand && ! mol.water) || mol.SNFG) {for (a=0; a<mol.atoms.length; a++) mol.atoms[a].displayMode = 0;}
        mol.displayMode = 3;
        mol.showSC = false;
      }      
    }
    else if (dm == molmil.displayMode_CartoonRocket) {
      if (obj.displayMode == 3) obj.twoDcache = null;
      obj.displayMode = 4;
      molmil.geometry.reInitChains = true;
      for (m=0; m<obj.molecules.length; m++) {
        mol = obj.molecules[m];
        if (! mol.ligand && ! mol.water) {for (a=0; a<mol.atoms.length; a++) mol.atoms[a].displayMode = 0;}
        else if (mol.SNFG) {for (a=0; a<mol.atoms.length; a++) mol.atoms[a].displayMode = 3;}
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
      else if (obj.xna) for (a=0; a<obj.atoms.length; a++) obj.atoms[a].displayMode = 0;
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
        if (obj.xna) obj.atoms[a].displayMode = 1;
        else {
          if (! obj.ligand && ! obj.water && backboneAtoms.hasOwnProperty(obj.atoms[a].atomName)) obj.atoms[a].displayMode = 0;
          else obj.atoms[a].displayMode = 1;
        }
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
        if (obj.xna) obj.atoms[a].displayMode = 2;
        else {
          if (! obj.ligand && ! obj.water && ! (obj.name == "PRO" && obj.atoms[a].atomName == "N") && backboneAtoms.hasOwnProperty(obj.atoms[a].atomName)) obj.atoms[a].displayMode = 0;
          else obj.atoms[a].displayMode = 2;
        }
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
        if (obj.xna) obj.atoms[a].displayMode = 3;
        else {
          if (! obj.ligand && ! obj.water && ! (obj.name == "PRO" && obj.atoms[a].atomName == "N") && backboneAtoms.hasOwnProperty(obj.atoms[a].atomName)) obj.atoms[a].displayMode = 0;
          else obj.atoms[a].displayMode = 3;
        }
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
        if (obj.xna) obj.atoms[a].displayMode = 4;
        else {
          if (! obj.ligand && ! obj.water && ! (obj.name == "PRO" && obj.atoms[a].atomName == "N") && backboneAtoms.hasOwnProperty(obj.atoms[a].atomName)) obj.atoms[a].displayMode = 0;
          else obj.atoms[a].displayMode = 4;
        }
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
  else if (obj instanceof molmil.polygonObject) {
    obj.display = dm ? 1 : 0;
    for (m=0; m<obj.programs.length; m++) obj.programs[m].status = dm ? 1 : 0
    rebuildGeometry = false;
  }

  if (rebuildGeometry) {
    soup.renderer.initBuffers();
    soup.renderer.canvas.update = true;  
  }
}

molmil.quickModelColor = function(type, options, soup) {
  soup = soup || molmil.cli_soup || molmil.fetchCanvas().molmilViewer;
  
  options = options || {};
  var carbonOnly = options.hasOwnProperty("carbonOnly") ? options.carbonOnly : true;
  
  var applyColor = function(model, color) {
    if (color.length == 3) color = [color[0], color[1], color[2], 255];
    for (c=0; c<model.chains.length; c++) {
      chain = model.chains[c];
      chain.rgba = color;
      for (m=0; m<chain.molecules.length; m++) {
        mol = chain.molecules[m];
        mol.rgba = color;
        for (a=0; a<mol.atoms.length; a++) {
          if (! carbonOnly || mol.atoms[a].element == "C") mol.atoms[a].rgba = color;
        }
      }
    }
  };
  
  if (type == "blue-red") {
    var list = molmil.interpolateBR(soup.structures.length);
    for (var i=0; i<list.length; i++) applyColor(soup.structures[i], list[i]);
  }
  else if (type == "chain") {
    var list = molmil.configBox.bu_colors;
    for (var i=0; i<soup.structures.length; i++) applyColor(soup.structures[i], list[i]);
  }
  else if (type == "newweb-au" || type == "newweb-au-sc") {
    
    var c, chain, a;
    molmil.displayEntry(soup.structures, molmil.displayMode_Default, false, soup, {newweb: true});
    if (type == "newweb-au-sc") molmil.displayEntry(soup.structures, molmil.displayMode_Stick_SC, false, soup);
    
    var c, chain, m, mol, a, list;
    for (c=0; c<soup.chains.length; c++) {
      chain = soup.chains[c];
      if (chain.molecules.length > 1) list = molmil.interpolateBR(chain.molecules.length);
      else list = [[255, 255, 255, 255]];
      for (m=0; m<chain.molecules.length; m++) {
        mol = chain.molecules[m];
        mol.rgba = list[m];
        for (a=0; a<mol.atoms.length; a++) mol.atoms[a].rgba = molmil_dep.getKeyFromObject(molmil.configBox.elementColors, mol.atoms[a].element, molmil.configBox.elementColors.DUMMY);
      }
    }
  }
  else if (type == "cartoon" || type == "cartoon-sc") {
    molmil.displayEntry(soup.structures, molmil.displayMode_Default, false, soup);
    if (type == "cartoon-sc") molmil.displayEntry(soup.structures, molmil.displayMode_Stick_SC, false, soup);
    molmil.colorEntry(soup.structures, molmil.colorEntry_Default, null, false, soup);
  }
  else if (type == "cartoon-chainc" || type == "cartoon-chainc-sc") {
    molmil.displayEntry(soup.structures, molmil.displayMode_Default, false, soup);
    if (type == "cartoon-chainc-sc") molmil.displayEntry(soup.structures, molmil.displayMode_Stick_SC, false, soup);
    molmil.colorEntry(soup.structures, molmil.colorEntry_ChainAlt, {carbonOnly: true}, false, soup);
  }
  else if (type == "sticks" || type == "sticks-chainc" || type == "sticks-bfactor") {
    molmil.displayEntry(soup.structures, molmil.displayMode_Stick, false, soup);
    if (type == "sticks-chainc") molmil.colorEntry(soup.structures, molmil.colorEntry_ChainAlt, {carbonOnly: true}, false, soup);
    else if (type == "sticks-bfactor") {
      var selection = [];
      for (var s=0; s<soup.structures.length; s++) {
        var obj = soup.structures[s];
        for (c=0; c<obj.chains.length; c++) {
          chain = obj.chains[c];
          for (a=0; a<chain.atoms.length; a++) selection.push(chain.atoms[a]);
        }
      }
      molmil.colorBfactor(selection, soup);
    }
    else molmil.colorEntry(soup.structures, molmil.colorEntry_CPK, null, false, soup);
  }
  else if (type == "lines" || type == "lines-chainc") {
    molmil.displayEntry(soup.structures, molmil.displayMode_Wireframe, false, soup);
    if (type == "lines-chainc") molmil.colorEntry(soup.structures, molmil.colorEntry_ChainAlt, {carbonOnly: true}, false, soup);
    else molmil.colorEntry(soup.structures, molmil.colorEntry_CPK, null, false, soup);
  }
  else if (type == "neutral") {
    molmil.displayEntry(soup.structures, molmil.displayMode_Default, false, soup);
    molmil.colorEntry(soup.structures, molmil.colorEntry_CPK, null, false, soup);
    molmil.colorEntry(soup.structures, molmil.colorEntry_Custom+0.5, {rgba:[255, 255, 255, 255], carbonOnly: true}, false, soup);
  }

  soup.renderer.rebuildRequired = true;
};

// ** change color mode of a system/chain/molecule/atom **
molmil.colorEntry = function (obj, cm, setting, rebuildGeometry, soup) {
  soup = soup || molmil.cli_soup || molmil.fetchCanvas().molmilViewer;
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
    if (cm == molmil.colorEntry_Default || cm == molmil.colorEntry_Default+.5) { // default
      for (c=0; c<obj.chains.length; c++) {
        chain = obj.chains[c];
        chain.rgba = [255, 255, 255, 255];
        for (m=0; m<chain.molecules.length; m++) {
          mol = chain.molecules[m];
          if (cm == molmil.colorEntry_Default) mol.rgba = molmil_dep.getKeyFromObject(molmil.configBox.sndStrucColor, mol.sndStruc, molmil.configBox.sndStrucColor[1]);
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
    else if (cm == molmil.colorEntry_CPK || cm == molmil.colorEntry_CPK+.5) { // atom (cpk)
      for (c=0; c<obj.chains.length; c++) {
        chain = obj.chains[c];
        for (m=0; m<chain.molecules.length; m++) {
          mol = chain.molecules[m];
          for (a=0; a<mol.atoms.length; a++) mol.atoms[a].rgba = molmil_dep.getKeyFromObject(molmil.configBox.elementColors, mol.atoms[a].element, molmil.configBox.elementColors.DUMMY);
          if (cm == molmil.colorEntry_CPK) mol.rgba = molmil_dep.getKeyFromObject(molmil.configBox.elementColors, "C", molmil.configBox.elementColors.DUMMY);
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
    else if (cm == molmil.colorEntry_Custom || cm == molmil.colorEntry_Custom+.5) { // custom
      if (! molmil_dep.isObject(setting)) setting = {rgba: setting};
      var rgba = setting.rgba;
      for (c=0; c<obj.chains.length; c++) {
        chain = obj.chains[c];
        chain.rgba = rgba;
        for (m=0; m<chain.molecules.length; m++) {
          mol = chain.molecules[m];
          if (cm == molmil.colorEntry_Custom) mol.rgba = rgba;
          for (a=0; a<mol.atoms.length; a++) if (! setting.carbonOnly || mol.atoms[a].element == "C") mol.atoms[a].rgba = rgba;
        }
      }
    }
    else if (cm == molmil.colorEntry_ChainAlt) {
      if (! molmil_dep.isObject(setting)) setting = {};
      list = molmil.configBox.bu_colors;
      var j = 0;
      for (c=0; c<obj.chains.length; c++) {
        chain = obj.chains[c];
        chain.rgba = [list[j][0], list[j][1], list[j][2], 255]; j++
        for (m=0; m<chain.molecules.length; m++) {
          mol = chain.molecules[m];
          mol.rgba = obj.chains[c].rgba;
          for (a=0; a<mol.atoms.length; a++) if (! setting.carbonOnly || mol.atoms[a].element == "C") mol.atoms[a].rgba = obj.chains[c].rgba;
        }
        if (j >= list.length) j = 0;
      }
    }
    else if (cm == molmil.colorEntry_Entity) {
      if (! molmil_dep.isObject(setting)) setting = {};
      
      var tmp = new Set();
      for (c=0; c<obj.chains.length; c++) tmp.add(obj.chains[c].entity_id);
      var entity2colors = molmil.interpolateHsl(tmp.size+1, 0, 360);
      var emap = {};

      for (c=0; c<obj.chains.length; c++) {
        chain = obj.chains[c];
        if (emap[chain.entity_id] === undefined) emap[chain.entity_id] = entity2colors.shift(0);
        chain.rgba = [emap[chain.entity_id][0], emap[chain.entity_id][1], emap[chain.entity_id][2], 255];
        for (m=0; m<chain.molecules.length; m++) {
          mol = chain.molecules[m];
          mol.rgba = obj.chains[c].rgba;
          for (a=0; a<mol.atoms.length; a++) if (! setting.carbonOnly || mol.atoms[a].element == "C") mol.atoms[a].rgba = obj.chains[c].rgba;
        }
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
    if (cm == molmil.colorEntry_Default || cm == molmil.colorEntry_Default+.5) { // default
      obj.rgba = [255, 255, 255, 255];
      for (m=0; m<obj.molecules.length; m++) {
        mol = obj.molecules[m];
        if (cm == molmil.colorEntry_Default) mol.rgba = molmil_dep.getKeyFromObject(molmil.configBox.sndStrucColor, mol.sndStruc, molmil.configBox.sndStrucColor[1]);
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
    else if (cm == molmil.colorEntry_CPK || cm == molmil.colorEntry_CPK+.5) { // atom (cpk)
      for (m=0; m<obj.molecules.length; m++) {
        mol = obj.molecules[m];
        for (a=0; a<mol.atoms.length; a++) mol.atoms[a].rgba = molmil_dep.getKeyFromObject(molmil.configBox.elementColors, mol.atoms[a].element, molmil.configBox.elementColors.DUMMY);
        if (cm == molmil.colorEntry_CPK) mol.rgba = molmil_dep.getKeyFromObject(molmil.configBox.elementColors, "C", molmil.configBox.elementColors.DUMMY);
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
    else if (cm == molmil.colorEntry_Custom || cm == molmil.colorEntry_Custom+.5) { // custom
      if (! molmil_dep.isObject(setting)) setting = {rgba: setting};
      var rgba = setting.rgba;
      obj.rgba = rgba;
      for (m=0; m<obj.molecules.length; m++) {
        mol = obj.molecules[m];
        if (cm == molmil.colorEntry_Custom) mol.rgba = setting.rgba;
        for (a=0; a<mol.atoms.length; a++) if (! setting.carbonOnly || mol.atoms[a].element == "C") mol.atoms[a].rgba = setting.rgba;
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
    if (cm == molmil.colorEntry_Default || cm == molmil.colorEntry_Default+.5) { // default
      mol = obj;
      if (cm == molmil.colorEntry_Default || cm == molmil.colorEntry_Default+.25) mol.rgba = molmil_dep.getKeyFromObject(molmil.configBox.sndStrucColor, mol.sndStruc, molmil.configBox.sndStrucColor[1]);
      if (cm != molmil.colorEntry_Default+.25) for (a=0; a<mol.atoms.length; a++) mol.atoms[a].rgba = molmil_dep.getKeyFromObject(molmil.configBox.elementColors, mol.atoms[a].element, molmil.configBox.elementColors.DUMMY);
    }
    else if (cm == molmil.colorEntry_Structure || cm == molmil.colorEntry_Structure+.5) { // structure
      mol = obj;
      if (cm == molmil.colorEntry_Structure) mol.rgba = molmil_dep.getKeyFromObject(molmil.configBox.sndStrucColor, mol.sndStruc, molmil.configBox.sndStrucColor[1]);
      for (a=0; a<mol.atoms.length; a++) mol.atoms[a].rgba = mol.rgba;
    }
    else if (cm == molmil.colorEntry_CPK || cm == molmil.colorEntry_CPK+.5 || cm == 3.2) { // atom (cpk)
      mol = obj;
      for (a=0; a<mol.atoms.length; a++) mol.atoms[a].rgba = molmil_dep.getKeyFromObject(molmil.configBox.elementColors, mol.atoms[a].element, molmil.configBox.elementColors.DUMMY);
      if (cm == molmil.colorEntry_CPK) mol.rgba = molmil_dep.getKeyFromObject(molmil.configBox.elementColors, "C", molmil.configBox.elementColors.DUMMY);
    }
    else if (cm == molmil.colorEntry_Custom || cm == molmil.colorEntry_Custom+.5) { // custom
      if (! molmil_dep.isObject(setting)) setting = {rgba: setting};
      var rgba = setting.rgba;
      if (cm == molmil.colorEntry_Custom) obj.rgba = setting.rgba;
      for (a=0; a<obj.atoms.length; a++) if (! setting.carbonOnly || obj.atoms[a].element == "C") obj.atoms[a].rgba = setting.rgba;
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
      obj.rgba = setting;
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
  soup = soup || molmil.cli_soup || molmil.fetchCanvas().molmilViewer;
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
  else if (obj instanceof molmil.chainObject) {
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

molmil.autoGetAtoms = function(array) {
  var atomList = [];
  if (! array instanceof Array) array = [array];
  if (array.length == 0) return [];
  
  if (array[0] instanceof molmil.entryObject) {
    var i, c;
    for (i=0; i<array.length; i++) {
      for (c=0; c<array[i].chains.length; i++) atomList = atomList.concat(array[i].chains.atoms);
    }
  }
  else if (array[0] instanceof molmil.chainObject || array[0] instanceof molmil.molObject) {
    for (var i=0; i<array.length; i++) atomList = atomList.concat(array[i].atoms);
  }
  return atomList;
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
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
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
  canvas.initialized = true;
  if (document.body.classList !== undefined) document.body.classList.add("entryLoaded");
}

molmil.animate_molmilViewers = function () {
  if (molmil.vrDisplay) molmil.settings.animationFrameID = molmil.vrDisplay.requestAnimationFrame(molmil.animate_molmilViewers);
  else molmil.settings.animationFrameID = requestAnimationFrame(molmil.animate_molmilViewers);
  if (! molmil.settings.recordingMode) {
    for (var i=0; i<molmil.preRenderFuncs.length; i++) molmil.preRenderFuncs[i]();
    for (var c=0; c<molmil.canvasList.length; c++) molmil.canvasList[c].renderer.render();
  }
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
    var firstIsSmaller = v1 < v2, smallerIndex, greaterIndex, key, ret;
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
  var sphere = molmil.octaSphereBuilder(t), dx, dy, dz, d, mfd = [], j, k;
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
  var cbMat = (molecule.chain.entry.cbMat || {})[molecule.name] || null;
  if (cbMat == null) {
    var dx, dy, dz, r, a1, a2, xyz1, xyz2, vdwR = molmil.configBox.vdwR, maxDistance;
    for (a1=0; a1<molecule.atoms.length; a1++) {
      for (a2=a1+1; a2<molecule.atoms.length; a2++) {
        if (molecule.atoms[a1].label_alt_id != molecule.atoms[a2].label_alt_id && molecule.atoms[a1].label_alt_id != null && molecule.atoms[a2].label_alt_id != null) continue;
        xyz1 = molecule.atoms[a1].xyz;
        xyz2 = molecule.atoms[a2].xyz;
        dx = xyzRef[xyz1]-xyzRef[xyz2]; dx *= dx;
        dy = xyzRef[xyz1+1]-xyzRef[xyz2+1]; dy *= dy;
        dz = xyzRef[xyz1+2]-xyzRef[xyz2+2]; dz *= dz;
        r = dx+dy+dz;

        maxDistance = molmil.configBox.connect_cutoff;
        maxDistance += ((vdwR[molecule.atoms[a1].element] || 1.8) + (vdwR[molecule.atoms[a2].element] || 1.8))*.5;
        if (molecule.atoms[a1].element == "H" || molecule.atoms[a2].element == "H") maxDistance -= .2;
        maxDistance *= maxDistance;
        if (r <= maxDistance) bonds.push([molecule.atoms[a1], molecule.atoms[a2], 1]);
      }
    }
  }
  else {
    var order;
    for (a1=0; a1<molecule.atoms.length; a1++) {
      for (a2=a1+1; a2<molecule.atoms.length; a2++) {
        order = cbMat[molecule.atoms[a1].atomName+"_"+molecule.atoms[a2].atomName];
        if (order !== undefined) bonds.push([molecule.atoms[a1], molecule.atoms[a2], order]);
      }
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
molmil.createViewer = function (target, width, height, soupObject) {
  var canvas;
  var dpr = window.devicePixelRatio || 1;
  if (target.tagName.toLowerCase() == "canvas") canvas = target;
  else canvas = target.pushNode("canvas");
  width = width || canvas.width; height = height || canvas.height;
  if (width == 300 && height == 150 && ! (canvas.style.width || canvas.style.height)) { // full-window sized canvas, with auto-resize
    width = window.innerWidth || document.documentElement.clientWidth;
    height = window.innerHeight || document.documentElement.clientHeight;
    window.onresize = function() {
      var dpr = devicePixelRatio || 1;
      if (molmil.configBox.stereoMode != 3) {
        var width = window.innerWidth || document.documentElement.clientWidth, height = window.innerHeight || document.documentElement.clientHeight;
        canvas.width = width*dpr; canvas.height = height*dpr;
        canvas.style.width = width+"px"; canvas.style.height = height+"px";
        canvas.renderer.resizeViewPort();
      }
      canvas.update = true;
    };
  }
  
  canvas.style.width = width+"px"; canvas.style.height = height+"px";
  canvas.width = width*dpr; canvas.height = height*dpr; canvas.defaultSize = [width, height];

  canvas.setSize = function(w, h) {
    var dpr = window.devicePixelRatio || 1;
    this.renderer.width = this.width = w;// * dpr;
    this.renderer.height = this.height = h;// * dpr;
    this.style.width = (w/dpr)+"px";
    this.style.height = (h/dpr)+"px";
    this.renderer.resizeViewPort(); this.update = true; this.renderer.render();
    if (window.local_file_saver !== undefined) window.resizeTo(w+(window.outerWidth-window.innerWidth), h+(window.outerHeight-window.innerHeight)); // molmil-app
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
  
  canvas.inputFunctions = [];
  
  molmil.cli_canvas = canvas; molmil.cli_soup = canvas.molmilViewer; // set some default stuff to make life easier
  
  if (! canvas.molmilViewer.renderer.initGL(canvas)) return canvas.molmilViewer.renderer.altCanvas;
  
  canvas.molmilViewer.renderer.initRenderer();
  if (soupObject) {
    canvas.renderer.initBuffers();
    canvas.update = true;
    molmil.safeStartViewer(canvas);
  }
  
  molmil.canvasList.push(canvas);
  
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

molmil.interpolateHsl = function(length, startH, endH) {
  startH /= 360; endH /= 360;
  var list = [], tmp;
  if (length == 1) {
    tmp = molmil.hslToRgb123(startH, 1.0, 0.5);
    list.push([tmp[0]*255, tmp[1]*255, tmp[2]*255, 255]);
  }
  else {
    var deltaH = (endH-startH)/(length-1);
    for (var i=0; i<length; i++) {
      tmp = molmil.hslToRgb123(startH + (deltaH*i), 1.0, 0.5);
      list.push([tmp[0]*255, tmp[1]*255, tmp[2]*255, 255]);
    }
  }
  return list;
}

// ** generates a smooth interpolation between blue and red **
molmil.interpolateBR = function (length) {return molmil.interpolateHsl(length, molmil.configBox.groupColorFirstH, molmil.configBox.groupColorLastH);}

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
  soup = soup || molmil.cli_soup || molmil.fetchCanvas().molmilViewer;
  soup.loadStructure(loc, format, cb || function(target, struc) {
    molmil.displayEntry(struc, 1);
    molmil.colorEntry(struc, 1, null, true, soup);
  }, {async: async ? true : false});
};

molmil.loadPDBlite = function(pdbid, cb, async, soup) {
  molmil.configBox.liteMode = true;
  soup = soup || molmil.cli_soup || molmil.fetchCanvas().molmilViewer;
  
  var requestA = new molmil_dep.CallRemote("GET"), async = true; requestA.ASYNC = async;
  requestA.OnDone = function() {this.atom_data = JSON.parse(this.request.responseText);}
  requestA.OnError = function() {
    this.error = true;
    soup.loadStructure(molmil.settings.pdb_url.replace("__ID__", pdbid), 1, cb || function(target, struc) {
      struc.meta.pdbid = pdbid;
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
      struc.meta.pdbid = pdbid;
      delete target.pdbxData;
      molmil.displayEntry(struc, molmil.displayMode_Default);
      molmil.displayEntry(struc, molmil.displayMode_CartoonRocket);
      molmil.colorEntry(struc, 1, null, true, soup);
    });
  };
  requestB.Send(molmil.settings.pdb_url.replace("__ID__", pdbid).replace("format=mmjson-all", "format=mmjson-plus-noatom"));
};

molmil.loadPDB = function(pdbid, cb, async, soup) {
  var tmp = molmil.configBox.skipComplexBondSearch;
  molmil.configBox.skipComplexBondSearch = true;
  soup = soup || molmil.cli_soup || molmil.fetchCanvas().molmilViewer;
  soup.loadStructure(molmil.settings.pdb_url.replace("__ID__", pdbid.toLowerCase()), 1, cb || function(target, struc) {
    struc.meta.pdbid = pdbid;
    if (soup.AID > 1e5 || (soup.AID > 150000 && (navigator.userAgent.toLowerCase().indexOf("mobile") != -1 || navigator.userAgent.toLowerCase().indexOf("android") != -1 || window.navigator.msMaxTouchPoints))) molmil.displayEntry(struc, molmil.displayMode_Wireframe);
    else molmil.displayEntry(struc, 1);
    molmil.colorEntry(struc, 1, null, true, soup);
    molmil.configBox.skipComplexBondSearch = tmp;
  }, {async: async ? true : false});
};

molmil.loadCC = function(comp_id, cb, async, soup) {
  soup = soup || molmil.cli_soup || molmil.fetchCanvas().molmilViewer;
  soup.loadStructure(molmil.settings.comp_url.replace("__ID__", comp_id.toUpperCase()), 1, cb || function(target, struc) {
    struc.meta.comp_id = comp_id;
    molmil.displayEntry(struc, 1);
    molmil.colorEntry(struc, 1, null, true, soup);
  }, {async: async ? true : false});
};

molmil.loadPDBchain = function(pdbid, cb, async, soup) {
  soup = soup || molmil.cli_soup || molmil.fetchCanvas().molmilViewer;
  soup.loadStructure(molmil.settings.pdb_chain_url.replace("__ID__", pdbid), 1, cb || function(target, struc) {
    if (soup.AID > 1e5 || (soup.AID > 150000 && (navigator.userAgent.toLowerCase().indexOf("mobile") != -1 || navigator.userAgent.toLowerCase().indexOf("android") != -1 || window.navigator.msMaxTouchPoints))) molmil.displayEntry(struc, molmil.displayMode_Wireframe);
    else molmil.displayEntry(struc, 1);
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
  return molmil.loadPlugin(molmil.settings.src+"plugins/misc.js", this.tubeSurface, this, [chains, settings, soup]); 
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
  return molmil.loadPlugin(molmil.settings.src+"plugins/misc.js", this.coarseSurface, this, [chain, res, probeR, settings]); 
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
molmil.toggleBU = function(assembly_id, displayMode, colorMode, struct, soup) {
  return molmil.loadPlugin(molmil.settings.src+"plugins/misc.js", this.toggleBU, this, [assembly_id, displayMode, colorMode, struct, soup]); 
}

molmil.duplicateBU = function(assembly_id, options, struct, soup) {
  return molmil.loadPlugin(molmil.settings.src+"plugins/misc.js", this.duplicateBU, this, [assembly_id, options, struct, soup]); 
}

molmil.selectBU = function(assembly_id, displayMode, colorMode, options, struct, soup) {
  return molmil.loadPlugin(molmil.settings.src+"plugins/misc.js", this.selectBU, this, [assembly_id, displayMode, colorMode, options, struct, soup]); 
}

molmil.findContacts = function(atoms1, atoms2, r, soup) {
  return molmil.loadPlugin(molmil.settings.src+"plugins/misc.js", this.findContacts, this, [atoms1, atoms2, r, soup]); 
}

molmil.calcHbonds = function(group1, group2, soup) { // find H-bonds between group1 and group2
  return molmil.loadPlugin(molmil.settings.src+"plugins/misc.js", this.calcHbonds, this, [group1, group2, soup]); 
}

molmil.attachResidue = function(parentResidue, newResType) { // find H-bonds between group1 and group2
  return molmil.loadPlugin(molmil.settings.src+"plugins/misc.js", this.attachResidue, this, [parentResidue, newResType]); 
}

function renderHbonds(pairs, soup, settings) {
  if (! pairs.length) return;
  settings = settings || {};
  var type = settings.type || "cylinder";
  var radius = settings.radius || 0.0375;
  var rgba = settings.rgba || [0, 0, 255, 255];
  var N = (settings.breaks || 3)+1;
  var lowQuality = settings.hasOwnProperty("lowQuality") ? settings.lowQuality : true;
  if (type != "dotted-cylinder") N = null;
  
  var objects = [], object, i;
  if (pairs[0][0] instanceof molmil.atomObject) {
    for (i=0; i<pairs.length; i++) objects.push({lowQuality: lowQuality, type: type, coords: [molmil.getAtomXYZ(pairs[i][0], soup), molmil.getAtomXYZ(pairs[i][1], soup)], rgba: rgba, radius: radius, N: N});
  }
  else {
    for (i=0; i<pairs.length; i++) objects.push({lowQuality: lowQuality, type: type, coords: [pairs[i][0], pairs[i][1]], rgba: rgba, radius: radius, N: N});
  }
  return molmil.geometry.generator(objects, soup, "Hydrogen bonds", {solid: true});
}

function renderPIinteractions(pairs, soup) {
  if (! pairs.length) return;
  
  var objects = [], object, i;
  for (i=0; i<pairs.length; i++) {
    objects.push({type: "sphere", coords: [pairs[i][0]], rgba:[255, 255, 255, 255], radius: 0.15});
    objects.push({type: "sphere", coords: [pairs[i][1]], rgba:[255, 255, 255, 255], radius: 0.15});
    objects.push({lowQuality: true, type: "dotted-cylinder", coords: [pairs[i][0], pairs[i][1]], rgba: [0, 255, 0, 255], radius: 0.0375, N: 4});
  }
  
  return molmil.geometry.generator(objects, soup, "PI interactions", {solid: true});
}

function renderSaltBridges(pairs, soup) {
  if (! pairs.length) return;
  
  var objects1 = [], objects2 = [], object, i, X1, X2;
  for (i=0; i<pairs.length; i++) {
    if (pairs[0][0] instanceof molmil.atomObject) {X1 = molmil.getAtomXYZ(pairs[i][0], soup); X2 = molmil.getAtomXYZ(pairs[i][1], soup);}
    else {X1 = pairs[i][0]; X2 = pairs[i][1];}
    objects1.push({type: "sphere", coords: [X1], rgba:[235, 235, 35, 127], radius: .25});
    objects1.push({type: "sphere", coords: [X2], rgba:[235, 235, 35, 127], radius: .25});
    objects2.push({lowQuality: true, type: "dotted-cylinder", coords: [X1, X2], rgba: [235, 235, 35, 255], radius: 0.0375, N: 6});
  }
  
  return [molmil.geometry.generator(objects1, soup, "PI interactions", {solid: true, alphaMode: true}), molmil.geometry.generator(objects2, soup, "PI interactions", {solid: true})];
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

molmil.calcAngle = function(a1, a2, a3) {
  var r2d = 180. / Math.PI, v1 = [0, 0, 0], v2 = [0, 0, 0];
  try{
    vec3.subtract(v1, a1, a2); vec3.normalize(v1, v1);
    vec3.subtract(v2, a3, a2); vec3.normalize(v2, v2);
    return Math.acos(vec3.dot(v1, v2))*r2d;
  }
  catch (e) {return NaN;}
}

molmil.calcTorsion = function(a1, a2, a3, a4) {
  var r2d = 180. / Math.PI, b0 = [0, 0, 0], b1 = [0, 0, 0], b2 = [0, 0, 0], v = [0, 0, 0], w = [0, 0, 0], x, y, tmp = [0, 0, 0];
  
  try {
    vec3.subtract(b0, a2, a1); vec3.negate(b0, b0);
    vec3.subtract(b1, a3, a2); vec3.normalize(b1, b1);
    vec3.subtract(b2, a4, a3);
  
    vec3.subtract(v, b0, vec3.scale(tmp, b1, vec3.dot(b0, b1)));
    vec3.subtract(w, b2, vec3.scale(tmp, b1, vec3.dot(b2, b1)));
    x = vec3.dot(v, w);
    y = vec3.dot(vec3.cross(tmp, b1, v), w);
    return Math.atan2(y, x)*r2d;
  }
  catch (e) {return NaN;}
}

molmil.calcMMAngle = function (a1, a2, a3, soup) {
  var modelId = soup.renderer.modelId, xyz1, xyz2, xyz3;
  xyz1 = [a1.chain.modelsXYZ[modelId][a1.xyz], a1.chain.modelsXYZ[modelId][a1.xyz+1], a1.chain.modelsXYZ[modelId][a1.xyz+2]];
  xyz2 = [a2.chain.modelsXYZ[modelId][a2.xyz], a2.chain.modelsXYZ[modelId][a2.xyz+1], a2.chain.modelsXYZ[modelId][a2.xyz+2]];
  xyz3 = [a3.chain.modelsXYZ[modelId][a3.xyz], a3.chain.modelsXYZ[modelId][a3.xyz+1], a3.chain.modelsXYZ[modelId][a3.xyz+2]];
  
  return molmil.calcAngle(xyz1, xyz2, xyz3);
}

molmil.calcMMTorsion = function (a1, a2, a3, a4, soup) {
  var modelId = soup.renderer.modelId, xyz1, xyz2, xyz3, xyz4;
  xyz1 = [a1.chain.modelsXYZ[modelId][a1.xyz], a1.chain.modelsXYZ[modelId][a1.xyz+1], a1.chain.modelsXYZ[modelId][a1.xyz+2]];
  xyz2 = [a2.chain.modelsXYZ[modelId][a2.xyz], a2.chain.modelsXYZ[modelId][a2.xyz+1], a2.chain.modelsXYZ[modelId][a2.xyz+2]];
  xyz3 = [a3.chain.modelsXYZ[modelId][a3.xyz], a3.chain.modelsXYZ[modelId][a3.xyz+1], a3.chain.modelsXYZ[modelId][a3.xyz+2]];
  xyz4 = [a4.chain.modelsXYZ[modelId][a4.xyz], a4.chain.modelsXYZ[modelId][a4.xyz+1], a4.chain.modelsXYZ[modelId][a4.xyz+2]];
  
  return molmil.calcTorsion(xyz1, xyz2, xyz3, xyz4);
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
  return molmil.loadPlugin(molmil.settings.src+"plugins/md-anal.js", this.calcRMSD, this, [atoms1, atoms2, transform]);
}

// end

// ** Molmil's command line interface **

molmil.invertColor = function (hexTripletColor) {return "#"+("000000" + (0xFFFFFF ^ parseInt(hexTripletColor.substring(1), 16)).toString(16)).slice(-6);}
molmil.componentToHex = function(c) {var hex = c.toString(16); return hex.length == 1 ? "0" + hex : hex;}
molmil.rgb2hex = function (r, g, b) {return "#" + molmil.componentToHex(r) + molmil.componentToHex(g) + molmil.componentToHex(b);}
molmil.hex2rgb = function(hex) {hex = (hex.charAt(0) == "#" ? hex.substr(1, 7) : hex); return [parseInt(hex.substring(0, 2), 16), parseInt(hex.substring(2, 4), 16), parseInt(hex.substring(4, 6), 16)];}
    
molmil.checkRebuild = function() {
  var soup = molmil.cli_soup || molmil.fetchCanvas().molmilViewer;
  if (soup.renderer.rebuildRequired) soup.renderer.initBuffers();
  soup.renderer.rebuildRequired = false;
  soup.renderer.canvas.update = true;
}
    
molmil.commandLines = {};
    
molmil.commandLine = function(canvas) {
  this.environment = {fileObjects: {}};
  this.commandBuffer = [];
  for (var e in window) this.environment[e] = undefined;
  
  this.environment.setTimeout = function(cb, tm) {window.setTimeout(cb, tm);}
  this.environment.clearTimeout = function() {window.clearTimeout();}
  this.environment.navigator = window.navigator;
  this.environment.window = this;
  
  this.environment.console = {};
  
  var exports = ["molmil", "molmil_dep", "glMatrix", "mat2", "mat2", "mat3", "mat4", "quat", "quat2", "vec2", "vec3", "vec4"];
  
  //this.environment.molmil = molmil;
  //this.environment.molmil_dep = molmil_dep;
  
  for (var i=0; i<exports.length; i++) this.environment[exports[i]] = window[exports[i]];

  this.canvas = this.environment.cli_canvas = canvas; this.soup = this.environment.cli_soup = canvas.molmilViewer;
  canvas.commandLine = this;
  this.environment.global = this.environment;
  this.buildGUI();
  
  this.environment.console.debugMode = true;
  
  this.environment.console.log = function() {
    if (this.debugMode) console.log.apply(console, arguments);
    var __arguments = Array.prototype.slice.call(arguments, 0);
    var tmp = document.createElement("div"); tmp.textContent = __arguments.join(", ");
    this.custom(tmp);
  };
  this.environment.console.warning = function() {
    if (this.debugMode) console.warning.apply(console, arguments);
    var __arguments = Array.prototype.slice.call(arguments, 0);
    var tmp = document.createElement("div"); tmp.textContent = __arguments.join(", ");
    tmp.style.color = "yellow";
    this.custom(tmp);
  };
  this.environment.console.error = function() {
    if (this.debugMode) console.error.apply(console, arguments);
    var __arguments = Array.prototype.slice.call(arguments, 0);
    //console.error.apply(console, __arguments);
    var tmp = document.createElement("div"); tmp.textContent = __arguments.join(", ");
    tmp.style.color = "red";
    this.custom(tmp);
  };
  this.environment.console.logCommand = function() {
    if (this.cli.environment.scriptUrl) return;
    var __arguments = Array.prototype.slice.call(arguments, 0);
    var tmp = document.createElement("div"); tmp.textContent = __arguments.join("\n");
    tmp.style.color = "#00BFFF";
    this.custom(tmp, true);
  };
  this.environment.console.custom = function(obj, noPopup) {
    if (! obj.textContent) return;
    this.logBox.appendChild(obj);
    this.logBox.scrollTop = this.logBox.scrollHeight;
    if (noPopup != true) this.logBox.icon.onclick(true);
  };
  this.environment.console.runCommand = function(command, priority) {
    if (! molmil.isBalancedStatement(command)) return;
    if (this.cli.environment.cli_canvas.commandLine.initDone === undefined) return molmil_dep.asyncStart(this.runCommand, [command, priority], this, 10);
    
    var sub_commands = [], startIdx = 0, idx=0, sc, tmpIdx;
    var n = 0;
    while (idx < command.length) {
      idx = command.indexOf(";", startIdx);
      if (idx == -1) {
        sub_commands.push(command.substr(startIdx).trim());
        break;
      }

      sc = command.substring(startIdx, idx).trim();
      
      while (! molmil.isBalancedStatement(sc)) {
        tmpIdx = idx+1;
        idx = command.indexOf(";", tmpIdx);
        sc = command.substring(startIdx, idx).trim();
      }
      sub_commands.push(sc);
      
      startIdx = idx+1;
    }
    
    if (priority) {var buffer = this.cli.commandBuffer; this.cli.commandBuffer = [];}
    
    for (var i=0; i<sub_commands.length; i++) {
      sub_commands[i] = sub_commands[i].trim();
      this.logCommand(sub_commands[i]);
      this.cli.eval(sub_commands[i]);
      this.backlog.unshift(sub_commands[i]);
    }
    this.cli.eval("molmil.checkRebuild();");
    if (priority) {for (var i=0; i<buffer.length; i++) this.cli.eval(buffer[i]);}
    
    /*
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
    */
    this.buffer = ""; this.blSel = -1;
    if (this.cli.environment.cli_canvas.commandLine.initDone == false) this.cli.environment.cli_canvas.commandLine.initDone = true;
  };
  this.run = function(command) {this.environment.console.runCommand(command);}
  this.environment.console.backlog = [];
  this.environment.console.buffer = "";
  this.environment.console.blSel = -1;
  
  
  this.environment.console.logBox = this.logBox; this.environment.console.cli = this;
  
  this.environment.colors = {red: [255, 0, 0, 255], green: [0, 255, 0, 255], blue: [0, 0, 255, 255], grey: [100, 100, 100, 255], magenta: [255, 0, 255, 255], cyan: [0, 255, 255, 255], yellow: [255, 255, 0, 255], black: [0, 0, 0, 255], white: [255, 255, 255, 255], purple: [128, 0, 128, 255], orange: [255, 165, 0, 255]};
  
  //this.bindNullInterface();
  
  
  // this.bindPymolInterface();
  
  var init = function() {
    if (this.environment.console.backlog.length == 0) this.initDone = true;
    else this.initDone = false;
    this.bindPymolInterface();
    this.icon.show(true); this.icon.hide();
    if (molmil.onInterfacebind) molmil.onInterfacebind(this);
  };
  
  if (! molmil.commandLines.pyMol) {
    molmil.loadPlugin(molmil.settings.src+"plugins/pymol-script.js", init, this, [], true);
  }
};

molmil.color2rgba = function(clr) {
  var simple_colors = {aliceblue: 'f0f8ff', antiquewhite: 'faebd7', aqua: '00ffff', aquamarine: '7fffd4', azure: 'f0ffff', beige: 'f5f5dc', bisque: 'ffe4c4', black: '000000', blanchedalmond: 'ffebcd', blue: '0000ff', blueviolet: '8a2be2', brown: 'a52a2a', burlywood: 'deb887', cadetblue: '5f9ea0', chartreuse: '7fff00', chocolate: 'd2691e', coral: 'ff7f50', cornflowerblue: '6495ed', cornsilk: 'fff8dc', crimson: 'dc143c', cyan: '00ffff', darkblue: '00008b', darkcyan: '008b8b', darkgoldenrod: 'b8860b', darkgray: 'a9a9a9', darkgreen: '006400', darkkhaki: 'bdb76b', darkmagenta: '8b008b', darkolivegreen: '556b2f', darkorange: 'ff8c00', darkorchid: '9932cc', darkred: '8b0000', darksalmon: 'e9967a', darkseagreen: '8fbc8f', darkslateblue: '483d8b', darkslategray: '2f4f4f', darkturquoise: '00ced1', darkviolet: '9400d3', deeppink: 'ff1493', deepskyblue: '00bfff', dimgray: '696969', dodgerblue: '1e90ff', feldspar: 'd19275', firebrick: 'b22222', floralwhite: 'fffaf0', forestgreen: '228b22', fuchsia: 'ff00ff', gainsboro: 'dcdcdc', ghostwhite: 'f8f8ff', gold: 'ffd700', goldenrod: 'daa520', gray: '808080', green: '008000', greenyellow: 'adff2f', honeydew: 'f0fff0', hotpink: 'ff69b4', indianred : 'cd5c5c', indigo : '4b0082', ivory: 'fffff0', khaki: 'f0e68c', lavender: 'e6e6fa', lavenderblush: 'fff0f5', lawngreen: '7cfc00', lemonchiffon: 'fffacd', lightblue: 'add8e6', lightcoral: 'f08080', lightcyan: 'e0ffff', lightgoldenrodyellow: 'fafad2', lightgrey: 'd3d3d3', lightgreen: '90ee90', lightpink: 'ffb6c1', lightsalmon: 'ffa07a', lightseagreen: '20b2aa', lightskyblue: '87cefa', lightslateblue: '8470ff', lightslategray: '778899', lightsteelblue: 'b0c4de', lightyellow: 'ffffe0', lime: '00ff00', limegreen: '32cd32', linen: 'faf0e6', magenta: 'ff00ff', maroon: '800000', mediumaquamarine: '66cdaa', mediumblue: '0000cd', mediumorchid: 'ba55d3', mediumpurple: '9370d8', mediumseagreen: '3cb371', mediumslateblue: '7b68ee', mediumspringgreen: '00fa9a', mediumturquoise: '48d1cc', mediumvioletred: 'c71585', midnightblue: '191970', mintcream: 'f5fffa', mistyrose: 'ffe4e1', moccasin: 'ffe4b5', navajowhite: 'ffdead', navy: '000080', oldlace: 'fdf5e6', olive: '808000', olivedrab: '6b8e23', orange: 'ffa500', orangered: 'ff4500', orchid: 'da70d6', palegoldenrod: 'eee8aa', palegreen: '98fb98', paleturquoise: 'afeeee', palevioletred: 'd87093', papayawhip: 'ffefd5', peachpuff: 'ffdab9', peru: 'cd853f', pink: 'ffc0cb', plum: 'dda0dd', powderblue: 'b0e0e6', purple: '800080', red: 'ff0000', rosybrown: 'bc8f8f', royalblue: '4169e1', saddlebrown: '8b4513', salmon: 'fa8072', sandybrown: 'f4a460', seagreen: '2e8b57', seashell: 'fff5ee', sienna: 'a0522d', silver: 'c0c0c0', skyblue: '87ceeb', slateblue: '6a5acd', slategray: '708090', snow: 'fffafa', springgreen: '00ff7f', steelblue: '4682b4', tan: 'd2b48c', teal: '008080', thistle: 'd8bfd8', tomato: 'ff6347', turquoise: '40e0d0', violet: 'ee82ee', violetred: 'd02090', wheat: 'f5deb3', white: 'ffffff', whitesmoke: 'f5f5f5', yellow: 'ffff00', yellowgreen: '9acd32'};

  if (simple_colors.hasOwnProperty(clr.toLowerCase())) clr = "#"+simple_colors[clr.toLowerCase()];
  if (clr.substr(0,1) == "#") {
    var hex = clr.substr(1, 7)
    return [parseInt(hex.substring(0, 2), 16), parseInt(hex.substring(2, 4), 16), parseInt(hex.substring(4, 6), 16), 255];
  }

  return clr;
  
}

molmil.commandLine.prototype.buildGUI = function() {
  this.consoleBox = this.canvas.parentNode.pushNode("span");
  this.consoleBox.className = "molmil_UI_cl_box"; this.consoleBox.style.overflow = "initial";
  
  this.logBox = this.consoleBox.pushNode("span");
  this.logBox.icon = this.icon = this.consoleBox.pushNode("span");
  this.icon.innerHTML = "<"; this.icon.title = "Display command line";
  this.icon.className = "molmil_UI_cl_icon";
  
  this.icon.show = function(nofocus) {
    this.innerHTML = ">"; this.title = "Hide command line";
    
    this.cli.logBox.style.borderBottom = "";
    this.cli.logBox.style.borderRadius = ".33em";

    this.inp.style.display = this.cli.logBox.style.display = "initial";
    this.cli.consoleBox.style.height = this.cli.consoleBox.style.maxHeight = "calc("+this.cli.canvas.clientHeight+"px - 6em)";
    this.cli.consoleBox.style.overflow = "";
    this.cli.logBox.style.overflow = "";
    this.cli.logBox.style.pointerEvents = "";
    if (! nofocus) this.inp.focus();
  }
  this.icon.hide = function() {
    this.innerHTML = "<"; this.title = "Display command line";
    this.inp.style.display = this.cli.logBox.style.display = "";
  }
  this.icon.onclick = function (mini) {
    if (mini == true) {
      if (this.inp.style.display == "") {
        this.cli.logBox.style.display = "initial";
        this.cli.consoleBox.style.height = "8em";
        this.cli.logBox.style.pointerEvents = "none";
        this.cli.logBox.style.overflow = "hidden";
        this.logBox.scrollTop = this.logBox.scrollHeight;
      }
      return;
    }
    if (this.inp.style.display == "initial") this.hide();
    else this.show();
  };
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

molmil.xhr = function(url) {
  if (window.hasOwnProperty("rewriteURL")) url = rewriteURL(url);
  if (window.hasOwnProperty("customXHR")) var request = customXHR(url);
  else var request = new molmil_dep.CallRemote("GET");
  request.URL = url;
  return request;
};

molmil.loadScript = function(url) {
  var cc = this.cli_canvas;
  var cli = cc.commandLine;
  
  
  cc.molmilViewer.downloadInProgress++;

  var request = molmil.xhr(url);
  request.ASYNC = true;
  request.OnDone = function() {
    cc.molmilViewer.downloadInProgress--;
    var pathconv = url.split("=");
    pathconv[pathconv.length-1] = pathconv[pathconv.length-1].substr(0, pathconv[pathconv.length-1].lastIndexOf('/'))
    if (pathconv[pathconv.length-1]) pathconv[pathconv.length-1] += "/";
    cc.molmilViewer.__cwd__ = cli.environment.scriptUrl = pathconv.join("=");
    cli.environment.console.runCommand(this.request.responseText.replace(/\/\*[\s\S]*?\*\/|([^:]|^)\/\/.*$/gm, ""), true);
  }
  for (var e in cc.molmilViewer.extraREST) request.AddParameter(e, cc.molmilViewer.extraREST[e]);
  for (var e in cc.molmilViewer.extraRESTHeaders) request.headers[e] = cc.molmilViewer.extraRESTHeaders[e];
  request.Send();
}

molmil.commandLine.prototype.eval = function(command) {
  // instead of having two command lines (e.g. pymol & javascript), only have one command line (javascript), but rewrite the incoming /command/ from pymol --> javascript...
  command = command.trim();
  if (! command) return;
  
  if (this.soup.downloadInProgress || ! this.initDone) {
    this.commandBuffer.push(command);
    if (this.commandBuffer.length == 1) this.wait4Download();
    return;
  }

  molmil.cli_canvas = this.canvas; molmil.cli_soup = this.canvas.molmilViewer;
  if (! this.altCommandIF(this.environment, command)) this.runCommand.apply(this.environment, [command]);
  molmil.cli_canvas = molmil.cli_soup = null;
};

molmil.commandLine.prototype.wait4Download = function() {
  if (this.soup.downloadInProgress || ! this.initDone) {
    var that = this;
    setTimeout(function() {that.wait4Download();}, 100);
    return;
  }
  
  var buffer = this.commandBuffer; this.commandBuffer = [];
  for (var i=0; i<buffer.length; i++) {
    this.eval(buffer[i]);
  }
};

molmil.commandLine.prototype.runCommand = function(command) { // note the /this/ stuff will not work properly... if there are many functions and internal /var/s...
  if (command.match(/\bfunction\b/)) command = command.replace(/(\b|;)function\s+(\w+)/g, "$1global.$2 = function"); // make sure that functions are stored in /this/ and not in the local scope...
  else command = (' '+command).replace(/(\s|;)var\s+(\w+)\s*=/g, "$1global.$2 ="); // make sure that variables are stored in /this/ and not in the local scope...
  command = command.replace(/(\s|;)return\sthis;/g, "$1return window;"); // make sure that it is impossible to get back the real window object
  try {with (this) {eval(command);}}
  catch (e) {this.console.error(e);}
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

molmil.commandLine.prototype.bindPDBjViewerInterface = function() {
  return molmil.loadPlugin(molmil.settings.src+"plugins/jv-script.js", this.bindPDBjViewerInterface, this);
}


// END

// misc stuff

molmil.setSlab = function(near, far, soup) {
  soup = soup || molmil.cli_soup || molmil.fetchCanvas().molmilViewer;
  
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
  soup = soup || molmil.cli_soup || molmil.fetchCanvas().molmilViewer;
  if (! append) soup.atomSelection = [];
  
  for (var a=0; a<atoms.length; a++) soup.atomSelection.push(atoms[a]);
};

// dna/rna cartoon through phosphor

molmil.resetFocus = function(soup, t) {
  t = t || 0;
  soup = soup || molmil.cli_soup || molmil.fetchCanvas().molmilViewer;
  
  soup.atomSelection = [];
  
  soup.renderer.updateSelection();

  molmil.zoomTo(soup.avgXYZ, soup.COR, [0.0, 0.0, soup.calcZ()], soup, t);
}

molmil.zoomTo = function(newCOR, oldCOR, newXYZ, soup, t) {
  for (var i=0; i<soup.canvases.length; i++) soup.canvases[i].molmilViewer.COR = newCOR;
  soup.lastKnownAS = newCOR;
  soup.avgXYZ = newCOR;
  
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
    return updateCamera(0);
  }
  
  soup.renderer.camera.x = newXYZ[0]; soup.renderer.camera.y = newXYZ[1]; soup.renderer.camera.z = newXYZ[2];
  soup.renderer.modelViewMatrix = soup.renderer.camera.generateMatrix();
  soup.canvas.update = true;
}

molmil.selectionFocus = function(soup, t) {
  t = t || 0;
  soup = soup || molmil.cli_soup || molmil.fetchCanvas().molmilViewer;
  
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

molmil.searchAtom = function(struc, chainID, resID, atomID) {
  var c, m, a;
  for (c=0; c<struc.chains.length; c++) {
    if (struc.chains[c].name != chainID) continue
    if (! resID) return struc.chains[c];
    for (m=0; m<struc.chains[c].molecules.length; m++) {
      if (struc.chains[c].molecules[m].RSID != resID) continue;
      if (! atomID) return struc.chains[c].molecules[m];
      for (a=0; a<struc.chains[c].molecules[m].atoms.length; a++) {
        if (struc.chains[c].molecules[m].atoms[a].atomName != atomID) continue;
        return struc.chains[c].molecules[m].atoms[a];
      }
    }
  }
  return null;
}

molmil.findResidue = function(resInfo, soup) {
  soup = soup || molmil.cli_soup || molmil.fetchCanvas().molmilViewer;
  
  var chains = [];
  if (resInfo.chain) {for (var c=0; c<soup.chains.length; c++) {if (soup.chains[c].name == resInfo.chain) {chains.push(soup.chains[c]); break;}}}
  else chains = soup.chains;
  
  var out = [], chain;
  for (var c=0; c<chains.length; c++) {
    chain = chains[c];
    for (var m=0; m<chain.molecules.length; m++) {
      if (resInfo.name && chain.molecules[m].name.toLowerCase() == resInfo.name.toLowerCase() && chain.molecules[m].id == resInfo.id) out.push(chain.molecules[m]);
    }
  }
  return out;
}

molmil.selectSequence = function(seq, soup) {
  soup = soup || molmil.cli_soup || molmil.fetchCanvas().molmilViewer;

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
  var modelId = molmil.geometry.modelId || 0;
  if (! (input instanceof Array)) input = [input];
  var coords = [], tmp, j, c, names = [];
  for (var i=0; i<input.length; i++) {
    if (input[i] instanceof molmil.atomObject) {
      //if (input[i].element == "H") continue;
      coords.push([input[i].chain.modelsXYZ[modelId][input[i].xyz], input[i].chain.modelsXYZ[modelId][input[i].xyz+1], input[i].chain.modelsXYZ[modelId][input[i].xyz+2]]);
      names.push(input[i].atomName);
    }
    else if (input[i] instanceof molmil.molObject) {
      tmp = input[i].chain.modelsXYZ[modelId];
      for (j=0; j<input[i].atoms.length; j++) if (input[i].atoms[j].element != "H") {
        coords.push([tmp[input[i].atoms[j].xyz], tmp[input[i].atoms[j].xyz+1], tmp[input[i].atoms[j].xyz+2]]);
        names.push(input[i].atoms[j].atomName);
      }
    }
    else if (input[i] instanceof molmil.chainObject) {
      tmp = input[i].modelsXYZ[modelId];
      for (j=0; j<input[i].atoms.length; j++) if (input[i].atoms[j].element != "H") {
        coords.push([tmp[input[i].atoms[j].xyz], tmp[input[i].atoms[j].xyz+1], tmp[input[i].atoms[j].xyz+2]]);
        names.push(input[i].atoms[j].atomName);
      }
    }
    else if (input[i] instanceof molmil.entryObject) {
      for (c=0; c<input[i].chains.length; c++) {
        tmp = input[i].chains[c].modelsXYZ[modelId];
        for (j=0; j<input[i].chains[c].atoms.length; j++) if (input[i].chains[c].atoms[j].element != "H") {
          coords.push([tmp[input[i].chains[c].atoms[j].xyz], tmp[input[i].chains[c].atoms[j].xyz+1], tmp[input[i].chains[c].atoms[j].xyz+2]]);
          names.push(input[i].chains[c].atoms[j].atomName);
        }
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
  
  return [avgXYZ, Math.max((xMax-xMin), (yMax-yMin), (zMax-zMin))*.55, coords, names];
}

molmil.addLabel = function(text, settings, soup) {
  soup = soup || molmil.cli_soup || molmil.fetchCanvas().molmilViewer;
  settings = settings || {};

  var obj;
  if (soup instanceof molmil.labelObject) {
    obj = soup;
    soup = obj.soup
    
    text = text || obj.text;
    settings.xyz = settings.xyz || obj.settings.xyz;
  }
  else {
    if (! settings.hasOwnProperty("xyz") && ! settings.hasOwnProperty("atomSelection")) return console.error("Cannot create label: no xyz variable set...");
    obj = new molmil.labelObject(soup); soup.texturedBillBoards.push(obj);
    obj.remove = function() {
      gl.deleteTexture(this.texture);
      var idx = soup.texturedBillBoards.indexOf(this);
      if (idx != -1) soup.texturedBillBoards.splice(idx, 1);
    };
  }
  
  var saa = Object.keys(obj.settings); for (var i=0; i<saa.length; i++) {if (! settings.hasOwnProperty(saa[i])) settings[saa[i]] = obj.settings[saa[i]];}

  var resolutionScaler = Math.max(soup.canvas.width/1920, soup.canvas.height/1080);
  
  if (text != obj.text || settings.fontSize != obj.settings.fontSize || settings.color[0] != obj.settings.color[0] || settings.color[1] != obj.settings.color[1] || settings.color[2] != obj.settings.color[2]) {
    var textCtx = document.createElement("canvas").getContext("2d");
    settings.fontSize *= 2*resolutionScaler; // render at a higher resolution
  
    var tmp = text.replace(/\\n/g, "\n").split(/\n/g), h, w, i;
    h = tmp.length*settings.fontSize; w = 0;
    var saa = 0;
    var regex = /[\u3000-\u303F]|[\u3040-\u309F]|[\u30A0-\u30FF]|[\uFF00-\uFFEF]|[\u4E00-\u9FAF]|[\u2605-\u2606]|[\u2190-\u2195]|\u203B/g;
    for (var i=0; i<tmp.length; i++) {
      saa = (tmp[i].match(regex) || "").length*0.75 + tmp[i].length;
      if (saa > w) w = saa;
    }
    
    w = (w*settings.fontSize*.6)+6;
    
    var Yoffset = 0;
    
    if (settings.addBorder) {
      h = tmp.length*settings.fontSize*1.25;
      w += settings.fontSize*.5;
      h += settings.fontSize*.5;
      Yoffset += settings.fontSize*.375;
    }
    
    
    textCtx.canvas.width = w; textCtx.canvas.height = h*1.2;
    textCtx.font = "bold "+settings.fontSize+"px Consolas, \"Liberation Mono\", Courier, monospace"; textCtx.textAlign = settings.textAlign || "center"; textCtx.textBaseline = settings.textBaseline || "middle"; 
    textCtx.clearRect(0, 0, textCtx.canvas.width, textCtx.canvas.height);
    
    if (settings.bg_color) {
      textCtx.fillStyle = molmil.rgb2hex(settings.bg_color[0], settings.bg_color[1], settings.bg_color[2]);
      textCtx.ellipse(textCtx.canvas.width*.5, textCtx.canvas.height*.5, textCtx.canvas.width*.5, textCtx.canvas.height*.5, 0, 0, Math.PI * 2, false);
      textCtx.lineWidth = 0;
      textCtx.fill();      
    }
    
    textCtx.fillStyle = molmil.rgb2hex(settings.color[0], settings.color[1], settings.color[2]);
    
    if (settings.outline_color) textCtx.strokeStyle = molmil.rgb2hex(settings.outline_color[0], settings.outline_color[1], settings.outline_color[2]);
    else textCtx.strokeStyle = "#000000";
    textCtx.lineWidth = Math.max(Math.round(settings.fontSize / 50), 1.0);

    if (settings.textAlign == "left") {
      for (var i=0; i<tmp.length; i++) {
        textCtx.fillText(tmp[i], 0, (settings.fontSize / 1.5) + (settings.fontSize*i) + Yoffset);
        if (! settings.addBorder) {
          textCtx.strokeText(tmp[i], 0, (settings.fontSize / 1.5) + (settings.fontSize*i) + Yoffset);
        }
      }
    }
    else if (settings.textAlign == "right") {
      for (var i=0; i<tmp.length; i++) {
        textCtx.fillText(tmp[i], w, (settings.fontSize / 1.5) + (settings.fontSize*i) + Yoffset);
        if (! settings.addBorder) textCtx.strokeText(tmp[i], w, (settings.fontSize / 1.5) + (settings.fontSize*i) + Yoffset);
      }
    }
    else {
      textCtx.textAlign = settings.textAlign = "center";
      for (var i=0; i<tmp.length; i++) {
        textCtx.fillText(tmp[i], w / 2, (settings.fontSize / 1.5) + (settings.fontSize*i) + Yoffset);
        if (! settings.addBorder) textCtx.strokeText(tmp[i], w / 2, (settings.fontSize / 1.5) + (settings.fontSize*i) + Yoffset); 
      }
    }


    if (settings.addBorder) {
      textCtx.beginPath();
      textCtx.ellipse(textCtx.canvas.width*.5, textCtx.canvas.height*.5, (textCtx.canvas.width*.5)-settings.fontSize*.05, (textCtx.canvas.height*.5)-settings.fontSize*.05, 0, 0, Math.PI * 2, false);
      textCtx.lineWidth = settings.fontSize*.1;
      textCtx.stroke();
    }

    var gl = soup.renderer.gl;
    var textTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, textTex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textCtx.canvas);
    gl.bindTexture(gl.TEXTURE_2D, null);
    
    obj.status = false;
    obj.texture = textTex;
    obj.texture.renderWidth = w/resolutionScaler;
    obj.texture.renderHeight = h/resolutionScaler;
    settings.fontSize /= 2*resolutionScaler; // render at a higher resolution
  }
  
  obj.text = text;
  for (var e in settings) obj.settings[e] = settings[e];
  
  obj.dynamicsUpdate = function() {
    var settings = this.settings;
    if (settings.hasOwnProperty("atomSelection")) {
      var info = molmil.calcCenter(settings.atomSelection);
      var pos = info[0], size = info[1], atoms = info[2], names = info[3];
      if (settings.atomSelection.length == 1) size += settings.atomSelection[0].radius || molmil.configBox.vdwR[settings.atomSelection[0].element] || 1.5;
      else size += 1.5;
      if (molmil.defaultSettings_label.label_atom_center) {
        var nearest = [1e99, -1], dx, dy, dz, r2;
        if (molmil.defaultSettings_label.label_atom_center == "all") {
          for (var i=0; i<atoms.length; i++) {
            dx = atoms[i][0]-pos[0]; dy = atoms[i][1]-pos[1]; dz = atoms[i][2]-pos[2];
            r2 = dx*dx + dy*dy + dz*dz;
            if (r2 < nearest[0]) nearest = [r2, i];
          }
        }
        else {
          for (var i=0; i<atoms.length; i++) {
            if (names[i] != molmil.defaultSettings_label.label_atom_center) continue
            dx = atoms[i][0]-pos[0]; dy = atoms[i][1]-pos[1]; dz = atoms[i][2]-pos[2];
            r2 = dx*dx + dy*dy + dz*dz;
            if (r2 < nearest[0]) nearest = [r2, i];
          }
        }
        if (nearest[1] != -1) {
          pos = atoms[nearest[1]];
          console.log(settings.atomSelection[nearest[1]]);
        }
      }
      if (molmil.defaultSettings_label.alwaysFront) size = 0;
      settings.xyz = pos;
      if (settings.hasOwnProperty("_dx")) settings.dx = settings._dx + size;
      else if (settings.hasOwnProperty("_dy"))  settings.dy = settings._dy + size;
      else settings.dz = (settings.hasOwnProperty("_dz") ? settings._dz : 0) + size;
      this.status = false;
    }
  };
  obj.dynamicsUpdate();
  
  if (soup instanceof molmil.viewer && soup.UI) soup.UI.resetRM();
  soup.canvas.update = true;

  return obj;
}

molmil.mergeStructuresToModels = function(entries) { // merges multiple structures into separate models
}

molmil.splitModelsToStructures = function(entry) { // splits multiple models into separate structures
}

molmil.showNearbyResidues = function(obj, r, soup) {
  var atomList = molmil.fetchNearbyAtoms(obj, r, null, soup);
  var processed = [], res;
  for (var i=0; i<atomList.length; i++) {
    res = atomList[i].molecule;
    if (processed.indexOf(res) != -1) continue;
    molmil.displayEntry(res, molmil.displayMode_Stick);
    processed.push(res);
  }
  soup.renderer.initBuffers();
  soup.renderer.canvas.update = true;
  return processed;
}

molmil.fetchNearbyAtoms = function(obj, r, atomList, soup) {
  if (atomList === undefined || atomList === null) atomList = [];
  soup = soup || molmil.cli_soup || molmil.fetchCanvas().molmilViewer;
  
  if (obj instanceof Array) {
    for (var i=0; i<obj.length; i++) molmil.fetchNearbyAtoms(obj[i], r, atomList, soup);
    return atomList;
  }
  
  
  if (obj instanceof molmil.entryObject) {
    for (var i=0; i<obj.chains; i++) molmil.fetchNearbyAtoms(obj.chains[i], r, atomList, soup);
    return atomList;
  }
  
  var atoms_, atoms = [], modelsXYZ2;
  if (obj instanceof molmil.chainObject) {
    atoms_ = obj.atoms;
    modelsXYZ2 = obj.modelsXYZ[soup.renderer.modelId];
  }
  else if (obj instanceof molmil.molObject) {
    atoms_ = obj.atoms;
    modelsXYZ2 = obj.chain.modelsXYZ[soup.renderer.modelId];
  }
  else if (obj instanceof molmil.atomObject) {
    atoms_ = [obj];
    modelsXYZ2 = obj.chain.modelsXYZ[soup.renderer.modelId];
  }
  else return atomList;

  var i, j, c, r2 = r*r, xyz1, xyz2, atom1 = [0.0, 0.0, 0.0], atom2 = [0.0, 0.0, 0.0], modelsXYZ1, x, y, z, rr;
  
  for (j=0; j<atoms_.length; j++) {if (atoms_[j].element != "H")  atoms.push(atoms_[j]);}
  
  for (c=0; c<soup.chains.length; c++) {
    modelsXYZ1 = soup.chains[c].modelsXYZ[soup.renderer.modelId];
    for (i=0; i<soup.chains[c].atoms.length; i++) {
      if (soup.chains[c].atoms[i].element == "H" || atoms.indexOf(soup.chains[c].atoms[i]) != -1) continue;
      xyz1 = soup.chains[c].atoms[i].xyz;
      atom1[0] = modelsXYZ1[xyz1];
      atom1[1] = modelsXYZ1[xyz1+1];
      atom1[2] = modelsXYZ1[xyz1+2];
      
      for (j=0; j<atoms.length; j++) {
        xyz2 = atoms[j].xyz;
        atom2[0] = modelsXYZ2[xyz2];
        atom2[1] = modelsXYZ2[xyz2+1];
        atom2[2] = modelsXYZ2[xyz2+2];
        
        x = atom1[0]-atom2[0]; y = atom1[1]-atom2[1]; z = atom1[2]-atom2[2];
        rr = x*x + y*y + z*z;
        if (rr < r2) {
          atomList.push(soup.chains[c].atoms[i]);
          break;
        }
        
      }
      
    }
  }
  
  return atomList;
}

molmil.atoms2objects = function(atomList, exclude) {
  exclude = exclude || [];
  var resRef = {}, i, resList = [];
  for (i=0; i<exclude.length; i++) resRef[exclude[i].meta.idnr] = false;
  for (i=0; i<atomList.length; i++) {if (! resRef.hasOwnProperty(atomList[i].chain.entry.meta.idnr)) resRef[atomList[i].chain.entry.meta.idnr] = atomList[i].chain.entry;}
  for (i in resRef) {if (resRef[i] != false) resList.push(resRef[i]);}
  return resList;
}

molmil.atoms2chains = function(atomList, exclude) {
  exclude = exclude || [];
  var resRef = {}, i, resList = [];
  for (i=0; i<exclude.length; i++) resRef[exclude[i].CID] = false;
  for (i=0; i<atomList.length; i++) {if (! resRef.hasOwnProperty(atomList[i].chain.CID)) resRef[atomList[i].chain.CID] = atomList[i].chain;}
  for (i in resRef) {if (resRef[i] != false) resList.push(resRef[i]);}
  return resList;
}

molmil.atoms2residues = function(atomList, exclude) {
  exclude = exclude || [];
  var resRef = {}, i, resList = [];
  for (i=0; i<exclude.length; i++) resRef[exclude[i].MID] = false;
  for (i=0; i<atomList.length; i++) {if (! resRef.hasOwnProperty(atomList[i].molecule.MID)) resRef[atomList[i].molecule.MID] = atomList[i].molecule;}
  for (i in resRef) {if (resRef[i] != false) resList.push(resRef[i]);}
  return resList;
}

// make some way to make this work better with async stuff
// even if we have to do something which crappy browsers (=safari) don't like...

molmil.conditionalPluginLoad = function(URL, callBack, self, argList, async) {
  var head = document.getElementsByTagName("head")[0];
  if (! head.scripts || ! head.scripts[URL] || ! head.scripts[URL].loaded) {
    if (callBack || async == false) molmil.loadPlugin(URL, callBack, self, argList, async);
    return false;
  }
  return true;
};

molmil.loadPlugin = function(URL, callBack, self, argList, async) {
  var head = document.getElementsByTagName("head")[0];
  head.scripts = head.scripts || {}; // tracker for plugins => so it's not downloaded twice while the browser is processing the code...
  if (! head.scripts.hasOwnProperty(URL)) {
    var script = head.scripts[URL] = head.pushNode("script");
    script.addCallback = function(callback) {this.callBacks.push(callback); if (this.loaded) this.OnDone();};
    script.callBacks = []; script.loaded = false;
    script.onload = script.onreadystatechange = function() {
      this.loaded = true; var F;
      while (this.callBacks.length) {
        var callback = this.callBacks.pop();
        callback[0].apply(callback[1], callback[2]);
      }
    };
    if (! async) {
      var request = script.xhr = new molmil_dep.CallRemote("GET"); request.ASYNC = false; request.script = script;
      request.OnDone = function () {
        this.script.text = this.request.responseText; this.script.onload();
      };
      request.Send(URL);
    }
    else {
      script.src = URL;
    }
  }
  if (callBack) {
    if (head.scripts[URL].loaded) return callBack.apply(self, argList);
    else head.scripts[URL].addCallback([callBack, self, argList]);
  }
}

molmil.colorBfactor = function(selection, soup, colorFunc) {
  if (colorFunc === undefined) {
    colorFunc = function(inp) {
      var rgba = molmil.hslToRgb123(inp*(2/3), 1.0, 0.5); rgba[0] *= 255; rgba[1] *= 255; rgba[2] *= 255; rgba.push(255);
      return rgba;
    };
  }
  var values = []
  for (var i=0; i<selection.length; i++) values.push(selection[i].Bfactor);
  if (molmil.configBox.bfactor_low != undefined) var min = molmil.configBox.bfactor_low;
  else var min = Math.min.apply(null, values);
  if (molmil.configBox.bfactor_high != undefined) var max = molmil.configBox.bfactor_high;
  else var max = Math.max.apply(null, values); 
  if (molmil.configBox.inverseBfacClr) {var tmp = min; min = max; max = tmp;}
  var diffInv = 1./(max-min), tmp;
  for (var i=0; i<selection.length; i++) {
    tmp = 1-((values[i]-min)*diffInv); ///TODO
    selection[i].rgba = colorFunc(tmp);
    if (selection[i].molecule.CA == selection[i]) selection[i].molecule.rgba = selection[i].rgba;
  }
  soup.renderer.rebuildRequired = true;
}

molmil.formatList = {}
molmil.formatList[".pdb"] = molmil.formatList[".ent"] = "pdb";
molmil.formatList[".mmtf"] = "mmtf";
molmil.formatList[".cif"] = "mmcif";
molmil.formatList[".gro"] = "gro";
molmil.formatList[".trr"] = "gromacs-trr";
molmil.formatList[".xtc"] = "gromacs-xtc";
molmil.formatList[".cor"] = molmil.formatList[".cod"] = "psygene-traj";
molmil.formatList[".mnt"] = "presto-mnt";
molmil.formatList[".mpbf"] = "mpbf";
molmil.formatList[".ccp4"] = "ccp4";
molmil.formatList[".mdl"] = molmil.formatList[".mol"] = molmil.formatList[".sdl"] = molmil.formatList[".sdf"] = "mdl";
molmil.formatList[".mol2"] = "mol2";
molmil.formatList[".xyz"] = "xyz";
molmil.formatList[".obj"] = "obj";
molmil.formatList[".wrl"] = "wrl";
molmil.formatList[".stl"] = "stl";
molmil.formatList[".ply"] = "ply";
molmil.formatList[".mjs"] = "mjs";

molmil.guess_format = function(name) {
  var format = null;
  var fname = name.split("/").slice(-1)[0].replace(".gz", "");
  for (var ext in molmil.formatList) {      
    if (fname.substr(fname.length-ext.length) == ext) {format = molmil.formatList[ext]; break;}
  }
  return format;
};

molmil.loadFilePointer = function(fileObj, func, canvas) {
  fileObj.onload = function(e) {
    func(e.target.result, this.filename);
    canvas.molmilViewer.downloadInProgress--;
  }
  canvas.molmilViewer.downloadInProgress++;
  fileObj.readAsText(fileObj.fileHandle);
  return true;
}

/*



molmil.loadPlugin = async function(URL, callBack, self, argList) {
  var head = document.getElementsByTagName("head")[0];
  head.scripts = head.scripts || {}; // tracker for plugins => so it's not downloaded twice while the browser is processing the code...
  
  //if(argList)console.log(URL, argList[argList.length-2], head.scripts.hasOwnProperty(URL));
  if (! head.scripts.hasOwnProperty(URL)) {
    head.scripts[URL] = null;
    var request = new molmil_dep.CallRemote("GET"); request.ASYNC = false; request.callBack = callBack; request.self = self; request.argList = argList; request.Send(URL);
    head.scripts[URL] = head.pushNode("script");
    head.scripts[URL].innerHTML = request.request.responseText;
  }
  
  if (callBack) {
    await sleep(100);
    return callBack.apply(self, argList);
  }
}

*/

molmil.pointerLoc_setup = function(canvas) {
  molmil.activeCanvas = canvas;
  //if (document.pointerLockElement === canvas) 
    document.addEventListener("mousemove", molmil.pointerLock_update, false);
  //else document.removeEventListener("mousemove", molmil.pointerLock_update, false);
    
}
molmil.pointerLock_update = function(e) {
  var activeCanvas = molmil.activeCanvas;
  
  
  if (e.buttons == 2 || (e.buttons == 1 && e.shiftKey) || e.buttons == 3) {
    activeCanvas.renderer.TransX += (e.movementX)*.5;
    activeCanvas.renderer.TransY += (e.movementY)*.5;
  }
  else if (e.buttons == 1) {
    activeCanvas.renderer.heading += e.movementX;
    activeCanvas.renderer.pitch += e.movementY;
  }
  else if (e.buttons == 4) {
    activeCanvas.renderer.TransZ += e.movementX+e.movementY;
  }
  
  
  activeCanvas.update = true;
};


molmil.startWebVR = function(that) {
  //canvas.requestPointerLock(that.canvas);
    
  molmil.vrDisplays[0].requestPresent([{ source: that.canvas }]).then(function() {
    molmil.vrDisplay = molmil.vrDisplays[0];
    that.renderer.reinitRenderer();
    //molmil.vrDisplay.resetPose(); // deprecated
    var leftEye = molmil.vrDisplay.getEyeParameters('left');
    var rightEye = molmil.vrDisplay.getEyeParameters('right');
    that.renderer.width = that.width = that.canvas.width = Math.max(leftEye.renderWidth, rightEye.renderWidth) * 2;
    that.renderer.height = that.height = that.canvas.height = Math.max(leftEye.renderHeight, rightEye.renderHeight);
    molmil.configBox.stereoMode = 3;
    that.renderer.camera.z = that.calcZ();
    
    //molmil.pointerLoc_setup(that.canvas);
    
    window.addEventListener('vrdisplaypresentchange', function() {
      if (molmil.vrDisplay.isPresenting) return;
      molmil.configBox.stereoMode = 0;
      that.canvas.update = true; // draw scene
    });
    that.canvas.update = true; // draw scene
  });
};

// END

molmil.autoSetup = function(options, canvas) {
  options = options || {};
  if (! options.hasOwnProperty("enable")) options.enable = ["ui", "cli", "cli-hash", "drag-n-drop"];
  
  if (! canvas) {
    for (var i=0; i<molmil.canvasList.length; i++) molmil.autoSetup(options, molmil.canvasList[i]);
    var viewers = document.getElementsByClassName("molmilViewer");
    if (viewers.length == 0) viewers = [document.getElementById("molmilViewer")];
    for (var i=0; i<viewers.length; i++) if (viewers[i] && ! viewers[i].molmilViewer) canvas = molmil.autoSetup(options, viewers[i]);
    return canvas;
  }
  
  if (! canvas.molmilViewer) molmil.createViewer(canvas);
  if (canvas.setupDone) return;
  
  
  if (options.enable.includes("cli") && ! canvas.commandLine) {
    var cli = new molmil.commandLine(canvas);
    if (options.environment) {for (var e in options.environment) cli.environment[e] = options.environment[e];}
  
    if (options.enable.includes("cli-hash")) {
      var hash = window.location.hash ? window.location.hash.substr(1) : "";
      if (hash) cli.environment.console.runCommand(decodeURIComponent(hash));

      window.onhashchange = function() {
        var hash = window.location.hash ? window.location.hash.substr(1) : "";
        if (hash) {molmil.clear(canvas); cli.environment.console.runCommand(decodeURIComponent(hash));}
      }
    }
    
    if (window.onkeyup == null) {
      var lastPress = 0;
      window.onkeyup = function(ev) {
        if (ev.keyCode == 27) {
          var now = (new Date()).getTime();
          if (now-lastPress < 250) cli.icon.onclick();
          lastPress = now;
        }
      }
    }
  }
  else if (options.enable.includes("cli-hash") && ! canvas.commandLine) {
    var hash = window.location.hash ? window.location.hash.substr(1) : "";
    if (hash) {
      var cli = new molmil.commandLine(canvas);
      if (options.environment) {for (var e in options.environment) cli.environment[e] = options.environment[e];}
      cli.environment.console.runCommand(decodeURIComponent(hash));
      cli.consoleBox.style.display = "none";
    }
  }
  
  var wait = false;
  if (options.enable.includes("ui") && ! molmil.UI) {wait = true; molmil.loadPlugin(molmil.settings.src+"plugins/UI.js", null, null, null, true);}
  if (wait) return molmil_dep.asyncStart(molmil.autoSetup, [options, canvas], this, 10);
  
  if (options.enable.includes("ui")) {
    canvas.molmilViewer.UI = new molmil.UI(canvas.molmilViewer);
    canvas.molmilViewer.UI.init();
    canvas.molmilViewer.animation = new molmil.animationObj(canvas.molmilViewer);
  }

  if (options.enable.includes("drag-n-drop")) molmil.bindCanvasInputs(canvas);
  
  try {var commandBuffer = window.sessionStorage.commandBuffer ? JSON.parse(window.sessionStorage.commandBuffer) : [];}
  catch (e) {var commandBuffer = [];}
  for (var i=0; i<commandBuffer.length; i++) processExternalCommand(commandBuffer[i]);  

  canvas.setupDone = true;
  if (options.callback) options.callback();
};

window.addEventListener("message", function(e) {
  try {var commandBuffer = window.sessionStorage.commandBuffer ? JSON.parse(window.sessionStorage.commandBuffer) : [];}
  catch (e) {var commandBuffer = [];}
  e.data.event = e;
  processExternalCommand(e.data, commandBuffer);
  try {window.sessionStorage.commandBuffer = JSON.stringify(commandBuffer);}
  catch (e) {}
}, false);

function processExternalCommand(cmd, commandBuffer) {
  var canvas = molmil.fetchCanvas();
  if (cmd.hasOwnProperty("ping") && commandBuffer !== undefined) {
    if (! canvas || ! canvas.setupDone) return;
    cmd.event.source.postMessage({"pong": cmd.ping}, cmd.event.origin);
  }
  ///////////console.log(cmd);
  if (cmd.hasOwnProperty("extraREST")) {
    var soup = canvas.molmilViewer;
    for (var e in cmd.extraREST) soup.extraREST[e] = soup.extraREST[e];
    if (commandBuffer !== undefined && !cmd.nobuffer) commandBuffer.push({"extraREST": cmd.extraREST});
  }
  if (cmd.hasOwnProperty("extraRESTHeaders")) {
    var soup = canvas.molmilViewer;
    for (var e in cmd.extraRESTHeaders) soup.extraRESTHeaders[e] = soup.extraRESTHeaders[e];
    if (commandBuffer !== undefined && !cmd.nobuffer) commandBuffer.push({"extraRESTHeaders": cmd.extraRESTHeaders});
  }
  if (cmd.hasOwnProperty("__cwd__")) {
    var soup = canvas.molmilViewer;
    soup.__cwd__ = cmd.__cwd__;
    if (commandBuffer !== undefined && !cmd.nobuffer) commandBuffer.push({"__cwd__": cmd.__cwd__});
  }
  if (cmd.hasOwnProperty("load")) {
    var soup = canvas.molmilViewer;
    soup.loadStructureData(cmd.load[0], cmd.load[1], cmd.load[2]);
    if (commandBuffer !== undefined && !cmd.nobuffer) commandBuffer.push({"load": cmd.load});
  }
  if (cmd.hasOwnProperty("run-command")) {
    canvas.commandLine.environment.console.runCommand(cmd["run-command"]);
    //runCommand
    if (commandBuffer !== undefined && !cmd.nobuffer) commandBuffer.push({"run-command": cmd["run-command"]});
  }
  if (cmd.hasOwnProperty("custom") && window.hasOwnProperty(cmd["custom"][0])) {
    molmil_dep.asyncStart(window[cmd["custom"][0]], cmd["custom"][1], null, 0);
    if (commandBuffer !== undefined && !cmd.nobuffer) commandBuffer.push({"custom": cmd["custom"]});
  }
};

molmil.bindCanvasInputs = function(canvas) { 
  return molmil.loadPlugin(molmil.settings.src+"plugins/UI.js", this.bindCanvasInputs, this, [canvas]);
}

molmil.promode_elastic = function(id, mode, type, soup) {
  soup = soup || molmil.cli_soup || molmil.fetchCanvas().molmilViewer;
  if (type == 1) {
    soup.loadStructure(molmil.settings.promodeE_base_structure_url.replace("__ID__", id), 4);
    soup.loadStructure(molmil.settings.promodeE_mode_vectors_url.replace("__ID__", id).replace("__MODE__", mode), 5);
  }
  else {
    soup.loadStructure(molmil.settings.promodeE_animation_url.replace("__ID__", id).replace("__MODE__", mode), 4, function(soup, struc) {
      molmil.displayEntry(struc, soup.AID > 1e5 ? 5 : 1);
      molmil.colorEntry(struc, 1);
      soup.animation.motionMode = 3;
      soup.animation.play();
    });
  }
}

molmil.normalFromMat3 = function (a, out) {
    var a00 = a[0], a01 = a[1], a02 = a[2], a03 = 0,
        a10 = a[3], a11 = a[4], a12 = a[5], a13 = 0,
        a20 = a[6], a21 = a[7], a22 = a[8], a23 = 0,
        a30 = 0, a31 = 0, a32 = 0, a33 = 1,
        b00 = a00 * a11 - a01 * a10,
        b01 = a00 * a12 - a02 * a10,
        b02 = a00 * a13 - a03 * a10,
        b03 = a01 * a12 - a02 * a11,
        b04 = a01 * a13 - a03 * a11,
        b05 = a02 * a13 - a03 * a12,
        b06 = a20 * a31 - a21 * a30,
        b07 = a20 * a32 - a22 * a30,
        b08 = a20 * a33 - a23 * a30,
        b09 = a21 * a32 - a22 * a31,
        b10 = a21 * a33 - a23 * a31,
        b11 = a22 * a33 - a23 * a32,
        // Calculate the determinant
        det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
    if (!det) { 
        return null; 
    }
    det = 1.0 / det;
    out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
    out[1] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
    out[2] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
    out[3] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
    out[4] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
    out[5] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
    out[6] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
    out[7] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
    out[8] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
    return out;
};

molmil.transformObject = function(obj, matrix) {
  var soup = soup || molmil.cli_soup || molmil.fetchCanvas().molmilViewer;
  if (obj instanceof molmil.polygonObject) {
    var normalMat = mat3.normalFromMat4(mat3.create(), matrix);
    var xyzin = vec3.create(), xyzout = vec3.create(), COR = [0, 0, 0, 0], geomRanges = [1e99, -1e99, 1e99, -1e99, 1e99, -1e99];
    var vertexBuffer = obj.data.vertexBuffer;
    
    for (var i=0; i<vertexBuffer.length; i+=7) {
      xyzin[0] = vertexBuffer[i]; xyzin[1] = vertexBuffer[i+1]; xyzin[2] = vertexBuffer[i+2];
      vec3.transformMat4(xyzout, xyzin, matrix);
      vertexBuffer[i] = xyzout[0]; vertexBuffer[i+1] = xyzout[1]; vertexBuffer[i+2] = xyzout[2];
      COR[0] += xyzout[0]; COR[1] += xyzout[1]; COR[2] += xyzout[2]; COR[3] += 1;
        
      xyzin[0] = vertexBuffer[i+3]; xyzin[1] = vertexBuffer[i+4]; xyzin[2] = vertexBuffer[i+5];
      vec3.transformMat3(xyzout, xyzin, normalMat);
      vertexBuffer[i+3] = xyzout[0]; vertexBuffer[i+4] = xyzout[1]; vertexBuffer[i+5] = xyzout[2];
        
        
      if (xyzin[0] < geomRanges[0]) geomRanges[0] = xyzin[0];
      if (xyzin[0] > geomRanges[1]) geomRanges[1] = xyzin[0];
      
      if (xyzin[1] < geomRanges[2]) geomRanges[2] = xyzin[1];
      if (xyzin[1] > geomRanges[3]) geomRanges[3] = xyzin[1];
      
      if (xyzin[2] < geomRanges[4]) geomRanges[4] = xyzin[2];
      if (xyzin[2] > geomRanges[5]) geomRanges[5] = xyzin[2];
    }
    obj.meta.COR = COR;
    obj.meta.geomRanges = geomRanges;
    obj.programs[0].setBuffers(vertexBuffer, obj.data.indexBuffer);
  }
    
  soup.calculateCOG();
}

molmil.cloneObject = function(obj, settings) {
  var soup = soup || molmil.cli_soup || molmil.fetchCanvas().molmilViewer, newObj = null;
  settings = settings || {};
  if (obj instanceof molmil.polygonObject) {
    newObj = new molmil.polygonObject({filename: obj.meta.filename+".copy", COR: obj.meta.COR, geomRanges: obj.meta.geomRanges}); soup.structures.push(newObj);
    var vertexBuffer = new Float32Array(obj.data.vertexBuffer.length);
    var indexBuffer = new Int32Array(obj.data.indexBuffer.length);
    for (var i=0; i<vertexBuffer.length; i++) vertexBuffer[i] = obj.data.vertexBuffer[i];
    for (var i=0; i<indexBuffer.length; i++) indexBuffer[i] = obj.data.indexBuffer[i];

    for (var e in obj.programs[0].settings) {if (! (e in settings)) settings[e] = obj.programs[0].settings[e];}

    var program = molmil.geometry.build_simple_render_program(vertexBuffer, indexBuffer, soup.renderer, settings);
    soup.renderer.addProgram(program);
    newObj.programs.push(program);
            
    // also add an entry to the structures menu for easy enabling/disabling
    newObj.options = [[name, program]];
    
    
    newObj.data = {};
    newObj.data.vertexBuffer = vertexBuffer;
    newObj.data.indexBuffer = indexBuffer;
    newObj.data.vertexSize = obj.data.vertexSize;
    newObj.data.vertices_offset = obj.data.vertices_offset;
    
    soup.calculateCOG();
  }
  return newObj;
}

molmil.orient = function(atoms, soup, xyzs) {
  // if no atoms supplied, do something...
  
  xyzs = xyzs || [];
  var c, m, a, f, modelsXYZ;
  
  var COG = [0.0, 0.0, 0.0, 0];
  
  // also take into account any BUs...

  if (atoms) {
    for (a=0; a<atoms.length; a++) {
      chain = atoms[a].chain;
      for (f=0; f<chain.modelsXYZ.length; f++) {
        modelsXYZ = chain.modelsXYZ[f];
        xyzs.push([modelsXYZ[atoms[a].xyz], modelsXYZ[atoms[a].xyz+1], modelsXYZ[atoms[a].xyz+2]]);
      }
    }
  }
  else if (! xyzs.length) {
    var chains = soup.chains;
    for (c=0; c<chains.length; c++) {
      chain = chains[c];

      for (f=0; f<chain.modelsXYZ.length; f++) {
        if (! molmil.configBox.orientMODELs && f > 0) break;
        modelsXYZ = chain.modelsXYZ[f];
    
        for (m=0; m<chain.molecules.length; m++) {
          if (chain.molecules[m].water) continue;
          if (! chain.molecules[m].CA || chain.molecules[m].ligand) {
             for (a=0; a<chain.molecules[m].atoms.length; a++) xyzs.push([modelsXYZ[chain.molecules[m].atoms[a].xyz], modelsXYZ[chain.molecules[m].atoms[a].xyz+1], modelsXYZ[chain.molecules[m].atoms[a].xyz+2]]);
          }
          else xyzs.push([modelsXYZ[chain.molecules[m].CA.xyz], modelsXYZ[chain.molecules[m].CA.xyz+1], modelsXYZ[chain.molecules[m].CA.xyz+2]]);
        }
      }
    }
  }

  for (n=0; n<xyzs.length; n++) {
    COG[0] += xyzs[n][0];
    COG[1] += xyzs[n][1];
    COG[2] += xyzs[n][2];
    COG[3] += 1;
  }
  COG[0] /= COG[3]; COG[1] /= COG[3]; COG[2] /= COG[3];
  
  var n, i, j, C_ij = [[0.0, 0.0, 0.0], [0.0, 0.0, 0.0], [0.0, 0.0, 0.0]], x, y, z, r2, maxRadius = 0;

  for (n=0; n<xyzs.length; n++) {
    x = xyzs[n][0] - COG[0]; y = xyzs[n][1] - COG[1]; z = xyzs[n][2] - COG[2];

    r2 = x*x + y*y + z*z;
    if (r2 > maxRadius) maxRadius = r2;
    
    C_ij[0][0] += x * x; C_ij[1][1] += y * y; C_ij[2][2] += z * z;
    C_ij[0][1] += x * y; C_ij[0][2] += x * z; C_ij[1][2] += y * z;
    
  }
  
  var Ninv = 1./xyzs.length;
  C_ij[0][0] *= Ninv; C_ij[1][1] *= Ninv; C_ij[2][2] *= Ninv;
  C_ij[0][1] = C_ij[1][0] = C_ij[0][1] * Ninv; C_ij[0][2] = C_ij[2][0] = C_ij[0][2] * Ninv; C_ij[1][2] = C_ij[2][1] = C_ij[1][2] * Ninv; 
  
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
    
  var v1 = [1, 1, 1]; powerIteration_vec3(v1);
  if (vec3.dot([Math.abs(v1[0]), Math.abs(v1[1]), Math.abs(v1[2])], v1) > 0) vec3.negate(v1, v1);
  

  var sf = vec3.squaredLength(z)/lambda;
  var vvT = new Float64Array(9);
  vvT[0] = v1[0]*v1[0]*sf; vvT[1] = v1[0]*v1[1]*sf; vvT[2] = v1[0]*v1[2]*sf;
  vvT[3] = v1[1]*v1[0]*sf; vvT[4] = v1[1]*v1[1]*sf; vvT[5] = v1[1]*v1[2]*sf;
  vvT[6] = v1[2]*v1[0]*sf; vvT[7] = v1[2]*v1[1]*sf; vvT[8] = v1[2]*v1[2]*sf;
  A[0] -= vvT[0]; A[1] -= vvT[1]; A[2] -= vvT[2]; A[3] -= vvT[3]; A[4] -= vvT[4]; A[5] -= vvT[5]; A[6] -= vvT[6]; A[7] -= vvT[7]; A[8] -= vvT[8];

  var v2 = [1, 1, 1]; powerIteration_vec3(v2);
  if (vec3.dot([Math.abs(v2[0]), Math.abs(v2[1]), Math.abs(v2[2])], v2) > 0) vec3.negate(v2, v2);

  var axis1 = [1, 0, 0]; vec3.normalize(axis1, axis1);
  var axis2 = [0, 1, 0]; vec3.normalize(axis2, axis2);
  
  var cross1 = vec3.cross(vec3.create(), v1, axis1);
  var stage1 = mat4.create(); mat4.fromRotation(stage1, vec3.angle(v1, axis1), cross1);  

  var v2p = vec3.transformMat4(vec3.create(), v2, stage1);
  var cross2 = vec3.cross(vec3.create(), v2p, axis2);
  
  var stage2 = mat4.create(); mat4.fromRotation(stage2, vec3.angle(v2p, axis2), cross2);
  
  var matrix = mat4.multiply(mat4.create(), stage2, stage1);
  if (! isNaN(sf)) mat4.getRotation(soup.renderer.camera.QView, matrix);
  
  if (atoms && atoms.length) soup.calculateCOG(atoms);

  var mx = Math.sqrt(maxRadius)*2 + 5;
  
  while (true) {
    if (molmil.configBox.projectionMode == 1) {
      var zmove = ((mx/Math.sin(molmil.configBox.camera_fovy*(Math.PI/180)))), aspect = soup.renderer.height/soup.renderer.width;
      if (aspect > 1) zmove *= aspect;
      soup.renderer.camera.z = -zmove;
    }
    else if (molmil.configBox.projectionMode == 2) soup.renderer.camera.z = -((mx/Math.min(soup.renderer.width, soup.renderer.height))*molmil.configBox.zFar*(.5))-molmil.configBox.zNear-1;
    if (Math.abs(soup.renderer.camera.z) < molmil.configBox.zFar*.5) break;
    molmil.configBox.zFar = Math.abs(soup.renderer.camera.z)*3;
    soup.renderer.resizeViewPort();
  }
}

molmil.superpose = function(A, B, C, modelId, iterate) {
  if (! molmil.toBigEndian32) return molmil.loadPlugin(molmil.settings.src+"plugins/md-anal.js", this.superpose, this, [A, B, C, modelId, iterate]);
  modelId = modelId || 0;
  
  var i, atom, atom2, xyz = vec3.create(), xyz2 = vec3.create(), rotationMatrix, Rs = new Array(A.length), old_selIdxs = A.map(function(x,i) {return i;});
  
  var Ap = A, Bp = B, selIdxs, initialRMSD = undefined;
  while (true) {
    var data = molmil.calcRMSD(Ap, Bp, true);
    if (! data) return;
    if (initialRMSD == undefined) initialRMSD = data[0];
    rotationMatrix = data[1];
    if (! iterate || modelId != 0) break;
    
    var iterate2 = iterate*iterate, Rs = [];
    
    selIdxs = [];
    for (i=0; i<B.length; i++) {
      atom = B[i];
      atom2 = A[i];
      
      xyz[0] = atom.chain.modelsXYZ[modelId][atom.xyz] - data[3][0];
      xyz[1] = atom.chain.modelsXYZ[modelId][atom.xyz+1] - data[3][1];
      xyz[2] = atom.chain.modelsXYZ[modelId][atom.xyz+2] - data[3][2];
      vec3.transformMat4(xyz, xyz, rotationMatrix);
      xyz[0] += data[2][0];
      xyz[1] += data[2][1];
      xyz[2] += data[2][2];
      
      xyz2[0] = atom2.chain.modelsXYZ[modelId][atom2.xyz];
      xyz2[1] = atom2.chain.modelsXYZ[modelId][atom2.xyz+1];
      xyz2[2] = atom2.chain.modelsXYZ[modelId][atom2.xyz+2];
      
      Rs[i] = Math.pow(xyz[0]-xyz2[0], 2) + Math.pow(xyz[1]-xyz2[1], 2) + Math.pow(xyz[2]-xyz2[2], 2);
    }
    // at least try to get a good alignment for part of the structure (if the structure partially mismatches (domain level, not loop leve), but sequence is the same, we get a bad initial superposition; using this method, we will get a good superposition for the parts that match)
    var minScore2 = Rs.slice().sort(function(a,b){ return a < b ? -1 : 1;})[parseInt(Rs.length*.25)];
    if (minScore2 > iterate2)  iterate2 = minScore2;
    for (i=0; i<B.length; i++) {
      if (Rs[i] < iterate2) selIdxs.push(i);
    }
    
    if (selIdxs.length < 3) break;
    if (selIdxs.length == old_selIdxs.length && JSON.stringify(selIdxs) == JSON.stringify(old_selIdxs)) break;
    Ap = selIdxs.map(function(i) {return A[i];});
    Bp = selIdxs.map(function(i) {return B[i];});
    old_selIdxs = selIdxs;
  }
  
  for (i=0; i<C.length; i++) {
    atom = C[i];
    xyz[0] = atom.chain.modelsXYZ[modelId][atom.xyz] - data[3][0];
    xyz[1] = atom.chain.modelsXYZ[modelId][atom.xyz+1] - data[3][1];
    xyz[2] = atom.chain.modelsXYZ[modelId][atom.xyz+2] - data[3][2];
    vec3.transformMat4(xyz, xyz, rotationMatrix);
    atom.chain.modelsXYZ[modelId][atom.xyz] = xyz[0] + data[2][0];
    atom.chain.modelsXYZ[modelId][atom.xyz+1] = xyz[1] + data[2][1];
    atom.chain.modelsXYZ[modelId][atom.xyz+2] = xyz[2] + data[2][2];
  }

  return {initial_rmsd: initialRMSD, rmsd: data[0], aligned_indices: selIdxs};
};

molmil.alignInfo = {};

molmil.align = function(A, B, options) {
  // https://github.com/CDCgov/bioseq-js/blob/master/dist/bioseq.js
  if (! window.bioseq) return molmil.loadPlugin("https://raw.githubusercontent.com/CDCgov/bioseq-js/master/dist/bioseq.js", molmil.align, molmil, [A, B, options]); 
  options = options || {};
  if (! bioseq.amino_acids) {
    var blosum62 = {"*":{"*":1,"A":-4,"C":-4,"B":-4,"E":-4,"D":-4,"G":-4,"F":-4,"I":-4,"H":-4,"K":-4,"M":-4,"L":-4,"N":-4,"Q":-4,"P":-4,"S":-4,"R":-4,"T":-4,"W":-4,"V":-4,"Y":-4,"X":-4,"Z":-4},"A":{"*":-4,"A":4,"C":0,"B":-2,"E":-1,"D":-2,"G":0,"F":-2,"I":-1,"H":-2,"K":-1,"M":-1,"L":-1,"N":-2,"Q":-1,"P":-1,"S":1,"R":-1,"T":0,"W":-3,"V":0,"Y":-2,"X":0,"Z":-1},"C":{"*":-4,"A":0,"C":9,"B":-3,"E":-4,"D":-3,"G":-3,"F":-2,"I":-1,"H":-3,"K":-3,"M":-1,"L":-1,"N":-3,"Q":-3,"P":-3,"S":-1,"R":-3,"T":-1,"W":-2,"V":-1,"Y":-2,"X":-2,"Z":-3},"B":{"*":-4,"A":-2,"C":-3,"B":4,"E":1,"D":4,"G":-1,"F":-3,"I":-3,"H":0,"K":0,"M":-3,"L":-4,"N":3,"Q":0,"P":-2,"S":0,"R":-1,"T":-1,"W":-4,"V":-3,"Y":-3,"X":-1,"Z":1},"E":{"*":-4,"A":-1,"C":-4,"B":1,"E":5,"D":2,"G":-2,"F":-3,"I":-3,"H":0,"K":1,"M":-2,"L":-3,"N":0,"Q":2,"P":-1,"S":0,"R":0,"T":-1,"W":-3,"V":-2,"Y":-2,"X":-1,"Z":4},"D":{"*":-4,"A":-2,"C":-3,"B":4,"E":2,"D":6,"G":-1,"F":-3,"I":-3,"H":-1,"K":-1,"M":-3,"L":-4,"N":1,"Q":0,"P":-1,"S":0,"R":-2,"T":-1,"W":-4,"V":-3,"Y":-3,"X":-1,"Z":1},"G":{"*":-4,"A":0,"C":-3,"B":-1,"E":-2,"D":-1,"G":6,"F":-3,"I":-4,"H":-2,"K":-2,"M":-3,"L":-4,"N":0,"Q":-2,"P":-2,"S":0,"R":-2,"T":-2,"W":-2,"V":-3,"Y":-3,"X":-1,"Z":-2},"F":{"*":-4,"A":-2,"C":-2,"B":-3,"E":-3,"D":-3,"G":-3,"F":6,"I":0,"H":-1,"K":-3,"M":0,"L":0,"N":-3,"Q":-3,"P":-4,"S":-2,"R":-3,"T":-2,"W":1,"V":-1,"Y":3,"X":-1,"Z":-3},"I":{"*":-4,"A":-1,"C":-1,"B":-3,"E":-3,"D":-3,"G":-4,"F":0,"I":4,"H":-3,"K":-3,"M":1,"L":2,"N":-3,"Q":-3,"P":-3,"S":-2,"R":-3,"T":-1,"W":-3,"V":3,"Y":-1,"X":-1,"Z":-3},"H":{"*":-4,"A":-2,"C":-3,"B":0,"E":0,"D":-1,"G":-2,"F":-1,"I":-3,"H":8,"K":-1,"M":-2,"L":-3,"N":1,"Q":0,"P":-2,"S":-1,"R":0,"T":-2,"W":-2,"V":-3,"Y":2,"X":-1,"Z":0},"K":{"*":-4,"A":-1,"C":-3,"B":0,"E":1,"D":-1,"G":-2,"F":-3,"I":-3,"H":-1,"K":5,"M":-1,"L":-2,"N":0,"Q":1,"P":-1,"S":0,"R":2,"T":-1,"W":-3,"V":-2,"Y":-2,"X":-1,"Z":1},"M":{"*":-4,"A":-1,"C":-1,"B":-3,"E":-2,"D":-3,"G":-3,"F":0,"I":1,"H":-2,"K":-1,"M":5,"L":2,"N":-2,"Q":0,"P":-2,"S":-1,"R":-1,"T":-1,"W":-1,"V":1,"Y":-1,"X":-1,"Z":-1},"L":{"*":-4,"A":-1,"C":-1,"B":-4,"E":-3,"D":-4,"G":-4,"F":0,"I":2,"H":-3,"K":-2,"M":2,"L":4,"N":-3,"Q":-2,"P":-3,"S":-2,"R":-2,"T":-1,"W":-2,"V":1,"Y":-1,"X":-1,"Z":-3},"N":{"*":-4,"A":-2,"C":-3,"B":3,"E":0,"D":1,"G":0,"F":-3,"I":-3,"H":1,"K":0,"M":-2,"L":-3,"N":6,"Q":0,"P":-2,"S":1,"R":0,"T":0,"W":-4,"V":-3,"Y":-2,"X":-1,"Z":0},"Q":{"*":-4,"A":-1,"C":-3,"B":0,"E":2,"D":0,"G":-2,"F":-3,"I":-3,"H":0,"K":1,"M":0,"L":-2,"N":0,"Q":5,"P":-1,"S":0,"R":1,"T":-1,"W":-2,"V":-2,"Y":-1,"X":-1,"Z":3},"P":{"*":-4,"A":-1,"C":-3,"B":-2,"E":-1,"D":-1,"G":-2,"F":-4,"I":-3,"H":-2,"K":-1,"M":-2,"L":-3,"N":-2,"Q":-1,"P":7,"S":-1,"R":-2,"T":-1,"W":-4,"V":-2,"Y":-3,"X":-2,"Z":-1},"S":{"*":-4,"A":1,"C":-1,"B":0,"E":0,"D":0,"G":0,"F":-2,"I":-2,"H":-1,"K":0,"M":-1,"L":-2,"N":1,"Q":0,"P":-1,"S":4,"R":-1,"T":1,"W":-3,"V":-2,"Y":-2,"X":0,"Z":0},"R":{"*":-4,"A":-1,"C":-3,"B":-1,"E":0,"D":-2,"G":-2,"F":-3,"I":-3,"H":0,"K":2,"M":-1,"L":-2,"N":0,"Q":1,"P":-2,"S":-1,"R":5,"T":-1,"W":-3,"V":-3,"Y":-2,"X":-1,"Z":0},"T":{"*":-4,"A":0,"C":-1,"B":-1,"E":-1,"D":-1,"G":-2,"F":-2,"I":-1,"H":-2,"K":-1,"M":-1,"L":-1,"N":0,"Q":-1,"P":-1,"S":1,"R":-1,"T":5,"W":-2,"V":0,"Y":-2,"X":0,"Z":-1},"W":{"*":-4,"A":-3,"C":-2,"B":-4,"E":-3,"D":-4,"G":-2,"F":1,"I":-3,"H":-2,"K":-3,"M":-1,"L":-2,"N":-4,"Q":-2,"P":-4,"S":-3,"R":-3,"T":-2,"W":11,"V":-3,"Y":2,"X":-2,"Z":-3},"V":{"*":-4,"A":0,"C":-1,"B":-3,"E":-2,"D":-3,"G":-3,"F":-1,"I":3,"H":-3,"K":-2,"M":1,"L":1,"N":-3,"Q":-2,"P":-2,"S":-2,"R":-3,"T":0,"W":-3,"V":4,"Y":-1,"X":-1,"Z":-2},"Y":{"*":-4,"A":-2,"C":-2,"B":-3,"E":-2,"D":-3,"G":-3,"F":3,"I":-1,"H":2,"K":-2,"M":-1,"L":-1,"N":-2,"Q":-1,"P":-3,"S":-2,"R":-2,"T":-2,"W":2,"V":-1,"Y":7,"X":-1,"Z":-2},"X":{"*":-4,"A":0,"C":-2,"B":-1,"E":-1,"D":-1,"G":-1,"F":-1,"I":-1,"H":-1,"K":-1,"M":-1,"L":-1,"N":-1,"Q":-1,"P":-2,"S":0,"R":-1,"T":0,"W":-2,"V":-1,"Y":-1,"X":-1,"Z":-1},"Z":{"*":-4,"A":-1,"C":-3,"B":1,"E":4,"D":1,"G":-2,"F":-3,"I":-3,"H":0,"K":1,"M":-1,"L":-3,"N":0,"Q":3,"P":-1,"S":0,"R":0,"T":-1,"W":-3,"V":-2,"Y":-2,"X":-1,"Z":4}};
    var alphabet = Object.keys(blosum62);
    bioseq.amino_acids = bioseq.makeAlphabetMap(alphabet.join(""), alphabet.indexOf("*"));

    var i,j, matrix = [];
    for (i=0; i<alphabet.length; i++) {
      matrix[i] = [];
      for (j=0; j<alphabet.length; j++) matrix[i][j] = blosum62[alphabet[i]][alphabet[j]];
    }
    bioseq.blosum62 = matrix;
  }
  
  if (A.molecules[0].xna) {
    var conv = {"A": "A", "C": "C", "T": "T", "G": "G", "DA": "A", "DC": "C", "DT": "T", "DG": "G", "U": "T", "DU": "T"};
    var Aseq = A.molecules.map(function(x) {return conv[x.name]||"*";}).join("");
    var Bseq = B.molecules.map(function(x) {return conv[x.name]||"*";}).join("");
    var rst = bioseq.align(Aseq, Bseq, true);
  }
  else {
    var conv = {"ALA":"A","CYS":"C","ASP":"D","GLU":"E","PHE":"F","GLY":"G","HIS":"H","ILE":"I","LYS":"K","LEU":"L","MET":"M","ASN":"N","PRO":"P","GLN":"Q","ARG":"R","SER":"S","THR":"T","VAL":"V","TRP":"W","TYR":"Y"};
    var Aseq = A.molecules.map(function(x) {return conv[x.name]||"*";}).join("");
    var Bseq = B.molecules.map(function(x) {return conv[x.name]||"*";}).join("");
    var rst = bioseq.align(Aseq, Bseq, true, bioseq.blosum62, [12, 1], null, bioseq.amino_acids);
  }

  var fmt = bioseq.cigar2gaps(Aseq, Bseq, rst.position, rst.CIGAR);
  var a = rst.position, b = (rst.CIGAR[0] & 0xf) == 4 ? (rst.CIGAR[0] >> 4) : 0, Aarr = [], Barr = [], align = [];
  
  Aseq = "-".repeat(b) + fmt[0];
  Bseq = Bseq.substr(0,b) + fmt[1];
  b = 0;
  for (var i=0; i<Aseq.length; i++) {
    if (Aseq[i] == "-") {b++; align.push(" "); continue;}
    if (Bseq[i] == "-") {a++; align.push(" "); continue;}
    if (A.molecules[a].CA && B.molecules[b].CA) {
      Aarr.push(A.molecules[a].CA);
      Barr.push(B.molecules[b].CA);
      align.push("|");
    }
    a++; b++;
  }

  var Carr = [];
  for (var c=0; c<B.entry.chains.length; c++) Carr = Carr.concat(B.entry.chains[c].atoms);
  
  var data = molmil.superpose(Aarr, Barr, Carr, undefined, 2);
  if (data === undefined) return console.error("An error occurred...");

  var oASIdxs = align.map(function(x,i) {return i;}).filter(function(x){return align[x]=="|";}).filter(function(x,i){return data.aligned_indices.includes(i);})
  data.optimized_alignment = align.map(function(x,i) {return oASIdxs.includes(i) ? "|" : " "}).join("");
  data.alignment = align.join("");
  data.seq1 = Aseq;
  data.seq2 = Bseq;
  data.chain1 = A;
  data.chain2 = B;
  
  ID = A.CID+":"+B.CID;
  
  molmil.alignInfo[ID] = data;
  
  if (! options.skipOrient) molmil.orient(Aarr, A.entry.soup);
  A.entry.soup.renderer.rebuildRequired = true;
  molmil.geometry.reInitChains = true;
}

molmil.record = function(canvas, video_path, video_framerate) {
  // make sure that both the width & height are divisible by 2 (ffmpeg issue)
  var w = canvas.width, h = canvas.height;
  if (w%2 == 1) w--;
  if (h%2 == 1) h--;
  if (w != canvas.width || h != canvas.height) {canvas.width = w; canvas.height = h; canvas.renderer.resizeViewPort();}
  initVideo(video_path, canvas.width, canvas.height, video_framerate);
  
  canvas.renderer.onRenderFinish = function() {
    var pixels = new Uint8Array(canvas.width * canvas.width * 4);
    addFrame(canvas.toDataURL());
    canvas.renderer.gl.readPixels(0, 0, canvas.width, canvas.height, canvas.renderer.gl.RGBA, canvas.renderer.gl.UNSIGNED_BYTE, pixels);
  };
}

molmil.end_record = function(canvas) {
  finalizeVideo();
  canvas.renderer.onRenderFinish = undefined;
}

molmil.getState = function() {
  var canvas = molmil.fetchCanvas(), commands = [];
  
  
  var structures = [];
  
  for (var i=0; i<canvas.molmilViewer.structures.length; i++) {
    if (! canvas.molmilViewer.structures[i].pdbid) continue;
    structures.push(canvas.molmilViewer.structures[i]);
  }
  
  for (var i=0; i<structures.length; i++) {
    if (structures[i].id.indexOf("_") == -1) commands.push("fetch "+structures[i].id);
    else commands.push("fetch-chain "+structures[i].id);
    
    var cartoon = [], tube = [];
    for (var c=0; c<structures.chains.length; c++) {
      if (structures.chains[c].displayMode == 2) tube.push(structures.chains[c].name);
      else if (structures.chains[c].displayMode == 3) cartoon.push(structures.chains[c].name);
    }
    
    if (tube.length == structures.chains.length) commands.push("show tube, model #"+(i+1));
    else if (cartoon.length == structures.chains.length) commands.push("show cartoon, model #"+(i+1));
    else {
      commands.push("hide cartoon, model #"+(i+1));
      if (tube.length) commands.push("show tube, model #"+(i+1)+" and ("+tube.map(function(x) {return "chain "+x;}).join(" or ")+")");
      if (cartoon.length) commands.push("show cartoon, model #"+(i+1)+" and ("+cartoon.map(function(x) {return "chain "+x;}).join(" or ")+")");
    }
    
    for (var c=0; c<structures.chains.length; c++) {
      var sticks = [], sticks_sc, ballsticks = [], ballsticks_sc = [], spheres = [], spheres_sc = [], lines = [], lines_sc = [];
      for (var m=0, mol, atm; m<structures.chains[c].molecules.length; m++) {
        mol = structures.chains[c].molecules[m];
        if (mol.displayMode == 0) {
          atm = mol.CA || mol.atoms[0];
          if (atm.displayMode == 1) {
            if (mol.showSC) spheres_sc.push(mol);
            else spheres.push(mol);
          }
          else if (atm.displayMode == 2) {
            if (mol.showSC) ballsticks_sc.push(mol);
            else ballsticks.push(mol);
          }
          else if (atm.displayMode == 3) {
            if (mol.showSC) sticks_sc.push(mol);
            else sticks.push(mol);
          }
          else if (atm.displayMode == 4) {
            if (mol.showSC) lines_sc.push(mol);
            else lines.push(mol);
          }
        }
      }
      
      // now, figure out how to efficiently create a query that lists the shown residues...
      
    }   
    
    
  }

/*

chain.displayMode = 0; => hidden
chain.displayMode = 1; => all-atom
chain.displayMode = 2; => tube
chain.displayMode = 3; => cartoon

mol.displayMode = 0; => hidden
mol.displayMode = 1; => spacefill
mol.displayMode = 2; => ballstick
mol.displayMode = 3; => stick
mol.displayMode = 4; => wireframe

*/
  
}

if (typeof(requestAnimationFrame) != "undefined") molmil.animate_molmilViewers();

if (! window.molmil_dep) {
  var dep = document.createElement("script")
  dep.src = molmil.settings.src+"molmil_dep.js";
  var head = document.getElementsByTagName("head")[0];
  head.appendChild(dep);
}

molmil.initVR = function(soup, callback) {
  var initFakeVR = function() {
    var dep = document.createElement("script")
    dep.src = molmil.settings.src+"lib/webvr-polyfill.min.js";
    dep.onload = function() {
      var config = {
        // Scales the recommended buffer size reported by WebVR, which can improve
        // performance.
        BUFFER_SCALE: 1.0, // Default: 0.5.
      }
      var polyfill = new WebVRPolyfill(config);
      navigator.getVRDisplays().then(function(displays) {
        if (displays.length) {molmil.vrDisplays = displays; molmil.VRstatus = true; molmil.initVR(soup, callback);}
        else {molmil.VRstatus = false; callback();}
    });};
    var head = document.getElementsByTagName("head")[0];
    head.appendChild(dep);
  }
  if (! molmil.VRstatus) {
    if (navigator.getVRDisplays) {
      navigator.getVRDisplays().then(function(displays) {if (displays.length) {molmil.vrDisplays = displays; molmil.VRstatus = true; molmil.initVR(soup, callback);} else initFakeVR();}).catch(function(){initFakeVR();});
    }
    else initFakeVR();
  }
  else {
    if (soup) molmil.startWebVR(soup);
    if (callback) callback();
  }
}

molmil.initSettings();
