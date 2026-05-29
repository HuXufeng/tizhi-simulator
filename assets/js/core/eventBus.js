/**
 * 事件总线 - 模块间通信核心
 * 发布-订阅模式，解耦各系统模块
 */
class EventBus {
    constructor() {
        this._listeners = {};
        this._debug = false;
    }

    /**
     * 订阅事件
     * @param {string} event - 事件名，建议格式 'module:action'
     * @param {Function} callback - 回调函数
     * @returns {Function} 取消订阅函数
     */
    on(event, callback) {
        if (!this._listeners[event]) {
            this._listeners[event] = [];
        }
        this._listeners[event].push(callback);
        if (this._debug) console.log(`[EventBus] on: ${event}`);

        return () => this.off(event, callback);
    }

    /**
     * 取消订阅
     */
    off(event, callback) {
        if (!this._listeners[event]) return;
        this._listeners[event] = this._listeners[event].filter(cb => cb !== callback);
    }

    /**
     * 发布事件
     * @param {string} event - 事件名
     * @param {*} data - 事件数据
     */
    emit(event, data) {
        if (this._debug) console.log(`[EventBus] emit: ${event}`, data);
        if (!this._listeners[event]) return;
        this._listeners[event].forEach(callback => {
            try {
                callback(data);
            } catch (e) {
                console.error(`[EventBus] Error in handler for ${event}:`, e);
            }
        });
    }

    /**
     * 一次性订阅
     */
    once(event, callback) {
        const wrapper = (data) => {
            callback(data);
            this.off(event, wrapper);
        };
        this.on(event, wrapper);
    }

    /**
     * 清除所有监听
     */
    clear() {
        this._listeners = {};
    }
}

// 全局单例
const eventBus = new EventBus();