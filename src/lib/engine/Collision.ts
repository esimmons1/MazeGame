import { Tile, TileMap } from './TileMap';
import { Entity } from './Entity';

export class CollisionSystem {
  // Check collision between two entities
  checkCollision(entity1: Entity, entity2: Entity): boolean {
    // Skip if either entity is not solid
    if (!entity1.solid || !entity2.solid) return false;
    
    // Simple AABB collision detection
    return (
      entity1.x < entity2.x + entity2.width &&
      entity1.x + entity1.width > entity2.x &&
      entity1.y < entity2.y + entity2.height &&
      entity1.y + entity1.height > entity2.y
    );
  }
  
  // Check collision between entity and tile map
  checkTileCollision(entity: Entity, tileMap: TileMap): { collided: boolean, tiles: { x: number, y: number, tile: Tile }[] } {
    if (!entity.solid) return { collided: false, tiles: [] };
    
    const collisionTiles: { x: number, y: number, tile: Tile }[] = [];
    let collided = false;
    
    // Calculate the tile coordinates that the entity overlaps with
    const tileSize = tileMap.tileSize;
    const startX = Math.floor(entity.x / tileSize);
    const startY = Math.floor(entity.y / tileSize);
    const endX = Math.floor((entity.x + entity.width - 1) / tileSize);
    const endY = Math.floor((entity.y + entity.height - 1) / tileSize);
    
    // Check each tile in the area
    for (let layerIndex = 0; layerIndex < tileMap.layers.length; layerIndex++) {
      for (let y = startY; y <= endY; y++) {
        for (let x = startX; x <= endX; x++) {
          const tile = tileMap.getTile(layerIndex, x, y);
          
          if (tile && tile.solid) {
            collided = true;
            collisionTiles.push({ x, y, tile });
          }
        }
      }
    }
    
    return { collided, tiles: collisionTiles };
  }
  
  // Resolve collision between two entities
  resolveCollision(entity1: Entity, entity2: Entity): void {
    if (!this.checkCollision(entity1, entity2)) return;
    
    // Calculate overlap on each axis
    const overlapX = Math.min(
      entity1.x + entity1.width - entity2.x,
      entity2.x + entity2.width - entity1.x
    );
    
    const overlapY = Math.min(
      entity1.y + entity1.height - entity2.y,
      entity2.y + entity2.height - entity1.y
    );
    
    // Resolve along the axis with the smallest overlap
    if (overlapX < overlapY) {
      // Resolve horizontally
      if (entity1.x < entity2.x) {
        entity1.x = entity2.x - entity1.width;
      } else {
        entity1.x = entity2.x + entity2.width;
      }
      entity1.velocity.x = 0;
    } else {
      // Resolve vertically
      if (entity1.y < entity2.y) {
        entity1.y = entity2.y - entity1.height;
      } else {
        entity1.y = entity2.y + entity2.height;
      }
      entity1.velocity.y = 0;
    }
    
    // Trigger collision handlers
    entity1.onCollision(entity2);
    entity2.onCollision(entity1);
  }
  
  // Resolve collision between entity and tile map
  resolveTileCollision(entity: Entity, tileMap: TileMap): void {
    const result = this.checkTileCollision(entity, tileMap);
    if (!result.collided) return;
    
    // For each colliding tile, calculate the overlap and resolve
    for (const { x, y } of result.tiles) {
      const tileX = x * tileMap.tileSize;
      const tileY = y * tileMap.tileSize;
      
      // Calculate overlap on each axis
      const overlapX = Math.min(
        entity.x + entity.width - tileX,
        tileX + tileMap.tileSize - entity.x
      );
      
      const overlapY = Math.min(
        entity.y + entity.height - tileY,
        tileY + tileMap.tileSize - entity.y
      );
      
      // Resolve along the axis with the smallest overlap
      if (overlapX < overlapY) {
        // Resolve horizontally
        if (entity.x < tileX) {
          entity.x = tileX - entity.width;
        } else {
          entity.x = tileX + tileMap.tileSize;
        }
        entity.velocity.x = 0;
      } else {
        // Resolve vertically
        if (entity.y < tileY) {
          entity.y = tileY - entity.height;
        } else {
          entity.y = tileY + tileMap.tileSize;
        }
        entity.velocity.y = 0;
      }
    }
  }
}
