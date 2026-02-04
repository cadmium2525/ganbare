/**
 * Constants.js
 * ゲーム全体で使用する定数定義
 */

const Constants = {
    // 画面サイズ
    WIDTH: 750,
    HEIGHT: 1334,
    CENTER_X: 375,
    CENTER_Y: 667,

    // ゲーム設定
    MAX_LIVES: 3,

    // シーンキー
    SCENES: {
        TITLE: 'TitleScene',
        RESULT: 'ResultScene',
        GAMEOVER: 'GameOverScene',
        QUICK_CANNON: 'QuickCannonScene'
    },

    // アセットキー（共通）
    ASSETS: {
        BG: 'bg',
        LIFE: 'life',
        GAMEOVER: 'gameover_img'
    },

    // フォントスタイル（共通）
    FONTS: {
        DEFAULT: { font: '40px Arial', fill: '#ffffff', stroke: '#000000', strokeThickness: 4 },
        TITLE: { font: '60px Arial', fill: '#ffffff', stroke: '#000000', strokeThickness: 6 }
    }
};
