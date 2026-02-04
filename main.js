/**
 * main.js
 * ゲームのメインエントリーポイント
 */

// ゲーム設定
const config = {
    type: Phaser.AUTO,
    width: 750,
    height: 1334,
    backgroundColor: '#2d5016', // 黒板のような緑色
    parent: 'game-container',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    // ここでシーンを登録（読み込み順序に注意）
    // TitleScene, ResultScene, GameOverScene, QuickCannonSceneなどは
    // 後ほど各ファイルを作成してクラス定義を行う必要があります。
    scene: [
        TitleScene,
        ResultScene,
        GameOverScene,
        QuickCannonScene
    ]
};

// ゲームインスタンスの作成
const game = new Phaser.Game(config);
