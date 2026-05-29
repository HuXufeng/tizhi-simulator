/**
 * 结局系统
 * 多路线判定与多结局收集展示
 */
class EndingSystem {
    constructor() {
        this.endings = this.createEndings();
        this.collectedEndings = new Set();
        this.currentRoute = null;
        this.routeScores = {
            career: 0,
            relationship: 0,
            principle: 0,
            survival: 0
        };
        
        this.loadCollectedEndings();
        
        eventBus.on('game:start', () => this.onGameStart());
        eventBus.on('game:monthStart', () => this.updateRouteScores());
        eventBus.on('event:resolved', () => this.checkEndingConditions());
    }

    /**
     * 创建完整结局列表
     */
    createEndings() {
        return {
            // ==================== 仕途结局 ====================
            career: [
                {
                    id: 'skyrocket',
                    title: '青云直上',
                    description: '仕途一片光明，前途无量',
                    icon: '🚀',
                    rarity: 'legendary',
                    route: 'career',
                    type: 'good',
                    condition: (state) => state.position >= 5 && state.reputation >= 80,
                    requirement: '晋升至正厅级且声望达到80',
                    story: '经过多年奋斗，你终于坐上了那把交椅。回首往事，那些加班的夜晚、委屈的泪水，都化作了今日的荣耀。体制内，你终究活成了别人羡慕的样子。'
                },
                {
                    id: 'steady_climb',
                    title: '稳扎稳打',
                    description: '步步高升，稳如泰山',
                    icon: '📈',
                    rarity: 'epic',
                    route: 'career',
                    type: 'good',
                    condition: (state) => state.position >= 3 && state.reputation >= 60,
                    requirement: '晋升至正科级且声望达到60',
                    story: '你没有一夜暴富的运气，也没有一夜成名的野心。但你有一双踏实的手，一颗不急不躁的心。三十年后，你成了单位里最受尊敬的老前辈。'
                },
                {
                    id: 'plateau',
                    title: '止步入局',
                    description: '止步于某个层级，无法再进一步',
                    icon: '⏸️',
                    rarity: 'rare',
                    route: 'career',
                    type: 'neutral',
                    condition: (state) => state.position >= 2 && state.position < 3 && state.month >= 365,
                    requirement: '晋升至副科级后待满一年',
                    story: '副科的位子坐了十年。比你晚来的小王都升了正科，你却始终迈不过那道坎。渐渐地，你学会了接受，学会了和自己和解。'
                },
                {
                    id: 'marginal',
                    title: '边缘人物',
                    description: '被调离核心岗位，渐被遗忘',
                    icon: '📉',
                    rarity: 'common',
                    route: 'career',
                    type: 'bad',
                    condition: (state) => state.reputation < 30 && state.month >= 180,
                    requirement: '声望低于30且游戏超过180天',
                    story: '办公室的角落里有张桌子，那是你的新工位。没人记得你是谁，也没人关心你在做什么。你成了一颗可有可无的螺丝钉。'
                }
            ],
            
            // ==================== 人脉结局 ====================
            relationship: [
                {
                    id: 'kingmaker',
                    title: '造王者',
                    description: '虽无高位，却能左右逢源',
                    icon: '🎭',
                    rarity: 'epic',
                    route: 'relationship',
                    type: 'good',
                    condition: (state) => state.connections >= state.maxConnections && state.reputation >= 70,
                    requirement: '人脉达到上限且声望达到70',
                    story: '你没有升到多高的位置，但你认识所有人。领导换届你稳如泰山，同事纠纷你一语定音。在这个圈子里，你才是真正的无冕之王。'
                },
                {
                    id: 'trusted_advisor',
                    title: '心腹之臣',
                    description: '领导的左膀右臂，信任无间',
                    icon: '🤝',
                    rarity: 'epic',
                    route: 'relationship',
                    type: 'good',
                    condition: (state) => state.position >= 3 && state.connections >= 35,
                    requirement: '晋升至正科级且人脉达到35',
                    story: '领导信任你，同事敬重你。你的话，领导愿意听；你的建议，领导愿意采纳。你不需要多大的官帽子，你已经是这个系统里最不可或缺的人。'
                },
                {
                    id: 'lonely_king',
                    title: '孤家寡人',
                    description: '为了成功，失去了所有朋友',
                    icon: '👑',
                    rarity: 'rare',
                    route: 'relationship',
                    type: 'bad',
                    condition: (state) => state.position >= 3 && state.connections < 15,
                    requirement: '晋升至正科级但人脉低于15',
                    story: '你升了官，却丢了朋友。当你回头望去，身后空无一人。那些年你踩过的人、欠下的债，总有一天会找上门来。'
                }
            ],
            
            // ==================== 人生结局 ====================
            life: [
                {
                    id: 'balanced',
                    title: '人生赢家',
                    description: '工作生活双丰收',
                    icon: '⚖️',
                    rarity: 'legendary',
                    route: 'balanced',
                    type: 'good',
                    condition: (state) => state.reputation >= 60 && state.connections >= 35 && state.money >= 30000 && state.health >= 50,
                    requirement: '声望60+、人脉35+、金钱30000+、健康50+',
                    story: '你有体面的工作，也有温馨的家庭；有知心的朋友，也有足够的存款。你没有被工作压垮，也没有在体制里迷失。你找到了那个完美的平衡点。'
                },
                {
                    id: 'workaholic_burnout',
                    title: '鞠躬尽瘁',
                    description: '为工作燃烧自己',
                    icon: '🔥',
                    rarity: 'rare',
                    route: 'principle',
                    type: 'bad',
                    condition: (state) => state.reputation >= 70 && state.health < 30,
                    requirement: '声望达到70但健康低于30',
                    story: '领导大会上表扬了你，同事私下里同情你。你的奖状挂满了墙，可你的身体却一天不如一天。终于有一天，你倒在了加班的深夜里。'
                },
                {
                    id: 'fish_king',
                    title: '摸鱼之王',
                    description: '活得最滋润的那个',
                    icon: '🐟',
                    rarity: 'epic',
                    route: 'survival',
                    type: 'good',
                    condition: (state) => state.slackCount >= 100 && state.position >= 2 && state.health >= 60,
                    requirement: '摸鱼100次以上且保住副科以上职位',
                    story: '你是办公室最会摸鱼的人，却也是活得最自在的人。别人累死累活，你悠哉悠哉。升职加薪你一样没落下，只是从来没亏待过自己。'
                },
                {
                    id: 'early_retire',
                    title: '提前退休',
                    description: '功成身退，享受生活',
                    icon: '🌴',
                    rarity: 'epic',
                    route: 'balanced',
                    type: 'good',
                    condition: (state) => state.money >= 50000 && state.health >= 60 && state.month >= 365,
                    requirement: '存款50000+且健康60+且游戏超过365天',
                    story: '攒够了钱，看透了事。你主动申请内退，把位子让给年轻人。别人说你傻，你笑笑不说话。自由的味道，只有尝过的人才知道。'
                }
            ],
            
            // ==================== 隐藏结局 ====================
            hidden: [
                {
                    id: 'true_ending',
                    title: '不忘初心',
                    description: '历经沧桑，仍是少年',
                    icon: '⭐',
                    rarity: 'legendary',
                    route: 'principle',
                    type: 'good',
                    condition: (state) => this.checkTrueEnding(),
                    requirement: '完成所有路线结局各一个',
                    story: '你走过青云直上的路，也经历过边缘人物的苦；你做过造王者，也当过孤家寡人。所有的经历都化作了智慧，你终于明白：最重要的不是位子，而是那个最初的自己。',
                    hidden: true
                },
                {
                    id: 'secret_ending',
                    title: '人间清醒',
                    description: '看透一切后的选择',
                    icon: '🌙',
                    rarity: 'legendary',
                    route: 'balanced',
                    type: 'good',
                    condition: (state) => this.checkSecretEnding(),
                    requirement: '声望80+、人脉50+、金钱100000+且健康40+',
                    story: '当所有人都觉得你应该继续往上爬的时候，你选择了离开。辞职信只有四个字：世界很大。你要去看看那个被公文和会议填满之外的世界。',
                    hidden: true
                },
                {
                    id: 'comeback_king',
                    title: '绝地反击',
                    description: '从谷底爬回巅峰',
                    icon: '🔱',
                    rarity: 'legendary',
                    route: 'career',
                    type: 'good',
                    condition: (state) => this.checkComebackEnding(),
                    requirement: '声望曾低于20后回升至60+且晋升至正科级',
                    story: '所有人都以为你完了，连你自己也差点放弃。但你咬着牙一步一步爬回来，用了三年时间完成逆袭。当年的屈辱，都成了今日的勋章。',
                    hidden: true
                }
            ],

            // ==================== Bad Endings（新增！） ====================
            bad: [
                // — 仕途 Bad —
                {
                    id: 'fired',
                    title: '开除公职',
                    description: '因重大过失被开除',
                    icon: '🚫',
                    rarity: 'common',
                    route: 'career',
                    type: 'bad',
                    condition: (state) => state.reputation < 10 && state.workAbility < 20 && state.month >= 60,
                    requirement: '声望低于10、工作能力低于20、游戏超过60天',
                    story: '处分通知下来的那天你反而松了一口气。这些年在单位里浑浑噩噩，迟到早退，推诿扯皮，终于把领导的耐心耗尽了。收拾办公桌的时候，你才发现自己连一张值得带走的照片都没有。',
                    death: true
                },
                {
                    id: 'demoted',
                    title: '贬谪边疆',
                    description: '被发配到偏远基层',
                    icon: '🏚️',
                    rarity: 'rare',
                    route: 'career',
                    type: 'bad',
                    condition: (state) => state.position >= 1 && state.reputation < 15 && state.connections < 10 && state.month >= 120,
                    requirement: '声望低于15、人脉低于10、游戏超过120天',
                    story: '一纸调令把你发配到了全县最偏远的乡镇。没有暖气，没有食堂，没有网络。你坐在漏风的办公室里，看着窗外一望无际的庄稼地，终于明白了一个道理：在体制内，没有价值就会被抛弃。',
                    death: true
                },
                {
                    id: 'disgraced',
                    title: '降职处分',
                    description: '从高位跌落，再无翻身之日',
                    icon: '💀',
                    rarity: 'epic',
                    route: 'career',
                    type: 'bad',
                    condition: (state) => state.position >= 3 && state.reputation < 20,
                    requirement: '晋升至正科级以上但声望低于20',
                    story: '处分大会上，你低着头坐在第一排。那些曾经在你面前点头哈腰的人，现在连正眼都不看你一眼。从正科到科员，不过是一纸文件的距离。你终于懂了，爬得越高，摔得越惨。',
                    death: true
                },

                // — 人脉 Bad —
                {
                    id: 'betrayed',
                    title: '遭人背叛',
                    description: '苦心经营，毁于一旦',
                    icon: '🗡️',
                    rarity: 'epic',
                    route: 'relationship',
                    type: 'bad',
                    condition: (state) => state.connections >= 20 && state.reputation < 25 && state.month >= 150,
                    requirement: '人脉曾经很高但声望低于25、游戏超过150天',
                    story: '你从来没想过出卖你的人竟然是他——那个你一手提拔起来的下属，那个你掏心掏肺对待的"兄弟"。他把你的把柄一一呈了上去，换来了自己的一纸升迁令。人心隔肚皮，你输得心服口服。',
                    death: true
                },
                {
                    id: 'faction_fall',
                    title: '派系覆灭',
                    description: '站错了队，被连根拔起',
                    icon: '🏛️',
                    rarity: 'legendary',
                    route: 'relationship',
                    type: 'bad',
                    condition: (state) => state.connections >= 30 && state.position >= 2 && state.reputation < 20,
                    requirement: '人脉30+、职位副科以上但声望低于20',
                    story: '你的靠山倒了。那个在台上风光无限的人，一夜之间成了阶下囚。而你这个铁杆心腹，自然也跟着被清洗。新领导上任的第一把火，就烧到了你头上。派系斗争的残酷，你终于亲身体会到了。',
                    death: true
                },

                // — 人生 Bad —
                {
                    id: 'overwork_death',
                    title: '过劳死',
                    description: '燃尽生命的工作狂',
                    icon: '🕯️',
                    rarity: 'rare',
                    route: 'principle',
                    type: 'bad',
                    condition: (state) => state.health <= 0 && state.month >= 30,
                    requirement: '健康归零',
                    story: '你倒在了办公桌前。手里还握着那支签字笔，桌上摊着没批完的文件。急救车来的时候，同事们才发现你的脸色早已不对了很久。追悼会上，领导念着高度评价的悼词，可你已经听不见了。',
                    death: true
                },
                {
                    id: 'mental_breakdown',
                    title: '精神失常',
                    description: '压力击垮了最后一根弦',
                    icon: '🌀',
                    rarity: 'rare',
                    route: 'principle',
                    type: 'bad',
                    condition: (state) => state.stress >= 100 && state.health < 20 && state.month >= 90,
                    requirement: '压力量表爆表、健康低于20、游戏超过90天',
                    story: '那天你在办公室突然开始大笑，笑到眼泪都流了出来。同事们面面相觑，没人知道你怎么了。只有你知道——是那些永远做不完的报表、那些推不掉的酒局、那些不敢拒绝的要求，终于把你逼疯了。',
                    death: true
                },
                {
                    id: 'midlife_crisis',
                    title: '中年危机',
                    description: '一事无成的困局',
                    icon: '🍺',
                    rarity: 'rare',
                    route: 'survival',
                    type: 'bad',
                    condition: (state) => state.position < 2 && state.month >= 300 && state.money < 20000 && state.health < 50,
                    requirement: '300天+仍为科员、存款少、健康差',
                    story: '四十岁的时候你终于承认了自己是个普通人。不，连普通人都算不上。同学聚会你不敢去，亲戚问起工作你只能含糊其辞。那天晚上你一个人在小酒馆喝到打烊，老板说：老哥，该回家了。你笑了笑，家在哪里呢？',
                    death: true
                },

                // — 隐藏 Bad —
                {
                    id: 'scandal',
                    title: '声名狼藉',
                    description: '身败名裂，无法翻身',
                    icon: '📰',
                    rarity: 'legendary',
                    route: 'principle',
                    type: 'bad',
                    condition: (state) => this.checkScandalEnding(),
                    requirement: '声望低于10、人脉25+、游戏超过180天（隐藏）',
                    story: '热搜第一。你的事迹在网上疯传——那些酒桌上的交易、那些灰色的收入、那些权力的游戏。纪委的车停在你家楼下的时候，你反而有一种解脱感。这些年提心吊胆的日子，终于到头了。只是你再也无法面对镜子里的自己。',
                    hidden: true,
                    death: true
                },
                {
                    id: 'exile',
                    title: '流放之地',
                    description: '被彻底遗忘在世界的角落',
                    icon: '🏜️',
                    rarity: 'epic',
                    route: 'career',
                    type: 'bad',
                    condition: (state) => state.reputation < 5 && state.month >= 200,
                    requirement: '声望低于5、游戏超过200天（隐藏）',
                    story: '档案室最角落的柜子后面，是你的工位。没有电脑，没有电话，只有一扇永远不会打开的窗。你每天的工作就是给三十年前的档案编号。没有人会来找你，没有人记得你的名字。你成了一座活着的丰碑——上面刻着四个字：彻底失败。',
                    hidden: true,
                    death: true
                },
                {
                    id: 'burnout_quit',
                    title: '愤然离职',
                    description: '受不了了，老子不干了',
                    icon: '🚪',
                    rarity: 'common',
                    route: 'survival',
                    type: 'bad',
                    condition: (state) => state.stress >= 90 && state.reputation < 30 && state.money < 10000 && state.month >= 60,
                    requirement: '压力90+、声望30-、存款少、游戏超过60天',
                    story: '辞职信拍在领导桌上的那一刻，你觉得前所未有的爽。但走出单位大门的那一刻，扑面而来的现实让你瞬间清醒。没有积蓄，没有方向，没有退路。你站在人来人往的街头，第一次感到真正的恐惧。',
                    death: true
                }
            ]
        };
    }

