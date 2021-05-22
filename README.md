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

By default, find-and-read starts at the directory of the file that called the read function.
If you would like to start at a different place, pass in the `cwd` parameter.
```js
const findAndRead = require("find-and-read");

// look for an image starting in the /tmp folder
const buffer = findAndRead("image.jpg", { cwd: '/tmp' });
```
