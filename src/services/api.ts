import { Expense, ItineraryDay } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

// Mock 行程資料
const MOCK_ITINERARY: ItineraryDay[] = [
  {
    id: 'day-1',
    day: 1,
    date: '2026-09-01',
    title: '抵達宿霧與麥克坦島渡假村',
    spots: ['麥克坦-宿霧國際機場', '入住 Maribago 渡假村', '拉普拉普紀念碑', '馬克坦島海鮮晚餐'],
  },
  {
    id: 'day-2',
    day: 2,
    date: '2026-09-02',
    title: '歐斯陸鯨鯊共游與瀑布探險',
    spots: ['歐斯陸鯨鯊保護區 (與鯨鯊共游)', '圖馬洛瀑布 (阿凡達秘境)', '聖母無原罪教堂', '歐斯陸菲式烤肉下午茶'],
  },
  {
    id: 'day-3',
    day: 3,
    date: '2026-09-03',
    title: '墨寶沙丁魚風暴與巴斯卡多島浮潛',
    spots: ['墨寶海風浮潛 (沙丁魚風暴)', '尋找野生綠蠵龜', '巴斯卡多島珊瑚保護區', '卡瓦森瀑布 (Kawasan Canyoneering 溯溪)'],
  },
  {
    id: 'day-4',
    day: 4,
    date: '2026-09-04',
    title: '宿霧市區歷史文化與回程',
    spots: ['麥哲倫十字架', '聖嬰大教堂', '聖佩德羅堡 (Fort San Pedro)', 'SM Seaside 伴手禮購物', '回程機場送機'],
  },
];

// Mock 消費明細
const MOCK_EXPENSES: Expense[] = [
  {
    id: 'exp-1',
    item: '宿霧航空來回機票 (2人)',
    amount: 16000,
    currency: 'TWD',
    payer: '鮭魚',
    date: '2026-08-15T10:00:00Z',
    participants: ['鮭魚', 'Coni'],
  },
  {
    id: 'exp-2',
    item: 'Maribago 渡假村住宿 (3晚兩房)',
    amount: 22000,
    currency: 'PHP',
    payer: 'Coni',
    date: '2026-09-01T15:00:00Z',
    participants: ['鮭魚', 'Coni'],
  },
  {
    id: 'exp-3',
    item: '馬克坦島豪華海鮮迎賓晚餐',
    amount: 5400,
    currency: 'PHP',
    payer: '鮭魚',
    date: '2026-09-01T19:00:00Z',
    participants: ['鮭魚', 'Coni'],
  },
  {
    id: 'exp-4',
    item: '網卡與包車接送預付 (2人)',
    amount: 1500,
    currency: 'TWD',
    payer: '鮭魚',
    date: '2026-08-31T09:00:00Z',
    participants: ['鮭魚', 'Coni'],
  },
  {
    id: 'exp-5',
    item: '歐斯陸鯨鯊共游門票 (2人)',
    amount: 1200,
    currency: 'PHP',
    payer: '鮭魚',
    date: '2026-09-02T08:00:00Z',
    participants: ['鮭魚', 'Coni'],
  },
  {
    id: 'exp-6',
    item: '圖馬洛瀑布小車接駁與門票',
    amount: 800,
    currency: 'PHP',
    payer: 'Coni',
    date: '2026-09-02T11:30:00Z',
    participants: ['鮭魚', 'Coni'],
  },
  {
    id: 'exp-7',
    item: '墨寶沙丁魚風暴私人包船浮潛',
    amount: 7500,
    currency: 'PHP',
    payer: 'Coni',
    date: '2026-09-03T09:00:00Z',
    participants: ['鮭魚', 'Coni'],
  },
  {
    id: 'exp-8',
    item: '卡瓦森瀑布 Canyoneering 溯溪攀岩 (2人)',
    amount: 4800,
    currency: 'PHP',
    payer: '鮭魚',
    date: '2026-09-03T13:00:00Z',
    participants: ['鮭魚', 'Coni'],
  },
  {
    id: 'exp-9',
    item: '卡瓦森菲式烤肉慶功午餐',
    amount: 3200,
    currency: 'PHP',
    payer: 'Coni',
    date: '2026-09-03T16:30:00Z',
    participants: ['鮭魚', 'Coni'],
  },
  {
    id: 'exp-10',
    item: 'SM Seaside 芒果乾伴手禮 (鮭魚自買)',
    amount: 3000,
    currency: 'PHP',
    payer: '鮭魚',
    date: '2026-09-04T12:00:00Z',
    participants: ['鮭魚'],
  },
  {
    id: 'exp-11',
    item: '聖嬰大教堂紀念香氛 (Coni自買)',
    amount: 600,
    currency: 'PHP',
    payer: 'Coni',
    date: '2026-09-04T10:00:00Z',
    participants: ['Coni'],
  },
];

