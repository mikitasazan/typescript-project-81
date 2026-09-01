import { expect, test } from "vitest";
import HexletCode from "../src/index";

test("renders a plain text input with the current value", () => {
  const html = HexletCode.formFor({ name: "rebecca" }, {}, (form) => {
    form.input("name");
  });

  expect(html).toBe(
    '<form action="#" method="post"><label for="name">Name</label>' +
      '<input name="name" type="text" value="rebecca"></form>',
  );
});

test("uses a custom label when given one", () => {
  const html = HexletCode.formFor({ job: "admin" }, {}, (form) => {
    form.input("job", { label: "Occupation" });
  });

  expect(html).toContain('<label for="job">Occupation</label>');
});

test("renders a textarea for the 'as: textarea' option", () => {
  const html = HexletCode.formFor({ bio: "hello" }, {}, (form) => {
    form.input("bio", { as: "textarea" });
  });

  expect(html).toContain('<textarea name="bio">hello</textarea>');
});

test("renders a select with the matching option marked selected", () => {
  const html = HexletCode.formFor({ job: "admin" }, {}, (form) => {
    form.input("job", { as: "select", options: { admin: "Admin", regular: "Regular" } });
  });

  expect(html).toContain('<option value="admin" selected>Admin</option>');
  expect(html).toContain('<option value="regular">Regular</option>');
});

test("falls back to an empty string for a missing field value", () => {
  const html = HexletCode.formFor({}, {}, (form) => {
    form.input("name");
  });

  expect(html).toContain('<input name="name" type="text" value="">');
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

test("renders a submit button, defaulting its label to Submit", () => {
  const withDefault = HexletCode.formFor({}, {}, (form) => {
    form.submit();
  });
  const withLabel = HexletCode.formFor({}, {}, (form) => {
    form.submit("Save");
  });

  expect(withDefault).toContain('<input type="submit" value="Submit">');
  expect(withLabel).toContain('<input type="submit" value="Save">');
});

test("honors a custom action and method, defaulting to # / post", () => {
  const defaults = HexletCode.formFor({}, {}, () => {});
  const custom = HexletCode.formFor({}, { action: "/users", method: "patch" }, () => {});

  expect(defaults).toBe('<form action="#" method="post"></form>');
  expect(custom).toBe('<form action="/users" method="patch"></form>');
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
