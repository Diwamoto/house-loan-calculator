export interface LoanParameters {
  amount: number; // 借入額
  years: number; // 返済期間（30年または35年）
  interestRate: number; // 年利（%）
  propertyTax: number; // 固定資産税
}

export interface LoanResult {
  monthlyPayment: number; // 月々の返済額
  totalPayment: number; // 返済総額
  totalInterest: number; // 利息総額
  propertyTax: number; // 固定資産税
  cityTax: number; // 都市計画税
  totalTax: number; // 諸経費合計
  numberOfPayments: number; // 返済回数
  years: number; // 返済年数
  months: number; // 返済月数
  rentalCost: number; // 賃貸物件の合計金額
  investmentResult: number; // NISA投資の結果
  yearsToMatch: number; // 投資結果と返済総額が一致する年数
  taxBenefits: { // 税制優遇措置
    mortgageDeduction: number; // 住宅ローン減税（13年間の合計額）
    acquisitionTaxReduction: number; // 不動産取得税の軽減額
    registrationTaxReduction: number; // 登録免許税の軽減額
    totalBenefits: number; // 税制優遇の合計額
  };
  landSale: { // 土地売却関連
    saleAmount: number; // 売却金額（借入額の60%）
    remainingLoan: number; // 売却時の残債
    interestReduction: number; // 繰上げ返済による利息削減額
    saleProfit: number; // 売却益（売却金額 - 残債）
    yearsFromPurchase: number; // 購入からの経過年数
    investmentAtSale: number; // 売却時点での投資収益
    totalProfit: number; // 売却益 + 投資収益
  };
}

