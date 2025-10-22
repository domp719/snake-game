import React, { useEffect, useRef } from "react";

function App() {
  const canvasRef = useRef(null);
  const width = 800;
  const height = 400;
  const gravity = 0.5;
  const groundHeight = 50;

  const player = { x: 100, y: height - groundHeight - 40, w: 30, h: 40, vy: 0, jumping: false, frame: 0 };
  const obstacles = [];
  let score = 0;
  let speed = 4;
  let bgOffset = 0;
  let midOffset = 0;
  let gameOver = false;

  const keys = {};

  const handleKeyDown = (e) => {
    keys[e.key] = true;
    if (e.key === " " && !player.jumping && !gameOver) {
      player.vy = -10;
      player.jumping = true;
    }
    if (gameOver && e.key === "r") resetGame();
  };

  const handleKeyUp = (e) => (keys[e.key] = false);

  const resetGame = () => {
    player.y = height - groundHeight - player.h;
    player.vy = 0;
    player.jumping = false;
    obstacles.length = 0;
    score = 0;
    speed = 4;
    gameOver = false;
  };

  const spawnObstacle = () => {
    if (Math.random() < 0.02) {
      obstacles.push({
        x: width,
        y: height - groundHeight - 30,
        w: 30,
        h: 30,
      });
    }
  };

  const update = (ctx) => {
    ctx.clearRect(0, 0, width, height);

    // Parallax background layers
    bgOffset -= speed * 0.2;
    midOffset -= speed * 0.5;

    // Distant sky color
    ctx.fillStyle = "#87CEEB";
    ctx.fillRect(0, 0, width, height);

    // Far mountains
    ctx.fillStyle = "#6B8E23";
    for (let i = 0; i < 3; i++) {
      const x = ((i * 400 + bgOffset) % width) - 400;
      ctx.beginPath();
      ctx.moveTo(x, height - 100);
      ctx.lineTo(x + 200, height - 250);
      ctx.lineTo(x + 400, height - 100);
      ctx.closePath();
      ctx.fill();
    }

    // Mid layer clouds
    ctx.fillStyle = "#fff";
    for (let i = 0; i < 5; i++) {
      const x = ((i * 200 + midOffset) % width) - 200;
      ctx.beginPath();
      ctx.arc(x, 80, 20, 0, Math.PI * 2);
      ctx.arc(x + 30, 80, 15, 0, Math.PI * 2);
      ctx.arc(x + 15, 70, 15, 0, Math.PI * 2);
      ctx.fill();
    }

    // Ground
    ctx.fillStyle = "#654321";
    ctx.fillRect(0, height - groundHeight, width, groundHeight);

    // Draw ground tiles for texture
    ctx.fillStyle = "#7a5230";
    for (let i = 0; i < width / 20; i++) {
      ctx.fillRect((i * 20 + bgOffset * 2) % width, height - groundHeight, 10, 10);
    }

    // Physics
    player.vy += gravity;
    player.y += player.vy;
    if (player.y > height - groundHeight - player.h) {
      player.y = height - groundHeight - player.h;
      player.vy = 0;
      player.jumping = false;
    }

    // Player animation
    if (!player.jumping && !gameOver) {
      player.frame = (player.frame + 1) % 8;
    }

    // Draw player (8-bit animation effect)
    ctx.fillStyle = player.jumping ? "#FFD700" : "#FF4500";
    ctx.fillRect(player.x, player.y, player.w, player.h);
    ctx.fillStyle = "#000";
    ctx.fillRect(player.x + (player.frame % 2 === 0 ? 5 : 8), player.y + 10, 5, 5); // eyes flicker

    // Obstacles
    spawnObstacle();
    for (let i = obstacles.length - 1; i >= 0; i--) {
      const o = obstacles[i];
      o.x -= speed;
      ctx.fillStyle = "#228B22";
      ctx.fillRect(o.x, o.y, o.w, o.h);

      if (
        player.x < o.x + o.w &&
        player.x + player.w > o.x &&
        player.y < o.y + o.h &&
        player.y + player.h > o.y
      ) {
        gameOver = true;
      }

      if (o.x + o.w < 0) {
        obstacles.splice(i, 1);
        score++;
        if (score % 5 === 0) speed += 0.2;
      }
    }

    // Score text
    ctx.fillStyle = "#fff";
    ctx.font = "20px monospace";
    ctx.fillText(`Score: ${score}`, 10, 25);

    if (gameOver) {
      ctx.fillStyle = "rgba(0,0,0,0.6)";
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = "#fff";
      ctx.font = "40px monospace";
      ctx.fillText("GAME OVER", width / 2 - 120, height / 2 - 20);
      ctx.font = "20px monospace";
      ctx.fillText("Press R to Restart", width / 2 - 90, height / 2 + 20);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const loop = () => {
      if (!gameOver) update(ctx);
      requestAnimationFrame(loop);
    };
    loop();

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [gameOver]);

  return (
    <div style={{ textAlign: "center", backgroundColor: "#111", height: "100vh" }}>
      <h1 style={{ color: "#0f0", fontFamily: "monospace", paddingTop: "10px" }}>8-Bit Runner 🏃‍♂️</h1>
      <canvas ref={canvasRef} width={width} height={height} style={{ border: "2px solid #0f0" }} />
      <p style={{ color: "#999", fontFamily: "monospace" }}>Press SPACE to jump, R to restart</p>
    </div>
  );
}

export default App;
