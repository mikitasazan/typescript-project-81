type FormData = Record<string, unknown>;
type FormOptions = { action?: string; method?: string };
type InputOptions = {
  as?: "input" | "textarea" | "select";
  label?: string;
  options?: Record<string, string>;
};

const escapeHtml = (value: unknown): string =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const labelize = (name: string): string => name.charAt(0).toUpperCase() + name.slice(1);

class FormBuilder {
  private readonly fields: string[] = [];

  constructor(private readonly data: FormData) {}

  input(name: string, options: InputOptions = {}): void {
    const label = options.label ?? labelize(name);
    const value = this.data[name] ?? "";
    const tag = options.as ?? "input";
    let control: string;
    if (tag === "textarea") {
      control = `<textarea name="${escapeHtml(name)}">${escapeHtml(value)}</textarea>`;
    } else if (tag === "select") {
      const choices = Object.entries(options.options ?? {})
        .map(
          ([key, text]) =>
            `<option value="${escapeHtml(key)}"${String(key) === String(value) ? " selected" : ""}>${escapeHtml(text)}</option>`,
        )
        .join("");
      control = `<select name="${escapeHtml(name)}">${choices}</select>`;
    } else {
      control = `<input name="${escapeHtml(name)}" type="text" value="${escapeHtml(value)}">`;
    }
    this.fields.push(`<label for="${escapeHtml(name)}">${escapeHtml(label)}</label>`, control);
  }

  submit(value = "Submit"): void {
    this.fields.push(`<input type="submit" value="${escapeHtml(value)}">`);
  }

  render(options: FormOptions = {}): string {
    const action = options.action ?? "#";
    const method = options.method ?? "post";
    return `<form action="${escapeHtml(action)}" method="${escapeHtml(method)}">${this.fields.join("")}</form>`;
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
