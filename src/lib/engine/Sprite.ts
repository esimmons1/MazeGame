import { Animation } from './types';

export class Sprite {
  id: string;
  image: HTMLImageElement;
  width: number;
  height: number;
  frameWidth: number;
  frameHeight: number;
  frames: number;
  currentFrame: number;
  animations: Record<string, Animation>;
  currentAnimation: string | null;
  animationTimer: number;
  frameTime: number;

  constructor(id: string, image: HTMLImageElement, frameWidth?: number, frameHeight?: number) {
    this.id = id;
    this.image = image;
    this.width = image.width;
    this.height = image.height;
    this.frameWidth = frameWidth || image.width;
    this.frameHeight = frameHeight || image.height;
    this.frames = Math.floor(this.width / this.frameWidth) * Math.floor(this.height / this.frameHeight);
    this.currentFrame = 0;
    this.animations = {};
    this.currentAnimation = null;
    this.animationTimer = 0;
    this.frameTime = 0;
  }

  draw(context: CanvasRenderingContext2D, x: number, y: number): void {
    if (!this.image.complete) return;

    const framesPerRow = Math.floor(this.width / this.frameWidth);
    const row = Math.floor(this.currentFrame / framesPerRow);
    const col = this.currentFrame % framesPerRow;

    const sourceX = col * this.frameWidth;
    const sourceY = row * this.frameHeight;

    context.drawImage(
      this.image,
      sourceX,
      sourceY,
      this.frameWidth,
      this.frameHeight,
      x,
      y,
      this.frameWidth,
      this.frameHeight
    );
  }

  update(deltaTime: number): void {
    if (!this.currentAnimation) return;

    const animation = this.animations[this.currentAnimation];
    if (!animation) return;

    this.animationTimer += deltaTime;
    this.frameTime = 1000 / animation.frameRate;

    if (this.animationTimer >= this.frameTime) {
      const frameIndex = Math.floor(this.animationTimer / this.frameTime) % animation.frames.length;
      this.currentFrame = animation.frames[frameIndex];
      
      // Reset timer but keep remainder for smoother animations
      this.animationTimer = this.animationTimer % this.frameTime;
      
      // Handle non-looping animations
      if (!animation.loop && frameIndex === animation.frames.length - 1) {
        this.currentAnimation = null;
      }
    }
  }

  setAnimation(name: string): void {
    if (this.currentAnimation === name) return;
    
    const animation = this.animations[name];
    if (animation) {
      this.currentAnimation = name;
      this.currentFrame = animation.frames[0];
      this.animationTimer = 0;
    }
  }

  addAnimation(animation: Animation): void {
    this.animations[animation.name] = animation;
  }
}

export class SpriteSheet {
  image: HTMLImageElement;
  sprites: Record<string, Sprite>;
  
  constructor() {
    this.image = new Image();
    this.sprites = {};
  }

  async load(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.image.onload = () => resolve();
      this.image.onerror = () => reject(new Error(`Failed to load sprite sheet: ${url}`));
      this.image.src = url;
    });
  }

  createSprite(id: string, x: number, y: number, width: number, height: number): Sprite {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(this.image, x, y, width, height, 0, 0, width, height);
    }
    
    const spriteImage = new Image();
    spriteImage.src = canvas.toDataURL();
    
    const sprite = new Sprite(id, spriteImage);
    this.sprites[id] = sprite;
    
    return sprite;
  }

  getSprite(id: string): Sprite | undefined {
    return this.sprites[id];
  }
}

// Helper function to load an image
export const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
};
