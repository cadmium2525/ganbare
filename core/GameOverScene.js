/**
 * GameOverScene.js
 * ゲームオーバー画面
 */

class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }

    create() {
        const { WIDTH, HEIGHT } = Constants.GAME;

        // 背景（黒）
        this.add.rectangle(0, 0, WIDTH, HEIGHT, 0x000000).setOrigin(0);

        // ゲームオーバー画像
        // 注意: QuickCannonAssetsでロードされていることを前提としているが、
        // 汎用化するならここでロードするかCoreでロードすべき。
        // 現状はQuickCannonフローの一部として動作するため、ロード済みのアセットを使用。
        if (this.textures.exists('gameover')) {
            const gameOverImage = this.add.image(WIDTH / 2, HEIGHT / 2, 'gameover');

            // 画面全体に表示（カバー）
            const scaleX = WIDTH / gameOverImage.width;
            const scaleY = HEIGHT / gameOverImage.height;
            const scale = Math.max(scaleX, scaleY);
            gameOverImage.setScale(scale);
        } else {
            // アセットがない場合のフォールバックテキスト
            this.add.text(WIDTH / 2, HEIGHT / 2, 'GAME OVER', {
                fontSize: '64px',
                color: '#ff0000',
                fontFamily: Constants.FONTS.MAIN,
                fontStyle: 'bold',
            }).setOrigin(0.5);
        }

        // クリックでタイトルへ（またはリスタート）
        this.input.once('pointerdown', () => {
            // GameManager経由でリセットしてスタート
            if (window.gameManager) {
                window.gameManager.reset();
                window.gameManager.startGame();
            }
        });
    }
}

// グローバルに公開
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameOverScene;
}