    /**
     * 检查声名狼藉结局
     */
    checkScandalEnding() {
        return gameState.reputation < 10 && gameState.connections >= 25 && gameState.month >= 180;
    }

    /**
     * 检查真结局条件
     */
    checkTrueEnding() {
        const careerEndings = ['skyrocket', 'steady_climb', 'plateau', 'marginal'];
        const relationshipEndings = ['kingmaker', 'trusted_advisor', 'lonely_king'];
        const lifeEndings = ['balanced', 'workaholic_burnout', 'fish_king', 'early_retire'];
        const badEndings = ['fired', 'demoted', 'disgraced', 'betrayed', 'faction_fall', 'overwork_death', 'mental_breakdown', 'midlife_crisis', 'scandal', 'exile', 'burnout_quit'];
        
        const hasCareer = careerEndings.some(id => this.collectedEndings.has(id));
        const hasRelationship = relationshipEndings.some(id => this.collectedEndings.has(id));
        const hasLife = lifeEndings.some(id => this.collectedEndings.has(id));
        const hasBad = badEndings.some(id => this.collectedEndings.has(id));
        
        return hasCareer && hasRelationship && hasLife && hasBad;
    }

    /**
     * 检查隐藏结局条件
     */
    checkSecretEnding() {
        return gameState.reputation >= 80 && 
               gameState.connections >= 50 && 
               gameState.money >= 100000 && 
               gameState.health >= 40;
    }

