/**
 * SoundManager.js
 * BGM/SE再生の統一管理
 * 
 * 【重要】このファイルは基盤コードです。
 * 将来的に他のAIが勝手に修正しないことを前提としています。
 */

class SoundManager {
    constructor(scene) {
        this.scene = scene;
        this.bgm = null;
        this.isMuted = false;
        this.bgmVolume = 0.5;
        this.seVolume = 0.7;
    }

    /**
     * BGMを再生
     * @param {string} key - サウンドキー
     * @param {boolean} loop - ループ再生するか
     */
    playBGM(key, loop = true) {
        // 既存のBGMを停止
        if (this.bgm) {
            this.bgm.stop();
        }

        // 新しいBGMを再生
        if (this.scene.sound.get(key)) {
            this.bgm = this.scene.sound.play(key, {
                loop: loop,
                volume: this.isMuted ? 0 : this.bgmVolume,
            });
        }
    }

    /**
     * BGMを停止
     */
    stopBGM() {
        if (this.bgm) {
            this.bgm.stop();
            this.bgm = null;
        }
    }

    /**
     * SEを再生
     * @param {string} key - サウンドキー
     */
    playSE(key) {
        if (this.scene.sound.get(key)) {
            this.scene.sound.play(key, {
                volume: this.isMuted ? 0 : this.seVolume,
            });
        }
    }

    /**
     * ミュート切り替え
     */
    toggleMute() {
        this.isMuted = !this.isMuted;

        if (this.bgm) {
            this.bgm.setVolume(this.isMuted ? 0 : this.bgmVolume);
        }
    }

    /**
     * BGM音量設定
     * @param {number} volume - 音量（0.0 - 1.0）
     */
    setBGMVolume(volume) {
        this.bgmVolume = Math.max(0, Math.min(1, volume));
        if (this.bgm && !this.isMuted) {
            this.bgm.setVolume(this.bgmVolume);
        }
    }

    /**
     * SE音量設定
     * @param {number} volume - 音量（0.0 - 1.0）
     */
    setSEVolume(volume) {
        this.seVolume = Math.max(0, Math.min(1, volume));
    }

    /**
     * クリーンアップ
     */
    destroy() {
        this.stopBGM();
    }
}

// グローバルに公開
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SoundManager;
}
