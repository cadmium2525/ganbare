/**
 * InputManager.js
 * タップ入力の統一管理を行うクラス
 * 誤作動（連打、シーン遷移直後の入力）を防ぐ
 */
class InputManager {
    constructor(scene) {
        this.scene = scene;
        this.enabled = false;

        // 画面全体を覆う透明なゾーンを作成して入力を受け付ける
        this.inputZone = this.scene.add.zone(
            Constants.CENTER_X,
            Constants.CENTER_Y,
            Constants.WIDTH,
            Constants.HEIGHT
        );
        this.inputZone.setOrigin(0.5);
        this.inputZone.setInteractive();

        this.inputZone.on('pointerdown', this.onPointerDown, this);
    }

    /**
     * 入力を有効化
     */
    enable() {
        this.enabled = true;
    }

    /**
     * 入力を無効化
     */
    disable() {
        this.enabled = false;
    }

    /**
     * タップ時のコールバックを設定
     * @param {function} callback 
     */
    onTap(callback) {
        this.tapCallback = callback;
    }

    onPointerDown(pointer) {
        if (!this.enabled) return;
        if (this.tapCallback) {
            this.tapCallback(pointer);
        }
    }

    /**
     * 即時にゾーンを破棄（シーン終了時など）
     */
    destroy() {
        this.inputZone.destroy();
    }
}
