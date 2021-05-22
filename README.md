# find-and-read
> Finding and Reading Files Made a Little Easier

# what?
This library exposes a single function `findAndRead`, which takes in a filename.
It iteratively searches up, down and across your folder hierarchy for the file.
When it finds the file, it runs NodeJS' built-in [readFileSync](https://nodejs.org/api/fs.html#fs_fs_readfilesync_path_options) on it.

# why?
I work on a lot of projects that separate the data used for tests from the actual test scripts. It's often a pain to determine the correct path to pass into readFileSync. 
My code would often look like `readFileSync("../../../test-data/images/example.png")`.
It would be a lot easier if I could just run `findAndRead("example.png")`, so I created a library that does that.

# features
- Dependency Free (only uses NodeJS builtins)
- Automatically Finds Closest Matching File (least amount of change directory steps)
- Small Code Base
- Memory Efficient

# install
```bash
npm install find-and-read
```

# basic usage
Automatically find the closest file with the given name and run readFileSync
```javascript
const findAndRead = require("find-and-read");

const buffer = findAndRead("example.png");
```

# advanced usage
You can pass in the same options as you would to readFileSync, "encoding" and "flag";
```js
const findAndRead = require("find-and-read");

const json = findAndRead("example.json", { encoding: 'utf-8' });
```

#### adjusting start
When a file calls `findAndRead`, `findAndRead` will start looking in the foldder of the caller file.  When you run `findAndRead` in a REPL, it will start looking in the folder where you started the REPL.  If you would like to start at a different place, pass in a `start` parameter like below:
```js
const findAndRead = require("find-and-read");

// look for an image starting in the /tmp folder
const buffer = findAndRead("image.jpg", { start: '/tmp' });
```

#### custom stop function
By default, find-and-read doesn't navigate into node_modules and hidden folders (like `.git`).  When run inside a git repository, it also navigate up outside the git repo.  You can turn this off by passing `stop: null` or create own custom function for determining when to stop on a path.
```js
const findAndRead = require("find-and-read");

const buffer = findAndRead("test-image.jpg", {
  stop: ({
    dirpath, // the path to the directory that we are navigating to
    from, // the path to the directory that we are navigating from
    direction // "up" or "down"
  }) => {
    // don't search inside of the env folder
    return dirpath.includes('env');
  }
});
```
