import { TileType, Vector2D } from './types';

export interface Tile {
  id: number;
  type: TileType;
  solid: boolean;
  spriteId: string | null;
  properties: Record<string, any>;
}

export interface TileLayer {
  id: string;
  tiles: Tile[][];
  visible: boolean;
}

export class TileMap {
  width: number;
  height: number;
  tileSize: number;
  layers: TileLayer[];

  constructor(width: number, height: number, tileSize: number) {
    this.width = width;
    this.height = height;
    this.tileSize = tileSize;
    this.layers = [];
  }

  createLayer(id: string): TileLayer {
    const tiles: Tile[][] = [];
    
    // Initialize empty tiles
    for (let y = 0; y < this.height; y++) {
      tiles[y] = [];
      for (let x = 0; x < this.width; x++) {
        tiles[y][x] = {
          id: 0,
          type: TileType.EMPTY,
          solid: false,
          spriteId: null,
          properties: {}
        };
      }
    }

    const layer: TileLayer = {
      id,
      tiles,
      visible: true
    };

    this.layers.push(layer);
    return layer;
  }

  getLayer(id: string): TileLayer | undefined {
    return this.layers.find(layer => layer.id === id);
  }

  getTile(layerIndex: number, x: number, y: number): Tile | null {
    if (
      layerIndex < 0 || 
      layerIndex >= this.layers.length || 
      x < 0 || 
      x >= this.width || 
      y < 0 || 
      y >= this.height
    ) {
      return null;
    }

    return this.layers[layerIndex].tiles[y][x];
  }

  setTile(layerIndex: number, x: number, y: number, tile: Tile): void {
    if (
      layerIndex < 0 || 
      layerIndex >= this.layers.length || 
      x < 0 || 
      x >= this.width || 
      y < 0 || 
      y >= this.height
    ) {
      return;
    }

    this.layers[layerIndex].tiles[y][x] = tile;
  }

  isSolid(x: number, y: number): boolean {
    // Check all layers for solid tiles at this position
    for (let i = 0; i < this.layers.length; i++) {
      const tile = this.getTile(i, x, y);
      if (tile && tile.solid) {
        return true;
      }
    }
    return false;
  }

  // Convert pixel coordinates to tile coordinates
  worldToTile(position: Vector2D): Vector2D {
    return {
      x: Math.floor(position.x / this.tileSize),
      y: Math.floor(position.y / this.tileSize)
    };
  }

  // Convert tile coordinates to pixel coordinates (top-left of tile)
  tileToWorld(tile: Vector2D): Vector2D {
    return {
      x: tile.x * this.tileSize,
      y: tile.y * this.tileSize
    };
  }

  render(context: CanvasRenderingContext2D, spriteMap: Record<string, HTMLImageElement>): void {
    // Render each visible layer
    this.layers.forEach(layer => {
      if (!layer.visible) return;

      for (let y = 0; y < this.height; y++) {
        for (let x = 0; x < this.width; x++) {
          const tile = layer.tiles[y][x];
          
          // Skip empty tiles
          if (tile.type === TileType.EMPTY) continue;
          
          const worldX = x * this.tileSize;
          const worldY = y * this.tileSize;
          
          // If the tile has a sprite, draw it
          if (tile.spriteId && spriteMap[tile.spriteId]) {
            context.drawImage(
              spriteMap[tile.spriteId],
              worldX,
              worldY,
              this.tileSize,
              this.tileSize
            );
          } else {
            // Otherwise draw a colored rectangle based on tile type
            switch (tile.type) {
              case TileType.WALL:
                context.fillStyle = '#333';
                break;
              case TileType.START:
                context.fillStyle = '#0f0';
                break;
              case TileType.END:
                context.fillStyle = '#f00';
                break;
              case TileType.PATH:
                context.fillStyle = '#ddd';
                break;
              default:
                context.fillStyle = 'transparent';
            }
            
            context.fillRect(worldX, worldY, this.tileSize, this.tileSize);
          }
        }
      }
    });
  }
}

export class MazeGenerator {
  width: number;
  height: number;
  
  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }
  
  // Generate a simple maze using recursive backtracking algorithm
  generate(): TileMap {
    const tileMap = new TileMap(this.width, this.height, 32);
    tileMap.createLayer('maze');
    
    // Initialize all cells as walls
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        tileMap.setTile(0, x, y, {
          id: 1,
          type: TileType.WALL,
          solid: true,
          spriteId: null,
          properties: {}
        });
      }
    }
    
    // Recursive backtracking algorithm
    const stack: Vector2D[] = [];
    const visited: boolean[][] = Array(this.height).fill(0).map(() => Array(this.width).fill(false));
    
    // Start at a random cell
    const startX = 1;
    const startY = 1;
    stack.push({ x: startX, y: startY });
    visited[startY][startX] = true;
    
    // Set start position
    tileMap.setTile(0, startX, startY, {
      id: 2,
      type: TileType.START,
      solid: false,
      spriteId: null,
      properties: {}
    });
    
    while (stack.length > 0) {
      const current = stack[stack.length - 1];
      
      // Get unvisited neighbors
      const neighbors: Vector2D[] = [];
      
      // Check in all four directions
      const directions = [
        { x: 0, y: -2 }, // Up
        { x: 2, y: 0 },  // Right
        { x: 0, y: 2 },  // Down
        { x: -2, y: 0 }  // Left
      ];
      
      for (const dir of directions) {
        const nx = current.x + dir.x;
        const ny = current.y + dir.y;
        
        // Check if neighbor is valid and unvisited
        if (
          nx > 0 && nx < this.width - 1 &&
          ny > 0 && ny < this.height - 1 &&
          !visited[ny][nx]
        ) {
          neighbors.push({ x: nx, y: ny });
        }
      }
      
      if (neighbors.length > 0) {
        // Choose a random neighbor
        const next = neighbors[Math.floor(Math.random() * neighbors.length)];
        
        // Remove the wall between current and next
        const wallX = current.x + (next.x - current.x) / 2;
        const wallY = current.y + (next.y - current.y) / 2;
        
        tileMap.setTile(0, wallX, wallY, {
          id: 4,
          type: TileType.PATH,
          solid: false,
          spriteId: null,
          properties: {}
        });
        
        // Mark the chosen cell as visited and push it to the stack
        visited[next.y][next.x] = true;
        tileMap.setTile(0, next.x, next.y, {
          id: 4,
          type: TileType.PATH,
          solid: false,
          spriteId: null,
          properties: {}
        });
        
        stack.push(next);
      } else {
        // Backtrack
        stack.pop();
      }
    }
    
    // Set end position (furthest from start)
    let maxDistance = 0;
    let endX = startX;
    let endY = startY;
    
    for (let y = 1; y < this.height - 1; y += 2) {
      for (let x = 1; x < this.width - 1; x += 2) {
        if (tileMap.getTile(0, x, y)?.type === TileType.PATH) {
          const distance = Math.abs(x - startX) + Math.abs(y - startY);
          if (distance > maxDistance) {
            maxDistance = distance;
            endX = x;
            endY = y;
          }
        }
      }
    }
    
    tileMap.setTile(0, endX, endY, {
      id: 3,
      type: TileType.END,
      solid: false,
      spriteId: null,
      properties: {}
    });
    
    return tileMap;
  }
}
