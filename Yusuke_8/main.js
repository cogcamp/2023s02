var mainScene = new Phaser.Scene("mainScene");

mainScene.create = function() {
    // 初期設定を実行する
    this.config();
    
    // ボール作成
    this.createBall();
    
    // パドル作成
    this.createPaddle();
    
    // スペースキーのクリックでボール発射
    this.input.keyboard.on('keydown-SPACE',function(event){
        //ゲーム開始状態ならば
        if(this.paddle.isStart){
            //ボール発射
            this.ball.setVelocity(this.ballSpeedX,this.ballSpeedY);
            this.paddle.isStart = false;
        }
    },this);
    
    // ブロック作成
    this.createBlocks();
    
    // ライフのテキスト表示
    this.lifeText = this.add.text(30,20,'ライフ:'+this.life,{
        font: '20px Open Sans',
        fill: '#ff0000'
    });
        // タイムのテキスト表示
    this.TimeText = this.add.text(150,20,'残り時間:'+this.time2,{
        font: '20px Open Sans',
        fill: '#ff0000'
    });
    
            // スコアのテキスト表示
    this.ScoreText = this.add.text(300,20,'スコア:'+this.score2,{
        font: '20px Open Sans',
        fill: '#ff0000'
    });
    
    this.timeEvent = this.time.addEvent({
        delay: 1000,
        callback: this.countDown,
        loop: true,
        callbackScope: this
    });
    
};
 

mainScene.update = function() {
    // ボールがシーンの最下部に到達した
    if(this.ball.y>=this.game.config.height - this.ball.width/2){
        this.failToHit();
    }
    
    // キーボードのカーソルオブジェクトを取得
    var cursors = this.input.keyboard.createCursorKeys();
    var x = 0;
    //右カーソルをクリックすると
    if(cursors.right.isDown){
        x = this.paddle.x + this.paddleSpeed;
        this.paddle.x = Phaser.Math.Clamp(x,52,1300);
    }
    //左カーソルをクリックすると
    if(cursors.left.isDown){
        x = this.paddle.x-this.paddleSpeed;
        this.paddle.x = Phaser.Math.Clamp(x,52,1300);
    }
    //パドルの上にボールが乗っているなら
    if(this.paddle.isStart){
        this.ball.setPosition(this.paddle.x,500);
    }
};

mainScene.config = function() {
    // 背景色の設定
    this.cameras.main.setBackgroundColor('#cccccc');
    
    // パドルの移動速度
    this.paddleSpeed = 10;
    
    // ボール発射の加速度
    this.ballSpeedX = 0;
    this.ballSpeedY = -300;
    
    // ライフ
    this.life = 5;
    // タイム
    this.time2 = 180;
    //スコア
    this.score2=0
};

mainScene.createBall = function() {
    // ボール作成
    this.ball = this.physics.add.image(400,500,'ball1');
    this.ball.setDisplaySize(22,22);
    this.ball.setCollideWorldBounds(true);
    this.ball.setBounce(1);
};

mainScene.createPaddle = function() {
     // パドル作成
    this.paddle = this.physics.add.image(400,550,'paddle1');
    this.paddle.setDisplaySize(104,24);
    this.paddle.setImmovable();
    this.paddle.isStart = true;
    this.physics.add.collider(this.paddle,this.ball,this.hitPaddle,null,this);
};

mainScene.hitPaddle = function (paddle, ball) {
    // ボールにX方向の角度を設定
    var diff = 0;
    if(ball.x<paddle.x){
        //ボールがパドルの左側に衝突
        diff = paddle.x - ball.x;
        ball.setVelocityX(-10*diff);
    }else if (ball.x>paddle.x){
        //ボールがパドルの右側に衝突
        diff = ball.x - paddle.x;
        ball.setVelocityX(10*diff);
    }else{
        //ｘ方向の加速度はなし
            ball.setVelocityX(0);
    }
};

mainScene.createBlocks = function() {
    // 横20列、縦12行並べる
    //ブロックの色の配列
    var blockColors = ['red1','green1','yellow1','silver1','blue1','purple1','purple1','blue1'];
    //物理エンジン対象固定オブジェクトグループの作成
    this.blocks = this.physics.add.staticGroup();
    //縦に8行
    for(var i=0; i<8;i++){
        //横に15行
        for(var j = 0;j<18; j++){
            var color = blockColors[i];
            var block = this.blocks.create(80 + j*64,80 + i*32,color);
            block.setOrigin(0,0);
            block.setDisplaySize(64,32);
            block.refreshBody();
            if (i==0 && j==0) {
                block.type = 1;
            } else {
                block.type = 0;
            }
        }
    }
    this.physics.add.collider(this.ball,this.blocks,this.hitBlock,null,this);
};

mainScene.hitBlock = function (ball, block) {
    // 衝突したブロックを削除
    if (block.type != 1) {
        block.destroy();
    }
    // ブロックの残りを判定
    if (this.blocks.countActive() == 1) {
        // ブロックがなくなると、0.5秒後にゲームクリア
        this.time.addEvent({
            duration: 500,
            callback: this.gameClear,
            loop: false,
            callbackScope: this,
        });
    }
    if(this.blocks.countActive()==0){
        this.score2="perfect!!"
    }else{
        this.score2++
    }
     this.ScoreText.text = 'スコア：' + this.score2;
};

mainScene.gameClear = function() {
    // ゲームクリア
    alert("おめでとうございます");
    // スタートシーンに移動
    this.scene.start("startScene");
};

mainScene.failToHit =  function () {
    // ボールを打ち返すことに失敗
    this.ball.setVelocity(0);
    this.paddle.isStart = true;
    // ライフを減らす
    this.life--;
    this.lifeText.text = 'ライフ：' + this.life;
    // ライフが0になると
    if(this.life <= 0) {
        // 0.5秒後にゲームオーバー
        this.time.addEvent({
            duration: 500,
            callback: this.gameOver,
            loop: false,
            callbackScope: this,
        });
    }
};

mainScene.gameOver = function() {
    // ゲームオーバー
    alert("ゲームオーバー");
    // スタートシーンに移動
    this.scene.start("startScene");
};

mainScene.countDown = function() {
this.time2--
   this.TimeText.text = '残り時間：' + this.time2;
    // タイムが0になると
    if(this.time2 <= 0) {
        // 0.5秒後にゲームオーバー
        this.time.addEvent({
            duration: 500,
            callback: this.gameOver,
            loop: false,
            callbackScope: this,
        });
    }
};