    /**
     * 检查逆袭结局条件
     */
    checkComebackEnding() {
        const lowestRep = gameState.flags.lowestReputation || 0;
        return (lowestRep > 0 && lowestRep < 20) && gameState.reputation >= 60 && gameState.position >= 3;
    }

    /**
     * 游戏开始时初始化
     */
    onGameStart() {
        this.currentRoute = null;
        this.routeScores = { career: 0, relationship: 0, principle: 0, survival: 0 };
    }

    /**
     * 更新路线得分
     */
    updateRouteScores() {
        const state = gameState;
        
        // 政绩路线得分
        this.routeScores.career = (
            state.reputation * 1.5 + 
            state.position * 20 + 
            state.workAbility * 0.5
        );
        
        // 人脉路线得分
        this.routeScores.relationship = (
            state.connections * 2 + 
            state.commAbility * 0.8
        );
        
        // 原则路线得分
        this.routeScores.principle = (
            state.reputation * 1.2 +
            state.stressAbility * 0.5 -
            state.slackCount * 0.5
        );
        
        // 生存路线得分
        this.routeScores.survival = (
            state.health * 0.8 +
            state.energy * 0.3 +
            state.money * 0.01
        );
        
        // 记录最低声望（用于逆袭结局）
        if (!gameState.flags.lowestReputation || state.reputation < gameState.flags.lowestReputation) {
            gameState.flags.lowestReputation = state.reputation;
        }
        
        // 确定当前主导路线
        const maxRoute = Object.entries(this.routeScores)
            .sort((a, b) => b[1] - a[1])[0];
        
        if (maxRoute[1] > 0) {
            this.currentRoute = maxRoute[0];
        }
    }

