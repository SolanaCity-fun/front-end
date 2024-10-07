import Phaser, { Scene } from "phaser";
import { getSheetKey,toRes } from "./../utils/";
import Popup from "./popup";
import eventHub from "../vue/eventHub.js";
const Avatar = new Phaser.Class({
	Extends: Phaser.GameObjects.Container,
	initialize: function Avatar(scene, side, x, y, key) {
		Phaser.GameObjects.Container.call(this, scene, 0, 0);
		this.scene = scene;
		this.x = x;
		this.y = y;
		this.key = key;
		this.side = side;

		this.myAvatar = this.scene.add.sprite(x, y, key).setScale(1.5);
		this.myAvatar.setTexture(getSheetKey("person-"), key);
		this.add(this.myAvatar);
		this.scene.add.existing(this);
		//this.follow = this.scene.cameras.main.startFollow(this.myAvatar);
	},
});

Avatar.prototype.setupControls = function (scene) {

	eventHub.$on("popUpDestroyed",()=>{

		if(this.avatarPopUp){this.avatarPopUp.active=false;this.remove(this.avatarPopUp);console.log("yooh")}

	});

	this.myAvatar.setInteractive({useHandCursor:true});
	// this.scene.cameras.main.startFollow(this.myAvatar)
	scene.input.keyboard.on("keydown-S", () => {
		this.y += 5;
		this.myAvatar.y = this.y;
		// this.followScroll = this.follow._scrollY-500;
		// this.scene.scrollTileSprites(this.followScroll , true);
		this.myAvatar.anims.play("walk_down_2", true);
	});

	scene.input.keyboard.on("keydown-W", () => {
		this.y -= 5;
		this.myAvatar.y = this.y;
		// this.followScroll = this.follow._scrollY-500;
		// this.scene.scrollTileSprites(this.followScroll , true);
		this.myAvatar.anims.play("walk_up_2", true);
	});

	scene.input.keyboard.on("keydown-D", () => {
		this.x += 5;
		this.myAvatar.x = this.x;
		this.myAvatar.setFlipX(true);
		this.myAvatar.anims.play("walk_side_2", true);
	});

	scene.input.keyboard.on("keydown-A", () => {
		this.x -= 5;
		this.myAvatar.x = this.x;
		this.myAvatar.setFlipX(false);
		this.myAvatar.anims.play("walk_side_2", true);
	});

	this.myAvatar.on("pointerdown",()=>{

		this.setupPopUp(scene);

	});

	

};

 Avatar.prototype.setupPopUp = function(scene){


	this.avatarPopUp = new Popup(scene,this.myAvatar.x,this.myAvatar.y+toRes(50),false,"bubble","0x3ff0812e7dd0f7f37b0e9b619198b70084df9399")
    this.add(this.avatarPopUp);



 }

 Avatar.prototype.updateAvatarPopUp = function(scene){

	if(this.avatarPopUp){

	this.avatarPopUp.y = this.myAvatar.y+toRes(60);
	this.avatarPopUp.x = this.myAvatar.x;
	}

 }

export default Avatar;
