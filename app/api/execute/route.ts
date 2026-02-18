import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { code, language } = await req.json();

    if (!code || typeof code !== "string") {
      return NextResponse.json(
        { error: "Code is required" },
        { status: 400 }
      );
    }

    if (language === "javascript" || language === "typescript") {
      // Safe execution with captured console output
      const logs: string[] = [];
      const errors: string[] = [];

      const mockConsole = {
        log: (...args: unknown[]) => logs.push(args.map(formatArg).join(" ")),
        error: (...args: unknown[]) =>
          errors.push(args.map(formatArg).join(" ")),
        warn: (...args: unknown[]) =>
          logs.push("[WARN] " + args.map(formatArg).join(" ")),
        info: (...args: unknown[]) =>
          logs.push("[INFO] " + args.map(formatArg).join(" ")),
        table: (data: unknown) =>
          logs.push(JSON.stringify(data, null, 2)),
      };

      try {
        const fn = new Function(
          "console",
          "Math",
          "JSON",
          "Date",
          "Array",
          "Object",
          "String",
          "Number",
          "Boolean",
          "RegExp",
          "Map",
          "Set",
          "Promise",
          "parseInt",
          "parseFloat",
          "isNaN",
          "isFinite",
          "encodeURIComponent",
          "decodeURIComponent",
          code
        );

        const result = fn(
          mockConsole,
          Math,
          JSON,
          Date,
          Array,
          Object,
          String,
          Number,
          Boolean,
          RegExp,
          Map,
          Set,
          Promise,
          parseInt,
          parseFloat,
          isNaN,
          isFinite,
          encodeURIComponent,
          decodeURIComponent
        );

        // If function returned something, add it to output
        if (result !== undefined) {
          logs.push(`=> ${formatArg(result)}`);
        }
      } catch (e) {
        errors.push(e instanceof Error ? e.message : String(e));
      }

      const output = [...logs, ...errors.map((e) => `[ERROR] ${e}`)].join(
        "\n"
      );

      return NextResponse.json({
        output: output || "Code executed successfully (no output)",
        hasErrors: errors.length > 0,
        language,
      });
    }

    return NextResponse.json({
      output: `Language "${language}" execution is available in the full Agent Zero backend. Currently JavaScript/TypeScript is supported in the web app.`,
      hasErrors: false,
      language,
    });
  } catch (e) {
    return NextResponse.json(
      { error: `Execution failed: ${e instanceof Error ? e.message : "Unknown error"}` },
      { status: 500 }
    );
  }
}

function formatArg(arg: unknown): string {
  if (arg === null) return "null";
  if (arg === undefined) return "undefined";
  if (typeof arg === "object") {
    try {
      return JSON.stringify(arg, null, 2);
    } catch {
      return String(arg);
    }
  }
  return String(arg);
}
