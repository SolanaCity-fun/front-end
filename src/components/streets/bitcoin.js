import { Street } from "../street.js";
import { toRes, getSheetKey } from "../utils/";
import { BTC } from "../config.js";
import { fds, default as i18n } from "../../i18n";
import { add } from "date-fns";
import eventHub from "../vue/eventHub.js";
export default class BTCStreet extends Street {
	constructor(side) {
		super(BTC, side);
		this.mySide = side;
	}

	init() {
		this.foundBoarding = false;
		//this.busStop = toRes(200);
		this.myMainCameraPosition = 1300;
		this.busDoorFromTop = toRes(42);
		this.personPixelsPerSecond = 3;
		this.bridgeTx = [];
		this.decelerationArea = toRes(500);
		this.sceneHeight = toRes(10000);
		this.alwaysGetPendingAfterBlock = true;
		let walkingLaneOffset = 10 * this.tileSize;
		this.walkingLane = this.side == "right" ? toRes(960) - walkingLaneOffset : walkingLaneOffset;
		this.lineLength = 9500;
		this.streetInit();
		this.stringLengths = {
			tx: [64],
			address: [34, 42],
		};
		this.sizeVar = "s";
		this.medianFeeStat = "medianFee-satPerByte";
		this.vueTxFormat = [
			{
				title: () => {
					return i18n.t(this.ticker.toLowerCase() + ".spb");
				},
				key: "spb",
			},
			{
				title: () => {
					return i18n.t(this.ticker.toLowerCase() + ".s");
				},
				key: "s",
			},
			{
				title: () => {
					return i18n.t(this.ticker.toLowerCase() + ".rs");
				},
				key: "rs",
			},
			{
				title: () => {
					return i18n.t(this.ticker.toLowerCase() + ".tot");
				},
				key: "tot",
				after: this.ticker,
			},
		];
		this.bottomStats = this.config.stats;
	}

	preload() {
	}

	create() {
		super.create();
		this.createPeople();
		if(this.adjustView){this.cameras.main.scrollY =toRes(1300);}
		this.streetCreate();
		if(this.adjustView){this.checkSideAddSign(this.mySide);}
		this.vue.busFeeTitle = "Sat/vB";
		(this.vue.busFeeTitleLong = () => {
			return i18n.t(this.ticker.toLowerCase() + ".spb");
		}),
			(this.vue.sizeTitle = () => {
				return i18n.t(this.ticker.toLowerCase() + ".sizeTitle");
			}),
			(this.vue.sizeAltTitle = () => {
				return i18n.t(this.ticker.toLowerCase() + ".sizeAltTitle");
			}),
			this.createBuses();

		this.vue.$watch("blockchainLength", val => {
			this.calcHalving(val);
		});
		this.calcHalving(this.blockchain.length);

		eventHub.$on("EthBridgeTx",(bridgeTxData)=>{
			this.addBridgeTx(bridgeTxData);
		})
		eventHub.$on("scrollToBridge",()=>{this.scrollToBridge()});
		eventHub.$on("createMyStaticSearch",()=>{this.createStaticSearch()});
		eventHub.$on("stopSignAdjustwithBridge",()=>{this.adjustBusHeight = true;this.checkSideAddSign(this.mysetSide);})
		eventHub.$on("stopSignAdjust",()=>{	if(this.myBridgeRoadSign){this.myBridgeRoadSign.destroy();}})
	}

	
	setBusStop(stop){
		this.busStop = toRes(stop);
	}

	adjustMyView(mybool){
     this.adjustView = mybool; 
	
		
	}

	setAdjustCrowdPos(mycrowdBool)
	{
 this.adjustCrowdPos = mycrowdBool
 console.log('******************TUMEPATA NI****** ',mycrowdBool);
	}

	setView(view){
		this.resetView = view;
	}

	addBridgeTx(myBridgeTxData){

		this.bridgeTx.push(myBridgeTxData);
		console.log(this.bridgeTx);
	}

	setSide(side){
		this.mysetSide = side;
	}
	checkSideAddSign(side){
		console.log("###############",side)
		if(this.myBridgeRoadSign){this.myBridgeRoadSign.destroy();}
		if(side == "left"){
			this.myBridgeRoadSign =	this.add.image(toRes(865),toRes(800), "BRIDGESIGN").setScale(toRes(1));
		}else{
			this.myBridgeRoadSign = this.add.image(toRes(97), toRes(800), "BRIDGESIGN").setScale(toRes(1));
		}
	}

	scrollToBridge(){
		setInterval(() => {
			if(this.myMainCameraPosition > 0){
			this.myMainCameraPosition -= 10;
			this.cameras.main.scrollY = this.myMainCameraPosition;
			eventHub.$emit("myScrollData",{ cameraY: this.cameras.main.scrollY });
		}}, 20);
	

	}

