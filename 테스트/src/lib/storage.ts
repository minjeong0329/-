import {
  UserPreferences,
  Task,
  ScheduleBlock,
  FocusSession,
  DelayEvent,
  CharacterState,
  RewardTransaction,
  InventoryItem
} from '../types';

const DB_NAME = 'miruma_db';
const DB_VERSION = 1;

// Default initial preferences
export const DEFAULT_PREFERENCES: UserPreferences = {
  wakeTime: '07:30',
  sleepTime: '23:30',
  preferredFocusSlots: ['morning', 'afternoon'],
  focusDuration: 25,
  breakDuration: 5,
  pressureLevel: 'normal',
  characterName: '미루미',
  isRestMode: false,
  isNotificationsEnabled: false,
  hasCompletedOnboarding: false,
};

// Initial default character state
export const DEFAULT_CHARACTER: CharacterState = {
  name: '미루미',
  level: 1,
  currentXp: 0,
  xpToNextLevel: 100,
  totalPoints: 100, // starting gift
  expressionState: 'idle',
  equippedAccessory: null,
  equippedRoomItems: ['item_cushion_basic'],
};

// Default available shop items
export const DEFAULT_SHOP_ITEMS: InventoryItem[] = [
  // Accessories
  { id: 'acc_glasses', name: '스마트 안경', type: 'accessory', slot: 'face', price: 60, isPurchased: false, description: '지적인 눈빛으로 집중력을 높여줘요.', icon: '👓' },
  { id: 'acc_headband', name: '열정 머리띠', type: 'accessory', slot: 'head', price: 80, isPurchased: false, description: '불타는 투지로 작업을 완수하게 돕습니다.', icon: '🔥' },
  { id: 'acc_crown', name: '달성의 왕관', type: 'accessory', slot: 'head', price: 200, isPurchased: false, description: '목표를 끝까지 지켜낸 승자만의 금빛 왕관.', icon: '👑' },
  { id: 'acc_scarf', name: '포근한 목도리', type: 'accessory', slot: 'neck', price: 90, isPurchased: false, description: '추운 날씨에도 따뜻하게 일정을 챙겨줘요.', icon: '🧣' },
  { id: 'acc_party_hat', name: '고깔 파티 모자', type: 'accessory', slot: 'head', price: 120, isPurchased: false, description: '오늘 하루 모든 일정을 축제처럼!', icon: '🎉' },

  // Room items
  { id: 'item_cushion_basic', name: '초록 잎사귀 방석', type: 'room', slot: 'cushion', price: 0, isPurchased: true, description: '미루미가 편안하게 앉아 쉴 수 있는 푹신한 방석.', icon: '🍃' },
  { id: 'item_desk_plant', name: '작은 다육 화분', type: 'room', slot: 'plant', price: 50, isPurchased: false, description: '책상 옆에 두면 생기와 여유가 생겨요.', icon: '🪴' },
  { id: 'item_desk_lamp', name: '아늑한 황동 스탠드', type: 'room', slot: 'desk', price: 110, isPurchased: false, description: '야간 집중 세션에 따뜻한 빛을 비춥니다.', icon: '💡' },
  { id: 'item_wall_clock', name: '미루지마 원목 시계', type: 'room', slot: 'wall', price: 140, isPurchased: false, description: '째깍째깍 흐르는 시간을 소중하게!', icon: '⏰' },
  { id: 'item_rug_cozy', name: '체크 모헤어 러그', type: 'room', slot: 'rug', price: 160, isPurchased: false, description: '방 전체를 부드럽고 감각적으로 꾸며줍니다.', icon: '🧶' },
];

