/**
 * assets.js
 * QuickCannonミニゲームで使用するアセット定義
 * 
 * 【注意】このファイルはQuickCannonミニゲーム専用です。
 * 他のミニゲームから参照・修正してはいけません。
 */

const QuickCannonAssets = {
    // 画像アセット
    images: {
        // 司会キャラクター（黒板に白チョークで描いた手描き風）
        announcer_idle01: 'minigames/quick_cannon/assets/characters/announcer/announcer_idle01.png',
        announcer_idle02: 'minigames/quick_cannon/assets/characters/announcer/announcer_idle02.png',
        announcer_fake: 'minigames/quick_cannon/assets/characters/announcer/announcer_fake.png',
        announcer_fire: 'minigames/quick_cannon/assets/characters/announcer/announcer_fire.png',

        // UI要素
        fukidashi: 'minigames/quick_cannon/assets/characters/announcer/fukidashi.png',

        // プレイヤーキャラクター
        player_idle: 'minigames/quick_cannon/assets/player_idle.png',
        player_shoot: 'minigames/quick_cannon/assets/player_shoot.png',

        // CPUキャラクター
        cpu_idle: 'minigames/quick_cannon/assets/cpu_idle.png',
        cpu_shoot: 'minigames/quick_cannon/assets/cpu_shoot.png',

        // 背景要素
        background: 'minigames/quick_cannon/assets/background.png',
    },

    // 音声アセット
    sounds: {
        // BGM
        bgm_quickcannon: 'minigames/quick_cannon/assets/bgm_quickcannon.mp3',

        // SE
        se_countdown: 'minigames/quick_cannon/assets/se_countdown.mp3',
        se_fire: 'minigames/quick_cannon/assets/se_fire.mp3',
        se_shoot: 'minigames/quick_cannon/assets/se_shoot.mp3',
        se_success: 'minigames/quick_cannon/assets/se_success.mp3',
        se_fail: 'minigames/quick_cannon/assets/se_fail.mp3',
    },

    /**
     * アセットをPhaserシーンにプリロード
     * @param {Phaser.Scene} scene - Phaserシーン
     */
    preload(scene) {
        // 画像読み込み
        Object.entries(this.images).forEach(([key, path]) => {
            scene.load.image(key, path);
        });

        // 音声読み込み
        Object.entries(this.sounds).forEach(([key, path]) => {
            scene.load.audio(key, path);
        });
    },
};

// グローバルに公開
if (typeof module !== 'undefined' && module.exports) {
    module.exports = QuickCannonAssets;
}
