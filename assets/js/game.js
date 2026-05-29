class Game {
    constructor() {
        this.isRunning = false;
        this.slackCooldown = false;
        this.slackCooldownTimer = null;
        this._init();
    }

    _init() {
        eventBus.on('game:start', () => this.startGame());
        eventBus.on('game:slack', () => this.handleSlack());
        eventBus.on('game:prologueComplete', () => this.onPrologueComplete());
        eventBus.on('game:monthStart', () => this.onMonthStart());
        eventBus.on('game:newMonth', () => this.onNewMonth());
        eventBus.on('ui:choiceSelected', (data) => this.handleChoice(data));

        eventBus.on('state:loaded', () => {
            skillSystem.restoreFromGameState();
        });

        if (saveSystem.hasSaves()) {
            this._showContinuePrompt();
        }
    }

    _showContinuePrompt() {
        saveSystem.showContinuePrompt();
    }

    startGame() {
        if (this.isRunning) return;
        this.isRunning = true;

        mainUI.showMainScreen();

        if (gameState.phase === 'intro') {
            gameState.phase = 'prologue';
            dialogueUI.playPrologue();
        } else {
            this.onMonthStart();
        }
    }

    onPrologueComplete() {
        gameState.phase = 'main';
        this.onMonthStart();
    }

    onMonthStart() {
        taskSystem.generateMonthlyTasks();
        cardSystem.dealHand();
        eventBus.emit('match:reset');

        economySystem.monthlySettlement();

        this._checkMilestone();

        this._showMonthBanner();

        this._showContextWarnings();

        this._showCardHand();
    }

    onNewMonth() {
        economySystem.paySalary();
        
        // 健康恢复（每月自动恢复一部分）
        const healthRecovery = 10 + Math.floor(gameState.health / 20) * 5;
        gameState.health = Math.min(gameState.maxHealth, gameState.health + healthRecovery);
        eventBus.emit('ui:showMessage', {
            text: `🌿 经过一个月的休养，健康恢复了 ${healthRecovery} 点`,
            type: 'success'
        });
        
        // 压力自然缓解
        const stressRelief = 5 + Math.floor(gameState.stressAbility / 10);
        gameState.stress = Math.max(0, gameState.stress - stressRelief);
        eventBus.emit('ui:showMessage', {
            text: `😌 时间冲淡了一切，压力缓解了 ${stressRelief} 点`,
            type: 'success'
        });
        
        dialogueUI.playNewMonth();
    }

    _showMonthBanner() {
        const month = gameState.month;
        const banners = [
            '🌅 新的一月，新的开始',
            '☀️ 阳光照进办公室',
            '🏢 又是元气满满的一个月',
            '📋 桌上的文件又多了一叠',
            '⏰ 打卡上班，准时准点'
        ];
        const banner = banners[month % banners.length];
        eventBus.emit('ui:showMessage', {
            text: timeSystem.getSeasonDescription(),
            type: 'narration'
        });
        eventBus.emit('ui:showMessage', {
            text: `━━━ 第${month}月 ━━━`,
            type: 'system'
        });
        eventBus.emit('ui:showMessage', {
            text: timeSystem.getMonthDescription(),
            type: 'narration'
        });
    }

    _checkMilestone() {
        const month = gameState.month;
        const milestones = {
            3: { title: '🎉 三个月纪念', msg: '试用期终于结束了！你正式成为体制内的一员。', reward: { exp: 100, reputation: 10 } },
            6: { title: '🎊 半年了', msg: '半年过去了，你已经完全适应了这里的节奏。', reward: { exp: 200, reputation: 15 } },
            12: { title: '🏆 一周年', msg: '整整一年！从菜鸟到老油条，你完成了蜕变。', reward: { exp: 500, reputation: 25 } },
            24: { title: '🌟 两周年', msg: '两年了，新人看你的眼神都带着敬意。', reward: { exp: 800, reputation: 30 } },
            36: { title: '🎖️ 三周年', msg: '三年过去，你已经是办公室的"元老"了。', reward: { exp: 1200, reputation: 40 } },
            60: { title: '👑 五周年', msg: '五年了！你见证了单位三任领导的更迭。', reward: { exp: 2000, reputation: 50 } },
            120: { title: '🐉 十周年', msg: '十年体制人！你的青春都献给了这座大楼。', reward: { exp: 5000, reputation: 80 } }
        };

        if (milestones[month]) {
            const m = milestones[month];
            this._showToast(m.msg, 'milestone');
            eventBus.emit('ui:showMessage', {
                text: `${m.title} — ${m.msg}`,
                type: 'success'
            });
            if (m.reward.exp) {
                gameState.exp += m.reward.exp;
                eventBus.emit('ui:showMessage', {
                    text: `里程碑奖励：经验 +${m.reward.exp}${m.reward.reputation ? '，声望 +' + m.reward.reputation : ''}`,
                    type: 'success'
                });
            }
            if (m.reward.reputation) {
                gameState.modifyStat('reputation', m.reward.reputation);
            }
            eventBus.emit('audio:play', { type: 'levelup' });
        }
    }

    _showContextWarnings() {
        const energy = gameState.energy;
        const stress = gameState.stress;
        const maxEnergy = gameState.maxEnergy;
        const maxStress = gameState.maxStress;

        if (energy <= 15 && energy > 0) {
            const warnings = [
                '⚠️ 你感觉眼皮在打架，精力已经见底了……',
                '⚠️ 头昏脑胀，再不休息就要猝死了！',
                '⚠️ 你的身体在抗议：求求你歇歇吧！',
                '⚠️ 精力条已经红了，建议赶紧找杯咖啡。'
            ];
            eventBus.emit('ui:showMessage', {
                text: warnings[Math.floor(Math.random() * warnings.length)],
                type: 'warning'
            });
        }

        if (energy <= 0) {
            eventBus.emit('ui:showMessage', {
                text: '🚨 精力耗尽！你感觉随时可能倒在办公桌上！',
                type: 'warning'
            });
            this._showToast('精力耗尽！请休息！', 'danger');
        }

        if (stress >= 80) {
            const symptoms = [
                '😰 你感觉太阳穴突突直跳，手开始微微发抖……',
                '😰 胸口闷得慌，深呼吸也没用……',
                '😰 你开始怀疑人生的选择……',
                '😰 耳鸣、心悸、失眠三件套凑齐了……'
            ];
            eventBus.emit('ui:showMessage', {
                text: symptoms[Math.floor(Math.random() * symptoms.length)],
                type: 'warning'
            });
            this._showToast('压力过高！注意调节！', 'danger');
        } else if (stress >= 60) {
            const mildSymptoms = [
                '😮‍💨 有点烦躁，总想摔东西……',
                '😮‍💨 肩膀僵硬得像块石头……',
                '😮‍💨 叹气的次数越来越多了……'
            ];
            eventBus.emit('ui:showMessage', {
                text: mildSymptoms[Math.floor(Math.random() * mildSymptoms.length)],
                type: 'system'
            });
        }

        if (gameState.reputation <= 15) {
            eventBus.emit('ui:showMessage', {
                text: '📉 你感觉同事看你的眼神有些异样……声望太低了。',
                type: 'warning'
            });
        }

        // 健康警告
        if (gameState.health <= 20) {
            eventBus.emit('ui:showMessage', {
                text: '🏥 你的身体状况非常糟糕，应该尽快去医院看看！',
                type: 'warning'
            });
            this._showToast('⚠️ 健康危险！请立即就医！', 'danger');
        } else if (gameState.health <= 40) {
            const healthWarnings = [
                '🤧 你开始频繁地咳嗽，免疫力明显下降了……',
                '🤒 头痛欲裂，应该是长期亚健康导致的……',
                '😷 你的脸色很差，同事都来问你还好吗……'
            ];
            eventBus.emit('ui:showMessage', {
                text: healthWarnings[Math.floor(Math.random() * healthWarnings.length)],
                type: 'warning'
            });
        }
    }

    _showToast(message, type) {
        eventBus.emit('ui:showToast', { text: message, type });
    }

    _showCardHand() {
        mainUI.renderCardHand(cardSystem.hand, (index, card, el) => this._onPlayCard(index, card, el));
        mainUI.renderPlayedSlots(cardSystem.playedCards);

        const hint = cardSystem.getMatchHint();
        if (hint) mainUI.showMatchHint(hint);

        this._showCardUtilityChoices();
    }

    _onPlayCard(index, card, el) {
        const phaseNames = ['🌅 上旬', '☀️ 中旬', '🌙 下旬'];
        const currentStep = cardSystem.playedCards.length;

        el.classList.add('card-playing');
        el.style.pointerEvents = 'none';
        el.style.opacity = '0.4';

        eventBus.emit('ui:showMessage', {
            text: `🎴 打出「${card.icon} ${card.name}」${phaseNames[currentStep]}`,
            type: 'system'
        });

        const cardDesc = this._getCardDescription(card);
        if (cardDesc) {
            eventBus.emit('ui:showMessage', {
                text: cardDesc,
                type: 'narration'
            });
        }

        const cardResult = cardSystem.applyCard(card);

        if (cardResult && cardResult.extraMessages) {
            cardResult.extraMessages.forEach(msg => {
                eventBus.emit('ui:showMessage', { text: msg, type: 'narration' });
            });
        }

        if (!card.isEvent && !card.isCurse) {
            if (card.rewards.exp) {
                eventBus.emit('ui:showMessage', {
                    text: `经验 +${card.rewards.exp}`,
                    type: 'success'
                });
            }
            if (card.rewards.reputation) {
                eventBus.emit('ui:showMessage', {
                    text: `声望 +${card.rewards.reputation}`,
                    type: 'success'
                });
            }
            if (card.rewards.connections) {
                eventBus.emit('ui:showMessage', {
                    text: `人脉 +${card.rewards.connections}`,
                    type: 'success'
                });
            }
            if (card.rewards.health) {
                eventBus.emit('ui:showMessage', {
                    text: `健康 +${card.rewards.health}`,
                    type: 'success'
                });
            }
        }

        const result = cardSystem.playCard(index);

        if (result.isComplete) {
            setTimeout(() => {
                const allSame = result.allSame;
                const matchType = result.matchType;

                if (allSame) {
                    const bonus = cardSystem.getMatchBonus(matchType);
                    cardSystem.resolveMatch(bonus);

                    const typeNames = { work: '📋工作', social: '🍵社交', rest: '☕休息', study: '📚学习', special: '🎲事件' };
                    const bonusText = [];
                    if (bonus.reputation) bonusText.push(`声望+${bonus.reputation}`);
                    if (bonus.exp) bonusText.push(`经验+${bonus.exp}`);
                    if (bonus.connections) bonusText.push(`人脉+${bonus.connections}`);
                    if (bonus.energy) bonusText.push(`精力+${bonus.energy}`);
                    if (bonus.stress) bonusText.push(`压力-${bonus.stress}`);

                    eventBus.emit('ui:showMessage', {
                        text: `🎯 三消成功！${typeNames[matchType]}×3！\n🏆 奖励: ${bonusText.join(', ')}`,
                        type: 'achievement'
                    });
                    this._showToast(`🎉 三消！${typeNames[matchType]}×3`, 'achievement');
                    eventBus.emit('ui:showScreenFlash', 'success');
                } else {
                    const typeLabels = { work: '📋', social: '🍵', rest: '☕', study: '📚', special: '🎲' };
                    const cardsStr = result.cards.map(c => typeLabels[c.activityType] || '❓').join(' → ');
                    eventBus.emit('ui:showMessage', {
                        text: `📋 本月行程：${cardsStr}`,
                        type: 'system'
                    });
                }

                const phaseNames = ['🌅 上旬', '☀️ 中旬', '🌙 下旬'];
                eventBus.emit('ui:showMessage', {
                    text: `📅 一个月过去了…… ${phaseNames[0]}→${phaseNames[1]}→${phaseNames[2]}`,
                    type: 'narration'
                });

                for (let i = 0; i < 3; i++) {
                    timeSystem.advancePhase();
                }

                eventBus.emit('game:newMonth');
            }, 800);
        } else {
            setTimeout(() => {
                mainUI.renderPlayedSlots(cardSystem.playedCards);
                mainUI.renderCardHand(cardSystem.hand, (i, c, e) => this._onPlayCard(i, c, e));

                const hint = cardSystem.getMatchHint();
                if (hint) mainUI.showMatchHint(hint);

                this._showCardUtilityChoices();
            }, 400);
        }
    }

    _getCardDescription(card) {
        const descriptions = {
            document: [
                '你翻开一份红头文件，密密麻麻的条款让人头皮发麻……',
                '桌上又堆了一摞待批公文，你深吸一口气开始处理……',
                '领导批转的文件到了，你开始逐字逐句地审阅……',
                '张主任推开门递给你一沓文件："这个急要，下班前给我。"',
                '你打开OA系统，发现待办事项又多了十几条。'
            ],
            meeting: [
                '领导要开会了，你赶紧准备会议材料和茶水……',
                '会议室里领导正在讲话，你认真做着会议记录……',
                '又是冗长的大会，领导讲话滔滔不绝，你努力保持清醒……',
                '部门例会开始了，大家轮流汇报工作，你临时抱佛脚地翻着笔记本。',
                '领导清了清嗓子："下面我简单讲两句……"你知道至少半小时起步。'
            ],
            research: [
                '你背起包出发调研，笔记本和录音笔是标配……',
                '基层调研走起！你拿着调研提纲走访各部门收集情况……',
                '你走进基层单位，开始了解第一手情况……',
                '你和同事小王一起外出调研，路上他跟你八卦了隔壁处室的陈年旧事。',
                '为了写那份调研报告，你拜访了三个部门、开了两次座谈会。'
            ],
            social: [
                '你端起茶杯，走向同事的工位……',
                '饭局开始了，你举起酒杯开始社交……',
                '你和几位同事在茶水间聊了起来……',
                '食堂排队时你和财务科的小李聊了起来，她抱怨这个月工资条又少了几项。',
                '走廊里碰到了隔壁处室的张主任，你热情地打了个招呼。'
            ],
            rest: [
                '你泡了杯枸杞茶，靠在椅背上闭目养神……',
                '你伸了个懒腰，决定给自己放个小假……',
                '你偷偷闭上眼睛，享受片刻的宁静……',
                '你趴在桌上眯了十分钟，醒来发现笔记本上压出了一道口水印。',
                '你走到走廊尽头的窗户前，看着楼下的车水马龙发呆。'
            ],
            lunch_nap: [
                '午休时间到了，你趴在桌上准备小睡一会儿……',
                '你拿出午睡枕，调好闹钟，准备做一个短暂的美梦。',
                '办公室的灯关了，你闭上眼睛，听着空调的嗡嗡声慢慢入睡……',
                '你趴在桌上眯了二十分钟，醒来感觉整个人都重生了。',
                '午休时间，你戴上眼罩和耳塞，把自己和这个世界隔离开来。'
            ],
            walk_break: [
                '你决定下楼走走，呼吸一下新鲜空气……',
                '办公楼后面的小花园里，你沿着小路慢慢踱步。',
                '你走出大楼，阳光洒在脸上，你深吸一口气，感觉压力消散了不少。',
                '你在街边的长椅上坐了一会儿，看着来往的行人发呆。'
            ],
            snack_time: [
                '你打开抽屉，拿出一包囤了很久的小饼干……',
                '你走到零食角，拆了一包薯片，咔嚓咔嚓的声音让隔壁同事投来羡慕的目光。',
                '你泡了一杯速溶咖啡，配上一块巧克力——这是你今天的小确幸。',
                '你从包里掏出一个苹果，洗了洗，清脆地咬了一口。'
            ],
            chat_break: [
                '你端着水杯走到小李的工位旁，开始闲聊今天的八卦……',
                '茶水间里，你和几个同事聊起了最近的热播剧。',
                '你发现隔壁处的小王也在摸鱼，你们对视一眼，默契地笑了。',
                '你在走廊里碰到一个好久不见的老同事，站在窗边聊了十分钟。'
            ],
            study: [
                '你翻开最新的政策文件，开始认真学习……',
                '你打开学习强国，开始今天的充电……',
                '你拿出一本业务书籍，开始啃了起来……',
                '你登录了公务员在线学习平台，开始了必修课的学习。',
                '你把过去一年的政策文件按主题分类整理，做了一份详尽的思维导图。'
            ],
            report: [
                '你打开一个空白Word文档，光标一闪一闪地盯着你——又是写报告的时刻。',
                '领导要求你写一份季度工作总结，你翻出之前的模板开始改日期和数字。',
                '上级催交材料了，你深呼吸一口，打开了那篇写了一半的文档。',
                '你需要在明天之前完成一份可行性分析报告，今晚注定无眠。'
            ],
            inspection: [
                '走廊里弥漫着消毒水的味道——上级要来检查了！你开始疯狂补材料。',
                '你对照检查清单一项一项地过，发现有三分之一的文件还没归档。',
                '全处进入"迎检模式"：所有人面色凝重，走路带风。',
                '领导拍了拍你的肩膀："这次检查就靠你的材料了。"'
            ],
            speech: [
                '王局要在全市大会上发言，你需要为他起草一份讲话稿。',
                '你对着领导的讲话风格反复琢磨——要铿锵有力，又要接地气。',
                '领导说要"有高度、有深度、有温度"，你挠了挠头开始构思。',
                '你花了三个小时写好了讲话稿，自信满满地发给了领导——然后收到了满屏修改批注。'
            ],
            training: [
                '局里组织了业务培训班，你拿着笔记本走进会议室准备好好学习。',
                '你被安排给新入职的同事做业务培训，你暗暗庆幸自己终于不是资历最浅的了。',
                '今天的培训主题是公文写作规范，讲师是一位满头白发的老科长。',
                '培训结束后有一个小测验，你偷偷瞄了一眼旁边同事的答案。'
            ],
            hot_potato: [
                '领导把你叫到办公室，笑眯眯地看着你："有个事儿交给你……"你心里咯噔一下。',
                '这是一个谁都不想接的烫手山芋，但它偏偏落在了你手里。',
                '同事悄悄告诉你，这个任务已经换了三个人了。你是第四个。'
            ],
            overtime: [
                '下班前十分钟，领导走过来："今晚加个班，明天要。"你的下班计划泡汤了。',
                '办公室的灯一盏盏熄灭，只有你的工位还亮着。窗外万家灯火。',
                '你看了看时间——晚上十点。打印机还在哗啦啦地吐纸，你叹了口气。'
            ],
            cross_dept: [
                '你被抽调去参加一个跨部门协作项目，办公室里多了几张陌生的面孔。',
                '和其他部门的同事一起工作，你发现每个科室的生态都不一样。',
                '跨部门会议开始了，你惊讶地发现原来隔壁科室的人和你们说的是同一种"官话"。'
            ],
            inspection_visit: [
                '上级领导要来视察了！全处上下一片繁忙，你也被拉去帮忙准备。',
                '你负责接待工作，从会议室布置到路线安排，每一个细节都不能出错。',
                '领导的脚步越来越近了，你深呼吸，站直了身体。'
            ],
            coworker_help: [
                '隔壁工位的老张一脸为难地走过来："兄弟，帮我个忙……"',
                '同事急着下班接孩子，把没干完的活拜托给了你。',
                '"就这一次，下次我请你吃饭！"——你听到这句话的次数已经数不清了。'
            ],
            surprise_check: [
                '突然接到通知：上级检查组已经到了楼下！你手忙脚乱地开始收拾桌面。',
                '没有预兆，没有准备，检查组就这么来了。你的心脏开始狂跳。',
                '你以最快的速度把所有不该出现的东西都塞进了抽屉。'
            ],
            gossip: [
                '你去茶水间接水时，发现身后的窃窃私语在你进门的那一刻突然停住了。',
                '同事发来一条消息："你听说了吗？他们都说是你……"你一头雾水。',
                '办公室流传着一个关于你的离谱谣言，你哭笑不得。'
            ]
        };

        const pool = descriptions[card.type] || [`你开始${card.name}……`];
        return pool[Math.floor(Math.random() * pool.length)];
    }

    _onAllCardsPlayed(result) {
        const allSame = result.allSame;
        const matchType = result.matchType;

        if (allSame) {
            const bonus = cardSystem.getMatchBonus(matchType);
            cardSystem.resolveMatch(bonus);

            const typeNames = { work: '📋工作', social: '🍵社交', rest: '☕休息', study: '📚学习', special: '🎲事件' };
            this._showToast(`🎉 三消！${typeNames[matchType]}×3`, 'achievement');
        }

        for (let i = 0; i < 3; i++) {
            timeSystem.advancePhase();
        }

        eventBus.emit('game:newMonth');
    }

    _showCardUtilityChoices() {
        const actions = [];

        if (gameState.money >= 200) {
            actions.push({
                text: '💆 按摩放松 (-200元, 压力-20, 精力+10)',
                callback: () => {
                    economySystem.spendMoney(200, '按摩');
                    gameState.modifyStat('stress', -20);
                    gameState.modifyStat('energy', 10);
                    eventBus.emit('ui:showMessage', {
                        text: '💆 全身按摩，舒服多了！',
                        type: 'success'
                    });
                    setTimeout(() => this._showCardHand(), 300);
                }
            });
        }

        if (gameState.health <= 50 && gameState.money >= 300) {
            actions.push({
                text: '🏥 体检 (-300元, 健康+25)',
                callback: () => {
                    economySystem.spendMoney(300, '医疗');
                    gameState.modifyStat('health', 25);
                    eventBus.emit('ui:showMessage', {
                        text: '🏥 体检完毕，安心多了！',
                        type: 'success'
                    });
                    setTimeout(() => this._showCardHand(), 300);
                }
            });
        }

        const canReroll = gameState.energy >= 30;
        actions.push({
            text: `🔄 重发手牌${canReroll ? ' (精力-30)' : ' (精力不足)'}`,
            callback: () => {
                if (!canReroll) {
                    eventBus.emit('ui:showMessage', {
                        text: '😵 精力不足，无法重发手牌！',
                        type: 'warning'
                    });
                    return;
                }
                gameState.modifyStat('energy', -30);
                cardSystem.dealHand();
                eventBus.emit('ui:showMessage', {
                    text: '🔄 手牌已重新发放！',
                    type: 'system'
                });
                setTimeout(() => this._showCardHand(), 300);
            }
        });

        actions.push({ text: '📊 查看状态', callback: () => { this.showStatus(); setTimeout(() => this._showCardHand(), 300); } });
        actions.push({ text: '🎯 游戏目标', callback: () => { gameGoals.showGoalsPanel(); setTimeout(() => this._showCardHand(), 300); } });
        actions.push({ text: '🏆 查看成就', callback: () => { this.showAchievements(); setTimeout(() => this._showCardHand(), 300); } });
        actions.push({ text: `⭐ 技能树 (${skillSystem.getSkillPoints()}点)`, callback: () => { this.showSkillTree(); setTimeout(() => this._showCardHand(), 300); } });
        actions.push({ text: '💾 保存游戏', callback: () => this.saveGame() });

        mainUI.showUtilityActions(actions);
    }

    showSkillTree() {
        skillTreeUI.showSkillTree();
        setTimeout(() => this._showCardHand(), 300);
    }

    showAchievements() {
        if (typeof achievementSystem !== 'undefined') {
            achievementSystem.showAchievementUI();
        } else {
            eventBus.emit('ui:showModal', {
                title: '成就',
                content: '成就系统加载中，请稍后再试。',
                buttons: [{ text: '返回', callback: () => {} }]
            });
        }
        setTimeout(() => this._showCardHand(), 300);
    }

    _getTaskStartDescription(task) {
        const season = timeSystem._getSeason();
        const seasonPrefix = {
            spring: '春日的阳光透过窗户洒在办公桌上，',
            summer: '夏日的蝉鸣透过窗户隐约传来，',
            autumn: '窗外的梧桐叶随风飘落，',
            winter: '窗外的寒风呼啸，办公室里暖气片咕噜作响，'
        }[season] || '';

        const descriptions = {
            document: [
                `${seasonPrefix}你翻开一份红头文件，密密麻麻的条款让人头皮发麻……`,
                `${seasonPrefix}桌上又堆了一摞待批公文，你深吸一口气开始处理……`,
                `${seasonPrefix}领导批转的文件到了，你开始逐字逐句地审阅……`,
                `${seasonPrefix}又是一份红头文件！你打开Word开始排版……`,
                `${seasonPrefix}通知、报告、请示、批复……公文的世界深不可测，你埋头其中……`,
                `${seasonPrefix}你拿起笔，开始在那份盖满红章的文件上圈圈点点……`,
                `${seasonPrefix}张主任推开门，递给你一沓文件："这个急要，下班前给我。"你看了一眼时间，叹了口气。`,
                `${seasonPrefix}一份来自上级部门的机密文件，你核对了一遍又一遍，生怕出错。`,
                `${seasonPrefix}电脑屏幕上开满了窗口：发文、收文、拟稿、核稿……你觉得自己像是操作宇宙飞船。`,
                `${seasonPrefix}你打开OA系统，发现待办事项又多了十几条，默默关上了浏览器。`,
            ],
            meeting: [
                `${seasonPrefix}领导要开会了，你赶紧准备会议材料和茶水……`,
                `${seasonPrefix}会议室里领导正在讲话，你认真做着会议记录……`,
                `${seasonPrefix}又是冗长的大会，领导讲话滔滔不绝，你努力保持清醒……`,
                `${seasonPrefix}你搬着厚厚的材料走进会议室，准备迎接又一场持久战……`,
                `${seasonPrefix}会议议程排得满满当当，你开始布置会场、调试设备……`,
                `${seasonPrefix}领导清了清嗓子："下面我简单讲两句……"你知道至少半小时起步……`,
                `${seasonPrefix}今天开的是全局大会，你负责签到和倒水，忙得脚不沾地。`,
                `${seasonPrefix}部门例会开始了，大家轮流汇报工作，你临时抱佛脚地翻着笔记本。`,
                `${seasonPrefix}视频会议调试完毕，你确认了每一个参会方的画面和声音都正常。`,
                `${seasonPrefix}李科长在台上做报告，你在台下疯狂记笔记——虽然有一半是会议纪要，另一半是涂鸦。`,
            ],
            research: [
                `${seasonPrefix}你背起包出发调研，笔记本和录音笔是标配……`,
                `${seasonPrefix}基层调研走起！你踏上了走访的道路……`,
                `${seasonPrefix}你拿着调研提纲，开始走访各部门收集情况……`,
                `${seasonPrefix}又是下乡调研，你准备好了一肚子的官方话术……`,
                `${seasonPrefix}你走进基层单位，开始了解第一手情况……`,
                `${seasonPrefix}调研报告还没写，先出去跑跑腿收集素材吧……`,
                `${seasonPrefix}上级要求做一份关于XX领域的情况调研，你连夜查阅了上百份资料。`,
                `${seasonPrefix}你和同事小王一起外出调研，路上他跟你八卦了隔壁处室的陈年旧事。`,
                `${seasonPrefix}你来到基层窗口单位蹲点，观察了一天群众办事的真实情况。`,
                `${seasonPrefix}为了写那份调研报告，你拜访了三个部门、开了两次座谈会、翻了五年档案。`,
            ],
            social: [
                `${seasonPrefix}你端起茶杯，走向同事的工位……`,
                `${seasonPrefix}饭局开始了，你举起酒杯开始社交……`,
                `${seasonPrefix}你和几位同事在茶水间聊了起来……`,
                `${seasonPrefix}领导叫你一起去应酬，你整理了一下着装……`,
                `${seasonPrefix}你拿起手机，给几个关键人物发了问候消息……`,
                `${seasonPrefix}走廊里碰到了隔壁处室的张主任，你热情地打了个招呼……`,
                `${seasonPrefix}食堂排队时你和财务科的小李聊了起来，她抱怨这个月工资条又少了几项。`,
                `${seasonPrefix}下班后同事约你去撸串，你犹豫了一下，还是去了——社交也是工作的一部分。`,
                `${seasonPrefix}新来的实习生叫你"老师"，你表面淡定内心窃喜，决定请她喝杯奶茶。`,
                `${seasonPrefix}领导在微信群里发了一个红包，你凭借着过人的手速抢到了最大的——虽然只有三块五。`,
            ],
            rest: [
                `${seasonPrefix}你泡了杯枸杞茶，靠在椅背上闭目养神……`,
                `${seasonPrefix}你伸了个懒腰，决定给自己放个小假……`,
                `${seasonPrefix}你偷偷闭上眼睛，享受片刻的宁静……`,
                `${seasonPrefix}你起身活动了一下僵硬的脖子，在窗边站了一会儿……`,
                `${seasonPrefix}你打开抽屉拿出一包零食，犒劳一下自己……`,
                `${seasonPrefix}你戴上耳机，播放了白噪音，假装在认真听会其实在放空大脑。`,
                `${seasonPrefix}你趴在桌上眯了十分钟，醒来发现笔记本上压出了一道口水印。`,
                `${seasonPrefix}你去洗手间洗了把脸，看着镜子里疲惫的自己，挤出一个微笑。`,
                `${seasonPrefix}你走到走廊尽头的窗户前，看着楼下的车水马龙发呆。`,
            ],
            study: [
                `${seasonPrefix}你翻开最新的政策文件，开始认真学习……`,
                `${seasonPrefix}你打开学习强国，开始今天的充电……`,
                `${seasonPrefix}你拿出一本业务书籍，开始啃了起来……`,
                `${seasonPrefix}上级发了新文件，你仔细研读起来……`,
                `${seasonPrefix}你打开培训视频，开始做笔记……`,
                `${seasonPrefix}你翻出那本落灰的法规汇编，决定好好补补课……`,
                `${seasonPrefix}你登录了公务员在线学习平台，开始了必修课的学习。`,
                `${seasonPrefix}你在学习强国上刷到一篇深度好文，破天荒地读了全文并写了心得。`,
                `${seasonPrefix}你把过去一年的政策文件按主题分类整理，做了一份详尽的思维导图。`,
            ],
            report: [
                `${seasonPrefix}你打开一个空白Word文档，光标一闪一闪地盯着你——又是写报告的时刻。`,
                `${seasonPrefix}领导要求你写一份季度工作总结，你翻出之前的模板开始改日期和数字。`,
                `${seasonPrefix}调研回来了，你对着录音笔里的三个小时录音发呆——这报告怎么写？`,
                `${seasonPrefix}你泡了一杯浓茶，准备熬夜写一份重磅调研报告。`,
                `${seasonPrefix}上级催交材料了，你深呼吸一口，打开了那篇写了一半丢在角落的文档。`,
                `${seasonPrefix}你需要在明天之前完成一份可行性分析报告，今晚注定无眠。`,
            ],
            inspection: [
                `${seasonPrefix}走廊里弥漫着消毒水的味道——上级要来检查了！你开始疯狂补材料。`,
                `${seasonPrefix}接到通知：下周有巡视组进驻。你看着满柜子的档案盒，开始了一场和时间赛跑。`,
                `${seasonPrefix}你对照检查清单一项一项地过，发现有三分之一的文件还没归档。`,
                `${seasonPrefix}全处进入"迎检模式"：所有人面色凝重，走路带风，空气里弥漫着紧张的气息。`,
                `${seasonPrefix}你被分配负责整理党风廉政建设和反腐败工作的相关台账。`,
                `${seasonPrefix}领导拍了拍你的肩膀："这次检查就靠你的材料了。"你感到肩上的担子很重。`,
            ],
            speech: [
                `${seasonPrefix}王局要在全市大会上发言，你需要为他起草一份十分钟的讲话稿。`,
                `${seasonPrefix}你对着领导的讲话风格反复琢磨——要铿锵有力，又要接地气，还要有点金句。`,
                `${seasonPrefix}你翻出了一沓过往的讲话稿作为参考，发现套路出奇地一致：肯定成绩、指出不足、提出希望。`,
                `${seasonPrefix}领导说要"有高度、有深度、有温度"，你挠了挠头开始构思第一段。`,
                `${seasonPrefix}你花了三个小时写好了讲话稿的第一稿，自信满满地发给了领导——然后收到了满屏的修改批注。`,
                `${seasonPrefix}你给领导写的讲话稿里塞了一个"金句"，结果领导在台上真的念出来了！你激动得差点站起来。`,
            ],
            training: [
                `${seasonPrefix}局里组织了业务培训班，你拿着笔记本走进会议室准备好好学习。`,
                `${seasonPrefix}你被安排给新入职的同事做业务培训，你暗暗庆幸自己终于不是资历最浅的了。`,
                `${seasonPrefix}线上培训开始了，你打开摄像头和麦克风，调整好姿势——虽然半小时后就开始走神。`,
                `${seasonPrefix}今天的培训主题是公文写作规范，讲师是一位满头白发的老科长。`,
                `${seasonPrefix}培训结束后有一个小测验，你偷偷瞄了一眼旁边同事的答案。`,
            ]
        };

        const pool = descriptions[task.type] || [`${seasonPrefix}你开始${task.name}……`];
        return pool[Math.floor(Math.random() * pool.length)];
    }

    _getPerformanceText(performance) {
        if (performance >= 1.15) {
            const texts = [
                '行云流水般地', '如有神助地', '超凡脱俗地', '一气呵成地',
                '炉火纯青地', '登峰造极地', '出神入化地', '游刃有余地',
                '信手拈来地', '浑然天成地'
            ];
            return texts[Math.floor(Math.random() * texts.length)];
        }
        if (performance >= 1.0) {
            const texts = [
                '稳稳当当地', '不紧不慢地', '按部就班地', '中规中矩地',
                '有条不紊地', '四平八稳地', '驾轻就熟地', '胸有成竹地',
                '从容不迫地', '波澜不惊地'
            ];
            return texts[Math.floor(Math.random() * texts.length)];
        }
        if (performance >= 0.9) {
            const texts = [
                '勉勉强强地', '磕磕绊绊地', '手忙脚乱地', '跌跌撞撞地',
                '摇摇晃晃地', '半推半就地', '将将就就地', '歪歪扭扭地'
            ];
            return texts[Math.floor(Math.random() * texts.length)];
        }
        const texts = [
            '像老油条一样敷衍地', '心不在焉地', '魂不守舍地', '走神走了一半地',
            '闭着眼睛瞎搞地', '摸着鱼顺便地', '人在心不在地', '混日子般地',
            '敷衍了事地', '得过且过地'
        ];
        return texts[Math.floor(Math.random() * texts.length)];
    }

    _getTaskCompleteDescription(task, performance) {
        const completions = {
            document: {
                high: [
                    '红头文件处理得滴水不漏，领导看了直点头！',
                    '公文格式完美无瑕，连标点符号都无可挑剔！',
                    '这份材料堪称范文，被领导要求存档当模板了！',
                    '文件流转速度之快，连OA系统都还没反应过来你就已经批完了！',
                    '你在文件上做的批注精准犀利，连老科长都竖起了大拇指。',
                    '李科长看完你拟的稿子，只改了三个字就签字通过了——这是历史性的时刻！',
                ],
                mid: [
                    '公文处理完毕，格式规范，内容无误。',
                    '文件流转顺利，该签的签了，该批的批了。',
                    '红头文件搞定了，虽然费了点功夫但总算过关。',
                    '拟稿、核稿、签发、印发……一套流程走下来，你手法娴熟了不少。',
                ],
                low: [
                    '公文改了三遍还是有错别字，被领导圈出来了……',
                    '格式排版一塌糊涂，被打回来重做了……',
                    '红头文件差点搞出乌龙，好在最后勉强过关。',
                    '你发现自己在"收文处理单"上签错了日期，偷偷用涂改液改了过来。',
                ]
            },
            meeting: {
                high: [
                    '会议记录详实精准，领导讲话精神领会到位！',
                    '会议服务无可挑剔，茶水温度都恰到好处！',
                    '你做的会议纪要被全处传阅，堪称教科书级别！',
                    '你在会上提出的建议被领导当场采纳了！同事们投来佩服的目光。',
                    '会议提前五分钟结束了！所有人都用感激的眼神看着你——虽然跟你没什么关系。',
                ],
                mid: [
                    '会议顺利结束，你记下了要点，也倒了茶水。',
                    '领导讲话内容已记录，虽然有些地方没太听懂……',
                    '会议开完了，你揉了揉发麻的手腕。',
                    '你负责的PPT演示效果不错，至少没有人中途睡着。',
                ],
                low: [
                    '开会时打了个盹，被旁边的同事捅醒了……',
                    '会议记录漏了好几条，领导讲话只听了个大概……',
                    '茶水凉了都没续上，领导看了你一眼……',
                    '你在会上说错了一个数据，气氛尴尬了大概三秒钟。',
                ]
            },
            research: {
                high: [
                    '调研报告数据详实、分析透彻，领导大加赞赏！',
                    '你走访了每一个角落，收集到的第一手资料价值连城！',
                    '调研成果丰硕，报告被上级采纳并转发！',
                    '你在调研中发现了一个被忽视的关键问题，领导批示要求立即整改。',
                    '你的调研建议被写入了下一阶段的工作计划，成就感满满！',
                ],
                mid: [
                    '调研完成了，收集了一些有用的信息。',
                    '跑了一圈，该看的看了，该问的问了。',
                    '调研报告写完了，中规中矩吧。',
                    '走访了几个部门，笔记本记了十几页，回去慢慢整理。',
                ],
                low: [
                    '调研走马观花，报告写得像流水账……',
                    '跑了半天连门都没进去，只好网上查了查凑数……',
                    '调研报告被退回：内容空洞，建议重新调研。',
                    '你在调研过程中迷了路，到了目的地已经快下班了。',
                ]
            },
            social: {
                high: [
                    '觥筹交错间，你成功拉近了和关键人物的关系！',
                    '你的社交手腕令人叹服，人脉网又扩大了一圈！',
                    '饭局上你左右逢源，宾主尽欢！',
                    '你和张主任聊得很投机，他主动说以后有什么事可以找他帮忙。',
                    '你在饭局上展现出的酒量让所有人刮目相看，绰号"三斤不倒"不胫而走。',
                ],
                mid: [
                    '社交应酬结束，关系维护得还行。',
                    '聊了几句，加了微信，算是认识了。',
                    '应酬完毕，虽然有点累但还算有收获。',
                    '你在茶水间听到了一些有趣的办公室八卦，虽然不一定是好消息。',
                ],
                low: [
                    '社交场合说错话了，气氛一度很尴尬……',
                    '你全程低头玩手机，社交了个寂寞……',
                    '饭局上闷头吃饭一句话没说，白来了……',
                    '你试图讲了个笑话，结果冷场了，现在整个部门都知道你笑话讲得烂。',
                ]
            },
            rest: {
                high: [
                    '休息过后神清气爽，感觉能再战三百回合！',
                    '一杯热茶下肚，整个世界都明亮了！',
                    '你趴在桌上睡了十五分钟，起来后感觉满血复活。',
                    '你去楼下散了会儿步，呼吸了新鲜空气，回来看文件都觉得顺眼多了。',
                ],
                mid: [
                    '休息了一会儿，感觉好多了。',
                    '短暂放松后，精力恢复了一些。',
                    '喝了杯咖啡，虽然还是困但至少清醒了一点。',
                ],
                low: [
                    '休息也没用，疲惫感挥之不去……',
                    '刚坐下就又想起还有活没干完……',
                    '闭上眼睛满脑子都是工作，根本放松不下来。',
                ]
            },
            study: {
                high: [
                    '学习效率极高，新知识融会贯通！',
                    '你如饥似渴地吸收着新知识，收获满满！',
                    '学完之后茅塞顿开，业务水平又上了一个台阶！',
                    '你在学习强国上做完了一整套专题测验，全部满分通过！',
                    '你看完了一整本业务手册，觉得自己的专业能力又提升了一个档次。',
                ],
                mid: [
                    '学习了一会儿，有些收获。',
                    '看了些资料，记住了几个要点。',
                    '打开学习强国刷了刷，分数涨了一些。',
                ],
                low: [
                    '看书看睡着了，口水把文件都弄湿了……',
                    '学了半天也没学进去，脑子里全是浆糊……',
                    '你打开了网课，放了十分钟就开始刷手机——学习是个反人性的活动。',
                ]
            },
            report: {
                high: [
                    '报告写得出神入化，领导看完只说了一个字："好！"',
                    '你的报告逻辑严密、数据翔实，被作为范文在全系统传阅！',
                    '你写的报告得到了上级部门的肯定，领导在会上专门表扬了你。',
                    '你只用了一个晚上就完成了这份报告，连你自己都被自己的效率震惊了。',
                ],
                mid: [
                    '报告写完了，该有的内容都有了，可以交差了。',
                    '你在截止时间前最后一分钟提交了报告，长舒一口气。',
                    '报告质量尚可，领导没说什么——没消息就是好消息。',
                ],
                low: [
                    '熬夜写的报告被批"不够深入"，你看着电脑屏幕陷入了沉思……',
                    '你的报告因为格式问题被打回了三次，OA系统的退文通知让你心累。',
                    '你发现你写的数据和实际数据对不上，只好全部重新算了一遍。',
                ]
            },
            inspection: {
                high: [
                    '迎检工作完美收官！检查组给出了高度评价！',
                    '你的台账整理得井井有条，检查组的老师都忍不住拍照存档。',
                    '检查组离开后，处长拍了拍你的肩膀："这次你立了大功！"',
                    '你在迎检过程中的表现堪称完美，没有一处疏漏，全处都松了一口气。',
                ],
                mid: [
                    '检查顺利通过，虽然有几个小问题但无伤大雅。',
                    '检查组提了几个整改意见，你一一记下准备后续处理。',
                    '迎检工作告一段落，你瘫在椅子上，终于可以喘口气了。',
                ],
                low: [
                    '检查中发现了一些问题，被要求限期整改……',
                    '你准备的某项材料找不到了，在领导面前出了个小丑……',
                    '检查组问了一个你完全答不上来的问题，空气凝固了三秒钟。',
                ]
            },
            speech: {
                high: [
                    '你写的讲话稿领导非常满意，一个字都没改就直接用了！',
                    '领导在台上脱稿发挥了你的金句，台下掌声雷动！',
                    '你的讲话稿被办公室收录进了"范文库"，以后新人来了都要学习。',
                    '领导特意把你叫到办公室："小伙子/小姑娘写得不错，以后讲话稿就交给你了。"',
                ],
                mid: [
                    '讲话稿交上去了，领导改了几处措辞后通过了。',
                    '稿子写了一多半，领导思路又变了——重写就重写吧，习惯就好。',
                    '讲话稿顺利通过审核，虽然领导改了一半的内容，但至少框架是你定的。',
                ],
                low: [
                    '你写的稿子被领导全盘否定了，连标点符号都没留下……',
                    '领导说"这不是我想要的感觉"，但你完全不知道他想要什么感觉。',
                    '你在讲话稿里引用了一句名言，结果被领导发现出处不对，尴尬至极。',
                ]
            },
            training: {
                high: [
                    '培训效果非常好，大家都说受益匪浅！',
                    '你在培训测验中拿了满分，讲师对你赞不绝口！',
                    '你在培训上提出的问题引发了热烈讨论，连讲师都说"这个问题问得好"。',
                    '你认真做完了所有的笔记，感觉这一天的收获比过去一个月都多。',
                ],
                mid: [
                    '培训结束了，学了一些新东西，但能记住的不多。',
                    '培训内容还算实用，你拍了几页PPT准备回去慢慢看。',
                    '培训课上你认真听了前半段，后半段在走神——但至少你来了。',
                ],
                low: [
                    '培训课上你全程神游天际，笔记上只画了一只乌龟……',
                    '培训太无聊了，你偷偷刷了半小时手机，被旁边的人看到了。',
                    '培训结束后的测验你连蒙带猜勉强及格——学习使人快乐，但考试使人痛苦。',
                ]
            }
        };

        const pool = completions[task.type] || { high: ['完成得不错！'], mid: ['完成了。'], low: ['勉强完成了……'] };
        let tier;
        if (performance >= 1.05) tier = 'high';
        else if (performance >= 0.9) tier = 'mid';
        else tier = 'low';

        const options = pool[tier];
        return options[Math.floor(Math.random() * options.length)];
    }

    _showSkillEffects(skillEffects) {
        let hasEffect = false;
        let effectText = [];

        if (skillEffects.expBonus > 1) {
            effectText.push(`经验加成: ×${skillEffects.expBonus.toFixed(1)}`);
            hasEffect = true;
        }
        if (skillEffects.socialBonus > 1) {
            effectText.push(`社交加成: ×${skillEffects.socialBonus.toFixed(1)}`);
            hasEffect = true;
        }
        if (skillEffects.timeMultiplier < 1) {
            effectText.push(`时间减少: ×${skillEffects.timeMultiplier.toFixed(1)}`);
            hasEffect = true;
        }
        if (skillEffects.energyCostMultiplier < 1) {
            effectText.push(`精力消耗: ×${skillEffects.energyCostMultiplier.toFixed(1)}`);
            hasEffect = true;
        }
        if (skillEffects.stressGainMultiplier < 1) {
            effectText.push(`压力增加: ×${skillEffects.stressGainMultiplier.toFixed(1)}`);
            hasEffect = true;
        }

        // 显示组合效果
        if (skillEffects.activeCombos && skillEffects.activeCombos.length > 0) {
            const comboNames = skillEffects.activeCombos.map(c => `${c.icon} ${c.name}`).join(', ');
            effectText.push(`组合效果: ${comboNames}`);
            hasEffect = true;
        }

        if (hasEffect) {
            eventBus.emit('ui:showMessage', {
                text: `✨ 技能生效: ${effectText.join(' | ')}`,
                type: 'success'
            });
        }
    }

    _triggerHealthBreakdown() {
        eventBus.emit('ui:showToast', { text: '💀 你的身体终于撑不住了……', type: 'danger' });
        eventBus.emit('ui:showMessage', {
            text: '💀 ========== 游戏结束 ==========',
            type: 'warning'
        });
        eventBus.emit('ui:showMessage', {
            text: '💀 过度劳累和压力最终击垮了你。你倒在了办公桌上，被同事们送进了医院……',
            type: 'warning'
        });
        eventBus.emit('ui:showMessage', {
            text: `📊 最终统计：存活 ${gameState.month} 个月 | 声望 ${gameState.reputation} | 职位 ${gameState.positionName}`,
            type: 'system'
        });
        
        setTimeout(() => {
            eventBus.emit('ui:showModal', {
                title: '💀 游戏结束',
                content: `
                    <div style="text-align:center;line-height:2;">
                        <p style="font-size:48px;margin:20px 0;">💀</p>
                        <p style="color:var(--red);font-size:18px;font-weight:bold;">你的身体终于撑不住了</p>
                        <p>过度劳累和压力击垮了你。</p>
                        <p>在医院躺了一个月后，你选择了辞职。</p>
                        <hr style="border:none;border-top:1px solid #333;margin:20px 0;">
                        <p>📅 坚持了 <strong>${gameState.month}</strong> 个月</p>
                        <p>⭐ 最终声望：<strong>${gameState.reputation}</strong></p>
                        <p>💼 最终职位：<strong>${gameState.positionName}</strong></p>
                        <p>📋 完成任务：<strong>${gameState.completedTasks.length}</strong> 个</p>
                        <p>🐟 摸鱼次数：<strong>${gameState.slackCount}</strong> 次</p>
                        <hr style="border:none;border-top:1px solid #333;margin:20px 0;">
                        <p style="color:#888;font-size:12px;">下次注意劳逸结合，别再把自己累垮了。</p>
                    </div>
                `,
                buttons: [
                    { 
                        text: '🔄 重新开始', 
                        callback: () => {
                            gameState.reset();
                            location.reload();
                        }
                    }
                ]
            });
            this.isRunning = false;
        }, 1500);
    }

    handleSlack() {
        if (this.slackCooldown) {
            eventBus.emit('ui:showMessage', {
                text: '⏳ 摸鱼冷却中，别太频繁了……',
                type: 'warning'
            });
            this._updateSlackButton();
            return;
        }

        dialogueUI.playSlackEvent();

        this.slackCooldown = true;
        this._updateSlackButton();

        this.slackCooldownTimer = setTimeout(() => {
            this.slackCooldown = false;
            this._updateSlackButton();
        }, 8000);
    }

    _updateSlackButton() {
        const btn = document.getElementById('btn-slack');
        if (!btn) return;

        if (this.slackCooldown) {
            btn.style.opacity = '0.5';
            btn.style.cursor = 'not-allowed';
            btn.textContent = '🐟 冷却中...';
        } else {
            btn.style.opacity = '1';
            btn.style.cursor = 'pointer';
            btn.textContent = '🐟 摸鱼';
        }
    }

    showStatus() {
        const energy = gameState.energy;
        const maxEnergy = gameState.maxEnergy;
        const stress = gameState.stress;
        const maxStress = gameState.maxStress;
        const energyPct = Math.round((energy / maxEnergy) * 100);
        const stressPct = Math.round((stress / maxStress) * 100);
        const connPct = Math.round((gameState.connections / gameState.maxConnections) * 100);

        const energyColor = energyPct > 60 ? '#2ecc71' : energyPct > 30 ? '#f39c12' : '#e74c3c';
        const stressColor = stressPct < 40 ? '#2ecc71' : stressPct < 70 ? '#f39c12' : '#e74c3c';
        const connColor = connPct > 60 ? '#3498db' : '#95a5a6';

        const energyBar = this._makeBar(energyPct, energyColor);
        const stressBar = this._makeBar(stressPct, stressColor);
        const connBar = this._makeBar(connPct, connColor);

        const title = gameState.activeTitle || '新人';
        
        // 获取当前技能组合
        const activeCombos = skillSystem.getComboEffects();
        let comboDisplay = '';
        if (activeCombos.length > 0) {
            comboDisplay = '<div style="margin-top:8px;padding-top:8px;border-top:1px solid var(--border-color);">';
            comboDisplay += '<div style="color:var(--gold);font-weight:bold;margin-bottom:4px;">🎯 激活的组合效果:</div>';
            activeCombos.forEach(combo => {
                comboDisplay += `<div style="margin-left:12px;font-size:12px;">${combo.icon} ${combo.name}: ${combo.desc}</div>`;
            });
            comboDisplay += '</div>';
        }

        const content = `
            <div style="line-height:1.8;font-size:13px;">
                <div style="text-align:center;margin-bottom:12px;padding-bottom:10px;border-bottom:1px solid var(--border-color);">
                    <div style="font-size:18px;font-weight:bold;color:var(--gold);">${gameState.positionName}</div>
                    <div style="font-size:12px;color:#aaa;">称号：${title}</div>
                </div>
                <p>📅 ${timeSystem.getMonthPhaseString()}</p>
                <p>⚡ 精力：${energy}/${maxEnergy}</p>
                <div style="margin:-4px 0 8px 0;">${energyBar}</div>
                <p>😰 压力：${stress}/${maxStress}</p>
                <div style="margin:-4px 0 8px 0;">${stressBar}</div>
                <p>❤️ 健康：${gameState.health}/${gameState.maxHealth}</p>
                <div style="margin:-4px 0 8px 0;">${this._makeBar(Math.round((gameState.health/gameState.maxHealth)*100), gameState.health > 60 ? '#2ecc71' : gameState.health > 30 ? '#f39c12' : '#e74c3c')}</div>
                <p>⭐ 声望：${gameState.reputation}</p>
                <p>🤝 人脉：${gameState.connections}/${gameState.maxConnections}</p>
                <div style="margin:-4px 0 8px 0;">${connBar}</div>
                <div style="margin-top:8px;padding-top:8px;border-top:1px solid var(--border-color);">
                    <p>💰 余额：<span style="color:var(--gold);font-weight:bold;">${gameState.money}元</span></p>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px 16px;margin-top:8px;padding-top:8px;border-top:1px solid var(--border-color);">
                    <p>📝 写作：${gameState.workAbility}</p>
                    <p>🎯 执行：${gameState.execAbility}</p>
                    <p>💬 社交：${gameState.commAbility}</p>
                    <p>🛡️ 抗压：${gameState.stressAbility}</p>
                </div>
                ${comboDisplay}
                <div style="margin-top:8px;padding-top:8px;border-top:1px solid var(--border-color);text-align:center;">
                    <p>🐟 累计摸鱼：${gameState.slackCount}次 | 📋 已完成任务：${gameState.completedTasks.length}个</p>
                </div>
            </div>
        `;

        eventBus.emit('ui:showModal', {
            title: '📊 角色状态',
            content,
            buttons: [{ text: '返回', callback: () => {} }]
        });

        setTimeout(() => this._showCardHand(), 300);
    }

    _makeBar(pct, color) {
        const clampedPct = Math.max(0, Math.min(100, pct));
        return `<div style="background:#333;border-radius:4px;height:8px;overflow:hidden;">
            <div style="background:${color};height:100%;width:${clampedPct}%;border-radius:4px;transition:width 0.3s;"></div>
        </div>`;
    }

    saveGame() {
        const save = saveSystem.save();
        eventBus.emit('ui:showMessage', {
            text: `游戏已保存：${save.name}`,
            type: 'success'
        });
        this._showToast('💾 存档成功！', 'success');
        setTimeout(() => this._showCardHand(), 500);
    }

    handleChoice({ index, choice }) {
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.game = new Game();
});

