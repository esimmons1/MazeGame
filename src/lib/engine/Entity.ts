import { Direction } from './types';

export interface Entity {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  sprite: any | null;
  velocity: { x: number, y: number };
  solid: boolean;
  active: boolean;
  tags: string[];
  properties: Record<string, any>;
  update(deltaTime: number): void;
  render(context: CanvasRenderingContext2D): void;
  onCollision(other: Entity): void;
}

export class BaseEntity implements Entity {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  sprite: any | null;
  velocity: { x: number, y: number };
  solid: boolean;
  active: boolean;
  tags: string[];
  properties: Record<string, any>;
  
  constructor(id: string, x: number, y: number, width: number, height: number) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.sprite = null;
    this.velocity = { x: 0, y: 0 };
    this.solid = true;
    this.active = true;
    this.tags = [];
    this.properties = {};
  }
  
  update(deltaTime: number): void {
    // Update position based on velocity
    this.x += this.velocity.x * (deltaTime / 1000);
    this.y += this.velocity.y * (deltaTime / 1000);
    
    // Update sprite animation if available
    if (this.sprite) {
      this.sprite.update(deltaTime);
    }
  }
  
  render(context: CanvasRenderingContext2D): void {
    if (this.sprite) {
      this.sprite.draw(context, this.x, this.y);
    } else {
      // Draw a simple rectangle if no sprite is available
      context.fillStyle = 'blue';
      context.fillRect(this.x, this.y, this.width, this.height);
    }
  }
  
  onCollision(_other: Entity): void {
    // Default collision behavior (can be overridden)
  }
}

export class Player extends BaseEntity {
  health: number;
  score: number;
  speed: number;
  
  constructor(id: string, x: number, y: number, width: number, height: number) {
    super(id, x, y, width, height);
    this.health = 100;
    this.score = 0;
    this.speed = 150; // pixels per second
    this.tags.push('player');
  }
  
  move(direction: Direction): void {
    // Reset velocity
    this.velocity = { x: 0, y: 0 };
    
    // Set velocity based on direction
    switch (direction) {
      case Direction.UP:
        this.velocity.y = -this.speed;
        break;
      case Direction.RIGHT:
        this.velocity.x = this.speed;
        break;
      case Direction.DOWN:
        this.velocity.y = this.speed;
        break;
      case Direction.LEFT:
        this.velocity.x = -this.speed;
        break;
      case Direction.NONE:
        // No movement
        break;
    }
  }
  
  update(deltaTime: number): void {
    super.update(deltaTime);
    
    // Additional player-specific update logic can go here
  }
  
  onCollision(other: Entity): void {
    // Handle collisions with specific entities
    if (other.tags.includes('enemy')) {
      this.health -= 10;
    } else if (other.tags.includes('collectible')) {
      this.score += 10;
    }
  }
}
