(function () {
  // Films: poster -> Vimeo player; shot list rows seek the player and the playing shot lights up.
  function makePlayer(block, startAt) {
    if (block._iframe) return block._iframe;
    const id = block.dataset.vimeo;
    const iframe = document.createElement("iframe");
    iframe.src = "https://player.vimeo.com/video/" + id + "?autoplay=1&title=0&byline=0&portrait=0&dnt=1" + (startAt ? "#t=" + Math.floor(startAt) + "s" : "");
    iframe.allow = "autoplay; fullscreen; picture-in-picture";
    iframe.allowFullscreen = true;
    iframe.title = block.dataset.title + " film";
    block.querySelector(".poster").replaceWith(iframe);
    block._iframe = iframe;
    if (window.Vimeo && window.Vimeo.Player) {
      const p = new window.Vimeo.Player(iframe);
      block._player = p;
      p.on("timeupdate", (d) => light(block, d.seconds));
    }
    return iframe;
  }
  function light(block, s) {
    const rows = Array.from(block.querySelectorAll(".shot"));
    let cur = null;
    rows.forEach((r) => { if (parseFloat(r.dataset.t) <= s + 0.2) cur = r; });
    rows.forEach((r) => r.classList.toggle("live", r === cur));
  }
  document.querySelectorAll(".film-block").forEach((block) => {
    block.querySelector(".poster").addEventListener("click", () => makePlayer(block, 0));
    block.querySelectorAll(".shot").forEach((row) => {
      row.addEventListener("click", () => {
        const t = parseFloat(row.dataset.t);
        const fresh = !block._iframe;
        makePlayer(block, t);
        light(block, t);
        if (!fresh && block._player) {
          block._player.setCurrentTime(t).then(() => block._player.play()).catch(() => {});
        } else if (!fresh && !block._player) {
          block._iframe.src = block._iframe.src.split("#")[0] + "#t=" + Math.floor(t) + "s";
        }
        block.querySelector(".player").scrollIntoView({ behavior: "smooth", block: "nearest" });
      });
    });
  });

  // Lightbox for asset images
  const items = Array.from(document.querySelectorAll("[data-full]"));
  if (!items.length) return;
  const dlg = document.createElement("dialog");
  dlg.className = "lightbox";
  dlg.setAttribute("aria-label", "Image viewer");
  dlg.innerHTML = '<div class="lb-bar"><span class="lb-count"></span><button class="lb-btn lb-close" type="button">Close</button></div>' +
    '<div class="lb-stage"><img alt=""></div><div class="lb-foot"><button class="lb-btn lb-prev" type="button">Previous</button>' +
    '<span class="lb-cap"></span><button class="lb-btn lb-next" type="button">Next</button></div>';
  document.body.appendChild(dlg);
  const img = dlg.querySelector("img"), cap = dlg.querySelector(".lb-cap"), count = dlg.querySelector(".lb-count");
  let i = 0;
  function show(n) {
    i = (n + items.length) % items.length;
    img.src = items[i].dataset.full;
    img.alt = items[i].querySelector("img") ? items[i].querySelector("img").alt : "";
    cap.textContent = items[i].dataset.caption || "";
    count.textContent = (i + 1) + " of " + items.length;
  }
  items.forEach((it, n) => it.addEventListener("click", () => { show(n); dlg.showModal ? dlg.showModal() : dlg.setAttribute("open", ""); }));
  dlg.querySelector(".lb-close").addEventListener("click", () => dlg.close());
  dlg.querySelector(".lb-prev").addEventListener("click", () => show(i - 1));
  dlg.querySelector(".lb-next").addEventListener("click", () => show(i + 1));
  dlg.addEventListener("click", (e) => { if (e.target === dlg || e.target.classList.contains("lb-stage")) dlg.close(); });
  dlg.addEventListener("keydown", (e) => { if (e.key === "ArrowRight") show(i + 1); if (e.key === "ArrowLeft") show(i - 1); });
})();
