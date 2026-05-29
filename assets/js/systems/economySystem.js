/**
 * 经济系统
 * 管理金钱、收支、人情往来
 */
class EconomySystem {
    constructor() {
        this.fixedExpenses = [
            { name: '房租', amount: 1200, dueDay: 1 },
            { name: '水电煤', amount: 300, dueDay: 5 },
            { name: '交通费', amount: 200, dueDay: 10 }
        ];

        this.variableExpenses = [
            { name: '餐饮', base: 800, variance: 0.3 },
            { name: '社交应酬', base: 500, variance: 0.5 },
            { name: '家庭支出', base: 1000, variance: 0.2 }
        ];
    }

    /**
     * 获取当前余额
     */
    getBalance() {
        return gameState.money;
    }

    /**
     * 收入
     */
    addMoney(amount, source = '') {
        gameState.money += amount;
        eventBus.emit('economy:moneyChanged', { amount, source, balance: gameState.money });
    }

    /**
     * 支出
     */
    spendMoney(amount, purpose = '') {
        if (gameState.money < amount) return false;
        gameState.money -= amount;
        eventBus.emit('economy:moneyChanged', { amount: -amount, purpose, balance: gameState.money });
        return true;
    }

    /**
     * 发工资
     */
    paySalary() {
        const bonus = this._calculateBonus();
        const total = gameState.monthlySalary + bonus;
        this.addMoney(total, '工资');
        return { salary: gameState.monthlySalary, bonus, total };
    }

    /**
     * 月度结算
     */
    monthlySettlement() {
        let totalExpense = 0;
        const details = [];

        // 固定支出
        this.fixedExpenses.forEach(exp => {
            this.spendMoney(exp.amount, exp.name);
            totalExpense += exp.amount;
            details.push({ name: exp.name, amount: exp.amount });
        });

        // 可变支出（简化：每天平均）
        this.variableExpenses.forEach(exp => {
            const dailyAmount = Math.round(exp.base / 30);
            this.spendMoney(dailyAmount, exp.name);
            totalExpense += dailyAmount;
            details.push({ name: exp.name, amount: dailyAmount });
        });

        eventBus.emit('economy:monthlySettlement', { totalExpense, details });
        return { totalExpense, details };
    }

    /**
     * 送礼
     */
    giveGift(charId, amount) {
        if (!this.spendMoney(amount, '送礼')) return false;

        const effect = Math.round(amount * 0.1); // 每100元+10好感
        characterSystem.modifyOpinion(charId, effect);
        eventBus.emit('economy:giftGiven', { charId, amount, effect });
        return effect;
    }

    _calculateBonus() {
        // 基于声望和职位的奖金
        const baseBonus = gameState.position * 200;
        const reputationBonus = Math.floor(gameState.reputation * 5);
        return baseBonus + reputationBonus;
    }
}

// 全局单例
const economySystem = new EconomySystem();