import * as PIXI from "pixi.js";

import Player from "../player/player";
import inputManager from "../common/inputManager";
import World from "../world/world";
import { negativeModulo } from "../common/utils";
import SaveManager from "../common/saveManager";

function appResize(app: PIXI.Application, stage: PIXI.Container, playerSize: { width: number; height: number }) {
    app.renderer.resize(window.innerWidth, window.innerHeight);
    stage.pivot.set(-((window.innerWidth - playerSize.width) / 2), -((window.innerHeight + playerSize.height) / 2));
}

export default class Game {
    private app: PIXI.Application;

    private playerCenteredContainer = new PIXI.Container();
    private staticContainer = new PIXI.Container();

    world: World;
    private player: Player;

    name: string;

    constructor(app: PIXI.Application, name: string, seed: string) {
        this.app = app;
        this.app.stage.sortableChildren = true;
        this.playerCenteredContainer.sortableChildren = true;

        this.name = name;

        this.world = new World(this.playerCenteredContainer, this, seed);

        this.player = this.world.player;

        window.onresize = () =>
            appResize(this.app, this.playerCenteredContainer, { width: this.player.width, height: this.player.height });

        window.onresize(null as any);

        inputManager.init();

        inputManager.on("Escape", () => {
            SaveManager.saveGame(this);
        });
    }

    start() {
        this.app.stage.addChild(this.playerCenteredContainer);
        this.app.stage.addChild(this.staticContainer);

        this.playerCenteredContainer.addChild(this.player);

        let FPSText = new PIXI.Text("", { fontSize: 20 });
        this.staticContainer.addChild(FPSText);

        let playerPosText = new PIXI.Text("", { fontSize: 20 });
        playerPosText.y = 20;
        this.staticContainer.addChild(playerPosText);

        let playerChunkPosText = new PIXI.Text("", { fontSize: 20 });
        playerChunkPosText.y = 40;
        this.staticContainer.addChild(playerChunkPosText);

        let playerSpeedText = new PIXI.Text("", { fontSize: 20 });
        playerSpeedText.y = 60;
        this.staticContainer.addChild(playerSpeedText);

        this.world.calcRenderDistance();

        // game loop
        this.app.ticker.add(delta => {
            this.player.tick(delta);

            this.playerCenteredContainer.x = -this.player.x;
            this.playerCenteredContainer.y = -this.player.y;
        });

        setInterval(() => {
            // 10 FPS loop

            FPSText.text = this.app.ticker.FPS.toFixed();

            playerPosText.text = `X: ${this.player.pos.x} Y: ${this.player.pos.y}`;
            playerChunkPosText.text = `Chunk: ${this.player.actualChunk} Relative pos: X: ${negativeModulo(
                this.player.pos.x
            )} Y: ${this.player.pos.y}`;
            playerSpeedText.text = `Speed: X: ${this.player.speed.x} Y: ${this.player.speed.y}`;
        }, 100);
    }

    getMetaData(): GameMetaData {
        return {
            name: this.name,
            seed: this.world.generator.seed.toString(),
            lastLoadedTimeStamp: new Date(),
        };
    }
}