    /**
     * 获取当前路线名称
     */
    getRouteName(route) {
        const names = {
            career: '政绩派',
            relationship: '人脉派',
            principle: '清流派',
            survival: '摸鱼派',
            balanced: '均衡派'
        };
        return names[route] || route;
    }

    /**
     * 获取当前主导路线
     */
    getDominantRoute() {
        if (!this.currentRoute) {
            this.updateRouteScores();
        }
        return this.currentRoute;
    }

    /**
     * 检查结局条件
     */
    checkEndingConditions() {
        const allEndings = [
            ...this.endings.career,
            ...this.endings.relationship,
            ...this.endings.life,
            ...this.endings.hidden,
            ...this.endings.bad
        ];
        
        for (const ending of allEndings) {
            if (!this.collectedEndings.has(ending.id)) {
                try {
                    if (ending.condition(gameState)) {
                        this.triggerEnding(ending);
                        return;
                    }
                } catch (e) {
                    console.error(`检查结局 ${ending.id} 时出错:`, e);
                }
            }
        }
    }

    /**
     * 触发结局
     */
    triggerEnding(ending) {
        this.collectedEndings.add(ending.id);
        this.saveCollectedEndings();
        
        // 标记游戏状态
        gameState.phase = 'ending';
        gameState.flags.currentEnding = ending.id;
        
        // 触发结局事件
        eventBus.emit('ending:triggered', ending);
        
        // 显示结局界面
        this.showEndingScreen(ending);
    }