/**
 * 從字串中解析出 HH:MM 格式的時間
 */
function parseTimeFromStr(val: string): string {
  if (!val) return '';
  val = val.trim();
  
  // 1. 如果是包含 'T' 的 ISO 字串，試著用 Date 解析
  if (val.includes('T')) {
    const dateObj = new Date(val);
    if (!isNaN(dateObj.getTime())) {
      const hours = dateObj.getHours();
      const minutes = dateObj.getMinutes();
      // 在有具體時間（非00:00）時回傳格式化時間
      if (hours !== 0 || minutes !== 0) {
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      }
    }
  }

  // 2. 否則用正則匹配時間 (\d{1,2}:\d{2})
  const match = val.match(/(\d{1,2}):(\d{2})/);
  if (match) {
    const hh = match[1].padStart(2, '0');
    const mm = match[2];
    return `${hh}:${mm}`;
  }

  return '';
}

// 取得行程資料
export async function getItinerary(): Promise<ItineraryDay[]> {
  if (!API_BASE_URL) {
    console.log('API Base URL is empty, falling back to mock itinerary data.');
    return MOCK_ITINERARY;
  }
  try {
    const response = await fetch(`${API_BASE_URL}/api/itinerary`);
    if (!response.ok) {
      throw new Error(`Failed to fetch itinerary: ${response.statusText}`);
    }
    const json = await response.json();
    
    // 後端回傳格式可能是 {"success": true, "data": [...]} 或是直接陣列
    const rawList = Array.isArray(json) ? json : (json.success && Array.isArray(json.data) ? json.data : null);
    
    if (!rawList) {
      throw new Error('Invalid itinerary data structure');
    }

    // 檢查是不是已經符合 ItineraryDay 格式
    if (rawList.length > 0 && typeof rawList[0].day === 'number' && Array.isArray(rawList[0].spots)) {
      return rawList as ItineraryDay[];
    }

    // 如果是扁平的後端格式 (每個物件有 name, date)，我們需要按 date 分組並轉換
    interface AdaptedItem {
      name: string;
      time: string;
      rawDate: string;
    }

    const groupedByDate: { [key: string]: AdaptedItem[] } = {};
    rawList.forEach((item: any) => {
      let dateStr = item.date || '';
      if (dateStr.includes('T')) {
        dateStr = dateStr.split('T')[0];
      }
      if (!dateStr) {
        dateStr = new Date().toISOString().split('T')[0];
      }
      
      const name = item.name || item.itemName || '景點項目';
      
      // 提取時間 (非排他性提取鏈)
      let timeStr = '';
      if (item.time && typeof item.time === 'string') {
        timeStr = parseTimeFromStr(item.time);
      }
      if (!timeStr && item.raw && item.raw['時間'] && typeof item.raw['時間'] === 'string') {
        timeStr = parseTimeFromStr(item.raw['時間']);
      }
      if (!timeStr && item.date && typeof item.date === 'string') {
        timeStr = parseTimeFromStr(item.date);
      }

      if (!groupedByDate[dateStr]) {
        groupedByDate[dateStr] = [];
      }
      groupedByDate[dateStr].push({ name, time: timeStr, rawDate: item.date || '' });
    });

    // 將分組的 Key (日期) 排序
    const sortedDates = Object.keys(groupedByDate).sort();

    const adaptedItinerary: ItineraryDay[] = sortedDates.map((dateStr, index) => {
      const items = groupedByDate[dateStr];
      
      // 依時間排序 (如果沒有時間，就以原本的順序/日期排序)
      items.sort((a, b) => {
        if (a.time && b.time) {
          return a.time.localeCompare(b.time);
        }
        if (a.time) return -1;
        if (b.time) return 1;
        return a.rawDate.localeCompare(b.rawDate);
      });

      // 構造帶有時間標籤的 spots 字串陣列
      const spots = items.map((it) => {
        if (it.time) {
          return `[${it.time}] ${it.name}`;
        }
        return it.name;
      });

      const title = items[0]?.name || '當日行程';

      return {
        id: `adapted-day-${index + 1}`,
        day: index + 1,
        date: dateStr,
        title: title,
        spots: spots
      };
    });

    return adaptedItinerary;
  } catch (error) {
    console.error('Error fetching itinerary API, falling back to mock:', error);
    return MOCK_ITINERARY;
  }
}

