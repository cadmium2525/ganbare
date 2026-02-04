/**
 * QuickCannonLogic.js
 * 早撃ちゲームのロジック管理
 */
class QuickCannonLogic {
    constructor() {
        this.state = 'INIT'; // INIT, WAIT, FEINT, FIRE, END
        this.feintCount = 0;
        // 定数
        this.MIN_WAIT = 1000;
        this.MAX_WAIT = 3000;
        this.ENEMY_REACTION_TIME = 400; // 敵の反応速度(ms)
    }

    /**
     * ゲーム開始準備
     */
    start() {
        this.state = 'WAIT';
        this.feintCount = 0;
    }

    /**
     * フェイントを出すか、本番を出すかを決定する
     * @returns {string} 次のアクション 'FEINT' or 'FIRE'
     */
    decideNextAction() {
        // 50%の確率でフェイント、ただしフェイントは最大2回まで
        const isFeint = Math.random() < 0.5;
        if (isFeint && this.feintCount < 10) {
            this.feintCount++;
            return 'FEINT';
        } else {
            return 'FIRE';
        }
    }

    /**
     * 待機時間をランダムに生成
     */
    getRandomWaitTime() {
        return Math.floor(Math.random() * (this.MAX_WAIT - this.MIN_WAIT + 1)) + this.MIN_WAIT;
    }

    /**
     * 判定処理
     * @param {number} playerReactionTime プレイヤーがタップした時刻（FIRE状態開始からの経過時間）
     * @returns {object} 結果 { success: boolean, reason: string }
     */
    checkResult(playerReactionTime) {
        if (this.state !== 'FIRE') {
            // フライング
            return { success: false, reason: 'early' };
        }

        if (playerReactionTime < this.ENEMY_REACTION_TIME) {
            return { success: true, reason: 'win' };
        } else {
            return { success: false, reason: 'late' };
        }
    }
}
