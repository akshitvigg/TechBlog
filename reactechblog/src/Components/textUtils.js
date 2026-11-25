// Turns stored HTML into plain text (DOMParser never runs scripts, so this is safe)
export const toPlainText = (html) => {
  try {
    const doc = new DOMParser().parseFromString(
      String(html || ""),
      "text/html",
    );
    return (doc.body.textContent || "").replace(/\s+/g, " ").trim();
  } catch {
    return "";
  }
};

export const excerpt = (html, max = 150) => {
  const text = toPlainText(html);
  return text.length > max ? text.slice(0, max).trimEnd() + "…" : text;
};

export const readingTime = (html) => {
  const words = toPlainText(html).split(" ").filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
};
