/**
 * SoundManager.js
 * BGMとSEの再生管理を行うクラス
 * 4段階の音量調整（ミュート、小、中、大）に対応
 */
class SoundManager {
    static instance = null;

    // 音量レベル定義: 0(Mute), 1(Low), 2(Mid), 3(High)
    static VOLUME_LEVELS = [0.0, 0.2, 0.5, 1.0];

    constructor(scene) {
        if (SoundManager.instance) {
            return SoundManager.instance;
        }
        SoundManager.instance = this;
        this.scene = scene;
        this.bgm = null;

        this.currentVolumeLevel = 0; // デフォルトはMute
        this.masterVolume = SoundManager.VOLUME_LEVELS[this.currentVolumeLevel];
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
     * 音量レベルを切り替える (0 -> 1 -> 2 -> 3 -> 0)
     * @returns {number} 新しい音量レベル (0-3)
     */
    cycleVolume() {
        this.currentVolumeLevel = (this.currentVolumeLevel + 1) % SoundManager.VOLUME_LEVELS.length;
        this.masterVolume = SoundManager.VOLUME_LEVELS[this.currentVolumeLevel];

        // 再生中のBGMがあれば音量を即座に更新
        if (this.scene.sound.context.state === 'suspended') {
            this.scene.sound.context.resume();
        }

        if (this.bgm && this.bgm.isPlaying) {
            const baseVolume = this.bgm.originalConfigVolume !== undefined ? this.bgm.originalConfigVolume : 0.5;
            this.bgm.setVolume(baseVolume * this.masterVolume);
        }

        return this.currentVolumeLevel;
    }

    /**
     * 現在の音量レベルを取得
     */
    getVolumeLevel() {
        return this.currentVolumeLevel;
    }

    /**
     * 現在の音量レベルの文字列表現を取得
     */
    getVolumeLabel() {
        const labels = ["Mute", "Low", "Mid", "High"];
        return labels[this.currentVolumeLevel];
    }

    /**
     * BGM再生
     * @param {string} key アセットキー
     * @param {object} config 再生設定
     */
    playBgm(key, config = { loop: true, volume: 0.5 }) {
        const originalVolume = config.volume !== undefined ? config.volume : 0.5;
        const actualVolume = originalVolume * this.masterVolume;

        // 同じBGMが再生中なら音量だけ更新してリターン
        if (this.bgm && this.bgm.key === key && this.bgm.isPlaying) {
            this.bgm.setVolume(actualVolume);
            this.bgm.originalConfigVolume = originalVolume;
            return;
        }

        // 別のBGMが再生中なら止める
        if (this.bgm) {
            this.bgm.stop();
        }

        const newConfig = { ...config, volume: actualVolume };
        this.bgm = this.scene.sound.add(key, newConfig);
        this.bgm.originalConfigVolume = originalVolume; // 元の音量を保持しておく
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
        const originalVolume = config.volume !== undefined ? config.volume : 1.0;
        const actualVolume = originalVolume * this.masterVolume;

        this.scene.sound.play(key, { ...config, volume: actualVolume });
    }
}