	generateLine(value) {

		setTimeout(() => {
			
	
		let boardingSide = this.side == "left" || this.side == "full" ? this.curbX - 1 : this.curbX + 1;
		let oppositeSide =
			this.side == "left" || this.side == "full" ? this.walkingLane + toRes(32) : this.walkingLane - toRes(32);
		let xSeperator = toRes(17);
		let ySeperator = toRes(17);
		let row = 0;
		let column = 0;

		this.lineStructure = [];
		for (let i = 0; i < value; i++) {
			let addedX = column * xSeperator + Math.random() * toRes(20);
			let addedY = row * ySeperator + Math.random() * toRes(20);
			let x = Math.round(boardingSide + (this.side == "left" || this.side == "full" ? -addedX : addedX));
			let	y = Math.round(this.busStop + addedY);
			this.lineStructure.push([x, y]);
			// if(this.adjustCrowdPos){
			// 	this.lineStructure.push([x, y+toRes(100)]);
			// 	// this.onceAdjust = true;
			// //	console.log("##################adjustTrue#####################")
			// }
			// if(this.adjustCrowdPos === false){

			// 	this.lineStructure.push([x, y+toRes(100)]);
			// 	// if(this.onceAdjust){
			// 	// 	this.lineStructure.push([x, y-toRes(1300)]);
			// 	// 	this.onceAdjust = false;
			// 	// }else{
			// 	// 	this.lineStructure.push([x, y]);
			// 	// }
			// 	//console.log("##################adjustFalse#####################")
				
			// }
			// if(this.adjustCrowdPos === undefined){
		
			// 	//console.log("##################UNDEFFFF#####################")
			// }

		
			column++;
			if (
				column >= this.peoplePerRow(row) ||
				((this.side == "left" || this.side == "full") && x < oppositeSide) ||
				(this.side == "right" && x > oppositeSide)
			) {
				row++;
				column = 0;
			}
		}
	}, 30);
	}

	setCrowdY(y) {

		if (y === this.crowd.rawY) return false;
		if (y < this.crowd.rawY) {
			this.crowd.changeLowerCount++;
			if (this.crowd.changeLowerCount < 10) return false;
		}
		this.crowd.changeLowerCount = 0;
		this.crowd.y = y + toRes(100);
		this.crowd.rawY = y;
		if (this.crowd.y < toRes(1000)) this.crowd.y = toRes(1000);
		this.crowd.y = Math.ceil(this.crowd.y / toRes(50)) * toRes(50);
		this.crowdSign.y = this.crowd.y - toRes(30);
		this.crowdSign.x = this.crowd.x;
		this.checkView();


		

		}


	calcHalving(val){
		if(!this.blockchain.length) return;
		let recentBlock = this.blockchain[val - 1];
		let height = recentBlock.height;
		let halvingHeight = 0;
		while (halvingHeight < height) {
			halvingHeight += 210000;
		}
		let blocksUntilHalving = halvingHeight - height;
		let secondsUntilHalving = blocksUntilHalving * 600;
		this.vue.stats["halving"].value = fds(add(new Date(), { seconds: secondsUntilHalving }), new Date(), {
			roundingMethod: "floor",
			addSuffix: true,
		});
	}

	update() {
		this.streetUpdate();
	}

	afterNewBus(bus) {
		bus.trailerLight.y = 230;
		bus.trailer.y = 177;
		bus.segwitInside.y = 170;
		bus.segwitColor.y = 170;
		bus.segwitOutside.y = 170;
	}

	afterBusConstructor(bus) {
		bus.trailer = this.add.sprite(0, 177, getSheetKey("segwitbus.png"), "segwitbus.png");
		bus.trailer.clickObject = "segwit";
		bus.trailer.setInteractive({ cursor: "help" });

		bus.bottomSpriteName = "trailer";
		bus.segwitInside = this.add.sprite(1, 170, getSheetKey("segwit_inside.png"), "segwit_inside.png");
		bus.segwitInside.setAlpha(0.5);
		bus.segwitInside.setScale(0.8);
		bus.segwitColor = this.add.sprite(1, 170, getSheetKey("segwit_inside.png"), "segwit_inside.png");
		bus.segwitColor.setAlpha(0);
		bus.segwitColor.setTint(0x54fff1);
		bus.segwitColor.setScale(0.8);
		bus.segwitOutside = this.add.sprite(1, 170, getSheetKey("segwit_outline.png"), "segwit_outline.png");
		bus.segwitOutside.setScale(0.8);
		bus.trailerLight = this.add.sprite(0, 230, getSheetKey("lights.png"), "lights.png").setScale(0.88);
		bus.lightsSprite.push(bus.trailerLight);
		bus.add(bus.trailer);
		bus.add(bus.segwitInside);
		bus.add(bus.segwitColor);
		bus.add(bus.segwitOutside);
		bus.add(bus.trailerLight);
	}

	setSegwitFadeout(bus) {
		if (typeof bus === "undefined" || typeof bus.segwitColor === "undefined") return false;
		if (typeof bus.segwitFadeout !== "undefined") bus.segwitFadeout.remove();
		bus.segwitColor.setAlpha(1);
		bus.segwitFadeout = this.add.tween({
			targets: bus.segwitColor,
			alpha: 0,
			ease: "Expo.easeOut",
			duration: 1000 * window.txStreetPhaser.streetController.fpsTimesFaster,
		});
	}

	afterEnterBus(array) {
		let person = array[0];
		let bus = array[1];
		let txData = person.getLineData("txData");
		let segwit = typeof txData.e !== "undefined" && typeof txData?.e?.sw !== "undefined" ? txData?.e?.sw : false;
		if (segwit) {
			this.setSegwitFadeout(bus);
		}
	}

	afterMoveLength(arr) {
		let bus = arr[0];
		let duration = arr[1];
		let difference = arr[3];

		this.add.tween({
			targets: [bus.trailer, bus.segwitInside, bus.segwitColor, bus.segwitOutside],
			y: target => {
				return target.y - difference;
			},
			ease: "Power1",
			duration: duration,
		});
	}

	afterResume() {}

	afterSortBusesLoadTx(array) {
		let entry = array[0];
		let bus = array[1];

		bus.loadedAlt += entry.txData.rs;
	}
}

BTCStreet.config = BTC;