// Helper to get formatted today string (YYYY-MM-DD in KST)
export function getTodayString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Sample starter tasks to demonstrate immediate functionality
export function getSampleTasks(): Task[] {
  const today = getTodayString();
  return [
    {
      id: 'task_sample_1',
      title: '주간 기획안 초안 작성',
      deadlineDate: today,
      deadlineTime: '17:00',
      estimatedMinutes: 50,
      actualMinutes: 0,
      importance: 'high',
      category: 'work',
      isFixed: false,
      memo: '핵심 목표 3가지와 세부 일정 정리',
      subtasks: [
        { id: 'sub_1', title: '문제 정의 및 타깃 분석', completed: true },
        { id: 'sub_2', title: '세부 요구사항 정리', completed: false },
        { id: 'sub_3', title: '피드백 수렴 체크리스트', completed: false }
      ],
      status: 'scheduled',
      completedAt: null,
      createdAt: new Date().toISOString(),
      assignedDate: today,
      startTime: '10:00',
      endTime: '10:50',
      rewardAwarded: false,
    },
    {
      id: 'task_sample_2',
      title: '팀 주간 싱크 미팅',
      deadlineDate: today,
      deadlineTime: '14:30',
      estimatedMinutes: 30,
      actualMinutes: 0,
      importance: 'high',
      category: 'work',
      isFixed: true, // Fixed schedule
      memo: '구글 미트 온라인 회의',
      subtasks: [],
      status: 'scheduled',
      completedAt: null,
      createdAt: new Date().toISOString(),
      assignedDate: today,
      startTime: '14:00',
      endTime: '14:30',
      rewardAwarded: false,
    },
    {
      id: 'task_sample_3',
      title: '영단어 20개 복습',
      deadlineDate: today,
      deadlineTime: '21:00',
      estimatedMinutes: 25,
      actualMinutes: 0,
      importance: 'medium',
      category: 'study',
      isFixed: false,
      memo: '예문까지 소리 내어 2번 읽기',
      subtasks: [],
      status: 'scheduled',
      completedAt: null,
      createdAt: new Date().toISOString(),
      assignedDate: today,
      startTime: '16:00',
      endTime: '16:25',
      rewardAwarded: false,
    },
    {
      id: 'task_sample_4',
      title: '가벼운 스트레칭 및 30분 산책',
      deadlineDate: today,
      deadlineTime: '20:00',
      estimatedMinutes: 30,
      actualMinutes: 0,
      importance: 'low',
      category: 'health',
      isFixed: false,
      memo: '목과 허리 집중 스트레칭',
      subtasks: [],
      status: 'scheduled',
      completedAt: null,
      createdAt: new Date().toISOString(),
      assignedDate: today,
      startTime: '18:30',
      endTime: '19:00',
      rewardAwarded: false,
    }
  ];
}

// Storage Manager Class with IndexedDB and localStorage resilience
class StorageManager {
  private db: IDBDatabase | null = null;
  private isIDBAvailable = false;

  constructor() {
    this.checkIDB();
  }

  private checkIDB(): void {
    if (typeof window !== 'undefined' && 'indexedDB' in window) {
      this.isIDBAvailable = true;
    }
  }

  public async init(): Promise<void> {
    if (!this.isIDBAvailable) return;

    return new Promise((resolve) => {
      try {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (e) => {
          const db = (e.target as IDBOpenDBRequest).result;
          const stores = [
            'preferences',
            'tasks',
            'blocks',
            'focusSessions',
            'delayEvents',
            'character',
            'rewardTransactions',
            'inventory'
          ];
          stores.forEach((store) => {
            if (!db.objectStoreNames.contains(store)) {
              db.createObjectStore(store, { keyPath: 'id' });
            }
          });
        };

        request.onsuccess = (e) => {
          this.db = (e.target as IDBOpenDBRequest).result;
          resolve();
        };

        request.onerror = () => {
          console.warn('IndexedDB unavailable, falling back to localStorage');
          this.db = null;
          resolve();
        };
      } catch (err) {
        console.warn('Error opening IndexedDB:', err);
        resolve();
      }
    });
  }

  // Generic Get from store
  public async get<T>(storeName: string, id: string): Promise<T | null> {
    if (this.db) {
      return new Promise((resolve) => {
        try {
          const tx = this.db!.transaction(storeName, 'readonly');
          const store = tx.objectStore(storeName);
          const req = store.get(id);
          req.onsuccess = () => resolve(req.result ? (req.result.data ?? req.result) : null);
          req.onerror = () => resolve(this.getFromLocal<T>(storeName, id));
        } catch {
          resolve(this.getFromLocal<T>(storeName, id));
        }
      });
    }
    return this.getFromLocal<T>(storeName, id);
  }

  // Generic Put to store
  public async put<T>(storeName: string, item: { id: string } & any): Promise<void> {
    this.putToLocal(storeName, item);
    if (this.db) {
      return new Promise((resolve) => {
        try {
          const tx = this.db!.transaction(storeName, 'readwrite');
          const store = tx.objectStore(storeName);
          store.put(item);
          tx.oncomplete = () => resolve();
          tx.onerror = () => resolve();
        } catch {
          resolve();
        }
      });
    }
  }

  // Generic GetAll
  public async getAll<T>(storeName: string): Promise<T[]> {
    if (this.db) {
      return new Promise((resolve) => {
        try {
          const tx = this.db!.transaction(storeName, 'readonly');
          const store = tx.objectStore(storeName);
          const req = store.getAll();
          req.onsuccess = () => {
            const res = req.result || [];
            if (res.length > 0) {
              resolve(res as T[]);
            } else {
              resolve(this.getAllFromLocal<T>(storeName));
            }
          };
          req.onerror = () => resolve(this.getAllFromLocal<T>(storeName));
        } catch {
          resolve(this.getAllFromLocal<T>(storeName));
        }
      });
    }
    return this.getAllFromLocal<T>(storeName);
  }

