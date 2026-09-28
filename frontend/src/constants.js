export const EXPENSE_CATEGORIES = ['Food', 'Rent', 'Transport', 'Shopping', 'Bills', 'Health', 'Entertainment', 'Other'];
export const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Investments', 'Gift', 'Other'];
export const ALL_CATEGORIES = [...new Set([...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES])];

const COLORS = {
  Food: '#F2A007', Rent: '#2F5BEA', Transport: '#0EA5B7', Shopping: '#EC6A9C',
  Bills: '#8B5CF6', Health: '#E5484D', Entertainment: '#F26B3A', Other: '#64748B',
  Salary: '#12946B', Freelance: '#6BBF59', Investments: '#1F7A8C', Gift: '#C084FC',
};
const FALLBACK = ['#2F5BEA', '#12946B', '#F2A007', '#8B5CF6', '#0EA5B7', '#EC6A9C'];

export function colorFor(category = '') {
  if (COLORS[category]) return COLORS[category];
  let h = 0;
  for (const ch of category) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return FALLBACK[h % FALLBACK.length];
}

export const INCOME_COLOR = '#12946B';
export const EXPENSE_COLOR = '#D93F45';
