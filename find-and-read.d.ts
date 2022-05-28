export default function findAndRead<encoding extends null | "buffer" | "utf8" | "utf-8">(filename: string, options?: {
  start?: string,
  debugLevel?: number,
  encoding?: encoding,
  stop?: ({ dirpath, from, direction }: { dirpath, from, direction }) => boolean,
  flag?: string,
  maxSteps?: number,
  warn?: boolean
}) : encoding extends "buffer" ? Buffer : string;