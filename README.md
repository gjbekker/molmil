# Molmil

Molmil is a WebGL based molecular viewer that can load various formats including PDB, mmCIF and PDBML. Molmil can display small to large structures in high quality as well as scale up to extremely large structures as found in the PDB.

Molmil is currently used by <a href="https://pdbj.org">Protein Data Bank Japan</a> as the primary molecular viewer, as well as for the generation of the PDB images used by the <a href="https://pdbj.org/search/pdb?query=*">PDBj Mine service</a>.

The source code of Molmil is available under the LGPLv3 licence (see LICENCE.md) at https://gitlab.com/pdbjapan/molmil.
The latest version of Molmil is available at https://pdbj.org/molmil2/, with a description of its basic usage and the manual available at https://pdbj.org/molmil2/manual.html.

### Citing Molmil

If you use Molmil, please cite our paper:
<a href="https://jcheminf.springeropen.com/articles/10.1186/s13321-016-0155-1">Molmil: a molecular viewer for the PDB and beyond</a>

### Molmil in action:

Molmil can directly execute commands embedded in the URL, e.g.:
https://pdbj.org/molmil2/#fetch%201crn;

pdbj.org uses this for their viewer, e.g. (https://doi.org/10.1002/pro.4211):
https://pdbj.org/molmil2/#fetch%201crn;%20repr%20au;%20style-if%20structure;
https://pdbj.org/molmil2/#fetch-chain%201crn_A;%20fetch-chain%202plh_A;%20align%201crn_A,%202plh_A;%20repr%20objects;%20style-if%20align;

BSMA (Biological Structure Model Archive) also uses Molmil for visualization of structures and Molmil script files (.mjs), to visualize structures as annotated interactive images or movies, e.g. (https://doi.org/10.1007/s12551-020-00632-5):
https://bsma.pdbj.org/molmil.html#cd%20/pub/29/;%20load%20Movie_S1.mjs;

Although Molmil is a web-based molecular viewer, it can also be installed within your operating system using molmil-app (https://gitlab.com/pdbjapan/molmil-app).
This enables Molmil to not only be integrated with your operating system (and setup your structure files to be loaded automatically using Molmil by double-clicking them), it can also be used to integrate with your operating system's command line, where Molmil can be run headlessly to generate images and videos.
