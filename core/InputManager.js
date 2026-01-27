/**
 * InputManager.js
 * タップ入力の統一管理
 * 
 * 【重要】このファイルは基盤コードです。
 * 将来的に他のAIが勝手に修正しないことを前提としています。
 */

class InputManager {
    constructor(scene) {
        this.scene = scene;
        this.isEnabled = true;
        this.tapCallback = null;
        this.tapStartTime = 0;

        // タップイベントの設定
        this.setupInput();
    }

    /**
     * 入力イベントのセットアップ
     */
    setupInput() {
        // ポインターダウンイベント（タップ開始）
        this.scene.input.on('pointerdown', (pointer) => {
            if (!this.isEnabled) return;

            this.tapStartTime = Date.now();
            this.handleTap(pointer);
        });

        // ポインターアップイベント（タップ終了）
        this.scene.input.on('pointerup', (pointer) => {
            // 必要に応じて実装
        });
    }

    /**
     * タップ処理
     * @param {Phaser.Input.Pointer} pointer - ポインター情報
     */
    handleTap(pointer) {
        if (this.tapCallback) {
            this.tapCallback({
                x: pointer.x,
                y: pointer.y,
                timestamp: this.tapStartTime,
            });
        }
    }

    /**
     * タップコールバックを設定
     * @param {Function} callback - タップ時に呼ばれるコールバック
     */
    onTap(callback) {
        this.tapCallback = callback;
    }

    /**
     * タップコールバックをクリア
     */
    clearTapCallback() {
        this.tapCallback = null;
    }

    /**
     * 入力を有効化
     */
    enable() {
        this.isEnabled = true;
    }

    /**
     * 入力を無効化
     */
    disable() {
        this.isEnabled = false;
    }

    /**
     * 入力が有効かどうか
     * @returns {boolean}
     */
    isInputEnabled() {
        return this.isEnabled;
    }

    /**
     * クリーンアップ
     */
    destroy() {
        this.clearTapCallback();
        this.scene.input.off('pointerdown');
        this.scene.input.off('pointerup');
    }
}

// グローバルに公開
if (typeof module !== 'undefined' && module.exports) {
    module.exports = InputManager;
}
