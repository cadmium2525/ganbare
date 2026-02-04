/**
 * MiniGameBase.js
 * 全ミニゲームの親クラス
 * 共通の初期化処理、終了処理などを管理
 */
class MiniGameBase extends Phaser.Scene {
    constructor(key) {
        super({ key: key });
        this.gameManager = GameManager.getInstance();
    }

    init(data) {
        // 前のシーンから引き継ぐデータがあればここで処理
        this.retryMode = data ? data.retry : false;
    }

    create() {
        // 背景の表示（全ゲーム共通）
        // 背景の表示（全ゲーム共通）
        // 画面サイズに合わせてリサイズ
        this.add.image(Constants.CENTER_X, Constants.CENTER_Y, Constants.ASSETS.BG)
            .setDisplaySize(Constants.WIDTH, Constants.HEIGHT);

        // ライフ表示
        this.createLifeDisplay();

        // ヘッダー仕切り線
        // ライフの下に表示
        this.add.image(Constants.CENTER_X, 100, 'line')
            .setDisplaySize(Constants.WIDTH, 300)
            .setDepth(100);

        // スコア表示 (右上)
        const scoreText = `Score: ${this.gameManager.score}`;
        this.add.text(Constants.WIDTH - 20, 40, scoreText, {
            font: '30px Arial',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(1, 0.5).setDepth(10);

        // 共通コンポーネントの初期化
        this.inputManager = new InputManager(this);
        this.soundManager = SoundManager.getInstance(this);

        // ゲーム固有の初期化（サブクラスで実装）
        this._create();
    }

    createLifeDisplay() {
        const startX = 50; // 左上の開始位置
        const startY = 50;
        const spacing = 70; // 間隔をさらに広げる

        for (let i = 0; i < this.gameManager.lives; i++) {
            this.add.image(startX + (i * spacing), startY, Constants.ASSETS.LIFE)
                .setScale(0.2) // 0.3の80%程度
                .setDepth(10);
        }
    }

    /**
     * サブクラスで実装すべきメインロジック開始
     */
    _create() {
        console.warn('MiniGameBase: _create() should be overridden');
    }

    /**
     * ミニゲーム成功時の処理
     */
    gameWin() {
        this.inputManager.disable();
        this.gameManager.addScore();

        // 少し待ってからリザルトへ
        this.time.delayedCall(1500, () => {
            this.scene.start(Constants.SCENES.RESULT, { success: true, sceneKey: this.scene.key });
        });
    }

    /**
     * ミニゲーム失敗時の処理
     */
    gameLose() {
        this.inputManager.disable();
        const isGameOver = this.gameManager.decreaseLife();

        this.time.delayedCall(1500, () => {
            if (isGameOver) {
                this.scene.start(Constants.SCENES.GAMEOVER, { score: this.gameManager.score });
            } else {
                this.scene.start(Constants.SCENES.RESULT, { success: false, sceneKey: this.scene.key });
            }
        });
    }
}
