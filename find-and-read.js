const { existsSync, lstatSync, readdirSync, readFileSync } = require("fs");
const { dirname, join } = require("path");

// does the path to a file or directory include a hidden file or folder
const isHidden = path => path.startsWith(".") || path.includes("/.");

// by default, stop searching along a path if function returns true
const DEFAULT_STOP = ({ dirpath, from, direction }) => {
  return (
    isHidden(dirpath) ||
    dirpath.includes("node_modules") ||
    (direction === "up" && existsSync(join(from, ".git")))
  );
};

const findAndRead = (
  filename,
  {
    start,
    debugLevel = 0,
    encoding = null,
    flag = "r",
    maxSteps = 10,
    stop = DEFAULT_STOP,
    warn = true
  } = {
    start: undefined,
    debugLevel: 0,
    encoding: null,
    stop: DEFAULT_STOP,
    flag: "r",
    maxSteps: 10,
    warn: true
  }
) => {
  if (!start) {
    const stackLines = Error().stack.split(/ *\n\r? */g);
    if (debugLevel >= 1) console.log("stackLines:", stackLines);
    const ln = stackLines[2];
    4;
    if (debugLevel >= 1) console.log("ln:", ln);
    const callerPath = (ln.includes("(")
      ? ln.substring(ln.indexOf("(") + 1, ln.lastIndexOf(")"))
      : ln.replace("at ", "")
    ).split(":")[0];
    if (debugLevel >= 1) console.log("callerPath:", callerPath);
    if (callerPath.startsWith("/")) {
      start = dirname(callerPath);
    } else if (process.env.PWD) {
      start = process.env.PWD;
    } else {
      throw new Error(
        "[find-and-read] unable to determine where to start.  Please initialize findAndRead with a start parameter"
      );
    }
  }
  if (debugLevel >= 1) console.log("[find-and-read] start:", start);

  let dirpaths = [{ dirpath: start, ignore: null }];
  for (let i = 0; i < maxSteps; i++) {
    if (debugLevel >= 2) console.log("[find-and-read] step:", i);
    let found = [];
    let additions = [];
    for (let ii = 0; ii < dirpaths.length; ii++) {
      const { dirpath, ignore } = dirpaths[ii];
      if (debugLevel >= 3) console.log("[find-and-read] dirpath:", dirpath);
      if (debugLevel >= 3) console.log("\t[find-and-read] ignore:", ignore);
      const filepath = join(dirpath, filename);
      if (existsSync(filepath) && !lstatSync(filepath).isDirectory()) {
        if (debugLevel >= 3) console.log("\t[find-and-read] found:", filepath);
        found.push(filepath);
      } else {
        const updirpath = dirname(dirpath);
        if (
          updirpath !== ignore &&
          (typeof stop !== "function" ||
            !stop({ dirpath: updirpath, from: dirpath, direction: "up" }))
        ) {
          additions.push({ dirpath: updirpath, ignore: dirpath });
        }

        try {
          readdirSync(dirpath, { withFileTypes: true }).forEach(dirent => {
            if (debugLevel >= 3)
              console.log("\t[find-and-read] dirent.name:", dirent.name);
            if (debugLevel >= 3)
              console.log(
                "\t[find-and-read] dirent.isDirectory():",
                dirent.isDirectory()
              );
            if (dirent.isDirectory()) {
              const subdirpath = join(dirpath, dirent.name);
              if (debugLevel >= 3)
                console.log("\t[find-and-read] subdirpath:", subdirpath);
              if (
                subdirpath !== ignore &&
                (typeof stop !== "function" ||
                  !stop({
                    dirpath: subdirpath,
                    from: dirpath,
                    direction: "down"
                  }))
              ) {
                if (debugLevel >= 3)
                  console.log("\t[find-and-read] adding:", {
                    dirpath: subdirpath,
                    ignore: dirpath
                  });
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
  if (warn) console.warn(`[find-and-read] unable to find "${filename}"`);
};

module.exports = findAndRead;
module.exports.default = findAndRead;
