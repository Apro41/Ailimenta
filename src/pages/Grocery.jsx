import React, { useEffect, useState } from 'react';

export default function Grocery() {
  const [list, setList] = useState(['milk', 'eggs', 'bread']);
  const [location, setLocation] = useState('Toronto');
  const [results, setResults] = useState([]);
  const [input, setInput] = useState('');

  function fetchComparison() {
    fetch(`/api/grocery/compare?ingredients=${list.join(',')}&location=${location}`)
      .then(res => res.json())
      .then(data => setResults(data.results || []));
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-primary mb-6">Grocery Price Comparison</h1>
      <AnimatedCard className="mb-8 flex flex-col gap-4">
        <div className="flex gap-2">
          <input
            className="flex-1 border border-primary-light rounded-full px-4 py-2 focus:outline-none"
            placeholder="Add grocery item..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && input) { setList([...list, input]); setInput(''); } }}
          />
          <motion.button whileTap={{ scale: 0.92 }} whileHover={{ scale: 1.07, backgroundColor: '#43a047' }} className="bg-primary text-white px-4 py-2 rounded-full font-semibold shadow hover:bg-primary-dark" onClick={() => { setList([...list, input]); setInput(''); }}>Add</motion.button>
        </div>
        <div className="flex gap-2 items-center">
          <span className="font-semibold text-primary">Location:</span>
          <input
            className="border border-primary-light rounded-full px-4 py-2 focus:outline-none"
            value={location}
            onChange={e => setLocation(e.target.value)}
          />
          <motion.button whileTap={{ scale: 0.92 }} whileHover={{ scale: 1.07, backgroundColor: '#ffd600', color: '#43a047' }} className="bg-accent text-primary px-4 py-2 rounded-full font-semibold shadow hover:bg-primary-light" onClick={fetchComparison}>Compare Prices</motion.button>
        </div>
        <div className="flex gap-2 flex-wrap mt-2">
          {list.map((item, idx) => (
            <span key={idx} className="bg-primary-light text-white px-3 py-1 rounded-full text-sm flex items-center gap-1">
              {item}
              <button className="ml-1 text-xs hover:text-accent" onClick={() => setList(list.filter((_, i) => i !== idx))}>×</button>
            </span>
          ))}
        </div>
      </AnimatedCard>
      <div className="bg-card rounded-xl shadow-card p-6">
        <h2 className="text-xl font-bold text-primary mb-4">Best Prices</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead>
              <tr>
                <th className="py-2 px-4">Store</th>
                <th className="py-2 px-4">Total</th>
                <th className="py-2 px-4">Breakdown</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, idx) => (
                <tr key={idx} className="border-t border-primary-light">
                  <td className="py-2 px-4 font-semibold text-primary">{r.store}</td>
                  <td className="py-2 px-4">${r.total?.toFixed(2)}</td>
                  <td className="py-2 px-4">
                    <ul>
                      {Object.entries(r.perItem || {}).map(([item, prod]) => (
                        <li key={item} className="text-sm">
                          <span className="font-bold">{item}:</span> {prod ? `$${prod.price?.toFixed(2)} (${prod.name})` : <span className="text-red-600">Not found</span>}
                        </li>
                      ))}
                    </ul>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
