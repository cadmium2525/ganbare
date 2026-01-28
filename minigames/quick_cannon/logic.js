/**
 * logic.js
 * QuickCannonミニゲームのゲームロジックと状態遷移
 * 
 * 【注意】このファイルはQuickCannonミニゲーム専用です。
 * 他のミニゲームから参照・修正してはいけません。
 */

const QuickCannonLogic = {
    // ゲーム状態
    STATE: {
        WAIT: 'wait',           // 待機中
        FEINT: 'feint',         // フェイント表示中
        FIRE: 'fire',           // FIRE表示中
        BOMB_ANIMATION: 'bomb_animation', // 爆弾アニメーション中
        RESULT: 'result',       // 結果表示中
    },

    // フェイント文言リスト
    FEINT_MESSAGES: [
        'にょっす',
        'あっつ',
        'きさま',
        'あはは',
        'ももぉ',
        'やほ',
        'ドラだよぉ',
        'やほほい',
    ],

    /**
     * ゲーム状態を初期化
     * @returns {Object} 初期状態
     */
    createInitialState() {
        return {
            currentState: this.STATE.WAIT,
            feintCount: 0,
            maxFeintCount: this.getRandomFeintCount(),
            waitStartTime: Date.now(),
            waitDuration: this.getRandomWaitDuration(),
            feintStartTime: null,
            currentFeintMessage: '',
            shouldFireNext: false,
            playerShootTime: null,
            cpuShootTime: null,
            fireStartTime: null,
            isPlayerShooted: false,
            isCPUShooted: false,
            bombAnimationStartTime: null,
            bombAnimationPhase: 'none', // 'none', 'falling', 'exploding', 'burning'
            explosionFrame: 0,
        };
    },

    /**
     * ランダムなフェイント回数を取得
     * @returns {number}
     */
    getRandomFeintCount() {
        const { FEINT_MIN_COUNT, FEINT_MAX_COUNT } = Constants.QUICK_CANNON;
        return Math.floor(Math.random() * (FEINT_MAX_COUNT - FEINT_MIN_COUNT + 1)) + FEINT_MIN_COUNT;
    },

    /**
     * ランダムな待機時間を取得
     * @returns {number} ミリ秒
     */
    getRandomWaitDuration() {
        const { WAIT_MIN_MS, WAIT_MAX_MS } = Constants.QUICK_CANNON;
        return Math.floor(Math.random() * (WAIT_MAX_MS - WAIT_MIN_MS)) + WAIT_MIN_MS;
    },

    /**
     * ランダムなフェイント文言を取得
     * @returns {string}
     */
    getRandomFeintMessage() {
        const messages = this.FEINT_MESSAGES.filter(msg => msg !== 'FIRE');
        return messages[Math.floor(Math.random() * messages.length)];
    },

    /**
     * CPU射撃判定
     * @param {Object} state - 現在の状態
     * @returns {boolean} 射撃するかどうか
     */
    shouldCPUShoot(state) {
        if (state.currentState !== this.STATE.FIRE) {
            return false;
        }

        const { CPU_SHOOT_PROBABILITY, CPU_REACTION_MIN_MS, CPU_REACTION_MAX_MS } = Constants.QUICK_CANNON;
        const elapsed = Date.now() - state.fireStartTime;
        const reactionTime = Math.floor(Math.random() * (CPU_REACTION_MAX_MS - CPU_REACTION_MIN_MS)) + CPU_REACTION_MIN_MS;

        return elapsed >= reactionTime && Math.random() < CPU_SHOOT_PROBABILITY;
    },

    /**
     * プレイヤーのタップ処理
     * @param {Object} state - 現在の状態
     * @returns {Object} { success: boolean, reason: string }
     */
    handlePlayerTap(state) {
        const now = Date.now();

        // WAIT中またはFEINT中のタップは失敗
        if (state.currentState === this.STATE.WAIT || state.currentState === this.STATE.FEINT) {
            return {
                success: false,
                reason: 'フライング！',
            };
        }

        // FIRE中のタップ
        if (state.currentState === this.STATE.FIRE) {
            state.isPlayerShooted = true;
            state.playerShootTime = now;

            // CPUがまだ撃っていなければ成功
            if (!state.isCPUShooted) {
                return {
                    success: true,
                    reason: 'プレイヤーの勝ち！',
                };
            } else {
                return {
                    success: false,
                    reason: 'CPUの方が早かった...',
                };
            }
        }

        // それ以外は無効
        return {
            success: false,
            reason: '無効なタップ',
        };
    },

    /**
     * CPU射撃処理
     * @param {Object} state - 現在の状態
     */
    executeCPUShoot(state) {
        state.isCPUShooted = true;
        state.cpuShootTime = Date.now();
    },

    /**
     * 状態更新
     * @param {Object} state - 現在の状態
     * @returns {Object} 更新後の状態
     */
    updateState(state) {
        const now = Date.now();

        switch (state.currentState) {
            case this.STATE.WAIT:
                // 待機時間経過でフェイントまたはFIREへ
                if (now - state.waitStartTime >= state.waitDuration) {
                    // 最大フェイント回数に達している場合はFIREへ
                    if (state.shouldFireNext) {
                        state.currentState = this.STATE.FIRE;
                        state.fireStartTime = now;
                    } else {
                        // フェイントへ
                        state.currentState = this.STATE.FEINT;
                        state.feintStartTime = now;
                        // 新しいフェイント文言を選択
                        state.currentFeintMessage = this.getRandomFeintMessage();
                        // SE再生フラグをリセット
                        state.feintSePlayd = false;
                    }
                }
                break;

            case this.STATE.FEINT:
                // フェイント表示時間経過
                if (now - state.feintStartTime >= Constants.QUICK_CANNON.FEINT_DURATION_MS) {
                    state.feintCount++;

                    // フェイント後は必ずWAIT状態に戻る
                    state.currentState = this.STATE.WAIT;
                    state.waitStartTime = now;
                    state.waitDuration = this.getRandomWaitDuration();

                    // 最大フェイント回数に達している場合は、次のWAIT後にFIREへ
                    state.shouldFireNext = state.feintCount >= state.maxFeintCount;
                }
                break;

            case this.STATE.FIRE:
                // CPU射撃判定
                if (!state.isCPUShooted && this.shouldCPUShoot(state)) {
                    this.executeCPUShoot(state);
                }

                // プレイヤーがタップ成功した場合は爆弾アニメーションへ
                if (state.isPlayerShooted && !state.isCPUShooted) {
                    // タップ成功時は爆弾アニメーションへ遷移
                    // この遷移はonTap側で処理される
                }

                // FIRE表示時間経過で結果へ（タップしなかった場合）
                if (now - state.fireStartTime >= Constants.QUICK_CANNON.FIRE_DISPLAY_MS) {
                    if (!state.isPlayerShooted) {
                        state.currentState = this.STATE.RESULT;
                    }
                }
                break;

            case this.STATE.BOMB_ANIMATION:
                // 爆弾アニメーションの進行は QuickCannonScene で管理
                break;
        }

        return state;
    },

    /**
     * 最終結果判定
     * @param {Object} state - 現在の状態
     * @returns {boolean} 成功したかどうか
     */
    getFinalResult(state) {
        // プレイヤーが撃っていない場合は失敗
        if (!state.isPlayerShooted) {
            return false;
        }

        // CPUが撃っていない、またはプレイヤーの方が早い場合は成功
        if (!state.isCPUShooted || state.playerShootTime < state.cpuShootTime) {
            return true;
        }

        return false;
    },
};

// グローバルに公開
if (typeof module !== 'undefined' && module.exports) {
    module.exports = QuickCannonLogic;
}
