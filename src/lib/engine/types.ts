// Core game engine types

export interface Vector2D {
  x: number;
  y: number;
}

export enum Direction {
  UP,
  RIGHT,
  DOWN,
  LEFT,
  NONE
}

export interface Size {
  width: number;
  height: number;
}

export interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Animation {
  name: string;
  frames: number[];
  frameRate: number;
  loop: boolean;
}

export enum MazeAlgorithm {
  RECURSIVE_BACKTRACKING,
  PRIMS,
  KRUSKALS,
  BINARY_TREE
}

export enum TileType {
  EMPTY = 0,
  WALL = 1,
  START = 2,
  END = 3,
  PATH = 4
}

export interface GameState {
  running: boolean;
  paused: boolean;
  score: number;
  level: number;
  gameOver: boolean;
  won: boolean;
}
