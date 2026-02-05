/**
 * QuickCannonScene.js
 * 早撃ちゲームのシーン
 */
class QuickCannonScene extends MiniGameBase {
    constructor() {
        super(Constants.SCENES.QUICK_CANNON);
        this.logic = new QuickCannonLogic();
    }

    preload() {
        // パスのプレフィックス
        const path = 'minigames/quick_cannon/assets/';

        // 画像
        // 司会者
        this.load.image('announcer_idle01', path + 'characters/announcer/announcer_idle01.png');
        this.load.image('announcer_idle02', path + 'characters/announcer/announcer_idle02.png');
        this.load.image('announcer_fake', path + 'characters/announcer/announcer_fake.png');
        this.load.image('announcer_fire', path + 'characters/announcer/announcer_fire.png');
        this.load.image('announcer_fire01', path + 'characters/announcer/announcer_fire01.png');
        // プレイヤー
        this.load.image('player_idle001', path + 'characters/player/player_idle001.png');
        this.load.image('player_idle002', path + 'characters/player/player_idle002.png');
        this.load.image('player_push001', path + 'characters/player/player_push001.png');
        this.load.image('player_push002', path + 'characters/player/player_push002.png');
        this.load.image('player_fail', path + 'characters/player/player_fail.png');
        // CPU
        this.load.image('enemy_idle01', path + 'characters/enemy/enemy_idle01.png');
        this.load.image('enemy_idle02', path + 'characters/enemy/enemy_idle02.png');
        this.load.image('enemy_push01', path + 'characters/enemy/enemy_push01.png');
        this.load.image('enemy_push02', path + 'characters/enemy/enemy_push02.png');
        // 爆弾
        this.load.image('bomb', path + 'bomb/bomb.png');
        this.load.image('bomb000', path + 'bomb/bomb000.png');
        this.load.image('bomb001', path + 'bomb/bomb001.png');
        this.load.image('bomb002', path + 'bomb/bomb002.png');
        // UI
        this.load.image('fukidashi', path + 'characters/announcer/fukidashi.png');

        // サムネイルと説明用アセット
        this.load.image('qc_samune', path + 'samune.png');
        this.load.audio('se_samune', 'assets/samune.mp3');

        // 音声
        this.load.audio('bgm_happytime', path + 'bgm/happytime.mp3');
        this.load.audio('se_explosion', path + 'se/explosion.mp3');

        // 共通アセット (保険としてロード)
        this.load.image('line', 'assets/line.png');

        // QuickCannon専用ライン
        this.load.image('qc_line', path + 'line.png');
    }

    _create() {
        if (this.retryMode) {
            this.startGame();
        } else {
            this.showInstructions();
        }
    }

    showInstructions() {
        // サムネイル表示 (画面中央より少し上)
        this.thumbnail = this.add.image(Constants.CENTER_X, Constants.CENTER_Y - 150, 'qc_samune').setScale(1.2);

        // 説明文表示 (サムネの下)
        const descriptionText = "ドラくんが「おちんぽ！」と発言した瞬間にボタンを押せ！";
        this.instructionText = this.add.text(Constants.CENTER_X, Constants.CENTER_Y + (this.thumbnail.height / 2) + 40, descriptionText, {
            font: '28px Arial',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4,
            align: 'center',
            wordWrap: { width: Constants.WIDTH - 40 }
        }).setOrigin(0.5, 0);

        // SE再生 (5秒だけ流す)
        this.instructionSe = this.sound.add('se_samune');
        this.instructionSe.play();

        // 5秒後に停止するタイマー
        this.seTimer = this.time.delayedCall(5000, () => {
            if (this.instructionSe && this.instructionSe.isPlaying) {
                this.instructionSe.stop();
            }
        });

        // タップでゲーム開始イベント
        this.inputManager.onTap(() => this.startGame());
        this.inputManager.enable();
    }

