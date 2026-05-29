/**
 * 音效系统 - Web Audio API
 * 合成音效和环境音
 */
class AudioSystem {
    constructor() {
        this.context = null;
        this.masterGain = null;
        this.isEnabled = true;
        this.volume = 0.3;
        this.ambientOscillator = null;
        this.ambientGain = null;
        this.currentPhase = 'early';
        this.isInitialized = false;
        
        this.init();
    }

    /**
     * 初始化音频上下文
     */
    init() {
        if (this.isInitialized) return;
        
        try {
            this.context = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.context.createGain();
            this.masterGain.connect(this.context.destination);
            this.setVolume(this.volume);
            
            this.bindEvents();
            this.isInitialized = true;
            
            document.addEventListener('click', () => this.resume(), { once: true });
            document.addEventListener('touchstart', () => this.resume(), { once: true });
            
            console.log('AudioSystem initialized successfully');
            
        } catch (e) {
            console.warn('Web Audio API 不支持:', e);
            this.isEnabled = false;
        }
    }

    /**
     * 恢复音频上下文
     */
    resume() {
        if (this.context && this.context.state === 'suspended') {
            this.context.resume().then(() => {
                console.log('AudioContext resumed');
            });
        }
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        eventBus.on('audio:play', (data) => {
            if (typeof data === 'string') {
                this.playSound(data);
            } else {
                this.playSound(data.type);
            }
        });
        eventBus.on('audio:setVolume', (vol) => this.setVolume(vol));
        eventBus.on('audio:toggle', () => this.toggle());
        eventBus.on('game:start', () => this.startAmbient());
        eventBus.on('ui:showModal', () => this.lowerAmbient());
        eventBus.on('ui:hideModal', () => this.restoreAmbient());
        eventBus.on('phase:changed', (data) => this.onPhaseChanged(data.phase));
        eventBus.on('task:start', () => this.playTaskStart());
        eventBus.on('achievement:unlocked', () => this.playAchievement());
    }

    /**
     * 时间段变化回调
     */
    onPhaseChanged(phase) {
        if (this.currentPhase !== phase) {
            this.currentPhase = phase;
            this.transitionAmbient();
        }
    }

    transitionAmbient() {
        if (!this.ambientGain || !this.context) return;
        
        const intensities = {
            early: 0.1,
            mid: 0.06,
            late: 0.03
        };
        
        const targetIntensity = intensities[this.currentPhase] || 0.06;
        
        this.ambientGain.gain.linearRampToValueAtTime(
            targetIntensity,
            this.context.currentTime + 2
        );
        
        if (this.currentPhase === 'late') {
            this.playEveningChime();
        }
    }

    /**
     * 傍晚提示音
     */
    playEveningChime() {
        if (!this.isEnabled || !this.context) return;
        
        const osc = this.context.createOscillator();
        const gain = this.context.createGain();
        
        osc.connect(gain);
        gain.connect(this.masterGain);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(659.25, this.context.currentTime);
        osc.frequency.setValueAtTime(523.25, this.context.currentTime + 0.3);
        
        gain.gain.setValueAtTime(0.15, this.context.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.8);
        
        osc.start();
        osc.stop(this.context.currentTime + 0.8);
    }

    /**
     * 设置音量
     */
    setVolume(vol) {
        this.volume = Math.max(0, Math.min(1, vol));
        if (this.masterGain) {
            this.masterGain.gain.setValueAtTime(this.volume, this.context.currentTime);
        }
    }

    /**
     * 切换音效开关
     */
    toggle() {
        this.isEnabled = !this.isEnabled;
        if (this.masterGain) {
            this.masterGain.gain.setValueAtTime(
                this.isEnabled ? this.volume : 0,
                this.context.currentTime
            );
        }
        return this.isEnabled;
    }

