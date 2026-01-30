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
        this.currentBGMKey = null;
    }

    /**
     * BGMを再生
     * @param {string} key - サウンドキー
     * @param {boolean} loop - ループ再生するか
     */
    playBGM(key, loop = true) {
        // 同じBGMが既に存在する場合
        if (this.currentBGMKey === key && this.bgm) {
            if (this.bgm.isPaused) {
                console.log(`[SoundManager] Resuming BGM: ${key}`);
                this.bgm.resume();
                return;
            } else if (this.bgm.isPlaying) {
                console.log(`[SoundManager] BGM already playing: ${key}`);
                return;
            }
        }

        // 既存のBGMを停止
        this.stopBGM();

        // 同じキーの他のサウンドインスタンスも念のため停止（重複防止）
        this.scene.sound.getAll(key).forEach(sound => {
            console.log(`[SoundManager] Stopping duplicate BGM: ${key}`);
            sound.stop();
            sound.destroy();
        });

        // 新しいBGMを再生
        console.log(`[SoundManager] Attempting to play BGM: ${key}`);
        try {
            this.bgm = this.scene.sound.add(key, {
                loop: loop,
                volume: this.isMuted ? 0 : this.bgmVolume,
            });
            this.bgm.play();
            this.currentBGMKey = key;
            console.log(`[SoundManager] Playing BGM: ${key}`);
        } catch (error) {
            console.error(`[SoundManager] Failed to play BGM: ${key}`, error);
            this.currentBGMKey = null;
        }
    }

    /**
     * BGMを停止
     */
    stopBGM() {
        // 現在管理中のBGMを停止
        if (this.bgm) {
            if (typeof this.bgm.stop === 'function') {
                this.bgm.stop();
            }
            this.bgm = null;
            this.currentBGMKey = null;
        }
    }

    /**
     * BGMを一時停止
     */
    pauseBGM() {
        if (this.bgm && this.bgm.isPlaying) {
            console.log(`[SoundManager] Pausing BGM: ${this.currentBGMKey}`);
            this.bgm.pause();
        }
    }

    /**
     * SEを再生
     * @param {string} key - サウンドキー
     */
    playSE(key) {
        // 音がキャッシュにあるか確認してから再生（存在しないとエラーになる場合があるため）
        if (this.scene.cache.audio.exists(key)) {
            this.scene.sound.play(key, {
                volume: this.isMuted ? 0 : this.seVolume,
            });
        } else {
            console.warn(`[SoundManager] SE not found: ${key}`);
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