  // Generic Delete
  public async delete(storeName: string, id: string): Promise<void> {
    this.deleteFromLocal(storeName, id);
    if (this.db) {
      return new Promise((resolve) => {
        try {
          const tx = this.db!.transaction(storeName, 'readwrite');
          const store = tx.objectStore(storeName);
          store.delete(id);
          tx.oncomplete = () => resolve();
          tx.onerror = () => resolve();
        } catch {
          resolve();
        }
      });
    }
  }

  // LocalStorage Fallbacks
  private getFromLocal<T>(storeName: string, id: string): T | null {
    try {
      const data = localStorage.getItem(`miruma_${storeName}_${id}`);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  private putToLocal(storeName: string, item: { id: string } & any): void {
    try {
      localStorage.setItem(`miruma_${storeName}_${item.id}`, JSON.stringify(item));
      // Keep master keys list
      const keysKey = `miruma_keys_${storeName}`;
      const keys = JSON.parse(localStorage.getItem(keysKey) || '[]');
      if (!keys.includes(item.id)) {
        keys.push(item.id);
        localStorage.setItem(keysKey, JSON.stringify(keys));
      }
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  }

  private getAllFromLocal<T>(storeName: string): T[] {
    try {
      const keysKey = `miruma_keys_${storeName}`;
      const keys: string[] = JSON.parse(localStorage.getItem(keysKey) || '[]');
      return keys
        .map((k) => this.getFromLocal<T>(storeName, k))
        .filter((item): item is T => item !== null);
    } catch {
      return [];
    }
  }

  private deleteFromLocal(storeName: string, id: string): void {
    try {
      localStorage.removeItem(`miruma_${storeName}_${id}`);
      const keysKey = `miruma_keys_${storeName}`;
      const keys: string[] = JSON.parse(localStorage.getItem(keysKey) || '[]');
      const filtered = keys.filter((k) => k !== id);
      localStorage.setItem(keysKey, JSON.stringify(filtered));
    } catch {}
  }

  // High-level App Loaders
  public async loadPreferences(): Promise<UserPreferences> {
    const item = await this.get<{ id: string; data: UserPreferences }>('preferences', 'user_pref');
    if (item && item.data) return item.data;
    // Save default
    await this.savePreferences(DEFAULT_PREFERENCES);
    return DEFAULT_PREFERENCES;
  }

  public async savePreferences(prefs: UserPreferences): Promise<void> {
    await this.put('preferences', { id: 'user_pref', data: prefs });
  }

  public async loadCharacter(): Promise<CharacterState> {
    const item = await this.get<{ id: string; data: CharacterState }>('character', 'mirumi_state');
    if (item && item.data) return item.data;
    await this.saveCharacter(DEFAULT_CHARACTER);
    return DEFAULT_CHARACTER;
  }

  public async saveCharacter(char: CharacterState): Promise<void> {
    await this.put('character', { id: 'mirumi_state', data: char });
  }

  public async loadTasks(): Promise<Task[]> {
    const tasks = await this.getAll<Task>('tasks');
    if (tasks.length === 0) {
      const samples = getSampleTasks();
      for (const t of samples) {
        await this.put('tasks', t);
      }
      return samples;
    }
    return tasks;
  }

  public async saveTask(task: Task): Promise<void> {
    await this.put('tasks', task);
  }

  public async deleteTask(id: string): Promise<void> {
    await this.delete('tasks', id);
  }

  public async loadInventory(): Promise<InventoryItem[]> {
    const items = await this.getAll<InventoryItem>('inventory');
    if (items.length === 0) {
      for (const item of DEFAULT_SHOP_ITEMS) {
        await this.put('inventory', item);
      }
      return DEFAULT_SHOP_ITEMS;
    }
    return items;
  }

  public async saveInventoryItem(item: InventoryItem): Promise<void> {
    await this.put('inventory', item);
  }

  public async loadFocusSessions(): Promise<FocusSession[]> {
    return this.getAll<FocusSession>('focusSessions');
  }

  public async saveFocusSession(session: FocusSession): Promise<void> {
    await this.put('focusSessions', session);
  }

  public async loadDelayEvents(): Promise<DelayEvent[]> {
    return this.getAll<DelayEvent>('delayEvents');
  }

  public async saveDelayEvent(event: DelayEvent): Promise<void> {
    await this.put('delayEvents', event);
  }

  public async loadRewardTransactions(): Promise<RewardTransaction[]> {
    return this.getAll<RewardTransaction>('rewardTransactions');
  }

  public async saveRewardTransaction(tx: RewardTransaction): Promise<void> {
    await this.put('rewardTransactions', tx);
  }
}

export const storage = new StorageManager();
