import { GameState } from './types';
import { TileMap } from './TileMap';
import { Entity, Player } from './Entity';
import { CollisionSystem } from './Collision';
import { InputSystem } from './Input';

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  private lastTime: number;
  private running: boolean;
  private paused: boolean;
  private fps: number;
  private frameTime: number;
  private accumulator: number;
  
  // Game systems
  private inputSystem: InputSystem;
  private collisionSystem: CollisionSystem;
  
  // Game objects
  private tileMap: TileMap | null;
  private entities: Entity[];
  private player: Player | null;
  
  // Game state
  private state: GameState;
  
  // Sprite resources
  private spriteMap: Record<string, HTMLImageElement>;
  
  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }
    this.context = ctx;
    
    this.lastTime = 0;
    this.running = false;
    this.paused = false;
    this.fps = 60;
    this.frameTime = 1000 / this.fps;
    this.accumulator = 0;
    
    this.inputSystem = new InputSystem();
    this.collisionSystem = new CollisionSystem();
    
    this.tileMap = null;
    this.entities = [];
    this.player = null;
    
    this.state = {
      running: false,
      paused: false,
      score: 0,
      level: 1,
      gameOver: false,
      won: false
    };
    
    this.spriteMap = {};
  }
  
  init(): void {
    // Initialize input system
    this.inputSystem.init();
    
    // Set up the game loop
    this.lastTime = performance.now();
    
    // Resize canvas to match display size
    this.resizeCanvas();
    window.addEventListener('resize', this.resizeCanvas.bind(this));
  }
  
  private resizeCanvas(): void {
    // Get the display size of the canvas
    const { width, height } = this.canvas.getBoundingClientRect();
    
    // Check if the canvas is not the same size
    if (this.canvas.width !== width || this.canvas.height !== height) {
      // Make the canvas the same size
      this.canvas.width = width;
      this.canvas.height = height;
    }
  }
  
  start(): void {
    if (this.running) return;
    
    this.running = true;
    this.paused = false;
    this.state.running = true;
    this.state.paused = false;
    
    // Start the game loop
    requestAnimationFrame(this.gameLoop.bind(this));
  }
  
  pause(): void {
    this.paused = true;
    this.state.paused = true;
  }
  
  resume(): void {
    if (!this.running) return;
    
    this.paused = false;
    this.state.paused = false;
    this.lastTime = performance.now();
  }
  
  stop(): void {
    this.running = false;
    this.state.running = false;
  }
  
  private gameLoop(timestamp: number): void {
    if (!this.running) return;
    
    // Calculate delta time
    const deltaTime = timestamp - this.lastTime;
    this.lastTime = timestamp;
    
    // Update input system
    this.inputSystem.update();
    
    if (!this.paused) {
      // Fixed time step for physics
      this.accumulator += deltaTime;
      
      while (this.accumulator >= this.frameTime) {
        this.update(this.frameTime);
        this.accumulator -= this.frameTime;
      }
    }
    
    // Render at display refresh rate
    this.render();
    
    // Continue the loop
    requestAnimationFrame(this.gameLoop.bind(this));
  }
  
  update(deltaTime: number): void {
    // Update player based on input
    if (this.player) {
      const direction = this.inputSystem.getDirection();
      this.player.move(direction);
    }
    
    // Update all entities
    for (const entity of this.entities) {
      if (entity.active) {
        entity.update(deltaTime);
      }
    }
    
    // Check for collisions
    if (this.tileMap) {
      for (const entity of this.entities) {
        if (entity.active && entity.solid) {
          this.collisionSystem.resolveTileCollision(entity, this.tileMap);
        }
      }
    }
    
    // Check for entity-entity collisions
    for (let i = 0; i < this.entities.length; i++) {
      const entity1 = this.entities[i];
      if (!entity1.active || !entity1.solid) continue;
      
      for (let j = i + 1; j < this.entities.length; j++) {
        const entity2 = this.entities[j];
        if (!entity2.active || !entity2.solid) continue;
        
        if (this.collisionSystem.checkCollision(entity1, entity2)) {
          this.collisionSystem.resolveCollision(entity1, entity2);
        }
      }
    }
    
    // Check win/lose conditions
    this.checkGameState();
  }
  
  render(): void {
    // Clear the canvas
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Render the tile map
    if (this.tileMap) {
      this.tileMap.render(this.context, this.spriteMap);
    }
    
    // Render all entities
    for (const entity of this.entities) {
      if (entity.active) {
        entity.render(this.context);
      }
    }
    
    // Render UI
    this.renderUI();
  }
  
  private renderUI(): void {
    // Render score, health, etc.
    if (this.player) {
      this.context.fillStyle = 'white';
      this.context.font = '16px Arial';
      this.context.fillText(`Score: ${this.player.score}`, 10, 20);
      this.context.fillText(`Health: ${this.player.health}`, 10, 40);
    }
    
    // Render game over or win message
    if (this.state.gameOver) {
      this.context.fillStyle = 'rgba(0, 0, 0, 0.7)';
      this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
      
      this.context.fillStyle = 'white';
      this.context.font = '32px Arial';
      this.context.textAlign = 'center';
      
      if (this.state.won) {
        this.context.fillText('You Win!', this.canvas.width / 2, this.canvas.height / 2);
      } else {
        this.context.fillText('Game Over', this.canvas.width / 2, this.canvas.height / 2);
      }
      
      this.context.font = '20px Arial';
      this.context.fillText('Press Space to Restart', this.canvas.width / 2, this.canvas.height / 2 + 40);
      
      this.context.textAlign = 'left';
    }
  }
  
  private checkGameState(): void {
    if (!this.player) return;
    
    // Check if player has reached the end
    if (this.tileMap) {
      const playerTileX = Math.floor(this.player.x / this.tileMap.tileSize);
      const playerTileY = Math.floor(this.player.y / this.tileMap.tileSize);
      
      const tile = this.tileMap.getTile(0, playerTileX, playerTileY);
      if (tile && tile.type === 3) { // End tile
        this.state.gameOver = true;
        this.state.won = true;
      }
    }
    
    // Check if player has died
    if (this.player.health <= 0) {
      this.state.gameOver = true;
      this.state.won = false;
    }
    
    // Handle restart
    if (this.state.gameOver && this.inputSystem.isKeyPressed('space')) {
      this.restart();
    }
  }
  
  restart(): void {
    // Reset game state
    this.state = {
      running: true,
      paused: false,
      score: 0,
      level: 1,
      gameOver: false,
      won: false
    };
    
    // Reset player
    if (this.player) {
      this.player.health = 100;
      this.player.score = 0;
      
      // Reset player position to start
      if (this.tileMap) {
        for (let y = 0; y < this.tileMap.height; y++) {
          for (let x = 0; x < this.tileMap.width; x++) {
            const tile = this.tileMap.getTile(0, x, y);
            if (tile && tile.type === 2) { // Start tile
              this.player.x = x * this.tileMap.tileSize;
              this.player.y = y * this.tileMap.tileSize;
              break;
            }
          }
        }
      }
    }
    
    // Reset other entities if needed
  }
  
  setTileMap(tileMap: TileMap): void {
    this.tileMap = tileMap;
  }
  
  addEntity(entity: Entity): void {
    this.entities.push(entity);
    
    // If this is a player entity, store a reference
    if (entity instanceof Player) {
      this.player = entity;
    }
  }
  
  removeEntity(entityId: string): void {
    const index = this.entities.findIndex(e => e.id === entityId);
    if (index !== -1) {
      if (this.entities[index] === this.player) {
        this.player = null;
      }
      this.entities.splice(index, 1);
    }
  }
  
  getEntities(): Entity[] {
    return this.entities;
  }
  
  getInputSystem(): InputSystem {
    return this.inputSystem;
  }
  
  getState(): GameState {
    return this.state;
  }
  
  loadSprite(id: string, url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.spriteMap[id] = img;
        resolve(img);
      };
      img.onerror = () => reject(new Error(`Failed to load sprite: ${url}`));
      img.src = url;
    });
  }
}
