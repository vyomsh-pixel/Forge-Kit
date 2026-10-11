import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import app, {
  extractAndParseJSON,
  cleanJSXCode,
  persistGeneratedSection,
  patchSectionJsxContent,
  memorySections,
  memoryElements,
  memoryUsers
} from "./server.js";
import { generateId } from "./idGenerator.js";

let server;
let baseUrl;

async function request(path, { method = "GET", headers = {}, body } = {}) {
  const opts = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers
    }
  };
  if (body !== undefined) {
    opts.body = typeof body === "string" ? body : JSON.stringify(body);
  }
  const res = await fetch(`${baseUrl}${path}`, opts);
  const data = await res.json().catch(() => null);
  return { status: res.status, headers: res.headers, data };
}

describe("Forge-Kit Backend API & Unit Suite", () => {
  before(async () => {
    memorySections.clear();
    memoryElements.clear();
    memoryUsers.clear();
    server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
    const addr = server.address();
    baseUrl = `http://127.0.0.1:${addr.port}`;
  });

  after(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  it("generateId produces unique 10-digit numeric IDs with requested prefix", () => {
    const secId = generateId("1");
    const elId1 = generateId("2");
    const elId2 = generateId("2");

    assert.equal(secId.length, 10);
    assert.equal(elId1.length, 10);
    assert.match(secId, /^1\d{9}$/);
    assert.match(elId1, /^2\d{9}$/);
    assert.notEqual(elId1, elId2);
  });

  it("extractAndParseJSON parses fenced JSON and preserves JSX escapes without double-unescaping", () => {
    const raw = [
      "```json",
      JSON.stringify({
        jsx: '```jsx\nfunction GeneratedPage() {\n  const label = "Say \\"Hello\\"";\n  return <div className="p-4">{label}</div>;\n}\n```',
        css: ".custom { color: teal; }",
        elements: [{ elementName: "Heading", fieldId: "2000000001", contentType: "Text", content: "Hello" }]
      }),
      "```"
    ].join("\n");

    const parsed = extractAndParseJSON(raw);
    assert.ok(parsed);
    assert.ok(parsed.jsx.startsWith("function GeneratedPage()"));
    assert.ok(!parsed.jsx.includes("```"));
    // Verify inner escaped quotes inside JS string literal were NOT double-unescaped into syntax-breaking quotes
    assert.ok(parsed.jsx.includes('const label = "Say \\"Hello\\"";'));
    assert.equal(cleanJSXCode("```react\n<div />\n```"), "<div />");
  });

  it("supports studio auth register, login, and Bearer token verification (/api/auth/*)", async () => {
    const regRes = await request("/api/auth/register", {
      method: "POST",
      body: {
        username: "vyom_builder",
        password: "StrongPassword123!",
        display_name: "Vyom Studio",
        consent_accepted: true
      }
    });

    assert.equal(regRes.status, 200);
    assert.equal(regRes.data.ok, true);
    assert.ok(regRes.data.token);
    assert.equal(regRes.data.user.username, "vyom_builder");
    assert.equal(regRes.data.user.display_name, "Vyom Studio");
    assert.equal(regRes.data.user.consent_accepted, true);

    // Duplicate registration should return 409
    const dupRes = await request("/api/auth/register", {
      method: "POST",
      body: {
        username: "vyom_builder",
        password: "StrongPassword123!"
      }
    });
    assert.equal(dupRes.status, 409);

    // Login with valid credentials
    const loginRes = await request("/api/auth/login", {
      method: "POST",
      body: {
        username: "vyom_builder",
        password: "StrongPassword123!"
      }
    });
    assert.equal(loginRes.status, 200);
    assert.equal(loginRes.data.ok, true);
    assert.ok(loginRes.data.token);

    // Login with wrong password should fail with 401
    const badLogin = await request("/api/auth/login", {
      method: "POST",
      body: {
        username: "vyom_builder",
        password: "wrong-password"
      }
    });
    assert.equal(badLogin.status, 401);

    // Verify /api/auth/me with Bearer token
    const meRes = await request("/api/auth/me", {
      headers: { Authorization: `Bearer ${loginRes.data.token}` }
    });
    assert.equal(meRes.status, 200);
    assert.equal(meRes.data.ok, true);
    assert.equal(meRes.data.user.username, "vyom_builder");

    // Verify /api/auth/me rejects missing/invalid token
    const unauthRes = await request("/api/auth/me");
    assert.equal(unauthRes.status, 401);
  });

  it("evaluates JSX accessibility, responsiveness, and design tokens via POST /api/evaluate-ui", async () => {
    const sampleJsx = `
      export default function GeneratedPage() {
        return (
          <section className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-900 text-white p-8 rounded-xl shadow-lg">
            <h1 className="text-4xl font-bold">Enterprise Cloud</h1>
            <p className="text-base text-slate-300">Zero-downtime deployment engine.</p>
            <img src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc" alt="Dashboard preview" />
            <button aria-label="Launch Studio" className="bg-indigo-600 px-4 py-2 rounded-lg">Start</button>
          </section>
        );
      }
    `;

    const res = await request("/api/evaluate-ui", {
      method: "POST",
      body: { jsx: sampleJsx }
    });

    assert.equal(res.status, 200);
    assert.equal(res.data.ok, true);
    assert.ok(res.data.evaluation.overallScore >= 90);
    assert.ok(res.data.evaluation.badges.includes("WCAG 2.1 AA Compliant"));
    assert.ok(res.data.evaluation.badges.includes("Mobile-First Flexbox/Grid"));
  });

  it("persists sections & elements offline and patches both literal and symbolic id={ids.key} with $49/mo price strings", async () => {
    const headlineFieldId = "2111111111";
    const priceFieldId = "2222222222";

    const initialJsx = `
      function GeneratedPage() {
        const ids = {"headlineMain":"${headlineFieldId}","priceCard":"${priceFieldId}"};
        return (
          <div className="p-6">
            <h1 id={ids.headlineMain} className="dynamicStyle">Starter Plan</h1>
            <span id="${priceFieldId}" className="dynamicStyle">$19/mo</span>
          </div>
        );
      }
    `;

    const saved = await persistGeneratedSection({
      pageName: "Pricing",
      sectionName: "Pricing Tiers",
      result: {
        jsx: initialJsx,
        css: "",
        elements: [
          { elementName: "Headline", fieldId: headlineFieldId, contentType: "Text", content: "Starter Plan" },
          { elementName: "Price Tag", fieldId: priceFieldId, contentType: "Cards", content: "$19/mo" }
        ]
      }
    });

    assert.ok(saved.sectionId);
    assert.deepEqual(saved.elementIds, [headlineFieldId, priceFieldId]);
    assert.equal(saved.elements.length, 2);

    // Patch symbolic id={ids.headlineMain}
    const patchHeadline = await request(`/api/elements/${headlineFieldId}`, {
      method: "PATCH",
      body: {
        sectionId: saved.sectionId,
        pageName: "Pricing",
        content: "Pro Enterprise Plan"
      }
    });
    assert.equal(patchHeadline.status, 200);
    assert.equal(patchHeadline.data.data.content, "Pro Enterprise Plan");

    // Patch literal id="2222222222" with "$49/mo" (ensuring $49 is not corrupted by regex backreferences)
    const patchPrice = await request(`/api/elements/${priceFieldId}`, {
      method: "PATCH",
      body: {
        sectionId: saved.sectionId,
        pageName: "Pricing",
        content: "$49/mo"
      }
    });
    assert.equal(patchPrice.status, 200);
    assert.equal(patchPrice.data.data.content, "$49/mo");

    // Fetch section and verify both JSX nodes were updated accurately
    const secRes = await request(`/api/sections/${saved.sectionId}`);
    assert.equal(secRes.status, 200);
    const updatedJsx = secRes.data.data.section.jsx;
    assert.ok(updatedJsx.includes("<h1 id={ids.headlineMain} className=\"dynamicStyle\">Pro Enterprise Plan</h1>"));
    assert.ok(updatedJsx.includes(`<span id="${priceFieldId}" className="dynamicStyle">$49/mo</span>`));
  });

  it("exports user data (GET /api/account/export) and erases account & studio data (DELETE /api/account)", async () => {
    const loginRes = await request("/api/auth/login", {
      method: "POST",
      body: {
        username: "vyom_builder",
        password: "StrongPassword123!"
      }
    });
    const token = loginRes.data.token;

    const exportRes = await request("/api/account/export", {
      headers: { Authorization: `Bearer ${token}` }
    });
    assert.equal(exportRes.status, 200);
    assert.equal(exportRes.data.ok, true);
    assert.equal(exportRes.data.user.username, "vyom_builder");
    assert.ok(Array.isArray(exportRes.data.sections));
    assert.ok(exportRes.data.sections.length >= 1);
    assert.ok(Array.isArray(exportRes.data.elements));
    assert.ok(exportRes.data.elements.length >= 2);
    assert.ok(exportRes.data.exportedAt);

    const deleteRes = await request("/api/account", {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });
    assert.equal(deleteRes.status, 200);
    assert.equal(deleteRes.data.deleted, true);

    // Verify sections and elements were wiped
    const sectionsAfter = await request("/api/sections");
    assert.equal(sectionsAfter.data.data.length, 0);

    // Verify deleted user token is no longer accepted
    const meAfter = await request("/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` }
    });
    assert.equal(meAfter.status, 401);
  });
});
