/**
 * SoundManager.js
 * BGMとSEの再生管理を行うクラス
 */
class SoundManager {
    static instance = null;

    constructor(scene) {
        if (SoundManager.instance) {
            return SoundManager.instance;
        }
        SoundManager.instance = this;
        this.scene = scene;
        this.bgm = null;
        this.isMuted = false;
    }

    static getInstance(scene) {
        if (!SoundManager.instance) {
            new SoundManager(scene);
        }
        // シーンが変わってもオーディオコンテキストは生きているが、
        // soundを追加するシーン参照を更新する必要がある場合はここで更新
        if (scene) {
            SoundManager.instance.scene = scene;
        }
        return SoundManager.instance;
    }

    /**
     * BGM再生
     * @param {string} key アセットキー
     * @param {object} config 再生設定
     */
    playBgm(key, config = { loop: true, volume: 0.5 }) {
        if (this.isMuted) return;

        // 同じBGMが再生中なら何もしない
        if (this.bgm && this.bgm.key === key && this.bgm.isPlaying) {
            return;
        }

        // 別のBGMが再生中なら止める
        if (this.bgm) {
            this.bgm.stop();
        }

        this.bgm = this.scene.sound.add(key, config);
        this.bgm.play();
    }

    /**
     * BGM停止
     */
    stopBgm() {
        if (this.bgm) {
            this.bgm.stop();
            this.bgm = null;
        }
    }

    /**
     * SE再生
     * @param {string} key アセットキー
     * @param {object} config 再生設定
     */
    playSe(key, config = { volume: 1.0 }) {
        if (this.isMuted) return;
        this.scene.sound.play(key, config);
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.isMuted) {
            this.scene.sound.mute = true;
        } else {
            this.scene.sound.mute = false;
        }
    }
}