    /**
     * 显示结局画面
     */
    showEndingScreen(ending) {
        const isNewEnding = !this.wasEndingCollectedBefore(ending.id);
        
        const content = `
            <div class="ending-screen">
                <div class="ending-header">
                    <div class="ending-icon">${ending.icon}</div>
                    <h2 class="ending-title">${ending.title}</h2>
                    <div class="ending-subtitle">${ending.route ? this.getRouteName(ending.route) + '结局' : '特殊结局'}</div>
                    ${ending.hidden ? '<div class="ending-hidden-badge">隐藏结局</div>' : ''}
                    ${ending.type === 'bad' ? '<div class="ending-bad-badge">💀 Bad Ending</div>' : ending.type === 'neutral' ? '<div class="ending-neutral-badge">⚖️ 普通结局</div>' : ''}
                </div>
                
                <div class="ending-story">
                    <p>${ending.story}</p>
                </div>
                
                <div class="ending-stats">
                    <div class="stat-row">
                        <span class="stat-label">游戏月数</span>
                        <span class="stat-value">第 ${gameState.month} 月</span>
                    </div>
                    <div class="stat-row">
                        <span class="stat-label">最终职位</span>
                        <span class="stat-value">${gameState.positionName}</span>
                    </div>
                    <div class="stat-row">
                        <span class="stat-label">最终声望</span>
                        <span class="stat-value">${gameState.reputation}</span>
                    </div>
                    <div class="stat-row">
                        <span class="stat-label">累计摸鱼</span>
                        <span class="stat-value">${gameState.slackCount} 次</span>
                    </div>
                </div>
                
                ${isNewEnding ? '<div class="ending-new-badge">新结局解锁！</div>' : ''}
                ${ending.death ? '<div class="ending-death-badge">💔 你的故事到此结束...</div>' : ''}
            </div>
        `;
        
        const buttons = [
            {
                text: '📖 查看结局收集',
                callback: () => this.showEndingCollection()
            },
            {
                text: '🔄 开始新游戏',
                callback: () => this.startNewGamePlus()
            }
        ];
        
        eventBus.emit('ui:showModal', {
            title: '🎬 结局',
            content,
            width: '95%',
            maxWidth: '500px',
            buttons
        });
    }

