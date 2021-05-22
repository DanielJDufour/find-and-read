const test = require("flug");
const findAndRead = require("../../find-and-read");

test("reading sibling", ({ eq }) => {
  const str = findAndRead("sibling.txt", { encoding: "utf-8" });
  eq(str, "sibling");
});

test("reading file up, across, and down", ({ eq }) => {
  const buffer = findAndRead("flower.png", { debugLevel: 0 });
  eq(Buffer.isBuffer(buffer), true);
});

test("reading file up, across, and down as text", ({ eq }) => {
  const jscode = findAndRead("example.js", { encoding: "utf-8" });
  eq(jscode.trim(), `console.log("I'm an example.");`);
});

test("reading file up", ({ eq }) => {
  const pkgjson = findAndRead("package.json", { encoding: "utf-8" });
  eq(JSON.parse(pkgjson).name, "find-and-read");
});

test("limiting steps", ({ eq }) => {
  const pkgjson = findAndRead("package.json", {
    encoding: "utf-8",
    maxSteps: 1,
  });
  eq(pkgjson, undefined);
});