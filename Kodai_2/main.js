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
        //ゲームが開始状態なら
        if(this.paddle.isStart){
        this.ball.setVelocity(this.ballSpeedX,this.ballSpeedY);
        this.paddle.isStart=false;
        }
    },this);
    
    // ブロック作成
    this.createBlocks();
    
    // ライフのテキスト表示
    this.pointtext=this.add.text(30,20,'point'+this.point,{
       font: '20px Open Sans',
       fill: 'ff0000'
    });
    
};

mainScene.update = function() {
    // ボールがシーンの最下部に到達した
    if(this.ball.y>=this.game.config.height-this.ball.width/2){
    this.failToHit();
    }
    
    // キーボードのカーソルオブジェクトを取得
    var cursors = this.input.keyboard.createCursorKeys();
    var x = 0;
    //右カーソルをクリックすると
    if(cursors.right.isDown){
    x=this.paddle.x+this.paddleSpeed;
    x=this.paddle.x=Phaser.Math.Clamp(x,52,748);
    
    }
    if(cursors.left.isDown){
    x=this.paddle.x-this.paddleSpeed;
    this.paddle.x=Phaser.Math.Clamp(x,52,748);
    }
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
    this.ballSpeedY = -200;
    
    // ライフ
    this.life = 1;
    this.point=0;
    
    
};

mainScene.createBall = function() {
    // ボール作成
    this.ball=this.physics.add.image(400,500,'ball3');
    this.ball.setDisplaySize(22,22);
    this.ball.setCollideWorldBounds(true);
    this.ball.setBounce(1);
    
};

mainScene.createPaddle = function() {
     // パドル作成
     this.paddle=this.physics.add.image(400,550,'paddle1');
     this.paddle.setDisplaySize(104,24);
     this.paddle.setImmovable();
     this.paddle.isStart=true;
     this.physics.add.collider(this.paddle,this.ball,this.hitPaddle,null,this);
    
}

mainScene.hitPaddle = function (paddle, ball) {
    // ボールにX方向の角度を設定
    var diff=0;
    if(ball.x<paddle.x){
    diff=paddle.x-ball.x;
    ball.setVelocityX(-10*diff);
    }
    else if(ball.x>paddle.x){
    diff=ball.x-paddle.x;
    ball.setVelocityX(10*diff);
    }
  else{
     ball.setVelocityX(0);
  }
    
};

mainScene.createBlocks = function() {
    // 横10列、縦6行並べる
    var t=50;
    var n=40
    var blockColors=['red1','green1','yellow1','silver1','blue1','purple1',];
    this.blocks=this.physics.add.staticGroup();
   
    for(var i=0;i<11;i++){
        if(i<4){
            for(var j=5-(i);j<=5-(i)+(i+1)*2;j++){
                var color='yellow1';
                if((i+j)%2==0)
                {
                    var color='red1';
                }
                if((i+j)%4==0)
                {
                   color='green1';
                }
                var m1=0;
                if(j==5-i||j==5-i+(i+1)*2||(i==0&&j==5-i+1))
                {
                var color ='brown1';
                m1=1;
                }
                var block=this.blocks.create(80+j*t,0+i*n,color);
                if(m1==1)
                {block.hp=2;}
                else
                {block.hp=1}
                block.setOrigin(0,0);
                block.setDisplaySize(t,n);
                block.refreshBody();
                
            }
        }
        else if(i<=7){
                for(var j=2;j<=10;j++){
                var color='yellow1';
                if((i+j)%2==0)
                {
                    var color='red1';
                }
                if((i+j)%4==0)
                color='green1';
                var m=0;
                if(j==2||j==10)
                {
                color='brown1';
                m=1;
                }
                
                var block=this.blocks.create(80+j*t,0+i*n,color);
                if(m==1)
                {block.hp=2;}
                else
                {block.hp=1;}
                block.setOrigin(0,0);
                block.setDisplaySize(t,n);
                block.refreshBody();
                
            } 
            
        }
        else{
       
            for(var j=i-5;j<=13-(i-5)-1;j++){
                var color='yellow1';
                if((i+j)%2==0)
                {
                    var color='red1';
                }
                if((i+j)%4==0)
                {
                  color='green1';
                }
                var m2=0;
                if(j==i-5||j==13-(i-5)-1||(i==10&&j==i-5+1))
                {
                color='brown1';
                m2=1;
                }
                var block=this.blocks.create(80+j*t,0+i*n,color);
                if(m2==1)
                {block.hp=2;}
                else
                {block.hp=1;}
                block.setOrigin(0,0);
                block.setDisplaySize(t,n);
                block.refreshBody();
                
            }    
        }
    }
    this.physics.add.collider(this.ball,this.blocks,this.hitBlock,null,this);
};

mainScene.hitBlock = function (ball, block) {
    // 衝突したブロックを削除
   
   block.hp--;
 if(block.hp==0)
   { this.point++;block.destroy();}
    this.pointtext.text=('point'+this.point);
   
    
    // ブロックの残りを判定
    if (this.blocks.countActive() == 0) {
        // ブロックがなくなると、0.5秒後にゲームクリア
        this.time.addEvent({
            duration: 500,
            callback: this.gameClear,
            loop: false,
            callbackScope: this,
        });
    }
};

mainScene.gameClear = function() {
    // ゲームクリア
    alert("食べ切りました");
    // スタートシーンに移動
    this.scene.start("startScene");
};

mainScene.failToHit =  function () {
    // ボールを打ち返すことに失敗
    this.ball.setVelocity(0);
    this.paddle.isStart = true;
    // ライフを減らす
    this.life--;
    
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
