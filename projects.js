// Progressive enhancement: core project notes, source links and CV remain native.
const reduced = matchMedia("(prefers-reduced-motion: reduce)");
const imageViewer = document.querySelector(".image-dialog");
if (imageViewer && typeof imageViewer.showModal === "function") {
  const stage = imageViewer.querySelector(".image-stage");
  const title = imageViewer.querySelector("h2");
  const zoom = imageViewer.querySelector(".image-zoom");
  const original = imageViewer.querySelector(".image-original");
  const close = imageViewer.querySelector(".image-close");
  let imageOpener = null;
  document.querySelectorAll(".project-media-link").forEach((link) => {
    link.setAttribute("aria-haspopup", "dialog");
    link.setAttribute("aria-controls", imageViewer.id);
    link.addEventListener("click", (event) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
        return;
      event.preventDefault();
      const thumbnail = link.querySelector("img");
      const project = link.closest(".work-card, .project-folder");
      const image = new Image();
      image.src = link.href;
      image.alt = thumbnail.alt;
      image.width = thumbnail.naturalWidth || thumbnail.width;
      image.height = thumbnail.naturalHeight || thumbnail.height;
      imageOpener = link;
      title.textContent =
        project?.querySelector("h3, h4, .folder-face strong")?.textContent ||
        "Project screenshot";
      original.href = link.href;
      stage.replaceChildren(image);
      delete imageViewer.dataset.zoomed;
      zoom.setAttribute("aria-pressed", "false");
      zoom.textContent = "Zoom in";
      if (!imageViewer.open) imageViewer.showModal();
      document.documentElement.dataset.imageOpen = "";
      close.focus({ preventScroll: true });
      if (!reduced.matches)
        imageViewer.animate([{ opacity: 0 }, { opacity: 1 }], {
          duration: 160,
          easing: "ease-out",
        });
    });
  });
  zoom.addEventListener("click", () => {
    const zoomed = imageViewer.dataset.zoomed !== "true";
    imageViewer.dataset.zoomed = String(zoomed);
    zoom.setAttribute("aria-pressed", String(zoomed));
    zoom.textContent = zoomed ? "Fit image" : "Zoom in";
    stage.scrollTo(0, 0);
  });
  close.addEventListener("click", () => imageViewer.close());
  imageViewer.addEventListener("close", () => {
    delete document.documentElement.dataset.imageOpen;
    stage.replaceChildren();
    imageOpener?.focus({ preventScroll: true });
  });
  imageViewer.addEventListener("click", (event) => {
    const box = imageViewer.getBoundingClientRect();
    if (
      (event.target === stage && imageViewer.dataset.zoomed !== "true") ||
      (event.target === imageViewer &&
        (event.clientX < box.left ||
          event.clientX > box.right ||
          event.clientY < box.top ||
          event.clientY > box.bottom))
    )
      imageViewer.close();
  });
}
const resume = document.querySelector(".resume-dialog");
let resumeOpener = null;
if (resume && typeof resume.showModal === "function") {
  resume.querySelector("iframe").addEventListener("load", (event) => {
    const frameDocument = event.target.contentDocument;
    frameDocument?.querySelectorAll("a").forEach((link) => {
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    });
    frameDocument?.addEventListener("keydown", (keyEvent) => {
      if (keyEvent.key === "Escape" && resume.open) {
        keyEvent.preventDefault();
        resume.close();
      }
    });
  });
  document.querySelectorAll("[data-resume-preview]").forEach((link) => {
    link.setAttribute("aria-haspopup", "dialog");
    link.setAttribute("aria-controls", resume.id);
    link.addEventListener("click", (event) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
        return;
      event.preventDefault();
      resumeOpener = link;
      const frame = resume.querySelector("iframe");
      if (!frame.getAttribute("src")) frame.src = frame.dataset.src;
      resume.showModal();
      document.documentElement.dataset.resumeOpen = "";
      resume.querySelector(".resume-close").focus({ preventScroll: true });
      if (!reduced.matches)
        resume.animate(
          [
            { opacity: 0, transform: "translateY(10px)" },
            { opacity: 1, transform: "none" },
          ],
          { duration: 220, easing: "ease-out" },
        );
    });
  });
  resume
    .querySelector(".resume-close")
    .addEventListener("click", () => resume.close());
  resume.addEventListener("close", () => {
    delete document.documentElement.dataset.resumeOpen;
    resumeOpener?.focus({ preventScroll: true });
  });
  resume.addEventListener("click", (event) => {
    const box = resume.getBoundingClientRect();
    if (
      event.target === resume &&
      (event.clientX < box.left ||
        event.clientX > box.right ||
        event.clientY < box.top ||
        event.clientY > box.bottom)
    )
      resume.close();
  });
}
reduced.addEventListener("change", () => {
  if (reduced.matches) {
    resume?.getAnimations().forEach((animation) => animation.cancel());
    imageViewer?.getAnimations().forEach((animation) => animation.cancel());
  }
});
