import { Expense, ParticipantBalance, TransferSuggestion } from '../types';

export const TOTAL_PARTICIPANTS = 2;
export const EXCHANGE_RATE_PHP_TO_TWD = 1.7; // 1 TWD = 1.7 PHP

// 旅伴名單
export const PARTICIPANTS = ['鮭魚', 'Coni'];

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
  const defaults = ['鮭魚', 'Coni'];
  const participantList = [...defaults];

  // 初始化每人的代墊與應付分攤金額
  const paidMap: { [key: string]: number } = {};
  const shareMap: { [key: string]: number } = {};
  
  participantList.forEach((name) => {
    paidMap[name] = 0;
    shareMap[name] = 0;
  });

  // 加總代墊與分攤金額
  let totalTWD = 0;
  expenses.forEach((exp) => {
    const amountTWD = convertToTWD(exp.amount, exp.currency);
    totalTWD += amountTWD;
    
    const payerName = exp.payer?.trim() || 'Anonymous';
    
    // 如果此代墊人不在我們的名單中，動態加入
    if (paidMap[payerName] === undefined) {
      paidMap[payerName] = 0;
      shareMap[payerName] = 0;
      if (!participantList.includes(payerName)) {
        participantList.push(payerName);
      }
    }
    paidMap[payerName] += amountTWD;

    // 計算分攤參與者
    let pList = exp.participants;
    if (!pList || pList.length === 0) {
      // 若無指定，預設由鮭魚跟Coni共同分攤
      pList = defaults;
    }

    const shareTWDPerPerson = amountTWD / pList.length;
    pList.forEach((pName) => {
      const trimmedPName = pName.trim();
      if (paidMap[trimmedPName] === undefined) {
        paidMap[trimmedPName] = 0;
        shareMap[trimmedPName] = 0;
        if (!participantList.includes(trimmedPName)) {
          participantList.push(trimmedPName);
        }
      }
      shareMap[trimmedPName] += shareTWDPerPerson;
    });
  });

  // 平均應付金額
  const finalParticipantsCount = participantList.length || defaults.length;
  const sharePerPersonTWD = totalTWD / finalParticipantsCount;

  // 構造每位旅伴的 Balance 物件
  const balances: ParticipantBalance[] = participantList.map((name) => {
    const paidTWD = paidMap[name] || 0;
    const shareTWD = shareMap[name] || 0;
    const balanceTWD = paidTWD - shareTWD;
    return {
      name,
      paidTWD: Math.round(paidTWD * 100) / 100, // 保留兩位小數
      shareTWD: Math.round(shareTWD * 100) / 100,
      balanceTWD: Math.round(balanceTWD * 100) / 100,
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
