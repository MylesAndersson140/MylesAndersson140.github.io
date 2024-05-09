class OneDMovement extends Phaser.Scene {
    // Class variable definitions -- these are all "undefined" to start
    graphics;
    curve;
    path;

    constructor(){
        super("sceneName");
        this.my = {sprite: {}};

        this.playerX = 400;
        this.playerY = 571;
        this.waveCount = 0;
        this.alienColors = ["enemyone", "enemyone", "enemytwo", "enemytwo", "enemythree", "enemythree", "enemyfour", "enemyfour", "enemyfive", "enemyfive"];
        this.alienHealth = {
            "enemyone": 1,
            "enemytwo": 2,
            "enemythree": 3,
            "enemyfour": 4,
            "enemyfive": 5
        };
        this.alienTimer = 0;
    }

    preload() {
        this.load.setPath("./assets/");                        // Set load path
        this.load.image("carrot", "carrot.png");             // x marks the spot
        this.load.image("player", "bunny1_ready.png"); 
        this.load.image("enemyone", "alienGreen.png");
        this.load.image("enemyone_bullet", "alienGreen_badge1.png");
        this.load.image("enemytwo", "alienBlue.png");
        this.load.image("enemytwo_bullet", "alienBlue_badge1.png"); 
        this.load.image("enemythree", "alienPink.png");
        this.load.image("enemythree_bullet", "alienPink_badge1.png");  
        this.load.image("enemyfour", "alienYellow.png");
        this.load.image("enemyfour_bullet", "alienYellow_badge1.png");  
        this.load.image("enemyfive", "alienBeige.png");
        this.load.image("enemyfive_bullet", "alienBeige_badge1.png");
        this.load.image("enemyone_ufo", "shipGreen.png");  

        this.load.audio('shootSound', 'impactWood_medium_000.ogg');
        this.load.audio('enemyHitSound', 'impactMetal_heavy_003.ogg');
    }

    create() {
        this.gameStarted = false;
        this.gameFinished = false;

        let my = this.my;

        this.createStartScreen();

        my.sprite.player = this.add.sprite(this.playerX, this.playerY, "player");
        my.sprite.player.setScale(0.3);
        
        my.carrots = this.add.group();
        my.aliens = this.add.group();
        this.enemyBullets = this.add.group();
        this.createWave();

        this.playerHealth = 10;
        this.playerHealthText = this.add.text(10, 10, 'Health: ' + this.playerHealth, { fontSize: '16px', fill: '#ffff'});
        this.playerScore = 0;
        this.playerScoreText = this.add.text(10, 30, 'Score: ' + this.playerScore, { fontSize: '16px', fill: '#ffff'});

        this.shootSound = this.sound.add('shootSound');
        this.enemyHitSound = this.sound.add('enemyHitSound');
    }

    createStartScreen() {
        this.startText = this.add.text(400, 300, "Press F to start game", { fontSize: "32px", fill: "#fff" });
        this.ControlText = this.add.text(400, 250, "Space to shoot, A/D to move left and right.", { fontSize: "20px", fill: "#fff" });
        this.startText.setOrigin(0.5);
        this.ControlText.setOrigin(0.5);

    }

    createEndScreen() {
        if (this.playerHealth <= 0){
            this.endText = this.add.text(400, 250, "Game Over! The aliens have invaded the farm.", { fontSize: "24px", fill: "#ffff"});
            this.playerScoreText = this.add.text(400, 300, 'Score: ' + this.playerScore, { fontSize: '20px', fill: '#ffff'});
        } else {
            this.endText = this.add.text(400, 250, "Congratulations! You saved the world!", { fontSize: "32px", fill: "#fff" });
            this.playerScoreText = this.add.text(400, 300, 'Score: ' + this.playerScore, { fontSize: '20px', fill: '#ffff'});
        }
        this.endText.setOrigin(0.5);
        this.playerScoreText.setOrigin(0.5);
        this.restartText = this.add.text(400, 350, "Press R to restart", { fontSize: "24px", fill: "#fff" });
        this.restartText.setOrigin(0.5);
    }

    createWave(){
        const availableEnemies = [];
        if (this.waveCount < 2) {
            availableEnemies.push("enemyone");
        } else if (this.waveCount < 4) {
            availableEnemies.push("enemyone", "enemytwo");
        } else if (this.waveCount < 6) {
            availableEnemies.push("enemyone", "enemytwo", "enemythree");
        } else if (this.waveCount < 8) {
            availableEnemies.push("enemyone", "enemytwo", "enemythree", "enemyfour");
        } else if (this.waveCount < 10){
            availableEnemies.push("enemyone", "enemytwo", "enemythree", "enemyfour", "enemyfive");
        } else if (this.waveCount === 10) {
            this.createUFO();
            return;
        }

        //const alienColor = this.alienColors[this.waveCount];
        for (let i = 0; i < 1; i++){
            for (let j = 0; j < 10; j++){
                const randomEnemy = Phaser.Math.RND.pick(availableEnemies);
                const alien = this.add.sprite(100+j*60, 50+i*50, randomEnemy);
                alien.setScale(0.3);
                alien.health = this.alienHealth[randomEnemy];
                alien.initalX = alien.x;
                //alien.shootTimer = 0;
                alien.hasShot = false;
                this.my.aliens.add(alien);
            }
        }
        this.waveCount++;
    }

    createUFO(){
        this.ufo = this.add.sprite(400,100,"enemyone_ufo");
        this.ufo.setScale(0.5);
        this.ufo.health = 20;
        this.ufo.initalX = this.ufo.x;
        this.ufo.direction = 1;
        this.ufo.spawnTimer = 0;

        this.waveCount++;
    }

    shootEnemyBullet(enemy) {
        const bulletType = enemy.texture.key + '_bullet';
        const bullet = this.add.sprite(enemy.x, enemy.y, bulletType);
        bullet.setScale(0.3);
        bullet.angle = 90;
        this.enemyBullets.add(bullet);
    }

    resetGame() {
        this.waveCount = 0;
        this.alienTimer = 0;
        this.my.aliens.clear(true, true);
        this.my.carrots.clear(true, true);
        if (this.ufo) {
            this.ufo.destroy();
        }
        this.endText.visible = false;
        this.restartText.visible = false;
        this.createWave();
    }

    update() {
        let my = this.my;

        if (!this.gameStarted) {
            let F = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);
            if (Phaser.Input.Keyboard.JustDown(F)) {
                this.gameStarted = true;
                this.startText.destroy();
                this.ControlText.destroy();
                this.resetGame();
                this.createWave();
            }
            return;
        }

        if (this.gameEnded) {
            let R = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
            if (Phaser.Input.Keyboard.JustDown(R)) {
                this.scene.restart();
                this.gameEnded = false;
                this.gameStarted = true;
            }
            return;
        }


        let A = (this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A));
        if (A.isDown) {
            if(my.sprite.player.x > 5){
                my.sprite.player.x -= 10;
            }
            
        } else if (Phaser.Input.Keyboard.JustUp(A)) {
            return;
        }

        let D = (this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D));
        if (D.isDown) {
            if (my.sprite.player.x < 795){
                my.sprite.player.x += 10;
            }
        } else if (Phaser.Input.Keyboard.JustUp(D)) {
            return;
        }
        let spacebar = (this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE));

        if(Phaser.Input.Keyboard.JustDown(spacebar)){
            let carrot = this.add.sprite(my.sprite.player.x, my.sprite.player.y, "carrot");
            carrot.setScale(0.3);
            carrot.angle+=225;
            my.carrots.add(carrot);

            this.shootSound.play();
        }
        my.carrots.children.iterate((carrot) => {
            carrot.y -= 10;
            my.aliens.children.iterate((alien) => {
                if (Phaser.Geom.Intersects.RectangleToRectangle(carrot.getBounds(), alien.getBounds())) {
                    carrot.destroy();
                    this.enemyHitSound.play();
                    alien.health--;
                    if (alien.health <= 0){
                        alien.destroy();
                        this.playerScore += 10;
                        this.playerScoreText.setText('Score: ' + this.playerScore);
                    }
                }
            });
        });

        this.alienTimer += 0.07;
        my.aliens.children.iterate((alien) => {
            alien.y += 2; // Adjust the speed of the aliens approaching the player
            if (alien.initalX === undefined){
                alien.initalX = alien.x;
            }
            alien.x = alien.initalX + Math.sin(this.alienTimer) * 50;

            if (!alien.hasShot) {
                this.shootEnemyBullet(alien);
                alien.hasShot = true; // Set the flag to indicate that the alien has shot
            }
        }, this);

        this.enemyBullets.children.iterate((bullet) => {
            bullet.y += 10;
        
            // Remove bullets that go off-screen
        }, this);
      
        if (my.aliens.countActive() == 0 && this.waveCount <= 10) {
            this.createWave();
        }

        if (this.waveCount === 11 && this.ufo) {
            this.ufo.x += this.ufo.direction * 2;
        
            if (this.ufo.x <= 100 || this.ufo.x >= 700) {
              this.ufo.direction *= -1;
            }
        
            this.ufo.y += 0.05;
        
            this.ufo.spawnTimer += this.sys.game.loop.delta;
        
            if (this.ufo.spawnTimer >= 3000 && this.ufo.active) {
              const enemy = this.add.sprite(this.ufo.x, this.ufo.y, "enemyone");
              enemy.setScale(0.3);
              enemy.health = this.alienHealth["enemyone"];
              enemy.initialX = enemy.x;
              this.my.aliens.add(enemy);
              this.ufo.spawnTimer = 0;
            }

            this.my.carrots.children.iterate((carrot) => {
                if (Phaser.Geom.Intersects.RectangleToRectangle(carrot.getBounds(), this.ufo.getBounds())) {
                    carrot.destroy();
                    this.enemyHitSound.play();
                    this.ufo.health--;
                    if (this.ufo.health <= 0) {
                        this.ufo.destroy();
                        this.playerScore += 100;
                        this.playerScoreText.setText('Score: ' + this.playerScore);
                        this.gameEnded = true;
                        this.createEndScreen();
                    }
                }
            }, this);
        }
        
        this.my.aliens.children.iterate((alien) => {
            if (alien.y >= 600) {
                alien.destroy();
                this.playerHealth--;
                this.playerHealthText.setText('Health: ' + this.playerHealth);

                if (this.playerHealth <= 0) {
                    // Game over logic
                    this.gameEnded = true;
                    this.createEndScreen();
                }
            }
        }, this);

        this.enemyBullets.children.iterate((bullet) => {
            if (Phaser.Geom.Intersects.RectangleToRectangle(bullet.getBounds(), my.sprite.player.getBounds())) {
                bullet.destroy();
                this.playerHealth--;
                this.playerHealthText.setText('Health: ' + this.playerHealth);
        
                if (this.playerHealth <= 0) {
                    this.gameEnded = true;
                    this.createEndScreen();
                }
            }
        }, this);
    
    }

}