/**
 * GameManager.js
 * ミニゲームの登録・管理とシーン遷移
 * 
 * 【重要】このファイルは基盤コードです。
 * 将来的に他のAIが勝手に修正しないことを前提としています。
 */

class GameManager {
    constructor(game) {
        this.game = game;
        this.miniGames = [];
        this.currentGameIndex = 0;
        this.totalGames = 0;
        this.successCount = 0;
        this.failCount = 0;

        // グローバルアクセス用
        window.gameManager = this;
    }

    /**
     * ミニゲームを登録
     * @param {string} sceneKey - シーンキー
     * @param {Class} sceneClass - シーンクラス
     */
    registerMiniGame(sceneKey, sceneClass) {
        this.miniGames.push({
            key: sceneKey,
            class: sceneClass,
        });

        // Phaserにシーンを追加
        this.game.scene.add(sceneKey, sceneClass, false);
    }

    /**
     * ゲーム開始
     */
    startGame() {
        this.currentGameIndex = 0;
        this.totalGames = 0;
        this.successCount = 0;
        this.failCount = 0;

        // シャッフル（ランダム順序）
        this.shuffleMiniGames();

        // 最初のミニゲームを開始
        this.startNextMiniGame();
    }

    /**
     * ミニゲームをシャッフル
     */
    shuffleMiniGames() {
        for (let i = this.miniGames.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.miniGames[i], this.miniGames[j]] = [this.miniGames[j], this.miniGames[i]];
        }
    }

    /**
     * 次のミニゲームを開始
     */
    startNextMiniGame() {
        if (this.currentGameIndex >= this.miniGames.length) {
            // 全ミニゲーム終了
            this.showFinalResult();
            return;
        }

        const miniGame = this.miniGames[this.currentGameIndex];
        console.log(`Starting minigame: ${miniGame.key}`);

        // シーンを開始
        this.game.scene.start(miniGame.key);
    }

    /**
     * ミニゲーム終了時のコールバック
     * @param {string} sceneKey - 終了したシーンキー
     * @param {boolean} success - 成功したかどうか
     */
    onMiniGameFinished(sceneKey, success) {
        console.log(`Minigame finished: ${sceneKey}, success: ${success}`);

        this.totalGames++;
        if (success) {
            this.successCount++;
        } else {
            this.failCount++;
        }

        // 現在のシーンを停止
        this.game.scene.stop(sceneKey);

        // 次のミニゲームへ
        this.currentGameIndex++;
        this.startNextMiniGame();
    }

    /**
     * 最終結果表示
     */
    showFinalResult() {
        console.log('=== Final Result ===');
        console.log(`Total: ${this.totalGames}`);
        console.log(`Success: ${this.successCount}`);
        console.log(`Fail: ${this.failCount}`);
        console.log('====================');

        // TODO: 結果画面シーンを作成して遷移
        // 現在は再スタート
        setTimeout(() => {
            this.startGame();
        }, 3000);
    }

    /**
     * 現在のスコア取得
     * @returns {Object} スコア情報
     */
    getScore() {
        return {
            total: this.totalGames,
            success: this.successCount,
            fail: this.failCount,
        };
    }

    /**
     * ゲームリセット
     */
    reset() {
        this.currentGameIndex = 0;
        this.totalGames = 0;
        this.successCount = 0;
        this.failCount = 0;
    }
}

// グローバルに公開
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameManager;
}
