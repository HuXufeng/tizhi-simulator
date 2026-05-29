/**
 * 角色系统
 * 管理NPC角色、关系、好感度
 */
class CharacterSystem {
    constructor() {
        this.characters = {
            boss: {
                id: 'boss',
                name: '王处长',
                title: '处长',
                description: '你的直属领导，五十出头，为人严肃但公正。',
                personality: 'strict',
                faction: 'reformists',
                initialOpinion: 50
            },
            director: {
                id: 'director',
                name: '李主任',
                title: '办公室主任',
                description: '办公室的实际管理者，四十多岁，做事圆滑。',
                personality: 'slick',
                faction: 'traditionalists',
                initialOpinion: 45
            },
            colleague_a: {
                id: 'colleague_a',
                name: '小张',
                title: '科员',
                description: '比你早来两年的年轻同事，热情开朗。',
                personality: 'friendly',
                faction: 'reformists',
                initialOpinion: 60
            },
            colleague_b: {
                id: 'colleague_b',
                name: '老刘',
                title: '副科长',
                description: '办公室的老同志，经验丰富但有些保守。',
                personality: 'conservative',
                faction: 'traditionalists',
                initialOpinion: 40
            },
            colleague_c: {
                id: 'colleague_c',
                name: '小陈',
                title: '科员',
                description: '和你同期进来的同事，性格内向但做事认真。',
                personality: 'introvert',
                faction: 'neutrals',
                initialOpinion: 55
            }
        };

        this._initRelationships();
    }

    _initRelationships() {
        Object.values(this.characters).forEach(char => {
            if (!gameState.relationships[char.id]) {
                gameState.relationships[char.id] = {
                    opinion: char.initialOpinion,
                    intimacy: 30,
                    trust: 30,
                    lastInteraction: 0,
                    interactionCount: 0
                };
            }
        });
    }

    /**
     * 获取角色信息
     */
    getCharacter(id) {
        return this.characters[id] || null;
    }

    /**
     * 获取所有角色
     */
    getAllCharacters() {
        return Object.values(this.characters);
    }

    /**
     * 获取与某角色的关系
     */
    getRelationship(charId) {
        return gameState.relationships[charId] || null;
    }

    /**
     * 修改好感度
     */
    modifyOpinion(charId, delta) {
        if (!gameState.relationships[charId]) return;
        const rel = gameState.relationships[charId];
        rel.opinion = Math.max(0, Math.min(100, rel.opinion + delta));
        rel.lastInteraction = gameState.month;
        rel.interactionCount++;
        eventBus.emit('character:opinionChanged', { charId, opinion: rel.opinion, delta });
    }

    /**
     * 获取好感度描述
     */
    getOpinionLabel(opinion) {
        if (opinion >= 90) return '挚友';
        if (opinion >= 75) return '好友';
        if (opinion >= 60) return '友善';
        if (opinion >= 45) return '普通';
        if (opinion >= 30) return '冷淡';
        if (opinion >= 15) return '疏远';
        return '敌视';
    }

    /**
     * 获取角色对玩家的态度描述
     */
    getAttitudeDescription(charId) {
        const rel = this.getRelationship(charId);
        const char = this.getCharacter(charId);
        if (!rel || !char) return '';

        const opinion = rel.opinion;
        const templates = {
            strict: {
                high: '对你颇为赏识，认为你是可造之材。',
                mid: '对你持观望态度，还在考察你的能力。',
                low: '对你的工作表现不太满意。'
            },
            slick: {
                high: '对你笑脸相迎，但谁知道心里怎么想。',
                mid: '对你客客气气，保持着适当的距离。',
                low: '对你有些冷淡，可能你得罪过他。'
            },
            friendly: {
                high: '把你当好朋友，经常找你聊天。',
                mid: '对你挺友好的，偶尔一起吃饭。',
                low: '对你有些疏远，可能有什么误会。'
            },
            conservative: {
                high: '认可你的能力，觉得你是个靠谱的年轻人。',
                mid: '对你没什么特别看法，按规矩办事。',
                low: '觉得你太冒进，不够稳重。'
            },
            introvert: {
                high: '虽然话不多，但对你很信任。',
                mid: '和你保持着礼貌的同事关系。',
                low: '见到你就躲，可能你让他不舒服。'
            }
        };

        const level = opinion >= 70 ? 'high' : opinion >= 40 ? 'mid' : 'low';
        const personality = char.personality;
        return (templates[personality] && templates[personality][level]) || '';
    }
}

// 全局单例
const characterSystem = new CharacterSystem();