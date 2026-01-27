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
        this.playerSprite = this.add.rectangle(
            WIDTH * 0.25,
            HEIGHT * 0.7,
            150,
            150,
            0x42a5f5
        );
        this.add.text(WIDTH * 0.25, HEIGHT * 0.8, 'YOU', {
            fontSize: Constants.FONTS.SIZE_SMALL,
            color: Constants.COLORS.CHALK_WHITE,
            fontFamily: Constants.FONTS.MAIN,
        }).setOrigin(0.5);

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
        this.instructionText = this.add.text(WIDTH / 2, HEIGHT * 0.9, '「ちんぽ」が表示されたらタップ!', {
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

        // アイドルアニメーション更新（WAIT状態のみ）
        if (this.gameLogicState.currentState === QuickCannonLogic.STATE.WAIT) {
            this.updateIdleAnimation(delta);
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
                this.commandText.setText('ちんぽ!');
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

        // 失敗の場合は即座に終了
        if (!result.success) {
            this.messageText.setText(result.reason);
            this.messageText.setColor(Constants.COLORS.CHALK_RED);
            this.finish(false);
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