    /**
     * 检查结局之前是否已收集
     */
    wasEndingCollectedBefore(endingId) {
        return this.collectedEndings.has(endingId) && 
               !gameState.flags.currentEnding?.includes(endingId);
    }

    /**
     * 显示结局收集界面
     */
    showEndingCollection() {
        const stats = this.getCollectionStats();
        
        let content = `
            <div class="ending-collection">
                <div class="collection-stats">
                    <div class="stat-item">
                        <span class="stat-value">${stats.collected}</span>
                        <span class="stat-label">已收集</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value">${stats.total}</span>
                        <span class="stat-label">总结局</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value">${stats.percentage}%</span>
                        <span class="stat-label">完成率</span>
                    </div>
                </div>
        `;
        
        const categories = {
            career: { name: '仕途结局', endings: this.endings.career },
            relationship: { name: '人脉结局', endings: this.endings.relationship },
            life: { name: '人生结局', endings: this.endings.life },
            hidden: { name: '隐藏结局', endings: this.endings.hidden },
            bad: { name: '💀 失败结局', endings: this.endings.bad }
        };
        
        for (const [key, category] of Object.entries(categories)) {
            const collectedInCategory = category.endings.filter(e => 
                this.collectedEndings.has(e.id)
            ).length;
            
            content += `
                <div class="ending-category">
                    <h4>${category.name} (${collectedInCategory}/${category.endings.length})</h4>
                    <div class="ending-list">
                        ${category.endings.map(e => this.renderEnding(e)).join('')}
                    </div>
                </div>
            `;
        }
        
        content += '</div>';
        
        const ngPlusInfo = this.getNewGamePlusInfo();
        if (ngPlusInfo.unlocked) {
            content += `
                <div class="ngplus-info">
                    <h4>🔮 新游戏+ 奖励</h4>
                    <ul>
                        ${ngPlusInfo.bonuses.map(b => `<li>${b}</li>`).join('')}
                    </ul>
                </div>
            `;
        }
        
        eventBus.emit('ui:showModal', {
            title: '📖 结局收集',
            content,
            width: '95%',
            maxWidth: '550px',
            buttons: [{ text: '返回', callback: () => {} }]
        });
    }

