/**
 * TitleScene.js
 * タイトル画面
 * 共通アセットのロードもここで行う（簡易的）
 */
class TitleScene extends Phaser.Scene {
    constructor() {
        super({ key: Constants.SCENES.TITLE });
    }

    preload() {
        // 共通アセットのロード
        this.load.image(Constants.ASSETS.BG, 'assets/bg.png');
        this.load.image(Constants.ASSETS.LIFE, 'assets/life/life.png');
        this.load.image(Constants.ASSETS.GAMEOVER, 'assets/gameover/gameover.png');
        this.load.image('line', 'assets/line.png');

        // ※本来はPreloadSceneを作ってそこで一括ロードするほうが良いが、
        // 今回は要件に従いTitleSceneでロードする。
        // ミニゲーム固有のアセットは各ミニゲームのSceneでロードすることを推奨するが、
        // 画面遷移をスムーズにするならここで全部読み込む設計もアリ。
        // 今回はQuickCannonのアセットもここで読み込んでおくか、
        // あるいはQuickCannonSceneでpreloadするか。
        // Phaserはシーン開始時にpreloadが走るので、各シーンでロードで問題ない。
    }

    create() {
        // 背景
        // まだアセットがロードされていない可能性（エラーなど）を考慮しつつ配置
        // 本来はローディングバーを出すべき
        this.add.image(Constants.CENTER_X, Constants.CENTER_Y, Constants.ASSETS.BG)
            .setDisplaySize(Constants.WIDTH, Constants.HEIGHT);

        // タイトルテキスト
        const titleText = this.add.text(Constants.CENTER_X, Constants.CENTER_Y - 100, 'GANBARE', Constants.FONTS.TITLE);
        titleText.setOrigin(0.5);

        // Tap to Start
        const startText = this.add.text(Constants.CENTER_X, Constants.CENTER_Y + 100, 'Tap to Start', Constants.FONTS.DEFAULT);
        startText.setOrigin(0.5);

        // 点滅アニメーション
        this.tweens.add({
            targets: startText,
            alpha: 0,
            duration: 800,
            ease: 'Power2',
            yoyo: true,
            loop: -1
        });

        // 入力待ち
        this.input.once('pointerdown', () => {
            this.startGame();
        });
    }

    startGame() {
        // ゲームマネージャーのリセット
        GameManager.getInstance().resetGame();

        // 最初のミニゲームへ遷移
        const nextScene = GameManager.getInstance().getNextMiniGame();
        this.scene.start(nextScene, { retry: false });
    }
}
