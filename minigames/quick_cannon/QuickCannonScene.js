/**
 * QuickCannonScene.js
 * QuickCannonミニゲームのPhaserシーン実装
 * 
 * 【注意】このファイルはQuickCannonミニゲーム専用です。
 * 他のミニゲームから参照・修正してはいけません。
 */

class QuickCannonScene extends MiniGameBase {
    constructor() {
        super({ key: 'QuickCannonScene' });

        // ゲーム状態
        this.gameLogicState = null;
        this.lastState = null;
        this.tapToStartText = null;

        // UI要素
        this.hostSprite = null;
        this.fukidashiSprite = null;
        this.playerSprite = null;
        this.cpuSprite = null;
        this.commandText = null;
        this.instructionText = null;

        // アニメーション用
        this.idleAnimTimer = 0;
        this.currentIdleFrame = 1;

        // 爆弾アニメーション用
        this.bombSprite = null;
        this.explosionSprite = null;

        // プレイヤーアニメーション用
        this.playerIdleAnimTimer = 0;
        this.currentPlayerIdleFrame = 1;
        this.isPlayerPushing = false;
        this.playerPushAnimTimer = 0;
        // CPUアニメーション用
        this.cpuIdleAnimTimer = 0;
        this.currentCpuIdleFrame = 1;
        this.isCpuPushing = false;
        this.cpuPushAnimTimer = 0;
    }

    /**
     * アセットのプリロード
     */
    preload() {
        // QuickCannonアセットを読み込み
        QuickCannonAssets.preload(this);
    }

    /**
     * シーン作成
     */
    create() {
        // 親クラスのcreateを呼び出し
        super.create();

        // 既存の音声をすべて停止（重複防止）
        this.sound.stopAll();

        // ゲームロジック初期化（ここではnullのまま、スタート時に生成）
        this.gameLogicState = null;
        this.lastState = null;

        // UI作成
        this.createUI();

        // タップイベント設定
        this.inputManager.onTap((tapInfo) => this.onTap(tapInfo));
    }

    /**
     * UI作成
     */
    createUI() {
        const { WIDTH, HEIGHT } = Constants.GAME;

        // 背景（黒板）
        this.add.rectangle(0, 0, WIDTH, HEIGHT, 0x2d5016).setOrigin(0);

        // 吹き出し（左側）
        this.fukidashiSprite = this.add.sprite(
            WIDTH * 0.32,
            HEIGHT * 0.2,
            'fukidashi'
        );
        this.fukidashiSprite.setScale(0.85); // サイズを少し小さく

        // 司会キャラクター（右側）
        this.hostSprite = this.add.sprite(
            WIDTH * 0.77,
            HEIGHT * 0.2,
            'announcer_idle01'
        );
        this.hostSprite.setScale(0.6); // サイズを小さく

        // コマンド表示テキスト（吹き出しの中央）
        this.commandText = this.add.text(WIDTH * 0.32, HEIGHT * 0.2, '', {
            fontSize: Constants.FONTS.SIZE_LARGE,
            color: Constants.COLORS.CHALK_WHITE,
            fontFamily: Constants.FONTS.MAIN,
            fontStyle: 'bold',
        });
        this.commandText.setOrigin(0.5);

        // プレイヤーキャラクター（左下）
        this.playerSprite = this.add.sprite(
            WIDTH * 0.25,
            HEIGHT * 0.7,
            'player_idle001'
        );
        this.playerSprite.setScale(0.7);

        // CPUキャラクター（右下）
        this.cpuSprite = this.add.sprite(
            WIDTH * 0.75,
            HEIGHT * 0.7,
            'enemy_idle01'
        );
        this.cpuSprite.setScale(0.7);

        // 説明テキスト（下部）
        this.instructionText = this.add.text(WIDTH / 2, HEIGHT * 0.9, '「おちんぽ」が表示されたらタップ!', {
            fontSize: Constants.FONTS.SIZE_SMALL,
            color: Constants.COLORS.CHALK_YELLOW,
            fontFamily: Constants.FONTS.MAIN,
        });
        this.instructionText.setOrigin(0.5);

        // タイマーテキストを非表示（QuickCannonでは使わない）
        if (this.timerText) {
            this.timerText.setVisible(false);
        }
    }

