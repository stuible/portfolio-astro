// Prettier's MDX support follows MDX 1, which formats JSX blocks as
// JavaScript. In MDX 2+ (what Astro uses), however, text inside a JSX block
// is markdown. Prettier rewraps that text as JSX — adding `{" "}` and moving
// inline elements like <Term> onto their own lines — which changes how the
// page renders. This plugin leaves JSX blocks with text children as written,
// like `prettier-ignore` would, while still letting Prettier format the rest
// (e.g. attribute-only <Figure /> elements).
import * as babel from "prettier/plugins/babel";
import * as markdown from "prettier/plugins/markdown";

const astFormat = "mdx-markdown-children";
const mdast = markdown.printers.mdast;

function hasTextChildren(node) {
  if (!node || typeof node !== "object") return false;
  if (node.type === "JSXText" && node.value.trim()) return true;
  return Object.entries(node).some(
    ([key, value]) =>
      key !== "loc" &&
      (Array.isArray(value)
        ? value.some(hasTextChildren)
        : hasTextChildren(value))
  );
}

async function containsMarkdown(jsx) {
  try {
    const ast = await babel.parsers.babel.parse(`<>${jsx}</>`, {});
    return hasTextChildren(ast);
  } catch {
    // Anything that doesn't parse as JSX is left untouched
    return true;
  }
}

/** @type {import("prettier").Plugin} */
export default {
  parsers: {
    mdx: { ...markdown.parsers.mdx, astFormat },
  },
  printers: {
    [astFormat]: {
      ...mdast,
      embed(path, options) {
        const { node } = path;
        if (node.type !== "jsx") return mdast.embed(path, options);

        const format = mdast.embed(path, options);
        if (!format) return format;

        // Returning undefined tells Prettier to fall back to the default
        // printer, which prints the block's original text
        return async (...args) =>
          (await containsMarkdown(node.value)) ? undefined : format(...args);
      },
    },
  },
};
