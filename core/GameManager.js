/**
 * GameManager.js
 * ゲーム全体の進行管理（ライフ、スコア、ミニゲーム選出）を行うシングルトンクラス
 */
class GameManager {
    static instance = null;

    constructor() {
        if (GameManager.instance) {
            return GameManager.instance;
        }
        GameManager.instance = this;

        this.lives = Constants.MAX_LIVES;
        this.score = 0;
        this.currentMiniGame = null;
    }

    static getInstance() {
        if (!GameManager.instance) {
            new GameManager();
        }
        return GameManager.instance;
    }

    /**
     * ゲーム開始時のリセット
     */
    resetGame() {
        this.lives = Constants.MAX_LIVES;
        this.score = 0;
    }

    /**
     * ライフ減少処理
     * @returns {boolean} ゲームオーバーかどうか
     */
    decreaseLife() {
        this.lives--;
        if (this.lives < 0) this.lives = 0;
        return this.lives === 0;
    }

    /**
     * スコア加算
     */
    addScore(points = 1) {
        this.score += points;
    }

    /**
     * 次にプレイするミニゲームを決定してシーンキーを返す
     * 現在はQuickCannonのみ
     */
    getNextMiniGame() {
        // 将来的にはここでランダム選出
        return Constants.SCENES.QUICK_CANNON;
    }
}
