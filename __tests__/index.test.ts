import { expect, test } from "vitest";
import HexletCode from "../src/index";

test("renders a plain text input with the current value", () => {
  const html = HexletCode.formFor({ name: "rebecca" }, {}, (form) => {
    form.input("name");
  });

  expect(html).toBe(
    '<form method="post" action="#"><label for="name">Name</label>' +
      '<input name="name" type="text" value="rebecca"></form>',
  );
});

test("uses a custom label when given one", () => {
  const html = HexletCode.formFor({ job: "admin" }, {}, (form) => {
    form.input("job", { label: "Occupation" });
  });

  expect(html).toContain('<label for="job">Occupation</label>');
});

test("adds extra attributes to the label via labelHtml", () => {
  const html = HexletCode.formFor({ name: "rob" }, {}, (form) => {
    form.input("name", { label: "User", labelHtml: { class: "form-label", id: "name-label" } });
  });

  expect(html).toContain('<label for="name" class="form-label" id="name-label">User</label>');
});

test("renders a textarea for the 'as: textarea' option, cols/rows defaulting to 20/40", () => {
  const html = HexletCode.formFor({ bio: "hello" }, {}, (form) => {
    form.input("bio", { as: "textarea" });
  });

  expect(html).toContain('<textarea cols="20" rows="40" name="bio">hello</textarea>');
});

test("overrides textarea cols/rows and does not render 'as' as an attribute", () => {
  const html = HexletCode.formFor({ bio: "hello" }, {}, (form) => {
    form.input("bio", { as: "textarea", rows: 50, cols: 50 });
  });

  expect(html).toContain('<textarea cols="50" rows="50" name="bio">hello</textarea>');
  expect(html).not.toContain('as="textarea"');
});

test("renders a select with the matching option marked selected", () => {
  const html = HexletCode.formFor({ job: "admin" }, {}, (form) => {
    form.input("job", { as: "select", options: { admin: "Admin", regular: "Regular" } });
  });

  expect(html).toContain('<option value="admin" selected>Admin</option>');
  expect(html).toContain('<option value="regular">Regular</option>');
});

test("forwards unknown options as extra HTML attributes on the control", () => {
  const html = HexletCode.formFor({ name: "rob" }, {}, (form) => {
    form.input("name", { class: "user-input" });
  });

  expect(html).toContain('<input name="name" type="text" value="rob" class="user-input">');
});

test("throws when a field is missing from the template", () => {
  expect(() =>
    HexletCode.formFor({ name: "rob" }, {}, (form) => {
      form.input("age");
    }),
  ).toThrow(Error);
});

test("escapes HTML special characters in field values, not just literal tags", () => {
  const html = HexletCode.formFor(
    { bio: 'Some <script>alert(1)</script> bio & "quoted" text' },
    {},
    (form) => {
      form.input("bio", { as: "textarea" });
    },
  );

  expect(html).not.toContain("<script>");
  expect(html).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
  expect(html).toContain("&amp;");
  expect(html).toContain("&quot;quoted&quot;");
});

test("escapes a field name used as an HTML attribute", () => {
  const html = HexletCode.formFor({ 'a"b': "x" }, {}, (form) => {
    form.input('a"b');
  });

  expect(html).toContain('name="a&quot;b"');
});

test("renders a submit button, defaulting its label to Save", () => {
  const withDefault = HexletCode.formFor({}, {}, (form) => {
    form.submit();
  });
  const withLabel = HexletCode.formFor({}, {}, (form) => {
    form.submit("Wow");
  });

  expect(withDefault).toContain('<input type="submit" value="Save">');
  expect(withLabel).toContain('<input type="submit" value="Wow">');
});

test("honors a custom url and method, defaulting to # / post", () => {
  const defaults = HexletCode.formFor({}, {}, () => {});
  const custom = HexletCode.formFor({}, { url: "/users", method: "patch" }, () => {});

  expect(defaults).toBe('<form method="post" action="#"></form>');
  expect(custom).toBe('<form method="patch" action="/users"></form>');
});

test("renders fields in the order .input()/.submit() were called", () => {
  const html = HexletCode.formFor({ name: "x", job: "y" }, {}, (form) => {
    form.input("job");
    form.input("name");
    form.submit();
  });

  const jobIndex = html.indexOf('name="job"');
  const nameIndex = html.indexOf('name="name"');
  const submitIndex = html.indexOf("submit");
  expect(jobIndex).toBeLessThan(nameIndex);
  expect(nameIndex).toBeLessThan(submitIndex);
});
