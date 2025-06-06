import { Direction } from './types';

export class InputSystem {
  private keys: Record<string, boolean>;
  private previousKeys: Record<string, boolean>;
  
  constructor() {
    this.keys = {};
    this.previousKeys = {};
    
    // Initialize with all keys up
    this.reset();
  }
  
  init(): void {
    // Set up event listeners
    window.addEventListener('keydown', this.handleKeyDown.bind(this));
    window.addEventListener('keyup', this.handleKeyUp.bind(this));
    
    // Handle when window loses focus
    window.addEventListener('blur', this.reset.bind(this));
  }
  
  private handleKeyDown(event: KeyboardEvent): void {
    this.keys[event.key.toLowerCase()] = true;
  }
  
  private handleKeyUp(event: KeyboardEvent): void {
    this.keys[event.key.toLowerCase()] = false;
  }
  
  reset(): void {
    // Reset all keys to not pressed
    this.keys = {};
    this.previousKeys = {};
  }
  
  update(): void {
    // Store the current state for the next frame
    this.previousKeys = { ...this.keys };
  }
  
  isKeyDown(key: string): boolean {
    return !!this.keys[key.toLowerCase()];
  }
  
  isKeyPressed(key: string): boolean {
    return !!this.keys[key.toLowerCase()] && !this.previousKeys[key.toLowerCase()];
  }
  
  isKeyReleased(key: string): boolean {
    return !this.keys[key.toLowerCase()] && !!this.previousKeys[key.toLowerCase()];
  }
  
  // Helper method to get direction from arrow keys or WASD
  getDirection(): Direction {
    if (this.isKeyDown('arrowup') || this.isKeyDown('w')) {
      return Direction.UP;
    } else if (this.isKeyDown('arrowright') || this.isKeyDown('d')) {
      return Direction.RIGHT;
    } else if (this.isKeyDown('arrowdown') || this.isKeyDown('s')) {
      return Direction.DOWN;
    } else if (this.isKeyDown('arrowleft') || this.isKeyDown('a')) {
      return Direction.LEFT;
    }
    return Direction.NONE;
  }
}
