/**
 * main.js
 * Phaserゲーム設定とエントリーポイント
 */

// Phaser設定
const config = {
    type: Phaser.AUTO,
    width: Constants.GAME.WIDTH,
    height: Constants.GAME.HEIGHT,
    backgroundColor: Constants.GAME.BACKGROUND_COLOR,
    parent: 'game-container',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [
        TitleScene,
        // GameManagerはシーンではないのでここには含めない
        ResultScene,
        GameOverScene, // ゲームオーバーシーン追加
        // QuickCannonScene は GameManager.registerMiniGame で追加されるため削除
    ],
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false,
        },
    },
};

// Phaserゲームインスタンス作成
const game = new Phaser.Game(config);

// GameManager初期化
const gameManager = new GameManager(game);

// ResultSceneはconfigで追加済みなので手動追加不要
// game.scene.add('ResultScene', ResultScene, false);

// ミニゲーム登録
gameManager.registerMiniGame('QuickCannonScene', QuickCannonScene);

// TODO: 将来的に他のミニゲームを追加
// gameManager.registerMiniGame('AnotherMiniGame', AnotherMiniGameScene);

// ゲーム開始
window.addEventListener('load', () => {
    console.log('Game loaded. Starting...');
    gameManager.startGame();
});
