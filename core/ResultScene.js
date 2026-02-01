/**
 * ResultScene.js
 * リザルト画面シーン
 */

class ResultScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ResultScene' });

        this.success = false;
    }

    /**
     * シーン初期化
     * @param {Object} data - { success: boolean }
     */
    init(data) {
        this.success = data.success || false;
    }

    /**
     * シーン作成
     */
    create() {
        const { WIDTH, HEIGHT } = Constants.GAME;

        // 背景（黒板）
        this.add.rectangle(0, 0, WIDTH, HEIGHT, 0x2d5016).setOrigin(0);

        // 結果テキスト
        const resultText = this.success ? '成功！' : '失敗...';
        const resultColor = this.success ? Constants.COLORS.CHALK_YELLOW : Constants.COLORS.CHALK_RED;

        this.add.text(WIDTH / 2, HEIGHT * 0.3, resultText, {
            fontSize: '96px',
            color: resultColor,
            fontFamily: Constants.FONTS.MAIN,
            fontStyle: 'bold',
        }).setOrigin(0.5);

        // ボタンテキスト
        const buttonText = this.success ? '次のミニゲームへ' : 'もう一度挑戦';
        const buttonY = HEIGHT * 0.6;

        // ボタン背景
        const buttonBg = this.add.rectangle(
            WIDTH / 2,
            buttonY,
            400,
            80,
            0xffffff,
            0.2
        );
        buttonBg.setStrokeStyle(4, 0xffffff);
        buttonBg.setInteractive({ useHandCursor: true });

        // ボタンテキスト
        const button = this.add.text(WIDTH / 2, buttonY, buttonText, {
            fontSize: Constants.FONTS.SIZE_MEDIUM,
            color: Constants.COLORS.CHALK_WHITE,
            fontFamily: Constants.FONTS.MAIN,
            fontStyle: 'bold',
        }).setOrigin(0.5);

        // ホバーエフェクト
        buttonBg.on('pointerover', () => {
            buttonBg.setFillStyle(0xffffff, 0.4);
        });

        buttonBg.on('pointerout', () => {
            buttonBg.setFillStyle(0xffffff, 0.2);
        });

        // クリックイベント
        buttonBg.on('pointerdown', () => {
            // インタラクティブ有効時のみ反応（初期は無効）
            if (buttonBg.input.enabled) {
                this.onButtonClick();
            }
        });

        // 誤操作防止のため、最初は入力を無効化し、1秒後に有効化
        buttonBg.disableInteractive();
        this.time.delayedCall(1000, () => {
            buttonBg.setInteractive({ useHandCursor: true });
        });
    }

    /**
     * ボタンクリック処理
     */
    onButtonClick() {
        if (this.success) {
            // 成功時: 次のミニゲームへ
            if (window.gameManager) {
                window.gameManager.next();
            }
        } else {
            // 失敗時: もう一度挑戦（リトライ）
            if (window.gameManager) {
                window.gameManager.retry();
            }
        }
    }
}

// グローバルに公開
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ResultScene;
}
