/**
 * GameOverScene.js
 * ゲームオーバー画面
 */
class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: Constants.SCENES.GAMEOVER });
    }

    init(data) {
        this.finalScore = data.score || 0;
    }

    create() {
        // 背景（専用画像があればそれを使う）
        this.add.image(Constants.CENTER_X, Constants.CENTER_Y, Constants.ASSETS.GAMEOVER);

        const textY = Constants.HEIGHT * 0.7; // 画面下寄りに表示

        // スコア表示
        this.add.text(Constants.CENTER_X, textY, `Score: ${this.finalScore}`, Constants.FONTS.TITLE)
            .setOrigin(0.5);

        // タイトルへ戻るボタン
        const btnText = this.add.text(Constants.CENTER_X, textY + 150, 'Return to Title', Constants.FONTS.DEFAULT);
        btnText.setOrigin(0.5);
        btnText.setInteractive();

        btnText.on('pointerdown', () => {
            this.scene.start(Constants.SCENES.TITLE);
        });
    }
}
