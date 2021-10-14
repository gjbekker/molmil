# Molmil manual

## Cite molmil
If you use Molmil, please <a href="https://jcheminf.biomedcentral.com/articles/10.1186/s13321-016-0155-1#citeas" target="_blank">cite our Molmil paper</a>.

## UI

#### 3D operations

- Rotate: hold left mouse button and drag
- Translate (x/y): (hold left+right mouse button, or hold scroll button, or hold left mouse button + shift key) and drag
- Zoom (z): hold right mouse button and drag
- Rotate around atom: left-click atom, then hold Ctrl while holding left mouse button and dragging to rotate

#### Atom/bond information

- Left-click on an atom to select, right-click to show a context menu
- Calculate distance between two atoms: Left click on first atom, Ctrl+left click on second atom
- Calculate angle between three atoms: Left click on first atom, Ctrl+left click on second atom, Ctrl+left click on third atom
- Calculate dihedral between four atoms: Left click on first atom, Ctrl+left click on second atom, Ctrl+left click on third atom, Ctrl+left click on fourth atom

#### Menu operations

- Show list of files/chains/residues (Structures menu): <br/>
  Left mouse click on the right-side menu (>>>), click on the files/chains to see the underlying chains/residues. <br/>
  Right click on the files/chains/residues to modify the styling
- Toggle structures/chains:<br/>
  Ctrl + left-click on a structure/chain in the Structures menu

- Show information about atom and show the styling menu (can be used to style corresponding residue/chain and display nearby residues): 
  right click on any atom in the canvas
  
- Open a file from the local drive: <br/>
  Drag-and-drop files from the local drive into the Molmil window

- Save PNG:<br/>
  Molmil menu -> Save -> PNG image

- Settings:<br/>
  Molmil menu -> Settings (quality, loop/sheet smoothing, fog, projection mode, color scheme, background color)

- Slab:<br/>
  Molmil menu -> Settings -> Slab

- Show Biological Unit:<br/>
  Molmil menu -> View -> Configure BU (for structures that contain BU metadata)

- Animation (PDB model or MD trajectory):<br/>
  Molmil menu -> Animation

- Full screen:<br/>
  Molmil menu -> Enable full-screen

- WebVR:<br/>
  Molmil menu -> Enable WebVR (on compatible platforms only)

- Show Command line interface:
  1) Molmil menu -> Toggle CLI
  2) "<" button in the bottom left corner
  3) Press ESC button twice in quick succession to toggle the CLI and move the cursor there (when showing the CLI)
  
- Clear all loaded files: <br/>
  Molmil menu -> Clear<br/>
  (Refreshing the page also works)

- Toggle waters: <br/>
  Open the Structures menu (top right >>>) -> click the 3 dots -> Show/Hide waters
- Toggle hydrogens: <br/>
  Open the Structures menu (top right >>>) -> click the 3 dots -> Show/Hide hydrogens

#### Style interface

- Enable interface:
  Molmil menu -> Style IF

- Change tabs
  In the Style IF panel, click [Style menu], and then choose one of the available options
  
- Hide panel
  In the Style IF panel, click [Style menu], and then choose "Hide"
  
- Resize panel
  In the Style IF panel in the bottom right corner, left-click and drag on the resize icon (diagonal line) and drag upwards to make the panel smaller and downwards to make it larger

#### Add a label to a file/chain/residue/atom: 
  1) Right click on a file/chain/residue -> Label
  2) Any atom in the canvas -> Label -> Atom/Residue/Chain

## Pymol commands

### `select`<br/>
Select atoms by using an expression: select `_name_`, expression
  
`expression`<br/>
  - name: select by atom name
  - symbol: select by element name
  - resn: select by residue name
  - resi: select by residue id 
  - ss: select by secondary structure (h: helix, s: sheet, l: loop)
  - chain: select by chain name
  - hydro: select waters
  - hetatm: select ligands
  - backbone: select protein backbone atoms
  - sidechain: select protein sidechain atoms
  - model: select by filename/fileid
  - and/or: combine multiple selections
  
examples:  
1. select carbon atoms:<br/>
  `select carbons, symbol C`
2. select the backbone heavy atoms:<br/>
  `select sidechain_12, resi 12 and sidechain`
  