    /**
     * 渲染单个结局
     */
    renderEnding(ending) {
        const isCollected = this.collectedEndings.has(ending.id);
        const rarityColors = {
            common: '#888',
            rare: '#3498db',
            epic: '#9b59b6',
            legendary: '#f39c12'
        };
        
        const typeTag = ending.type === 'bad' ? '<span class="ending-type-tag type-bad">💀失败</span>' :
                        ending.type === 'neutral' ? '<span class="ending-type-tag type-neutral">⚖️普通</span>' : '';
        
        return `
            <div class="ending-item ${isCollected ? 'collected' : 'locked'} ${ending.type === 'bad' ? 'ending-bad' : ''}"
                 style="--rarity-color: ${rarityColors[ending.rarity]}">
                <div class="ending-item-icon">${isCollected ? ending.icon : '?'}</div>
                <div class="ending-item-info">
                    <div class="ending-item-title">${isCollected ? ending.title : '???'}</div>
                    <div class="ending-item-desc">${isCollected ? ending.description : '尚未解锁'}</div>
                    ${isCollected ? `<div class="ending-item-req">达成条件：${ending.requirement}</div>` : ''}
                </div>
                <div class="ending-item-meta">
                    ${typeTag}
                    <div class="ending-item-rarity rarity-${ending.rarity}">${ending.rarity === 'common' ? '普通' : ending.rarity === 'rare' ? '稀有' : ending.rarity === 'epic' ? '史诗' : '传说'}</div>
                </div>
            </div>
        `;
    }

    /**
     * 获取收集统计
     */
    getCollectionStats() {
        let total = 0;
        let collected = 0;
        
        Object.values(this.endings).forEach(endings => {
            endings.forEach(() => total++);
        });
        
        collected = this.collectedEndings.size;
        
        return {
            total,
            collected,
            percentage: total > 0 ? Math.round((collected / total) * 100) : 0
        };
    }

    /**
     * 获取新游戏+信息
     */
    getNewGamePlusInfo() {
        const collected = this.collectedEndings.size;
        const total = this.getCollectionStats().total;
        const bonuses = [];
        let unlocked = false;
        
        if (collected >= 1) {
            bonuses.push('初始声望 +10');
            unlocked = true;
        }
        if (collected >= 3) {
            bonuses.push('技能经验获取 +15%');
        }
        if (collected >= 5) {
            bonuses.push('初始人脉 +10');
        }
        if (collected >= total * 0.5) {
            bonuses.push('解锁所有背景选择');
        }
        if (collected >= total) {
            bonuses.push('🔮 完全胜利！所有路线开放！');
        }
        
        return { unlocked, bonuses };
    }

    /**
     * 开始新游戏+
     */
    startNewGamePlus() {
        const ngPlusInfo = this.getNewGamePlusInfo();
        
        eventBus.emit('ui:closeModal');
        
        eventBus.emit('ngplus:prepare', {
            bonuses: ngPlusInfo.bonuses,
            collectedEndings: Array.from(this.collectedEndings)
        });
        
        // 重置游戏状态
        gameState.reset();
        gameState.flags.ngPlusWeek = (gameState.flags.ngPlusWeek || 0) + 1;
        
        // 应用新游戏+加成
        if (ngPlusInfo.unlocked) {
            if (ngPlusInfo.bonuses.includes('初始声望 +10')) {
                gameState.reputation += 10;
            }
            if (ngPlusInfo.bonuses.includes('初始人脉 +10')) {
                gameState.connections += 10;
            }
            if (ngPlusInfo.bonuses.includes('技能经验获取 +15%')) {
                gameState.flags.skillExpBonus = 0.15;
            }
        }
        
        // 开始新游戏
        setTimeout(() => {
            game.phase = 'intro';
            game.startGame();
        }, 500);
    }

    /**
     * 加载已收集结局
     */
    loadCollectedEndings() {
        try {
            const saved = localStorage.getItem('bureaucracy_sim_endings');
            if (saved) {
                const endings = JSON.parse(saved);
                this.collectedEndings = new Set(endings);
            }
        } catch (e) {
            console.error('加载结局数据失败:', e);
        }
    }

    /**
     * 保存已收集结局
     */
    saveCollectedEndings() {
        try {
            localStorage.setItem(
                'bureaucracy_sim_endings', 
                JSON.stringify(Array.from(this.collectedEndings))
            );
        } catch (e) {
            console.error('保存结局数据失败:', e);
        }
    }

    /**
     * 重置结局收集（用于测试）
     */
    resetCollection() {
        this.collectedEndings.clear();
        this.saveCollectedEndings();
    }
}

// 全局单例
const endingSystem = new EndingSystem();
