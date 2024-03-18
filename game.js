let config = {
    type: Phaser.AUTO,
    width: 1920,
    height: 1080,
    playerSpeed: 500,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 200 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

let game = new Phaser.Game(config);
let worldWidth = config.width * 6;
let platforms;
let score = 0;
let scoreText;
let lifeText;


function preload() {
    this.load.image('sky', 'assets/sky.jpg');
    this.load.image('ground', 'assets/ground.jpg');
    this.load.image('skyGround', 'assets/2.png')
    this.load.image('skyGroundStart', 'assets/1.png')
    this.load.image('skyGroundEnd', 'assets/3.png')
    this.load.image('star', 'assets/star.png');
    this.load.image('bomb', 'assets/bomb.png');
    this.load.image('bush', 'assets/bush.webp')
    this.load.image('tree', 'assets/tree.png')
    this.load.image('stone', 'assets/Stone.webp')

    this.load.spritesheet('dude',
        'assets/dude.png',
        { frameWidth: 32, frameHeight: 48 });





    // гравець
    this.load.spritesheet('dude',
        'assets/dude.png',
        { frameWidth: 32, frameHeight: 48 }
    );
}

function create() {
    // тло на всю ширину екрану
    this.add.tileSprite(0, 0, 10000, 1080, "sky")
        .setOrigin(0, 0)
        .setScale(2)
        .setDepth(0);

    platforms = this.physics.add.staticGroup();

    // Земля на всю ширину екрану
    for (var x = 0; x < worldWidth; x = x + 100) {
        platforms.create(x, 1080 - 128, 'ground')
            .setScale(1)
            .setOrigin(0, 0)
            .setBounce(1)
            .refreshBody();
    }

    // платформи на всю ширину екрану
    for (var x = 0; x < worldWidth; x = x + Phaser.Math.Between(400, 500)) {
        var y = Phaser.Math.Between(300, 900)

        platforms.create(x, y, 'skyGroundStart')
        .setDepth(11);

        var i;
        for (i = 1; i < Phaser.Math.Between(0, 5); i++) {
            platforms.create(x + 128 * i, y, 'skyGround')
            .setDepth(11);
        }

        platforms.create(x + 128 * i, y, 'skyGroundEnd')
        .setDepth(11);
    }

    box = this.physics.add.staticGroup();
    // Додавання дерев випадковим чином на всю ширину екрану
    for (var x = 0; x < worldWidth; x = x + Phaser.Math.FloatBetween(500, 1500)) {
        var y = 952;
        box.create(x, y, 'tree')
            .setScale(Phaser.Math.FloatBetween(0.1, 0.5))
            .setOrigin(0, 1)
            .setDepth(Phaser.Math.FloatBetween(0, 10))
            .refreshBody();
    }

    bush = this.physics.add.staticGroup();
    // Додавання кущів випадковим чином на всю ширину екрану
    for (var x = 0; x < worldWidth; x = x + Phaser.Math.FloatBetween(300, 500)) {
        var y = 952;
        bush.create(x, y, 'bush')
            .setScale(Phaser.Math.FloatBetween(0.1, 0.2))
            .setOrigin(0, 1).setDepth(Phaser.Math.FloatBetween(0, 10))
            .refreshBody();
    }

    rock = this.physics.add.staticGroup();
    // Додавання каменів випадковим чином на всю ширину екрану
    for (var x = 0; x < worldWidth; x = x + Phaser.Math.FloatBetween(300, 700)) {
        var y = 952;
        rock.create(x, y, 'stone')
            .setScale(Phaser.Math.FloatBetween(0.1, 0.2))
            .setOrigin(0, 1)
            .setDepth(Phaser.Math.FloatBetween(0, 10))
            .refreshBody();
    }

    // про гравця
    player = this.physics.add.sprite(100, 450, 'dude')
        .setDepth(11)
        .setBounce(0.2)
        .setCollideWorldBounds(false);

    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'turn',
        frames: [{ key: 'dude', frame: 4 }],
        frameRate: 20
    });

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1
    });

    // коллайдер гравця та платформ
    this.physics.add.collider(player, platforms);

    //  задання управління
    cursors = this.input.keyboard.createCursorKeys();

    // зірки
    stars = this.physics.add.group({
        key: 'star',
        repeat: worldWidth / 100,
        setXY: { x: 12, y: 0, stepX: 100 }
    
    });

    stars.children.iterate(function (child) {

        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
        
    });


    this.physics.add.collider(stars, platforms);
    this.physics.add.overlap(player, stars, collectStar, null, this);

    //  рахунок
    scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#000' })
        .setOrigin(0, 0)
        .setScrollFactor(0);


        //фізика та колайдери
    bombs = this.physics.add.group();
    this.physics.add.collider(bombs, platforms);
    this.physics.add.collider(player, bombs, hitBomb, null, this);
    this.physics.add.collider(platforms);
    this.physics.add.overlap(player, null, this);
    this.cameras.main.setBounds(0, 0, worldWidth, 1080);
    this.physics.world.setBounds(0, 0, worldWidth, 1080);
    this.cameras.main.startFollow(player);
}

function update() {
    // управління
    if (cursors.left.isDown) {
        player.setVelocityX(-config.playerSpeed);

        player.anims.play('left', true);
    }
    else if (cursors.right.isDown) {
        player.setVelocityX(config.playerSpeed);

        player.anims.play('right', true);
    }
    else {
        player.setVelocityX(0);

        player.anims.play('turn');
    }

    if (cursors.up.isDown && player.body.touching.down) {
        player.setVelocityY(-330);
    }
}

//функція збір зірочок
function collectStar(player, star) {
    star.disableBody(true, true);

    score += 10;
    scoreText.setText('Score: ' + score);

    var x = Phaser.Math.Between(0, config.width);
    var y = Phaser.Math.Between(0, 680);
    var bomb = bombs.create(x, y, 'bomb');
    bomb.setBounce(1);
    bomb.setCollideWorldBounds(true);
    bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);

    if (stars.countActive(true) === 0) {
        stars.children.iterate(function (child) {
            child.enableBody(true, child.x, 0, true, true);
            child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
        });

    }
}



// опис бомбочок
function hitBomb(player, bomb) {
    life -= 1;
    bomb.disableBody(true, true);

    if (life === 0) {
        this.physics.pause();

        player.setTint(0xff0000);

        player.anims.play('turn');

        gameOver = true;

       
    }


    resetyButton.on('pointerdown', function() {
        self.physics.resume();
        player.disableBody(true, true);
        player = self.physics.add.sprite(100, 450, 'dude');
        player.setBounce(0, 2);
        player.setCollideWorldBounds(true);
        gameOver = false;
        self.scene.restart();
        score = 0;
        

    }
    
    
    
    )
}