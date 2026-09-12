export class Sound {

    constructor(file) {
        this.file = file;
        this.audios = new Set();
        this.currentAudio = null;
    }

    play() {
        return this.playAudio(false);
    }

    loop() {
        return this.playAudio(true);
    }

    stop() {
        if (this.currentAudio !== null) {
            this.stopAudio(this.currentAudio);
        }
    }

    stopAll() {
        for (const audio of this.audios) {
            this.stopAudio(audio);
        }
    }

    playAudio(loop) {
        const audio = new Audio(this.file);
        audio.loop = loop;
        this.audios.add(audio);
        this.currentAudio = audio;

        audio.addEventListener('ended', () => {
            this.audios.delete(audio);
            if (this.currentAudio === audio) {
                this.currentAudio = null;
            }
        }, { once: true });

        const playback = audio.play();
        playback.catch((error) => {
            console.error('Não foi possível reproduzir a música:', error);
            this.audios.delete(audio);
            if (this.currentAudio === audio) {
                this.currentAudio = null;
            }
        });

        return audio;
    }

    stopAudio(audio) {
        audio.pause();
        audio.currentTime = 0;
        this.audios.delete(audio);
        if (this.currentAudio === audio) {
            this.currentAudio = null;
        }
    }
}
