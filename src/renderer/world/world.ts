import * as PIXI from "pixi.js";
import Block from "../blocks/block";
import { renderDistance } from "../common/constants";
import { negativeModulo } from "../common/utils";
import Player from "../player/player";
import ChunksManager from "./chunksManager";
import Generation from "../generation/generation";
import Game from "../game/game";

export default class World {
    player: Player = new Player(this);

    readonly container: PIXI.Container;
    readonly chunks;

    generator: Generation;

    constructor(container: PIXI.Container, game: Game, seed: string) {
        this.container = container;

        this.chunks = new ChunksManager(game);

        this.generator = new Generation(this, seed);

        this.player.on("move", () => this.handlePlayerMoved());
    }

    private handlePlayerMoved() {
        this.calcRenderDistance();
    }

    calcRenderDistance() {
        for (let i = this.player.actualChunk - renderDistance; i <= this.player.actualChunk + renderDistance; i++) {
            this.chunks.get(i);
        }

        this.chunks.forEach((chunk, pos) => {
            if (pos < this.player.actualChunk - renderDistance || pos > this.player.actualChunk + renderDistance) {
                this.chunks.unload(pos);
                this.container.removeChild(chunk.container);
            }
        });
    }

    setBlock(pos: PIXI.Point, block: typeof Block) {
        let chunkPos = Math.floor(pos.x / 16);

        let blockPos = new PIXI.Point(negativeModulo(pos.x), pos.y);

        this.chunks.get(chunkPos).setBlock(blockPos, block);
    }

    getBlock(pos: PIXI.Point): Block | undefined {
        let chunkPos = Math.floor(pos.x / 16);

        let blockPos = new PIXI.Point(negativeModulo(pos.x), pos.y);

        let chunk = this.chunks.get(chunkPos);
        if (!chunk) return undefined;

        return chunk.blocks.get(blockPos);
    }

    deleteBlock(pos: PIXI.Point) {
        let chunkPos = Math.floor(pos.x / 16);

        let blockPos = new PIXI.Point(negativeModulo(pos.x), pos.y);

        let chunk = this.chunks.get(chunkPos);

        if (!chunk) throw new Error(`Block not found (${pos.x}:${pos.y})`);

        if (!chunk.blocks.has(blockPos)) throw new Error(`Block not found (${pos.x}:${pos.y})`);

        chunk.deleteBlock(blockPos);
    }
}
