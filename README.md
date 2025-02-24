# Curaleaf Shooter Game

![Curaleaf Shooter Gameplay](assets/screenshots/gameplay.png)

**Curaleaf Shooter Game** is a 2D dungeon-crawler shooter built with [Phaser 3](https://phaser.io/), a popular HTML5 game framework. In this game, you control a Curaleaf-branded character navigating procedurally generated rooms, battling cannabis-themed enemies, collecting power-ups, and facing a recurring boss. With grid-based movement, real-time combat, and mechanics inspired by classic roguelikes and arcade shooters, this project is a personal exploration of game development. It showcases modular JavaScript code, physics-based interactions, and dynamic room generation. The game is open-source and welcomes contributions!

---

## Game Overview

In **Curaleaf Shooter**, you play as a Curaleaf agent exploring a grid-based dungeon teeming with rival cannabis brand enemies like AYR, Fluent, and Cookies. Your goal is to survive, rack up points, and progress by defeating enemies and collecting items. Every 10th room, you’ll face the formidable Trulieve Swarm boss, a challenging encounter with swarm mechanics and projectiles.

Built with Phaser 3’s physics engine, the game delivers smooth movement and collisions, paired with a retro aesthetic featuring ASCII-like tile visuals and branded sprites.

---

## Features

- **Procedural Room Generation:** Dynamically created rooms with varying layouts (water, trees, traps, etc.).
- **Grid-Based Movement:** Navigate a 20x12 tile grid with precise, snap-to-position controls.
- **Real-Time Combat:** Fire projectiles at enemies, with optional triple-shot and slow effects.
- **Power-Ups:** Collect Preroll (shield), Rosin (triple shot), Tincture (speed boost), RSO Capsule (slow shot), and Squeeze (health).
- **Enemy Variety:** Six unique enemy types with distinct behaviors (e.g., Cookies with shields, Muv with projectiles).
- **Boss Battle:** Confront the Trulieve Swarm every 10 rooms, featuring minions and spread-shot attacks.
- **Key and Locked Doors:** Use keys to unlock special doors marked 'D'.
- **UI:** Displays health, armor, XBite charge bars, power-up timers, and boss health.
- **Pause and Restart:** Pause with 'P', restart with 'R' on game over.

---

## File Structure

curaleaf-shooter-game/
├── assets/
│   ├── effects/          # Power-ups and items (e.g., preroll.png, squeeze.png)
│   ├── logos/            # Enemy and player sprites (e.g., curaleaf.png, trulieve.png)
│   ├── projectiles/      # Bullet sprites (e.g., nugget.png, ground.png)
│   └── screenshots/      # README images (e.g., gameplay.png)
├── index.html            # Entry point HTML file
├── game.js               # Main game logic and Phaser setup
├── player.js             # Player movement, shooting, and power-up handling
├── enemies.js            # Enemy behaviors and boss logic
├── rooms.js              # Room generation and navigation
├── ui.js                 # HUD and interface management
└── README.md             # This file

---

## Game Mechanics

### Player Movement
- **Grid-Based:** Moves in 48x48 pixel tiles across a 20x12 grid.
- **Speed:** Normal (100) or boosted (150 with Tincture).
- **Controls:** Arrow keys for movement, 'X' for XBite nuke (requires full charge).

### Combat
- **Shooting:** Auto-fires `nugget.png` projectiles every second (speed: 300, damage: 11).
- **XBite Nuke:** Clears all enemies when charge reaches 1000 (earned through kills).

### Rooms and Navigation
- **Layout:** 20x12 grid with walls (1), doors (3, 7, 24), and features like water, traps, etc.
- **Doors:**
  - '#' (3): Regular exits.
  - '~' (7): Requires a key but doesn’t consume it.
  - 'D' (24): Consumes a key to unlock.
- **Procedural:** Rooms vary with water (W), trees (^), traps (X), etc., based on type (dangerous, water, trees).

### Power-Ups
- **Preroll (19):** Grants a 3-hit shield orbiting the player.
- **Rosin (20):** Enables triple-shot for 30 seconds.
- **Tincture (21):** Boosts speed to 150 for 30 seconds.
- **RSO Capsule (22):** Adds a slow effect to shots for 30 seconds.
- **Squeeze (23):** Restores 25 HP (max 100).

### Enemies
- **AYR/Fluent:** Chase at 100 speed, 20 HP, 10 damage.
- **Flowery:** Erratic movement (chase/pause/retreat), 30 HP, 12 damage.
- **Muv:** Retreats and shoots, 25 HP, 15 damage.
- **Trulieve:** Swarms in groups, 15 HP, 5 damage.
- **Cookies:** Shielded (Chocolate), 40 HP, 10 damage.

### Boss: Trulieve Swarm
- **Trigger:** Appears every 10th room (`roomDistance % 10 === 0`).
- **Stats:** 200 HP, 20 damage, 80 speed.
- **Mechanics:**
  - Spawns 5-7 minions (15 HP, 100 speed) every 5 seconds (max 20).
  - Fires 3-spread `ground.png` projectiles every 3 seconds.
  - Alternates chasing and pausing (2-4 seconds).
- **Power-Up:** 25% chance to spawn Squeeze mid-battle.

---

## Installation

### Prerequisites
- **Node.js:** For running a local server (optional but recommended).
- **Web Browser:** Modern browser (e.g., Chrome, Firefox) with JavaScript enabled.
- **Git:** To clone the repository.

### Running Locally
1. **Clone the Repository:**
   ```bash
   git clone https://github.com/kmaclip/curaleaf-shooter-game.git
   cd curaleaf-shooter-game
   
2. Serve the Game:
	Option 1: Use a local server (recommended):
	npx serve
	Open http://localhost:3000 in your browser.
	
3. Play: The game starts automatically.
	
	
How to Play
Controls
	Arrow Keys: Move up, down, left, right.
	'X': Use XBite nuke (when charge is full).
	'P': Pause/unpause.
	'R': Restart on game over.
	
Objective
Survive, score points, and defeat the Trulieve boss every 10 rooms.


