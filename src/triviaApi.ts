// Questions come from Open Trivia DB (https://opentdb.com), licensed CC BY-SA 4.0.
//
// No-repeat strategy:
// - A session token makes the API skip questions it has already served us.
// - Every question shown is remembered on the device per category, so repeats are also
//   caught if the token expires (after 6 hours idle) or is reset.
// - The API allows one question request per IP every 5 seconds, so we fetch up to 50 at
//   a time and keep the unplayed ones in a per-category queue; most rounds need no
//   network call at all.

export type Question = {
  q: string;
  o: string[];
  // index of the correct option in o
  a: number;
};

export type Category = {
  id: number;
  // "Books" for "Entertainment: Books"
  name: string;
  // "Entertainment" for "Entertainment: Books"; empty when the API name has no prefix
  group: string;
};

export type Round = {
  questions: Question[];
  // true when every question in the category had been played and it started over
  recycled: boolean;
};

export type KeyValueStorage = {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
};

export const GEOGRAPHY = 22;

const API = 'https://opentdb.com';
const BATCH = 50; // the API's maximum per request
const GAP_MS = 5100;
const TIMEOUT_MS = 12000;
const MAX_REQUESTS_PER_FILL = 20;
const KEYS = {
  token: 'otdb.token',
  seen: 'otdb.seen.v2',
  queues: 'otdb.queues.v2',
  categories: 'otdb.categories',
  // v1 stored Geography only
  oldSeen: 'otdb.seen',
  oldQueue: 'otdb.queue',
};

type ApiQuestion = { question: string; correct_answer: string; incorrect_answers: string[] };
type ApiResponse = {
  response_code: number;
  results?: ApiQuestion[];
  token?: string;
  trivia_categories?: { id: number; name: string }[];
};