    /**
     * 更新処理
     */
    update(time, delta) {
        // 親クラスのupdateは呼ばない（タイマーを使わないため）

        if (this.gameState !== Constants.GAME_STATE.PLAYING) {
            return;
        }

        // ゲームロジック更新
        this.gameLogicState = QuickCannonLogic.updateState(this.gameLogicState);

        // 状態変化検知とBGM制御
        if (this.gameLogicState.currentState !== this.lastState) {
            this.handleStateChange(this.lastState, this.gameLogicState.currentState);
            this.lastState = this.gameLogicState.currentState;
        }

        // UI更新
        this.updateUI();

        // アイドルアニメーション更新（WAIT状態のみ）
        if (this.gameLogicState.currentState === QuickCannonLogic.STATE.WAIT) {
            this.updateIdleAnimation(delta);
        }

        // プレイヤーアイドルアニメーション更新（WAIT状態とFEINT状態）
        if (this.gameLogicState.currentState === QuickCannonLogic.STATE.WAIT ||
            this.gameLogicState.currentState === QuickCannonLogic.STATE.FEINT) {
            this.updatePlayerIdleAnimation(delta);
            this.updateCpuIdleAnimation(delta);
        }

        // プレイヤープッシュアニメーション更新
        if (this.isPlayerPushing) {
            this.updatePlayerPushAnimation(delta);
        }

        // CPU射撃判定 & アニメーション開始
        // state.isCPUShooted が true になったら、まだプッシュ中でなければアニメーション開始
        // （タイミングが遅くても、state側でisCPUShootedが立てばここで検知される）
        if (this.gameLogicState.isCPUShooted && !this.isCpuPushing && this.cpuPushAnimTimer === 0) {
            this.playCpuPushAnimation();
        }

        // CPUプッシュアニメーション更新
        if (this.isCpuPushing) {
            this.updateCpuPushAnimation(delta);
        }

        // BGM制御は handleStateChange で行うためポーリングは削除

        // 結果判定
        if (this.gameLogicState.currentState === QuickCannonLogic.STATE.RESULT) {
            this.handleResult();
        }
    }

    /**
     * 状態変化時の処理（BGM制御など）
     */
    handleStateChange(oldState, newState) {
        console.log(`[QuickCannonScene] State Change: ${oldState} -> ${newState}`);

        // WAIT状態に入った時: BGM再生
        if (newState === QuickCannonLogic.STATE.WAIT) {
            console.log('[QuickCannonScene] Enter WAIT: Playing BGM');
            this.soundManager.playBGM('bgm_happytime');
        }
        // WAIT状態から抜けた時: BGM一時停止
        else if (oldState === QuickCannonLogic.STATE.WAIT) {
            console.log(`[QuickCannonScene] Exit WAIT (to ${newState}): Pausing BGM`);
            this.soundManager.pauseBGM();
        }
    }

    /**
     * UI更新
     */
    updateUI() {
        const state = this.gameLogicState;
        const now = Date.now();

        switch (state.currentState) {
            case QuickCannonLogic.STATE.WAIT:
                this.commandText.setText('...');
                this.commandText.setColor(Constants.COLORS.CHALK_WHITE);
                // アイドルアニメーションは updateIdleAnimation() で処理
                break;

            case QuickCannonLogic.STATE.FEINT:
                // 状態に保存されたフェイント文言を使用
                this.commandText.setText(state.currentFeintMessage);
                this.commandText.setColor(Constants.COLORS.CHALK_WHITE);

                // 司会キャラクターをフェイント画像に変更
                this.hostSprite.setTexture('announcer_fake');

                // SE再生（初回のみ）
                if (!state.feintSePlayd) {
                    this.soundManager.playSE('se_countdown');
                    state.feintSePlayd = true;
                }
                break;

            case QuickCannonLogic.STATE.FIRE:
                this.commandText.setText('おちんぽ!');
                this.commandText.setColor(Constants.COLORS.CHALK_WHITE);

                // 司会キャラクターをFIRE画像に変更
                this.hostSprite.setTexture('announcer_fire');

                // FIRE表示時のSE（初回のみ）
                if (!state.fireSePlayd) {
                    this.soundManager.playSE('se_fire');
                    state.fireSePlayd = true;
                }

                // プレイヤー射撃アニメーション
                if (state.isPlayerShooted) {
                    this.playerSprite.setFillStyle(0xffeb3b);
                }

                // FIRE表示時間経過で結果へ（タップしなかった場合）
                if (now - state.fireStartTime >= Constants.QUICK_CANNON.FIRE_DISPLAY_MS) {
                    if (!state.isPlayerShooted) {
                        state.currentState = QuickCannonLogic.STATE.RESULT;
                    }
                }
                break;

            case QuickCannonLogic.STATE.BOMB_ANIMATION:
                this.updateBombAnimation(state);
                break;
        }
    }

