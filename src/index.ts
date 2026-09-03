type FormData = Record<string, unknown>;
type FormOptions = { url?: string; method?: string };
type HtmlAttributes = Record<string, string | number>;
type InputOptions = {
  as?: "input" | "textarea" | "select";
  label?: string;
  labelHtml?: HtmlAttributes;
  options?: Record<string, string>;
  rows?: number;
  cols?: number;
  [attribute: string]: unknown;
};

// Options keys that configure the field itself rather than becoming an
// HTML attribute on the rendered <input>/<textarea>/<select> tag.
const NON_ATTRIBUTE_KEYS = new Set(["as", "label", "labelHtml", "options", "rows", "cols"]);

const escapeHtml = (value: unknown): string =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const labelize = (name: string): string => name.charAt(0).toUpperCase() + name.slice(1);

const renderAttributes = (attrs: HtmlAttributes): string =>
  Object.entries(attrs)
    .map(([key, value]) => ` ${key}="${escapeHtml(value)}"`)
    .join("");

const extraAttributes = (options: InputOptions): HtmlAttributes => {
  const attrs: HtmlAttributes = {};
  for (const [key, value] of Object.entries(options)) {
    if (!NON_ATTRIBUTE_KEYS.has(key)) attrs[key] = String(value);
  }
  return attrs;
};

class FormBuilder {
  private readonly fields: string[] = [];

  constructor(private readonly data: FormData) {}

  input(name: string, options: InputOptions = {}): void {
    if (!(name in this.data)) {
      throw new Error(`Field '${name}' does not exist in the template.`);
    }

    const label = options.label ?? labelize(name);
    const value = this.data[name];
    const tag = options.as ?? "input";
    const extras = extraAttributes(options);

    let control: string;
    if (tag === "textarea") {
      const cols = options.cols ?? 20;
      const rows = options.rows ?? 40;
      control = `<textarea cols="${cols}" rows="${rows}" name="${escapeHtml(name)}"${renderAttributes(extras)}>${escapeHtml(value)}</textarea>`;
    } else if (tag === "select") {
      const choices = Object.entries(options.options ?? {})
        .map(
          ([key, text]) =>
            `<option value="${escapeHtml(key)}"${String(key) === String(value) ? " selected" : ""}>${escapeHtml(text)}</option>`,
        )
        .join("");
      control = `<select name="${escapeHtml(name)}"${renderAttributes(extras)}>${choices}</select>`;
    } else {
      control = `<input name="${escapeHtml(name)}" type="text" value="${escapeHtml(value)}"${renderAttributes(extras)}>`;
    }

    const labelAttrs: HtmlAttributes = { for: name, ...options.labelHtml };
    this.fields.push(`<label${renderAttributes(labelAttrs)}>${escapeHtml(label)}</label>`, control);
  }

  submit(value = "Save"): void {
    this.fields.push(`<input type="submit" value="${escapeHtml(value)}">`);
  }

  render(options: FormOptions = {}): string {
    const method = options.method ?? "post";
    const url = options.url ?? "#";
    return `<form method="${escapeHtml(method)}" action="${escapeHtml(url)}">${this.fields.join("")}</form>`;
  }
}

export default class HexletCode {
  static formFor(
    data: FormData,
    options: FormOptions = {},
    callback?: (form: FormBuilder) => void,
  ): string {
    const form = new FormBuilder(data);
    callback?.(form);
    return form.render(options);
  }
}
