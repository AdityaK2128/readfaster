// The reader in miniature: one word at a time, with its fixation letter held
// on the marks. Mirrors the app's pivot rule and pacing.
(function () {
  const focus = document.querySelector(".focus");
  if (!focus) return;
  const word = focus.querySelector(".word");
  const words = ["ReadFaster"].concat(
    "Keep your eyes on the red letter. The words come to you, so your eyes never have to move.".split(" ")
  );

  function pivotIndex(w) {
    const chars = Array.from(w);
    let a = 0, b = chars.length;
    const isWord = (c) => /[\p{L}\p{N}]/u.test(c);
    while (a < b && !isWord(chars[a])) a++;
    while (b > a && !isWord(chars[b - 1])) b--;
    const n = b - a;
    if (n <= 0) return 0;
    const k = n <= 1 ? 0 : n <= 5 ? 1 : n <= 9 ? 2 : n <= 13 ? 3 : 4;
    return a + k;
  }

  function show(w) {
    const chars = Array.from(w);
    const p = Math.min(pivotIndex(w), chars.length - 1);
    word.textContent = "";
    const pre = document.createElement("span");
    pre.textContent = chars.slice(0, p).join("");
    const pivot = document.createElement("span");
    pivot.className = "pivot";
    pivot.textContent = chars[p] || "";
    const post = document.createElement("span");
    post.textContent = chars.slice(p + 1).join("");
    word.append(pre, pivot, post);
    const x = focus.clientWidth * 0.4 - pre.offsetWidth - pivot.offsetWidth / 2;
    word.style.transform = `translate(${x}px, -50%)`;
  }

  function weight(w) {
    let t = 1;
    const n = Array.from(w).filter((c) => /[\p{L}\p{N}]/u.test(c)).length;
    if (n > 7) t += Math.min(0.9, (n - 7) * 0.09);
    if (/[.!?]["')\]]*$/.test(w)) t += 1.2;
    else if (/[,;:]$/.test(w)) t += 0.55;
    return t;
  }

  const still = window.matchMedia("(prefers-reduced-motion: reduce)");
  let i = 0;
  let timer = null;

  function tick() {
    show(words[i]);
    let ms = 200 * weight(words[i]); // 300 words a minute
    if (i === 0) ms = 1800;
    if (i === words.length - 1) ms = 2000;
    i = (i + 1) % words.length;
    timer = setTimeout(tick, ms);
  }

  function start() {
    clearTimeout(timer);
    i = 0;
    if (still.matches) show(words[0]);
    else tick();
  }

  window.addEventListener("resize", () => show(word.textContent || words[0]));
  still.addEventListener?.("change", start);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(start);
  else start();
})();