// 取得消費資料
export async function getExpenses(): Promise<Expense[]> {
  if (!API_BASE_URL) {
    console.log('API Base URL is empty, falling back to mock expenses data.');
    return MOCK_EXPENSES;
  }
  try {
    const response = await fetch(`${API_BASE_URL}/api/expenses`);
    if (!response.ok) {
      throw new Error(`Failed to fetch expenses: ${response.statusText}`);
    }
    const json = await response.json();
    
    const rawList = Array.isArray(json) ? json : (json.success && Array.isArray(json.data) ? json.data : null);

    if (!rawList) {
      throw new Error('Invalid expenses data structure');
    }

    // 對資料屬性做對應，比如 itemName -> item
    const adaptedExpenses: Expense[] = rawList.map((item: any, index: number) => {
      // 解析 participants
      let participants: string[] | undefined = undefined;
      if (Array.isArray(item.participants)) {
        participants = item.participants;
      } else if (item.participants) {
        participants = String(item.participants)
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
      }

      return {
        id: item.id || `adapted-exp-${index}`,
        item: item.item || item.itemName || '消費項目',
        amount: Number(item.amount) || 0,
        currency: item.currency || 'PHP',
        payer: item.payer || 'Anonymous',
        date: item.date || new Date().toISOString(),
        participants: participants
      };
    });

    return adaptedExpenses;
  } catch (error) {
    console.error('Error fetching expenses API, falling back to mock:', error);
    return MOCK_EXPENSES;
  }
}

// 刪除消費資料
export async function deleteExpense(id: string): Promise<boolean> {
  if (!API_BASE_URL) {
    console.log(`Mock: Deleted expense ${id}`);
    return true;
  }
  const response = await fetch(`${API_BASE_URL}/api/expenses/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error(`Failed to delete expense: ${response.statusText}`);
  }
  return true;
}

// 更新消費資料
export async function updateExpense(id: string, expense: Partial<Expense>): Promise<Expense> {
  if (!API_BASE_URL) {
    console.log(`Mock: Updated expense ${id}`, expense);
    return {
      ...expense,
      id,
    } as Expense;
  }

  // 準備給後端的 JSON 欄位
  const payload: any = {
    item: expense.item,
    amount: Number(expense.amount),
    currency: expense.currency,
    payer: expense.payer,
    date: expense.date,
    participants: expense.participants, // 新增 participants 傳遞
  };

  const response = await fetch(`${API_BASE_URL}/api/expenses/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Failed to update expense: ${response.statusText}`);
  }

  const json = await response.json();
  const rawItem = json.success && json.data ? json.data : json;

  let participants: string[] | undefined = undefined;
  if (Array.isArray(rawItem.participants)) {
    participants = rawItem.participants;
  } else if (rawItem.participants) {
    participants = String(rawItem.participants)
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }

  // 做屬性對應 itemName -> item
  return {
    id: rawItem.id || id,
    item: rawItem.item || rawItem.itemName || expense.item || '消費項目',
    amount: Number(rawItem.amount) || Number(expense.amount) || 0,
    currency: rawItem.currency || expense.currency || 'PHP',
    payer: rawItem.payer || expense.payer || 'Anonymous',
    date: rawItem.date || expense.date || new Date().toISOString(),
    participants: participants || expense.participants
  };
}