// 住宅ローンの月々の返済額を計算
export const calculateMonthlyPayment = (params: LoanParameters): number => {
  const { amount, years, interestRate } = params;
  const monthlyRate = interestRate / 100 / 12;
  const numberOfPayments = years * 12;
  
  return (
    amount *
    (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
    (Math.pow(1 + monthlyRate, numberOfPayments) - 1)
  );
};

// 固定資産税を計算
const calculatePropertyTax = (amount: number): number => {
  return amount * 0.014; // 1.4%
};

// 都市計画税を計算（xx市の場合）
const calculateCityTax = (amount: number): number => {
  return amount * 0.002; // 0.2%（xx市の税率）
};

// 賃貸物件の合計金額を計算
export const calculateRentalCost = (years: number): number => {
  const monthlyRent = 100000; // 10万円
  const renewalFee = 110000; // 11万円
  const renewalCount = Math.floor(years / 2);
  
  return (monthlyRent * 12 * years) + (renewalFee * renewalCount);
};

// NISA投資の結果を計算
export const calculateInvestmentResult = (
  monthlyPayment: number,
  years: number,
  investmentAmount: number
): number => {
  const baseMonthlyRent = 100000; // 賃貸の場合の月額支出（10万円）
  if (monthlyPayment >= baseMonthlyRent) {
    return -1; // 投資不可能を示す
  }
  
  const monthlyInvestment = baseMonthlyRent - monthlyPayment;
  const annualReturn = 0.05; // 年利5%と仮定
  
  let result = investmentAmount;
  for (let i = 0; i < years; i++) {
    // 前年の残高に年利を適用
    result = result * (1 + annualReturn);
    // その年の投資額を加算（複利計算の対象外）
    result += monthlyInvestment * 12;
  }
  
  return result;
};

// 投資結果と返済総額が一致する年数を計算
export const calculateYearsToMatch = (
  investmentResult: number,
  totalPayment: number,
  monthlyPayment: number
): number => {
  const baseMonthlyRent = 100000; // 賃貸の場合の月額支出（10万円）
  if (monthlyPayment >= baseMonthlyRent) {
    return -2; // 投資不可能を示す（-1と区別するため-2を使用）
  }

  const monthlyInvestment = baseMonthlyRent - monthlyPayment;
  const annualReturn = 0.05; // 年利5%と仮定
  let years = 0;
  let currentInvestment = 0;
  const MAX_YEARS = 100; // 最大100年まで計算
  
  while (currentInvestment < totalPayment && years < MAX_YEARS) {
    currentInvestment = currentInvestment * (1 + annualReturn) + (monthlyInvestment * 12);
    years++;
  }
  
  return years >= MAX_YEARS ? -1 : years;
};

// 住宅ローン減税を計算（2025年以降の制度）
const calculateMortgageDeduction = (amount: number, years: number): number => {
  // 借入額の0.7%を13年間控除（上限20万円/年）
  const annualDeduction = Math.min(amount * 0.007, 200000);
  return annualDeduction * 13; // 13年間の合計額
};

// 不動産取得税の軽減額を計算
const calculateAcquisitionTaxReduction = (amount: number): number => {
  // 課税標準額から1200万円を控除
  const taxBaseReduction = 12000000;
  // 税率3%
  const taxRate = 0.03;
  // 軽減額 = 控除額 × 税率
  return taxBaseReduction * taxRate;
};

// 登録免許税の軽減額を計算
const calculateRegistrationTaxReduction = (amount: number): number => {
  // 通常税率2.0%→優遇税率0.3%
  const normalRate = 0.02;
  const reducedRate = 0.003;
  // 軽減額 = 借入額 × (通常税率 - 優遇税率)
  return amount * (normalRate - reducedRate);
};

// 売却時の残債を計算
export const calculateRemainingLoan = (params: LoanParameters, yearsToSale: number): number => {
  const monthlyPayment = calculateMonthlyPayment(params);
  const monthlyRate = params.interestRate / 100 / 12;
  const totalMonths = params.years * 12;
  const monthsToSale = yearsToSale * 12;
  const remainingMonths = totalMonths - monthsToSale;
  
  // 残債 = 月々の返済額 × (1 - (1 + 月利)^(残り月数)) / 月利
  return monthlyPayment * (1 - Math.pow(1 + monthlyRate, -remainingMonths)) / monthlyRate;
};

// 繰上げ返済による利息削減額を計算
const calculateInterestReduction = (
  params: LoanParameters,
  yearsToSale: number,
  saleAmount: number
): number => {
  const monthlyRate = params.interestRate / 100 / 12;
  const totalMonths = params.years * 12;
  const monthsToSale = yearsToSale * 12;
  const remainingMonths = totalMonths - monthsToSale;
  
  // 売却時の残債を計算
  const remainingLoan = calculateRemainingLoan(params, yearsToSale);
  
  // 繰上げ返済後の残債を計算
  const newRemainingLoan = Math.max(0, remainingLoan - saleAmount);
  
  // 元々の残り返済期間での利息総額を計算
  const originalInterest = calculateTotalInterest({
    amount: remainingLoan,
    years: remainingMonths / 12,
    interestRate: params.interestRate,
    propertyTax: params.propertyTax
  });
  
  // 繰上げ返済後の残り返済期間での利息総額を計算
  const newInterest = newRemainingLoan > 0 ? calculateTotalInterest({
    amount: newRemainingLoan,
    years: remainingMonths / 12,
    interestRate: params.interestRate,
    propertyTax: params.propertyTax
  }) : 0;
  
  // 利息削減額 = 元々の利息総額 - 繰上げ返済後の利息総額
  return originalInterest - newInterest;
};

// 利息総額を計算するヘルパー関数
const calculateTotalInterest = (params: LoanParameters): number => {
  const monthlyPayment = calculateMonthlyPayment(params);
  const totalPayment = monthlyPayment * params.years * 12;
  return totalPayment - params.amount;
};

// 売却益が0になる年数を計算（投資収益も考慮）
const calculateBreakEvenYear = (params: LoanParameters, monthlyPayment: number): { 
  year: number;
  investmentAtSale: number;
  saleProfit: number;
} => {
  let year = 1;
  const MAX_YEARS = params.years;
  
  while (year <= MAX_YEARS) {
    const saleAmount = params.amount * 0.6; // 借入額の60%で売却
    const remainingLoan = calculateRemainingLoan(params, year);
    
    // 住宅ローン減税の計算（13年間の合計額）
    const annualDeduction = Math.min(params.amount * 0.007, 200000);
    const mortgageDeduction = Math.min(year, 13) * annualDeduction;
    
    // 固定資産税の累計額
    const totalPropertyTax = params.propertyTax * year;
    
    // 売却益 = 売却金額 - 残債 + 住宅ローン減税 - 固定資産税累計
    const saleProfit = saleAmount - remainingLoan + mortgageDeduction - totalPropertyTax;
    
    // その時点での投資収益を計算
    const investmentAtSale = monthlyPayment >= 100000 ? 0 : 
      calculateInvestmentResult(monthlyPayment, year, 100000);
    
    // 売却益と投資収益の合計が残債を超えた時点の年数を返す
    if (saleProfit + investmentAtSale >= 0) {
      return {
        year,
        investmentAtSale,
        saleProfit
      };
    }
    year++;
  }
  
  return {
    year: -1,
    investmentAtSale: 0,
    saleProfit: 0
  };
};

// メインの計算関数
export const calculateLoan = (params: LoanParameters): LoanResult => {
  const monthlyPayment = calculateMonthlyPayment(params);
  const totalPayment = monthlyPayment * params.years * 12;
  const totalInterest = totalPayment - params.amount;
  
  const propertyTax = params.propertyTax; // 入力値を使用
  const cityTax = calculateCityTax(params.amount);
  const totalTax = propertyTax + cityTax;
  
  const rentalCost = calculateRentalCost(params.years);
  const investmentResult = calculateInvestmentResult(monthlyPayment, params.years, 100000);
  const yearsToMatch = calculateYearsToMatch(investmentResult, totalPayment, monthlyPayment);

  // 税制優遇措置の計算
  const mortgageDeduction = calculateMortgageDeduction(params.amount, params.years);
  const acquisitionTaxReduction = calculateAcquisitionTaxReduction(params.amount);
  const registrationTaxReduction = calculateRegistrationTaxReduction(params.amount);
  const totalBenefits = mortgageDeduction + acquisitionTaxReduction + registrationTaxReduction;
  
  // 土地売却関連の計算
  const breakEvenResult = calculateBreakEvenYear(params, monthlyPayment);
  const saleAmount = params.amount * 0.6; // 借入額の60%で売却
  const remainingLoan = calculateRemainingLoan(params, breakEvenResult.year);
  const interestReduction = calculateInterestReduction(params, breakEvenResult.year, saleAmount);
  const saleProfit = breakEvenResult.saleProfit;
  const investmentAtSale = breakEvenResult.investmentAtSale;
  const totalProfit = saleProfit + investmentAtSale;

  return {
    monthlyPayment,
    totalPayment,
    totalInterest,
    propertyTax,
    cityTax,
    totalTax,
    numberOfPayments: params.years * 12,
    years: params.years,
    months: params.years * 12,
    rentalCost,
    investmentResult,
    yearsToMatch,
    taxBenefits: {
      mortgageDeduction,
      acquisitionTaxReduction,
      registrationTaxReduction,
      totalBenefits
    },
    landSale: {
      saleAmount,
      remainingLoan,
      interestReduction,
      saleProfit,
      yearsFromPurchase: breakEvenResult.year,
      investmentAtSale,
      totalProfit
    }
  };
}; 