    /**
     * アイドルアニメーション更新
     */
    updateIdleAnimation(delta) {
        // WAIT状態以外ではアニメーションを停止
        if (this.gameLogicState.currentState !== QuickCannonLogic.STATE.WAIT) {
            return;
        }

        // 500msごとにフレームを切り替え
        this.idleAnimTimer += delta;

        if (this.idleAnimTimer >= 500) {
            this.idleAnimTimer = 0;

            // フレームを切り替え
            if (this.currentIdleFrame === 1) {
                this.hostSprite.setTexture('announcer_idle02');
                this.currentIdleFrame = 2;
            } else {
                this.hostSprite.setTexture('announcer_idle01');
                this.currentIdleFrame = 1;
            }
        }
    }

    /**
     * プレイヤーアイドルアニメーション更新
     */
    updatePlayerIdleAnimation(delta) {
        // プッシュ中は実行しない
        if (this.isPlayerPushing) {
            return;
        }

        // 500msごとにフレームを切り替え
        this.playerIdleAnimTimer += delta;

        if (this.playerIdleAnimTimer >= 500) {
            this.playerIdleAnimTimer = 0;

            // フレームを切り替え
            if (this.currentPlayerIdleFrame === 1) {
                this.playerSprite.setTexture('player_idle002');
                this.currentPlayerIdleFrame = 2;
            } else {
                this.playerSprite.setTexture('player_idle001');
                this.currentPlayerIdleFrame = 1;
            }
        }
    }

    /**
     * プレイヤープッシュアニメーション開始
     */
    playPlayerPushAnimation() {
        this.isPlayerPushing = true;
        this.playerPushAnimTimer = 0;
        this.playerSprite.setTexture('player_push001');
    }

    /**
     * プレイヤープッシュアニメーション更新
     */
    updatePlayerPushAnimation(delta) {
        this.playerPushAnimTimer += delta;

        // 200msでフレーム切り替え
        if (this.playerPushAnimTimer >= 200 && this.playerPushAnimTimer < 1400) {
            this.playerSprite.setTexture('player_push002');
        }
        // 1400msでアニメーション完了、アイドルに戻る
        else if (this.playerPushAnimTimer >= 1400) {
            this.isPlayerPushing = false;
            this.playerPushAnimTimer = 0;
            this.playerSprite.setTexture('player_idle001');
            this.currentPlayerIdleFrame = 1;
        }
    }

