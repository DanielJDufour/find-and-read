const { existsSync, readdirSync, readFileSync } = require("fs");
const { dirname, join } = require("path");

// by default, stop searching along a path if function returns true
const DEFAULT_STOP = ({ dirpath }) =>
  dirpath.includes(".") || dirpath.includes("node_modules");

const findAndRead = (
  filename,
  {
    cwd,
    debugLevel = 0,
    encoding = null,
    flag = "r",
    maxSteps = 10,
    stop = DEFAULT_STOP,
  } = {
    cwd: undefined,
    debugLevel: 0,
    encoding: null,
    stop: DEFAULT_STOP,
    flag: "r",
    maxSteps: 10,
  }
) => {
  if (!cwd) {
    const ln = Error().stack.split(/ *\n\r? */g)[2];
    if (debugLevel >= 1) console.log("ln:", ln);
    const caller_file_path = (ln.includes("(")
      ? ln.substring(ln.indexOf("(") + 1, ln.lastIndexOf(")"))
      : ln.replace("at ", "")
    ).split(":")[0];
    if (debugLevel >= 1) console.log("caller_file_path:", caller_file_path);
    cwd = dirname(caller_file_path);
  }
  if (debugLevel >= 1) console.log("[find-and-read] cwd:", cwd);

  let dirpaths = [{ dirpath: cwd, ignore: null }];
  for (let i = 0; i < maxSteps; i++) {
    if (debugLevel >= 2) console.log("[find-and-read] step:", i);
    let found = [];
    let additions = [];
    for (let ii = 0; ii < dirpaths.length; ii++) {
      const { dirpath, ignore } = dirpaths[ii];
      if (debugLevel >= 3) console.log("[find-and-read] dirpath:", dirpath);
      const filepath = join(dirpath, filename);
      if (existsSync(filepath)) {
        if (debugLevel >= 3) console.log("[find-and-read] found:", filepath);
        found.push(filepath);
      } else {
        const updirpath = dirname(dirpath);
        if (
          updirpath !== ignore &&
          (typeof stop !== "function" || !stop({ dirpath: updirpath }))
        ) {
          additions.push({ dirpath: updirpath, ignore: dirpath });
        }

        try {
          readdirSync(dirpath, { withFileTypes: true }).forEach((dirent) => {
            if (dirent.isDirectory()) {
              const subdirpath = join(dirpath, dirent.name);
              if (
                subdirpath !== ignore &&
                (typeof stop !== "function" || !stop({ dirpath: subdirpath }))
              ) {
                additions.push({ dirpath: subdirpath, ignore: dirpath });
              }
            }
          });
        } catch (error) {
          // might not have permission to read
        }
      }
    }
    dirpaths = additions;
    if (found.length === 1) {
      if (debugLevel >= 1)
        console.log("[find-and-read] found in " + (i + 1) + " steps");
      return readFileSync(found[0], { encoding, flag });
    } else if (found.length >= 2) {
      throw new Error(
        `[find-and-read] can't decide between "${found.join('" and "')}"`
      );
    }
  }
};

module.exports = findAndRead;
