#x group_PDB --> not necessary, so move to legacy (make it so that the parser will work without it)
#x label_alt_id --> exclude all atoms where label_alt_id != "A"
#? type_symbol --> does the pdbx parser work without elements?
#x pdbx_PDB_model_num --> only include the first model
#
#- Cartn_x
#- Cartn_y
#- Cartn_z
#- label_seq_id
#- label_comp_id
#- label_asym_id
#- label_atom_id

# upgrade this script to:
# - use the rdb to get a list of large entries
# - get a list of files in /var/PDBj/work/mine2/data_dir/mmjson-lite
# - compare and check which entries have been updated
# - re-generate new/updated entries (save as xxxx-lite.json.gz)

try: import ujson as json
except:
  try: import json
  except: import simplejson as json

import gzip, os, sys, cif
  
#agora_entries = [
#  ["1tph", None],
#  ["1bbt", None],
#  ["1mbn", None],
#  ["3rif", set(["A", "B", "C", "D", "E"])]
#]

pdbid = "6fs9"

chainids = None
include_residues = []

if pdbid == "1mbn":
  include_residues = ["64"]
  
if pdbid == "1ema":
  include_residues = ["64", "68"]
  
if pdbid == "6co3":
  include_residues = ["2", "3", "4", "5", "6", "7"]
  
  
if pdbid[-4:] == ".cif":
  locA = pdbid
  locB = "%s-agora.json"%pdbid[:-4]
  if not cif.__mmcifTyping__: cif.__mmcifTyping__ = cif.__loadCIFdic__("/home/web/mine2/mmjson-builder/mmcif_pdbx_v50.dic")
else:  
  locA = "/home/archive/ftp/pdbj/mine2/data/mmjson/all/%s.json.gz"%pdbid
  locB = "%s-agora.json"%pdbid
  
def processEntry():
  if ".cif" in locA: data = cif.__loadCIF__(locA, True, True)
  elif locA[-3:] == ".gz": data = json.load(gzip.open(locA))

  key = data.keys()[0]
  
  atom_site = data[key]["atom_site"]

  OK = []

  auth_asym_id = atom_site["auth_asym_id"]
  label_alt_id = atom_site.get("label_alt_id", None)
  pdbx_PDB_model_num = atom_site.get("pdbx_PDB_model_num", None)

  if atom_site.has_key("label_atom_id"): atom_id = atom_site["label_atom_id"]
  else: atom_id = atom_site["auth_atom_id"]

  if atom_site.has_key("label_comp_id"): comp_id = atom_site["label_comp_id"]
  else: comp_id = atom_site["auth_comp_id"]

  polyTypes = set(["ACE", "NME"])

  try: 
    chem_comp = data[key]["chem_comp"]
    for i in xrange(len(chem_comp["id"])):
      if chem_comp["mon_nstd_flag"][i] or "peptide" in chem_comp["type"][i].lower(): polyTypes.add(chem_comp["id"][i])
  except: polyTypes = set(["ALA", "CYS", "ASP", "GLU", "PHE", "GLY", "HIS", "ILE", "LYS", "LEU", "MET", "ASN", "PRO", "GLN", "ARG", "SER", "THR", "VAL", "TRP", "TYR", "ACE", "NME", "HIP", "HIE", "HID", "CYX", "A", "T", "G", "C", "DA", "DT", "DG", "DC", "U", "DU", "MSE", "SEQ", "CSW"])

  auth_seq_id = atom_site["auth_seq_id"]
  
  for i in xrange(len(atom_site["group_PDB"])):
    if label_alt_id != None and label_alt_id[i] != None and label_alt_id[i].upper() != "A": continue
    if pdbx_PDB_model_num != None and pdbx_PDB_model_num[i] != None and pdbx_PDB_model_num[i] != pdbx_PDB_model_num[0]: continue
    if not comp_id[i] in polyTypes:
      if comp_id[i] == "HOH" or comp_id[i] == "DOD" or comp_id[i] == "WAT": continue
    elif atom_id[i] != "CA" and atom_id[i] != "P": 
      if atom_site["group_PDB"][i] == "ATOM" and not auth_seq_id[i] in include_residues: continue
    
    if chainids != None and not auth_asym_id[i] in chainids: continue
  
    OK.append(i)

  Cartn_x = atom_site["Cartn_x"]
  Cartn_y = atom_site["Cartn_y"]
  Cartn_z = atom_site["Cartn_z"]

  new = {}
  new[key] = {"atom_site": {"Cartn_x": [Cartn_x[i] for i in OK], "Cartn_y": [Cartn_y[i] for i in OK], "Cartn_z": [Cartn_z[i] for i in OK]}}
  
  
  for add in ["pdbx_struct_oper_list", "pdbx_struct_assembly_gen", "struct_conn", "struct_sheet_range", "struct_conf"]:
    if data[key].has_key(add): new[key][add] = data[key][add]

  if atom_site.has_key("label_seq_id"): 
    label_seq_id = atom_site["label_seq_id"]
    new[key]["atom_site"]["label_seq_id"] = [label_seq_id[i] for i in OK]
  elif atom_site.has_key("auth_seq_id"): 
    auth_seq_id = atom_site["auth_seq_id"]
    new[key]["atom_site"]["auth_seq_id"] = [auth_seq_id[i] for i in OK]
  else:
    print "ERROR: label_seq_id/auth_seq_id is not available"
    exit()

  if atom_site.has_key("label_comp_id"): 
    label_comp_id = atom_site["label_comp_id"]
    new[key]["atom_site"]["label_comp_id"] = [label_comp_id[i] for i in OK]
  elif atom_site.has_key("auth_comp_id"): 
    auth_comp_id = atom_site["auth_comp_id"]
    new[key]["atom_site"]["auth_comp_id"] = [auth_comp_id[i] for i in OK]
  else:
    print "ERROR: label_comp_id/auth_comp_id is not available"
    exit()

  if atom_site.has_key("label_asym_id"): 
    label_asym_id = atom_site["label_asym_id"]
    new[key]["atom_site"]["label_asym_id"] = [label_asym_id[i] for i in OK]
  elif atom_site.has_key("auth_asym_id"): 
    new[key]["atom_site"]["auth_asym_id"] = [auth_asym_id[i] for i in OK]
  else:
    print "ERROR: label_asym_id/auth_asym_id is not available"
    exit()

  if atom_site.has_key("label_atom_id"): 
    label_atom_id = atom_site["label_atom_id"]
    new[key]["atom_site"]["label_atom_id"] = [label_atom_id[i] for i in OK]
  elif atom_site.has_key("auth_atom_id"): 
    auth_atom_id = atom_site["auth_atom_id"]
    new[key]["atom_site"]["auth_atom_id"] = [auth_atom_id[i] for i in OK]
  else:
    print "ERROR: label_atom_id/auth_atom_id is not available"
    exit()
  
  open(locB, "w").write(json.dumps(new))  
  
if "--rebuild" in sys.argv or not os.path.exists(locB) or os.stat(locA).st_mtime > os.stat(locB).st_mtime: processEntry()