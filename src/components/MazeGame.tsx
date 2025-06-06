import React, { useEffect, useRef } from 'react';
import { GameEngine } from '../lib/engine/GameEngine';
import { MazeGenerator } from '../lib/engine/TileMap';
import { Player } from '../lib/engine/Entity';
import '../App.css';

const MazeGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Initialize game engine
    const engine = new GameEngine(canvasRef.current);
    engineRef.current = engine;
    
    // Initialize game
    const initGame = async () => {
      // Initialize engine
      engine.init();
      
      // Generate maze
      const mazeGenerator = new MazeGenerator(21, 21); // Odd dimensions for proper maze generation
      const tileMap = mazeGenerator.generate();
      engine.setTileMap(tileMap);
      
      // Find start position
      let startX = 0;
      let startY = 0;
      
      for (let y = 0; y < tileMap.height; y++) {
        for (let x = 0; x < tileMap.width; x++) {
          const tile = tileMap.getTile(0, x, y);
          if (tile && tile.type === 2) { // Start tile
            startX = x * tileMap.tileSize;
            startY = y * tileMap.tileSize;
            break;
          }
        }
      }
      
      // Create player
      const player = new Player('player', startX, startY, 24, 24);
      engine.addEntity(player);
      
      // Start the game
      engine.start();
    };
    
    initGame();
    
    // Cleanup
    return () => {
      if (engineRef.current) {
        engineRef.current.stop();
      }
    };
  }, []);

  return (
    <div className="maze-game">
      <h1>Maze Game</h1>
      <div className="game-container">
        <canvas 
          ref={canvasRef} 
          className="game-canvas"
          width={800}
          height={600}
        />
      </div>
      <div className="game-instructions">
        <h2>How to Play</h2>
        <p>Use the arrow keys or WASD to navigate through the maze.</p>
        <p>Find your way from the green starting point to the red exit.</p>
      </div>
    </div>
  );
};

export default MazeGame;
