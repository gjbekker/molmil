# Molmil

Molmil is a WebGL based molecular viewer which can load various formats including PDB, mmCIF and PDBML. Molmil can display small to large structures in high quality as well as scale up to extremely large structures as found in the PDB.

Molmil is currently used by <a target="_blank" href="http://pdbj.org">Protein Data Bank Japan</a> as one of the available molecular viewers, as well as for the generation of the PDB images used by the <a target="_blank" href="http://pdbj.org/mine/search?query=*">PDBj Mine service</a>.

The source code of Molmil is available under the LGPLv3 licence (see LICENCE.md).
A usable version of Molmil is available at http://gjbekker.github.io/molmil/ and basic usage is described at https://github.com/gjbekker/molmil/wiki/Molmil-usage.

Additional information with regards to how to integrate Molmil and a reference to the Molmil API can be found on https://github.com/gjbekker/molmil/wiki/Integrate-Molmil 
and https://github.com/gjbekker/molmil/wiki/Molmil-API respectively.

### Citing Molmil

If you use Molmil, please cite our paper:
<a target="_blank" href="https://jcheminf.springeropen.com/articles/10.1186/s13321-016-0155-1">Molmil: a molecular viewer for the PDB and beyond</a>

### Molmil in action:
![](http://gjbekker.github.io/molmil/media/molmil_1crn.png)
http://gjbekker.github.io/molmil/#molmil.loadPDB('1crn')

Shown are the structures menu on the left with the context menu (accessible by right clicking on `ILE (7)`) and subsequent menus in order to display the sidechain of the selected residue (the result of selecting this option is also shown in this image; the sidechain of Ile7 is displayed as sticks). Furthermore, to the left is Molmil's main menu to amongst others loading structures and modifying settings. Finally, Molmil's command line is shown in the bottom of the image, and the command used to load the entry via the URL is shown in blue; `molmil.loadPDB('1crn')`.