    /**
     * 爆弾アニメーション更新
     */
    updateBombAnimation(state) {
        const { WIDTH, HEIGHT } = Constants.GAME;
        const now = Date.now();

        // アニメーション開始時の初期化
        if (state.bombAnimationPhase === 'none') {
            state.bombAnimationStartTime = now;
            state.bombAnimationPhase = 'falling';
            state.explosionFrame = 0;

            // 爆弾ターゲットに応じて表示位置を変更
            let targetX, targetY;

            if (state.bombTarget === 'player') {
                targetX = this.playerSprite.x;
                targetY = this.playerSprite.y;
            } else {
                // デフォルト（司会者）
                targetX = this.hostSprite.x;
                targetY = this.hostSprite.y;
            }

            // 爆弾スプライトを作成（ターゲットの上方）
            this.bombSprite = this.add.sprite(
                targetX - 10,
                -100,
                'bomb'
            );
            this.bombSprite.setScale(0.3);
        }

        const elapsed = now - state.bombAnimationStartTime;

        // プレイヤープッシュアニメーション完了を待つ（1400ms遅延）
        // ターゲットがプレイヤー（＝CPU勝利）の場合は、プレイヤーの動作に関わらずすぐに落とす
        let pushAnimationDelay = 1400;
        if (state.bombTarget === 'player') {
            pushAnimationDelay = 200;
        }

        // フェーズ1: 爆弾が落下（1400-2200ms）
        if (state.bombAnimationPhase === 'falling') {
            // 遅延時間が経過するまで待機
            if (elapsed < pushAnimationDelay) {
                return;
            }

            const fallDuration = 800;
            const fallElapsed = elapsed - pushAnimationDelay;
            const progress = Math.min(fallElapsed / fallDuration, 1);

            // 落下アニメーション（イージング付き）
            let targetY;
            if (state.bombTarget === 'player') {
                targetY = this.playerSprite.y;
            } else {
                targetY = this.hostSprite.y;
            }

            const easing = progress * progress; // 加速
            this.bombSprite.y = -100 + (targetY + 100) * easing;

            if (progress >= 1) {
                state.bombAnimationPhase = 'exploding';
                state.explosionFrame = 0;

                // 爆弾スプライトを非表示
                this.bombSprite.setVisible(false);

                // 爆発スプライトを作成
                this.explosionSprite = this.add.sprite(
                    this.bombSprite.x,
                    targetY,
                    'bomb000'
                );
                this.explosionSprite.setScale(0.4);

                // 爆発SE再生
                if (state.bombTarget === 'player') {
                    // プレイヤーの場合も爆発音は同じ、その後失敗音
                    this.soundManager.playSE('se_success');
                } else {
                    this.soundManager.playSE('se_success');
                }
            }
        }

        // フェーズ2: 爆発アニメーション
        if (state.bombAnimationPhase === 'exploding') {
            const explosionStartTime = pushAnimationDelay + 800; // 1400 + 800 = 2200ms
            const explosionElapsed = elapsed - explosionStartTime;
            const frameTime = 100; // フレーム時間を短縮してパカパカさせる

            // 最初の爆発（bomb000）
            if (explosionElapsed < frameTime) {
                this.explosionSprite.setTexture('bomb000');
            }
            // その後 bomb001 と bomb002 を交互に3回繰り返す
            else {
                // 3回ループ (1ループ = bomb001 -> bomb002)
                const loopCount = 3;
                const loopDuration = frameTime * 2; // 001と002で2フレーム分
                const totalLoopDuration = loopDuration * loopCount;

                const loopElapsed = explosionElapsed - frameTime;

                if (loopElapsed < totalLoopDuration) {
                    // 現在のループ内での進行度
                    const currentLoopTime = loopElapsed % loopDuration;
                    if (currentLoopTime < frameTime) {
                        this.explosionSprite.setTexture('bomb001');
                    } else {
                        this.explosionSprite.setTexture('bomb002');
                    }
                } else {
                    // ループ終了、burningへ
                    state.bombAnimationPhase = 'burning';

                    // 爆発スプライトを非表示
                    this.explosionSprite.setVisible(false);

                    // ターゲットによって状態変化
                    if (state.bombTarget === 'player') {
                        // プレイヤー失敗画像
                        this.playerSprite.setTexture('player_fail');

                        // 失敗SE
                        this.soundManager.playSE('se_fail');
                    } else {
                        // 司会者を燃えた状態に変更
                        this.hostSprite.setTexture('announcer_fire01');
                    }
                }
            }
        }

        // フェーズ3: 燃えた状態を表示
        if (state.bombAnimationPhase === 'burning') {
            // falling(800) + explosion init(100) + loop(100*2*3 = 600) = 1500ms after start
            const burningStartTime = pushAnimationDelay + 1500;
            const burningElapsed = elapsed - burningStartTime;
            const burningDuration = 2000; // 2秒間表示

            if (burningElapsed >= burningDuration) {
                // アニメーション完了、リザルトへ
                state.currentState = QuickCannonLogic.STATE.RESULT;
            }
        }
    }

    /**
     * タップ処理
     */
    onTap(tapInfo) {
        if (this.gameState !== Constants.GAME_STATE.PLAYING) {
            return;
        }

        // AudioContextの再開（Autoplay対策）
        if (this.sound.context.state === 'suspended') {
            this.sound.context.resume();
        }

        // BGMを停止（確実に）
        this.soundManager.stopBGM();

        // ゲームロジックでタップ処理
        const result = QuickCannonLogic.handlePlayerTap(this.gameLogicState);

        // SE再生
        this.soundManager.playSE('se_shoot');

        // プレイヤープッシュアニメーションを開始
        this.playPlayerPushAnimation();

        // 失敗の場合はアニメーション完了後に終了
        if (!result.success) {
            // 後出し（既に勝負がついている）の場合は、メッセージだけ出して終了処理はしない
            // （爆弾アニメーションが進行中のはず）
            if (result.isLate) {
                this.messageText.setText(result.reason);
                this.messageText.setColor(Constants.COLORS.CHALK_RED);
                return;
            }

            this.messageText.setText(result.reason);
            this.messageText.setColor(Constants.COLORS.CHALK_RED);

            // フライングの場合は爆弾アニメーションを追加
            if (result.isFlying) {
                this.gameLogicState.currentState = QuickCannonLogic.STATE.BOMB_ANIMATION;
                this.gameLogicState.bombAnimationPhase = 'none';
                this.gameLogicState.bombTarget = 'player';
                this.gameLogicState.waitForPlayerAnim = true; // アニメーションを待つ
            } else {
                this.time.delayedCall(1400, () => {
                    this.finish(false);
                });
            }
        } else {
            // 成功の場合は爆弾アニメーション状態へ遷移
            this.gameLogicState.currentState = QuickCannonLogic.STATE.BOMB_ANIMATION;
            this.gameLogicState.bombAnimationPhase = 'none';
            this.gameLogicState.bombTarget = 'announcer';
            // 成功時もプッシュアニメはあるので待機はデフォルト（1400）
            this.gameLogicState.waitForPlayerAnim = true;
        }
    }

