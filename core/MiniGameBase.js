/**
 * MiniGameBase.js
 * 全ミニゲーム共通の基底クラス
 * 
 * 【重要】このファイルは基盤コードです。
 * 将来的に他のAIが勝手に修正しないことを前提としています。
 */

class MiniGameBase extends Phaser.Scene {
    constructor(config) {
        super(config);

        // 共通プロパティ
        this.gameState = Constants.GAME_STATE.READY;
        this.soundManager = null;
        this.inputManager = null;
        this.startTime = 0;
        this.timeLimit = Constants.MINIGAME.DEFAULT_TIME_LIMIT;

        // UI要素
        this.timerText = null;
        this.messageText = null;
    }

    /**
     * Phaserのcreateメソッド
     * 各ミニゲームでオーバーライド可能
     */
    create() {
        // マネージャーの初期化
        this.soundManager = new SoundManager(this);
        this.inputManager = new InputManager(this);

        // 共通UI作成
        this.createCommonUI();

        // ゲーム開始
        this.start();
    }

    /**
     * 共通UIの作成
     */
    createCommonUI() {
        const { WIDTH, HEIGHT } = Constants.GAME;

        // タイマー表示（右上）
        this.timerText = this.add.text(WIDTH - 20, 20, '', {
            fontSize: Constants.FONTS.SIZE_SMALL,
            color: Constants.COLORS.CHALK_WHITE,
            fontFamily: Constants.FONTS.MAIN,
        });
        this.timerText.setOrigin(1, 0);

        // メッセージ表示（中央）
        this.messageText = this.add.text(WIDTH / 2, HEIGHT / 2, '', {
            fontSize: Constants.FONTS.SIZE_LARGE,
            color: Constants.COLORS.CHALK_WHITE,
            fontFamily: Constants.FONTS.MAIN,
        });
        this.messageText.setOrigin(0.5);
    }

    /**
     * ゲーム開始
     * 各ミニゲームで実装必須
     */
    start() {
        this.gameState = Constants.GAME_STATE.PLAYING;
        this.startTime = Date.now();
        console.warn('MiniGameBase.start() should be overridden');
    }

    /**
     * 更新処理
     * @param {number} time - 経過時間
     * @param {number} delta - 前フレームからの差分
     */
    update(time, delta) {
        // タイマー更新
        if (this.gameState === Constants.GAME_STATE.PLAYING) {
            this.updateTimer();
        }
    }

    /**
     * タイマー更新
     */
    updateTimer() {
        const elapsed = (Date.now() - this.startTime) / 1000;
        const remaining = Math.max(0, this.timeLimit - elapsed);

        if (this.timerText) {
            this.timerText.setText(`${remaining.toFixed(1)}s`);
        }

        // 時間切れ
        if (remaining <= 0) {
            this.finish(false);
        }
    }

    /**
     * ゲーム終了
     * @param {boolean} success - 成功したかどうか
     */
    finish(success) {
        if (this.gameState === Constants.GAME_STATE.RESULT) {
            return; // 既に終了している
        }

        this.gameState = Constants.GAME_STATE.RESULT;
        this.inputManager.disable();

        // 結果表示
        this.showResult(success);

        // 2秒後にリザルト画面へ
        this.time.delayedCall(2000, () => {
            this.goToResultScene(success);
        });
    }

    /**
     * 結果表示
     * @param {boolean} success - 成功したかどうか
     */
    showResult(success) {
        if (this.messageText) {
            this.messageText.setText(success ? '成功！' : '失敗...');
            this.messageText.setColor(success ? Constants.COLORS.CHALK_YELLOW : Constants.COLORS.CHALK_RED);
            this.messageText.setFontSize(Constants.FONTS.SIZE_LARGE);
        }

        // SE再生
        const seKey = success ? 'se_success' : 'se_fail';
        this.soundManager.playSE(seKey);
    }

    /**
     * リザルト画面へ遷移
     * @param {boolean} success - 成功したかどうか
     */
    goToResultScene(success) {
        // 現在のシーンを停止
        this.scene.stop(this.scene.key);

        // リザルト画面へ遷移
        this.scene.start('ResultScene', { success: success });
    }

    /**
     * 次のミニゲームへ遷移
     * @param {boolean} success - 成功したかどうか
     */
    goToNextGame(success) {
        // GameManagerに結果を通知
        if (window.gameManager) {
            window.gameManager.onMiniGameFinished(this.scene.key, success);
        }
    }

    /**
     * クリーンアップ
     */
    shutdown() {
        if (this.soundManager) {
            this.soundManager.destroy();
        }
        if (this.inputManager) {
            this.inputManager.destroy();
        }
    }
}

// グローバルに公開
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MiniGameBase;
}