    /**
     * 播放音效
     */
    playSound(type) {
        if (!this.isEnabled || !this.context) {
            console.log('Audio: attempting to play', type, 'but disabled or no context');
            return;
        }

        switch (type) {
            case 'click':
                this.playClick();
                break;
            case 'success':
                this.playSuccess();
                break;
            case 'warning':
                this.playWarning();
                break;
            case 'error':
                this.playError();
                break;
            case 'levelup':
                this.playLevelUp();
                break;
            case 'coin':
                this.playCoin();
                break;
            case 'type':
                this.playType();
                break;
            case 'notification':
                this.playNotification();
                break;
            case 'taskComplete':
                this.playTaskComplete();
                break;
            case 'slack':
                this.playSlack();
                break;
            case 'ambient':
                this.playAmbientSound();
                break;
            case 'button':
                this.playButton();
                break;
            default:
                this.playClick();
        }
    }

    /**
     * 按钮点击音效
     */
    playButton() {
        if (!this.context) return;
        
        const osc = this.context.createOscillator();
        const gain = this.context.createGain();
        
        osc.connect(gain);
        gain.connect(this.masterGain);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, this.context.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, this.context.currentTime + 0.03);
        
        gain.gain.setValueAtTime(0.2, this.context.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.06);
        
        osc.start();
        osc.stop(this.context.currentTime + 0.06);
    }

    /**
     * 点击音效
     */
    playClick() {
        if (!this.context) return;
        
        const osc = this.context.createOscillator();
        const gain = this.context.createGain();
        
        osc.connect(gain);
        gain.connect(this.masterGain);
        
        osc.frequency.setValueAtTime(800, this.context.currentTime);
        osc.frequency.exponentialRampToValueAtTime(600, this.context.currentTime + 0.05);
        
        gain.gain.setValueAtTime(0.3, this.context.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.05);
        
        osc.start();
        osc.stop(this.context.currentTime + 0.05);
    }

    /**
     * 成功音效
     */
    playSuccess() {
        if (!this.context) return;
        
        const notes = [523.25, 659.25, 783.99];
        
        notes.forEach((freq, i) => {
            const osc = this.context.createOscillator();
            const gain = this.context.createGain();
            
            osc.connect(gain);
            gain.connect(this.masterGain);
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, this.context.currentTime + i * 0.1);
            
            gain.gain.setValueAtTime(0, this.context.currentTime + i * 0.1);
            gain.gain.linearRampToValueAtTime(0.3, this.context.currentTime + i * 0.1 + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + i * 0.1 + 0.3);
            
            osc.start(this.context.currentTime + i * 0.1);
            osc.stop(this.context.currentTime + i * 0.1 + 0.3);
        });
    }

    /**
     * 警告音效
     */
    playWarning() {
        if (!this.context) return;
        
        const osc = this.context.createOscillator();
        const gain = this.context.createGain();
        
        osc.connect(gain);
        gain.connect(this.masterGain);
        
        osc.type = 'square';
        osc.frequency.setValueAtTime(440, this.context.currentTime);
        
        gain.gain.setValueAtTime(0.2, this.context.currentTime);
        gain.gain.setValueAtTime(0.2, this.context.currentTime + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.2);
        
        osc.start();
        osc.stop(this.context.currentTime + 0.2);
    }

    /**
     * 错误音效
     */
    playError() {
        if (!this.context) return;
        
        const osc = this.context.createOscillator();
        const gain = this.context.createGain();
        
        osc.connect(gain);
        gain.connect(this.masterGain);
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, this.context.currentTime);
        osc.frequency.setValueAtTime(150, this.context.currentTime + 0.1);
        
        gain.gain.setValueAtTime(0.2, this.context.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.2);
        
        osc.start();
        osc.stop(this.context.currentTime + 0.2);
    }

    /**
     * 升级音效
     */
    playLevelUp() {
        if (!this.context) return;
        
        const notes = [523.25, 587.33, 659.25, 698.46, 783.99, 880, 987.77, 1046.5];
        
        notes.forEach((freq, i) => {
            const osc = this.context.createOscillator();
            const gain = this.context.createGain();
            
            osc.connect(gain);
            gain.connect(this.masterGain);
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, this.context.currentTime + i * 0.08);
            
            gain.gain.setValueAtTime(0, this.context.currentTime + i * 0.08);
            gain.gain.linearRampToValueAtTime(0.25, this.context.currentTime + i * 0.08 + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + i * 0.08 + 0.2);
            
            osc.start(this.context.currentTime + i * 0.08);
            osc.stop(this.context.currentTime + i * 0.08 + 0.2);
        });
    }

    /**
     * 金币音效
     */
    playCoin() {
        if (!this.context) return;
        
        const osc = this.context.createOscillator();
        const gain = this.context.createGain();
        
        osc.connect(gain);
        gain.connect(this.masterGain);
        
        osc.type = 'square';
        osc.frequency.setValueAtTime(987.77, this.context.currentTime);
        osc.frequency.setValueAtTime(1318.51, this.context.currentTime + 0.05);
        
        gain.gain.setValueAtTime(0.15, this.context.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.15);
        
        osc.start();
        osc.stop(this.context.currentTime + 0.15);
    }

    /**
     * 打字音效
     */
    playType() {
        if (!this.context) return;
        
        const osc = this.context.createOscillator();
        const gain = this.context.createGain();
        
        osc.connect(gain);
        gain.connect(this.masterGain);
        
        osc.type = 'square';
        osc.frequency.setValueAtTime(1000 + Math.random() * 200, this.context.currentTime);
        
        gain.gain.setValueAtTime(0.08, this.context.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.03);
        
        osc.start();
        osc.stop(this.context.currentTime + 0.03);
    }

    /**
     * 通知音效
     */
    playNotification() {
        if (!this.context) return;
        
        const osc = this.context.createOscillator();
        const gain = this.context.createGain();
        
        osc.connect(gain);
        gain.connect(this.masterGain);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, this.context.currentTime);
        osc.frequency.setValueAtTime(1046.5, this.context.currentTime + 0.15);
        
        gain.gain.setValueAtTime(0.2, this.context.currentTime);
        gain.gain.setValueAtTime(0.2, this.context.currentTime + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.25);
        
        osc.start();
        osc.stop(this.context.currentTime + 0.25);
    }

    /**
     * 任务完成音效
     */
    playTaskComplete() {
        if (!this.context) return;
        
        const playBeep = (freq, delay) => {
            const osc = this.context.createOscillator();
            const gain = this.context.createGain();
            
            osc.connect(gain);
            gain.connect(this.masterGain);
            
            osc.type = 'square';
            osc.frequency.setValueAtTime(freq, this.context.currentTime + delay);
            
            gain.gain.setValueAtTime(0.15, this.context.currentTime + delay);
            gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + delay + 0.08);
            
            osc.start(this.context.currentTime + delay);
            osc.stop(this.context.currentTime + delay + 0.08);
        };
        
        playBeep(523, 0);
        playBeep(659, 0.1);
        playBeep(784, 0.2);
    }

    /**
     * 任务开始音效
     */
    playTaskStart() {
        if (!this.context) return;
        
        const osc = this.context.createOscillator();
        const gain = this.context.createGain();
        
        osc.connect(gain);
        gain.connect(this.masterGain);
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(400, this.context.currentTime);
        osc.frequency.exponentialRampToValueAtTime(600, this.context.currentTime + 0.1);
        
        gain.gain.setValueAtTime(0.15, this.context.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.15);
        
        osc.start();
        osc.stop(this.context.currentTime + 0.15);
    }

    /**
     * 摸鱼音效
     */
    playSlack() {
        if (!this.context) return;
        
        const notes = [392, 440, 392];
        
        notes.forEach((freq, i) => {
            const osc = this.context.createOscillator();
            const gain = this.context.createGain();
            
            osc.connect(gain);
            gain.connect(this.masterGain);
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, this.context.currentTime + i * 0.12);
            
            gain.gain.setValueAtTime(0, this.context.currentTime + i * 0.12);
            gain.gain.linearRampToValueAtTime(0.1, this.context.currentTime + i * 0.12 + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + i * 0.12 + 0.15);
            
            osc.start(this.context.currentTime + i * 0.12);
            osc.stop(this.context.currentTime + i * 0.12 + 0.15);
        });
    }

    /**
     * 成就解锁音效
     */
    playAchievement() {
        if (!this.context) return;
        
        const notes = [523.25, 659.25, 783.99, 1046.5];
        
        notes.forEach((freq, i) => {
            const osc = this.context.createOscillator();
            const gain = this.context.createGain();
            
            osc.connect(gain);
            gain.connect(this.masterGain);
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, this.context.currentTime + i * 0.15);
            
            gain.gain.setValueAtTime(0, this.context.currentTime + i * 0.15);
            gain.gain.linearRampToValueAtTime(0.2, this.context.currentTime + i * 0.15 + 0.03);
            gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + i * 0.15 + 0.4);
            
            osc.start(this.context.currentTime + i * 0.15);
            osc.stop(this.context.currentTime + i * 0.15 + 0.4);
        });
    }

    /**
     * 播放环境音
     */
    playAmbientSound() {
        if (!this.isEnabled || !this.context) return;
        
        const osc = this.context.createOscillator();
        const gain = this.context.createGain();
        const filter = this.context.createBiquadFilter();
        
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);
        
        osc.type = 'sine';
        osc.frequency.value = 100 + Math.random() * 50;
        
        filter.type = 'lowpass';
        filter.frequency.value = 200;
        
        gain.gain.setValueAtTime(0.03, this.context.currentTime);
        
        osc.start();
        osc.stop(this.context.currentTime + 2);
    }

    /**
     * 开始环境音
     */
    startAmbient() {
        if (!this.isEnabled || !this.context) return;
        
        this.stopAmbient();
        
        const bufferSize = 2 * this.context.sampleRate;
        const noiseBuffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }
        
        const noise = this.context.createBufferSource();
        noise.buffer = noiseBuffer;
        noise.loop = true;
        
        const filter = this.context.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 400;
        filter.Q.value = 1;
        
        this.ambientGain = this.context.createGain();
        this.ambientGain.gain.setValueAtTime(0.08, this.context.currentTime);
        
        noise.connect(filter);
        filter.connect(this.ambientGain);
        this.ambientGain.connect(this.masterGain);
        
        noise.start();
        this.ambientOscillator = noise;
        
        console.log('Ambient sound started');
    }

    /**
     * 停止环境音
     */
    stopAmbient() {
        if (this.ambientOscillator) {
            try {
                this.ambientOscillator.stop();
            } catch (e) {}
            this.ambientOscillator = null;
        }
    }

    /**
     * 降低环境音
     */
    lowerAmbient() {
        if (this.ambientGain) {
            this.ambientGain.gain.setValueAtTime(0.02, this.context.currentTime);
        }
    }

    /**
     * 恢复环境音
     */
    restoreAmbient() {
        if (this.ambientGain) {
            this.ambientGain.gain.setValueAtTime(0.08, this.context.currentTime);
        }
    }

    /**
     * 播放键盘声
     */
    playKeyboard() {
        if (!this.isEnabled || !this.context) return;
        
        const osc = this.context.createOscillator();
        const gain = this.context.createGain();
        
        osc.connect(gain);
        gain.connect(this.masterGain);
        
        osc.type = 'square';
        osc.frequency.setValueAtTime(200 + Math.random() * 100, this.context.currentTime);
        
        gain.gain.setValueAtTime(0.03, this.context.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + 0.02);
        
        osc.start();
        osc.stop(this.context.currentTime + 0.02);
    }

    /**
     * 播放钟表滴答声
     */
    playClockTick() {
        if (!this.isEnabled || !this.context) return;
        
        const osc = this.context.createOscillator();
        const gain = this.context.createGain();
        
        osc.connect(gain);
        gain.connect(this.masterGain);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1000, this.context.currentTime);
        
        gain.gain.setValueAtTime(0.05, this.context.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + 0.05);
        
        osc.start();
        osc.stop(this.context.currentTime + 0.05);
    }
}

// 全局单例
const audioSystem = new AudioSystem();

// 导出到全局
window.audioSystem = audioSystem;