    startGame() {
        // インストラクション画面の片付け
        if (this.instructionSe && this.instructionSe.isPlaying) {
            this.instructionSe.stop();
        }
        if (this.seTimer) this.seTimer.remove();

        if (this.thumbnail) this.thumbnail.destroy();
        if (this.instructionText) this.instructionText.destroy();

        // 誤タップ（連打）防止のため一時的に入力無効化 (リトライ時は即座に有効化しても良いが、統一しておく)
        this.inputManager.disable();
        this.time.delayedCall(500, () => {
            this.inputManager.enable();
        });

        // ここから実際のゲーム初期化 (元の_createの内容)
        this.logic.start();

        // 足元のライン (QuickCannon専用)
        // プレイヤー/エネミーの足元付近に配置 (Y = HEIGHT - 250)
        // 画面幅いっぱいに表示
        this.add.image(Constants.CENTER_X, Constants.HEIGHT - 200, 'qc_line')
            .setDisplaySize(Constants.WIDTH, 350)
            .setDepth(50); // キャラクターより奥に表示

        // キャラクター配置
        // 司会者 (中央より少し上 -> 右側へ)
        this.announcer = this.add.sprite(Constants.CENTER_X + 150, Constants.CENTER_Y - 280, 'announcer_idle01').setScale(0.65);
        this.anims.create({
            key: 'announcer_idle',
            frames: [
                { key: 'announcer_idle01' },
                { key: 'announcer_idle02' }
            ],
            frameRate: 4,
            repeat: -1
        });
        this.announcer.play('announcer_idle');

        // 吹き出し & テキスト (左側へ、少し下へ)
        this.fukidashi = this.add.image(Constants.CENTER_X - 150, Constants.CENTER_Y - 300, 'fukidashi').setScale(0.65);
        // 縁取りなし
        this.commandText = this.add.text(this.fukidashi.x, this.fukidashi.y, '...', { font: '45px Arial', fill: '#ffffff' });
        this.commandText.setOrigin(0.5);

        // プレイヤー (左下、さらに上へ)
        this.player = this.add.sprite(Constants.CENTER_X - 150, Constants.HEIGHT - 350, 'player_idle001').setScale(0.65);
        this.anims.create({
            key: 'player_idle',
            frames: [
                { key: 'player_idle001' },
                { key: 'player_idle002' }
            ],
            frameRate: 4,
            repeat: -1
        });
        this.anims.create({
            key: 'player_push',
            frames: [
                { key: 'player_push001' },
                { key: 'player_push002' }
            ],
            frameRate: 8,
            repeat: 0
        });
        this.player.play('player_idle');

        // CPU (右下、さらに上へ)
        this.enemy = this.add.sprite(Constants.CENTER_X + 150, Constants.HEIGHT - 350, 'enemy_idle01').setScale(0.65);
        this.anims.create({
            key: 'enemy_idle',
            frames: [
                { key: 'enemy_idle01' },
                { key: 'enemy_idle02' }
            ],
            frameRate: 4,
            repeat: -1
        });
        this.anims.create({
            key: 'enemy_push',
            frames: [
                { key: 'enemy_push01' },
                { key: 'enemy_push02' }
            ],
            frameRate: 8,
            repeat: 0
        });
        this.enemy.play('enemy_idle');

        // 爆弾（非表示で初期化）
        this.bomb = this.add.sprite(0, 0, 'bomb').setVisible(false).setScale(0.5);
        this.anims.create({
            key: 'bomb_explosion',
            frames: [
                { key: 'bomb000' },
                { key: 'bomb001' },
                { key: 'bomb002' }
            ],
            frameRate: 10,
            repeat: 0
        });

        // 足元のライン (QuickCannon専用)
        // プレイヤー/エネミーの足元付近 (お尻が-350。スケール0.65だと高さ200くらい？足元は-250くらいか)
        // 足元のライン (QuickCannon専用)
        // 下側に調整 (Y=HEIGHT-120あたり)
        // Imageを使用
        this.add.image(Constants.CENTER_X, Constants.HEIGHT - 120, 'line')
            .setDisplaySize(Constants.WIDTH, 5)
            .setDepth(100);

        // BGM再生
        this.soundManager.playBgm('bgm_happytime');

        // タップイベント設定 (ゲーム用)
        this.inputManager.onTap(() => this.onTap());

        // ゲームループ開始
        this.startWaitLoop();
    }


    startWaitLoop() {
        // 次のアクションまでの待機時間を決定
        const waitTime = this.logic.getRandomWaitTime();

        this.time.delayedCall(waitTime, () => {
            if (this.logic.state === 'END') return;

            const nextAction = this.logic.decideNextAction();
            if (nextAction === 'FEINT') {
                this.doFeint();
            } else {
                this.doFire();
            }
        });
    }