### `color`<br/>
  Color a group of atoms: color clr, atom-list/expression
  
  clr can be either a colorname, a hex value (starting with #) or an rgb(a) value in the shape of [r, g, b, a], where r,g,b,a is an integer between 0-255
  
  atom-list is either a `_name_` object (defined by a select command) or an expression as used by a select command
  
  Examples:
   - `color red, sidechain_12`
   - `color red, resi 12 and sidechain`
   - `color [255, 255, 255], resi 12 and sidechain`
    
### `cartoon_color`<br/>
  Color the cartoon representation of a group of atoms: cartoon_color, atom-list/expression
  
### `set_color`<br/>
  Define a new named color: set_color `_color_name_`, [r, g, b, a]
  
### `show`<br/>
  Show atoms: `show _repr_, atom-list/expression`<br/>
  `_repr_`: spheres, ball_stick, sticks, lines, cartoon, ca-trace, label

### `hide`<br/>
  Hide atoms: `hide _repr_, atom-list/expression`<br/>
  `_repr_`: hydro, all, cartoon, snfg-icon, solvent, coarse-surface, spheres, ball_stick, sticks, lines, cell, label
  
### `enable`
Show file/model
  `enable model #1`
  `enable file.pdb`

### `disable`
Hide file/model
  `disable model #1`
  `disable file.pdb`
  
### `turn`<br/>
  Rotate the camera/system: turn axis, degrees<br/>
  axis: x, y, z
  
### `move`<br/>
  Translate the camera/system: move axis, Angstrom<br/>
  axis: x, y, z
  
### `translate`<br/>
  Translate a selection of atoms along an axis: `translate [x,y,z], atom-list/expression`</br>

### `fetch`<br/>
  Fetch a PDB entry from PDBj: fetch pdbid

### `fetch-cc`<br/>
  Fetch a chem_comp entry from PDBj: fetch comp_id
  
### `fetch-chain`<br/>
  Fetch a specific chain from a PDB entry from PDBj: fetch entryId
  
### `efsite`
  Fetch an efsite entry from PDBj: efsite entryId

### `load`<br/>
  Load a file: load location, `_options_`<br/>
  location can be either a file path on the local hdd (requires the local version of Molmil, cannot run via the web version), or a URL <br/>
  `_options_` is a comma-separated list of options, e.g. `format=pdb,gzipped=1`, indicates that the file format is a gzipped pdb flat-file (molmil normally determines this from the file extension, but when loading a file that misses a file extension, e.g. when loading the output from a REST API, this information needs to be supplied)

### `mplay`<br/>
  Plays a trajectory: mplay
  
### `mstop`<br/>
  Stops playing a trajectory: mstop

### `origin`<br/>
  Set the origin to a specific set of atoms: origin selection

### `set`<br/>
  Set various settings
  
  Set the radius of the sticks for a group of atoms: set stick_radius, value, atom-list/expression
  
  Enable fog: `set depth_cue, 1`<br/>
  Disable fog: `set depth_cue, 0`
  
  Settings:
  - `stick_radius` float
  - `depth_cue` 1/0
  - `cartoon_highlight_color` 1/color
  - `field_of_view` float
  - `orthoscopic` on/off
  - `label_bg_color` color
  - `label_outline_color` color
  - `label_color` color
  - `label_border` on/off
  - `label_position` (dx,dy,dz)
  - `label_atom_center` all OR atom name
  - `label_size` float
  - `label_front` 1/0
  - `cartoon_smooth_loops` int
  - `all_states` on/off
  - `movie_mode` forward/backward/swing/swing-once
  - `edmap_sigma` float
  - `mesh_color` color
  - `surface_color` color
  - `cif_use_auth` on/off
  - `stereo_mode` 10(anaglyph)/5(side-by-side)/2(cross-eyed)
  - `connect_cutoff` float
  - `backface_cull` 1/0
  
  Here, color is either a pre-configured color name, or an rgba array: [r,g,b,a], e.g. [255, 0, 0, 255] for red
  

### `bg_color`<br/>
  Set the background color: bg_color color

### `label`<br/>
  Set a label to a set of atoms: label selection, label-name

### `save`<br/>
  Save the loaded structure: save file.pdb, selection, snapshot, format

### `viewport`<br/>
  Resize the viewport (screen size): viewport width, height
  
### `view`<br/>
  Recall or store a specific view: view key, action
  action: recall, store
  
  Save the current view as "test": `view test, store`<br/>
  Recall (restore) the view "test": `view test`
  
### `reset`<br/>
  Resets the camera the default position and orientation (identity matrix, but zoomed out to show the molecules)
  
### `findseq`<br/>
  Finds a specific sequence: findseq sequence, selection, name
  
### `delete`<br/>
  Delete a set of atoms: delete selection<br/>
  Delete chain A: `delete chain A`

### `edmap`<br/>
  Fetch the electron density map of the loaded entry for a specific region: edmap selection, border<br/>
  Show the electron density for all ligands and nearby region (5 A): `edmap hetatm, 5`

### `frame`<br/>
  Select a specific frame (NMR-model / MD trajectory), starting from 1: frame modelId<br/>
  Select 10th frame: `frame 10`
  
### `bond`<br/>
  Create a bond between two atoms: bond selection1, selection2, bondOrder<br/>
  Create a peptide bond between residue 32 and residue 1: `bond resi 32 and name C and resi 1 and name N, 1`
  
### `stereo`<br/>
  Set a stereo mode: stereo mode<br/>
  Where mode is any of; off, crosseye, sidebyside, anaglyph<br/>
  Enable sidebyside mode: `stereo sidebyside`
  
### `orient`<br/>
  Focus the camera on a specific selection with optimized orientation: orient selection<br/>
  Orient on chain A: `orient chain A`<br/>
  Orient on whole system: `orient`
  
### `alter`<br/>
  Alter properties of atoms: alter selection, setting=value<br/>
  Set B-factor of residue: `alter resi 32, b=0.5`
  
### `indicate`<br/>
  Indicate the selection on the screen: indicate selection<br/>
  Indicate chain A: `indicate chain A`
  
### `png`<br/>
  Output a PNG image to a file: `png filename`<br/>
  Copy a PNG image onto the clipboard: `png`
  
### `repr`
  Quick select representation
  Examples:
  - `repr au`
  - `repr bu`

### `style-if`<br/>
  Show style interface<br/>
  Examples:<br/>
  - `style-if structure`
  - `style-if bu`
  - `style-if edmap`
  - `style-if sites`
  - `style-if align`
  - `style-if settings`
  - `style-if hide`

### `align`
  Superposes two chains<br/>
  align struc1:chain1, struc2:chain2<br/>
  `align file1.pdb:A, file2.pdb:B`
  
### `quit`<br/>
  Exit molmil-app.