    /**
     * 結果処理
     */
    handleResult() {
        const success = QuickCannonLogic.getFinalResult(this.gameLogicState);
        this.finish(success);
    }

    /**
     * ゲーム開始（オーバーライド）
     */
    start() {
        // スタート待機状態
        this.gameState = Constants.GAME_STATE.READY;

        // タップしてスタートのテキスト表示
        const { WIDTH, HEIGHT } = Constants.GAME;
        this.tapToStartText = this.add.text(WIDTH / 2, HEIGHT / 2, '画面をタップしてスタート', {
            fontSize: Constants.FONTS.SIZE_MEDIUM,
            color: Constants.COLORS.CHALK_WHITE,
            fontFamily: Constants.FONTS.MAIN,
            fontStyle: 'bold',
        }).setOrigin(0.5);
        this.tapToStartText.setDepth(100);

        // 画面全体を覆うインタラクティブなゾーンを作成（確実な入力検知のため）
        const startZone = this.add.zone(0, 0, WIDTH, HEIGHT)
            .setOrigin(0)
            .setInteractive();

        // ゾーンのタップリスナー
        startZone.once('pointerdown', () => {
            // AudioContext再開
            if (this.sound.context.state === 'suspended') {
                this.sound.context.resume();
            }

            // テキスト非表示
            this.tapToStartText.setVisible(false);

            // ゾーンを破棄
            startZone.destroy();

            // ゲームロジック初期化（ここから時間計測開始）
            this.gameLogicState = QuickCannonLogic.createInitialState();
            this.lastState = null;

            // ゲーム状態をPLAYINGへ
            this.gameState = Constants.GAME_STATE.PLAYING;
            console.log('QuickCannon started!');

            // 初回のUI更新
            this.updateUI();
        });
    }

    /**
     * CPUアイドルアニメーション更新
     */
    updateCpuIdleAnimation(delta) {
        // プッシュ中は実行しない
        if (this.isCpuPushing) {
            return;
        }

        // 500msごとにフレームを切り替え
        this.cpuIdleAnimTimer += delta;

        if (this.cpuIdleAnimTimer >= 500) {
            this.cpuIdleAnimTimer = 0;

            // フレームを切り替え
            if (this.currentCpuIdleFrame === 1) {
                this.cpuSprite.setTexture('enemy_idle02');
                this.currentCpuIdleFrame = 2;
            } else {
                this.cpuSprite.setTexture('enemy_idle01');
                this.currentCpuIdleFrame = 1;
            }
        }
    }

    /**
     * CPUプッシュアニメーション開始
     */
    playCpuPushAnimation() {
        this.isCpuPushing = true;
        this.cpuPushAnimTimer = 0;
        this.cpuSprite.setTexture('enemy_push01');
    }

    /**
     * CPUプッシュアニメーション更新
     */
    updateCpuPushAnimation(delta) {
        this.cpuPushAnimTimer += delta;

        // 200msでフレーム切り替え
        if (this.cpuPushAnimTimer >= 200 && this.cpuPushAnimTimer < 600) {
            this.cpuSprite.setTexture('enemy_push02');
        }
        // 1400msでアニメーション完了（enemy_push02は長め）、アイドルに戻る
        else if (this.cpuPushAnimTimer >= 1400) {
            this.isCpuPushing = false;
            this.cpuPushAnimTimer = 0;
            this.cpuSprite.setTexture('enemy_idle02'); // 指定の通りidle02に戻す
            this.currentCpuIdleFrame = 2;
        }
    }

    /**
     * クリーアップ
     */
    shutdown() {
        super.shutdown();
        this.gameLogicState = null;
    }
}

// グローバルに公開
if (typeof module !== 'undefined' && module.exports) {
    module.exports = QuickCannonScene;
}