    doFeint() {
        this.logic.state = 'FEINT';
        this.announcer.stop();
        this.announcer.setTexture('announcer_fake');

        const feintWords = ['にょっす', 'あっつ', 'おさんぽ！', 'やほ！', 'ドラだよぉ！'];
        const word = feintWords[Math.floor(Math.random() * feintWords.length)];
        this.commandText.setText(word);

        // 少ししてからWAITに戻る
        this.time.delayedCall(1000, () => {
            if (this.logic.state === 'END') return; // 既にお手つき済みの場合など
            this.logic.state = 'WAIT';
            this.announcer.play('announcer_idle');
            this.commandText.setText('...');
            this.startWaitLoop();
        });
    }

    doFire() {
        this.logic.state = 'FIRE';
        this.fireStartTime = this.time.now;

        this.soundManager.stopBgm(); // BGM停止
        this.announcer.stop();
        this.announcer.setTexture('announcer_fire');
        this.commandText.setText('おちんぽ!');

        // 敵の反応タイマーもセット
        this.enemyTimer = this.time.delayedCall(this.logic.ENEMY_REACTION_TIME, () => {
            if (this.logic.state === 'FIRE') {
                // 敵が先に撃った（プレイヤーが遅かった）
                this.resolveRound(false, 'late');
            }
        });
    }

    onTap() {
        if (this.logic.state === 'END') return;

        if (this.logic.state === 'FIRE') {
            // 成功！
            const reactionTime = this.time.now - this.fireStartTime;
            if (reactionTime < this.logic.ENEMY_REACTION_TIME) {
                // 敵のタイマーをキャンセル
                if (this.enemyTimer) this.enemyTimer.remove();
                this.resolveRound(true, 'win');
            } else {
                // ここには来ないはずだが念のため（敵タイマーが先発火するはず）
            }
        } else {
            // お手つき
            this.soundManager.stopBgm(); // BGM停止
            this.resolveRound(false, 'early');
        }
    }

    resolveRound(success, reason) {
        this.logic.state = 'END';
        this.inputManager.disable();

        // どのような結果であっても、プレイヤーがアクションを起こしていればプッシュアニメーション
        // Late（タップなしで負け）の場合は再生しない
        if (reason !== 'late') {
            this.player.play('player_push');
        }

        if (success) {
            // プレイヤー勝利演出
            // announcer_fire01 (黒焦げ) は爆発後に変更するため、ここでは変更しない
            // this.announcer.setTexture('announcer_fire01'); 

            // 0.5秒待ってから爆弾
            this.time.delayedCall(500, () => {
                this.showBombCallback(true);
            });
        } else {
            // プレイヤー敗北
            if (reason === 'late') {
                this.enemy.play('enemy_push'); // 敵射撃アニメーション
            }
            // おてつき(early)の場合もplayer_pushは再生済み

            // 0.5秒待ってから爆弾
            this.time.delayedCall(500, () => {
                this.showBombCallback(false);
            });
        }
    }

    showBombCallback(isPlayerWin) {
        // 爆弾が落ちてくる演出
        const target = isPlayerWin ? this.announcer : this.player;

        this.bomb.setVisible(true);
        // 画面上部から落下
        this.bomb.setPosition(target.x, -100);

        this.tweens.add({
            targets: this.bomb,
            y: target.y,
            duration: 400, // もっと早く
            ease: 'Linear', // 等速落下の方が重い感じが出るかも、あるいはBounceのままでも良いが速度は落とす
            onComplete: () => {
                // 爆発！
                this.soundManager.playSe('se_explosion');
                this.bomb.play('bomb_explosion'); // 爆発アニメーション

                // アニメーション完了を待つのも手だが、ここでは即判定へ
                this.bomb.once('animationcomplete', () => {
                    this.bomb.setVisible(false);
                    if (isPlayerWin) {
                        this.announcer.setTexture('announcer_fire01'); // 爆発後に黒焦げ
                        this.gameWin();
                    } else {
                        this.player.setTexture('player_fail'); // 黒焦げ
                        // アイドルに戻らないようにアニメーションを停止
                        this.player.stop();
                        this.gameLose();
                    }
                });
            }
        });
    }
}
