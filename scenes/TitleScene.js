/**
 * TitleScene.js
 * タイトル画面
 * 共通アセットのロードもここで行う（簡易的）
 */
class TitleScene extends Phaser.Scene {
    constructor() {
        super({ key: Constants.SCENES.TITLE });
    }

    preload() {
        // 共通アセットのロード
        this.load.image(Constants.ASSETS.BG, 'assets/bg.png');
        this.load.image(Constants.ASSETS.LIFE, 'assets/life/life.png');
        this.load.image(Constants.ASSETS.GAMEOVER, 'assets/gameover/gameover.png');
        this.load.image('line', 'assets/line.png');
        this.load.image('title', 'assets/title.png');
        // キャラクター画像
        this.load.image('gin01', 'assets/gin001.png');
        this.load.image('gin02', 'assets/gin002.png');
        this.load.image('gin03', 'assets/gin003.png');
        // BGM
        this.load.audio('bgm_title', 'assets/title.mp3');
    }

    create() {
        // BGM再生
        SoundManager.getInstance(this).playBgm('bgm_title');

        // 背景
        this.add.image(Constants.CENTER_X, Constants.CENTER_Y, Constants.ASSETS.BG)
            .setDisplaySize(Constants.WIDTH, Constants.HEIGHT);

        // タイトル画像 (Y座標を中央よりやや高めに設定)
        this.add.image(Constants.CENTER_X, Constants.CENTER_Y - 250, 'title').setScale(0.9);

        // Tap to Start
        const startText = this.add.text(Constants.CENTER_X, Constants.CENTER_Y + 70, 'Tap to Start', Constants.FONTS.DEFAULT);
        startText.setOrigin(0.5);

        // 点滅アニメーション
        this.tweens.add({
            targets: startText,
            alpha: 0,
            duration: 800,
            ease: 'Power2',
            yoyo: true,
            loop: -1
        });

        // 画面全体を覆うクリックゾーン（ゲーム開始用）
        const clickZone = this.add.zone(Constants.CENTER_X, Constants.CENTER_Y, Constants.WIDTH, Constants.HEIGHT);
        clickZone.setInteractive();
        clickZone.once('pointerdown', () => {
            this.startGame();
        });

        // 音量設定ボタン（右上に配置）
        const sm = SoundManager.getInstance(this);
        const volumeText = this.add.text(Constants.WIDTH - 20, 50, `Vol: ${sm.getVolumeLabel()}`, {
            font: '32px Arial',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        });
        volumeText.setOrigin(1, 0); // 右上基準
        volumeText.setInteractive();

        volumeText.on('pointerdown', () => {
            sm.cycleVolume();
            volumeText.setText(`Vol: ${sm.getVolumeLabel()}`);
        });

        // ギンちゃんのアニメーションと移動
        this.createGinAnimation();
    }

    createGinAnimation() {
        // アニメーション作成
        if (!this.anims.exists('gin_walk')) {
            this.anims.create({
                key: 'gin_walk',
                frames: [
                    { key: 'gin01' },
                    { key: 'gin02' },
                    { key: 'gin03' },
                    { key: 'gin02' }
                ],
                frameRate: 6,
                repeat: -1
            });
        }

        // スプライト作成 (画面下部、左端からスタート)
        // Y座標は少し低め (Constants.HEIGHT - 50 あたり)
        const gin = this.add.sprite(-100, Constants.HEIGHT - 400, 'gin01');
        gin.play('gin_walk');
        gin.setScale(0.8); // 少し小さく調整

        // 左右移動のTween
        // 画面左外(-100)から右外(WIDTH+100)まで往復させると、
        // 画面内を通過する形になるが、ユーザーの要望は「右端にいったら次は左に」なので、
        // 画面端(50)〜(WIDTH-50)くらいを行き来させるのが良さそう。

        // 初期位置セット
        gin.x = 100;

        this.tweens.add({
            targets: gin,
            x: Constants.WIDTH - 100,
            duration: 4000, // 4秒かけて移動
            ease: 'Linear',
            yoyo: true,
            repeat: -1
        });

        // 揺れ（回転）Tween
        this.tweens.add({
            targets: gin,
            angle: { from: -5, to: 5 },
            duration: 200,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    startGame() {
        // BGM停止
        SoundManager.getInstance(this).stopBgm();

        // ゲームマネージャーのリセット
        GameManager.getInstance().resetGame();

        // 最初のミニゲームへ遷移
        const nextScene = GameManager.getInstance().getNextMiniGame();
        this.scene.start(nextScene, { retry: false });
    }
}
