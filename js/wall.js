document.addEventListener("DOMContentLoaded", () => {
  const wall = document.querySelector(".wall");
  const imagesNodeList = document.querySelectorAll(".wall .image");
  const images = Array.from(imagesNodeList);

  // Ensure wall clips overflowing image edges to avoid gaps
  wall.style.overflow = "hidden";

  // Cache numeric metadata and initial styles for each image
  const imgMeta = images.map((img) => {
    // find a class like "image3" and extract 3, fallback to 1
    let classNumber = 1;
    for (const c of img.classList) {
      const m = c.match(/^image(\d+)$/);
      if (m) {
        classNumber = parseInt(m[1], 10);
        break;
      }
    }
    const moveFactor = classNumber * 12;

    // Prevent subpixel gaps by slightly oversizing images in a less error-prone way
    img.style.display = "block";
    img.style.position = "absolute";
    img.style.top = "0";
    img.style.left = "50%";
    img.style.minWidth = "110%"; // small oversize to hide thin gaps without calc()
    img.style.height = "110%";
    img.style.objectFit = "cover";
    img.style.transform = "translate(-50%, 0)"; // baseline
    img.style.transformOrigin = "center center";
    img.style.willChange = "transform";
    img.style.backfaceVisibility = "hidden";
    img.style.border = "none";
    img.style.boxSizing = "border-box";
    img.style.transition = ""; // remove transition to avoid fighting RAF

    return { el: img, moveFactor };
  });

  let isOverWall = false;
  let isReturningToCenter = false;
  let rafId = null;
  let mouseX = 0;
  let mouseY = 0;
  let lerpedX = 0;
  let lerpedY = 0;
  const lerpSpeed = 0.08; // smooth easing (0..1)

  function updateImagePositions() {
    // Lerp towards mouse
    lerpedX += (mouseX - lerpedX) * lerpSpeed;
    lerpedY += (mouseY - lerpedY) * lerpSpeed;

    const w = wall.offsetWidth || 1;
    const h = wall.offsetHeight || 1;
    const normalizedX = lerpedX / w - 0.5;
    const normalizedY = lerpedY / h - 0.5;

    imgMeta.forEach(({ el, moveFactor }) => {
      const x = -normalizedX * moveFactor;
      const y = -normalizedY * moveFactor;
      // use separate transforms for percentage and pixel offsets to avoid calc()
      el.style.transform = `translate(-50%, 0) translate3d(${x}px, ${y}px, 0)`;
    });

    const centerX = (wall.offsetWidth || 1) / 2;
    const centerY = (wall.offsetHeight || 1) / 2;
    const isNearCenter =
      Math.abs(lerpedX - centerX) < 0.25 && Math.abs(lerpedY - centerY) < 0.25;

    if (isOverWall || (isReturningToCenter && !isNearCenter)) {
      rafId = requestAnimationFrame(updateImagePositions);
    } else {
      if (isReturningToCenter && isNearCenter) {
        lerpedX = centerX;
        lerpedY = centerY;
        imgMeta.forEach(({ el }) => {
          el.style.transform = "translate(-50%, 0)";
        });
      }
      isReturningToCenter = false;
      rafId = null;
    }
  }

  function resetImagesToCenter() {
    // initialize lerp to center of wall
    lerpedX = wall.offsetWidth / 2;
    lerpedY = wall.offsetHeight / 2;
    imgMeta.forEach(({ el }) => {
      el.style.transform = "translate(-50%, 0)";
    });
  }

  function stopAnimation() {
    isOverWall = false;
    removeMouseMoveListener();
    mouseX = wall.offsetWidth / 2;
    mouseY = wall.offsetHeight / 2;
    isReturningToCenter = true;
    if (!rafId) {
      rafId = requestAnimationFrame(updateImagePositions);
    }
  }

  // mousemove handler attached only while over wall
  function onMouseMove(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
  }

  function addMouseMoveListener() {
    document.addEventListener("mousemove", onMouseMove);
  }
  function removeMouseMoveListener() {
    document.removeEventListener("mousemove", onMouseMove);
  }

  wall.addEventListener("mouseenter", () => {
    const rect = wall.getBoundingClientRect();
    mouseX = rect.left + rect.width / 2;
    mouseY = rect.top + rect.height / 2;
    resetImagesToCenter();
    isReturningToCenter = false;
    if (!isOverWall) {
      isOverWall = true;
      addMouseMoveListener();
      rafId = requestAnimationFrame(updateImagePositions);
    }
  });

  wall.addEventListener("mouseleave", stopAnimation);

  document.addEventListener("mouseleave", (e) => {
    if (!e.relatedTarget && !e.toElement) {
      stopAnimation();
    }
  });

  // ensure cleanup on page unload
  window.addEventListener("unload", () => {
    stopAnimation();
  });

  // initialize
  resetImagesToCenter();
});
