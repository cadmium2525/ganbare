/**
 * TitleScene.js
 * タイトル画面
 */

class TitleScene extends Phaser.Scene {
    constructor() {
        super({ key: 'TitleScene' });
    }

    create() {
        const { WIDTH, HEIGHT } = Constants.GAME;

        // 背景（黒）を念のため描画
        this.add.rectangle(0, 0, WIDTH, HEIGHT, 0x000000).setOrigin(0);

        // 即座にゲーム開始
        if (window.gameManager) {
            window.gameManager.startGame();
        }
    }
}

// グローバルに公開
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TitleScene;
}
