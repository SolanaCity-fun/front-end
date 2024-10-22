import Phaser from "phaser";
import { toRes, toResRev } from "./../utils/";

export default class solBus extends Phaser.GameObjects.Container {

      constructor(scene,text1,text2,text3,onRight){

        super(scene)
		this.scene = scene;
        this.buses = [];
		
       
        this.y = toRes(10000);
        this.text1Text = text1;
        this.text2Text = text2;
        this.text3Text = text3;

        this.onMyRight = onRight;

        if(this.onMyRight){this.x = toRes(850);}else{ this.x = toRes(89);}
       

        this.createSolanaBus();
        scene.add.existing(this);
      }


      createSolanaBus(){

       
        this.busTopSprite = this.scene.add.image(toRes(5), toRes(-97), "solbtop").setScale(toRes(1.8));
        this.busHeight= toRes(this.busTopSprite.height/1.3);
        this.busBottomSprite = this.scene.add.image(toRes(1), this.busHeight - toRes(10), "solbb").setScale(toRes(1.8));

        this.add(this.busTopSprite);
        this.add(this.busBottomSprite);
    
        // this.busMiddle = this.scene.add.rectangle(0, -59, 120, this.busHeight, "0x" + this.scene.config.busColor, 1);
        // this.busMiddle.setVisible(false);
        this.text1 = this.scene.add.bitmapText(toRes(this.busTopSprite.x-this.busTopSprite.width/2.5),this.busTopSprite.y, "roboto", "#" + this.text1Text, 19).setOrigin(0,0).setScale(toRes(0.95));
        this.add(this.text1);
        
        this.text2 = this.scene.add.bitmapText(toRes(this.busTopSprite.x-this.busTopSprite.width/3.5), this.busTopSprite.y + toRes(this.busTopSprite.height/2.5), "roboto", "" + this.text2Text, 24).setOrigin(0,0).setScale(toRes(0.95));
        this.add(this.text2);
    
        
         this.text3 = this.scene.add.bitmapText(toRes(this.busTopSprite.x-this.busTopSprite.width/3.8),this.busTopSprite.y + toRes(this.busTopSprite.height), "roboto", ""+this.text3Text, 19).setOrigin(0,0).setScale(toRes(0.95));
         this.add(this.text3);

         this.solLogo = this.scene.add.image(toRes(this.busTopSprite.x),this.busTopSprite.y + toRes(this.busTopSprite.height+30), "solana").setScale(toRes(0.8)).setOrigin(0.5,0);
         this.add(this.solLogo);

         this.solBusInside = this.scene.add.image(toRes(this.busTopSprite.x-5),this.busTopSprite.y + toRes(this.busTopSprite.height-5), "solBusIn").setScale(toRes(1.18)).setOrigin(0.5);
         this.solBusInside.visible = false;
         this.add(this.solBusInside);

         this.busBottomSprite.setInteractive({useHandCursor:true});

         this.busBottomSprite.on("pointerover", (pointer, gameObject) => {
           this.solBusInside.visible = true;
		});
		this.busBottomSprite.on("pointerout", (pointer, gameObject) => {
           this.solBusInside.visible = false;
            
		});


      }

  









}