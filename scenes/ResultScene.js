/**
 * ResultScene.js
 * ミニゲームの結果表示画面
 */
class ResultScene extends Phaser.Scene {
    constructor() {
        super({ key: Constants.SCENES.RESULT });
    }

    init(data) {
        this.success = data.success;
        this.lastSceneKey = data.sceneKey; // リトライ用
    }

    create() {
        this.add.image(Constants.CENTER_X, Constants.CENTER_Y, Constants.ASSETS.BG)
            .setDisplaySize(Constants.WIDTH, Constants.HEIGHT);

        const message = this.success ? 'SUCCESS!' : 'FAILURE...';
        const color = this.success ? '#00ff00' : '#ff0000';

        const resultText = this.add.text(Constants.CENTER_X, Constants.CENTER_Y - 100, message, {
            ...Constants.FONTS.TITLE,
            fill: color
        });
        resultText.setOrigin(0.5);

        // ボタン表示
        const btnTextStr = this.success ? 'Next Game' : 'Retry';
        const btnText = this.add.text(Constants.CENTER_X, Constants.CENTER_Y + 100, btnTextStr, Constants.FONTS.DEFAULT);
        btnText.setOrigin(0.5);

        // ボタンの背景（簡易的な矩形）
        const padding = 20;
        const rect = this.add.rectangle(
            btnText.x,
            btnText.y,
            btnText.width + padding * 2,
            btnText.height + padding * 2,
            0x000000,
            0.5
        );
        rect.setInteractive();

        // 深度調整（テキストを上に）
        btnText.setDepth(1);

        // ボタンアクション
        rect.on('pointerdown', () => {
            if (this.success) {
                // 成功時：次のゲームへ（現在はQuickCannonのみなので同じゲームへ）
                const nextScene = GameManager.getInstance().getNextMiniGame();
                this.scene.start(nextScene, { retry: false });
            } else {
                // 失敗時：リトライ
                // 失敗したゲームをもう一度
                this.scene.start(this.lastSceneKey, { retry: true });
            }
        });
    }
}
