import React from 'react';

export default function Suggestions({ suggestions }) {
  return (
    <div className="panel">
      <div className="panel-title">Suggestions</div>
      <div className="panel-body">
        {suggestions.length === 0 && <div className="muted">No suggestions yet. Add more blocks.</div>}
        {suggestions.map(s => (
          <div key={s.key} className="suggestion">
            <div><strong>{s.type}</strong> appears {s.count} times with similar props. Consider making it reusable.</div>
          </div>
        ))}
      </div>
    </div>
  );
}



