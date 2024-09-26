import Phaser from "phaser";
import { config } from "./../config.js";
import { toRes, getSheetKey } from "./../utils/";
import eventHub from "../vue/eventHub.js";

export default class Stoplight extends Phaser.GameObjects.Container {
	constructor(scene) {
		super(scene);
		this.scene = scene;
		scene.add.existing(this);

		this.x = (this.scene.side == "right" ? toRes(62) : toRes(898));
		if(this.scene.config.ticker == "ETH"){this.y = this.scene.busStop - toRes(130);}else{this.y = this.scene.busStop - toRes(100);}
		
		eventHub.$on('stopSignAdjust',()=>{if(this.scene.config.ticker == "ETH"){this.y = toRes(100) ;}})
		eventHub.$on('stopSignAdjustwithBridge',()=>{if(this.scene.config.ticker == "ETH"){this.y = this.scene.busStop - toRes(130); }})

		eventHub.$on('stopSignAdjust',()=>{if(this.scene.config.ticker == "SOLANA"){this.y = toRes(100) }})
		eventHub.$on('stopSignAdjustwithBridge',()=>{if(this.scene.config.ticker == "SOLANA"){this.y = this.scene.busStop - toRes(100); }})
		console.log("**TRAFFICLIGHT***",this.y)

		this.offAlpha = 0.2;
		this.lightSize = 9;

		this.createLight();
		this.currentColor = null;
		this.setLight("red");
		this.setDepth(this.scene.topDepth + 1);
		this.setScale(config.resolution);
	}

	recreate() {
		this.x = (this.scene.side == "right" ? toRes(62) : toRes(898));
		this.pole.destroy();
		this.sign.destroy();
		this.redLight.destroy();
		this.yellowLight.destroy();
		this.greenLight.destroy();
		this.createLight();
		this.currentColor = null;
		this.setLight("red");
	}

	createLight() {
		this.pole = this.scene.add.image(0, 0 + (config.theme.stoplightPadding/2), getSheetKey("spotlight.png"), "stoplight.png");
		this.sign = this.scene.add.image(this.scene.side == "right" ? -5 : 5, -20, getSheetKey("spotlight_sign.png"), "stoplight_sign.png");
		this.sign.clickObject = "stoplight";
		this.sign.setInteractive({ cursor: "help" });

		let lightsX = 64;

		if (this.scene.side !== "right") {
			this.pole.setFlipX(true);
			lightsX = -64;
		}

		this.redLight = this.scene.add.graphics({ fillStyle: { color: 0xff3838 } });
		this.yellowLight = this.scene.add.graphics({ fillStyle: { color: 0xfdff38 } });
		this.greenLight = this.scene.add.graphics({ fillStyle: { color: 0x3dff38 } });

		this.redLight.fillCircle(lightsX, -66, this.lightSize);
		this.yellowLight.fillCircle(lightsX, -44, this.lightSize);
		this.greenLight.fillCircle(lightsX, -22, this.lightSize);

		this.add(this.pole);
		this.add(this.sign);
		this.add(this.redLight);
		this.add(this.yellowLight);
		this.add(this.greenLight);
	}

	setLight(color) {
		if (this.currentColor == color) return false;
		this.redLight.setAlpha(this.offAlpha);
		this.yellowLight.setAlpha(this.offAlpha);
		this.greenLight.setAlpha(this.offAlpha);

		this[color + "Light"].setAlpha(1);
		this.currentColor = color;
	}

	setMyXpos(pos){

		this.x = toRes(pos);
	}

	flipMyStopLight(mybool){
		this.pole.setFlipX(mybool);
	}
    
	adjustMyLightPosX(pos){
		this.redLight.x = this.redLight.x - toRes(pos);
		this.yellowLight.x = this.yellowLight.x - toRes(pos);
		this.greenLight.x = this.greenLight.x - toRes(pos);
	}
	
}
