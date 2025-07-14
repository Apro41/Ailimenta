import React from 'react';
import AnimatedCard from '../components/AnimatedCard';
import { motion } from 'framer-motion';

function AnimatedCounter({ value, prefix = '$', duration = 1.2 }) {
  const [display, setDisplay] = React.useState(0);
  React.useEffect(() => {
    let start = 0;
    const step = () => {
      start += (value - start) * 0.18;
      if (Math.abs(start - value) < 0.5) {
        setDisplay(value);
      } else {
        setDisplay(start);
        requestAnimationFrame(step);
      }
    };
    step();
  }, [value]);
  return <span>{prefix}{display.toFixed(2)}</span>;
}

export default function Dashboard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Spend metrics card */}
      <AnimatedCard>
        <h2 className="text-xl font-bold text-primary">Grocery Spend Overview</h2>
        <div className="flex flex-col gap-2">
          <div className="text-3xl font-semibold">
            <AnimatedCounter value={87.23} />
          </div>
          <div className="text-sm text-gray-600">This week</div>
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="text-lg text-primary-light">⬆ 8% vs last week</motion.div>
        </div>
        <div className="mt-4">
          <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 1.2 }} style={{ transformOrigin: 'left' }} className="h-24 bg-gradient-to-r from-primary-light to-primary-dark rounded-lg" />
        </div>
      </AnimatedCard>
      {/* Community comparison card */}
      <div className="bg-card rounded-xl shadow-card p-8 flex flex-col gap-4">
        <h2 className="text-xl font-bold text-primary">Community Comparison</h2>
        <div className="flex flex-col gap-2">
          <div className="text-lg">You spend less than <span className="text-primary font-bold">68%</span> of users in your city!</div>
          <div className="text-sm text-gray-600">City average: <span className="font-semibold">$105</span></div>
        </div>
        <div className="mt-4 flex gap-2">
          <span className="inline-block bg-primary-light text-white px-3 py-1 rounded-full text-xs">Top Store: Walmart</span>
          <span className="inline-block bg-primary text-white px-3 py-1 rounded-full text-xs">Eco Score: Above Average</span>
        </div>
      </div>
      {/* Suggestions card */}
      <div className="bg-card rounded-xl shadow-card p-8 flex flex-col gap-4 md:col-span-2">
        <h2 className="text-xl font-bold text-primary">Smart Suggestions</h2>
        <ul className="list-disc pl-6 text-gray-700">
          <li>Switch to StoreBrand Bread to save $2.00/week</li>
          <li>Buy produce on Wednesdays for best deals</li>
          <li>You buy more fresh produce than average—great for your health!</li>
        </ul>
      </div>
      {/* Price tracker card */}
      <div className="bg-card rounded-xl shadow-card p-8 flex flex-col gap-4">
        <h2 className="text-xl font-bold text-primary">Price Tracker</h2>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold">Milk:</span>
            <span className="text-primary">+10%</span>
            <span className="text-gray-600">(now $4.39)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">Eggs:</span>
            <span className="text-primary">-2%</span>
            <span className="text-gray-600">(now $3.09)</span>
          </div>
        </div>
      </div>
      {/* Trend chart placeholder */}
      <div className="bg-card rounded-xl shadow-card p-8 flex flex-col gap-4">
        <h2 className="text-xl font-bold text-primary">Spend Trend</h2>
        <div className="h-32 bg-gradient-to-r from-primary-light to-primary-dark rounded-lg flex items-end">
          <div className="w-1/6 h-1/3 bg-accent rounded-t-lg mx-1" />
          <div className="w-1/6 h-2/3 bg-accent rounded-t-lg mx-1" />
          <div className="w-1/6 h-1/2 bg-accent rounded-t-lg mx-1" />
          <div className="w-1/6 h-full bg-accent rounded-t-lg mx-1" />
          <div className="w-1/6 h-2/3 bg-accent rounded-t-lg mx-1" />
          <div className="w-1/6 h-1/2 bg-accent rounded-t-lg mx-1" />
        </div>
      </div>
    </div>
  );
}