eventBus.on('phase:changed', (data) => {
    if (typeof canvasSystem !== 'undefined' && canvasSystem.drawEnvironment) {
        canvasSystem.drawEnvironment(data.phase);
    }
    if (typeof canvasSystem !== 'undefined' && canvasSystem.setTimePart) {
        canvasSystem.setTimePart(data.phase);
    }
});

eventBus.on('task:completed', ({ task, rewards, performance, skillEffects }) => {
    if (rewards && rewards.exp >= 30) {
        const bonusPoints = skillSystem.addSkillPoints(1);
        eventBus.emit('ui:showMessage', {
            text: `获得技能点 +${bonusPoints}!`,
            type: 'success'
        });
    }
});

eventBus.on('achievement:unlocked', (achievement) => {
    if (typeof game !== 'undefined' && game._showToast) {
        game._showToast(`🏆 成就解锁: ${achievement.name}`, 'achievement');
    }
});

eventBus.on('game:showSkills', () => {
    if (typeof skillSystem === 'undefined') {
        eventBus.emit('ui:showModal', {
            title: '技能树',
            content: '技能系统加载中，请稍后再试。',
            buttons: [{ text: '返回', callback: () => {} }]
        });
        return;
    }

    const availableSkills = skillSystem.getAvailableSkills();
    const content = availableSkills.length > 0
        ? availableSkills.map(skill => `
            <div style="margin-bottom: 8px; padding: 8px; background: var(--bg-card); border: 1px solid var(--border-color);">
                <strong>${skill.name}</strong>（消耗 ${skill.cost} 点）<br>
                <small>${skill.description}</small>
            </div>
        `).join('')
        : '暂无新技能可解锁';

    eventBus.emit('ui:showModal', {
        title: '技能树',
        content,
        buttons: [
            { text: '返回', callback: () => {} }
        ]
    });
});


