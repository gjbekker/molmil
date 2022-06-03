const path = await import("path");
const fs = await import("fs");
const fsp = fs.promises;
const terser = await import("terser");
const cleanCSS = (await import("clean-css")).default;
const cleanHTML = await import("html-minifier-terser");

var cssMinimizer = new cleanCSS({returnPromise: true});

const _headers = `/*
  Access-Control-Allow-Origin: *
  X-Robots-Tag: noindex
`;

try {await fsp.mkdir("../public/");}
catch (e) {if (e.code != "EEXIST") throw e;}

async function saveFile(loc, content) {
  try {var old = await fsp.readFile(loc, "utf8");}
  catch (e) {var old = null;}
  if (old == content) return false;
  await fsp.writeFile(loc, content);
  return true;
}

await saveFile("../public/_headers", _headers);
await saveFile("../public/meta.json", JSON.stringify({sha: process.env.CF_PAGES_COMMIT_SHA}));


const topok = ["apps", "embed.html", "index.html", "lib", "LICENCE.md", "manual.html", "manual.md", "mmcif_pdbx_v50_summary.json", "molmil.css", "molmil_dep.js", "molmil.ico", "molmil.js", "plugins", "README.md", "shaders"];

async function processFile(loc, newloc) {
  if (loc.endsWith(".js")) {
    let content = await fsp.readFile(loc, "utf-8");
    const module = content.split("\n").filter(x=>x.startsWith("export function") || x.startsWith("export async function") || x.startsWith("export default function") || x.startsWith("export default async function")).length > 0
    const options = {module};
    content = (await terser.minify(content, options)).code;
    if (await saveFile(newloc, content)) {
      const stat = await fsp.stat(loc);
      await fsp.utimes(newloc, stat.atime, stat.mtime);
    }
  }
  else if (loc.endsWith(".css")) {
    let content = await fsp.readFile(loc, "utf-8");
    content = (await cssMinimizer.minify(content)).styles;
    if (await saveFile(newloc, content)) {
      const stat = await fsp.stat(loc);
      await fsp.utimes(newloc, stat.atime, stat.mtime);
    }
  }
  else if (loc.endsWith(".html") || loc.endsWith(".htm")) {
    let content = await fsp.readFile(loc, "utf-8");
    content = await cleanHTML.minify(content, {collapseWhitespace: true, removeComments: true, removeOptionalTags: true, removeRedundantAttributes: true, removeScriptTypeAttributes: true, removeTagWhitespace: true, useShortDoctype: true, minifyCSS: true, minifyJS: true});
    if (await saveFile(newloc, content)) {
      const stat = await fsp.stat(loc);
      await fsp.utimes(newloc, stat.atime, stat.mtime);
    }
  }
  else {
    await fsp.copyFile(loc, newloc);
    const stat = await fsp.stat(loc);
    await fsp.utimes(newloc, stat.atime, stat.mtime);
  }
}


async function processFolder(folder) {
  for (const item of await fsp.readdir(folder, {withFileTypes:true})) {
    const loc = path.join(folder, item.name);
    if (! topok.filter(x=>loc.startsWith("../"+x)).length) continue;
    const newloc = "../public/"+loc.substr(3);
    if (item.isDirectory()) {
      try {await fsp.mkdir(newloc);}
      catch (e) {if (e.code != "EEXIST") throw e;}
      await processFolder(loc, newloc);
    }
    else await processFile(loc, newloc);
  }
}

await processFolder("../");

const archiver = (await import("archiver")).default;

const output = fs.createWriteStream("../public/molmil-core.zip");
const archive = archiver("zip", {zlib: { level: 9 }});

archive.on("warning", function(err) {
  if (err.code === "ENOENT") console.log(err);
  else throw err;
});

archive.on("error", function(err) {throw err;});

archive.pipe(output);

archive.directory("../public/plugins/", "plugins");
archive.directory("../public/shaders/", "shaders");
archive.directory("../public/lib/", "lib");

archive.append(fs.createReadStream("../public/molmil.js"), { name: "molmil.js" });
archive.append(fs.createReadStream("../public/molmil.css"), { name: "molmil.css" });
archive.append(fs.createReadStream("../public/molmil_dep.js"), { name: "molmil_dep.js" });
archive.append(fs.createReadStream("../public/molmil.ico"), { name: "molmil.ico" });
archive.append(fs.createReadStream("../public/index.html"), { name: "index.html" });
archive.append(fs.createReadStream("../public/manual.html"), { name: "manual.html" });
archive.append(fs.createReadStream("../public/manual.md"), { name: "manual.md" });

archive.finalize();
