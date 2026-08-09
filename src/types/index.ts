// 1. 記帳花費資料 (對應後端 GET /api/expenses)
export interface Expense {
  id: string;
  item: string;      // 花費項目
  amount: number;    // 金額
  currency: string;  // 幣別 (例如: TWD, KRW)
  payer: string;     // 代墊人名字
  date: string;      // 消費日期 (ISO string)
}

// 2. 行程資料 (對應後端 GET /api/itinerary)
export interface ItineraryDay {
  id: string;
  day: number;       // 第幾天
  date: string;      // 日期
  title: string;     // 當日主題
  spots: string[];   // 景點清單
}

// 3. 結算結果 (用於前端顯示)
export interface ParticipantBalance {
  name: string;
  paidTWD: number;    // 實際代墊總額 (TWD)
  shareTWD: number;   // 應付金額 (TWD)
  balanceTWD: number; // 差額 (實際代墊 - 應付)
}

// 4. 轉帳建議
export interface TransferSuggestion {
  from: string;       // 誰付錢
  to: string;         // 付給誰
  amount: number;     // 金額 (TWD)
}
