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

        // ゲームロジック初期化
        this.gameLogicState = QuickCannonLogic.createInitialState();

        // UI作成
        this.createUI();

        // BGM再生
        this.soundManager.playBGM('bgm_quickcannon');

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
        this.cpuSprite = this.add.rectangle(
            WIDTH * 0.75,
            HEIGHT * 0.7,
            150,
            150,
            0xff5252
        );
        this.add.text(WIDTH * 0.75, HEIGHT * 0.8, 'CPU', {
            fontSize: Constants.FONTS.SIZE_SMALL,
            color: Constants.COLORS.CHALK_WHITE,
            fontFamily: Constants.FONTS.MAIN,
        }).setOrigin(0.5);

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

        // UI更新
        this.updateUI();

        // アイドルアニメーション更新（WAIT状態とFEINT状態）
        if (this.gameLogicState.currentState === QuickCannonLogic.STATE.WAIT ||
            this.gameLogicState.currentState === QuickCannonLogic.STATE.FEINT) {
            this.updateIdleAnimation(delta);
            this.updatePlayerIdleAnimation(delta);
        }

        // プレイヤープッシュアニメーション更新
        if (this.isPlayerPushing) {
            this.updatePlayerPushAnimation(delta);
        }

        // 結果判定
        if (this.gameLogicState.currentState === QuickCannonLogic.STATE.RESULT) {
            this.handleResult();
        }
    }

    /**
     * UI更新
     */
    updateUI() {
        const state = this.gameLogicState;

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

                // CPU射撃アニメーション
                if (state.isCPUShooted) {
                    this.cpuSprite.setFillStyle(0xff9800);
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

            // 爆弾スプライトを作成（画面上部、司会者の横）
            this.bombSprite = this.add.sprite(
                this.hostSprite.x - 50,
                -100,
                'bomb'
            );
            this.bombSprite.setScale(0.3);
        }

        const elapsed = now - state.bombAnimationStartTime;

        // プレイヤープッシュアニメーション完了を待つ（1400ms遅延）
        const pushAnimationDelay = 1400;

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
            const targetY = this.hostSprite.y;
            const easing = progress * progress; // 加速
            this.bombSprite.y = -100 + (targetY + 100) * easing;

            if (progress >= 1) {
                state.bombAnimationPhase = 'exploding';
                state.explosionFrame = 0;

                // 爆弾スプライトを非表示
                this.bombSprite.setVisible(false);

                // 爆発スプライトを作成
                this.explosionSprite = this.add.sprite(
                    this.hostSprite.x - 50,
                    this.hostSprite.y,
                    'bomb000'
                );
                this.explosionSprite.setScale(0.4);

                // 爆発SE再生
                this.soundManager.playSE('se_success');
            }
        }
        // フェーズ2: 爆発アニメーション（2200-2800ms）
        else if (state.bombAnimationPhase === 'exploding') {
            const explosionStartTime = pushAnimationDelay + 800; // 1400 + 800 = 2200ms
            const explosionElapsed = elapsed - explosionStartTime;
            const frameTime = 200; // 各フレーム200ms

            const frame = Math.floor(explosionElapsed / frameTime);

            if (frame !== state.explosionFrame && frame < 3) {
                state.explosionFrame = frame;
                const textures = ['bomb000', 'bomb001', 'bomb002'];
                this.explosionSprite.setTexture(textures[frame]);
            }

            if (explosionElapsed >= frameTime * 3) {
                state.bombAnimationPhase = 'burning';

                // 爆発スプライトを非表示
                this.explosionSprite.setVisible(false);

                // 司会者を燃えた状態に変更
                this.hostSprite.setTexture('announcer_fire01');
            }
        }
        // フェーズ3: 燃えた状態を表示（2800-4800ms）
        else if (state.bombAnimationPhase === 'burning') {
            const burningStartTime = pushAnimationDelay + 800 + 600; // 1400 + 800 + 600 = 2800ms
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

        // ゲームロジックでタップ処理
        const result = QuickCannonLogic.handlePlayerTap(this.gameLogicState);

        // SE再生
        this.soundManager.playSE('se_shoot');

        // プレイヤープッシュアニメーションを開始
        this.playPlayerPushAnimation();

        // 失敗の場合はアニメーション完了後に終了
        if (!result.success) {
            this.messageText.setText(result.reason);
            this.messageText.setColor(Constants.COLORS.CHALK_RED);

            // プッシュアニメーション完了後に終了（1400ms後）
            this.time.delayedCall(1400, () => {
                this.finish(false);
            });
        } else {
            // 成功の場合は爆弾アニメーション状態へ遷移
            this.gameLogicState.currentState = QuickCannonLogic.STATE.BOMB_ANIMATION;
            this.gameLogicState.bombAnimationPhase = 'none';
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
        this.gameState = Constants.GAME_STATE.PLAYING;
        console.log('QuickCannon started!');
    }

    /**
     * クリーンアップ
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
