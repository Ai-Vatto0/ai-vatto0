// Async Queue für KI-Generierungen (max 2 gleichzeitig)
class GenerationQueue {
  constructor(maxConcurrent = 2) {
    this.queue = [];
    this.running = 0;
    this.maxConcurrent = maxConcurrent;
  }

  add(task) {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await task();
          resolve(result);
        } catch (err) {
          reject(err);
        }
      });
      this.process();
    });
  }

  async process() {
    while (this.running < this.maxConcurrent && this.queue.length > 0) {
      this.running++;
      const task = this.queue.shift();
      task().finally(() => {
        this.running--;
        if (this.queue.length > 0) this.process();
      });
    }
  }

  get pending() {
    return this.queue.length;
  }

  get active() {
    return this.running;
  }
}

// Singleton — eine Queue für die gesamte App
const videoQueue = new GenerationQueue(2);
const imageQueue = new GenerationQueue(2);

module.exports = { videoQueue, imageQueue };
