import { describe, expect, it } from "vitest";
import { htmlToText } from "../src/tools/web.js";

describe("htmlToText", () => {
  it("strips tags and keeps text", () => {
    expect(htmlToText("<p>Hello <b>world</b></p>")).toBe("Hello world");
  });

  it("removes script and style blocks entirely", () => {
    const html = "<style>p{color:red}</style><p>visible</p><script>alert(1)</script>";
    expect(htmlToText(html)).toBe("visible");
  });

  it("turns block-level closings and <br> into newlines", () => {
    const html = "<div>one</div><div>two</div>three<br>four";
    expect(htmlToText(html)).toBe("one\ntwo\nthree\nfour");
  });

  it("decodes common entities", () => {
    expect(htmlToText("a &amp; b &lt;c&gt; &quot;d&quot; &#39;e&#39;&nbsp;f")).toBe(
      "a & b <c> \"d\" 'e' f",
    );
  });

  it("collapses runs of blank lines", () => {
    const html = "<p>a</p>\n\n\n\n<p>b</p>";
    expect(htmlToText(html)).toBe("a\n\nb");
  });
});
