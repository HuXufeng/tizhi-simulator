class EventSystem {
    constructor() {
        this.eventPool = this.createFullEventPool();
        this.activeEvents = [];
        this.eventHistory = [];
        this.eventCooldowns = new Map();
        this.COOLDOWN_DAYS = 5;
        this.lastEventMonth = -1;

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this._initEvents());
        } else {
            this._initEvents();
        }
    }

    _initEvents() {
        eventBus.on('event:forceTrigger', (eventId) => this.forceTriggerEvent(eventId));
        eventBus.on('game:monthStart', () => this.checkRandomEvents());
    }

    createFullEventPool() {
        return {
            emergency: [
                {
                    id: 'fire_inspection',
                    name: '紧急消防检查',
                    description: '市消防支队突然到访，要求立即检查消防设施。你看了看走廊里堆满的纸箱子……',
                    probability: 0.05,
                    minReputation: 0,
                    options: [
                        {
                            text: '立即组织迎检',
                            effects: { reputation: +10, energy: -30 },
                            result: '你迅速组织人员清理走廊、检查灭火器，虽然手忙脚乱但总算过关了。消防队长临走时说："你们这走廊，差点就罚了。"'
                        },
                        {
                            text: '推给后勤科室',
                            effects: { connections: -15, reputation: -5 },
                            result: '你试图甩锅给后勤，后勤老王气得直拍桌子："消防检查你推给我？我又不是消防员！"'
                        },
                        {
                            text: '假装不在',
                            effects: { reputation: -20 },
                            risk: 0.3,
                            riskEffect: { reputation: -15, connections: -10 },
                            result: '你躲进厕所锁上门，但消防员挨个敲门排查，你被当场"抓获"……'
                        }
                    ]
                },
                {
                    id: 'urgent_report',
                    name: '紧急报告',
                    description: '领导临时要求明早前提交一份重要报告！你看了看表——已经下午五点半了。',
                    probability: 0.08,
                    options: [
                        {
                            text: '通宵完成',
                            effects: { reputation: +15, energy: -50, stress: +20 },
                            result: '你熬了一整夜，喝了四杯咖啡，总算在天亮前完成了报告。照镜子时你发现自己多了两根白头发。'
                        },
                        {
                            text: '找人帮忙',
                            effects: { reputation: +5, connections: -10 },
                            result: '你拉了两个同事一起加班，报告质量一般，而且同事们现在看你的眼神有点复杂。'
                        },
                        {
                            text: '敷衍了事',
                            effects: { reputation: -15 },
                            risk: 0.5,
                            riskEffect: { reputation: -10 },
                            result: '报告被领导打回来重写，你被叫去谈话："小同志，态度决定一切啊。"'
                        }
                    ]
                },
                {
                    id: 'inspection_visit',
                    name: '上级视察',
                    description: '传来消息，上级领导明天要来单位调研。办公室瞬间进入战时状态。',
                    probability: 0.06,
                    minReputation: 30,
                    options: [
                        {
                            text: '主动请缨汇报',
                            effects: { reputation: +20, stress: +15 },
                            requirement: { workAbility: 60 },
                            result: '你的汇报条理清晰，领导频频点头！回来后同事们投来羡慕嫉妒恨的目光。'
                        },
                        {
                            text: '做好本职工作',
                            effects: { reputation: +5 },
                            result: '你保持低调，把办公桌擦了三遍，文件码得比尺子还直。领导路过时说了句"不错"。'
                        },
                        {
                            text: '借故离开',
                            effects: { reputation: -10, connections: -5 },
                            result: '你躲过了一劫，但也错过了一次在领导面前刷存在感的机会。隔壁小王倒是表现不错……'
                        }
                    ]
                },
                {
                    id: 'hygiene_inspection',
                    name: '领导突然检查卫生',
                    description: '刚上班就收到通知：局长要亲自检查各科室卫生！你低头看了看自己桌上泡面桶和乱七八糟的文件……',
                    probability: 0.06,
                    options: [
                        {
                            text: '疯狂收拾',
                            effects: { energy: -20, reputation: +10 },
                            result: '你以光速收拾好桌面，把泡面桶塞进抽屉，文件摞成豆腐块。局长路过时赞许地点了点头。'
                        },
                        {
                            text: '把东西塞进柜子',
                            effects: { connections: -5 },
                            risk: 0.4,
                            riskEffect: { reputation: -10 },
                            result: '你把所有东西一股脑塞进文件柜，结果局长打开柜门找资料时，泡面桶滚了出来……'
                        },
                        {
                            text: '假装是别人的位置',
                            effects: { reputation: -15 },
                            risk: 0.6,
                            riskEffect: { reputation: -10, connections: -8 },
                            result: '你偷偷坐到隔壁工位上，结果局长认出了你的工牌："这不是小X的位子吗？你坐这儿干嘛？"'
                        }
                    ]
                },
                {
                    id: 'urgent_material',
                    name: '上级临时通知要材料',
                    description: '省厅来电话，要求下午三点前报送一份专项工作总结。你翻遍了电脑也没找到相关文件……',
                    probability: 0.07,
                    options: [
                        {
                            text: '火速赶制',
                            effects: { workAbility: +3, energy: -35, stress: +15 },
                            result: '你以惊人的手速拼出了一份材料，虽然有些粗糙但数据齐全。省厅那边居然还表扬了你们效率高。'
                        },
                        {
                            text: '找兄弟单位借模板',
                            effects: { connections: +10, energy: -15 },
                            result: '你赶紧给兄弟单位打电话，对方发来一份模板，你改了改就交上去了。这叫"站在巨人的肩膀上"。'
                        },
                        {
                            text: '先报个简版应付',
                            effects: { reputation: -10 },
                            risk: 0.5,
                            riskEffect: { reputation: -8 },
                            result: '你交了个简版，省厅回复："请补充完整后重新报送。"你还得加班重做……'
                        }
                    ]
                },
                {
                    id: 'petition_visit',
                    name: '信访群众上门',
                    description: '一群情绪激动的群众堵在单位门口，要求解决拆迁补偿问题。保安打电话来求支援！',
                    probability: 0.05,
                    minReputation: 20,
                    options: [
                        {
                            text: '出面安抚',
                            effects: { commAbility: +3, reputation: +15, stress: +20, energy: -25 },
                            result: '你硬着头皮出去面对群众，耐心听他们倾诉，承诺向上反映。群众情绪逐渐平复，但你的衬衫已经被汗湿透了。'
                        },
                        {
                            text: '通知领导处理',
                            effects: { reputation: +5, connections: +5 },
                            result: '你明智地把球踢给了领导。领导虽然嘴上不说，但心里记住了你"及时汇报"的好习惯。'
                        },
                        {
                            text: '从后门溜走',
                            effects: { reputation: -20 },
                            risk: 0.3,
                            riskEffect: { reputation: -10 },
                            result: '你从后门开溜，结果被群众堵了个正着。场面一度非常尴尬……'
                        }
                    ]
                },
                {
                    id: 'public_opinion',
                    name: '突发舆情需要回应',
                    description: '网上突然出现一篇关于你们单位的负面帖子，阅读量已经十万+！领导要求立即起草回应声明。',
                    probability: 0.04,
                    minReputation: 40,
                    options: [
                        {
                            text: '加班起草回应',
                            effects: { workAbility: +2, reputation: +20, energy: -40, stress: +25 },
                            result: '你连夜起草回应声明，字斟句酌，反复修改。最终声明发布后舆情逐渐平息，领导在会上点名表扬了你。'
                        },
                        {
                            text: '建议冷处理',
                            effects: { reputation: -5 },
                            risk: 0.6,
                            riskEffect: { reputation: -15 },
                            result: '你建议等舆论自然降温，结果事情越闹越大，最后不得不出面回应，还多挨了几天骂。'
                        },
                        {
                            text: '甩锅给宣传科',
                            effects: { connections: -12, reputation: -8 },
                            result: '你把锅甩给了宣传科，宣传科的人气得脸都绿了："这事儿又不是我们一个科室能搞定的！"'
                        }
                    ]
                }
            ],

            opportunity: [
                {
                    id: 'training_notice',
                    name: '培训机会',
                    description: '市里有一个难得的培训名额，要去省城学习一周。据说省城的伙食特别好……',
                    probability: 0.1,
                    options: [
                        {
                            text: '积极争取',
                            effects: { reputation: +10, exp: +30, connections: +5, energy: -20 },
                            result: '你获得了培训机会，不仅学到了新知识，还认识了不少其他单位的朋友。省城的伙食确实不错。'
                        },
                        {
                            text: '随缘参与',
                            effects: { exp: +10 },
                            result: '你没太上心，培训时偷偷逛了逛省城。收获嘛……主要是几张旅游照片。'
                        },
                        {
                            text: '放弃机会',
                            effects: { reputation: -5 },
                            result: '你放弃了这次机会，名额给了隔壁小王。回来后他逢人就讲培训多好多好，你听着心里不是滋味。'
                        }
                    ]
                },
                {
                    id: 'promotion_opportunity',
                    name: '晋升机会',
                    description: '听说有一个副科级岗位的空缺，你心动了吗？办公室里已经暗流涌动了……',
                    probability: 0.04,
                    minReputation: 60,
                    minDay: 30,
                    options: [
                        {
                            text: '全力争取',
                            effects: { reputation: +25, connections: +10 },
                            requirement: { workAbility: 70, connections: 30 },
                            result: '经过一番努力，你成功获得晋升！从此你的名片上多了一个"副"字，虽然工资没涨多少……'
                        },
                        {
                            text: '暗中运作',
                            effects: { connections: +15, money: -1000 },
                            requirement: { connections: 25 },
                            result: '你花了一些积蓄请关键人物吃饭，关系确实更近了。但月底钱包有点紧……'
                        },
                        {
                            text: '静观其变',
                            effects: { reputation: +5 },
                            result: '你选择佛系等待，结果机会被别人拿走了。你安慰自己："命里有时终须有，命里无时莫强求。"'
                        }
                    ]
                },
                {
                    id: 'media_interview',
                    name: '媒体采访',
                    description: '市电视台想来采访单位的工作亮点。这是一个出镜的好机会！',
                    probability: 0.05,
                    minReputation: 40,
                    options: [
                        {
                            text: '欣然接受',
                            effects: { reputation: +30 },
                            requirement: { workAbility: 50 },
                            result: '采访很成功，你的名字出现在了新闻里！七大姑八大姨纷纷发来贺电，虽然你只说了三句话。'
                        },
                        {
                            text: '推荐别人',
                            effects: { reputation: +10, connections: +10 },
                            result: '你把机会让给了同事，他很感激你。后来他在镜头前紧张得说不出话，你暗自庆幸。'
                        },
                        {
                            text: '婉言谢绝',
                            effects: { reputation: -5 },
                            result: '你错失了一次展示自己的机会。领导意味深长地看了你一眼："年轻人要敢于表现嘛。"'
                        }
                    ]
                },
                {
                    id: 'party_activist',
                    name: '入党积极分子',
                    description: '支部书记找你谈话，说你被推荐为入党积极分子候选人。这是进步的好机会！',
                    probability: 0.06,
                    minReputation: 35,
                    options: [
                        {
                            text: '积极表态',
                            effects: { reputation: +20, exp: +25, stress: +10 },
                            result: '你激动地表示了入党决心，从此开始了写思想汇报的漫漫长路。不过，这是值得的！'
                        },
                        {
                            text: '谦虚接受',
                            effects: { reputation: +10, exp: +15 },
                            result: '你表示会继续努力，不辜负组织信任。书记满意地点了点头，顺便给你安排了三篇思想汇报。'
                        },
                        {
                            text: '犹豫不决',
                            effects: { reputation: -5 },
                            result: '你支支吾吾没表态，书记有些失望："小同志，觉悟要跟上啊。"你感觉错过了一个亿。'
                        }
                    ]
                },
                {
                    id: 'team_building',
                    name: '单位组织团建',
                    description: '单位组织周末去郊区团建，据说有拓展训练和烧烤。你看了看自己堆满工作的桌面……',
                    probability: 0.08,
                    options: [
                        {
                            text: '积极参加',
                            effects: { connections: +15, energy: -15, stress: -10 },
                            result: '团建上你和同事们打成一片，拓展训练时你居然是第一个爬上高墙的！烧烤也吃得很爽。'
                        },
                        {
                            text: '参加但划水',
                            effects: { connections: +5, stress: -5 },
                            result: '你全程划水，拓展训练时躲在后面，烧烤时冲在最前面。同事们对你的"战术"心领神会。'
                        },
                        {
                            text: '借口加班不去',
                            effects: { connections: -8, workAbility: +2 },
                            result: '你留在办公室加班，确实完成了不少工作。但周一听同事们聊团建趣事时，你有点后悔。'
                        }
                    ]
                },
                {
                    id: 'secretary_vacancy',
                    name: '领导秘书缺人',
                    description: '处长的秘书调走了，处长正在物色新人选。这可是离权力中心最近的位置！',
                    probability: 0.04,
                    minReputation: 50,
                    minDay: 20,
                    options: [
                        {
                            text: '主动请缨',
                            effects: { reputation: +25, connections: +20, stress: +20, energy: -20 },
                            requirement: { workAbility: 60, commAbility: 50 },
                            result: '你成功当上了处长秘书！从此手机24小时开机，随时待命。虽然累，但消息灵通了不止一点半点。'
                        },
                        {
                            text: '让人推荐自己',
                            effects: { connections: +10, reputation: +10, money: -300 },
                            result: '你托人向处长推荐了自己，请了顿饭。虽然没当上秘书，但和处长搭上了线。'
                        },
                        {
                            text: '敬而远之',
                            effects: { stress: -5 },
                            result: '你深知当秘书意味着没有个人生活，果断选择远离。看着新秘书每天加班到深夜，你庆幸自己的选择。'
                        }
                    ]
                },
                {
                    id: 'excellence_award',
                    name: '评优评先',
                    description: '年底评优开始了，科室有一个"先进个人"名额。你和隔壁小王都有资格，气氛微妙……',
                    probability: 0.05,
                    minReputation: 45,
                    minDay: 25,
                    options: [
                        {
                            text: '全力争取',
                            effects: { reputation: +20, connections: -5, exp: +20 },
                            requirement: { workAbility: 55 },
                            result: '你拿出了全年工作成果，成功当选！小王表面恭喜你，但你感觉以后合作可能没那么顺畅了……'
                        },
                        {
                            text: '礼让同事',
                            effects: { connections: +15, reputation: +5 },
                            result: '你主动退出评选，让给了小王。小王感动得不行，逢人就说你格局大。领导也注意到了你的"大局意识"。'
                        },
                        {
                            text: '暗中活动',
                            effects: { reputation: +10, connections: -10, money: -500 },
                            risk: 0.3,
                            riskEffect: { reputation: -15 },
                            result: '你私下做了些"工作"，评优结果出来时你确实当选了。但办公室里的气氛变得有点微妙……'
                        }
                    ]
                }
            ],

            daily: [
                {
                    id: 'colleague_help',
                    name: '同事求助',
                    description: '同事老张找你帮忙处理一份紧急文件。他看起来比你还着急……',
                    probability: 0.2,
                    options: [
                        {
                            text: '爽快答应',
                            effects: { connections: +10, energy: -15 },
                            result: '老张非常感激，说欠你一个人情。体制内，人情就是硬通货。'
                        },
                        {
                            text: '委婉拒绝',
                            effects: { connections: -5 },
                            result: '老张有些失望，但理解你的难处。不过你总觉得他以后找你时可能也没那么积极了……'
                        },
                        {
                            text: '讨价还价',
                            effects: { connections: +2, money: +100 },
                            result: '你帮了忙，还顺便收了点"辛苦费"。老张笑着说："你小子，以后肯定能当领导。"'
                        }
                    ]
                },
                {
                    id: 'office_gossip',
                    name: '八卦传闻',
                    description: '办公室里有人在议论最近的人事变动，消息来源据说是"可靠渠道"……',
                    probability: 0.15,
                    options: [
                        {
                            text: '凑上去听听',
                            effects: { connections: +5 },
                            risk: 0.3,
                            riskEffect: { reputation: -10 },
                            result: '你听到了不少内幕消息，但也可能被牵连。毕竟在体制内，知道太多不一定是好事……'
                        },
                        {
                            text: '假装没听见',
                            effects: { reputation: +2 },
                            result: '你保持中立，继续低头写材料。在体制内，沉默是金，尤其是别人在八卦的时候。'
                        },
                        {
                            text: '及时制止',
                            effects: { reputation: +8, connections: -5 },
                            result: '你让大家别议论了，有人觉得你好管闲事，但领导要是知道了，你就是那个"有原则"的人。'
                        }
                    ]
                },
                {
                    id: 'birthday_party',
                    name: '同事生日',
                    description: '今天是科室小王的生日，大家商量着要不要一起庆祝。小王已经暗示了三天了……',
                    probability: 0.12,
                    options: [
                        {
                            text: '热情参与',
                            effects: { connections: +15, money: -100, energy: -10 },
                            result: '你参加了聚会，和同事们增进了感情。小王喝多了说以后有事找他，你默默记下了。'
                        },
                        {
                            text: '随份子钱',
                            effects: { connections: +5, money: -50 },
                            result: '你随了礼但没亲自到场。在体制内，人到不到是其次，份子到了就行。'
                        },
                        {
                            text: '找借口离开',
                            effects: { connections: -10 },
                            result: '你错过了聚会，同事们有点失望。小王在群里发了个"有些人啊……"，你没敢回复。'
                        }
                    ]
                },
                {
                    id: 'leader_invite',
                    name: '领导邀约',
                    description: '处长邀请你周末一起去钓鱼。你不会钓鱼，但你知道这不只是钓鱼……',
                    probability: 0.08,
                    minReputation: 50,
                    options: [
                        {
                            text: '欣然前往',
                            effects: { connections: +20, reputation: +10, money: -200, energy: -15 },
                            result: '你和处长在湖边聊了一整天，从工作聊到人生。你虽然一条鱼没钓到，但收获比鱼大多了！'
                        },
                        {
                            text: '找借口推辞',
                            effects: { connections: -10, reputation: -5 },
                            result: '处长似乎有些失望："年轻人要多出来走走嘛。"你感觉自己的仕途可能也少了一条路。'
                        }
                    ]
                },
                {
                    id: 'canteen_new_dish',
                    name: '机关食堂出新菜',
                    description: '食堂大妈神秘兮兮地说今天有新菜——据说是一道"创新融合菜"。你看了看今天的菜单……',
                    probability: 0.18,
                    options: [
                        {
                            text: '勇敢尝试',
                            effects: { energy: +10, health: -5 },
                            risk: 0.3,
                            riskEffect: { health: -10, stress: +5 },
                            result: '你尝了那道新菜，味道居然还不错！食堂大妈得意地说："我就说好吃吧！"但你的胃持保留意见。'
                        },
                        {
                            text: '还是老三样',
                            effects: { energy: +5 },
                            result: '你选择了万年不变的土豆丝配米饭。虽然无聊，但至少不会踩雷。食堂的日子，稳定压倒一切。'
                        },
                        {
                            text: '出去吃',
                            effects: { energy: +8, money: -50, connections: +3 },
                            result: '你约了同事出去下馆子，虽然花了不少，但终于吃到了有味道的饭菜。回来时食堂已经关门了。'
                        }
                    ]
                },
                {
                    id: 'ac_broken',
                    name: '办公室空调坏了',
                    description: '三伏天，办公室空调突然罢工了！维修师傅说配件要明天才到……',
                    probability: 0.1,
                    options: [
                        {
                            text: '坚守岗位',
                            effects: { stress: +15, reputation: +8, energy: -20 },
                            result: '你在蒸笼般的办公室里坚持工作，汗流浃背。领导路过时竖起了大拇指："小同志，好样的！"但你觉得自己快熟了。'
                        },
                        {
                            text: '申请换办公室',
                            effects: { connections: +5, energy: -5 },
                            result: '你厚着脸皮去隔壁科室蹭空调，虽然有点挤，但至少活下来了。隔壁科室的人看你的眼神像看难民。'
                        },
                        {
                            text: '直接请假回家',
                            effects: { reputation: -5, energy: +15, stress: -10 },
                            result: '你以"中暑"为由请了半天假，回家吹空调。爽是真爽，但回来后同事们都在传你"怕热怕苦"。'
                        }
                    ]
                },
                {
                    id: 'unit_welfare',
                    name: '单位发福利',
                    description: '逢年过节，单位发了一箱福利！你搬着箱子往回走，感觉全世界都在看你……',
                    probability: 0.09,
                    options: [
                        {
                            text: '开心搬回家',
                            effects: { money: +200, stress: -10 },
                            result: '你把福利搬回家，打开一看——米面油三件套，外加一盒月饼。虽然不值多少钱，但体制内的温暖就在这里！'
                        },
                        {
                            text: '送给领导表心意',
                            effects: { connections: +10, reputation: +5, money: -200 },
                            result: '你把福利转送给了领导，领导推辞了一番最后"勉强"收下。你觉得自己在人情世故上又进步了。'
                        },
                        {
                            text: '和同事互换',
                            effects: { connections: +8, stress: -5 },
                            result: '你和同事们互相交换了不想要的福利，皆大欢喜。你用一桶油换了两箱牛奶，感觉自己是个商业奇才。'
                        }
                    ]
                },
                {
                    id: 'milk_tea_treat',
                    name: '同事请喝奶茶',
                    description: '科室小李突然说要请全科室喝奶茶！你怀疑他是不是有什么事要求人……',
                    probability: 0.15,
                    options: [
                        {
                            text: '开心接受',
                            effects: { energy: +10, stress: -8, connections: +5 },
                            result: '你愉快地接受了奶茶，和小李聊了会儿天。果然，下周他就要找你帮忙代班了……'
                        },
                        {
                            text: '客气推辞',
                            effects: { connections: -3 },
                            result: '你客气地推辞了，小李有点尴尬。后来你才知道，那天他确实有事要找你帮忙……'
                        },
                        {
                            text: '回请一杯',
                            effects: { connections: +10, money: -30, stress: -5 },
                            result: '你接受了奶茶并回请了一杯，两人关系迅速升温。在体制内，一杯奶茶的社交价值远超三十块钱。'
                        }
                    ]
                },
                {
                    id: 'elevator_leader',
                    name: '电梯里遇到大领导',
                    description: '你一个人在电梯里，门快关的时候——局长挤了进来！空气突然安静了……',
                    probability: 0.07,
                    options: [
                        {
                            text: '主动打招呼',
                            effects: { connections: +8, reputation: +5, stress: +10 },
                            result: '你鼓起勇气打了招呼，局长居然和你聊了几句！虽然你紧张得声音都在抖，但局长似乎记住了你。'
                        },
                        {
                            text: '低头看手机',
                            effects: { reputation: -3 },
                            result: '你假装在看手机，但屏幕上只有桌面壁纸。局长看了你一眼，你感觉那一眼比年终考核还可怕。'
                        },
                        {
                            text: '聊天气话题',
                            effects: { commAbility: +2, reputation: +3 },
                            result: '你硬着头皮聊了句"今天天气不错"，局长居然接了话！你们聊了一路天气，你觉得自己是社交鬼才。'
                        }
                    ]
                }
            ],

            personal: [
                {
                    id: 'family_matter',
                    name: '家中有事',
                    description: '家人打电话来说有事需要你回家一趟。你看了看桌上堆成山的文件……',
                    probability: 0.1,
                    options: [
                        {
                            text: '立即回去',
                            effects: { energy: -20, connections: -5 },
                            result: '你处理好了家里的事，但耽误了工作。回来后发现桌上又多了一摞文件，你叹了口气。'
                        },
                        {
                            text: '请家人理解',
                            effects: { connections: +5 },
                            result: '家人理解你的工作，但你心里有些愧疚。妈妈在电话里说："没事，工作要紧，妈等你回来。"你红了眼眶。'
                        },
                        {
                            text: '周末再回去',
                            effects: { reputation: +5, connections: -10 },
                            result: '你先忙工作，周末才回去。家人虽然没说什么，但你明显感觉到他们的失落。'
                        }
                    ]
                },
                {
                    id: 'health_warning',
                    name: '身体警报',
                    description: '最近你总觉得身体有些不对劲，脖子僵硬、眼睛干涩、偶尔还头晕……典型的办公室综合症。',
                    probability: 0.08,
                    options: [
                        {
                            text: '去医院检查',
                            effects: { money: -500, health: +20, energy: -10 },
                            result: '检查结果还好，医生让你注意休息，少熬夜，多运动。你默默记下了，然后回去继续加班。'
                        },
                        {
                            text: '多休息几天',
                            effects: { energy: +30, reputation: -5 },
                            result: '你休息了几天，身体好转但工作积压了。回来后桌上堆满了待办事项，你感觉比生病还累。'
                        },
                        {
                            text: '硬撑着',
                            effects: { health: -15, stress: +10 },
                            risk: 0.4,
                            riskEffect: { health: -20 },
                            result: '你坚持工作，但身体越来越差。某天开会时你突然眼前一黑，同事们赶紧把你送到了医务室……'
                        }
                    ]
                },
                {
                    id: 'hongbao',
                    name: '意外之财',
                    description: '你在办公室门口捡到一个红包。在体制内，这可是个敏感物品……',
                    probability: 0.05,
                    options: [
                        {
                            text: '上交领导',
                            effects: { reputation: +15, connections: +5 },
                            result: '领导表扬了你的诚实，还在会上提了一嘴。你成了"拾金不昧好同志"，虽然红包里只有两百块。'
                        },
                        {
                            text: '收起来',
                            effects: { money: +500 },
                            risk: 0.6,
                            riskEffect: { reputation: -20, connections: -15 },
                            result: '你心虚了好几天，总觉得有人在看你。后来才知道那是同事结婚的份子钱，丢的人急得团团转……'
                        },
                        {
                            text: '原地等待失主',
                            effects: { connections: +10, energy: -5 },
                            result: '等了半天没人来，你最终还是交给了领导。领导说："小同志，觉悟很高嘛！"'
                        }
                    ]
                },
                {
                    id: 'relationship_choice',
                    name: '人情往来',
                    description: '一个老同学找你帮忙，想让你给他办点事。这事说大不大说小不小，但有点打擦边球……',
                    probability: 0.12,
                    options: [
                        {
                            text: '尽力帮忙',
                            effects: { connections: +15, reputation: +5 },
                            result: '你帮了忙，同学很感激。但你也提醒自己，这种事不能经常干，万一出了问题……'
                        },
                        {
                            text: '婉言拒绝',
                            effects: { connections: -5 },
                            result: '同学有些失望，但理解你的难处。你安慰自己：在体制内，守住底线比什么都重要。'
                        },
                        {
                            text: '索要好处',
                            effects: { money: +500, connections: -10 },
                            result: '你收了钱，但心里总觉得不太妥当。晚上躺在床上翻来覆去睡不着，总觉得有人在查你……'
                        }
                    ]
                },
                {
                    id: 'class_reunion',
                    name: '同学聚会攀比',
                    description: '大学同学聚会，你发现当年成绩不如你的同学有的当了老板，有的开上了豪车。而你还在写材料……',
                    probability: 0.08,
                    options: [
                        {
                            text: '低调参加',
                            effects: { stress: +15, connections: +5 },
                            result: '你参加了聚会，全程低调。当别人问你做什么时，你说"在机关上班"，然后默默听着他们吹牛。'
                        },
                        {
                            text: '大方赴约',
                            effects: { money: -300, stress: +10, reputation: +5 },
                            result: '你大方赴约，还主动买了单。同学们纷纷说"还是体制内稳定"，你笑了笑，信用卡在滴血。'
                        },
                        {
                            text: '找借口不去',
                            effects: { stress: -5, connections: -5 },
                            result: '你找了个借口没去，在家刷手机看他们发的朋友圈。虽然避免了攀比，但心里还是有点不是滋味。'
                        }
                    ]
                },
                {
                    id: 'family_pressure_marriage',
                    name: '家人催婚',
                    description: '周末回家，七大姑八大姨围着你问："有对象了吗？""什么时候结婚？""隔壁小王孩子都会打酱油了！"',
                    probability: 0.1,
                    options: [
                        {
                            text: '耐心应对',
                            effects: { stress: +15, connections: +5 },
                            result: '你耐心地回答了每个问题，虽然内心崩溃了无数次。最后你妈说："下周给你安排了个相亲。"你：？？？'
                        },
                        {
                            text: '以工作为由推脱',
                            effects: { reputation: +5, stress: +10 },
                            result: '你说"最近工作太忙了"，亲戚们虽然不再追问，但眼神里写满了"这孩子是不是有什么问题"。'
                        },
                        {
                            text: '反击：你们当年不也晚婚？',
                            effects: { stress: -5, connections: -8 },
                            result: '你据理力争，成功堵住了亲戚们的嘴。但你妈事后打电话说："你这样说话，以后谁还给你介绍对象？"'
                        }
                    ]
                },
                {
                    id: 'health_checkup',
                    name: '体检报告异常',
                    description: '单位组织体检，你的报告上有几个指标亮了红灯：脂肪肝、颈椎退变、血脂偏高……你才三十出头啊！',
                    probability: 0.07,
                    options: [
                        {
                            text: '认真对待，开始锻炼',
                            effects: { health: +15, energy: -10, stress: -5 },
                            result: '你办了张健身卡，开始每天跑步。一个月后你瘦了两斤，但健身卡已经在抽屉里吃灰了。'
                        },
                        {
                            text: '调整饮食',
                            effects: { health: +10, money: -200 },
                            result: '你开始注意饮食，少吃油腻多吃蔬菜。但食堂的菜……你只能默默多打一份青菜。'
                        },
                        {
                            text: '体制内标配，正常',
                            effects: { health: -10, stress: +5 },
                            result: '你安慰自己"办公室人群都这样"，然后继续坐着不动、加班吃外卖。体检医生的话被你选择性遗忘了。'
                        }
                    ]
                },
                {
                    id: 'mortgage_pressure',
                    name: '房贷压力',
                    description: '这个月房贷又要还了，你看了看工资条和银行卡余额，陷入了沉思……',
                    probability: 0.09,
                    options: [
                        {
                            text: '省吃俭用',
                            effects: { money: +300, stress: +10, health: -5 },
                            result: '你开始带饭上班、取消所有订阅、走路上下班。同事们以为你在减肥，只有你知道真相。'
                        },
                        {
                            text: '找副业赚外快',
                            effects: { money: +500, energy: -25, stress: +10 },
                            risk: 0.2,
                            riskEffect: { reputation: -10 },
                            result: '你利用业余时间做副业，虽然赚了点钱但精力严重不足。体制内做副业要低调，万一被知道了……'
                        },
                        {
                            text: '向父母求助',
                            effects: { money: +1000, connections: -5 },
                            result: '你厚着脸皮向父母借了钱，虽然他们嘴上说"没事"，但你看到他们偷偷翻存折时心里很不是滋味。'
                        }
                    ]
                }
            ],

            hidden: [
                {
                    id: 'secret_file',
                    name: '神秘文件',
                    description: '你在整理文件时发现了一份标注为"机密"的档案，封面已经泛黄，看起来有些年头了……',
                    probability: 0.03,
                    minDay: 60,
                    options: [
                        {
                            text: '仔细阅读',
                            effects: { insight: 1.2, reputation: +10 },
                            result: '你了解了单位的一些历史，有些事情和你想的不太一样。知识就是力量，尤其是在体制内。'
                        },
                        {
                            text: '交给领导',
                            effects: { reputation: +15 },
                            result: '领导对你的谨慎表示赞赏："小同志，保密意识很强嘛！"你被安排参加了保密培训，签了一堆承诺书。'
                        },
                        {
                            text: '偷偷复印',
                            effects: { connections: +20 },
                            risk: 0.5,
                            riskEffect: { reputation: -30 },
                            result: '你获得了一些重要信息，但风险很大。万一被发现，后果不堪设想……你把复印件锁在了最深的抽屉里。'
                        }
                    ]
                },
                {
                    id: 'office_politics',
                    name: '办公室政治内幕',
                    description: '你无意中听到了两位中层领导的密谈，内容涉及即将到来的人事调整和某些"安排"……',
                    probability: 0.02,
                    minReputation: 30,
                    minDay: 45,
                    options: [
                        {
                            text: '假装什么都没听到',
                            effects: { stress: +10, insight: 1.5 },
                            result: '你悄悄离开，假装什么都没发生。但你知道了一些不该知道的事，这让你既兴奋又不安。在体制内，信息就是权力，但也是负担。'
                        },
                        {
                            text: '告诉信任的领导',
                            effects: { connections: +15, reputation: +10 },
                            risk: 0.4,
                            riskEffect: { connections: -20, reputation: -15 },
                            result: '你选择向信任的领导透露了此事。领导若有所思地点了点头，但之后你感觉某些人对你的态度变了……'
                        },
                        {
                            text: '利用信息为自己谋利',
                            effects: { connections: +25, reputation: +10 },
                            risk: 0.6,
                            riskEffect: { reputation: -25, connections: -15 },
                            result: '你利用这些信息提前布局，确实获得了一些好处。但纸包不住火，万一哪天被人知道了……'
                        }
                    ]
                },
                {
                    id: 'retired_leader',
                    name: '偶遇退休老领导',
                    description: '你在公园晨练时遇到了单位的退休老领导。他看起来精神矍铄，正在打太极拳……',
                    probability: 0.025,
                    minDay: 30,
                    options: [
                        {
                            text: '热情上前问候',
                            effects: { connections: +20, reputation: +10, insight: 1.3 },
                            result: '老领导很高兴你还记得他，拉着你聊了两个小时。他讲了很多单位的历史和人情世故，你受益匪浅。临走他说："年轻人，好好干。"'
                        },
                        {
                            text: '简单打个招呼',
                            effects: { connections: +5, reputation: +5 },
                            result: '你礼貌地打了招呼就离开了。老领导微笑着点了点头，你感觉他似乎想多说几句……'
                        },
                        {
                            text: '绕道走开',
                            effects: { connections: -5 },
                            result: '你假装没看到就走了。后来听说老领导那天在公园里等了很久，逢人就说"现在的年轻人啊"……你有点内疚。'
                        }
                    ]
                }
            ]
        };
    }

    canTrigger(event) {
        if (event.minReputation && gameState.reputation < event.minReputation) {
            return false;
        }

        if (event.minDay && gameState.month < event.minDay) {
            return false;
        }

        if (this.eventCooldowns.has(event.id)) {
            const lastTriggered = this.eventCooldowns.get(event.id);
            if (gameState.month - lastTriggered < this.COOLDOWN_DAYS) {
                return false;
            }
        }

        return true;
    }

    meetsRequirement(option) {
        if (!option.requirement) return true;

        for (const [key, value] of Object.entries(option.requirement)) {
            if (gameState[key] !== undefined && gameState[key] < value) {
                return false;
            }
        }
        return true;
    }

    checkRandomEvents() {
        if (!gameState || !gameState.month || gameState.month < 1) return;

        if (gameState.month === this.lastEventMonth) return;
        this.lastEventMonth = gameState.month;

        let eventChance = 0.5;
        if (typeof skillSystem !== 'undefined' && skillSystem.getEffect) {
            eventChance *= skillSystem.getEffect('eventChance');
        }

        if (Math.random() > eventChance) return;

        const categories = ['emergency', 'opportunity', 'daily', 'personal', 'hidden'];

        for (const category of categories) {
            const events = this.eventPool[category];
            if (!events) continue;

            for (const event of events) {
                if (!this.canTrigger(event)) continue;

                let probability = event.probability;

                if (category === 'emergency' && gameState.stress > 70) {
                    probability *= 1.5;
                }

                if (Math.random() < probability) {
                    this.triggerEvent(event);
                    return;
                }
            }
        }
    }

    forceTriggerEvent(eventId) {
        for (const category of Object.values(this.eventPool)) {
            const event = category.find(e => e.id === eventId);
            if (event) {
                this.triggerEvent(event);
                return;
            }
        }
    }

    triggerEvent(event) {
        this.activeEvents.push(event);
        this.eventCooldowns.set(event.id, gameState.month);

        this.eventHistory.push({
            id: event.id,
            day: gameState.month,
            name: event.name
        });

        eventBus.emit('event:triggered', event);
        eventBus.emit('audio:play', { type: 'notification' });

        if (typeof pixelSceneRenderer !== 'undefined') {
            const sceneMap = {
                'fire_inspection': 'office',
                'urgent_report': 'office',
                'inspection_visit': 'corridor',
                'hygiene_inspection': 'cafeteria',
                'urgent_material': 'office',
                'petition_visit': 'entrance',
                'public_opinion': 'office',
                'training_notice': 'meeting',
                'promotion_opportunity': 'leader_office',
                'media_interview': 'meeting',
                'party_activist': 'meeting',
                'team_building': 'rooftop',
                'secretary_vacancy': 'corridor',
                'excellence_award': 'leader_office',
                'slack_opportunity': 'rest_area',
                'gossip_spread': 'cafeteria',
                'overtime_notice': 'office',
                'colleague_help': 'corridor',
                'leadership_change': 'leader_office',
                'annual_meeting': 'meeting',
                'work_report': 'office',
                'lunch_break': 'cafeteria',
                'afternoon_tea': 'rest_area'
            };
            const scene = sceneMap[event.id] || 'office';
            pixelSceneRenderer.changeScene(scene);
        }

        this.showEventUI(event);
        
        if (typeof narratorSystem !== 'undefined' && narratorSystem.getNarratorComment) {
            const category = this.getEventCategory(event);
            const comment = narratorSystem.getNarratorComment(category);
            if (comment) {
                setTimeout(() => {
                    narratorSystem.showNarratorMessage(comment, 'event', true);
                }, 500);
            }
        }
    }
    
    getEventCategory(event) {
        const emergencyEvents = ['fire_inspection', 'urgent_report', 'inspection_visit', 'hygiene_inspection', 
                              'urgent_material', 'petition_visit', 'public_opinion'];
        const opportunityEvents = ['training_notice', 'promotion_opportunity', 'media_interview', 
                                   'party_activist', 'team_building', 'secretary_vacancy', 'excellence_award'];
        
        if (emergencyEvents.includes(event.id)) return 'emergency';
        if (opportunityEvents.includes(event.id)) return 'opportunity';
        return 'daily';
    }

    showEventUI(event) {
        const choices = event.options.map((option, index) => ({
            text: option.text + (option.requirement ? ' ⭐' : ''),
            callback: () => this.handleChoice(event, index)
        }));

        const content = `
            <div class="event-card">
                <div class="event-category">${this.getCategoryName(event.id)}</div>
                <div class="event-description">${event.description}</div>
            </div>
        `;

        eventBus.emit('ui:showModal', {
            title: `⚡ ${event.name}`,
            content,
            buttons: choices
        });
    }

    getCategoryName(eventId) {
        const categoryMap = {
            fire_inspection: '紧急',
            urgent_report: '紧急',
            inspection_visit: '紧急',
            hygiene_inspection: '紧急',
            urgent_material: '紧急',
            petition_visit: '紧急',
            public_opinion: '紧急',
            training_notice: '机遇',
            promotion_opportunity: '机遇',
            media_interview: '机遇',
            party_activist: '机遇',
            team_building: '机遇',
            secretary_vacancy: '机遇',
            excellence_award: '机遇',
            colleague_help: '日常',
            office_gossip: '日常',
            birthday_party: '日常',
            leader_invite: '日常',
            canteen_new_dish: '日常',
            ac_broken: '日常',
            unit_welfare: '日常',
            milk_tea_treat: '日常',
            elevator_leader: '日常',
            family_matter: '个人',
            health_warning: '个人',
            hongbao: '个人',
            relationship_choice: '个人',
            class_reunion: '个人',
            family_pressure_marriage: '个人',
            health_checkup: '个人',
            mortgage_pressure: '个人',
            secret_file: '隐藏',
            office_politics: '隐藏',
            retired_leader: '隐藏'
        };

        const category = categoryMap[eventId] || '随机';
        const colors = {
            '紧急': '#e74c3c',
            '机遇': '#f39c12',
            '日常': '#3498db',
            '个人': '#2ecc71',
            '隐藏': '#9b59b6'
        };

        return `<span style="color: ${colors[category] || '#888'};">${category}事件</span>`;
    }

    handleChoice(event, choiceIndex) {
        const choice = event.options[choiceIndex];

        if (choice.requirement && !this.meetsRequirement(choice)) {
            eventBus.emit('ui:showMessage', {
                text: '你的能力还不足以完成这个选项……',
                type: 'warning'
            });
            return;
        }

        const result = { choiceIndex };

        if (choice.effects) {
            this.applyEffects(choice.effects, false);
        }

        if (choice.risk && Math.random() < choice.risk) {
            if (choice.riskEffect) {
                this.applyEffects(choice.riskEffect, true);
            }
            result.wasRisky = true;
        }

        eventBus.emit('ui:showMessage', {
            text: choice.result,
            type: result.wasRisky ? 'warning' : 'success'
        });

        eventBus.emit('audio:play', {
            type: result.wasRisky ? 'warning' : 'success'
        });

        eventBus.emit('event:resolved', { event, choiceIndex, result });

        this.activeEvents = this.activeEvents.filter(e => e.id !== event.id);
    }

    applyEffects(effects, includeRisk = false) {
        const effectMapping = {
            reputation: (v) => gameState.modifyStat('reputation', v),
            connections: (v) => gameState.modifyStat('connections', v),
            energy: (v) => gameState.modifyStat('energy', v),
            stress: (v) => gameState.modifyStat('stress', v),
            health: (v) => gameState.modifyStat('health', v),
            money: (v) => { gameState.money += v; },
            exp: (v) => { gameState.exp += v; },
            workAbility: (v) => { gameState.workAbility += v; },
            execAbility: (v) => { gameState.execAbility += v; },
            commAbility: (v) => { gameState.commAbility += v; },
            stressAbility: (v) => { gameState.stressAbility += v; },
            skillPoints: (v) => { gameState.skillPoints = (gameState.skillPoints || 0) + v; },
            insight: (v) => { }
        };

        const effectNames = {
            reputation: '声望',
            connections: '人脉',
            energy: '精力',
            stress: '心态',
            health: '健康',
            money: '金钱',
            exp: '经验',
            workAbility: '工作能力',
            execAbility: '执行能力',
            commAbility: '交际能力',
            stressAbility: '抗压能力',
            skillPoints: '技能点',
            insight: '洞察力'
        };

        const changes = [];

        for (const [key, value] of Object.entries(effects)) {
            const apply = effectMapping[key];
            if (apply) {
                const oldValue = this.getStatValue(key);
                apply(value);
                const newValue = this.getStatValue(key);
                if (value !== 0) {
                    changes.push({
                        name: effectNames[key] || key,
                        change: value,
                        oldValue,
                        newValue
                    });
                }
            }
        }

        eventBus.emit('ui:updateStatus');

        if (changes.length > 0) {
            setTimeout(() => {
                this.showEffectChanges(changes, includeRisk);
            }, 300);
        }
    }

    getStatValue(key) {
        switch (key) {
            case 'reputation': return gameState.reputation;
            case 'connections': return gameState.connections;
            case 'energy': return gameState.energy;
            case 'stress': return gameState.stress;
            case 'health': return gameState.health;
            case 'money': return gameState.money;
            case 'exp': return gameState.exp;
            case 'workAbility': return gameState.workAbility;
            case 'execAbility': return gameState.execAbility;
            case 'commAbility': return gameState.commAbility;
            case 'stressAbility': return gameState.stressAbility;
            case 'skillPoints': return gameState.skillPoints || 0;
            default: return 0;
        }
    }

    showEffectChanges(changes, isRisk = false) {
        const icon = isRisk ? '⚠️' : '📊';
        const title = isRisk ? '⚠️ 风险后果' : '📊 属性变化';

        const changesHtml = changes.map(c => {
            const color = c.change > 0 ? '#2ecc71' : '#e74c3c';
            const sign = c.change > 0 ? '+' : '';
            const arrow = c.change > 0 ? '↑' : '↓';
            return `<span style="color:${color};">${c.name}: ${sign}${c.change} ${arrow}</span>`;
        }).join('<br>');

        const content = `
            <div style="text-align:center;">
                <div style="font-size:24px;margin-bottom:8px;">${icon}</div>
                <div style="font-weight:bold;margin-bottom:12px;">${title.replace(icon, '').trim()}</div>
                <div style="font-size:14px;line-height:1.8;">
                    ${changesHtml}
                </div>
            </div>
        `;

        eventBus.emit('ui:showModal', {
            title,
            content,
            buttons: [
                { text: '知道了', callback: () => {} }
            ]
        });

        setTimeout(() => {
            eventBus.emit('ui:hideModal');
        }, 1500);

        this.showFloatingChanges(changes);
    }

    showFloatingChanges(changes) {
        const container = document.getElementById('main-screen');
        if (!container) return;

        changes.forEach((change, index) => {
            const floater = document.createElement('div');
            const color = change.change > 0 ? '#2ecc71' : '#e74c3c';
            const sign = change.change > 0 ? '+' : '';
            floater.textContent = `${change.name} ${sign}${change.change}`;
            floater.style.cssText = `
                position: fixed;
                top: 120px;
                right: 20px;
                padding: 8px 16px;
                background: ${color};
                color: white;
                border-radius: 4px;
                font-size: 14px;
                font-weight: bold;
                z-index: 9999;
                animation: floatUp 2s ease-out forwards;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            `;
            floater.style.animationDelay = `${index * 0.2}s`;
            document.body.appendChild(floater);

            setTimeout(() => {
                if (floater.parentNode) {
                    floater.parentNode.removeChild(floater);
                }
            }, 2500);
        });

        if (!document.getElementById('float-animation-style')) {
            const style = document.createElement('style');
            style.id = 'float-animation-style';
            style.textContent = `
                @keyframes floatUp {
                    0% { opacity: 1; transform: translateY(0) translateX(0); }
                    100% { opacity: 0; transform: translateY(-50px) translateX(10px); }
                }
            `;
            document.head.appendChild(style);
        }
    }

    getEventHistory() {
        return this.eventHistory;
    }
}

const eventSystem = new EventSystem();
