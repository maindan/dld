import { Node, mergeAttributes } from "@tiptap/core";

export interface AttachmentOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    attachment: {
      setAttachment: (options: { href: string; filename: string }) => ReturnType;
    };
  }
}

/** Inline "chip" node for a downloadable, non-image file (PDF, zip, etc). Renders
 * to a plain <a class="dl-attachment"> so it round-trips as HTML with no dependency
 * on this extension to just *display* — only editing it back needs TipTap. */
export const Attachment = Node.create<AttachmentOptions>({
  name: "attachment",
  group: "inline",
  inline: true,
  atom: true,

  addOptions() {
    return { HTMLAttributes: {} };
  },

  addAttributes() {
    return {
      href: { default: null },
      filename: { default: "arquivo" },
    };
  },

  parseHTML() {
    return [{ tag: "a.dl-attachment" }];
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      "a",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        class: "dl-attachment",
        href: node.attrs.href,
        target: "_blank",
        rel: "noopener noreferrer",
        "data-filename": node.attrs.filename,
      }),
      `📎 ${node.attrs.filename}`,
    ];
  },

  addCommands() {
    return {
      setAttachment:
        (options) =>
        ({ chain }) =>
          chain().insertContent({ type: this.name, attrs: options }).run(),
    };
  },
});
