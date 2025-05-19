'use client';

import { useState, useEffect } from 'react';
import { 
  calculateLoan, 
  LoanParameters, 
  LoanResult,
  calculateRemainingLoan,
  calculateInvestmentResult,
} from '../utils/loanCalculator';

export default function Home() {
  const [params, setParams] = useState<LoanParameters>({
    amount: 20000000, // デフォルト値：2000万円
    years: 35,
    interestRate: 0.595, // 2024年3月時点の主要銀行の金利
    propertyTax: 100000, // 固定資産税の初期値
  });

  const [result, setResult] = useState<LoanResult | null>(null);

  // 初回レンダリング時に計算を実行
  useEffect(() => {
    const calculatedResult = calculateLoan(params);
    setResult(calculatedResult);
  }, [params]);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen">
      {/* AWSヘッダー */}
      <header className="aws-header h-14 flex items-center px-6">
        <h1 className="text-xl font-bold">House Loan Calculator</h1>
      </header>
      
      {/* AWSナビゲーション */}
      <nav className="aws-nav h-12 flex items-center px-6">
        <span className="text-sm">ホーム / シミュレーター / 住宅ローン</span>
      </nav>

      <main className="p-6">
        <div className="max-w-6xl mx-auto">
          {/* メインコンテンツ */}
          <div className="mb-6">
            <h2 className="text-2xl font-normal mb-4 text-gray-900">住宅ローンシミュレーター</h2>
            <p className="text-sm text-gray-900 mb-6">
              このツールを使用して、住宅ローンの返済計画、投資比較、税金計算を行うことができます。
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 入力フォーム */}
            <div className="lg:col-span-1">
              <div className="aws-card bg-white p-6">
                <h3 className="text-lg font-medium mb-4 text-gray-900">パラメータ設定</h3>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-sm font-medium text-gray-900">借入額</label>
                      <span className="text-sm text-gray-900">{formatCurrency(params.amount)}</span>
                    </div>
                    <input
                      type="range"
                      min="1000000"
                      max="50000000"
                      step="500000"
                      value={params.amount}
                      onChange={(e) => setParams({ ...params, amount: Number(e.target.value) })}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-900 mt-1">
                      <span>100万円</span>
                      <span>5000万円</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-sm font-medium text-gray-900">返済期間</label>
                      <span className="text-sm text-gray-900">{params.years}年</span>
                    </div>
                    <select
                      value={params.years}
                      onChange={(e) => setParams({ ...params, years: Number(e.target.value) })}
                      className="aws-input aws-select w-full px-3 py-2 border bg-white text-gray-900"
                    >
                      <option value={35}>35年</option>
                      <option value={30}>30年</option>
                    </select>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-sm font-medium text-gray-900">金利</label>
                      <span className="text-sm text-gray-900">{params.interestRate.toFixed(3)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="3"
                      step="0.001"
                      value={params.interestRate}
                      onChange={(e) => setParams({ ...params, interestRate: Number(e.target.value) })}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-900 mt-1">
                      <span>0%</span>
                      <span>3%</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-sm font-medium text-gray-900">固定資産税</label>
                      <span className="text-sm text-gray-900">{formatCurrency(params.propertyTax)}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="500000"
                      step="10000"
                      value={params.propertyTax}
                      onChange={(e) => setParams({ ...params, propertyTax: Number(e.target.value) })}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-900 mt-1">
                      <span>0円</span>
                      <span>50万円</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 土地売却シミュレーション */}
            <div className="lg:col-span-2">
              {result && (
                <div className="aws-card p-6 bg-white border-2 border-blue-200 shadow-lg rounded-lg">
                  <div className="flex justify-between items-start mb-6">
                    <h4 className="text-xl font-bold text-blue-900">土地売却シミュレーション</h4>
                    <div className="text-[10px] text-gray-500 text-right">
                      <p>売却価格 = 借入額 × 60%</p>
                      <p>残債 = 月々の返済額 × (1 - (1 + 月利)^(残り月数)) / 月利</p>
                      <p>利息削減 = 繰上げ返済による返済総額の削減分</p>
                      <p>売却益 = 売却金額 - 残債</p>
                      <p>投資収益 = 毎月(10万円-返済額)を年利5%で運用</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-8">
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-3">売却関連</h5>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-900"><span className="font-medium">売却金額：</span>{formatCurrency(result.landSale.saleAmount)}</p>
                        <p className="text-sm text-gray-900"><span className="font-medium">売却時の残債：</span>{formatCurrency(result.landSale.remainingLoan)}</p>
                        <p className="text-sm text-gray-900"><span className="font-medium">売却益：</span>{formatCurrency(result.landSale.saleProfit)}</p>
                      </div>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-3">投資関連</h5>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-900"><span className="font-medium">売却時点での投資収益：</span>{formatCurrency(result.landSale.investmentAtSale)}</p>
                        <p className="text-sm text-gray-900 font-medium text-blue-600">売却益と投資収益の合計：{formatCurrency(result.landSale.totalProfit)}</p>
                        <p className="text-sm text-gray-900"><span className="font-medium">繰上げ返済による利息削減額：</span>{formatCurrency(result.landSale.interestReduction)}</p>
                      </div>
                    </div>
                    <div className="flex items-end">
                      <p className="text-sm text-gray-900 w-full"><span className="font-medium">売却益と投資収益が0以上になるまでの年数：</span>
                        <span className="text-red-600 font-bold block mt-2 text-right text-lg">
                        {result.landSale.yearsFromPurchase === -1 ? 
                          "返済期間内に売却益と投資収益の合計が0円を超えません" :
                          `${result.landSale.yearsFromPurchase}年`}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 計算結果 */}
          {result && (
            <div className="mt-6">
              <div className="aws-card bg-white p-6">
                <h3 className="text-lg font-medium mb-4 text-gray-900">計算結果</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <div className="aws-card p-4 bg-gray-50 h-full">
                      <div className="flex justify-between items-start">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">返済情報</h4>
                        <div className="text-[10px] text-gray-500 text-right">
                          <p>月々の返済額 = PMT(金利/12, 返済月数, 借入額)</p>
                          <p>返済総額 = 月々の返済額 × 返済月数</p>
                          <p>利息総額 = 返済総額 - 借入額</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-900"><span className="font-medium">月々の返済額：</span>{formatCurrency(result.monthlyPayment)}</p>
                        <p className="text-sm text-gray-900"><span className="font-medium">返済総額：</span>{formatCurrency(result.totalPayment)}</p>
                        <p className="text-sm text-gray-900"><span className="font-medium">利息総額：</span>{formatCurrency(result.totalInterest)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="aws-card p-4 bg-gray-50 h-full">
                      <div className="flex justify-between items-start">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">税金・諸経費</h4>
                        <div className="text-[10px] text-gray-500 text-right">
                          <p>固定資産税 = 借入額 × 1.4%</p>
                          <p>都市計画税 = 借入額 × 0.2%（xx市）</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-900"><span className="font-medium">固定資産税：</span>{formatCurrency(result.propertyTax)}</p>
                        <p className="text-sm text-gray-900"><span className="font-medium">都市計画税：</span>{formatCurrency(result.cityTax)}</p>
                        <p className="text-sm text-gray-900"><span className="font-medium">諸経費合計：</span>{formatCurrency(result.totalTax)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="aws-card p-4 bg-gray-50 h-full">
                      <div className="flex justify-between items-start">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">税制優遇措置</h4>
                        <div className="text-[10px] text-gray-500 text-right">
                          <p>住宅ローン減税 = 借入額×0.7%×13年（上限20万円/年）</p>
                          <p>不動産取得税軽減 = 1200万円×3%</p>
                          <p>登録免許税軽減 = 借入額×1.7%</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-900"><span className="font-medium">住宅ローン減税（13年間）：</span>{formatCurrency(result.taxBenefits.mortgageDeduction)}</p>
                        <p className="text-sm text-gray-900"><span className="font-medium">不動産取得税の軽減：</span>{formatCurrency(result.taxBenefits.acquisitionTaxReduction)}</p>
                        <p className="text-sm text-gray-900"><span className="font-medium">登録免許税の軽減：</span>{formatCurrency(result.taxBenefits.registrationTaxReduction)}</p>
                        <p className="text-sm text-gray-900 font-medium text-blue-600">税制優遇の合計額：{formatCurrency(result.taxBenefits.totalBenefits)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="aws-card p-4 bg-gray-50 h-full">
                      <div className="flex justify-between items-start">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">返済期間</h4>
                        <div className="text-[10px] text-gray-500 text-right">
                          <p>返済回数 = 返済年数 × 12</p>
                          <p>返済月数 = 返済年数 × 12</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-900"><span className="font-medium">返済回数：</span>{result.numberOfPayments}回</p>
                        <p className="text-sm text-gray-900"><span className="font-medium">返済年数：</span>{result.years}年</p>
                        <p className="text-sm text-gray-900"><span className="font-medium">返済月数：</span>{result.months}ヶ月</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="aws-card p-4 bg-gray-50 h-full">
                      <div className="flex justify-between items-start">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">投資比較</h4>
                        <div className="text-[10px] text-gray-500 text-right">
                          <p>賃貸 = (月10万円 × 12ヶ月 × 年数) + (11万円 × 更新回数)</p>
                          <p>NISA = 毎月(10万円-返済額)を年利5%で運用</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-900"><span className="font-medium">賃貸物件の合計金額：</span>{formatCurrency(result.rentalCost)}</p>
                        {result.investmentResult === -1 ? (
                          <p className="text-sm text-red-600 font-medium">月々の返済額が10万円を超えるため、投資比較はできません。</p>
                        ) : (
                          <>
                            <p className="text-sm text-gray-900"><span className="font-medium">NISA投資の結果：</span>{formatCurrency(result.investmentResult)}</p>
                            <p className="text-sm text-gray-900"><span className="font-medium">投資結果と返済総額が一致する年数：</span>
                              <span className="text-red-600 font-bold block mt-2 text-right text-lg">
                              {result.yearsToMatch === -1 ? 
                                "100年以上かかるため計算できません" :
                                result.yearsToMatch === -2 ?
                                "投資に回せる資金がありません" :
                                `${result.yearsToMatch}年`}
                              </span>
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 35年間の金額推移表 */}
              <div className="mt-6">
                <div className="aws-card bg-white p-6">
                  <h3 className="text-lg font-medium mb-4 text-gray-900">35年間の金額推移</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">年</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">残債</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">月々の返済額</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">月々の投資額</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">累計投資額</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">投資収益</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">住宅ローン減税</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">固定資産税</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {Array.from({ length: 35 }, (_, i) => {
                          const year = i + 1;
                          const remainingLoan = calculateRemainingLoan(params, year);
                          const monthlyPayment = result.monthlyPayment;
                          const monthlyInvestment = monthlyPayment >= 120000 ? 0 : 120000 - monthlyPayment;
                          const roundedMonthlyInvestment = Math.floor(monthlyInvestment / 5000) * 5000;
                          const totalInvestment = Math.floor(monthlyInvestment / 5000) * 5000 * 12 * year;
                          const investmentResult = calculateInvestmentResult(monthlyPayment, year, 0);
                          const annualDeduction = Math.min(params.amount * 0.007, 200000);
                          const mortgageDeduction = Math.min(year, 13) * annualDeduction;
                          const totalPropertyTax = params.propertyTax * year;

                          return (
                            <tr key={year} className={year % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{year}年目</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(remainingLoan)}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(monthlyPayment)}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(roundedMonthlyInvestment)}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(totalInvestment)}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(investmentResult)}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(mortgageDeduction)}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(totalPropertyTax)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
