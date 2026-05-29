class DialogueUI {
    constructor() {
        this.currentDialogue = null;
        this.dialogueIndex = 0;
    }

    playPrologue() {
        const prologue = [
            { text: '你站在机关大院门口，深吸一口气，空气里混着梧桐树叶和食堂早餐的味道。', type: 'narration' },
            { text: '门口的石狮子威严地注视着你，那表情跟你高考监考老师一模一样。', type: 'narration' },
            { text: '传达室的大爷从老花镜上方看了你一眼："新来的？登个记。"', type: 'system' },
            { text: '你接过那本磨得发亮的登记簿，上面密密麻麻的名字像是一部微缩的仕途史。', type: 'narration' },
            { text: '你填好表，大爷按了一下那个比你还老的门禁按钮，铁门"嗡"地一声缓缓打开。', type: 'narration' },
            { text: '走进办公楼，走廊里弥漫着消毒水和陈年茶叶混合的气味，墙上"为人民服务"五个大字金光闪闪。', type: 'narration' },
            { text: '旁边还贴着考勤制度、值班表、学习园地，以及一张落款三年前的"关于开展……的通知"。', type: 'narration' },
            { text: '你路过茶水间，里面传来压低声音的八卦和暖水瓶咕噜咕噜的声音。', type: 'narration' },
            { text: '一位端着搪瓷杯的大姐冲你笑了笑，杯子上的"为人民服务"已经掉了一半漆。', type: 'narration' },
            { text: '你找到了办公室——门牌上写着"综合处"，"综"字的螺丝松了，歪歪斜斜地挂着。', type: 'narration' },
            { text: '你敲了敲门。', type: 'narration' },
            { text: '"请进。"里面传来一个沉稳的声音，像新闻联播的播音员一样字正腔圆。', type: 'system' },
            { text: '你推开门，一股浓茶味扑面而来。一位五十出头的中年男人坐在堆满文件的办公桌后。', type: 'narration' },
            { text: '桌上除了文件，还有一个泡着枸杞的保温杯、一盆半死不活的绿萝，以及一张全家福。', type: 'narration' },
            { text: '王处长抬起头，目光从你的发型扫到你的皮鞋，仿佛在用X光给你做入职体检。', type: 'narration' },
            { text: '"你就是新来的小林吧？"', type: 'system' },
            { text: '你连忙点头，腰弯成了三十度角——这是你提前练过的标准体制内鞠躬。', type: 'system' },
            { text: '"王处长好，我是林远，今天来报到。"', type: 'system' },
            { text: '王处长微微点头，端起保温杯喝了一口，不紧不慢地说："嗯，年轻人有干劲是好事。"', type: 'system' },
            { text: '"先跟着李主任熟悉一下工作。记住，在机关里，多看、多学、少说话。"', type: 'system' },
            { text: '你郑重地点头，心里却在想：这保温杯里到底是茶还是人生哲理？', type: 'narration' },
            { text: '就这样，你的体制内生涯正式开始了。前方的路，有文山会海，也有人间烟火。', type: 'narration' },
            { text: timeSystem.getSeasonDescription(), type: 'narration' }
        ];

        this._playSequence(prologue, () => {
            eventBus.emit('game:prologueComplete');
        });
    }

    playNewMonth() {
        const month = gameState.month;
        const monthDescriptions = {
            early: [
                '第${month}个月了。你开始在每天的"收到"和"好的"中找到了某种节奏感。',
                '第${month}个月。你发现茶水间的枸杞消耗速度和你入职时长成正比。',
                '第${month}个月。你已经学会了在领导路过时三秒内切换屏幕的高级技能。',
                '第${month}个月。你终于记住了全科室所有人的名字——以及他们的绰号。',
            ],
            mid: [
                '第${month}个月。你已经能从领导的一个眼神里读出三页纸的意思了。',
                '第${month}个月。你发现自己的手机输入法默认联想出"请示""批复""抄送"。',
                '第${month}个月。你开始理解为什么前辈们总说"稳定压倒一切"。',
                '第${month}个月。你在食堂打饭时已经不用再犹豫——师傅都知道你要什么了。',
                '第${month}个月。你看着新来的实习生，忽然想起了一年前的自己。',
            ],
            veteran: [
                '第${month}个月。你已经可以在开会时精准预测领导下一句话是什么了。',
                '第${month}个月。你的工位抽屉里常备茶叶、饼干和一件备用衬衫。',
                '第${month}个月。你学会了用最少的力气完成分内的工作。',
                '第${month}个月。看着新来的人拼命表现，你露出了慈祥的微笑——当年你也这样。',
                '第${month}个月。你发现自己的发际线和职位呈反比增长。',
            ],
            default: [
                '第${month}个月。日子像复印机里的纸，一张一张地过。',
                '第${month}个月在忙碌中开始了。你深吸一口气，准备迎接新的文件海洋。',
                '又是新的一月。你默默给自己打气：这个月一定不摸鱼——大概。',
            ]
        };

        let mood;
        if (month <= 6) mood = monthDescriptions.early;
        else if (month <= 24) mood = monthDescriptions.mid;
        else if (month <= 60) mood = monthDescriptions.veteran;
        else mood = monthDescriptions.default;

        const atmosphereText = mood[Math.floor(Math.random() * mood.length)]
            .replace('${month}', month);

        const messages = [
            { text: `—— 第${month}月 ——`, type: 'system' },
            { text: atmosphereText, type: 'narration' },
            { text: timeSystem.getSeasonDescription(), type: 'narration' }
        ];

        this._playSequence(messages, () => {
            eventBus.emit('game:monthStart');
        });
    }

    playSlackEvent() {
        const phase = gameState.phase || 'early';

        const earlyScenarios = [
            {
                messages: [
                    { text: '你趁着领导还没到，偷偷刷起了手机。', type: 'narration' },
                    { text: '朋友圈里全是微商和养生文，你居然也看津津有味。', type: 'narration' },
                    { text: '突然听到走廊里有脚步声，你以迅雷不及掩耳之势切回了公文系统。', type: 'narration' },
                    { text: '虚惊一场，是保洁阿姨。但你的心跳堪比百米冲刺。', type: 'narration' }
                ],
                effects: { energy: 12, stress: -8 },
                riskChance: 0.15
            },
            {
                messages: [
                    { text: '你端着搪瓷杯去茶水间，假装接水。', type: 'narration' },
                    { text: '实际上你在茶水间站了十分钟，盯着饮水机发呆。', type: 'narration' },
                    { text: '饮水机"咕噜咕噜"的声音，竟然比领导的讲话还催眠。', type: 'narration' }
                ],
                effects: { energy: 8, stress: -10 },
                riskChance: 0.05
            },
            {
                messages: [
                    { text: '你打开了一个看起来很像工作网页的界面——实际上是新闻网站。', type: 'narration' },
                    { text: '你甚至把浏览器标签页命名成了"XX通知"，这波操作堪称影帝级。', type: 'narration' },
                    { text: '看了一条国际新闻，感觉自己的格局又打开了一点。', type: 'narration' }
                ],
                effects: { energy: 10, stress: -12 },
                riskChance: 0.1
            },
            {
                messages: [
                    { text: '你把文件摊了一桌子，营造出一种"我很忙"的视觉效果。', type: 'narration' },
                    { text: '然后趴在文件堆后面，闭目养神。', type: 'narration' },
                    { text: '这叫"沉浸式工作"——沉浸在梦里工作。', type: 'narration' }
                ],
                effects: { energy: 15, stress: -5 },
                riskChance: 0.2
            }
        ];

        const afternoonScenarios = [
            {
                messages: [
                    { text: '午饭后犯困，你把椅子往后一靠，假装在思考问题。', type: 'narration' },
                    { text: '实际上你的眼皮已经打了三百回合了。', type: 'narration' },
                    { text: '你发明了一种新技能：睁一只眼闭一只眼——字面意义上的。', type: 'narration' }
                ],
                effects: { energy: 10, stress: -8 },
                riskChance: 0.2
            },
            {
                messages: [
                    { text: '你借口上厕所，在厕所隔间里刷了二十分钟短视频。', type: 'narration' },
                    { text: '隔壁隔间传来另一部手机的短视频声——看来同道中人不少。', type: 'narration' },
                    { text: '你们隔着一堵墙，心照不宣地各自摸鱼。这就是体制内的默契。', type: 'narration' }
                ],
                effects: { energy: 12, stress: -15 },
                riskChance: 0.25
            },
            {
                messages: [
                    { text: '你和同事小张在工位上用微信聊天，话题从工作秒变八卦。', type: 'narration' },
                    { text: '"听说隔壁处要换处长了？""真的假的？我咋不知道？"', type: 'system' },
                    { text: '你们聊得热火朝天，完全忘了电脑屏幕上还开着空白的公文。', type: 'narration' }
                ],
                effects: { energy: 10, connections: 3, stress: -12 },
                riskChance: 0.2
            },
            {
                messages: [
                    { text: '你打开外卖APP，开始研究下午茶。', type: 'narration' },
                    { text: '奶茶还是咖啡？这是一个比写材料还难的选择题。', type: 'narration' },
                    { text: '最终你选择了奶茶——毕竟枸杞泡茶已经喝了一上午了。', type: 'narration' }
                ],
                effects: { energy: 8, stress: -10 },
                riskChance: 0.08
            },
            {
                messages: [
                    { text: '你把手机藏在抽屉里，低头假装翻文件，实际在抽屉里偷偷刷。', type: 'narration' },
                    { text: '这招是从老同事那里学来的，据说他已经练了十年。', type: 'narration' },
                    { text: '你的手速已经可以和电竞选手一较高下了——可惜用在了摸鱼上。', type: 'narration' }
                ],
                effects: { energy: 10, stress: -8 },
                riskChance: 0.15
            }
        ];

        const eveningScenarios = [
            {
                messages: [
                    { text: '加班到晚上，办公室里只剩你一个人了。', type: 'narration' },
                    { text: '你终于可以光明正大地摸鱼了！这大概就是加班唯一的福利。', type: 'narration' },
                    { text: '你翘着二郎腿，把手机音量调到最大，享受着一个人的自由。', type: 'narration' }
                ],
                effects: { energy: 15, stress: -20 },
                riskChance: 0.02
            },
            {
                messages: [
                    { text: '你假装在等文件审核，实际上在看小说。', type: 'narration' },
                    { text: '屏幕上开着一个文档，里面只有一行字："关于……的请示"。', type: 'narration' },
                    { text: '你安慰自己：这叫"构思阶段"，磨刀不误砍柴工嘛。', type: 'narration' }
                ],
                effects: { energy: 8, stress: -12 },
                riskChance: 0.1
            },
            {
                messages: [
                    { text: '你在办公室里来回踱步，美其名曰"思考工作"。', type: 'narration' },
                    { text: '实际上你在数走廊上有多少块地砖——答案是247块，你上次数过。', type: 'narration' },
                    { text: '你甚至发现第83块地砖上有一个疑似咖啡渍的痕迹，这大概是你今天最大的发现。', type: 'narration' }
                ],
                effects: { energy: 6, stress: -8 },
                riskChance: 0.05
            }
        ];

        const anyTimeScenarios = [
            {
                messages: [
                    { text: '你泡了一杯茶，假装在看文件。', type: 'narration' },
                    { text: '实际上思绪已经飘到了九霄云外——你在想晚上吃什么。', type: 'narration' },
                    { text: '窗外的风景真好啊。等等，对面楼的哥们好像也在摸鱼？', type: 'narration' }
                ],
                effects: { energy: 8, stress: -8 },
                riskChance: 0.05
            },
            {
                messages: [
                    { text: '你借口接电话，实际上在走廊里溜达了一圈。', type: 'narration' },
                    { text: '路过每个办公室都瞄一眼，发现大家都在摸鱼。', type: 'narration' },
                    { text: '你突然觉得，摸鱼才是机关工作的真正日常。', type: 'narration' }
                ],
                effects: { energy: 10, stress: -12 },
                riskChance: 0.15
            },
            {
                messages: [
                    { text: '你打开购物网站，开始研究养生壶。', type: 'narration' },
                    { text: '毕竟在机关，保温杯和养生壶才是真正的生产力工具。', type: 'narration' },
                    { text: '你把几个商品加入了购物车，然后默默关掉了页面——工资还没发呢。', type: 'narration' }
                ],
                effects: { energy: 6, stress: -10 },
                riskChance: 0.1
            },
            {
                messages: [
                    { text: '你和隔壁工位的老刘聊起了退休规划。', type: 'narration' },
                    { text: '老刘说他还有八年退休，眼睛里闪着光。', type: 'narration' },
                    { text: '你算了算自己的退休年龄，突然觉得人生好漫长。', type: 'narration' }
                ],
                effects: { energy: 8, connections: 2, stress: -5 },
                riskChance: 0.12
            },
            {
                messages: [
                    { text: '你在电脑上打开了扫雷，这是机关最经典的摸鱼游戏。', type: 'narration' },
                    { text: '从远处看，扫雷的界面和Excel表格几乎一模一样。', type: 'narration' },
                    { text: '这就是为什么扫雷能成为体制内摸鱼的王者——隐蔽性满分。', type: 'narration' }
                ],
                effects: { energy: 10, stress: -15 },
                riskChance: 0.08
            },
            {
                messages: [
                    { text: '你开始整理桌面——这是摸鱼的高级形态，因为看起来像在工作。', type: 'narration' },
                    { text: '你把文件按颜色分类，把笔按长短排列，把回形针数了一遍。', type: 'narration' },
                    { text: '整理完之后，桌面焕然一新，但你的工作进度依然是零。', type: 'narration' }
                ],
                effects: { energy: 5, stress: -6 },
                riskChance: 0.03
            },
            {
                messages: [
                    { text: '你偷偷打开了一个在线课程，假装在"充电"。', type: 'narration' },
                    { text: '实际上课程内容是"如何养好一盆绿萝"——你桌上那盆快不行了。', type: 'narration' },
                    { text: '学完之后你信心满满，决定明天就给绿萝换盆。如果它还能撑到明天的话。', type: 'narration' }
                ],
                effects: { energy: 8, stress: -10 },
                riskChance: 0.05
            },
            {
                messages: [
                    { text: '你开始研究机关食堂的菜单——这是每天最重要的决策。', type: 'narration' },
                    { text: '红烧肉还是清蒸鱼？这比写年终总结还让人纠结。', type: 'narration' },
                    { text: '最终你决定两个都打，反正食堂阿姨的手抖一抖，量都差不多。', type: 'narration' }
                ],
                effects: { energy: 6, stress: -8 },
                riskChance: 0.05
            },
            {
                messages: [
                    { text: '你在微信群里回复了一串"收到""好的""马上落实"。', type: 'narration' },
                    { text: '你发现这三个词可以应付90%的工作场景。', type: 'narration' },
                    { text: '剩下的10%？再加一句"我请示一下领导"就够了。', type: 'narration' }
                ],
                effects: { energy: 5, connections: 1, stress: -5 },
                riskChance: 0.02
            },
            {
                messages: [
                    { text: '你假装在等打印机，实际上在打印机旁站了五分钟发呆。', type: 'narration' },
                    { text: '打印机"嗡嗡嗡"地响着，像是在唱一首催眠曲。', type: 'narration' },
                    { text: '你甚至开始怀念那种碳粉的味道了——这大概是斯德哥尔摩综合征。', type: 'narration' }
                ],
                effects: { energy: 7, stress: -8 },
                riskChance: 0.08
            }
        ];

        let timeScenarios;
        if (phase === 'early') {
            timeScenarios = earlyScenarios;
        } else if (phase === 'mid') {
            timeScenarios = afternoonScenarios;
        } else {
            timeScenarios = eveningScenarios;
        }

        const allScenarios = [...timeScenarios, ...anyTimeScenarios];
        const scenario = allScenarios[Math.floor(Math.random() * allScenarios.length)];

        if (typeof canvasSystem !== 'undefined' && canvasSystem.getAtmosphereDescription) {
            const atmosphere = canvasSystem.getAtmosphereDescription();
        }

        scenario.messages.forEach((msg, i) => {
            setTimeout(() => {
                eventBus.emit('ui:showMessage', msg);
                eventBus.emit('audio:play', { type: 'click' });
            }, i * 800);
        });

        setTimeout(() => {
            if (scenario.effects.energy) {
                gameState.modifyStat('energy', scenario.effects.energy);
            }
            if (scenario.effects.stress) {
                gameState.modifyStat('stress', scenario.effects.stress);
            }
            if (scenario.effects.connections) {
                gameState.modifyStat('connections', scenario.effects.connections);
            }
            gameState.slackCount++;

            eventBus.emit('audio:play', { type: 'coin' });

            if (Math.random() < scenario.riskChance) {
                this._triggerSlackRisk();
            }

            if (typeof achievementSystem !== 'undefined') {
                achievementSystem.checkAchievements();
                achievementSystem.updateTitle();
            }

        }, scenario.messages.length * 800 + 500);
    }

    _triggerSlackRisk() {
        const warnings = [
            { text: '王处长路过你的工位，意味深长地看了你一眼……那眼神，像极了班主任。', effect: { reputation: -5 } },
            { text: '李主任突然出现在你身后："小林啊，工作忙完了吗？"你感觉后背一阵发凉。', effect: { reputation: -3, stress: 10 } },
            { text: '同事老刘咳嗽了一声提醒你，你赶紧收起手机——手速堪比魔术师。', effect: { reputation: -2 } },
            { text: '突然有人喊了一声"领导来了！"全办公室的人瞬间坐直，场面堪比军训。', effect: { stress: 8 } },
            { text: '你摸鱼时被隔壁处的人看到了，他露出了一个意味深长的微笑。这比被领导发现还可怕——因为这意味着你多了一个把柄。', effect: { reputation: -4, stress: 5 } },
            { text: '办公室的监控摄像头突然转了一个角度，你不确定是不是对着你，但你的良心已经先崩溃了。', effect: { stress: 12 } },
            { text: '你摸鱼的时候不小心笑出了声，整个办公室都安静了。那一刻，你想找个地缝钻进去。', effect: { reputation: -3, stress: 8 } },
            { text: '领导在群里发了一条消息："请各位注意工作纪律。"你总觉得这是在说你。', effect: { stress: 6 } }
        ];

        const warning = warnings[Math.floor(Math.random() * warnings.length)];

        setTimeout(() => {
            eventBus.emit('ui:showMessage', {
                text: warning.text,
                type: 'warning'
            });
            eventBus.emit('audio:play', { type: 'warning' });

            if (warning.effect.reputation) {
                gameState.modifyStat('reputation', warning.effect.reputation);
            }
            if (warning.effect.stress) {
                gameState.modifyStat('stress', warning.effect.stress);
            }
        }, 1500);
    }

    _playSequence(messages, onComplete) {
        let index = 0;
        const delay = 800;

        const showNext = () => {
            if (index >= messages.length) {
                if (onComplete) onComplete();
                return;
            }

            eventBus.emit('ui:showMessage', messages[index]);
            index++;
            setTimeout(showNext, delay);
        };

        showNext();
    }
}

const dialogueUI = new DialogueUI();
