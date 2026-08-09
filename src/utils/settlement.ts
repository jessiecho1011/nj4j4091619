import { Expense, ParticipantBalance, TransferSuggestion } from '../types';

export const ALL_TRAVELERS = ['鮭魚', 'Coni'];
export const PARTICIPANTS = ALL_TRAVELERS;
export const TOTAL_PARTICIPANTS = ALL_TRAVELERS.length;
export const EXCHANGE_RATE_PHP_TO_TWD = 1.7; // 1 TWD = 1.7 PHP

/**
 * 旅伴名稱標準化輔助函式
 */
export function normalizeName(name: string): string {
  if (typeof name !== 'string') return name;
  const trimmed = name.trim();
  return trimmed.toLowerCase() === 'coni' ? 'Coni' : trimmed;
}

/**
 * 將消費金額統一換算為 TWD
 */
export function convertToTWD(amount: number, currency: string): number {
  if (currency.toUpperCase() === 'PHP') {
    return amount / EXCHANGE_RATE_PHP_TO_TWD;
  }
  return amount; // 預設為 TWD
}

/**
 * 計算所有旅伴的分帳狀態
 */
export function calculateBalances(expenses: Expense[]): {
  balances: ParticipantBalance[];
  totalTWD: number;
  sharePerPersonTWD: number;
} {
  // 建立一個物件來記錄每個人的財務狀態
  const financialState: { [key: string]: { Paid: number; Owed: number; Balance: number } } = {};
  ALL_TRAVELERS.forEach((name) => {
    financialState[name] = { Paid: 0, Owed: 0, Balance: 0 };
  });

  let totalTWD = 0;

  // 遍歷所有 Expense 資料
  expenses.forEach((exp) => {
    const amountTWD = convertToTWD(exp.amount, exp.currency);
    totalTWD += amountTWD;

    const payerName = normalizeName(exp.payer?.trim() || '');
    
    // 已付計算：將該筆 TWD 金額加到 payer (代墊人) 的 Paid 數值中
    if (financialState[payerName] !== undefined) {
      financialState[payerName].Paid += amountTWD;
    }

    // 應付計算：計算該筆花費的單人分攤金額 (該筆 TWD 金額 / participants.length)
    const rawParts = exp.participants || ALL_TRAVELERS;
    const parts = Array.from(new Set(rawParts.map((p) => normalizeName(p))));
    if (parts.length > 0) {
      const shareTWDPerPerson = amountTWD / parts.length;
      // 遍歷 participants 陣列，將單人分攤金額加到每個參與者的 Owed 數值中
      parts.forEach((pName) => {
        if (financialState[pName] !== undefined) {
          financialState[pName].Owed += shareTWDPerPerson;
        }
      });
    }
  });

  // 餘額計算：遍歷所有旅伴，計算 Balance = Paid - Owed
  ALL_TRAVELERS.forEach((name) => {
    const state = financialState[name];
    state.Balance = state.Paid - state.Owed;
  });

  // 平均應付金額 (供 UI 卡片顯示參考)
  const sharePerPersonTWD = totalTWD / (ALL_TRAVELERS.length || 2);

  // 構造每位旅伴的 Balance 物件
  const balances: ParticipantBalance[] = ALL_TRAVELERS.map((name) => {
    const state = financialState[name];
    return {
      name,
      paidTWD: Math.round(state.Paid * 100) / 100,
      shareTWD: Math.round(state.Owed * 100) / 100,
      balanceTWD: Math.round(state.Balance * 100) / 100,
    };
  });

  return {
    balances,
    totalTWD: Math.round(totalTWD * 100) / 100,
    sharePerPersonTWD: Math.round(sharePerPersonTWD * 100) / 100,
  };
}

/**
 * 使用貪婪演算法 (Greedy Algorithm) 生成最少次數的轉帳建議
 */
export function generateTransferPlan(balances: ParticipantBalance[]): TransferSuggestion[] {
  // 深拷貝，避免修改原始數據，並過濾掉差額為 0 的人
  const people = balances.map((b) => ({
    name: b.name,
    balance: b.balanceTWD,
  }));

  const suggestions: TransferSuggestion[] = [];

  // 定義浮點數誤差範圍
  const EPSILON = 0.01;

  let iterations = 0;
  const maxIterations = 100; // 防死循環

  while (iterations < maxIterations) {
    // 找出目前應收回最多錢的人 (最大正值) 與應補繳最多錢的人 (最小負值)
    people.sort((a, b) => b.balance - a.balance);

    const creditor = people[0]; // 餘額正值最大
    const debtor = people[people.length - 1]; // 餘額負值最大 (絕對值最大)

    // 如果最大正值小於 EPSILON 且 最小負值的絕對值也小於 EPSILON，說明已結清
    if (creditor.balance < EPSILON && Math.abs(debtor.balance) < EPSILON) {
      break;
    }

    // 計算這次轉帳金額： debtor 應補繳金額與 creditor 應收回金額的較小值
    const amountToTransfer = Math.min(creditor.balance, Math.abs(debtor.balance));

    if (amountToTransfer < EPSILON) {
      break;
    }

    // 紀錄此轉帳建議
    suggestions.push({
      from: debtor.name,
      to: creditor.name,
      amount: Math.round(amountToTransfer * 100) / 100,
    });

    // 更新兩人的餘額
    creditor.balance -= amountToTransfer;
    debtor.balance += amountToTransfer;

    iterations++;
  }

  return suggestions;
}
