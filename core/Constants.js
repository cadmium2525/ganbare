/**
 * Constants.js
 * ゲーム全体で使用する定数を集約
 * 
 * 【重要】このファイルは基盤コードです。
 * 将来的に他のAIが勝手に修正しないことを前提としています。
 */

const Constants = {
    // ゲーム画面設定
    GAME: {
        WIDTH: 750,           // ゲーム画面の幅
        HEIGHT: 1334,         // ゲーム画面の高さ（iPhone X基準）
        BACKGROUND_COLOR: '#2d5016', // 黒板の緑色
    },

    // ミニゲーム共通設定
    MINIGAME: {
        DEFAULT_TIME_LIMIT: 10,      // デフォルト制限時間（秒）
        REACTION_GRACE_MS: 100,      // 判定猶予時間（ミリ秒）
        COUNTDOWN_DURATION: 3,       // カウントダウン時間（秒）
    },

    // QuickCannon固有設定
    QUICK_CANNON: {
        WAIT_MIN_MS: 2000,           // WAIT状態の最小時間
        WAIT_MAX_MS: 4000,           // WAIT状態の最大時間
        FEINT_MIN_COUNT: 0,          // フェイント最小回数（0なら1発目からFIRE可能）
        FEINT_MAX_COUNT: 5,          // フェイント最大回数
        FEINT_DURATION_MS: 800,      // フェイント表示時間
        FIRE_DISPLAY_MS: 2000,       // FIRE表示時間
        CPU_REACTION_MIN_MS: 300,    // CPU反応最小時間
        CPU_REACTION_MAX_MS: 600,    // CPU反応最大時間
        CPU_SHOOT_PROBABILITY: 0.8,  // CPU射撃確率（少し上げる）
    },

    // アセットパス
    ASSETS: {
        BASE_PATH: 'assets/',
        BGM_PATH: 'assets/bgm/',
        SE_PATH: 'assets/se/',
    },

    // 色定義（黒板風）
    COLORS: {
        CHALK_WHITE: '#ffffff',      // チョーク白
        CHALK_YELLOW: '#ffeb3b',     // チョーク黄色
        CHALK_RED: '#ff5252',        // チョーク赤
        CHALK_BLUE: '#42a5f5',       // チョーク青
        BOARD_GREEN: '#2d5016',      // 黒板緑
    },

    // フォント設定
    FONTS: {
        MAIN: 'Arial, sans-serif',
        SIZE_LARGE: '72px',
        SIZE_MEDIUM: '48px',
        SIZE_SMALL: '32px',
    },

    // ゲーム状態
    GAME_STATE: {
        READY: 'ready',
        PLAYING: 'playing',
        SUCCESS: 'success',
        FAIL: 'fail',
        RESULT: 'result',
    },
};

// グローバルに公開（ES6モジュールを使わない場合）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Constants;
}
