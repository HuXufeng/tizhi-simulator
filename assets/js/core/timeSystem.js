class TimeSystem {
    constructor() {
        this.phases = ['early', 'mid', 'late'];

        this.efficiency = {
            work:    { early: 1.3, mid: 1.0, late: 0.7 },
            social:  { early: 0.8, mid: 1.2, late: 1.0 },
            rest:    { early: 0.7, mid: 0.9, late: 1.3 },
            study:   { early: 1.0, mid: 0.9, late: 1.5 }
        };

        this._monthDescs = {
            newbie: [
                '这是你入职的第${month}个月。办公室里的绿植又换了一批，你终于记住了全科室所有人的名字。',
                '第${month}个月了。你已经学会了在领导说话时长按"好的"功能键，方便随时回复。',
                '时间过得真快，转眼第${month}个月了。茶水间的阿姨已经记住你喜欢喝半糖的豆浆。',
                '第${month}个月。你发现自己的手机输入法已经默认联想出"请示""批复""抄送"了。',
                '又一个月过去了。你从当初的懵懂新人，变成了可以帮新来的实习生指路的老员工。'
            ],
            mid: [
                '第${month}个月了。日子像复印机里的纸，一张一张地过，内容大同小异。',
                '半年过去了。你已经能从一个眼神里读出三页纸的意思，这是体制内生存的基本技能。',
                '第${month}个月。你开始理解为什么前辈们总说"稳定压倒一切"。',
                '时光飞逝，第${month}个月。你看着办公室里进进出出的新面孔，忽然觉得自己也成了"老人"。',
                '第${month}个月。你有了自己的"辖区"——那个装满文件、绿植和梦想的工位。'
            ],
            veteran: [
                '第${month}个月。你已经可以在开会时精准预测领导下一句话是什么了。',
                '第${month}个月。你的工位抽屉里常备茶叶、饼干和一件备用衬衫，比家还温馨。',
                '第${month}个月。你发现自己的发际线和职位呈反比增长，这是体制内的"守恒定律"。',
                '第${month}个月。你学会了用最少的力气完成分内的工作，然后把剩下的精力留给生活。',
                '第${month}个月。看着新来的人拼命表现，你露出了慈祥的微笑——当年你也这样。'
            ]
        };

        this._seasonDescs = {
            spring: [
                '春天来了，办公楼下的玉兰花开了又谢，你坐在办公室里，总觉得应该出去走走。',
                '春暖花开，单位的绿化又搞了一轮，你看着新栽的树，心想自己什么时候才能"扎根"。',
                '春天的风带着花香吹进办公室，你打开窗户深呼吸，然后咳嗽了两声——文件纸屑飞进嘴里了。'
            ],
            summer: [
                '夏天到了，办公室的空调时好时坏，你学会了随身携带小风扇，这是体制内夏天的标配。',
                '三伏天，走廊里弥漫着防晒霜和汗水的混合气味，食堂的绿豆汤是一天中最期待的饮品。',
                '七月的阳光毒辣辣的，你坐在空调房里写材料，忽然觉得自己还挺幸福——虽然幸福是建立在电费上的。'
            ],
            autumn: [
                '秋天来了，办公楼外的梧桐树叶开始变黄，你踩在落叶上，发出咔嚓咔嚓的声音，像在踩碎时间。',
                '秋高气爽，单位组织了秋游，你在山上看着远方的城市天际线，心想自己也是这座城市的建设者之一。',
                '秋天的天空很高很蓝，你站在窗前看了五分钟，然后被领导叫去开会——这是秋天的常态。'
            ],
            winter: [
                '冬天到了，办公室的暖气片开始发出咕噜咕噜的声音，你抱着保温杯，觉得这就是幸福的样子。',
                '窗外飘起了雪花，你缩在办公室里写年终总结，这一年又过去了，你写得很认真，虽然知道没什么人看。',
                '腊月了，办公室里开始讨论春节的安排，年味从大家的聊天里慢慢透出来，你开始期待那几天的假期。'
            ]
        };
    }

    _getVeterancy() {
        if (gameState.month <= 3) return 'newbie';
        if (gameState.month <= 12) return 'mid';
        return 'veteran';
    }

    _getSeason() {
        const season = (gameState.month - 1) % 12;
        if (season < 3) return 'spring';
        if (season < 6) return 'summer';
        if (season < 9) return 'autumn';
        return 'winter';
    }

    _pickRandom(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    getPhaseName() {
        const names = { early: '上旬', mid: '中旬', late: '下旬' };
        return names[gameState.phase] || '上旬';
    }

    getMonthPhaseString() {
        return `第${gameState.month}月 ${this.getPhaseName()}`;
    }

    advancePhase() {
        const phaseIndex = this.phases.indexOf(gameState.phase);

        if (phaseIndex < this.phases.length - 1) {
            gameState.phase = this.phases[phaseIndex + 1];
            eventBus.emit('phase:changed', { phase: gameState.phase });
            return false;
        } else {
            gameState.phase = 'early';
            gameState.month++;
            eventBus.emit('month:changed', { month: gameState.month });
            return true;
        }
    }

    getEfficiency(activityType) {
        const typeEff = this.efficiency[activityType];
        if (!typeEff) return 1.0;
        return typeEff[gameState.phase] || 1.0;
    }

    getMonthDescription() {
        const tier = this._getVeterancy();
        const template = this._pickRandom(this._monthDescs[tier]);
        return template.replace('${month}', gameState.month);
    }

    getSeasonDescription() {
        const season = this._getSeason();
        return this._pickRandom(this._seasonDescs[season]);
    }

    getTimeString() {
        return `第${gameState.month}月 ${this.getPhaseName()}`;
    }

    getSeasonName() {
        const names = { spring: '春季', summer: '夏季', autumn: '秋季', winter: '冬季' };
        return names[this._getSeason()] || '春季';
    }
}

const timeSystem = new TimeSystem();