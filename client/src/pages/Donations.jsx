import { useState } from 'react';
import { Heart, Building2, GraduationCap, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

const Donations = () => {
  const [selectedFund, setSelectedFund] = useState('scholarship');
  const [customAmount, setCustomAmount] = useState('');
  const [selectedAmount, setSelectedAmount] = useState(1000);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const funds = [
    { id: 'scholarship', name: 'Alumni Scholarship Fund', icon: <GraduationCap size={24} />, description: 'Support deserving students who need financial assistance to complete their education.' },
    { id: 'infrastructure', name: 'Campus Development', icon: <Building2 size={24} />, description: 'Contribute to the construction of new labs, library resources, and sports facilities.' },
    { id: 'general', name: 'General Endowment', icon: <Heart size={24} />, description: 'Flexible funds used for immediate college needs and special student initiatives.' }
  ];

  const presetAmounts = [500, 1000, 5000, 10000];

  const handleDonate = (e) => {
    e.preventDefault();
    const finalAmount = customAmount ? parseInt(customAmount) : selectedAmount;
    
    if (!finalAmount || finalAmount <= 0) {
      toast.error('Please select a valid amount.');
      return;
    }

    setIsProcessing(true);
    
    // Simulate Stripe API Call
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      toast.success('Donation processed successfully! Thank you.');
    }, 2000);
  };

  if (isSuccess) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="bg-white dark:bg-[#111827] rounded-3xl p-10 border border-slate-200 dark:border-slate-800 shadow-sm animate-fade-in">
          <div className="h-24 w-24 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={48} />
          </div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-4">Thank You!</h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-lg mx-auto mb-8">
            Your generous contribution has been securely processed. A receipt has been sent to your registered email address.
          </p>
          <button 
            onClick={() => setIsSuccess(false)}
            className="bg-cmr-blue text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors"
          >
            Make Another Donation
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 transition-colors duration-300">
      
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-slate-100 mb-4">Give Back to CMRCET</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Your contribution empowers the next generation of innovators and helps maintain our campus as a center of excellence.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Left Side: Select Fund */}
        <div className="w-full lg:w-3/5 space-y-6">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">1. Choose a Fund</h2>
          
          <div className="grid gap-4">
            {funds.map(fund => (
              <div 
                key={fund.id}
                onClick={() => setSelectedFund(fund.id)}
                className={`p-6 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-4 ${
                  selectedFund === fund.id 
                  ? 'border-cmr-blue bg-blue-50 dark:bg-blue-500/10' 
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-[#111827] hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                <div className={`p-3 rounded-xl ${selectedFund === fund.id ? 'bg-cmr-blue text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                  {fund.icon}
                </div>
                <div>
                  <h3 className={`text-lg font-bold ${selectedFund === fund.id ? 'text-cmr-blue dark:text-blue-400' : 'text-slate-900 dark:text-white'}`}>
                    {fund.name}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    {fund.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Amount & Checkout */}
        <div className="w-full lg:w-2/5">
          <div className="bg-white dark:bg-[#111827] rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-xl sticky top-6">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6">2. Select Amount</h2>
            
            <div className="grid grid-cols-2 gap-3 mb-6">
              {presetAmounts.map(amount => (
                <button
                  key={amount}
                  onClick={() => { setSelectedAmount(amount); setCustomAmount(''); }}
                  className={`py-3 px-4 rounded-xl font-bold text-lg border-2 transition-colors ${
                    selectedAmount === amount && !customAmount
                    ? 'border-cmr-blue bg-blue-50 dark:bg-blue-500/10 text-cmr-blue dark:text-blue-400'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-500'
                  }`}
                >
                  ₹{amount.toLocaleString()}
                </button>
              ))}
            </div>

            <div className="mb-8">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Or enter custom amount (₹)</label>
              <input 
                type="number" 
                value={customAmount}
                onChange={(e) => { setCustomAmount(e.target.value); setSelectedAmount(0); }}
                placeholder="Other Amount"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-lg font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cmr-blue transition-colors"
              />
            </div>

            <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
              <div className="flex justify-between items-center mb-6">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Total Donation</span>
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  ₹{customAmount ? parseInt(customAmount).toLocaleString() : selectedAmount.toLocaleString()}
                </span>
              </div>

              <button 
                onClick={handleDonate}
                disabled={isProcessing}
                className="w-full bg-cmr-blue hover:bg-blue-700 text-white py-4 rounded-xl font-bold text-lg shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isProcessing ? 'Processing...' : (
                  <>Proceed to Payment <ArrowRight size={20} /></>
                )}
              </button>
              
              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <ShieldCheck size={14} /> Secure Payment Processing via Stripe
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Donations;
