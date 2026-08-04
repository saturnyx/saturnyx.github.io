document.addEventListener("DOMContentLoaded", () => {
  const wall = document.querySelector(".wall");
  const images = document.querySelectorAll(".wall .image");

  images.forEach((img) => {
    img.style.transition = "transform 0.1s ease-out";
    img.style.left = "50%";
    img.style.transform = "translate(-50%, 0)";
  });

  let isOverWall = false;
  let rafId = null;
  let mouseX = 0;
  let mouseY = 0;
  let lerpedX = 0;
  let lerpedY = 0;
  const lerpSpeed = 1;

  function updateImagePositions() {
    lerpedX += (mouseX - lerpedX) * lerpSpeed;
    lerpedY += (mouseY - lerpedY) * lerpSpeed;

    const normalizedX = lerpedX / wall.offsetWidth - 0.5;
    const normalizedY = lerpedY / wall.offsetHeight - 0.5;

    images.forEach((img) => {
      const classNumber = parseInt(img.className.match(/image(\d+)/)[1], 10);
      const moveFactor = classNumber * 12;
      img.style.transform = `translate(calc(-50% + ${-normalizedX * moveFactor}px), ${-normalizedY * moveFactor}px)`;
    });

    if (isOverWall) {
      rafId = requestAnimationFrame(updateImagePositions);
    }
  }

  function resetImagesToCenter() {
    lerpedX = wall.offsetWidth / 2;
    lerpedY = wall.offsetHeight / 2;
    images.forEach((img) => {
      img.style.transform = "translate(-50%, 0)";
    });
  }

  function stopAnimation() {
    isOverWall = false;
    if (rafId) {
      cancelAnimationFrame(rafId);
    }
    resetImagesToCenter();
  }

  wall.addEventListener("mouseenter", () => {
    const rect = wall.getBoundingClientRect();
    mouseX = rect.left + rect.width / 2;
    mouseY = rect.top + rect.height / 2;
    resetImagesToCenter();
    if (!isOverWall) {
      isOverWall = true;
      rafId = requestAnimationFrame(updateImagePositions);
    }
  });

  wall.addEventListener("mouseleave", stopAnimation);

  document.addEventListener("mouseleave", (e) => {
    if (!e.relatedTarget && !e.toElement) {
      stopAnimation();
    }
  });

  document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });
});