export function shuffle<T>(list: T[]): T[] {
  const a = list.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function toQuestion(raw: ApiQuestion): Question {
  const correct = decodeURIComponent(raw.correct_answer);
  const options = shuffle([correct, ...raw.incorrect_answers.map(decodeURIComponent)]);
  return { q: decodeURIComponent(raw.question), o: options, a: options.indexOf(correct) };
}

function toCategory(raw: { id: number; name: string }): Category {
  const i = raw.name.indexOf(': ');
  return i < 0 ? { id: raw.id, name: raw.name, group: '' } : { id: raw.id, name: raw.name.slice(i + 2), group: raw.name.slice(0, i) };
}

export class TriviaSource {
  private storage: KeyValueStorage;
  private token: string | null = null;
  private seen: Record<number, Set<string>> = {};
  private queues: Record<number, Question[]> = {};
  private recycled: Record<number, boolean> = {};
  // categories that had fewer than a full batch left, so we stop asking for 50 there
  private small = new Set<number>();
  private categoryList: Category[] | null = null;
  private lastRequest = 0;
  private loaded: Promise<void> | null = null;
  // Rounds and background top-ups run one at a time so they never race on the queues.
  private chain: Promise<unknown> = Promise.resolve();

  constructor(storage: KeyValueStorage) {
    this.storage = storage;
  }

  // Geography first (it's the game's namesake), then alphabetical.
  async categories(): Promise<Category[]> {
    if (this.categoryList) return this.categoryList;
    await this.load();
    try {
      const res = await this.get('/api_category.php');
      const list = (res.trivia_categories ?? []).map(toCategory);
      if (!list.length) throw new Error('The trivia service sent no categories.');
      list.sort((x, y) =>
        x.id === GEOGRAPHY ? -1 : y.id === GEOGRAPHY ? 1 : (x.group + x.name).localeCompare(y.group + y.name),
      );
      this.categoryList = list;
      this.storage.setItem(KEYS.categories, JSON.stringify(list)).catch(() => {});
      return list;
    } catch (e) {
      // Fall back to the last list we saw, so the home screen still works on a flaky connection.
      const cached = await this.storage.getItem(KEYS.categories).catch(() => null);
      if (cached) return (this.categoryList = JSON.parse(cached) as Category[]);
      throw e;
    }
  }

  nextRound(category: number, size: number): Promise<Round> {
    const run = this.chain.then(() => this.take(category, size));
    // Top the queue up in the background so the next round in this category is instant.
    this.chain = run.then(
      () => (this.queue(category).length < size ? this.fill(category, size).catch(() => {}) : undefined),
      () => {},
    );
    return run;
  }

  private queue(category: number) {
    return (this.queues[category] ??= []);
  }

  private seenIn(category: number) {
    return (this.seen[category] ??= new Set());
  }

  private async take(category: number, size: number): Promise<Round> {
    await this.load();
    await this.fill(category, size);
    const questions = this.queue(category).splice(0, size);
    questions.forEach((q) => this.seenIn(category).add(q.q));
    const round = { questions, recycled: !!this.recycled[category] };
    this.recycled[category] = false;
    await this.save();
    return round;
  }

  private load() {
    if (!this.loaded) {
      this.loaded = (async () => {
        const [token, seen, queues, oldSeen, oldQueue] = await Promise.all(
          [KEYS.token, KEYS.seen, KEYS.queues, KEYS.oldSeen, KEYS.oldQueue].map((k) =>
            this.storage.getItem(k).catch(() => null),
          ),
        );
        this.token = token;
        try {
          const s: Record<string, string[]> = seen ? JSON.parse(seen) : {};
          const q: Record<string, Question[]> = queues ? JSON.parse(queues) : {};
          if (oldSeen) s[GEOGRAPHY] = [...(s[GEOGRAPHY] ?? []), ...JSON.parse(oldSeen)];
          if (oldQueue) q[GEOGRAPHY] = [...(q[GEOGRAPHY] ?? []), ...JSON.parse(oldQueue)];
          for (const id of Object.keys(s)) this.seen[+id] = new Set(s[id]);
          for (const id of Object.keys(q)) this.queues[+id] = q[id];
        } catch {
          this.seen = {};
          this.queues = {};
        }
        if (oldSeen || oldQueue) {
          await this.save();
          await Promise.all([this.storage.removeItem(KEYS.oldSeen), this.storage.removeItem(KEYS.oldQueue)]).catch(() => {});
        }
      })();
    }
    return this.loaded;
  }

  private async save() {
    const seen: Record<number, string[]> = {};
    for (const id of Object.keys(this.seen)) seen[+id] = [...this.seen[+id]];
    try {
      await Promise.all([
        this.token ? this.storage.setItem(KEYS.token, this.token) : this.storage.removeItem(KEYS.token),
        this.storage.setItem(KEYS.seen, JSON.stringify(seen)),
        this.storage.setItem(KEYS.queues, JSON.stringify(this.queues)),
      ]);
    } catch {
      // Storage is best effort; the session token still prevents repeats while the app runs.
    }
  }

  private async fill(category: number, size: number) {
    const queue = this.queue(category);
    let amount = this.small.has(category) ? size : BATCH;
    let restarted = false;
    for (let n = 0; queue.length < size; n++) {
      if (n >= MAX_REQUESTS_PER_FILL) throw new Error('Could not load enough new questions.');
      if (!this.token) {
        const res = await this.get('/api_token.php?command=request');
        if (!res.token) throw new Error('Could not start a trivia session.');
        this.token = res.token;
      }
      const res = await this.get(
        `/api.php?amount=${amount}&category=${category}&type=multiple&encode=url3986&token=${this.token}`,
      );
      switch (res.response_code) {
        case 0: {
          const seen = this.seenIn(category);
          const queued = new Set(queue.map((q) => q.q));
          for (const q of (res.results ?? []).map(toQuestion)) {
            if (!seen.has(q.q) && !queued.has(q.q)) queue.push(q);
          }
          break;
        }
        // Both mean "fewer questions left for this token than you asked for" (the API sends 4
        // even on a fresh token if the category is smaller than the amount). Ask for just one
        // round's worth; if even that fails, the category is used up.
        case 1:
        case 4:
          if (amount > size) {
            amount = size;
            this.small.add(category);
          } else {
            if (restarted) throw new Error('This category doesn’t have enough questions right now.');
            restarted = true;
            await this.startOver(category);
          }
          break;
        case 3: // token unknown or expired
          this.token = null;
          break;
        case 5: // rate limited; get() already spaces requests, so just try again
          break;
        default:
          throw new Error('The trivia service rejected the request.');
      }
    }
    await this.save();
  }

  // Every question in this category has been played: forget what was seen there and
  // reset the token. Other categories keep their seen lists, so they still never repeat.
  private async startOver(category: number) {
    this.seen[category] = new Set();
    this.recycled[category] = true;
    if (this.token) {
      const res = await this.get(`/api_token.php?command=reset&token=${this.token}`);
      if (res.response_code !== 0) this.token = null;
    }
  }

  // Only question requests count toward the 5-second limit.
  private async get(path: string): Promise<ApiResponse> {
    const throttled = path.startsWith('/api.php');
    if (throttled) {
      const wait = this.lastRequest + GAP_MS - Date.now();
      if (wait > 0) await sleep(wait);
      this.lastRequest = Date.now();
    }
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    let res: Response;
    try {
      res = await fetch(API + path, { signal: controller.signal });
    } catch {
      throw new Error(controller.signal.aborted ? 'The trivia service took too long to answer.' : 'Could not reach the trivia service.');
    } finally {
      clearTimeout(timer);
    }
    // Over the limit, the API answers with HTTP 429 rather than response_code 5.
    if (res.status === 429) {
      if (throttled) this.lastRequest = Date.now();
      return { response_code: 5 };
    }
    if (!res.ok) throw new Error('The trivia service returned an error (' + res.status + ').');
    return (await res.json()) as ApiResponse;
  }
}
