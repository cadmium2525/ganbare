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
        announcer_fire01: 'minigames/quick_cannon/assets/characters/announcer/announcer_fire01.png',

        // 爆弾
        bomb: 'minigames/quick_cannon/assets/bomb/bomb.png',
        bomb000: 'minigames/quick_cannon/assets/bomb/bomb000.png',
        bomb001: 'minigames/quick_cannon/assets/bomb/bomb001.png',
        bomb002: 'minigames/quick_cannon/assets/bomb/bomb002.png',

        // UI要素
        fukidashi: 'minigames/quick_cannon/assets/characters/announcer/fukidashi.png',

        // プレイヤーキャラクター
        player_idle001: 'minigames/quick_cannon/assets/characters/player/player_idle001.png',
        player_idle002: 'minigames/quick_cannon/assets/characters/player/player_idle002.png',
        player_push001: 'minigames/quick_cannon/assets/characters/player/player_push001.png',
        player_push002: 'minigames/quick_cannon/assets/characters/player/player_push002.png',
        player_fail: 'minigames/quick_cannon/assets/characters/player/player_fail.png',

        // CPUキャラクター
        enemy_idle01: 'minigames/quick_cannon/assets/characters/enemy/enemy_idle01.png',
        enemy_idle02: 'minigames/quick_cannon/assets/characters/enemy/enemy_idle02.png',
        enemy_push01: 'minigames/quick_cannon/assets/characters/enemy/enemy_push01.png',
        enemy_push02: 'minigames/quick_cannon/assets/characters/enemy/enemy_push02.png',

        // 背景要素
        background: 'minigames/quick_cannon/assets/background.png',
    },

    // 音声アセット
    sounds: {
        // BGM
        bgm_quickcannon: 'minigames/quick_cannon/assets/bgm/bgm_quickcannon.mp3',
        bgm_happytime: 'minigames/quick_cannon/assets/bgm/happytime.mp3',

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
