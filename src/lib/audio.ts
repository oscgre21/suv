
"use client";

// This file uses the Web Audio API to generate sounds programmatically.
// It runs only on the client-side.

let audioContext: AudioContext | null = null;
let loopingSoundNodes: { oscillator: OscillatorNode, gainNode: GainNode, intervalId: NodeJS.Timeout } | null = null;

const getAudioContext = () => {
    if (typeof window !== 'undefined' && !audioContext) {
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContext;
};

// Function to play a success sound
export const playSuccessSound = () => {
    const context = getAudioContext();
    if (!context) return;

    // Create an oscillator
    const oscillator = context.createOscillator();
    // Create a gain node to control the volume
    const gainNode = context.createGain();

    // Configure the oscillator
    oscillator.type = 'sine'; // sine wave is a clean, simple tone
    oscillator.frequency.setValueAtTime(600, context.currentTime); // Start at a higher pitch
    oscillator.frequency.exponentialRampToValueAtTime(880, context.currentTime + 0.1); // Ramp up

    // Configure the gain (volume)
    gainNode.gain.setValueAtTime(0.3, context.currentTime); // Start with some volume
    gainNode.gain.exponentialRampToValueAtTime(0.00001, context.currentTime + 0.2); // Fade out quickly

    // Connect the nodes: oscillator -> gain -> destination (speakers)
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);

    // Start and stop the sound
    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + 0.2);
};

// Function to play an error/denial sound
export const playErrorSound = () => {
    const context = getAudioContext();
    if (!context) return;

    // Create an oscillator
    const oscillator = context.createOscillator();
    // Create a gain node
    const gainNode = context.createGain();

    // Configure the oscillator for a more jarring sound
    oscillator.type = 'square'; // square wave is harsher than sine
    oscillator.frequency.setValueAtTime(220, context.currentTime); // A lower, dissonant pitch

    // Configure the gain
    gainNode.gain.setValueAtTime(0.2, context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.00001, context.currentTime + 0.15);

    // Connect the nodes
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);

    // Start and stop
    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + 0.15);
};

// Function to play a looping alert sound
export const playLoopingAlertSound = () => {
    const context = getAudioContext();
    if (!context || loopingSoundNodes) return; // Don't start a new one if it's already playing

    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    oscillator.type = 'triangle';
    oscillator.frequency.value = 1200; // Higher frequency for a more acute sound
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    oscillator.start();

    const beep = () => {
        const now = context.currentTime;
        gainNode.gain.cancelScheduledValues(now);
        gainNode.gain.setValueAtTime(0, now);
        // Louder beep
        gainNode.gain.linearRampToValueAtTime(0.5, now + 0.05); 
        gainNode.gain.linearRampToValueAtTime(0, now + 0.15); 
    };

    // Play immediately and then set an interval to repeat
    beep(); 
    const intervalId = setInterval(beep, 600); // Repeat every 600ms

    loopingSoundNodes = { oscillator, gainNode, intervalId };
};

// Function to stop the looping alert sound
export const stopLoopingAlertSound = () => {
    if (loopingSoundNodes && audioContext) {
        clearInterval(loopingSoundNodes.intervalId);
        loopingSoundNodes.gainNode.gain.cancelScheduledValues(audioContext.currentTime);
        loopingSoundNodes.gainNode.gain.setTargetAtTime(0, audioContext.currentTime, 0.01);
        
        setTimeout(() => {
            if (loopingSoundNodes) {
                loopingSoundNodes.oscillator.stop();
                loopingSoundNodes.gainNode.disconnect();
                loopingSoundNodes.oscillator.disconnect();
                loopingSoundNodes = null;
            }
        }, 50);
    }
};
