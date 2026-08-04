# 🕹️ Retro Web Arcade

A pixel-perfect, CRT-styled browser arcade built from scratch. This is my very first coding project and GitHub repository! It's built entirely with vanilla HTML, CSS, and JavaScript—no frameworks, just learning the fundamentals.

**[▶ Play it live](#)** <!-- replace with your GitHub Pages URL once deployed -->

![Status](https://img.shields.io/badge/status-in%20progress-ffb000)

## 👾 What's Inside

| Game | Status |
|---|---|
| **Snake** | ✅ Playable |
| **Tetris** | 🔒 Planned |
| **Breakout**| 🔒 Planned |

Instead of just following a tutorial, I wanted to build this to truly understand core computer science and web development concepts. Through this project, I learned how to:

*   **Work with HTML5 `<canvas>`:** Drawing shapes, grids, and rendering game frames.
*   **Create a Game Loop:** Using `requestAnimationFrame` to separate game logic (updating positions) from rendering (drawing to the screen).
*   **Handle Collision Detection:** Using grid-based math to detect when the snake hits a wall or itself.
*   **Organize Code:** Breaking my JavaScript into separate modules (engine, inputs, game logic) so I can easily add more games in the future.
*   **Save Data:** Using `localStorage` to save high scores directly in the browser.

## 🛠️ Tech Stack

*   HTML5 Canvas
*   Vanilla JavaScript (ES Modules)
*   CSS Grid & Custom Animations

## 💻 Running Locally

If you want to download and run the code on your own machine, you don't need any complex build tools. 

```bash
# Clone this repository
git clone [https://github.com/i-jsk/retro-web-arcade.git](https://github.com/i-jsk/retro-web-arcade.git)

# Navigate into the project folder
cd retro-web-arcade

# Open index.html in your browser, or start a local server:
python3 -m http.server 8080
